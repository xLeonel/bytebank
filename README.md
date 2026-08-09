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
└── back-end-grupo1-app-finance/    (backend; precisa do .env dele)
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

## Deploy em produção (AWS EC2 + Caddy)

Topologia: uma VM roda o `docker compose` acima. O **Caddy** serve os frontends e
faz proxy do backend na mesma origem, com **HTTPS automático** quando há domínio.

1. **Criar a instância** (Ubuntu, t3.small recomendado; t3.micro funciona com swap).
   No *security group*, liberar as portas **22, 80 e 443**.
2. **Instalar Docker + Compose plugin** e (em t3.micro) criar swap:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER   # reabrir a sessão SSH depois
   # swap de 2GB (recomendado no t3.micro)
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
   ```
3. **Clonar os dois repositórios** lado a lado e criar o `.env` do backend:
   ```bash
   git clone https://github.com/xLeonel/bytebank.git
   git clone https://github.com/elandro18/back-end-grupo1-app-finance.git
   # criar back-end-grupo1-app-finance/.env com JWT_SECRET etc.
   ```
4. **Subir** (com domínio → HTTPS automático):
   ```bash
   cd bytebank
   SITE_ADDRESS=app.seu-dominio.com docker compose up -d --build
   ```
   Sem domínio, use o IP público: `SITE_ADDRESS=:80 docker compose up -d --build`
   (apenas HTTP). Aponte o DNS do domínio para o IP da instância antes de subir com
   HTTPS.

> **Frontends na Vercel (alternativa):** os 3 apps podem ir para a Vercel (um
> projeto por app, com `VITE_API_URL`/`VITE_*_URL` por env var); nesse caso o
> backend continua no EC2/container. Este repositório está preparado para o
> caminho **tudo-no-EC2** (mesma origem, mais simples).

## SSR/SSG

O chassi é gerado como **SSG** (build estático do Vite): o `shell/dist/index.html`
é servido diretamente pelo Caddy (com fallback de SPA para as rotas do single-spa).

## Scripts úteis

```bash
npm run dev            # dev dos 3 apps
npm run build          # build de produção (shared + 3 apps)
npm run build:shared   # só os pacotes shared
```
