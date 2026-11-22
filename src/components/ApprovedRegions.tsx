import React, { createElement, Fragment } from "react";
import source from "@/data/approved-markup.json";
import {copyFields,StoreCopyKey} from "@/lib/storefront-copy";

type SourceNode = string | { tag: string; attrs: Record<string, string>; children: SourceNode[] };
/** Public launch copy must not imply reviews, delivery or business details have been verified. */
const publicCopy:Record<string,string>={
 "Can I collect my order in store?":"Can I order or collect products now?",
 "Yes. Choose free store pickup and a collection slot at checkout. This prototype uses demo slots; a live order needs a confirmed ready-for-collection message.":"Online ordering and collection bookings are not enabled yet. You can browse the verified catalogue while we finish fulfillment setup.",
 "Where do you deliver, and what does it cost?":"Which areas will you deliver to?",
 "Demo only: Central costs R35, North R45, and South R50, with a R100 minimum basket. Estimated delivery is 1–2 hours during opening hours. Actual suburbs, fees and service times need store confirmation.":"Delivery coverage, fees and timelines have not been confirmed. We will publish real delivery options before accepting online orders.",
 "What if my order arrives damaged?":"What is your returns policy?",
 "Contact the shop with your order number and photos. This is a placeholder returns process; the final policy must explain remedies, food-related exclusions and applicable consumer rights.":"A complete returns and refunds policy will be published before online ordering is enabled. Applicable consumer rights will continue to apply.",
 "How do I check ingredients and allergens?":"Where can I verify ingredients and allergens?",
 "Check the product’s ingredients tab and physical label before eating. All ingredients in this prototype are fictional. Ask the store for verified information, especially if you have an allergy.":"Always read the packaging, ingredient list and allergen warnings on the actual product. Imported packaging can vary by batch; do not rely on illustrative product photographs for allergy decisions.",
 "Why do imported labels sometimes look different?":"Why might imported packaging differ?",
 "Packaging can vary by market. The live shop should provide verified local label information, origin, storage and expiry details for each batch.":"International packaging can differ between markets and batches. Verify the actual label, ingredients, storage instructions and expiry date before consuming.",
 "Free click & collect":"Collection coming soon",
 "Demo delivery: Central R35 · North R45 · South R50":"Delivery fees will be confirmed before checkout opens",
 "Delivery minimum R100 · Free store pickup":"Online ordering and delivery are not enabled yet",
 "Newsletter is a demo; no data is submitted.":"Newsletter signup is not active yet.",
 "Store address, delivery zones and policies await confirmation.":"Business location and delivery coverage will be announced when confirmed.",
 "Prices and stock are demo values. Takis Fuego and Ben & Jerry’s are online examples, not confirmed store inventory.":"Products and pricing are maintained in the World Treasures catalogue. Photographs may show packaging from different markets or batches.",
 "All added products are catalogue examples, not confirmed store inventory. Rear reference is a Vietnamese-market edition; verify your own batch before launch.":"Packaging and label details may differ from illustrative photographs. Always check the actual product.",
 "UI PROTOTYPE · NO REAL ORDERS OR PAYMENTS":"BROWSE-ONLY CATALOGUE · ONLINE ORDERS COMING SOON",
 "DEMO PRICING AND STOCK. THIS PROTOTYPE DOES NOT PLACE REAL ORDERS.":"Bundle previews only. No real orders or payments are accepted."
};

const nodes = source as SourceNode[];

/** The HTML design is intentionally lossless: do not replace the approved DOM with a new layout. */
function cssStyle(value: string): Record<string, string> {
  const result: Record<string,string> = {};
  for (const declaration of value.split(";")) {
    const split = declaration.indexOf(":");
    if (split < 0) continue;
    const name = declaration.slice(0, split).trim();
    const val = declaration.slice(split + 1).trim();
    if (name && val) result[name.startsWith("--") ? name : name.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase())] = val;
  }
  return result;
}
const aliases: Record<string,string> = {
  "class":"className", "for":"htmlFor", "tabindex":"tabIndex", "readonly":"readOnly",
  "maxlength":"maxLength", "viewbox":"viewBox", "preserveaspectratio":"preserveAspectRatio",
  "stroke-width":"strokeWidth", "stroke-linecap":"strokeLinecap", "stroke-linejoin":"strokeLinejoin",
  "fill-rule":"fillRule", "clip-rule":"clipRule", "stop-color":"stopColor",
  "stroke-dasharray":"strokeDasharray", "stroke-dashoffset":"strokeDashoffset",
  "crossorigin":"crossOrigin", "referrerpolicy":"referrerPolicy", "srcset":"srcSet",
  "autocomplete":"autoComplete", "autofocus":"autoFocus", "contenteditable":"contentEditable"
};
const flags = new Set(["disabled", "checked", "selected", "multiple", "hidden", "required", "open", "controls", "loop", "muted", "autoplay"]);
const voidTags = new Set(["img", "input", "br", "hr", "meta", "link", "source", "area", "col", "embed", "wbr"]);
function render(node: SourceNode, key: number | string, overrides: Partial<Record<StoreCopyKey,string>>, section=""): React.ReactNode {
  if (typeof node === "string") {
    if(publicCopy[node.trim()]!==undefined)return publicCopy[node.trim()];
    // Keep original prototype composition, without claiming fictional discounts.
    if(section==="mixBox"||section==="bundles"){
      return node.replaceAll("SAVE R25.","COMING SOON").replaceAll("SAVE R30.00","COMING SOON")
        .replaceAll("DEMO SAVING / R25.00","BUNDLE PRICING PENDING")
        .replaceAll("R139.70","PRICE PENDING").replaceAll("R109.70","PRICE PENDING")
        .replaceAll("R144.70","PRICE PENDING").replaceAll("R119.70","PRICE PENDING")
        .replaceAll("3 OF 3 SELECTED","BUILD YOUR BOX SOON")
        .replaceAll("Add three-pack to bag","Bundle builder coming soon");
    }
    return node;
  }
  // Keep the prototype layout, but never show fictional reviews, placeholder
  // premises/hours or unconfirmed social profiles as real business information.
  if(node.tag==="section"&&(
    node.attrs?.id==="visit"||
    node.attrs?.class?.split(" ").includes("reviews")||
    (node.attrs?.class==="section"&&JSON.stringify(node.children).includes("THE GROUP CHAT WAS RIGHT"))
  ))return null;
  if(node.tag==="a"&&(
    node.attrs?.href?.startsWith("https://wa.me/")||
    node.attrs?.href?.startsWith("tel:")||
    node.attrs?.href==="#visit"
  ))return null;
    const nextSection=node.attrs?.id&&["mixBox","bundles","flavourLab"].includes(node.attrs.id)?node.attrs.id:section;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name.startsWith("on")) continue;
    if (name === "style") { props.style = cssStyle(value); continue; }
    if (flags.has(name)) { props[aliases[name] || name] = true; continue; }
    props[aliases[name] || name] = value;
  }
  // The original prototype's box/bundle controls remain design previews, not sales.
  if((nextSection==="mixBox"||nextSection==="bundles")&&node.tag==="button"){
    props.disabled=true;
    props.title="Bundle purchases are not available yet";
  }
  if (voidTags.has(node.tag)) return createElement(node.tag, props);
  const directText=node.children.filter((c):c is string=>typeof c==="string").join(" ").replace(/\s+/g," ").trim();
  const editable=copyFields.find(field=>field.original===directText);
  if(editable && overrides[editable.key]!==undefined) return createElement(node.tag,props,overrides[editable.key]);
  const children=node.children.map((child,index)=>render(child,index,overrides,nextSection));
  return createElement(node.tag, props, ...children);
}
export function ApprovedRegions({overrides={}}:{overrides?:Partial<Record<StoreCopyKey,string>>}) {
  return createElement(Fragment, null, ...nodes.map((node,index)=>render(node,index,overrides)));
}
