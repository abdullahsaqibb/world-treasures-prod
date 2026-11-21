# World Treasures — Step 2 Product Management & Publishing QA
Date: 2026-11-20
Branch: feature/admin-backend-foundation
Production rollout: **NOT authorized**; preview only.

## Implemented
1. Protected administrator product create/edit with validation, category, prices in integer ZAR cents, image URL, and stock.
2. Explicit publication states: DRAFT, ACTIVE (Published), ARCHIVED. ACTIVE requires verified=true, product name, verified description, at least one image URL, at least one SKU, positive per-variant price, and no inventory below reserved.
3. ProductImage gallery of up to 8 URLs (cover plus seven optional images). Gallery ordering and removing URLs is controlled from product editor.
4. Multiple product variants with independent labels, SKUs, prices, quantities, package weights and atomic stock reservation checks.
5. Database-backed public route /catalog and product detail route /catalog/[slug]; queries only return (ACTIVE AND verified=true).
6. Product editor offers a storefront preview link when a product is published; homepage links to the verified catalogue, while original approved static prototype remains untouched.
7. Server paths invalidate cache for /, /catalog and product detail after catalog/product/variant mutation.
8. Product filters include Published, with direct catalog preview.

## Verification
- Isolated Neon QA branch: br-wispy-term-bed8lqjv (fork from development).
- On the isolated branch, tested a dummy product with draft state, category, image and SKU; updated name/price/stock; attempted reservation-violating stock reduction (0 rows affected).
- QA-only published product became visible to SQL query WHERE status=ACTIVE AND verified=true, and disappeared after returning to DRAFT.
- QA-only second variant inserted with unique SKU, price and inventory; variant count 2.
- Existing Neon development branch br-blue-surf-beydnbqx remains 15 DRAFT, verified=false; production remains 0 products/0 orders.
- Build command runs automated catalog tests and Next.js TypeScript checking. Latest build and unit test statuses must be checked in Vercel.
- No authenticated browser acceptance test, actual image upload, or full mobile device test is claimed.

## Open items / critical blockers
- Direct file uploads require a properly configured storage provider and read/write token. No storage service or charge was created automatically. The editor currently accepts secure HTTPS and local image paths.
- The legacy 15-product homepage showcase remains a demonstration and does not inherit database product edits. Admin product synchronization is implemented for the new verified /catalog pages and their homepage navigation, not the original hero/carousel. A larger legacy DOM migration is needed to unify these without regressing the approved storefront.
- Owner/supplier must confirm actual product photos, labels, stock, pricing and allergen details before marking verified and publishing.
- Authenticated browser tests of create, edit, publish, variant update and unpublished 404 remain to be performed.
- Checkout, PayFast, shipping and emails are independent Step 3+ tasks and remain disabled.
- Production staff OAuth variables are still not installed; no admin production rollout.

## Gate to mark Step 2 fully accepted
1. Configure secured image storage and test file upload + retrieval + removal/retention.
2. Test owner login and all product forms in an authenticated browser.
3. Import one actual verified product, publish it, confirm imagery/variants/price on /catalog and its detail, edit/unpublish and verify disappearance.
4. Approve legacy showcase-to-catalog migration or explicitly accept verified /catalog as the canonical catalog.

## Safety
No production products/orders, DNS, live payment or main branch were modified by this Step 2 implementation. No unverified prototype product was promoted.
