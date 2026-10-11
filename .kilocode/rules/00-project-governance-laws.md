# LEIS OBRIGATÓRIAS DO PROJETO — KILO CODE

**Versão:** 1.0  
**Data:** 2026-10-11  
**Aplicação:** todas as conversas, sessões, worktrees, agentes e comandos deste repositório.  
**Baseline remoto de referência:** main em 27d92c8c25a4e8a3b9b8ee9bbbeb46dc5418cb6a no momento da criação.  
**Status:** contrato de governança; não significa que a arquitetura-alvo já esteja implementada.

Estas regras são um contrato operacional. Em caso de conflito, interrompa a ação, apresente evidências e solicite decisão. Nunca resolva conflitos silenciosamente.

---

## LEI 0 — LER AS REGRAS ANTES DE QUALQUER RESPOSTA OU COMANDO

Em toda nova mensagem do usuário, inclusive uma saudação curta como “oi”, e antes de cada comando que possa inspecionar, modificar ou executar o projeto:

1. Releia este arquivo.
2. Releia AGENTS.md e .ai/AGENTS.md na worktree atual.
3. Verifique branch, HEAD, estado Git e worktree em que está operando.
4. Localize e leia os Markdown pertinentes à tarefa, incluindo decisões, contratos, checkpoints e bloqueios.
5. Verifique se outro agente está trabalhando no mesmo arquivo, pasta, módulo, branch ou escopo.
6. Defina o escopo permitido e os arquivos proibidos antes de agir.

Não é necessário reler todos os documentos históricos sem relação com a tarefa. É obrigatório localizá-los, classificá-los e ler os relevantes. Para tarefas amplas ou arquiteturais, inventarie os MD de arquitetura e governança e reconcilie os conflitos.

Nunca inicie trabalho baseado apenas na última mensagem. Uma saudação não revoga nem suspende estas leis.

## LEI 1 — ESTADO ATUAL E EVIDÊNCIA ANTES DE MUDANÇA

Antes de implementar, restaurar, renomear, apagar ou criar arquivos:

- Identifique branch, HEAD, alterações staged/unstaged/untracked, stashes e worktrees.
- Leia o arquivo atual e compare-o com histórico e checkpoints pertinentes.
- Procure implementações, rotas, componentes, hooks, services, repositories, tipos, permissões, tabelas, funções, triggers e migrations existentes.
- Classifique evidências como REAL, PARCIAL, MOCK, ESPECIFICADO, NÃO IMPLEMENTADO, ÓRFÃO, OBSOLETO ou CONFLITANTE.
- Não declare funcionalidade concluída só porque existe documentação, arquivo ou rota.
- Não presuma que ausência no branch atual significa perda definitiva: procure commits, refs, stashes e checkpoints dos agentes.

Auditoria é somente leitura, salvo autorização explícita para implementar.

## LEI 2 — AGENTE, WORKTREE E ARQUIVOS BLOQUEADOS

- Nunca editar, formatar, mover, renomear, apagar, restaurar, sobrescrever, gerar código em cima ou commitar arquivos/pastas/escopos bloqueados ou pertencentes a outro agente ativo.
- Não contornar bloqueios por outra worktree, script, rename, cherry-pick ou commit indireto.
- Antes de atuar, confira instruções de agente, locks, atribuição da tarefa e estado da worktree.
- Se responsável ou lock não estiver claro, pare e peça liberação explícita ao responsável.
- Não presuma que uma worktree está livre porque está limpa, parada ou em outro branch.
- Nunca execute limpeza ou rebase que possa eliminar trabalho de outro agente.
- Mudança compartilhada exige plano de integração e confirmação do proprietário do escopo.

## LEI 3 — CHECKPOINT E PONTO DE RETORNO

Cada etapa relevante precisa de um ponto de retorno verificável antes de mudanças arriscadas:

1. Registrar data, branch, HEAD completo, estado da worktree e objetivo.
2. Preservar mudanças locais existentes; nunca descartá-las para “limpar” o ambiente.
3. Preferir branch/checkpoint dedicado, commit identificável e/ou tag de retorno, conforme autorização.
4. Confirmar SHA e verificar que o checkpoint aponta para o conteúdo esperado.
5. Registrar testes executados e resultados.
6. Nunca afirmar que existe backup/checkpoint sem verificá-lo.

Antes de continuar uma fase, identifique o último checkpoint válido e o delta desde ele. Ao concluir fase autorizada, registre mudanças, testes, riscos e SHA de retorno.

Nunca executar automaticamente: git reset --hard, git clean, git checkout --, git restore em massa, git stash pop, git stash drop, rebase destrutivo, force-push ou remoção de refs. Qualquer exceção exige autorização específica após explicar o impacto.

## LEI 4 — GIT: AUTORIZAÇÕES SEPARADAS

- Inspecionar/comparar é diferente de modificar.
- Implementar é diferente de commitar.
- Commit é diferente de push.
- Push é diferente de deploy.
- Cada ação precisa estar coberta pela autorização do usuário e respeitar as permissões do repositório.
- Não incluir arquivos não relacionados, segredos, .env, credenciais, uploads de usuário ou artefatos gerados sem revisão.
- Usar Conventional Commits.
- Antes do commit, revisar diff completo, arquivos staged, testes, typecheck e build relevantes.
- Após o commit, confirmar SHA, branch e árvore resultante.
- Nunca publicar em main ou produção automaticamente.

## LEI 5 — SITE PÚBLICO PROTEGIDO

A zona pública de produção é protegida. Não redesenhar nem alterar páginas, identidade, rodapé, conteúdo, SEO, mídia ou comportamento público durante a reconstrução do SaaS, salvo autorização explícita e delimitada.

Não restaurar assets ou imagens em massa. Não alterar arquivos de imagem por conveniência. Imagens podem ser recuperadas depois; evitar regressões de código é prioritário.

Se documentos antigos de branding entrarem em conflito com uma instrução mais recente do proprietário, não alterar a zona pública silenciosamente: registrar o conflito e pedir decisão antes de editar.

## LEI 6 — SUPABASE É A FONTE DE VERDADE

- Supabase é fonte de verdade para dados, estado persistido, tenants, identidade, roles, permissões e relações de negócio.
- Não inventar mocks para substituir dados existentes.
- Não criar tabelas, colunas, funções, RPCs, triggers, políticas RLS, grants, seeds ou migrations sem inspecionar schema, histórico e documentação.
- Nunca aplicar migration nem alterar banco remoto durante auditoria.
- Alterações em Auth, RBAC, RLS, grants, triggers, migrations e dados de produção exigem plano, análise de impacto, rollback e autorização explícita.
- Para dados de pessoa, tenant e domínio, verificar a estrutura real antes de criar tabelas.
- Uploads devem registrar metadados e vínculo de domínio. A extensão não determina sozinha o significado do arquivo; validar MIME/conteúdo, tamanho, permissões, storage path, entidade relacionada e fallback.
- Preferir infraestrutura de mídia reutilizável e resolvedor por chave lógica, sem duplicar upload por módulo.

## LEI 7 — SEGURANÇA: ADMIN_MASTER E RBAC

admin_master não é bypass de autorização. O frontend não pode conceder acesso só porque isAdminMaster é verdadeiro. A autorização deve derivar de atribuições e permissões reais; Supabase/RLS impõe as regras no backend.

Cadeia de identidade a validar:

    auth.users → people → tenant_memberships → role_assignments → roles → role_permissions → permissions

A decisão registrada é remover o privilégio implícito de admin_master e conceder somente permissões explícitas, mínimas e justificadas. Antes de preparar ou executar a revogação:

1. Auditar frontend, funções/RPCs, policies RLS, grants, triggers e associações atuais.
2. Localizar a migration pretendida no histórico local, branches, stashes e checkpoints.
3. Distinguir migration criada, aplicada, pendente, bloqueada ou ausente.
4. Preparar SQL idempotente quando aplicável, com pré-condições, efeito exato e rollback.
5. Verificar como manter acesso administrativo legítimo e evitar lockout.
6. Obter autorização explícita antes de executar mudança no banco.

Remover um bypass do React não corrige sozinho a segurança. Nunca apagar role, permissões ou atribuições sem plano e evidência.

## LEI 8 — ARQUITETURA POR CÉLULAS INDEPENDENTES

Arquitetura-alvo: módulos por domínio, blast radius pequeno. Estrutura de referência, conforme aplicável:

    src/modules/<modulo>/
    ├── index.ts
    ├── container/
    ├── context/
    ├── routes/
    ├── sidebar/ ou navigation/
    ├── header/
    ├── dashboard/
    ├── pages/
    ├── components/
    ├── forms/
    ├── crud/
    ├── hooks/
    ├── repositories/
    ├── services/
    ├── types/
    ├── validation/
    ├── permissions/
    ├── media/
    └── tests/

Não criar diretórios vazios só para cumprir uma árvore. Marcar N/A quando uma responsabilidade não se aplica. Antes de impor nomes novos, reconciliar docs/CELL-CONTRACT.md, docs/CELL-MATRIX.md e docs/architecture/ARCHITECTURE-05-IMPLEMENTATION-CONTRACT.md. Se divergirem, registrar a decisão canônica e atualizar documentação de forma consistente, quando autorizado.

- Uma célula não importa implementação interna, regra de negócio, repository ou tipos privados de outra célula.
- Dependências transversais usam contratos explícitos em core/, platform/ ou shared/.
- shared/ contém primitivas reutilizáveis, não regras de negócio.
- Falha de uma célula deve ser contida por boundaries de erro/loading, sem derrubar módulos vizinhos.
- Fluxo preferencial: UI → Form/Action → Hook → Repository/Service → Supabase → Mapper.
- UI não consulta Supabase diretamente quando existe ou deve existir repository responsável.
- Declarar loading, success, empty, error, unauthorized, forbidden, not-found e feedback de mutation conforme a operação.
- CRUDs e forms compartilhados são engines/primitivas; regras, schemas e permissões permanecem no módulo de domínio.
- Não fazer big bang: migrar célula por célula, preservando comportamento válido.

## LEI 9 — NOMENCLATURA CANÔNICA

- Usar português ou inglês conforme domínio e padrão estabelecido no módulo; não misturar convenções dentro da mesma célula.
- Nomear módulo e arquivos com base no nome canônico da entidade/tabela/domínio confirmado no banco e no mapa de módulos.
- Antes de renomear, procurar imports, rotas, lazy imports, testes, barrel exports, referências SQL e integrações.
- Não inferir nomes de tabelas a partir de nomes desejados no frontend.
- Não manter aliases duplicados sem motivo de compatibilidade documentado.
- Cada módulo tem dashboard operacional e container/contexto próprios; dashboard de candidato não é dashboard de recrutamento.
- index.ts é barrel/contrato de exportação, não depósito de toda a lógica.
- Componentes compartilhados têm responsabilidade, API tipada e testes.

## LEI 10 — PORTAL DE SUPORTE NÃO É A ENTRADA GLOBAL

Decisão arquitetural vigente:

- Portal de Suporte é um módulo de suporte com AVA, cursos, chamados e configurações de suporte.
- A dashboard desse módulo segue o nome canônico DashboardPortalSuporte, ou equivalente aprovado após inventário, dentro do container do Portal de Suporte.
- O portal não é o launcher/entrada global do sistema e não deve usar padrão visual Windows 8/Metro para dashboards.
- Dashboards analíticas, gerenciais e relatórios ficam em container próprio de Gestão Analítica.
- Portal do Candidato é outro módulo, com pasta, contexto, container, dashboard, navegação, permissões e páginas próprias.
- Recrutamento é módulo interno separado do candidato.
- Entrada global é resolvida pelo Dispatcher Master/Orquestrador, exibindo apenas módulos e contextos autorizados.
- Troca de contexto/conta revalida identidade, tenant, roles e permissões antes de renderizar o novo contexto.

Antes de alterar rotas ou dashboards, auditar src/App.tsx, src/platform/router/, src/components/portal/ModuleRegistry.ts e contexts. Não remover rotas em lote sem mapa de dependências e testes.

## LEI 11 — DISPATCHER MASTER / ORQUESTRADOR

Dispatcher é coordenação operacional, não módulo monolítico de negócio. Deve orquestrar por contratos tipados:

- sessão e identidade;
- tenant/contexto ativo;
- autorização e escopo;
- registro/resolução de rotas;
- carregamento lazy e boundary por módulo;
- navegação autorizada;
- uploads/arquivos;
- notificações/eventos;
- operações CRUD/Form comuns;
- auditabilidade e erros.

Não duplicar lógica sem inventário. Não permitir bypass de RBAC, RLS ou isolamento de tenant. Não centralizar regras específicas de recrutamento, suporte, financeiro ou outros domínios no core.

## LEI 12 — CONFIGURAÇÕES DE PESSOAS E CONFIGURAÇÃO GENÉRICA

Antes de criar configuracao_people, configura_usuario ou tabela genérica, inspecionar schema e arquitetura de identidade. Verificar se já existe entidade de preferências/configurações por pessoa, tenant, módulo ou sistema.

Se for necessária estrutura genérica, definir explicitamente:
- owner/person e tenant quando aplicável;
- escopo e chave canônica;
- valor tipado/validado ou schema versionado;
- visibilidade e permissões;
- defaults e migração de valores;
- auditoria e política RLS;
- separação de preferências pessoais, configurações de tenant e configurações globais.

Não criar tabela genérica sem constraints, tipo, escopo, política de acesso e contrato de leitura/escrita.

## LEI 13 — VALIDAÇÃO E DEFINIÇÃO DE PRONTO

Etapa só está pronta quando:
- diff revisado, sem mudanças não relacionadas;
- arquivos bloqueados preservados;
- typecheck passa;
- testes relevantes passam;
- build passa quando aplicável;
- rotas e permissões verificadas;
- ausência de mock indevido confirmada;
- nenhum efeito colateral no site público;
- migrations e banco permanecem intactos, salvo autorização específica;
- ponto de retorno e SHA registrados.

Se validação não pôde ser executada, marcar NÃO EXECUTADA. Nunca declarar sucesso por suposição.

## LEI 14 — RELATÓRIO CURTO E RASTREÁVEL

Ao terminar uma etapa, informar:
1. o que foi inspecionado/alterado;
2. o que foi preservado;
3. regressões e pendências com evidências;
4. testes e resultados;
5. arquivos afetados;
6. branch e SHA do checkpoint;
7. próxima etapa segura.

Separar fatos verificados, inferências e questões abertas. Não esconder falhas nem exagerar progresso.

---

## ESTADO INICIAL REGISTRADO NESTE CHECKPOINT

No momento da criação deste documento, o branch remoto main apontava para:

- SHA: 27d92c8c25a4e8a3b9b8ee9bbbeb46dc5418cb6a
- Mensagem: fix(media): add missing gallery images referenced by service-image-map
- Data: 2026-10-11T11:16:35Z

Achados preliminares remotos — não representam validação local completa:
- A role de aplicação admin_master tinha 108 associações em role_permissions, em 3 atribuições, no projeto Supabase okxqfyoqbhcmflpurfrw.
- A migration 20260827154500_seed_admin_master_permissions.sql existe no repositório.
- A lista de migrations aplicadas consultada terminava em 20261004000002 — p3a2_storage_hardening; não foi encontrada migration aplicada dedicada à revogação de admin_master nessa consulta.
- A árvore remota de main não continha src/platform/cells/ nem cells.ts na busca realizada.
- O frontend ainda contém ModuleRegistry, DashboardHome e padrões antigos de dashboard a reconciliar com a decisão de Portal de Suporte e Gestão Analítica.

Reconfirmar esses achados no início da próxima auditoria. Eles não autorizam SQL nem restauração de arquivos.

## REGRA FINAL INEGOCIÁVEL

LEIS E MD PRIMEIRO → ESTADO REAL → INVENTÁRIO E DIFF → PLANO → AUTORIZAÇÃO → MUDANÇA PEQUENA → TESTES → CHECKPOINT → RELATÓRIO.

Se houver risco de perda, bloqueio de agente, conflito documental, ambiguidade de permissão ou incerteza sobre a origem de um arquivo: PARE. NÃO SOBRESCREVA. NÃO LIMPE. NÃO APLIQUE. REGISTRE A EVIDÊNCIA E PEÇA DECISÃO.
