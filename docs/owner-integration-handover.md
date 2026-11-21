# World Treasures — integration handover for the owner

Branch: `feature/cloudinary-media-preview`. Production `main` and customer domains must remain unchanged until the full QA gate passes.

## Already connected in Vercel Preview
- Neon development Postgres and Prisma schema.
- Auth.js/NextAuth `AUTH_SECRET`.
- Owner email/password credentials `ADMIN_LOGIN_EMAIL` and `ADMIN_PASSWORD_SCRYPT` (password stored as scrypt verifier, not plaintext).
- Cloudinary Free signed direct uploads (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

Owner has confirmed Preview sign-in, Cloudinary upload, and draft-product image persistence.

## Implemented with no additional service keys
- Verified/published Neon products and variants supply the homepage shop and preview cart.
- Product visibility, variant cents pricing, and available inventory (on-hand minus reserved) are server-derived.
- Existing approved homepage shell/animations remain; enhanced hero can display approved products.
- Category filters, stock-aware bag limits, local guest contact/address form.
- Read-only configured shipping destinations and quote lookup.
- Explicit payment placeholder; **no payment capture, order creation, reservation, sending emails or writing guest details to Neon**.
- Product management, categories, delivery rates, export, galleries, direct media uploads, owner sign-out.
- Preview login throttling (HMAC-only identifiers and shared Neon table).
- Authenticator-based owner MFA support (optional in Preview, required before production credential enablement).

## What the owner will need to do — only when asked for final integration
1. **Products and merchandise:** Approve real product images, actual selling prices in ZAR, on-hand inventory, pack sizes, descriptions and allergies/ingredients from supplier packaging. Confirm/discard the `Test` listing. Do not automatically promote draft prototype records.
2. **Delivery:** Set supported South African cities, fees, conditions and courier rules in the admin. This requires no service credentials for the existing fixed-city quote preview. Checkout fulfillment should not be declared operational until validated.
3. **Admin authentication:** On a trusted local computer run `node scripts/create-admin-totp-secret.mjs`. Add the result as sensitive `ADMIN_TOTP_SECRET` in Vercel **Preview first**, enroll the authenticator app and verify codes. Do not share the secret with ChatGPT. After final approval set required production variables and separately enable `ADMIN_CREDENTIALS_PRODUCTION_ENABLED=true`; production login will fail closed without MFA. Optionally rotate `AUTH_SECRET` during rollout to expire old sessions. Production GitHub fallback stays off unless separately approved with `ADMIN_GITHUB_PRODUCTION_ENABLED=true`.
4. **Customer authentication:** Guest checkout preview does not need Google OAuth or mail credentials. If customer Google login is desired, it is a **future optional integration** requiring an owner-controlled Google OAuth application, verified redirect domains and consent/privacy configuration. Do not treat a typed guest email as an authenticated identity.
5. **Transactional email:** When genuine orders are enabled, choose a sender provider, verify `worldtreasures.co.za` sender DNS and add its secret to Vercel; sending is not enabled in the placeholder build.
6. **Payments, deferred by owner:** PayFast merchant/sandbox credentials, passphrase and merchant settings will be requested in a later payment milestone. Real orders, ITN webhook verification, refund handling, stock reservation and notifications must pass sandbox acceptance before enabling capture.

## Remaining release validation
- Latest branch-tip Vercel Preview build status READY after automated tests and TypeScript checks.
- Mobile and desktop browser check of hero swipe, filters, published product cards, stock caps, the guest delivery form, city quote, disabled payment action, admin login/MFA, sign-out and media.
- Confirm `/catalog` and the homepage are driven by the same published records and that drafts are absent.
- Confirm a Preview `Test` entry is not unintentionally sold or promoted as real merchandise.
- Review main-vs-feature divergence and merge only through approved PRs, after production migration/backup.
- Configure `admin.worldtreasures.co.za` and production environment only after production auth and database isolation are confirmed.
- The payment placeholder must never report a successful order or payment.

No extra keys are required to inspect the current Preview demo. No real transactions are supported or authorized.
