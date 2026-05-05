from flask import Blueprint, request, jsonify
from models import db, Client, Mission, Invoice
from ai_service import (
    summarize_client,
    parse_natural_language_mission,
    generate_invoice_message,
    generate_followup_email,
    chat_with_data,
)
from datetime import date

ai_bp = Blueprint("ai", __name__)


def ai_error_response(e):
    import traceback
    traceback.print_exc()
    return jsonify({"error": f"AI service unavailable: {str(e)}"}), 503


@ai_bp.route("/api/ai/summarize-client", methods=["POST"])
def summarize_client_route():
    data = request.get_json()
    if not data or not data.get("client_id"):
        return jsonify({"error": "client_id is required"}), 400

    client = db.session.get(Client, data["client_id"])
    if not client:
        return jsonify({"error": "Client not found"}), 404

    try:
        summary = summarize_client(
            client.to_dict(),
            [m.to_dict() for m in client.missions],
            [i.to_dict() for i in client.invoices],
        )
        return jsonify({"summary": summary})
    except Exception as e:
        return ai_error_response(e)


@ai_bp.route("/api/ai/parse-mission", methods=["POST"])
def parse_mission_route():
    data = request.get_json()
    if not data or not data.get("text"):
        return jsonify({"error": "text is required"}), 400

    try:
        parsed = parse_natural_language_mission(data["text"])
        return jsonify(parsed)
    except Exception as e:
        return ai_error_response(e)


@ai_bp.route("/api/ai/generate-invoice-message", methods=["POST"])
def generate_invoice_message_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required = ["client_name", "mission_title", "amount"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    try:
        message = generate_invoice_message(
            data["client_name"],
            data["mission_title"],
            data["amount"],
            data.get("tone", "professional"),
        )
        return jsonify({"message": message})
    except Exception as e:
        return ai_error_response(e)


@ai_bp.route("/api/ai/generate-followup", methods=["POST"])
def generate_followup_route():
    data = request.get_json()
    if not data or not data.get("invoice_id"):
        return jsonify({"error": "invoice_id is required"}), 400

    invoice = db.session.get(Invoice, data["invoice_id"])
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    days_overdue = 0
    if invoice.due_date:
        days_overdue = max(0, (date.today() - invoice.due_date).days)

    tone = data.get("tone", "friendly")

    try:
        message = generate_followup_email(
            invoice.client.name if invoice.client else "Client",
            invoice.invoice_number,
            invoice.total,
            days_overdue,
            tone,
        )
        return jsonify({"message": message, "tone": tone, "days_overdue": days_overdue})
    except Exception as e:
        return ai_error_response(e)


@ai_bp.route("/api/ai/chat", methods=["POST"])
def chat_route():
    data = request.get_json()
    if not data or not data.get("question"):
        return jsonify({"error": "question is required"}), 400

    # Build business context from all data
    clients = Client.query.all()
    missions = Mission.query.all()
    invoices = Invoice.query.all()

    context = {
        "clients": [c.to_dict() for c in clients],
        "missions": [m.to_dict() for m in missions],
        "invoices": [i.to_dict() for i in invoices],
        "summary": {
            "total_clients": len(clients),
            "total_missions": len(missions),
            "active_missions": len([m for m in missions if m.status == "active"]),
            "total_invoices": len(invoices),
            "paid_invoices": len([i for i in invoices if i.status == "paid"]),
            "overdue_invoices": len([i for i in invoices if i.status == "overdue"]),
            "total_revenue": sum(i.total for i in invoices if i.status == "paid"),
            "pending_revenue": sum(i.total for i in invoices if i.status in ["draft", "sent", "overdue"]),
        },
    }

    try:
        answer = chat_with_data(data["question"], context)
        return jsonify({"answer": answer})
    except Exception as e:
        return ai_error_response(e)
