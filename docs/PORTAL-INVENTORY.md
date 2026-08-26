# Portal Inventory

**Data:** 2026-08-25  
**Escopo:** Rotas, páginas, módulos, features e mapeamento atual do Portal  
**Objetivo:** Base para cruzamento RBAC real → Portal sem regressão visual

---

## 1. Rotas Públicas (App.tsx)

| Rota                      | Página                 | Descrição                  |
| ------------------------- | ---------------------- | -------------------------- |
| `/`                       | `Home`                 | Landing page               |
| `/vagas`                  | `Vagas`                | Listagem de vagas públicas |
| `/vagas/:slug`            | `VagaDetalhe`          | Detalhe de vaga            |
| `/empresas`               | `Empresas`             | Listagem de empresas       |
| `/empresas/divulgar-vaga` | `DivulgarVaga`         | Divulgar vaga              |
| `/candidatos`             | `Candidatos`           | Listagem de candidatos     |
| `/servicos`               | `Servicos`             | Catálogo de serviços       |
| `/servicos/:slug`         | `ServicoDetalhe`       | Detalhe de serviço         |
| `/clientes`               | `Clientes`             | Página de clientes         |
| `/parceiros`              | `Parceiros`            | Página de parceiros        |
| `/fornecedores`           | `Fornecedores`         | Página de fornecedores     |
| `/trabalhe-conosco`       | `TrabalheConosco`      | Trabalhe conosco           |
| `/processo-seletivo`      | `ProcessoSeletivo`     | Processo seletivo público  |
| `/sobre`                  | `Sobre`                | Sobre a empresa            |
| `/blog`                   | `Blog`                 | Blog                       |
| `/blog/:slug`             | `Blog`                 | Post do blog               |
| `/suporte`                | `Suporte`              | Suporte público            |
| `/faq`                    | `FAQ`                  | FAQ                        |
| `/contato`                | `Contato`              | Contato                    |
| `/privacidade`            | `Privacidade`          | Política de privacidade    |
| `/termos`                 | `Termos`               | Termos de uso              |
| `/login`                  | `Login`                | Login                      |
| `/cadastro`               | `Cadastro`             | Cadastro                   |
| `/recuperar-senha`        | `RecuperarSenha`       | Recuperar senha            |
| `/cadastro/candidato`     | `CadastroCandidato`    | Cadastro de candidato      |
| `/cadastro/empresa`       | `CadastroEmpresa`      | Cadastro de empresa        |
| `/onboarding`             | `Onboarding`           | Onboarding público         |
| `/primeiro-acesso/termos` | `PrimeiroAcessoTermos` | Aceite de termos           |
| `/primeiro-acesso/senha`  | `PrimeiroAcessoSenha`  | Troca de senha obrigatória |

---

## 2. Rotas do Dashboard (App.tsx)

Rotas geradas dinamicamente a partir de `getAvailableModules([], scope)` + `MODULE_PAGE_MAP` + `MODULE_PERMISSION_MAP`.

| Rota                                    | Módulo               | Página              | Permission Guard            |
| --------------------------------------- | -------------------- | ------------------- | --------------------------- |
| `/dashboard`                            | `inicio`             | `DashboardHome`     | —                           |
| `/dashboard/tenants`                    | `tenants`            | `TenantsPage`       | `tenants.read`              |
| `/dashboard/clientes`                   | `clientes`           | `ClientesPage`      | `companies.read`            |
| `/dashboard/onboarding`                 | `onboarding`         | `OnboardingPage`    | `tenants.read`              |
| `/dashboard/assinaturas`                | `assinaturas`        | `AssinaturasPage`   | `finance.read`              |
| `/dashboard/gestao-saas`                | `gestao-saas`        | `GestaoSaaSPage`    | `domain_events.read`        |
| `/dashboard/usuarios`                   | `usuarios`           | `UsuariosPage`      | `people.read`               |
| `/dashboard/roles-permissoes`           | `roles-permissoes`   | `ConfiguracoesPage` | `roles.read`                |
| `/dashboard/auditoria`                  | `auditoria`          | `VisaoGeral`        | `audit.read`                |
| `/dashboard/documentos`                 | `documentos`         | `DocumentosPage`    | `files.read`                |
| `/dashboard/contratos`                  | `contratos`          | `ContratosPage`     | —                           |
| `/dashboard/termos`                     | `termos`             | `TermosPage`        | —                           |
| `/dashboard/rh`                         | `rh`                 | `VisaoGeral`        | `people.read`               |
| `/dashboard/recrutamento`               | `recrutamento`       | `VagasPage`         | `jobs.read`                 |
| `/dashboard/financeiro`                 | `financeiro`         | `FinanceiroPage`    | `finance.dashboard.read`    |
| `/dashboard/fiscal`                     | `fiscal`             | `FiscalPage`        | `fiscal.dashboard.read`     |
| `/dashboard/contabilidade`              | `contabilidade`      | `ContabilidadePage` | `accounting.dashboard.read` |
| `/dashboard/gestao`                     | `gestao`             | `EmpresasPage`      | `companies.read`            |
| `/dashboard/estoque`                    | `estoque`            | `EstoquePage`       | —                           |
| `/dashboard/servicos`                   | `servicos`           | `ServicosPage`      | —                           |
| `/dashboard/suporte`                    | `suporte`            | `SuportePage`       | —                           |
| `/dashboard/relatorios`                 | `relatorios`         | `RelatoriosPage`    | `domain_events.read`        |
| `/dashboard/ia`                         | `ia`                 | `VisaoGeral`        | —                           |
| `/dashboard/configuracoes`              | `configuracoes-saas` | `ConfiguracoesPage` | `tenant.manage`             |
| `/dashboard/integracoes`                | `integracoes`        | `IntegracoesPage`   | `integrations.manage`       |
| `/dashboard/configuracoes/preferencias` | `preferencias`       | `ConfiguracoesPage` | —                           |
| `/dashboard/configuracoes/conta`        | `minha-conta`        | `ConfiguracoesPage` | —                           |
| `/dashboard/configuracoes/seguranca`    | `seguranca-conta`    | `SegurancaPage`     | —                           |

> **Observação:** Rotas com permission guard vazio (`''`) estão acessíveis a qualquer usuário autenticado do dashboard.

---

## 3. Rotas Legacy do Dashboard (DashboardRouter.tsx)

Além das rotas dinâmicas do App.tsx, existe um roteador legado com rotas fixas:

| Rota                             | Página               | Permission             |
| -------------------------------- | -------------------- | ---------------------- |
| `/dashboard`                     | `VisaoGeral`         | —                      |
| `/dashboard/vagas`               | `Vagas`              | `jobs.read`            |
| `/dashboard/candidatos`          | `Candidatos`         | `candidates.read`      |
| `/dashboard/empresas`            | `Empresas`           | `companies.read`       |
| `/dashboard/clientes`            | `Clientes`           | `companies.read`       |
| `/dashboard/parceiros`           | `Parceiros`          | `companies.read`       |
| `/dashboard/fornecedores`        | `Fornecedores`       | `companies.read`       |
| `/dashboard/usuarios`            | `Usuarios`           | `people.read`          |
| `/dashboard/processos-seletivos` | `ProcessosSeletivos` | `recruitment.read`     |
| `/dashboard/servicos`            | `Servicos`           | `service_orders.read`  |
| `/dashboard/financeiro`          | `Financeiro`         | `purchase_orders.read` |
| `/dashboard/estoque`             | `Estoque`            | `stock_movements.read` |
| `/dashboard/suporte`             | `Suporte`            | `support_tickets.read` |
| `/dashboard/relatorios`          | `Relatorios`         | `reports.read`         |
| `/dashboard/configuracoes`       | `Configuracoes`      | `tenants.read`         |

> **Ação necessária:** Consolidar estas rotas no App.tsx ou removê-las para evitar duplicação.

---

## 4. Módulos do Portal (ModuleRegistry.ts)

### 4.1 Categorias

| Categoria    | Ordem | Rótulo         |
| ------------ | ----- | -------------- |
| `inicio`     | 0     | INÍCIO         |
| `plataforma` | 1     | PLATAFORMA     |
| `negocio`    | 2     | OPERAÇÃO       |
| `ia`         | 3     | IA & AUTOMAÇÃO |
| `seguranca`  | 4     | SEGURANÇA      |
| `documentos` | 5     | DOCUMENTOS     |
| `conta`      | 6     | CONTA          |

### 4.2 Módulos Platform

| ID                   | Título             | Rota                          | Permissão Mínima      |
| -------------------- | ------------------ | ----------------------------- | --------------------- |
| `tenants`            | Tenants            | `/dashboard/tenants`          | `tenants.read`        |
| `clientes`           | Clientes           | `/dashboard/clientes`         | `companies.read`      |
| `onboarding`         | Onboarding         | `/dashboard/onboarding`       | `tenants.read`        |
| `assinaturas`        | Assinaturas        | `/dashboard/assinaturas`      | `finance.read`        |
| `gestao-saas`        | Gestão SaaS        | `/dashboard/gestao-saas`      | `domain_events.read`  |
| `usuarios`           | Usuários           | `/dashboard/usuarios`         | `people.read`         |
| `roles-permissoes`   | Roles & Permissões | `/dashboard/roles-permissoes` | `roles.read`          |
| `auditoria`          | Auditoria          | `/dashboard/auditoria`        | `audit.read`          |
| `integracoes`        | Integrações        | `/dashboard/integracoes`      | `integrations.manage` |
| `configuracoes-saas` | Configurações SaaS | `/dashboard/configuracoes`    | `tenant.manage`       |

### 4.3 Módulos Tenant

| ID                | Título         | Rota                                    | Permissão Mínima                |
| ----------------- | -------------- | --------------------------------------- | ------------------------------- |
| `inicio`          | Início         | `/dashboard`                            | —                               |
| `documentos`      | Documentos     | `/dashboard/documentos`                 | `files.read`                    |
| `contratos`       | Contratos      | `/dashboard/contratos`                  | —                               |
| `termos`          | Termos         | `/dashboard/termos`                     | —                               |
| `rh`              | RH             | `/dashboard/rh`                         | `people.read`                   |
| `recrutamento`    | Recrutamento   | `/dashboard/recrutamento`               | `jobs.read` + `candidates.read` |
| `financeiro`      | Financeiro     | `/dashboard/financeiro`                 | `finance.dashboard.read`        |
| `fiscal`          | Fiscal         | `/dashboard/fiscal`                     | `fiscal.dashboard.read`         |
| `contabilidade`   | Contabilidade  | `/dashboard/contabilidade`              | `accounting.dashboard.read`     |
| `gestao`          | Gestão         | `/dashboard/gestao`                     | `companies.read`                |
| `estoque`         | Estoque        | `/dashboard/estoque`                    | `stock_movements.read`          |
| `servicos`        | Serviços       | `/dashboard/servicos`                   | —                               |
| `suporte`         | Suporte        | `/dashboard/suporte`                    | `support_tickets.read`          |
| `relatorios`      | Relatórios     | `/dashboard/relatorios`                 | `reports.read`                  |
| `ia`              | IA & Automação | `/dashboard/ia`                         | —                               |
| `preferencias`    | Preferências   | `/dashboard/configuracoes/preferencias` | —                               |
| `minha-conta`     | Minha conta    | `/dashboard/configuracoes/conta`        | —                               |
| `seguranca-conta` | Segurança      | `/dashboard/configuracoes/seguranca`    | —                               |

---

## 5. Páginas Existentes

| Página                   | Arquivo                                          | Módulo(s)                                                               | Status                           |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------- |
| `DashboardHome`          | `src/pages/dashboard/DashboardHome.tsx`          | `inicio`                                                                | ✅                               |
| `TenantsPage`            | `src/pages/dashboard/TenantsPage.tsx`            | `tenants`                                                               | ✅                               |
| `ClientesPage`           | `src/pages/dashboard/ClientesPage.tsx`           | `clientes`                                                              | ✅                               |
| `OnboardingPage`         | `src/pages/dashboard/OnboardingPage.tsx`         | `onboarding`                                                            | ✅                               |
| `AssinaturasPage`        | `src/pages/dashboard/AssinaturasPage.tsx`        | `assinaturas`                                                           | ✅                               |
| `GestaoSaaSPage`         | `src/pages/dashboard/GestaoSaaSPage.tsx`         | `gestao-saas`                                                           | ✅                               |
| `CatalogoPage`           | `src/pages/dashboard/CatalogoPage.tsx`           | `servicos`                                                              | ✅                               |
| `DocumentosPage`         | `src/pages/dashboard/DocumentosPage.tsx`         | `documentos`                                                            | ✅                               |
| `ContratosPage`          | `src/pages/dashboard/ContratosPage.tsx`          | `contratos`                                                             | ✅                               |
| `TermosPage`             | `src/pages/dashboard/TermosPage.tsx`             | `termos`                                                                | ✅                               |
| `LgpdPage`               | `src/pages/dashboard/LgpdPage.tsx`               | —                                                                       | ⚠️ Não mapeado no ModuleRegistry |
| `SegurancaPage`          | `src/pages/dashboard/SegurancaPage.tsx`          | `seguranca-conta`                                                       | ✅                               |
| `MonitoramentoPage`      | `src/pages/dashboard/MonitoramentoPage.tsx`      | —                                                                       | ⚠️ Não mapeado no ModuleRegistry |
| `IntegracoesPage`        | `src/pages/dashboard/IntegracoesPage.tsx`        | `integracoes`                                                           | ✅                               |
| `FiscalPage`             | `src/pages/dashboard/FiscalPage.tsx`             | `fiscal`                                                                | ✅                               |
| `ContabilidadePage`      | `src/pages/dashboard/ContabilidadePage.tsx`      | `contabilidade`                                                         | ✅                               |
| `RbacAuditPage`          | `src/pages/dashboard/RbacAuditPage.tsx`          | `auditoria`                                                             | ✅                               |
| `VisaoGeralPage`         | `src/pages/dashboard/VisaoGeral.tsx`             | `auditoria`, `rh`, `ia`                                                 | ✅                               |
| `VagasPage`              | `src/pages/dashboard/VagasPage.tsx`              | `recrutamento`                                                          | ✅                               |
| `CandidatosPage`         | `src/pages/dashboard/CandidatosPage.tsx`         | `recrutamento`                                                          | ✅                               |
| `EmpresasPage`           | `src/pages/dashboard/EmpresasPage.tsx`           | `gestao`                                                                | ✅                               |
| `ParceirosPage`          | `src/pages/dashboard/ParceirosPage.tsx`          | —                                                                       | ⚠️ Não mapeado no ModuleRegistry |
| `FornecedoresPage`       | `src/pages/dashboard/FornecedoresPage.tsx`       | —                                                                       | ⚠️ Não mapeado no ModuleRegistry |
| `UsuariosPage`           | `src/pages/dashboard/UsuariosPage.tsx`           | `usuarios`                                                              | ✅                               |
| `ProcessosSeletivosPage` | `src/pages/dashboard/ProcessosSeletivosPage.tsx` | `recrutamento`                                                          | ✅                               |
| `ServicosPage`           | `src/pages/dashboard/ServicosPage.tsx`           | `servicos`                                                              | ✅                               |
| `FinanceiroPage`         | `src/pages/dashboard/FinanceiroPage.tsx`         | `financeiro`                                                            | ✅                               |
| `EstoquePage`            | `src/pages/dashboard/EstoquePage.tsx`            | `estoque`                                                               | ✅                               |
| `SuportePage`            | `src/pages/dashboard/SuportePage.tsx`            | `suporte`                                                               | ✅                               |
| `RelatoriosPage`         | `src/pages/dashboard/RelatoriosPage.tsx`         | `relatorios`                                                            | ✅                               |
| `ConfiguracoesPage`      | `src/pages/dashboard/ConfiguracoesPage.tsx`      | `roles-permissoes`, `configuracoes-saas`, `preferencias`, `minha-conta` | ✅                               |

---

## 6. Mapeamento ModuleRegistry → Página

```typescript
export const MODULE_PAGE_MAP: Record<string, string> = {
  inicio: 'DashboardHome',
  tenants: 'TenantsPage',
  clientes: 'ClientesPage',
  onboarding: 'OnboardingPage',
  assinaturas: 'AssinaturasPage',
  'gestao-saas': 'GestaoSaaSPage',
  usuarios: 'UsuariosPage',
  'roles-permissoes': 'ConfiguracoesPage',
  auditoria: 'VisaoGeral',
  documentos: 'DocumentosPage',
  contratos: 'ContratosPage',
  termos: 'TermosPage',
  rh: 'VisaoGeral',
  recrutamento: 'VagasPage',
  financeiro: 'FinanceiroPage',
  fiscal: 'FiscalPage',
  contabilidade: 'ContabilidadePage',
  gestao: 'EmpresasPage',
  estoque: 'EstoquePage',
  servicos: 'ServicosPage',
  suporte: 'SuportePage',
  relatorios: 'RelatoriosPage',
  ia: 'VisaoGeral',
  'configuracoes-saas': 'ConfiguracoesPage',
  integracoes: 'IntegracoesPage',
  preferencias: 'ConfiguracoesPage',
  'minha-conta': 'ConfiguracoesPage',
  'seguranca-conta': 'SegurancaPage',
};
```

---

## 7. Mapeamento ModuleRegistry → Permission

```typescript
export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  tenants: 'tenants.read',
  clientes: 'companies.read',
  onboarding: 'tenants.read',
  assinaturas: 'finance.read',
  'gestao-saas': 'domain_events.read',
  usuarios: 'people.read',
  'roles-permissoes': 'roles.read',
  auditoria: 'audit.read',
  documentos: 'files.read',
  contratos: '',
  termos: '',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  financeiro: 'finance.dashboard.read',
  fiscal: 'fiscal.dashboard.read',
  contabilidade: 'accounting.dashboard.read',
  gestao: 'companies.read',
  estoque: '',
  servicos: '',
  suporte: '',
  relatorios: 'domain_events.read',
  ia: '',
  'configuracoes-saas': 'tenant.manage',
  integracoes': 'integrations.manage',
  preferencias: '',
  'minha-conta': '',
  'seguranca-conta': '',
};
```

---

## 8. Inventário de Features por Módulo

### 8.1 Tenants

- Listar tenants
- Configurações de tenant

### 8.2 Clientes

- Leads
- Prospects
- Empresas
- Pipeline
- Clientes ativos

### 8.3 Onboarding

- Provisionar
- Configuração

### 8.4 Assinaturas

- Planos
- Renovações

### 8.5 Gestão SaaS

- Dashboard
- MRR / Receita
- Uso da plataforma
- Crescimento

### 8.6 Usuários

- Listar
- Convidar

### 8.7 Roles & Permissões

- Listar roles
- Permissões

### 8.8 Auditoria

- Logs
- Eventos de segurança

### 8.9 Documentos

- Listar
- Pastas
- Compartilhados

### 8.10 Contratos

- Listar
- Modelos

### 8.11 Termos

- Termos de uso
- Privacidade

### 8.12 RH

- Funcionários
- Documentos
- Relatórios

### 8.13 Recrutamento

- Vagas
- Candidatos
- Candidaturas
- Processos seletivos

### 8.14 Financeiro

- Contas a pagar
- Contas a receber
- Fluxo de caixa
- Faturamento
- Conciliação
- Bancos
- Centro de custos
- Fornecedores
- Relatórios

### 8.15 Fiscal

- Notas fiscais
- Notas recebidas
- Retenções
- Relatórios fiscais

### 8.16 Contabilidade

- Plano de contas
- Lançamentos
- Balancetes
- Fechamento
- Relatórios contábeis

### 8.17 Gestão

- Indicadores
- Empresas
- Contratos
- Serviços
- Equipes
- Relatórios

### 8.18 Estoque

- Produtos
- Movimentações

### 8.19 Serviços

- Catálogo
- Ordens de serviço
- Chamados

### 8.20 Suporte

- Chamados
- FAQ
- Feedback
- Solicitações

### 8.21 Relatórios

- RH
- Financeiro
- Gestão

### 8.22 IA & Automação

- Assistente IA
- Automações
- Conversas IA
- Integrações

### 8.23 Integrações

- Supabase
- n8n
- WhatsApp
- E-mail

### 8.24 Configurações SaaS

- Geral
- Módulos

### 8.25 Preferências

- Tema, idioma

### 8.26 Minha conta

- Perfil
- Notificações

### 8.27 Segurança

- Senha
- Sessões

---

## 9. Gaps Identificados

### 9.1 Páginas não mapeadas no ModuleRegistry

| Página              | Arquivo                                     | Ação                                                            |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `LgpdPage`          | `src/pages/dashboard/LgpdPage.tsx`          | Mapear para módulo LGPD ou adicionar ao ModuleRegistry          |
| `MonitoramentoPage` | `src/pages/dashboard/MonitoramentoPage.tsx` | Mapear para módulo Monitoramento ou adicionar ao ModuleRegistry |
| `ParceirosPage`     | `src/pages/dashboard/ParceirosPage.tsx`     | Mapear para módulo Parceiros ou adicionar ao ModuleRegistry     |
| `FornecedoresPage`  | `src/pages/dashboard/Fornecedores.tsx`      | Mapear para módulo Fornecedores ou adicionar ao ModuleRegistry  |
| `Clientes`          | `src/pages/dashboard/Clientes.tsx`          | ⚠️ Duplicata? Verificar relação com `ClientesPage`              |

### 9.2 Rotas duplicadas

- `/dashboard/usuarios` aparece tanto no App.tsx quanto no DashboardRouter.tsx
- `/dashboard/configuracoes` aparece tanto no App.tsx quanto no DashboardRouter.tsx
- `/dashboard/relatorios` aparece tanto no App.tsx quanto no DashboardRouter.tsx

### 9.3 Permissões não encontradas no banco

Foram verificadas todas as permissões referenciadas no ModuleRegistry contra a tabela `permissions`.

**Permissões faltando no banco:**

| Permissão            | Motivo                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `integrations.read`  | Referenciada em features de integrações mas não existe no banco   |
| `ai.read`            | Referenciada em features de IA mas não existe no banco            |
| `ai.create`          | Referenciada em actions de IA mas não existe no banco             |
| `ai.update`          | Referenciada em actions de IA mas não existe no banco             |
| `ai.delete`          | Referenciada em actions de IA mas não existe no banco             |
| `automations.read`   | Referenciada em features de automações mas não existe no banco    |
| `automations.delete` | Referenciada em actions de automações mas não existe no banco     |
| `lgpd.create`        | Referenciada em actions de LGPD mas não existe no banco           |
| `lgpd.update`        | Referenciada em actions de LGPD mas não existe no banco           |
| `lgpd.delete`        | Referenciada em actions de LGPD mas não existe no banco           |
| `tenant.read`        | Referenciada em features de configurações mas não existe no banco |
| `tenant.create`      | Referenciada em actions de configurações mas não existe no banco  |
| `tenant.delete`      | Referenciada em actions de configurações mas não existe no banco  |

> **Ação necessária:** Criar estas permissões no banco ou remover/modificar referências no ModuleRegistry. **Total de permissões verificadas:** 162. **Encontradas no banco:** 149. **Faltando:** 13.

### 9.4 Permissões do ModuleRegistry que usam permissões existentes

A maioria das permissões do ModuleRegistry já existe no banco e está funcionando. As únicas referências que precisam de ajuste são as listadas em 9.3.

---

## 10. Sidebar Atual (DashboardSidebar.tsx)

A sidebar atual é hardcoded com grupos fixos:

| Grupo               | Itens                                       |
| ------------------- | ------------------------------------------- |
| Principal           | Visão Geral                                 |
| Recrutamento & RH   | Vagas, Candidatos, Processos Seletivos      |
| Empresas & Clientes | Empresas, Clientes, Parceiros, Fornecedores |
| Serviços            | Serviços                                    |
| Financeiro          | Financeiro                                  |
| Operacional         | Estoque                                     |
| Suporte             | Suporte                                     |
| Relatórios          | Relatórios                                  |
| Administração       | Usuários, Configurações                     |

> **Ação necessária:** Transformar a sidebar em representação dinâmica do ModuleRegistry, mantendo os mesmos grupos e itens visíveis. A sidebar deve ser gerada a partir de `getAvailableModules()` + `groupModulesByCategory()`, sem bypass `isAdminMaster`.

---

## 11. Cruzamento RBAC → Portal (Matriz)

A matriz completa de cruzamento será gerada na Fase C. Por enquanto, temos:

### 11.1 Módulos com permissões existentes no banco

- `tenants` → `tenants.read` ✅
- `clientes` → `companies.read` ✅
- `onboarding` → `tenants.read` ✅
- `assinaturas` → `finance.read` ✅
- `gestao-saas` → `domain_events.read` ✅
- `usuarios` → `people.read` ✅
- `roles-permissoes` → `roles.read` ✅
- `auditoria` → `audit.read` ✅
- `documentos` → `files.read` ✅
- `contratos` → sem permissão mínima ✅
- `termos` → sem permissão mínima ✅
- `rh` → `people.read` ✅
- `recrutamento` → `jobs.read` + `candidates.read` ✅
- `financeiro` → `finance.dashboard.read` ⚠️ (permissão não existe no banco)
- `fiscal` → `fiscal.dashboard.read` ⚠️ (permissão não existe no banco)
- `contabilidade` → `accounting.dashboard.read` ⚠️ (permissão não existe no banco)
- `gestao` → `companies.read` ✅
- `estoque` → `stock_movements.read` ✅
- `servicos` → sem permissão mínima ✅
- `suporte` → `support_tickets.read` ✅
- `relatorios` → `domain_events.read` ✅
- `ia` → sem permissão mínima ✅
- `configuracoes-saas` → `tenant.manage` ✅
- `integracoes` → `integrations.manage` ✅
- `preferencias` → sem permissão mínima ✅
- `minha-conta` → sem permissão mínima ✅
- `seguranca-conta` → sem permissão mínima ✅

### 11.2 Módulos com permissões faltando no banco

- `financeiro` → `finance.dashboard.read` ⚠️
- `fiscal` → `fiscal.dashboard.read` ⚠️
- `contabilidade` → `accounting.dashboard.read` ⚠️

> **Ação necessária:** Criar estas permissões no banco ou remover/modificar referências no ModuleRegistry.

---

## 12. Próximos Passos

### Fase C — Cruzamento RBAC → Portal

1. **Criar permissões faltantes** no banco ou remover/modificar referências no ModuleRegistry
2. **Mapear páginas não catalogadas** (`LgpdPage`, `MonitoramentoPage`, `ParceirosPage`, `FornecedoresPage`) para módulos existentes ou criar novos módulos
3. **Consolidar rotas duplicadas** (App.tsx vs DashboardRouter.tsx)
4. **Criar matriz de cruzamento completa:**
   ```
   permission → feature → module → route → página → ação CRUD
   ```

### Fase D — Reconstrução da Navegação

1. **Sidebar dinâmica** baseada em ModuleRegistry + permissões do usuário
2. **DashboardHome** como Gestão Analítica (não lista de módulos)
3. **"Meus módulos"** como catálogo de aplicações disponíveis
4. **Header** com menu do usuário (perfil, tema, sair)

### Fase E — Testes

1. Validar acesso por role:
   - `admin_master`
   - `tenant_admin`
   - `finance_manager` (após corrigir permissões)
   - `rh_manager`
   - `recruiter`
2. Validar cada módulo, página e ação CRUD
