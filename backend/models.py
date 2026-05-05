from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

MISSION_STATUSES = ["active", "completed", "on_hold", "cancelled"]
INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"]
FOLLOWUP_TONES = ["friendly", "firm", "final"]


class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(50))
    company = db.Column(db.String(200))
    billing_address = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    missions = db.relationship("Mission", backref="client", lazy=True, cascade="all, delete-orphan")
    invoices = db.relationship("Invoice", backref="client", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "billing_address": self.billing_address,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Mission(db.Model):
    __tablename__ = "missions"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    amount = db.Column(db.Float, default=0)
    currency = db.Column(db.String(10), default="USD")
    status = db.Column(db.String(20), default="active")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    invoices = db.relationship("Invoice", backref="mission", lazy=True)

    def __init__(self, **kwargs):
        if "status" in kwargs and kwargs["status"] not in MISSION_STATUSES:
            raise ValueError(f"Invalid mission status. Must be one of: {MISSION_STATUSES}")
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "client_name": self.client.name if self.client else None,
            "title": self.title,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


def _generate_invoice_number(context):
    params = context.get_current_parameters()
    # If invoice_number was explicitly provided, use it
    if params.get("invoice_number"):
        return params["invoice_number"]
    db_session = db.session
    last = db_session.query(Invoice).order_by(Invoice.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return f"INV-{next_num:04d}"


class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    mission_id = db.Column(db.Integer, db.ForeignKey("missions.id"), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    invoice_number = db.Column(db.String(20), unique=True, default=_generate_invoice_number)
    issue_date = db.Column(db.Date)
    due_date = db.Column(db.Date)
    line_items = db.Column(db.JSON, default=list)
    subtotal = db.Column(db.Float, default=0)
    tax_rate = db.Column(db.Float, default=0)
    total = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default="draft")
    cover_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    follow_ups = db.relationship("PaymentFollowUp", backref="invoice", lazy=True, cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        if "status" in kwargs and kwargs["status"] not in INVOICE_STATUSES:
            raise ValueError(f"Invalid invoice status. Must be one of: {INVOICE_STATUSES}")
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "mission_id": self.mission_id,
            "client_id": self.client_id,
            "client_name": self.client.name if self.client else None,
            "mission_title": self.mission.title if self.mission else None,
            "invoice_number": self.invoice_number,
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "line_items": self.line_items,
            "subtotal": self.subtotal,
            "tax_rate": self.tax_rate,
            "total": self.total,
            "status": self.status,
            "cover_message": self.cover_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PaymentFollowUp(db.Model):
    __tablename__ = "payment_follow_ups"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=False)
    follow_up_date = db.Column(db.Date)
    message = db.Column(db.Text)
    tone = db.Column(db.String(20), default="friendly")
    sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __init__(self, **kwargs):
        if "tone" in kwargs and kwargs["tone"] not in FOLLOWUP_TONES:
            raise ValueError(f"Invalid follow-up tone. Must be one of: {FOLLOWUP_TONES}")
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "invoice_number": self.invoice.invoice_number if self.invoice else None,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "message": self.message,
            "tone": self.tone,
            "sent": self.sent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
