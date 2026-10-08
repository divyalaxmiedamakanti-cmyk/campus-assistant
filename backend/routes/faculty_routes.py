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
