"""
LangGraph RAG agent — retrieves from FAISS then generates a grounded answer.

Graph:
  START → retrieve → generate → END
"""
from pathlib import Path
from typing import TypedDict, List
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langgraph.graph import StateGraph, END

load_dotenv()

VECTORSTORE_DIR = Path(__file__).parent / "vectorstore"

SYSTEM_PROMPT = """You are Karan's AI assistant, embedded in his personal portfolio website.
You have detailed knowledge about Karan Bhutani — his work experience, projects, education, skills, and background.
Answer questions about Karan in a helpful, concise, and professional tone.
Use the retrieved context below to ground your answers. If a question is not covered by the context, say so honestly.
Do not make up details not present in the context.
Keep responses conversational — this is a chat widget, not a formal document."""

class AgentState(TypedDict):
    question: str
    history: List[dict]
    context: List[Document]
    answer: str


def load_retriever():
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.load_local(
        str(VECTORSTORE_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return vectorstore.as_retriever(search_kwargs={"k": 5})


_retriever = None

def get_retriever():
    global _retriever
    if _retriever is None:
        _retriever = load_retriever()
    return _retriever


def retrieve(state: AgentState) -> AgentState:
    retriever = get_retriever()
    docs = retriever.invoke(state["question"])
    return {**state, "context": docs}


def generate(state: AgentState) -> AgentState:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

    context_text = "\n\n---\n\n".join(d.page_content for d in state["context"])

    messages = [SystemMessage(content=f"{SYSTEM_PROMPT}\n\nContext:\n{context_text}")]

    for turn in state["history"]:
        if turn["role"] == "user":
            messages.append(HumanMessage(content=turn["content"]))
        else:
            messages.append(AIMessage(content=turn["content"]))

    messages.append(HumanMessage(content=state["question"]))

    response = llm.invoke(messages)
    return {**state, "answer": response.content}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    return graph.compile()


_graph = None

def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def chat(question: str, history: list[dict]) -> str:
    graph = get_graph()
    state = graph.invoke({
        "question": question,
        "history": history,
        "context": [],
        "answer": "",
    })
    return state["answer"]
