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

## Still mandatory before activation
1. Durable event/outbox table with unique event keys, retries and delivery state.
2. Verified event producers for persisted orders, validated PayFast ITN,
   authenticated account actions and confirmed fulfillment.
3. Connect provider sending to outbox jobs with per-event recipient authorization,
   rate limiting, logging and safe retries.
4. Run realistic sandbox end-to-end tests, inspect delivery logs and suppress
   duplicates; enable the customer delivery switch only after sign-off.
5. Follow business retention and privacy requirements for customer emails.

No production environment values, checkout settings, shipping fees, frontend
components, or live customer records have been changed by this branch.
