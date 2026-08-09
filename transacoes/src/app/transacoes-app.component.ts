import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { navigateToUrl } from 'single-spa';
import { bus, AUTH_EVENTS } from '@bytebank/mfe-events';
import { clearSession, getSessionUser, getToken } from './core/session';

@Component({
  selector: 'transacoes-root',
  template: `
    <div class="logged" *ngIf="authed">
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="/home" (click)="nav($event, '/home')" aria-label="Ir para a página inicial">
            <img src="/bytebank-logo.svg" alt="Bytebank" class="logo" />
          </a>
          <div class="user">
            <span class="user-name">{{ userName }}</span>
            <span class="avatar" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
              </svg>
            </span>
            <button type="button" class="logout" (click)="logout()">Sair</button>
          </div>
        </div>
      </header>

      <div class="shell">
        <nav class="sidebar">
          <a href="/home" (click)="nav($event, '/home')" [class.active]="isActive('/home')">Início</a>
          <a href="/nova-transacao" (click)="nav($event, '/nova-transacao')" [class.active]="isActive('/nova-transacao')">Nova transação</a>
          <a href="/extrato" (click)="nav($event, '/extrato')" [class.active]="isActive('/extrato')">Extrato</a>
        </nav>

        <div class="content">
          <app-nova-transacao *ngIf="view === 'nova'"></app-nova-transacao>
          <app-extrato *ngIf="view === 'extrato'"></app-extrato>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .logged { min-height: 100vh; width: 100%; background: #e7efe5; display: flex; flex-direction: column;
        font-family: var(--bb-font-family, 'Inter Variable', ui-sans-serif, system-ui, sans-serif); color: #332e2b; }
      .topbar { background: var(--bb-primary, #374C34); color: #fff; }
      .topbar-inner { max-width: 80rem; margin: 0 auto; padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .brand { flex-shrink: 0; display: inline-flex; }
      .logo { height: 2rem; width: auto; object-fit: contain; }
      .user { display: flex; align-items: center; gap: 1rem; }
      .user-name { font-size: 0.875rem; font-weight: 500; }
      .avatar { width: 2.5rem; height: 2.5rem; border-radius: 9999px; border: 2px solid #f59e0b; color: #f59e0b; display: flex; align-items: center; justify-content: center; }
      .logout { background: transparent; border: 1px solid var(--bb-warning, #ffab00); color: var(--bb-warning, #ffab00); border-radius: 0.375rem; padding: 0.35rem 0.9rem; font: inherit; font-size: 0.875rem; cursor: pointer; }
      .logout:hover { background: rgba(255, 171, 0, 0.14); }
      .shell { flex: 1; width: 100%; max-width: 80rem; margin: 0 auto; padding: 2rem; display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 1.5rem; }
      .sidebar { background: #fff; border-radius: 0.5rem; padding: 1rem; height: fit-content; display: flex; flex-direction: column; gap: 0.25rem; }
      .sidebar a { display: block; padding: 0.625rem 0.875rem; border-radius: 0.375rem; color: #332e2b; text-decoration: none; font-size: 0.95rem; }
      .sidebar a:hover { background: #f1f5ef; }
      .sidebar a.active { background: var(--bb-primary, #374C34); color: #fff; font-weight: 600; }
      .content { min-width: 0; }
      @media (max-width: 768px) { .shell { grid-template-columns: 1fr; } }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  authed = false;
  view: 'extrato' | 'nova' = 'extrato';
  userName = 'Cliente';

  private readonly onRoute = () => this.zone.run(() => this.syncFromLocation());

  constructor(private readonly zone: NgZone) {}

  ngOnInit(): void {
    if (!getToken()) {
      navigateToUrl('/login');
      return;
    }
    this.authed = true;
    this.userName = getSessionUser()?.fullName ?? 'Cliente';
    this.syncFromLocation();
    window.addEventListener('popstate', this.onRoute);
    window.addEventListener('single-spa:routing-event', this.onRoute);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.onRoute);
    window.removeEventListener('single-spa:routing-event', this.onRoute);
  }

  private syncFromLocation(): void {
    this.view = window.location.pathname.startsWith('/nova-transacao') ? 'nova' : 'extrato';
  }

  isActive(path: string): boolean {
    return window.location.pathname.startsWith(path);
  }

  nav(event: Event, path: string): void {
    event.preventDefault();
    navigateToUrl(path);
  }

  logout(): void {
    clearSession();
    bus.emit(AUTH_EVENTS.LOGOUT);
    navigateToUrl('/');
  }
}
