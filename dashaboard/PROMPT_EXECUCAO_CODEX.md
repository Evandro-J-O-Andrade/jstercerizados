# PROMPT PARA CODEX — RECONSTRUÇÃO POR CÉLULA

## Objetivo

Leia o conteúdo da pasta `dashboard`, começando por `README.md`, `04_documentacao/MATRIZ_26_CELULAS.md` e as imagens de cada célula; depois leia a **documentação real do worktree** do projeto J&S Empregos LTDA. As 130 telas são **referências de layout**, não prova de implementação e não especificam números reais.

Refazer progressivamente as páginas do CHECK BOULER 24H em React/TSX + Tailwind, com design enterprise, organização didática, páginas dedicadas e Database-Driven UI/UX, sem quebrar site público, Auth, tenants, permissões, RLS, roteamento nem o footer institucional.

## Responsabilidades

**Master:** aplicar AGENTS.md; identificar a fonte canônica, gates ativos, bloqueios, divergências e autorizações.  
**Dispatcher de tarefas:** distribuir módulos e arquivos, sem trabalho concorrente em rotas/CORE; NÃO confundir com o DispatcherMaster runtime.  
**Arquiteto de software:** garantir contratos, tenant, RBAC/RLS, repositories, Page Builder, caches e publicação.  
**Arquiteto UX/UI:** inspecionar screenshots por módulo e adequar componentes, densidade, tabelas, filtros, estados, responsividade e acessibilidade.  
**Executor:** trabalhar somente em gate autorizado, implementando e testando uma jornada por vez.

## Contrato de páginas, por célula

A. `Dashboard` — painéis analíticos específicos, dados de suas próprias entidades ou referências autorizadas de outras células.  
B. `Listagem` — CRUD operacional: filtros, busca, paginação, colunas, seleção, ações e estados.  
C. `Criação` — página **separada** da listagem e do dashboard, com título próprio, etapas, contexto, esquema Zod, revisão e confirmação.  
D. `Detalhes` — ficha 360º, relacionamentos e histórico, documentos privados, ações e timeline.  
E. `Edição` — página **separada**, dados atuais, validação de mudanças, concorrência, persistência e auditoria.

Uma célula pode precisar de páginas adicionais como Kanban, cronograma, relatórios, conciliação, editor de serviços, vaga detalhada ou biblioteca de mídia. O layout da referência é o ponto de partida, nunca uma limitação do domínio.

## Rotas

Não substituir cegamente rotas existentes por URLs propostas nas referências.

- `admin-master`: `/dashboard/admin-master` (governança).
- Central 24H: `/dashboard/global` (observabilidade).
- `candidato`: `/candidato` e subrotas.
- `recrutamento`: `/dashboard/recrutamento/*`.
- Demais células: resolver o caminho canônico real do CellRegistry, App.tsx e guards antes de alterar.
- Preservar aliases de compatibilidade, sem tornar ModuleRegistry legacy fonte de verdade.

## Ações e persistência

Não simular o sucesso de `Criar`, `Editar`, `Delegar`, `Avançar etapa`, `Enviar documento` ou `Publicar` sem persistência real. Montar fluxo `UI → hook → service/repository → RPC/query → Supabase` e testes de autorização por pessoa, tenant e papel. O frontend não é mecanismo de autorização.

Dashboard NÃO pode hospedar formulário de CRUD inline. O clique em Criar abre sua rota dedicada; o clique em Editar abre edição; o clique em registro abre detalhes; histórico e documentos ficam contextualizados na página de detalhe.

## Database-Driven UI/UX

Auditar e reutilizar `docs/database-driven-ui/STAGE02_MATRIZ_PAGINA_SECAO_DADOS.md`. Banco define conteúdo editorial, layout permitido, ordem, variantes, ações permitidas e publicação. TSX renderiza somente chaves de componentes permitidos e schemas verificados. Não executar JSX, SQL ou scripts vindo do banco.

Cache de snapshots públicos publicados pode preservar o site em falha de banco; nunca usar cache para autorizar ações, devolver dados privados de outro tenant ou inventar persistência.

## Testes e aceite

Para cada célula entregar: rotas, dashboard funcional, listagem, criação, detalhes, edição, loading/error/empty/forbidden, responsividade, RLS por papel/tenant, uploads autorizados, testes unitários e E2E, capturas referência × implementação e rollback.

### Ordem de implementação (proposta)

1. Diagnosticar G1: testes ModuleRouter/ModuleContext/Dispatcher/AuthRoute e aliases.
2. Diagnosticar e homologar P0 candidato/e-mail em gate de Auth explicitamente autorizado.
3. Concluir um fluxo canônico com `Dashboard → Lista → Novo → Detalhe → Editar` (sugestão: módulo Admin Tenant, com cautela adicional para convites e RBAC).
4. Usar o padrão validado em Recrutamento/Vagas, Candidato, Empresas, Serviços e RH.
5. Depois Financeiro, Faturamento, Contabilidade, Fiscal, Contratos, Estoque, Operações, Suporte, AVA e demais células.
6. CMS e renderer declarativo, publicação, mídia/documentos, cache e migração gradual do site público.
7. Retirada final do legado autenticado apenas após zero consumidores e testes aprovados.

**Estado desta entrega:** somente referências e código de protótipo externo. Não há autorização de execução no repositório, commit, push, migration, deploy, Auth/SMTP, Supabase remoto ou alteração do footer.
