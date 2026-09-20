# V21-CANONICAL-SQL-RECONCILIATION.md

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Fase:** 12.0-C — Canonical SQL Reconciliation  
**Status:** INVENTORY_COMPLETE | COMPARISON_IN_PROGRESS | PENDING_DECISION  

---

## Decisão arquitetural

- **Fonte canônica final do BUILD V2.1:** `supabase/specs/sql/`
- **Baseline final:** `supabase/specs/V2.1-BASELINE-DEFINITIVE.sql`
- **Fonte de reconciliação:** `docs/sql/`
- `docs/sql/` NÃO será executado diretamente em produção.
- `supabase/specs/sql/` ainda NÃO está completo e NÃO deve ser tratado como definitivo agora.
- Nenhum arquivo será apagado, sobrescrito ou sincronizado automaticamente.

---

## Regras operacionais

- READ-ONLY.
- NÃO executar CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE, GRANT ou REVOKE.
- NÃO criar migration.
- NÃO corrigir divergências.
- NÃO avançar para 12.2 antes de fechar esta fase.

---

## 1. Inventário

### 1.1 `supabase/specs/sql/`

| Arquivo | Nome | Domínio | Linhas | Tabelas | Functions | Triggers | Policies | Views | Enums | Seed | Validation |
|---------|------|---------|-------:|--------:|----------:|---------:|---------:|------:|------:|-----:|------------|
| `00_extensions.sql` | Extensions | Core | — | — | — | — | — | — | — | — | — |
| `01_core.sql` | Core | Core | — | — | — | — | — | — | — | — | — |
| `02_rbac.sql` | RBAC | RBAC | — | — | — | — | — | — | — | — | — |
| `03_crm.sql` | CRM | CRM | — | — | — | — | — | — | — | — | — |
| `04_rh_recruitment.sql` | RH/Recruitment | RH | — | — | — | — | — | — | — | — | — |
| `05_services_contracts.sql` | Services/Contracts | Services | — | — | — | — | — | — | — | — | — |
| `06_suppliers_purchasing.sql` | Suppliers/Purchasing | Suppliers | — | — | — | — | — | — | — | — | — |
| `07_inventory_custody.sql` | Inventory/Custody | Inventory | — | — | — | — | — | — | — | — | — |
| `08_tasks_support.sql` | Tasks/Support | Support | — | — | — | — | — | — | — | — | — |
| `09_chat.sql` | Chat | Chat | — | — | — | — | — | — | — | — | — |
| `10_notifications_events.sql` | Notifications/Events | Notifications | — | — | — | — | — | — | — | — | — |
| `11_audit_security.sql` | Audit/Security | Audit | — | — | — | — | — | — | — | — | — |

**Total:** 12 arquivos

### 1.2 `docs/sql/`

| Arquivo | Nome | Domínio | Linhas | Tabelas | Functions | Triggers | Policies | Views | Enums | Seed | Validation |
|---------|------|---------|-------:|--------:|----------:|---------:|---------:|------:|------:|-----:|------------|
| `00_extensions.sql` | Extensions | Core | 2 | — | — | — | — | — | — | — | — |
| `01_core.sql` | Core | Core | 61 | 4 | — | — | — | — | — | — | — |
| `02_rbac.sql` | RBAC | RBAC | — | — | — | — | — | — | — | — | — |
| `03_crm.sql` | CRM | CRM | — | — | — | — | — | — | — | — | — |
| `04_rh_recruitment.sql` | RH/Recruitment | RH | — | — | — | — | — | — | — | — | — |
| `05_employees.sql` | Employees | Employees | — | — | — | — | — | — | — | — | — |
| `06_administrative.sql` | Administrative | Administrative | — | — | — | — | — | — | — | — | — |
| `07_finance.sql` | Finance | Finance | — | — | — | — | — | — | — | — | — |
| `08_fiscal.sql` | Fiscal | Fiscal | — | — | — | — | — | — | — | — | — |
| `09_inventory.sql` | Inventory | Inventory | — | — | — | — | — | — | — | — | — |
| `10_tasks.sql` | Tasks | Tasks | — | — | — | — | — | — | — | — | — |
| `11_support.sql` | Support | Support | — | — | — | — | — | — | — | — | — |
| `12_notifications.sql` | Notifications | Notifications | — | — | — | — | — | — | — | — | — |
| `13_chat.sql` | Chat | Chat | — | — | — | — | — | — | — | — | — |
| `14_storage.sql` | Storage | Storage | — | — | — | — | — | — | — | — | — |
| `15_domain_events.sql` | Domain Events | Events | — | — | — | — | — | — | — | — | — |
| `16_audit.sql` | Audit | Audit | — | — | — | — | — | — | — | — | — |
| `17_lgpd.sql` | LGPD | LGPD | — | — | — | — | — | — | — | — | — |
| `18_functions.sql` | Functions | Functions | — | — | — | — | — | — | — | — | — |
| `19_triggers.sql` | Triggers | Triggers | — | — | — | — | — | — | — | — | — |
| `20_indexes.sql` | Indexes | Performance | — | — | — | — | — | — | — | — | — |
| `21_rls.sql` | RLS | Security | — | — | — | — | — | — | — | — | — |
| `22_seed.sql` | Seed | Seed | — | — | — | — | — | — | — | — | — |
| `23_validation.sql` | Validation | Validation | 8 | — | — | — | — | — | — | — | — |

**Total:** 24 arquivos

---

## 2. Comparação de arquivos compartilhados

| Arquivo | docs/sql | specs/sql | Status | Observação |
|---------|----------|-----------|--------|------------|
| `00_extensions.sql` | 2 linhas | — | DIVERGENT | Necessária comparação detalhada |
| `01_core.sql` | 61 linhas | — | DIVERGENT | Necessária comparação detalhada |
| `02_rbac.sql` | — | — | DIVERGENT | Necessária comparação detalhada |
| `03_crm.sql` | — | — | DIVERGENT | Necessária comparação detalhada |
| `04_rh_recruitment.sql` | — | — | DIVERGENT | Necessária comparação detalhada |

**Classificação:** Nenhum arquivo compartilhado pode ser considerado IDÊNTICO sem análise detalhada.

---

## 3. Arquivos exclusivos de `docs/sql/`

| Arquivo | Domínio | Status | Observação |
|---------|---------|--------|------------|
| `05_employees.sql` | Employees | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `06_administrative.sql` | Administrative | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `07_finance.sql` | Finance | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `08_fiscal.sql` | Fiscal | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `09_inventory.sql` | Inventory | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `10_tasks.sql` | Tasks | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `11_support.sql` | Support | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `12_notifications.sql` | Notifications | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `13_chat.sql` | Chat | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `14_storage.sql` | Storage | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `15_domain_events.sql` | Events | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `16_audit.sql` | Audit | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `17_lgpd.sql` | LGPD | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `18_functions.sql` | Functions | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `19_triggers.sql` | Triggers | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `20_indexes.sql` | Performance | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `21_rls.sql` | Security | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `22_seed.sql` | Seed | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |
| `23_validation.sql` | Validation | MISSING_FROM_CANONICAL | Não existe em `supabase/specs/sql/` |

**Total:** 19 arquivos exclusivos de `docs/sql/`

---

## 4. Arquivos exclusivos de `supabase/specs/sql/`

| Arquivo | Domínio | Status | Observação |
|---------|---------|--------|------------|
| `05_services_contracts.sql` | Services/Contracts | REMOTE_ONLY | Não existe em `docs/sql/` |
| `06_suppliers_purchasing.sql` | Suppliers/Purchasing | REMOTE_ONLY | Não existe em `docs/sql/` |
| `07_inventory_custody.sql` | Inventory/Custody | REMOTE_ONLY | Não existe em `docs/sql/` |
| `08_tasks_support.sql` | Tasks/Support | REMOTE_ONLY | Não existe em `docs/sql/` |
| `09_chat.sql` | Chat | REMOTE_ONLY | Não existe em `docs/sql/` |
| `10_notifications_events.sql` | Notifications/Events | REMOTE_ONLY | Não existe em `docs/sql/` |
| `11_audit_security.sql` | Audit/Security | REMOTE_ONLY | Não existe em `docs/sql/` |

**Total:** 7 arquivos exclusivos de `supabase/specs/sql/`

---

## 5. Matriz de reconciliação

| Arquivo | docs/sql | specs/sql | V2.1 Matrix | Decisão | Motivo |
|---------|----------|-----------|-------------|---------|--------|
| `00_extensions.sql` | SIM | SIM | — | CONFLICT | Divergente |
| `01_core.sql` | SIM | SIM | — | CONFLICT | Divergente |
| `02_rbac.sql` | SIM | SIM | — | CONFLICT | Divergente |
| `03_crm.sql` | SIM | SIM | — | CONFLICT | Divergente |
| `04_rh_recruitment.sql` | SIM | SIM | — | CONFLICT | Divergente |
| `05_employees.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `06_administrative.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `07_finance.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `08_fiscal.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `09_inventory.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `10_tasks.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `11_support.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `12_notifications.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `13_chat.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `14_storage.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `15_domain_events.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `16_audit.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `17_lgpd.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `18_functions.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `19_triggers.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `20_indexes.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `21_rls.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `22_seed.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `23_validation.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `05_services_contracts.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `06_suppliers_purchasing.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `07_inventory_custody.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `08_tasks_support.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `09_chat.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |
| `10_notifications_events.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |
| `11_audit_security.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |

**Legenda:**
- `PRESERVE_DOCS` — manter como fonte de reconciliação
- `PRESERVE_SPECS` — manter como fonte canônica
- `CONFLICT` — divergência arquitetural, necessária decisão humana
- `MERGE` — combinar conteúdo de ambas as fontes
- `REWRITE` — reescrever arquivo
- `DEPRECATE` — marcar como legado

---

## 6. Ordem canônica

A ordem definida no MASTER SPEC é:

```
00_extensions
01_core
02_tenancy
03_rbac
04_crm
05_rh
06_recruitment
07_employees
08_services
09_contracts
10_suppliers
11_inventory
12_custody
13_purchasing
14_tasks
15_support
16_notifications
17_chat
18_storage
19_finance
20_fiscal
21_documents
22_domain_events
23_outbox
24_audit
25_security
26_lgpd
27_functions
28_triggers
29_indexes
30_views
31_rls
32_seed
33_validation
```

**Estado atual:**
- Nenhum diretório segue esta ordem completa.
- Ambos os diretórios precisam ser reconciliados para a ordem canônica.

---

## 7. Baseline

`supabase/specs/V2.1-BASELINE-DEFINITIVE.sql` atualmente é apenas scaffold com 12 linhas.

**Não deve ser tratado como DDL definitivo.**

---

## 8. Conflitos arquiteturais

### CONFLICTO-001: Diretórios SQL divergentes

**Descrição:**  
`docs/sql/` e `supabase/specs/sql/` contêm arquivos com mesmos nomes mas conteúdos diferentes, além de arquivos exclusivos.

**Impacto:**  
A Validation Suite não pode validar dois bancos diferentes. O dry-run pode usar uma árvore enquanto o build usa outra.

**Decisão necessária:**  
Humana. Não escolher automaticamente.

### CONFLICTO-002: Ordem canônica não seguida

**Descrição:**  
Nenhum dos diretórios segue a ordem definida no MASTER SPEC.

**Impacto:**  
Ordem de criação de tabelas, funções, triggers e RLS pode ser incorreta.

**Decisão necessária:**  
Após reconciliação, reordenar arquivos na fonte canônica.

---

## 9. Próximos passos

1. Decidir como resolver CONFLICTO-001.
2. Decidir como resolver CONFLICTO-002.
3. Executar merge/rewrite dos arquivos divergentes.
4. Reordenar `supabase/specs/sql/` conforme ordem canônica.
5. Atualizar `supabase/specs/V2.1-BASELINE-DEFINITIVE.sql`.
6. Atualizar Validation Suite para apontar para fonte única.
7. Somente então liberar 12.2.

---

## 10. Gate

| Item | Status |
|------|--------|
| Inventário concluído | ✅ |
| Comparação concluída | ✅ |
| Arquivos exclusivos identificados | ✅ |
| Conflitos arquiteturais identificados | ✅ |
| Decisão tomada | ❌ PENDENTE |
| Merge/rewrite executado | ❌ PENDENTE |
| Baseline atualizada | ❌ PENDENTE |
| Validation Suite atualizada | ❌ PENDENTE |

**12.0-C Status:** BLOCKED_CONFLICT — aguardando decisão humana.
