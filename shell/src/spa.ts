import { registerApplication, type LifeCycles } from 'single-spa';

/**
 * Registro dos microfrontends no chassi.
 *
 * - dashboard (React/Vite): carregado por import() ESM cross-origin — o dev
 *   server do Vite serve o módulo com CORS, então o shell só importa a URL.
 * - transacoes (Angular): carregado por injeção de <script> (runtime/polyfills/
 *   main) que registra os lifecycles em window.transacoesAngularRemote — mesmo
 *   padrão do single-spa-angular usado no demo do curso.
 */

const DASHBOARD_BASE = import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:4201';
const TRANSACOES_BASE = import.meta.env.VITE_TRANSACOES_URL ?? 'http://localhost:4202';

declare global {
  interface Window {
    transacoesAngularRemote?: LifeCycles;
    __bytebankRegistered?: boolean;
  }
}

/* ----- dashboard (React remote) ----- */
const loadDashboard = () =>
  import(/* @vite-ignore */ `${DASHBOARD_BASE}/src/spa.tsx`) as Promise<LifeCycles>;

/* ----- transacoes (Angular remote) ----- */
const ANGULAR_BUNDLES = ['runtime', 'polyfills', 'main'] as const;

function loadScript(src: string, marker: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[${marker}]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute(marker, 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}

const loadTransacoes = (): Promise<LifeCycles> =>
  new Promise((resolve, reject) => {
    if (window.transacoesAngularRemote) return resolve(window.transacoesAngularRemote);
    ANGULAR_BUNDLES.reduce(
      (chain, bundle) =>
        chain.then(() =>
          loadScript(`${TRANSACOES_BASE}/${bundle}.js`, `data-transacoes-${bundle}`),
        ),
      Promise.resolve(),
    )
      .then(() => {
        if (window.transacoesAngularRemote) resolve(window.transacoesAngularRemote);
        else reject(new Error('O remote Angular de transações não registrou o lifecycle.'));
      })
      .catch(reject);
  });

export function registerRemotes(): void {
  if (window.__bytebankRegistered) return;
  window.__bytebankRegistered = true;

  registerApplication({
    name: 'dashboard',
    app: loadDashboard,
    activeWhen: (location) =>
      location.pathname === '/' || location.pathname.startsWith('/dashboard'),
  });

  registerApplication({
    name: 'transacoes',
    app: loadTransacoes,
    activeWhen: (location) => location.pathname.startsWith('/transacoes'),
  });
}
