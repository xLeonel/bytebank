import { useEffect, useRef, useState } from 'react';
import { navigateToUrl, start } from 'single-spa';
import { bus, AUTH_EVENTS } from '@bytebank/mfe-events';
import { registerRemotes, isTransacoesPath, prefetchRemotes } from './spa';

// Registra os remotes uma única vez (fora do ciclo de render do React).
registerRemotes();

const remoteFor = (pathname: string) => (isTransacoesPath(pathname) ? 'transacoes' : 'dashboard');

/**
 * Chassi fino: sem chrome próprio. Cada remote renderiza a UI completa.
 * Mostra um loader durante a troca de remote (React↔Angular) para não piscar
 * uma tela branca enquanto o bundle do MFE baixa/monta.
 */
function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [loading, setLoading] = useState(true);
  const activeRemote = useRef(remoteFor(window.location.pathname));

  // Design System registrado uma única vez, aqui, para todos os MFEs.
  useEffect(() => {
    import('@xleonel/bytebank-design-system');
  }, []);

  useEffect(() => {
    start({ urlRerouteOnly: true });
    // Aquece o cache dos bundles dos remotes (prod) após o carregamento inicial.
    const t = setTimeout(() => prefetchRemotes(), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onBeforeRoute = () => {
      // Só mostra o loader quando o remote realmente muda (não em navegação
      // interna do mesmo MFE, ex.: /home -> /login dentro do React).
      if (remoteFor(window.location.pathname) !== activeRemote.current) setLoading(true);
    };
    const onRoute = () => {
      setPath(window.location.pathname);
      activeRemote.current = remoteFor(window.location.pathname);
      setLoading(false);
    };
    window.addEventListener('single-spa:before-routing-event', onBeforeRoute);
    window.addEventListener('single-spa:routing-event', onRoute);
    window.addEventListener('popstate', onRoute);
    return () => {
      window.removeEventListener('single-spa:before-routing-event', onBeforeRoute);
      window.removeEventListener('single-spa:routing-event', onRoute);
      window.removeEventListener('popstate', onRoute);
    };
  }, []);

  // Contrato de auth entre MFEs: logout em qualquer remote leva à landing;
  // login leva à home. O chassi centraliza esse roteamento.
  useEffect(() => {
    const offLogout = bus.on(AUTH_EVENTS.LOGOUT, () => {
      if (window.location.pathname !== '/') navigateToUrl('/');
    });
    const offLogin = bus.on(AUTH_EVENTS.LOGIN, () => {
      if (!window.location.pathname.startsWith('/home')) navigateToUrl('/home');
    });
    return () => {
      offLogout();
      offLogin();
    };
  }, []);

  const isTransacoes = isTransacoesPath(path);

  return (
    <>
      {loading && (
        <div className="mfe-loading" role="status" aria-live="polite">
          <span className="mfe-spinner" aria-hidden="true" />
          <span className="mfe-loading-text">Carregando…</span>
        </div>
      )}
      {/* ids são alvo do domElementGetter de cada MFE; ficam sempre no DOM */}
      <div id="dashboard-root" hidden={isTransacoes} />
      <div id="transacoes-root" hidden={!isTransacoes} />
    </>
  );
}

export default App;
