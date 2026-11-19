# World Treasures — React parity migration

This is the **visual parity migration** of `World_Treasures_Mobile_Header_Pinch_Responsive.zip`, the explicitly approved HTML source. It deliberately **does not redesign** the hero, layout, animations, product names, or theme system.

## Run

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Deploy on Vercel with framework preset **Next.js** (remove the old static-site Vercel build configuration if reusing a project).

## What was actually migrated

- All HTML body nodes are represented by `React.createElement` trees from `src/data/approved-markup.json`. No screenshot-based recreations, component library substitutions or extra marketing headlines.
- All original style blocks have been preserved in order in `src/app/globals.css`.
- The 15 approved catalog records, packaging images, hero behavior, theme switching, cart logic, loader and inspection code are retained *verbatim* in the temporary compatibility files under `public/legacy/`.
- `LegacyRuntime.tsx` sequentially loads these original scripts after React mounts the approved markup. This is a **transitional React migration**, not yet a complete rewrite of all interaction logic into hooks/state.
- The full input HTML is included as `reference-approved.html` for screenshot and DOM comparisons; remove it from a final production artifact once sign-off is complete.

## Why use a compatibility layer?

The original HTML embeds a huge catalog with media data and tightly coupled DOM event handlers. Reimplementing the carousel and handoff from memory previously changed the approved visuals and introduced regressions. This first milestone therefore prioritizes exact original appearance and behavior. The follow-up migration can safely replace interactions one at a time while comparing each to the reference.

## Required parity acceptance checks

1. Desktop 1440×900 and mobile 390×844, 375×812, 320×700: compare reference versus production screenshots.
2. 15 original catalog products, images and category filters, unchanged.
3. Multiple repeated single-product swipes from one pointer position on desktop; touch swipes on mobile.
4. Select a product; enter inspection from above; verify its downward-only handoff and drag/pinch zoom.
5. Switch all six footer palettes and verify accents throughout the site.
6. Add-to-cart product image reaches the compact fixed header bag; notification remains unobscured.
7. Loader exits in normal and offline/failed-script conditions.
8. Verify browser console and core Web Vitals on actual devices before production release.

## Scope and limitations

No PostgreSQL, admin dashboard, real payments, customer accounts, or courier-rate checkout is active in Phase 1. Prices and product information remain prototype placeholders until admin/product data is verified. The source/scripts are preserved for design parity and will be migrated into separate React interactive components after visual sign-off. Full Next.js build and physical-device testing must be completed in an environment where npm dependencies and browser testing are available.
