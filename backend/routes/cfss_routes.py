import os
from flask import Blueprint, request, jsonify, g
from auth import login_required, roles_required
from database import get_db, now_iso

bp = Blueprint("cfss_routes", __name__, url_prefix="/api/cfss")


def _get_student_roll(email, dept, year):
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

    target_user_id = user_id
    if user_role in ("admin", "cfss_staff", "student_dean") and request.args.get("student_id"):
        try:
            target_user_id = int(request.args.get("student_id"))
        except ValueError:
            pass

    user = conn.execute("SELECT * FROM users WHERE id = ?", (target_user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    roll_no = _get_student_roll(user["email"], user["department"], user["year"])

    # Academic info
    academic_info = {
        "student_name": user["name"],
        "student_id": roll_no,
        "email": user["email"],
        "department": user["department"] or "Computer Science & Engineering",
        "year": user["year"] or "3rd Year",
        "semester": "1st Semester (V Semester)",
        "regulation": "R23 Autonomous",
        "section": "CSE-A",
        "cgpa": 8.42,
        "credits_earned": 84,
        "total_credits": 160,
        "attendance_percentage": 82.5,
        "mentor_name": "Dr. P. Srinivasa Rao (Assoc. Prof)",
        "mentor_contact": "srinivasa.cse@qiscet.edu.in",
        "academic_status": "Good Standing (Active)"
    }

    # Reimbursement application for user
    reimb_row = conn.execute(
        "SELECT * FROM reimbursement_applications WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        (target_user_id,)
    ).fetchone()

    if not reimb_row and user_role == "student":
        # Create default reimbursement record for student
        conn.execute(
            """INSERT INTO reimbursement_applications 
               (user_id, scheme_name, application_no, academic_year, eligible_amount, sanctioned_amount, 
                current_stage, thumb_auth_status, thumb_auth_notes, college_verification_status, 
                required_docs, uploaded_docs, remarks, updated_at, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                target_user_id,
                "Jagananna Vidya Deevena (RTF) & Vasathi Deevena (MTF)",
                f"APJVD-2026-{target_user_id:04d}98",
                "2026-2027",
                45000.0,
                45000.0,
                "Biometric / Thumb Authentication",
                "Pending Physical Auth at CFSS Office",
                "Visit Room A-102 (CFSS Helpdesk) between 10 AM - 4 PM with original Aadhaar card.",
                "Verified by Principal Office",
                "Allotment Order, Income Certificate, Caste Certificate, Aadhaar Card Copy, Previous Semester Marks Memo",
                "Allotment_Order.pdf, Income_Cert_2026.pdf, Aadhaar_Copy.pdf",
                "College verification completed. Physical thumb authentication pending before forwarding to Welfare Dept.",
                now_iso(),
                now_iso()
            )
        )
        conn.commit()
        reimb_row = conn.execute(
            "SELECT * FROM reimbursement_applications WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (target_user_id,)
        ).fetchone()

    reimbursement = dict(reimb_row) if reimb_row else None

    # Document requests for this user
    doc_requests_rows = conn.execute(
        "SELECT * FROM document_requests WHERE user_id = ? ORDER BY id DESC",
        (target_user_id,)
    ).fetchall()

    if not doc_requests_rows and user_role == "student":
        conn.execute(
            """INSERT INTO document_requests (user_id, document_type, purpose, copies, status, remarks, download_url, submitted_at)
               VALUES (?,?,?,?,?,?,?,?)""",
            (
                target_user_id,
                "Bonafide Certificate",
                "Passport & Higher Education Application",
                1,
                "Approved",
                "Certificate generated and signed digitally. Collect hardcopy from Room A-102 or download below.",
                f"/api/cfss/documents/download/BONAFIDE-{target_user_id}",
                now_iso()
            )
        )
        conn.commit()
        doc_requests_rows = conn.execute(
            "SELECT * FROM document_requests WHERE user_id = ? ORDER BY id DESC",
            (target_user_id,)
        ).fetchall()

    doc_requests = [dict(d) for d in doc_requests_rows]

    # Support tickets
    ticket_rows = conn.execute(
        "SELECT * FROM student_support_tickets WHERE user_id = ? ORDER BY id DESC",
        (target_user_id,)
    ).fetchall()
    tickets = [dict(t) for t in ticket_rows]

    # Dean Info
    dean_row = conn.execute("SELECT * FROM cfss_dean_info ORDER BY id DESC LIMIT 1").fetchone()
    dean_info = dict(dean_row) if dean_row else {
        "dean_name": "Dr. Vasu Babu",
        "designation": "Dean of Student Affairs & Student Welfare",
        "office_location": "Main Administrative Block, Room A-101, First Floor",
        "office_timings": "Mon - Fri: 10:00 AM - 1:00 PM & 2:30 PM - 4:30 PM; Sat: 10:00 AM - 1:00 PM",
        "contact_email": "dean.students@qiscet.edu.in",
        "contact_phone": "+91 8592 282466 / Ext: 104",
        "responsibilities": "Overall student welfare, mentorship oversight, grievance resolution, scholarship coordination, disciplinary committee & student council.",
        "instructions": "Students are requested to register token at CFSS counter (Room A-102) prior to meeting the Dean. Carry student ID card and pertinent documents."
    }

    # CFSS Announcements
    announcements_rows = conn.execute(
        "SELECT * FROM cfss_announcements ORDER BY id DESC LIMIT 10"
    ).fetchall()
    announcements = [dict(a) for a in announcements_rows]

    conn.close()

    return jsonify({
        "student_academic_info": academic_info,
        "reimbursement": reimbursement,
        "document_requests": doc_requests,
        "support_tickets": tickets,
        "dean_info": dean_info,
        "announcements": announcements,
        "biometric_notice": {
            "title": "Physical Biometric Authentication Notice",
            "room": "Room A-102 (CFSS Helpdesk, Administrative Block)",
            "message": "As per state government guidelines for Post-Matric Fee Reimbursement (JVD), students must undergo physical biometric authentication (e-KYC / thumb impression) at the college CFSS terminal in Room A-102. Please carry your original Aadhaar Card. Note: Raw biometric data is never stored on campus servers; verification is completed via the UIDAI government gateway.",
            "timings": "10:00 AM to 4:00 PM (Monday through Saturday)"
        }
    })


@bp.post("/reimbursement/status-update")
@roles_required("admin", "cfss_staff", "student_dean")
def update_reimbursement_status():
    data = request.get_json(force=True, silent=True) or {}
    app_id = data.get("application_id")
    stage = data.get("current_stage")
    thumb_status = data.get("thumb_auth_status")
    notes = data.get("remarks")

    if not app_id:
        return jsonify({"error": "application_id is required"}), 400

    conn = get_db()
    conn.execute(
        """UPDATE reimbursement_applications 
           SET current_stage = COALESCE(?, current_stage),
               thumb_auth_status = COALESCE(?, thumb_auth_status),
               remarks = COALESCE(?, remarks),
               updated_at = ?
           WHERE id = ?""",
        (stage, thumb_status, notes, now_iso(), app_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Reimbursement status updated successfully"})


@bp.post("/documents/request")
@login_required
def request_document():
    data = request.get_json(force=True, silent=True) or {}
    user_id = g.user["sub"]
    doc_type = (data.get("document_type") or "").strip()
    purpose = (data.get("purpose") or "").strip()
    copies = int(data.get("copies", 1))
    remarks = (data.get("remarks") or "").strip()

    if not doc_type or not purpose:
        return jsonify({"error": "Document type and purpose are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO document_requests (user_id, document_type, purpose, copies, status, remarks, download_url, submitted_at)
           VALUES (?,?,?,?,?,?,?,?)""",
        (
            user_id,
            doc_type,
            purpose,
            copies,
            "Submitted",
            remarks or "Application under initial CFSS verification",
            None,
            now_iso()
        )
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()

    return jsonify({"success": True, "request_id": new_id, "message": f"{doc_type} request submitted successfully"}), 201


@bp.post("/documents/<int:req_id>/status")
@roles_required("admin", "cfss_staff", "student_dean")
def update_document_status(req_id):
    data = request.get_json(force=True, silent=True) or {}
    status = data.get("status")
    remarks = data.get("remarks")

    if not status:
        return jsonify({"error": "Status is required"}), 400

    download_url = f"/api/cfss/documents/download/DOC-{req_id}" if status in ("Approved", "Ready", "Completed") else None

    conn = get_db()
    conn.execute(
        """UPDATE document_requests 
           SET status = ?, remarks = COALESCE(?, remarks), download_url = COALESCE(?, download_url),
               completed_at = CASE WHEN ? IN ('Approved', 'Ready', 'Completed') THEN ? ELSE completed_at END
           WHERE id = ?""",
        (status, remarks, download_url, status, now_iso(), req_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Document request #{req_id} updated to {status}"})


@bp.get("/documents/download/<doc_code>")
@login_required
def download_document_preview(doc_code):
    user_id = g.user["sub"]
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    roll_no = _get_student_roll(user["email"], user["department"], user["year"])
    
    # Return structured certificate preview payload
    return jsonify({
        "certificate_id": f"QIS-CERT-{doc_code}-2026",
        "institution": "QIS College of Engineering and Technology",
        "affiliation": "Autonomous Institution, Approved by AICTE, Affiliated to JNTUK",
        "certificate_title": "BONAFIDE & STUDY CERTIFICATE",
        "content": f"This is to certify that Mr./Ms. {user['name']} (Roll No: {roll_no}) is a bonafide student of QIS College of Engineering and Technology, studying {user['year'] or '3rd Year'} B.Tech in the Department of {user['department'] or 'Computer Science & Engineering'} during the academic year 2026-2027.",
        "issued_date": now_iso()[:10],
        "validity": "Academic Year 2026-2027",
        "authorized_signatory": "Dean, Student Affairs & Principal, QISCET",
        "status": "Digitally Verified"
    })


@bp.post("/tickets")
@login_required
def create_ticket():
    data = request.get_json(force=True, silent=True) or {}
    user_id = g.user["sub"]
    category = data.get("category", "General")
    subject = (data.get("subject") or "").strip()
    description = (data.get("description") or "").strip()
    priority = data.get("priority", "Normal")

    if not subject or not description:
        return jsonify({"error": "Subject and description are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO student_support_tickets 
           (user_id, category, subject, description, priority, status, assigned_to, submitted_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (user_id, category, subject, description, priority, "Open", "CFSS Student Welfare Desk", now_iso(), now_iso())
    )
    conn.commit()
    ticket_id = cur.lastrowid
    conn.close()

    return jsonify({"success": True, "ticket_id": ticket_id, "message": "Support ticket raised successfully"}), 201


@bp.post("/tickets/<int:ticket_id>/reply")
@roles_required("admin", "cfss_staff", "student_dean")
def reply_ticket(ticket_id):
    data = request.get_json(force=True, silent=True) or {}
    response_text = (data.get("response") or "").strip()
    status = data.get("status", "Resolved")

    if not response_text:
        return jsonify({"error": "Response text is required"}), 400

    conn = get_db()
    conn.execute(
        """UPDATE student_support_tickets 
           SET response = ?, status = ?, updated_at = ?, assigned_to = ?
           WHERE id = ?""",
        (response_text, status, now_iso(), f"{g.user['name']} ({g.user['role']})", ticket_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": f"Response added to ticket #{ticket_id}"})


@bp.get("/dean-info")
@login_required
def get_dean_info():
    conn = get_db()
    row = conn.execute("SELECT * FROM cfss_dean_info ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify({
        "dean_name": "Dr. Vasu Babu",
        "designation": "Dean of Student Affairs & Student Welfare",
        "office_location": "Main Administrative Block, Room A-101, First Floor",
        "office_timings": "Mon - Fri: 10:00 AM - 1:00 PM & 2:30 PM - 4:30 PM; Sat: 10:00 AM - 1:00 PM",
        "contact_email": "dean.students@qiscet.edu.in",
        "contact_phone": "+91 8592 282466 / Ext: 104",
        "responsibilities": "Overall student welfare, mentorship oversight, grievance resolution, scholarship coordination, disciplinary committee & student council.",
        "instructions": "Students are requested to register token at CFSS counter (Room A-102) prior to meeting the Dean. Carry student ID card and pertinent documents."
    })


@bp.post("/dean-info")
@roles_required("admin", "student_dean")
def update_dean_info():
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("dean_name") or "").strip()
    designation = (data.get("designation") or "").strip()
    office_location = (data.get("office_location") or "").strip()
    office_timings = (data.get("office_timings") or "").strip()
    email = (data.get("contact_email") or "").strip()
    phone = (data.get("contact_phone") or "").strip()
    responsibilities = (data.get("responsibilities") or "").strip()
    instructions = (data.get("instructions") or "").strip()

    if not name or not email:
        return jsonify({"error": "Dean name and contact email are required"}), 400

    conn = get_db()
    conn.execute(
        """INSERT INTO cfss_dean_info 
           (dean_name, designation, office_location, office_timings, contact_email, contact_phone, responsibilities, instructions, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (name, designation, office_location, office_timings, email, phone, responsibilities, instructions, now_iso())
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Student Dean information updated successfully"})
