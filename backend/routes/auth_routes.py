from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_db, now_iso
from auth import make_token

bp = Blueprint("auth_routes", __name__, url_prefix="/api")

ALLOWED_SELF_SIGNUP_ROLES = {"student", "faculty"}


@bp.post("/register")
def register():
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "student")
    department = data.get("department")
    year = data.get("year")
    college = data.get("college", "QIS College of Engineering and Technology")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if role not in ALLOWED_SELF_SIGNUP_ROLES:
        return jsonify({"error": "Self sign-up is only available for students and faculty"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "An account with this email already exists"}), 409

    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (name, email, password_hash, role, department, year, college, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (name, email, generate_password_hash(password), role, department, year, college, now_iso()),
    )
    conn.commit()
    user_row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()

    token = make_token(user_row)
    return jsonify({"token": token, "user": _public_user(user_row)}), 201


@bp.post("/login")
@bp.post("/auth/login")
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    conn = get_db()
    user_row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user_row or not check_password_hash(user_row["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = make_token(user_row)
    return jsonify({"token": token, "user": _public_user(user_row)})


def _public_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "department": row["department"],
        "year": row["year"],
        "college": row["college"],
    }
