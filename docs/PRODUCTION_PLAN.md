# World Treasures production acceptance roadmap

## Phase 1 — Frontend (current)

- [x] Next.js App Router + React + TypeScript project structure
- [x] Extract 15 product records and their exact photos from prototype
- [x] Product-color multi-tone hero backgrounds, with subdued type behind product
- [x] One-slide-per-pointer drag and trackpad gesture; touch swipes
- [x] Selected product carried into inspection section
- [x] Downward-only entrance animation, rearmed only when returning above section
- [x] Drag-to-tilt / two-finger pinch zoom inspection controls
- [x] Six theme selectors with locally persisted choice
- [x] Visible sticky desktop and compact mobile top navigation
- [x] Shopping bag fly animation, demo cart and clear non-live checkout message
- [ ] Visual parity review against approved prototype
- [ ] Verify on physical iOS Safari, Android Chrome, macOS Safari and trackpad
- [ ] Performance/Core Web Vitals budget and accessibility audit
- [ ] Approve refined short intro animation separately (do not block storefront)

### Frontend test matrix

- Carousel: swipe from the **same cursor location** five times, each gesture advances **one** product; arrows and dots; boundaries wrap.
- Touch: vertical scrolling remains available, horizontal drag advances one item, no double advance.
- Handoff: slide A -> scroll hero to inspection triggers A, leave below and return upward does not trigger, scroll back above and down triggers again with newly selected B.
- Inspection: single-finger tilt, two-finger zoom in/out, reset; no unexpected page scroll while touching product.
- Themes: every footer theme updates header/nav/action buttons/footer. Hero keeps per-product colors; inspection remains neutral.
- Cart: adding product animates toward visible top header; notification is unobstructed; quantity/subtotal correct.
- Responsive: 320px, 375px, 430px, tablet, desktop at 1280px+, no overflow or clipped controls.

## Phase 2 — PostgreSQL + admin

- Create Neon project; wire Prisma 7 + server-only connection (pooled runtime and direct migrations), run migrations.
- Import 15 prototype records with stable product IDs and real image assets; verify actual SKU, price, stock and rights before publishing.
- Auth.js credential / OAuth provider choice, hardened admin login, owner/manager/fulfillment roles, server-side access control.
- Product CRUD, variants, pricing, category, inventory movement and images.
- Customer addresses, order state machine, cancellation/refund workflow; audit logging and backups.
- Admin shipping rate editor (city first, optional zone/courier/weight later).

## Phase 3 — Shipping + checkout + PayFast

- Validate delivery country is South Africa. Customer selects a city from canonical table or requests manual quote.
- Server computes shipping from active city rate and any applicable basket/weight policy. Unknown city cannot silently receive free shipping.
- Store shipping quote & rate snapshot; checkout revalidates it, prices, and inventory.
- Pending order, stock reservation with expiry, PayFast hosted checkout, ITN verification according to current docs, idempotent webhook processing, stock commit on payment.
- Test payment success, duplicate ITN, invalid signature, mismatch amount, cancellation, notification delays, unavailable stock and stale shipping quote.
- Transactional emails, fulfillment dashboard, delivery labels/tracking initially manual.
- Legal pages, product allergen/compliance checks, privacy and data retention review, deployment monitoring and rollback plan.

## Delivery design decision

City fee is a sensible **MVP** when the courier supplies flat city tariffs. The admin can enter `Johannesburg: ...`, `Cape Town: ...`, etc. (not seeded until real prices are supplied). A shipping-zone model is better only if rates are consistent across multiple cities; courier-specific and dimensional-weight pricing can be layered in without changing orders already placed. All fees are ZAR cents and belong to a rate with effective dates.

## Release boundaries

Keep prototype repository separate and unchanged. New repository `world-treasures-production`, staging deployment first; do not use live PayFast credentials or send test transactions to customers in Phase 1/2.
