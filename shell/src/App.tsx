import { useEffect, useState } from 'react';
import { start } from 'single-spa';
import { registerRemotes } from './spa';

// Registra os remotes uma única vez (fora do ciclo de render do React).
registerRemotes();

/**
 * Chassi fino: sem chrome próprio. Cada remote renderiza a UI completa
 * (o app React da Fase 1 traz sua própria navbar/sidebar). O shell só
 * expõe os slots e deixa o single-spa montar/desmontar por rota.
 */
function App() {
  const [path, setPath] = useState(window.location.pathname);

  // Design System registrado uma única vez, aqui, para todos os MFEs.
  useEffect(() => {
    import('@xleonel/bytebank-design-system');
  }, []);

  useEffect(() => {
    start({ urlRerouteOnly: true });
  }, []);

  useEffect(() => {
    const onNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onNav);
    window.addEventListener('single-spa:routing-event', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('single-spa:routing-event', onNav);
    };
  }, []);

  const isTransacoes = path.startsWith('/transacoes');

  return (
    <>
      {/* ids são alvo do domElementGetter de cada MFE; ficam sempre no DOM */}
      <div id="dashboard-root" hidden={isTransacoes} />
      <div id="transacoes-root" hidden={!isTransacoes} />
    </>
  );
}

export default App;
