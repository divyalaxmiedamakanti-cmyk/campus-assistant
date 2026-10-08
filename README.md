# Campus Assistant — AI College Digital Assistant

A full-stack, same-origin campus helpdesk: **Flask + SQLite + FAISS RAG** on the
backend, a **React (Vite) SPA** on the frontend, styled in a custom
"Campus Ledger" theme (warm paper, deep-ink navy, brass accents) with
Framer Motion animation throughout.

```
campus-assistant/
├── backend/            Flask API, SQLite DB, NLP + RAG + hybrid LLM router
└── frontend/            React 18 + Vite + Tailwind + Framer Motion SPA
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env        # fill in GROQ_API_KEY / OLLAMA_URL if you have them
python database.py          # creates + seeds data/campus_assistant.db
python app.py                # runs on http://localhost:5000
```

Seeded accounts (see `database.py`):

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@college.edu            | admin123    |
| Student | asha.student@college.edu     | student123  |
| Faculty | mehta.faculty@college.edu    | faculty123  |

The **Autofill demo credentials** button on the sign-in screen fills these in for you.

### Hybrid AI engine
`llm_router.py` probes internet connectivity on every `/api/query` call:
- **Online** → calls Groq's Llama 3.1 (`GROQ_API_KEY` in `.env`). Swap in Gemini by
  extending `_call_groq`-style function with your key from `GEMINI_API_KEY`.
- **Offline** → falls back to a local **Ollama** daemon (`ollama serve`, then
  `ollama pull llama3`) at `OLLAMA_URL`.
- **Neither reachable** → a deterministic fallback returns the best-matching
  indexed document snippet, so the assistant never hard-fails.

Every answer is grounded by a RAG context: `rag_engine.py` chunks uploaded
PDF/TXT/MD documents (sliding window, configurable size/overlap), embeds them
with `sentence-transformers/all-MiniLM-L6-v2`, and searches a local
`faiss.IndexFlatIP` (cosine similarity via L2-normalized vectors). The index
rebuilds from SQLite at startup and supports incremental adds from the Admin
→ Knowledge Base tab.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, proxies /api → localhost:5000
```

For production, `npm run build` outputs to `frontend/dist`, which
`backend/app.py` serves directly (same-origin, no CORS needed) — just run the
Flask app afterwards.

## 3. What's inside

- **Auth** — JWT-based, roles `student` / `faculty` / `admin`, self sign-up for
  students & faculty, admin seeded at boot.
- **NLP engine** (`nlp_engine.py`) — rule-based preprocessing, keyword-mapped
  intent classification, and frustration/negative-sentiment detection.
- **Chat pipeline** (`/api/query`) — FAQ fuzzy-match first (fast path) → RAG
  context retrieval → hybrid LLM → logged to `chats` with intent, source, and
  frustration flags.
- **Feedback** (`/api/feedback`) — 👍/👎; a thumbs-down auto-flags the chat for
  admin review.
- **Admin API & Data Management** (`/api/admin/*`):
  - **Full CRUD Support**: Create, Read, Update, Delete for Students, Fee Records, Attendance, Notices, Timetable, Faculty Info, Knowledge Base Docs, and FAQs.
  - **Bulk CSV Import** (`/api/admin/bulk-import/<domain>`): Batch upload/paste datasets for Students, Fees, Attendance, Notices, Timetable, Faculty, and FAQs.
  - **Multi-Record Bulk Delete** (`/api/admin/bulk-delete/<domain>`): Atomic multi-selection delete across all domains with automatic FAISS vector de-indexing for documents.
  - **Analytics & Observability**: Aggregate chat logs, intent distributions, frustrated conversation detection, and real-time LLM router probes.
- **Frontend** — animated role-tabbed sign-in, a student/faculty dashboard with
  a sidebar-driven portal (Fees, Calendar, Courses, Exams, Notices) and a
  floating chat drawer with source-tag badges, feedback buttons, a typing
  indicator, and quick-reply chips; an Admin portal with drag-and-drop
  document upload, FAQ management, multi-record batch action bars, chat logs (with a stamped "Flagged" badge),
  and animated analytics progress bars.
- **Theme** — CSS variables in `frontend/src/index.css` implement the
  "Campus Ledger" palette in both light (paper) and dark (midnight desk) mode,
  toggleable from the dashboard sidebar / admin header.

## 4. Notes on the AI engine in this environment

If you don't set `GROQ_API_KEY` and don't have Ollama running locally, the
assistant still works end-to-end — it answers from FAQs and, failing that,
returns the most relevant indexed document snippet with a clear "offline
fallback" label instead of failing the request. Add a Groq key or start
Ollama at any time and the router picks it up automatically on the next query.
