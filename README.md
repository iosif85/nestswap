# NestSwap — Caravan & Cabin Exchange Platform

Browse unique caravans and cabins worldwide. **Browsing is free.**  
Upgrade to **Premium (£10/year)** to **create/edit listings**, **message owners**, and **request exchanges**.

> **Live demo:** <REPLIT_URL>  
> **GitHub repo:** <GITHUB_REPO_URL>  
> **Portfolio page:** <PORTFOLIO_URL>  

---

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started (Replit)](#getting-started-replit)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Database & Seed Data](#database--seed-data)
- [Testing](#testing)
- [Access Control & Membership](#access-control--membership)
- [Admin & Moderation](#admin--moderation)
- [Security Notes](#security-notes)
- [Project Structure](#project-structure)
- [Roadmap / Future Work](#roadmap--future-work)
- [Teacher Guide](#teacher-guide)
- [License](#license)

---

## Features
- **Secure Auth** — register, email verification, login, logout, password reset (JWT in HttpOnly cookies + CSRF).
- **Profiles** — avatar, bio, country.
- **Listings** — create/edit with photos, amenities, rules, location (map pin), and **per-day availability**.
- **Browse & Search** — keyword, filters, and interactive **map** (Leaflet + OpenStreetMap).
- **Messaging (Premium)** — threaded inbox between owners.
- **Exchanges (Premium)** — request, accept, decline.
- **Premium Membership** — **Stripe** subscription (£10/year) with checkout, webhook, and billing portal.
- **Admin** — basic moderation for users & listings (activate/deactivate).
- **Note** — All nightly prices and price filters have been **removed** by design.

---

## Screenshots
Add images to `/docs/screenshots` and link them here:

- Registration & verify email  
- Upgrade (Premium)  
- Create listing (photos + availability)  
- Browse & map  
- Message thread  
- Exchange request flow  
- Admin moderation

---

## Tech Stack
**Frontend:** React (Vite + TypeScript), Tailwind CSS, React Router, React Query, Leaflet/OSM  
**Backend:** Python Flask (REST), SQLAlchemy + Alembic, Marshmallow/Pydantic-style validation  
**DB:** SQLite (MVP)  
**Payments:** Stripe Subscriptions (Checkout + Billing Portal + Webhook)  
**Security:** Argon2/bcrypt password hashing, JWT HttpOnly + CSRF (double-submit), rate limiting, input sanitisation  
**Dev:** Replit, GitHub, Trello, pytest

---

## Architecture
- **Client (SPA):** routes for Auth, Listings (Browse/Detail/New/Edit), Messages (Inbox/Thread), Swaps (New/My), Billing (Upgrade/Success/Cancel), Admin.
- **Server (API):** blueprints for `auth`, `users`, `listings`, `uploads`, `messages`, `swaps`, `billing`, `admin`.
- **Data model:** `User`, `Listing`, `Photo`, `Availability`, `Message`, `Swap`.  
- **Images:** stored locally under `/backend/static/uploads` (MVP-friendly).

---

## Getting Started (Replit)
1. Fork/open the Replit project.  
2. Add **Secrets** from `.env.example` (see below).  
3. Click **Run** — the backend (port `5000`) and frontend (port `5173`) start together.  
4. Open the frontend URL. If SMTP isn’t set, verification/reset emails are logged to the backend console.

---

## Getting Started (Local)

### Prerequisites
- Python **3.11+**, Node **18+**, Git

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill values as needed
alembic upgrade head
python seed.py               # optional demo data
python app.py                # http://localhost:5000
Frontend
bash
Copy code
cd ../frontend
npm i
echo "VITE_API=http://localhost:5000" > .env.local
npm run dev                  # http://localhost:5173
Environment Variables
Create .env (root) from .env.example:

ini
Copy code
# App
FLASK_ENV=development
JWT_SECRET=<generate_random>
CSRF_SECRET=<generate_random>
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Mail (optional in dev; logs to console if absent)
MAIL_SERVER=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_USE_TLS=true
MAIL_DEFAULT_SENDER="NestSwap <no-reply@nestswap>"

# Stripe (Premium membership)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_SUCCESS_URL=http://localhost:5173/#/billing/success
STRIPE_CANCEL_URL=http://localhost:5173/#/billing/cancel
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:5173/#/billing/manage
Frontend needs:

bash
Copy code
# frontend/.env.local
VITE_API=http://localhost:5000
Stripe test card: 4242 4242 4242 4242 with any future expiry and any CVC (test mode only).

Database & Seed Data
Run python backend/seed.py to create demo users, listings, availability, and a subscriber account.

Seeds include:

Subscriber: demo+sub@nestswap.test / Demo1234!

Free: demo+free@nestswap.test / Demo1234!

Admin: admin@nestswap.test / Admin1234!

If your seeds differ, update this section to match seed.py.

Testing
bash
Copy code
cd backend
pytest -q
Covers: auth happy paths, listing CRUD, premium gates (HTTP 402 for non-subscribers), swaps, webhook effects, public search showing only is_active=true listings.

Access Control & Membership
Free users: browse listings (grid/map) & view details.

Premium (subscription_status in ['active','trialing']): create/edit listings, upload photos, send/receive messages, request/manage exchanges.

Lapse handling: webhook sets a lapsed user’s listings to is_active=false (not deleted). User can re-subscribe and continue.

Admin & Moderation
Admin dashboard to view users and listings; toggle listing visibility.

Role: user or admin (server-side checks).

Security Notes
Passwords hashed (argon2/bcrypt).

JWT in HttpOnly cookies; CSRF via double-submit token.

Rate limiting on auth/uploads.

Input sanitisation for user-generated content.

Secrets managed via environment variables; never committed.

Project Structure
pgsql
Copy code
nestswap/
  backend/
    app.py, config.py, database.py, extensions.py
    models/ (user, listing, photo, availability, message, swap)
    routes/ (auth, users, listings, uploads, messages, swaps, billing, admin, health)
    services/ (email, auth, search, availability)
    static/uploads/
    migrations/
    tests/
  frontend/
    src/
      api/ (client, auth, listings, messages, swaps, billing)
      features/ (auth, listings, messages, swaps, billing, admin)
      components/ (NavBar, Map, AvailabilityCalendar, PaywallModal, etc.)
      routes/
      styles/
Roadmap / Future Work
Object storage + CDN for images, Postgres DB, CI/CD pipeline.

Broader automated tests (Playwright/Cypress).

OAuth login, notifications, analytics, improved moderation.

(Optional later) Paid booking flow and Stripe Connect payouts.



License
© 2025 Iosif Miclea. All rights reserved.
