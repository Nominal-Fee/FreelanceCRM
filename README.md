# 🚀 FreelanceFlow

**AI-Powered CRM for Freelancers** — manage clients, missions, invoices, and payment follow-ups with an integrated AI business assistant.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Client Management** | Full CRUD operations with AI-generated client summaries and revenue insights |
| **Mission Tracking** | Status workflows (planned → in progress → completed), natural-language AI parsing to create missions |
| **Invoice Generation** | Line-item invoices with tax calculation, AI-written cover messages, and PDF export |
| **Payment Follow-Up** | AI-generated follow-up emails with tone selection (friendly / firm / final) and timeline history |
| **AI Business Assistant** | Chat interface to ask questions about your freelance business data in real time |
| **Dashboard** | Revenue overview, overdue invoice alerts, and recent activity feed |
| **Search & Filter** | Full-text search and status tab filtering across all list pages |

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 7 | Single-page app with client-side routing |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Icons** | Lucide React | Modern icon library |
| **Backend** | Python Flask | Lightweight REST API server |
| **CORS** | Flask-CORS | Cross-origin request handling |
| **ORM** | SQLAlchemy | Database models & migrations |
| **Database** | SQLite | Auto-created on first run (zero config) |
| **AI Layer** | OpenAI Python SDK | Pointed at OpenRouter (free-tier models) |
| **Containerization** | Docker + Docker Compose | Multi-service deployment (frontend, backend, PostgreSQL) |
| **CI/CD** | GitHub Actions | Automated Docker build & test on push |

---

## 📋 Prerequisites

- **Python 3.x** (3.10+ recommended)
- **Node.js** (18+ recommended, includes `npm`)
- **Git**

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Nominal-Fee/FreelanceCRM.git
cd FreelanceCRM
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
LLM_MODEL=stepfun/step-3.5-flash:free
```

> **Tip:** Get a free API key at [openrouter.ai](https://openrouter.ai/). The app works fully without a key — AI features will show a graceful "AI service unavailable" message.

#### Run the Backend

```bash
python app.py
```

The backend server starts on **http://localhost:5000**. The SQLite database (`freelanceflow.db`) is auto-created on first run.

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts on **http://localhost:5173**.

---

## 🌐 Accessing the App

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000/api](http://localhost:5000/api) |
| **Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## 🌱 Seeding Demo Data

To populate the database with sample data (5 clients, 10 missions, 7 invoices, and 4 follow-ups):

```bash
cd backend

# Activate your virtual environment first, then:
python seed.py
```

This gives you a realistic dataset to explore all features immediately.

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes (for AI features) | — | API key from [OpenRouter](https://openrouter.ai/) |
| `LLM_MODEL` | No | `nvidia/nemotron-3-super-120b-a12b:free` | LLM model identifier (e.g. `stepfun/step-3.5-flash:free`) |
| `DATABASE_URL` | No | `sqlite:///freelanceflow.db` | Database connection string (SQLite by default, PostgreSQL for Docker) |

---

## 📁 Project Structure

```
Open-Freelance-Flow/
├── backend/                     Flask API server
│   ├── app.py                   Application entry point & server config
│   ├── models.py                SQLAlchemy models (Client, Mission, Invoice, PaymentFollowUp)
│   ├── seed.py                  Demo data seeder script
│   ├── ai_service.py            LLM integration layer (OpenRouter / OpenAI compatible)
│   ├── routes/
│   │   ├── __init__.py          Blueprint registration
│   │   ├── clients.py           Client CRUD endpoints
│   │   ├── missions.py          Mission CRUD endpoints
│   │   ├── invoices.py          Invoice + follow-up endpoints
│   │   ├── dashboard.py         Dashboard aggregation endpoint
│   │   └── ai.py                AI-powered endpoints
│   ├── requirements.txt         Python dependencies
│   ├── Dockerfile               Backend container definition
│   ├── start.sh                 Container startup script
│   ├── .env.example             Environment variable template
│   └── .env                     Local environment config (git-ignored)
│
├── frontend/                    React + Vite + Tailwind CSS
│   ├── index.html               HTML entry point
│   ├── package.json             Node.js dependencies & scripts
│   ├── vite.config.js           Vite dev server & proxy config
│   ├── Dockerfile               Frontend container definition
│   └── src/
│       ├── main.jsx             React DOM entry point
│       ├── App.jsx              Router & page layout
│       ├── api.js               Centralized API client
│       ├── index.css            Global styles & Tailwind imports
│       ├── components/
│       │   ├── Layout.jsx       Sidebar + topbar + connection status banner
│       │   ├── UI.jsx           Reusable UI components (buttons, cards, modals)
│       │   └── Toast.jsx        Toast notification system
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── ClientsPage.jsx
│       │   ├── ClientDetailPage.jsx
│       │   ├── MissionsPage.jsx
│       │   ├── MissionDetailPage.jsx
│       │   ├── InvoicesPage.jsx
│       │   ├── InvoiceDetailPage.jsx
│       │   └── AssistantPage.jsx
│       └── utils/
│           └── pdf.js           Invoice PDF generation utility
│
├── .github/
│   └── workflows/
│       └── docker-build-test.yml   CI pipeline: build & test Docker containers
│
├── docker-compose.yml           Multi-service orchestration (frontend, backend, PostgreSQL)
├── .gitignore                   Git ignore rules
└── README.md                    This file
```

---

## 🐳 Docker Deployment (Optional)

To run the full stack with Docker:

```bash
docker-compose up --build
```

This starts three services:
- **Frontend** on port `5173`
- **Backend** on port `5000`
- **PostgreSQL** database on port `5432`

---

## 👥 Team Members

| Member | Role | Contributions |
|--------|------|---------------|
|        |      |               |
|        |      |               |
|        |      |               |

---

## 📄 License

This project is for educational purposes.
