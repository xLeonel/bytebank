import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";

export type Month = {
  label: string;
  transactions: Transaction[];
};
