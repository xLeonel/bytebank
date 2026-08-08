import { createAction, props } from '@ngrx/store';
import type { Transaction } from '@bytebank/core';

export const loadTransactions = createAction('[Transactions] Load');
export const loadTransactionsSuccess = createAction(
  '[Transactions] Load Success',
  props<{ items: Transaction[] }>(),
);
export const loadTransactionsFailure = createAction(
  '[Transactions] Load Failure',
  props<{ error: string }>(),
);
