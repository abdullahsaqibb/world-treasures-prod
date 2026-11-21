import React, { createElement, Fragment } from "react";
import source from "@/data/approved-markup.json";
import {copyFields,StoreCopyKey} from "@/lib/storefront-copy";
import type {StorefrontItem} from "@/lib/storefront-products";
import {VerifiedCollections} from "./VerifiedCollections";

type SourceNode = string | { tag: string; attrs: Record<string, string>; children: SourceNode[] };
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
function render(node: SourceNode, key: number | string, overrides: Partial<Record<StoreCopyKey,string>>, products:StorefrontItem[]): React.ReactNode {
  if (typeof node === "string") return node;
  // Retire hardcoded demo product stories, offers, pseudo-bundles and arrivals.
  // Real merchandise in these areas is now managed by the shared live catalogue.
  if(["flavourLab","mixBox","bundles","countries","arrivals"].includes(node.attrs?.id??""))return null;
  if(node.attrs?.class?.split(" ").includes("arrivals")&&node.tag==="section")return null;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name.startsWith("on")) continue;
    if (name === "style") { props.style = cssStyle(value); continue; }
    if (flags.has(name)) { props[aliases[name] || name] = true; continue; }
    // Existing navigation must not point to removed demo-only merchandising sections.
    props[aliases[name] || name] = name==="href"&&["#arrivals","#bundles","#flavourLab"].includes(value)?"#shop":value;
  }
  if (voidTags.has(node.tag)) return createElement(node.tag, props);
  const directText=node.children.filter((c):c is string=>typeof c==="string").join(" ").replace(/\s+/g," ").trim();
  const editable=copyFields.find(field=>field.original===directText);
  if(editable && overrides[editable.key]!==undefined) return createElement(node.tag,props,overrides[editable.key]);
  const children=node.children.flatMap((child,index)=>{
    if(typeof child!=="string"&&child.tag==="section"&&child.attrs?.id==="shop"){
      return [render(child,index,overrides,products),createElement(VerifiedCollections,{products,key:"verified-arrivals"})];
    }
    return [render(child,index,overrides,products)];
  });
  return createElement(node.tag, props, ...children);
}
export function ApprovedRegions({overrides={},products=[]}:{overrides?:Partial<Record<StoreCopyKey,string>>;products?:StorefrontItem[]}) {
  return createElement(Fragment, null, ...nodes.filter(node=>typeof node==="string"||node.attrs?.class!=="exclusive-bar").map((node,index)=>render(node,index,overrides,products)));
}
