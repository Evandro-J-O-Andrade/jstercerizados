# P0-B `services-images` — Plano de Testes Controlados (ST-003/ST-004/ST-006 + regressão)

**Escopo:** validar correção proposta para P0-B (remover I/U/D `authenticated` cross-tenant em `storage.objects` bucket `services-images`; preservar leitura pública se decidido). **Preparação apenas** — nenhum teste executado remotamente nesta etapa; nenhuma migration aplicada; sem commit/push/deploy.  
**Baseline:** `main@b9de729`. **Evidência do defeito:** `supabase/migrations/20260830001100_storage_services_images.sql` (I/U/D autenticado exige apenas membership ativa em _qualquer_ tenant). **SQL remoto 02.14:** bucket `services-images` public, 4 policies; I/U/D sem binding tenant/path/owner/entidade/permissão. **Uso local conhecido:** nenhum consumidor app/Edge escreve no bucket (imagens de serviço via URLs estáticas/colunas `card_image_url`/`hero_image_url`).

## Decisão pendente (confirmar antes da aplicação)

- **ST-004 (leitura pública):** manter `services_images_public_read` para `SELECT`? (recomendado para compatibilidade de URLs históricas; não afeta a correção de escrita). Se não mantida, atualizar teste esperado.

## Pré-condições (ambiente autorizado, controlado)

- Tenant A e Tenant B distintos, com memberships ativas para usuários de teste. Usuário U1 = membro ativo tenant A; U2 = membro ativo tenant B; U3 = autenticado sem membership ativa; U0 = anônimo. (Mapear ST-003b/c/d conforme identidades reais disponíveis.)
- Identificar um objeto existente em `services-images` (somente leitura/listagem autorizada) para testes UPDATE/DELETE; **não criar lixo de produção**. Se inexistente, registrar e limitar a INSERT denial.
- Registrar IDs/paths usados, horários e respostas (HTTP/status, erro RLS/Storage, corpo) sem expor segredos.
- Executar via cliente Supabase Storage API (authenticated/anon) e/ou prova SQL/storage admin **somente com autorização explícita separada**.

## Matriz de testes

| ID             | Cenário                                                                             | Ator/contexto                            | Ação                                                                                       | Resultado esperado (pós-correção fase 1)                                                                                                           | Evidência                                                         |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **ST-003a**    | Anônimo tenta inserir                                                               | U0 (anon)                                | `INSERT`/upload em `services-images` path de teste controlado                              | **Negado** (RLS/policy)                                                                                                                            | status/erro, nenhuma criação                                      |
| **ST-003b**    | Autenticado sem membership ativa                                                    | U3                                       | `INSERT`                                                                                   | **Negado**                                                                                                                                         | status/erro                                                       |
| **ST-003c**    | Membership ativa em outro tenant (tentativa cross-tenant)                           | U2 (tenant B), path/objeto associado a A | `INSERT`/`UPDATE`/`DELETE` conforme aplicável                                              | **Negado** (nenhuma escrita authenticated direta)                                                                                                  | status/erro                                                       |
| **ST-003d**    | Membership ativa sem autorização específica (mesmo tenant, sem contrato de escrita) | U1 (tenant A)                            | `INSERT`/`UPDATE`/`DELETE`                                                                 | **Negado** na fase 1 (escrita authenticated removida)                                                                                              | status/erro                                                       |
| **ST-003e**    | Atualizar objeto existente                                                          | U1/U2 autenticados                       | `UPDATE`/overwrite objeto existente                                                        | **Negado**                                                                                                                                         | objeto inalterado (ETag/hash/metadata antes/depois se autorizado) |
| **ST-003f**    | Excluir objeto existente                                                            | U1/U2 autenticados                       | `DELETE` objeto existente                                                                  | **Negado**                                                                                                                                         | objeto permanece                                                  |
| **ST-004**     | Leitura pública de imagem existente                                                 | U0 (anon) e/ou authenticated             | `SELECT`/GET público de objeto existente                                                   | **Permitido** se decisão for manter `SELECT` público; caso contrário **Negado** conforme decisão                                                   | URL/GET 200 ou 403, imagem renderiza                              |
| **ST-006**     | Estado bucket/policies (read-only)                                                  | operador autorizado                      | Consultar `storage.buckets`, `pg_policies storage.objects` para `services_images%`, grants | Bucket `services-images` presente; `public` conforme decisão; somente `services_images_public_read` (SELECT) após correção; grants/RLS registrados | saída SQL read-only                                               |
| **REG-JS-IMG** | Regressão exibição serviços `js-empregos`                                           | usuário/anon conforme portal             | Abrir páginas de serviços/listagens que usam `card_image_url`/`hero_image_url`             | Imagens estáticas/URLs existentes continuam exibindo; sem dependência de escrita no bucket legado                                                  | screenshots/logs, rotas testadas                                  |
| **REG-MEDIA**  | Fluxo mídia atual não usa bucket legado                                             | revisão + teste autorizado               | Upload de serviço/mídia pelo fluxo atual (se aplicável)                                    | Usa `public-media`/contrato autorizado; **não** grava em `services-images`                                                                         | request/bucket alvo observado                                     |

## Verificação read-only (NÃO executar sem autorização)

```sql
-- Estado pós-correção esperado (fase 1)
select id,name,public,file_size_limit,allowed_mime_types from storage.buckets where id='services-images';
select policyname,permissive,roles,cmd,qual,with_check
from pg_policies
where schemaname='storage' and tablename='objects' and policyname like 'services_images%'
order by policyname;
-- Esperado: 1 policy = services_images_public_read, cmd=SELECT, roles={public}, qual bucket_id='services-images'.
```

## Script de teste (pseudo/procedimento; adaptar ao harness autorizado)

```text
Para cada ator U0,U1,U2,U3 e cada operação (upload INSERT, overwrite UPDATE, remove DELETE) no bucket services-images:
  - usar path controlado: _p0b_test/<run-id>/probe.png OU objeto existente só para UPDATE/DELETE com autorização
  - esperar: DENIED (403/RLS/policy error)
  - confirmar ausência de efeito colateral
Para ST-004: GET/SELECT de objeto público conhecido -> 200/bytes (se leitura mantida)
Para REG-JS-IMG: validar páginas públicas de serviços no tenant js-empregos
```

## Critérios de aceite P0-B (fase 1)

1. ST-003a–f: **todos negados** para escrita authenticated/anon no bucket legado.
2. ST-004: comportamento de leitura conforme decisão explícita (documentar).
3. ST-006: somente policy `services_images_public_read` (SELECT) permanece para o bucket, salvo decisão contrária.
4. REG-JS-IMG: sem regressão visível em imagens de serviços existentes.
5. Nenhuma alteração remota executada sem autorização separada; evidências registradas.

## Rollback (somente autorização emergencial)

Restaurar `services_images_authenticated_write/update/delete` conforme `supabase/migrations/20260830001100_storage_services_images.sql`, registrar incidente e plano corretivo. **Não apagar dados/objetos.**
