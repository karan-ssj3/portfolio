from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import chat

app = FastAPI(title="Karan's Portfolio Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000", "http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    history: list[Message] = []

class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        history = [m.model_dump() for m in req.history]
        answer = chat(req.question, history)
        return ChatResponse(answer=answer)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Vector store not found. Run `python ingest.py` first.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
