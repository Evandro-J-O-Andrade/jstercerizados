# STAGE 02.14 — Reconciliação de Evidências SQL, Inventário Complementar e Pareceres P0 (docs-only)

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H / `js-empregos`, Supabase `okxqfyoqbhcmflpurfrw`, `sa-east-1`)  
**Data:** 2026-11-06  
**Base:** `main@b9de729` (publicado), `origin/main` alinhado; Stage 02.1–02.12 (`docs/database-driven-ui/STAGE02_MATRIZ_PAGINA_SECAO_DADOS.md`); Stage 02.13 (`docs/check-bouler-24h/STAGE02_13_MATRIZ_REGRESSAO_E_INVENTARIO_COMPLEMENTAR.md`).  
**Método:** consultas **read-only** remotas via `supabase db query --linked` (Supabase CLI 2.117.0, projeto linkado `okxqfyoqbhcmflpurfrw`) a catálogos `pg_policies`, `pg_class/pg_namespace`, `storage.buckets`, `information_schema.role_table_grants/routine_privileges/triggers`, `pg_proc/pg_get_functiondef/pg_depend`. **Nenhum DDL/DML, `GRANT/REVOKE`, alteração de RLS/Storage/Edge/config, mudança de código funcional, commit, push ou deploy.**

## Classificação de evidência (obrigatória)

| Classe                 | Significado nesta etapa                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Comprovado por SQL** | Resultado observado diretamente em consulta read-only remota nesta sessão, com consulta/resultado citado.                              |
| **Observado**          | Evidência de auditoria anterior (02.1–02.13), código local, docs ou comportamento já registrado; não reprovado agora por SQL completo. |
| **Inferido**           | Conclusão lógica a partir de evidências; não é prova de explorabilidade ou de estado completo.                                         |
| **Pendente**           | Falta consulta, prova controlada, ambiente, autorização ou artefato para concluir.                                                     |

## 02.14.1 — Reconciliação das contagens e escopos (671 × 570)

**Comprovado por SQL (2026-11-06):**

| Métrica                                         |   Valor | Escopo                                              |
| ----------------------------------------------- | ------: | --------------------------------------------------- |
| `pg_policies` total                             | **683** | todos os schemas                                    |
| `pg_policies` `public`                          | **671** | schema `public`                                     |
| `pg_policies` `storage`                         |  **12** | schema `storage`                                    |
| Tabelas `public`, `relkind='r'`, RLS `true`     | **229** | todas as tabelas base públicas com RLS habilitado   |
| Tabelas `public`, RLS `false`                   |   **0** | —                                                   |
| Policies `public` citando `is_tenant_member`    | **569** | `qual`/`with_check` contém `is_tenant_member`       |
| Policies `public` citando `user_has_permission` | **353** | `qual`/`with_check` contém `user_has_permission`    |
| Policies `public` citando qualquer helper       | **570** | união (`is_tenant_member` OU `user_has_permission`) |
| Tabelas distintas com qualquer helper           | **207** | —                                                   |
| Tabelas distintas com `is_tenant_member`        | **207** | —                                                   |
| Tabelas distintas com `user_has_permission`     | **164** | —                                                   |

**Conclusão (Inferido, sustentado por SQL):** **671** e **570 não são conflitantes**. `671` = total de policies em `public`. `570` = subconjunto dessas policies cuja expressão referencia `is_tenant_member` e/ou `user_has_permission`. A diferença (**101 policies públicas**, por subtração) são policies que não referenciam textualmente esses dois helpers em `qual/with_check` (ex.: `service_role`, self-checks, policies baseadas em outros predicados). A contagem total do banco inclui ainda **12** policies de `storage` (`683 = 671 + 12`). Os agregados 02.12 (570/207/569/353) **conferem** com a medição 02.14.

**Pendente:** classificar as 101 policies públicas restantes por padrão (role `service_role`, `anon`/`public`, self, admin master direto, outras funções) para concluir se há caminhos de autorização fora da cadeia helper.

## 02.14.2 — Inventário SQL de Storage e privilégios

### Buckets (`storage.buckets`) — Comprovado por SQL

| name                |    public | file_size_limit | allowed_mime_types (resumo) |
| ------------------- | --------: | --------------: | --------------------------- |
| `avatars`           |      true |            5 MB | jpeg/png/webp               |
| `private-documents` | **false** |           20 MB | jpeg/png/webp/pdf/doc/docx  |
| `public-media`      |      true |           10 MB | jpeg/png/webp/svg/gif       |
| `services-images`   |      true |            5 MB | jpeg/png/webp               |

**`bunker`/`curriculos`:** ausentes nesta listagem — **Comprovado por SQL** (não retornados). Coerente com OBS./REPORTADO 02.7/02.13.

### RLS e grants — Comprovado por SQL

| Objeto            |  RLS | FORCE RLS | Grants (anon, authenticated, postgres, service_role)                                                            |
| ----------------- | ---: | --------: | --------------------------------------------------------------------------------------------------------------- |
| `storage.objects` | true |     false | `anon/auth`: SELECT/INSERT/UPDATE/DELETE; `postgres`/`service_role`: +REFERENCES/TRIGGER/TRUNCATE               |
| `storage.buckets` | true |     false | mesmos padrões de grants amplos (SELECT/INSERT/UPDATE/DELETE para anon/auth; amplos para postgres/service_role) |

**Inferido:** com grants amplos, o controle efetivo depende de policies RLS corretas. Grants sozinhos não provam exposição, mas aumentam a consequência de policy ausente/incorreta.

### Policies — Comprovado por SQL

**`pg_policies` em `storage` (12, todas em `objects`):**

- `avatars` (4): public SELECT; authenticated INSERT/UPDATE/DELETE com `bucket_id='avatars'` e `storage.foldername(name)[1]=auth.uid()::text`.
- `public-media` (4): public SELECT; `service_role` INSERT/UPDATE/DELETE.
- `services-images` (4): public SELECT; authenticated INSERT/UPDATE/DELETE exigem `bucket_id='services-images'` e `auth.uid()` presente em `people`+`tenant_memberships` com `tm.status='active'` (**sem restrição de tenant, sem binding de objeto/owner/path ao tenant da operação**).

**`storage.buckets`: 0 policies** retornadas.  
**`private-documents` em `storage.objects`: 0 policies** retornadas.

**Conclusão (Comprovado por SQL):** `private-documents` é bucket privado com RLS ativo em `storage.objects`, mas **nenhuma policy dedicada em `storage.objects` autoriza SELECT/INSERT/UPDATE/DELETE** para esse bucket. `storage.buckets` tem RLS ativo, grants amplos para anon/authenticated e **nenhuma policy**. Isso confirma as lacunas estruturais; **não comprova** sozinho todos os caminhos de acesso (ex.: `service_role`, SQL owner contexts, APIs/fluxos específicos), portanto o risco deve ser tratado como **P0 crítico pendente de prova controlada de acesso efetivo**, não como exploit demonstrado.

## 02.14.3 — Mapeamento de funções, corpos e dependências

### Metadados e EXECUTE — Comprovado por SQL

| Função                                     | Security |     Vol. | EXECUTE (grants efetivos observados)                          | Nota                                                      |
| ------------------------------------------ | -------: | -------: | ------------------------------------------------------------- | --------------------------------------------------------- |
| `is_tenant_member(uuid)`                   |  DEFINER |   stable | `PUBLIC`, `authenticated`, `postgres`, `service_role`         | Base de 569/207 policies/tabelas (02.14.1).               |
| `user_has_permission(uuid,text,text,uuid)` |  DEFINER |   stable | `authenticated`, `postgres`, `service_role`                   | 353 policies/164 tabelas.                                 |
| `current_person_id()`                      |  INVOKER |   stable | `PUBLIC`, `anon`, `authenticated`, `postgres`, `service_role` | Retorna `people.id` de `auth.uid()` (corpo abaixo).       |
| `resolve_page_template(text,uuid,uuid)`    |  INVOKER |   stable | `PUBLIC`, `anon`, `authenticated`, `postgres`, `service_role` | Corpo monta PII de `people`/`tenants` (abaixo).           |
| `register_company_interest(...)`           |  DEFINER | volatile | `anon`, `authenticated`, `postgres`, `service_role`           | Intake público; antiabuso/tenant fixo observados em 02.9. |
| `set_primary_media(...)`                   |  DEFINER | volatile | `postgres`, `service_role`                                    | Restrito.                                                 |
| `is_admin_master` (2 assinaturas)          |  DEFINER |   stable | authenticated/postgres/service_role                           | —                                                         |
| `can_manage_role_assignment` (2)           |  DEFINER |   stable | authenticated/postgres/service_role                           | —                                                         |

### Corpos críticos — Comprovado por SQL

- **`current_person_id()`**: `select p.id from public.people p where p.auth_user_id = (select auth.uid()) limit 1` (`SECURITY INVOKER`, `search_path` restrito). **Inferido:** sem `auth.uid()`/vínculo, tende a retornar nulo; EXECUTE público amplia superfície desnecessária, mas o retorno é limitado ao próprio contexto de sessão.
- **`resolve_page_template(p_key,p_person_id,p_tenant_id)`**: lê `page_templates` por `key` ativo; se `p_person_id` informado, busca `public.people` e inclui em `vars.person`/`vars.user` os campos `id, full_name, email, phone, document`; se `p_tenant_id`, inclui dados de `tenants`; retorna `vars`, `raw`, `resolved`, `missing`. **Comprovado por SQL:** função pode compor/retornar PII de `people` quando chamada com `p_person_id`. **Pendente:** confirmar RLS de `people` sob `SECURITY INVOKER` para `anon/authenticated`, existência de chaves/templates sensíveis e vetores reais de chamada; classificar como **risco de exposição PII condicionado** até prova controlada.

### Dependências — Comprovado por SQL / Pendente

- **Triggers `information_schema.triggers` com `action_statement` citando helpers:** 0 linhas (query 02.14.3). Coerente com 02.12. **Pendente:** triggers/funções executadas indiretamente por corpos plpgsql fora do texto simples inspecionado.
- **`pg_depend` (função→função) para helpers:** 0 linhas (query retornou vazia). **Inferido:** pode haver dependências dinâmicas/textuais ou limitações de detecção; não prova ausência.
- **Chamadores textuais em `pg_get_functiondef`:** consulta com varredura ampla retornou erro interno do runner (`array_agg` é função agregada) em 2 tentativas; **Pendente** refazer por abordagem segmentada (lista de funções alvo, `pg_proc` por schema, ou `psql` read-only autorizado). Não reexecutado com `--debug` nesta sessão para evitar ruído; evidência de falha registrada.
- **Uso de helpers em funções reportadas (public):** `can_read_person` usa `user_has_permission`; `emit_domain_event`, `financial_reversal`, `fiscal_cancel_invoice`, `fiscal_emit_invoice`, `match_candidates_to_demand` usam `is_tenant_member` + `user_has_permission`; `sync_application_context` usa `user_has_permission`. **Comprovado por SQL** (flags por corpo). **Inferido:** mudanças semânticas nos helpers afetam domínios fiscal/financeiro/eventos/matching/aplicações, além de RLS.
- **`resolve_page_template` chamadores via `pg_depend`:** não detectados; varredura textual ampla pendente pelo erro acima.

## 02.14.4 — Correlação com matriz 02.13.1

| Caso 02.13.1                             | Status 02.14                                   | Evidência                                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RLS-001 a RLS-010 (blast radius helpers) | **Parcialmente suportado por SQL estrutural**  | Contagens 570/207/569/353 comprovadas; 101 policies públicas sem helper textual pendentes de classificação; testes positivos/negativos por papel/tenant/unidade/cidade **PENDENTE** (prova controlada). |
| ST-001 (private-documents 0 policies)    | **Comprovado (lacuna) / efetividade pendente** | `storage.objects` RLS true, grants amplos, 0 policies; bucket privado existe.                                                                                                                           |
| ST-003 (services-images cross-tenant)    | **Comprovado (predicado)**                     | Policy permite qualquer membership ativa, sem tenant/path/owner.                                                                                                                                        |
| ST-004/ST-005 (public-media/avatars)     | **Comprovado por SQL**                         | Policies coerentes com descrição 02.9/02.13; visibilidade de negócio ainda **Observado**.                                                                                                               |
| ST-006 (storage.buckets 0 policies)      | **Comprovado (lacuna)**                        | RLS true, grants amplos, 0 policies.                                                                                                                                                                    |
| EF/VW/IN/LGPD/NAV                        | **Mantidos como Observado/Pendente**           | 02.14 não reprovou Edge, views, intake, LGPD e navegação por execução funcional; evidências 02.1–02.13 permanecem válidas.                                                                              |
| Funções com EXECUTE amplo                | **Comprovado por SQL**                         | `is_tenant_member`/`current_person_id`/`resolve_page_template` PUBLIC; `resolve_page_template` retorna PII condicionado.                                                                                |

## 02.14.5 — Parecer técnico individual por P0 (sem correção)

### P0-A — `private-documents` sem policy dedicada em `storage.objects` (Bunker sensíveis)

- **Diagnóstico:** bucket privado existe; RLS ativo; grants amplos; **0 policies** em `storage.objects` para acesso dedicado. Lacuna estrutural confirmada.
- **Impacto potencial:** alta sensibilidade (currículos/documentos); risco de negação funcional ou de dependência de caminhos privilegiados; efetividade de acesso por anon/authenticated **não comprovada**.
- **Dependências:** contrato de path/ownership/tenant, `candidate_documents`/`media_assets`, Edge/service role, intake candidatos.
- **Critério de liberação:** matriz ST/LGPD aprovada; path tenant-safe; signed URL curta; testes anon/tenant A/B/unidade/sem permissão; auditoria; rollback.
- **Parecer:** **manter P0 aberto**. Não implementar correção automática. Próximo passo documental: desenho de modelo de acesso Bunker + inventário controlado de objetos/referências.

### P0-B — `services-images` escrita cross-tenant por membership ativa

- **Diagnóstico:** predicado SQL permite INSERT/UPDATE/DELETE a qualquer authenticated com membership ativa em qualquer tenant, sem binding ao tenant do objeto/path.
- **Impacto potencial:** adulteração/exclusão cross-tenant de assets públicos de serviços.
- **Dependências:** convenção de path, writers UI/Edge, catálogo de serviços, possível migração para `public-media`/media central.
- **Critério de liberação:** tenant A não altera B; writes legítimos preservados; compatibilidade `js-empregos`; testes ST-003.
- **Parecer:** **manter P0 aberto**. Correção exige autorização específica de Storage policy/código; tratar antes de endurecimentos cosméticos.

### P0-C — Contratos `consents`/`candidate_documents`/currículos incompatíveis

- **Diagnóstico:** Observado 02.7/02.11 (drift de colunas/tipos, bucket `curriculos` ausente, erro LGPD engolido). 02.14 não revalidou DDL/DML; evidência documental permanece.
- **Impacto:** falha funcional/LGPD/multi-tenant no intake de candidatos.
- **Dependências:** `people`/tenant, purpose/term, Bunker (P0-A), antiabuso, intake controlado.
- **Critério de liberação:** consentimento persistido ou falha bloqueante; metadados canônicos; bucket/path privado seguro; testes LGPD/E2E.
- **Parecer:** **manter P0 aberto**. Bloqueado parcialmente por P0-A e decisão de intake/identidade.

### P0-D — Views públicas sem isolamento tenant/site

- **Diagnóstico:** Observado 02.7/02.12 (`public_jobs_v1`/`public_companies_by_type` sem filtro tenant; `public_services_v1` fixo `js-empregos`; grants amplos; `security_invoker=true`). 02.14 confirmou flags de views/RLS de view (sem RLS de tabela em view) mas não reexecutou SQL das definições/grants completos.
- **Impacto:** vazamento cross-tenant ou acoplamento a `js-empregos`.
- **Dependências:** resolução host→tenant/site, compatibilidade portal atual.
- **Critério de liberação:** host A ≠ dados B; `js-empregos` inalterado; grants mínimos; testes VW.
- **Parecer:** **manter P0 aberto**. Priorizar após/junto com resolução canônica de tenant público.

### P0-E — Intake público sem destino controlado/antiabuso/consentimento auditável

- **Diagnóstico:** Observado 02.4/02.9 (localStorage/WhatsApp/sem persistência; Turnstile cobertura incompleta; `register_company_interest` sem Turnstile/rate limit no contrato, tenant fixo).
- **Impacto:** perda de trilha, abuso, risco LGPD e operacional.
- **Dependências:** modelo intake/tenant_sites/domains (PROPOSTO 02.6), Edge/RPC, consentimento, antiabuso.
- **Critério de liberação:** submissão vira registro controlado ou falha segura; auditoria; tenant/site resolvidos.
- **Parecer:** **manter P0 aberto**. Exige decisão de contrato antes de implementação.

### P0-F — Mídia/admin e contexto tenant inconsistente

- **Diagnóstico:** Observado 02.8 (deploy `media-upload` v2, `turnstile-siteverify` v6, **`media-admin` ausente**), código local com `MidiaContext tenantId=''` e `useMediaUpload` sem `tenant_id`.
- **Impacto:** admin quebrado/ambíguo, risco de consulta/operação fora do tenant correto.
- **Dependências:** contrato Edge único, RBAC/entity/purpose, decisão `modules/media` vs `midia`, dispatcher.
- **Critério de liberação:** tenant explícito validado server-side; contrato único testado; trilha canônica.
- **Parecer:** **manter P0/P1 aberto**. Não deployar nem alterar Edge sem autorização.

## Riscos transversais (prioridade antes de tocar helpers RBAC)

1. **Blast radius helper:** 570 policies/207 tabelas dependem de `is_tenant_member`/`user_has_permission`; funções fiscais/financeiras/eventos/matching/aplicações também os usam (Comprovado por SQL). Qualquer `REVOKE`/mudança semântica exige 02.13.1 executada como prova controlada.
2. **PII condicionado:** `resolve_page_template` tem EXECUTE público e retorna email/telefone/documento de `people` quando recebe `p_person_id` (Comprovado por SQL). Tratar como P1/P2 de endurecimento com prova controlada, sem revogar cegamente.
3. **Storage buckets sem policies:** risco estrutural; depende de comportamento efetivo da API/RLS. Provar antes de endurecer.

## Pendências objetivas para fechar 02.14

1. Refazer varredura de corpos `pg_proc` (segmentada) para chamadores textuais de `is_tenant_member`/`user_has_permission`/`current_person_id`/`resolve_page_template` (erro do runner registrado).
2. Classificar as 101 policies `public` sem referência textual aos dois helpers.
3. Provas controladas autorizadas: acesso efetivo a `storage.buckets`/`private-documents` por papéis; chamada de `resolve_page_template` por `anon/authenticated`; isolamento cross-tenant em `services-images`.
4. Revalidar definições/grants completos das views públicas e deploy/assinatura das Edge functions (read-only/admin autorizado).

## Estado final 02.14

- Entrega: investigação, reconciliação e pareceres **documentais**.
- P0: **todos abertos, sem liberação**.
- Nenhuma correção incorporada; nenhuma alteração remota/código/config/Git.
