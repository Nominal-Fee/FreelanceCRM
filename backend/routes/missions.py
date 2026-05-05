from flask import Blueprint, request, jsonify
from datetime import date
from models import db, Mission, Client, MISSION_STATUSES

missions_bp = Blueprint("missions", __name__)


@missions_bp.route("/api/missions", methods=["GET"])
def get_missions():
    missions = Mission.query.order_by(Mission.created_at.desc()).all()
    return jsonify([m.to_dict() for m in missions])


@missions_bp.route("/api/missions/<int:mission_id>", methods=["GET"])
def get_mission(mission_id):
    mission = db.session.get(Mission, mission_id)
    if not mission:
        return jsonify({"error": "Mission not found"}), 404
    data = mission.to_dict()
    data["invoices"] = [i.to_dict() for i in mission.invoices]
    return jsonify(data)


@missions_bp.route("/api/missions", methods=["POST"])
def create_mission():
    data = request.get_json()
    if not data or not data.get("client_id") or not data.get("title"):
        return jsonify({"error": "client_id and title are required"}), 400

    client = db.session.get(Client, data["client_id"])
    if not client:
        return jsonify({"error": "Client not found"}), 404

    status = data.get("status", "active")
    if status not in MISSION_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {MISSION_STATUSES}"}), 400

    mission = Mission(
        client_id=data["client_id"],
        title=data["title"],
        description=data.get("description"),
        start_date=date.fromisoformat(data["start_date"]) if data.get("start_date") else None,
        end_date=date.fromisoformat(data["end_date"]) if data.get("end_date") else None,
        amount=data.get("amount", 0),
        currency=data.get("currency", "USD"),
        status=status,
    )
    db.session.add(mission)
    db.session.commit()
    return jsonify(mission.to_dict()), 201


@missions_bp.route("/api/missions/<int:mission_id>", methods=["PUT"])
def update_mission(mission_id):
    mission = db.session.get(Mission, mission_id)
    if not mission:
        return jsonify({"error": "Mission not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "status" in data and data["status"] not in MISSION_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {MISSION_STATUSES}"}), 400

    for field in ["title", "description", "amount", "currency", "status"]:
        if field in data:
            setattr(mission, field, data[field])

    if "client_id" in data:
        client = db.session.get(Client, data["client_id"])
        if not client:
            return jsonify({"error": "Client not found"}), 404
        mission.client_id = data["client_id"]

    if "start_date" in data:
        mission.start_date = date.fromisoformat(data["start_date"]) if data["start_date"] else None
    if "end_date" in data:
        mission.end_date = date.fromisoformat(data["end_date"]) if data["end_date"] else None

    db.session.commit()
    return jsonify(mission.to_dict())


@missions_bp.route("/api/missions/<int:mission_id>", methods=["DELETE"])
def delete_mission(mission_id):
    mission = db.session.get(Mission, mission_id)
    if not mission:
        return jsonify({"error": "Mission not found"}), 404

    db.session.delete(mission)
    db.session.commit()
    return jsonify({"message": "Mission deleted"})
