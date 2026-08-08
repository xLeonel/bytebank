"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactions } from "@/contexts/Transactions";
import { useAccount } from "@/contexts/Account";
import { getCurrentUserId } from "@/lib/session";
import { fileToApiAttachment, toClientAttachments } from "@/lib/transactionsApi";
import { Toast } from "@/app/(logged)/_components/Toast";
import http from "@/http";

// Rótulos exibidos no web component -> valores do enum TransactionType da API.
const TRANSACTION_TYPE_API: Record<string, string> = {
  Depósito: "deposito",
  Saque: "saque",
  "Transferência Pix": "pix",
};

function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function NovaTransacaoForm() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { data: accountData } = useAccount();
  const ref = useRef<HTMLElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Stable refs so the effect closure never goes stale
  const addTransactionRef = useRef(addTransaction);
  addTransactionRef.current = addTransaction;
  const accountDataRef = useRef(accountData);
  accountDataRef.current = accountData;

  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;

    const handleSubmit = async (e: Event) => {
      setSubmitError(null);
      const { type, amount, date, description, agency, account, pixKey, attachments } = (e as CustomEvent).detail as {
        type: string;
        amount: number;
        date: string; // YYYY-MM-DD from the WC date input
        description?: string;
        agency?: string;
        account?: string;
        pixKey?: string;
        attachments?: File[]; // arquivos vindos do input de anexos do DS
      };

      const files = attachments ?? [];
      const apiAttachments = await Promise.all(files.map(fileToApiAttachment));

      // Saque and Depósito to own account don't carry ag/conta from the WC —
      // enrich here with the logged-in user's own account data.
      const needsOwnAccount = type === 'Saque' || (type === 'Depósito' && amount > 0);
      const ownAccount = needsOwnAccount ? accountDataRef.current?.account ?? null : null;

      const enrichedAgency = ownAccount ? ownAccount.agency : agency;
      const enrichedAccount = ownAccount ? ownAccount.number : account;

      let createdId: string | undefined;
      try {
        // Garante que amount sempre chegue como número positivo (o backend
        // valida com @IsNumber/@IsPositive/@IsNotEmpty).
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount)) {
          console.error("Valor inválido no submit:", amount);
          throw new Error("Valor da transação inválido");
        }

        const payload = {
          userId: getCurrentUserId(),
          type: TRANSACTION_TYPE_API[type] ?? type,
          amount: Math.abs(numericAmount),
          date: date,
          description: description,
          agency: enrichedAgency,
          account: enrichedAccount,
          pixKey: pixKey,
          attachments: apiAttachments,
        };

        const responseAxios = await http.post("/transactions", payload);

        if (responseAxios.status < 200 || responseAxios.status >= 300) {
          throw new Error("Falha ao criar transação");
        }
        createdId = responseAxios.data?._id;
      } catch (error) {
        console.error("Erro ao criar transação:", error);
        setSubmitError(
          "Não foi possível salvar a transação. Verifique os dados e tente novamente."
        );
        return;
      }

      addTransactionRef.current({
        id: createdId,
        type,
        amount,
        date: toDisplayDate(date),
        description,
        agency: enrichedAgency,
        account: enrichedAccount,
        pixKey,
        attachments: toClientAttachments(apiAttachments, createdId ?? ""),
      });
      router.push("/home");
    };

    const handleCancel = () => router.push("/home");

    el.addEventListener("submit", handleSubmit);
    el.addEventListener("cancel", handleCancel);
    return () => {
      el.removeEventListener("submit", handleSubmit);
      el.removeEventListener("cancel", handleCancel);
    };
  }, [router]);

  return (
    <main className="bg-white rounded-md p-8 md:p-10 w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-center mb-8">Nova transação</h1>
      <bb-new-transaction-list ref={ref} />
      {submitError && (
        <Toast message={submitError} variant="error" onClose={() => setSubmitError(null)} />
      )}
    </main>
  );
}
