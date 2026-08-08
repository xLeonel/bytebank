/** Usuário autenticado propagado no evento auth:login. */
export type AuthUser = {
  name: string;
  email: string;
  agency?: string;
  bankAccount?: string;
};

export const AUTH_EVENTS: {
  readonly LOGIN: 'auth:login';
  readonly LOGOUT: 'auth:logout';
};

export const TRANSACTION_EVENTS: {
  readonly CHANGED: 'transactions:changed';
};

/** Motivo pelo qual a lista de transações mudou. */
export type TransactionChangeReason = 'created' | 'updated' | 'deleted' | 'reloaded';

/** Mapa nome-do-evento -> payload. */
export type BytebankEvents = {
  [AUTH_EVENTS.LOGIN]: { token: string; user: AuthUser };
  [AUTH_EVENTS.LOGOUT]: undefined;
  [TRANSACTION_EVENTS.CHANGED]: { reason: TransactionChangeReason; id?: string };
};

type EventHandler<T> = (payload: T) => void;

export interface BrowserEventBus<Events extends Record<string, unknown>> {
  on<K extends keyof Events & string>(
    eventName: K,
    handler: EventHandler<Events[K]>,
  ): () => void;
  emit<K extends keyof Events & string>(
    eventName: K,
    ...payload: Events[K] extends undefined ? [] : [Events[K]]
  ): void;
}

declare global {
  interface Window {
    __bytebankEventBus?: BrowserEventBus<BytebankEvents>;
  }
}

export const bus: BrowserEventBus<BytebankEvents>;
