# World Treasures — isolated development integration QA (26 Nov 2026)

## Target and boundaries
- Neon project: round-river-52997667
- Test branch: developmentt (br-blue-surf-beydnbqx)
- Production database, production storefront and production payments NOT modified.
- This is a backend database integration check, NOT a complete browser/authentication
  or Resend email-delivery end-to-end verification.

## Tests executed against Neon development branch
The SQL integration probes used SAVEPOINT and ROLLBACK TO SAVEPOINT, and
verified that no test records remained afterward.

### Single-use challenge claim
- Inserted a temporary CustomerLoginChallenge row.
- First conditional consume UPDATE returned 1 row.
- Identical second consume UPDATE returned 0 rows.
- Rolled back the challenge insert and confirmed 0 test rows remained.

### Notification event idempotency
- Inserted temporary NotificationOutbox event with one unique eventKey.
- First INSERT ... ON CONFLICT DO NOTHING returned 1 row.
- Same eventKey in second INSERT returned 0 rows.
- Rolled back and confirmed 0 test notifications remained.

### Inventory reservation and fulfillment
- Inserted temporary category, product, variant and inventory (5 units) inside savepoint.
- Reserved 4 units; reserved count became 4.
- Attempted additional reservation for 2; guarded UPDATE returned 0 rows.
- Released 2; reservation became 2.
- Finalized 2 units; onHand became 3 and reserved became 0.
- Rolled back and confirmed 0 test inventory records remained.
- This verifies SQL guards in a single transaction, not simultaneous clients.
  Multi-connection concurrency QA remains mandatory before checkout release.

## Preview database safeguard
- Confirmed Neon provides current_setting('neon.branch_id', true).
- Preview-only health check now returns development_verified only if it resolves
  the exact development branch; otherwise responds 503.
- Preview write paths (customer challenges, authentication, throttling, notification
  worker and admin order transitions) now fail closed for any other Neon branch.
- Live preview HTTP health response has not yet been independently exercised,
  because the remote preview endpoint could not be accessed through the public
  browsing utility. Vercel build readiness alone does not prove DB routing.

## Remaining release gates
1. Verify preview health endpoint reports development_verified from a trusted
   authenticated preview request.
2. Configure a preview-scoped Resend test sender/test inbox and dry-run
   real email delivery. Do not enable customer delivery in production.
3. Exercise complete POST-based magic link requests, replay, expiry,
   signout, session cookie protection and role isolation in a browser.
4. Test concurrent inventory reservations from independent DB connections,
   order state transition races and provider idempotency.
5. Verify email worker delivery/retries, delivery logs and no duplicate
   sending on timeout. Enable CRON_SECRET only when reviewed.
6. Proceed to controlled production promotion only after a complete QA report.

## Follow-up: running Preview and concurrency verified
- Used Vercel's authenticated deployment fetch on the existing READY preview
  dpl_6vdM5A53fhQ9vruY2Y22HaCzTzc7.
- GET /api/health/database returned HTTP 200 with
  {database: reachable, schema: initialized, isolation: development_verified}.
- GET /account/login returned HTTP 200 with a safe disabled-account message,
  no active sign-in request form; GET /account/verify without a token displayed
  the invalid/incomplete link message.
- GET /api/customer/auth/request correctly returned 405 (POST only).
- GET /account rendered the login page to an anonymous user, with no order
  history displayed.
- Real preview Resend sending remains disabled; credentials are scoped to
  Production only. A test-specific Preview sender must be set up and approved
  for live email testing. No customer email was sent.
- Concurrency probe: inserted temporary test-only inventory in Neon developmentt
  with onHand=5, then issued two independent concurrent guarded reservations
  for 4 units. Exactly one returned 1 affected row; the other returned 0.
  Test entities were cleaned up; subsequent checks showed zero QA inventory.
- Rechecked development branch: no pending magic-link challenges, sessions or
  notification outbox events (all counts 0).
- Remaining untested: full email-link POST login flow, actual provider delivery,
  signed-in browsing, notification worker retries and paid order lifecycle.
