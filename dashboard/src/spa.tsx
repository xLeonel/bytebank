import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';

/**
 * Lifecycles single-spa do remote React. O shell importa este módulo
 * (import ESM cross-origin) e obtém bootstrap/mount/unmount.
 */
const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  domElementGetter: () =>
    document.getElementById('dashboard-root') ??
    (() => {
      const el = document.createElement('div');
      el.id = 'dashboard-root';
      document.body.appendChild(el);
      return el;
    })(),
  errorBoundary(err) {
    return <div className="dash-error">Erro ao carregar o dashboard: {String(err)}</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
