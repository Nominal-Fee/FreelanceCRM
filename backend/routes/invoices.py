from flask import Blueprint, request, jsonify
from datetime import date
from models import db, Invoice, Mission, Client, PaymentFollowUp, INVOICE_STATUSES, FOLLOWUP_TONES

invoices_bp = Blueprint("invoices", __name__)


@invoices_bp.route("/api/invoices", methods=["GET"])
def get_invoices():
    invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
    return jsonify([i.to_dict() for i in invoices])


@invoices_bp.route("/api/invoices/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    data = invoice.to_dict()
    data["follow_ups"] = [f.to_dict() for f in invoice.follow_ups]
    return jsonify(data)


@invoices_bp.route("/api/invoices", methods=["POST"])
def create_invoice():
    data = request.get_json()
    if not data or not data.get("mission_id") or not data.get("client_id"):
        return jsonify({"error": "mission_id and client_id are required"}), 400

    mission = db.session.get(Mission, data["mission_id"])
    if not mission:
        return jsonify({"error": "Mission not found"}), 404

    client = db.session.get(Client, data["client_id"])
    if not client:
        return jsonify({"error": "Client not found"}), 404

    status = data.get("status", "draft")
    if status not in INVOICE_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {INVOICE_STATUSES}"}), 400

    line_items = data.get("line_items", [])
    subtotal = data.get("subtotal", sum(item.get("amount", 0) for item in line_items))
    tax_rate = data.get("tax_rate", 0)
    total = data.get("total", round(subtotal * (1 + tax_rate / 100), 2))

    invoice = Invoice(
        mission_id=data["mission_id"],
        client_id=data["client_id"],
        issue_date=date.fromisoformat(data["issue_date"]) if data.get("issue_date") else None,
        due_date=date.fromisoformat(data["due_date"]) if data.get("due_date") else None,
        line_items=line_items,
        subtotal=subtotal,
        tax_rate=tax_rate,
        total=total,
        status=status,
        cover_message=data.get("cover_message"),
    )
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice.to_dict()), 201


@invoices_bp.route("/api/invoices/<int:invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "status" in data and data["status"] not in INVOICE_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {INVOICE_STATUSES}"}), 400

    for field in ["line_items", "subtotal", "tax_rate", "total", "status", "cover_message"]:
        if field in data:
            setattr(invoice, field, data[field])

    if "issue_date" in data:
        invoice.issue_date = date.fromisoformat(data["issue_date"]) if data["issue_date"] else None
    if "due_date" in data:
        invoice.due_date = date.fromisoformat(data["due_date"]) if data["due_date"] else None

    # Recalculate total if line_items or tax_rate changed
    if "line_items" in data or "tax_rate" in data:
        if "subtotal" not in data:
            invoice.subtotal = sum(item.get("amount", 0) for item in invoice.line_items)
        if "total" not in data:
            invoice.total = round(invoice.subtotal * (1 + invoice.tax_rate / 100), 2)

    db.session.commit()
    return jsonify(invoice.to_dict())


@invoices_bp.route("/api/invoices/<int:invoice_id>", methods=["DELETE"])
def delete_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": "Invoice deleted"})


# --- Follow-ups ---

@invoices_bp.route("/api/invoices/<int:invoice_id>/followups", methods=["GET"])
def get_followups(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify([f.to_dict() for f in invoice.follow_ups])


@invoices_bp.route("/api/invoices/<int:invoice_id>/followups", methods=["POST"])
def create_followup(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    tone = data.get("tone", "friendly")
    if tone not in FOLLOWUP_TONES:
        return jsonify({"error": f"Invalid tone. Must be one of: {FOLLOWUP_TONES}"}), 400

    followup = PaymentFollowUp(
        invoice_id=invoice_id,
        follow_up_date=date.fromisoformat(data["follow_up_date"]) if data.get("follow_up_date") else None,
        message=data.get("message"),
        tone=tone,
        sent=data.get("sent", False),
    )
    db.session.add(followup)
    db.session.commit()
    return jsonify(followup.to_dict()), 201
