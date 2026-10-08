import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

import rag_engine
import nlp_engine
import llm_router
from auth import roles_required
from config import Config
from database import get_db, now_iso

bp = Blueprint("admin_routes", __name__, url_prefix="/api/admin")

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


# ---------------------------------------------------------------- Documents
@bp.get("/docs")
@roles_required("admin")
def list_docs():
    return jsonify(rag_engine.list_documents())


@bp.post("/docs")
@roles_required("admin")
def upload_doc():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Unsupported file type '{ext}'. Use PDF, TXT, or MD."}), 400

    os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
    filename = secure_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_DIR, filename)
    file.save(filepath)

    try:
        chunk_count = rag_engine.add_document(filename, filepath)
    except Exception as exc:  # embedding/model errors, corrupt PDFs, etc.
        os.remove(filepath)
        return jsonify({
            "error": "Could not index this document. If this is the first upload, the "
                     "embedding model may need to download from Hugging Face — check the "
                     "server's internet access and try again.",
            "detail": str(exc),
        }), 502

    return jsonify({"filename": filename, "chunks_indexed": chunk_count}), 201


@bp.delete("/docs/<filename>")
@roles_required("admin")
def delete_doc(filename):
    rag_engine.delete_document(filename)
    filepath = os.path.join(Config.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    return jsonify({"ok": True})


# ---------------------------------------------------------------- FAQs
@bp.get("/faqs")
@roles_required("admin")
def list_faqs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM faqs ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/faqs")
@roles_required("admin")
def create_faq():
    data = request.get_json(force=True, silent=True) or {}
    question, answer = data.get("question", "").strip(), data.get("answer", "").strip()
    category = data.get("category", "general")
    if not question or not answer:
        return jsonify({"error": "question and answer are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO faqs (question, answer, category, created_at) VALUES (?,?,?,?)",
                (question, answer, category, now_iso()))
    conn.commit()
    faq_id = cur.lastrowid
    conn.close()
    return jsonify({"id": faq_id}), 201


@bp.delete("/faqs/<int:faq_id>")
@roles_required("admin")
def delete_faq(faq_id):
    conn = get_db()
    conn.execute("DELETE FROM faqs WHERE id = ?", (faq_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# ---------------------------------------------------------------- Logs
@bp.get("/logs")
@roles_required("admin")
def logs():
    conn = get_db()
    rows = conn.execute(
        "SELECT chats.*, users.name as user_name, users.email as user_email "
        "FROM chats JOIN users ON users.id = chats.user_id "
        "ORDER BY chats.created_at DESC LIMIT 500"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ---------------------------------------------------------------- Analytics
@bp.get("/analytics")
@roles_required("admin")
def analytics():
    conn = get_db()
    total_chats = conn.execute("SELECT COUNT(*) c FROM chats").fetchone()["c"]
    total_users = conn.execute("SELECT COUNT(*) c FROM users").fetchone()["c"]
    flagged = conn.execute("SELECT COUNT(*) c FROM chats WHERE flagged = 1").fetchone()["c"]
    thumbs_down = conn.execute("SELECT COUNT(*) c FROM feedback WHERE rating = 'down'").fetchone()["c"]
    thumbs_up = conn.execute("SELECT COUNT(*) c FROM feedback WHERE rating = 'up'").fetchone()["c"]

    source_rows = conn.execute("SELECT source, COUNT(*) c FROM chats GROUP BY source").fetchall()
    source_mix = {r["source"]: r["c"] for r in source_rows}

    intent_rows = conn.execute("SELECT intent, COUNT(*) c FROM chats GROUP BY intent ORDER BY c DESC").fetchall()
    intent_mix = [{"intent": r["intent"] or "general", "count": r["c"]} for r in intent_rows]

    all_queries = [r["query"] for r in conn.execute("SELECT query FROM chats").fetchall()]
    top_keywords = nlp_engine.extract_top_keywords(all_queries)

    frustrated_count = conn.execute("SELECT COUNT(*) c FROM chats WHERE frustrated = 1").fetchone()["c"]
    conn.close()

    return jsonify({
        "total_chats": total_chats,
        "total_users": total_users,
        "flagged": flagged,
        "thumbs_up": thumbs_up,
        "thumbs_down": thumbs_down,
        "frustrated_count": frustrated_count,
        "source_mix": source_mix,
        "intent_mix": intent_mix,
        "top_keywords": [{"word": w, "count": c} for w, c in top_keywords],
    })


# ---------------------------------------------------------------- Engine status
@bp.get("/engine-status")
@roles_required("admin")
def engine_status():
    return jsonify(llm_router.get_engine_status())


# ---------------------------------------------------------------- 1. Student Information
@bp.get("/students")
@roles_required("admin")
def list_students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY roll_number ASC, id ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/students")
@roles_required("admin")
def create_student():
    data = request.get_json(force=True, silent=True) or {}
    name = str(data.get("name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    department = str(data.get("department", "")).strip()
    year_semester = str(data.get("year_semester", "")).strip()
    section = str(data.get("section", "")).strip().upper()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()

    if not name or not roll_number or not department or not year_semester or not section:
        return jsonify({"error": "Student Name, Roll Number, Department, Year/Semester, and Section are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM students WHERE roll_number = ?", (roll_number,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": f"Student with Roll Number '{roll_number}' already exists."}), 400

    cur = conn.cursor()
    cur.execute(
        "INSERT INTO students (name, roll_number, department, year_semester, section, email, phone, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (name, roll_number, department, year_semester, section, email, phone, now_iso())
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Student created successfully"}), 201


@bp.put("/students/<int:student_id>")
@roles_required("admin")
def update_student(student_id):
    data = request.get_json(force=True, silent=True) or {}
    name = str(data.get("name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    department = str(data.get("department", "")).strip()
    year_semester = str(data.get("year_semester", "")).strip()
    section = str(data.get("section", "")).strip().upper()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()

    if not name or not roll_number or not department or not year_semester or not section:
        return jsonify({"error": "Student Name, Roll Number, Department, Year/Semester, and Section are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM students WHERE id = ?", (student_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Student record not found"}), 404

    # Check roll number uniqueness for other students
    conflict = conn.execute("SELECT id FROM students WHERE roll_number = ? AND id != ?", (roll_number, student_id)).fetchone()
    if conflict:
        conn.close()
        return jsonify({"error": f"Another student already has Roll Number '{roll_number}'"}), 400

    conn.execute(
        "UPDATE students SET name=?, roll_number=?, department=?, year_semester=?, section=?, email=?, phone=? WHERE id=?",
        (name, roll_number, department, year_semester, section, email, phone, student_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Student updated successfully"})


@bp.delete("/students/<int:student_id>")
@roles_required("admin")
def delete_student(student_id):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Student deleted successfully"})


# ---------------------------------------------------------------- 2. Fee Details
@bp.get("/fees")
@roles_required("admin")
def list_fees():
    conn = get_db()
    rows = conn.execute("SELECT * FROM student_fees ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/fees")
@roles_required("admin")
def create_fee():
    data = request.get_json(force=True, silent=True) or {}
    student_name = str(data.get("student_name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    fee_type = str(data.get("fee_type", "")).strip()
    
    try:
        total_fee = float(data.get("total_fee", 0))
        paid_amount = float(data.get("paid_amount", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Total Fee and Paid Amount must be valid numbers"}), 400

    if not student_name or not roll_number or not fee_type:
        return jsonify({"error": "Student Name, Roll Number, and Fee Type are required"}), 400

    pending_amount = max(0.0, total_fee - paid_amount)
    status = data.get("status")
    if not status:
        if paid_amount >= total_fee and total_fee > 0:
            status = "Paid"
        elif paid_amount > 0:
            status = "Partially Paid"
        else:
            status = "Unpaid"

    due_date = data.get("due_date", "")

    conn = get_db()
    # Find user_id if matching student exists
    user_row = conn.execute("SELECT id FROM users WHERE email LIKE ? OR name LIKE ?", (f"%{roll_number}%", f"%{student_name}%")).fetchone()
    user_id = user_row["id"] if user_row else 2

    cur = conn.cursor()
    cur.execute(
        """INSERT INTO student_fees 
           (user_id, student_name, roll_number, fee_type, total_fee, paid_amount, pending_amount, amount_due, amount_paid, status, due_date, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (user_id, student_name, roll_number, fee_type, total_fee, paid_amount, pending_amount, total_fee, paid_amount, status, due_date, now_iso())
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Fee record added successfully"}), 201


@bp.put("/fees/<int:fee_id>")
@roles_required("admin")
def update_fee(fee_id):
    data = request.get_json(force=True, silent=True) or {}
    student_name = str(data.get("student_name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    fee_type = str(data.get("fee_type", "")).strip()

    try:
        total_fee = float(data.get("total_fee", 0))
        paid_amount = float(data.get("paid_amount", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Total Fee and Paid Amount must be valid numbers"}), 400

    if not student_name or not roll_number or not fee_type:
        return jsonify({"error": "Student Name, Roll Number, and Fee Type are required"}), 400

    pending_amount = max(0.0, total_fee - paid_amount)
    status = data.get("status")
    if not status:
        if paid_amount >= total_fee and total_fee > 0:
            status = "Paid"
        elif paid_amount > 0:
            status = "Partially Paid"
        else:
            status = "Unpaid"

    due_date = data.get("due_date", "")

    conn = get_db()
    existing = conn.execute("SELECT id FROM student_fees WHERE id = ?", (fee_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Fee record not found"}), 404

    conn.execute(
        """UPDATE student_fees 
           SET student_name=?, roll_number=?, fee_type=?, total_fee=?, paid_amount=?, pending_amount=?, amount_due=?, amount_paid=?, status=?, due_date=?
           WHERE id=?""",
        (student_name, roll_number, fee_type, total_fee, paid_amount, pending_amount, total_fee, paid_amount, status, due_date, fee_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Fee record updated successfully"})


@bp.delete("/fees/<int:fee_id>")
@roles_required("admin")
def delete_fee(fee_id):
    conn = get_db()
    conn.execute("DELETE FROM student_fees WHERE id = ?", (fee_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Fee record deleted successfully"})


# ---------------------------------------------------------------- 3. Attendance
@bp.get("/attendance")
@roles_required("admin")
def list_attendance():
    conn = get_db()
    rows = conn.execute("SELECT * FROM attendance ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/attendance")
@roles_required("admin")
def create_attendance():
    data = request.get_json(force=True, silent=True) or {}
    student_name = str(data.get("student_name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    subject = str(data.get("subject", "")).strip()

    try:
        total_classes = int(data.get("total_classes", 0))
        attended_classes = int(data.get("attended_classes", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Total Classes and Attended Classes must be valid integers"}), 400

    if not subject:
        return jsonify({"error": "Subject is required"}), 400

    if not student_name:
        student_name = "Asha Rao"
    if not roll_number:
        roll_number = "24491A4225"

    percentage = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 0.0
    grade_points = 10 if percentage >= 90 else (9 if percentage >= 80 else (8 if percentage >= 70 else 7))

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO attendance 
           (user_id, student_name, roll_number, subject, attended_classes, total_classes, percentage, grade_points, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (2, student_name, roll_number, subject, attended_classes, total_classes, percentage, grade_points, now_iso())
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Attendance record created successfully"}), 201


@bp.put("/attendance/<int:att_id>")
@roles_required("admin")
def update_attendance(att_id):
    data = request.get_json(force=True, silent=True) or {}
    student_name = str(data.get("student_name", "")).strip()
    roll_number = str(data.get("roll_number", "")).strip().upper()
    subject = str(data.get("subject", "")).strip()

    try:
        total_classes = int(data.get("total_classes", 0))
        attended_classes = int(data.get("attended_classes", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Total Classes and Attended Classes must be valid integers"}), 400

    if not subject:
        return jsonify({"error": "Subject is required"}), 400

    percentage = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 0.0
    grade_points = 10 if percentage >= 90 else (9 if percentage >= 80 else (8 if percentage >= 70 else 7))

    conn = get_db()
    existing = conn.execute("SELECT id FROM attendance WHERE id = ?", (att_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Attendance record not found"}), 404

    conn.execute(
        """UPDATE attendance 
           SET student_name=?, roll_number=?, subject=?, attended_classes=?, total_classes=?, percentage=?, grade_points=?, updated_at=?
           WHERE id=?""",
        (student_name, roll_number, subject, attended_classes, total_classes, percentage, grade_points, now_iso(), att_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Attendance updated successfully"})


@bp.delete("/attendance/<int:att_id>")
@roles_required("admin")
def delete_attendance(att_id):
    conn = get_db()
    conn.execute("DELETE FROM attendance WHERE id = ?", (att_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Attendance record deleted successfully"})


# ---------------------------------------------------------------- 4. Notices
@bp.get("/notices")
@roles_required("admin")
def list_notices():
    conn = get_db()
    rows = conn.execute("SELECT * FROM notices ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/notices")
@roles_required("admin")
def create_notice():
    data = request.get_json(force=True, silent=True) or {}
    title = str(data.get("title", "")).strip()
    content = str(data.get("content", "")).strip()
    date = str(data.get("date", now_iso()[:10])).strip()
    department = str(data.get("department", "All Departments")).strip()
    category = str(data.get("category", "General")).strip()
    posted_by = str(data.get("posted_by", "Administration")).strip()
    attachment = str(data.get("attachment", "")).strip()

    if not title or not content:
        return jsonify({"error": "Notice Title and Notice Description are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO notices (title, content, date, department, category, posted_by, attachment, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (title, content, date, department, category, posted_by, attachment, now_iso())
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Notice published successfully"}), 201


@bp.put("/notices/<int:notice_id>")
@roles_required("admin")
def update_notice(notice_id):
    data = request.get_json(force=True, silent=True) or {}
    title = str(data.get("title", "")).strip()
    content = str(data.get("content", "")).strip()
    date = str(data.get("date", now_iso()[:10])).strip()
    department = str(data.get("department", "All Departments")).strip()
    category = str(data.get("category", "General")).strip()
    posted_by = str(data.get("posted_by", "Administration")).strip()
    attachment = str(data.get("attachment", "")).strip()

    if not title or not content:
        return jsonify({"error": "Notice Title and Notice Description are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM notices WHERE id = ?", (notice_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Notice not found"}), 404

    conn.execute(
        "UPDATE notices SET title=?, content=?, date=?, department=?, category=?, posted_by=?, attachment=? WHERE id=?",
        (title, content, date, department, category, posted_by, attachment, notice_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Notice updated successfully"})


@bp.delete("/notices/<int:notice_id>")
@roles_required("admin")
def delete_notice(notice_id):
    conn = get_db()
    conn.execute("DELETE FROM notices WHERE id = ?", (notice_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Notice deleted successfully"})


# ---------------------------------------------------------------- 5. Timetable
@bp.get("/timetable")
@roles_required("admin")
def list_timetable():
    conn = get_db()
    rows = conn.execute("SELECT * FROM student_timetable ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/timetable")
@roles_required("admin")
def create_timetable_entry():
    data = request.get_json(force=True, silent=True) or {}
    day = str(data.get("day", data.get("day_of_week", ""))).strip()
    period = str(data.get("period", data.get("period_time", ""))).strip()
    subject = str(data.get("subject", "")).strip()
    faculty = str(data.get("faculty", "")).strip()
    room = str(data.get("room", "")).strip()
    section = str(data.get("section", "")).strip().upper()
    department = str(data.get("department", data.get("branch", "CSE"))).strip()
    year_semester = str(data.get("year_semester", data.get("year", "3-1"))).strip()
    subject_type = str(data.get("subject_type", "Theory")).strip()

    if not day or not period or not subject or not faculty or not room or not section:
        return jsonify({"error": "Day, Period, Subject, Faculty, Room Number, and Section are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO student_timetable 
           (day, day_of_week, period, period_no, period_time, subject, subject_code, faculty, room, section, branch, department, year, year_semester, batch_info, subject_type)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (day, day, period, 1, period, subject, "", faculty, room, section, department, department, year_semester, year_semester, "All", subject_type)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Timetable slot added successfully"}), 201


@bp.put("/timetable/<int:tt_id>")
@roles_required("admin")
def update_timetable_entry(tt_id):
    data = request.get_json(force=True, silent=True) or {}
    day = str(data.get("day", data.get("day_of_week", ""))).strip()
    period = str(data.get("period", data.get("period_time", ""))).strip()
    subject = str(data.get("subject", "")).strip()
    faculty = str(data.get("faculty", "")).strip()
    room = str(data.get("room", "")).strip()
    section = str(data.get("section", "")).strip().upper()
    department = str(data.get("department", data.get("branch", "CSE"))).strip()
    year_semester = str(data.get("year_semester", data.get("year", "3-1"))).strip()
    subject_type = str(data.get("subject_type", "Theory")).strip()

    if not day or not period or not subject or not faculty or not room or not section:
        return jsonify({"error": "Day, Period, Subject, Faculty, Room Number, and Section are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM student_timetable WHERE id = ?", (tt_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Timetable record not found"}), 404

    conn.execute(
        """UPDATE student_timetable 
           SET day=?, day_of_week=?, period=?, period_time=?, subject=?, faculty=?, room=?, section=?, branch=?, department=?, year=?, year_semester=?, subject_type=?
           WHERE id=?""",
        (day, day, period, period, subject, faculty, room, section, department, department, year_semester, year_semester, subject_type, tt_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Timetable slot updated successfully"})


@bp.delete("/timetable/<int:tt_id>")
@roles_required("admin")
def delete_timetable_entry(tt_id):
    conn = get_db()
    conn.execute("DELETE FROM student_timetable WHERE id = ?", (tt_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Timetable slot deleted successfully"})


# ---------------------------------------------------------------- 6. Faculty Information
@bp.get("/faculty")
@roles_required("admin")
def list_faculty():
    conn = get_db()
    rows = conn.execute("SELECT * FROM faculty_members ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.post("/faculty")
@roles_required("admin")
def create_faculty():
    data = request.get_json(force=True, silent=True) or {}
    faculty_name = str(data.get("faculty_name", data.get("name", ""))).strip()
    faculty_id = str(data.get("faculty_id", "")).strip().upper()
    department = str(data.get("department", "")).strip()
    designation = str(data.get("designation", "")).strip()
    subject = str(data.get("subject", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    office_room = str(data.get("office_room", data.get("room", ""))).strip()

    if not faculty_name or not faculty_id or not department or not designation or not subject or not email:
        return jsonify({"error": "Faculty Name, Faculty ID, Department, Designation, Subject, and Email are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM faculty_members WHERE faculty_id = ?", (faculty_id,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": f"Faculty member with ID '{faculty_id}' already exists."}), 400

    cur = conn.cursor()
    cur.execute(
        """INSERT INTO faculty_members 
           (faculty_id, faculty_name, department, designation, subject, email, phone, office_room, created_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (faculty_id, faculty_name, department, designation, subject, email, phone, office_room, now_iso())
    )
    # Also sync into administration table for legacy lookups
    conn.execute(
        "INSERT OR IGNORE INTO administration (name, designation, department, email, phone) VALUES (?,?,?,?,?)",
        (faculty_name, designation, department, email, phone)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Faculty member added successfully"}), 201


@bp.put("/faculty/<int:fac_id>")
@roles_required("admin")
def update_faculty(fac_id):
    data = request.get_json(force=True, silent=True) or {}
    faculty_name = str(data.get("faculty_name", data.get("name", ""))).strip()
    faculty_id = str(data.get("faculty_id", "")).strip().upper()
    department = str(data.get("department", "")).strip()
    designation = str(data.get("designation", "")).strip()
    subject = str(data.get("subject", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    office_room = str(data.get("office_room", data.get("room", ""))).strip()

    if not faculty_name or not faculty_id or not department or not designation or not subject or not email:
        return jsonify({"error": "Faculty Name, Faculty ID, Department, Designation, Subject, and Email are required"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM faculty_members WHERE id = ?", (fac_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Faculty record not found"}), 404

    # Check ID conflict
    conflict = conn.execute("SELECT id FROM faculty_members WHERE faculty_id = ? AND id != ?", (faculty_id, fac_id)).fetchone()
    if conflict:
        conn.close()
        return jsonify({"error": f"Another faculty member already has ID '{faculty_id}'"}), 400

    conn.execute(
        """UPDATE faculty_members 
           SET faculty_id=?, faculty_name=?, department=?, designation=?, subject=?, email=?, phone=?, office_room=?
           WHERE id=?""",
        (faculty_id, faculty_name, department, designation, subject, email, phone, office_room, fac_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Faculty updated successfully"})


@bp.delete("/faculty/<int:fac_id>")
@roles_required("admin")
def delete_faculty(fac_id):
    conn = get_db()
    conn.execute("DELETE FROM faculty_members WHERE id = ?", (fac_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "message": "Faculty deleted successfully"})


# ---------------------------------------------------------------- Administration Directory (Legacy Alias)
@bp.get("/directory")
@roles_required("admin")
def list_directory():
    conn = get_db()
    rows = conn.execute("SELECT * FROM faculty_members ORDER BY id ASC").fetchall()
    if not rows:
        rows = conn.execute("SELECT * FROM administration ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ---------------------------------------------------------------- Bulk CSV / Text Import
@bp.post("/bulk-import/<domain>")
@roles_required("admin")
def bulk_import(domain):
    """
    Accepts CSV or Excel (.xlsx/.xls) file upload, or raw CSV text to bulk insert/update records.
    Domains supported: students, fees, attendance, notices, timetable, faculty, faqs
    """
    import csv
    import io

    rows_raw = []  # will hold list of dicts

    if "file" in request.files:
        file = request.files["file"]
        fname = (file.filename or "").lower()

        if fname.endswith((".xlsx", ".xls")):
            # ── Excel path ────────────────────────────────────────
            try:
                import openpyxl
            except ImportError:
                return jsonify({"error": "openpyxl not installed. Run: pip install openpyxl"}), 500
            try:
                wb = openpyxl.load_workbook(io.BytesIO(file.read()), data_only=True)
                ws = wb.active
                headers = [str(cell.value).strip() if cell.value is not None else "" for cell in next(ws.iter_rows(min_row=1, max_row=1))]
                for row in ws.iter_rows(min_row=2, values_only=True):
                    row_dict = {}
                    for h, v in zip(headers, row):
                        row_dict[h] = str(v).strip() if v is not None else ""
                    if any(v for v in row_dict.values()):
                        rows_raw.append(row_dict)
            except Exception as exc:
                return jsonify({"error": f"Failed to parse Excel file: {str(exc)}"}), 400
        else:
            # ── CSV path ──────────────────────────────────────────
            csv_text = file.read().decode("utf-8", errors="ignore")
            if not csv_text.strip():
                return jsonify({"error": "Uploaded CSV file is empty"}), 400
            reader = csv.DictReader(io.StringIO(csv_text.strip()))
            rows_raw = [dict(r) for r in reader]
    else:
        data = request.get_json(force=True, silent=True) or {}
        csv_text = data.get("csv_text", "")
        if not csv_text.strip():
            return jsonify({"error": "No CSV content or file provided"}), 400
        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        rows_raw = [dict(r) for r in reader]

    if not rows_raw:
        return jsonify({"error": "No data rows found in the uploaded file"}), 400

    conn = get_db()
    cur = conn.cursor()
    inserted_count = 0

    try:
        for row in rows_raw:

            if domain == "students":
                name = (row.get("name") or row.get("Student Name") or "").strip()
                roll = (row.get("roll_number") or row.get("Roll Number") or "").strip().upper()
                dept = (row.get("department") or row.get("Department") or "Computer Science & Engineering").strip()
                sem = (row.get("year_semester") or row.get("Year/Semester") or "3rd Year - 1st Sem").strip()
                sec = (row.get("section") or row.get("Section") or "CSE-A").strip().upper()
                email = (row.get("email") or row.get("Email") or f"{roll.lower()}@qiscet.edu.in").strip()
                phone = (row.get("phone") or row.get("Phone") or "").strip()
                if name and roll:
                    cur.execute(
                        "INSERT OR REPLACE INTO students (name, roll_number, department, year_semester, section, email, phone, created_at) "
                        "VALUES (?,?,?,?,?,?,?,?)",
                        (name, roll, dept, sem, sec, email, phone, now_iso())
                    )
                    inserted_count += 1

            elif domain == "fees":
                sname = (row.get("student_name") or row.get("Student Name") or "").strip()
                roll = (row.get("roll_number") or row.get("Roll Number") or "").strip().upper()
                ftype = (row.get("fee_type") or row.get("Fee Type") or "Tuition Fee").strip()
                total = float(row.get("total_fee") or row.get("Total Fee") or 0)
                paid = float(row.get("paid_amount") or row.get("Paid Amount") or 0)
                pending = max(0.0, total - paid)
                status = "Paid" if paid >= total and total > 0 else ("Partially Paid" if paid > 0 else "Unpaid")
                if sname or roll:
                    cur.execute(
                        """INSERT INTO student_fees 
                           (user_id, student_name, roll_number, fee_type, total_fee, paid_amount, pending_amount, amount_due, amount_paid, status, created_at)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                        (2, sname, roll, ftype, total, paid, pending, total, paid, status, now_iso())
                    )
                    inserted_count += 1

            elif domain == "attendance":
                sname = (row.get("student_name") or row.get("Student Name") or "").strip()
                roll = (row.get("roll_number") or row.get("Roll Number") or "").strip().upper()
                subj = (row.get("subject") or row.get("Subject") or "").strip()
                tot = int(row.get("total_classes") or row.get("Total Classes") or 0)
                att = int(row.get("attended_classes") or row.get("Attended Classes") or 0)
                pct = round((att / tot * 100), 1) if tot > 0 else 0.0
                gp = 10 if pct >= 90 else (9 if pct >= 80 else (8 if pct >= 70 else 7))
                if subj:
                    cur.execute(
                        """INSERT INTO attendance 
                           (user_id, student_name, roll_number, subject, attended_classes, total_classes, percentage, grade_points, updated_at)
                           VALUES (?,?,?,?,?,?,?,?,?)""",
                        (2, sname, roll, subj, att, tot, pct, gp, now_iso())
                    )
                    inserted_count += 1

            elif domain == "notices":
                title = (row.get("title") or row.get("Notice Title") or "").strip()
                content = (row.get("content") or row.get("Notice Description") or "").strip()
                dept = (row.get("department") or row.get("Department") or "All Departments").strip()
                cat = (row.get("category") or row.get("Category") or "General").strip()
                if title and content:
                    cur.execute(
                        "INSERT INTO notices (title, content, date, department, category, posted_by, created_at) VALUES (?,?,?,?,?,?,?)",
                        (title, content, now_iso()[:10], dept, cat, "Administration", now_iso())
                    )
                    inserted_count += 1

            elif domain == "timetable":
                day = (row.get("day") or row.get("Day") or "Monday").strip()
                period = (row.get("period") or row.get("Period") or "09:30 AM - 10:30 AM").strip()
                subj = (row.get("subject") or row.get("Subject") or "").strip()
                fac = (row.get("faculty") or row.get("Faculty") or "").strip()
                room = (row.get("room") or row.get("Room Number") or "").strip()
                sec = (row.get("section") or row.get("Section") or "CSE-A").strip().upper()
                if subj and fac:
                    cur.execute(
                        """INSERT INTO student_timetable 
                           (day, day_of_week, period, period_no, period_time, subject, faculty, room, section, branch, department, year, year_semester)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (day, day, period, 1, period, subj, fac, room, sec, "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem")
                    )
                    inserted_count += 1

            elif domain == "faculty":
                fname = (row.get("faculty_name") or row.get("Faculty Name") or "").strip()
                fid = (row.get("faculty_id") or row.get("Faculty ID") or "").strip().upper()
                dept = (row.get("department") or row.get("Department") or "Computer Science & Engineering").strip()
                desig = (row.get("designation") or row.get("Designation") or "Assistant Professor").strip()
                subj = (row.get("subject") or row.get("Subject") or "").strip()
                email = (row.get("email") or row.get("Email") or "").strip()
                phone = (row.get("phone") or row.get("Phone") or "").strip()
                room = (row.get("office_room") or row.get("Room Number") or "").strip()
                if fname and fid:
                    cur.execute(
                        """INSERT OR REPLACE INTO faculty_members 
                           (faculty_id, faculty_name, department, designation, subject, email, phone, office_room, created_at)
                           VALUES (?,?,?,?,?,?,?,?,?)""",
                        (fid, fname, dept, desig, subj, email, phone, room, now_iso())
                    )
                    inserted_count += 1

            elif domain == "faqs":
                q = (row.get("question") or row.get("Question") or "").strip()
                a = (row.get("answer") or row.get("Answer") or "").strip()
                cat = (row.get("category") or row.get("Category") or "general").strip()
                if q and a:
                    cur.execute(
                        "INSERT INTO faqs (question, answer, category, created_at) VALUES (?,?,?,?)",
                        (q, a, cat, now_iso())
                    )
                    inserted_count += 1

        conn.commit()
    except Exception as exc:
        conn.close()
        return jsonify({"error": f"Failed to parse CSV file: {str(exc)}"}), 400

    conn.close()
    return jsonify({"success": True, "inserted_count": inserted_count, "message": f"Successfully imported {inserted_count} records into {domain}"}), 200


# ---------------------------------------------------------------- Bulk Multi-Delete
@bp.post("/bulk-delete/<domain>")
@roles_required("admin")
def bulk_delete(domain):
    """
    Accepts a list of IDs (or filenames for docs) to delete multiple records in a single transaction.
    """
    data = request.get_json(force=True, silent=True) or {}
    ids = data.get("ids", [])

    if not ids or not isinstance(ids, list):
        return jsonify({"error": "A non-empty 'ids' list is required"}), 400

    conn = get_db()
    deleted_count = 0

    try:
        if domain == "students":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM students WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "fees":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM student_fees WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "attendance":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM attendance WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "notices":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM notices WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "timetable":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM student_timetable WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "faculty":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM faculty_members WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "faqs":
            placeholders = ",".join("?" for _ in ids)
            cur = conn.execute(f"DELETE FROM faqs WHERE id IN ({placeholders})", ids)
            deleted_count = cur.rowcount
        elif domain == "docs":
            for filename in ids:
                try:
                    rag_engine.delete_document(filename)
                except Exception:
                    pass
                filepath = os.path.join(Config.UPLOAD_DIR, filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                deleted_count += 1
        else:
            conn.close()
            return jsonify({"error": f"Unsupported domain '{domain}'"}), 400

        conn.commit()
    except Exception as exc:
        conn.close()
        return jsonify({"error": f"Failed to delete records: {str(exc)}"}), 500

    conn.close()
    return jsonify({"success": True, "deleted_count": deleted_count, "message": f"Successfully deleted {deleted_count} records from {domain}"}), 200


