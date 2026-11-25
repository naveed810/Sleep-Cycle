# 🌙 Sleep Cycle™ Backend API

Commercial-quality Python backend service powering **Sleep Cycle™** intelligent sleep wellness and circadian recovery.

---

## ⚡ Technology Stack

- **Python 3.13**
- **FastAPI** (High-performance async web framework)
- **Pydantic v2** (Strict data validation and schema serialization)
- **SQLAlchemy 2.0** (Type-safe ORM with connection pooling)
- **PostgreSQL / Supabase** (Production relational database with RLS)
- **SQLite Fallback** (Zero-configuration local development and testing)
- **JWT Authentication** (RFC 7519 compliant JSON Web Tokens with salted bcrypt hashing)
- **Somna AI Sleep Coach** (Configurable AI engine: built-in clinical chronobiology reasoning + OpenAI/Gemini/Anthropic adapters)
- **Pytest** (Automated end-to-end integration and unit test suite)

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entrypoint & middleware
│   ├── core/
│   │   ├── config.py        # Environment variables & Pydantic settings
│   │   ├── database.py      # SQLAlchemy engine, sessionmaker & pool
│   │   └── security.py      # Password hashing (bcrypt) & JWT issuance
│   ├── models/
│   │   ├── user.py          # User profile & target preferences table
│   │   ├── sleep.py         # Sleep session & biometrics table
│   │   ├── alarm.py         # Smart alarm configurations table
│   │   └── goal.py          # Sleep goals & consistency targets table
│   ├── schemas/
│   │   ├── auth.py          # Auth requests & Token responses
│   │   ├── user.py          # User profile read & update schemas
│   │   ├── sleep.py         # Sleep session logs & active tracking schemas
│   │   ├── alarm.py         # Alarm CRUD schemas
│   │   ├── analytics.py     # Analytics summary & weekly report schemas
│   │   └── ai_coach.py      # AI chat, chronotypes & bedtime calculator
│   ├── services/
│   │   ├── auth_service.py      # Auth logic, seed demo user
│   │   ├── sleep_service.py     # Session recording & cycle calculation
│   │   ├── alarm_service.py     # Smart alarm management
│   │   ├── analytics_service.py # Aggregate biometrics & reports
│   │   └── ai_coach_service.py  # Sleep science AI reasoning engine
│   └── routers/
│       ├── auth.py          # /api/v1/auth
│       ├── users.py         # /api/v1/users
│       ├── sleep.py         # /api/v1/sleep
│       ├── alarms.py        # /api/v1/alarms
│       ├── analytics.py     # /api/v1/analytics
│       └── ai_coach.py      # /api/v1/coach
├── tests/                   # Pytest test suite
├── schema.sql               # Supabase PostgreSQL DDL with RLS policies
├── requirements.txt         # Python dependencies
├── .env.example             # Configuration template
└── README.md                # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (Python 3.13 tested and verified)
- `pip`

### 2. Setup Virtual Environment

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

To connect to your **Supabase PostgreSQL** database, edit `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

*Note: If `DATABASE_URL` is left as `sqlite:///./sleepcycle.db`, the server runs locally offline with zero configuration.*

### 5. Run Database Migrations (Optional for Supabase)
To run the schema on Supabase SQL Editor, copy and execute `schema.sql`.
When running locally, SQLAlchemy automatically initializes all tables on server startup.

### 6. Run the Development Server

```bash
# From the backend directory
uvicorn app.main:app --reload --port 8000
```

The server will be accessible at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Redoc Alternative Docs**: `http://localhost:8000/redoc`

---

## 🧪 Running Automated Tests

Run the complete pytest test suite:

```bash
pytest -v
```

---

## 🔐 Authentication & Demo Access

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Instant Demo Login**: `POST /api/v1/auth/demo-login` (returns a signed JWT for demo user Naveen with 14 nights of pre-populated sleep telemetry).
4. Protected endpoints require the header:
   ```
   Authorization: Bearer <access_token>
   ```
