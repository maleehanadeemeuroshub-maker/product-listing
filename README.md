# AURA 3D — Spatial Product Showcase

A 3D-animated product listing/e-commerce demo (React + Vite) with real login/accounts
and a self-contained cart/checkout.

## Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 19, Vite, Tailwind v4, Three.js (3D product viewer/teardown), Framer Motion |
| Auth & data| Supabase — Auth, Postgres, Storage (via Vercel Marketplace) |
| Hosting    | Vercel |

## How it works

Product data (`src/types/products.js`) — pricing, 3D model type, per-color materials
(metalness/roughness), exploded teardown layers, specs — is the app's own local data;
there's no external commerce platform behind it. Cart, promo codes, and checkout are
handled entirely client-side (`src/context/StoreContext.jsx`) and persisted to
`localStorage`, with a simulated checkout success flow.

Supabase Auth backs real accounts: register, login, logout, forgot/reset password,
avatar upload (Supabase Storage `avatars` bucket). Wishlist and compare lists are
persisted per-user in Postgres (`user_product_lists`, RLS-protected — see
`supabase/schema.sql`) instead of `localStorage`.

## Local development

```bash
npm install
vercel env pull --yes   # pulls SUPABASE_* into .env.local
npm run dev
```

Env vars are provisioned automatically via the Vercel Marketplace Supabase
integration rather than set by hand — see `.env.example` for what's expected.

## Known follow-ups

- Supabase's default email sender is rate-limited; a custom SMTP provider (e.g. Resend)
  is optional polish for auth emails, not required for the flow to work.
- Cart/checkout is a local simulation, not connected to a real payment processor or
  inventory system — revisit if real commerce is needed later.
