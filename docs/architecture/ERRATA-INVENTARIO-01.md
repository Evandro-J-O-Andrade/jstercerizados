# ERRATA OFICIAL — Inventário de Realidade

> **Status:** vigente. Substitui qualquer número divergente em `ARQUITETURA-01`, `ARQUITETURA-01C`, `ARQUITETURA-01F` e `architecture/02C.*`.
> **Natureza:** documental. Nenhuma alteração de código, banco ou Git.
> **Conexão:** `ARQUITETURA-01` descreve **o que existe**. Esta errata fixa **os números** desse "o que existe". `migration-map` descreve **como transformar**. Nenhum substitui o outro.

Toda métrica abaixo foi **medida** nesta worktree, não herdada. Quando há divergência de critério, o critério é declarado e ambas as leituras ficam registradas.

**Ambiente de medição:** `db.okxqfyoqbhcmflpurfrw.supabase.co`, conexão com `default_transaction_read_only=on` (verificado em cada execução). Nenhuma escrita.

---

## 1. Resumo canônico

| Métrica                   | Valor canônico | Critério                                               |
| ------------------------- | -------------: | ------------------------------------------------------ |
| Tabelas em `public`       |        **221** | `information_schema.tables`, `table_type='BASE TABLE'` |
| Views em `public`         |          **5** | `information_schema.views`                             |
| Matviews em `public`      |          **0** | `pg_matviews`                                          |
| **Objetos relacionais**   |        **226** | 221 tabelas + 5 views                                  |
| Tabelas com RLS           |        **221** | `pg_class.relrowsecurity` — 100%                       |
| Policies em `public`      |        **600** | `pg_policies`                                          |
| Policies (todos schemas)  |            616 | `pg_policies`                                          |
| Funções em `public`       |        **233** | `pg_proc`                                              |
| Triggers em `public`      |         **66** | `pg_trigger` `NOT tgisinternal`                        |
| Triggers (todos schemas)  |         **79** | `pg_trigger` `NOT tgisinternal`                        |
| FKs em `public`           |            535 | `pg_constraint` `contype='f'`                          |
| Constraints (todos tipos) |            901 | `pg_constraint`                                        |
| Índices em `public`       |            713 | `pg_indexes`                                           |
| Extensões                 |              6 | inventário                                             |
| Roles PostgreSQL          |             31 | `pg_roles` total (inclui internos)                     |
| Roles não-`pg_`           |             16 | `pg_roles`                                             |
| **Roles de aplicação**    |         **53** | tabela `roles`                                         |

### RBAC

| Tabela             | Linhas |
| ------------------ | -----: |
| `roles`            |     53 |
| `permissions`      |    230 |
| `role_permissions` |    739 |
| `role_assignments` |     37 |

### Dashboard

`dashboard_widgets` = **0 linhas**, `dashboard_layouts` = **0 linhas**. RLS habilitada, 6 policies somadas.

---

## 2. Triggers — de onde vieram 84, 79 e 66

Os três números não estavam errados por descuido. Eram **critérios diferentes**, e o documento não declarava qual usava.

| #   | Critério                                                                                     | Resultado |
| --- | -------------------------------------------------------------------------------------------- | --------: |
| 1   | `information_schema.triggers` onde `event_object_schema='public'` (uma linha **por evento**) |    **84** |
| 2   | `count(DISTINCT trigger_name)` em `information_schema`, `public`                             |    **66** |
| 3   | `pg_trigger WHERE NOT tgisinternal`, `public`                                                |    **66** |
| 4   | `pg_trigger WHERE NOT tgisinternal`, todos os schemas                                        |    **79** |
| 5   | `information_schema.triggers`, todos os schemas                                              |        99 |

Os critérios 2 e 3 concordam em **66**, o que valida o número por duas vias independentes.

Distribuição real dos 79:

| Schema     | Triggers não-internal | Linhas em `information_schema` |
| ---------- | --------------------: | -----------------------------: |
| `public`   |                    66 |                             84 |
| `storage`  |                     7 |                              8 |
| `auth`     |                     5 |                              5 |
| `realtime` |                     1 |                              2 |
| **Total**  |                **79** |                         **99** |

**Decisão:**

- Para domínio de aplicação, use **66** (`public`).
- Para o banco inteiro, use **79**.
- **84 está aposentado.** É supercontagem por evento, não erro de digitação — mas também não é contagem de triggers.
- **99** é a supercontagem correspondente em todos os schemas. Não usar.

> Nota: `pg_trigger` em `public` inclui **2140 triggers internos** (`tgisinternal`), que são as políticas de FK. Nunca usar contagem sem o filtro `NOT tgisinternal`.

---

## 3. Quadrante Banco × Frontend

### 3.1 O erro de denominador

Os números **74**, **151** e **152** estavam todos corretos. O erro foi somá-los como se tivessem o mesmo denominador.

`ARQUITETURA-01F` somava `74 + 151 = 225` contra 226 objetos, porque **74 contava objetos e 151 contava tabelas**.

### 3.2 Critério adotado

Um objeto é **"com frontend"** quando existe ao menos uma ocorrência literal de `supabase.from('<objeto>')` em qualquer `.ts`/`.tsx` sob `src/`. Case-sensitive, sem interpolação.

É determinístico, reproduzível e verificável. Ele mede **acesso a dados**, não existência de tela — ver §3.4.

### 3.3 Números canônicos

| Denominador | Com frontend | Sem frontend |   Total |
| ----------- | -----------: | -----------: | ------: |
| Tabelas     |       **70** |      **151** |     221 |
| Views       |        **4** |        **1** |       5 |
| **Objetos** |       **74** |      **152** | **226** |

Views: `financial_kpis` ✅, `public_services_v1` ✅, `public_companies_by_type` ✅, `public_jobs_v1` ✅, `recruitment_kpis` ❌.

**151** é válido como _tabelas sem frontend_. **152** é válido como _objetos sem frontend_. **74** é válido como _objetos com frontend_. Somar misturando denominadores é o que produziu 225.

O número **147** citado em versões anteriores do documento não foi reproduzido por nenhum critério medido aqui. Fica **aposentado** até que a origem seja identificada.

### 3.4 Ressalva obrigatória

> **"sem frontend" não significa "precisa de tela".**

As 151 tabelas sem referência incluem infraestrutura, auditoria, configuração, integração, dados derivados e legado. As maiores famílias:

| Família            | Tabelas sem frontend |
| ------------------ | -------------------: |
| `pos_*`            |                   11 |
| `purchase_*`       |                   10 |
| `work_order*`      |                    7 |
| `integration_*`    |                    7 |
| `service_*`        |                    6 |
| `fiscal_*`         |                    6 |
| `stock_*`          |                    5 |
| `material_*`       |                    4 |
| `epi_*`            |                    4 |
| `administrative_*` |                    4 |
| `interview_*`      |                    3 |

Nenhuma dessas contagens autoriza gerar CRUD.

### 3.5 Inventário de frontend — confiável

| Métrica             | Valor |
| ------------------- | ----: |
| Arquivos analisados |   478 |
| Alcançáveis         |   264 |
| Inalcançáveis       |   214 |
| Sem consumidor      |   124 |

Recomputado do zero a partir de `docs/architecture/frontend-inventory.json`; bate exatamente. **Este inventário é confiável e pode fundamentar arquitetura.**

214 inalcançáveis **não** devem ser reorganizados em `modules/` apenas por serem inalcançáveis.

---

## 4. Rotas

`docs/architecture/route-map.json` está **correto**. Os erros estavam apenas nos documentos narrativos.

| Métrica                | Valor canônico | Critério                               |
| ---------------------- | -------------: | -------------------------------------- |
| Rotas explícitas       |         **62** | `kind='explicit'` em `route-map.json`  |
| Rotas de launcher      |         **27** | `kind='launcher'`                      |
| Total inventariado     |         **89** | 62 + 27                                |
| Duplicações exatas     |         **21** | interseção de strings, não de prefixos |
| `<Route>` em `App.tsx` |        **118** | contagem literal no arquivo inteiro    |

**27, não 28:** `PORTAL_MODULES` declara 28 entradas, mas o filtro de launcher exclui `inicio` (rota `/dashboard`). 28 − 1 = 27.

**21, não 22:** a comparação é por string exata. `configuracoes` só existe no launcher; a rota explícita é `configuracoes/seguranca`. São rotas diferentes. Comparar por prefixo inflaria o resultado.

**118, não 106:** os 106 mediam apenas a subárvore de `/dashboard`. O arquivo inteiro tem 118.

As 21 duplicatas: `almoxarifado`, `assinaturas`, `auditoria`, `configuracoes/seguranca`, `contabilidade`, `crm`, `estoque`, `faturamento`, `financeiro`, `fiscal`, `gestao-saas`, `global`, `ia`, `integracoes`, `onboarding`, `relatorios`, `rh`, `roles-permissoes`, `servicos`, `suporte`, `tenants`.

`106`, `28` e `22` ficam **aposentados**.

---

## 5. Estado dos artefatos

| Artefato                               | Estado                 | Observação                  |
| -------------------------------------- | ---------------------- | --------------------------- |
| `architecture/frontend-inventory.json` | 🟢 confiável           | 478/264/214/124 recomputado |
| `architecture/route-map.json`          | 🟢 correto             | 62/27/89/21                 |
| `architecture/migration-map.json`      | 🟢 peça central        | .strangler fig              |
| `supabase-inventory.json`              | 🟡 parcial             | ver §5.1                    |
| `ARQUITETURA-01`                       | 🔴 números aposentados | árvore §1 ainda vigente     |
| `ARQUITETURA-01C`                      | 🔴 trigger 84 errôneo  | histórico                   |
| `ARQUITETURA-01F`                      | 🔴 quadrante misturado | histórico                   |
| `architecture/02C.2`                   | 🔴 106/28/22 errôneos  | histórico                   |

### 5.1 Defeitos no `supabase-inventory.json`

Medido contra o arquivo real:

| Campo          | Estado                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `tables`       | 🟢 221                                                                                               |
| `views`        | 🟢 5                                                                                                 |
| `functions`    | 🟢 233                                                                                               |
| `foreign_keys` | 🟢 535                                                                                               |
| `policies`     | 🟢 600                                                                                               |
| `rls`          | 🟢 221                                                                                               |
| `triggers`     | 🟡 79 entradas, **critério não declarado** (é o total all-schemas)                                   |
| `roles`        | 🔴 **array vazio** — o banco tem 53                                                                  |
| `enums`        | 🔴 **array vazio**                                                                                   |
| `grants`       | 🟡 6328, sem critério declarado                                                                      |
| —              | 🔴 **não existe** um bloco `totals`; qualquer leitor que procure `totals.triggers` não encontra nada |

A correção mínima é adicionar um bloco `canon` com os valores canônicos e o critério de cada um, sem reescrever os arrays existentes.

---

## 6. Regras para quem for medir de novo

1. **Sempre declarar o critério.** Um número sem critério não é citável.
2. **Triggers** exigem `NOT tgisinternal` e schema explícito.
3. **Nunca** usar `information_schema.triggers` para contar triggers — ele conta eventos.
4. **Nunca somar grandezas de denominadores diferentes.**
5. **Tabelas e views são denominadores separados.** Sempre.
6. **"sem frontend" é ausência de acesso a dados, não ausência de tela.**
7. **Rotas se comparam por string exata**, nunca por prefixo.
8. **RLS e constraints** também exigem o tipo declarado: 901 é o total, 535 é só FK.

---

## 7. Relação entre documentos

```
ARQUITETURA-01 / 01F     →  o que EXISTE
ERRATA-INVENTARIO-01     →  os NÚMEROS desse "o que existe"   (este documento)
ARQUITETURA-02           →  como o sistema DEVERÁ ser        (rascunho, não vigente)
migration-map.json       →  como uma coisa vira outra        (Strangler Fig)
```

Nenhum substitui outro. **Usar um número sem citar esta errata é usar um número aposentado.**
