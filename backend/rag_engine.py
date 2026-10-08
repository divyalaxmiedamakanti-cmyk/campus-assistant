"""
Campus Assistant - RAG Engine
Chunks PDF/TXT/MD documents, embeds them with sentence-transformers
('all-MiniLM-L6-v2'), and indexes them in a local FAISS IndexFlatIP
(cosine similarity via L2-normalized vectors).

The index is rebuilt from SQLite (`doc_chunks`) at process startup so the
database stays the single source of truth, and it supports incremental
`add_chunks()` calls when new documents are uploaded.
"""
import os
import threading

import numpy as np

from config import Config
from database import get_db, now_iso

_lock = threading.Lock()
_model = None
_index = None
_chunk_ids = []  # parallel array: FAISS row -> doc_chunks.id


def _get_model():
    """Lazy-load the sentence-transformers model (heavy import)."""
    global _model
    if _model is None:
        import ssl
        ssl._create_default_https_context = ssl._create_unverified_context
        try:
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        except Exception:
            pass
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(Config.EMBEDDING_MODEL)
    return _model


def _embed(texts):
    model = _get_model()
    vectors = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    vectors = vectors.astype("float32")
    faiss_normalize(vectors)
    return vectors


def faiss_normalize(vectors: np.ndarray):
    """In-place L2 normalization so inner product == cosine similarity."""
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    vectors /= norms


def chunk_text(text: str, chunk_size=None, overlap=None):
    """Simple sliding-window character chunker with overlap."""
    chunk_size = chunk_size or Config.CHUNK_SIZE
    overlap = overlap or Config.CHUNK_OVERLAP
    text = text.strip()
    if not text:
        return []
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap
    return chunks


def extract_text(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        from pypdf import PdfReader
        reader = PdfReader(filepath)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    else:  # .txt, .md
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()


def build_index_from_db():
    """Rebuild the FAISS index from every row in doc_chunks. Called at app startup."""
    global _index, _chunk_ids

    with _lock:
        conn = get_db()
        rows = conn.execute("SELECT id, chunk_text FROM doc_chunks ORDER BY id ASC").fetchall()
        conn.close()

        if not rows:
            _index = None
            _chunk_ids = []
            return

        try:
            import faiss
            texts = [r["chunk_text"] for r in rows]
            vectors = _embed(texts)
            dim = vectors.shape[1]
            index = faiss.IndexFlatIP(dim)
            index.add(vectors)
            _index = index
            _chunk_ids = [r["id"] for r in rows]
        except Exception as e:
            print(f"Warning: RAG FAISS index initialization skipped ({e})")
            _index = None
            _chunk_ids = []


def add_document(filename: str, filepath: str) -> int:
    """Extract, chunk, embed, then persist — in that order, so a failed
    embedding call (e.g. model download issue) never leaves orphaned rows
    in SQLite that aren't reflected in the FAISS index."""
    global _index, _chunk_ids
    import faiss

    text = extract_text(filepath)
    chunks = chunk_text(text)
    if not chunks:
        return 0

    # Embed first — if this raises, nothing has touched the database yet.
    vectors = _embed(chunks)

    conn = get_db()
    cur = conn.cursor()
    new_ids = []
    for i, chunk in enumerate(chunks):
        cur.execute(
            "INSERT INTO doc_chunks (filename, chunk_index, chunk_text, uploaded_at) VALUES (?,?,?,?)",
            (filename, i, chunk, now_iso()),
        )
        new_ids.append(cur.lastrowid)
    conn.commit()
    conn.close()

    with _lock:
        if _index is None:
            dim = vectors.shape[1]
            _index = faiss.IndexFlatIP(dim)
        _index.add(vectors)
        _chunk_ids.extend(new_ids)

    return len(chunks)


def delete_document(filename: str):
    """Remove a document's chunks from SQLite and rebuild the FAISS index."""
    conn = get_db()
    conn.execute("DELETE FROM doc_chunks WHERE filename = ?", (filename,))
    conn.commit()
    conn.close()
    build_index_from_db()


def search(query: str, top_k=None):
    """Return top-k (chunk_text, filename, score) tuples most relevant to the query."""
    top_k = top_k or Config.RAG_TOP_K
    if _index is None or _index.ntotal == 0:
        return []

    qvec = _embed([query])
    scores, indices = _index.search(qvec, min(top_k, _index.ntotal))

    conn = get_db()
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(_chunk_ids):
            continue
        chunk_id = _chunk_ids[idx]
        row = conn.execute("SELECT chunk_text, filename FROM doc_chunks WHERE id = ?", (chunk_id,)).fetchone()
        if row:
            results.append({"text": row["chunk_text"], "filename": row["filename"], "score": float(score)})
    conn.close()
    return results


def list_documents():
    conn = get_db()
    rows = conn.execute(
        "SELECT filename, COUNT(*) as chunks, MIN(uploaded_at) as uploaded_at "
        "FROM doc_chunks GROUP BY filename ORDER BY uploaded_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
