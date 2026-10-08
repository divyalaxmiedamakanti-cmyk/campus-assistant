"""
Campus Assistant - Flask application factory.
Serves the JSON API. In production the React build's static files are also
served from here (see `../frontend/dist`) so the whole app is same-origin.
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from database import init_db
import rag_engine
from auth import login_required
from flask import g

from routes.auth_routes import bp as auth_bp
from routes.chat_routes import bp as chat_bp
from routes.admin_routes import bp as admin_bp
from routes.faculty_routes import bp as faculty_bp
from routes.cfro_routes import bp as cfro_bp
from routes.cfss_routes import bp as cfss_bp

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")


def create_app():
    # Do NOT pass static_folder here — Flask's built-in static handler would
    # intercept SPA routes (e.g. /dashboard) before serve_spa can catch them,
    # resulting in 404s for paths that aren't real files on disk.
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    init_db()
    rag_engine.build_index_from_db()

    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(cfro_bp)
    app.register_blueprint(cfss_bp)

    @app.get("/api/me")
    @login_required
    def me():
        return jsonify(g.user)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # --- Serve the built React SPA for any non-API route (same-origin) ---
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        # Let /api/* routes fall through to blueprints; only catch unknown ones
        if path.startswith("api"):
            return jsonify({"error": "Not found"}), 404
        full_path = os.path.join(FRONTEND_DIST, path)
        # Serve real static assets (JS, CSS, images…) directly
        if path and os.path.exists(full_path) and os.path.isfile(full_path):
            return send_from_directory(FRONTEND_DIST, path)
        # Fall back to index.html for all SPA client-side routes
        return send_from_directory(FRONTEND_DIST, "index.html")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False, use_reloader=False)

