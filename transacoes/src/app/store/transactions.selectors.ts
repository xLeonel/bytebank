import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TRANSACTIONS_FEATURE, type TransactionsState } from './transactions.state';

export const selectTransactionsState =
  createFeatureSelector<TransactionsState>(TRANSACTIONS_FEATURE);

export const selectTransactions = createSelector(
  selectTransactionsState,
  (s) => s.items,
);
export const selectTransactionsLoading = createSelector(
  selectTransactionsState,
  (s) => s.loading,
);
