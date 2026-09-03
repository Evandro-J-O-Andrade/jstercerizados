# MOCK × DB INVENTORY — Fase 2 Frontend

**Data:** 2026-09-02  
**Database:** `okxqfyoqbhcmflpurfrw`  
**Status:** 🔵 **INVENTÁRIO COMPLETO** — 6 GAPs identificados, 0 alterações no banco

---

## 📊 Resumo Executivo

| Domínio                     | Mock/Frontend       | DB Real                       | Status       | GAP?   |
| --------------------------- | ------------------- | ----------------------------- | ------------ | ------ |
| **G12** — Empresas/Clientes | 4 clients mock      | 10 companies DB               | 🟡 Parcial   | G12    |
| **G11** — Serviços          | 6 services mock     | 0 services DB                 | 🔴 Ausente   | G11    |
| **G2/G3** — Blog/Páginas    | Conteúdo hardcoded  | 0 posts, sem pages table      | 🔴 Ausente   | G2/G3  |
| **G1** — Depoimentos        | 4 testimonials mock | testimonials table não existe | 🔴 Ausente   | G1     |
| **G5** — Métricas           | Números hardcoded   | Nenhuma tabela metrics        | 🔴 Ausente   | G5     |
| **G7–G10** — Formulários    | Forms estáticos     | submissions parcial           | 🟡 Parcial   | G7–G10 |
| **Jobs**                    | Mock → DB           | 19 jobs reais                 | ✅ Conectado | —      |
| **Candidates**              | Mock → DB           | 8 candidates reais            | ✅ Conectado | —      |
| **Company Identity**        | Config hardcoded    | 10 companies DB               | 🟡 Parcial   | G12    |
| **Media/Storage**           | Paths hardcoded     | 0 media_assets                | 🔴 Ausente   | G11    |

---

## 🔍 Detalhamento por Domínio

### G12 — Empresas / Clientes / CNPJ / Endereço / Redes Sociais

**Mock (src/mock/clients.ts):**

- 4 clientes: Abarca Móveis, Vector Engenharia, Mistral Vidros, Vectro Engenharia
- Campos: id, name, logo, image, website, description

**DB Real (public.companies):**

- 10 empresas cadastradas
- Campos: id, name, legal_name, document, cnpj, cnpj_root, status, trading_name, state_registration, municipal_registration, company_type_id, industry, phone, email, website, linkedin_url, logo_url, address, size, metadata, created_by, description, short_description, company_segment

**Cruzamento:**

| Campo Mock  | Campo DB         | Status      |
| ----------- | ---------------- | ----------- |
| name        | name             | ✅ Direto   |
| logo        | logo_url         | ✅ Mapeável |
| image       | logo_url (reuso) | ✅ Mapeável |
| website     | website          | ✅ Direto   |
| description | description      | ✅ Direto   |

**GAPs:**

- 🔴 **company_segment**: existe no DB mas não no mock (será útil para filtros)
- 🔴 **company_social_links**: tabela existe mas **vazia** (0 rows). Mock tem SOCIAL_LINKS em `config/company.ts`
- 🔴 **logo_url**: todas as 10 empresas tem `logo_url = null` — nenhuma imagem cadastrada
- 🟡 **website**: 7/10 empresas tem website null
- 🟡 **description**: 7/10 empresas tem description null

**Ação:** Conectar Home/Clientes ao DB. Manter fallback para empresas sem dados completos.

---

### G11 — Serviços / Imagens

**Mock (src/mock/services.ts):**

- 6 serviços: Segurança Patrimonial, Controle de Acesso, Portaria, Limpeza, Zeladoria, Facilities
- Campos: id, title, description, icon, price, features, image

**DB Real (public.services):**

- **0 serviços cadastrados** (tabela existe, vazia)

**GAPs:**

- 🔴 **Nenhum serviço no DB** — todos os 6 são mock
- 🔴 **Imagens**: paths hardcoded em `src/config/images.ts` (26+ service images)
- 🔴 **Features/benefits**: não existem no DB (precisam de tabela ou JSONB)
- 🔴 **Price**: não existe no DB

**Ação:** Criar serviços no DB + upload de imagens para storage + conectar frontend.

---

### G2/G3 — Blog / Páginas / Conteúdo Editorial

**Mock (src/pages/Blog.tsx):**

- `articles` array hardcoded (3 artigos)
- Estrutura: id, title, excerpt, content, image, date, category, readTime, author

**DB Real:**

- **blog_posts**: tabela existe, **0 posts**
- **pages**: tabela **não existe**

**GAPs:**

- 🔴 **blog_posts**: 0 posts no DB
- 🔴 **pages**: tabela não existe (páginas institucionais como Sobre, Contato, FAQ precisam de estrutura)
- 🔴 **Conteúdo hardcoded**: FAQ (4 categorias × 3 Q&As), Processo Seletivo (4 steps), Sobre (valores, chapters)

**Ação:** Criar blog_posts + pages table + popular conteúdo + conectar.

---

### G1 — Depoimentos

**Mock (src/mock/testimonials.ts):**

- 4 testimonials: Roberta Santos, Marcos Oliveira, Fernanda Lima, Juliano Costa
- Campos: id, name, role, company, image, quote, rating

**DB Real:**

- **testimonials table não existe**

**GAPs:**

- 🔴 **Tabela testimonials não existe**
- 🔴 **Nenhum depoimento no DB**

**Ação:** Criar tabela testimonials + popular + conectar.

---

### G5 — Métricas / Números

**Mock (src/mock/home.ts):**

- COMPANY_STATS: 15 anos
- COMPANY_STATS_LIST: 15 anos, 500 profissionais, 200 clientes, 50 cidades
- SERVICES_STATS: 500 profissionais, 200 contratos, 98% satisfação
- FEATURED_STATS: 200 clientes, 500 projetos, 500 profissionais, 50 cidades

**DB Real:**

- Nenhuma tabela de métricas
- Dados espalhados: tenant_settings (10 rows, schema minimal), companies (10 rows)

**GAPs:**

- 🔴 **Nenhuma tabela metrics/stats**
- 🔴 **Números hardcoded** em múltiplos arquivos

**Ação:** Definir modelo de métricas (tenant_settings? tabela separada? JSONB?) + conectar.

---

### G7–G10 — Formulários / Submissions

**Mock (src/pages/\*.tsx):**

- Contato: formulário estático
- TrabalheConosco: formulário com positionOptions
- DivulgarVaga: JobApplicationForm component
- Suporte: SUPPORT_CARDS, CATEGORY_OPTIONS, PRIORITY_OPTIONS, STEPS

**DB Real:**

- **form_submissions**: tabela não existe
- **support_tickets**: tabela existe, 0 tickets
- **applications**: tabela existe, 0 applications

**GAPs:**

- 🔴 **form_submissions**: tabela não existe
- 🟡 **support_tickets**: existe mas vazia
- 🟡 **applications**: existe mas vazia (0 candidaturas)
- 🔴 ** Campos de formulário hardcoded** (positionOptions, CATEGORY_OPTIONS, etc.)

**Ação:** Criar form_submissions + popular opções de formulário + conectar.

---

### ✅ JÁ CONECTADO — Jobs

**Frontend (src/services/mock/vagas.ts):**

- Mock com 19 vagas

**DB Real (public.jobs):**

- 19 jobs reais (1 draft, 18 published)
- Campos: id, tenant_id, title, description, requirements, benefits, salary_min, salary_max, location, employment_type, status, published_at, created_at, updated_at

**Status:** ✅ **JÁ CONECTADO** — frontend já consome dados reais do DB.

---

### ✅ JÁ CONECTADO — Candidates

**Frontend (src/services/mock/curriculos.ts):**

- Mock com candidates

**DB Real (public.candidates):**

- 8 candidates reais com dados completos

**Status:** ✅ **JÁ CONECTADO** — frontend já consome dados reais do DB.

---

## 🗺️ Matriz MOCK × DB

### Empresas/Clientes (G12)

| Item         | Mock      | DB                 | Ação                |
| ------------ | --------- | ------------------ | ------------------- |
| name         | ✅        | ✅ 10 rows         | Conectar            |
| logo         | ✅ paths  | ❌ null (7/10)     | Upload + conectar   |
| website      | ✅        | 🟡 3/10            | Conectar + fallback |
| description  | ✅        | 🟡 3/10            | Conectar + fallback |
| segment      | ❌        | ✅ company_segment | Adicionar ao mock   |
| social links | ✅ config | ❌ table vazia     | Popular + conectar  |

### Serviços (G11)

| Item        | Mock          | DB          | Ação              |
| ----------- | ------------- | ----------- | ----------------- |
| title       | ✅ 6 services | ❌ 0 rows   | Criar no DB       |
| description | ✅            | ❌          | Criar no DB       |
| image       | ✅ 26 paths   | ❌ 0 assets | Upload + conectar |
| features    | ✅            | ❌          | Criar estrutura   |
| price       | ✅            | ❌          | Criar estrutura   |

### Blog/Páginas (G2/G3)

| Item     | Mock               | DB                  | Ação         |
| -------- | ------------------ | ------------------- | ------------ |
| posts    | ✅ 3 articles      | ❌ 0 rows           | Criar no DB  |
| pages    | ❌                 | ❌ table não existe | Criar tabela |
| FAQ      | ✅ 4 cats × 3 Q&As | ❌ 0 rows           | Criar no DB  |
| Processo | ✅ 4 steps         | ❌                  | Criar no DB  |

### Depoimentos (G1)

| Item         | Mock       | DB                  | Ação                   |
| ------------ | ---------- | ------------------- | ---------------------- |
| testimonials | ✅ 4 items | ❌ table não existe | Criar tabela + popular |

### Métricas (G5)

| Item  | Mock         | DB                | Ação           |
| ----- | ------------ | ----------------- | -------------- |
| stats | ✅ hardcoded | ❌ nenhuma tabela | Definir modelo |

### Formulários (G7–G10)

| Item             | Mock             | DB              | Ação               |
| ---------------- | ---------------- | --------------- | ------------------ |
| contato          | ✅ form          | ❌ submissions  | Criar tabela       |
| trabalhe-conosco | ✅ form          | ❌              | Criar tabela       |
| divulgar-vaga    | ✅ form          | 🟡 applications | Conectar           |
| suporte          | ✅ cards/options | 🟡 tickets      | Popular + conectar |

---

## 🎯 Priorização

### Ordem de ataque (conforme planejado)

1. **G12** — Empresas/Clientes: dados existem no DB, apenas conectar + complementar
2. **G11** — Serviços: criar no DB + upload imagens
3. **G2/G3** — Blog/Páginas: criar estrutura + popular
4. **G1** — Depoimentos: criar tabela + popular
5. **G5** — Métricas: definir modelo
6. **G7–G10** — Formulários: criar submissions + conectar

---

## ⚠️ Regras de Execução

1. **Não alterar layout** — cards, heroes, seções permanecem
2. **Não apagar mock** — manter fallback até DB estar completo
3. **Primeiro criar no DB** — só depois conectar frontend
4. **GAPs viram migration** — não inventar no frontend
5. **Imagens no Storage** — não no banco
6. **Fallback sempre** — se DB não tem dados, mostrar conteúdo padrão
