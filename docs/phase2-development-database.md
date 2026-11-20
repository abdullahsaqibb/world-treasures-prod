# Phase 2 development database — verified setup

Neon project: `round-river-52997667`
Neon development branch: `developmentt` (`br-blue-surf-beydnbqx`)
Production branch: `production` (`br-calm-field-berc0yoc`)

## Verified on 2026-11-19 UTC
- Initial Prisma schema migration: `20261119_world_treasures_init` is recorded as successfully finished in `_prisma_migrations`.
- Development: 13 application tables plus `_prisma_migrations`.
- Seed: 15 products, 15 variants, 15 inventory records, 7 categories.
- All 15 seeded products have status `DRAFT` and `verified=false`. Prices and stock are provisional.
- Production Neon database remains without application tables; no production migration or seeding performed.
- The approved public storefront is unchanged. This branch's admin code is unmerged.

## Credentials
Vercel Preview contains DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct). AUTH_SECRET and ADMIN_GITHUB_IDS are also configured for Preview. Never commit secrets to Git.

## Remaining prerequisites
- Create a GitHub OAuth App and add `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` to Vercel Preview.
- Use the final protected Preview callback: `https://<preview-host>/api/auth/callback/github`.
- Rebuild preview so environment changes become effective; test allowed and unlisted GitHub accounts, admin product edit, and shipping updates.
- Confirm Preview DATABASE_URL resolves to the *developmentt* branch before applying any future migrations.
- Do not apply this migration on production or merge PR #1 until the admin sign-in and database integration have been validated.

## Repeatability
- Prisma migration source: `prisma/migrations/20261119_world_treasures_init/migration.sql`.
- Repeatable seed source: `prisma/seed.ts`, invoked by `npm run seed:prototype`.
- Subsequent production migrations should use `prisma migrate deploy` in a controlled release, never an ad hoc production `db push`.
