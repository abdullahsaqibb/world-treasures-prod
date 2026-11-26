# World Treasures — Customer commerce development checkpoint (26 Nov 2026)

## Scope and release safety
All code changes are on feature/transactional-email-foundation-20261123.
Production main, production Neon, payment configuration, and production deployment remain untouched.
No production or preview customer email delivery was enabled by these commits.

## Implemented
- Passwordless customer account pages: /account/login, /account/verify, /account.
- One-time POST confirmation (GET only displays confirmation), hashed 15-minute
  challenges, revocable HttpOnly Secure SameSite=Lax customer sessions.
- Separate staff/admin and customer identities and authorization.
- Database-backed per-email and trusted-proxy-IP request throttling with
  generic public responses to reduce account enumeration.
- Resend customer verification delivery, explicitly gated; tokens bypass the
  durable outbox so no magic-link bearer credential is stored in email queue.
- Separate durable outbox for non-secret verified order lifecycle notifications;
  unique event keys, retry/backoff, worker authorization with CRON_SECRET.
- Order detail page and operational action handler, gated by ORDER_OPERATIONS_ENABLED.
- Admin changes cannot mark payment paid or refunded; require verified payment
  records for processing, dispatch and delivery, and tracking for dispatch.
- Inventory helpers for atomic reservations, release and dispatch deduction,
  and immutable variantId stored in order items for new transactions.
- Customer bag can progress through a client-only delivery review to a safely
  disabled payment step without suggesting unverified fees or saving orders.
- Additive Prisma migration SQL and matching _prisma_migrations records
  applied ONLY to Neon developmentt (br-blue-surf-beydnbqx), verified on 26 Nov.

## Not yet active or verified
- Production customer accounts and transactional senders: both remain disabled.
- Preview RESEND_API_KEY and TRANSACTIONAL_EMAIL_FROM were found only in
  Production target as of this checkpoint, not preview.
- Preview database connection target could not be independently confirmed via
  Vercel's metadata-only access; verify against isolated developmentt before
  enabling any write route.
- Customer flow still requires live browser and database integration QA,
  expired/replayed link tests, Resend test inbox, signed-in account history,
  signout and reconciliation of retry scenarios.
- No automatic scheduling of the notification worker was enabled.
- PayFast verified callback, genuine payment reconciliation, shipping charges,
  order creation and real checkout remain blocked.
- Inventory reservation helpers are not wired to real order creation until
  verified shipping and payment flows are available.
- No real customers, carts, orders or payment records were created in this work.

## Release gate
Do not set CUSTOMER_ACCOUNTS_ENABLED=true, CUSTOMER_EMAIL_DELIVERY_ENABLED=true,
or ORDER_OPERATIONS_ENABLED=true in Production until DB migration QA, verified
preview isolation, sender tests and owner sign-off. Do not publish a customer
sign-in link in the production navigation until this gate has passed.
