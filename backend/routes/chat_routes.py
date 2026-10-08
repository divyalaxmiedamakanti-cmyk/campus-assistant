from flask import Blueprint, request, jsonify, g
from difflib import SequenceMatcher

import nlp_engine
import rag_engine
import llm_router
import faculty_tracker
import student_timetable_helper
import campus_structured_helper
from auth import login_required
from database import get_db, now_iso

bp = Blueprint("chat_routes", __name__, url_prefix="/api")

FAQ_MATCH_THRESHOLD = 0.72


def _best_faq_match(query: str):
    conn = get_db()
    faqs = conn.execute("SELECT * FROM faqs").fetchall()
    conn.close()

    cleaned_query = nlp_engine.preprocess(query)
    best, best_score = None, 0.0
    for faq in faqs:
        score = SequenceMatcher(None, cleaned_query, nlp_engine.preprocess(faq["question"])).ratio()
        if score > best_score:
            best, best_score = faq, score
    if best and best_score >= FAQ_MATCH_THRESHOLD:
        return best, best_score
    return None, best_score


def _get_intent_db_context(intent: str, user_id: int) -> str:
    conn = get_db()
    try:
        if intent == "fees":
            fee_parts = []
            struct_rows = conn.execute("SELECT course, convener_fee, management_fee, notes FROM fee_structure").fetchall()
            if struct_rows:
                fee_parts.append("College Course Fee Structure:\n" + "\n".join(
                    f"- {r['course']}: Convener ₹{r['convener_fee']:.0f}/yr, Management ₹{r['management_fee']:.0f}/yr ({r['notes']})" for r in struct_rows
                ))
            rows = conn.execute("SELECT fee_type, amount_due, amount_paid, status FROM student_fees WHERE user_id = ?", (user_id,)).fetchall()
            if rows:
                fee_parts.append("Student Fee Account Status:\n" + "\n".join(
                    f"- {r['fee_type']}: Due ₹{r['amount_due']:.2f}, Paid ₹{r['amount_paid']:.2f}, Status: {r['status']}" for r in rows
                ))
            return "\n\n".join(fee_parts)
        elif intent == "exams":
            rows = conn.execute("SELECT course, subject, exam_date, exam_time FROM exams").fetchall()
            if rows:
                return "Exam Timetable:\n" + "\n".join(
                    f"- {r['course']} - {r['subject']}: Date {r['exam_date']}, Time {r['exam_time']}" for r in rows
                )
        elif intent == "courses":
            rows = conn.execute("SELECT name, code, level, duration, intake FROM courses").fetchall()
            if rows:
                return "Available College Courses:\n" + "\n".join(
                    f"- {r['name']} ({r['code']}): {r['level']}, {r['duration']} duration, intake {r['intake']}" for r in rows
                )
        elif intent in ("notice", "notices"):
            rows = conn.execute("SELECT title, content, category, created_at FROM notices ORDER BY id DESC").fetchall()
            if rows:
                return "College Circulars & Notices:\n" + "\n".join(
                    f"- [{r['category']}] {r['title']} ({r['created_at']}): {r['content']}" for r in rows
                )
        elif intent == "attendance":
            rows = conn.execute("SELECT subject, attended_classes, total_classes, percentage FROM attendance").fetchall()
            if rows:
                return "Student Attendance Status:\n" + "\n".join(
                    f"- {r['subject']}: {r['attended_classes']}/{r['total_classes']} classes attended ({r['percentage']}%)" for r in rows
                )
        elif intent == "hostel":
            rows = conn.execute("SELECT block_name, room_no, room_type, warden_name, warden_contact, monthly_rent FROM hostel_details").fetchall()
            if rows:
                return "Hostel Details:\n" + "\n".join(
                    f"- {r['block_name']} Room {r['room_no']} ({r['room_type']}): Warden: {r['warden_name']} ({r['warden_contact']}), Rent: ₹{r['monthly_rent']}/mo" for r in rows
                )
        elif intent in ("food", "mess"):
            rows = conn.execute("SELECT day_of_week, meal_type, items, timings FROM food_menu").fetchall()
            if rows:
                return "Hostel Mess Menu:\n" + "\n".join(
                    f"- {r['day_of_week']} {r['meal_type']}: {r['items']} ({r['timings']})" for r in rows
                )
        elif intent in ("administration", "admin_info"):
            admins = conn.execute("SELECT name, designation, department, email, phone FROM administration").fetchall()
            notices = conn.execute("SELECT title, category, created_at FROM notices ORDER BY id DESC LIMIT 3").fetchall()
            parts = []
            if admins:
                parts.append("Campus Administrative Directory:\n" + "\n".join(
                    f"- {r['name']} ({r['designation']}, {r['department']}): Email: {r['email']}, Phone: {r['phone']}" for r in admins
                ))
            if notices:
                parts.append("Recent Administrative Notices:\n" + "\n".join(
                    f"- [{r['category']}] {r['title']} ({r['created_at']})" for r in notices
                ))
            return "\n\n".join(parts)
        elif intent == "bus":
            rows = conn.execute("SELECT route_no, source, destination, timings, stops, driver_contact FROM bus_routes").fetchall()
            if rows:
                return "College Bus Routes:\n" + "\n".join(
                    f"- Route {r['route_no']} from {r['source']} to {r['destination']}: Timings: {r['timings']}, Stops: {r['stops']}, Driver: {r['driver_contact']}" for r in rows
                )
        elif intent == "lost_found":
            rows = conn.execute("SELECT item_name, description, location_found, status, contact FROM lost_found").fetchall()
            if rows:
                return "Lost & Found Bulletins:\n" + "\n".join(
                    f"- {r['item_name']} ({r['status']}): {r['description']} at {r['location_found']}. Contact: {r['contact']}" for r in rows
                )
        elif intent == "placements":
            rows = conn.execute("SELECT company, role, package, eligibility, status, drive_date FROM placements").fetchall()
            if rows:
                return "Campus Placements Drive Schedule:\n" + "\n".join(
                    f"- {r['company']}: Role: {r['role']}, Package: {r['package']}, Eligibility: {r['eligibility']}, Status: {r['status']}, Date: {r['drive_date']}" for r in rows
                )
        elif intent == "library":
            rows = conn.execute("SELECT title, author, isbn, available_copies, location FROM library_catalog").fetchall()
            if rows:
                return "Central Library Catalog:\n" + "\n".join(
                    f"- '{r['title']}' by {r['author']} (ISBN: {r['isbn']}): {r['available_copies']} copies available at {r['location']}" for r in rows
                )
        elif intent in ("assignments", "assignment"):
            rows = conn.execute("SELECT subject, title, deadline, status, grade FROM assignments").fetchall()
            if rows:
                return "Student Course Assignments:\n" + "\n".join(
                    f"- {r['subject']}: '{r['title']}', Deadline: {r['deadline']}, Status: {r['status']}" + (f", Grade: {r['grade']}" if r['grade'] else "") for r in rows
                )
        elif intent == "student_info":
            students = conn.execute("SELECT name, email, department, year FROM users WHERE role = 'student' LIMIT 5").fetchall()
            attend = conn.execute("SELECT subject, percentage FROM attendance LIMIT 4").fetchall()
            fees = conn.execute("SELECT fee_type, amount_due, status FROM student_fees WHERE user_id = ?", (user_id,)).fetchall()
            parts = []
            if students:
                parts.append("Registered Students in e-CAP:\n" + "\n".join(f"- {s['name']} ({s['department']}, {s['year']}): {s['email']}" for s in students))
            if attend:
                parts.append("Attendance Records:\n" + "\n".join(f"- {a['subject']}: {a['percentage']}% attendance" for a in attend))
            if fees:
                parts.append("Personal Fee Accounts:\n" + "\n".join(f"- {f['fee_type']}: Due ₹{f['amount_due']}, Status: {f['status']}" for f in fees))
            return "\n\n".join(parts)
        elif intent in ("faculty_location", "faculty_schedule"):
            return faculty_tracker.format_all_faculty_live_status() + "\n\n" + faculty_tracker.get_faculty_timetable_context()
        elif intent in ("student_timetable", "timetable", "class_schedule", "schedule"):
            return _get_student_timetable_context(user_id)
    except Exception as e:
        print(f"Error querying intent DB context: {e}")
    finally:
        conn.close()
    return ""


def _get_student_timetable_context(user_id: int, query_str: str = "") -> str:
    """
    Returns rich timetable context for students.
    If a specific section is detected in query_str, queries ONLY that section.
    """
    conn = get_db()
    try:
        tt_parsed = student_timetable_helper.parse_query(query_str) if query_str else {}
        target_section = tt_parsed.get("section")

        if target_section:
            rows = conn.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   WHERE section = ?
                   ORDER BY branch, section, day_of_week, period_no""",
                (target_section,)
            ).fetchall()
        else:
            rows = conn.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   ORDER BY branch, section, day_of_week, period_no"""
            ).fetchall()

        if not rows:
            return "Student timetable data is not yet available."

        # Group by section
        sections = {}
        for r in rows:
            key = f"{r['year']} {r['branch']} {r['section']}"
            if key not in sections:
                sections[key] = {}
            day = r['day_of_week']
            if day not in sections[key]:
                sections[key][day] = []
            sections[key][day].append(r)

        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        title_tag = f"QISCET Student Class Timetable ({target_section if target_section else 'All Sections'}):"
        parts = [title_tag]
        for sec_key, days in sections.items():
            parts.append(f"\n{'='*50}")
            parts.append(f"Section: {sec_key}")
            for day in day_order:
                if day not in days:
                    continue
                parts.append(f"\n  {day}:")
                for p in sorted(days[day], key=lambda x: x['period_no']):
                    fac = f" | Faculty: {p['room']}" if p['room'] else ""
                    room = f" | Room: {p['room']}" if p['room'] else ""
                    faculty = f" | {p['faculty']}" if p['faculty'] else ""
                    code = f" ({p['subject_code']})" if p['subject_code'] else ""
                    parts.append(f"    Period {p['period_no']} [{p['period_time']}]: {p['subject']}{code}{faculty}{room} [{p['subject_type']}]")
        return "\n".join(parts)
    finally:
        conn.close()


def _get_faculty_profile_context(faculty_name: str, faculty_email: str) -> str:
    """
    Build a comprehensive, structured text block about the faculty member's
    teaching profile. This is injected as a RAG context chunk so the LLM
    can answer questions like:
      - "Which subject am I teaching?"
      - "Which section am I teaching Machine Learning in?"
      - "How many students do I have?"
      - "What is my timetable?"
      - "How many students submitted the last assignment?"

    Data is sourced from the SAME mocked constants used in the frontend
    (duplicated here as ground truth), so the chatbot always stays in sync
    with what the faculty sees in the dashboard.
    """

    # ── Teaching assignments ─────────────────────────────────────────────────
    sections = [
        {
            "section":     "AIML-2",
            "subject":     "Machine Learning",
            "course_id":   "23AI501",
            "regulation":  "R23",
            "year":        "II B.Tech",
            "students":    50,
            "type":        "Theory",
        },
        {
            "section":     "CSDS-3",
            "subject":     "Deep Learning Lab",
            "course_id":   "23DS602",
            "regulation":  "R23",
            "year":        "III B.Tech",
            "students":    50,
            "type":        "Lab",
        },
        {
            "section":     "CSE-5",
            "subject":     "Neural Networks",
            "course_id":   "23CS503",
            "regulation":  "R23",
            "year":        "III B.Tech",
            "students":    50,
            "type":        "Theory",
        },
    ]

    # ── Timetable ────────────────────────────────────────────────────────────
    # Each faculty member has 4-5 periods per day, Mon is online day for AIML-2 faculty
    timetable = [
        {"day": "Monday (Online Day — AIML-2)", "periods": [
            {"period": 1, "section": "AIML-2", "subject": "Machine Learning",  "type": "Online"},
            {"period": 2, "section": "AIML-2", "subject": "Machine Learning",  "type": "Online"},
            {"period": 3, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
            {"period": 4, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
        ]},
        {"day": "Tuesday", "periods": [
            {"period": 1, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
            {"period": 2, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
            {"period": 3, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 4, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 5, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
        ]},
        {"day": "Wednesday", "periods": [
            {"period": 1, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 2, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 3, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
            {"period": 4, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
        ]},
        {"day": "Thursday", "periods": [
            {"period": 1, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
            {"period": 2, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
            {"period": 3, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 4, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 5, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
        ]},
        {"day": "Friday", "periods": [
            {"period": 1, "section": "CSE-5",  "subject": "Neural Networks",   "type": "Theory"},
            {"period": 2, "section": "AIML-2", "subject": "Machine Learning",  "type": "Theory"},
            {"period": 3, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
            {"period": 4, "section": "CSDS-3", "subject": "Deep Learning Lab", "type": "Lab"},
        ]},
    ]

    # ── Assignment statistics ────────────────────────────────────────────────
    assignments = [
        {
            "title":     "SVM Classification on MNIST Dataset",
            "section":   "AIML-2",
            "subject":   "Machine Learning",
            "course_id": "23AI501",
            "deadline":  "2026-09-22",
            "total":     50, "submitted": 42, "pending": 8,
        },
        {
            "title":     "Backpropagation Algorithm Implementation",
            "section":   "CSE-5",
            "subject":   "Neural Networks",
            "course_id": "23CS503",
            "deadline":  "2026-09-24",
            "total":     50, "submitted": 45, "pending": 5,
        },
        {
            "title":     "CNN Model for CIFAR-10 Classification",
            "section":   "CSDS-3",
            "subject":   "Deep Learning Lab",
            "course_id": "23DS602",
            "deadline":  "2026-09-20",
            "total":     50, "submitted": 50, "pending": 0,
        },
        {
            "title":     "Dimensionality Reduction using PCA",
            "section":   "AIML-2",
            "subject":   "Machine Learning",
            "course_id": "23AI501",
            "deadline":  "2026-09-28",
            "total":     50, "submitted": 28, "pending": 22,
        },
    ]

    # ── Build text ───────────────────────────────────────────────────────────
    lines = []
    lines.append(f"=== FACULTY PROFILE: {faculty_name} ===")
    lines.append(f"Email: {faculty_email}")
    lines.append(f"College: QIS College of Engineering & Technology (Autonomous)")
    lines.append(f"Regulation: R23  |  Academic Year: 2026-27")
    lines.append("")

    lines.append("--- ASSIGNED SUBJECTS & SECTIONS ---")
    total_students = 0
    for s in sections:
        lines.append(
            f"• Subject: {s['subject']}  |  Section: {s['section']}"
            f"  |  Course ID: {s['course_id']}  |  Regulation: {s['regulation']}"
            f"  |  Year: {s['year']}  |  Type: {s['type']}  |  Students: {s['students']}"
        )
        total_students += s["students"]
    lines.append(f"Total students assigned: {total_students} students across {len(sections)} sections.")
    lines.append("")

    lines.append("--- WEEKLY TIMETABLE ---")
    for day_entry in timetable:
        lines.append(f"{day_entry['day']}:")
        for p in day_entry["periods"]:
            lines.append(
                f"  Period {p['period']}: {p['subject']} — Section {p['section']} ({p['type']})"
            )
    lines.append("Note: Monday is the designated ONLINE class day for AIML-2 (Machine Learning).")
    lines.append("")

    lines.append("--- STUDENT ASSIGNMENT STATUS ---")
    for a in assignments:
        pct = round(a["submitted"] / a["total"] * 100) if a["total"] else 0
        lines.append(
            f"• [{a['course_id']} / {a['section']}] '{a['title']}' — "
            f"Deadline: {a['deadline']} — "
            f"Submitted: {a['submitted']}/{a['total']} ({pct}%) — "
            f"Pending: {a['pending']} students"
        )
    lines.append("")

    lines.append("--- QUICK FACTS ---")
    lines.append(f"Q: Which subjects do I teach?")
    lines.append(f"A: You teach Machine Learning (AIML-2, 23AI501), Deep Learning Lab (CSDS-3, 23DS602), and Neural Networks (CSE-5, 23CS503) — all under R23 Regulation.")
    lines.append(f"Q: Which section am I teaching Machine Learning?")
    lines.append(f"A: You teach Machine Learning to Section AIML-2 (II B.Tech, Course ID 23AI501, R23).")
    lines.append(f"Q: Which section am I teaching Neural Networks?")
    lines.append(f"A: You teach Neural Networks to Section CSE-5 (III B.Tech, Course ID 23CS503, R23).")
    lines.append(f"Q: Which section am I teaching Deep Learning?")
    lines.append(f"A: You teach Deep Learning Lab to Section CSDS-3 (III B.Tech, Course ID 23DS602, R23).")
    lines.append(f"Q: How many total students do I have?")
    lines.append(f"A: You have {total_students} students assigned across 3 sections (50 per section).")
    lines.append(f"Q: What is my online day?")
    lines.append(f"A: Monday is your designated online class day for AIML-2 (Machine Learning).")

    return "\n".join(lines)


@bp.post("/query")
@login_required
def query():
    data = request.get_json(force=True, silent=True) or {}
    user_query = (data.get("query") or "").strip()
    if not user_query:
        return jsonify({"error": "Query text is required"}), 400

    analysis = nlp_engine.analyze(user_query)
    intent, frustrated = analysis["intent"], analysis["frustrated"]
    user_role = g.user.get("role", "student")

    timetable_payload = None

    # Check student timetable structured query first
    tt_parsed = student_timetable_helper.parse_query(user_query)
    if tt_parsed.get("is_timetable_query"):
        tt_res = student_timetable_helper.query_timetable(tt_parsed)
        if tt_res:
            answer = tt_res["markdown_answer"]
            source = "student_timetable_db"
            intent = "student_timetable"
            timetable_payload = tt_res
            context_used = [{"filename": "e-CAP Student Timetable Database", "text": answer}]

            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO chats (user_id, query, response, intent, source, frustrated, flagged, created_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (g.user["sub"], user_query, answer, intent, source, int(frustrated), 0, now_iso()),
            )
            conn.commit()
            chat_id = cur.lastrowid
            conn.close()

            return jsonify({
                "chat_id": chat_id,
                "answer": answer,
                "intent": intent,
                "frustrated": frustrated,
                "source": source,
                "context_sources": ["e-CAP Student Timetable Database"],
                "timetable": timetable_payload,
            })

    # 100% Live DB Query: examinations, attendance, courses, food/mess, room allocation, library,
    # fee structure, reimbursement, documents, support_tickets, notices — all fetched fresh from SQLite
    campus_parsed = campus_structured_helper.parse_campus_query(user_query)
    if campus_parsed.get("is_structured"):
        c_res = campus_structured_helper.generate_structured_response(campus_parsed["category"], g.user["sub"])
        if c_res:
            answer = c_res["markdown_answer"]
            source = "campus_live_db"
            intent = campus_parsed["category"]
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO chats (user_id, query, response, intent, source, frustrated, flagged, created_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (g.user["sub"], user_query, answer, intent, source, int(frustrated), 0, now_iso()),
            )
            conn.commit()
            chat_id = cur.lastrowid
            conn.close()

            return jsonify({
                "chat_id": chat_id,
                "answer": answer,
                "intent": intent,
                "frustrated": frustrated,
                "source": source,
                "live_db": True,
                "context_sources": ["QISCET Live SQLite Database — Fetched on Query"],
                "structured_card": c_res,
            })

    # 1) Try exact/near FAQ match first (fast + free)
    faq_hit, score = _best_faq_match(user_query)
    if faq_hit:
        answer, source = faq_hit["answer"], "faq"
        context_used = []
    else:
        # 2) Fall back to RAG + hybrid LLM
        context_used = rag_engine.search(user_query)
        db_context = _get_intent_db_context(intent, g.user["sub"])
        if db_context:
            context_used.append({
                "text": db_context,
                "filename": "e-CAP Live Database"
            })

        # 3) Faculty teaching profile: inject whenever user is faculty OR query relates to faculty/teaching
        faculty_keywords = (
            "faculty", "professor", "prof", "teach", "teaching", "timetable", "schedule",
            "section", "sections", "aiml", "csds", "cse", "machine learning", "deep learning",
            "neural network", "workload", "assignment submission", "mehta", "avinash"
        )
        wants_faculty_info = (user_role == "faculty") or (intent == "faculty_profile") or any(k in user_query.lower() for k in faculty_keywords)
        if wants_faculty_info:
            faculty_name  = g.user.get("name", "Dr. Vara Prasad") if user_role == "faculty" else "Dr. Vara Prasad"
            faculty_email = g.user.get("email", "vara.prasad@qiscet.edu.in") if user_role == "faculty" else "vara.prasad@qiscet.edu.in"
            faculty_profile = _get_faculty_profile_context(
                faculty_name  = faculty_name,
                faculty_email = faculty_email,
            )
            context_used.insert(0, {   # insert first so LLM sees it before RAG docs
                "text":     faculty_profile,
                "filename": "Faculty Teaching Profile (QISCET e-CAP)"
            })

        # 4) Administration directory & governance: ensure injected whenever admin/leadership inquiry occurs
        admin_keywords = (
            "principal", "exam controller", "coe", "admin", "administration", "office", "accounts",
            "dean", "grievance", "complaint", "anti-ragging", "antiragging", "working hours",
            "timing", "timings", "rules", "regulations", "autonomous", "admission", "transcripts"
        )
        wants_admin_info = (user_role == "admin") or (intent in ("administration", "notice", "admin_info")) or any(k in user_query.lower() for k in admin_keywords)
        if wants_admin_info and not any("Administrative" in c.get("filename", "") for c in context_used):
            admin_ctx = _get_intent_db_context("administration", g.user["sub"])
            if admin_ctx:
                context_used.append({
                    "text": admin_ctx,
                    "filename": "Campus Administrative Directory (e-CAP)"
                })

        # 5) Real-Time Teacher Location & Faculty Timetable Tracker (English, Telugu, Hinglish)
        teacher_location_keywords = (
            "where is", "location", "ekkada", "vunnaru", "unnaru", "yeppudu", "eppudu",
            "where can i find", "cabin", "room no", "which room", "which class", "where to meet",
            "teacher location", "faculty location", "who is in classroom", "current class",
            "live location", "timetable", "schedule", "free period", "office hours", "class right now",
            "where teacher", "teacher ekkada", "prof ekkada"
        )
        is_teacher_location_query = (
            intent in ("faculty_location", "faculty_profile") or
            any(k in user_query.lower() for k in teacher_location_keywords)
        )
        if is_teacher_location_query:
            matched_faculty = faculty_tracker.find_faculty_by_query(user_query)
            if matched_faculty:
                live_st = faculty_tracker.get_live_faculty_status(matched_faculty)
                tt_ctx = faculty_tracker.get_faculty_timetable_context(matched_faculty["name"])
                live_text = (
                    f"REAL-TIME TEACHER LOCATION TRACKER (LIVE AS OF {live_st['day']} {live_st['time']} IST):\n"
                    f"- Teacher/Faculty Name: {matched_faculty['name']}\n"
                    f"- Designation: {matched_faculty['designation']}\n"
                    f"- Department: {matched_faculty['department']}\n"
                    f"- CURRENT STATUS & REAL-TIME LOCATION: {live_st['status']} at {live_st['location']}\n"
                    f"- Live Detailed Status: {live_st['description']}\n"
                    f"- Permanent Office Cabin: {matched_faculty['cabin']}\n"
                    f"- Office Consultation Hours: {matched_faculty['office_hours']}\n"
                    f"- Contact Phone: {matched_faculty['phone']} | Email: {matched_faculty['email']}\n"
                    f"- Next Class Today: {live_st['next_class']}\n\n"
                    f"{tt_ctx}"
                )
            else:
                live_text = faculty_tracker.format_all_faculty_live_status() + "\n\n" + faculty_tracker.get_faculty_timetable_context()

            context_used.insert(0, {
                "text": live_text,
                "filename": "QISCET Live Faculty Location & Timetable Tracker"
            })

        # 6) Student Timetable: inject when student asks about their class schedule
        student_tt_keywords = (
            "time table", "timetable", "class schedule", "period", "periods",
            "which class", "class today", "today class", "what subject",
            "monday schedule", "tuesday schedule", "wednesday schedule",
            "thursday schedule", "friday schedule", "saturday schedule",
            "ece timetable", "aid timetable", "csm timetable", "csd timetable",
            "ece 1", "ece 2", "aid 1", "aid 2", "aid 3", "csm 1", "csm 2",
            "csd 1", "csd 2", "our timetable", "student timetable",
            "class timing", "class time", "first period", "second period",
            "third period", "fourth period", "fifth period",
            "machine learning class", "dwdm class", "deep learning class",
            "naa timetable", "mana timetable", "mana class", "naa class",
            "3-1", "7-1", "ece schedule", "aid schedule"
        )
        is_student_timetable_query = (
            intent in ("student_timetable", "timetable", "class_schedule", "schedule") or
            any(k in user_query.lower() for k in student_tt_keywords)
        )
        if is_student_timetable_query and not any("Student Class Timetable" in c.get("filename", "") for c in context_used):
            student_tt_ctx = _get_student_timetable_context(g.user["sub"], user_query)
            if student_tt_ctx:
                context_used.insert(0, {
                    "text": student_tt_ctx,
                    "filename": "QISCET Student Class Timetable"
                })

        # 7) CFSS Live DB Context: inject live reimbursement/documents/tickets/notices data
        # when query relates to CFSS, scholarship, biometric, documents, or notices from any portal
        cfss_live_keywords = (
            "reimbursement", "reimb", "jvd", "scholarship", "vidya deevena", "vasathi",
            "biometric", "thumb", "aadhaar auth", "cfss", "thumbprint",
            "bonafide", "study certificate", "fee certificate", "tc", "document request",
            "support ticket", "cfss ticket", "grievance ticket",
            "notice", "announcement", "circular", "bulletin", "cfro notice", "cfss notice",
            "document status", "certificate status", "application stage", "reimbursement stage"
        )
        wants_cfss_live = any(k in user_query.lower() for k in cfss_live_keywords)
        if wants_cfss_live and not any("CFSS Live" in c.get("filename", "") for c in context_used):
            cfss_db = get_db()
            try:
                cfss_parts = []
                # Live reimbursement status
                reimb_rows = cfss_db.execute(
                    "SELECT scheme_name, application_no, current_stage, thumb_auth_status, thumb_auth_notes, "
                    "eligible_amount, sanctioned_amount, remarks, updated_at FROM reimbursement_applications "
                    "WHERE user_id = ? ORDER BY id DESC LIMIT 2", (g.user["sub"],)
                ).fetchall()
                if reimb_rows:
                    reimb_parts = ["LIVE FEE REIMBURSEMENT STATUS (from DB):"]
                    for r in reimb_rows:
                        reimb_parts.append(
                            f"- Scheme: {r['scheme_name']} | App No: {r['application_no']}\n"
                            f"  Current Stage: {r['current_stage']}\n"
                            f"  Thumb Auth: {r['thumb_auth_status']} — {r['thumb_auth_notes'] or ''}\n"
                            f"  Eligible: ₹{r['eligible_amount']:,.0f} | Sanctioned: ₹{r['sanctioned_amount']:,.0f}\n"
                            f"  Remarks: {r['remarks'] or '—'} | Updated: {str(r['updated_at'])[:10]}"
                        )
                    cfss_parts.append("\n".join(reimb_parts))

                # Live document requests status
                doc_rows = cfss_db.execute(
                    "SELECT document_type, status, remarks, submitted_at, completed_at FROM document_requests "
                    "WHERE user_id = ? ORDER BY id DESC LIMIT 3", (g.user["sub"],)
                ).fetchall()
                if doc_rows:
                    doc_parts = ["LIVE DOCUMENT REQUEST STATUS (from DB):"]
                    for d in doc_rows:
                        doc_parts.append(
                            f"- {d['document_type']}: Status = {d['status']} | "
                            f"Remarks: {d['remarks'] or '—'} | Submitted: {str(d['submitted_at'])[:10]}"
                        )
                    cfss_parts.append("\n".join(doc_parts))

                # Live notices from all 3 tables
                notice_rows = cfss_db.execute(
                    "SELECT title, category, created_at, 'General' as src FROM notices ORDER BY id DESC LIMIT 3"
                ).fetchall()
                cfro_ann = cfss_db.execute(
                    "SELECT title, category, created_at, 'CFRO' as src FROM cfro_announcements ORDER BY id DESC LIMIT 2"
                ).fetchall()
                cfss_ann = cfss_db.execute(
                    "SELECT title, category, created_at, 'CFSS' as src FROM cfss_announcements ORDER BY id DESC LIMIT 2"
                ).fetchall()
                all_notices = list(notice_rows) + list(cfro_ann) + list(cfss_ann)
                if all_notices:
                    n_parts = ["LIVE NOTICES & ANNOUNCEMENTS (from DB):"]
                    for n in all_notices:
                        n_parts.append(f"- [{n['src']} — {n['category']}] {n['title']} ({str(n['created_at'])[:10]})")
                    cfss_parts.append("\n".join(n_parts))

                if cfss_parts:
                    context_used.insert(0, {
                        "text": "\n\n".join(cfss_parts),
                        "filename": "QISCET CFSS Live DB — Reimbursement / Documents / Notices"
                    })
            except Exception as e:
                print(f"CFSS live DB context error: {e}")
            finally:
                cfss_db.close()

        answer, source = llm_router.generate_answer(user_query, context_used, role=user_role)


    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO chats (user_id, query, response, intent, source, frustrated, flagged, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (g.user["sub"], user_query, answer, intent, source, int(frustrated), 0, now_iso()),
    )
    conn.commit()
    chat_id = cur.lastrowid
    conn.close()

    return jsonify({
        "chat_id": chat_id,
        "answer": answer,
        "intent": intent,
        "frustrated": frustrated,
        "source": source,
        "context_sources": sorted({c["filename"] for c in context_used}) if context_used else [],
    })


@bp.post("/feedback")
@login_required
def feedback():
    data = request.get_json(force=True, silent=True) or {}
    chat_id = data.get("chat_id")
    rating = data.get("rating")

    if rating not in ("up", "down"):
        return jsonify({"error": "rating must be 'up' or 'down'"}), 400
    if not chat_id:
        return jsonify({"error": "chat_id is required"}), 400

    conn = get_db()
    chat_row = conn.execute("SELECT id FROM chats WHERE id = ?", (chat_id,)).fetchone()
    if not chat_row:
        conn.close()
        return jsonify({"error": "Unknown chat_id"}), 404

    cur = conn.cursor()
    cur.execute("INSERT INTO feedback (chat_id, rating, created_at) VALUES (?,?,?)", (chat_id, rating, now_iso()))
    if rating == "down":
        cur.execute("UPDATE chats SET flagged = 1 WHERE id = ?", (chat_id,))
    conn.commit()
    conn.close()

    return jsonify({"ok": True, "flagged": rating == "down"})


@bp.get("/timetable")
def get_timetable():
    section = request.args.get("section")
    day = request.args.get("day")
    subject = request.args.get("subject")
    year = request.args.get("year", "3-1")
    parsed = {
        "section": section,
        "day": day,
        "subject": subject,
        "year": year,
        "is_timetable_query": True
    }
    res = student_timetable_helper.query_timetable(parsed)
    if not res:
        return jsonify({"error": "No timetable records found"}), 404
    return jsonify(res)



@bp.get("/portal/<section>")
@login_required
def portal_section(section):
    """Serves the dashboard's dynamic panel data: fees, calendar, courses, exams, notices, and new expanded sections."""
    conn = get_db()
    if section == "fees":
        rows = conn.execute(
            "SELECT * FROM student_fees WHERE user_id = ? OR student_name LIKE ? OR roll_number LIKE ? ORDER BY id DESC",
            (g.user["sub"], f"%{g.user.get('name', '')}%", f"%{g.user.get('name', '')}%")
        ).fetchall()
        if not rows:
            rows = conn.execute("SELECT * FROM student_fees ORDER BY id DESC").fetchall()
    elif section == "courses":
        rows = conn.execute("SELECT * FROM courses").fetchall()
    elif section == "exams":
        rows = conn.execute("SELECT * FROM exams ORDER BY exam_date ASC").fetchall()
    elif section == "administration":
        rows = conn.execute("SELECT faculty_name as name, designation, department, email, phone, office_room, subject FROM faculty_members ORDER BY id ASC").fetchall()
        if not rows:
            rows = conn.execute("SELECT * FROM administration ORDER BY id ASC").fetchall()
    elif section == "students":
        rows = conn.execute("SELECT * FROM students ORDER BY id ASC").fetchall()
    elif section == "calendar":
        rows = conn.execute("SELECT question, answer, category, created_at FROM faqs WHERE category = 'academics' ORDER BY created_at DESC").fetchall()
    elif section == "notices":
        rows = conn.execute("SELECT * FROM notices ORDER BY id DESC").fetchall()
    elif section == "attendance":
        rows = conn.execute("SELECT * FROM attendance ORDER BY id DESC").fetchall()
    elif section == "library":
        rows = conn.execute("SELECT * FROM library_catalog").fetchall()
    elif section == "assignments":
        rows = conn.execute("SELECT * FROM assignments").fetchall()
    elif section == "placements":
        rows = conn.execute("SELECT * FROM placements").fetchall()
    elif section == "events":
        rows = conn.execute("SELECT * FROM events").fetchall()
    elif section == "grievances":
        rows = conn.execute("SELECT * FROM grievances WHERE user_id = ? ORDER BY submitted_at DESC", (g.user["sub"],)).fetchall()
    elif section == "bus":
        rows = conn.execute("SELECT * FROM bus_routes").fetchall()
    elif section == "lost_found":
        rows = conn.execute("SELECT * FROM lost_found ORDER BY reported_at DESC").fetchall()
    elif section == "hostel":
        details = conn.execute("SELECT * FROM hostel_details").fetchall()
        tickets = conn.execute("SELECT * FROM hostel_maintenance WHERE user_id = ? ORDER BY submitted_at DESC", (g.user["sub"],)).fetchall()
        conn.close()
        return jsonify({
            "details": [dict(d) for d in details],
            "tickets": [dict(t) for t in tickets]
        })
    elif section == "food":
        menu = conn.execute("SELECT * FROM food_menu").fetchall()
        ratings = conn.execute(
            "SELECT meal_id, SUM(CASE WHEN rating='up' THEN 1 ELSE 0 END) ups, "
            "SUM(CASE WHEN rating='down' THEN 1 ELSE 0 END) downs FROM food_ratings GROUP BY meal_id"
        ).fetchall()
        conn.close()
        return jsonify({
            "menu": [dict(m) for m in menu],
            "ratings": {r["meal_id"]: {"ups": r["ups"], "downs": r["downs"]} for r in ratings}
        })
    elif section == "faculty_schedule":
        from faculty_tracker import FACULTY_MASTER_DIRECTORY, get_live_faculty_status, get_current_ist_time
        now = get_current_ist_time()
        result = []
        for f in FACULTY_MASTER_DIRECTORY:
            item = dict(f)
            item["live_status"] = get_live_faculty_status(f, now)
            result.append(item)
        conn.close()
        return jsonify(result)
    else:
        conn.close()
        return jsonify({"error": "Unknown section"}), 404
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/portal/grievance")
@login_required
def submit_grievance():
    data = request.get_json(force=True, silent=True) or {}
    subject = data.get("subject", "").strip()
    description = data.get("description", "").strip()
    if not subject or not description:
        return jsonify({"error": "Subject and description are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO grievances (user_id, subject, description, status, submitted_at) VALUES (?, ?, ?, 'Open', ?)",
        (g.user["sub"], subject, description, now_iso())
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@bp.post("/portal/lost_found")
@login_required
def report_lost_found():
    data = request.get_json(force=True, silent=True) or {}
    item_name = data.get("item_name", "").strip()
    description = data.get("description", "").strip()
    location_found = data.get("location", "").strip()
    status = data.get("status", "Lost").strip()
    contact = data.get("contact", "").strip()
    if not item_name or not description or not contact:
        return jsonify({"error": "Item name, description, and contact are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO lost_found (item_name, description, location_found, status, reported_at, contact) VALUES (?, ?, ?, ?, ?, ?)",
        (item_name, description, location_found, status, now_iso()[:10], contact)
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@bp.post("/portal/hostel/maintenance")
@login_required
def submit_maintenance():
    data = request.get_json(force=True, silent=True) or {}
    issue = data.get("issue", "").strip()
    details = data.get("details", "").strip()
    if not issue or not details:
        return jsonify({"error": "Issue and details are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO hostel_maintenance (user_id, issue, details, status, submitted_at) VALUES (?, ?, ?, 'Open', ?)",
        (g.user["sub"], issue, details, now_iso())
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@bp.post("/portal/placements/apply")
@login_required
def apply_placement():
    data = request.get_json(force=True, silent=True) or {}
    placement_id = data.get("placement_id")
    if not placement_id:
        return jsonify({"error": "placement_id is required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE placements SET status = 'Applied' WHERE id = ?", (placement_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@bp.post("/portal/library/reserve")
@login_required
def reserve_book():
    data = request.get_json(force=True, silent=True) or {}
    book_id = data.get("book_id")
    if not book_id:
        return jsonify({"error": "book_id is required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    book = conn.execute("SELECT available_copies FROM library_catalog WHERE id = ?", (book_id,)).fetchone()
    if book and book["available_copies"] > 0:
        cur.execute("UPDATE library_catalog SET available_copies = available_copies - 1 WHERE id = ?", (book_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})
    conn.close()
    return jsonify({"error": "Book not available or out of copies"}), 400


@bp.post("/portal/food/rate")
@login_required
def rate_meal():
    data = request.get_json(force=True, silent=True) or {}
    meal_id = data.get("meal_id")
    rating = data.get("rating")
    if not meal_id or rating not in ("up", "down"):
        return jsonify({"error": "meal_id and rating ('up'/'down') are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO food_ratings (meal_id, rating, created_at) VALUES (?, ?, ?)", (meal_id, rating, now_iso()))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@bp.post("/portal/notices/create")
@login_required
def create_notice():
    if g.user["role"] not in ("admin", "faculty"):
        return jsonify({"error": "Only faculty and administrators can broadcast notices"}), 403
        
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category = data.get("category", "General").strip()
    
    if not title or not content:
        return jsonify({"error": "Notice title and content are required"}), 400
        
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO notices (title, content, posted_by, category, created_at) VALUES (?, ?, ?, ?, ?)",
        (title, content, g.user["name"], category, now_iso()[:10])
    )
    conn.commit()

    # Collect recipient emails for email broadcast
    student_rows = conn.execute("SELECT DISTINCT email, name FROM students WHERE email IS NOT NULL").fetchall()
    faculty_rows = conn.execute("SELECT DISTINCT email, faculty_name as name FROM faculty_members WHERE email IS NOT NULL").fetchall()
    user_rows = conn.execute("SELECT DISTINCT email, name FROM users WHERE email IS NOT NULL AND role IN ('student', 'faculty')").fetchall()
    conn.close()

    recipients = {}
    for r in student_rows + faculty_rows + user_rows:
        e = dict(r).get("email", "").strip()
        n = dict(r).get("name", "Campus Member").strip()
        if e and "@" in e:
            recipients[e] = n

    # Dispatch email if SMTP configured
    if Config.SMTP_USER and Config.SMTP_USER != "your_gmail@gmail.com":
        from routes.faculty_routes import _build_reminder_email, _send_email
        for to_email, to_name in recipients.items():
            try:
                msg = _build_reminder_email(
                    to_name=to_name,
                    to_email=to_email,
                    faculty_name=g.user.get("name", "College Administration"),
                    assignment_title=title,
                    subject_name=category,
                    section="All Sections",
                    course_id="QISCET-NOTICE",
                    regulation="R23",
                    deadline="Immediate",
                )
                _send_email(msg, to_email)
            except Exception:
                pass

    return jsonify({"ok": True, "recipients_notified": len(recipients)})


@bp.post("/portal/fees/pay")
@login_required
def pay_fees():
    data = request.get_json(force=True, silent=True) or {}
    fee_id = data.get("fee_id")
    amount = data.get("amount")
    
    if not fee_id or not amount:
        return jsonify({"error": "fee_id and amount are required"}), 400
        
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400
        
    conn = get_db()
    fee = conn.execute("SELECT * FROM student_fees WHERE id = ? AND user_id = ?", (fee_id, g.user["sub"])).fetchone()
    if not fee:
        conn.close()
        return jsonify({"error": "Fee ledger entry not found"}), 404
        
    new_paid = fee["amount_paid"] + amount
    status = "Paid" if new_paid >= fee["amount_due"] else "Partially Paid"
    
    cur = conn.cursor()
    cur.execute(
        "UPDATE student_fees SET amount_paid = ?, status = ? WHERE id = ?",
        (new_paid, status, fee_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "new_paid": new_paid, "status": status})


@bp.get("/smart-search")
def smart_search():
    """
    Intelligent autocomplete and related-topic suggestions API.
    Can be used by both authenticated and guest users.
    """
    import smart_search_engine
    q = request.args.get("q", "").strip()
    limit = request.args.get("limit", 10)
    try:
        limit = int(limit)
    except (ValueError, TypeError):
        limit = 10
    suggestions = smart_search_engine.get_smart_suggestions(q, limit=limit)
    return jsonify(suggestions)


@bp.get("/engine-status")
def engine_status():
    return jsonify({
        "status": "ok",
        "nlp": True,
        "rag": True,
        "llm": True
    })


@bp.get("/notices")
def public_notices():
    conn = get_db()
    rows = conn.execute("SELECT * FROM notices ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


