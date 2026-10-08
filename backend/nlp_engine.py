"""
Campus Assistant - NLP Engine
A lightweight, dependency-free rule-based module for:
  1. Text preprocessing (lowercase, strip punctuation, remove stopwords)
  2. Intent classification via keyword mapping
  3. Frustration / negative-sentiment detection

Kept deliberately simple and explainable so admins can audit *why*
a query was tagged a certain way -- no black-box model in the loop.
"""
import re
import string

STOPWORDS = {
    "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their", "this", "that", "these", "those",
    "to", "of", "in", "on", "at", "for", "with", "about", "as", "by", "from",
    "and", "or", "but", "if", "so", "do", "does", "did", "can", "could", "will",
    "would", "should", "please", "hi", "hello", "hey", "what", "when", "where",
    "how", "tell", "give", "want", "need", "know",
}

INTENT_KEYWORDS = {
    "fees": ["fee", "fees", "payment", "installment", "due", "convener", "management fee", "scholarship", "refund", "billing", "receipt"],
    "exams": ["exam", "exams", "test", "timetable", "hall ticket", "schedule", "revaluation", "supplementary", "mid", "semester end", "marks memo"],
    "courses": ["course", "courses", "syllabus", "subject", "curriculum", "credits", "elective", "branch", "btech", "mtech", "mba", "regulation", "scheme"],
    "calendar": ["calendar", "holiday", "vacation", "semester start", "semester end", "term dates"],
    "administration": [
        "principal", "hod", "office", "admin", "administration", "director", "dean", "governance",
        "contact", "phone", "email", "staff", "department head", "exam controller", "coe",
        "accounts officer", "finance officer", "bursar", "registrar", "grievance", "grievances",
        "complaint", "anti ragging", "antiragging", "helpline", "working hours", "office timings",
        "transcripts", "degree verification", "admission", "admissions", "convener quota",
        "management quota", "rules", "regulations", "accreditation", "naac", "nba", "autonomous",
    ],
    "notice": ["notice", "notices", "announcement", "announcements", "circular", "circulars", "update", "news"],
    "technical": ["password", "login", "portal", "app", "error", "bug", "not working", "reset"],
    "greeting": ["good morning", "good evening", "thanks", "thank you", "bye", "hi", "hello"],
    "attendance": ["attendance", "present", "absent", "classes", "attended", "percentage", "condonation", "detention", "medical certificate"],
    "hostel": ["hostel", "room", "warden", "rent", "block", "hostel fee", "maintenance", "boys hostel", "girls hostel"],
    "food": ["food", "mess", "canteen", "menu", "meal", "breakfast", "lunch", "dinner", "snack"],
    "bus": ["bus", "buses", "route", "routes", "transport", "transportation", "driver", "stops", "timings"],
    "lost_found": ["lost", "found", "calculator", "keys", "charger", "item", "claim"],
    "placements": ["placement", "placements", "company", "companies", "package", "lpa", "recruiter", "recruiters", "drive", "drives", "tpo", "crt"],
    "library": ["library", "book", "books", "borrow", "catalog", "author", "isbn", "reading room"],
    # Student-specific inquiries
    "student_info": [
        "student", "students", "student info", "student information", "student details", "student profile",
        "roll number", "roll no", "marks", "grades", "gpa", "cgpa", "backlogs", "semester result",
        "bonafide", "study certificate", "id card", "student id", "student handbook", "student portal",
        "asha rao", "divya",
    ],
    # Faculty-specific inquiries
    "faculty_profile": [
        "teaching", "i teach", "my subject", "my subjects", "my section", "my sections",
        "my students", "my class", "my classes", "which subject", "which section",
        "which course", "what do i teach", "what am i teaching", "who teaches", "assigned to me",
        "my assignment", "my assignments", "my timetable", "my schedule", "my workload",
        "how many students", "student count", "pending assignments", "submitted assignments",
        "my course", "my courses", "my regulation", "which regulation", "r23",
        "aiml", "csds", "cse", "section aiml", "section csds", "section cse",
        "machine learning", "deep learning", "neural networks", "my attendance record",
        "my online day", "online class", "online day", "lab session",
        "faculty", "faculties", "professor", "professors", "prof", "teacher", "teachers",
        "lecturer", "lecturers", "faculty list", "faculty directory", "faculty contact", "faculty timetable",
        "prof mehta", "avinash", "sunitha", "ramesh babu",
    ],
    # Teacher real-time location & timetable inquiries (English & Telugu / Transliterated)
    "faculty_location": [
        "where is", "location of", "ekkada", "vunnaru", "unnaru", "yeppudu", "eppudu",
        "where can i find", "where to meet", "cabin", "room no", "which room", "which class",
        "find teacher", "find prof", "teacher location", "faculty location", "where is teacher",
        "where is prof", "where is avinash", "where is mehta", "where is sunitha", "where is ramesh",
        "faculty timetable", "teacher timetable", "faculty schedule", "teacher schedule",
        "today timetable", "period", "classes of", "who is in classroom", "current class",
        "live location", "where are teachers", "teacher ekkada", "prof ekkada",
    ],
    # Student class timetable / schedule inquiries
    "student_timetable": [
        "time table", "timetable", "class schedule", "class today", "today class",
        "naa timetable", "mana timetable", "mana class schedule", "naa class",
        "ece timetable", "aid timetable", "csm timetable", "csd timetable",
        "ece 1 timetable", "ece 2 timetable", "aid 1 timetable", "aid 2 timetable",
        "aid 3 timetable", "csm 1 timetable", "csm 2 timetable", "csd 1 timetable",
        "student timetable", "our timetable", "our schedule", "class timing",
        "first period", "second period", "third period", "fourth period", "fifth period",
        "monday timetable", "tuesday timetable", "wednesday timetable",
        "thursday timetable", "friday timetable", "saturday timetable",
        "which subject monday", "which class today", "3-1 timetable", "7-1 timetable",
        "dwdm class", "machine learning class", "deep learning class", "ece schedule",
    ],
}


FRUSTRATION_TOKENS = [
    "useless", "worst", "stupid", "not answering", "not helpful", "waste of time",
    "annoying", "frustrated", "angry", "ridiculous", "terrible", "horrible",
    "still not", "again and again", "doesn't work", "does not work", "not working",
    "ignoring", "no help", "bad bot", "awful", "pathetic", "unacceptable",
]


def preprocess(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    text = text.lower().strip()
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize_no_stopwords(text: str):
    cleaned = preprocess(text)
    return [t for t in cleaned.split() if t and t not in STOPWORDS]


def classify_intent(query: str) -> str:
    """Keyword-mapping intent classifier. Returns the best-matching intent label."""
    cleaned = " " + preprocess(query) + " "
    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in cleaned)
        if score:
            scores[intent] = score
    if not scores:
        return "general"
    return max(scores, key=scores.get)


def detect_frustration(query: str) -> bool:
    """Returns True if the query contains negative-sentiment / frustration markers."""
    cleaned = preprocess(query)
    hits = sum(1 for tok in FRUSTRATION_TOKENS if tok in cleaned)
    # Repeated punctuation like "???" or "!!!" in the raw text is another signal
    shouting = bool(re.search(r"[!?]{2,}", query))
    all_caps = len(query) > 6 and query.isupper()
    return hits > 0 or shouting or all_caps


def extract_top_keywords(queries, top_n=8):
    """Used by the analytics endpoint: frequency count of non-stopword tokens."""
    freq = {}
    for q in queries:
        for tok in tokenize_no_stopwords(q):
            if len(tok) < 3:
                continue
            freq[tok] = freq.get(tok, 0) + 1
    return sorted(freq.items(), key=lambda kv: kv[1], reverse=True)[:top_n]


def analyze(query: str) -> dict:
    """Convenience wrapper returning the full NLP analysis of one query."""
    return {
        "cleaned": preprocess(query),
        "intent": classify_intent(query),
        "frustrated": detect_frustration(query),
    }
