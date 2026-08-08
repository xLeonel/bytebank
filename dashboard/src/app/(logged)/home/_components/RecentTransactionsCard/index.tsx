"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTransactions } from "@/contexts/Transactions";
import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";
import { setMaxDateInputInShadow } from "@/lib/webcomponent";
import {
  fileToApiAttachment,
  toApiAttachments,
  toClientAttachments,
  toIsoDate,
  updateTransactionApi,
  deleteTransactionApi,
} from "@/lib/transactionsApi";
import { Toast, type ToastVariant } from "@/app/(logged)/_components/Toast";

const MAX_ITEMS = 7;

type SaveData = {
  description: string;
  amount: number;
  date: string;
  attachments: Transaction["attachments"];
};

/**
 * Thin wrapper that bridges bb-transaction-detail-modal with React context.
 * Rendered only when activeTx is set — keeps bb-modal out of the DOM when closed.
 */
function DetailModal({
  transaction,
  onSave,
  onDelete,
  onError,
  onClose,
}: {
  transaction: Transaction;
  onSave: (id: string, data: SaveData) => void;
  onDelete: (id: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;
    // Set props — element is always open while mounted
    el.transaction = transaction;
    el.open = true;
    setMaxDateInputInShadow(el);

    const handleSave = async (e: Event) => {
      const { id, description, amount, date, newAttachments } = (e as CustomEvent).detail as {
        id: string;
        description: string;
        amount: number;
        date: string;
        newAttachments?: File[];
      };
      const newFile = newAttachments?.[0];
      const newApi = newFile ? [await fileToApiAttachment(newFile)] : null;
      const apiAtts = newApi ?? toApiAttachments(transaction.attachments);
      const finalClient = newApi ? toClientAttachments(newApi, id) : transaction.attachments ?? [];
      try {
        await updateTransactionApi(id, {
          description,
          amount,
          date: toIsoDate(date),
          attachments: apiAtts,
        });
      } catch (err) {
        console.error("Erro ao atualizar transação:", err);
        onErrorRef.current("Não foi possível salvar a transação. Tente novamente.");
        return;
      }
      onSaveRef.current(id, { description, amount, date, attachments: finalClient });
    };
    const handleDelete = async (e: Event) => {
      const id = (e as CustomEvent).detail.id as string;
      try {
        await deleteTransactionApi(id);
      } catch (err) {
        console.error("Erro ao excluir transação:", err);
        onErrorRef.current("Não foi possível excluir a transação. Tente novamente.");
        return;
      }
      onDeleteRef.current(id);
    };
    const handleClose = () => onCloseRef.current();

    el.addEventListener("save", handleSave);
    el.addEventListener("delete", handleDelete);
    el.addEventListener("close", handleClose);
    return () => {
      el.removeEventListener("save", handleSave);
      el.removeEventListener("delete", handleDelete);
      el.removeEventListener("close", handleClose);
    };
  }, [transaction]);

  return <bb-transaction-detail-modal ref={ref} />;
}

export function RecentTransactionsCard() {
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const listRef = useRef<HTMLElement>(null);

  const hasMore = transactions.length > MAX_ITEMS;

  // Sync items array to bb-transaction-list via DOM property (limitado a 7)
  useEffect(() => {
    const el = listRef.current as any;
    if (el) el.items = transactions.slice(0, MAX_ITEMS);
  }, [transactions]);

  // Wire transaction-select on bb-transaction-list
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e: Event) =>
      setActiveTx((e as CustomEvent<Transaction>).detail);
    el.addEventListener("transaction-select", handler);
    return () => el.removeEventListener("transaction-select", handler);
  }, []);

  const handleSave = (id: string, data: SaveData) => {
    updateTransaction(id, data);
    setActiveTx(null);
    setToast({ message: "Transação atualizada com sucesso.", variant: "success" });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setActiveTx(null);
    setToast({ message: "Transação excluída com sucesso.", variant: "success" });
  };

  return (
    <>
      <aside className="bg-white rounded-md p-6 flex flex-col self-stretch">
        <h2 className="text-lg font-bold mb-5">Últimas transações</h2>
        <bb-transaction-list ref={listRef} />
        {hasMore && (
          <div className="mt-auto pt-4 border-t border-gray-100 text-center">
            <Link
              href="/extrato"
              className="text-sm font-semibold text-[var(--bb-primary,#374C34)] hover:underline"
            >
              Ver todas as transações no extrato →
            </Link>
          </div>
        )}
      </aside>

      {/* Only mount the detail modal WC when a transaction is selected,
          so bb-modal's position:fixed :host never blocks the page. */}
      {activeTx && (
        <DetailModal
          transaction={activeTx}
          onSave={handleSave}
          onDelete={handleDelete}
          onError={(message) => setToast({ message, variant: "error" })}
          onClose={() => setActiveTx(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </>
  );
}
