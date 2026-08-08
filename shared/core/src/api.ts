import { apiRequest } from './http.js';
import { toDisplayDate } from './format.js';
import type {
  AccountData,
  ApiAttachment,
  ApiTransactionType,
  AuthUser,
  BackendTransaction,
  Transaction,
  TransactionAttachment,
} from './types.js';

/* ------------------------------------------------------------------ *
 * Mapeamento de tipos front <-> back
 * ------------------------------------------------------------------ */

/** Enum da API -> rótulo exibido na UI. */
export const TYPE_DISPLAY: Record<string, string> = {
  saque: 'Saque',
  deposito: 'Depósito',
  transferencia: 'Transferência',
  pix: 'Pix',
};

/** Rótulo da UI -> enum da API. */
export const TYPE_API: Record<string, ApiTransactionType> = {
  Saque: 'saque',
  Depósito: 'deposito',
  Transferência: 'transferencia',
  'Transferência Pix': 'pix',
  Pix: 'pix',
};

/* ------------------------------------------------------------------ *
 * Anexos (comprovante)
 * ------------------------------------------------------------------ */

/** File -> anexo base64 (data URL) para envio ao backend. */
export function fileToApiAttachment(file: File): Promise<ApiAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ name: file.name, type: file.type, url: reader.result as string });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Anexos da UI -> formato do backend. */
export function toApiAttachments(
  attachments: TransactionAttachment[] | undefined,
): ApiAttachment[] {
  return (attachments ?? []).map((a) => ({ name: a.name, type: a.type, url: a.url }));
}

/** Anexos do backend -> formato da UI (id estável). */
export function toClientAttachments(
  attachments: ApiAttachment[] | undefined,
  txId: string,
): TransactionAttachment[] {
  return (attachments ?? []).map((a, i) => ({
    id: `${txId}-${i}`,
    name: a.name,
    size: 0,
    type: a.type,
    url: a.url,
  }));
}

/** Transação do backend -> formato da UI. */
export function mapTransaction(tx: BackendTransaction): Transaction {
  return {
    id: tx._id,
    type: TYPE_DISPLAY[tx.type] ?? tx.type,
    amount: tx.amount,
    date: toDisplayDate(tx.date),
    description: tx.description,
    category: tx.category,
    agency: tx.agency,
    account: tx.account,
    pixKey: tx.pixKey,
    attachments: toClientAttachments(tx.attachments, tx._id),
  };
}

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */

export type LoginResponse = {
  accessToken: string;
  name: string;
  email: string;
  agency?: string;
  bankAccount?: string;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/token', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/profile');
}

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  agency: string;
  bankAccount: string;
};

export function registerUser(input: RegisterInput): Promise<unknown> {
  return apiRequest('/users', { method: 'POST', body: JSON.stringify(input) });
}

/* ------------------------------------------------------------------ *
 * Transações
 * ------------------------------------------------------------------ */

export type CreateTransactionInput = {
  userId?: string;
  type: ApiTransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  category?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: ApiAttachment[];
};

export type UpdateTransactionInput = {
  description?: string;
  amount?: number;
  date?: string; // YYYY-MM-DD
  category?: string;
  attachments?: ApiAttachment[];
};

export function listTransactions(): Promise<BackendTransaction[]> {
  return apiRequest<BackendTransaction[] | { value: BackendTransaction[] }>(
    '/transactions',
  ).then((data) => (Array.isArray(data) ? data : data?.value ?? []));
}

export function getBalance(): Promise<number> {
  return apiRequest<{ balance?: number }>('/transactions/balance').then((d) =>
    Number(d?.balance ?? 0),
  );
}

export function createTransaction(
  input: CreateTransactionInput,
): Promise<BackendTransaction> {
  return apiRequest<BackendTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<BackendTransaction> {
  return apiRequest<BackendTransaction>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTransaction(id: string): Promise<unknown> {
  return apiRequest(`/transactions/${id}`, { method: 'DELETE' });
}

/** Agrega profile + transações + saldo no formato de conta da UI. */
export async function getAccountData(): Promise<AccountData> {
  const [profile, rawTransactions, balance] = await Promise.all([
    getProfile(),
    listTransactions(),
    getBalance(),
  ]);
  return {
    account: {
      type: 'Conta Corrente',
      balance,
      agency: profile.agency ?? '',
      number: profile.bankAccount ?? '',
    },
    transactions: rawTransactions.map(mapTransaction),
  };
}
