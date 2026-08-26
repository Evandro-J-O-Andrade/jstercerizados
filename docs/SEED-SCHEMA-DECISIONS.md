# SEED-SCHEMA-DECISIONS.md

**Data:** 2026-08-25
**Escopo:** Registrar decisões necessárias antes de corrigir/executar seeds de homologação.
**Regra:** Este arquivo NÃO corrige o schema. Ele somente registra divergências e decisões pendentes.

---

## 1. PROBLEMAS IDENTIFICADOS

### 1.1 `tenants.plan` e `tenants.settings`

**Problema:**
Os seeds `seed-homologation.ts` e `seed-homologation-full.ts` inserem colunas `plan` e `settings` na tabela `tenants`.

**Schema real:**
A tabela `tenants` possui apenas: `id`, `name`, `slug`, `status`, `created_at`, `updated_at`.

**Evidência:**
`information_schema.columns` confirmou ausência de `plan` e `settings`.

**Hipótese do seed:**
O seed assume um schema canônico antigo onde `tenants` possuía `plan` (para billing/assinatura) e `settings` (JSON de configurações).

**Status:** `NOT_CONFIRMED` / `MISSING`

**Decisão necessária:**

- Opção A: Adicionar `plan` e `settings` ao schema via migration.
- Opção B: Remover essas colunas dos seeds.

**Risco:**
Se `plan` for usado pelo billing/assinatura no frontend, remover do seed sem adicionar ao banco pode mascarar um gap de funcionalidade.

---

### 1.2 `company_relationship_types` inexistente

**Problema:**
O seed `seed-homologation-full.ts` consulta `company_relationship_types` para obter `id` e `code='client'`, e depois insere em `company_relationships` usando `relationship_type_id`.

**Schema real:**
A tabela `company_relationship_types` **não existe** no banco.

**Evidência:**
Consulta direta a `information_schema.tables` retornou `0 registros`.

**Hipótese do seed:**
O seed assume um modelo relacional onde tipos de relacionamento são normalizados em tabela própria.

**Status:** `MISSING`

**Decisão necessária:**

- Opção A: Criar tabela `company_relationship_types` com colunas `id`, `code`, `name`, etc.
- Opção B: Remover a lógica de relacionamentos do seed.

**Risco:**
Se o domínio de CRM/relacionamentos for crítico, a ausência dessa tabela pode indicar um gap de modelagem.

---

### 1.3 `company_relationships.tenant_id` e `relationship_type_id`

**Problema:**
O seed insere em `company_relationships` usando `tenant_id` e `relationship_type_id`.

**Schema real:**
A tabela `company_relationships` possui: `id`, `company_id`, `relationship_type` (text livre), `status`, `start_date`, `end_date`, `metadata`, `created_at`, `updated_at`.

**Evidência:**
`information_schema.columns` confirmou ausência de `tenant_id` e `relationship_type_id`.

**Hipótese do seed:**
O seed assume um modelo FK-based onde `relationship_type_id` aponta para `company_relationship_types.id`.

**Status:** `MISSING`

**Decisão necessária:**

- Opção A: Ajustar seed para usar `relationship_type` como texto livre (ex: `'client'`).
- Opção B: Alterar schema para adicionar `tenant_id` e `relationship_type_id`.

**Observação:**
O schema real já tem `relationship_type` como `text`, sugerindo que o modelo atual é **texto livre**, não FK. Nesse caso, a opção A é mais alinhada com o banco.

---

### 1.4 `jobs.work_mode` e `jobs.slug`

**Problema:**
O seed `seed-homologation-full.ts` insere em `jobs` usando `work_mode` e `slug`.

**Schema real:**
A tabela `jobs` possui: `id`, `tenant_id`, `company_id`, `title`, `description`, `status`, `employment_type`, `location`, `salary`, `benefits`, `requirements`, `published_at`, `closed_at`, `created_at`, `updated_at`.

**Evidência:**
`information_schema.columns` confirmou ausência de `work_mode` e `slug`.

**Hipótese do seed:**
O seed assume campos de enriquecimento de vaga (modo de trabalho, slug para URL amigável).

**Status:** `MISSING`

**Decisão necessária:**

- Opção A: Adicionar `work_mode` e `slug` ao schema via migration.
- Opção B: Remover essas colunas do seed.

**Risco:**
Se o site público já usa slugs de vaga (`/vagas/:slug`), a ausência de `slug` no banco indica um gap funcional. Se `work_mode` for usado no filtro de vagas, também é gap.

---

### 1.5 `companies.cnpj`, `companies.industry`, `companies.is_active`

**Problema:**
Documentação anterior e alguns seeds mencionam implicitamente essas colunas.

**Schema real:**
A tabela `companies` possui: `id`, `tenant_id`, `name`, `legal_name`, `document`, `status`, `created_at`, `updated_at`.

**Evidência:**
`information_schema.columns` confirmou ausência de `cnpj`, `industry`, `is_active`.

**Hipótese:**
Documentação desatualizada. O schema usa `document` (text) para CPF/CNPJ e `status` para indicador de atividade.

**Status:** `MISSING`

**Decisão necessária:**

- Opção A: Adicionar `cnpj`, `industry`, `is_active` ao schema.
- Opção B: Atualizar documentação para refletir `document` e `status`.

**Observação:**
`legal_name` **existe** no schema real (text, nullable). O inventário anterior estava errado ao dizer que não existia ou não estava confirmado.

---

## 2. DECISÕES NÃO TOMADAS AINDA

| #   | Problema                                                   | Decisão pendente                      | Impacto se não decidir                       |
| --- | ---------------------------------------------------------- | ------------------------------------- | -------------------------------------------- |
| 1   | `tenants.plan` / `tenants.settings`                        | Adicionar colunas ou remover do seed? | Seeds bloqueados; possível gap de billing    |
| 2   | `company_relationship_types`                               | Criar tabela ou remover do seed?      | Seed bloqueado; possível gap de CRM          |
| 3   | `company_relationships.tenant_id` / `relationship_type_id` | Alterar seed ou alterar schema?       | Seed bloqueado; divergência de modelo        |
| 4   | `jobs.work_mode` / `jobs.slug`                             | Adicionar colunas ou remover do seed? | Seed bloqueado; possível gap de recrutamento |
| 5   | `companies.cnpj` / `industry` / `is_active`                | Adicionar colunas ou atualizar docs?  | Documentação incorreta                       |

---

## 3. REGRA PARA CORREÇÃO

**Não corrigir por inferência.**

Exemplos proibidos:

- `legal_name` não existe → trocar por `name` ❌
- `person_id` não existe → remover `person_id` ❌
- `company_relationships` não existe → criar a tabela ❌

**Fluxo correto:**

1. Documentar divergência (feito em `SEED-SCHEMA-AUDIT.md`).
2. Decidir se o seed ou o schema está errado.
3. Aplicar migration deliberada OU corrigir seed.
4. Executar seed.
5. Validar novamente.

---

## 4. CRITÉRIO DE CONCLUSÃO

Esta tarefa está concluída quando:

- [x] `docs/SEED-SCHEMA-AUDIT.md` criado.
- [x] `docs/SEED-SCHEMA-DECISIONS.md` criado.
- [ ] Decisões dos itens 1.1 a 1.5 tomadas e registradas neste arquivo.
- [ ] Seeds corrigidos (somente após decisões).

**Aguardando decisão do time/modelo canônico antes de qualquer alteração.**
