# 🧵 Quilt Shop — Full-Stack React + Node + MySQL

A production-ready starter for selling quilts with image uploads, accounts, cart, and Stripe checkout.

## Features
- React + Vite + Tailwind UI
- Product catalog & detail pages
- Add to cart, edit quantities, remove items
- Account creation & login (JWT in httpOnly cookie)
- Admin product management & image uploads (multer)
- Checkout with Stripe (test mode) + order creation
- MySQL + Prisma ORM (Users, Products, Orders, OrderItems)
- Docker Compose for local MySQL
- Clean project structure and environment variables

## Quick Start

### 1) Prereqs
- Node.js 18+
- Docker (for MySQL) or a local MySQL 8 instance
- Stripe account (for test mode)

### 2) Start MySQL (Docker)
```bash
docker compose up -d
```
MySQL will listen on `localhost:3307` with user `quilt` / password `quiltpass`, DB `quiltshop`.

### 3) Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env if you changed DB ports/creds. Add Stripe keys (test keys are fine).
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed     # optional: seeds admin + sample quilts
npm run dev
```
Backend runs at `http://localhost:4000` by default.

**Admin login (seeded):**
- Email: `admin@quilt.shop`
- Password: `admin123`

### 4) Frontend setup
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` by default.

### 5) Stripe test mode
Use Stripe test cards (e.g. `4242 4242 4242 4242`, any future date, any CVC).  
Docs: https://stripe.com/docs/testing

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="mysql://quilt:quiltpass@localhost:3307/quiltshop"
JWT_SECRET="dev_jwt_secret_change_me"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # optional if you use webhooks
```
> If you change the DB port/user/pass in `docker-compose.yml`, update this URL.

### Frontend (`frontend/.env`)
```
VITE_API_BASE="http://localhost:4000/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## Admin: Add Products & Upload Images

1. Login as admin (`/login` with the seeded account above).
2. Open **Admin** in the header nav.
3. Create new products and upload images (PNG/JPG).

Uploads are stored on the backend (`backend/uploads/`) and served statically.

---

## Project Structure

```
quiltshop/
  backend/           # Express API + Prisma + Stripe
  frontend/          # React + Vite + Tailwind UI
  docker-compose.yml # MySQL 8
```

---

## Notes

- This is a secure baseline, but you should review production hardening (HTTPS, secure cookies in production, CORS domain allowlist, CSRF where needed, etc.).
- Webhooks are included for Stripe but optional; you can confirm orders via success page polling if preferred.
- Image uploads are local-disk by default; swap to S3 by replacing the `multer` storage in `backend/src/routes/uploads.js`.
```

