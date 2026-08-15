/** Anexo (comprovante) de uma transação. */
export type TransactionAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

/** Transação no formato usado pela UI (data em DD/MM/YYYY, rótulo em PT). */
export type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  category?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: TransactionAttachment[];
};

/**
 * Enum de tipo aceito pelo backend.
 *
 * 'transferencia' foi consolidado em 'pix' — eram o mesmo conceito, e o
 * cadastro só oferece "Transferência Pix".
 */
export type ApiTransactionType = 'saque' | 'deposito' | 'pix';

/**
 * Destino de um depósito. Define o sinal do valor: na própria conta credita,
 * em outra conta debita (o dinheiro sai daqui). Só se aplica a 'deposito'.
 */
export type DepositType = 'own' | 'other';

/** Transação no formato do backend (NestJS/Mongo). */
export type BackendTransaction = {
  _id: string;
  user: string;
  amount: number;
  type: string;
  depositType?: DepositType;
  date: string;
  description?: string;
  category?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: ApiAttachment[];
};

/** Anexo trafegado com o backend (comprovante em base64/data URL). */
export type ApiAttachment = { name: string; type: string; url: string };

/** Usuário autenticado. */
export type AuthUser = {
  userId?: string;
  name: string;
  email: string;
  agency?: string;
  bankAccount?: string;
};

/** Dados de conta + transações do usuário logado. */
export type AccountData = {
  account: {
    type: string;
    balance: number;
    agency: string;
    number: string;
  };
  transactions: Transaction[];
};
