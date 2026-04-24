import os
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from agent import chat

limiter = Limiter(key_func=get_remote_address, default_limits=["20/minute"])

app = FastAPI(title="Karan's Portfolio Chat API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:4000,http://localhost:3000,https://karanbhutani.com,https://www.karanbhutani.com"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

MAX_QUESTION_LEN = 500
MAX_HISTORY_TURNS = 4   # 4 pairs = 8 messages max sent in

BLOCKED_PATTERNS = re.compile(
    r"(ignore previous|forget your instructions|you are now|pretend you are|"
    r"jailbreak|disregard|system prompt|act as|roleplay as)",
    re.IGNORECASE,
)


class Message(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in ("user", "assistant"):
            raise ValueError("role must be user or assistant")
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v):
        return v[:1000]  # hard cap per history message


class ChatRequest(BaseModel):
    question: str
    history: list[Message] = []

    @field_validator("question")
    @classmethod
    def validate_question(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty")
        if len(v) > MAX_QUESTION_LEN:
            raise ValueError(f"Question too long — max {MAX_QUESTION_LEN} characters")
        if BLOCKED_PATTERNS.search(v):
            raise ValueError("That type of request is not supported")
        return v


class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_endpoint(req: ChatRequest, request: Request):
    try:
        # Keep only the last N turns to cap token usage
        trimmed_history = req.history[-(MAX_HISTORY_TURNS * 2):]
        history = [m.model_dump() for m in trimmed_history]
        answer = chat(req.question, history)
        return ChatResponse(answer=answer)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Vector store not found. Run `python ingest.py` first.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong. Try again.")


@app.get("/health")
async def health():
    return {"status": "ok"}
