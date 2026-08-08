import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";
import { MONTH_NAMES } from "@/app/(logged)/extrato/_constants";
import type { Month } from "../types";

export function groupByMonth(transactions: Transaction[]): Month[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const [, monthStr] = tx.date.split("/");
    const label = MONTH_NAMES[parseInt(monthStr, 10) - 1];
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  }
  return Array.from(map, ([label, transactions]) => ({ label, transactions }));
}
