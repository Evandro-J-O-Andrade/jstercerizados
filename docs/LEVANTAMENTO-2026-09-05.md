# Levantamento — J&S Empregos LTDA

**Data**: 2026-09-05  
**Base**: reconciliação read-only confirmada; `c05822f` preservado como base canônica do trabalho de hoje; `ed526a0` tratado como fonte de correções a avaliar.  
**Estado Git**: `main` sincronizado com `origin/main` em `7d9fa1a`. Nenhuma alteração não commitada no momento.

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

- Correção em `retry.test.ts` aplicada localmente.
- Testes E2E do candidate portal executados e documentados.

### 1.8 Documentação

- `docs/AUDITORIA-COMPLETA-2026-09-04.md`
- `docs/MAPA-CONSOLIDADO-2026-09-04.md`
- `docs/RBAC-04-INVENTORY.md`
- Vários snapshots/checkpoints.

---

## 2. O que está feito, mas não fechado

- **Footer por escopo**: código OK, arquitetura final entre `PublicLayout` e `RoleBasedFooter` ainda não consolidada.
- **OAuth**: frontend OK; providers desabilitados no Supabase; `AuthCallback` ainda pode receber ajustes.
- **CI/Vitest**: problema técnico corrigido localmente; versão remota também tem correção; ainda não foi feita a reconciliação das duas soluções.
- **Templates/Navigation**: código OK; runtime/DB ainda precisam de validação em browser real.
- **RBAC-03 histórico**: migration aplicada; histórico remoto/local ainda não está completamente alinhado.

---

## 3. O que falta fazer

### 3.1 Reconciliação Git (P0)

- Analisar individualmente os 9 commits remotos exclusivos.
- Definir quais correções devem ser trazidas para `c05822f`.
- Escolher estratégia: merge, rebase ou cherry-pick seletivo.
- Fechar `main` ↔ `origin/main` sem perder trabalho consolidado.

### 3.2 Company Interest (P0)

- Trazer migrations do remoto.
- Aplicar no Supabase.
- Validar RPC, tabela, CNPJ, e-mail, duplicidade, `domain_event_emit`, `activity_logs`.
- Fechar gate de entrada pública.

### 3.3 OAuth (P1)

- Implementar/ajustar `AuthCallback` para fluxo completo.
- Habilitar Google/Microsoft no Supabase Auth.
- Fechar ponta a ponta.

### 3.4 Runtime Gates (P1)

- Gate B: login → session → people → membership → RBAC → dashboard → logout.
- Gate C: candidate → portal → navigation → job alerts → skills → favorites → RLS.

### 3.5 RBAC-05

- Auditoria e administração de usuários/roles/permissões.
- Alinhar `database.ts` com schema real.

### 3.6 ROUTING-ARCH-02

- Revisar `ProtectedRoute`, `CandidateRoute`, `AdminRoute`, `CompanyRoute`, `ManagerRoute` contra o modelo canônico.

### 3.7 E2E completo

- Fluxos críticos automatizados:
  - candidato: cadastro → login → bootstrap → perfil → skills → favoritos → alertas → logout;
  - empresa: formulário público → `register_company_interest` → banco → evento/auditoria;
  - OAuth: Google/Microsoft → callback → sessão → RBAC → destino.

### 3.8 Documentação comercial / produto

- Proposta comercial, contrato, escopo, domínio, deploy, manutenção, suporte.
- LGPD, termos de uso, política de privacidade.
- Feature inventory final e aceite do produto.

---

## 4. Próxima sequência recomendada

1. **RECONCILIATION-01** — read-only; depois execução controlada.
2. **Company Interest** — trazer migrations e fechar gate.
3. **Runtime Gates B/C** — validação em browser real.
4. **OAuth callback + providers** — fechar ponta a ponta.
5. **RBAC-05** — administração de RBAC.
6. **ROUTING-ARCH-02** — rotas protegidas.
7. **E2E completo**.
8. **Documentação comercial + feature inventory**.

---

## 5. Regra atual

> Não abrir nova funcionalidade enquanto a reconciliação e o fechamento do banco não estiverem concluídos.

Qualquer passo novo agora deve ser:

1. localizar;
2. entender;
3. reaproveitar;
4. melhorar;
5. só criar se realmente não existir.
