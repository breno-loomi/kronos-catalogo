# KRONOS — Backend

API do catálogo KRONOS: produtos, estoque por numeração (36–45), upload de fotos e um
painel admin autenticado. Fastify + TypeScript + Prisma/PostgreSQL, em Clean Architecture
(`domain` → `application` → `infra`).

## Requisitos

- Node.js 20+
- Docker (ou Podman com API compatível com Docker — veja a nota no final)

## Como rodar

```bash
cd backend
cp .env.example .env
docker compose up -d          # sobe o Postgres
npm install
npm run prisma:migrate        # cria as tabelas
npm run seed                  # os 10 produtos de exemplo + settings padrão
npm run dev                   # API em http://localhost:3333
```

`GET http://localhost:3333/api/products` já deve devolver os 10 produtos.

### Criar o primeiro admin

Não há cadastro público — o primeiro (e os demais) admin entra por CLI:

```bash
npm run create-admin -- --email=admin@kronos.com --password=umasenhaforte
```

Rodar de novo com o mesmo e-mail troca a senha desse admin.

### Rodar o front-end junto

Os arquivos `.dc.html` na raiz do projeto (fora de `backend/`) são estáticos. Sirva-os com
qualquer servidor estático, por exemplo:

```bash
npx serve .          # a partir da raiz do projeto, não de backend/
```

`kronos-store.js` detecta sozinho o cenário de dev local (front em `localhost` numa porta
diferente da API) e aponta pra `http://localhost:3333` automaticamente — não precisa
configurar nada. Em produção, se front e API forem servidos do mesmo domínio, o padrão
relativo (`/api/...`) já funciona; se forem domínios diferentes, defina antes de carregar
`kronos-store.js`:

```html
<script>window.KRONOS_API_BASE = 'https://api.seudominio.com';</script>
<script src="./kronos-store.js"></script>
```

Abra `Admin KRONOS.dc.html`, faça login com o admin criado acima, e o painel passa a ler e
gravar direto na API. `Catalogo KRONOS.dc.html` e a versão mobile refletem qualquer mudança
assim que o evento `kronos:update` dispara (dão refresh sozinhos).

## Testes

```bash
npm test               # unit — regras de domínio e use-cases, com repositórios fake
npm run test:integration   # sobe migrations no banco de teste e prova a atomicidade do estoque
```

O teste de integração dispara 20 incrementos e depois 10 decrementos concorrentes no mesmo
produto/numeração via `server.inject()` (sem precisar da API escutando numa porta) contra o
Postgres real, e confere que o resultado final bate exatamente — nenhum incremento se perde
e nenhuma numeração fica negativa.

## Variáveis de ambiente

Veja `.env.example`. As mais importantes:

- `DATABASE_URL` / `TEST_DATABASE_URL` — o compose já cria os dois bancos (`kronos` e
  `kronos_test`) no mesmo container.
- `CORS_ORIGIN` — lista separada por vírgula das origens do front permitidas (com
  `credentials: true`, nunca pode ser `*`).
- `JWT_SECRET` — assina o cookie de sessão do admin. Troque em produção.
- `UPLOAD_DIR` / `PUBLIC_UPLOAD_BASE_URL` — onde as fotos ficam salvas em disco e a URL
  pública correspondente.

## Arquitetura

```
src/
  domain/         entidades e regras (numeração 36–45, qty ≥ 0, tipo de imagem por magic number)
  application/    ports (interfaces) + use-cases, sem nenhuma dependência de Fastify/Prisma
  infra/
    http/         servidor Fastify, rotas, schemas Zod, plugin de auth, error handler
    db/           Prisma Client e os repositórios (implementam os ports)
    security/     Argon2 (senha) e JWT (sessão)
    storage/      disco local (implementa o port ImageStorage — troque por S3/R2 aqui)
    cli/          create-admin
```

Os use-cases só conhecem interfaces (`ProductRepository`, `ImageStorage`, etc.), por isso os
testes unitários rodam com repositórios em memória (`test/unit/fakes`), sem tocar no banco.

### Estoque: por que `PATCH .../stock` é seguro para cliques rápidos

`delta` vira um único `UPDATE stock_items SET qty = qty + $delta WHERE ... AND qty + $delta
>= 0` (`PrismaProductRepository.adjustStock`) — não há leitura seguida de escrita, então dois
cliques simultâneos no `+` nunca perdem um incremento. Se o decremento levaria a quantidade
abaixo de zero, a linha não casa com o `WHERE` e a API responde `409 Conflict` — a política é
sempre **rejeitar**, nunca fazer clamp silencioso (documentado aqui para não haver dúvida).
`qty` absoluto (`{ size, qty }`) usa `upsert` — não precisa da mesma proteção porque é uma
atribuição, não um incremento relativo.

### Upload de imagens

`POST /api/admin/uploads` valida o tipo pelos primeiros bytes do arquivo (magic number: JPEG
`FF D8 FF`, PNG, RIFF/WEBP), não pela extensão. Redimensiona para no máximo 1200px de largura
com `sharp` (sem ampliar imagens menores) e salva em disco (`LocalDiskImageStorage`). Para
produção, implemente `ImageStorage` (`src/application/ports/image-storage.ts`) apontando pra
S3/R2 e troque a instância montada em `src/infra/http/bootstrap.ts` — nenhum use-case muda.

## Notas de deploy

- Cookie de sessão: `httpOnly`, e automaticamente `SameSite=None; Secure` quando
  `NODE_ENV=production` (necessário porque front no Vercel e API no Railway/VPS são domínios
  diferentes de verdade — `SameSite=Lax` bloquearia o cookie num fetch cross-site). Em dev
  continua `SameSite=Lax` sem `Secure`, pra não precisar de HTTPS local.
- `npm run build && npm start` compila pra `dist/` e roda com Node puro. Em produção, `start`
  já roda `prisma migrate deploy` antes de subir o servidor — não precisa de um passo extra
  separado.
- `npm audit` acusa uma cadeia `vitest → vite → esbuild` (dev-only, servidor de teste local,
  não é executado em produção); atualizar exige subir pro Vitest 4, deixado fora de escopo
  aqui.

### Deploy no Railway

1. Railway → **New Project** → **Deploy from GitHub repo** → escolha o repositório.
2. Nas configurações do serviço, defina **Root Directory** = `backend` (é um monorepo — o
   front-end estático vive na raiz, fora do que o Railway precisa buildar).
3. Adicione um banco: **+ New** → **Database** → **PostgreSQL**.
4. No serviço da API, aba **Variables**, adicione uma referência à variável do Postgres
   (`+ New Variable` → **Add Reference** → escolha `DATABASE_URL` do serviço Postgres) e mais
   estas:

   | Variável | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | uma string aleatória longa (gere com `openssl rand -base64 48`) |
   | `CORS_ORIGIN` | a URL do front no Vercel, ex. `https://kronos-catalogo-six.vercel.app` |
   | `UPLOAD_DIR` | `/app/uploads` |
   | `PUBLIC_UPLOAD_BASE_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}/uploads` |

   (`PORT`/`HOST` não precisam ser definidos — o Railway injeta `PORT` sozinho e o app já lê
   `env.PORT`.)
5. Adicione um **Volume** ao serviço (Settings → Volumes) montado em `/app/uploads`, senão as
   fotos enviadas somem a cada deploy.
6. Deploy. Depois, gere o primeiro admin rodando localmente contra o banco de produção:
   `DATABASE_URL="<a mesma URL do Postgres do Railway>" npm run create-admin -- --email=... --password=...`
   (ou use `railway run npm run create-admin -- ...` se o CLI funcionar na sua máquina).

## Troubleshooting

Se `docker compose up` falhar com o Docker Desktop instalado mas sem o daemon respondendo, e
você tiver o Podman rodando (`podman machine list`), aponte o Docker CLI pro socket dele:

```bash
export DOCKER_HOST="npipe:////./pipe/podman-machine-default"   # Windows
docker compose up -d
```

## Fora de escopo

Carrinho, checkout, pagamento, múltiplos papéis de usuário, painel de pedidos — a venda
acontece no WhatsApp, como hoje.
