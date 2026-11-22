# World Treasures — 23 November 2026 browse-only launch handover

## Shipping status
- **PUBLIC BROWSE-ONLY:** `www.worldtreasures.co.za`; Next.js deployed on Vercel.
- **PRODUCTS:** 15 `ACTIVE` and verified in Neon Production (`br-calm-field-berc0yoc`). Seven categories. Admin and public catalogue use the same database.
- **NOT TRANSACTION-READY:** 0 delivery cities/rates in Production; no PayFast ITN verification or order-state persistence workflow; no transactional notification sender; checkout entry deliberately disabled.
- **DESIGN:** Approved prototype hero, original product-card grid, arrivals carousel, inspection story, themed sections retained. Placeholder review, store-visit and social sections omitted pending real content.
- **SAFETY:** No fabricated customer reviews, location/hours, delivery claims or pricing of bundled offers. The shopping bag is a non-transactional preview and does not solicit guest address or payment details.

## Technical tasks completed and verified
- Original 15 recovered and published to Neon Production; Preview remains isolated.
- Live /catalog and all 15 /catalog/{slug} routes were HTTP 200 at latest QA.
- All 14 local .webp files returned HTTP 200. The 15th image is stored on Cloudinary.
- Server-side store pages are dynamically database-driven; no product duplication needed.
- Admin protected by configured owner authentication, session, and MFA settings. No authentication secrets should appear in source control.
- Payments and real orders disabled; do **not** infer readiness merely because product cards say “Add to bag.”

## Owner-only input required before accepting orders
1. **Business details:** Verified store street address, South African public phone/WhatsApp, customer-service email, actual opening hours. Do not reuse a demo address or number.
2. **Shipping:** Areas and provinces to serve; pickup location/eligibility; verified prices, delivery partner, service times and restrictions. Do not invent prices or free pickup.
3. **Payments:** Confirm PayFast (or another gateway). Owner opens/validates merchant account, completes KYC/settlement details, and inserts sandbox/production credentials directly in Vercel's encrypted environment settings; NEVER send merchant credentials or passphrases in a chat or GitHub.
4. **Policies:** Owner-approved returns/refunds, deliveries, cancellations, privacy, cookies, and terms; local legal review if necessary.
5. **Communications:** Verified sender and email service/API credentials stored securely in Vercel for transactional order confirmation; no newsletter capture without an actual subscription backend and appropriate notice.
6. **Final acceptance:** Mobile/desktop visual comparison, owner test order in gateway sandbox, signature-verified IPN/ITN callbacks, idempotency, stock reservation, successful/failed/refunded states, email delivery, and safe rollback.

## Unblocking rule
Do not enable checkout, payment, order persistence or claimed delivery charges until all tests pass with owner-supplied business configuration. Any public browse-only launch should be described explicitly as browse-only, not as live online ordering.
