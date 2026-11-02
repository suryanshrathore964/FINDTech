# FINDtech

AI-powered full-stack laptop recommendation platform. React + Vite frontend, FastAPI backend, MongoDB Atlas, and an ML-based scoring engine for personalized matches.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, React Router |
| Backend | FastAPI, Motor (async MongoDB), Pydantic, scikit-learn |
| Database | MongoDB Atlas |
| Auth | JWT (Bearer tokens) |

## Project Structure

```
FINDtech/
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # UI + layout (glassmorphism, sidebar)
│       ├── context/          # Auth state
│       ├── pages/            # Route pages
│       ├── routes/           # Protected route guard
│       ├── services/         # API client
│       └── types/
├── backend/
│   └── app/
│       ├── api/v1/routers/   # HTTP routes (thin)
│       ├── controllers/      # Request orchestration
│       ├── services/         # Business logic
│       ├── repositories/     # MongoDB data access
│       ├── middleware/       # Logging, errors, request ID
│       ├── core/             # Security, deps, exceptions
│       ├── ml/               # Recommendation engine
│       └── schemas/          # Pydantic DTOs
└── README.md
```

## Features

- **AI recommendations** — Weighted multi-criteria scoring (budget, use case, portability, performance, battery, brands)
- **Glassmorphism UI** — White, blue, mint green, and soft yellow accent theme
- **Framer Motion** — Page transitions, animated gradients, sidebar collapse
- **Protected routes** — Dashboard, AI Recommend, Profile require authentication
- **Responsive layout** — Public pages + authenticated sidebar layout
- **Auto-seed catalog** — 15 laptops seeded on first API startup

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB Atlas URL and SECRET_KEY
python run.py
```

API runs at **http://localhost:8000**  
Docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173** (proxies `/api` to backend).

### Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `findtech`) |
| `SECRET_KEY` | JWT signing secret |
| `CORS_ORIGINS` | Allowed frontend origins |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default uses Vite proxy) |

## API Endpoints

See [backend/README.md](backend/README.md) for full API documentation.

| Area | Key paths |
|------|-----------|
| Auth | `POST /api/v1/auth/register`, `/login`, `GET /me` |
| Laptops | `GET /api/v1/laptops`, `/laptops/{id}` |
| Recommendations | `POST /api/v1/recommendations`, `GET /history`, `/history/{id}` |
| Comparison | `POST /api/v1/comparison` (2–4 laptops) |
| Analytics | `GET /api/v1/analytics/overview`, `/catalog`, `/trending`, `/user` |
| Filters | `GET /api/v1/filters/options`, `POST /filters/search` |

## ML Recommendation Engine

Located in `backend/app/ml/recommendation_engine.py`:

- Filters by budget, RAM, and storage minimums
- Normalizes laptop features with `MinMaxScaler`
- Applies use-case-specific weights (gaming, work, creative, student, everyday)
- Boosts for brand preference, use-case alignment, and user priority sliders
- Returns top 6 matches with human-readable reasons

## Production Deployment

Full step-by-step guide (Vercel + Render + MongoDB Atlas, env vars, JWT/CORS security, troubleshooting):

**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

Quick links:

| Service | Config |
|---------|--------|
| Frontend | `frontend/vercel.json`, `VITE_API_URL` on Vercel |
| Backend | `backend/render.yaml`, env from `backend/.env.production.example` |
| Database | MongoDB Atlas — see deployment guide §1 |

## License

MIT
