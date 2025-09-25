# NestSwap — Teacher Guide (How to run & what to assess)

**Student:** Iosif Miclea  
**Project:** NestSwap — Caravan & Cabin Exchange Platform  
**Summary:** Browsing is free. Premium (£10/year) unlocks **listing**, **messaging**, and **exchanges**. Tech: Flask (API) + React (SPA).

---

## Quick Links
- **GitHub repo:** https://github.com/iosif85/nestswap
- **Live demo (Replit):** https://269eb9cb-fef6-4108-a002-7b023e752de8-00-23hh79byt9ivk.janeway.replit.dev/
- **Portfolio (GitHub Pages):** https://iosif85.github.io/
- **Submission PDF (optional):** (if you host it on Pages) https://iosif85.github.io/IosifMiclea-NestSwap-Assessment.pdf

> If Stripe is **not** configured in test mode, please use the **subscriber** demo account from `seed.py` to test Premium features.

---

## What the project demonstrates
- **Secure auth:** register, email verify (if SMTP is off, the link prints in the backend console), login, password reset (JWT HttpOnly + CSRF).
- **Listings:** create/edit with photos, amenities, rules, map pin, **per-day availability**.
- **Browse & map:** keyword search + Leaflet/OSM (public).
- **Messaging (Premium)** and **Exchanges (Premium)**.
- **Paywall & Billing:** Premium £10/year (Stripe Subscriptions), webhook updates status and **auto-deactivates** listings on lapse.
- **Admin:** moderation (toggle visibility for users/listings).

---

## 5-Minute Review (happy path)
1. **Browse as a guest** → see listings & map; Premium actions show a paywall.  
2. **Log in** with the **subscriber** demo account (if seeded) or create an account and (for demo) promote it to subscriber.  
3. **Create a listing** → upload photos → set availability → it appears in Browse.  
4. **Send a message** to another user (Premium only).  
5. **Send an exchange request** → see status on both accounts.  
6. **Admin** → deactivate a listing → it disappears from Browse (owner can still edit).

> **Expected for non-Premium:** creating/editing listings, messaging, and exchanges are blocked (paywall UI + API 402 `{ code: "SUB_REQUIRED" }`).

---

## Run on Replit (fastest)
- Open the live demo link above.  
- Email verification links appear in the **Console** if SMTP is not configured.  
- Stripe test is **not required** for assessment if you use the subscriber demo account.

---

## Run locally (alternative)
**Prereqs:** Python 3.11+, Node 18+, Git

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill locally if you want to run it
alembic upgrade head
python seed.py               # optional for demo accounts
python app.py                # http://localhost:5000
Frontend

cd ../frontend
npm i
echo "VITE_API=http://localhost:5000" > .env.local
npm run dev                  # http://localhost:5173


Stripe test card: 4242 4242 4242 4242 (any future expiry/CVC).

Demo accounts 

Subscriber (Premium): demo+sub@nestswap.test / Demo1234!

Free: demo+free@nestswap.test / Demo1234!

Admin: admin@nestswap.test / Admin1234!
