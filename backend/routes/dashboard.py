from flask import Blueprint, jsonify
from datetime import datetime, timezone
from models import db, Client, Mission, Invoice

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    total_clients = Client.query.count()
    active_missions = Mission.query.filter_by(status="active").count()
    paid_invoices_query = Invoice.query.filter_by(status="paid")
    total_revenue = sum(i.total for i in paid_invoices_query.all())
    pending_invoices = Invoice.query.filter(Invoice.status.in_(["draft", "sent"])).count()
    overdue_invoices = Invoice.query.filter_by(status="overdue").count()
    paid_invoices = paid_invoices_query.count()

    # Recent activity: last 10 invoices and missions combined, sorted by date
    recent_invoices = Invoice.query.order_by(Invoice.created_at.desc()).limit(5).all()
    recent_missions = Mission.query.order_by(Mission.created_at.desc()).limit(5).all()

    activity = []
    for inv in recent_invoices:
        activity.append({
            "type": "invoice",
            "description": f"Invoice {inv.invoice_number} — {inv.client.name if inv.client else 'Unknown'}",
            "status": inv.status,
            "amount": inv.total,
            "date": inv.created_at.isoformat() if inv.created_at else None,
        })
    for m in recent_missions:
        activity.append({
            "type": "mission",
            "description": f"Mission: {m.title} — {m.client.name if m.client else 'Unknown'}",
            "status": m.status,
            "amount": m.amount,
            "date": m.created_at.isoformat() if m.created_at else None,
        })

    activity.sort(key=lambda x: x["date"] or "", reverse=True)

    return jsonify({
        "total_clients": total_clients,
        "active_missions": active_missions,
        "total_revenue": total_revenue,
        "pending_invoices": pending_invoices,
        "overdue_invoices": overdue_invoices,
        "paid_invoices": paid_invoices,
        "recent_activity": activity[:10],
    })
