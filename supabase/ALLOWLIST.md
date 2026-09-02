# Migration Allowlist — J&S Terceirizados

**Data:** 2026-09-02
**Status:** SUPABASE GATE fechado — banco já contém tudo da janela 2026-08/09

---

## Regra de ouro

> **NUNCA executar `supabase db push` às cegas.**
> **NUNCA aplicar migrations históricas que já estão refletidas no Supabase.**
> **SEMPRE validar com a SUPABASE GATE antes de qualquer migration nova.**

O repositório possui `~47` arquivos em `supabase/migrations/` e outros `47` em
`supabase/specs/sql/`. Apenas uma fração está alinhada com o estado real do
Supabase (`okxqfyoqbhcmflpurfrw`).

---

## Estado conhecido do Supabase (auditado 2026-09-02)

| Área                       | Estado | Observação                             |
| -------------------------- | ------ | -------------------------------------- |
| Supabase                   | 🟢     | Projeto saudável                       |
| `services`                 | 🟢     | CMS já estruturado                     |
| `media_assets`             | 🟢     | Sistema central existe                 |
| bucket `public-media`      | 🟢     | 10 MB                                  |
| bucket `avatars`           | 🟢     | 5 MB                                   |
| bucket `private-documents` | 🟢     | 20 MB                                  |
| bucket `services-images`   | 🟡     | **Legado — não usar**                  |
| `jobs`                     | 🟢     | Estrutura completa                     |
| `companies`                | 🟢     | CNPJ + dados comerciais OK             |
| `candidates`               | 🟢     | Estrutura principal + filhas           |
| Recrutamento               | 🟢     | Processos, stages, interviews, matches |
| Financeiro                 | 🟢/🟡  | Estrutura base existe                  |
| Estoque/Almoxarifado       | 🟢/🟡  | Estrutura ampla                        |
| Ordens de serviço          | 🟢     | Operacional amplo                      |
| Chat                       | 🟢/🟡  | Salas/mensagens/handoff                |
| Automação                  | 🟢/🟡  | `automation_jobs`/execuções/eventos    |
| RBAC                       | 🟢     | Catálogo robusto                       |
| **Segurança**              | 🟡     | **Correções pendentes** (ver §3)       |

### Role `candidate` (já existe no catálogo)

```text
code: candidate
scope: tenant
permissions: 5
  - applications.create
  - applications.read
  - candidates.read
  - dashboard.read
  - jobs.read
```

> **NÃO criar role `candidato` duplicado.** O código no frontend deve usar `candidate`.

### Problema real do candidato (não é falta de role)

| Métrica                           | Valor |
| --------------------------------- | ----- |
| `people` sem membership ativo     | 6     |
| `people` sem role assignment      | 9     |
| `candidates` sem membership       | 3     |
| `candidates` sem role `candidate` | 4     |

A cadeia canônica é:

```text
auth.users → people → tenant_memberships → role_assignments → candidate → dashboard
```

Esses registros quebrando a cadeia são o alvo da consolidação (Seção 01).

---

## 1. ⚫ ALLOWLIST-NEGATIVA — NÃO reaplicar (já refletidos no Supabase)

Todos estes arquivos **já estão aplicados ou refletidos** no Supabase. Reaplicar
causa erro ou poluição:

| #   | Arquivo                                           | Status                              |
| --- | ------------------------------------------------- | ----------------------------------- |
| —   | `20260816000100` … `20260816001200`               | ⚫ base consolidada                 |
| —   | `20260817000100` … `20260817000400`               | ⚫ base consolidada                 |
| —   | `20260823004800` … `20260823005000`               | ⚫ RBAC seed                        |
| —   | `20260824000000` … `20260824005100`               | ⚫ infraestrutura RLS               |
| —   | `20260825000001` … `20260825000006`               | ⚫ editorial + RLS                  |
| —   | `20260826000001`                                  | ⚫ candidate bootstrap              |
| —   | `20260827000000` … `20260827001300`               | ⚫ recruitment + finance            |
| —   | `20260827154500`                                  | ⚫ admin master perms               |
| —   | `20260828000001_fix_bootstrap_identity`           | ⚫ função corrigida                 |
| —   | `20260829000001_services`                         | ⚫ tabela existe (canônica)         |
| —   | `20260830000100_auth_people_sync`                 | ⚫ triggers aplicados               |
| —   | `20260830000200_reconcile_applications`           | ⚫ colunas reconciliadas            |
| —   | `20260830000300_reconcile_recruitment_demands`    | ⚫ colunas reconciliadas            |
| —   | `20260830000500_reconcile_job_matches`            | ⚫ colunas reconciliadas            |
| —   | `20260830000600_reconcile_notifications`          | ⚫ colunas reconciliadas            |
| —   | `20260830000800_company_services_link`            | ⚫ FK aplicada                      |
| —   | `20260830000900_service_orders_relationship`      | ⚫ FK aplicada                      |
| —   | `20260830001000_recruitment_demands_service_link` | ⚫ FK aplicada                      |
| —   | `20260830001100_storage_services_images`          | ⚫ bucket legado criado             |
| —   | `20260831000001_company_social_links`             | ⚫ tabela criada                    |
| —   | `20260901000001_media_storage_v1`                 | ⚫ media_assets + 3 buckets criados |
| —   | `20260902000001_reconcile_services_cms`           | ⚫ CMS reconciliado                 |

> **Resultado da SUPABASE GATE:** nenhum dos 12 arquivos anteriores precisa ser aplicado.

---

## 2. 🟢 Próxima migration: Platform Hardening + CMS + Media + Identity v1

**Arquivo proposto (timestamp a definir):**

```
20260902xxxxxx_platform_hardening_v1.sql
```

**Status:** SPEC pendente de OK explícito do usuário. SQL só será gerado após
a aprovação do desenho descrito em [`supabase/HARDENING-SPEC.md`](./HARDENING-SPEC.md).

**Princípios inegociáveis:**

- ❌ NÃO recriar tabelas
- ❌ NÃO apagar dados
- ❌ NÃO renomear colunas existentes
- ❌ NÃO criar role `candidato` (já existe `candidate`)
- ✅ Adicionar apenas o que falta
- ✅ Tornar tudo idempotente
- ✅ Tudo dentro de uma única transação
- ✅ Tudo reversível (rollback por seção)

**8 seções propostas (resumo):**

| §   | Seção         | Conteúdo                                                                                                                                                                      |
| --- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Identity/RBAC | Reparar cadeia quebrada: `people → tenant_memberships → role_assignments → candidate`                                                                                         |
| 02  | CMS           | Fechar publicação/SEO/ordenação de `services`, `jobs`, `companies`, `blog_posts`, `media_assets`                                                                              |
| 03  | Media         | Padronizar `entity_type`/`entity_id`/`bucket_id`/`storage_path`/`is_primary`                                                                                                  |
| 04  | Forms         | Contratos canônicos: CNPJ, CPF, telefone, endereço, descrição, títulos, SEO, upload, anexos                                                                                   |
| 05  | FKs           | Revisar relacionamentos por domínio (tenant, company, person, candidate, job, service, contract, employee, supplier, financial, stock, work_order, support, chat, automation) |
| 06  | RLS           | Garantir `tenant A ≠ tenant B` em toda tabela operacional                                                                                                                     |
| 07  | Security      | Corrigir Advisor: policies ausentes em `tenants`/`company_relationship_types`, `SECURITY DEFINER`, `search_path`, `EXECUTE`                                                   |
| 08  | Integration   | `domain_events` como contrato de saída; **nada de n8n dentro do banco**                                                                                                       |

**Detalhes em [`HARDENING-SPEC.md`](./HARDENING-SPEC.md).**

---

## 3. 🟡 Pendências de segurança (Supabase Advisor)

Encontradas na auditoria. Endereçadas na §7 da migration consolidada:

- **RLS sem policy**: `tenants`, `company_relationship_types`
- **`SECURITY DEFINER` expostos** (revisar `EXECUTE` + `search_path`):
  - `handle_auth_user_deleted`
  - `handle_auth_user_updated`
  - `handle_new_auth_user`
  - `is_tenant_member`
  - `is_admin_master`
  - `user_has_permission`
  - `user_permissions`
  - `user_tenant_ids`
  - `bootstrap_candidate_identity`
- **`search_path` mutável** em várias funções (revisar todas)

---

## 4. Quando voltar a migrar normalmente

Após a `platform_hardening_v1` ser aplicada e validada:

```bash
# fluxo normal volta
supabase db push
```

até que uma nova divergência force novo GATE.
