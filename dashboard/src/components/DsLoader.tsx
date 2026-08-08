"use client";

import { useEffect } from "react";

/**
 * Loads the Bytebank Design System on the client side only.
 *
 * Lit Web Components rely on browser APIs (HTMLElement, customElements.define)
 * that don't exist in the Node.js SSR environment. Deferring the import to
 * useEffect ensures the library is only evaluated in the browser.
 *
 * Include this component once near the root of your client component tree.
 * All bb-* custom elements will be registered after it mounts.
 */
export function DsLoader() {
  useEffect(() => {
    import("@xleonel/bytebank-design-system");
  }, []);
  return null;
}
