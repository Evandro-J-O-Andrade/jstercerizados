# MATRIZ DE CONSOLIDAÇÃO - Estágio 01 + Auditoria Branches

Data: 2026-11-02 21:29:52
Modo: SOMENTE LEITURA | Sem merge | Sem cópia inteira | Sem substituição de módulos

## Estado consolidado

| Frente                            | Estado                                |
| --------------------------------- | ------------------------------------- |
| Estágio 01 — Layouts              | Quase concluído                       |
| Estágio 01b — Navegação e Sidebar | Próximo                               |
| Auditoria comparativa de branches | Realizada                             |
| Comparação Sobre                  | Documentada                           |
| PortalSidebar/Header              | Analisados                            |
| DashboardAva                      | Existência confirmada, sem duplicação |
| Extração de melhorias             | Pendente de aprovação                 |
| Implementação                     | Não autorizada                        |
| Supabase remoto                   | Sem alterações                        |

## Matriz de melhorias por origem

| Origem                                        | Componente/Arquivo                      | Achado                                                                                                                            | Destino atual                                          | Dependências                                                             | Risco                                                 | Justificativa                                                                       | Status                |
| --------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------- |
| origin/test/sobre-layout-fix-478743c          | src/components/portal/PortalSidebar.tsx | Hierarquia expansível (módulos>features>sub-features), auto-expansão por rota, controle collapsedNodes, agrupamento por categoria | src/components/portal/PortalSidebar.tsx (versão atual) | AccountContext, AuthContext, ModuleRegistry, framer-motion, lucide-react | Médio (integração com AccountContext/PermissionGuard) | UX melhor, navegação mais clara, já segue padrão ModuleRegistry                     | A avaliar             |
| origin/test/sobre-layout-fix-478743c          | src/components/portal/PortalHeader.tsx  | Contexto (Painel/Admin/Usuário), breadcrumbs módulo, busca, troca conta, tema, notificações, menu usuário                         | src/components/portal/PortalHeader.tsx (versão atual)  | AuthContext, AccountContext, useTheme, normalizeRoleScope                | Médio                                                 | Header mais informativo e funcional                                                 | A avaliar             |
| origin/checkpoint-before-enterprise-dashboard | docs/PORTAL-_.md, RBAC-_.md             | Arquitetura portal, matriz RBAC, inventário                                                                                       | Documentação                                           | Scripts RBAC existentes                                                  | Baixo                                                 | Governança/documentação útil                                                        | Referência            |
| origin/checkpoint-before-enterprise-dashboard | src/components/auth/AuthRoute.tsx       | Rota pós-login (termos/boas-vindas)                                                                                               | Verificar existência                                   | AuthContext                                                              | Baixo                                                 | Fluxo onboarding                                                                    | Verificar             |
| origin/feat/admin-master-global-dashboard     | DashboardHome refinamentos              | Melhorias visão global admin master                                                                                               | src/pages/dashboard/DashboardHome.tsx                  | AuthContext/RBAC                                                         | Médio                                                 | Pode melhorar visão global                                                          | A avaliar             |
| origin/feat/sobre-institucional-jse           | src/pages/Sobre.tsx                     | Timeline capítulos cinematográficos, valores/metodologia                                                                          | src/pages/Sobre.tsx (atual)                            | framer-motion, animações                                                 | Médio-Alto                                            | Visual rico, mas precisa alinhar com identidade atual (evitar anos não confirmados) | A avaliar com cautela |
| origin/test/sobre-layout-fix-478743c          | src/pages/Sobre.tsx                     | NightSky/partículas, PremiumCard uso, política qualidade, cobertura                                                               | src/pages/Sobre.tsx (atual)                            | PremiumCard, useReducedMotion, framer-motion                             | Médio-Alto                                            | Efeitos visuais, verificar dependências existentes                                  | A avaliar com cautela |

## Regras

- Não copiar branches inteiras
- Não fazer merge
- Não substituir módulos
- Preservar células funcionais
- Banco/migrations/infra bunker fora do escopo
- Extração somente com aprovação
- Implementação não autorizada neste momento
- Sem alterações Supabase remoto

## Próximos passos

1. Fechar leitura layouts restantes (Estágio 01)
2. Iniciar Estágio 01b (navegação/sidebar)
3. Cruzar AdminSidebar, PortalSidebar, CellRegistry, DispatcherMaster
4. Confrontar com documentos auditoria-branches
5. Atualizar matriz com evidências por arquivo

## Referências

- auditoria-branches/AUDITORIA-MESTRE.md
- auditoria-branches/02-ACHADOS-CONSOLIDADOS.md
- auditoria-branches/04-SOBRE-COMPARATIVO.md
- auditoria-branches/05-RESUMO-FINAL.md
