# AiMedico — AI-Powered Prescription & Medical Report Explainer

> ⚠️ **Not a medical device.** AiMedico is for educational purposes only. Always consult a qualified healthcare professional.

---

## Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Backend     | FastAPI (Python 3.11+), async SQLAlchemy |
| Database    | SQLite (dev) / PostgreSQL (prod)      |
| AI          | OpenAI GPT-4o                         |
| OCR         | Tesseract / EasyOCR                   |
| Auth        | JWT (access + refresh tokens)         |
| Frontend    | Next.js 14, Tailwind CSS, Shadcn/UI   |
| State       | Zustand + TanStack Query              |

---

## Backend Setup (aipart/)

### 1. Install Python dependencies

```bash
cd aipart
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Windows:** Download from https://github.com/UB-Mannheim/tesseract/wiki  
Set `TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe` in `.env`

**Linux:**
```bash
sudo apt install tesseract-ocr
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and other settings
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

---

## Frontend Setup (frontend/)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The frontend runs at: `http://localhost:3000`

---

## Architecture Overview

```
aipart/app/
├── core/          # Config, DB engine, security, logging, constants
├── api/           # FastAPI routers + dependency injection
├── models/        # SQLAlchemy ORM models
├── schemas/       # Pydantic request/response models
├── services/      # Business logic (AI, OCR, prescriptions)
├── prompts/       # OpenAI prompt templates
├── utils/         # File handling, OCR cleaning, validators
└── middleware/    # Error handlers
```

### AI Pipeline Flow

```
Upload → File saved → OCR (Tesseract/EasyOCR) → Text cleaned →
OpenAI GPT-4o → Structured JSON output → Emergency detection →
Saved to DB → Frontend polls for result
```

### Database Migration (to PostgreSQL)

Simply change `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/aimedico
```
No code changes needed. Run Alembic migrations in production.

---

## API Endpoints

| Method | Path                              | Auth | Description                    |
|--------|-----------------------------------|------|--------------------------------|
| POST   | /api/v1/auth/register             | ❌   | Register new user              |
| POST   | /api/v1/auth/login                | ❌   | Login + get JWT tokens         |
| POST   | /api/v1/auth/refresh              | ❌   | Refresh access token           |
| POST   | /api/v1/upload/prescription       | ✅   | Upload prescription file       |
| GET    | /api/v1/prescriptions             | ✅   | List user prescriptions        |
| GET    | /api/v1/prescriptions/{id}        | ✅   | Get prescription details       |
| DELETE | /api/v1/prescriptions/{id}        | ✅   | Delete prescription            |
| GET    | /api/v1/ai/result/{prescription_id}| ✅  | Get AI analysis result         |
| GET    | /api/v1/ai/medicine/{name}        | ✅   | Explain a medicine             |
| GET    | /api/v1/users/me                  | ✅   | Get current user profile       |
| PATCH  | /api/v1/users/me                  | ✅   | Update profile                 |
| POST   | /api/v1/users/me/change-password  | ✅   | Change password                |
| GET    | /health                           | ❌   | Health check                   |

---

## Safety & Disclaimer

AiMedico **never** pretends to be a doctor. Every AI response includes:
- `⚠️ This information is for educational purposes only.`
- `Always consult a qualified healthcare professional.`

Emergency keywords (chest pain, stroke, heart attack, etc.) trigger automatic high-priority warning banners.

---

## Roadmap

- [ ] Voice explanation (TTS)
- [ ] Medicine reminders (mobile push)
- [ ] Doctor chat integration
- [ ] RAG + medicine vector database
- [ ] Admin dashboard
- [ ] Subscription / billing
- [ ] Mobile app (React Native)
