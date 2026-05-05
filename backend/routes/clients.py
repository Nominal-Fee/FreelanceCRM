from flask import Blueprint, request, jsonify
from models import db, Client

clients_bp = Blueprint("clients", __name__)


@clients_bp.route("/api/clients", methods=["GET"])
def get_clients():
    clients = Client.query.order_by(Client.created_at.desc()).all()
    result = []
    for c in clients:
        d = c.to_dict()
        d["mission_count"] = len(c.missions)
        result.append(d)
    return jsonify(result)


@clients_bp.route("/api/clients/<int:client_id>", methods=["GET"])
def get_client(client_id):
    client = db.session.get(Client, client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    data = client.to_dict()
    data["missions"] = [m.to_dict() for m in client.missions]
    data["invoices"] = [i.to_dict() for i in client.invoices]
    return jsonify(data)


@clients_bp.route("/api/clients", methods=["POST"])
def create_client():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Client name is required"}), 400

    client = Client(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        billing_address=data.get("billing_address"),
        notes=data.get("notes"),
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@clients_bp.route("/api/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = db.session.get(Client, client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    for field in ["name", "email", "phone", "company", "billing_address", "notes"]:
        if field in data:
            setattr(client, field, data[field])

    db.session.commit()
    return jsonify(client.to_dict())


@clients_bp.route("/api/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = db.session.get(Client, client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404

    db.session.delete(client)
    db.session.commit()
    return jsonify({"message": "Client deleted"})
