# World Treasures — Merchant portal architecture and rollout

## Confirmed domain
Public storefront: https://www.worldtreasures.co.za
Apex: https://worldtreasures.co.za (redirects to www in Vercel)
Future staff login: https://admin.worldtreasures.co.za
Customer account: https://www.worldtreasures.co.za/account

Do not route the admin subdomain to the production deployment until the production admin backend, OAuth callback, database migrations and authorization have been tested. **Never use the preview-only database for production.**

## Admin UX principles
- Nontechnical owner and staff experience first. No direct editing of slugs, database keys or URLs required for routine tasks.
- Two-stage content publishing: draft → preview → publish, plus audit trail and rollback.
- Clear empty states, errors, helper descriptions and safe defaults.
- Guided product creation, verified prices, inventory controls, variant and category management.
- Operations visibility: orders, delivery, customer records, reports, refunds, notifications.
- Never display a planned or unconnected service as active.

## Navigation
Overview; Orders; Customers; Products; Categories; Delivery; Discounts; Storefront editor; Media library; Analytics; Payments; Email & notifications; Customer sign-in; Store settings.

## Current state (development branch only)
- Working: protected staff GitHub OAuth, PostgreSQL product catalog, product draft creation/edit, category creation, basic city rate editing, dashboard counts, static copy draft/publish preview.
- Read-only: orders, customers.
- Planned / disabled: PayFast checkout and refunds, fulfillment tracking, bulk uploads, file media library, discounts engine, sales reporting, account system, transactional email, staff role management, visual page builder.

## Customer sign-in strategy
- Never force a login to purchase; support guest checkout.
- Offer Google OAuth and email magic links in the same customer account system.
- Use Auth.js with separate customer authorization/persistence from the existing GitHub administrator allowlist.
- Google OAuth callback in production: https://www.worldtreasures.co.za/api/auth/callback/google
- Implement verified email handling, safe provider account linking, secure sessions, OAuth state and PKCE, rate limits, explicit consent, and order lookup authorization.
- Customer accounts may view only their own orders, addresses and preferences; sessions must not grant admin access.
- Keep past guest orders linked by verified email only after secure proof of ownership.

## Transactional emails
- Use a verified sender such as orders@worldtreasures.co.za and a designated reply-to mailbox.
- Prefer dedicated provider API (e.g. Resend) with SPF, DKIM, DMARC records; inbox hosting is independent.
- Send order confirmation only after durable order creation and verified payment notification, avoiding duplicate sends with idempotent job/event IDs.
- Send status emails on shipped/delivered/refunded events, with order-specific tracking links.
- Store delivery logs/status, retry transient failures; never expose provider keys to browsers.
- Create email templates, editable in admin with preview and test-send controls.
- Do not configure or alter MX records without inspecting the existing mailbox host.

## Production deployment sequence
1. Verify admin product management against Neon development and fix runtime failures.
2. Implement customer app and backend, checkout and payment event verification.
3. Integrate email provider and test templates and delivery events.
4. Produce reviewed migrations, a separate production data seed/import, backup and rollback.
5. Configure production OAuth callback and admin subdomain; restrict staff access and enforce roles.
6. Complete end-to-end security, mobile and regression tests.
7. Merge development branch only after reviewed readiness checks and owner approval.

## Later storefront animation
The client approved exploring a layered animated basket → parcel transition but explicitly paused storefront changes while the merchant portal takes priority.
