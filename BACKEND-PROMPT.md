# KRONOS — Prompt de construção do backend

Cole este arquivo inteiro no Claude Code, na raiz de um repositório novo (ou junto do
front-end deste zip). Ele descreve o produto, o contrato de dados que o front-end já
usa hoje e o que precisa ser construído.

---

## Contexto

KRONOS é uma loja de tênis multimarcas (Nike, Adidas, New Balance, On Running). O
front-end já existe e está neste zip:

| Arquivo | Papel |
|---|---|
| `Catalogo KRONOS.dc.html` | Catálogo público, desktop |
| `Catalogo KRONOS Mobile.dc.html` | Mesmo catálogo em frame de iPhone 17 Pro Max |
| `Admin KRONOS.dc.html` | Painel de estoque (adicionar produto, +/− por numeração, remover) |
| `kronos-store.js` | Camada de dados atual — **é isto que o backend precisa substituir** |
| `uploads/` | Fotos de produto usadas hoje |
| `_ds/` | Design system Loomi (não mexer) |

Hoje `kronos-store.js` guarda tudo em `localStorage` sob a chave `kronos.catalogo.v2`
e avisa as telas via `CustomEvent('kronos:update')`. Não há servidor, autenticação nem
sincronia entre dispositivos: o que o admin cadastra no computador dele não aparece
para o cliente no celular. É esse buraco que o backend fecha.

## Objetivo

Construir uma API que sirva o catálogo, controle estoque por numeração, aceite upload
de fotos e proteja o painel admin — mantendo o front-end funcionando com o mínimo de
alteração possível.

---

## Modelo de dados

O front-end já opera com esta forma. Preserve os nomes dos campos.

```ts
Product {
  id: string            // hoje "p1", "p1754934..." — pode virar uuid
  brand: 'Nike' | 'Adidas' | 'New Balance' | 'On Running'   // extensível
  name: string          // "530 Moon Daze"
  cat: 'corrida' | 'treino' | 'prova' | 'trail' | 'lifestyle'
  desc: string
  price: number         // inteiro em reais (899). Considere migrar para centavos.
  avail: 'Pronta entrega' | 'Por encomenda'
  img: string           // caminho/URL da foto; "" quando não há
  stock: Record<'36'|'37'|'38'|'39'|'40'|'41'|'42'|'43'|'44'|'45', number>
}

Settings {
  phone: string         // WhatsApp da loja, só dígitos com DDI: "5511999999999"
}
```

Regras de negócio já implícitas no front:

- Numerações válidas: **36 a 45**. Quantidade nunca negativa.
- Produto `Pronta entrega` mostra no catálogo **apenas as numerações com estoque > 0**.
- Produto `Por encomenda` mostra todas as numerações e ignora estoque.
- Um produto de pronta entrega com estoque total zero aparece como "Sem estoque —
  consulte", e conta no KPI "Sem estoque" do painel.
- O CTA de cada produto abre o WhatsApp com a mensagem gerada por `waMessage()`:
  `Olá! Tenho interesse no {brand} {name} — tamanho {size}, R$ {price}{ (pedido por
  encomenda)}. Ainda está disponível?`
  Essa string deve continuar sendo gerada **no front**, a partir dos dados da API.

## Endpoints

Público (sem auth):

```
GET  /api/products                  → Product[]  (só o que deve aparecer na loja)
GET  /api/products/:id              → Product
GET  /api/settings                  → { phone }
```

Admin (autenticado):

```
POST   /api/admin/products          body: Product sem id           → Product
PATCH  /api/admin/products/:id      body: campos parciais          → Product
DELETE /api/admin/products/:id                                     → 204
PATCH  /api/admin/products/:id/stock
       body: { size: "42", delta: 1 }  ou  { size: "42", qty: 5 }  → Product
POST   /api/admin/uploads           multipart, campo "file"        → { url }
PATCH  /api/admin/settings          body: { phone }                → Settings
POST   /api/auth/login              body: { email, password }      → { token }
POST   /api/auth/logout                                            → 204
GET    /api/auth/me                                                → { email }
```

Detalhes:

- `PATCH .../stock` com `delta` deve ser atômico no banco (`UPDATE ... SET qty = qty + $1`),
  não read-modify-write — dois cliques rápidos no `+` não podem perder contagem.
- `qty` nunca abaixo de zero; rejeite ou faça clamp, mas seja consistente e documente.
- Valide entrada com Zod. Preço inteiro positivo; `brand`/`cat`/`avail` como enums;
  `name` obrigatório.
- Erros em formato único: `{ error: { code, message, details? } }`.
- CORS liberado para a origem do front.

## Autenticação

Um único papel: admin. Login por e-mail e senha, hash com Argon2 ou bcrypt, sessão em
cookie httpOnly `SameSite=Lax` (preferível) ou JWT curto com refresh. Rate limit no
login. Sem cadastro público — o primeiro admin entra por seed/CLI.

## Upload de imagens

`POST /api/admin/uploads` aceita JPEG/PNG/WebP até 5 MB, valida o tipo pelo conteúdo e
não pela extensão, gera nome aleatório, devolve a URL pública. Guarde em S3/R2 em
produção; disco local em dev. Gere uma versão redimensionada (~1200px) — os cards
exibem 210–300px de altura e as fotos de WhatsApp costumam vir grandes.

## Stack sugerida

Node + TypeScript, Fastify (ou NestJS se preferir estrutura), Prisma sobre PostgreSQL,
Zod para validação, Vitest para testes, Biome para lint/format. Docker Compose com
Postgres para desenvolvimento. Migrations versionadas e um seed que carregue os dez
produtos de exemplo que estão em `kronos-store.js` (`SEED`).

Clean Architecture: `domain` (entidades e regras de estoque), `application` (casos de
uso), `infra` (Prisma, storage, http). Casos de uso testados sem tocar no banco.

## Integração com o front-end

Reescreva `kronos-store.js` mantendo a **mesma superfície pública**, para as três telas
continuarem funcionando sem alteração:

```js
window.KronosStore = { SIZES, load, save, brl, total, sizesInStock, waMessage, waLink }
```

O que muda por dentro:

- `load()` passa a devolver o cache em memória e disparar um `fetch` de `/api/products`
  e `/api/settings`; ao responder, emite `kronos:update` com os dados novos (as telas já
  escutam esse evento).
- As mutações do admin (`+`, `−`, adicionar, remover, telefone) chamam a API e só então
  emitem `kronos:update`. Faça atualização otimista com rollback em erro — os botões de
  numeração precisam responder instantaneamente.
- Mantenha `localStorage` como cache de leitura offline, nunca como fonte de verdade.

Adicione uma tela ou modal de login antes do painel admin, e redirecione em 401.

## Entregáveis

1. Repositório rodando com `docker compose up` e `npm run dev`.
2. Migrations + seed com os dez produtos de exemplo.
3. `.env.example` completo.
4. Testes dos casos de uso de estoque, incluindo concorrência no incremento.
5. `kronos-store.js` reescrito, conectado à API, com as três telas funcionando.
6. README curto: como rodar, como criar o primeiro admin, como fazer deploy.

## Fora de escopo

Carrinho, checkout, pagamento, múltiplos papéis de usuário, painel de pedidos. A venda
acontece no WhatsApp.
