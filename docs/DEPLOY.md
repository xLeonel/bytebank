# Deploy em produção (AWS EC2 + Caddy)

Runbook de deploy do grupo. Uma VM roda o mesmo `docker compose` do projeto; o
**Caddy** serve os frontends e faz proxy do backend na mesma origem, com **HTTPS
automático** (via domínio próprio ou `sslip.io`).

## 1. Criar a instância
Ubuntu (t3.small recomendado; t3.micro funciona com swap). No *security group*,
liberar as portas **22, 80 e 443**. Recomendado: associar um **Elastic IP** para
o endereço não mudar.

## 2. Instalar Docker + swap (via SSH)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # reabra o SSH depois para valer
# swap de 2GB (recomendado no t3.micro / 1GB RAM)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

## 3. Clonar os dois repositórios lado a lado
```bash
git clone https://github.com/xLeonel/bytebank.git
git clone https://github.com/elandro18/back-end-grupo1-app-finance.git
```
> O backend usa apenas `MONGODB_URI`, já definido pelo `docker-compose` — não é
> necessário criar `.env`.

## 4. Subir (a partir de `bytebank/`)
```bash
# HTTP, usando o IP público:
SITE_ADDRESS=:80 docker compose up -d --build

# OU HTTPS sem domínio próprio (sslip.io resolve <IP>.sslip.io para o IP):
SITE_ADDRESS=SEU_IP.sslip.io docker compose up -d --build

# OU HTTPS com domínio próprio (aponte o DNS para o IP antes):
SITE_ADDRESS=app.seu-dominio.com docker compose up -d --build
```
> Acabou de instalar o Docker e ainda não reabriu o SSH? Rode os comandos com
> `sudo -E` (o grupo `docker` só passa a valer no próximo login).

O usuário demo (`demo@bytebank.com` / `123456`) é criado pelo serviço `seed`.
Com HTTPS via `sslip.io`, o certificado Let's Encrypt é emitido no 1º acesso
(~30–60s) — exige as portas 80 e 443 abertas e um IP estável (Elastic IP).

## Operação
```bash
docker compose ps                 # status
docker compose logs -f web        # logs do Caddy/frontends (ou: backend)
```

### Atualizar após novo commit

> **Atualize os DOIS repositórios.** O `docker-compose.yml` deste repo builda o
> backend a partir de `../back-end-grupo1-app-finance`. Um `git pull` só aqui
> sobe frontend novo contra backend antigo — sem erro visível, só comportamento
> velho.

```bash
git -C ~/bytebank pull && git -C ~/back-end-grupo1-app-finance pull
```

```bash
cd ~/bytebank && SITE_ADDRESS=:80 docker compose up -d --build
```

Sem `down -v`, o stack antigo continua servindo durante todo o build; os
containers só são recriados no final (downtime de segundos). Use `down -v`
apenas quando quiser **recriar o banco** — ele apaga o volume e o serviço
`seed` repopula do zero:

```bash
cd ~/bytebank && SITE_ADDRESS=:80 docker compose down -v && SITE_ADDRESS=:80 docker compose up -d --build
```

> Builds levam ~5–10 min. Se estiver numa sessão que pode expirar (SSM, SSH
> instável), rode com `nohup` para uma queda de conexão não matar o build:
> `nohup env SITE_ADDRESS=:80 sh -c 'docker compose up -d --build; echo FIM rc=$?' > /tmp/deploy.log 2>&1 &`

### Scripts de manutenção no banco

Rode pelo serviço `seed`, que já tem o diretório `seed/` do backend montado em
`/seed` e está na rede do compose. Não use `mongosh` por stdin no container
`mongo` — sem `--file` ele entra em modo REPL e quebra expressões multi-linha.

```bash
cd ~/bytebank && docker compose run --rm seed bash -lc "mongosh 'mongodb://mongo:27017/bytebank' --quiet --file /seed/NOME_DO_SCRIPT.js"
```

### Conferir se o deploy pegou

O `Last-Modified` de `/` **não serve**: é o `index.html` do shell, numa layer
Docker separada — se o shell não mudou, a layer vem do cache com data antiga
mesmo em deploy bem-sucedido. Verifique o backend por um endpoint público e o
frontend pelo bundle do remote:

```bash
curl -s http://SEU_IP/api/transactions/types && curl -sI http://SEU_IP/remotes/dashboard/dashboard.js | grep -i last-modified
```

> **Alternativa (Vercel):** os 3 frontends podem ir para a Vercel (um projeto por
> app, com `VITE_API_URL`/`VITE_*_URL` por env var), mantendo o backend no
> EC2/container. Este repositório está preparado para o caminho **tudo-no-EC2**
> (mesma origem, mais simples).
