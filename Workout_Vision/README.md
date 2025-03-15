# Exercise Analysis API

This API analyzes exercise videos to detect and measure knee angles during squats, helping to identify proper form and potential injury risks.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file and add your OpenAI API key.

4. Run the API:
```bash
python main.py
```

The API will start on `http://localhost:8000`

## API Usage

### Endpoint: GET /analyze

Analyzes an exercise video from a provided URL.

**Request:**
```
GET /analyze?video_url=https://example.com/path/to/video.mp4&frame_skip=5
```

**Parameters:**
- `video_url`: URL of the video to analyze (required)
- `frame_skip`: Number of frames to skip during processing (optional, default: 5)

### Endpoint: POST /analyze

Analyzes an exercise video from a provided URL.

**Request:**
```json
{
    "video_url": "https://example.com/path/to/video.mp4"
}
```

**Response:**
```json
{
    "image_url": "http://localhost:8000/image/exercise_analysis_1234567890.png",
    "min_knee_angle": 35.68,
    "text_analysis": "Full analysis text from GPT-4...",
    "summary": "Summary of the analysis",
    "improvements": "Recommendations for improvement",
    "risk_factor": "Risk factor assessment",
    "audio_url": "http://localhost:8000/audio/exercise_audio_1234567890.mp3"
}
```

## Configuration

The API is highly configurable through environment variables. Copy the `.env.example` file to `.env` and customize the settings:

### Required Settings
- `OPENAI_API_KEY`: Your OpenAI API key (required)

### API Configuration
- `API_HOST`: Host to bind the API server (default: 0.0.0.0)
- `API_PORT`: Port to run the API server (default: 8000)

### OpenAI Configuration
- `OPENAI_VISION_MODEL`: Model to use for vision analysis (default: gpt-4o-mini)
- `OPENAI_VISION_MAX_TOKENS`: Maximum tokens for vision API response (default: 500)
- `OPENAI_TTS_MODEL`: Model to use for text-to-speech (default: tts-1)
- `OPENAI_TTS_VOICE`: Voice to use for text-to-speech (default: alloy)

### Video Processing Configuration
- `ALLOWED_VIDEO_DOMAINS`: Comma-separated list of allowed domains for video URLs (default: supabase.co)
- `DEFAULT_FRAME_SKIP`: Default number of frames to skip during processing (default: 5)
- `MAX_FRAME_SKIP`: Maximum allowed frame skip value (default: 30)
- `MIN_FRAME_SKIP`: Minimum allowed frame skip value (default: 1)
- `DANGER_ANGLE_THRESHOLD`: Knee angle threshold for danger warning (default: 60)

See `.env.example` for the full list of configuration options.

## Notes

- The API currently supports analyzing squat exercises
- Videos should be in MP4 format
- The analysis focuses on knee angles to detect proper form
- A knee angle below 60 degrees is considered potentially dangerous
- Images and audio files are stored in the `storage` directory and cleaned up after 24 hours (configurable) 