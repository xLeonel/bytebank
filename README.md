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

## Deploy em produção (AWS EC2 + Caddy)

Topologia: uma VM roda o mesmo `docker compose` da seção anterior. O **Caddy**
serve os frontends e faz proxy do backend na mesma origem, com **HTTPS
automático** (via domínio próprio ou `sslip.io`).

**1. Criar a instância** — Ubuntu (t3.small recomendado; t3.micro funciona com
swap). No *security group*, liberar as portas **22, 80 e 443**. (Opcional, mas
recomendado: associar um **Elastic IP** para o endereço não mudar.)

**2. Instalar Docker + swap** (via SSH):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # reabra o SSH depois para valer
# swap de 2GB (recomendado no t3.micro / 1GB RAM)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

**3. Clonar os dois repositórios lado a lado:**
```bash
git clone https://github.com/xLeonel/bytebank.git
git clone https://github.com/elandro18/back-end-grupo1-app-finance.git
```

**4. Subir** (a partir de `bytebank/`):
```bash
# HTTP, usando o IP público:
SITE_ADDRESS=:80 docker compose up -d --build

# OU HTTPS sem domínio próprio (sslip.io resolve <IP>.sslip.io para o IP):
SITE_ADDRESS=SEU_IP.sslip.io docker compose up -d --build

# OU HTTPS com domínio próprio (aponte o DNS para o IP antes):
SITE_ADDRESS=app.seu-dominio.com docker compose up -d --build
```

> Acabou de instalar o Docker e ainda não reabriu o SSH? Rode os comandos acima
> com `sudo -E` (o grupo `docker` só passa a valer no próximo login).

Acesse a URL escolhida e faça login com o usuário demo (`demo@bytebank.com` /
`123456`). Com HTTPS via `sslip.io`, o certificado Let's Encrypt é emitido no 1º
acesso (~30–60s) — exige as portas 80 e 443 abertas e um IP estável (Elastic IP).

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
