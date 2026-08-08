/**
 * Contrato de eventos entre os microfrontends do Bytebank.
 * Comunicação framework-agnóstica via window + CustomEvent.
 *
 * Padrão de nome: <domínio>:<ação>
 *   auth:*          -> eventos de autenticação (donos: shell/dashboard)
 *   transactions:*  -> eventos de transações   (dono: remote transacoes)
 */
export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
};

export const TRANSACTION_EVENTS = {
  CHANGED: 'transactions:changed',
};

class BrowserEventBus {
  on(eventName, handler) {
    const listener = (event) => handler(event.detail);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }

  emit(eventName, payload) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  }
}

/** Bus singleton compartilhado por todos os MFEs na mesma página. */
export const bus =
  window.__bytebankEventBus ?? (window.__bytebankEventBus = new BrowserEventBus());
