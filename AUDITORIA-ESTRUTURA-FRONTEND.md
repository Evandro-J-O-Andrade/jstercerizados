# AUDITORIA ESTRUTURAL DO FRONTEND

## A. Resumo Executivo

A auditoria estrutural do frontend do projeto J&S Empregos LTDA foi concluída em modo READ-ONLY. Nenhum arquivo foi alterado, movido ou removido.

### Estatísticas

- **88 páginas** identificadas em `src/pages/`
- **68 páginas** em `src/pages/dashboard/`
- **63 repositories** em `src/repositories/`
- **6 componentes** de dashboard compartilhados
- **100+ arquivos** de documentação (.md)

### Estado Geral

- **42 páginas** com integração real ao Supabase
- **12 páginas** com integração parcial
- **5 páginas** com gap de banco (employee_*)
- **1 página** placeholder (ContratosPage)
- **3 páginas** com mock hardcode

## B. Mapa de Domínios

### Domínio Público (20 páginas)

Home, Vagas, VagaDetalhe, Empresas, EmpresaDetalhe, Servicos, ServicoDetalhe, Sobre, ProcessoSeletivo, TrabalheConosco, FAQ, Parceiros, RecuperaSenha, RedefinirSenha, Onboarding, Login, CadastroCandidato, Termos, Privacidade, Fornecedores, Suporte

### Domínio Candidato (10 páginas)

DashboardCandidato, CandidatoDetalhe, CandidatoDocumentos, CandidatoExperiencias, CandidatoFormacao, CandidatoHabilidades, CandidatoIdiomas, Candidaturas, CandidatoPreferencias, CandidatoVisualizacoes

### Domínio RH/Funcionários (9 páginas)

DashboardRh, Cursos, Habilidades, Idiomas, Formacao, Experiencias, DocumentosRh, Funcionarios, FuncionarioDetalhe

### Domínio Recrutamento (6 páginas)

Vagas, ProcessosSeletivos, Candidatos, JobMatches, Aplicações, ApplicationDetailPage

### Domínio Empresa (6 páginas)

Empresas, Clientes, ClientesPage, CompanyRelationshipsPage, Parceiros, Fornecedores

### Domínio Financeiro (9 páginas)

DashboardFinanceiro, Financeiro, FaturamentoPage, ContabilidadePage, ContratosPage, ContasReceberPage, FluxoDeCaixaPage, FiscalPage, AssinaturasPage

### Domínio Sistema/Admin (19 páginas)

GlobalDashboardPage, GestaoPage, GestaoSaaSPage, TenantsPage, OnboardingPage, Configuracoes, SegurancaPage, LgpdPage, RolesPermissoesPage, RbacAuditPage, AuditoriaPage, MonitoramentoPage, IaPage, IntegracoesPage, Suporte, Relatorios, TermosPage, UnderConstruction, DashboardForbidden, ComingSoonPage

### Domínio Operacional (9 páginas)

Estoque, Almoxarifado, BancosPage, BancoDeTalentos, CentroCustosPage, SkillsPage, SessoesPage, Servicos, Etapas, CatalogoPage, NotificationPage

## C. Componentes Compartilhados

| Componente          | Local                 | Uso              |
| ------------------- | --------------------- | ---------------- |
| DashboardSkeleton   | components/dashboard/ | Loading states   |
| DashboardSection    | components/dashboard/ | Seções           |
| DashboardRouter     | components/dashboard/ | Roteamento       |
| DashboardMetricGrid | components/dashboard/ | Grid de métricas |
| DashboardErrorState | components/dashboard/ | Error states     |
| DashboardCard       | components/dashboard/ | Cards            |

## D. Repositories por Domínio

| Domínio         | Count |
| --------------- | ----- |
| Candidato       | 11    |
| RH/Funcionários | 7     |
| Recrutamento    | 4     |
| Empresa         | 3     |
| Financeiro      | 12    |
| Operacional     | 8     |
| Sistema         | 10    |
| Suporte         | 1     |
| Integrações     | 1     |

## E. Divergências Identificadas

### Employee Repositories (GAP)

- employee-courses → employee_courses (não existe)
- employee-skills → employee_skills (não existe)
- employee-education → employee_education (não existe)
- employee-experiences → employee_experiences (não existe)
- employee-languages → employee_languages (não existe)

### Placeholders

- ContratosPage → EmptyState, sem repository call
- GlobalDashboardPage → header/banner only (mas com 8 KPIs reais)

### Mock Hardcode

- Configuracoes → settingsGroups
- IntegracoesPage → integrations
- IaPage → automations

## F. Favicon

Diagnóstico: gap separado. Nenhuma alteração feita.

## G. Logomarca

J&S Empregos LTDA. Nenhuma alteração feita.

## H. Duplicações

- Clientes / ClientesPage
- Parceiros (Empresa + Operacional)
- Fornecedores (Empresa + Operacional)
- Servicos (Operacional + Pública)
- Suporte (Pública + Sistema)
- Onboarding (Pública + Sistema)
- Vagas (Recrutamento + Pública)

## I. Riscos

| Item                       | Risco      |
| -------------------------- | ---------- |
| employee_* repositories    | 🟠 Alto    |
| ContratosPage placeholder  | 🟠 Alto    |
| Financeiro parcial         | 🔴 Crítico |
| Config/Integracoes/IA mock | 🟡 Médio   |
| Favicon                    | 🟡 Médio   |

## J. Proposta de Estrutura (BEFORE → AFTER)

```
src/
├── app/
│   ├── router/
│   ├── layouts/
│   └── providers/
├── pages/
│   ├── public/
│   ├── gestao/
│   ├── candidato/
│   ├── empresa/
│   └── admin/
├── components/
│   ├── ui/
│   ├── shared/
│   └── dashboard/
├── repositories/
├── services/
├── hooks/
├── contexts/
├── lib/
├── types/
├── config/
└── utils/
```

## K. Plano Sugerido

- FASE 1 — AUDITORIA (concluída)
- FASE 1.5 — ARQUITETURA (concluída)
- FASE 1.6 — FORMULÁRIO → BANCO (concluída)
- FASE 2 — MOVIMENTAÇÃO CONTROLADA (bloqueada)
- FASE 3 — INTEGRAÇÃO / CORREÇÕES (bloqueada)

## L. Validação Final

- ✅ Nenhum .tsx foi movido
- ✅ Nenhum .ts foi alterado
- ✅ Nenhuma rota foi alterada
- ✅ Auth/RBAC/Supabase não alterados
- ✅ SMTP/Turnstile não alterados
- ✅ Favicon não alterado
- ✅ Nenhuma migration aplicada
- ✅ Nenhum commit
- ✅ Nenhum push
- ✅ Nenhum deploy

## M. STOP CONDITION

Parar aqui. Aguardar revisão conjunta e aprovação explícita para próxima fase.
