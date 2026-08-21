# Data Reconciliation: 3 Legacy Tables vs V2.1 Canonical

**Generated:** 2026-08-20T06:24:00-03:00
**Status:** 🟡 REBUILD AUTORIZÁVEL APÓS DATA RECONCILIATION

---

## 1. Inventário das 3 tabelas

| Tabela | Colunas | Linhas | FKs de saída | Dados sensíveis |
|--------|---------|--------|--------------|-----------------|
| `candidate_preferences` | 18 | **0** | → `candidates(id)` | Nenhum |
| `company_relationship_types` | 5 | **3** | ← `company_relationships(relationship_type_id)` | Sim |
| `company_types` | 5 | **6** | ← `companies(company_type_id)` | Sim |

---

## 2. Análise de impacto por tabela

### 2.1 `candidate_preferences`

**Situação:** 0 linhas. Nenhum dado para preservar.

**Produção (estrutura):**
```sql
- id (uuid PK)
- candidate_id (uuid FK → candidates)
- desired_roles (ARRAY)
- desired_locations (ARRAY)
- salary_min / salary_max (numeric)
- contract_types (ARRAY)
- shifts (ARRAY)
- work_modes (ARRAY)
- max_distance_km (integer)
- available_from (date)
- matching_enabled (boolean)
- receive_match_alerts (boolean)
- last_match_at / last_match_version / preferences_version
```

**V2.1 equivalente:** Não existe como tabela separada.

**Substituto no V2.1:** `job_matches` (com `score`, `reasons`, `algorithm_version`, `is_eligible`, `sent_notification`) + campos de matching em `candidates`.

**Conclusão:** ✅ **DROP seguro.** Nenhum dado perdido. Funcionalidade absorvida por `job_matches` no V2.1.

---

### 2.2 `company_relationship_types`

**Situação:** 3 linhas com dados ativos.

**Dados existentes:**
| id | code | name | description |
|----|------|------|-------------|
| `0529501b-...` | `client` | Cliente | NULL |
| `f086ba65-...` | `partner` | Parceiro | NULL |
| `de5be11c-...` | `supplier` | Fornecedor | NULL |

**Produção (estrutura):**
```sql
- id (uuid PK)
- code (varchar 20, UNIQUE, NOT NULL)
- name (varchar 100, NOT NULL)
- description (text)
```

**FK dependente:** `company_relationships.relationship_type_id` → esta tabela.

**V2.1 mudança:** Em `docs/sql/03_crm.sql`, `company_relationships` ganhou `relationship_type TEXT NOT NULL` (valor livre) e **removeu** o FK para `company_relationship_types`.

**Conclusão:** ⚠️ **Reconciliável.** Os 3 tipos (client, partner, supplier) devem ser preservados como seed data no V2.1. A mudança de FK para TEXT livre não perde semântica, mas os valores de referência devem ser mantidos.

**Ação:** Migrar os 3 registros como seed no V2.1.

---

### 2.3 `company_types`

**Situação:** 6 linhas com dados ativos.

**Dados existentes:**
| id | code | name | description |
|----|------|------|-------------|
| `8821fe9d-...` | `corporation` | Sociedade Anônima | NULL |
| `f0587a62-...` | `limited_company` | Sociedade Limitada | NULL |
| `1ba346be-...` | `epp` | Empresa de Pequeno Porte | NULL |
| `a6db0e7f-...` | `mei` | Microempreendedor Individual | NULL |
| `b0afcebb-...` | `nonprofit` | Organização Sem Fins Lucrativos | NULL |
| `1a7d892a-...` | `government` | Entidade Pública | NULL |

**Produção (estrutura):**
```sql
- id (uuid PK)
- code (varchar 30, UNIQUE, NOT NULL)
- name (varchar 100, NOT NULL)
- description (text)
```

**FK dependente:** `companies.company_type_id` → esta tabela.

**V2.1 mudança:** Em `docs/sql/03_crm.sql`, `companies` **não tem mais** `company_type_id`. A coluna foi removida no V2.1.

**Conclusão:** ⚠️ **Reconciliável.** Os 6 tipos devem ser preservados como seed/reference data. A coluna `company_type_id` foi removida de `companies`, então não há FK para quebrar após o rebuild.

**Ação:** Migrar os 6 registros como seed no V2.1. Nenhuma ação adicional necessária pois a FK é unidirecional (companies → company_types) e a coluna será removida.

---

## 3. Mapa de reconciliação

| Tabela Produção | Linhas | Destino V2.1 | Ação | Risco |
|-----------------|--------|--------------|------|-------|
| `candidate_preferences` | 0 | ❌ Sem equivalente | DROP | **NULO** |
| `company_relationship_types` | 3 | Seed/reference data | MIGRAR → seed | **BAIXO** |
| `company_types` | 6 | Seed/reference data | MIGRAR → seed | **BAIXO** |

---

## 4. Verificação de dependências

### `companies` (produção)
- `company_type_id` FK → `company_types(id)` 
- **No V2.1:** `company_type_id` **não existe** em `companies`
- **Após rebuild:** FK deixa de existir, dados de `company_types` são apenas seed

### `company_relationships` (produção)
- `relationship_type_id` FK → `company_relationship_types(id)`
- **No V2.1:** `relationship_type TEXT NOT NULL` substitui o FK
- **Após rebuild:** FK deixa de existir, tipo vira texto livre

### `candidate_preferences` (produção)
- Nenhuma FK de entrada (apenas `candidate_id` → `candidates`)
- **No V2.1:** Tabela não existe
- **Após rebuild:** Funcionalidade coberta por `job_matches`

---

## 5. Plano de rebuild autorizável

```text
BACKUP ✅ (verificado)
   ↓
PRESERVAR DADOS CRÍTICOS
  ├── people (1)
  ├── tenants (1)
  ├── tenant_memberships (1)
  ├── roles (10)
  ├── permissions (26)
  ├── role_assignments (1)
  ├── role_resource_permissions (114)
  ├── skills (68)
  └── company_types (6) ← MIGRAR como seed
  └── company_relationship_types (3) ← MIGRAR como seed
   ↓
DROP CONTROLADO
  ├── DROP TABLE candidate_preferences (0 linhas, sem perda)
  ├── DROP TABLE company_types (dados preservados no seed)
  ├── DROP TABLE company_relationship_types (dados preservados no seed)
  └── DROP demais objetos
   ↓
DDL CANÔNICO V2.1
  ├── 01_core (tenants, people, tenant_memberships, tenant_settings)
  ├── 02_rbac
  ├── 03_crm (companies SEM company_type_id)
  ├── 04_rh_recruitment
  ├── ... até 21_functions_triggers
   ↓
SEED V2.1
  ├── company_types (6 registros migrados)
  ├── company_relationship_types (3 registros migrados)
  ├── permissions (26)
  ├── role_resource_permissions (114)
  ├── skills (68)
  └── roles (10)
   ↓
RLS + FUNCTIONS + TRIGGERS + INDEXES
   ↓
VALIDATION
   ↓
GO
```

---

## 6. GO / NO-GO Atualizado

### 🟡 REBUILD AUTORIZÁVEL APÓS DATA RECONCILIATION

**Condições atendidas:**
1. ✅ Backup íntegro e verificado
2. ✅ 3 tabelas "órfãs" reconciliadas:
   - `candidate_preferences` → 0 linhas, drop seguro
   - `company_relationship_types` → 3 linhas, migrar como seed
   - `company_types` → 6 linhas, migrar como seed
3. ✅ Nenhuma perda irreversível de dados
4. ✅ Nenhuma FK quebrada após rebuild (V2.1 remove as FKs)

**Condições pendentes:**
1. ⏳ Executar rebuild em staging primeiro
2. ⏳ Validar frontend com novo schema
3. ⏳ Autorização explícita para produção

**Conclusão:** O rebuild pode prosseguir com segurança. As 3 tabelas foram reconciliadas e não representam bloqueio.
