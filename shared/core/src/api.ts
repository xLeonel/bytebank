import { apiRequest } from './http.js';
import { toDisplayDate } from './format.js';
import type {
  AccountData,
  ApiAttachment,
  ApiTransactionType,
  AuthUser,
  BackendTransaction,
  DepositType,
  Transaction,
  TransactionAttachment,
} from './types.js';

/* ------------------------------------------------------------------ *
 * Mapeamento de tipos front <-> back
 * ------------------------------------------------------------------ */

/**
 * Enum da API -> rótulo exibido na UI.
 *
 * Os rótulos são exatamente as opções do formulário de cadastro (Design
 * System: bb-new-transaction-list), para o tipo exibido no extrato e nos
 * gráficos ser o mesmo que o usuário escolheu ao lançar a transação.
 */
export const TYPE_DISPLAY: Record<string, string> = {
  saque: 'Saque',
  deposito: 'Depósito',
  pix: 'Transferência Pix',
};

/** Rótulo da UI -> enum da API. */
export const TYPE_API: Record<string, ApiTransactionType> = {
  Saque: 'saque',
  Depósito: 'deposito',
  'Transferência Pix': 'pix',
  // Aceita o rótulo curto porque telas antigas ainda podem emiti-lo.
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

/**
 * Deriva o destino do depósito a partir do sinal que o Design System já
 * calcula: o bb-new-transaction-list emite valor negativo exatamente quando o
 * depósito é "Em outra conta". O backend precisa disso explícito porque a API
 * recebe o valor sempre positivo (@IsPositive) e aplica o sinal no servidor.
 */
export function inferDepositType(
  tipoExibido: string,
  valorComSinal: number,
): DepositType | undefined {
  if (tipoExibido !== 'Depósito') return undefined;
  return valorComSinal < 0 ? 'other' : 'own';
}

export type CreateTransactionInput = {
  userId?: string;
  type: ApiTransactionType;
  depositType?: DepositType;
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

/**
 * Ordena da mais recente para a mais antiga.
 *
 * O backend já devolve ordenado; isto é uma rede de segurança para não
 * depender da ordem da API (e para versões da API ainda sem o sort). Roda
 * sobre a transação crua, onde `date` ainda é ISO com hora — depois do
 * `mapTransaction` a data vira DD/MM/YYYY e a hora se perde.
 *
 * Desempate por `_id`: o ObjectId do Mongo começa com o timestamp de criação
 * e é crescente, então `_id` decrescente ≈ criada por último primeiro.
 */
export function sortTransactionsByDateDesc(
  transactions: BackendTransaction[],
): BackendTransaction[] {
  return [...transactions].sort((a, b) => {
    const diff = Date.parse(b.date) - Date.parse(a.date);
    if (diff) return diff;
    return b._id.localeCompare(a._id);
  });
}

export function listTransactions(): Promise<BackendTransaction[]> {
  return apiRequest<BackendTransaction[] | { value: BackendTransaction[] }>(
    '/transactions',
  )
    .then((data) => (Array.isArray(data) ? data : data?.value ?? []))
    .then(sortTransactionsByDateDesc);
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
