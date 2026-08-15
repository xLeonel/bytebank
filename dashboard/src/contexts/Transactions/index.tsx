"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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

/** "DD/MM/YYYY" -> "YYYYMMDD", comparável lexicograficamente. */
function sortKey(display: string) {
  const [d, m, y] = display.split("/");
  return y && m && d ? `${y}${m}${d}` : display;
}

/**
 * Ordena da mais recente para a mais antiga, mantendo a ordem de inserção
 * dentro do mesmo dia (Array.sort é estável). Como `addTransaction` insere no
 * início, a transação recém-criada continua aparecendo primeiro entre as do
 * seu dia — mas uma transação retroativa vai para a posição certa da lista.
 */
function sortByDateDesc(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));
}

export function TransactionsProvider({
  initialBalance,
  initialTransactions,
  children,
}: ProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Exposta sempre ordenada: a home corta as 7 primeiras como "últimas
  // transações", então a ordem do array é o que define o card.
  const sorted = useMemo(() => sortByDateDesc(transactions), [transactions]);

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
      value={{ transactions: sorted, balance, addTransaction, updateTransaction, deleteTransaction }}
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
