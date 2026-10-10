# Auditoria do módulo de mídia — 2026-10-10

**Repositório:** `Evandro-J-O-Andrade/jstercerizados`  
**Projeto Supabase:** `okxqfyoqbhcmflpurfrw`  
**Escopo:** auditoria de leitura de schema, Storage, RBAC, funções SQL, trigger, Edge Function e resolução de imagens no frontend.  
**Estado operacional:** nenhuma migration, alteração de policy, seed, mudança de código de aplicação ou deploy foi executado durante a auditoria.  
**Git:** relatório e SQL diagnóstico são artefatos de documentação; não constituem autorização para corrigir D1/D2 ou modificar imagens/mapeamentos.

## 1. Resumo executivo

O schema do catálogo de mídia está presente, mas o catálogo e os buckets de Storage estavam vazios no momento das consultas. A constraint `media_assets_entity_type_check` existe e aceita nove tipos. Foram encontradas quatro buckets: `avatars`, `private-documents`, `public-media` e `services-images`.

O RBAC contém 12 permissões de mídia (quatro recursos × três ações) e 24 vínculos encontrados: as 12 permissões vinculadas a `admin_master` e as 12 vinculadas a `tenant_admin`.

As funções `media_for_entity(text, uuid)` e `set_primary_media(text, uuid, uuid)` existem. Foram observadas duas divergências que merecem revisão antes de qualquer alteração: grants amplos de execução em `media_for_entity` (D1) e ausência de validação explícita de associação/tenant na função `set_primary_media`, que é `SECURITY DEFINER` (D2).

A documentação abaixo separa fatos consultados de riscos que ainda precisam de avaliação. Não houve teste de exploração, upload real, teste de RBAC ponta a ponta nem teste E2E com operações de escrita.

## 2. Estado observado no Supabase

### 2.1 Catálogo e constraint

- A constraint `media_assets_entity_type_check` existe.
- Valores permitidos: `service`, `company`, `job`, `blog_post`, `page`, `avatar`, `document`, `candidate_document`, `employee_document`.
- A consulta agrupada de `public.media_assets` retornou zero linhas; contagem total observada: zero assets.
- Como não existem registros, a cobertura de dimensões (`width`/`height`) não pode ser calculada. O critério de mais de 80% dos assets com dimensões permanece **não verificável**, e não deve ser marcado como aprovado.

### 2.2 Buckets

| Bucket | Público | Limite observado | MIME types relevantes |
|---|---:|---:|---|
| `avatars` | Sim | 5 MiB | JPEG, PNG, WebP |
| `private-documents` | Não | 20 MiB | JPEG, PNG, WebP, PDF, DOC, DOCX |
| `public-media` | Sim | 10 MiB | JPEG, PNG, WebP, SVG, GIF |
| `services-images` | Sim | 5 MiB | JPEG, PNG, WebP |

A contagem consultada indicou zero objetos nos quatro buckets. `services-images` foi tratado como bucket legado na baseline fornecida. A existência/configuração dos buckets não comprova que o frontend ou o pipeline de upload já os utiliza em produção.

### 2.3 Policies do Storage

Foram encontradas as 12 policies consultadas:

- `public-media`: uma policy SELECT para `public` e três policies de escrita para `service_role`.
- `avatars`: SELECT para `public`; INSERT/UPDATE/DELETE para `authenticated`.
- `private-documents`: SELECT/INSERT/UPDATE/DELETE para `authenticated`; nenhuma policy de leitura pública encontrada entre as policies consultadas.

As policies de avatars e documentos privados verificadas filtram pelo bucket e pelo papel, mas a definição consultada não evidencia uma checagem por proprietário ou tenant. Isso justifica revisão de autorização por objeto/tenant; não é, isoladamente, prova de exploração. As policies não foram modificadas.

## 3. RBAC de mídia

Foram encontradas estas 12 permissões:

| Recurso | Ações |
|---|---|
| `companies.media` | `read`, `write`, `delete` |
| `partners.media` | `read`, `write`, `delete` |
| `services.media` | `read`, `write`, `delete` |
| `suppliers.media` | `read`, `write`, `delete` |

Os vínculos consultados somam 24: 12 para `admin_master` (escopo `global`) e 12 para `tenant_admin` (escopo `tenant`). Isso confirma o cadastro e os vínculos esperados no banco. Não substitui testes de autorização de cada rota, Edge Function, RPC ou ação de interface.

## 4. Funções SQL

### 4.1 `media_for_entity(text, uuid)`

- Existe; linguagem SQL; owner observado: `postgres`.
- `SECURITY DEFINER = false` — comportamento de invoker, conforme a definição consultada.
- Retorna campos de mídia filtrados por `entity_type` e `entity_id), ordenados por principal, ordem e data de criação.
- Grants de EXECUTE observados: `PUBLIC`, `anon`, `authenticated`, `postgres` e `service_role`.

### D1 — Grants de EXECUTE mais amplos que a baseline

A baseline informada para `03_cms_media.sql` concede EXECUTE a `authenticated` e `service_role`; o estado consultado também mostra `PUBLIC` e `anon` (além de `postgres`). A origem exata do grant adicional não foi determinada nesta auditoria; defaults de privilégios do PostgreSQL são uma hipótese, não uma conclusão.

**Risco/impacto:** o grant permite tentar chamar a função como papel anônimo. Como a função é SECURITY INVOKER, o acesso efetivo também depende de privilégios de tabela e RLS; portanto, não se conclui que qualquer usuário anônimo consiga ler todos os assets. Mesmo assim, o grant diverge da baseline e deve ser reconciliado com a intenção de acesso público antes de se propor correção.

### 4.2 `set_primary_media(text, uuid, uuid)`

- Existe; linguagem PL/pgSQL; owner observado: `postgres`.
- `SECURITY DEFINER = true`.
- Grants de EXECUTE observados: `postgres` e `service_role`.
- A função atualiza `is_primary` nos registros da entidade indicada por `p_entity_type` e `p_entity_id`, definindo como principal o registro cujo `id` corresponde a `p_media_id`.

### D2 — Validação explícita de associação/tenant ausente na função

A definição consultada não valida explicitamente se `p_media_id` pertence à entidade informada, nem verifica `tenant_id`, ownership ou autorização de negócio dentro da própria função. Por ser SECURITY DEFINER, a função executa com os privilégios do owner; o desenho deve ser avaliado considerando o comportamento de RLS e os grants efetivos.

**Impacto demonstrável pela definição:** se o ID da mídia não corresponder a nenhum asset da entidade-alvo, a operação pode definir `is_primary = false` em todos os assets dessa entidade, deixando-a sem mídia principal. Se um chamador autorizado puder fornecer IDs de outra entidade, a função também pode atuar sobre a entidade especificada nos parâmetros. A definição não comprova, sozinha, que usuários não autorizados conseguem invocá-la: os grants observados limitam EXECUTE a `postgres` e `service_role`.

**Risco:** integridade dos dados e dependência da Edge Function como ponto de controle. Antes de alterar a função, verificar todos os chamadores, grants, RLS e invariantes de unicidade de mídia principal.

### D3 — SECURITY INVOKER de `media_for_entity`

O comportamento SECURITY INVOKER corresponde à baseline fornecida. Não é divergência identificada. A segurança final depende dos grants da função e dos privilégios/RLS das tabelas consultadas.

## 5. Triggers

A consulta retornou um trigger de usuário em `public.media_assets`:

- Nome: `update_media_assets_updated_at`
- Função: `update_updated_at()`
- Definição: `BEFORE UPDATE ON public.media_assets`
- Não deferrable.

**Nota sobre a consulta diagnóstica:** a consulta original que alimentou o relatório usava condições `CASE` para os bits de `tgtype` em uma ordem incorreta e exibiu `INSERT` como evento. A definição completa do trigger comprova `BEFORE UPDATE`. A consulta corrigida está incluída no arquivo SQL anexo.

## 6. Edge Function e frontend

Conforme o resultado de leitura informado durante a auditoria, `supabase/functions/media-upload/index.ts` foi revisado e descrito como contendo validação de formato/magic bytes, RBAC, rollback e sincronização de `logo_url`. Esses pontos são registrados como **revisão estática informada**, não como prova de teste dinâmico de upload ou rollback.

O frontend foi informado como centralizado em `src/lib/images/image-resolver.ts`, com `SafeImage`, `src/lib/images/service-image-map.ts`, `src/config/imageFallbacks.ts`, `src/config/images.ts` e `src/content/assets.ts`. O commit `df49684` foi reportado como validado com TypeScript, testes relevantes e build de produção. A auditoria de banco não valida, por si só, a existência de todas as imagens no remoto nem a exibição em produção.

**Regra de preservação das imagens:** esta auditoria não autoriza remover, renomear, substituir ou remapear imagens já referenciadas. A verificação de arquivos de imagem pendentes no Git deve ser um inventário separado, sem alterações automáticas.

## 7. Divergências e plano de correção proposto (não executado)

| ID | Prioridade proposta | Achado | Ação proposta | Pré-condição |
|---|---|---|---|---|
| D1 / R1 | P1 — segurança/acesso | EXECUTE de `media_for_entity` inclui PUBLIC/anon além da baseline | Avaliar e, se a intenção for acesso apenas autenticado/serviço, preparar migration para revogar os grants excedentes e conceder explicitamente aos papéis necessários | Confirmar se a função deve suportar leitura pública; revisar RLS/grants de `media_assets` e todos os consumidores |
| D2 / R2 | P1 — integridade | `set_primary_media` não valida associação do asset à entidade nem tenant na função | Projetar validações de existência, associação entity/media e autorização/tenant; preservar semântica de mídia principal | Inventariar chamadores e grants; definir comportamento esperado para ID inválido e entidade sem mídia |
| D3 / R3 | P2 — documentação | Edge Function é apresentada como caminho autorizado para mutações | Documentar o contrato e adicionar testes garantindo que só o caminho autorizado invoca a função | Confirmar que não existem outros consumidores legítimos; não confiar em documentação como controle de segurança |

**Nenhuma R1–R3 foi executada.** A prioridade é uma proposta de triagem, não autorização de migration. Não foi feita alteração de schema, policy, grant ou função.

## 8. Checklist de validação

| Item | Estado |
|---|---|
| Constraint de entity_type existe e lista nove valores | Confirmado |
| Mais de 80% dos assets têm dimensões | Não verificável: catálogo vazio |
| Buckets e MIME types consultados | Confirmado: 4 buckets; zero objetos |
| Policies de public-media | Compatíveis com o critério consultado |
| private-documents sem policy pública de SELECT | Confirmado entre as policies consultadas |
| RBAC: 12 permissões e 24 vínculos | Confirmado |
| Grants de media_for_entity divergem da baseline | D1 |
| Validação interna de set_primary_media | D2 |
| Trigger de updated_at | Confirmado: BEFORE UPDATE |
| Teste dinâmico de upload/rollback | Não executado nesta auditoria |
| Teste E2E de autorização e frontend | Não executado nesta auditoria |
| Alterações em banco/código durante a auditoria | Nenhuma |

## 9. Consultas de diagnóstico

As 15 consultas somente leitura estão em [`media-diagnostico-sql.sql`](./media-diagnostico-sql.sql). Executá-las individualmente no SQL Editor do projeto correto. Consultas de definição podem retornar detalhes internos do schema; compartilhar resultados apenas com pessoas autorizadas.

## 10. Limitações

1. A auditoria descreve o estado retornado pelas consultas executadas; não é certificação de segurança.
2. O catálogo e Storage vazios impedem validar dimensões, associação real de arquivos e fluxo de upload com dados reais.
3. A origem histórica dos grants excedentes não foi determinada.
4. Não houve tentativa de exploração, alteração de dados, teste de upload ou execução de migrations.
5. R1–R3 exigem validação adicional e autorização específica antes de qualquer execução.

---
**Conclusão:** baseline estrutural majoritariamente conforme, com dois pontos prioritários de revisão (D1 e D2). Preservar o estado atual até decidir e autorizar correções específicas.
