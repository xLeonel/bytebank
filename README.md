# Bytebank — Microfrontends (Fase 2)

Monorepo da aplicação de gerenciamento financeiro **Bytebank**, reestruturada em
**chassi + microfrontends** com [single-spa](https://single-spa.js.org/),
integrando **React** e **Angular** na mesma página.

- **Repositório (monorepo):** https://github.com/xLeonel/bytebank
- **Design System:** [github.com/xLeonel/bytebank-design-system](https://github.com/xLeonel/bytebank-design-system) — publicado como [`@xleonel/bytebank-design-system`](https://www.npmjs.com/package/@xleonel/bytebank-design-system) (web components Lit)
- **Backend:** [github.com/elandro18/back-end-grupo1-app-finance](https://github.com/elandro18/back-end-grupo1-app-finance) (NestJS + MongoDB + JWT)

## Arquitetura

| Pacote            | Papel                                                     | Stack                                | Porta (dev) |
|-------------------|-----------------------------------------------------------|--------------------------------------|-------------|
| `shell/`          | Chassi (root-config): orquestra os MFEs por rota          | React + Vite + single-spa            | **5173**    |
| `dashboard/`      | Remote: Home/Dashboard + gráficos + auth                  | React + single-spa-react             | **4201**    |
| `transacoes/`     | Remote: módulo de Transações (listagem/CRUD/filtros)      | Angular + single-spa-angular + NgRx  | **4202**    |
| `shared/core`     | Regras de domínio, tipos, validações, categorias, api client | TypeScript puro                   | —           |
| `shared/events`   | Contrato do event bus entre MFEs (`window`/`CustomEvent`) | TypeScript puro                      | —           |

- **Roteamento:** o shell ativa o remote **Angular** em `/extrato` e
  `/nova-transacao`; o remote **React** responde por todo o resto (público, login,
  cadastro, `/home`).
- **Estado:** NgRx (transações, no Angular) + Context/bus (React) — sincronizados
  pelo event bus.
- **Comunicação entre MFEs:** eventos `<domínio>:<ação>` tipados em
  `@bytebank/mfe-events` (`auth:login`, `auth:logout`, `transactions:changed`).
  Ex.: criar/editar/excluir no Angular emite `transactions:changed` → o dashboard
  React recarrega saldo e gráficos.
- **Design System** (Lit) é agnóstico e registrado **uma vez** pelo shell.

## Tecnologias

- **Microfrontends:** single-spa (chassi + remotes React e Angular)
- **Chassi/Dashboard (React):** React 19, Vite, React Router
- **Transações (Angular):** Angular 18, NgRx
- **Design System:** Lit (web components), publicado no npm
- **Estado:** NgRx (Angular) + event bus (`window`/`CustomEvent`)
- **Gráficos:** Recharts · **Estilo:** Tailwind CSS v4
- **Linguagem:** TypeScript em todo o monorepo (npm workspaces)
- **Backend:** NestJS + MongoDB + JWT (REST + GraphQL)
- **Infra:** Docker + Docker Compose + Caddy (reverse proxy/HTTPS) · deploy AWS EC2

## Como rodar em desenvolvimento

Pré-requisitos: Node 20+, o backend rodando em `http://localhost:3000`
(via o `docker-compose` do repositório do backend).

```bash
npm install     # instala todos os workspaces
npm run dev     # sobe shell (5173) + dashboard (4201) + transacoes (4202)
```

Acesse **http://localhost:5173**. Para subir isolado: `npm run dev -w shell`,
`npm run start -w dashboard`, `npm run start -w transacoes`.

## Rodar tudo com Docker (front + back + mongo)

Um único `docker compose` sobe **frontends (Caddy) + backend + MongoDB**, servindo
tudo na **mesma origem** (o Caddy faz proxy de `/api` para o backend).

Pré-requisito: clonar o backend **ao lado** deste repositório:

```
fiap/
├── bytebank/                       (este repo)
└── back-end-grupo1-app-finance/    (backend — repositório irmão)
```

```bash
# na raiz do bytebank/
docker compose up -d --build
```

Acesse **http://localhost**. O seed cria um usuário demo: `demo@bytebank.com` / `123456`.

O que sobe:
- **web** (Caddy): serve o shell em `/`, os remotes em `/remotes/*` e faz proxy de
  `/api/*` → backend. Porta 80 (e 443 em produção).
- **backend** (NestJS) e **mongo** — só na rede interna (não expõem portas ao host).
- **seed** — popula o banco (idempotente).

## Demo em produção

Aplicação publicada na **AWS EC2**, com o stack completo (frontends + backend +
MongoDB) orquestrado por **Docker Compose** e servido pelo **Caddy** na mesma
origem, com **HTTPS automático**.

- **Demo:** http://18.231.222.195 — login: `demo@bytebank.com` / `123456`
- Passo a passo de deploy (EC2 + Caddy): [`docs/DEPLOY.md`](docs/DEPLOY.md)

## SSR/SSG

O chassi é gerado como **SSG** (build estático do Vite): o `shell/dist/index.html`
é servido diretamente pelo Caddy (com fallback de SPA para as rotas do single-spa).

## Scripts úteis

```bash
npm run dev            # dev dos 3 apps
npm run build          # build de produção (shared + 3 apps)
npm run build:shared   # só os pacotes shared
```
