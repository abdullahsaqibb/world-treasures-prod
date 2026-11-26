# World Treasures customer account backend checkpoint

## 24 Nov 2026 — current implementation
- Customer one-time tokens: 256-bit random, SHA-256 hash at rest, 15-minute challenge expiry.
- Separate customer sessions: hashed token, revocable, seven-day expiry.
- Consuming a token uses a transaction and conditional claim to prevent re-use.
- Customer roles are never elevated to admin; existing non-customer identities are rejected.
- Preparing a verification email inserts the challenge and outbox event in one transaction.
- No email on add-to-bag; no customer-facing UI, APIs, or production settings changed.
- CUSTOMER_ACCOUNTS_ENABLED must be explicitly true even to invoke internal preparation.
- CUSTOMER_EMAIL_DELIVERY_ENABLED must independently be true to send customer email.
- Neither flag was activated by this code change.

## Remaining implementation before customer account rollout
1. Apply reviewed migrations in isolated Neon development, using Prisma migration tracking;
   do not apply them automatically to the production branch.
2. Add persistent per-IP and per-email request throttling, generic public responses,
   bot mitigation, and recipient abuse controls before exposing a sign-in request endpoint.
3. Create secure HttpOnly/Secure/SameSite customer session cookie flow with CSRF-safe
   sign-out, verification confirmation UI, and explicit customer consent/privacy notice.
4. Connect an authenticated outbox worker and verify Resend delivery and error handling.
5. Test expired, replayed, concurrent, invalid, and staff-identity sign-in paths against
   the isolated development DB.
6. Run privacy/security and mobile checks before any controlled production release.

## Scope boundaries
Checkout, delivery fees, PayFast, the approved storefront UI, and admin UI styling remain
out of scope. Customer sign-in is *not* live or usable by customers at this checkpoint.
