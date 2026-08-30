# Homologação — Candidate Bootstrap Flow (V2.1)

## Objetivo

Validar o fluxo completo de cadastro/login do candidato em ambiente de homologação antes de aplicar em produção.

## Pré-requisitos

- Acesso ao Supabase de homologação
- Cliente Supabase CLI configurado (`supabase link` ou conexão direta)
- NÃO executar em produção

---

## Passo 1 — Backup / Estado atual

```bash
# Capturar estado atual do banco (apenas leitura)
supabase db dump --schema public > backup_homologacao_pre_candidate_role.sql
```

**Importante:** Este backup é apenas para rollback manual se necessário.

---

## Passo 2 — Aplicar migration

```bash
# Aplicar apenas a nova migration
supabase migration up --include-all
```

**Verificar:** A migration `20260830000001_candidate_role.sql` deve aparecer como aplicada.

---

## Passo 3 — Validar role "candidato"

Conectar no Supabase SQL Editor e executar:

```sql
SELECT id, name, is_global, description
FROM public.roles
WHERE name = 'candidato';
```

**Esperado:**

- `name` = `candidato`
- `is_global` = `false`
- `description` = `Candidato`

---

## Passo 4 — Cadastrar candidato de teste

1. Acessar `/cadastro/candidato`
2. Preencher formulário com dados de teste
3. Confirmar cadastro
4. **Capturar o e-mail usado** (ex: `candidate_test@example.com`)

---

## Passo 5-9 — Validar cadeia de autenticação

Conectar no Supabase SQL Editor e executar o script `validate_candidate_bootstrap.sql`.

**Antes de executar, atualizar a linha:**

```sql
\set test_email 'candidate_test@example.com'
```

**Esperado:**

| Fase      | Entidade                               | Esperado                            |
| --------- | -------------------------------------- | ----------------------------------- |
| POST_REG  | auth_users                             | 1 linha                             |
| POST_REG  | people                                 | 1 linha                             |
| POST_REG  | tenant_memberships                     | 1 linha com `slug = js-empregos`    |
| POST_REG  | role_assignments                       | 1 linha com `role_name = candidato` |
| POST_REG  | candidates                             | 1 linha                             |
| POST_REG  | first_login_state                      | 1 linha                             |
| INTEGRITY | tenant_memberships_single              | 0 linhas                            |
| INTEGRITY | role_assignments_single                | 0 linhas                            |
| INTEGRITY | candidates_single_per_tenant           | 0 linhas                            |
| INTEGRITY | role_assignment_role_exists            | 0 linhas                            |
| INTEGRITY | tenant_membership_tenant_exists        | 0 linhas                            |
| DUPES     | people_by_auth_user                    | 0 linhas                            |
| DUPES     | tenant_memberships_by_person_tenant    | 0 linhas                            |
| DUPES     | role_assignments_by_person_role_tenant | 0 linhas                            |
| DUPES     | candidates_by_person_tenant            | 0 linhas                            |
| RBAC      | candidate_permissions                  | ≥ 1 linha                           |

---

## Passo 10 — Testar login / primeiro acesso

1. Acessar `/login`
2. Login com e-mail do candidato de teste
3. Verificar redirecionamento para `/auth/welcome`
4. Verificar redirecionamento para `/dashboard/candidato`
5. Verificar se o `CandidateDashboard` carrega corretamente

---

## Passo 11 — Verificar console do navegador

Logs esperados:

```
[AUTH] initAuth
[AUTH:LOGIN] success — loading identity
[AUTH:LOGIN] bootstrap success { authUserId, tenantId: null, roleId: null }
[AUTH:IDENTITY] people loaded {hasPerson: true}
[AUTH:MEMBERSHIP] loaded
[AUTH:RBAC] loaded
[AUTH:HANDOFF] loadAuthData complete
[CANDIDATE] profile loaded
[DASHBOARD] ready
```

**NÃO deve aparecer:**

- `401`
- `[AUTH:LOGIN] bootstrap failed`
- `[AUTH:IDENTITY] people loaded {hasPerson: false}`

---

## Passo 12 — Rollback (se necessário)

Se algo der errado:

```bash
# Reverter migration
supabase migration down

# Restaurar backup se necessário
supabase db reset
```

---

## Critérios de sucesso

- [ ] Role `candidato` existe no banco
- [ ] RPC `bootstrap_candidate_identity` foi atualizada
- [ ] Candidato de teste consegue fazer login
- [ ] Console mostra a cadeia completa de autenticação
- [ ] Não há erros 401
- [ ] `tenant_memberships` aponta para `js-empregos`
- [ ] `role_assignments` aponta para role `candidato`
- [ ] `candidates` foi criado
- [ ] `first_login_state` foi criado
- [ ] Não há duplicatas em nenhuma tabela

---

## Próximos passos após sucesso em homologação

1. Aplicar migration em produção
2. Repetir Passo 4-11 com usuário real
3. Monitorar logs por 24h
4. Apenas então considerar o fluxo do candidato como resolvido
