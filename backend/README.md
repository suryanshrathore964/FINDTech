# FINDtech API

Production-ready FastAPI backend with clean architecture, MongoDB Atlas, and JWT authentication.

## Architecture

```
app/
├── main.py                 # App factory, middleware, lifespan
├── config.py               # Settings (pydantic-settings)
├── database.py             # Motor client + indexes
├── api/v1/
│   ├── router.py           # Aggregates all routers
│   └── routers/            # HTTP route definitions (thin)
├── controllers/            # Request orchestration
├── services/               # Business logic
├── repositories/           # Data access (MongoDB)
├── schemas/                # Pydantic DTOs
├── core/                   # Security, deps, exceptions
├── middleware/             # Logging, request ID, errors
└── ml/                     # Recommendation engine
```

**Flow:** `Router → Controller → Service → Repository → MongoDB`

## API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Sign in |
| GET | `/me` | Yes | Current user |

### Laptops (`/api/v1/laptops`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List with query filters |
| GET | `/brands/list` | No | Distinct brands |
| GET | `/{id}` | No | Laptop detail |

### Recommendations (`/api/v1/recommendations`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Generate AI matches |
| GET | `/history` | Yes | List sessions (paginated) |
| GET | `/history/{id}` | Yes | Session detail + laptops |
| DELETE | `/history/{id}` | Yes | Delete session |

### Comparison (`/api/v1/comparison`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Compare 2–4 laptops |

### Analytics (`/api/v1/analytics`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/overview` | No | Platform overview |
| GET | `/catalog` | No | Catalog statistics |
| GET | `/trending` | No | Top-rated laptops |
| GET | `/user` | Yes | User recommendation stats |

### Filters (`/api/v1/filters`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/options` | No | Available filter metadata |
| POST | `/search` | No | Advanced multi-criteria search |

## Setup

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set MONGODB_URL and SECRET_KEY
python run.py
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Environment

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `findtech`) |
| `SECRET_KEY` | JWT signing secret |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `ENVIRONMENT` | `development` or `production` |
| `DEBUG` | `true` / `false` |
| `ALLOWED_HOSTS` | Trusted Host header (Render hostname) |

## Production (Render)

See **[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** for full deployment.

- Blueprint: `render.yaml`
- Docker: `Dockerfile`
- Env template: `.env.production.example`
- Generate JWT secret: `python scripts/generate_secret.py` (from `backend/`)

Start command on Render:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
