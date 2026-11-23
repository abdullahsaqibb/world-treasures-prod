# World Treasures — Dual delivery design

Two independent fulfillment choices are supported for confirmed city/province destinations:

- `LOCAL`: Store-driver/local dispatch to confirmed nearby cities or suburbs.
- `NATIONAL`: Courier delivery to approved South African destination cities.
- `STANDARD`: Legacy rate compatibility only; new shipping entries should use LOCAL/NATIONAL.

## Admin
`/admin/delivery` now has a service selector and separate fees for each method. Rates stay invisible until explicitly published. Adding LOCAL for one city does NOT publish NATIONAL for that city. Shipping fees use exact owner-supplied ZAR cents; no default charges or fake locations are seeded.

## Public read-only APIs
- `GET /api/shipping/cities?service=LOCAL`: only enabled local destinations.
- `GET /api/shipping/cities?service=NATIONAL`: only enabled courier destinations.
- `GET /api/shipping/quote?cityId=<id>&service=LOCAL`: fee for local delivery.
- `GET /api/shipping/quote?cityId=<id>&service=NATIONAL`: fee for courier delivery.
- `GET /api/shipping/cities`: compatibility list with enabled `services` for each destination.
- No configured service for the city returns HTTP 404; invalid service returns HTTP 400.

## Needed from the owner
1. Physical store's city/suburb and province, used to define local service coverage.
2. Actual neighboring local areas and their delivery fees.
3. Courier partner selection, their covered destinations, tariffs, size/weight restrictions and expected times.
4. Product shipping rules (especially ice cream and chilled drinks). Do not accept orders for goods not safe to ship by a given method.

Until approval of these details, leave all rates unpublished and checkout disabled. This is not postcode-level courier serviceability or a promise of blanket nationwide coverage. API response must not be treated as a final shipment reservation. Server-side order creation will need to re-quote and verify rate, stock, destination, and courier restrictions.
