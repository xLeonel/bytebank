"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";

type ContextValue = {
  transactions: Transaction[];
  balance: number;
  addTransaction: (tx: Omit<Transaction, "id"> & { id?: string }) => void;
  updateTransaction: (id: string, partial: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
};

const TransactionsContext = createContext<ContextValue | null>(null);

type ProviderProps = {
  initialBalance: number;
  initialTransactions: Transaction[];
  children: ReactNode;
};

function sumAmounts(transactions: Transaction[]) {
  return transactions.reduce((acc, tx) => acc + tx.amount, 0);
}

export function TransactionsProvider({
  initialBalance,
  initialTransactions,
  children,
}: ProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const baseline = initialBalance - sumAmounts(initialTransactions);
  const balance = baseline + sumAmounts(transactions);

  const addTransaction = (tx: Omit<Transaction, "id"> & { id?: string }) => {
    setTransactions((prev) => [{ ...tx, id: tx.id ?? crypto.randomUUID() }, ...prev]);
  };

  const updateTransaction = (id: string, partial: Partial<Omit<Transaction, "id">>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...partial } : tx)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, balance, addTransaction, updateTransaction, deleteTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}
