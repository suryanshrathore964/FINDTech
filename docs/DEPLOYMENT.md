# FINDtech — Production Deployment Guide

Complete setup for deploying FINDtech to **Vercel** (React frontend), **Render** (FastAPI backend), and **MongoDB Atlas** (database).

---

## Architecture

```mermaid
flowchart LR
  User[Browser] --> Vercel[Vercel CDN]
  Vercel -->|VITE_API_URL HTTPS| Render[Render Web Service]
  Render --> Atlas[(MongoDB Atlas)]
```

| Component | Host | URL pattern |
|-----------|------|-------------|
| Frontend | Vercel | `https://your-app.vercel.app` |
| API | Render | `https://findtech-api.onrender.com` |
| Database | MongoDB Atlas | `mongodb+srv://...` |

---

## Prerequisites

- GitHub account with FINDtech repository pushed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier cluster
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account

---

## 1. MongoDB Atlas

### 1.1 Create cluster

1. Atlas → **Build a Database** → **M0 Free**.
2. Choose region close to your Render region (e.g. `Oregon` / `us-west-2`).
3. Cluster name: e.g. `findtech-cluster`.

### 1.2 Database user

1. **Database Access** → **Add New Database User**.
2. Authentication: **Password**.
3. Username: `findtech_app` (example).
4. Password: generate a strong password (save it).
5. Privileges: **Read and write to any database** (or restrict to `findtech`).

### 1.3 Network access

Render uses dynamic IPs. For free tier:

1. **Network Access** → **Add IP Address**.
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`).

> For stricter security on paid plans, use Render static outbound IPs or a VPC peering setup.

### 1.4 Connection string

1. **Database** → **Connect** → **Drivers** → **Python** → copy connection string.
2. Replace `<password>` with your user password (URL-encode special characters).
3. Append database name if missing:

```
mongodb+srv://findtech_app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/findtech?retryWrites=true&w=majority
```

Store this as `MONGODB_URL` on Render (never commit to Git).

### 1.5 Indexes

Indexes are created automatically on API startup via `app/database.py`. No manual setup required.

---

## 2. GitHub repository setup

### 2.1 Push monorepo

```bash
cd /path/to/FINDtech
git init
git add .
git commit -m "Initial FINDtech production-ready release"
git branch -M main
git remote add origin https://github.com/YOUR_USER/findtech.git
git push -u origin main
```

### 2.2 What must NOT be committed

- `backend/.env`
- `frontend/.env`
- Any file containing real `SECRET_KEY`, MongoDB passwords, or API keys

`.gitignore` already excludes `.env` files. Use `.env.example` and `.env.production.example` as templates.

### 2.3 CI (optional)

GitHub Actions workflow at `.github/workflows/ci.yml` runs frontend build and backend import checks on push/PR.

---

## 3. Render — FastAPI backend

### 3.1 Create Web Service

1. Render Dashboard → **New** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:

| Setting | Value |
|---------|--------|
| **Name** | `findtech-api` |
| **Region** | Same as Atlas when possible |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |

Alternatively, use the Blueprint: **New** → **Blueprint** → point to `backend/render.yaml`.

### 3.2 Environment variables (Render)

Copy from `backend/.env.production.example`:

| Key | Example / notes |
|-----|-----------------|
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `APP_NAME` | `FINDtech API` |
| `MONGODB_URL` | Atlas connection string |
| `MONGODB_DB_NAME` | `findtech` |
| `SECRET_KEY` | 48+ char random (see below) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `ALLOWED_HOSTS` | `findtech-api.onrender.com` |

Generate `SECRET_KEY`:

```bash
cd backend
python -c "from app.config import generate_secret_key; print(generate_secret_key())"
```

### 3.3 Deploy and verify

1. Click **Deploy** and wait for build to finish.
2. Open `https://findtech-api.onrender.com/health` — expect:

```json
{"status":"ok","service":"FINDtech API","version":"1.0.0","environment":"production"}
```

3. OpenAPI docs (`/docs`) are **disabled** in production for security.

### 3.4 Docker deploy (optional)

```bash
cd backend
docker build -t findtech-api .
docker run -p 8000:8000 --env-file .env.production findtech-api
```

### 3.5 Free tier cold starts

Render free services spin down after inactivity. First request may take **30–60 seconds**. Upgrade to a paid plan for always-on instances.

---

## 4. Vercel — React frontend

### 4.1 Import project

1. Vercel Dashboard → **Add New** → **Project**.
2. Import GitHub repo.
3. Configure:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

`frontend/vercel.json` already configures SPA rewrites and asset caching.

### 4.2 Environment variables (Vercel)

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://findtech-api.onrender.com/api/v1` |

Apply to **Production**, **Preview**, and **Development** as needed.

> `VITE_*` variables are baked in at **build time**. After changing them, **redeploy** the frontend.

### 4.3 Custom domain (optional)

1. Vercel → Project → **Settings** → **Domains**.
2. Add your domain and follow DNS instructions.
3. Update Render `CORS_ORIGINS` to include `https://yourdomain.com`.

### 4.4 Deploy and verify

1. Visit your Vercel URL.
2. Register a test account.
3. Confirm dashboard and recommendations load (API calls in Network tab should hit Render, not `localhost`).

---

## 5. Security configuration

### 5.1 JWT

| Item | Production requirement |
|------|------------------------|
| `SECRET_KEY` | ≥ 32 characters, cryptographically random |
| `ALGORITHM` | `HS256` (default) |
| Token storage | `localStorage` (`findtech_token`) — frontend |
| Header | `Authorization: Bearer <token>` |

API validates JWT on protected routes via `app/core/deps.py`. Invalid/expired tokens return **401**; frontend redirects to `/login`.

### 5.2 API security

- **Passwords**: bcrypt hashed (`app/core/security.py`).
- **OpenAPI UI**: disabled when `ENVIRONMENT=production`.
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, CSP (API responses).
- **Trusted hosts**: `ALLOWED_HOSTS` restricts Host header on production.
- **Request ID**: `X-Request-ID` on every response for log correlation.

### 5.3 CORS

Backend only accepts origins listed in `CORS_ORIGINS` (comma-separated, exact URLs).

**Required for production:**

```
CORS_ORIGINS=https://your-app.vercel.app
```

For Vercel preview deployments, add each preview URL or your team's preview pattern:

```
CORS_ORIGINS=https://findtech.vercel.app,https://findtech-git-feature-you.vercel.app
```

Do **not** use `*` in production — startup validation will fail.

### 5.4 MongoDB

- Dedicated app user (not Atlas admin).
- Strong password, rotated periodically.
- Enable Atlas **backup** on production clusters.
- Monitor **Metrics** and set alerts for connections/storage.

---

## 6. Environment variable reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `ENVIRONMENT` | Yes | `production` |
| `DEBUG` | Yes | `false` |
| `MONGODB_URL` | Yes | Atlas SRV connection string |
| `MONGODB_DB_NAME` | Yes | `findtech` |
| `SECRET_KEY` | Yes | JWT signing secret (≥32 chars) |
| `CORS_ORIGINS` | Yes | Vercel URL(s), comma-separated |
| `ALLOWED_HOSTS` | Yes | Render hostname |
| `ALGORITHM` | No | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `10080` |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Full API base including `/api/v1` |

---

## 7. Production optimization

### Frontend (Vite)

- Production build: `npm run build` (tree-shaking, minification).
- `vercel.json` sets long cache on `/assets/*`.
- Manual chunks for React and Recharts (see `vite.config.ts`).

### Backend (Render)

- Single Uvicorn worker on free tier (sufficient for MVP).
- Paid tier: `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
- Health check: `/health` keeps service warm when configured.

### Database

- Atlas M0 is fine for demos; scale to M10+ for production traffic.
- Ensure indexes exist (auto-created on startup).

---

## 8. End-to-end deployment checklist

- [ ] MongoDB Atlas cluster + user + `0.0.0.0/0` network access
- [ ] `MONGODB_URL` set on Render
- [ ] `SECRET_KEY` generated and set on Render
- [ ] `ENVIRONMENT=production`, `DEBUG=false` on Render
- [ ] `CORS_ORIGINS` includes exact Vercel URL
- [ ] `ALLOWED_HOSTS` matches Render hostname
- [ ] Render deploy green; `/health` returns OK
- [ ] `VITE_API_URL` set on Vercel (Render URL + `/api/v1`)
- [ ] Vercel redeployed after env change
- [ ] Register/login works from production frontend
- [ ] Recommendations and dashboard load data

---

## 9. Troubleshooting

### CORS error in browser console

```
Access to XMLHttpRequest at 'https://findtech-api.onrender.com/...' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Fix:**

1. Add exact frontend origin to Render `CORS_ORIGINS` (no trailing slash).
2. Redeploy Render after env change.
3. Ensure `https://` matches (not `http://`).

---

### API requests go to wrong URL / 404 on Vercel

**Symptoms:** Network tab shows requests to `your-app.vercel.app/api/v1/...` instead of Render.

**Fix:**

1. Set `VITE_API_URL=https://findtech-api.onrender.com/api/v1` on Vercel.
2. **Redeploy** frontend (Vite embeds env at build time).

---

### 401 Unauthorized on all protected routes

**Causes:**

- Expired or invalid JWT
- `SECRET_KEY` changed on Render (invalidates all existing tokens)
- Token not sent (check `Authorization` header in Network tab)

**Fix:**

1. Log out and log in again.
2. Clear `localStorage` keys `findtech_token`, `findtech_user`.
3. Do not rotate `SECRET_KEY` without expecting all users to re-login.

---

### 500 on startup / service won't start

**Check Render logs for:**

- `Production config error` — fix `SECRET_KEY` length, `DEBUG`, or `CORS_ORIGINS`
- MongoDB connection timeout — verify Atlas network access and `MONGODB_URL`
- Invalid password in connection string — URL-encode `@`, `#`, `%` in password

---

### MongoDB connection timeout

1. Atlas → **Network Access** → confirm `0.0.0.0/0` (or Render static IP).
2. Verify username/password in connection string.
3. Cluster not paused (Atlas free tier pauses after 60 days inactivity).

---

### Render health check failing

1. Health path must be `/health` (not `/api/v1/health`).
2. Start command must bind `0.0.0.0` and use `$PORT`.
3. Check build logs for `pip install` failures.

---

### Slow first request (30–60s)

Render free tier **cold start**. Options:

- Upgrade plan
- Use a cron ping service to hit `/health` every 14 minutes (free tier workaround)
- Accept delay on first visit after idle period

---

### Registration works locally but not in production

1. Confirm frontend uses production `VITE_API_URL`.
2. Check CORS and network tab for failed `POST /api/v1/auth/register`.
3. Verify MongoDB user has write permissions.

---

### OpenAPI /docs not available

Expected in production (`ENVIRONMENT=production`). Use local dev or temporarily set `ENVIRONMENT=development` only for debugging (not recommended on public Render).

---

## 10. Updating production

| Change | Action |
|--------|--------|
| Backend code | Push to `main` → Render auto-deploys |
| Backend env | Render Dashboard → Environment → Save → Manual redeploy |
| Frontend code | Push to `main` → Vercel auto-deploys |
| Frontend API URL | Update Vercel env → **Redeploy** |
| New Vercel preview URL | Add to Render `CORS_ORIGINS` |

---

## 11. Quick reference URLs

After deployment, replace placeholders:

| Resource | URL |
|----------|-----|
| Frontend | `https://YOUR_APP.vercel.app` |
| API health | `https://findtech-api.onrender.com/health` |
| API base | `https://findtech-api.onrender.com/api/v1` |
| Atlas | MongoDB Atlas dashboard |

---

## Related files

| File | Purpose |
|------|---------|
| `backend/render.yaml` | Render Blueprint |
| `backend/Dockerfile` | Container deploy |
| `backend/.env.production.example` | Render env template |
| `frontend/vercel.json` | Vercel SPA + headers |
| `frontend/.env.production.example` | Vercel env template |
| `.github/workflows/ci.yml` | CI pipeline |
