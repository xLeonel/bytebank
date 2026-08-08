import { createReducer, on } from '@ngrx/store';
import { initialTransactionsState } from './transactions.state';
import * as Actions from './transactions.actions';

export const transactionsReducer = createReducer(
  initialTransactionsState,
  on(Actions.loadTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(Actions.loadTransactionsSuccess, (state, { items }) => ({
    ...state,
    loading: false,
    items,
  })),
  on(Actions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
