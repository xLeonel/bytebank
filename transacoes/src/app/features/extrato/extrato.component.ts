import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CATEGORIES, type Transaction } from '@bytebank/core';
import { loadTransactions } from '../../store/transactions.actions';
import { selectTransactions } from '../../store/transactions.selectors';
import { TransactionsService, type SaveTransactionDetail } from '../../core/transactions.service';
import { getPageItems, setMaxDateInputInShadow } from '../../core/dom-utils';

@Component({
  selector: 'app-extrato',
  template: `
    <main class="card">
      <h1 class="title">Extrato</h1>

      <div class="search" *ngIf="!isEmpty">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange()"
          placeholder="Pesquisar por descrição ou tipo"
          aria-label="Pesquisar transações"
        />
        <div class="filters">
          <label>
            Tipo
            <select [(ngModel)]="filterType" (ngModelChange)="onFilterChange()">
              <option value="">Todos</option>
              <option *ngFor="let t of typeOptions" [value]="t">{{ t }}</option>
            </select>
          </label>
          <label>
            Categoria
            <select [(ngModel)]="filterCategory" (ngModelChange)="onFilterChange()">
              <option value="">Todas</option>
              <option *ngFor="let c of categoryOptions" [value]="c">{{ c }}</option>
            </select>
          </label>
          <label>
            De
            <input type="date" [(ngModel)]="filterFrom" (ngModelChange)="onFilterChange()" />
          </label>
          <label>
            Até
            <input type="date" [(ngModel)]="filterTo" (ngModelChange)="onFilterChange()" />
          </label>
          <button type="button" class="clear" (click)="clearFilters()" [disabled]="!hasActiveFilters && !searchTerm">
            Limpar
          </button>
        </div>

        <div class="showing">{{ showingText }}</div>
      </div>

      <bb-transaction-list #list group-by-month="true"></bb-transaction-list>

      <div class="pager" *ngIf="!isEmpty && totalPages > 1">
        <div class="pages">
          <ng-container *ngFor="let p of pageItems; let i = index">
            <span class="ellipsis" *ngIf="p === 'ellipsis'">…</span>
            <button
              *ngIf="p !== 'ellipsis'"
              type="button"
              class="page"
              [class.active]="p === currentPage"
              (click)="goToPage(+p)"
            >
              {{ p }}
            </button>
          </ng-container>
        </div>
        <div class="prevnext">
          <button type="button" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
            Anterior
          </button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button type="button" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
            Próxima
          </button>
        </div>
      </div>
    </main>

    <div #modalHost></div>

    <div class="toast" *ngIf="toast" [class.toast--error]="toast.variant === 'error'">
      {{ toast.message }}
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .card {
        background: #fff; border-radius: 0.5rem; padding: 2.5rem;
        width: 100%; max-width: 42rem; margin: 0;
      }
      .title { font-size: 1.5rem; font-weight: 700; text-align: center; margin: 0 0 2rem; }
      .search { margin-bottom: 2rem; }
      .search input {
        width: 100%; border: 1px solid #cbd5e1; border-radius: 0.375rem;
        padding: 0.5rem 0.75rem; font-size: 0.875rem; font: inherit;
      }
      .search input:focus { outline: 2px solid var(--bb-primary, #374C34); outline-offset: 1px; }
      .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.75rem; align-items: flex-end; }
      .filters label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; }
      .filters select, .filters input { border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.4rem 0.5rem; font: inherit; font-size: 0.85rem; background: #fff; }
      .filters select:focus, .filters input:focus { outline: 2px solid var(--bb-primary, #374C34); outline-offset: 1px; }
      .filters .clear { border: 1px solid #cbd5e1; background: #fff; border-radius: 0.375rem; padding: 0.45rem 0.9rem; font: inherit; font-size: 0.85rem; color: #334155; cursor: pointer; }
      .filters .clear:disabled { opacity: 0.5; cursor: not-allowed; }
      .showing { margin-top: 0.75rem; font-size: 0.75rem; color: #64748b; }
      .pager { margin-top: 2.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; border-top: 1px solid #f3f4f6; padding-top: 1.5rem; }
      .pages { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.5rem; }
      .ellipsis { padding: 0 0.25rem; color: #94a3b8; }
      .page { height: 2.25rem; width: 2.25rem; border-radius: 0.375rem; border: 1px solid #cbd5e1; font-size: 0.875rem; font-weight: 500; color: #334155; background: #fff; cursor: pointer; }
      .page.active { background: var(--bb-primary, #374C34); color: #fff; border-color: var(--bb-primary, #374C34); }
      .prevnext { display: flex; align-items: center; gap: 1rem; }
      .prevnext button { border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-weight: 500; color: #334155; background: #fff; cursor: pointer; }
      .prevnext button:disabled { opacity: 0.5; cursor: not-allowed; }
      .prevnext span { font-size: 0.875rem; font-weight: 500; color: #475569; }
      .toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: #16a34a; color: #fff; padding: 0.75rem 1.25rem; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,.15); z-index: 1000; }
      .toast--error { background: #dc2626; }
    `,
  ],
})
export class ExtratoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('list', { static: true }) listRef!: ElementRef;
  @ViewChild('modalHost', { static: true }) modalHost!: ElementRef;

  all: Transaction[] = [];
  searchTerm = '';
  filterType = '';
  filterCategory = '';
  filterFrom = '';
  filterTo = '';
  currentPage = 1;
  itemsPerPage = 10;

  readonly typeOptions = ['Depósito', 'Saque', 'Transferência', 'Pix'];
  readonly categoryOptions = CATEGORIES;
  activeTx: Transaction | null = null;
  toast: { message: string; variant: 'success' | 'error' } | null = null;

  private sub?: Subscription;
  private modalEl: any = null;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly store: Store,
    private readonly service: TransactionsService,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadTransactions());
    this.sub = this.store.select(selectTransactions).subscribe((items) => {
      this.zone.run(() => {
        this.all = items;
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.renderList();
      });
    });
  }

  ngAfterViewInit(): void {
    this.listRef.nativeElement.addEventListener('transaction-select', (e: Event) =>
      this.zone.run(() => this.openDetail((e as CustomEvent<Transaction>).detail)),
    );
    this.renderList();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.closeDetail();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  /* ---------- derived ---------- */
  get isEmpty(): boolean { return this.all.length === 0; }
  get filtered(): Transaction[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.all.filter((t) => {
      if (q && !(t.description ?? '').toLowerCase().includes(q) && !t.type.toLowerCase().includes(q))
        return false;
      if (this.filterType && t.type !== this.filterType) return false;
      if (this.filterCategory && (t.category ?? '') !== this.filterCategory) return false;
      const iso = this.toIso(t.date);
      if (this.filterFrom && iso < this.filterFrom) return false;
      if (this.filterTo && iso > this.filterTo) return false;
      return true;
    });
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterType || this.filterCategory || this.filterFrom || this.filterTo);
  }

  /** 'DD/MM/YYYY' -> 'YYYY-MM-DD' (comparável lexicograficamente). */
  private toIso(display: string): string {
    const [d, m, y] = display.split('/');
    return y && m && d ? `${y}-${m}-${d}` : display;
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.itemsPerPage)); }
  get startIndex(): number { return (this.currentPage - 1) * this.itemsPerPage; }
  get paginated(): Transaction[] { return this.filtered.slice(this.startIndex, this.startIndex + this.itemsPerPage); }
  get pageItems(): (number | 'ellipsis')[] { return getPageItems(this.currentPage, this.totalPages); }
  get showingText(): string {
    const f = this.filtered.length;
    if (f === 0) return 'Nenhuma transação encontrada';
    const from = Math.min(this.startIndex + 1, f);
    const to = Math.min(this.startIndex + this.itemsPerPage, f);
    return `Exibindo ${from}-${to} de ${f} transações`;
  }

  /* ---------- actions ---------- */
  onSearchChange(): void { this.currentPage = 1; this.renderList(); }
  onFilterChange(): void { this.currentPage = 1; this.renderList(); }
  clearFilters(): void {
    this.filterType = '';
    this.filterCategory = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.renderList();
  }
  goToPage(p: number): void {
    this.currentPage = Math.min(Math.max(p, 1), this.totalPages);
    this.renderList();
  }

  private renderList(): void {
    const el = this.listRef?.nativeElement;
    if (!el) return;
    el.items = this.paginated;
    const noResults = !this.isEmpty && this.filtered.length === 0;
    el.emptyTitle = noResults ? 'Nenhum resultado encontrado' : 'Nenhuma transação por aqui ainda';
    el.emptyDescription = noResults
      ? `Não encontramos transações para "${this.searchTerm.trim()}".`
      : 'Cadastre sua primeira transação para acompanhar suas finanças.';
  }

  /* ---------- detail modal (imperativo p/ o web component) ---------- */
  private openDetail(tx: Transaction): void {
    this.activeTx = tx;
    this.closeDetail();
    const el: any = document.createElement('bb-transaction-detail-modal');
    el.transaction = tx;
    el.open = true;
    this.modalHost.nativeElement.appendChild(el);
    setMaxDateInputInShadow(el);
    el.addEventListener('save', (e: Event) =>
      this.zone.run(() => this.handleSave((e as CustomEvent<SaveTransactionDetail>).detail)),
    );
    el.addEventListener('delete', (e: Event) =>
      this.zone.run(() => this.handleDelete((e as CustomEvent<{ id: string }>).detail.id)),
    );
    el.addEventListener('close', () => this.zone.run(() => this.closeDetail()));
    this.modalEl = el;
  }

  private closeDetail(): void {
    if (this.modalEl?.parentNode) this.modalEl.parentNode.removeChild(this.modalEl);
    this.modalEl = null;
    this.activeTx = null;
  }

  private async handleSave(detail: SaveTransactionDetail): Promise<void> {
    try {
      await this.service.update(detail, this.activeTx?.attachments);
      this.store.dispatch(loadTransactions());
      this.closeDetail();
      this.showToast('Transação atualizada com sucesso.', 'success');
    } catch {
      this.showToast('Não foi possível salvar a transação. Tente novamente.', 'error');
    }
  }

  private async handleDelete(id: string): Promise<void> {
    try {
      await this.service.remove(id);
      this.store.dispatch(loadTransactions());
      this.closeDetail();
      this.showToast('Transação excluída com sucesso.', 'success');
    } catch {
      this.showToast('Não foi possível excluir a transação. Tente novamente.', 'error');
    }
  }

  private showToast(message: string, variant: 'success' | 'error'): void {
    this.toast = { message, variant };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.zone.run(() => (this.toast = null)), 4000);
  }
}
