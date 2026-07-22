---
name: Shaiks Royal Sea Foods
description: Full-stack frozen seafood delivery app for Vijayawada — 3 portals (customer, admin, executive), Express API + React frontend
---

## Architecture
- `artifacts/api-server` — Express 5 API, port 8080, routes mounted at `/api/*`
- `artifacts/shaiks-royal-seafoods` — React/Vite frontend, Vite proxies `/api` → `localhost:8080`
- `lib/db` — Drizzle ORM + PostgreSQL schemas (users, otps, products, timeslots, orders, orderItems)
- `lib/api-client-react` — Orval-generated React Query hooks, uses `setAuthTokenGetter` from `custom-fetch.ts`
- `lib/api-zod` — Orval-generated Zod schemas

## Auth
- Customer/Executive: Phone OTP (`/api/auth/send-otp` + `/api/auth/verify-otp`) — OTP returned in response body (dev demo, no SMS)
- Admin: username=`admin`, password=`admin123`, login at `/admin/login` → `POST /api/auth/admin/login`
- JWT stored in `localStorage` under key `auth_token`; `setAuthTokenGetter(() => localStorage.getItem('auth_token'))` called in main.tsx

## Key Decisions
- `deliveryDate` is `zod.coerce.date()` in generated schema — must convert to `YYYY-MM-DD` string before DB insert in orders route
- Drizzle `sql` template strings must use camelCase TypeScript property names (e.g. `ordersTable.paymentMethod`, NOT `ordersTable.payment_method`)
- Delivery charge: free ≤5km from hub (Kanuru coords 16.5193°N, 80.6212°E); ₹5/km beyond that; calculated server-side (haversine)
- Admin password stored as plain text in DB (passwordHash field, but no actual hashing — dev only)

## Seeded Data
- 2 timeslots: "Morning 7am – 11am" (id=1), "Afternoon 3pm – 6pm" (id=2)
- 3 products: Frozen White Prawns ₹450, Frozen Tiger Prawns ₹650, Apollo Fish Steak ₹380
- 1 admin user: phone=`admin`, password=`admin123`

## Frontend Pages
All under `artifacts/shaiks-royal-seafoods/src/pages/`
- Customer: LandingPage, LoginPage (OTP), ProductsPage, CartPage, CheckoutPage, OrdersPage, OrderTrackingPage
- Admin: AdminLoginPage, AdminDashboard, AdminOrdersPage, AdminOrderDetailPage, AdminProductsPage, AdminExecutivesPage, AdminTimeslotsPage, AdminReportsPage
- Executive: ExecutiveLoginPage, ExecutiveDashboard, ExecutiveOrderDetailPage

## Theme
- Colors: `#081826` bg, `#10243A` card, `#D4AF37` gold accent
- Fonts: Playfair Display (headings) + Montserrat (body)
- Dark mode only, sonner toaster (richColors, top-right)

**Why:** Preserving these facts so future agents don't have to re-read every file to understand the project structure and key quirks.
