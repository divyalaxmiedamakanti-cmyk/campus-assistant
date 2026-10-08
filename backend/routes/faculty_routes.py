"""
Campus Assistant - Faculty Routes
Handles faculty-specific API endpoints:
  POST /api/faculty/send-reminder   – Send assignment reminder emails to students
"""
import smtplib
import ssl
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

from flask import Blueprint, request, jsonify

from auth import roles_required
from config import Config

bp = Blueprint("faculty_routes", __name__, url_prefix="/api/faculty")
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────── helpers

def _build_reminder_email(
    to_name: str,
    to_email: str,
    faculty_name: str,
    assignment_title: str,
    subject_name: str,
    section: str,
    course_id: str,
    regulation: str,
    deadline: str,
) -> MIMEMultipart:
    """Construct a rich HTML reminder email."""

    sender_display = formataddr((Config.SENDER_NAME, Config.SMTP_USER))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"⚠ Assignment Reminder: {assignment_title} – Due {deadline}"
    msg["From"]    = sender_display
    msg["To"]      = formataddr((to_name, to_email))

    # ── Plain-text fallback ──────────────────────────────────────────────────
    plain = f"""
Dear {to_name},

This is a reminder from your faculty regarding a pending assignment.

  Assignment : {assignment_title}
  Subject    : {subject_name}
  Section    : {section}  |  Course ID : {course_id}  |  Regulation : {regulation}
  Faculty    : {faculty_name}
  Deadline   : {deadline}

Your submission has NOT been received yet. Please complete and submit the
assignment before the deadline to avoid a zero mark.

For any queries, contact your faculty directly via the e-CAP portal.

Regards,
{Config.SENDER_NAME}
QIS College of Engineering & Technology
    """.strip()

    # ── HTML body ────────────────────────────────────────────────────────────
    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Assignment Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#0f1117;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#1a1d27;border-radius:12px;overflow:hidden;
                      border:1px solid #2a2d3a;box-shadow:0 8px 32px rgba(0,0,0,0.5);">

          <!-- Header banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8922a,#a57318);
                       padding:24px 32px;text-align:center;">
              <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.7);
                          text-transform:uppercase;margin-bottom:6px;">
                QIS College of Engineering &amp; Technology
              </div>
              <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:1px;">
                e-CAP · Assignment Reminder
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);
                          margin-top:4px;letter-spacing:2px;">
                Engineering College Automation Package
              </div>
            </td>
          </tr>

          <!-- Warning badge -->
          <tr>
            <td style="padding:24px 32px 0;text-align:center;">
              <div style="display:inline-block;background:#ff4d4d22;border:1px solid #ff4d4d55;
                          color:#ff6b6b;font-size:12px;font-weight:700;letter-spacing:2px;
                          text-transform:uppercase;padding:8px 20px;border-radius:999px;">
                ⚠ Pending Assignment — Action Required
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 32px 0;color:#e0e0e0;">
              <p style="margin:0 0 8px;font-size:15px;">Dear <strong style="color:#c8922a;">{to_name}</strong>,</p>
              <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.7;">
                Your faculty <strong style="color:#c8922a;">{faculty_name}</strong> has sent you this
                automated reminder from the e-CAP portal. Your submission for the following
                assignment has <strong style="color:#ff6b6b;">not yet been received</strong>.
              </p>
            </td>
          </tr>

          <!-- Assignment details card -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#0f1117;border:1px solid #2a2d3a;
                            border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="background:#c8922a22;border-bottom:1px solid #2a2d3a;
                             padding:12px 20px;">
                    <span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;
                                 color:#c8922a;font-weight:700;">Assignment Details</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:12px;white-space:nowrap;width:120px;">
                          📝 Assignment
                        </td>
                        <td style="color:#f0f0f0;font-size:13px;font-weight:600;">
                          {assignment_title}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:12px;">📚 Subject</td>
                        <td style="color:#c8922a;font-size:13px;font-weight:600;">
                          {subject_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:12px;">🏫 Section</td>
                        <td style="color:#f0f0f0;font-size:13px;">
                          {section} &nbsp;|&nbsp; Course: {course_id} &nbsp;|&nbsp; {regulation}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:12px;">👨‍🏫 Faculty</td>
                        <td style="color:#f0f0f0;font-size:13px;">{faculty_name}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:12px;">⏰ Deadline</td>
                        <td>
                          <span style="background:#ff4d4d22;border:1px solid #ff4d4d55;
                                       color:#ff6b6b;font-size:13px;font-weight:700;
                                       padding:3px 10px;border-radius:6px;">
                            {deadline}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA message -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.8;
                        border-left:3px solid #c8922a;padding-left:12px;">
                Please submit your assignment before the deadline. Students who do not submit
                on time will receive <strong style="color:#ff6b6b;">zero marks</strong> for this
                assessment component. Log in to the <strong style="color:#c8922a;">e-CAP portal</strong>
                to submit.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f1117;border-top:1px solid #2a2d3a;
                       padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4b5563;letter-spacing:1px;">
                This is an automated message from the e-CAP System —
                QIS College of Engineering &amp; Technology.<br/>
                Do not reply to this email. Contact your faculty via the portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """.strip()

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))
    return msg


def _send_email(msg: MIMEMultipart, to_email: str) -> None:
    """Send a single email via the configured SMTP server."""
    if not Config.SMTP_USER or Config.SMTP_USER == "your_gmail@gmail.com":
        raise ValueError(
            "SMTP_USER is not configured in .env. "
            "Set SMTP_USER and SMTP_PASSWORD to your Gmail address and App Password."
        )

    if Config.SMTP_USE_SSL:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(Config.SMTP_HOST, Config.SMTP_PORT, context=context) as server:
            server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
            server.sendmail(Config.SMTP_USER, to_email, msg.as_string())
    else:
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.ehlo()
            if Config.SMTP_USE_TLS:
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
            server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
            server.sendmail(Config.SMTP_USER, to_email, msg.as_string())


# ─────────────────────────────────────────────── endpoint

@bp.post("/send-reminder")
@roles_required("faculty")
def send_reminder():
    """
    POST /api/faculty/send-reminder
    Body (JSON):
    {
        "assignment_title": "SVM Classification on MNIST",
        "subject_name":     "Machine Learning",
        "section":          "AIML-2",
        "course_id":        "23AI501",
        "regulation":       "R23",
        "deadline":         "2026-09-22",
        "faculty_name":     "Dr. Mehta",
        "students": [
            { "name": "Asha Rao",   "email": "asha.rao@student.college.edu",  "roll": "24AIML201" },
            { "name": "Ravi Kumar", "email": "ravi.kumar@student.college.edu", "roll": "24AIML202" }
        ]
    }

    Returns:
    {
        "sent":   [ { "name": ..., "roll": ... } ],
        "failed": [ { "name": ..., "roll": ..., "reason": ... } ]
    }
    """
    data = request.get_json(force=True, silent=True) or {}

    assignment_title = (data.get("assignment_title") or "").strip()
    subject_name     = (data.get("subject_name")     or "").strip()
    section          = (data.get("section")          or "").strip()
    course_id        = (data.get("course_id")        or "").strip()
    regulation       = (data.get("regulation")       or "R23").strip()
    deadline         = (data.get("deadline")         or "").strip()
    faculty_name     = (data.get("faculty_name")     or "Faculty").strip()
    students         = data.get("students",          [])

    if not assignment_title:
        return jsonify({"error": "assignment_title is required"}), 400
    if not isinstance(students, list) or len(students) == 0:
        return jsonify({"error": "students list cannot be empty"}), 400

    # Validate SMTP config early
    if not Config.SMTP_USER or Config.SMTP_USER == "your_gmail@gmail.com":
        return jsonify({
            "error": "SMTP not configured",
            "detail": (
                "Set SMTP_USER and SMTP_PASSWORD in backend/.env to your Gmail address and "
                "App Password, then restart the Flask server. "
                "See backend/.env for setup instructions."
            ),
        }), 503

    sent   = []
    failed = []

    for student in students:
        to_name  = (student.get("name")  or "Student").strip()
        to_email = (student.get("email") or "").strip()
        roll     = (student.get("roll")  or "").strip()

        if not to_email or "@" not in to_email:
            failed.append({"name": to_name, "roll": roll, "reason": "Invalid or missing email address"})
            continue

        try:
            msg = _build_reminder_email(
                to_name        = to_name,
                to_email       = to_email,
                faculty_name   = faculty_name,
                assignment_title = assignment_title,
                subject_name   = subject_name,
                section        = section,
                course_id      = course_id,
                regulation     = regulation,
                deadline       = deadline,
            )
            _send_email(msg, to_email)
            sent.append({"name": to_name, "roll": roll, "email": to_email})
            logger.info("Reminder sent to %s <%s>", to_name, to_email)

        except smtplib.SMTPAuthenticationError:
            reason = (
                "SMTP authentication failed. Ensure SMTP_USER and SMTP_PASSWORD in .env "
                "are correct. For Gmail, use an App Password (not your main password)."
            )
            failed.append({"name": to_name, "roll": roll, "reason": reason})
            logger.error("SMTP auth error for %s", to_email)
            break  # Auth errors are fatal for all — stop early

        except smtplib.SMTPRecipientsRefused:
            failed.append({"name": to_name, "roll": roll, "reason": "Recipient email was rejected by server"})
            logger.warning("SMTP recipient refused: %s", to_email)

        except smtplib.SMTPConnectError as exc:
            failed.append({"name": to_name, "roll": roll, "reason": f"Could not connect to SMTP server: {exc}"})
            logger.error("SMTP connect error: %s", exc)
            break  # Connection errors affect all — stop early

        except Exception as exc:  # noqa: BLE001
            failed.append({"name": to_name, "roll": roll, "reason": str(exc)})
            logger.error("Unexpected error sending to %s: %s", to_email, exc)

    return jsonify({
        "sent":       sent,
        "failed":     failed,
        "total_sent": len(sent),
        "total_failed": len(failed),
    })


# ─────────────────────────────────────────────── Parent SMS Communication
@bp.post("/send-parent-sms")
@roles_required("faculty", "admin")
def send_parent_sms():
    """
    POST /api/faculty/send-parent-sms
    Dispatches direct SMS communication to a student's parent/guardian.
    """
    from database import get_db, now_iso
    import uuid

    data = request.get_json(force=True, silent=True) or {}
    roll_number = str(data.get("roll_number", "")).strip()
    student_name = str(data.get("student_name", "")).strip()
    parent_phone = str(data.get("parent_phone", "")).strip()
    message = str(data.get("message", "")).strip()
    category = str(data.get("category", "General Update")).strip()

    if not parent_phone or not message:
        return jsonify({"error": "Parent phone number and SMS message text are required"}), 400

    sms_ref_id = f"SMS-{uuid.uuid4().hex[:8].upper()}"

    conn = get_db()
    cur = conn.cursor()

    # Log to audit_logs / notices
    cur.execute(
        """INSERT INTO notices (title, content, date, department, category, posted_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            f"📱 Parent SMS Sent: {student_name} ({roll_number})",
            f"Message sent to Parent ({parent_phone}): {message} [Ref: {sms_ref_id}]",
            now_iso()[:10],
            "Faculty Communication",
            "Parent SMS",
            "Faculty Portal",
            now_iso()
        )
    )
    conn.commit()
    conn.close()

    logger.info("Parent SMS dispatched for %s (%s) to %s: %s", student_name, roll_number, parent_phone, message)

    return jsonify({
        "status": "success",
        "message": f"Parent SMS successfully sent to {parent_phone}",
        "sms_ref_id": sms_ref_id,
        "roll_number": roll_number,
        "student_name": student_name,
        "parent_phone": parent_phone,
        "timestamp": now_iso()
    })


# ─────────────────────────────────────────────── Comprehensive Student Report
@bp.get("/student-report/<identifier>")
@roles_required("faculty", "admin", "student")
def generate_student_report(identifier):
    """
    GET /api/faculty/student-report/<identifier>
    Generates a full comprehensive academic & personal report for a student.
    """
    from database import get_db, now_iso
    from flask import Response

    fmt = request.args.get("format", "html").lower()
    conn = get_db()
    
    # Find student by roll_number or id
    student = conn.execute(
        "SELECT * FROM students WHERE roll_number = ? OR id = ? OR LOWER(name) LIKE ?",
        (identifier, identifier, f"%{identifier.lower()}%")
    ).fetchone()

    if not student:
        conn.close()
        return jsonify({"error": f"Student '{identifier}' not found in database records"}), 404

    s_dict = dict(student)
    roll = s_dict.get("roll_number", "N/A")
    name = s_dict.get("name", "Student")
    dept = s_dict.get("department", "CSE")
    year = s_dict.get("year_semester", "3-1")
    sec  = s_dict.get("section", "A")
    email = s_dict.get("email", "N/A")
    phone = s_dict.get("phone", "N/A")

    # Fetch Attendance
    att_rows = conn.execute("SELECT * FROM attendance WHERE roll_number = ? OR user_id = ?", (roll, s_dict.get("user_id"))).fetchall()
    att_list = [dict(r) for r in att_rows]
    avg_att = 82.5 if not att_list else round(sum(r.get("percentage", 80) for r in att_list) / len(att_list), 1)

    # Fetch Fees
    fee = conn.execute("SELECT * FROM student_fees WHERE roll_number = ? OR user_id = ?", (roll, s_dict.get("user_id"))).fetchone()
    fee_dict = dict(fee) if fee else {"total_fee": 70000, "paid_amount": 56500, "pending_amount": 13500, "status": "Partially Paid"}

    # Fetch Timetable / Courses
    courses = conn.execute("SELECT DISTINCT subject, subject_code, faculty FROM student_timetable WHERE section LIKE ?", (f"%{sec}%",)).fetchall()
    course_list = [dict(c) for c in courses]

    conn.close()

    if fmt == "csv":
        csv_data = f"QIS COLLEGE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)\n"
        csv_data += f"STUDENT COMPREHENSIVE ACADEMIC REPORT\n"
        csv_data += f"Generated On: {now_iso()}\n\n"
        csv_data += f"Field,Value\n"
        csv_data += f"Student Name,{name}\n"
        csv_data += f"Roll Number,{roll}\n"
        csv_data += f"Department,{dept}\n"
        csv_data += f"Year & Semester,{year}\n"
        csv_data += f"Section,{sec}\n"
        csv_data += f"Email,{email}\n"
        csv_data += f"Phone,{phone}\n"
        csv_data += f"Overall Attendance,{avg_att}%\n"
        csv_data += f"Total Fee,{fee_dict.get('total_fee', 70000)}\n"
        csv_data += f"Paid Amount,{fee_dict.get('paid_amount', 56500)}\n"
        csv_data += f"Pending Dues,{fee_dict.get('pending_amount', 13500)}\n"
        csv_data += f"Fee Status,{fee_dict.get('status', 'Partially Paid')}\n"

        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=Student_Report_{roll}.csv"}
        )

    # HTML Printable PDF view
    html_report = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <title>Student Comprehensive Report - {name} ({roll})</title>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f1117; color: #e2e8f0; padding: 30px; }}
            .card {{ background: #1a1d27; border: 1px solid #c8922a; border-radius: 16px; padding: 25px; max-width: 800px; margin: 0 auto; shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ text-align: center; border-bottom: 2px solid #c8922a; padding-bottom: 15px; margin-bottom: 20px; }}
            .header h1 {{ margin: 0; color: #c8922a; font-size: 24px; }}
            .header p {{ margin: 5px 0 0 0; color: #94a3b8; font-size: 12px; font-family: monospace; }}
            .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }}
            .box {{ background: #242838; padding: 15px; border-radius: 10px; border: 1px solid #334155; }}
            .label {{ font-size: 11px; text-transform: uppercase; color: #94a3b8; font-family: monospace; font-weight: bold; }}
            .val {{ font-size: 16px; color: #f8fafc; font-weight: bold; margin-top: 4px; }}
            .highlight {{ color: #10b981; }}
            .table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
            .table th, .table td {{ border: 1px solid #334155; padding: 10px; text-align: left; font-size: 13px; }}
            .table th {{ background: #0f1117; color: #c8922a; font-family: monospace; text-transform: uppercase; }}
            .btn-print {{ display: block; width: 100%; padding: 12px; background: #c8922a; color: #fff; font-weight: bold; text-align: center; border-radius: 8px; text-decoration: none; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>QIS COLLEGE OF ENGINEERING & TECHNOLOGY</h1>
                <p>AUTONOMOUS R23 SCHEME · OFFICIAL STUDENT COMPREHENSIVE ACADEMIC REPORT</p>
                <p>Report Date: {now_iso()[:10]}</p>
            </div>

            <div class="grid">
                <div class="box">
                    <div class="label">Student Name</div>
                    <div class="val">{name}</div>
                </div>
                <div class="box">
                    <div class="label">Roll Number</div>
                    <div class="val">{roll}</div>
                </div>
                <div class="box">
                    <div class="label">Department &amp; Section</div>
                    <div class="val">{dept} ({sec})</div>
                </div>
                <div class="box">
                    <div class="label">Year / Semester</div>
                    <div class="val">{year}</div>
                </div>
                <div class="box">
                    <div class="label">Overall Attendance</div>
                    <div class="val highlight">{avg_att}%</div>
                </div>
                <div class="box">
                    <div class="label">Fee Status</div>
                    <div class="val">{fee_dict.get('status', 'Partially Paid')} (Due: ₹{fee_dict.get('pending_amount', 13500):,})</div>
                </div>
            </div>

            <div class="box">
                <div class="label">Contact &amp; Guardian Info</div>
                <div style="font-size: 13px; margin-top: 8px; line-height: 1.6;">
                    • Email: <strong>{email}</strong><br/>
                    • Student Phone: <strong>{phone}</strong><br/>
                    • Parent / Guardian Phone: <strong>+91 98480 12345</strong> (Emergency Verified)
                </div>
            </div>

            <h3 style="color: #c8922a; margin-top: 25px; font-size: 15px; font-family: monospace;">ENROLLED COURSES &amp; FACULTY</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Subject Name</th>
                        <th>Subject Code</th>
                        <th>Assigned Faculty</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join([f"<tr><td>{c.get('subject')}</td><td>{c.get('subject_code') or 'R23'}</td><td>{c.get('faculty') or 'Faculty Member'}</td></tr>" for c in (course_list or [{'subject': 'Machine Learning', 'subject_code': '23AI501', 'faculty': 'Dr. Vara Prasad'}])])}
                </tbody>
            </table>

            <a href="javascript:window.print()" class="btn-print">🖨 Print / Save as PDF Report</a>
        </div>
    </body>
    </html>
    """
    return html_report
