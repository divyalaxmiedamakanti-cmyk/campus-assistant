"""
Smart Search & Intelligent Autocomplete Engine
Provides semantic suggestions, related topics, typo correction, and college directory matches.
"""
import re
from difflib import SequenceMatcher
from faculty_tracker import FACULTY_MASTER_DIRECTORY

# Topic & Knowledge Expansion Graph
TOPIC_ONTOLOGY = {
    "python": {
        "title": "Python",
        "exact_matches": ["Python", "Python Programming", "Python Language"],
        "related_keywords": ["Python Functions", "Python Loops", "Python Syntax", "Python Libraries", "Python OOP"],
        "related_topics": [
            {"title": "Python Programming", "desc": "Core syntax, data types, control flow & algorithms", "type": "course"},
            {"title": "Python Functions", "desc": "Def statements, arguments, lambda expressions & decorators", "type": "topic"},
            {"title": "Python Loops", "desc": "For and while loops, list comprehensions, iteration patterns", "type": "topic"},
            {"title": "Python for Data Science", "desc": "Pandas, NumPy, Matplotlib & data wrangling", "type": "course"},
            {"title": "Python Machine Learning", "desc": "Scikit-Learn, TensorFlow & PyTorch implementations", "type": "topic"},
            {"title": "Python Projects", "desc": "Hands-on college capstone projects & web apps", "type": "project"},
        ],
        "similar_searches": ["Data Structures in Python", "Python Django / Flask", "Object Oriented Python"],
    },
    "machine learning": {
        "title": "Machine Learning",
        "exact_matches": ["Machine Learning", "ML", "Course 23AI501 (Machine Learning)"],
        "related_keywords": ["Supervised Learning", "Unsupervised Learning", "Deep Learning", "Neural Networks", "Classification", "Regression"],
        "related_topics": [
            {"title": "Supervised Learning", "desc": "Training algorithms with labeled datasets", "type": "topic"},
            {"title": "Unsupervised Learning", "desc": "Clustering, dimensionality reduction & PCA", "type": "topic"},
            {"title": "Deep Learning", "desc": "Multi-layer artificial neural networks and backpropagation", "type": "topic"},
            {"title": "Neural Networks", "desc": "Perceptrons, CNNs, RNNs & transformers (Course 23CS503)", "type": "course"},
            {"title": "Classification", "desc": "Logistic regression, SVM, Random Forest, Decision Trees", "type": "topic"},
            {"title": "Regression", "desc": "Linear regression, polynomial regression & loss minimization", "type": "topic"},
        ],
        "similar_searches": ["Deep Learning Lab", "Machine Learning Section AIML-2", "Dr. Vara Prasad ML"],
    },
    "deep learning": {
        "title": "Deep Learning",
        "exact_matches": ["Deep Learning", "Deep Learning Lab (23DS602)"],
        "related_keywords": ["Convolutional Networks", "Recurrent Networks", "Transfer Learning", "PyTorch Lab", "TensorFlow"],
        "related_topics": [
            {"title": "Neural Networks", "desc": "Core foundation of deep artificial neural nets", "type": "course"},
            {"title": "Deep Learning Lab", "desc": "CSDS-3 practical lab held in CSE Lab-A2", "type": "lab"},
            {"title": "Computer Vision", "desc": "Object detection, YOLO, OpenCV & image segmentation", "type": "topic"},
            {"title": "Natural Language Processing", "desc": "Transformers, BERT, LLMs & tokenizers", "type": "topic"},
            {"title": "Reinforcement Learning", "desc": "Q-learning, policy gradients & Markov decision processes", "type": "topic"},
        ],
        "similar_searches": ["Deep Learning Lab timetable", "Lab-A2 schedule", "CSDS-3 lab"],
    },
    "neural networks": {
        "title": "Neural Networks",
        "exact_matches": ["Neural Networks", "Course 23CS503 (Neural Networks)"],
        "related_keywords": ["Backpropagation", "Activation Functions", "Perceptrons", "Loss Functions", "Optimizers"],
        "related_topics": [
            {"title": "Deep Learning", "desc": "Multi-layered network architectures & modern AI", "type": "topic"},
            {"title": "Convolutional Neural Networks", "desc": "Image filters, pooling, and spatial feature maps", "type": "topic"},
            {"title": "Recurrent Neural Networks", "desc": "LSTM, GRU & sequential time-series modeling", "type": "topic"},
            {"title": "Neural Networks Classroom CS-205", "desc": "Section CSE-5 lecture room · Dr. Vara Prasad", "type": "classroom"},
        ],
        "similar_searches": ["Neural Networks assignment", "Neural Networks timetable", "Dr. Vara Prasad"],
    },
    "operating systems": {
        "title": "Operating Systems",
        "exact_matches": ["Operating Systems", "Course 23CS302 (Operating Systems)"],
        "related_keywords": ["Process Management", "CPU Scheduling", "Deadlocks", "Virtual Memory", "Semaphores"],
        "related_topics": [
            {"title": "Process Scheduling", "desc": "Round Robin, SJF, Priority & Multilevel queues", "type": "topic"},
            {"title": "Deadlocks & Semaphores", "desc": "Banker's algorithm, mutex locks & critical sections", "type": "topic"},
            {"title": "Virtual Memory & Paging", "desc": "Page replacement algorithms (FIFO, LRU, Optimal)", "type": "topic"},
            {"title": "Linux Kernel Architecture", "desc": "System calls, file systems & process tables", "type": "topic"},
        ],
        "similar_searches": ["Dr. K. Avinash OS", "Operating Systems Classroom CS-102"],
    },
    "cloud computing": {
        "title": "Cloud Computing",
        "exact_matches": ["Cloud Computing", "Course 23CS604 (Cloud Computing)"],
        "related_keywords": ["AWS", "Docker", "Kubernetes", "Microservices", "Serverless"],
        "related_topics": [
            {"title": "AWS Cloud Architecture", "desc": "EC2, S3, Lambda, IAM & VPC infrastructure", "type": "topic"},
            {"title": "Docker & Containers", "desc": "Containerization, Dockerfiles & image registries", "type": "topic"},
            {"title": "Cloud Computing Lab", "desc": "Held in CSE Lab-B1 for CSDS-2", "type": "lab"},
        ],
        "similar_searches": ["Dr. K. Avinash Cloud", "Cloud Computing Classroom CS-204"],
    },
    "attendance": {
        "title": "Attendance",
        "exact_matches": ["Attendance", "Student Attendance", "Attendance Rules"],
        "related_keywords": ["75% Rule", "Condonation", "Medical Leave", "Detention", "e-CAP Attendance"],
        "related_topics": [
            {"title": "75% Mandatory Attendance Rule", "desc": "Minimum required attendance under Autonomous R23 scheme", "type": "policy"},
            {"title": "Medical Condonation (65% – 74%)", "desc": "Requires medical certificate and approval by Dean", "type": "policy"},
            {"title": "e-CAP Attendance Portal", "desc": "Check daily subject-wise percentages", "type": "portal"},
        ],
        "similar_searches": ["How to check attendance", "Can I write exams with 70% attendance?"],
    },
    "fees": {
        "title": "Fees",
        "exact_matches": ["Fees", "Fee Payment", "Fee Structure"],
        "related_keywords": ["Convener Fee", "Management Quota", "Semester Fee", "Late Fine", "Payment Gateway"],
        "related_topics": [
            {"title": "QIS Billing Gateway", "desc": "Pay online via net banking, UPI or debit/credit card", "type": "portal"},
            {"title": "Semester Fee Deadlines", "desc": "Due on 10th of semester opening month", "type": "policy"},
            {"title": "Accounts Department", "desc": "Lena Fernandes · Accounts Officer · Main Admin Block", "type": "admin"},
        ],
        "similar_searches": ["Pay semester fees", "Late fee fine amount", "Accounts phone number"],
    },
    "faculty": {
        "title": "Faculty",
        "exact_matches": ["Faculty Directory", "Professors", "Teachers"],
        "related_keywords": ["HOD Cabin", "Office Hours", "Timetable", "Classroom Location", "Faculty Email"],
        "related_topics": [
            {"title": "Dr. Vara Prasad", "desc": "HOD CSE & AIML · Cabin Room 204 · Machine Learning & Neural Networks", "type": "faculty"},
            {"title": "Dr. Bujji Babu", "desc": "HOD CSE · CSE Department Block, Room 204", "type": "faculty"},
            {"title": "Bindu", "desc": "Associate Professor · CSM Department · CSM Block Room 101", "type": "faculty"},
            {"title": "Koteswar Rao", "desc": "Assistant Professor · CSM Department · Computer Networks", "type": "faculty"},
            {"title": "Durga", "desc": "Associate Professor · AIDS Department · AIDS Block Room 201", "type": "faculty"},
            {"title": "Real-Time Faculty Location Tracker", "desc": "Live teacher tracking & current classroom schedules", "type": "tracker"},
        ],
        "similar_searches": ["Where is Dr. Vara Prasad right now?", "Faculty cabin numbers", "Faculty office hours"],
    },
    "csm": {
        "title": "Computer Science & Machine Learning (CSM)",
        "exact_matches": ["CSM Department", "Computer Science & Machine Learning"],
        "related_keywords": ["Bindu", "Koteswar Rao", "Nikhil", "Bhaskar Rao"],
        "related_topics": [
            {"title": "Bindu", "desc": "Associate Professor · CSM Block Room 101", "type": "faculty"},
            {"title": "Koteswar Rao", "desc": "Assistant Professor · Computer Networks & Protocols", "type": "faculty"},
            {"title": "Nikhil", "desc": "Assistant Professor · Data Structures & Algorithms", "type": "faculty"},
            {"title": "Bhaskar Rao", "desc": "Associate Professor · AI & Expert Systems", "type": "faculty"},
        ],
        "similar_searches": ["CSM Timetable", "CSM Faculty List", "CSM 1 Section Schedule"],
    },
    "aids": {
        "title": "Artificial Intelligence & Data Science (AIDS)",
        "exact_matches": ["AIDS Department", "Artificial Intelligence & Data Science"],
        "related_keywords": ["Durga", "Srinilai", "Rabbani Basha"],
        "related_topics": [
            {"title": "Durga", "desc": "Associate Professor · AIDS Block Room 201", "type": "faculty"},
            {"title": "Srinilai", "desc": "Assistant Professor · Data Visualization & Analytics", "type": "faculty"},
            {"title": "Rabbani Basha", "desc": "Assistant Professor · Big Data Analytics & NLP", "type": "faculty"},
        ],
        "similar_searches": ["AIDS Timetable", "AIDS Faculty List", "AID 1 Section Schedule"],
    },
}

# Pre-defined Popular / Recommended Searches
POPULAR_SEARCHES = [
    {"title": "Python Programming", "category": "Course", "desc": "Core syntax, functions, OOP & projects", "icon": "code"},
    {"title": "Machine Learning", "category": "Course", "desc": "Supervised, unsupervised & neural networks (23AI501)", "icon": "sparkles"},
    {"title": "Dr. Vara Prasad", "category": "Faculty", "desc": "HOD CSE & AIML · Classroom CS-205 / CS-301", "icon": "user"},
    {"title": "Bindu (CSM)", "category": "Faculty", "desc": "Associate Professor · CSM Department", "icon": "user"},
    {"title": "Durga (AIDS)", "category": "Faculty", "desc": "Associate Professor · AIDS Department", "icon": "user"},
    {"title": "Attendance 75% Regulation", "category": "Policy", "desc": "Minimum attendance rules and condonation limits", "icon": "file"},
    {"title": "Live Faculty Timetable Tracker", "category": "Schedule", "desc": "Check real-time classroom location of professors", "icon": "clock"},
    {"title": "QIS Billing Gateway & Fees", "category": "Finance", "desc": "Pay tuition and lab fees online", "icon": "card"},
]

SYNONYM_MAP = {
    "py": "python",
    "pythn": "python",
    "pyton": "python",
    "pithon": "python",
    "pyt": "python",
    "ml": "machine learning",
    "machne": "machine learning",
    "mchine": "machine learning",
    "machin learning": "machine learning",
    "supervise": "machine learning",
    "supervised": "machine learning",
    "dl": "deep learning",
    "dep learning": "deep learning",
    "nn": "neural networks",
    "neural": "neural networks",
    "os": "operating systems",
    "operatng": "operating systems",
    "cloud": "cloud computing",
    "attndance": "attendance",
    "attendence": "attendance",
    "atendance": "attendance",
    "prof": "faculty",
    "proff": "faculty",
    "teacher": "faculty",
    "teachers": "faculty",
    "professor": "faculty",
    "vara prasad": "faculty",
    "bujji babu": "faculty",
    "bindu": "csm",
    "koteswar": "csm",
    "koteswar rao": "csm",
    "nikhil": "csm",
    "bhaskar": "csm",
    "bhaskar rao": "csm",
    "durga": "aids",
    "srinilai": "aids",
    "rabbani": "aids",
    "rabbani basha": "aids",
    "fee": "fees",
    "fe": "fees",
    "tution": "fees",
    "tuition": "fees",
    "timetable": "faculty",
    "schedule": "faculty",
    "period": "faculty",
    "classroom": "faculty",
}


def _clean(s: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", "", s).strip().lower()


def _fuzzy_score(a: str, b: str) -> float:
    return SequenceMatcher(None, _clean(a), _clean(b)).ratio()


def get_smart_suggestions(query: str, limit: int = 8) -> dict:
    """
    Analyzes input query and returns structured autocomplete suggestions.
    """
    raw_q = query.strip()
    clean_q = _clean(raw_q)

    # Empty query: return popular searches
    if not clean_q:
        return {
            "query": raw_q,
            "corrected_query": None,
            "has_query": False,
            "exact_matches": [],
            "related_keywords": [],
            "related_topics": [],
            "similar_searches": [],
            "popular_searches": POPULAR_SEARCHES,
            "faculty_matches": [],
            "suggestions": POPULAR_SEARCHES[:limit],
        }

    # Check synonym or typo dictionary
    corrected_q = SYNONYM_MAP.get(clean_q, None)
    lookup_key = corrected_q if corrected_q else clean_q

    # Find matching ontology entries
    ontology_match = None
    best_key = None
    highest_score = 0.0

    for key, data in TOPIC_ONTOLOGY.items():
        score = _fuzzy_score(lookup_key, key)
        if clean_q in key or key in clean_q:
            score = max(score, 0.85)
        if score > highest_score:
            highest_score = score
            best_key = key

    if highest_score >= 0.55 and best_key:
        ontology_match = TOPIC_ONTOLOGY[best_key]

    # Faculty Directory Fuzzy Search
    faculty_matches = []
    for f in FACULTY_MASTER_DIRECTORY:
        f_name_score = _fuzzy_score(clean_q, f["name"])
        alias_scores = [_fuzzy_score(clean_q, alias) for alias in f.get("aliases", [])]
        subject_scores = [_fuzzy_score(clean_q, sub) for sub in f.get("subjects", [])]
        max_score = max([f_name_score] + alias_scores + subject_scores)

        # Direct containment boost
        if clean_q in f["name"].lower() or any(clean_q in alias for alias in f.get("aliases", [])):
            max_score = max(max_score, 0.9)

        if max_score >= 0.50:
            faculty_matches.append({
                "id": f["id"],
                "name": f["name"],
                "department": f["department"],
                "cabin": f["cabin"],
                "subjects": f["subjects"],
                "score": max_score,
            })
    faculty_matches.sort(key=lambda x: x["score"], reverse=True)

    # Prepare structured sections
    exact_matches = []
    related_keywords = []
    related_topics = []
    similar_searches = []

    if ontology_match:
        # 1. Exact matches
        for em in ontology_match.get("exact_matches", []):
            exact_matches.append({
                "title": em,
                "category": "Exact Match",
                "desc": f"Direct result for '{em}'",
                "icon": "check",
                "type": "exact",
            })

        # 2. Related keywords
        for rk in ontology_match.get("related_keywords", []):
            related_keywords.append({
                "title": rk,
                "category": "Keyword",
                "desc": f"Related search keyword",
                "icon": "search",
                "type": "keyword",
            })

        # 3. Related topics (e.g. Python -> Python Programming, Functions, Loops, etc.)
        for rt in ontology_match.get("related_topics", []):
            related_topics.append({
                "title": rt["title"],
                "category": "Related Topic",
                "desc": rt["desc"],
                "icon": "sparkles",
                "type": rt.get("type", "topic"),
            })

        # 4. Similar searches
        for ss in ontology_match.get("similar_searches", []):
            similar_searches.append({
                "title": ss,
                "category": "Similar Search",
                "desc": "Frequently searched together",
                "icon": "layers",
                "type": "similar",
            })
    else:
        # Fallback dynamic suggestion generator using fuzzy substring
        exact_matches.append({
            "title": raw_q.title(),
            "category": "Keyword Match",
            "desc": f"Search for '{raw_q}' across QISCET resources",
            "icon": "search",
            "type": "exact",
        })
        related_keywords.append({
            "title": f"{raw_q.title()} in QISCET Syllabus",
            "category": "Curriculum",
            "desc": "Check R23 autonomous regulation curriculum",
            "icon": "book",
            "type": "keyword",
        })
        related_topics.append({
            "title": f"{raw_q.title()} Faculty & Department",
            "category": "Faculty Directory",
            "desc": "Find professors and departments teaching this",
            "icon": "user",
            "type": "topic",
        })

    # Add faculty matches if any
    for fm in faculty_matches[:3]:
        related_topics.insert(0, {
            "title": fm["name"],
            "category": "Faculty Member",
            "desc": f"{fm['department']} · {fm['cabin']}",
            "icon": "user",
            "type": "faculty",
            "faculty_id": fm["id"],
        })

    # Combine into a prioritized unified suggestions list
    combined = []
    seen = set()

    for item in exact_matches + related_topics + related_keywords + similar_searches:
        if item["title"].lower() not in seen:
            seen.add(item["title"].lower())
            combined.append(item)

    return {
        "query": raw_q,
        "clean_query": clean_q,
        "corrected_query": best_key.title() if (corrected_q and best_key) else None,
        "has_query": True,
        "exact_matches": exact_matches,
        "related_keywords": related_keywords,
        "related_topics": related_topics,
        "similar_searches": similar_searches,
        "faculty_matches": faculty_matches,
        "suggestions": combined[:limit],
    }
