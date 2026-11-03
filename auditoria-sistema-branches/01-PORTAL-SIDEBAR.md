# AUDITORIA SISTEMA - INÍCIO

Data: 2026-11-02 23:35:47

## PortalSidebar

- main: versão atual (já analisada)
- checkpoint-before-enterprise-dashboard: adicionou exports ICON_MAP/ModuleIcon
- test/sobre-layout-fix-478743c: versão com hierarquia expansível, auto-expansão por rota, agrupamento por categoria, collapsedNodes, troca conta, data/hora, voltar ao site

## Comparação PortalSidebar hierárquico

Branch test/sobre-layout-fix-478743c tem:

- ensureExpandedForRoute() - auto-expande módulos/features conforme rota
- expandedModules/expandedFeatures/collapsedNodes
- toggleModule/toggleFeature com lógica de recolhimento
- Agrupamento por categoria com CATEGORY_LABELS
- Renderização recursiva features > sub-features
- Modo collapsed (ícones apenas)
- Footer com usuário + data/hora
- Modal troca conta

**Potencial extração:** lógica hierárquica + UX. Verificar integração com AccountContext atual.

## PortalHeader

Branch test/sobre-layout-fix-478743c tem:

- Breadcrumb/contexto (Painel Administrativo / Área do Usuário)
- Saudação \"Seja bem-vindo, {nome}\"
- Tenant/role + data/hora
- Busca com foco visual
- Notificações com badge
- Menu usuário com Perfil/Segurança/Trocar conta/Tema/Sair
- Modal troca conta
- Botão voltar ao site

Main atual tem PortalHeader. Comparar densidade/UX.

## Próximos

- Comparar AdminSidebar (main) vs versões branches
- DashboardHome/dashboard global
- Kanban candidato
- Tabelas/cards módulos
