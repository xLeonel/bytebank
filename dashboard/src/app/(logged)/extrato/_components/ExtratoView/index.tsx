"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
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

/**
 * Lista de páginas a exibir no controle (estilo MUI): mostra os extremos + uma
 * janela larga ao redor da página atual, com reticências só onde há lacuna.
 * Ex.: 1 2 3 4 5 6 7 … 15  /  1 … 5 6 7 8 9 … 15  /  1 … 9 10 11 12 13 14 15
 */
function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  const siblingCount = 2; // páginas de cada lado da atual
  const boundaryCount = 1; // páginas fixas no início/fim
  const range = (start: number, end: number) =>
    Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

  // Se cabe quase tudo, mostra todas as páginas.
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  if (total <= totalNumbers + 2) return range(1, total);

  const startPages = range(1, boundaryCount);
  const endPages = range(total - boundaryCount + 1, total);

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] - 2
  );

  const items: (number | "ellipsis")[] = [...startPages];
  if (siblingsStart > boundaryCount + 2) items.push("ellipsis");
  else if (boundaryCount + 1 < total - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < total - boundaryCount - 1) items.push("ellipsis");
  else if (total - boundaryCount > boundaryCount) items.push(total - boundaryCount);
  items.push(...endPages);
  return items;
}

const ACTIVE_PAGE_STYLE: CSSProperties = {
  backgroundColor: "var(--bb-primary, #374C34)",
  color: "white",
  borderColor: "var(--bb-primary, #374C34)",
};

export default function ExtratoView() {
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const listRef = useRef<HTMLElement>(null);

  const isEmpty = transactions.length === 0;

  // Filtro instantâneo (todas as transações já estão no cliente): descrição ou tipo
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = normalizedSearch
    ? transactions.filter(
        (t) =>
          (t.description ?? "").toLowerCase().includes(normalizedSearch) ||
          t.type.toLowerCase().includes(normalizedSearch)
      )
    : transactions;

  const noResults = !isEmpty && filtered.length === 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Volta para a primeira página quando a busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Sincroniza itens + mensagem do estado vazio (sem resultado vs sem cadastro)
  useEffect(() => {
    const el = listRef.current as any;
    if (!el) return;
    el.items = paginatedTransactions;
    if (noResults) {
      el.emptyTitle = "Nenhum resultado encontrado";
      el.emptyDescription = `Não encontramos transações para "${searchTerm.trim()}".`;
    } else {
      el.emptyTitle = "Nenhuma transação por aqui ainda";
      el.emptyDescription = "Cadastre sua primeira transação para acompanhar suas finanças.";
    }
  }, [paginatedTransactions, noResults, searchTerm]);

  // transaction-select on the list
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
      <main className="bg-white rounded-md p-10 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-8">Extrato</h1>

        {/* Busca só faz sentido quando há transações cadastradas */}
        {!isEmpty && (
          <div className="mb-8">
            <input
              aria-label="Pesquisar transações"
              placeholder="Pesquisar por descrição ou tipo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-2 text-xs text-slate-500">
              {filtered.length === 0
                ? "Nenhuma transação encontrada"
                : `Exibindo ${Math.min(startIndex + 1, filtered.length)}-${Math.min(
                    startIndex + itemsPerPage,
                    filtered.length
                  )} de ${filtered.length} transações`}
            </div>
          </div>
        )}

        {/* group-by-month handled entirely inside bb-transaction-list */}
        <bb-transaction-list ref={listRef} group-by-month={true} />

        {/* Paginação só quando há mais de uma página */}
        {!isEmpty && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {getPageItems(currentPage, totalPages).map((page, index) =>
                page === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-slate-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? "page" : undefined}
                    className="h-9 w-9 rounded-md border border-slate-300 text-sm font-medium text-slate-700 transition"
                    style={currentPage === page ? ACTIVE_PAGE_STYLE : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-slate-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Only mount when a transaction is selected */}
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
