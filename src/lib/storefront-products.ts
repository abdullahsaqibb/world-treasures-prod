/**
 * Canonical storefront representation of verified, published catalog variants.
 * Only callers that already applied publicProductWhere may pass products here.
 * Prices stay integer ZAR cents, and stock always excludes reservations.
 */
export type StorefrontItem={id:string;slug:string;name:string;category:string;image:string;priceCents:number;stock:number};
type CatalogProduct={
 name:string;slug:string;category:{name:string};images:Array<{url:string}>;
 variants:Array<{id:string;label:string;priceCents:number;inventory:{onHand:number;reserved:number}|null}>;
};
export function toStorefrontItems(products:CatalogProduct[]):StorefrontItem[]{
 return products.flatMap(product=>{
  const count=product.variants.length;
  return product.variants.filter(v=>Number.isSafeInteger(v.priceCents)&&v.priceCents>0).map(variant=>({
   id:variant.id,
   slug:product.slug,
   name:count>1&&variant.label!=="Standard"?product.name+" · "+variant.label:product.name,
   category:product.category.name,
   image:product.images[0]?.url??"",
   priceCents:variant.priceCents,
   stock:Math.max(0,(variant.inventory?.onHand??0)-(variant.inventory?.reserved??0))
  }));
 });
}
