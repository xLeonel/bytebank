import http from "@/http";
import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";

type BackendTransaction = {
  _id: string;
  user: string;
  amount: number;
  type: string;
  date: string;
  description?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: { name: string; type: string; url: string }[];
};

export type CurrentUserData = {
  account: {
    type: string;
    balance: number;
    agency: string;
    number: string;
  };
  transactions: Transaction[];
};

// Valores do enum TransactionType da API -> rótulos exibidos na aplicação.
const TYPE_DISPLAY: Record<string, string> = {
  saque: "Saque",
  deposito: "Depósito",
  transferencia: "Transferência",
  pix: "Pix",
};

// A API devolve a data em ISO (YYYY-MM-DDTHH:mm:ss.sssZ). A aplicação espera
// DD/MM/YYYY. Usa-se UTC para não deslocar o dia conforme o fuso do browser.
function toDisplayDate(iso: string): string {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

function mapTransaction(tx: BackendTransaction): Transaction {
  return {
    id: tx._id,
    type: TYPE_DISPLAY[tx.type] ?? tx.type,
    amount: tx.amount,
    date: toDisplayDate(tx.date),
    description: tx.description,
    agency: tx.agency,
    account: tx.account,
    pixKey: tx.pixKey,
    attachments: (tx.attachments ?? []).map((a, i) => ({
      id: `${tx._id}-${i}`,
      name: a.name,
      size: 0,
      type: a.type,
      url: a.url,
    })),
  };
}

export async function getAccountData(): Promise<CurrentUserData> {
  const [profileRes, transactionsRes, balanceRes] = await Promise.all([
    http.get("/auth/profile"),
    http.get("/transactions"),
    http.get("/transactions/balance"),
  ]);

  const profile = profileRes.data as { agency?: string; bankAccount?: string };
  const txData = transactionsRes.data;
  const rawTransactions = (Array.isArray(txData) ? txData : txData?.value) as
    | BackendTransaction[]
    | undefined;
  const balance = Number(balanceRes.data?.balance ?? 0);

  return {
    account: {
      type: "Conta Corrente",
      balance,
      agency: profile.agency ?? "",
      number: profile.bankAccount ?? "",
    },
    transactions: (rawTransactions ?? []).map(mapTransaction),
  };
}
