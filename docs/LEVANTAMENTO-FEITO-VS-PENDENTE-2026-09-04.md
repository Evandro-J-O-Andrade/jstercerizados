# Levantamento: Feito vs Pendente — 04/09/2026

**Projeto:** `Evandro-J-O-Andrade/jstercerizados`
**Data:** 04/09/2026
**Status atual:** `main` sincronizado com `origin/main` — working tree limpo

---

## ✅ Feito hoje

### Infraestrutura / Git

- [x] Rebase/sincronização de `main` com `origin/main`
- [x] Resolução de conflitos em migrations e testes
- [x] Remoção de artefatos de teste do commit anterior
- [x] Preservação de auditorias, RBAC, fluxo do candidato e migrations

### Backend / Supabase

- [x] Migration `company_interest_registration_rpc` + ajuste de email validation
- [x] RBAC-03: roles canônicas (`rbac03_canonical_roles.sql`)
- [x] Candidate self-service: `candidate_favorite_jobs`, `candidate_skills_freeform_name_level`, `candidate_job_alerts`, `candidate_portal_navigation`
- [x] Footer por escopo: `footer_configs.sql`
- [x] Templates de página: `page_templates.sql`
- [x] Empresa-parceira: pré-voo E.1 e E.1.1 documentados
- [x] Empresa-parceira: RPC `register_company_interest` implementada

### Frontend / Auth / Layout

- [x] Login contextual com OAuth (Google/Microsoft) + Turnstile
- [x] `/entrar` hub + sub-rotas `/entrar/{admin,candidato,empresa}`
- [x] `/login` restaurado como Login original
- [x] AuthContext: recovery redirect + candidate role + alterar-senha
- [x] Site público: `PublicLayout` + `Footer` imutável preservado
- [x] Shell autenticado: `PortalShell` + `PortalHeader` + `PortalSidebar` + `PortalBottomNavigation`
- [x] Candidate portal: `CandidateShell` + rotas `/candidato/*`
- [x] Layout compartilhado preservado para todos os perfis

### Testes / Qualidade

- [x] Vitest: suite passing (372 passed | 2 skipped)
- [x] E2E candidato: scripts e specs presentes
- [x] Retry test: fix de Unhandled Rejection
- [x] Typecheck verde
- [x] Lint sem erros nos arquivos alterados

### Documentação

- [x] Relatório de auditoria completo salvo em `.kilo/AUDITORIA-2026-09-04-COMPLETA.md`
- [x] Docs de auditoria adicionados (`docs/AUDITORIA-COMPLETA-2026-09-04.md`, `docs/MAPA-CONSOLIDADO-2026-09-04.md`)

---

## 🔴 Falta fazer

### Imediato / Crítico

- [ ] Sincronizar `origin/main` remoto com commits locais pendentes (há commits não enviados)
- [ ] Validar runtime do Supabase: aplicar migrations e conferir `schema_migrations`
- [ ] Validar RLS em runtime para as novas migrations de candidate/company interest
- [ ] Habilitar Google/Azure OAuth no Supabase Auth (frontend pronto, backend desabilitado)
- [ ] Aplicar migration `footer_configs` e validar seed `global_public`
- [ ] Aplicar migration `page_templates` e validar função `resolve_page_template()`
- [ ] Validar `register_company_interest` RPC no Supabase

### Curto prazo

- [ ] Revisar duplicidade de timestamp em migrations `20260904204950_*`
- [ ] Validar RBAC-03 em runtime (roles, permissions, role_assignments)
- [ ] Testar fluxo completo de candidato: cadastro → login → dashboard → ações
- [ ] Testar fluxo completo de empresa: `/entrar/empresa` → dashboard
- [ ] Validar E2E no CI (GitHub Actions) após push
- [ ] Revisar worktree `joyous-quasar` — ela está divergente e removeu funcionalidades; decidir se é mantida ou descartada

### Médio prazo

- [ ] Implementar página `/empresas/:slug` pública
- [ ] Implementar página `/servicos/:slug` pública
- [ ] Conectar `/parceiros` e `/fornecedores` a dados reais (atualmente MOCK)
- [ ] Implementar chat/help widget no portal autenticado
- [ ] Implementar notificações push no candidate portal
- [ ] Implementar Storage para currículos/documents do candidato
- [ ] Implementar matching engine em produção

---

## ⚠️ Divergências / Riscos

| Item                                                                                      | Risco | Ação recomendada                                |
| ----------------------------------------------------------------------------------------- | ----- | ----------------------------------------------- |
| `joyous-quasar` deletou `CandidateShell`, `Turnstile`, `footer_configs`, `page_templates` | Alta  | Não usar como base; manter `main` como canônico |
| Migrations com mesmo timestamp `20260904204950`                                           | Média | Renomear para ordem clara antes de aplicar      |
| OAuth desabilitado no Supabase                                                            | Alta  | Habilitar Google/Azure no dashboard Supabase    |
| `main` atrás de `origin/main` em 9 commits                                                | Média | Fazer pull/rebase antes de novo trabalho        |
| Worktree `dedicated-grape` em `c773d83` (21 commits atrás)                                | Baixa | Atualizar ou arquivar                           |

---

## 📋 Checklist rápido para próxima sessão

- [ ] `git pull origin main` (sincronizar)
- [ ] Aplicar migrations no Supabase
- [ ] Habilitar OAuth no Supabase Auth
- [ ] Validar RLS e RBAC em runtime
- [ ] Rodar `pnpm typecheck && pnpm lint && pnpm test`
- [ ] Rodar E2E candidato
- [ ] Decidir futuro da worktree `joyous-quasar`
