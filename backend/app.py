import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes import clients_bp, missions_bp, invoices_bp, dashboard_bp, ai_bp

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(os.path.abspath(os.path.dirname(__file__)), "freelanceflow.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(clients_bp)
app.register_blueprint(missions_bp)
app.register_blueprint(invoices_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(ai_bp)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
