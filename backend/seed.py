"""Seed script — populates the database with realistic demo data."""

import os
import sys
from datetime import date, timedelta

# Ensure we can import from the backend directory
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, Client, Mission, Invoice, PaymentFollowUp


def seed():
    with app.app_context():
        # Clear existing data (order matters for FK constraints)
        PaymentFollowUp.query.delete()
        Invoice.query.delete()
        Mission.query.delete()
        Client.query.delete()
        db.session.commit()

        # ── Clients ──────────────────────────────────────────
        clients = [
            Client(
                name="Sarah Chen",
                email="sarah@brightpixel.io",
                phone="+1 415-555-0101",
                company="BrightPixel Studios",
                billing_address="742 Market St, Suite 400\nSan Francisco, CA 94102",
                notes="Prefers Slack for communication. Net-30 payment terms.",
            ),
            Client(
                name="Marcus Johnson",
                email="marcus@greenleaforg.com",
                phone="+1 212-555-0142",
                company="GreenLeaf Organization",
                billing_address="88 Third Ave\nNew York, NY 10003",
                notes="Non-profit client. Requires detailed invoices for board approval.",
            ),
            Client(
                name="Elena Rodriguez",
                email="elena@velocityvc.com",
                phone="+1 650-555-0178",
                company="Velocity Ventures",
                billing_address="200 Sand Hill Rd\nMenlo Park, CA 94025",
                notes="Fast-moving startup. Quick turnaround expected.",
            ),
            Client(
                name="David Kim",
                email="david@artisanbrew.co",
                phone="+1 503-555-0199",
                company="Artisan Brew Co.",
                billing_address="1523 NW 23rd Ave\nPortland, OR 97210",
                notes="Small business owner. Budget-conscious but values quality.",
            ),
            Client(
                name="Amira Patel",
                email="amira@novaedu.org",
                phone="+1 617-555-0123",
                company="Nova Education",
                billing_address="50 Milk St\nBoston, MA 02109",
                notes="EdTech company. Often has follow-up projects.",
            ),
            Client(
                name="Julian Rossi",
                email="j.rossi@nexustech.it",
                phone="+44 20-7946-0958",
                company="Nexus Technologies",
                billing_address="21 Silicon Roundabout\nLondon, UK EC1V 2NX",
                notes="Enterprise software provider. Net-60 terms minimum.",
            ),
            Client(
                name="Keisha Washington",
                email="keisha@urbanscapes.co",
                phone="+1 312-555-0189",
                company="UrbanScapes Architecture",
                billing_address="400 N Michigan Ave\nChicago, IL 60611",
                notes="Architecture firm needing 3D rendering and web showcases.",
            ),
            Client(
                name="Liam O'Connor",
                email="liam.o@irishroasters.com",
                phone="+353 1-555-0199",
                company="Irish Roasters Coffee",
                billing_address="15 Grafton St\nDublin, Ireland",
                notes="Expanding coffee chain. Fast decision-making.",
            ),
            Client(
                name="Mei Lin",
                email="mlin@pacificlogistics.sg",
                phone="+65 6555-0144",
                company="Pacific Logistics",
                billing_address="8 Marina View\nSingapore 018960",
                notes="Shipping and logistics tracking tech. High budget.",
            ),
            Client(
                name="Omar Al-Fayed",
                email="omar@desertbloom.ae",
                phone="+971 4-555-0122",
                company="Desert Bloom Real Estate",
                billing_address="100 Sheikh Zayed Rd\nDubai, UAE",
                notes="Luxury real estate. Wants ultra-premium design work.",
            ),
        ]
        db.session.add_all(clients)
        db.session.flush()  # assigns IDs

        today = date.today()

        # ── Missions ─────────────────────────────────────────
        missions = [
            Mission(
                client_id=clients[0].id,
                title="E-commerce Website Redesign",
                description="Full redesign of the BrightPixel online store including new product pages, checkout flow, and mobile optimization.",
                start_date=today - timedelta(days=60),
                end_date=today - timedelta(days=10),
                amount=12000,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[0].id,
                title="SEO & Analytics Dashboard",
                description="Build an analytics dashboard with Google Analytics integration and SEO tracking for BrightPixel Studios.",
                start_date=today - timedelta(days=5),
                end_date=today + timedelta(days=25),
                amount=4500,
                currency="USD",
                status="active",
            ),
            Mission(
                client_id=clients[1].id,
                title="Donation Platform MVP",
                description="Develop a minimum viable product for an online donation platform with Stripe integration.",
                start_date=today - timedelta(days=90),
                end_date=today - timedelta(days=30),
                amount=8500,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[1].id,
                title="Annual Report Microsite",
                description="Interactive single-page annual report with data visualizations and downloadable PDF.",
                start_date=today - timedelta(days=15),
                end_date=today + timedelta(days=15),
                amount=3200,
                currency="USD",
                status="active",
            ),
            Mission(
                client_id=clients[2].id,
                title="Investor Portal",
                description="Secure portal for investors to view portfolio performance, documents, and communications.",
                start_date=today - timedelta(days=45),
                end_date=today - timedelta(days=5),
                amount=15000,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[2].id,
                title="Mobile App Prototype",
                description="Figma-to-React-Native prototype for the Velocity Ventures mobile application.",
                start_date=today + timedelta(days=5),
                end_date=today + timedelta(days=35),
                amount=7000,
                currency="USD",
                status="active",
            ),
            Mission(
                client_id=clients[3].id,
                title="Brand Identity & Website",
                description="Logo design, brand guidelines, and a WordPress website for Artisan Brew Co.",
                start_date=today - timedelta(days=120),
                end_date=today - timedelta(days=80),
                amount=5500,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[3].id,
                title="Online Ordering System",
                description="Build an online ordering and delivery scheduling system for local customers.",
                start_date=today - timedelta(days=20),
                end_date=today + timedelta(days=40),
                amount=6000,
                currency="USD",
                status="on_hold",
            ),
            Mission(
                client_id=clients[4].id,
                title="Learning Management System",
                description="Custom LMS with course creation, student progress tracking, and certification.",
                start_date=today - timedelta(days=70),
                end_date=today - timedelta(days=20),
                amount=18000,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[4].id,
                title="Student Mobile App",
                description="Cross-platform mobile app for students to access courses and track progress.",
                start_date=today - timedelta(days=10),
                end_date=today + timedelta(days=50),
                amount=9500,
                currency="USD",
                status="active",
            ),
            Mission(
                client_id=clients[5].id,
                title="SaaS Platform Migration",
                description="Migrate legacy CRM to a modern Cloud-native architecture on AWS.",
                start_date=today - timedelta(days=150),
                end_date=today - timedelta(days=10),
                amount=25000,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[5].id,
                title="GraphQL API Gateway",
                description="Implement a centralized GraphQL API to unify 5 microservices.",
                start_date=today - timedelta(days=5),
                end_date=today + timedelta(days=40),
                amount=12500,
                currency="USD",
                status="active",
            ),
            Mission(
                client_id=clients[6].id,
                title="Architecture Portfolio Redesign",
                description="High-end 3D WebGL integrated portfolio site to showcase UrbanScapes buildings.",
                start_date=today - timedelta(days=60),
                end_date=today - timedelta(days=5),
                amount=8000,
                currency="USD",
                status="completed",
            ),
            Mission(
                client_id=clients[7].id,
                title="E-Commerce Store Launch",
                description="Shopify Plus custom theme for global wholesale coffee bean distribution.",
                start_date=today - timedelta(days=45),
                end_date=today - timedelta(days=2),
                amount=11000,
                currency="EUR",
                status="completed",
            ),
            Mission(
                client_id=clients[7].id,
                title="Loyalty App Wireframes",
                description="Figma prototyping for the Irish Roasters customer loyalty mobile app.",
                start_date=today + timedelta(days=2),
                end_date=today + timedelta(days=20),
                amount=3500,
                currency="EUR",
                status="on_hold",
            ),
            Mission(
                client_id=clients[8].id,
                title="Global Shipment Tracker",
                description="Real-time map dashboard integrating 3rd-party logistics APIs.",
                start_date=today - timedelta(days=90),
                end_date=today - timedelta(days=10),
                amount=30000,
                currency="SGD",
                status="completed",
            ),
            Mission(
                client_id=clients[9].id,
                title="Luxury Villa Showcase Site",
                description="Cinematic real estate property tour website with immersive video headers.",
                start_date=today - timedelta(days=30),
                end_date=today + timedelta(days=30),
                amount=14000,
                currency="AED",
                status="active",
            ),
            Mission(
                client_id=clients[9].id,
                title="Agent Internal Portal",
                description="Internal dashboard for Desert Bloom brokers to manage listings.",
                start_date=today + timedelta(days=15),
                end_date=today + timedelta(days=60),
                amount=18000,
                currency="AED",
                status="on_hold",
            ),
        ]
        db.session.add_all(missions)
        db.session.flush()

        # ── Invoices ─────────────────────────────────────────
        invoices_data = [
            # Paid: BrightPixel Website Redesign
            dict(
                mission_id=missions[0].id,
                client_id=clients[0].id,
                invoice_number="INV-0001",
                issue_date=today - timedelta(days=50),
                due_date=today - timedelta(days=20),
                line_items=[
                    {"description": "UI/UX Design (40 hrs)", "amount": 4000},
                    {"description": "Frontend Development (60 hrs)", "amount": 6000},
                    {"description": "QA & Launch Support", "amount": 2000},
                ],
                tax_rate=0,
                status="paid",
            ),
            # Paid: GreenLeaf Donation Platform
            dict(
                mission_id=missions[2].id,
                client_id=clients[1].id,
                invoice_number="INV-0002",
                issue_date=today - timedelta(days=35),
                due_date=today - timedelta(days=5),
                line_items=[
                    {"description": "Backend Development", "amount": 4500},
                    {"description": "Stripe Integration", "amount": 2000},
                    {"description": "Testing & Deployment", "amount": 2000},
                ],
                tax_rate=0,
                status="paid",
            ),
            # Sent: Velocity Investor Portal
            dict(
                mission_id=missions[4].id,
                client_id=clients[2].id,
                invoice_number="INV-0003",
                issue_date=today - timedelta(days=10),
                due_date=today + timedelta(days=20),
                line_items=[
                    {"description": "Architecture & Design", "amount": 3000},
                    {"description": "Full-Stack Development", "amount": 9000},
                    {"description": "Security Audit", "amount": 2000},
                    {"description": "Deployment & Documentation", "amount": 1000},
                ],
                tax_rate=8.5,
                status="sent",
                cover_message="Hi Elena,\n\nPlease find attached the invoice for the Investor Portal project. All deliverables have been completed and deployed as discussed.\n\nPayment is due within 30 days.\n\nBest regards",
            ),
            # Overdue: Artisan Brew Brand & Website
            dict(
                mission_id=missions[6].id,
                client_id=clients[3].id,
                invoice_number="INV-0004",
                issue_date=today - timedelta(days=75),
                due_date=today - timedelta(days=45),
                line_items=[
                    {"description": "Logo & Brand Guidelines", "amount": 2000},
                    {"description": "WordPress Theme Development", "amount": 2500},
                    {"description": "Content Migration", "amount": 1000},
                ],
                tax_rate=0,
                status="overdue",
            ),
            # Overdue: Nova LMS
            dict(
                mission_id=missions[8].id,
                client_id=clients[4].id,
                invoice_number="INV-0005",
                issue_date=today - timedelta(days=25),
                due_date=today - timedelta(days=10),
                line_items=[
                    {"description": "LMS Core Development", "amount": 8000},
                    {"description": "Course Builder Module", "amount": 4000},
                    {"description": "Student Dashboard", "amount": 3500},
                    {"description": "Certification Engine", "amount": 2500},
                ],
                tax_rate=5,
                status="overdue",
                cover_message="Dear Amira,\n\nPlease find the invoice for the Learning Management System project. All modules have been delivered and are live.\n\nKindly process payment at your earliest convenience.\n\nThank you",
            ),
            # Draft: BrightPixel SEO Dashboard (in-progress mission)
            dict(
                mission_id=missions[1].id,
                client_id=clients[0].id,
                invoice_number="INV-0006",
                issue_date=today,
                due_date=today + timedelta(days=30),
                line_items=[
                    {"description": "Analytics Dashboard (deposit)", "amount": 2250},
                ],
                tax_rate=0,
                status="draft",
            ),
            # Draft: GreenLeaf Annual Report
            dict(
                mission_id=missions[3].id,
                client_id=clients[1].id,
                invoice_number="INV-0007",
                issue_date=today,
                due_date=today + timedelta(days=30),
                line_items=[
                    {"description": "Data Visualization Design", "amount": 1600},
                    {"description": "Interactive Development", "amount": 1600},
                ],
                tax_rate=0,
                status="draft",
            ),
            # Paid: Nexus Technologies SaaS Migration
            dict(
                mission_id=missions[10].id,
                client_id=clients[5].id,
                invoice_number="INV-0008",
                issue_date=today - timedelta(days=15),
                due_date=today + timedelta(days=15),
                line_items=[
                    {"description": "AWS Architecture Planning", "amount": 5000},
                    {"description": "Data Migration", "amount": 10000},
                    {"description": "Deployment & Load Testing", "amount": 10000},
                ],
                tax_rate=10,
                status="paid",
            ),
            # Overdue: UrbanScapes Portfolio
            dict(
                mission_id=missions[12].id,
                client_id=clients[6].id,
                invoice_number="INV-0009",
                issue_date=today - timedelta(days=40),
                due_date=today - timedelta(days=10),
                line_items=[
                    {"description": "WebGL Development", "amount": 5000},
                    {"description": "UI Implementation", "amount": 3000},
                ],
                tax_rate=0,
                status="overdue",
            ),
            # Sent: Irish Roasters E-Commerce
            dict(
                mission_id=missions[13].id,
                client_id=clients[7].id,
                invoice_number="INV-0010",
                issue_date=today - timedelta(days=2),
                due_date=today + timedelta(days=28),
                line_items=[
                    {"description": "Shopify Plus Theme Setup", "amount": 6000},
                    {"description": "Custom Checkout App", "amount": 5000},
                ],
                tax_rate=20,
                status="sent",
                cover_message="Hi Liam,\n\nThanks for your ongoing business! Here is the invoice for the recently completed Shopify store.\n\nCheers!",
            ),
            # Paid: Pacific Logistics Tracker
            dict(
                mission_id=missions[15].id,
                client_id=clients[8].id,
                invoice_number="INV-0011",
                issue_date=today - timedelta(days=25),
                due_date=today + timedelta(days=5),
                line_items=[
                    {"description": "Logistics Dashboard Backend", "amount": 15000},
                    {"description": "Real-time Maps Integration", "amount": 15000},
                ],
                tax_rate=0,
                status="paid",
            ),
            # Draft: Desert Bloom Real Estate
            dict(
                mission_id=missions[16].id,
                client_id=clients[9].id,
                invoice_number="INV-0012",
                issue_date=today,
                due_date=today + timedelta(days=30),
                line_items=[
                    {"description": "Cinematic Storyboarding (Deposit)", "amount": 7000},
                ],
                tax_rate=5,
                status="draft",
            ),
        ]

        invoices = []
        for inv_data in invoices_data:
            items = inv_data["line_items"]
            subtotal = round(sum(i["amount"] for i in items), 2)
            total = round(subtotal * (1 + inv_data["tax_rate"] / 100), 2)
            inv = Invoice(
                mission_id=inv_data["mission_id"],
                client_id=inv_data["client_id"],
                invoice_number=inv_data["invoice_number"],
                issue_date=inv_data["issue_date"],
                due_date=inv_data["due_date"],
                line_items=items,
                subtotal=subtotal,
                tax_rate=inv_data["tax_rate"],
                total=total,
                status=inv_data["status"],
                cover_message=inv_data.get("cover_message", ""),
            )
            db.session.add(inv)
            invoices.append(inv)

        db.session.flush()

        # ── Follow-ups on overdue invoices ───────────────────
        followups = [
            # Artisan Brew — INV-0004 (45 days overdue)
            PaymentFollowUp(
                invoice_id=invoices[3].id,
                follow_up_date=today - timedelta(days=30),
                message="Hi David,\n\nJust a friendly reminder that invoice INV-0004 for the Brand Identity & Website project is now past due. Could you let me know when we can expect payment?\n\nThanks!",
                tone="friendly",
                sent=True,
            ),
            PaymentFollowUp(
                invoice_id=invoices[3].id,
                follow_up_date=today - timedelta(days=15),
                message="Hi David,\n\nThis is a follow-up regarding invoice INV-0004 ($5,500) which is now 30 days overdue. I'd appreciate if you could arrange payment or let me know if there are any issues.\n\nPlease respond at your earliest convenience.\n\nBest regards",
                tone="firm",
                sent=True,
            ),
            PaymentFollowUp(
                invoice_id=invoices[3].id,
                follow_up_date=today - timedelta(days=2),
                message="Dear David,\n\nThis is a final notice regarding the outstanding invoice INV-0004 for $5,500. This payment is now 43 days overdue.\n\nIf payment is not received within 7 business days, I will need to explore other collection options.\n\nPlease treat this as urgent.\n\nRegards",
                tone="final",
                sent=False,
            ),
            # Nova Education — INV-0005 (10 days overdue)
            PaymentFollowUp(
                invoice_id=invoices[4].id,
                follow_up_date=today - timedelta(days=3),
                message="Hi Amira,\n\nI hope you're doing well! I wanted to check in on invoice INV-0005 for the LMS project. It looks like the payment date has passed — could you let me know the status?\n\nHappy to answer any questions.\n\nBest",
                tone="friendly",
                sent=True,
            ),
        ]
        db.session.add_all(followups)
        db.session.commit()

        print("✓ Seed data loaded successfully!")
        print(f"  • {len(clients)} clients")
        print(f"  • {len(missions)} missions")
        print(f"  • {len(invoices)} invoices")
        print(f"  • {len(followups)} follow-ups")


if __name__ == "__main__":
    seed()
