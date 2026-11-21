# World Treasures — Product media storage review (20 Nov 2026)
Status: review only; **no new storage resource, subscription, payment, token or production change has been created**.

## Current development implementation
- Authenticated /admin/media lists the existing product image references, product names, and edit links (read-only).
- Local file preflight checks up to 8 JPEG/PNG/WebP/AVIF photos, 8 MiB each, with browser-local previews.
- No image files are uploaded, persisted or written to the database by preflight.
- Gallery URL entry and image ordering already exist in product editor.
- Automated tests run with build to confirm MIME, size, filename and selection-count checks.
- All product images remain associated with their owner product; no destructive media actions added.

## Provider comparison (check current dashboard prices/eligibility before buying)
### Vercel Blob — recommended for simplest integration with the current Next.js/Vercel admin
Official Vercel pricing page (accessed 20 Nov 2026): https://vercel.com/pricing
- Pricing page currently lists Pro plan allowances including 1 GB-month storage, 10K simple operations, 2K advanced operations, 10 GB monthly Blob transfer, then usage rates. Always check plan-specific limits.
- Vercel Hobby is intended for personal, non-commercial use. A merchant storefront needs appropriate commercial hosting terms; confirm current Vercel team plan.
- Client uploads: https://vercel.com/docs/vercel-blob/client-upload
- Use a dedicated public product-photo store; no customer documents or secrets inside it. Authenticated staff token exchange is required.
- Default Vercel Function body request limit is 4.5 MB: prefer direct browser-to-Blob upload, not server proxy.
- Expected cost for a small catalog may fit within a paid-plan allowance but usage depends on traffic, operations and average storage. **No guaranteed bill or claim of free commercial hosting.**

### Cloudflare R2 — lower raw object storage cost; more integration effort
Official https://developers.cloudflare.com/r2/pricing/
- Standard storage free tier listed as 10 GB, first 1M Class A and 10M Class B operations; egress fees from R2 are generally zero.
- Requires separate Cloudflare setup, public delivery domain/CDN, access policies, signed browser uploads and image optimization strategy.
- Check account and gateway requirements.

### Cloudinary — image transformations and media management, credit-based
Official https://cloudinary.com/pricing and https://cloudinary.com/documentation/billing_and_plans
- Provides image/video optimization, upload APIs, transformations; a free plan exists subject to credit-based allowances.
- Additional third-party account/setup and usage accounting.

## Recommended launch plan
1. Choose Vercel Blob **if** the existing Vercel team is on a suitable commercial plan and owner accepts variable metered charges; otherwise assess Cloudinary/R2.
2. Add a dedicated storage store connected to Preview only. Do not expose the server write token in frontend.
3. Use Vercel client upload with staff-authenticated server token exchange, supported MIME checks, 8 MiB max, unique non-guessable filenames, byte-level format verification and rate limiting.
4. After upload completes, add the resulting immutable URL to the product image gallery. Do not delete or overwrite blob files automatically when product changes; use explicit retention rules.
5. Test a real sample image through admin upload → persisted gallery → /catalog product detail → unpublish. Protect production until this gate passes.

## Rollout gate
Owner chooses provider and explicitly approves billable storage creation; no service should be provisioned before that confirmation. Do not represent preflight as functioning cloud upload.
