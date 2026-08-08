import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bus, TRANSACTION_EVENTS } from '@bytebank/mfe-events';
import { brl } from '@bytebank/core';
import { registerBusPing, type RootState } from './store';

export default function Dashboard() {
  const busPings = useSelector((s: RootState) => s.ui.busPings);
  const dispatch = useDispatch();
  const emitBtnRef = useRef<HTMLElement>(null);

  // O DS emite eventos DOM (não onClick nativo); escuta via addEventListener.
  useEffect(() => {
    const el = emitBtnRef.current;
    if (!el) return;
    const handler = () => {
      dispatch(registerBusPing());
      bus.emit(TRANSACTION_EVENTS.CHANGED, { reason: 'created' });
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [dispatch]);

  return (
    <section className="dash-card">
      <div className="dash-badges">
        <span className="pill pill--react">React MFE</span>
        <span className="pill">Dashboard</span>
      </div>

      <h1>Olá do dashboard 👋</h1>
      <p>
        Este é o <strong>remote React</strong> montado pelo chassi via single-spa.
        Estado com <strong>Redux Toolkit</strong>, Design System carregado e bus de
        eventos pronto.
      </p>

      <div className="dash-metrics">
        <div className="metric">
          <span className="metric-label">Saldo (exemplo, via @bytebank/core)</span>
          <strong className="metric-value">{brl.format(12345.67)}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Eventos emitidos no bus</span>
          <strong className="metric-value">{busPings}</strong>
        </div>
      </div>

      {/* bb-button vem do Design System (web component Lit) — prova que o DS carregou */}
      <bb-button ref={emitBtnRef} label="Emitir evento no bus →" variant="primary" />
      <p className="dash-hint">
        Clique e veja o remote Angular de Transações reagir ao evento{' '}
        <code>transactions:changed</code>.
      </p>
    </section>
  );
}
