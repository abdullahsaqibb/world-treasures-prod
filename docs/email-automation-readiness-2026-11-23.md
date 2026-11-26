# World Treasures — transactional notification foundation

Owner reports Resend domain configured and a successful email test. This is
owner-reported verification, not proof of full customer delivery on every route.

## Approved messaging policy
- No email on Add to Bag, viewing products, or opening a cart.
- No automated welcome / verification / password reset emails until real
  verified customer account flows exist.
- Do not issue order received messages without a saved order.
- Do not issue paid/refund messages without validated gateway events and recorded
  state transitions. Do not issue shipped messages without verified fulfillment.
- No marketing/cart reminders without documented opt-in and unsubscribe support.

## Implemented
- Transactional templates for paid and order status changes and account notices.
- Admin-only Resend send test.
- Server-only customer Resend transport validates recipient and idempotency key,
  requires an explicitly verified event, and remains disabled unless
  CUSTOMER_EMAIL_DELIVERY_ENABLED=true. It does NOT have callers or auto-send.
- Tests for fail-closed behavior, malformed inputs and provider idempotency headers.

## Implemented but not activated
- Prisma NotificationOutbox model, unique event key, delivery status and reviewed SQL migration file.
- Transactional queue insertion helper and server-side dispatch function with guarded claims,
  bounded retries and stale-send reconciliation detection.
- No migration has been applied to production; no scheduled delivery worker or customer-event trigger is active.

## Still mandatory before activation
1. Review/apply the outbox migration to an isolated development database, then test concurrency.
2. Add verified event producers for persistent orders, validated PayFast ITN,
   authenticated account actions and confirmed fulfillment.
3. Attach an authenticated scheduler to the worker with delivery observability,
   per-event recipient authorization, rate limiting and safe operational recovery.
4. Run realistic sandbox end-to-end tests, inspect delivery logs and suppress
   duplicates; enable the customer delivery switch only after sign-off.
5. Follow business retention and privacy requirements for customer emails.

No production environment values, checkout settings, shipping fees, frontend
components, or live customer records have been changed by this branch.
