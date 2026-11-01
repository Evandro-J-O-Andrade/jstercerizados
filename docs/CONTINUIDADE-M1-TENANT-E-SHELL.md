# Continuidade — contexto explícito de tenant e shell interno

## Baseline e escopo

- Repositório: `Evandro-J-O-Andrade/jstercerizados`
- Branch/HEAD verificados: `main` / `6866edc`
- O worktree já estava sujo e continha arquivos modificados e não rastreados antes desta etapa. Essas alterações foram preservadas.
- Alterações desta etapa são locais. Não houve commit, push, deploy, migration remota ou escrita no Supabase.
- O footer do shell e o site público não foram alterados. O nome da empresa permanece **J&S Empregos LTDA**.

Esta etapa fechou o núcleo do M1 de seleção explícita e corrigiu o comportamento responsivo do shell administrativo. Não representa a conclusão da auditoria ou implementação integral do sistema solicitada.

## Evidências e classificação

| Área                                      | Classificação                         | Evidência / estado                                                                                                                                                                                                                  |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seleção de tenant no `AuthContext`        | **REAL (local)**                      | `currentTenantId` permanece `null` sem escolha explícita, inclusive com uma única membership. A opção armazenada em `sessionStorage` é preferência, não autorização.                                                                |
| Validação ao inicializar e trocar tenant  | **REAL (local)**                      | Membership ativa é consultada novamente no Supabase. Dados protegidos são limpos durante a troca; roles, assignments e permissões são filtrados pelo tenant validado.                                                               |
| Concorrência de trocas                    | **REAL (local)**                      | Operações obsoletas não podem persistir nem sobrescrever a seleção mais recente. Teste cobre duas trocas concorrentes.                                                                                                              |
| Falhas na carga de RBAC                   | **REAL (local)**                      | Falhas em `role_assignments`, `role_permissions` e `permissions` agora são propagadas, sem continuar com permissões vazias ou fallback de identidade.                                                                               |
| Rotas e DispatcherMaster                  | **REAL (local)**                      | Sem contexto válido, rotas tenant-scoped exigem `/selecionar-tenant`; o dispatcher encaminha após contexto validado. Rotas globais de Admin Master permanecem separadas.                                                            |
| Contrato puro `IdentityContract`          | **PARCIAL / ÓRFÃO**                   | O fallback `active[0]` foi removido e há testes, mas o contrato não tem consumidor de runtime no fluxo atual; `AuthContext` mantém sua própria carga/validação.                                                                     |
| Sidebar e scroll do shell                 | **REAL (local)**                      | A sidebar recebe os props de mobile, tem fechamento por overlay/navegação e alterna entre largura expandida e compacta. O conteúdo é a área rolável; header e footer ficam fora dela.                                               |
| Isolamento de estado no módulo Financeiro | **REAL (local)**                      | `FinanceiroLayout` bloqueia páginas tenant-scoped sem seleção e remonta o conteúdo quando `currentTenantId` muda, descartando o estado local da organização anterior.                                                               |
| Categorias financeiras                    | **REAL (local, leitura/criação)**     | `CategoriaPage` usa `financialCategoryRepository`, filtra pelo tenant validado e exige `finance.create` para criar. O schema remoto foi consultado somente com `SELECT`; não há política `DELETE`, então a UI não oferece exclusão. |
| Outras telas tenant-scoped                | **PARCIAL**                           | Permanecem tratamentos locais de ausência de tenant fora do limite do Financeiro, além de ações placeholder em outros módulos financeiros. Revisar por módulo sem adicionar operações não autorizadas por RLS.                      |
| Componentes da Central de Carreira        | **REAL (local, descoberta anterior)** | Os seis componentes citados já existiam e estavam integrados ao dashboard candidato; não foram recriados nesta etapa.                                                                                                               |
| Contratos do dashboard candidato          | **CONFLITANTE / PARCIAL**             | A reconciliação anterior apontou diferenças entre código e schema, incluindo `applications.current_stage` versus `current_stage_id`/`status`, entrevistas e documentos. Não foi feita correção funcional nesta etapa.               |
| Uploads múltiplos / Media Fase 1          | **NÃO IMPLEMENTADO / BLOQUEADO**      | A matriz de Media mantém a fase bloqueada até reconciliar Storage, `media_assets`, RLS, Edge Functions e contratos. Nada foi aplicado ao Storage ou às Edge Functions nesta etapa.                                                  |
| E-mail de confirmação do candidato        | **ESPECIFICADO / NÃO CONFIRMADO**     | O cadastro usa um redirect diferente do callback documentado. Isso é uma divergência a investigar, não prova de falha de SMTP; logs/configuração de produção não foram alterados.                                                   |
| Site público e footer                     | **REAL (preservado)**                 | Não foram alterados nesta etapa.                                                                                                                                                                                                    |

## Decisões documentais e banco

### Contratos frontend

`docs/FRONTEND-RBAC-CONTRACT.md` está marcado como **DRAFT — READ-ONLY** e diz que alterações aguardam aprovação formal. A instrução explícita posterior do usuário tornou a seleção de tenant a regra canônica; esta etapa ficou limitada ao M1 e às proteções diretamente relacionadas. Isso não autoriza integração ampla de RBAC nem alteração de produção.

`docs/architecture/FASE-B-CONTRATOS-CANONICOS.md` afirma que o `DispatcherMaster` não era a autoridade de destino. Essa observação é histórica: no código atual, `AuthContext.resolvePostLoginDestination` chama `dispatcherMaster.resolveDestination`.

O documento `docs/architecture/poc-vs-core-contracts-comparison.md` foi atualizado para registrar que `IdentityContract` exige seleção explícita e que sua suíte contém 43 testes.

### Reconciliação de migrations

Na leitura anterior do banco e do histórico local foram identificados:

- 137 migrations remotas e 99 IDs locais;
- 42 IDs remotos sem arquivo local e 4 IDs locais ausentes do histórico remoto.

Na revalidação remota posterior desta sessão, essas contagens permanecem iguais. Também foi confirmado:

- o projeto remoto `js-empregos` está ativo; a conexão SQL reportou `transaction_read_only=off` e role `postgres`; foram executados somente `SELECT`s;
- as últimas versões remotas são `20261026105124_harden_avatar_and_private_document_storage` e `20261101023853_current_person_id_auth_uid_only`;
- há divergência atual entre contratos vivos e tipos/repos locais: `applications.current_stage_id`/`status` versus `current_stage`, e colunas de `candidate_documents` incompatíveis com os payloads usados no frontend;
- o fluxo local de cadastro de currículo usa o bucket `curriculos`, que não consta entre os buckets remotos; `private-documents` é privado e limita o arquivo a 20 MiB;
- as seis peças de dashboard candidato já estão exportadas e renderizadas em `DashboardCandidato.tsx`; não devem ser recriadas. A agenda, porém, não consulta `interviews.scheduled_at`.

- `role_resource_permissions` não existe no banco consultado; `role_permissions` existe;
- documentos antigos de banco/RBAC não correspondem integralmente ao estado remoto.

O registro anterior sobre `role_resource_permissions` não foi revalidado nesta leitura e não deve ser tratado como estado atual. Por isso, **nenhuma migration foi criada ou aplicada**. Criar SQL antes de fechar a reconciliação por objeto poderia duplicar ou contradizer mudanças remotas. Arquivos de migration não rastreados que já estavam no worktree foram preservados.

## Validação executada

- `npm run test:run`: **89 arquivos passaram, 5 ignorados; 728 testes passaram, 4 ignorados**.
- `npm run typecheck`: passou.
- `npm run build`: passou.
- ESLint focado nos arquivos alterados: **0 erros**; permanecem avisos de `any` e avisos preexistentes.
- Busca em `src/`: nenhum `tenantMemberships[0]`, `tenantIds[0]` ou `active[0]`.
- `git diff --check`: passou.

O build ainda informa imports simultaneamente estáticos e dinâmicos em páginas como candidatos, vagas e rotas administrativas. É um aviso de divisão de chunks, não falha de build.

## Próximos bloqueios — não concluídos

1. Reconciliar as 42 versões remotas sem arquivo local e os 4 arquivos locais sem correspondência remota; decidir quais snapshots locais são autoritativos.
2. Alinhar tipos, repositories, formulários e dashboard candidato ao schema vivo; confirmar decisões de exclusão/RLS antes de prometer CRUD completo.
3. Reabrir Media Fase 1 somente após aprovação da matriz de Storage/RLS/Edge Functions; suportar múltiplos arquivos sem selecionar tenant implicitamente.
4. Investigar a confirmação de e-mail com logs e configuração autorizados; não inferir causa apenas pelo redirect.
5. Estender a proteção de estado/contexto do Financeiro aos demais módulos tenant-scoped e remover os fallbacks que permitem consultas com tenant ausente.
6. Fazer validação visual responsiva do shell e auditoria restante das páginas internas.

## Restrições preservadas

- Nenhuma alteração remota ou operação de produção.
- Nenhuma migration, RLS, grant, RPC, Storage ou Edge Function foi aplicada nesta etapa.
- Nenhum commit, push ou deploy.
- Footer e marca preservados.
