"use client";

import { useEffect, useRef } from "react";
import { useTransactions } from "@/contexts/Transactions";
import type { Props } from "./types";

function toDisplayDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Wraps bb-new-transaction-modal.
 *
 * The WC is only mounted when `open` is true so that its internal bb-modal
 * (which uses position:fixed on :host) never blocks pointer events while closed.
 *
 * Bug that was here before: useEffect had [] deps, so it ran once on mount
 * when open=false and ref.current=null — listeners were never attached.
 * Fix: depend on `open` so the effect re-runs when the element is in the DOM,
 * and pass `open` declaratively so Lit handles visibility without imperatively
 * setting el.open.
 */
export function NewTransactionModal({ open, onClose }: Props) {
  const { addTransaction } = useTransactions();
  const ref = useRef<HTMLElement>(null);

  // Keep latest callbacks in refs so event handlers never go stale.
  const addTransactionRef = useRef(addTransaction);
  addTransactionRef.current = addTransaction;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Runs whenever `open` changes. When open=true the element is already in the
  // DOM (rendered below), so ref.current is guaranteed to be set.
  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;

    const handleSubmit = (e: Event) => {
      const { type, amount, date } = (e as CustomEvent).detail as {
        type: string;
        amount: number;
        date: string; // YYYY-MM-DD from the date input inside the WC
      };
      addTransactionRef.current({
        type,
        amount,
        date: toDisplayDate(date),
      });
    };

    const handleClose = () => onCloseRef.current();

    el.addEventListener("submit", handleSubmit);
    el.addEventListener("close", handleClose);
    return () => {
      el.removeEventListener("submit", handleSubmit);
      el.removeEventListener("close", handleClose);
    };
  }, [open]); // re-run when open toggles so listeners are wired to the element

  // Only mount the WC when the modal should be visible.
  if (!open) return null;

  // Pass open declaratively — Lit reads the attribute on connect and shows
  // bb-modal without needing an imperative el.open = true call.
  return <bb-new-transaction-modal ref={ref} open />;
}
