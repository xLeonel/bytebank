import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { bus, TRANSACTION_EVENTS, type TransactionChangeReason } from '@bytebank/mfe-events';

@Component({
  selector: 'transacoes-root',
  template: `
    <section class="tx-card">
      <div class="tx-badges">
        <span class="pill pill--angular">Angular MFE</span>
        <span class="pill">Transações</span>
      </div>

      <h1>Olá do remote de Transações 👋</h1>
      <p>
        Este é o <strong>remote Angular</strong> montado pelo chassi via single-spa.
        Aqui vão morar listagem, filtros, paginação e o CRUD de transações (NgRx).
      </p>

      <div class="tx-bus">
        <bb-badge
          [attr.label]="'Eventos recebidos do bus: ' + busEvents"
          variant="info"
        ></bb-badge>
        <p class="tx-hint" *ngIf="lastReason">
          Último evento: <code>transactions:changed</code> ({{ lastReason }})
        </p>
        <p class="tx-hint" *ngIf="!lastReason">
          Clique em “Emitir evento no bus” no dashboard para ver este contador subir.
        </p>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tx-card {
        border-radius: 18px;
        padding: 28px;
        background: #fff;
        border: 1px solid rgba(55, 76, 52, 0.12);
        box-shadow: 0 10px 30px rgba(31, 42, 28, 0.06);
        color: #1f2a1c;
      }
      .tx-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 12px;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: #eef3ec;
        color: #47603f;
      }
      .pill--angular {
        background: #fee2e2;
        color: #b91c1c;
      }
      h1 {
        margin: 6px 0 8px;
        font-size: 1.6rem;
      }
      p {
        line-height: 1.6;
        color: #3f4a3b;
      }
      .tx-bus {
        margin-top: 18px;
        padding: 16px;
        border-radius: 14px;
        background: #f6f8f5;
        border: 1px solid rgba(55, 76, 52, 0.1);
      }
      .tx-hint {
        font-size: 0.9rem;
        color: #6b7568;
        margin: 10px 0 0;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  busEvents = 0;
  lastReason: TransactionChangeReason | '' = '';
  private unsubscribe?: () => void;

  constructor(private readonly ngZone: NgZone) {}

  ngOnInit(): void {
    this.unsubscribe = bus.on(TRANSACTION_EVENTS.CHANGED, (payload) => {
      // Eventos externos (fora do Angular) precisam rodar dentro do NgZone.
      this.ngZone.run(() => {
        this.busEvents += 1;
        this.lastReason = payload.reason;
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
