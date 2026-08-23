# RBAC V2.1 — Matriz de Permissions Real

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** a86e19b  
**Fonte:** Supabase remoto (leitura apenas)

---

## 1. Objetivo

Extrair a matriz real de permissions do banco remoto, mapear cada role às suas permissions e definir o mapeamento de módulos/rotas do Dashboard baseado na realidade do Supabase — sem inventar permissions ou roles.

---

## 2. Estado atual do RBAC no banco

| Item                     | Valor        |
| ------------------------ | ------------ |
| Total de roles           | 16           |
| Total de permissions     | ?            |
| admin_master permissions | 63           |
| Outras roles             | ?            |
| Roles globais            | admin_master |
| Roles tenant             | 15           |

---

## 3. Roles confirmadas no banco

| #   | Role               | Scope  | Global | Descrição                      |
| --- | ------------------ | ------ | ------ | ------------------------------ |
| 1   | admin_master       | system | ✅     | Administrador master global    |
| 2   | tenant_admin       | tenant | ❌     | Administrador do tenant        |
| 3   | rh_manager         | tenant | ❌     | Gerente de RH                  |
| 4   | recruiter          | tenant | ❌     | Recrutador                     |
| 5   | finance_manager    | tenant | ❌     | Gerente financeiro             |
| 6   | finance            | tenant | ❌     | Operador financeiro            |
| 7   | support            | tenant | ❌     | Atendimento/suporte            |
| 8   | commercial         | tenant | ❌     | Comercial                      |
| 9   | operations_manager | tenant | ❌     | Gerente de operações           |
| 10  | stock_manager      | tenant | ❌     | Gerente de estoque             |
| 11  | security_manager   | tenant | ❌     | Gerente de segurança           |
| 12  | facilities_manager | tenant | ❌     | Gerente de facilities          |
| 13  | lawyer             | tenant | ❌     | Jurídico                       |
| 14  | it_admin           | tenant | ❌     | Administrador de TI            |
| 15  | operator           | tenant | ❌     | Operador (sem semântica final) |
| 16  | viewer             | tenant | ❌     | Visualizador                   |

---

## 4. Query para extrair matriz real

Execute no **Supabase SQL Editor**:

```sql
-- MATRIZ RBAC REAL — Permissions por Role
-- Autor: Kilo (Fase 2.5)
-- Modo: READ-ONLY

SELECT
  r.name AS role_name,
  r.scope AS role_scope,
  r.is_global AS is_global,
  COUNT(rp.permission_id) AS permission_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) AS permissions,
  STRING_AGG(p.module, ', ' ORDER BY p.module) AS modules
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.id
LEFT JOIN permissions p ON p.id = rp.permission_id
GROUP BY r.id, r.name, r.scope, r.is_global
ORDER BY r.is_global DESC, r.name;
```

Para detalhar as permissions de uma role específica:

```sql
-- Permissions detalhadas do admin_master
SELECT
  p.name,
  p.module,
  p.description
FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'admin_master'
ORDER BY p.module, p.name;
```

Para listar todas as permissions únicas:

```sql
-- Todas as permissions do sistema
SELECT
  name,
  module,
  description
FROM permissions
ORDER BY module, name;
```

---

## 5. Mapeamento esperado (baseado em specs V2.1)

Este mapeamento será **validado contra o banco** após a execução das queries acima.

| Módulo                  | Permission                | Roles esperadas                                                                                                |
| ----------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **vagas**               | `jobs.read`               | admin_master, tenant_admin, rh_manager, recruiter, commercial, viewer                                          |
| **vagas**               | `jobs.create`             | admin_master, tenant_admin, rh_manager, recruiter, commercial                                                  |
| **vagas**               | `jobs.update`             | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **vagas**               | `jobs.publish`            | admin_master, tenant_admin, rh_manager                                                                         |
| **vagas**               | `jobs.close`              | admin_master, tenant_admin, rh_manager                                                                         |
| **vagas**               | `jobs.delete`             | admin_master, tenant_admin                                                                                     |
| **candidatos**          | `candidates.read`         | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **candidatos**          | `candidates.update`       | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **candidatos**          | `candidates.delete`       | admin_master, tenant_admin                                                                                     |
| **empresas**            | `companies.read`          | admin_master, tenant_admin, commercial                                                                         |
| **empresas**            | `companies.create`        | admin_master, tenant_admin, commercial                                                                         |
| **empresas**            | `companies.update`        | admin_master, tenant_admin, commercial                                                                         |
| **empresas**            | `companies.delete`        | admin_master, tenant_admin                                                                                     |
| **contratos**           | `contracts.read`          | admin_master, tenant_admin, commercial, lawyer, operations_manager                                             |
| **contratos**           | `contracts.create`        | admin_master, tenant_admin, commercial, lawyer                                                                 |
| **contratos**           | `contracts.update`        | admin_master, tenant_admin, commercial, lawyer                                                                 |
| **contratos**           | `contracts.delete`        | admin_master, tenant_admin                                                                                     |
| **servicos**            | `services.read`           | admin_master, tenant_admin, operations_manager, commercial, viewer                                             |
| **servicos**            | `services.create`         | admin_master, tenant_admin, operations_manager, commercial                                                     |
| **servicos**            | `services.update`         | admin_master, tenant_admin, operations_manager, commercial                                                     |
| **servicos**            | `services.delete`         | admin_master, tenant_admin, operations_manager                                                                 |
| **ordens_servico**      | `service_orders.read`     | admin_master, tenant_admin, operations_manager, commercial                                                     |
| **ordens_servico**      | `service_orders.create`   | admin_master, tenant_admin, operations_manager, commercial                                                     |
| **ordens_servico**      | `service_orders.update`   | admin_master, tenant_admin, operations_manager                                                                 |
| **ordens_servico**      | `service_orders.complete` | admin_master, tenant_admin, operations_manager                                                                 |
| **estoque**             | `stock.read`              | admin_master, tenant_admin, stock_manager, operator, viewer                                                    |
| **estoque**             | `stock.create`            | admin_master, tenant_admin, stock_manager, operator                                                            |
| **estoque**             | `stock.update`            | admin_master, tenant_admin, stock_manager                                                                      |
| **estoque**             | `stock.adjust`            | admin_master, tenant_admin, stock_manager                                                                      |
| **financeiro**          | `finance.read`            | admin_master, tenant_admin, finance_manager, finance, viewer                                                   |
| **financeiro**          | `finance.create`          | admin_master, tenant_admin, finance_manager, finance                                                           |
| **financeiro**          | `finance.update`          | admin_master, tenant_admin, finance_manager                                                                    |
| **financeiro**          | `finance.delete`          | admin_master, tenant_admin, finance_manager                                                                    |
| **fiscal**              | `fiscal.read`             | admin_master, tenant_admin, finance_manager, finance                                                           |
| **fiscal**              | `fiscal.create`           | admin_master, tenant_admin, finance_manager                                                                    |
| **fiscal**              | `fiscal.authorize`        | admin_master, tenant_admin, finance_manager                                                                    |
| **suporte**             | `support.read`            | admin_master, tenant_admin, support, viewer                                                                    |
| **suporte**             | `support.create`          | admin_master, tenant_admin, support                                                                            |
| **suporte**             | `support.update`          | admin_master, tenant_admin, support                                                                            |
| **suporte**             | `support.assign`          | admin_master, tenant_admin, support_manager, support                                                           |
| **usuarios**            | `users.read`              | admin_master, tenant_admin                                                                                     |
| **usuarios**            | `users.create`            | admin_master, tenant_admin                                                                                     |
| **usuarios**            | `users.update`            | admin_master, tenant_admin                                                                                     |
| **usuarios**            | `users.delete`            | admin_master                                                                                                   |
| **configuracoes**       | `settings.read`           | admin_master, tenant_admin                                                                                     |
| **configuracoes**       | `settings.update`         | admin_master, tenant_admin                                                                                     |
| **relatorios**          | `reports.read`            | admin_master, tenant_admin, rh_manager, finance_manager, operations_manager, commercial, stock_manager, viewer |
| **relatorios**          | `reports.export`          | admin_master, tenant_admin, rh_manager, finance_manager, operations_manager, commercial, stock_manager         |
| **auditoria**           | `audit.read`              | admin_master, tenant_admin                                                                                     |
| **auditoria**           | `audit.export`            | admin_master                                                                                                   |
| **sistema**             | `system.manage`           | admin_master                                                                                                   |
| **sistema**             | `system.configure`        | admin_master                                                                                                   |
| **atendimento**         | `attendance.read`         | admin_master, tenant_admin, support                                                                            |
| **atendimento**         | `attendance.update`       | admin_master, tenant_admin, support_manager, support                                                           |
| **documentos**          | `documents.read`          | admin_master, tenant_admin, rh_manager, recruiter, commercial, viewer                                          |
| **documentos**          | `documents.upload`        | admin_master, tenant_admin, rh_manager, recruiter, commercial                                                  |
| **documentos**          | `documents.delete`        | admin_master, tenant_admin                                                                                     |
| **fornecedores**        | `suppliers.read`          | admin_master, tenant_admin, commercial, operations_manager                                                     |
| **fornecedores**        | `suppliers.create`        | admin_master, tenant_admin, commercial, operations_manager                                                     |
| **fornecedores**        | `suppliers.update`        | admin_master, tenant_admin, commercial, operations_manager                                                     |
| **fornecedores**        | `suppliers.delete`        | admin_master, tenant_admin                                                                                     |
| **facilities**          | `facilities.read`         | admin_master, tenant_admin, facilities_manager, operations_manager, viewer                                     |
| **facilities**          | `facilities.create`       | admin_master, tenant_admin, facilities_manager, operations_manager                                             |
| **facilities**          | `facilities.update`       | admin_master, tenant_admin, facilities_manager, operations_manager                                             |
| **facilities**          | `facilities.delete`       | admin_master, tenant_admin                                                                                     |
| **seguranca**           | `security.read`           | admin_master, tenant_admin, security_manager                                                                   |
| **seguranca**           | `security.update`         | admin_master, tenant_admin, security_manager                                                                   |
| **juridico**            | `legal.read`              | admin_master, tenant_admin, lawyer                                                                             |
| **juridico**            | `legal.update`            | admin_master, tenant_admin, lawyer                                                                             |
| **ti**                  | `it.read`                 | admin_master, tenant_admin, it_admin                                                                           |
| **ti**                  | `it.update`               | admin_master, tenant_admin, it_admin                                                                           |
| **chat**                | `chat.read`               | admin_master, tenant_admin, support                                                                            |
| **chat**                | `chat.respond`            | admin_master, tenant_admin, support                                                                            |
| **notificacoes**        | `notifications.read`      | admin_master, tenant_admin, rh_manager, recruiter, support                                                     |
| **notificacoes**        | `notifications.send`      | admin_master, tenant_admin, rh_manager, recruiter, support                                                     |
| **automacoes**          | `automation.read`         | admin_master, tenant_admin                                                                                     |
| **automacoes**          | `automation.manage`       | admin_master, tenant_admin, it_admin                                                                           |
| **entrevistas**         | `interviews.read`         | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **entrevistas**         | `interviews.create`       | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **entrevistas**         | `interviews.update`       | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **processos_seletivos** | `processes.read`          | admin_master, tenant_admin, rh_manager, recruiter                                                              |
| **processos_seletivos** | `processes.manage`        | admin_master, tenant_admin, rh_manager                                                                         |

---

## 6. Formato do resultado esperado

Após executar as queries, retorne:

```text
MATRIZ RBAC REAL

Data/hora GMT-3:
Total permissions: XX
Total roles: 16

Role: admin_master
Permissions: XX
Módulos: XX

Role: tenant_admin
Permissions: XX
Módulos: XX

...

Diferenças vs matriz esperada:
- Permissions ausentes:
- Permissions extras:
```

---

## 7. Restrições

- **NÃO criar permissions**
- **NÃO criar/remover/renomear roles**
- **NÃO alterar role_permissions**
- **NÃO alterar role_assignments**
- **APENAS consultar e reportar**

---

## 8. Próximo passo após validação

1. Validar matriz real contra matriz esperada
2. Ajustar documento `docs/V21-RBAC-MATRIX.md`
3. Definir mapeamento de rotas do Dashboard baseado em permissions reais
4. Implementar `PermissionGuard` no frontend

---

**Fim do documento.**
