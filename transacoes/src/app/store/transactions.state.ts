import type { Transaction } from '@bytebank/core';

export const TRANSACTIONS_FEATURE = 'transactions';

export interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

export const initialTransactionsState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};
