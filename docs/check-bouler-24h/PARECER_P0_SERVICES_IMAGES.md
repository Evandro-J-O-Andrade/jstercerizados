# PARECER P0 — `services-images` (Storage): escrita cross-tenant por membership ativa

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H)  
**P0 ref.:** P0-B (Stage 02.14) / 01.2, ST-003 (Stage 02.13)  
**Data:** 2026-11-06  
**Status do parecer:** **Documental, não liberado para implementação**. P0 permanece **aberto**.  
**Base:** `main@b9de729`; `STAGE02_14_RECONCILIACAO_EVIDENCIAS_E_PARECERES_P0.md` (02.14.2, 02.14.4, 02.14.5 P0-B); `STAGE02_13_MATRIZ_REGRESSAO_E_INVENTARIO_COMPLEMENTAR.md` (ST-003, ST-004, 02.13.4); `STAGE02_MATRIZ_PAGINA_SECAO_DADOS.md` (02.7/02.9).  
**Limites:** docs-only. **Sem** SQL remoto adicional, DDL/DML, `GRANT/REVOKE`, migrations, alteração de policies/RLS/Storage, Edge deploy, código funcional, commit, push ou deploy.

## 1. Evidências confirmadas e escopo do problema

| #   | Evidência                                                                                                                                                                                                                                                                                              | Classificação                                                                            | Fonte                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| E1  | Bucket `services-images`: `public=true`, `file_size_limit` 5 MB, MIME `image/jpeg,image/png,image/webp`.                                                                                                                                                                                               | **Comprovado por SQL** (02.14.2)                                                         | `storage.buckets`                                    |
| E2  | `storage.objects` tem RLS ativo (`relrowsecurity=true`, `relforcerowsecurity=false`) e grants amplos incluindo `anon/authenticated` SELECT/INSERT/UPDATE/DELETE.                                                                                                                                       | **Comprovado por SQL** (02.14.2)                                                         | `pg_class`, `information_schema.role_table_grants`   |
| E3  | Existem **4 policies** para `services-images` em `storage.objects` (total 12 no schema `storage`, todas em `objects`).                                                                                                                                                                                 | **Comprovado por SQL** (02.14.2)                                                         | `pg_policies`                                        |
| E4  | `services_images_public_read` (`SELECT`, roles `{public}`): `qual = bucket_id='services-images'`.                                                                                                                                                                                                      | **Comprovado por SQL**                                                                   | `pg_policies`                                        |
| E5  | `services_images_authenticated_write` (`INSERT`, `{authenticated}`): `with_check = (bucket_id='services-images') AND (auth.uid() IN (SELECT p.auth_user_id FROM people p JOIN tenant_memberships tm ON tm.person_id=p.id WHERE tm.status='active'))`.                                                  | **Comprovado por SQL**                                                                   | `pg_policies`                                        |
| E6  | `services_images_authenticated_update` (`UPDATE`, `{authenticated}`): `qual` usa o **mesmo predicado** de membership ativa (sem `with_check` retornado na coleta 02.14.2).                                                                                                                             | **Comprovado por SQL** (predicado `qual`) / **Pendente** confirmar `with_check` completo | `pg_policies`                                        |
| E7  | `services_images_authenticated_delete` (`DELETE`, `{authenticated}`): `qual` usa o **mesmo predicado** de membership ativa.                                                                                                                                                                            | **Comprovado por SQL**                                                                   | `pg_policies`                                        |
| E8  | O predicado de escrita/alteração/exclusão **não** restringe `tenant_id`, **não** verifica que o objeto pertence ao tenant do ator, **não** exige binding de `owner`/`path`/`entity` ao tenant, e **não** exige permissão `resource.action` específica além da existência de “alguma membership ativa”. | **Comprovado por SQL** (ausência no predicado)                                           | E5–E7                                                |
| E9  | `storage.buckets` tem RLS ativo e grants amplos, mas **0 policies** (lacuna transversal).                                                                                                                                                                                                              | **Comprovado por SQL** (02.14.2)                                                         | `pg_policies`, `storage.buckets`                     |
| E10 | Escritores, convenções de path, formato de nome de objeto, UI/Edge/repos que usam `services-images` e inventário de objetos existentes.                                                                                                                                                                | **Pendente**                                                                             | Requer busca de código/inventário Storage autorizado |

**Escopo do problema:** operações **INSERT/UPDATE/DELETE** no bucket `services-images` por qualquer usuário `authenticated` que possua **ao menos uma** `tenant_memberships` ativa, independentemente de qual tenant é dono lógico do asset de serviço. **SELECT público** é comportamento distinto (bucket público) e não é, por si, o defeito de isolamento deste P0.

## 2. Política atual e comportamento de acesso identificado

### 2.1 Matriz efetiva (estado atual)

| Operação | Papel/condição                                                       | Policy                                 | Efeito esperado pelo predicado                   | Classificação                                                               |
| -------- | -------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| SELECT   | `public`                                                             | `services_images_public_read`          | Leitura pública de objetos do bucket             | **Comprovado por SQL**                                                      |
| INSERT   | `authenticated` + `EXISTS` pessoa/membership ativa (qualquer tenant) | `services_images_authenticated_write`  | Escrita permitida se predicado verdadeiro        | **Comprovado por SQL**                                                      |
| UPDATE   | `authenticated` + membership ativa (qualquer tenant)                 | `services_images_authenticated_update` | Alteração permitida se predicado verdadeiro      | **Comprovado por SQL**                                                      |
| DELETE   | `authenticated` + membership ativa (qualquer tenant)                 | `services_images_authenticated_delete` | Exclusão permitida se predicado verdadeiro       | **Comprovado por SQL**                                                      |
| I/U/D    | `anon`                                                               | —                                      | Sem policy correspondente; RLS deve negar        | **Inferido** (depende da avaliação RLS/policies; prova controlada pendente) |
| I/U/D    | `authenticated` sem membership ativa                                 | —                                      | Predicado tende a falhar                         | **Inferido** / **Pendente** prova                                           |
| I/U/D    | `service_role` / caminhos privilegiados                              | contexto server-side                   | Pode contornar RLS conforme arquitetura Supabase | **Observado** (característica da plataforma) — validar caminhos reais       |

### 2.2 Defeito de autorização

O controle atual modela “usuário autenticado pertence a algum tenant ativo”, mas o recurso protegido é um **asset que pode pertencer a um tenant/domínio de serviço específico**. Falta o vínculo:

```text
ator autenticado → people → membership ativa NO TENANT DO RECURSO → permissão explícita (services/media/catalog.write) → path/objeto pertencente ao mesmo tenant
```

Hoje: `membership ativa em qualquer tenant` satisfaz o predicado, o que é insuficiente para isolamento multi-tenant.

## 3. Cenários de exploração e impacto entre tenants

> Cenários abaixo são **hipóteses de abuso baseadas no predicado SQL comprovado**. Não houve prova controlada de exploração nesta etapa (**Pendente**).

| ID  | Cenário                                         | Pré-condição                                                                           | Ação hipotética                                                  | Impacto                                                | Severidade                  |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | --------------------------- |
| C1  | Substituição cross-tenant                       | Usuário A ativo no tenant A conhece/cria colisão de path de objeto usado pelo tenant B | `UPDATE`/upload substitui imagem de serviço de B                 | Defacement, fraude visual, conteúdo indevido no portal | Alta                        |
| C2  | Exclusão cross-tenant                           | Usuário A ativo em qualquer tenant                                                     | `DELETE` de objeto referenciado por catálogo/portal de B         | Quebra de imagens, degradação de serviço público       | Alta                        |
| C3  | Upload indevido cross-tenant                    | Usuário A ativo                                                                        | `INSERT` em path que conflita com convenção de B ou polui bucket | Colisão, confusão operacional, custo/ruído             | Média/Alta                  |
| C4  | Persistência por convenção fraca                | Paths previsíveis/sem namespace tenant                                                 | Facilita C1–C3                                                   | Amplifica impacto                                      | Média                       |
| C5  | Escritor legítimo quebrado por correção ingênua | Correção restringe sem mapear writers                                                  | Admin legítimo perde capacidade de publicar imagens              | Regressão funcional                                    | Média (risco de remediação) |

**Impacto entre tenants:** violação de isolamento lógico em operação de escrita no Storage; potencial impacto em integridade/disponibilidade de assets públicos e na confiança do portal multi-tenant. **Confidencialidade** é menor neste bucket porque ele é `public` para SELECT (E1/E4), mas escrita não autorizada continua crítica.

## 4. Correção proposta (não executar sem autorização)

Objetivo: **menor privilégio + isolamento por tenant + compatibilidade controlada + auditabilidade**.

### 4.1 Decisões prévias obrigatórias (Pendente)

1. Inventariar writers reais: UI, serviços, hooks, repos, Edge (`media-upload`/outros), scripts, uso de `service_role`.
2. Inventariar objetos e convenção de path atual (`services-images/*`).
3. Definir fonte de verdade do tenant do asset: coluna/catálogo (`media_assets`, tabela de serviços, metadata) ou namespace de path canônico.
4. Decidir estratégia: (A) endurecer `services-images` com tenant binding; (B) migrar gradualmente para `public-media`/contrato central de mídia; (C) híbrido com compatibilidade temporária. **Sem apagar/mover prematuramente.**

### 4.2 Modelo alvo recomendado (Proposto)

- **Leitura pública:** manter SELECT público apenas se o negócio exigir assets públicos de serviço; caso contrário, restringir.
- **Escrita autenticada direta:** evitar para usuários finais; preferir **Edge Function/serviço autorizado** com `service_role` após validar: identidade, tenant do contexto, membership no tenant alvo, permissão `resource.action` (ex.: `services.media.create/update/delete` ou equivalente canônico), entidade/serviço alvo, MIME/tamanho/magic bytes, path seguro.
- **Se mantida escrita autenticada via RLS (alternativa):** policy deve exigir, no mínimo:
  - `bucket_id='services-images'`;
  - `auth.uid()` vinculado a `people`;
  - membership **ativa no tenant dono do recurso** (não qualquer tenant);
  - permissão explícita aplicável (via `user_has_permission`/mecanismo canônico), respeitando blast radius Stage 02.14;
  - convenção de path com tenant namespace (ex.: `tenants/{tenant_id}/services/{service_id|slug}/...`) ou verificação contra registro canônico.
- **UPDATE:** incluir `USING` e `WITH CHECK` coerentes para impedir mover objeto para tenant/path não autorizado.
- **DELETE:** restringir ao tenant dono + permissão.
- **Catalogação:** registrar metadados em contrato canônico (ex.: `media_assets`/catálogo aprovado) com `tenant_id`, entidade, path, hash/tamanho/MIME, ator, auditoria.

### 4.3 SQL ilustrativo (NÃO executar; requer revisão/autorização)

```sql
-- EXEMPLO CONCEITUAL — NÃO APLICAR SEM REVISÃO, TESTES E AUTORIZAÇÃO
-- Pré-requisitos: convenção path tenant/{tenant_uuid}/... OU função canônica de ownership.

-- DROP POLICY IF EXISTS services_images_authenticated_write ON storage.objects;
-- CREATE POLICY services_images_authenticated_write ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (
--   bucket_id = 'services-images'
--   AND (storage.foldername(name))[1] = 'tenants'
--   AND (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
--   AND public.is_tenant_member(((storage.foldername(name))[2])::uuid)
--   AND public.user_has_permission(auth.uid(), 'services', 'update', ((storage.foldername(name))[2])::uuid)
-- );

-- UPDATE/DELETE exigem USING/WITH CHECK equivalentes; validar semântica de permissões e compatibilidade com writers legados.
```

**Riscos da correção proposta:** dependência de helpers RBAC (blast radius 570 policies — 02.14.1); paths legados fora do padrão; `user_has_permission`/papéis podem não cobrir o caso exato; writers via `service_role` podem mascarar falhas de RLS.

## 5. Testes de segurança e regressão (matriz 02.13.1)

| Caso          | Objetivo                                              | Pré-condição                                                     | Ação                                                               | Resultado esperado                                               | Evidência exigida                        |
| ------------- | ----------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| **ST-003a**   | Bloquear write cross-tenant                           | Authenticated membro ativo tenant A; objeto/path lógico tenant B | `INSERT` em `services-images` com namespace/path de B              | **Negado**                                                       | Resposta API + ausência de objeto/versão |
| **ST-003b**   | Bloquear update cross-tenant                          | Idem                                                             | `UPDATE` objeto de B                                               | **Negado**                                                       | Antes/depois idêntico                    |
| **ST-003c**   | Bloquear delete cross-tenant                          | Idem                                                             | `DELETE` objeto de B                                               | **Negado**                                                       | Objeto permanece                         |
| **ST-003d**   | Permitir operação legítima                            | Authenticated tenant A com permissão canônica; path tenant A     | `INSERT/UPDATE/DELETE` em recurso A                                | **Permitido**                                                    | Operação concluída + auditoria           |
| **ST-003e**   | Anon não escreve                                      | Sem sessão                                                       | `INSERT/UPDATE/DELETE`                                             | **Negado**                                                       | Erro RLS/auth                            |
| **ST-003f**   | Authenticated sem permissão/membership no tenant alvo | Sem membership/permissão no tenant do path                       | I/U/D                                                              | **Negado**                                                       | Erro                                     |
| **ST-004**    | Leitura pública preservada (se intencional)           | Anon                                                             | `SELECT`/GET público                                               | Conforme política de negócio                                     | GET autorizado/negado conforme decisão   |
| **ST-006**    | `storage.buckets` sem regressão                       | anon/authenticated                                               | Listar/alterar metadados de buckets                                | Negado conforme política alvo; **Pendente** estado efetivo atual | Prova controlada autorizada              |
| **RLS-R1**    | Não regredir helpers RBAC                             | Matriz 02.13.1 domínios sensíveis                                | Operações que dependem de `is_tenant_member`/`user_has_permission` | Sem regressão                                                    | Amostra aprovada                         |
| **COMPAT-JS** | Compatibilidade `js-empregos`                         | Tenant/portal atual                                              | Fluxos de imagem de serviço existentes                             | Inalterados ou migrados com plano                                | Teste E2E autorizado                     |

## 6. Critérios de aceite, rollback e autorização necessária

### Critérios de aceite

1. Tenant A **não** consegue `INSERT/UPDATE/DELETE` em asset de tenant B (ST-003a–c) — prova controlada.
2. Usuário autorizado do tenant A mantém operação legítima (ST-003d).
3. Leitura pública segue decisão de negócio documentada (ST-004).
4. Paths legados tratados: migração, compatibilidade temporária ou recusa explícita documentada.
5. Nenhuma regressão aprovada em fluxos `js-empregos` e células consumidoras.
6. Auditoria/trilha para operações administrativas de mídia quando aplicável.
7. Evidência antes/depois (policy SQL, testes, inventário afetado).

### Rollback (Proposto)

- Manter script de reversão da policy/migration em revisão **antes** da aplicação.
- Em migração de paths/objetos: **não deletar origem** antes de verificação dupla (hash/contagem/referências).
- Se writers legítimos falharem: rollback de policy para estado anterior **somente com autorização emergencial documentada**, abrindo incidente P0 e plano corretivo.

### Autorização necessária (separada por ato)

| Ato                                   | Autorização                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Consultas/inventário Storage e código | Leitura já autorizada; inventário de objetos/dados pode exigir janela controlada |
| Migration/policy `storage.objects`    | **Explícita** (Supabase remoto/RLS/Storage)                                      |
| Ajuste de código/UI/repos/writers     | **Explícita**                                                                    |
| Ajuste de Edge functions              | **Explícita**                                                                    |
| Commit/push/deploy                    | **Explícita** por etapa                                                          |

## 7. Pendências que ainda dependem de comprovação

1. **ST-006 efetivo:** provar comportamento real de `storage.buckets` sob RLS sem policies para `anon/authenticated` (risco estrutural comprovado, exposição efetiva não).
2. **UPDATE `with_check`:** confirmar definição completa de `services_images_authenticated_update` (coleta exibiu `qual`; `with_check` pode existir).
3. **Explorabilidade prática:** prova controlada cross-tenant em ambiente autorizado (não executada).
4. **Writers/paths:** localizar todos os consumidores de `services-images` e convenções reais.
5. **Inventário de objetos:** existência, ownership lógico, referências em catálogo/portal.
6. **Interação com mídia central:** decisão `services-images` vs `public-media`/`bunker`/`media_assets`.
7. **Correlação 101 policies públicas:** concluir 02.14.1/02.13.1 para garantir que endurecimento Storage não mascara gaps paralelos.

---

**Conclusão:** o predicado atual de I/U/D em `services-images` é **insuficiente para isolamento multi-tenant** (Comprovado por SQL). O P0 permanece **aberto**. Correção deve ser faseada, compatível com `js-empregos`, guiada por inventário e autorizada explicitamente antes de qualquer mudança.
