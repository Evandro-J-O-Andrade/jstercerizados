# J&S Empregos 2.0 — Inventário Fase 0 (Media)

**Data:** 31/10/2026  
**Repositório:** `Evandro-J-O-Andrade/jstercerizados`  
**Branch/ref:** `main` — `6866edcfb42abc045577aa714af6cc5c3a12b117`  
**Escopo:** leitura do snapshot GitHub e documentação. Nenhuma alteração no código de produção ou no Supabase foi realizada nesta coleta.

> **Limite:** esta coleta não executou comandos no worktree local. `git status`, `git diff` local e `npm run typecheck` ainda precisam ser confirmados pelo Kilo. Também não foi feita nova consulta ao Supabase remoto nesta fase.

## 1. Git e checkpoint

| Item | Evidência |
|---|---|
| Branch remota | `main` |
| HEAD remoto | `6866edcfb42abc045577aa714af6cc5c3a12b117` |
| Mensagem | `feat: integra células empresas e serviços com dashboards, rotas e estrutura modular` |
| Data | `2026-10-31T09:19:20Z` |
| Parent | `bd576fe0be3ec230906d61218b38067d5d7777ad` |
| Últimos 3 commits | `6866edc`, `bd576fe`, `eb6ae40` |

O checkpoint remoto está alinhado com o SHA informado. Não há evidência nesta coleta para declarar limpo o working tree local nem para afirmar que o typecheck foi executado agora. `package.json` define `typecheck` como `tsc --noEmit`.

## 2. Inventário de `public/images`

**Total no Git tree: 811 arquivos.**

| Pasta raiz | Arquivos | Pasta raiz | Arquivos |
|---|---:|---|---:|
| servicos | 262 | global | 199 |
| services | 56 | hero | 46 |
| home | 37 | sobre | 34 |
| clientes | 17 | parceiros | 17 |
| favicons | 16 | partners | 14 |
| backgrounds | 9 | brand | 9 |
| team | 9 | company | 8 |
| fallbacks | 8 | icons | 8 |
| boasvindas | 6 | clients | 6 |
| contato | 6 | logos | 6 |
| about | 4 | careers | 4 |
| vagas | 4 | candidatos | 3 |
| empresas | 3 | illustrations | 3 |
| placeholders | 3 | candidates | 2 |
| construcao | 2 | contact | 2 |
| suporte | 2 | blog | 1 |
| certificadoSupabase | 1 | gallery | 1 |
| login | 1 | processo-seletivo | 1 |
| trabalhe-conosco | 1 | | |

Famílias sobrepostas:
- `servicos/`: 262
- `services/`: 56
- `parceiros/`: 17
- `partners/`: 14
- `clientes/`: 17
- `clients/`: 6

A comparação de Git blob SHA encontrou **121 grupos de arquivos com conteúdo binário idêntico** nessas seis famílias; **65 grupos atravessam mais de uma pasta**. Isso confirma duplicação exata de conteúdo, mas não autoriza exclusão: os caminhos podem estar sendo consumidos por telas diferentes.

Exemplos confirmados:
- `parceiros/` ↔ `partners/`: `business.svg`, `mistral.webp`, `network.svg`, `partnership.svg`, `parceiro-a.svg` a `parceiro-f.svg`.
- `clientes/` ↔ `clients/`: `alpha.svg`, `beta.svg`, `delta.svg`, `epslon.svg`, `gama.svg`, `zeta.svg`.
- `servicos/` ↔ `services/`: imagens de limpeza, facilities, zeladoria, controle de acesso, hunting, RH e terceirização.

**Não apagar, mover ou renomear imagens na Fase 0.** A futura migração deve cruzar hash, caminho consumido, finalidade e entidade.

## 3. Módulo Media no código

### Célula e rotas
- `src/modules/media/cellContract.ts`
- `src/modules/media/index.ts`
- `src/modules/media/types/index.ts`
- `src/modules/media/permissions/index.ts`
- `src/modules/media/routes/index.ts`
- `src/modules/media/DashboardMedia/index.tsx`
- `src/modules/media/MediaSidebar/index.tsx`
- `src/modules/media/pages/Assets.tsx`
- `src/modules/media/pages/Gallery.tsx`
- `src/modules/media/pages/Upload.tsx`

### Componentes
- `src/components/media/DropZone.tsx`
- `src/components/media/GalleryGrid.tsx`
- `src/components/media/MediaUploader.tsx`
- `src/components/media/MediaUploader.types.ts`
- `src/components/media/Preview.tsx`
- `src/components/media/index.ts`

### Hook, repositório e Edge Functions
- `src/hooks/useMediaUpload.ts`
- `src/repositories/media-assets.repository.ts`
- `supabase/functions/media-upload/index.ts`
- `supabase/functions/media-upload/__tests__/media-upload.test.ts`
- `supabase/functions/media-admin/index.ts`

### Contrato e permissões atuais

`mediaCellContract` declara `id: media`, domínio/escopo `tenant`, lifecycle `active/healthy`, rota inicial `/dashboard/media` e sidebar habilitada.

Permissões atuais:
- `media.read`
- `media_assets.read`
- `media_assets.write`
- `media_assets.delete`
- `media.upload.manage`
- `media.gallery.manage`

Rotas:
- `/dashboard/media`
- `/dashboard/media/upload`
- `/dashboard/media/gallery`
- `/dashboard/media/assets`

### Deployment das Edge Functions

O GitHub comprova somente que os arquivos estão versionados; não comprova implantação. No último levantamento remoto anterior registrado no projeto, `media-upload` constava implantada (versão 2) e `media-admin` não constava implantada. Esse status precisa ser reconfirmado em uma auditoria remota autorizada. Não inferir deployment pela existência do código.

## 4. Schema e divergências

### `src/types/database.ts`

A tipagem local de `media_assets` declara:
`id`, `tenant_id`, `entity_type`, `entity_id`, `purpose`, `bucket_id`, `storage_path`, `file_url`, `file_name`, `mime_type`, `width`, `height`, `is_primary`, `sort_order`, `alt_text`, `created_at`, `updated_at`, `metadata`.

Não declara `file_hash`, `file_size_bytes`, `uploaded_by`, `title` ou `description`, embora a Edge Function use alguns desses campos.

- `purpose`: presente na tipagem local.
- `file_hash`: ausente na tipagem local.
- `tenant_id`: obrigatório em `Row` e `Insert`.

### `companies` e `jobs` na tipagem

- `companies` possui `id` e `tenant_id`, mas não declara `slug`.
- `jobs` possui `id`, `tenant_id` e `slug`.
- A relação de empresa em `jobs` está tipada como `company_relationship_id`; não aparece `company_id` nessa definição.

### `supabase/schema.sql`

O snapshot SQL versionado apresenta outra forma:
- `companies` tem `id`, `tenant_id`, nome, contatos, `logo_url`, endereço, tipo e status; não declara `slug` na criação da tabela.
- `jobs` declara `company_id uuid references public.companies(id) on delete set null` e `slug text not null`, com unicidade `(tenant_id, slug)`.

**Conclusão:** `database.ts` e `supabase/schema.sql` divergem no relacionamento empresa-vaga. Nenhum deles isoladamente prova o schema remoto atual. A FK real precisa ser confirmada por introspecção read-only autorizada.

### `purpose` e `file_hash`

A Edge Function:
- exige `purpose` no formulário;
- seleciona `purpose` de `media_assets`;
- grava a finalidade também em `metadata`;
- consulta `file_hash` para deduplicação;
- grava `file_hash`, `file_size_bytes` e `uploaded_by`.

Na última auditoria remota anterior registrada no projeto, `media_assets` remoto não possuía coluna `purpose`, mas possuía `file_hash`; `tenant_id` era obrigatório e `entity_type` tinha check constraint restritivo, incompatível com parte dos valores aceitos pelo código. Essa divergência precisa ser reconfirmada antes de definir contratos finais.

## 5. Buckets e requisito `bunker`

Último inventário remoto anterior registrado (não reconsultado nesta fase):

| Bucket | Visibilidade registrada |
|---|---|
| `avatars` | público |
| `private-documents` | privado |
| `public-media` | público |
| `services-images` | público |
| `bunker` | não existia |

Requisito vigente: **um único bucket `bunker`**, com catálogo em `media_assets`. Bucket único não significa objetos todos públicos: classificação, política de acesso e emissão de URLs devem continuar respeitando a finalidade e a autorização.

Riscos:
1. Não presumir que `bunker` já existe.
2. Não mover objetos nem alterar policies nesta fase.
3. Não expor currículos/documentos com URLs públicas.
4. Planejar migração com manifesto, hash, idempotência e rollback.
5. Reconciliar `bucket_id`, `storage_path`, `file_url` e policies de `storage.objects`.

## 6. Riscos técnicos observados

1. **URL pública para conteúdo privado:** `media-upload` usa `getPublicUrl(storagePath)` sem condicionar o método à privacidade do bucket, embora o comentário mencione URL assinada. Risco alto para `cv`/documentos.
2. **Bucket por finalidade:** `logo`, `hero`, `card`, `gallery`, `cover` → `public-media`; `avatar` → `avatars`; `cv` → `private-documents`. Isso precisa ser adaptado ao requisito `bunker`.
3. **Tenant obrigatório:** o registro de mídia exige `tenant_id`; o fluxo deve receber o tenant operacional selecionado no Dispatcher, sem escolher arbitrariamente uma membership.
4. **`purpose`:** aparece na tipagem local, mas estava ausente no último schema remoto auditado; a finalidade também está em `metadata`.
5. **`file_hash`:** utilizado pela Edge Function, ausente da tipagem local.
6. **`entity_type`:** `MediaUploader.types.ts` aceita `company`, `service`, `partner`, `supplier`, `job`; o repositório também aceita `blog_post`, `page`, `avatar`, `document`, `ava`; a Edge Function possui seu próprio mapa. Unificar com o check constraint remoto real.
7. **`media-admin`:** hook chama ações `archive`, `set_primary` e `reorder`; a função existe no código, mas não constava implantada no último inventário remoto anterior.
8. **Progresso:** hook informa que `functions.invoke` não fornece progresso real, mas define 100% após a chamada; não é progresso incremental de transferência.
9. **MIME:** cliente aceita PNG/JPEG/WebP; Edge Function também contempla `cv`/PDF. Falta contrato explícito de upload documental na UI genérica.
10. **Deduplicação:** consulta prévia `tenant_id + file_hash` não garante unicidade transacional sob concorrência.

## 7. Consumo atual de imagens

- `src/config/images.ts` exporta `IMAGES` e `HERO_IMAGES`, apontando para `/images/...` em `global/brand`, `home/hero`, `hero`, `servicos`, `parceiros`, `empresas`, `suporte`, `contato`, `login` e `trabalhe-conosco`.
- `src/lib/images/service-image-map.ts` exporta `SERVICE_IMAGE_MAP`, mapeando slugs de serviços para capas e galerias em `public/images/servicos/**`.

A busca exaustiva de todas as referências `/images/...` em todo o worktree não foi executada pela interface GitHub. O Kilo deve fazer busca global local antes de qualquer migração ou remoção.

## 8. Roteamento e consumo de empresas, serviços e vagas

### Dispatcher e registro
Arquivos:
- `src/core/dispatcher/DispatcherMaster.ts`
- `src/core/cells/register-cells.ts`
- `src/platform/router/module-routes.ts`

`register-cells.ts` importa e registra os contratos `empresas`, `media` e `servicos` no `dispatcherMaster`. `module-routes.ts` associa as rotas dessas células aos módulos.

### Empresas
`src/modules/empresas/routes/index.ts` declara dashboard, listagem, cadastro, detalhe e edição. A célula também tem contrato, permissões, sidebar, tipos e páginas próprias.

### Serviços
`src/modules/servicos/routes/index.ts` declara dashboard e páginas da célula. Há contrato, permissões, tipos e páginas próprias.

### Páginas públicas
`src/App.tsx` registra:
- `/vagas`
- `/vagas/:slug`
- `/empresas`
- `/empresas/divulgar-vaga`
- `/servicos`
- `/servicos/:slug`
- `/entrar/empresa`
- `/cadastro/empresa`

Arquivos encontrados: `src/pages/Vagas.tsx`, `VagaDetalhe.tsx`, `Empresas.tsx`, `Servicos.tsx`, `DivulgarVaga.tsx` e `CadastroEmpresa.tsx`.

### Páginas antigas do dashboard ainda referenciadas

No snapshot `main` deste checkpoint, `src/App.tsx` ainda importa:
- `src/pages/dashboard/EmpresasPage.tsx`
- `src/pages/dashboard/ServicosPage.tsx`

As rotas `/dashboard/empresas` e `/dashboard/servicos` ainda montam essas páginas. Também existem rotas modulares em `/dashboard/empresas/*`. Portanto, **não classificar esses arquivos como órfãos neste commit**: `App.tsx` mantém referências explícitas. Reconciliar essa duplicidade antes de remover qualquer página.

## 9. Arquivos-base para Fase 1

| Responsabilidade | Arquivo |
|---|---|
| Contrato Media | `src/modules/media/cellContract.ts` |
| Permissões | `src/modules/media/permissions/index.ts` |
| Rotas | `src/modules/media/routes/index.ts` |
| Registro global | `src/core/cells/register-cells.ts` |
| Dispatcher | `src/core/dispatcher/DispatcherMaster.ts` |
| Router modular | `src/platform/router/module-routes.ts` |
| UI upload | `src/components/media/MediaUploader.tsx` |
| Hook | `src/hooks/useMediaUpload.ts` |
| Repositório | `src/repositories/media-assets.repository.ts` |
| Edge upload | `supabase/functions/media-upload/index.ts` |
| Edge admin | `supabase/functions/media-admin/index.ts` |
| Tipagem | `src/types/database.ts` |
| IMAGES | `src/config/images.ts` |
| Mapa serviços | `src/lib/images/service-image-map.ts` |

## 10. Pendências locais para fechar a Fase 0

Executar no worktree canônico, sem editar arquivos:
1. `git branch --show-current`
2. `git log --oneline -3`
3. `git status --short`
4. `git diff --stat` e `git diff --name-status`
5. `npm run typecheck`
6. Confirmar localmente os 811 arquivos e gerar inventário/hash.
7. Busca global por `/images/`, `IMAGES`, `HERO_IMAGES`, `SERVICE_IMAGE_MAP`, `MediaUploader`, `media_assets`, `company_id` e `company_relationship_id`.
8. Verificar se `docs/media/INVENTARIO_FASE0_J2_0.md` já existe antes de criar/mesclar.

**Não executar:** migrations, DDL, policies, grants, criação de bucket, movimentação de objetos, deploy de Edge Functions, alterações de produção, commit ou push.

## 11. Critério de aceite

A Fase 0 só estará concluída quando o worktree local confirmar o checkpoint, status/diff forem registrados, typecheck passar, inventário local confirmar a contagem, referências forem mapeadas, divergências entre tipagem/SQL/schema remoto forem listadas e o deployment/buckets forem identificados com evidência remota datada.

**Decisão:** não iniciar telas nem contratos finais ainda. Reconciliar as pendências da Fase 0; em seguida, desenhar o contrato Media compatível com o schema remoto comprovado e com o Dispatcher Master.
