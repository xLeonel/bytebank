import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { listTransactions, mapTransaction } from '@bytebank/core';
import * as Actions_ from './transactions.actions';

@Injectable()
export class TransactionsEffects {
  constructor(private readonly actions$: Actions) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Actions_.loadTransactions),
      mergeMap(() =>
        from(listTransactions()).pipe(
          map((list) =>
            Actions_.loadTransactionsSuccess({ items: list.map(mapTransaction) }),
          ),
          catchError((err) =>
            of(
              Actions_.loadTransactionsFailure({
                error: String(err?.message ?? err),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
