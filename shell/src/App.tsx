import { useEffect, useState } from 'react';
import { navigateToUrl, start } from 'single-spa';
import { registerRemotes } from './spa';

// Registra os remotes uma única vez (fora do ciclo de render do React).
registerRemotes();

const NAV = [
  { path: '/', label: 'Dashboard' },
  { path: '/transacoes', label: 'Transações' },
];

function App() {
  const [path, setPath] = useState(window.location.pathname);

  // Carrega o Design System (web components Lit) no cliente.
  useEffect(() => {
    import('@xleonel/bytebank-design-system');
  }, []);

  // Inicia o single-spa depois que o layout (com os slots) já está no DOM.
  useEffect(() => {
    start({ urlRerouteOnly: true });
  }, []);

  // Mantém o destaque do menu em sincronia com a navegação single-spa.
  useEffect(() => {
    const onNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onNav);
    window.addEventListener('single-spa:routing-event', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('single-spa:routing-event', onNav);
    };
  }, []);

  const isActive = (p: string) =>
    p === '/' ? path === '/' || path.startsWith('/dashboard') : path.startsWith(p);

  return (
    <div className="app-shell">
      <header className="app-header">
        <a
          href="/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigateToUrl('/');
          }}
        >
          <span className="brand-mark">B</span> Bytebank
        </a>
        <nav className="app-nav">
          {NAV.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={isActive(item.path) ? 'nav-link nav-link--active' : 'nav-link'}
              onClick={(e) => {
                e.preventDefault();
                navigateToUrl(item.path);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span className="shell-badge">React shell</span>
      </header>

      <main className="app-main">
        {/* Slots dos remotes — os ids são alvo do domElementGetter de cada MFE.
            Ficam sempre no DOM; o single-spa monta/desmonta conforme a rota. */}
        <section
          id="dashboard-root"
          className="remote-slot"
          hidden={!isActive('/')}
          aria-live="polite"
        />
        <section
          id="transacoes-root"
          className="remote-slot"
          hidden={!isActive('/transacoes')}
          aria-live="polite"
        />
      </main>
    </div>
  );
}

export default App;
