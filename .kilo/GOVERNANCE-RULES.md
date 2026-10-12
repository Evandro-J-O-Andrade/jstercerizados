# Regras de Governança Consolidadas — J&S Empregos LTDA

> **Fonte única de verdade para decisões, restrições e proteções do projeto.**
> Este documento consolida `AGENTS.md`, `JSEmpregos_Inventario_Geral_Diretrizes.md`, `.kilo/asset-ownership.md`, `.kilo/module-audit.md`, `.kilo/GATE-BRAND-ASSETS-01-report.md` e decisões de memória do projeto.

---

## 1. REGRAS CRÍTICAS — NUNCA ALTERAR (Bloqueio Absoluto)

| Item | Regra | Origem |
|------|-------|--------|
| **Nome da empresa** | **NUNCA** mudar "J&S Empregos LTDA" para "J&S Terceirizados" ou qualquer variação | `AGENTS.md` §1 |
| **Footer** | **NUNCA** alterar o conteúdo do footer atual | `AGENTS.md` §1 |
| **Site público** | **NÃO** alterar rotas, páginas, layouts, hooks, componentes das rotas públicas (`/`, `/vagas`, `/servicos`, `/clientes`, `/empresas`, `/fornecedores`, `/login`) | `module-audit.md` linhas 36-42 (categoria "Site") |
| **Mocks/fallbacks** | **NUNCA** remover mock apenas porque o banco foi conectado; fallback deve participar da renderização desde o início | `JSEmpregos_Inventario_Geral_Diretrizes.md` §3 |
| **Assets de marca** | **NÃO** substituir `logo.svg` por `logomarca.png` sem testar proporções; **NÃO** usar `escudojs.png` como favicon sem redimensionar; **NÃO** apagar SVGs antes de confirmar PNGs referenciados | `GATE-BRAND-ASSETS-01-report.md` §6.3 |

---

## 2. ORDEM OBRIGATÓRIA — ANTES DE QUALQUER AÇÃO

1. **Ler** as diretrizes do agente (`AGENTS.md` + este arquivo)
2. **Localizar e ler** todos os `.md` relevantes na worktree atual
3. **Identificar** regras, decisões e restrições vigentes
4. **Verificar** se a funcionalidade solicitada já existe (não duplicar)
5. **Verificar** se existe componente, hook, service, repository, rota, função, RPC, migration ou estrutura equivalente
6. **Analisar** o estado atual antes de criar qualquer coisa
7. **Informar** conflitos ou ambiguidades encontrados
8. **Planejar** a execução
9. **Implementar SOMENTE** com autorização explícita para implementação

> **Regra de Ouro:** DOCUMENTAÇÃO PRIMEIRO. CÓDIGO DEPOIS. IMPLEMENTAÇÃO SOMENTE APÓS VERIFICAÇÃO. COMMIT, PUSH E DEPLOY SOMENTE COM AUTORIZAÇÃO EXPLÍCITA.

---

## 3. PROTEÇÕES POR CAMADA

### 3.1 Site Público (Rotas Públicas)
- **Rotas protegidas:** `/`, `/vagas`, `/vagas/:slug`, `/servicos`, `/servicos/:slug`, `/clientes`, `/empresas`, `/fornecedores`, `/login`, `/cadastro`, `/sobre`, `/trabalhe-conosco`, `/suporte`, `/faq`, `/blog`, `/parceiros`
- **Layouts protegidos:** `PublicLayout`, `Navbar`, `PublicBottomNavigation`, `PortalBottomNavigation`, `Footer`
- **Hooks protegidos:** `usePublicJobs`, `usePublicJobsAsVagas`, `usePublicJobBySlugAsVaga`, `usePublicServices`, `usePublicServiceBySlug`, `usePublicCompanies`
- **Componentes protegidos:** Todos em `src/pages/` que servem rotas públicas
- **Ação proibida:** Modificar, remover, mover ou sobrescrever qualquer um dos acima sem autorização explícita

### 3.2 Identidade Visual
- **Logo ativa:** `public/images/global/brand/logo.svg` (Navbar, Footer, SEO, manifest)
- **Sidebar:** `sidebar-logo.svg`, `sidebar-icon.svg`
- **Watermark:** `watermark-logo.svg`
- **OG Image:** `og-image.svg`
- **Apple Touch Icon:** `apple-touch-icon.svg`
- **Favicon:** `public/images/favicons/favicon.svg`
- **Domínios canônicos:** Ver `.kilo/asset-ownership.md` Tabela 1
- **Placeholders 37 bytes:** Inválidos — não referenciar, não restaurar

### 3.3 Módulos Dashboard (Portal SaaS)
- **28 módulos no registry** — apenas 3 com rota registrada (todos site público)
- **24 módulos com página existente mas sem rota** — não ativar sem registro de rota + RBAC + dados reais
- **Financeiro:** 4 diretórios untracked (`bancos`, `centros-custo`, `contas-pagar` prontos; `categoria` precisa 4 fixes)

### 3.4 Banco de Dados / Supabase
- **Source of Truth:** Supabase (não inventar dados, não substituir reais por mocks)
- **Cadeia obrigatória:** Interface → Hook/Context → Repository/Service → RPC/Query → Supabase → Dados reais
- **RLS/RBAC/Auth/Turnstile/SMTP/Triggers/migrations:** NÃO alterar sem verificação de documentação + autorização explícita
- **ACL fix deployado:** `REVOKE EXECUTE ON is_admin_master(uuid) FROM PUBLIC, anon, authenticated`; `service_role` + `postgres` preservados; zero-arg `is_admin_master()` + 30+ RLS inalterados

---

## 4. CHECKLIST DE VALIDAÇÃO PRÉ-ALTERAÇÃO

Antes de **qualquer** alteração de código, arquivo, rota, migration, commit ou push:

- [ ] Li `AGENTS.md` e este `GOVERNANCE-RULES.md`
- [ ] Consultei todos `.md` relevantes na worktree
- [ ] Confirmei que não existe funcionalidade equivalente (não duplicar)
- [ ] Verifiquei se a alteração toca itens da Seção 1 (Regras Críticas) — se sim, **PARAR**
- [ ] Verifiquei se a alteração toca Site Público (Seção 3.1) — se sim, **PARAR** sem autorização
- [ ] Verifiquei se a alteração toca Identidade Visual (Seção 3.2) — se sim, validar proporções/otimização primeiro
- [ ] Verifiquei se a alteração toca Banco/Supabase (Seção 3.4) — se sim, autorização explícita obrigatória
- [ ] Classifiquei a alteração: `REAL` / `PARCIAL` / `MOCK` / `ESPECIFICADO` / `NÃO IMPLEMENTADO` / `ÓRFÃO` / `OBSOLETO` / `CONFLITANTE`
- [ ] Tenho autorização explícita para: implementar / commit / push / deploy (cada um separadamente)

---

## 5. REGRAS ESPECÍFICAS PARA KILO CODE

### 5.1 Instruções de Contexto (Injetar no `kilo.jsonc` global ou project-level)

```json
{
  "instructions": [
    "REGRA CRÍTICA: NUNCA mudar 'J&S Empregos LTDA' para 'J&S Terceirizados'. NUNCA alterar footer.",
    "SITE PÚBLICO BLOQUEADO: Não alterar rotas /, /vagas, /servicos, /clientes, /empresas, /fornecedores, /login e seus layouts/hooks/componentes.",
    "MOCKS/FALLBACKS OBRIGATÓRIOS: Nunca remover mock porque banco conectou. Fallback renderiza primeiro, dados reais atualizam depois.",
    "ASSETS DE MARCA: logo.svg em uso (Navbar/Footer/SEO). Não substituir por PNG sem testar proporções. Placeholders 37 bytes = inválidos.",
    "ORDEM OBRIGATÓRIA: Ler AGENTS.md + GOVERNANCE-RULES.md + .mds relevantes ANTES de qualquer ação. Não duplicar. Supabase = Source of Truth.",
    "AUTORIZAÇÃO EXPLÍCITA: Commit/Push/Deploy só com autorização separada e explícita. 'Terminou' ou 'Corrija' NÃO autorizam push/deploy.",
    "AUDITORIA = SOMENTE LEITURA: Produzir evidências, classificar itens. NÃO implementar durante auditoria.",
    "FINANCEIRO: 3 dirs prontos (bancos, centros-custo, contas-pagar), categoria precisa 4 fixes. Não commit sem autorização.",
    "CHECK BOUL(ER) 24H: Restaurar cells/poc/ do baseline 5759a0b; extrair contratos do stash@{4} seletivamente; criar governance checkpoint branch."
  ]
}
```

### 5.2 Verificações Automatizadas (Quando Disponíveis)

| Verificação | Ferramenta | Status |
|-------------|------------|--------|
| Lint/Typecheck | `npm run lint` / `npm run typecheck` | ✅ Disponível |
| Build | `npm run build` | ✅ Disponível |
| Testes | `npm test` / `vitest` | ✅ Disponível |
| Git diff antes de commit | `git diff --cached` | Manual |
| Branch protection | GitHub branch protection rules | Não configurado |

> **Nota:** Não há pre-commit hooks, Husky, ou CI gates configurados no repositório. A proteção é comportamental (agente segue instruções).

---

## 6. ESTADO ATUAL DOS TRABALHOS (Memória do Projeto)

### Concluído ✅
- Procedure A (REVOKE `is_admin_master(uuid)`) executada e validada no Supabase
- Media module audit docs commitados (`330f152`, `1f0cbc5`); R1 validado
- AVA module restaurado do baseline `5759a0b`/`c8ce3ee`
- Contabilidade module restaurado (commit `ab24d57`)
- Git diagnostic: 5 worktrees catalogadas, reflog/stash capturados
- Deep Supabase audit: 221 tabelas, 233 functions, 84 triggers, 600+ RLS, 108 admin_master permissions
- Financeiro read-only validation: typecheck ✅, lint ✅, build ✅
- Public site inventory: 28 rotas mapeadas, todas funcionais com `PublicLayout`
- Mobile web inventory: responsivo via `PublicBottomNavigation`/`PortalBottomNavigation` (`lg:hidden`)

### Ativo 🔄
- **Etapa A auditada:** Hooks/serviços de vagas e serviços verificados (DB + fallback correto)
- **Governança:** Este documento criado — próximo: injetar instruções no Kilo
- **CHECK Boul(er) 24h:** Aguardando governança consolidada

### Bloqueado 🚫
- Procedure B/C/D (test identities, cross-tenant, pilot cell) — precisa ambiente isolado
- R2/R3 media corrections — aguarda design review + autorização
- Stash@{4} wholesale apply — quebraria AVA, AuthContext, ModuleRouter
- Financeiro commit — aguarda autorização
- Governance checkpoint branch — não existe localmente

---

## 7. PRÓXIMOS PASSOS AUTORIZADOS

1. **Injetar instruções de governança** no Kilo (global `kilo.jsonc` ou project-level `kilo.jsonc`)
2. **CHECK Boul(er) 24h — Fase 1:** Examinar 8 arquivos POC do baseline `5759a0b` (`src/platform/cells/poc/`)
3. **CHECK Boul(er) 24h — Fase 2:** Inspecionar `stash@{4}` seletivamente (contratos core: identity, authorization, execution, registry, tenancy)
4. **CHECK Boul(er) 24h — Fase 3:** Comparar contratos com arquitetura atual antes de propor integração
5. **Criar governance checkpoint branch** com este documento

---

## 8. CLASSIFICAÇÃO DE ITENS (Para Auditorias)

| Classificação | Definição |
|---------------|-----------|
| `REAL` | Implementado no código E no banco, funcionando |
| `PARCIAL` | Existe no código mas incompleto / só frontend / só backend |
| `MOCK` | Apenas dados fictícios, sem conexão real |
| `ESPECIFICADO` | Documentado mas não implementado |
| `NÃO IMPLEMENTADO` | Nem especificado nem codificado |
| `ÓRFÃO` | Existe mas sem dono/consumidor claro |
| `OBSOLETO` | Substituído por outra implementação, deve ser removido |
| `CONFLITANTE` | Duas implementações para mesma coisa, incompatíveis |

---

## 9. HISTÓRICO DE DECISÕES (Extraído da Memória)

| ID | Decisão | Status |
|----|---------|--------|
| `is_admin_master.acl_fix_deployed` | REVOKE EXECUTE ON is_admin_master(uuid) FROM PUBLIC, anon, authenticated | ✅ Executado |
| `phase2_services_image_resolution.closed` | Phase 2 fechada: mapeamento explícito, resolver integrado, 21/21 testes | ✅ Fechado |
| `financeiro.modules_to_restore` | Investigar Git history antes de restaurar contas-pagar, bancos, centros-custo, categorias | 🔄 Pendente |
| `audit.next_verification_scope` | Verificar todos .sql em supabase/, CREATE FUNCTION, GRANT, REVOKE, ALTER DEFAULT PRIVILEGES | 🔄 Pendente |

---

> **Este documento é vivo.** Atualize quando houver nova decisão, correção ou restrição. Use `kilo_memory_save` para persistir decisões importantes.