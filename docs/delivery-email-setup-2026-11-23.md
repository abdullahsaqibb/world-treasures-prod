# World Treasures — Delivery and transactional email handover

## What is already implemented
- Admin delivery page: manage city/province and standard ZAR rates, with an explicit **Publish** checkbox.
- Draft zones are not returned by the public `/api/shipping/cities` endpoint.
- Shipping quote endpoint `/api/shipping/quote?cityId=...` only returns currently active rates for active cities. No dummy cities or fees are seeded.
- Transactional email templates for a **verified paid order** and a clearly marked administrator connectivity test. Validation checks totals, quantities, and escapes HTML.
- Admin page `/admin/email` displays readiness without revealing secrets and can send a test **only to the owner login email** after configuration.
- Email is NOT sent to customers automatically. The checkout and payment integration remain disabled.

## Owner input: delivery
1. Confirm courier/provider (or owner-operated delivery) and exact South African cities/provinces served.
2. For each delivery city: fee in ZAR, pickup/courier coverage, cutoff time and expected delivery window.
3. For physical pickup: confirm the location and collection process. No unverified “free collection” advertising.
4. Enter each city with *Publish* unchecked in `/admin/delivery`. Review rate, then enable it deliberately. The public cities API will update automatically.
5. Do not enable real checkout until order, payment, inventory and fulfillment acceptance tests have passed.

## Owner input: email (recommended provider: Resend)
1. Create or access the Resend account under the business owner. In Resend add `worldtreasures.co.za` (or a dedicated sending subdomain) and **verify domain ownership**.
2. Add exactly the SPF/DKIM DNS records that Resend provides at the DNS host. Review existing mail SPF to avoid conflicting SPF TXT records. Do not guess these values.
3. Generate a scoped send-only Resend API key. Put it directly into **Vercel Project → Settings → Environment Variables** as `RESEND_API_KEY`. Select the correct deployment environment, never paste the key into chat, source control or screenshots.
4. Set `TRANSACTIONAL_EMAIL_FROM` to an email address at your Resend-verified domain (e.g. `orders@<verified-domain>`). This is a sender identity, not necessarily a mailbox. Add a reply-to strategy before taking live orders.
5. Set `EMAIL_ADMIN_TEST_ENABLED=true` temporarily in Production only when ready for a deliberate test. Redeploy for env changes to be applied.
6. Open `/admin/email` and press **Send owner-only test email**. It sends solely to `ADMIN_LOGIN_EMAIL` already configured on the server. Confirm inbox receipt, headers and provider delivery logs.
7. Set `EMAIL_ADMIN_TEST_ENABLED=false` after testing (or remove the toggle); redeploy. Do not enable automatic customer order emails before PayFast's signed notifications and order persistence are implemented and tested.

## Security notes
- No demo rates or emails are sent by the launch.
- No payment confirmation email should be generated based on a browser checkout return or arbitrary query parameters. It must derive from a server-verified payment against a persisted order.
- Secrets live in Vercel encrypted environment variables; check domain verification and operational delivery separately.
- Production and Preview Neon connections must remain isolated.
