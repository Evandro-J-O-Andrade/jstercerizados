# CRITÉRIOS DE ACEITE E TESTES DE SEGURANÇA — RBAC GLOBAL

**Data:** 2026-10-30  
**Empresa:** J&S Empregos LTDA  
**Status:** Para revisão — nenhum teste executado contra banco remoto  
**Regra:** nenhuma alteração remota sem aprovação explícita.

---

## 1. Critérios de Aceite (funcionais)

| #     | Critério                                                                                   | Status   | Como verificar                                                                                          |
| ----- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| CA-01 | Nenhum usuário comum recebe autoridade global                                              | Pendente | Consultar `role_assignments` + `roles.scope='global'` — apenas `admin_master` deve ter `scope='global'` |
| CA-02 | Owner não administra outros tenants                                                        | Pendente | Verificar que `owner` tem `scope='tenant'` e nenhuma policy/global grant cross-tenant                   |
| CA-03 | Gestor não recebe privilégios de ROOT                                                      | Pendente | `gestor` tem `scope='tenant'`; nenhuma permissão de `tenants.*`, `roles.*`, `permissions.*`             |
| CA-04 | Recrutador_master administra só recrutamento dentro do escopo                              | Pendente | `recrutador_master` não tem permissões de `finance.*`, `employees.*`, `tenants.*`                       |
| CA-05 | Recrutador não altera permissões administrativas                                           | Pendente | `recrutador` não tem `roles.*`, `permissions.*`, `role_assignments.*`                                   |
| CA-06 | Funcionário não acessa dados de outros usuários sem autorização                            | Pendente | `funcionario` tem apenas `self.*` e leitura limitada                                                    |
| CA-07 | Candidato não acessa currículos/candidaturas de terceiros                                  | Pendente | RLS de `candidate_self_*` policies; `candidato` tem apenas `self.*`                                     |
| CA-08 | RLS impede acesso indevido mesmo com frontend manipulado                                   | Pendente | Testar políticas RLS diretamente no banco com diferentes `auth.uid()`                                   |
| CA-09 | Testes cobrem herança, escopo, escalonamento, IDOR, isolamento entre tenants               | Pendente | Suite de testes unitários e de integração                                                               |
| CA-10 | Dois sistemas de permissão (`role_permissions` e `role_resource_permissions`) consistentes | Pendente | Verificar que `user_has_permission()` e matriz canônica retornam mesmo resultado para cada role         |

---

## 2. Testes de Segurança Obrigatórios

### 2.1 Autoridade Global (admin_master)

| Teste    | Entrada                                                   | Resultado esperado                             |
| -------- | --------------------------------------------------------- | ---------------------------------------------- |
| T-SEC-01 | `admin_master` consulta `tenants` de qualquer tenant      | ✅ Permitido (escopo global)                   |
| T-SEC-02 | `admin_master` não desativa RLS                           | ✅ RLS continua aplicado; auditoria registrada |
| T-SEC-03 | Usuário com `scope='tenant'` tenta acessar recurso global | ❌ `user_has_permission()` retorna false       |

### 2.2 Isolamento de Tenant

| Teste    | Entrada                                             | Resultado esperado                             |
| -------- | --------------------------------------------------- | ---------------------------------------------- |
| T-SEC-04 | `owner` do tenant A acessa dados do tenant B        | ❌ Bloqueado por RLS + `user_has_permission()` |
| T-SEC-05 | `tenant_admin` do tenant A acessa dados do tenant B | ❌ Bloqueado                                   |
| T-SEC-06 | `gestor` do setor A acessa equipe do setor B        | ❌ Bloqueado (sem atribuição explícita)        |

### 2.3 Escalonamento de Privilégio (Privilege Escalation)

| Teste    | Entrada                                          | Resultado esperado                                                                              |
| -------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| T-SEC-07 | Usuário tenta atribuir a si mesmo `admin_master` | ❌ `can_manage_role_assignment()` retorna false (não é admin_master nem tenant_admin do tenant) |
| T-SEC-08 | `funcionario` tenta escrever `role_assignments`  | ❌ Bloqueado — sem permissão                                                                    |
| T-SEC-09 | `recrutador` tenta alterar `role_permissions`    | ❌ Bloqueado — sem permissão administrativa                                                     |

### 2.4 IDOR (Insecure Direct Object Reference)

| Teste    | Entrada                                                | Resultado esperado                    |
| -------- | ------------------------------------------------------ | ------------------------------------- |
| T-SEC-10 | `candidato` consulta `candidates` de outro `person_id` | ❌ RLS `candidate_self_read` bloqueia |
| T-SEC-11 | `candidato` consulta `applications` de outro candidato | ❌ RLS de self-isolation bloqueia     |
| T-SEC-12 | `recrutador` de tenant A consulta `jobs` do tenant B   | ❌ Bloqueado por tenant_id            |

### 2.5 Domínios Cruzados

| Teste    | Entrada                                    | Resultado esperado                         |
| -------- | ------------------------------------------ | ------------------------------------------ |
| T-SEC-13 | `recrutador_master` acessa `finance.*`     | ❌ Bloqueado — sem domínio financeiro      |
| T-SEC-14 | `financeiro_master` acessa `recruitment.*` | ❌ Bloqueado — sem domínio de recrutamento |
| T-SEC-15 | `gestor` acessa `roles.manage`             | ❌ Bloqueado — não é admin/owner           |

### 2.6 Herança e Escopo

| Teste    | Entrada                                                                                                            | Resultado esperado                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| T-SEC-16 | `gestor` não herda automaticamente permissões de `recrutador`                                                      | ✅ Apenas permissões explícitas em `role_permissions`           |
| T-SEC-17 | `recrutador_master` não é ROOT global                                                                              | ✅ `scope='tenant'`, não `global`                               |
| T-SEC-18 | Papel filho não amplia autoridade do superior                                                                      | ✅ Nenhuma concessão implícita entre papéis                     |
| T-SEC-19 | `user_has_permission()` e matriz canônica `role_resource_permissions` retornam mesmo resultado para `admin_master` | ✅ Ambas as fontes retornam true para recursos globais          |
| T-SEC-20 | `user_has_permission()` e matriz canônica `role_resource_permissions` retornam mesmo resultado para `tenant_admin` | ✅ Ambas as fontes retornam true apenas para recursos do tenant |

---

## 3. Consultas de Validação (somente leitura)

Estas consultas podem ser executadas no banco para auditar o estado atual **sem alterar dados**:

```sql
-- 1. Quais roles têm scope global (devem ser apenas admin_master)
SELECT r.name, r.scope, r.level, r.sector
FROM public.roles r
WHERE r.scope = 'global'
ORDER BY r.name;

-- 2. Contagem de role_permissions por papel
SELECT r.name, COUNT(rp.permission_id) AS perm_count
FROM public.roles r
LEFT JOIN public.role_permissions rp ON rp.role_id = r.id
GROUP BY r.name
ORDER BY perm_count DESC;

-- 3. Papéis ausentes da proposta
SELECT unnest(ARRAY[
  'owner', 'gestor', 'recrutador_master', 'funcionario',
  'financeiro_master', 'financeiro', 'rh_master', 'rh',
  'comercial_master', 'comercial', 'operacao_master', 'operacao',
  'suporte_master', 'suporte_ti', 'suporte'
]) AS papel_proposto
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles r WHERE r.name = unnest
);

-- 4. Usuários com múltiplas role assignments (risco de mistura de escopos)
SELECT p.full_name, p.email, COUNT(ra.role_id) AS role_count,
       BOOL_OR(r.scope = 'global') AS tem_role_global
FROM public.people p
JOIN public.role_assignments ra ON ra.person_id = p.id
JOIN public.roles r ON r.id = ra.role_id
GROUP BY p.id, p.full_name, p.email
HAVING COUNT(ra.role_id) > 1
ORDER BY role_count DESC;

-- 5. role_permissions duplicados ou inconsistentes
SELECT rp.role_id, rp.permission_id, COUNT(*) AS dup_count
FROM public.role_permissions rp
GROUP BY rp.role_id, rp.permission_id
HAVING COUNT(*) > 1;

-- 6. role_resource_permissions duplicados ou inconsistentes
SELECT rrp.role_id, rrp.resource, rrp.action, COUNT(*) AS dup_count
FROM public.role_resource_permissions rrp
GROUP BY rrp.role_id, rrp.resource, rrp.action
HAVING COUNT(*) > 1;

-- 7. Diferenças entre role_permissions e role_resource_permissions (mesmo role)
--   Permissões em role_permissions mas não em role_resource_permissions
SELECT r.name AS role, p.resource, p.action
FROM public.role_permissions rp
JOIN public.roles r ON r.id = rp.role_id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_resource_permissions rrp
  WHERE rrp.role_id = rp.role_id
    AND rrp.resource = p.resource
    AND rrp.action = p.action
);
```

---

## 4. Onde Executar os Testes

- **Testes unitários (TypeScript/Vitest):** `src/core/__tests__/` — testar `computeEffectivePermissions`, `decidePermission`, `hasAnyPermission`, `buildDispatchContext`.
- **Testes de contrato:** `src/core/__tests__/contracts.test.ts` — estender com cenários de escopo e herança.
- **Testes de segurança (DB):** executar as consultas da seção 3 contra o Supabase local/homologação (não produção).
- **Testes de RLS:** validar políticas diretamente no banco com `auth.uid()` simulado.

---

## 5. Entregáveis Obrigatórios (antes de implementar)

1. ✅ Inventário de todos os domínios — `docs/rbac-audit/03-MAPA-HIERARQUICO.md`
2. ✅ Inventário completo das tabelas e classificação de propriedade — `src/core/registry/database-domain-registry.ts` (já existente, 234 tabelas)
3. ✅ Diagnóstico do RBAC atual — `docs/rbac-audit/01-DIAGNOSTICO-RBAC-ATUAL.md`
4. ✅ Matriz global de papéis, permissões e escopos — `docs/rbac-audit/02-MATRIZ-PAPEIS-PERMICOES-ESCOS.md`
5. ✅ Hierarquia funcional completa — `docs/rbac-audit/03-MAPA-HIERARQUICO.md`
6. ✅ Comparação estado atual vs proposto — `docs/rbac-audit/02-MATRIZ-PAPEIS-PERMICOES-ESCOS.md` (seção 4)
7. ✅ Identificação das atribuições atuais incompatíveis — `docs/rbac-audit/01-DIAGNOSTICO-RBAC-ATUAL.md` (seção 3)
8. ✅ Plano de migração e rollback — `docs/rbac-audit/04-MIGRACAO-PROPOSA-RBAC-GLOBAL.sql` (aditivo, idempotente, sem destrutivo)
9. ✅ Seed global completo em modo de revisão — `docs/rbac-audit/05-SEED-GLOBAL-REVISAO.sql`
10. ✅ Testes de segurança e critérios de aceite — `docs/rbac-audit/06-CRITERIOS-ACEITANCE-TESTES.md` (este documento)

---

## 6. Restrições (reiteradas)

- Não executar migrations no Supabase remoto.
- Não alterar dados reais.
- Não aplicar seed em produção.
- Não excluir papéis, permissões ou atribuições existentes sem aprovação.
- Não considerar a tarefa concluída com apenas um módulo implementado.
- A implementação somente poderá ser aprovada quando todos os domínios identificados estiverem mapeados e a cobertura do RBAC puder ser comprovada.

**Estado esperado: AUDITORIA GLOBAL COMPLETA — SEED INTEGRAL EM REVISÃO — NENHUMA ALTERAÇÃO REMOTA SEM APROVAÇÃO.**
