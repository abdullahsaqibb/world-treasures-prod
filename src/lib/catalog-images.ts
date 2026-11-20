import {imagePath,optionalText} from "./catalog-validation";

/** Parse at most eight ordered and distinct, trusted product-image URLs. */
export function galleryFromForm(form:FormData):string[]{
 const cover=imagePath(optionalText(form.get("image"),1200));
 const lines=optionalText(form.get("galleryUrls"),7800).split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
 if(lines.length>7)throw new Error("Maximum 8 product images including the cover");
 const urls=[...(cover?[cover]:[]),...lines.map(value=>imagePath(value)!)];
 const unique=[...new Set(urls)];
 if(unique.length>8)throw new Error("Maximum 8 product images including the cover");
 return unique;
}
