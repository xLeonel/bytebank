import { createRoot } from 'react-dom/client';
import App from './App';

// Entry só para rodar o remote isolado (http://localhost:4201).
// Aqui carregamos o DS porque não há shell para registrá-lo.
import('@xleonel/bytebank-design-system');

createRoot(document.getElementById('dashboard-root')!).render(<App />);
