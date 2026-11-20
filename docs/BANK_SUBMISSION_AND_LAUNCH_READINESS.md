# World Treasures — Bank submission and ecommerce launch readiness
Reviewed: 2026-11-20
Production domain: https://www.worldtreasures.co.za

## Actual production status
- The apex and www domains are attached and verified in Vercel; apex redirects to www.
- Production deployment on main: `ec490e958346f480c59d81bd745b94ea4fe7285a` (Vercel READY).
- Public storefront is a **catalogue preview**. Its listed prototype prices and stock are unverified.
- Public site now clearly discloses that ordering/payment are not yet available and no simulation can create an apparent successful purchase.
- Neon production: 15 application/migration tables, 2 migrations, **0 products and 0 orders**. Never copy unverified prototype records to active live inventory.
- Production does not have GitHub OAuth admin secrets configured. Admin remains in a protected preview deployment and is **NOT available on the live domain**.
- No PayFast live merchant credentials or verified ITN webhook are configured; email, fulfilment, live order saving, and Google customer sign-in are not active.

## Two separate sign-off levels
### A. Informational, bank-review website (achieved at the deployment level; still requires content review)
- Domain, TLS, website deployment and approved design available.
- Business model and catalogue visible, with clear prelaunch notice.
- **Not a merchant checkout.** Do not submit evidence claiming paid transactions, operational refund handling, or customer email delivery.
- Bank may still require business legal information and actual contact details. Do not invent any of these.

### B. Ready to accept real customer orders (NOT achieved)
- [ ] Verified supplier/product document and 15 product legal names, prices, barcodes/identifiers, images, allergen declarations, true inventory.
- [ ] Business legal name, entity type, South African registration number if applicable, place of business, physical contact address, operating email and phone.
- [ ] Published, business-reviewed privacy, delivery, returns/refunds and terms policies. Confirm relevant South African ECT Act s43 disclosure requirements and applicable consumer law with local counsel.
- [ ] Delivery fees, city coverage, collection policy and courier handling confirmed with provider.
- [ ] Production admin login: production OAuth application, correct callback, protected staff roles and access audit.
- [ ] Production catalog workflow for reviewed products, safe preview and publish with rollback; proper image hosting and rights.
- [ ] Durable order creation with server-calculated ZAR prices, inventory check and reservation, and rate snapshot.
- [ ] PayFast merchant approval, sandbox test, signature validation, ITN authenticity/amount confirmation, idempotency, duplicate events, failed payment, refunds and fulfillment transitions.
- [ ] Verified outgoing domain/email SPF DKIM DMARC, transaction emails with retry and delivery log.
- [ ] Guest checkout and optional customer account access, role isolation, privacy/data retention policy.
- [ ] Phone/desktop, keyboard, cross-browser and accessibility tests, checkout test receipts, backups and rollback documented.
- [ ] Owner performs final acceptance tests on real domain before enabling payments.

## Release safety gates
- Keep branch `feature/admin-backend-foundation` unmerged until storefront regression and admin security are tested.
- Production and development Neon branches remain separate. Production migrations were applied transactionally after creating branch `pre-production-schema-backup-20261120`.
- Never treat Vercel build READY as an end-to-end commerce test.
- Never accept or record a real payment without verified payment gateway messages.
- No DNS/MX changes until operational mailbox and SPF/DKIM/DMARC setup are reviewed.

## Bank submission material to gather
- Live domain link and timestamped screenshots from a real browser.
- Business registration documents/owner identification supplied by the proprietor, not generated from assumptions.
- The business's true name, contact information, shipping/returns policies and a product/supplier overview.
- Explanation that online shopping/payment is pending merchant account activation, if accurate.
- Any bank-specific application forms and documents must be provided and checked against the bank's actual criteria.

## Architecture decision
Bank review site may operate as a truthful browse-only catalogue while the business account and PayFast onboarding proceed. Enabling sales is a separate milestone with distinct functional and legal acceptance criteria.
