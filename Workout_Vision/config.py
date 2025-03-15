import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")
OPENAI_VISION_MAX_TOKENS = int(os.getenv("OPENAI_VISION_MAX_TOKENS", "500"))
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "tts-1")
OPENAI_TTS_VOICE = os.getenv("OPENAI_TTS_VOICE", "alloy")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "exercise-demo")

# Video Processing Configuration
ALLOWED_VIDEO_DOMAINS = os.getenv("ALLOWED_VIDEO_DOMAINS", "supabase.co").split(",")
DEFAULT_FRAME_SKIP = int(os.getenv("DEFAULT_FRAME_SKIP", "10"))
MAX_FRAME_SKIP = int(os.getenv("MAX_FRAME_SKIP", "30"))
MIN_FRAME_SKIP = int(os.getenv("MIN_FRAME_SKIP", "1"))
DANGER_ANGLE_THRESHOLD = float(os.getenv("DANGER_ANGLE_THRESHOLD", "60"))
POSE_MODEL =  "yolo11m-pose.pt"
POSE_KEYPOINTS = [int(k) for k in os.getenv("POSE_KEYPOINTS", "12,14,16").split(",")]
POSE_LINE_WIDTH = int(os.getenv("POSE_LINE_WIDTH", "4"))

# Circle indicator configuration
CIRCLE_OFFSET_X = int(os.getenv("CIRCLE_OFFSET_X", "-20"))
CIRCLE_RADIUS = int(os.getenv("CIRCLE_RADIUS", "40"))
CIRCLE_THICKNESS = int(os.getenv("CIRCLE_THICKNESS", "3"))
DANGER_COLOR = tuple(map(int, os.getenv("DANGER_COLOR", "0,0,255").split(",")))  # Red
NORMAL_COLOR = tuple(map(int, os.getenv("NORMAL_COLOR", "104,31,17").split(",")))  # Custom normal color

# Cleanup Configuration
CLEANUP_HOURS = int(os.getenv("CLEANUP_HOURS", "24"))

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# HTTP Request Configuration
HTTP_TIMEOUT = int(os.getenv("HTTP_TIMEOUT", "30"))
HTTP_CHUNK_SIZE = int(os.getenv("HTTP_CHUNK_SIZE", "8192")) 