/** Shared visibility rule for every public product route.
 * A product must be explicitly published and verified.
 */
export const publicProductWhere={status:"ACTIVE" as const,verified:true as const};
export function canAppearInPublicCatalog(product:{status:string;verified:boolean}):boolean{
 return product.status==="ACTIVE"&&product.verified===true;
}
