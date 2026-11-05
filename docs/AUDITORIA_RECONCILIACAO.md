# AUDITORIA DE RECONCILIAÇÃO - ARQUITETURA CHECK BOULER 24H

Data: 2026-11-05 03:51:59

## 1. MATRIZ DE DUPLICIDADES IDENTIFICADAS

| Funcionalidade                             | Implementação existente                                                                                                                          | Duplicações                                                                                                                                                                                                                           | Implementação canônica                                                                                                                                                     | Ação                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard Admin Master vs Dashboard Global | src/modules/admin-master/dashboard/GlobalDashboardPage.tsx (285 linhas) vs src/pages/dashboard/GlobalDashboardPage.tsx (275 linhas) - DIFERENTES | Ambos existem, ambos carregam GlobalDashboardPage? Atualmente App.tsx importa de modules/admin-master/dashboard/GlobalDashboardPage.tsx para ambas rotas /dashboard/global e /dashboard/admin-master (linhas 38, 516, 524 no App.tsx) | Reutilizar APENAS src/modules/admin-master/dashboard/GlobalDashboardPage.tsx para ambas as rotas AGORA (conforme solicitado), MAS precisam ter responsabilidades separadas | CRÍTICO: Requer refatoração - Admin Master deve ter página própria com responsabilidades de administração global (módulos, células, usuários administrativos, configurações e governança). Dashboard Global deve ter foco em indicadores transversais. Atualmente são o MESMO componente sendo reutilizado. |
| Gestão de Usuários                         | src/pages/dashboard/UsuariosPage.tsx (existe e funcional)                                                                                        | Referenciado em App.tsx linha ~540 e em sidebars                                                                                                                                                                                      | src/pages/dashboard/UsuariosPage.tsx                                                                                                                                       | REUTILIZAR - já adicionado rota /dashboard/usuarios em App.tsx                                                                                                                                                                                                                                              |
| Minha Conta                                | src/pages/MinhaConta.tsx (existe)                                                                                                                | Botões rodapé em sidebars apontam para /minha-conta - já implementado                                                                                                                                                                 | src/pages/MinhaConta.tsx                                                                                                                                                   | REUTILIZAR - já funcional                                                                                                                                                                                                                                                                                   |
| Gestão de Candidatos                       | src/pages/dashboard/Candidatos.tsx + src/modules/recrutamento/* + src/modules/candidato/*                                                        | Recrutamento tem gestão, candidato tem portal pessoal                                                                                                                                                                                 | Separação correta: /candidato/* é portal pessoal do candidato (célula candidato). Gestão administrativa em Recrutamento. Removido "" da navegação master                   | MANTER SEPARAÇÃO - correto                                                                                                                                                                                                                                                                                  |
| AdminSidebar vs AdminMasterSidebar         | src/modules/admin/AdminSidebar/index.tsx vs src/modules/admin-master/sidebar/AdminMasterSidebar.tsx                                              | Diferentes responsabilidades - AdminSidebar usado pelo AppShell/rotas gerais, AdminMasterSidebar pela célula admin-master                                                                                                             | Ambos válidos para contextos diferentes                                                                                                                                    | MANTER - responsabilidades distintas                                                                                                                                                                                                                                                                        |
| Recrutamento Routes Duplicados             | src/modules/recrutamento/RecrutamentoRoutes.tsx vs src/modules/recrutamento/RecrutamentoRoutes/index.ts                                          | Possível duplicação - mencionado no estado atual                                                                                                                                                                                      | Necessita verificação                                                                                                                                                      | AUDITAR                                                                                                                                                                                                                                                                                                     |

## 2. SIDEBARS ATUAIS

### AdminMasterSidebar (src/modules/admin-master/sidebar/AdminMasterSidebar.tsx)

- Navegação fixa com itens: Dashboard Admin Master, Dashboard Global, Recrutamento, Gestão de Usuários, Tenants, Empresas, Pessoas, Vagas, Candidaturas, Ordens de Serviço, Suporte, Auditoria, Segurança
- Footer clicável para /minha-conta (corrigido)
- Filtra por permissões via hasPermission
- Usa useAuth() para permissões e person
- **PROBLEMA**: Navegação FIXA - não descobre dinamicamente via CellRegistry/Supabase

### AdminSidebar (src/modules/admin/AdminSidebar/index.tsx)

- Usa CellRegistry.getEnabled() para gerar itens dinamicamente
- Filtra por scope via platform.effectiveScopes
- Ordena colocando admin-master/global primeiro
- Footer clicável para /minha-conta (precisa verificar navegação)
- Fallback para lista fixa se CellRegistry vazio
- **MAIS PRÓXIMO** da abordagem dinâmica desejada

## 3. CELLREGISTRY

- 26 células registradas (conforme register-cells.ts)
- CellRegistry tem métodos: register, validateCell, getEnabled(), etc.
- Suporta SaaSCellContract com gates CELL-01 a CELL-09
- DispatcherMaster registra células via registerCell()

## 4. DISPATCHERMASTER

- resolveDestination() é autoridade única para pós-login
- Já ajustado para admin_master ir para /dashboard/admin-master
- Usa contexto de identidade, permissões, roles
- Default DENY
- Coordena entrada mas não controla internamente células

## 5. TABELAS DE NAVEGAÇÃO NO SUPABASE

- candidate_portal_modules (usado pelo portal candidato via navigation.repository.ts)
- global_navigation_links (usado globalmente via navigation.repository.ts)
- Usadas por useNavigation hook e filterNavigation
- Atualmente focadas em portal candidato/global

## 6. SITUAÇÃO ATUAL vs DESEJADO

### O QUE FOI FEITO (avanços):

✅ Rotas reorganizadas: /dashboard/admin-master criado, /dashboard/global separado
✅ AdminMasterSidebar atualizado conforme especificado
✅ "Candidato" removido da navegação master dos funcionários  
✅ Footer clicável para /minha-conta
✅ Rota /dashboard/usuarios adicionada
✅ AdminMaster redireciona para /dashboard/admin-master
✅ TypeScript compila

### O QUE FALTA (conforme especificação):

❌ Sidebar Master dinâmico consultando CellRegistry + Supabase catalog + permissões
❌ Superlinks com navegação contextual e botão voltar
❌ Descoberta dinâmica de células sem editar código
❌ Integração catálogo código + Supabase
❌ Validação rota/permissão/escopo antes de apresentar links
❌ Gestão administrativa de módulos e navegação
❌ Admin Master page separada do Dashboard Global (ambos usam mesmo componente)
❌ Garantia de células indisponíveis não derrubarem sistema
❌ Testes de acesso ROOT, gestor, funcionário, candidato

## PRÓXIMOS PASSOS RECOMENDADOS

1. **CRÍTICO - Separar Admin Master do Dashboard Global**: Criar componente específico para /dashboard/admin-master com responsabilidades de administração global (módulos, células, governança). Dashboard Global deve manter foco em indicadores transversais.
2. **Implementar navegação dinâmica**: Estender AdminSidebar ou criar novo mecanismo que consulte CellRegistry + catálogo Supabase + permissões reais
3. **Auditar schema Supabase**: Verificar tabelas existentes para módulos/navegação além das já identificadas
4. **Implementar superlinks**: Sistema de grupos com navegação contextual
5. **Gestão administrativa**: Criar área para gerenciar módulos/navegação
6. **Testes e validação**

**NUNCA** criar tabelas/migrations sem autorização explícita.
