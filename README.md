# TeyaCollections — Luxury Minimalist Fashion E-Commerce

A full-stack, luxury minimalist e-commerce platform inspired by the Sabina Framer aesthetic, built for **TeyaCollections**.

---

## 🏛️ Architecture Overview

```
teyacollections/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Supabase & Razorpay clients
│   │   ├── controllers/      # Products, Orders, Admin, Webhooks
│   │   ├── middleware/       # Auth (JWT verification), Admin guard, Error handler
│   │   ├── routes/           # Express routers
│   │   └── utils/            # Standardized API response helpers
│   └── .env.example
├── frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/       # Navbar, Footer, CartDrawer, AuthModal, ProductCard
│   │   ├── layouts/          # MainLayout, AdminLayout
│   │   ├── pages/            # Home, Shop, Category, Product, Cart, Checkout, OrderConfirm, Orders, Account, Admin
│   │   ├── store/            # Zustand stores (cartStore, authStore, uiStore)
│   │   └── lib/              # Axios instance & Supabase client
│   └── .env.example
└── supabase/
    ├── migrations/           # PostgreSQL schema (products, categories, orders, order_items, profiles, webhooks)
    └── seed.sql              # Curated luxury fashion catalog seed data
```

---

## 🚀 Key Features

1. **Sabina Framer Luxury Aesthetics**:
   - Editorial lookbook styling, ivory & warm stone palette (`#FDFBF7`), subtle gold accents (`#C9A96E`), serif typography (`Cormorant Garamond`), clean modern sans (`Montserrat`).
   - Sticky glassmorphic navbar with marquee announcement bar.
   - Smooth slide-in cart drawer with free express delivery progress bar.

2. **Backend & Database**:
   - **PostgreSQL / Supabase** schema with UUID keys, foreign key constraints, and relational `order_items`.
   - Idempotent **Razorpay Webhook handler** (`POST /api/webhooks/razorpay`) with HMAC SHA-256 signature verification.
   - Server-side pricing recalculation (never trust client amounts).
   - Stock inventory deduction upon confirmed payment.

3. **Client Storefront & Checkout**:
   - Real-time catalog filtering, category tabs, and search.
   - Size and color swatch selection.
   - Integrated Razorpay standard checkout popup with automated payment verification and simulated sandbox fallback.
   - Dedicated order confirmation receipt page.

4. **Account & Executive Admin**:
   - Customer profile management with saved order archives.
   - Role-protected executive admin dashboard (`/admin`) for tracking gross revenue, live inventory levels, low-stock warnings, and order fulfillment status updates.

---

## 🛠️ Getting Started

### 1. Database Setup (Supabase)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run SQL script `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Run `supabase/seed.sql` to populate curated apparel, categories, and initial data.

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_RAZORPAY_KEY_ID
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:3001`.
# clothing-store
