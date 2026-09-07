# Plano de Reorganização — `src/pages/`

## Estado atual

- `src/pages/` raiz: 24 páginas públicas soltas + `NotFound.tsx` + `Dashboard.tsx`
- `src/pages/auth/`: 5 arquivos
- `src/pages/candidato/`: 9 arquivos
- `src/pages/dashboard/`: ~65 páginas admin + 11 relatórios
- `src/pages/finance/`: 2 arquivos
- `src/pages/primeiro-acesso/`: 2 arquivos
- `src/pages/__tests__/`: 1 arquivo

## Proposta de estrutura destino

```
src/pages/
├── public/
│   ├── home/
│   │   └── Home.tsx
│   ├── about/
│   │   └── Sobre.tsx
│   ├── services/
│   │   ├── Servicos.tsx
│   │   └── ServicoDetalhe.tsx
│   ├── jobs/
│   │   ├── Vagas.tsx
│   │   └── VagaDetalhe.tsx
│   ├── companies/
│   │   ├── Empresas.tsx
│   │   ├── EmpresaDetalhe.tsx
│   │   └── DivulgarVaga.tsx
│   ├── candidates/
│   │   └── Candidatos.tsx
│   ├── blog/
│   │   └── Blog.tsx
│   ├── partners/
│   │   └── Parceiros.tsx
│   ├── suppliers/
│   │   └── Fornecedores.tsx
│   ├── clients/
│   │   └── Clientes.tsx
│   ├── recruitment/
│   │   └── ProcessoSeletivo.tsx
│   ├── careers/
│   │   └── TrabalheConosco.tsx
│   ├── support/
│   │   └── Suporte.tsx
│   ├── faq/
│   │   └── FAQ.tsx
│   ├── contact/
│   │   └── Contato.tsx
│   ├── privacy/
│   │   └── Privacidade.tsx
│   ├── terms/
│   │   └── Termos.tsx
│   └── not-found/
│       └── NotFound.tsx
├── auth/
│   ├── Login.tsx          ← movido de raiz
│   ├── Entrar.tsx
│   ├── EntrarContexto.tsx
│   ├── AuthCallback.tsx
│   ├── BoasVindas.tsx
│   └── Termos.tsx
├── candidate/
│   ├── Dashboard.tsx
│   ├── Vagas.tsx
│   ├── Candidaturas.tsx
│   ├── Favoritas.tsx
│   ├── Curriculo.tsx
│   ├── Perfil.tsx
│   ├── Alertas.tsx
│   ├── Configuracoes.tsx
│   └── Notificacoes.tsx
├── admin/
│   ├── DashboardHome.tsx
│   ├── TenantsPage.tsx
│   ├── ClientesPage.tsx
│   ├── OnboardingPage.tsx
│   ├── AssinaturasPage.tsx
│   ├── GestaoSaaSPage.tsx
│   ├── CatalogoPage.tsx
│   ├── DocumentosPage.tsx
│   ├── ContratosPage.tsx
│   ├── TermosPage.tsx
│   ├── LgpdPage.tsx
│   ├── SegurancaPage.tsx
│   ├── MonitoramentoPage.tsx
│   ├── IntegracoesPage.tsx
│   ├── FiscalPage.tsx
│   ├── ContabilidadePage.tsx
│   ├── Estoque.tsx
│   ├── Almoxarifado.tsx
│   ├── Servicos.tsx
│   ├── Suporte.tsx
│   ├── FaturamentoPage.tsx
│   ├── AuditoriaPage.tsx
│   ├── IaPage.tsx
│   ├── GestaoPage.tsx
│   ├── GlobalDashboardPage.tsx
│   ├── ComingSoonPage.tsx
│   ├── VisaoGeral.tsx
│   ├── Vagas.tsx
│   ├── Candidaturas.tsx
│   ├── Candidatos.tsx
│   ├── CandidatoDetalhe.tsx
│   ├── CandidatoHabilidades.tsx
│   ├── CandidatoFormacao.tsx
│   ├── CandidatoExperiencias.tsx
│   ├── CandidatoIdiomas.tsx
│   ├── CandidatoDocumentos.tsx
│   ├── CandidatoPreferencias.tsx
│   ├── CandidatoVisualizacoes.tsx
│   ├── JobMatches.tsx
│   ├── Empresas.tsx
│   ├── Parceiros.tsx
│   ├── Fornecedores.tsx
│   ├── UsuariosPage.tsx
│   ├── ProcessosSeletivosPage.tsx
│   ├── EtapasPage.tsx
│   ├── FuncionariosPage.tsx
│   ├── FuncionarioDetalhe.tsx
│   ├── ExperienciasPage.tsx
│   ├── FormacaoPage.tsx
│   ├── CursosPage.tsx
│   ├── IdiomasPage.tsx
│   ├── HabilidadesPage.tsx
│   ├── DocumentosRhPage.tsx
│   ├── BancoDeTalentos.tsx
│   ├── DashboardRhPage.tsx
│   ├── FinanceiroPage.tsx
│   ├── EstoquePage.tsx
│   ├── Relatorios.tsx
│   ├── Configuracoes.tsx
│   ├── RbacAuditPage.tsx
│   ├── RolesPermissoesPage.tsx
│   ├── CompanyRelationshipsPage.tsx
│   ├── SkillsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── ApplicationDetailPage.tsx
│   ├── SessoesPage.tsx
│   ├── FluxoDeCaixaPage.tsx
│   ├── ContasReceberPage.tsx
│   ├── BancosPage.tsx
│   ├── CentroCustosPage.tsx
│   ├── UnderConstruction.tsx
│   └── financeiro/
│       ├── Categorias.tsx
│       ├── CentrosCusto.tsx
│       ├── Conciliacao.tsx
│       ├── ContasFinanceiras.tsx
│       ├── NotasFiscais.tsx
│       ├── Parcelamentos.tsx
│       └── Transacoes.tsx
├── finance/
│   ├── AccountsPayableList.tsx
│   └── AccountsReceivableList.tsx
├── first-access/
│   ├── Senha.tsx
│   └── Termos.tsx
└── __tests__/
    └── Login.contextual.test.tsx
```

## Duplicações identificadas

| Arquivo antigo             | Possível duplicata                       | Ação sugerida                   |
| -------------------------- | ---------------------------------------- | ------------------------------- |
| `src/pages/Dashboard.tsx`  | `src/pages/dashboard/DashboardHome.tsx`  | Verificar se são a mesma página |
| `src/pages/Clientes.tsx`   | `src/pages/dashboard/ClientesPage.tsx`   | Verificar diferença             |
| `src/pages/Empresas.tsx`   | `src/pages/dashboard/Empresas.tsx`       | Verificar diferença             |
| `src/pages/Financeiro.tsx` | `src/pages/dashboard/FinanceiroPage.tsx` | Verificar diferença             |
| `src/pages/Servicos.tsx`   | `src/pages/dashboard/Servicos.tsx`       | Verificar diferença             |
| `src/pages/Suporte.tsx`    | `src/pages/dashboard/Suporte.tsx`        | Verificar diferença             |
| `src/pages/Termos.tsx`     | `src/pages/dashboard/TermosPage.tsx`     | Verificar diferença             |

## Pré-requisitos antes da movimentação

1. Aprovar este plano
2. Mapear todas as rotas em `App.tsx`
3. Mapear todos os imports de páginas em todo o código
4. Criar script de migração de imports para evitar quebras
5. Executar `npm run typecheck` e testes após cada lote

## Impacto estimado

- 90+ arquivos `.tsx` movidos
- ~10 arquivos com imports atualizados em `App.tsx`
- Possíveis imports adicionais em: `src/components/layout/*`, `src/components/dashboard/*`, testes

**Nenhuma movimentação será executada sem aprovação deste plano.**
