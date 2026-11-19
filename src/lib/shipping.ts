/** Preview-only pricing. Production quotes MUST come from server-side admin-managed city rates. */
export type ShippingQuote = { city: string; feeCents: number; configured: boolean };
export function shippingPreview(): ShippingQuote { return { city: "", feeCents: 0, configured: false }; }
