"use client";
import { useEffect } from "react";
import scripts from "@/data/legacy-scripts.json";

declare global { interface Window { __wtScriptsLoading?: boolean; __wtScriptsReady?: boolean; } }
/** Temporary compatibility adapter: original approved event handlers run against the same React-rendered DOM. */
export function LegacyRuntime() {
  useEffect(() => {
    if (window.__wtScriptsLoading || window.__wtScriptsReady) return;
    window.__wtScriptsLoading = true;
    let cancelled = false;
    (async () => {
      for (const spec of scripts) {
        if (cancelled) return;
        await new Promise<void>((resolve, reject) => {
          const tag = document.createElement("script");
          tag.src = spec.url;
          tag.async = false;
          tag.onload = () => resolve();
          // Original code allows GSAP to be absent; proceed with graceful fallback.
          tag.onerror = () => spec.kind === "external" ? resolve() : reject(new Error(`Could not load ${spec.url}`));
          document.body.appendChild(tag);
        });
      }
      window.__wtScriptsReady = true;
    })().catch(err => {
      console.error("World Treasures initialisation:", err);
      document.getElementById("intro")?.remove();
    });
    return () => { cancelled = true; };
  }, []);
  return null;
}
