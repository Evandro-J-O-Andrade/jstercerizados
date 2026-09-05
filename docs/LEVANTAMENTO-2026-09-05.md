# Levantamento — J&S Empregos LTDA

**Data**: 2026-09-05  
**Base**: reconciliação read-only confirmada; `c05822f` preservado como base canônica do trabalho de hoje; `ed526a0` tratado como fonte de correções a avaliar.  
**Estado Git**: `main` sincronizado com `origin/main` em `67899fb` (levantamento commitado). Working tree limpo.

> **⚠️ ESTE LEVANTAMENTO SUBSTITUI O DIAGNÓSTICO ANTERIOR.** O baseline `7d9fa1a` foi auditado commit-por-commit e **não** pode ser considerado "feito" nos quatro blocos abaixo — há regressões reais.

---

## 1. O que foi feito

### 1.1 Portal candidato

- Portal candidato canônico consolidado.
- Rotas e páginas: dashboard, vagas, candidaturas, favoritas, currículo, perfil, notificações, configurações, alertas.
- `CandidateShell`, `CandidateRoute`, `CandidateProvider`.
- Sidebar dinâmica e bottom navigation dinâmicos via banco.
- Favoritos, job alerts, skills free-form, preferências/matching.
- Isolamento RLS do candidato.

### 1.2 Auth / Login

- `/entrar` como hub.
- `/entrar/admin`, `/entrar/candidato`, `/entrar/empresa`.
- `/login` preservado como login original.
- Login contextual e cadastro inline.
- Turnstile integrado.
- OAuth Google/Microsoft na UI.
- Fluxo de recovery seguro.
- `AuthCallback` corrigido.
- Redirect de não autenticados para `/entrar`.

### 1.3 RBAC

- RBAC-01: correção de inconsistência `admin_master`.
- RBAC-02: capacity matrix fechada.
- RBAC-03: 52 roles aplicadas (49 ativas, 3 deprecated).
- RBAC-04: inventário somente leitura concluído.
- Candidato removido de `/dashboard/*`.
- `user_has_permission()` confirmado no banco.

### 1.4 UI / Layout

- CinematicShowcase bounded.
- Widgets flutuantes ocultos nos portais.
- Footer por escopo.
- Sistema de templates `%var.path%` via banco.

### 1.5 Site público

- Home preservada.
- Rotas públicas preservadas.
- `PublicLayout` preservado.
- Footer público preservado.

### 1.6 Banco / Supabase

- 52 roles cadastradas.
- Permissões catálogadas (~150).
- `footer_configs`, `candidate_portal_modules`, `global_navigation_links`, `page_templates`, `candidate_job_alerts`, `candidate_skills`, `candidate_favorite_jobs` confirmados no banco.
- RLS e grants validados.
- Migrations defensivas aplicadas.

### 1.7 Testes

- Correção em `retry.test.ts` aplicada localmente e reconciliada com remoto.
- Testes E2E do candidate portal executados e documentados.
- Vitest: 372 passed | 2 skipped (CI verde).

### 1.8 Status de regressões (auditado 05/09)

| Bloco                | Estado                 | Detalhes                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro Empresa     | **🔴 REGRESSÃO**       | `CadastroEmpresa.tsx` chama apenas `registerUser()` (cria usuário Auth, não empresa). A RPC `register_company_interest` existe em migrations mas **nunca é chamada** pelo frontend. Falta CNPJ, telefone de contato, validação server-side.                           |
| Login                | **🟡 PRECISA VALIDAR** | `Login.tsx` tem card contextual, OAuth (Google/Microsoft), Turnstile e signup inline. `Entrar.tsx` hub e `EntrarContexto.tsx` existem. Mas a integração completa (OAuth providers desabilitados no Supabase, `AuthCallback` não testado) precisa validação funcional. |
| Dashboard Candidato  | **🟡 PRECISA VALIDAR** | `src/pages/candidato/Dashboard.tsx` existe com UI completa (match, favoritos, candidaturas). Mas `CandidateContext` não foi validada em runtime real — dados podem vir mockados ou não estar sincronizados com schema Supabase.                                       |
| Site × Sistema       | **🔴 INCOMPLETO**      | Rotas são separadas em `App.tsx` (PublicLayout vs CandidateShell vs AppShell) mas a separação visual/arquitetural não está consolidada — `d60ebe5` foi o último ajuste e não foi validada.                                                                            |
| Company Interest RPC | **🔴 NÃO INTEGRADA**   | RPC `register_company_interest(p_name, p_cnpj, p_email, p_phone, p_contact_name, p_contact_phone, p_contact_email, p_message)` existe na migration `20260904204854` + fix `20260904204950`, mas **nenhum serviço ou repositório frontend chama essa RPC**.            |

---

## 2. O que está feito, mas não fechado / regressões

| Item                     | Estado               | Ação                                                                                                                                                                |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cadastro Empresa**     | **🔴 REGRESSÃO**     | `CadastroEmpresa.tsx` chama `registerUser()` (Auth user) mas **não chama** `register_company_interest` RPC. Falta CNPJ, telefone de contato, validação server-side. |
| **Login/OAuth**          | **🟡 VALIDAR**       | Frontend contextual OK; providers desabilitados no Supabase; `AuthCallback` não testado em runtime.                                                                 |
| **Dashboard Candidato**  | **🟡 VALIDAR**       | UI completa; `CandidateContext` não validada em runtime real.                                                                                                       |
| **Site × Sistema**       | **🔴 INCOMPLETO**    | Rotas separadas em App.tsx mas arquitetura visual não consolidada.                                                                                                  |
| **Company Interest RPC** | **🔴 NÃO INTEGRADA** | RPC existe em migrations mas frontend nunca chama.                                                                                                                  |
| Footer por escopo        | Código OK            | Arquitetura entre `PublicLayout` e `RoleBasedFooter` não consolidada.                                                                                               |
| CI/Vitest                | Código OK            | Reconciliar versão local com remota.                                                                                                                                |
| Templates/Navigation     | Código OK            | Validar runtime/DB em browser real.                                                                                                                                 |
| RBAC-03 histórico        | Migration OK         | Alinhar histórico remoto/local.                                                                                                                                     |

---

## 3. O que falta fazer

### 3.1 RECOVERY / REGRESSION AUDIT (P0 — PRIMEIRO)

- [ ] Localizar estados aprovados no histórico:
  - `bfeaff1` — login contextual com OAuth + Turnstile (checkpoint)
  - `e4ad62e` / `a2a4ac1` — Dashboard Candidato canônico
  - `d60ebe5` — separação Site × Sistema (menus mobile)
  - `e16f281` — RPC `register_company_interest` aprovada
- [ ] Comparar estado atual vs checkpoint em cada bloco
- [ ] Identificar diffs exatos de regressão
- [ ] Usar Git para recuperar regressões (checkout seletivo de arquivos)

### 3.2 RECONCILIATION-01 (P0)

- [ ] Confirmar linha base `7d9fa1a` → `67899fb`
- [ ] Fechar `main` ↔ `origin/main` (já sincronizado em `67899fb`)

### 3.3 Cadastro Empresa (P0 — CRÍTICO)

- [ ] Criar método `registerCompanyInterest()` em `companies.repository.ts` que chama RPC `register_company_interest`
- [ ] Atualizar `CadastroEmpresa.tsx` para coletar CNPJ, telefone de contato, nome do contato e chamar a RPC
- [ ] Mostrar mensagem de sucesso com "verificação em andamento" (status pending)

### 3.4 RBAC-05 (imediato)

- Auditoria read-only do Supabase real.
- Alinhar `database.ts` com schema real.

### 3.5 Site × Sistema (P1)

- Consolidar separação visual: PublicLayout (site) vs CandidateShell (portal candidato) vs AppShell (dashboard admin).
- Revisar `d60ebe5` e validar em browser real.

### 3.6 Dashboard Candidato (P1 — VALIDAR)

- `CandidateContext` usar dados reais do Supabase (schema `candidates`, `applications`, `candidate_favorite_jobs`, `candidate_job_alerts`, `candidate_skills`).
- Validar match engine em runtime.

### 3.7 ROUTING-ARCH-02 (P1)

- Revisar `ProtectedRoute`, `CandidateRoute`, `AdminRoute`, `CompanyRoute`, `ManagerRoute` contra o modelo canônico.

### 3.8 E2E completo

- Fluxos críticos automatizados:
  - candidato: cadastro → login → bootstrap → perfil → skills → favoritos → alertas → logout;
  - empresa: formulário público → `register_company_interest` → banco → evento/auditoria;
  - OAuth: Google/Microsoft → callback → sessão → RBAC → destino.

### 3.9 Documentação comercial / produto

- Proposta comercial, contrato, escopo, domínio, deploy, manutenção, suporte.
- LGPD, termos de uso, política de privacidade.
- Feature inventory final e aceite do produto.

---

## 4. Próxima sequência recomendada

1. **RECOVERY / REGRESSION AUDIT** — localizar estados aprovados, comparar, identificar diffs.
2. **RECONCILIATION-01** — confirmar baseline, fechar `main` ↔ `origin/main` (já sincronizado).
3. **Cadastro Empresa** — integrar `register_company_interest` RPC no frontend.
4. **OAuth providers** — habilitar Google/Azure no Supabase Auth.
5. **Runtime Gates B/C** — validar em browser real.
6. **RBAC-05** — auditoria do Supabase real.
7. **Dashboard Candidato** — validar `CandidateContext` em runtime.
8. **Site × Sistema** — consolidar separação visual.
9. **ROUTING-ARCH-02** — revisar rotas protegidas.
10. **E2E completo** — fluxos críticos automatizados.
11. **Documentação comercial + feature inventory**.

## 5. Regra atual

> Não abrir nova funcionalidade enquanto a recuperação de regressões e o fechamento do banco não estiverem concluídos.

Qualquer passo novo agora deve ser:

1. localizar;
2. entender;
3. reaproveitar;
4. melhorar;
5. só criar se realmente não existir.
