import { Routes, Route } from 'react-router-dom';

// Páginas públicas
import Landing from '@/app/page';
import Login from '@/app/login/page';
import Cadastro from '@/app/cadastro/page';
import Sobre from '@/app/sobre/page';
import Servicos from '@/app/servicos/page';
import NotFound from '@/app/not-found';

// Área logada (layout com AuthGuard + Account/Transactions providers + Outlet)
import LoggedLayout from '@/app/(logged)/layout';
import HomePage from '@/app/(logged)/home/page';
// Obs.: /extrato e /nova-transacao agora são servidos pelo remote Angular
// (single-spa roteia essas paths para o MFE de Transações).

/**
 * Roteamento do app (antes: file-based do Next App Router). As rotas e URLs
 * são idênticas à Fase 1 para não mudar nada visualmente.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/servicos" element={<Servicos />} />

      <Route element={<LoggedLayout />}>
        <Route path="/home" element={<HomePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
