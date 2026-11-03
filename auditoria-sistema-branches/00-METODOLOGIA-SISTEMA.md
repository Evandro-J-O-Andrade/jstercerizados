# AUDITORIA SISTEMA (DASHBOARD/MÓDULOS/CÉLULAS) - UI/UX

Data: 2026-11-02 23:33:47
Modo: SOMENTE LEITURA | Sem merge | Sem cópia inteira | Sem alteração
Foco: Shell, layouts, sidebars, header, navegação, módulos/células, dashboards, kanban, tabelas, formulários internos, componentes do painel.

## Metodologia

- Comparar por ARTEFATO, não por branch inteira
- Verificar estrutura visual (layout, hierarquia, espaçamento, densidade)
- Avaliar usabilidade do painel autenticado
- Cruzar com Core (CellRegistry, DispatcherMaster) mas sem alterar arquitetura
- Preservar o que já está melhor na main
- Resgatar APENAS o que for visualmente melhor e compatível

## Prioridades SISTEMA

| Branch                                        | Foco                                       | Prioridade               |
| --------------------------------------------- | ------------------------------------------ | ------------------------ |
| origin/test/sobre-layout-fix-478743c          | PortalSidebar/Header hierárquico           | ALTA                     |
| origin/checkpoint-before-enterprise-dashboard | Arquitetura portal/dashboard, AdminSidebar | ALTA                     |
| origin/feat/admin-master-global-dashboard     | Dashboard global admin master              | ALTA                     |
| origin/fix/cells-independent-of-portal        | CellRegistry/integração                    | MÉDIA-ALTA (arquitetura) |
| origin/feat/database-v21-local-rebuild        | Hooks/repositories painéis                 | MÉDIA                    |
| origin/snapshot/pc-trabalho-20260901          | Dashboards antigos (comparar com atuais)   | MÉDIA                    |
| origin/fix/candidato-dashboard-dialogs        | Dashboard candidato                        | MÉDIA                    |
| origin/feat/candidate-avatar-storage-security | Perfil/candidato painel                    | BAIXA                    |
