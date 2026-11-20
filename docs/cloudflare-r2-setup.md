# World Treasures — Cloudflare R2 product photo setup

Status: Selected provider, implementation staged in `feature/admin-backend-foundation`. **Not connected yet**, no bucket created, no credentials obtained, no DNS or production changes.

## Pricing and limits
- R2 Standard: first 10 GB-month storage, 1 million Class A writes/lists, and 10 million Class B reads per month included; no direct R2 egress charges. Excess usage is billed according to Cloudflare's current price schedule.
- Monthly free allowances are **not a hard spending limit**. Confirm available account budget/alerts, payment method requirements, and R2 enablement screens before agreeing to charges.
- Primary source: https://developers.cloudflare.com/r2/pricing/

## Owner actions in Cloudflare dashboard
1. Sign in at https://dash.cloudflare.com/ . Navigate to **R2 Object Storage** and activate R2, reviewing any payment-method or billing prompts. Do not give Cloudflare billing or account passwords to ChatGPT.
2. Create a **Standard** bucket named `world-treasures-products-dev` (use an available bucket name). Keep this separate from any future production bucket.
3. Enable its **public development URL** under bucket settings for image delivery during testing. Copy the root `https://pub-...r2.dev` URL into Vercel `R2_PUBLIC_BASE_URL`. Never upload private records, ID documents, or customer information to the publicly readable bucket. The `r2.dev` development hostname is rate-limited and should not serve production traffic long-term. For production, arrange an appropriate custom media domain and Cloudflare cache, after ownership/DNS review.
4. Create an R2 **S3-compatible API token** scoped to this specific bucket with Object Read & Write privileges. Obtain the Access Key ID and Secret Access Key. A scoped token is preferred to account-wide privileges.
5. Open Vercel project `world-treasures-prod` → Settings → Environment Variables. Add the five names below to **Preview** only (no secrets in chat or source control):
   - `R2_ACCOUNT_ID`: your Cloudflare 32-character account ID.
   - `R2_BUCKET_NAME`: your development bucket name.
   - `R2_ACCESS_KEY_ID`: the scoped API token's S3 Access Key ID.
   - `R2_SECRET_ACCESS_KEY`: the scoped S3 Secret Access Key.
   - `R2_PUBLIC_BASE_URL`: public development delivery URL, e.g. `https://pub-...r2.dev`.
6. Bucket → Settings → **CORS**. Permit browser PUTs from the exact stable Vercel development URL:
```json
[
  {
    "AllowedOrigins": [
      "https://world-treasures-prod-git-featur-c374cc-masaqib10-7957s-projects.vercel.app"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
Use Cloudflare's CORS JSON editor; do **not** use `*` for an admin-only upload origin.
7. Redeploy `feature/admin-backend-foundation` Preview so the environment variables are available. The static code will build even before the credentials are configured, but uploads remain disabled until they exist.

## Implemented architecture
- `GET /api/admin/media/r2`: staff-protected status (configured true/false, no credentials).
- `POST /api/admin/media/r2` with `action:sign`: checks staff login, request origin, filename, size, supported MIME type; generates an unpredictable per-image key and a 90-second presigned **PUT** URL on Cloudflare's S3 API endpoint.
- The browser uploads directly to R2, never passing image bytes through a Vercel serverless request.
- `POST /api/admin/media/r2` with `action:confirm`: uses R2 HeadObject + initial-byte Range request to validate the object size, advertised MIME and JPEG/PNG/WebP/AVIF file signature. On success returns the public delivery URL.
- Admin product editor: upon successful upload, append URL to product cover/gallery fields; staff must **Save product** to persist it.
- Admin media library: signed-upload control and URL for manual reuse. No automatic file deletion or billing side effects in application code.
- Media uploads are denied when credentials/bucket are absent.

## Important further hardening before public production
- Add durable per-staff upload quotas/rate limiting and orphan-object cleanup policy. Short-lived PUT signatures restrict key and content type, **but may not strictly cap actual transmitted bytes**; don't rely on preflight size checks as a hard storage quota.
- Verify full image decodability and dimensions, ideally via an image processing pipeline, rather than relying solely on MIME and magic bytes. Avoid allowing user-supplied SVG, HTML, executable or private documents.
- Token permissions, CORS and public bucket behavior must be tested with real images. Review uploaded content moderation and image ownership.
- Ensure `R2_PUBLIC_BASE_URL` uses an appropriate custom domain for production; Cloudflare recommends avoiding `r2.dev` for production use.
- Monitor storage and operation usage and configure Cloudflare billing notifications if available.
- Do not enable admin or R2 uploads on production without a separate sign-off.

## Acceptance procedure
1. Sign in at the stable development admin hostname and open `/admin/media`.
2. Confirm the R2 uploader reports connected, not disabled.
3. Upload a tiny approved JPEG or WebP under 8 MB. Confirm the URL opens publicly.
4. Attach URL to a **DRAFT** product and save. Verify it reopens, showing the image.
5. Add second photo and verify gallery ordering.
6. Using a real owner-approved verified product, publish and view `/catalog/[slug]`, then unpublish and verify it disappears.
7. Repeat on mobile browser; run and check Vercel runtime logs and Cloudflare R2 bucket requests.
