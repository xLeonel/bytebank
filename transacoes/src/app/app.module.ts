import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './transacoes-app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  // Permite usar os elementos <bb-*> do Design System nos templates Angular.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
