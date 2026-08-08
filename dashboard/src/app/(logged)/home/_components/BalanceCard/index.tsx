"use client";

import { useEffect, useRef } from "react";
import { useTransactions } from "@/contexts/Transactions";
import type { Props } from "./types";

export function BalanceCard({ greetingName, today, accountType }: Props) {
  const { balance } = useTransactions();
  const ref = useRef<HTMLElement>(null);

  // Sync all properties via DOM ref (balance is a Number, others are Strings)
  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;
    el.greetingName = greetingName;
    el.today = today;
    el.accountType = accountType;
  }, [greetingName, today, accountType]);

  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;
    el.balance = balance;
  }, [balance]);

  return <bb-balance-card ref={ref} />;
}
