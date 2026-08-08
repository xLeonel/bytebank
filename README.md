# Bytebank — Microfrontends (Fase 2)

Monorepo da aplicação de gerenciamento financeiro **Bytebank**, reestruturada em
**chassi + microfrontends** com [single-spa](https://single-spa.js.org/),
integrando **React** e **Angular** na mesma página.

## Arquitetura

| Pacote            | Papel                                              | Stack                         | Porta (dev) |
|-------------------|----------------------------------------------------|-------------------------------|-------------|
| `shell/`          | Chassi (root-config): layout + orquestração        | React + Vite + single-spa     | **5173**    |
| `dashboard/`      | Remote: Home/Dashboard + gráficos + auth           | React + single-spa-react + RTK| **4201**    |
| `transacoes/`     | Remote: módulo de Transações (listagem/CRUD)       | Angular + single-spa-angular + NgRx | **4202** |
| `shared/core`     | Regras de domínio, tipos, api client (framework-free) | TypeScript puro            | —           |
| `shared/events`   | Contrato do event bus entre MFEs (`window`/`CustomEvent`) | TypeScript puro         | —           |

O **Design System** (`@xleonel/bytebank-design-system`, web components Lit) é
agnóstico e reutilizado pelo shell e pelos dois remotes.

Backend real: `../back-end-grupo1-app-finance` (NestJS + MongoDB + JWT), em
`http://localhost:3000`.

## Como rodar (dev)

```bash
npm install        # instala todos os workspaces
npm run dev        # sobe shell (5173) + dashboard (4201) + transacoes (4202)
```

Acesse **http://localhost:5173**. O shell carrega os remotes dinamicamente das
portas 4201/4202.

> Também é possível subir cada app isoladamente com `npm run dev -w shell`,
> `npm run start -w dashboard` e `npm run start -w transacoes`.

## Comunicação entre MFEs

Eventos seguem o padrão `<domínio>:<ação>` e são tipados em `shared/events`
(`@bytebank/mfe-events`). Ex.: `auth:login`, `auth:logout`, `transactions:changed`.
