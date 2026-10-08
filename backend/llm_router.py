"""
Campus Assistant - Hybrid LLM Router
On every /api/query request we probe for internet connectivity.
  - Online  -> Groq (Llama 3.1) chat completion, context-grounded via RAG.
  - Offline -> local Ollama model on localhost, same grounded prompt.
  - Neither reachable -> a deterministic, template-based fallback so the
    assistant degrades gracefully instead of failing the request.
"""
import socket
import requests

from config import Config

# ─────────────────────────── Role-aware system prompts ───────────────────────

SYSTEM_PROMPT_STUDENT = """You are Campus Assistant, the official AI helpdesk for {college} (Autonomous, NAAC 'A+', NBA Accredited).
You assist students with specific campus queries (courses, R23 regulations, attendance rules, fee deadlines, exams & hall tickets, assignments, placement drives, hostel, mess, transport, library, student clubs), as well as faculty information and administrative contacts.

CORE RESPONSE FORMATTING & RELEVANCE RULES:
1. TIMETABLE & SCHEDULE QUERIES (student timetable, faculty timetable, present period location, class timing):
   - You MUST format the response into a clean MARKDOWN GRID TABLE with horizontal rows and vertical columns (`| Day/Period | Time | Subject | Faculty | Room |`).
   - Example Grid Table:
     | Period | Time | Subject | Type | Faculty | Room |
     | :--- | :--- | :--- | :--- | :--- | :--- |
     | Period 1 | 9:00 - 9:50 AM | Operating Systems | Theory | Dr. K. Avinash | Classroom CS-102 |
2. NON-TIMETABLE QUERIES (Fees, Attendance, Notices, Rules, General Info, Documents):
   - You MUST format the response in CLEAN TEXT FORMAT using bold headers, bullet points, and short paragraphs. Do NOT use markdown tables for fees or non-timetable queries.
3. ANSWER ONLY WHAT IS SPECIFICALLY ASKED: Provide direct, targeted, and relevant answers. Do NOT dump unrequested directories or full weekly schedules if the user only asked for a specific period or topic.
4. FACTUAL INTEGRITY: Strictly use the provided context. Never invent dates, fees, or names.

--- CONTEXT ---
{context}
--- END CONTEXT ---
"""

SYSTEM_PROMPT_FACULTY = """You are Campus Assistant, the official AI assistant for {college} — configured for FACULTY use.
You help faculty members with their teaching profile, assigned sections (AIML-2, CSDS-3, CSE-5), timetable, online days (Monday), student rosters, assignments, and campus administration.

CORE RESPONSE FORMATTING & RELEVANCE RULES:
1. TIMETABLE & SCHEDULE QUERIES (faculty timetable, current active period, classroom location, period timing):
   - You MUST format the response into a clean MARKDOWN GRID TABLE with horizontal rows and vertical columns (`| Period/Day | Time | Subject | Section | Room / Location | Mode |`).
2. NON-TIMETABLE QUERIES (Fees, Student Records, Notices, Administrative Rules):
   - You MUST format the response in CLEAN TEXT FORMAT using bullet points, bold headers, and short paragraphs.
3. ANSWER ONLY WHAT IS SPECIFICALLY ASKED: Give focused and accurate answers without dumping unrequested section data.
4. FACTUAL INTEGRITY: Strictly use the provided context.

--- CONTEXT ---
{context}
--- END CONTEXT ---
"""

SYSTEM_PROMPT_ADMIN = """You are Campus Assistant, the official AI assistant for {college} — configured for ADMINISTRATION & GOVERNANCE.
You assist administrative staff, faculty, and students with institutional policies, administration directory, official notices, fee structures, academic calendar, grievance procedures, and campus operations.

CORE RESPONSE FORMATTING & RELEVANCE RULES:
1. TIMETABLE & SCHEDULE QUERIES: Always format as a clean MARKDOWN GRID TABLE with horizontal rows and vertical columns.
2. NON-TIMETABLE QUERIES (Fees, Notices, Administration): Always format in CLEAN TEXT FORMAT using markdown headers, bold text, and bullet points.
3. ANSWER ONLY WHAT IS SPECIFICALLY ASKED: Direct, authoritative, and concise answers.

--- CONTEXT ---
{context}
--- END CONTEXT ---
"""


def build_grounded_prompt(context_chunks, college="QIS College of Engineering and Technology", role="student"):
    """Build the LLM system prompt with embedded RAG context."""
    context = "\n\n".join(f"[{c['filename']}] {c['text']}" for c in context_chunks) or "No matching documents found."
    if role == "faculty":
        template = SYSTEM_PROMPT_FACULTY
    elif role == "admin":
        template = SYSTEM_PROMPT_ADMIN
    else:
        template = SYSTEM_PROMPT_STUDENT
    return template.format(college=college, context=context)


# ─────────────────────────── Connectivity probes ─────────────────────────────

def check_internet(timeout=None) -> bool:
    """Fast connectivity probe: TCP connect to api.groq.com on port 443.
    Uses create_connection (per-socket timeout) to avoid polluting the global
    socket default timeout which would break subsequent HTTP calls in the same
    Flask request thread.
    """
    timeout = timeout or Config.CONNECTIVITY_TIMEOUT
    try:
        conn = socket.create_connection(("api.groq.com", 443), timeout=timeout)
        conn.close()
        return True
    except OSError:
        return False


def check_ollama() -> bool:
    """Probe whether a local Ollama daemon is reachable."""
    try:
        base = Config.OLLAMA_URL.rsplit("/api/", 1)[0]
        r = requests.get(base, timeout=1.0)
        return r.status_code < 500
    except requests.RequestException:
        return False


# ─────────────────────────── LLM callers ─────────────────────────────────────

def _call_groq(system_prompt: str, user_query: str) -> str:
    import time
    headers = {"Authorization": f"Bearer {Config.GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": Config.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query},
        ],
        "temperature": 0.3,
        "max_tokens": 600,
    }
    for attempt in range(3):
        resp = requests.post(Config.GROQ_URL, json=payload, headers=headers, timeout=15)
        if resp.status_code == 429 and attempt < 2:
            time.sleep(1.5 * (attempt + 1))
            continue
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


def _call_ollama(system_prompt: str, user_query: str) -> str:
    payload = {
        "model": Config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query},
        ],
        "stream": False,
    }
    resp = requests.post(Config.OLLAMA_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return data["message"]["content"].strip()


def _fallback_answer(context_chunks, user_query: str) -> str:
    """No LLM reachable at all: return the most relevant structured context."""
    if not context_chunks:
        return (
            "I couldn't reach the AI model right now, and no matching records were found in the database. "
            "Please check the e-CAP portal or contact the college helpdesk at ithelpdesk@qiscet.edu.in."
        )
    top = context_chunks[0]
    return f"Here is the relevant information from {top['filename']}:\n\n{top['text']}"


# ─────────────────────────── Public API ──────────────────────────────────────

def get_engine_status() -> dict:
    online = check_internet()
    ollama_up = check_ollama()
    return {
        "online": online,
        "ollama_available": ollama_up,
        "active_engine": "online" if online else ("ollama" if ollama_up else "offline_fallback"),
    }


def generate_answer(user_query: str, context_chunks, college="QIS College of Engineering and Technology", role="student"):
    """
    Returns (answer_text, source_tag) where source_tag is one of:
    'rag+online', 'rag+ollama', 'rag+offline'

    The `role` parameter ('faculty' | 'student') selects the appropriate system
    prompt so the LLM understands who it's talking to.
    """
    system_prompt = build_grounded_prompt(context_chunks, college, role=role)
    online = check_internet()

    if online and Config.GROQ_API_KEY:
        try:
            answer = _call_groq(system_prompt, user_query)
            return answer, "rag+online"
        except requests.RequestException:
            pass  # fall through to offline path

    if check_ollama():
        try:
            answer = _call_ollama(system_prompt, user_query)
            return answer, "rag+ollama"
        except requests.RequestException:
            pass

    return _fallback_answer(context_chunks, user_query), "rag+offline"
