import '@fontsource-variable/inter';
import './app/globals.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router';

/**
 * Raiz do remote React (antes: app/layout.tsx do Next). Hospeda o roteamento
 * do app portado da Fase 1. O Design System é registrado pelo shell (uma vez).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
