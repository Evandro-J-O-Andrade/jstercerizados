# MATRIZ INICIAL SISTEMA

Data: 2026-11-02 23:36:26

| Componente                     | Branch referência                              | Melhor em            | Motivo                                                  | Risco                                    | Ação              |
| ------------------------------ | ---------------------------------------------- | -------------------- | ------------------------------------------------------- | ---------------------------------------- | ----------------- |
| PortalSidebar                  | test/sobre-layout-fix-478743c                  | Hierarquia/navegação | Expansível, auto-expansão, categorias, sub-features, UX | Integração AccountContext/ModuleRegistry | Extrair lógica    |
| PortalHeader                   | test/sobre-layout-fix-478743c                  | Contexto/UX          | Breadcrumb, saudação, busca, troca conta, tema          | Integração atual                         | Extrair melhorias |
| AdminSidebar                   | main vs checkpoint-before-enterprise-dashboard | A verificar          | Shell principal usa AdminSidebar fixo                   | Crítico arquitetura                      | Auditar           |
| DashboardHome/Dashboard global | feat/admin-master-global-dashboard             | A verificar          | Painel global                                           | Avaliar                                  | Auditar           |
| CandidaturasKanban             | main                                           | Presente             | Já existe                                               | Avaliar melhorias branches               | Auditar           |
