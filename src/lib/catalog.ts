import catalog from "@/data/products.json";
export type Product = (typeof catalog)[number];
export const products: Product[] = catalog;
export const formatZAR = (cents: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
