# Web-Based Community Crime Scene Reporting System
### System Architecture & Design Document
**Author:** Moronfoye Heritage Bolarinwa (24010211234)
**Department:** Computer Science, Gateway (ICT) Polytechnic Saapade
**Stack:** Next.js (frontend) · Node.js/Express (API) · MongoDB (database) · Python (optional analytics microservice)

---

## 1. Why the stack changed from the proposal

Your project report specifies HTML5/CSS3/PHP/MySQL. This document keeps every objective, research question, and scope item from Chapter 1 intact, but re-implements the same system on a stack that is easier to deploy for free, easier to secure, and closer to what employers now expect from a Computer Science graduate:

| Original | Modernized | Reason |
|---|---|---|
| HTML5 + CSS3 (static) | **Next.js 14 (React, App Router)** | Component-based UI, built-in routing, server rendering, one codebase for citizen portal + admin dashboard |
| PHP | **Node.js + Express (REST API)** | Same event-driven language (JavaScript) on both ends of the stack, huge ecosystem, easy JWT auth |
| MySQL (relational) | **MongoDB (document store)** | Crime reports have variable, nested fields (evidence files, status history, witness info) that map naturally to documents; horizontal scaling is simpler for a growing report archive |
| — | **Python (optional)** | A small FastAPI/Flask microservice for crime-hotspot analytics or report-text classification (spam/duplicate detection) — not required for core functionality, listed as a stretch goal |

This satisfies your objectives 1–4 and research questions 1–4 exactly, just implemented with modern tools.

---

## 2. High-Level Architecture

```
                         ┌────────────────────────────────────────┐
                         │              CLIENT LAYER               │
                         │   Next.js 14 App (React, TypeScript)     │
                         │  - Public: Home, Submit Report, Track    │
                         │  - Auth: Community login/register        │
                         │  - Admin: Dashboard, report management    │
                         └───────────────────┬──────────────────────┘
                                             │ HTTPS (Axios / fetch)
                                             │ JWT in Authorization header
                         ┌───────────────────▼──────────────────────┐
                         │              API LAYER (Express)         │
                         │  /api/auth      - register/login/refresh │
                         │  /api/reports   - CRUD + status/tracking │
                         │  /api/admin     - manage reports/users   │
                         │  /api/uploads   - evidence file handling │
                         │  Middleware: JWT auth, role guard,       │
                         │  rate-limiter, validator, error handler  │
                         └───────────────────┬──────────────────────┘
                                             │ Mongoose ODM
                         ┌───────────────────▼──────────────────────┐
                         │            DATABASE LAYER (MongoDB)      │
                         │  Collections: users, reports,            │
                         │  statuslogs, notifications               │
                         └────────────────────────────────────────────┘
                                             │ (optional async call)
                         ┌───────────────────▼──────────────────────┐
                         │      PYTHON ANALYTICS SERVICE (optional) │
                         │  FastAPI: crime hotspot clustering,       │
                         │  duplicate/spam detection on report text  │
                         └────────────────────────────────────────────┘
```

**Deployment mapping (all free-tier friendly):**
- Frontend → Vercel
- API → Render / Railway
- Database → MongoDB Atlas (free M0 cluster)
- File storage → Cloudinary (free tier) or local `/uploads` for the ND defence demo

---

## 3. Core Functional Modules (maps 1:1 to your objectives)

1. **Report submission module** — public form, no login required (with optional account for tracking history), generates a unique tracking ID.
2. **Report tracking module** — citizen enters tracking ID + phone/email to see status timeline (`Received → Under Review → Investigating → Resolved/Closed`).
3. **Authentication module** — community accounts (optional) and law-enforcement/admin accounts (mandatory, role-based).
4. **Admin/records management module** — list, filter, search, update status, add internal notes, assign officer, export reports.
5. **Notification module** — email (or in-app) alert when a report's status changes.
6. **Audit/status-history module** — every status change is logged with timestamp + actor, satisfying the "no backup, records get lost" problem from your Statement of the Problem.

---

## 4. Database Design (MongoDB Collections)

### 4.1 `users`
```js
{
  _id: ObjectId,
  fullName: String,
  email: String,        // unique
  phone: String,
  passwordHash: String,
  role: "citizen" | "officer" | "admin",
  isVerified: Boolean,
  createdAt: Date
}
```

### 4.2 `reports`
```js
{
  _id: ObjectId,
  trackingId: String,          // e.g. CR-2026-000482, unique, shown to reporter
  reporter: {
    userId: ObjectId | null,   // null if submitted anonymously
    name: String,
    phone: String,
    email: String,
    isAnonymous: Boolean
  },
  incident: {
    type: String,              // e.g. "Theft", "Assault", "Vandalism"
    description: String,
    location: {
      address: String,
      area: String,
      lat: Number,
      lng: Number
    },
    dateOfIncident: Date,
    evidenceFiles: [ { url: String, type: String } ]
  },
  status: "received" | "under_review" | "investigating" | "resolved" | "closed",
  priority: "low" | "medium" | "high",
  assignedOfficer: ObjectId | null,
  statusHistory: [
    { status: String, note: String, changedBy: ObjectId, changedAt: Date }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 `notifications`
```js
{
  _id: ObjectId,
  reportId: ObjectId,
  recipientEmail: String,
  message: String,
  sentAt: Date,
  channel: "email" | "sms" | "in-app"
}
```

**Indexes:** `trackingId` (unique), `reporter.email`, `status`, `incident.area` — these directly support your Research Question 3 ("how can MongoDB be structured to retrieve records in a fast and organized manner").

---

## 5. Key System Flows

### 5.1 Citizen submits a crime report
```
Citizen (browser)
   │  fills report form (type, description, location, optional evidence file)
   ▼
Next.js form → client-side validation (required fields, file size/type)
   │  POST /api/reports  (multipart/form-data if file attached)
   ▼
Express: validator middleware → sanitizes input, rejects bad payloads
   │
   ▼
reportController.createReport()
   │  - uploads evidence to Cloudinary/local disk
   │  - generates unique trackingId (CR-YYYY-XXXXXX)
   │  - creates MongoDB document, status = "received"
   │  - pushes first entry into statusHistory
   ▼
Response: { trackingId, status: "received" }
   │
   ▼
Next.js shows confirmation screen: "Your report has been logged. 
Save this tracking ID: CR-2026-000482"
```

### 5.2 Citizen tracks a report
```
Citizen enters trackingId + phone/email on /track
   │  GET /api/reports/track?trackingId=...&contact=...
   ▼
Express verifies trackingId + contact match (prevents strangers from
reading someone else's report just by guessing an ID)
   ▼
Returns status + statusHistory timeline (no admin-only fields exposed)
```

### 5.3 Officer/Admin manages reports
```
Officer logs in → POST /api/auth/login → receives JWT (role: officer/admin)
   │
   ▼
GET /api/admin/reports?status=&area=&page=  (paginated, filterable)
   │
   ▼
Admin opens a report → PATCH /api/admin/reports/:id/status
   │  { status: "investigating", note: "Assigned to Officer Bello" }
   ▼
Server: role-guard middleware confirms JWT role is officer/admin
   │  - updates report.status
   │  - appends entry to statusHistory
   │  - triggers notification to reporter's email
   ▼
Reporter receives status-change notification automatically
```

### 5.4 Authentication & role protection
```
Login → Express verifies bcrypt password hash → issues JWT
   (payload: { userId, role }, short expiry + refresh token pattern)
   │
   ▼
Every protected route runs:
   1. authMiddleware   → verifies JWT signature & expiry
   2. roleGuard(['admin','officer']) → blocks citizens from admin routes
```

---

## 6. "No flaws / no lag / no crashes" — Reliability & Quality Engineering

This is the part most ND projects skip, and exactly what will impress your supervisor and panel. No system is 100% bug-proof, but these concrete practices are what separate a robust final-year project from a fragile one:

**Input validation & security**
- All incoming data validated with `express-validator` / `zod` before touching the database (rejects malformed dates, oversized text, missing fields).
- Passwords hashed with `bcrypt` (never stored in plain text).
- JWT-based auth with short-lived access tokens + refresh tokens.
- `helmet` for HTTP security headers, `cors` locked to the known frontend origin, `express-rate-limit` on the auth and report-submission routes to stop spam/abuse (directly answers the "communities have no digital tool, prone to misuse" gap).
- File upload validation: MIME-type whitelist (jpg, png, pdf), max size (e.g. 5MB), stored outside the web-root or on Cloudinary — never trust the file extension alone.

**Data integrity**
- Mongoose **schema validation** (`required`, `enum`, `minlength`) as a second line of defense beyond client-side validation.
- Every write to a report goes through the controller (never direct DB writes from routes), so business rules (e.g. "status can't skip from received to resolved") are enforced in one place.
- MongoDB Atlas automatic daily backups + point-in-time recovery — this is your direct answer to "if a file is lost, that crime record is gone permanently" from your Statement of the Problem.

**Performance & no-lag**
- Pagination on all list endpoints (never return the whole `reports` collection at once).
- Compound indexes on frequently filtered fields (`status`, `incident.area`, `createdAt`).
- Next.js server components + caching for public pages; client components only where interactivity is needed.
- Connection pooling handled automatically by the MongoDB driver; a single shared Mongoose connection is reused across requests (not reopened per request).

**Error handling (no silent crashes)**
- Centralized Express error-handling middleware — every controller wraps logic in try/catch and forwards errors to it, so one bad request never crashes the whole server process.
- Global `process.on('unhandledRejection')` / `uncaughtException` handlers log the error and fail gracefully instead of hard-crashing.
- Frontend: React error boundaries around the report form and admin dashboard so a rendering bug shows a friendly fallback instead of a blank white screen.
- Health-check endpoint `/api/health` for uptime monitoring.

**Testing strategy (for your defence)**
- Unit tests (Jest) for controllers: report creation, status transition rules, tracking-ID generation uniqueness.
- Integration tests (Supertest) hitting the Express routes against an in-memory MongoDB (`mongodb-memory-server`).
- Manual UAT checklist: submit report → track it → admin updates status → confirm notification — this is literally your "Testing and Evaluation" section in Chapter 3/4 and gives you real data to report ("reduced retrieval time," "zero data entry errors observed across N test submissions," etc.).

**Where Python fits in (optional, stretch goal)**
A small FastAPI microservice can be called asynchronously (not blocking the main report submission) to:
- Flag likely duplicate reports using text similarity (`difflib` / `scikit-learn` TF-IDF cosine similarity) on `incident.description`.
- Cluster reports by `location.lat/lng` to highlight crime hotspots for the admin dashboard (`sklearn.cluster.DBSCAN`).
This is genuinely optional — the core system in section 3 above works completely without it, and you can present it in your defence as "future work" if time is short, exactly as your Scope of the Study already reserves "real-time GPS crime mapping" as out-of-scope for the ND version.

---

## 7. Folder Structure Delivered in This Package

```
crime-reporting-system/
├── ARCHITECTURE.md          ← this document
├── README.md                ← setup & run instructions
├── backend/                 ← Express + MongoDB API
│   ├── server.js
│   ├── config/db.js
│   ├── models/ (User.js, Report.js)
│   ├── middleware/ (auth.js, roleGuard.js, upload.js, errorHandler.js)
│   ├── controllers/ (authController.js, reportController.js, adminController.js)
│   ├── routes/ (authRoutes.js, reportRoutes.js, adminRoutes.js)
│   ├── utils/ (generateToken.js, generateTrackingId.js)
│   └── package.json
└── frontend/                ← Next.js citizen portal + admin dashboard
    ├── app/ (page.tsx, report/, track/, login/, register/, admin/)
    ├── lib/api.ts
    ├── components/
    └── package.json
```

## 8. How this maps back to your Chapter 1

| Your objective | Where it's implemented |
|---|---|
| User-friendly interface for submission + tracking | `frontend/app/report`, `frontend/app/track` |
| Server-side processing (data input, storage, communication) | `backend/controllers`, `backend/routes` |
| Secure, well-structured database | `backend/models`, MongoDB schema validation + indexes |
| Testing/evaluation confirming speed & error reduction | Section 6 "Testing strategy" — use this to write Chapter 4 |

