import cv2
import numpy as np
import requests
import base64
import tempfile
import os
import io
import re
import logging
import time
import shutil
import json
from typing import Optional, Dict, Any, Tuple, Callable
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Response, Request, Depends, status
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field

from ultralytics import solutions
from ultralytics.utils.plotting import Annotator

import openai
from dotenv import load_dotenv

# Import configuration from config.py
import config

# ================ CONFIGURATION ================

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Check for required environment variables
if not config.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Create directories for storing files
os.makedirs(config.STORAGE_DIR, exist_ok=True)
os.makedirs(config.IMAGES_DIR, exist_ok=True)
os.makedirs(config.AUDIO_DIR, exist_ok=True)

logger.info(f"Images will be stored in: {config.IMAGES_DIR}")
logger.info(f"Audio will be stored in: {config.AUDIO_DIR}")

# Initialize OpenAI client once
openai_client = openai.OpenAI(api_key=config.OPENAI_API_KEY)

# ================ MODELS ================

class VideoRequest(BaseModel):
    video_url: str = Field(..., description="Supabase public bucket URL of the video to analyze")

class AnalysisResponse(BaseModel):
    image_url: str = Field(..., description="URL to the analyzed image")
    min_knee_angle: float = Field(..., description="Minimum knee angle detected in the video")
    text_analysis: str = Field(..., description="Full GPT-4 analysis text")
    summary: str = Field(..., description="Summary of the analysis")
    improvements: str = Field(..., description="Recommendations for improvement")
    risk_factor: str = Field(..., description="Risk factor assessment")
    audio_url: Optional[str] = Field(None, description="URL to the audio summary")

# ================ APPLICATION ================

app = FastAPI(
    title="Exercise Analysis API",
    description="API for analyzing exercise videos and returning the frame with the lowest knee angle, along with GPT-4 analysis and audio summary",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================ ERROR HANDLERS ================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with more user-friendly messages."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )

@app.middleware("http")
async def catch_json_parsing_errors(request: Request, call_next: Callable):
    """Middleware to catch JSON parsing errors and return helpful error messages."""
    # Only process POST requests with JSON content
    if request.method == "POST" and "application/json" in request.headers.get("content-type", ""):
        body = await request.body()
        if body:
            try:
                # Try to parse the JSON to see if it's valid
                json.loads(body)
            except json.JSONDecodeError as e:
                # Return a helpful error message
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "detail": f"Invalid JSON: {str(e)}",
                        "help": "Please check your JSON format. Make sure it's properly formatted with quotes around keys and values where needed.",
                        "example": '{"video_url": "https://example.com/video.mp4"}'
                    }
                )
    
    # Continue with the request if no JSON parsing error
    return await call_next(request)

# ================ HELPER FUNCTIONS ================

def get_base_url(request: Request) -> str:
    """Get the base URL from the request."""
    return str(request.base_url).rstrip('/')

def generate_unique_filename(prefix: str, extension: str) -> str:
    """Generate a unique filename with timestamp and random bytes."""
    return f"{prefix}_{int(time.time())}_{os.urandom(4).hex()}.{extension}"

def save_binary_file(data: bytes, directory: str, filename: str) -> str:
    """Save binary data to a file and return the file path."""
    file_path = os.path.join(directory, filename)
    with open(file_path, "wb") as f:
        f.write(data)
    logger.info(f"Saved file to {file_path}")
    return file_path

def create_url(base_url: Optional[str], path: str) -> str:
    """Create a URL from a base URL and path."""
    return f"{base_url}{path}" if base_url else path

# ================ API FUNCTIONS ================

def download_video(url: str) -> str:
    """Download video from Supabase public bucket URL and save to temporary file."""
    try:
        # Validate URL format
        valid_domain = any(domain in url for domain in config.ALLOWED_VIDEO_DOMAINS)
        if not url.startswith('https://') or not valid_domain:
            raise ValueError(f"Invalid URL format. URL must be from an allowed domain: {', '.join(config.ALLOWED_VIDEO_DOMAINS)}")
            
        logger.info(f"Downloading video from URL: {url}")
        response = requests.get(url, stream=True, timeout=config.HTTP_TIMEOUT)
        response.raise_for_status()
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        
        # Write the video content to the temporary file
        for chunk in response.iter_content(chunk_size=config.HTTP_CHUNK_SIZE):
            if chunk:
                temp_file.write(chunk)
        
        temp_file.close()
        logger.info(f"Video downloaded successfully to: {temp_file.name}")
        return temp_file.name
    except requests.exceptions.RequestException as e:
        logger.error(f"Error downloading video: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error downloading video from Supabase: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")

def custom_monitor(ai_gym, frame) -> Tuple[np.ndarray, float]:
    """Process a frame with AIGym and return the processed frame and knee angle."""
    tracks = ai_gym.model.track(source=frame, persist=True, classes=ai_gym.CFG["classes"], **ai_gym.track_add_args)[0]
    min_knee_angle = None

    if tracks.boxes.id is not None:
        if len(tracks) > len(ai_gym.count):
            new_human = len(tracks) - len(ai_gym.count)
            ai_gym.angle += [0] * new_human
            ai_gym.count += [0] * new_human
            ai_gym.stage += ["-"] * new_human

        ai_gym.annotator = Annotator(frame, line_width=ai_gym.line_width)

        for ind, k in enumerate(reversed(tracks.keypoints.data)):
            kpts = [k[int(ai_gym.kpts[i])].cpu() for i in range(3)]
            ai_gym.angle[ind] = ai_gym.annotator.estimate_pose_angle(*kpts)

            if min_knee_angle is None or ai_gym.angle[ind] < min_knee_angle:
                min_knee_angle = ai_gym.angle[ind]

            if ai_gym.angle[ind] < config.DANGER_ANGLE_THRESHOLD:
                ai_gym.stage[ind] = 'danger'
                color = config.DANGER_COLOR
            else:
                ai_gym.stage[ind] = 'normal'
                color = config.NORMAL_COLOR

            x, y = int(k[14][0]), int(k[14][1])
            cv2.circle(frame, (x + config.CIRCLE_OFFSET_X, y), config.CIRCLE_RADIUS, color, config.CIRCLE_THICKNESS)

    return frame, (min_knee_angle if min_knee_angle is not None else 180)

def process_video(video_path: str, frame_skip: int = config.DEFAULT_FRAME_SKIP, base_url: str = None) -> Dict[str, Any]:
    """Process video and return the frame with the lowest knee angle."""
    try:
        logger.info(f"Opening video file: {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Error reading video file")

        # Initialize AIGym
        logger.info("Initializing AIGym")
        gym = solutions.AIGym(
            show=False,
            kpts=config.POSE_KEYPOINTS,
            model=config.POSE_MODEL,
            line_width=config.POSE_LINE_WIDTH,
            verbose=False,
        )

        min_angle = float('inf')
        best_frame = None
        frame_count = 0
        processed_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"Total frames in video: {total_frames}")
        logger.info(f"Processing every {frame_skip}th frame")
        
        # Process frames
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            # Process only every Nth frame
            if frame_count % frame_skip == 0:
                processed_frame, knee_angle = custom_monitor(gym, frame)

                if knee_angle < min_angle:
                    min_angle = knee_angle
                    best_frame = processed_frame.copy()
                
                processed_count += 1
                if processed_count % 20 == 0:
                    logger.info(f"Processed {processed_count} frames ({frame_count}/{total_frames} total)")

            frame_count += 1

        cap.release()
        logger.info(f"Video processing completed. Processed {processed_count} out of {total_frames} frames")

        if best_frame is not None:
            # Generate a unique filename for the image
            filename = generate_unique_filename("exercise_analysis", "png")
            image_path = os.path.join(config.IMAGES_DIR, filename)
            
            # Save the best frame to the file
            cv2.imwrite(image_path, best_frame)
            
            # For GPT-4 analysis, we need the base64 encoding
            _, buffer = cv2.imencode('.png', best_frame)
            best_frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Create relative and absolute URLs
            relative_url = f"/image/{filename}"
            absolute_url = create_url(base_url, relative_url)
            
            return {
                "image_base64": best_frame_base64,  # Only used internally for GPT-4 analysis
                "image_filename": filename,
                "image_url": absolute_url,
                "min_knee_angle": float(min_angle)
            }
        else:
            raise HTTPException(status_code=400, detail="No valid frames found in video")
    except Exception as e:
        logger.error(f"Error in video processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in video processing: {str(e)}")

def analyze_with_gpt4(image_base64: str, knee_angle: float) -> Dict[str, str]:
    """Analyze the exercise posture using GPT-4 Vision API."""
    try:
        # Prepare the prompt
        prompt = f"""Analyze this exercise image focusing on the knee angle (currently {knee_angle} degrees) and the red circle indicator.
        Provide a detailed analysis, must be in the following format:

        1. [SUMMARY]: [SUMMARY OF THE ANALYSIS]
        2. [IMPROVEMENTS]: [RECOMMENDATIONS FOR IMPROVEMENT]
        3. [RISK FACTOR]: [RISK FACTOR OF THE EXERCISE]

        Be specific and actionable in your feedback for points 2 and 3."""

        logger.info("Sending request to GPT-4 Vision API")
        
        # Call GPT-4 Vision API
        response = openai_client.chat.completions.create(
            model=config.OPENAI_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=config.OPENAI_VISION_MAX_TOKENS
        )

        # Get the analysis text
        analysis_text = response.choices[0].message.content
        logger.info("Received analysis from GPT-4")
        
        # Validate the response format
        if not any(section in analysis_text for section in ["SUMMARY", "IMPROVEMENTS", "RISK FACTOR"]):
            logger.warning("GPT-4 response does not contain expected sections")
            # Create a structured response if GPT-4 didn't follow the format
            analysis_text = f"""
            [SUMMARY]: The image shows an exercise posture with a knee angle of {knee_angle} degrees.
            
            [IMPROVEMENTS]: Based on the knee angle, focus on proper form and alignment.
            
            [RISK FACTOR]: Exercise with caution and consult a fitness professional for personalized advice.
            """
            logger.info("Using fallback structured response")

        return {
            "text_analysis": analysis_text,
        }

    except Exception as e:
        logger.error(f"Error in GPT-4 analysis: {str(e)}")
        # Return a fallback analysis in case of error
        fallback_analysis = f"""
        [SUMMARY]: Unable to perform detailed analysis due to a technical issue.
        
        [IMPROVEMENTS]: Consider maintaining proper form with a knee angle greater than 90 degrees during squats.
        
        [RISK FACTOR]: Exercise with caution and consult a fitness professional for personalized advice.
        """
        return {
            "text_analysis": fallback_analysis,
        }

def generate_audio_from_text(text: str, voice: str = config.OPENAI_TTS_VOICE) -> Optional[str]:
    """Generate audio from text using OpenAI's TTS API."""
    try:
        logger.info(f"Generating audio for text: {text[:50]}...")
        
        # Generate speech using OpenAI's TTS
        response = openai_client.audio.speech.create(
            model=config.OPENAI_TTS_MODEL,
            voice=voice,
            input=text
        )
        
        # Get the audio data
        audio_data = response.content
        
        # Encode as base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        logger.info("Audio generation successful")
        return audio_base64
        
    except Exception as e:
        logger.error(f"Error generating audio: {str(e)}")
        return None

def parse_gpt4_response(text: str) -> Dict[str, str]:
    """
    Parse the GPT-4 response to extract summary, improvements, and risk factor.
    This handles the specific format returned by GPT-4 Vision API with numbered points and bold markdown.
    """
    try:
        logger.info("Parsing GPT-4 response")
        
        # Initialize result dictionary with default values
        result = {
            "summary": "Not available",
            "improvements": "Not available",
            "risk_factor": "Not available"
        }
        
        # Check if we have the numbered format (1., 2., 3.)
        if "1." in text and "2." in text and "3." in text:
            logger.info("Detected numbered format")
            
            # Extract the summary section (after "1." and contains "SUMMARY")
            summary_match = re.search(r'1\.\s*\*?\*?\[?SUMMARY\]?:?\*?\*?\s*(.*?)(?=\n\s*2\.|\Z)', text, re.DOTALL | re.IGNORECASE)
            if summary_match:
                result["summary"] = summary_match.group(1).strip()
                logger.info(f"Extracted summary: {result['summary'][:50]}...")
            
            # Extract the improvements section (after "2." and contains "IMPROVEMENTS")
            improvements_match = re.search(r'2\.\s*\*?\*?\[?IMPROVEMENTS\]?:?\*?\*?\s*(.*?)(?=\n\s*3\.|\Z)', text, re.DOTALL | re.IGNORECASE)
            if improvements_match:
                result["improvements"] = improvements_match.group(1).strip()
                logger.info(f"Extracted improvements: {result['improvements'][:50]}...")
            
            # Extract the risk factor section (after "3." and contains "RISK FACTOR")
            risk_match = re.search(r'3\.\s*\*?\*?\[?RISK FACTOR\]?:?\*?\*?\s*(.*?)(?=\n\s*\d+\.|\Z)', text, re.DOTALL | re.IGNORECASE)
            if risk_match:
                result["risk_factor"] = risk_match.group(1).strip()
                logger.info(f"Extracted risk factor: {result['risk_factor'][:50]}...")
        else:
            # Fallback to simple section extraction if numbered format not found
            logger.info("Using simple section extraction")
            
            # Extract each section by looking for the section name
            for section_name, key in [("SUMMARY", "summary"), ("IMPROVEMENTS", "improvements"), ("RISK FACTOR", "risk_factor")]:
                section_match = re.search(rf'\[?{section_name}\]?:?\s*(.*?)(?=\[|\Z)', text, re.DOTALL | re.IGNORECASE)
                if section_match:
                    result[key] = section_match.group(1).strip()
                    logger.info(f"Extracted {key}: {result[key][:50]}...")
        
        # Clean up any markdown formatting in the extracted text
        for key in result:
            # Remove any remaining markdown formatting (**, [], etc.)
            result[key] = re.sub(r'\*\*|\*|\[|\]', '', result[key])
            # Clean up any extra whitespace
            result[key] = re.sub(r'\s+', ' ', result[key]).strip()
        
        return result
    
    except Exception as e:
        logger.error(f"Error parsing GPT-4 response: {str(e)}")
        return {
            "summary": "Error parsing response",
            "improvements": "Error parsing response",
            "risk_factor": "Error parsing response"
        }

async def process_and_analyze_video(
    video_url: str, 
    frame_skip: int = config.DEFAULT_FRAME_SKIP, 
    base_url: Optional[str] = None
) -> Dict[str, Any]:
    """Process a video, analyze it, and return the results."""
    video_path = None
    try:
        # Download video
        video_path = download_video(video_url)
        
        # Process video with frame skipping
        results = process_video(video_path, frame_skip, base_url)
        
        # Get GPT-4 analysis
        gpt4_results = analyze_with_gpt4(results["image_base64"], results["min_knee_angle"])
        
        # Extract sections from analysis
        analysis_text = gpt4_results["text_analysis"]
        
        # Log the analysis text for debugging
        logger.info(f"Analysis text received: {analysis_text[:100]}...")
        
        # Parse the GPT-4 response
        parsed_sections = parse_gpt4_response(analysis_text)
        
        # Generate audio from summary
        logger.info("Generating audio from summary")
        audio_base64 = None
        try:
            audio_base64 = generate_audio_from_text(parsed_sections["summary"])
        except Exception as e:
            logger.error(f"Error generating audio: {str(e)}")
        
        # Save audio file if generated
        audio_url = None
        if audio_base64:
            try:
                audio_filename = generate_unique_filename("exercise_audio", "mp3")
                audio_path = os.path.join(config.AUDIO_DIR, audio_filename)
                
                # Save the audio to a file
                save_binary_file(base64.b64decode(audio_base64), config.AUDIO_DIR, audio_filename)
                
                # Create relative and absolute URLs for audio
                relative_audio_url = f"/audio/{audio_filename}"
                audio_url = create_url(base_url, relative_audio_url)
            except Exception as e:
                logger.error(f"Error saving audio file: {str(e)}")
        
        # Combine all results
        return {
            "image_url": results["image_url"],
            "min_knee_angle": results["min_knee_angle"],
            "text_analysis": analysis_text,
            "summary": parsed_sections["summary"],
            "improvements": parsed_sections["improvements"],
            "risk_factor": parsed_sections["risk_factor"],
            "audio_url": audio_url
        }
            
    except Exception as e:
        logger.error(f"Error in analyze_exercise: {str(e)}")
        # Include more context in the error message
        error_message = f"An error occurred during video analysis: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)
    finally:
        # Clean up video file if it exists
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
                logger.info(f"Cleaned up temporary video file: {video_path}")
            except Exception as e:
                logger.error(f"Error cleaning up video file: {str(e)}")

# Add a periodic cleanup function for temporary files
@app.on_event("startup")
async def setup_periodic_cleanup():
    """Set up periodic cleanup of old files."""
    # This could be expanded with a background task that runs periodically
    logger.info("Setting up periodic cleanup of old files")
    
    # Clean up files older than 24 hours on startup
    cleanup_old_files(config.IMAGES_DIR, hours=config.CLEANUP_HOURS)
    cleanup_old_files(config.AUDIO_DIR, hours=config.CLEANUP_HOURS)

def cleanup_old_files(directory: str, hours: int = config.CLEANUP_HOURS):
    """Clean up files older than the specified number of hours."""
    try:
        current_time = time.time()
        count = 0
        
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            # Check if the file is older than the specified hours
            if os.path.isfile(file_path) and os.path.getmtime(file_path) < (current_time - hours * 3600):
                try:
                    os.remove(file_path)
                    count += 1
                except Exception as e:
                    logger.error(f"Error removing old file {file_path}: {str(e)}")
        
        logger.info(f"Cleaned up {count} old files from {directory}")
    except Exception as e:
        logger.error(f"Error during cleanup of {directory}: {str(e)}")

# ================ API ENDPOINTS ================

@app.get("/")
async def root(request: Request):
    """Root endpoint that provides instructions on how to use the API."""
    base_url = get_base_url(request)
    
    return {
        "message": "Exercise Analysis API",
        "usage": {
            "GET /analyze": f"Use with query parameter: {base_url}/analyze?video_url=https://your-supabase-url.com/storage/v1/object/public/exercise-demo/video.mp4",
            "POST /analyze": "Send a JSON body with video_url: {'video_url': 'https://your-supabase-url.com/storage/v1/object/public/exercise-demo/video.mp4'}"
        },
        "documentation": f"{base_url}/docs",
        "json_format_example": {
            "correct": '{"video_url": "https://example.com/video.mp4"}',
            "incorrect": '{video_url: "https://example.com/video.mp4"}',
            "note": "Make sure to use double quotes around both keys and values in your JSON"
        }
    }

@app.get("/image/{filename}")
async def get_image(filename: str):
    """Get an image by filename from the images directory."""
    file_path = os.path.join(config.IMAGES_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path, media_type="image/png")

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Get an audio file by filename from the audio directory."""
    file_path = os.path.join(config.AUDIO_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return FileResponse(file_path, media_type="audio/mpeg")

@app.get("/analyze")
async def analyze_exercise_get(
    request: Request, 
    video_url: Optional[str] = None, 
    frame_skip: int = Query(config.DEFAULT_FRAME_SKIP, ge=config.MIN_FRAME_SKIP, le=config.MAX_FRAME_SKIP)
):
    """GET version of the analyze endpoint for easier testing via browser."""
    # Check if video_url is provided
    if not video_url:
        base_url = get_base_url(request)
        return JSONResponse(
            status_code=400,
            content={
                "error": "Missing video_url parameter",
                "message": "You must provide a video_url parameter in your request",
                "example": f"{base_url}/analyze?video_url=Your video URL",
                "documentation": f"{base_url}/docs"
            }
        )
    
    # Get the base URL for absolute URLs
    base_url = get_base_url(request)
    
    # Process and analyze the video
    results = await process_and_analyze_video(video_url, frame_skip, base_url)
    
    return JSONResponse(content=results)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_exercise(
    request: VideoRequest, 
    frame_skip: int = Query(config.DEFAULT_FRAME_SKIP, ge=config.MIN_FRAME_SKIP, le=config.MAX_FRAME_SKIP),
    request_obj: Request = None
):
    """Analyze exercise video and return the frame with the lowest knee angle, along with GPT-4 analysis."""
    # Get the base URL if request_obj is provided
    base_url = get_base_url(request_obj) if request_obj else None
    
    # Process and analyze the video
    results = await process_and_analyze_video(request.video_url, frame_skip, base_url)
    
    return JSONResponse(content=results)

# ================ MAIN ================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.API_HOST, port=config.API_PORT) 