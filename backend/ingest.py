"""
Run this script whenever you update files in docstore/ to rebuild the FAISS index.
Usage: python ingest.py
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

DOCSTORE_DIR = Path(__file__).parent / "docstore"
VECTORSTORE_DIR = Path(__file__).parent / "vectorstore"

def ingest():
    print("Loading documents from docstore/...")
    loader = DirectoryLoader(
        str(DOCSTORE_DIR),
        glob="**/*.md",
        loader_cls=UnstructuredMarkdownLoader,
        show_progress=True,
    )
    docs = loader.load()
    print(f"  Loaded {len(docs)} document(s)")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )
    chunks = splitter.split_documents(docs)
    print(f"  Split into {len(chunks)} chunk(s)")

    print("Building FAISS index...")
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    VECTORSTORE_DIR.mkdir(exist_ok=True)
    vectorstore.save_local(str(VECTORSTORE_DIR))
    print(f"  Saved to {VECTORSTORE_DIR}/")
    print("Done. Run the backend server and start chatting.")

if __name__ == "__main__":
    ingest()
