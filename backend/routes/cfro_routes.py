import os
from flask import Blueprint, request, jsonify, g
from auth import login_required, roles_required
from database import get_db, now_iso

bp = Blueprint("cfro_routes", __name__, url_prefix="/api/cfro")


def _get_student_roll(email, dept, year):
    # Derive roll number from email or department/year
    if email and "@" in email:
        local_part = email.split("@")[0].upper()
        if any(c.isdigit() for c in local_part):
            return local_part
    dept_code = "".join([w[0] for w in (dept or "CSE").split()[:3]]).upper()
    return f"23QIS{dept_code}4082"


@bp.get("/dashboard")
@login_required
def get_dashboard():
    user_id = g.user["sub"]
    user_role = g.user["role"]
    conn = get_db()

    # If student, retrieve their specific summary
    target_user_id = user_id
    if user_role in ("admin", "cfro_staff") and request.args.get("student_id"):
        try:
            target_user_id = int(request.args.get("student_id"))
        except ValueError:
            pass

    user = conn.execute("SELECT id, name, email, role, department, year, college FROM users WHERE id = ?", (target_user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Fetch student fees breakdown
    fees_rows = conn.execute("SELECT * FROM student_fees WHERE user_id = ?", (target_user_id,)).fetchall()
    
    # If no student_fees exist, seed default fee breakdown for this student
    if not fees_rows:
        default_fees = [
            (target_user_id, "Tuition Fee", 45000.0, 45000.0, "Paid"),
            (target_user_id, "Examination Fee", 2500.0, 2500.0, "Paid"),
            (target_user_id, "Hostel Fee", 12000.0, 6000.0, "Partially Paid"),
            (target_user_id, "Transport Fee", 7500.0, 0.0, "Unpaid"),
            (target_user_id, "Library & Lab Fee", 3000.0, 3000.0, "Paid")
        ]
        conn.executemany(
            "INSERT INTO student_fees (user_id, fee_type, amount_due, amount_paid, status) VALUES (?,?,?,?,?)",
            default_fees
        )
        conn.commit()
        fees_rows = conn.execute("SELECT * FROM student_fees WHERE user_id = ?", (target_user_id,)).fetchall()

    fee_items = []
    total_due = 0.0
    total_paid = 0.0
    total_pending = 0.0

    for r in fees_rows:
        due = float(r["amount_due"])
        paid = float(r["amount_paid"])
        pending = max(0.0, due - paid)
        total_due += due
        total_paid += paid
        total_pending += pending
        fee_items.append({
            "id": r["id"],
            "fee_type": r["fee_type"],
            "amount_due": due,
            "amount_paid": paid,
            "pending_amount": pending,
            "status": r["status"]
        })

    overall_status = "Paid" if total_pending == 0 else ("Partially Paid" if total_paid > 0 else "Overdue")

    # Announcements
    announcements_rows = conn.execute(
        "SELECT * FROM cfro_announcements ORDER BY id DESC LIMIT 10"
    ).fetchall()
    announcements = [dict(a) for a in announcements_rows]

    # Deadlines
    deadlines = [
        {"id": 1, "fee_type": "Even Semester Tuition Fee (Final Installment)", "deadline": "2026-10-15", "penalty": "Rs. 100/day post due date", "status": "Upcoming"},
        {"id": 2, "fee_type": "Autonomous End Semester Exam Fee", "deadline": "2026-10-30", "penalty": "Late registration Rs. 500 up to Nov 05", "status": "Upcoming"},
        {"id": 3, "fee_type": "Hostel & Mess Maintenance Advance", "deadline": "2026-11-10", "penalty": "Subject to room status verification", "status": "Open"},
    ]

    # Payment statistics for staff view
    staff_summary = None
    if user_role in ("admin", "cfro_staff"):
        total_students = conn.execute("SELECT COUNT(*) c FROM users WHERE role = 'student'").fetchone()["c"]
        total_collections = conn.execute("SELECT SUM(amount) s FROM fee_payments WHERE status = 'Success'").fetchone()["s"] or 0.0
        staff_summary = {
            "total_registered_students": total_students,
            "total_collections": float(total_collections),
            "pending_reconciliations": 4
        }

    conn.close()

    roll_no = _get_student_roll(user["email"], user["department"], user["year"])

    return jsonify({
        "student_info": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "roll_no": roll_no,
            "department": user["department"] or "Computer Science & Engineering",
            "year": user["year"] or "3rd Year",
            "semester": "1st Semester (5th Sem)",
            "academic_year": "2026-2027",
            "college": user["college"] or "QIS College of Engineering and Technology"
        },
        "fee_summary": {
            "total_due": total_due,
            "total_paid": total_paid,
            "total_pending": total_pending,
            "payment_status": overall_status,
            "academic_year": "2026-2027",
            "semester": "1st Semester"
        },
        "fee_breakdown": fee_items,
        "deadlines": deadlines,
        "announcements": announcements,
        "staff_summary": staff_summary
    })


@bp.get("/structure")
@login_required
def get_fee_structure():
    conn = get_db()
    rows = conn.execute("SELECT * FROM fee_structures ORDER BY course ASC, year ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@bp.get("/payments")
@login_required
def get_payments():
    user_id = g.user["sub"]
    user_role = g.user["role"]
    conn = get_db()

    target_user_id = user_id
    if user_role in ("admin", "cfro_staff") and request.args.get("student_id"):
        try:
            target_user_id = int(request.args.get("student_id"))
        except ValueError:
            pass

    rows = conn.execute(
        "SELECT * FROM fee_payments WHERE user_id = ? ORDER BY payment_date DESC, id DESC",
        (target_user_id,)
    ).fetchall()

    if not rows and user_role == "student":
        # Ensure default payments exist for Asha Rao / current student
        sample_payments = [
            (target_user_id, "Tuition Fee", 45000.0, "Online (NetBanking)", "TXN-QIS-9823412", "QIS-REC-2026-0842", "2026-07-15", "Success", now_iso()),
            (target_user_id, "Examination Fee", 2500.0, "Online (UPI)", "TXN-QIS-9941032", "QIS-REC-2026-0911", "2026-08-01", "Success", now_iso()),
            (target_user_id, "Hostel Fee (1st Installment)", 6000.0, "Challan / Bank Deposit", "CHL-QIS-2026-014", "QIS-REC-2026-1025", "2026-08-12", "Success", now_iso())
        ]
        conn.executemany(
            """INSERT INTO fee_payments 
               (user_id, fee_type, amount, payment_mode, transaction_ref, receipt_no, payment_date, status, created_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            sample_payments
        )
        conn.commit()
        rows = conn.execute(
            "SELECT * FROM fee_payments WHERE user_id = ? ORDER BY payment_date DESC, id DESC",
            (target_user_id,)
        ).fetchall()

    payments = [dict(r) for r in rows]
    conn.close()
    return jsonify(payments)


@bp.get("/receipt/<receipt_no>")
@login_required
def get_receipt(receipt_no):
    user_id = g.user["sub"]
    user_role = g.user["role"]
    conn = get_db()

    # Find payment or receipt entry
    payment = conn.execute("SELECT * FROM fee_payments WHERE receipt_no = ?", (receipt_no,)).fetchone()
    if not payment:
        conn.close()
        return jsonify({"error": "Receipt not found"}), 404

    # Security check: student can only view their own receipts
    if user_role == "student" and payment["user_id"] != user_id:
        conn.close()
        return jsonify({"error": "Unauthorized receipt access"}), 403

    student = conn.execute("SELECT * FROM users WHERE id = ?", (payment["user_id"],)).fetchone()
    conn.close()

    roll_no = _get_student_roll(student["email"], student["department"], student["year"])

    receipt_data = {
        "receipt_no": payment["receipt_no"],
        "transaction_ref": payment["transaction_ref"],
        "date": payment["payment_date"],
        "college_name": student["college"] or "QIS College of Engineering and Technology",
        "affiliation": "Autonomous Institution, Approved by AICTE, Affiliated to JNTUK",
        "campus_address": "Vengamukkapalem, Ongole, Andhra Pradesh - 523272",
        "student_name": student["name"],
        "student_id": roll_no,
        "department": student["department"] or "Computer Science & Engineering",
        "year_semester": f"{student['year'] or '3rd Year'} - 1st Semester",
        "academic_year": "2026-2027",
        "fee_type": payment["fee_type"],
        "amount_paid": float(payment["amount"]),
        "amount_in_words": f"Rupees {int(payment['amount'])} Only",
        "payment_mode": payment["payment_mode"],
        "status": payment["status"],
        "cashier_signature": "CFRO Accounts Section - Verified",
        "disclaimer": "This is a computer-generated official receipt issued by CFRO, QISCET. Signature not physically required."
    }
    return jsonify(receipt_data)


@bp.post("/payments/record")
@roles_required("admin", "cfro_staff")
def record_payment():
    data = request.get_json(force=True, silent=True) or {}
    student_id = data.get("student_id")
    fee_type = data.get("fee_type")
    amount = float(data.get("amount", 0))
    payment_mode = data.get("payment_mode", "Offline / Cash Challan")
    transaction_ref = data.get("transaction_ref") or f"TXN-CFRO-{int(now_iso().replace('-','').replace(':','')[10:18])}"
    receipt_no = data.get("receipt_no") or f"QIS-REC-2026-{int(amount)%9000 + 1000}"
    payment_date = data.get("payment_date") or now_iso()[:10]

    if not student_id or not fee_type or amount <= 0:
        return jsonify({"error": "Valid student_id, fee_type, and amount are required"}), 400

    conn = get_db()
    conn.execute(
        """INSERT INTO fee_payments (user_id, fee_type, amount, payment_mode, transaction_ref, receipt_no, payment_date, status, created_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (student_id, fee_type, amount, payment_mode, transaction_ref, receipt_no, payment_date, "Success", now_iso())
    )
    # Update student_fees row if exists
    fee_row = conn.execute(
        "SELECT * FROM student_fees WHERE user_id = ? AND fee_type = ?",
        (student_id, fee_type)
    ).fetchone()

    if fee_row:
        new_paid = float(fee_row["amount_paid"]) + amount
        due = float(fee_row["amount_due"])
        new_status = "Paid" if new_paid >= due else ("Partially Paid" if new_paid > 0 else "Unpaid")
        conn.execute(
            "UPDATE student_fees SET amount_paid = ?, status = ? WHERE id = ?",
            (new_paid, new_status, fee_row["id"])
        )

    # Log audit
    conn.execute(
        """INSERT INTO audit_logs (user_id, action, module, details, created_at)
           VALUES (?,?,?,?,?)""",
        (g.user["sub"], "RECORD_PAYMENT", "CFRO", f"Recorded {amount} for student {student_id}, fee {fee_type}", now_iso())
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "receipt_no": receipt_no, "transaction_ref": transaction_ref}), 201


@bp.post("/announcements")
@roles_required("admin", "cfro_staff")
def post_announcement():
    data = request.get_json(force=True, silent=True) or {}
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    category = data.get("category", "Fee Deadline")
    deadline_date = data.get("deadline_date")
    priority = data.get("priority", "Normal")

    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    conn = get_db()
    conn.execute(
        """INSERT INTO cfro_announcements (title, content, category, deadline_date, priority, posted_by, created_at)
           VALUES (?,?,?,?,?,?,?)""",
        (title, content, category, deadline_date, priority, f"CFRO Officer ({g.user['name']})", now_iso())
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Announcement published"}), 201


@bp.get("/students")
@roles_required("admin", "cfro_staff")
def list_students():
    conn = get_db()
    students = conn.execute(
        "SELECT id, name, email, department, year, college FROM users WHERE role = 'student' ORDER BY name ASC"
    ).fetchall()
    result = []
    for s in students:
        roll_no = _get_student_roll(s["email"], s["department"], s["year"])
        total_due = conn.execute("SELECT SUM(amount_due) s FROM student_fees WHERE user_id = ?", (s["id"],)).fetchone()["s"] or 70000.0
        total_paid = conn.execute("SELECT SUM(amount_paid) s FROM student_fees WHERE user_id = ?", (s["id"],)).fetchone()["s"] or 0.0
        pending = max(0.0, float(total_due) - float(total_paid))
        status = "Paid" if pending == 0 else ("Partially Paid" if total_paid > 0 else "Overdue")
        result.append({
            "id": s["id"],
            "name": s["name"],
            "email": s["email"],
            "roll_no": roll_no,
            "department": s["department"],
            "year": s["year"],
            "total_due": float(total_due),
            "total_paid": float(total_paid),
            "pending": pending,
            "status": status
        })
    conn.close()
    return jsonify(result)
