# World Treasures — owner email/password login (Preview rollout)
Date: 2026-11-20
Branch: `feature/cloudinary-media-preview`

The original GitHub OAuth remains as fallback. The new owner credentials are independent of OAuth callback URLs and are disabled automatically in production (unless a later, separately reviewed production flag is enabled). The existing NextAuth HTTP-only JWT session is retained; sessions expire after eight hours.

## Owner setup (never put passwords in GitHub or chat)
1. Clone the project locally and switch to `feature/cloudinary-media-preview`. In a Mac Terminal, run `node scripts/create-admin-password-hash.mjs`. Enter a unique 16+ character password, which is hidden as you type. The script outputs only the salted scrypt verifier.
2. In Vercel → world-treasures-prod → Settings → Environment Variables, add:
   - `ADMIN_LOGIN_EMAIL`: the owner's login email (plain or encrypted value, Preview only; preferably target the Cloudinary preview branch).
   - `ADMIN_PASSWORD_SCRYPT`: the generated `salt:hash` verifier (Sensitive, Preview only; preferably branch-scoped).
   - `AUTH_SECRET`: already configured in Preview; do not replace unless rotating sessions.
3. Redeploy the `feature/cloudinary-media-preview` branch after saving variables.
4. Open its stable branch preview URL `/admin/login` and test incorrect password (deny) followed by correct password (allow), then `/admin/media`.
5. When verified, conduct Cloudinary upload + product draft attachment tests. Do NOT merge into main or change Production DNS.

## Security requirements before public admin custom domain
- Add persistent per-account/IP login attempt rate limiting and account lockout, preferably backed by a shared datastore (not in-memory serverless counters).
- Decide MFA or passkey for the owner and setup recovery. A password-only admin domain is insufficient for a public commerce control panel.
- Verify session/logout, authorization on every server action and upload endpoint, 404 on unavailable unverified content, cross-branch preview isolation and production database isolation.
- Attach `admin.worldtreasures.co.za` only after the owner approves a tested production admin release; Vercel may require DNS verification for the new subdomain. The existing apex/www remain untouched.

## Notes
- `ADMIN_PASSWORD_SCRYPT` format: 32-byte random salt (hex), colon, 64-byte scrypt digest (hex). The password is not stored in source or environment variables.
- Never share the password, verifier, GitHub OAuth secrets, Cloudinary API secret or database URL in chat.
- Vercel Preview variables must not be exposed via `NEXT_PUBLIC_` prefixes.
