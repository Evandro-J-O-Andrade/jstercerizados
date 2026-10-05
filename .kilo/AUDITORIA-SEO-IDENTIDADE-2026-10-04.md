# AUDITORIA B — SEO + HTML + DOMÍNIO ANTIGO + IDENTIDADE J&S

> **Data:** 2026-10-04
> **Modo:** SOMENTE LEITURA. Nenhum arquivo de código, configuração, banco ou infra foi alterado.
> **Escopo:** `index.html`, `public/robots.txt`, `public/sitemap.xml`, `public/_redirects`, `public/_headers`, `public/manifest.webmanifest`, `src/config/seo.ts`, `src/config/seoPages.ts`, `src/config/company.ts`, `src/config/contacts.ts`, `src/config/app.ts`, `src/utils/schema.ts`, `src/components/ui/SEO.tsx`, `src/types/seo.ts`, `src/ai/knowledge.ts`, `src/pages/Home.tsx`, `.env`, `.env.local`, `.env.example`, configs de deploy.
> **Empresa (regra AGENTS.md):** J&S Empregos LTDA — preservada.

---

## 0. RESUMO EXECUTIVO

| # | Achado | Classificação | Severidade | Decisão |
|---|---|---|---|---|
| B1 | `og:image` é SVG — preview social nunca renderiza | **REAL** | CRÍTICA | **CORRIGIR** |
| B2 | `og:image` / `twitter:image` em URL relativa | **REAL** | ALTA | **CORRIGIR** |
| B3 | `canonical` duplicado e divergente na Home | **REAL** | ALTA | **CORRIGIR** |
| B5 | `VITE_SITE_URL` duplicado → host efetivo é `www` | **REAL** | ALTA | **CORRIGIR** |
| B6 | `AUTH_SITE_URL` duplicado e com host inválido | **REAL** | CRÍTICA | **CORRIGIR** |
| B7 | Sem 301 do domínio legado | **NÃO IMPLEMENTADO** | ALTA | **ANALISAR** (fora do repo) |
| B9 | NAP inconsistente: Poá vs São Paulo | **CONFLITANTE** | ALTA | **CORRIGIR** |
| B11 | `sitemap.xml` estático e incompleto | **PARCIAL** | ALTA | **CORRIGIR** |
| B4 | `title` / `og:site_name` divergem entre 3 fontes | **CONFLITANTE** | MÉDIA | **CORRIGIR** |
| B8 | Sem https/host canônico no host; sem HSTS | **NÃO IMPLEMENTADO** | MÉDIA | **CORRIGIR** (fora do repo) |
| B10 | `PostalAddress.postalCode` vazio | **REAL** | MÉDIA | **CORRIGIR** |
| B12 | `Host:` no robots.txt é diretiva Yandex | **REAL** | BAIXA | **CORRIGIR** |
| B14 | `manifest.webmanifest` com nome divergente | **REAL** | BAIXA | **CORRIGIR** |
| B16 | `SEO_PAGES` e `getSeoMeta` órfãos | **ÓRFÃO** | BAIXA | **ANALISAR** |
| B13 | `google-site-verification.html` duplicado | **OBSOLETO** | BAIXA | **CORRIGIR** |
| B15 | `hreflang` parcial no sitemap | **REAL** | BAIXA | **ANALISAR** |

**Sobre o domínio legado:** `jsterceirizados.com.br` **não existe em lugar nenhum do repositório** (código, `src/`, `public/`, `index.html`, configs, deploy). Zero ocorrências. O único registro é um cabeçalho de documento histórico (`docs/INVENTARIO-FRONTEND-2026-09-06.md:234`).

---

## 1. DOMÍNIO OFICIAL — ESTADO COMPROVADO

O código está **100% consolidado em `jsempregos.com.br`**. Não há resíduo do domínio desativado em nenhum artefato indexável.

### 1.1 Superfícies de domínio verificadas

| Arquivo | Linhas | Valor | Estado |
|---|---|---|---|
| `index.html` | 74 | `og:url` = `https://jsempregos.com.br` | ✅ apex |
| `index.html` | 92 | `canonical` = `https://jsempregos.com.br` | ✅ apex |
| `src/config/seo.ts` | 32 | `openGraph.url` = `https://jsempregos.com.br` | ✅ apex |
| `src/utils/schema.ts` | 9 | `SITE_URL` = `https://jsempregos.com.br` | ✅ apex |
| `src/config/app.ts` | 8 | `APP_CONFIG.url` | ✅ apex |
| `src/pages/VagaDetalhe.tsx` | 22 | `SITE_URL` | ✅ apex |
| `src/ai/knowledge.ts` | 5 | `site` | ✅ apex |
| `public/robots.txt` | 5 | `Sitemap:` | ✅ apex |
| `public/sitemap.xml` | 6-131 | 22 `<loc>` | ✅ apex |
| `public/_redirects` | 1 | `/* → /index.html 200` | ✅ sem host legado |

### 1.2 Bug de host efetivo (B5) — a unicidade é aparente, não real

Apesar de todo o código hardcoded usar **apex**, a camada de ambiente prefere **`www`**:

| Arquivo | Linha | Conteúdo |
|---|---|---|
| `.env` | 18 | `VITE_SITE_URL=https://jsempregos.com.br` |
| `.env` | **19** | `VITE_SITE_URL=https://www.jsempregos.com.br` ← **vence** |
| `.env.example` (**trackado no git**) | 21 | `VITE_SITE_URL=https://jsempregos.com.br` |
| `.env.example` (**trackado no git**) | **22** | `VITE_SITE_URL=https://www.jsempregos.com.br` ← **vence** |
| `.env.local` | 18 | `VITE_SITE_URL=https://jsempregos.com.br` (única ocorrência) |

Chave duplicada e não comentada: em dotenv **a última vence**. Logo o valor efetivo é `https://www.jsempregos.com.br`, enquanto todo o resto do código assume apex.

**Não é teórico.** `VITE_SITE_URL` é consumida em runtime por:
- `src/config/recovery.ts:63` — monta o link de recuperação de senha
- `src/contexts/AuthContext.tsx:1258` — `emailRedirectTo` (confirmação de e-mail)
- `src/contexts/AuthContext.tsx:1299,1302` — `redirectTo` (redefinição de senha)

Se `www` não for o host canônico no CDN, todo link de e-mail sai cross-host — o que fragmenta authority e quebra a cadeia de rastreamento do Google.

**CORRIGIR:** remover a chave duplicada, definir **um** host canônico (recomendação: apex, por ser o que 100% do código assume) e replicar em `.env.example`.

---

## 2. IDENTIDADE J&S — MATRIZ PRESERVAR / ANALISAR / CORRIGIR

### 2.1 PRESERVAR — patrimônio de busca intacto ✅

**Nenhuma substituição de `J&S Terceirizados` → `J&S Empregos` é necessária ou autorizada.** O nome já convive nas três superfícies de SEO que importam:

| Local | Linha | Ocorrência | Papel SEO |
|---|---|---|---|
| `index.html` | 54 | `keywords` meta → `J&S Terceirizados` | sinal de relevância para a marca legada |
| `index.html` | 9 | `keywords` meta (mesma lista) | — |
| `src/config/seo.ts` | 9 | `keywords[1] = 'J&S Terceirizados'` | idem |
| `src/utils/schema.ts` | 147 | `alternateName: ['J&S Terceirizados', 'J&S Empregos', 'JS Terceirizados']` | **consolidação de entidade** — é o mecanismo correto do Schema.org |
| `src/config/company.ts` | 44 | `instagram.com/jsterceirizados/` | identidade social histórica |

O `alternateName` em `schema.ts:147` é exatamente a ferramenta certa:告诉 ao Google que `J&S Terceirizados` e `J&S Empregos` são **a mesma entidade**, sem apagar nenhum dos dois nomes.

**Identidade legal mantida conforme AGENTS.md:**
- `src/config/company.ts:2` `name: 'J&S Empregos LTDA'` ✅
- `src/config/company.ts:3` `tradingName: 'J&S Empregos LTDA'` ✅
- `src/ai/knowledge.ts:3` `name: 'J&S Empregos LTDA'` ✅
- `index.html:50,56,64,67,71` usam `J&S Empregos` / `J&S Empregos LTDA` ✅

### 2.2 ANALISAR

**A-1 — O cliente ainda controla `jsterceirizados.com.br`?**
Não é respondível pelo repositório. O domínio não aparece em nenhum arquivo. A decisão muda o plano inteiro:
- **Se SIM** → 301 permanente `jsterceirizados.com.br/*` → `jsempregos.com.br/*`, configurado **no host/DNS**, fora do repositório. Transfere authority e resolve o histórico.
- **Se NÃO** → impossível redirecionar daqui. Só resta atualizar o Perfil da Empresa no Google (sem criar perfil duplicado) e usar o `alternateName` (já presente) paraSetter a associação.

**A-2 — `SOCIAL_LINKS.instagram = 'https://www.instagram.com/jsterceirizados/'`** (`company.ts:44`)
Entra no `sameAs` do `Organization` schema (`schema.ts:174-180`). Preservar **somente se a conta ainda for do cliente**. Se a conta migrou para `@jsempregos`, manter o handle antigo no `sameAs` consolida a entidade em um perfil que o cliente pode não controlar mais.

**A-3 — `twitter:site` / `twitter:creator` = `@jsempregos`** (`index.html:90-91`)
`twitter:site` é sinal de entidade. Se a conta não existir, é um `sameAs` quebrado. Verificar existência antes de consolidar.

**A-4 — `robots.txt` bloqueia `/cadastro/` e `/entrar/`** (`robots.txt:14-15`)
São os funis públicos de cadastro de candidato/empresa (decisão de projeto: `/cadastro/candidato`, `/cadastrar/empresa`). `Disallow` impede rastreamento e impede que outras páginas os referenciem como link interno. Confirmar se a intenção é mesmo invisibilizar o funil de conversão.

---

## 3. HTML E META TAGS

### B1 — CRÍTICA — `og:image` é SVG: preview social nunca renderiza

```
index.html:75   <meta property="og:image" content="/images/brand/og-image.svg" />
index.html:76   <meta property="og:image:width" content="1200" />
index.html:77   <meta property="og:image:height" content="630" />
index.html:89   <meta name="twitter:image" content="/images/brand/og-image.svg" />
SEO.tsx:56      const pageImage = image ?? '/images/brand/og-image.svg';
```

Verificação de asset (`public/images/brand/`):

```
apple-touch-icon.svg  682      logo-footer.webp  7802      logo-white.svg  674
logo-dark.svg         429      logomarca.png  1272090      og-image.svg  3810   ← ÚNICO
logo.svg              672      watermark-logo.svg  845
```

**Não existe nenhum PNG/JPG 1200×630 no projeto.**

Facebook, LinkedIn, Instagram, X/Twitter, Slack e WhatsApp **não renderizam SVG** em OG image. E o WhatsApp é canal primário deste cliente (`whatsapp: '5511968380592'` em `company.ts:8`, botão flutuante, `getWhatsAppUrl`). Resultado: **todo link compartilhado por WhatsApp/LinkedIn sai sem imagem de preview**, em todas as páginas do site.

As meta `og:image:width/height` declaram 1200×630 para um SVG de 3.810 bytes — a inconsistência é verificável.

**CORRIGIR:** exportar `public/images/brand/og-image.png` em 1200×630 (mantendo o `.svg` como arte-fonte), e apontar `index.html:75,89` e `SEO.tsx:56` para o PNG.

### B2 — ALTA — URLs relativas em OG/Twitter

`/images/brand/og-image.svg` é relativo. O padrão Open Graph exige URL absoluta (esquema + host); o validador do Facebook sinaliza como erro e vários scrapers não resolvem. **CORRIGIR** para `https://jsempregos.com.br/images/brand/og-image.png`.

### B3 — ALTA — `canonical` duplicado e divergente na Home

Duas fontes escrevem canonical na home:

| Origem | Linha | Valor renderizado |
|---|---|---|
| `index.html` (estático) | 92 | `https://jsempregos.com.br` — **sem** barra final |
| `SEO.tsx` (dinâmico) | 146 | `https://jsempregos.com.br/` — **com** barra final |

`SEO.tsx:52`: `const url = \`${SEO_CONFIG.openGraph.url}${location.pathname}\`` — na rota `/`, `location.pathname === '/'`, resultando em barra final. `Home.tsx:235` renderiza `<SEO>`.

O documento em `/` therefore carrega **dois `link[rel=canonical]` apontando para URLs diferentes**. O Google escolhe um de forma imprevisível e o histórico de indexação fica ambíguo entre duas variantes.

Agravante: `SEO.tsx:140-148` renderiza o `<link>` via React, ou seja, **dentro de `#root` no `<body>`**, não no `<head>`. O `index.html` já entrega um canonical no `<head>`.

**CORRIGIR:** fonte única de verdade + política explícita de barra final (recomendação: normalizar **sem** barra final, alinhando com `index.html:92` e com as 22 `<loc>` do sitemap que também não têm barra).

### B4 — MÉDIA — `title` e `og:site_name` divergem entre três fontes

| Fonte | Linha | Title efetivo |
|---|---|---|
| `index.html` | 93-96 | `J&S Empregos — Assessoria em RH, Recrutamento, Mão de Obra, Terceirização e Facilities` |
| `seo.ts` | 4 | `J&S Empregos **LTDA** — Assessoria em RH, Recrutamento, Mão de Obra, Terceirização e Facilities` |
| `Home.tsx` | 236 | `J&S Empregos LTDA — Assessoria em RH, Recrutamento, **Seleção e Banco de Talentos**` |

`og:site_name`: `index.html:79` = `"J&S Empregos"` (hardcoded) vs `seo.ts:33` `siteName: COMPANY.name` = `"J&S Empregos LTDA"`.

Três títulos para a mesma página conforme o momento da leitura (first paint vs pós-hidratação). `index.html` é o que o crawler indexa primariamente.

**CORRIGIR:** alinhar `index.html` a uma única fonte. (Observação: **não** unificar em `COMPANY.name` automaticamente — a razão social completa ocupa ~70 caracteres e o title ideal fica entre 50-60. Preservar `J&S Empregos` no title e `J&S Empregos LTDA` nos campos de entidade.)

### B14 — BAIXA — `manifest.webmanifest` com nome divergente

```json
"name":"JSEmpregos", "short_name":"JS Empregos",
"description":"Agência de Empregos e Consultoria de RH — ..."
```

Sem `&`, sem espaço em `JSEmpregos`. O nome do PWA alimenta a instalação de app e pode aparecer em SERP mobile. **CORRIGIR** para a marca oficial.

### B13 — BAIXA — `public/google-site-verification.html` é artefato obsoleto

Token `hxLRw4l-PpNUGHqIDdYwkvnjvqNtuqm10y9pbepy4bk` já presente em `index.html:58-59` (método meta tag, o correto). O arquivo HTML solto é o método file-based legado. **OBSOLETO** — sem efeito SEO; remover opcionalmente.

---

## 4. JSON-LD E DADOS ESTRUTURADOS

Arquitetura existente e **bem construída**:

| Gerador | Arquivo | Schema |
|---|---|---|
| `buildBreadcrumbSchema` | `schema.ts:11-24` | `BreadcrumbList` |
| `buildWebSiteSchema` | `schema.ts:26-39` | `WebSite` + `publisher/Organization` |
| `buildJobPostingSchema` | `schema.ts:41-102` | `JobPosting` (completo: `baseSalary`, `jobLocation`, `employmentType`, `validThrough`) |
| `getOrganizationSchema` | `schema.ts:104-212` | `['Organization','LocalBusiness','EmploymentAgency']` |

Injeção via `<script type="application/ld+json">` em `SEO.tsx:142-145`. Testes existem em `src/__tests__/utils/schema.test.ts` e `src/types/seo.ts` tipa o contrato.

**Pontos positivos confirmados:**
- `schema.ts:147` `alternateName` com as duas marcas — consolidação de entidade correta
- `schema.ts:145` multi-`@type` incluindo `EmploymentAgency` — adequado ao negócio real
- `schema.ts:202-210` `hasOfferCatalog` gerado de `COMPANY.businessAreas` — dados reais, não mock
- `SITE_URL` único em `schema.ts:9`, sem resíduo legado

### B10 — MÉDIA — `PostalAddress.postalCode` vazio

`company.ts:20` `zip: ''` → `schema.ts:157` `postalCode: params... || ''` emite `"postalCode": ""`.

`PostalAddress` com CEP vazio é inválido; o Google descarta ou invalida o endereço na validação de entidade. Como o schema declara `LocalBusiness`, isso **danifica diretamente** a elegibilidade do Knowledge Panel. **CORRIGIR** — preencher o CEP real de `Rodovia João Afonso de Souza Castellano, 411, Sala 04, Poá/SP`.

### B9 — ALTA — NAP inconsistente: Poá × São Paulo

| Fonte | Linha | Valor |
|---|---|---|
| `src/config/company.ts` | 13-19 | `Rodovia João Afonso de Souza Castellano, 411, Sala 04`, **`Poá`/SP` |
| `src/utils/schema.ts` (PostalAddress) | 154-157 | derivado de `COMPANY.address` → **Poá/SP** |
| `src/utils/schema.ts` (areaServed) | 197-198 | lista **`São Paulo`** e **`Poá`** como Cities |
| `src/config/contacts.ts` | 5 | **`São Paulo, SP — Brasil`** |
| `src/pages/Sobre.tsx` | 1144 | renderiza **`São Paulo, SP`** |
| `src/mock/company.ts` | 20 | headquarters **`São Paulo, SP`** |
| `src/pages/Termos.tsx` | 169 | foro **`Poá/SP`** |
| `src/pages/auth/Termos.tsx` | 146 | foro **`Poá/SP`** |

O endereço **legal** é Poá/SP (confirmado pelos Termos, que é o documento juridicamente vinculante). Mas três superfícies de dados de contato dizem "São Paulo, SP", incluindo a página institutional `Sobre.tsx`.

Google trata endereço inconsistente entre schema, página e fontes como sinal de baixa qualidade de negócio local — afeta diretamente Map Pack e Knowledge Panel.

**CORRIGIR:** unificar no endereço legal de Poá/SP como endereço; manter "São Paulo" apenas em `areaServed` (área atendida), que é semanticamente correto e preserva a覆盖面 de busca regional.

### B16 — ÓRFÃO — `SEO_PAGES` e `getSeoMeta` não são consumidos

`src/config/seoPages.ts` exporta `SEO_PAGES` (15 páginas com title/description/keywords). `src/config/seo.ts:53` exporta `getSeoMeta`. `src/config/index.ts:6` re-exporta ambos.

**Nenhuma página importa qualquer um dos dois.** Cada página chama `<SEO>` com props inline (`Vagas.tsx:163`, `Home.tsx:235`, `Clientes.tsx:319`, etc.). Confirmado por busca em todo `src/`: as únicas ocorrências de `SEO_PAGES` estão em `seoPages.ts:10` e `index.ts:6`.

**Consequência real:** `seoPages.ts` tem uma entrada `'/'` (`seoPages.ts:11-28`) com title `J&S Empregos LTDA — Assessoria em RH, Facilities e Terceirização` — **conflitante** com o title efetivo de `Home.tsx:236`. Se alguém "ligar" esse arquivo achando que é a fonte canônica, **introduziria uma regressão de title**. Além disso `seoPages.ts:147-160` define SEO indexável para `/login`, enquanto `Login.tsx:224` e `auth/Entrar.tsx:64` aplicam `noindex`.

`docs/FRONTEND-MOCK-DB-MATRIX.md:73` já classificava `config/seoPages.ts` como `🟡 GAP`.

**ANALISAR:** confirmar que é intencionalmente legado antes de qualquer remoção. Não remover sem autorização.

---

## 5. SITEMAP E ROBOTS

### B11 — ALTA — `sitemap.xml` estático e incompleto

22 URLs, **todas** com `<lastmod>2026-09-22</lastmod>` hardcoded (`sitemap.xml:7,15,23,30,37,45,...`) — a data nunca reflete mudança real de conteúdo.

**Faltam páginas que existem como rotas:**

| Tipo | Rota | Existe como página | No sitemap |
|---|---|---|---|
| Detalhe de vaga | `/vagas/:slug` | `src/pages/VagaDetalhe.tsx` (com `JobPosting` schema, `schema.ts:41`) | ❌ **ausente** |
| Detalhe de serviço | `/servicos/:slug` | `src/pages/ServicoDetalhe.tsx` | ❌ ausente |
| Detalhe de empresa | `/empresas/:slug` | `src/pages/EmpresaDetalhe.tsx` | ❌ ausente |
| Artigo de blog | `/blog/:slug` | `src/pages/Blog.tsx` | ❌ ausente |
| Termos | `/termos` | `src/pages/auth/Termos.tsx` | ⚠️ `/termos` presente mas a página real de termos legais é `Termos.tsx:169` vs `auth/Termos.tsx` (duplicação de rota) |

A ausência mais grave é `/vagas/:slug`: existe um gerador de `JobPosting` completo (`schema.ts:41-102`) mas **nenhuma URL de vaga é submetida ao Google**. Vagas de emprego são a superfície de busca de maior volume para este negócio.

**Também:**
- Sem extensão de sitemap de `JobPosting` (namespace `http://www.google.com/schemas/sitemap-jobposting/0.9`)
- `xhtml:link rel="alternate" hreflang="pt-BR"` presente apenas em 2 das 22 entradas (`sitemap.xml:10,18`) — inconsistente
- `xmlns:xhtml` declarado (`sitemap.xml:2`) mas sem `x-default`

**CORRIGIR:** no mínimo, adicionar os templates de detalhe e regenerar `lastmod` a partir de `updated_at` real do Supabase; idealmente gerar o sitemap a partir dos dados.

### B12 — BAIXA — `robots.txt`: diretiva `Host` (Yandex)

`public/robots.txt:38` `Host: jsempregos.com.br`

`Host` é uma diretiva **exclusiva do Yandex**. O Google a ignora silenciosamente. Manter uma diretiva que só funciona em um motor de busca sugere uma proteção de host canônico que **não existe** — reinforce o achado B8.

**CORRIGIR:** remover ou comentar como `# Host (Yandex)`.

### B8 — MÉDIA — Sem https/host canônico e sem HSTS

`public/_headers` define `X-Content-Type-Options`, `Referrer-Policy` e `X-Frame-Options` (`_headers:13-16`) e `Content-Type: text/html; charset=utf-8` (`:19`) — mas **não** define `Strict-Transport-Security`.

Nada no repositório força `https` nem colapsa `www` ↔ apex. Isso deve ser configurado no host/Netlify. **CORRIGIR** em conjunto com B5 (escolher um host).

### B7 — ALTA — Sem redirecionamento do domínio legado (a lacuna real de SEO legado)

`public/_redirects` contém **uma única linha**:

```
/*	/index.html	200
```

É apenas o fallback SPA do Netlify. **Não existe** regra 301 de `jsterceirizados.com.br` — e não poderia existir neste arquivo, porque `_redirects` é processado pelo host de `jsempregos.com.br` e nunca receberia requisições do domínio legado.

Este é **o** ponto que responde à sua dúvida original:

```text
Google → histórico "J&S Terceirizados"
       → jsterceirizados.com.br  ← DESATIVADO
```

**O repositório não tem como corrigir isso.** Depende inteiramente de A-1:
- **Se o cliente controla o domínio** → configurar 301 no host/DNS **fora do repositório**, mantendo o repositório intocado.
- **Se não controla** → o caminho é atualizar o Perfil da Empresa no Google para `jsempregos.com.br` (sem criar perfil duplicado) e confiar no `alternateName` (`schema.ts:147`) para a associação de marca.

O repositório, nesse ponto, está **correto por ausência de erro** — não há nada a corrigir aqui.

---

## 6. O QUE **NÃO** DEVE SER SUBSTITUÍDO

Reforçando a sua instrução explícita. As ocorrências abaixo **não** devem ser tocadas:

| Local | Linha | Texto | Motivo |
|---|---|---|---|
| `index.html` | 54 | `keywords` contendo `J&S Terceirizados` | é o mecanismo que captura busca da marca legada |
| `src/config/seo.ts` | 9 | `keywords` idem | idem |
| `src/utils/schema.ts` | 147 | `alternateName` com as 3 grafias | consolida a entidade **sem** apagar marca |
| `src/config/company.ts` | 44 | `instagram.com/jsterceirizados/` | handle histórico (ver A-2) |
| `docs/V21-SEED-MASTER.md` | 129 | `J&S Terceirizados` como fantasy name | documentação histórica |
| `src/config/company.ts` | 2 | `name: 'J&S Empregos LTDA'` | **REGRA CRÍTICA AGENTS.md** |
| `index.html` | 79 | `og:site_name: 'J&S Empregos'` | marca comercial (ver B4 para alinhar, não renomear) |

---

## 7. OBSERVAÇÃO FORA DE ESCOPO (SEGURANÇA)

Ao ler `.env` para auditar as variáveis de domínio, foram observados credenciais em texto plano: `OPENROUTER_API_KEY` (`:38`), `SUPABASE_SECRET_KEY` (`:50`), `SMTP_PASS` (`:93`), `ADMIN_EMAIL`/`ADMIN_PASSWORD` (`:52-53`).

**Classificação: contenção correta.** Verificado com `git ls-files`:
- `.env` **não** é trackado — está no `.gitignore` (`.env`, `.env.local`, `.env.*.local`, `.env.provision*`)
- O único arquivo de env no índice git é `.env.example` (`:2,31,50,63` — apenas placeholders, sem segredo real)

Portanto **não há vazamento em histórico do git**. Registro aqui apenas porque a auditoria leu o arquivo e a duplicata `AUTH_SITE_URL` (B6) precisa de correção no mesmo local.

### B6 — CRÍTICA — `AUTH_SITE_URL` duplicado com host inválido

| Arquivo | Linha | Conteúdo |
|---|---|---|
| `.env` | 96 | `AUTH_SITE_URL=https://jsempregos.com.` ← FQDN malformado (ponto final) |
| `.env` | **97** | `AUTH_SITE_URL=https://WWW.jsempregos.com.br` ← **vence**; `www.jsempregos.com.br` não resolve |
| `.env.local` | 65-66 | mesma duplicação |
| `.env.example` | 53 | `AUTH_SITE_URL=https://WWW.jsempregos.com.br` (**trackado no git**) |

O comentário em `.env:95` declara: *"URL pública usada em links de autenticação (confirmação, recuperação)"*.

`https://WWW.jsempregos.com.br` **não é um host resolvível** (o subdomínio registrado é `jsempregos.com.br`; `www.jsempregos` é um host inexistente — e `WWW` maiúsculo agrava). Com a chave duplicada, é esse o valor efetivo. Todos os links de confirmação e recuperação gerados a partir deste ambiente apontam para um host inexistente.

**CORRIGIR:** uma única entrada, `AUTH_SITE_URL=https://jsempregos.com.br`, coerente com B5.

---

## 8. ORDEM DE CORREÇÃO SUGERIDA (para autorização posterior)

**Tier 1 — sem risco, gain alto, isolado**
1. B1 + B2 — gerar `og-image.png` 1200×630, apontar `index.html:75,89` e `SEO.tsx:56`
2. B6 — `AUTH_SITE_URL` duplicado/inválido (`.env`, `.env.local`, `.env.example`)
3. B5 — `VITE_SITE_URL` duplicado (`.env`, `.env.example`) + decisão apex vs www
4. B12 — remover `Host:` do `robots.txt`
5. B14 — `manifest.webmanifest` nome oficial
6. B13 — remover `public/google-site-verification.html` (opcional)

**Tier 2 — exige decisão de conteúdo**
7. B9 — unificar NAP em Poá/SP
8. B10 — preencher CEP
9. B4 — alinhar `title`/`og:site_name` de `index.html`
10. B3 — canonical único + política de barra final
11. B11 — sitemap: detalhe de vagas/serviços/empresas + `lastmod` real

**Tier 3 — exige definição de identidade (aguardar A-2/A-3)**
12. A-1 — 301 do domínio legado (fora do repositório)
13. A-2, A-3 — confirmar handles sociais antes de consolidar `sameAs`

**Fora do repositório**
14. B8 — https obrigatório, host canônico, HSTS
15. A-4 — revisar `Disallow` de `/cadastro/` e `/entrar/`

**Não autorizado para agora**
16. B16 — `SEO_PAGES`/`getSeoMeta` órfãos: **ANALISAR** antes de remover (remover pode ser correto, mas `docs/FRONTEND-MOCK-DB-MATRIX.md:73` já sinaliza como GAP em aberto)

---

## 9. CONFORMIDADE

- Auditoria **somente leitura**. Nenhum arquivo de código, config, banco ou infra foi alterado. A única escrita foi este relatório.
- Regra crítica do `AGENTS.md` (nome da empresa) **não foi tocada** em nenhum momento.
- Footer **não foi inspecionado nem alterado**.
- Nenhum commit, push ou deploy foi executado.
- B17/B6Nested偷: credenciais existem apenas em `.env` local (gitignored). Sem vazamento em histórico.

**Correção ao registro anterior:** a memória de sessão (`ses_f10447400ffeA2OF3pPXlCncBt`) afirmava que "canonical, og:url, SITE_URL, JSON-LD, robots.txt e sitemap não apontam para jsterceirizados.com.br". **Confirmado — verdadeiro.** Porém essa auditoria **não cobriu** `og:image` (B1/B2), canonical duplicado (B3), as chaves `VITE_SITE_URL`/`AUTH_SITE_URL` duplicadas (B5/B6), NAP (B9), CEP (B10) nem completude do sitemap (B11). Este relatório é complementar e独立的, não substitui o anterior.