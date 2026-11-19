import React, { createElement, Fragment } from "react";
import source from "@/data/approved-markup.json";
import {copyFields,StoreCopyKey} from "@/lib/storefront-copy";

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
function render(node: SourceNode, key: number | string, overrides: Partial<Record<StoreCopyKey,string>>): React.ReactNode {
  if (typeof node === "string") return node;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name.startsWith("on")) continue;
    if (name === "style") { props.style = cssStyle(value); continue; }
    if (flags.has(name)) { props[aliases[name] || name] = true; continue; }
    props[aliases[name] || name] = value;
  }
  if (voidTags.has(node.tag)) return createElement(node.tag, props);
  const directText=node.children.filter((c):c is string=>typeof c==="string").join(" ").replace(/\\s+/g," ").trim();
  const editable=copyFields.find(field=>field.original===directText);
  if(editable && overrides[editable.key]!==undefined) return createElement(node.tag,props,overrides[editable.key]);
  return createElement(node.tag, props, ...node.children.map((child, index) => render(child, index, overrides)));
}
export function ApprovedRegions({overrides={}}:{overrides?:Partial<Record<StoreCopyKey,string>>}) {
  return createElement(Fragment, null, ...nodes.map((node, index) => render(node, index, overrides)));
}
