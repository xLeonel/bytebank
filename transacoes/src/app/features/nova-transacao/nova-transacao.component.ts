import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { navigateToUrl } from 'single-spa';
import { TransactionsService, type NewTransactionDetail } from '../../core/transactions.service';
import { setMaxDateInputInShadow } from '../../core/dom-utils';

@Component({
  selector: 'app-nova-transacao',
  template: `
    <main class="card">
      <h1 class="title">Nova transação</h1>
      <bb-new-transaction-list #form></bb-new-transaction-list>
      <div class="toast toast--error" *ngIf="error">{{ error }}</div>
    </main>
  `,
  styles: [
    `
      :host { display: block; }
      .card { background: #fff; border-radius: 0.5rem; padding: 2.5rem; width: 100%; max-width: 42rem; }
      .title { font-size: 1.5rem; font-weight: 700; text-align: center; margin: 0 0 2rem; }
      .toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: #dc2626; color: #fff; padding: 0.75rem 1.25rem; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,.15); z-index: 1000; }
    `,
  ],
})
export class NovaTransacaoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('form', { static: true }) formRef!: ElementRef;
  error = '';

  private onSubmit = (e: Event) =>
    this.zone.run(() => this.handleSubmit((e as CustomEvent<NewTransactionDetail>).detail));
  private onCancel = () => this.zone.run(() => navigateToUrl('/home'));

  constructor(
    private readonly service: TransactionsService,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const el = this.formRef.nativeElement;
    setMaxDateInputInShadow(el);
    el.addEventListener('submit', this.onSubmit);
    el.addEventListener('cancel', this.onCancel);
  }

  ngOnDestroy(): void {
    const el = this.formRef?.nativeElement;
    el?.removeEventListener('submit', this.onSubmit);
    el?.removeEventListener('cancel', this.onCancel);
  }

  private async handleSubmit(detail: NewTransactionDetail): Promise<void> {
    this.error = '';
    try {
      await this.service.create(detail);
      navigateToUrl('/home');
    } catch {
      this.error = 'Não foi possível salvar a transação. Verifique os dados e tente novamente.';
    }
  }
}
