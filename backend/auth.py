"""
Campus Assistant - Auth
JWT issuing/verification plus Flask decorators for protecting routes by role.
"""
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, g

from config import Config


def make_token(user_row) -> str:
    payload = {
        "sub": user_row["id"],
        "email": user_row["email"],
        "name": user_row["name"],
        "role": user_row["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)


def decode_token(token: str):
    return jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])


def _extract_token():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    return None


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"error": "Missing authorization token"}), 401
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired, please sign in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        g.user = payload
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        @login_required
        def wrapper(*args, **kwargs):
            if g.user["role"] not in allowed_roles:
                return jsonify({"error": "You don't have permission to access this resource"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
