"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "./constants";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);

  // Keep a stable ref to router so the click handler never goes stale
  const routerRef = useRef(router);
  routerRef.current = router;

  // Set items once on mount (array prop — must use DOM property, not attribute)
  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;
    el.items = NAV_ITEMS;
  }, []);

  // Intercept <a> clicks inside Shadow DOM → Next.js client-side navigation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = e
        .composedPath()
        .find((node) => (node as HTMLElement).tagName === "A") as
        | HTMLAnchorElement
        | undefined;
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) routerRef.current.push(href);
      }
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, []);

  // Pass current-path as an attribute so bb-sidebar re-renders the active
  // item on every navigation WITHOUT unmounting/remounting the element.
  // The DS reads this attribute in its @property({ attribute: 'current-path' })
  // and triggers a targeted re-render — no flash, smooth persistence.
  return <bb-sidebar ref={ref} current-path={pathname} />;
}
