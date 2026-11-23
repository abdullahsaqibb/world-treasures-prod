import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{
 return {
  rules:[{userAgent:"*",allow:["/","/catalog/"],disallow:["/admin/","/api/","/checkout/","/auth/"]}],
  sitemap:"https://www.worldtreasures.co.za/sitemap.xml",
  host:"https://www.worldtreasures.co.za"
 };
}
