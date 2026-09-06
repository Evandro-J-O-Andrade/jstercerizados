# Inventário Estrutural do Frontend

## Estrutura atual de `src/`

```
src/
├── App.tsx
├── main.tsx
├── ai/
├── animations/
├── components/
│   ├── auth/
│   ├── candidate/
│   ├── common/
│   ├── dashboard/
│   ├── error/
│   ├── fallback/
│   ├── feedback/
│   ├── forms/
│   ├── layout/
│   ├── modules/
│   ├── portal/
│   ├── sections/
│   └── ui/
├── config/
├── constants/
├── content/
├── contexts/
├── hooks/
├── lib/
├── mock/
├── pages/
│   ├── __tests__/
│   ├── AlterarSenha.tsx
│   ├── Blog.tsx
│   ├── Cadastro.tsx
│   ├── CadastroCandidato.tsx
│   ├── CadastroEmpresa.tsx
│   ├── Candidatos.tsx
│   ├── Clientes.tsx
│   ├── Contato.tsx
│   ├── Dashboard.tsx
│   ├── DivulgarVaga.tsx
│   ├── EmpresaDetalhe.tsx
│   ├── Empresas.tsx
│   ├── FAQ.tsx
│   ├── Fornecedores.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── NotFound.tsx
│   ├── Onboarding.tsx
│   ├── Parceiros.tsx
│   ├── Privacidade.tsx
│   ├── ProcessoSeletivo.tsx
│   ├── RecuperarSenha.tsx
│   ├── RedefinirSenha.tsx
│   ├── ServicoDetalhe.tsx
│   ├── Servicos.tsx
│   ├── Sobre.tsx
│   ├── Suporte.tsx
│   ├── Termos.tsx
│   ├── TrabalheConosco.tsx
│   ├── VagaDetalhe.tsx
│   ├── Vagas.tsx
│   ├── auth/
│   │   ├── AuthCallback.tsx
│   │   ├── BoasVindas.tsx
│   │   ├── Entrar.tsx
│   │   ├── EntrarContexto.tsx
│   │   └── Termos.tsx
│   ├── candidato/
│   │   ├── Alertas.tsx
│   │   ├── Candidaturas.tsx
│   │   ├── Configuracoes.tsx
│   │   ├── Curriculo.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Favoritas.tsx
│   │   ├── Notificacoes.tsx
│   │   ├── Perfil.tsx
│   │   └── Vagas.tsx
│   ├── dashboard/
│   │   ├── Almoxarifado.tsx
│   │   ├── ApplicationDetailPage.tsx
│   │   ├── AssinaturasPage.tsx
│   │   ├── AuditoriaPage.tsx
│   │   ├── BancoDeTalentos.tsx
│   │   ├── BancosPage.tsx
│   │   ├── CandidatoDetalhe.tsx
│   │   ├── CandidatoDocumentos.tsx
│   │   ├── CandidatoExperiencias.tsx
│   │   ├── CandidatoFormacao.tsx
│   │   ├── CandidatoHabilidades.tsx
│   │   ├── CandidatoIdiomas.tsx
│   │   ├── CandidatoPreferencias.tsx
│   │   ├── Candidatos.tsx
│   │   ├── CandidatoVisualizacoes.tsx
│   │   ├── Candidaturas.tsx
│   │   ├── CatalogoPage.tsx
│   │   ├── CentroCustosPage.tsx
│   │   ├── Clientes.tsx
│   │   ├── ClientesPage.tsx
│   │   ├── ComingSoonPage.tsx
│   │   ├── CompanyRelationshipsPage.tsx
│   │   ├── Configuracoes.tsx
│   │   ├── ContabilidadePage.tsx
│   │   ├── ContasReceberPage.tsx
│   │   ├── ContratosPage.tsx
│   │   ├── Cursos.tsx
│   │   ├── DashboardCandidato.tsx
│   │   ├── DashboardFinanceiro.tsx
│   │   ├── DashboardForbidden.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── DashboardRh.tsx
│   │   ├── DocumentosPage.tsx
│   │   ├── DocumentosRh.tsx
│   │   ├── Empresas.tsx
│   │   ├── Estoque.tsx
│   │   ├── Etapas.tsx
│   │   ├── Experiencias.tsx
│   │   ├── FaturamentoPage.tsx
│   │   ├── Financeiro.tsx
│   │   ├── FinanceiroPage.tsx
│   │   ├── FiscalPage.tsx
│   │   ├── FluxoDeCaixaPage.tsx
│   │   ├── Formacao.tsx
│   │   ├── Fornecedores.tsx
│   │   ├── FuncionarioDetalhe.tsx
│   │   ├── Funcionarios.tsx
│   │   ├── GestaoPage.tsx
│   │   ├── GestaoSaaSPage.tsx
│   │   ├── GlobalDashboardPage.tsx
│   │   ├── Habilidades.tsx
│   │   ├── IaPage.tsx
│   │   ├── Idiomas.tsx
│   │   ├── IntegracoesPage.tsx
│   │   ├── JobMatches.tsx
│   │   ├── LgpdPage.tsx
│   │   ├── MonitoramentoPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── Parceiros.tsx
│   │   ├── ProcessosSeletivos.tsx
│   │   ├── RbacAuditPage.tsx
│   │   ├── Relatorios.tsx
│   │   ├── RhPage.tsx
│   │   ├── RolesPermissoesPage.tsx
│   │   ├── SegurancaPage.tsx
│   │   ├── Servicos.tsx
│   │   ├── SessoesPage.tsx
│   │   ├── SkillsPage.tsx
│   │   ├── Suporte.tsx
│   │   ├── TenantsPage.tsx
│   │   ├── TermosPage.tsx
│   │   ├── UnderConstruction.tsx
│   │   ├── Usuarios.tsx
│   │   ├── Vagas.tsx
│   │   ├── VisaoGeral.tsx
│   │   ├── financeiro/
│   │   │   ├── Categorias.tsx
│   │   │   ├── CentrosCusto.tsx
│   │   │   ├── Conciliacao.tsx
│   │   │   ├── ContasFinanceiras.tsx
│   │   │   ├── NotasFiscais.tsx
│   │   │   ├── Parcelamentos.tsx
│   │   │   └── Transacoes.tsx
│   │   └── relatorios/
│   │       ├── RelatorioAlmoxarifadoPage.tsx
│   │       ├── RelatorioContabilidadePage.tsx
│   │       ├── RelatorioCrmPage.tsx
│   │       ├── RelatorioEstoquePage.tsx
│   │       ├── RelatorioFaturamentoPage.tsx
│   │       ├── RelatorioFinanceiroPage.tsx
│   │       ├── RelatorioFiscalPage.tsx
│   │       ├── RelatorioRecrutamentoPage.tsx
│   │       ├── RelatorioRhPage.tsx
│   │       ├── RelatorioServicosPage.tsx
│   │       └── RelatorioSuportePage.tsx
│   └── finance/
│       ├── AccountsPayableList.tsx
│       └── AccountsReceivableList.tsx
├── primeiro-acesso/
│   ├── Senha.tsx
│   └── Termos.tsx
├── repositories/
├── services/
├── styles/
├── types/
└── utils/
```

## Total: 250 arquivos `.tsx` em `src/`

## Páginas públicas soltas em `src/pages/`

| Arquivo              | Caminho atual                    | Categoria provável |
| -------------------- | -------------------------------- | ------------------ |
| Home.tsx             | `src/pages/Home.tsx`             | Pública            |
| Sobre.tsx            | `src/pages/Sobre.tsx`            | Pública            |
| Servicos.tsx         | `src/pages/Servicos.tsx`         | Pública            |
| Contato.tsx          | `src/pages/Contato.tsx`          | Pública            |
| FAQ.tsx              | `src/pages/FAQ.tsx`              | Pública            |
| Parceiros.tsx        | `src/pages/Parceiros.tsx`        | Pública            |
| Fornecedores.tsx     | `src/pages/Fornecedores.tsx`     | Pública            |
| Clientes.tsx         | `src/pages/Clientes.tsx`         | Pública            |
| Empresas.tsx         | `src/pages/Empresas.tsx`         | Pública            |
| Vagas.tsx            | `src/pages/Vagas.tsx`            | Pública            |
| VagaDetalhe.tsx      | `src/pages/VagaDetalhe.tsx`      | Pública            |
| ServicoDetalhe.tsx   | `src/pages/ServicoDetalhe.tsx`   | Pública            |
| EmpresaDetalhe.tsx   | `src/pages/EmpresaDetalhe.tsx`   | Pública            |
| Blog.tsx             | `src/pages/Blog.tsx`             | Pública            |
| TrabalheConosco.tsx  | `src/pages/TrabalheConosco.tsx`  | Pública            |
| ProcessoSeletivo.tsx | `src/pages/ProcessoSeletivo.tsx` | Pública            |
| Cadastro.tsx         | `src/pages/Cadastro.tsx`         | Pública            |
| Login.tsx            | `src/pages/Login.tsx`            | Auth               |
| RecuperarSenha.tsx   | `src/pages/RecuperarSenha.tsx`   | Auth               |
| RedefinirSenha.tsx   | `src/pages/RedefinirSenha.tsx`   | Auth               |
| AlterarSenha.tsx     | `src/pages/AlterarSenha.tsx`     | Auth               |
| Onboarding.tsx       | `src/pages/Onboarding.tsx`       | Auth               |
| NotFound.tsx         | `src/pages/NotFound.tsx`         | Pública            |
| Dashboard.tsx        | `src/pages/Dashboard.tsx`        | Dashboard          |
| DivulgarVaga.tsx     | `src/pages/DivulgarVaga.tsx`     | Dashboard/Empresa  |

## Referências a `localhost:3000`

**Nenhuma em código de produção.** Apenas em:

- `e2e/*.spec.ts` — testes E2E
- `src/config/__tests__/recovery.test.ts` — teste unitário
- `playwright.config.ts` — config de teste
- `src/config/app.ts` — fallback de `VITE_APP_URL`

Isso indica que o site não deve estar requisitando `localhost:3000` em produção.

## Referências a `JSTerceirizados`

**Nenhuma em `src/` ou `public/`.** Apenas em:

- `.kilo/` — arquivos de auditoria
- `docs/` — documentação histórica
- `package.json` — já corrigido
- `README.md` — documentação
- `scripts/` — scripts legado

## Diagnóstico preliminar

1. **Páginas públicas soltas:** 24 arquivos `.tsx` em `src/pages/` sem subpasta
2. **Páginas auth:** 5 arquivos em `src/pages/auth/`
3. **Páginas candidato:** 9 arquivos em `src/pages/candidato/`
4. **Páginas dashboard:** ~70 arquivos em `src/pages/dashboard/`
5. **Páginas financeiro:** 2 arquivos em `src/pages/finance/`
6. **Páginas primeiro-acesso:** 2 arquivos em `src/pages/primeiro-acesso/`

## Próximos passos sugeridos

1. Criar `src/pages/public/` e mover as 24 páginas públicas soltas
2. Verificar duplicações:
   - `Dashboard.tsx` vs `DashboardHome.tsx` vs `GlobalDashboardPage.tsx`
   - `Clientes.tsx` vs `ClientesPage.tsx`
   - `Empresas.tsx` vs `EmpresasPage.tsx`
   - `Financeiro.tsx` vs `FinanceiroPage.tsx`
   - `Termos.tsx` vs `TermosPage.tsx`
3. Mapear todas as rotas em `App.tsx` que apontam para esses arquivos
4. Atualizar imports após movimentação

**Nenhuma movimentação será feita sem aprovação do mapa completo.**
