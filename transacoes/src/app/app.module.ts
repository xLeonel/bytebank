import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './transacoes-app.component';
import { ExtratoComponent } from './features/extrato/extrato.component';
import { NovaTransacaoComponent } from './features/nova-transacao/nova-transacao.component';
import { transactionsReducer } from './store/transactions.reducer';
import { TRANSACTIONS_FEATURE } from './store/transactions.state';
import { TransactionsEffects } from './store/transactions.effects';

@NgModule({
  declarations: [AppComponent, ExtratoComponent, NovaTransacaoComponent],
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot({ [TRANSACTIONS_FEATURE]: transactionsReducer }),
    EffectsModule.forRoot([TransactionsEffects]),
  ],
  bootstrap: [AppComponent],
  // Permite usar os elementos <bb-*> do Design System nos templates Angular.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
