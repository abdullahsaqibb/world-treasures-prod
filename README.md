# World Treasures — Production Migration (Phase 1)

This is a new **Next.js + TypeScript storefront**, migrated from the approved `World_Treasures_Mobile_Header_Pinch_Responsive.zip` prototype. It is NOT the existing single-file HTML prototype, and **it is not yet a live ecommerce website**.

## Three agreed phases

1. **Frontend** — preserve the 15 exact prototype products and images, the product-themed hero, single-product swipe controls, product-to-inspection handoff (downwards only), product inspection tilt/pinch zoom, 6 footer themes, desktop/mobile fixed header, and flying-to-cart animation. Implement responsive testing and refine loader separately. This starter implements the interactive storefront, but full visual/real-device acceptance testing remains outstanding. The heavy prototype loader is intentionally **not** transferred until an approved production animation is designed.
2. **Database + admin + commerce** — PostgreSQL via Neon, Prisma, Auth.js, protected role-based admin dashboard, product CRUD, image uploads, inventory, order state machine, customer addresses and cart persistence. Initial migration seeds the 15 prototype items but does NOT treat their quantities/prices as authoritative live stock.
3. **Delivery + PayFast + launch** — admin-configured shipping fees by destination city, authoritative server-side quotes, guest checkout, stock reservation, signed PayFast checkout, server-verified ITN, emails, QA and launch. Merchant credentials are added **last** and must never be checked into git.

## Start locally

Requires Node.js 20.9+ with a working npm registry connection.

```bash
npm install
npm run dev
```

Visit http://localhost:3000. To build for Vercel, run `npm run build`; the framework preset is Next.js. GitHub/Vercel deployment has **not** been performed for this deliverable.

## Catalog assets

`src/data/products.json` contains all 15 products extracted from the approved prototype. Images are standalone files under `public/products/` instead of embedded base64. The product-specific hero colorways were carried over. Prices/stock/descriptions are *prototype placeholders* and require administrative verification before real sales.

## Shipping implementation contract (Phase 3)

Use a city-based **rate table managed by the store owner**, with optional postal code and courier-specific overrides:

- `City`: city ID, province, canonical city name, normalized name and alias list
- `ShippingZone` (optional): groups multiple cities into a courier service region
- `ShippingRate`: city/zone, courier, service tier, fee in integer ZAR cents, active flag, optional weight/price bands, effective dates
- `ShippingQuote`: captured city, matched rate ID, fee, cart weight/subtotal and expiry
- `Order`: immutable shipping city, fee snapshot, validated address and payable total

Shipping calculation must happen **on the server** after city selection, never solely in browser JavaScript. City dropdown values must come from your own managed list; unknown places get “delivery quote required”, **not R0**. At checkout, recalculate the quote after any address/cart change; record the actual rate used with the order. Inventory reservation and shipping snapshots should be part of the checkout transaction.

**Suggested first launch**: flat fee per city with optional free-shipping threshold. Add courier-specific rates/weight brackets once real courier tariffs are available. Real-time carrier API integration is optional and can be added after launch.

See `docs/PRODUCTION_PLAN.md` and `prisma/schema.prisma` for the planned database architecture. The Prisma schema is provided as a Phase 2 design artifact, not enabled in Phase 1.

## What is intentionally NOT live yet

- Admin accounts and permissions
- Database connection and stock validation
- Delivery quote calculation and checkout
- Payment processing and PayFast ITN
- Order confirmation emails
- Verified product availability

The cart currently exists in browser state only. Checkout is explicitly disabled until Phase 3. No real payment is collected.
