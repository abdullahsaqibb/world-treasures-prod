/** Product photo rules shared by media preflight and future authenticated uploads.
 * Client-side checks are only for UX; server must repeat checks and inspect bytes.
 */
export const MEDIA_MAX_BYTES=8*1024*1024;
export const MEDIA_MAX_FILES=8;
export const MEDIA_ALLOWED_TYPES=["image/jpeg","image/png","image/webp","image/avif"] as const;
export type MediaCandidate={name:string;size:number;type:string};
export function inspectMediaCandidate(candidate:MediaCandidate):string|null{
 if(!candidate.name||candidate.name.length>180||/[\\/\u0000-\u001f]/.test(candidate.name))return "Invalid file name.";
 if(!MEDIA_ALLOWED_TYPES.some(type=>type===candidate.type))return "Use JPEG, PNG, WebP or AVIF photographs.";
 if(!Number.isSafeInteger(candidate.size)||candidate.size<=0)return "The image file appears empty or invalid.";
 if(candidate.size>MEDIA_MAX_BYTES)return "Image exceeds 8 MB. Compress it before upload.";
 return null;
}
export function inspectMediaSelection(candidates:MediaCandidate[]):string[]{
 if(candidates.length>MEDIA_MAX_FILES)return ["Select at most 8 images per product."];
 return candidates.map((file,i)=>{const error=inspectMediaCandidate(file);return error?file.name+": "+error:"";}).filter(Boolean);
}

export function imageSignatureMatches(type:string,buf:Uint8Array):boolean{
 const ascii=(start:number,end:number)=>String.fromCharCode(...buf.slice(start,end));
 if(type==="image/jpeg")return buf[0]===255&&buf[1]===216&&buf[2]===255;
 if(type==="image/png")return buf[0]===137&&ascii(1,4)==="PNG"&&buf[4]===13&&buf[5]===10&&buf[6]===26&&buf[7]===10;
 if(type==="image/webp")return ascii(0,4)==="RIFF"&&ascii(8,12)==="WEBP";
 if(type==="image/avif")return ascii(4,8)==="ftyp"&&(ascii(8,12)==="avif"||ascii(8,12)==="avis");
 return false;
}
