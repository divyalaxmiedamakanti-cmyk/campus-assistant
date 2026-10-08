"""
Campus Assistant - Configuration
All secrets are read from environment variables with safe local defaults.
Copy `.env.example` to `.env` and fill in real keys before deploying.
"""
import os
from dotenv import load_dotenv

# Load .env variables explicitly at startup
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    # --- Core ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "campus-ledger-dev-secret-change-me")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "12"))

    # --- Database ---
    DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "data", "campus_assistant.db"))
    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", os.path.join(BASE_DIR, "data", "uploads"))

    # --- RAG ---
    EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", "600"))       # characters per chunk
    CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "100"))
    RAG_TOP_K = int(os.environ.get("RAG_TOP_K", "4"))
    FAISS_INDEX_PATH = os.environ.get("FAISS_INDEX_PATH", os.path.join(BASE_DIR, "data", "index.faiss"))

    # --- Hybrid LLM routing ---
    CONNECTIVITY_CHECK_URL = os.environ.get("CONNECTIVITY_CHECK_URL", "https://api.groq.com")
    CONNECTIVITY_TIMEOUT = float(os.environ.get("CONNECTIVITY_TIMEOUT", "1.5"))

    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

    OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")

    # --- Seed admin ---
    SEED_ADMIN_EMAIL = "admin@college.edu"
    SEED_ADMIN_PASSWORD = "admin123"

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    # --- Email / SMTP ---
    SMTP_HOST     = os.environ.get("SMTP_HOST",     "smtp.gmail.com")
    SMTP_PORT     = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USE_TLS  = os.environ.get("SMTP_USE_TLS",  "1") == "1"
    SMTP_USE_SSL  = os.environ.get("SMTP_USE_SSL",  "0") == "1"
    SMTP_USER     = os.environ.get("SMTP_USER",     "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SENDER_NAME   = os.environ.get("SENDER_NAME",   "e-CAP Faculty Notifications")
