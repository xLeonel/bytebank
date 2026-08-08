import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Com vários MFEs na mesma página, mais de um bundle pode tentar registrar os
// mesmos web components do DS na única CustomElementRegistry global. Tornamos o
// customElements.define idempotente para evitar o erro "already defined".
const nativeDefine = window.customElements.define.bind(window.customElements);
window.customElements.define = (name, ctor, options) => {
  if (!window.customElements.get(name)) nativeDefine(name, ctor, options);
};

// Sem StrictMode: evita o duplo-invoke de efeitos em dev, que dispararia
// o single-spa start()/registro duas vezes.
createRoot(document.getElementById('root')!).render(<App />);
