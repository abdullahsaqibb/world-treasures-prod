# World Treasures — Product Management QA
Date: 2026-11-20. Environment: development only.

## Test locations and isolation
- Code: `feature/admin-backend-foundation`.
- Baseline dev Neon branch: `br-blue-surf-beydnbqx`; original **15 products remain DRAFT and untouched**.
- Isolated QA clone: `br-wispy-term-bed8lqjv` (`qa-product-workflow-20261120`), created from development. No writes to production or baseline development.
- Production Neon and public storefront were not modified.

## Verified database operations (isolated QA only)
1. Inserted a product, SKU/variant and inventory: PASS.
2. Edited product name: PASS.
3. Updated stock from 12 to 8 while 2 units were reserved: PASS.
4. Guarded update attempting to set on-hand stock to 1 while 2 units were reserved: **0 rows updated**, retained stock 8: PASS.
5. Archived product while preserving relations: PASS.
6. Created a category, reassigned product to that category: PASS.
7. Attached product image record and updated variant price to 1799 cents: PASS.
8. Verified unique indexes for product URL slug and variant SKU: present.

These are direct SQL/database tests in a disposable QA branch, not authenticated browser tests of server actions.

## Code fixes
- Product save updates now use an atomic `UPDATE inventory WHERE reserved <= onHand` check and abort the transaction on conflicts.
- Shared pure price, quantity, SKU-related name/slug and image URL validation helpers in `src/lib/catalog-validation.ts`.
- Seven automated input-validation tests in `tests/catalog-validation.test.ts`.
- Preview build runs `npm run test:catalog` before Prisma generation and Next.js compilation.

## Automated test evidence
Latest preview Vercel deployment for commit `9e92e1455b445a816faa917a8532458c0074a424`: READY.
- `tsx --test tests/catalog-validation.test.ts`: 7 pass, 0 fail.
- Next.js compilation, TypeScript validation, static generation: passed.
- No tests for true multiuser concurrent order reservations, Prisma server-action authorization, or authenticated browser workflows have been executed.

## Outstanding acceptance and development work
- Run actual authenticated browser create/edit/archive tests (a secure staff session is required).
- Product create/edit image uploads do not exist; the editor currently uses image URLs.
- Product variants require a dedicated UI and server actions.
- Published product activation and storefront synchronization are not yet implemented; current product data is separate from the storefront prototype.
- Unverified imported prices, stock and labeling cannot be published without proprietor/supplier confirmation.
- Check the end-to-end order/checkout payment flow separately; it is not operational.

## Decision
**Baseline product-management database operations and validation are verified**, but the complete Step 2 acceptance gate (admin ↔ storefront synchronization of a real verified product) is not yet achieved. Preserve the 15 original drafts and continue improvements only on feature/QA branches.
