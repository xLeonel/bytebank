import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import type { LifeCycles } from 'single-spa';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';

// Obs.: o Design System é registrado UMA vez pelo shell (custom elements são
// globais na página). Importá-lo aqui causaria "bb-* already defined".

import { AppModule } from './app/app.module';

declare const ngDevMode: boolean | undefined;

declare global {
  interface Window {
    transacoesAngularRemote?: LifeCycles;
  }
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: () =>
    platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule),
  template: '<transacoes-root></transacoes-root>',
  NgZone,
  domElementGetter: () => document.getElementById('transacoes-root') as HTMLElement,
});

// O shell lê este global após injetar os scripts do remote.
window.transacoesAngularRemote = lifecycles;

if (typeof ngDevMode === 'undefined' || !ngDevMode) {
  enableProdMode();
}

export const { bootstrap, mount, unmount } = lifecycles;
