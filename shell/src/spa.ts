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

/** Rotas que pertencem ao remote Angular de Transações. */
export const isTransacoesPath = (pathname: string): boolean =>
  pathname.startsWith('/extrato') || pathname.startsWith('/nova-transacao');

declare global {
  interface Window {
    transacoesAngularRemote?: LifeCycles;
    __bytebankRegistered?: boolean;
  }
}

/* ----- dashboard (React remote) ----- */
// Dev: o Vite serve o módulo fonte. Prod: bundle com nome estável + CSS próprio
// (injetado aqui, pois um módulo importado dinamicamente não carrega seu <link>).
const loadDashboard = (): Promise<LifeCycles> => {
  if (import.meta.env.PROD) {
    if (!document.querySelector('link[data-dashboard-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${DASHBOARD_BASE}/dashboard.css`;
      link.setAttribute('data-dashboard-css', '');
      document.head.appendChild(link);
    }
    return import(/* @vite-ignore */ `${DASHBOARD_BASE}/dashboard.js`) as Promise<LifeCycles>;
  }
  return import(/* @vite-ignore */ `${DASHBOARD_BASE}/src/spa.tsx`) as Promise<LifeCycles>;
};

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
    // Em prod, injeta também o styles.css global do Angular (tokens/base).
    if (import.meta.env.PROD && !document.querySelector('link[data-transacoes-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${TRANSACOES_BASE}/styles.css`;
      link.setAttribute('data-transacoes-css', '');
      document.head.appendChild(link);
    }
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

/**
 * Pré-carrega (prefetch) os bundles dos remotes em produção, para que a
 * navegação entre React↔Angular seja instantânea (sem tela branca baixando .js).
 * Em dev não faz sentido (o Vite serve os módulos fonte on-demand).
 */
export function prefetchRemotes(): void {
  if (!import.meta.env.PROD) return;
  const hrefs = [
    `${DASHBOARD_BASE}/dashboard.js`,
    `${DASHBOARD_BASE}/dashboard.css`,
    `${TRANSACOES_BASE}/runtime.js`,
    `${TRANSACOES_BASE}/polyfills.js`,
    `${TRANSACOES_BASE}/main.js`,
    `${TRANSACOES_BASE}/styles.css`,
  ];
  for (const href of hrefs) {
    if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

export function registerRemotes(): void {
  if (window.__bytebankRegistered) return;
  window.__bytebankRegistered = true;

  registerApplication({
    name: 'dashboard',
    app: loadDashboard,
    // O remote React é o app (público + home/auth): ativo em tudo, exceto o
    // domínio de Transações (extrato / nova transação), que é do remote Angular.
    activeWhen: (location) => !isTransacoesPath(location.pathname),
  });

  registerApplication({
    name: 'transacoes',
    app: loadTransacoes,
    activeWhen: (location) => isTransacoesPath(location.pathname),
  });
}
