# NestSwap — Instructor Review Guide (How to run & what to assess)

**Student:** Iosif Miclea  
**Project:** NestSwap — Caravan & Cabin Exchange Platform  
**Summary:** Browse is free. Upgrading to **Premium (£10/year)** unlocks **creating/editing listings**, **messaging**, and **exchange requests**.  
**Stack:** Flask (API) + React (SPA), SQLite, Tailwind, Leaflet, Stripe (test mode).

---

## Quick Links
- **GitHub repo:** https://github.com/iosif85/nestswap  
- **Live demo (Replit):** https://269eb9cb-fef6-4108-a002-7b023e752de8-00-23hh79byt9ivk.janeway.replit.dev/  
- **Portfolio (GitHub Pages):** https://iosif85.github.io/

> **Note on email verification:** If SMTP isn’t configured in the demo, verification/reset links are printed in the **backend console logs** on Replit rather than being emailed.

---

## Demo Accounts (safe to use; `.test` domain)
- **Premium:** `demo-premium@nestswap.test`  /  `password123`  
- **Free:** `demo@nestswap.test`  /  `password123`  

*(If an Admin account is required for moderation review and not visible in the UI, it may be disabled in the demo.)*

---

## What this project demonstrates (mapped to assessment aims)

**Secure Authentication & Access Control**
- Register → verify → login → logout → reset password
- JWT in **HttpOnly** cookies + **CSRF** protection, rate limiting
- **Premium gating** enforced in API (403/402) and UI (paywall)

**Listings & Media**
- Create/edit listings (title, description, amenities, rules)
- Photo upload and gallery
- Location pin + **Leaflet/OSM** map integration
- **Per-day availability** calendar

**Browse & Search**
- Public grid + map, keyword search, basic filters
- Only active and permitted content is shown

**Messaging & Exchanges (Premium)**
- Threaded inbox
- Send/receive messages
- Request/accept/decline exchange requests

**Membership Billing (Test Mode)**
- Stripe Checkout (test cards), webhook updates `subscription_status`
- Lapse → listings set to `is_active=false` (not deleted); re-subscribe to continue

**Admin (if enabled)**
- View users/listings, toggle visibility (moderation)

**Deliberate Product Choice**
- **Nightly prices & price filters removed by design** (swap-first MVP)

---

## 5-Minute Review Path (happy path)

1. **Guest browsing:**  
   Go to the live demo → browse listings & map. Premium actions should show a **paywall**.

2. **Login (Free):**  
   Use `demo@nestswap.test / password123`. Confirm you **cannot** create listings, message, or send exchanges (UI blocks + API enforcement).

3. **Login (Premium):**  
   Use `demo-premium@nestswap.test / password123`.  
   - **Create listing** → upload photos → set availability.  
   - **Messaging:** open a listing and message another owner (if demo data available).  
   - **Exchanges:** request a swap; status visible on both ends.

4. **Optional Admin (if enabled):**  
   Toggle a listing’s visibility → it disappears from public browse but remains editable by the owner.

---

## How to Run (for reproducibility)

### Fastest: Live on Replit
- Use the **Demo Accounts** above.  
- If you register a new account and SMTP is not set, check **backend console logs** in Replit for the verification link.

### Local (optional)
**Prereqs:** Python 3.11+, Node 18+, Git

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill locally if needed
alembic upgrade head
python app.py                # http://localhost:5000
Frontend

bash
Copy code
cd ../frontend
npm i
echo "VITE_API=http://localhost:5000" > .env.local
npm run dev                  # http://localhost:5173
Stripe test card: 4242 4242 4242 4242 (any future expiry/CVC) — test mode only.

