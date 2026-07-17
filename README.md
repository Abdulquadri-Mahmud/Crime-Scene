# Web-Based Community Crime Scene Reporting System

A crime incident reporting and case-tracking platform, built for the ND2 final year
project of Moronfoye Heritage Bolarinwa (Computer Science, Gateway ICT Polytechnic
Saapade), implemented with **Next.js, Node.js/Express, and MongoDB** (Python included
as an optional analytics utility).

See **`ARCHITECTURE.md`** for the full system design, data model, and request flows.

---

## What this system does

- Community members can **file a crime report** (anonymously or with contact details),
  optionally attaching photo/PDF evidence.
- Every report gets a unique **tracking ID** (e.g. `CR-2026-000482`) that the reporter
  can use to check its status later — without needing to create an account.
- Officers/admins sign in to a **dashboard** to review incoming reports, filter/search
  them, and move each one through a controlled status lifecycle:
  `received → under_review → investigating → resolved/closed`.
- Every status change is timestamped and logged, so there's a full audit trail —
  directly answering the "manual records get lost" problem from Chapter 1.

---

## Project structure

```
crime-reporting-system/
├── ARCHITECTURE.md       # full design document — read this first
├── README.md             # you are here
├── backend/               # Express + MongoDB REST API
├── frontend/               # Next.js (App Router, TypeScript, Tailwind) UI
└── analytics/               # optional Python crime-trend CSV report generator
```

---

## Prerequisites

- Node.js 18+ and npm
- A MongoDB connection string — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster, or
  - a local MongoDB instance (`mongodb://localhost:27017/crime_reporting_db`)
- Python 3.9+ (only if you want to run the optional analytics script)

---

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET to real values
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's running.

**Create your first officer/admin account** (there's no public sign-up for this role):

```bash
node seed/createAdmin.js "Officer Bello" officer@example.com StrongPass123
```

**Run the automated tests** (uses an in-memory MongoDB, no Atlas connection needed):

```bash
npm test
```

---

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL should point at your running backend, e.g. http://localhost:5000
npm install
npm run dev
```

Visit `http://localhost:3000`:
- `/report/new` — file a report
- `/report/track` — track a report by tracking ID + contact
- `/admin/login` — officer/admin sign in → `/admin/dashboard`

---

## 3. Optional: Python analytics report

Generates a CSV summary of report volume by crime type, area, month, and status —
useful for the kind of "monitor crime trends over time" evaluation your Chapter 1.5
describes.

```bash
cd analytics
pip install -r requirements.txt
python crime_trends.py --mongo-uri "your-mongo-connection-string" --out trends.csv
```

---

## Deploying

- **Frontend** → [Vercel](https://vercel.com) (native Next.js support).
- **Backend** → [Render](https://render.com) or [Railway](https://railway.app) (any Node 18+ host works).
- **Database** → MongoDB Atlas free tier is sufficient for an ND-project scale.

Set `CLIENT_URL` in the backend `.env` to your deployed frontend origin (for CORS),
and `NEXT_PUBLIC_API_URL` in the frontend to your deployed backend URL.

---

## Notes for your project defence

- `ARCHITECTURE.md` §6 ("No flaws / no lag / no crashes") lists the specific
  reliability practices used — input validation at three layers, transactional
  status updates, rate limiting, centralized error handling — which map directly
  onto your Chapter 1 problem statement and objectives.
- `backend/tests/report.test.js` is a working, runnable test suite you can point
  to as evidence of testing/evaluation (Chapter 3/4 material).
- If your supervisor expects the write-up (Chapter 1.3–1.6, operational
  definitions) to name the exact technologies used in the code, update those
  sections to say Next.js/Express/MongoDB instead of HTML5+CSS3/PHP/MySQL —
  happy to help revise that text separately.
"# Crime-Scene" 
