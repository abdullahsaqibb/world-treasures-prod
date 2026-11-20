/** Pure input validation shared by catalogue actions and automated tests. */
export function money(value: FormDataEntryValue | null): number {
 const s=String(value??"");
 if(!/^\d+(\.\d{1,2})?$/.test(s))throw new Error("Enter a non-negative ZAR amount (up to two decimals)");
 const [r,c=""]=s.split(".");
 const n=Number(r)*100+Number(c.padEnd(2,"0"));
 if(!Number.isSafeInteger(n)||n>100000000)throw new Error("Amount exceeds limit");
 return n;
}
export function qty(value:FormDataEntryValue|null):number{
 const s=String(value??"");
 if(!/^\d+$/.test(s))throw new Error("Invalid stock quantity");
 const n=Number(s);
 if(!Number.isSafeInteger(n)||n>1000000)throw new Error("Invalid stock quantity");
 return n;
}
export function clean(value:FormDataEntryValue|null,max=150):string{
 const result=String(value??"").trim();
 if(!result||result.length>max)throw new Error("Invalid text input");
 return result;
}
export function optionalText(value:FormDataEntryValue|null,max=1500):string{
 const result=String(value??"").trim();
 if(result.length>max)throw new Error("Text too long");
 return result;
}
export function slugify(value:string):string{
 return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
export function imagePath(value:string):string|null{
 if(!value)return null;
 if(value.startsWith("/")&&!value.startsWith("//")&&!/[\s\\?#]/.test(value)&&!value.split("/").includes(".."))return value;
 try {
  const url=new URL(value);
  if(url.protocol==="https:"&&url.hostname&&url.username===""&&url.password===""&&!/\s/.test(value))return url.toString();
 }catch{}
 throw new Error("Image must be a secure https URL or a local /products/... path");
}
export function checkAvailableStock(onHand:number,reserved:number):void{
 if(!Number.isSafeInteger(onHand)||!Number.isSafeInteger(reserved)||onHand<0||reserved<0||onHand<reserved){
  throw new Error("Stock cannot be lower than reserved units");
 }
}

/** Only reviewed inventory may be published to the public database-backed catalogue. */
export function checkPublishEligibility(product:{
 verified:boolean;name:string;description:string|null;images:string[];
 variants:Array<{sku:string;priceCents:number;onHand:number;reserved:number}>;
}):void{
 if(!product.verified)throw new Error("Verify the product against its actual packaging before publishing");
 if(!product.name.trim())throw new Error("Enter the product name before publishing");
 if(!product.description?.trim())throw new Error("Add a verified product description before publishing");
 if(!product.images.some(x=>Boolean(imagePath(x))))throw new Error("Add a product photo before publishing");
 if(!product.variants.length)throw new Error("Create a product variant before publishing");
 for(const variant of product.variants){
  if(!variant.sku.trim())throw new Error("Every variant requires an SKU");
  if(!Number.isSafeInteger(variant.priceCents)||variant.priceCents<=0)throw new Error("Every published variant needs a verified price greater than zero");
  checkAvailableStock(variant.onHand,variant.reserved);
 }
}
