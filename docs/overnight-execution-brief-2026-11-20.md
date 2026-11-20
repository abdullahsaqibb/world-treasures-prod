# World Treasures — overnight development execution brief
Date: 2026-11-20 (Asia/Karachi)
Status: user requested safe autonomous preparation and development on an isolated feature branch only.

## Objective
Accelerate release readiness, especially the merchant admin portal, without damaging approved storefront, production data or credentials. Always report completed work vs untested/planned work separately.

## Verified baseline at brief creation
- Repo: `abdullahsaqibb/world-treasures-prod`
- Work branch: `feature/admin-backend-foundation`; draft PR #1 targets `main`. **Do not merge**.
- Latest Preview: Vercel READY, commit `119170054d3dd2ff5e6753a19e140ccaf9c8f53a`.
- Vercel Production and Preview each have DATABASE_URL and DATABASE_URL_UNPOOLED. Preview has GitHub OAuth credential variables and admin allowlist.
- Neon development branch: `developmentt`, branch ID `br-blue-surf-beydnbqx`; production branch `br-calm-field-berc0yoc`.
- Development DB contains original schema and StoreContent migration, plus 15 imported draft products. Provisional prices and inventory; don't publish.
- Production domain: `worldtreasures.co.za` / `www.worldtreasures.co.za`. Future admin: `admin.worldtreasures.co.za` (NOT yet configured).
- Most recent admin design uses warm paper, coral and lavender, storefront typography; checkout remains prototype. User asked to **pause all storefront work**.

## Non-negotiable safety boundaries
1. Do not modify `main`, publish production, merge PR, remove branch, change domain/DNS/MX, or make any production Neon changes.
2. Do not delete or overwrite customer/order/product data. Even on development branch, migrations must be additive and reviewed; prefer dry-run and harmless queries. Do not execute destructive SQL.
3. Do not reveal, copy or commit secrets. Do not change OAuth callback/redirect domain or payment processing without production review.
4. Do not change storefront components/CSS or introduce new checkout animations during this overnight scope.
5. For each implementation, inspect target code, make minimal cohesive commits, verify Vercel build and runtime evidence, and document results. If unsafe/unknown, stop that task and report blocker instead of guessing.
6. Do not state UI features are functional solely because Next.js compiles. Distinguish source implementation, preview build verification, DB testing, and human browser acceptance.
7. All new admin routes/actions must verify admin authorization on the server. Escape and validate user inputs; avoid exposing customer data in client bundles and logs.

## Work packages in priority order

### A. Audit current admin and stabilize
- Inspect admin server actions and product editor for validation gaps, unhandled errors, duplicate SKUs/slugs, stock reservation guard, money conversion, authorization and page cache invalidation.
- Verify branches and Preview environment mapping (not passwords); check errors in latest Vercel runtime logs.
- Add lightweight automated tests or checks for pure validation and critical server-side rules when feasible; otherwise document exact manual test cases.
- Improve input error handling without destructive behavior.

### B. Make client-facing product management practical
- Work on admin only. Guided form with comprehensible labels, helpful examples, product preview, required validations and save feedback.
- Prioritize multi-photo upload architecture, secure storage strategy, and image preview. Do **not** claim upload works before storage and access controls exist.
- Add duplicate product / draft workflows only if idempotent and tested.
- Leave verified=false and draft status for imported products; keep all existing data.

### C. Improve admin polish and accessibility
- Align typography, spacing, controls and responsive layouts with World Treasures brand, without changing frontend storefront.
- Check keyboard navigation, focus, responsive table and form behavior, empty/error states, accessible image descriptions and reduced motion.
- Avoid visually deceptive placeholder data and dead buttons.

### D. Prepare integrations for later
- Orders: payment webhook verification, idempotency, status transition policy, inventory reservations, tracking and refund authority.
- Mail: sender on @worldtreasures.co.za, DKIM/SPF/DMARC, existing mailbox preservation, duplicate-safe notifications, queues, delivery logs and test templates.
- Customer auth: guest checkout, Google OAuth/email magic links, server-side account linking, privacy and separate customer/staff privileges.
- Admin domain: planned admin.worldtreasures.co.za, separate production OAuth redirect and production DB; don't attach or switch yet.

## Mandatory QA gates
- `npm run build` in a clean environment / Vercel Preview READY.
- All database writes only to confirmed Neon development branch.
- No production vars, domains, GitHub main or live storefront modified.
- Confirm final commit SHA, list tests actually run and any remaining defects.
- No silent merge or production release.

## Suggested execution batches
1. Read-only repo and runtime audit; document findings.
2. One or two safe admin improvements with reproducible testing.
3. Collect build results and create handoff with completed/pending/blockers.

## Handoff format
- Current branch and last commit.
- Completed code changes with file paths.
- Tests passed/failed (build, DB, runtime, browser).
- Items blocked by external credentials or user review.
- Production safety verification and next steps.
