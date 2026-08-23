# RBAC V2.1 — Matriz Real do Banco

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** ae735a7  
**Fonte:** Supabase remoto (leitura apenas, commit 2bb4128 como checkpoint limpo)

---

## 1. Objetivo

Registrar a matriz RBAC real do V2.1 a partir do banco remoto, sem inventar permissions ou roles. Este documento é a fonte de verdade para o roteamento, sidebar, PermissionGuard e construção dos módulos do SaaS.

---

## 2. Status atual do RBAC

| Item                     | Valor |
| ------------------------ | ----- |
| Total de roles           | 16    |
| admin_master permissions | 63    |
| tenant_admin permissions | 53    |
| operations_manager       | 33    |
| operator                 | 21    |
| commercial               | 19    |
| finance                  | 19    |
| viewer                   | 14    |
| facilities_manager       | 11    |
| it_admin                 | 10    |
| stock_manager            | 9     |
| lawyer                   | 8     |
| security_manager         | 5     |
| support                  | 5     |
| finance_manager          | 0     |
| recruiter                | 0     |
| rh_manager               | 0     |

### Observação importante

`finance_manager`, `recruiter` e `rh_manager` existem como roles, mas atualmente têm **0 permissions** no banco. Portanto, **não devemos liberar acesso a módulos no frontend com base apenas no nome da role**; o acesso deve ser derivado das permissions efetivas de `role_permissions`.

---

## 3. Roles confirmadas no banco

| #   | Role               | Scope  | Global | Permissions | Descrição                   |
| --- | ------------------ | ------ | ------ | ----------: | --------------------------- |
| 1   | admin_master       | system | ✅     |      **63** | Administrador master global |
| 2   | tenant_admin       | tenant | ❌     |      **53** | Administrador do tenant     |
| 3   | operations_manager | tenant | ❌     |      **33** | Gerente de operações        |
| 4   | operator           | tenant | ❌     |      **21** | Operador                    |
| 5   | commercial         | tenant | ❌     |      **19** | Comercial                   |
| 6   | finance            | tenant | ❌     |      **19** | Operador financeiro         |
| 7   | viewer             | tenant | ❌     |      **14** | Visualizador                |
| 8   | facilities_manager | tenant | ❌     |      **11** | Gerente de facilities       |
| 9   | it_admin           | tenant | ❌     |      **10** | Administrador de TI         |
| 10  | stock_manager      | tenant | ❌     |       **9** | Gerente de estoque          |
| 11  | lawyer             | tenant | ❌     |       **8** | Jurídico                    |
| 12  | security_manager   | tenant | ❌     |       **5** | Gerente de segurança        |
| 13  | support            | tenant | ❌     |       **5** | Atendimento/suporte         |
| 14  | finance_manager    | tenant | ❌     |       **0** | Gerente financeiro          |
| 15  | recruiter          | tenant | ❌     |       **0** | Recrutador                  |
| 16  | rh_manager         | tenant | ❌     |       **0** | Gerente de RH               |

---

## 4. Mapa de permissions por role

### admin_master — 63 permissions

**Áreas:** Administração/SaaS, RH/CRM, Financeiro, Fiscal, Compras, Estoque, Operações, Facilities, Segurança, Suporte, Documentos, Comunicação, IA/Automação, Agenda, Relatórios, LGPD.

### tenant_admin — 53 permissions

**Áreas:** RH/CRM, Operações, Financeiro, Compras, Estoque, Suporte, Documentos, Comunicação, Agenda, Relatórios.

### operations_manager — 33 permissions

**Áreas:** Operações, Serviços, Estoque, Compras, Suporte, Agenda.

### operator — 21 permissions

**Áreas:** Operações, Estoque, Suporte.

### commercial — 19 permissions

**Áreas:** CRM, Comercial, Contratos, Serviços.

### finance — 19 permissions

**Áreas:** Financeiro, Compras, Relatórios.

### viewer — 14 permissions

**Áreas:** Leitura em RH, CRM, Operações, Estoque, Suporte.

### facilities_manager — 11 permissions

**Áreas:** Facilities, Segurança, Estoque.

### it_admin — 10 permissions

**Áreas:** TI, Automação, Segurança.

### stock_manager — 9 permissions

**Áreas:** Estoque, Compras.

### lawyer — 8 permissions

**Áreas:** Jurídico, Contratos, LGPD.

### security_manager — 5 permissions

**Áreas:** Segurança, LGPD.

### support — 5 permissions

**Áreas:** Suporte, Comunicação.

### finance_manager / recruiter / rh_manager — 0 permissions

Aguardando definição RBAC. **Não conceder acesso no frontend.**

---

## 5. Regras de decisão para roteamento

1. **Não usar tenantMemberships.length como critério único.**
2. **Não usar seletor visual do login como critério de autorização.**
3. O destino pós-login deve ser decidido por:
   - `isAdminMaster` → área administrativa global
   - `roles` + `permissions` efetivas → área do tenant/portal
   - ausência de identidade de domínio válida → onboarding
4. **Permissão real > nome da role.**

---

## 6. Próximos passos

1. Validar esta matriz contra o banco
2. Ajustar `docs/V21-DOMAIN-MAP.md` com o mapa físico das tabelas
3. Propor `docs/V21-ROUTE-MAP.md` com rotas por role/permission
4. Implementar `resolvePostLoginDestination()` no frontend
5. Implementar sidebar dinâmica por permission

---

**Fim do documento.**
