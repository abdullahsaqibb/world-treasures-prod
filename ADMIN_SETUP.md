# Phase 2 — World Treasures administration

This branch leaves the approved public storefront intact. The database and admin routes are separate until catalog integration is approved.

## 1. Database
Create a PostgreSQL database (Neon recommended). Set DATABASE_URL to its pooled URL and DIRECT_URL to its direct non-pooled URL.
Run `npm install`, `npx prisma generate`, and `npx prisma migrate dev --name init` on a development database. Commit the migration before production deployment. Production uses `npx prisma migrate deploy`.
Run `npm run seed:prototype` to import **exactly the existing 15 products** as DRAFT, with unverified prototype prices and stock. The seed preserves later admin edits on reruns.

## 2. Protected sign-in
Create a GitHub OAuth App for the admin site and set callback `https://YOUR_DOMAIN/api/auth/callback/github`.
Configure AUTH_SECRET (random), AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, ADMIN_GITHUB_IDS (comma-separated numeric GitHub user IDs) in Vercel.
Unlisted GitHub users cannot access /admin; authentication is also checked inside every server action. Never commit .env files. A missing allowlist denies access.

## 3. Admin routes
- /admin — dashboard
- /admin/products — product name, variant price, stock quantity
- /admin/delivery — configurable city/province and flat STANDARD delivery fee
- /api/shipping/quote?cityId=... — read-only, enabled city quote in ZAR cents, not cached

## 4. Important boundaries
This initial admin foundation does not collect PayFast credentials, accept payments, create checkout orders, or overwrite the current storefront catalog. The prices and inventory are provisional; do not activate products for customer purchase before receiving the verified price list.

## 5. Review
Verify role denial with unlisted GitHub accounts, empty database migration, seed idempotence, editing prices and city fees, and the shipping quote endpoint in a preview environment. Then integrate database products into the storefront as a separate tested change.
