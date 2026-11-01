# MATRIZ DE PAPÉIS, PERMISSÕES E ESCOPOS — ATUAL vs PROPOSTO

**Data:** 2026-10-30  
**Status:** Proposta em revisão — nenhuma alteração aplicada  
**Regra:** todo papel precisa de responsabilidade, escopo e permissões reais. Não criar papéis apenas para preencher hierarquia visual.

---

## 1. Hierarquia de Referência (Proposta — Floresta de Domínios)

### 1.1 Papéis-base por domínio (não é cadeia linear única)

| Domínio           | Papel de Liderança | Papel de Operação    | Escopo      | Responsabilidade                                                   |
| ----------------- | ------------------ | -------------------- | ----------- | ------------------------------------------------------------------ |
| Plataforma / ROOT | admin_master       | —                    | global      | ROOT da plataforma SaaS                                            |
| Gestão do tenant  | owner              | tenant_admin         | tenant      | Proprietário do tenant; administrador delegado                     |
| Gestão do tenant  | gestor             | funcionario          | tenant      | Gestão operacional de equipes/setores; colaborador com atribuições |
| Recrutamento      | recrutador_master  | recrutador           | tenant      | Liderança e execução de recrutamento                               |
| Financeiro        | financeiro_master  | financeiro           | tenant      | Liderança e execução financeira                                    |
| Recursos Humanos  | rh_master          | rh                   | tenant      | Liderança e execução de RH                                         |
| Comercial         | comercial_master   | comercial            | tenant      | Liderança e execução comercial                                     |
| Operações         | operacao_master    | operacao             | tenant      | Liderança e execução operacional                                   |
| Suporte           | suporte_master     | suporte_ti / suporte | tenant      | Liderança e execução de suporte                                    |
| Candidatos        | —                  | candidato            | tenant/self | Acesso apenas aos próprios dados                                   |

### 1.2 Regras de separação

- Não existe cadeia linear única que subordine todos os papéis a um único tronco.
- `recrutador_master` não está subordinado funcionalmente a `gestor` de maneira automática.
- `funcionario` é uma condição funcional de vínculo interno; `candidato` é um perfil externo. Nenhum herda permissões por posicionamento consecutivo.
- O sufixo `_master` significa liderança daquele domínio dentro do escopo atribuído. **Não** significa ROOT global. Um `financeiro_master` não administra recrutamento, usuários globais ou segurança da plataforma.

---

## 2. Matriz Atual vs Proposta (Papéis)

| Papel             | Existe hoje?   | Escopo atual | Escopo proposed | Permissões hoje                 | Permissões propostas                    |
| ----------------- | -------------- | ------------ | --------------- | ------------------------------- | --------------------------------------- |
| admin_master      | ✅             | global       | global          | 113 vínculos (role_permissions) | Todas (ROOT explícito) + auditoria      |
| owner             | ❌             | —            | tenant          | —                               | Máximo dentro do tenant                 |
| tenant_admin      | ✅             | tenant       | tenant          | 185 vínculos                    | Delegado, subconjunto do owner          |
| gestor            | ❌             | —            | tenant          | —                               | Equipes, setores, operações autorizadas |
| recrutador_master | ❌             | —            | tenant          | —                               | Recrutadores + processos seletivos      |
| recrutador        | ✅ (recruiter) | tenant       | tenant          | 0 vínculos                      | Vagas, candidatos, processos (execução) |
| funcionario       | ❌             | —            | tenant          | —                               | Conforme atribuições da função          |
| candidato         | ✅             | tenant       | tenant          | —                               | Próprio currículo, candidaturas, dados  |

---

## 3. Matriz de Permissões por Domínio (Proposta)

### 3.1 Plataforma / ROOT (admin_master)

| Módulo             | Permission           | Escopo | admin_master |
| ------------------ | -------------------- | ------ | ------------ |
| tenants            | tenants.*            | global | ✅           |
| roles              | roles.*              | global | ✅           |
| permissions        | permissions.*        | global | ✅           |
| role_assignments   | role_assignments.*   | global | ✅           |
| tenant_memberships | tenant_memberships.* | global | ✅           |
| audit_logs         | audit.read           | global | ✅           |
| users (people)     | people.*             | global | ✅           |
| sistema            | system.*             | global | ✅           |

### 3.2 Gestão do Tenant (owner, tenant_admin, gestor)

| Módulo           | Permission             | owner | tenant_admin | gestor |
| ---------------- | ---------------------- | ----- | ------------ | ------ |
| pessoas          | people.read            | ✅    | ✅           | ✅     |
| pessoas          | people.create          | ✅    | ✅           | ❌     |
| pessoas          | people.update          | ✅    | ✅           | ❌     |
| pessoas          | people.delete          | ✅    | ❌           | ❌     |
| unidades         | units.read             | ✅    | ✅           | ✅     |
| unidades         | units.manage           | ✅    | ❌           | ❌     |
| departamentos    | departments.read       | ✅    | ✅           | ✅     |
| departamentos    | departments.manage     | ✅    | ❌           | ❌     |
| equipes          | teams.read             | ✅    | ✅           | ✅     |
| equipes          | teams.manage           | ✅    | ❌           | ✅     |
| role_assignments | role_assignments.read  | ✅    | ✅           | ❌     |
| role_assignments | role_assignments.write | ✅    | ❌           | ❌     |
| dashboard        | dashboard.read         | ✅    | ✅           | ✅     |

### 3.3 Recrutamento (recrutador_master, recrutador)

| Módulo                | Permission                  | recrutador_master | recrutador           |
| --------------------- | --------------------------- | ----------------- | -------------------- |
| vagas                 | jobs.read                   | ✅                | ✅                   |
| vagas                 | jobs.create                 | ✅                | ✅                   |
| vagas                 | jobs.update                 | ✅                | ❌ (apenas próprias) |
| vagas                 | jobs.publish                | ✅                | ❌                   |
| vagas                 | jobs.close                  | ✅                | ❌                   |
| vagas                 | jobs.delete                 | ✅                | ❌                   |
| candidatos            | candidates.read             | ✅                | ✅                   |
| candidatos            | candidates.create           | ✅                | ✅                   |
| candidatos            | candidates.update           | ✅                | ❌ (apenas próprias) |
| candidatos            | candidates.delete           | ✅                | ❌                   |
| documentos candidatos | candidates.documents.read   | ✅                | ✅                   |
| documentos candidatos | candidates.documents.manage | ✅                | ❌                   |
| processos             | recruitment.read            | ✅                | ✅                   |
| processos             | recruitment.create          | ✅                | ✅                   |
| processos             | recruitment.update          | ✅                | ❌                   |
| processos             | recruitment.delete          | ✅                | ❌                   |
| processos             | recruitment.advance         | ✅                | ✅                   |
| processos             | recruitment.reject          | ✅                | ✅                   |
| etapas                | recruitment.stage.manage    | ✅                | ❌                   |
| candidaturas          | applications.read           | ✅                | ✅                   |
| candidaturas          | applications.create         | ✅                | ✅                   |
| candidaturas          | applications.update         | ✅                | ❌                   |
| candidaturas          | applications.reject         | ✅                | ❌                   |
| talent_pool           | talent_pool.read            | ✅                | ✅                   |
| talent_pool           | talent_pool.manage          | ✅                | ❌                   |
| talent_pool           | talent_pool.match           | ✅                | ✅                   |
| demandas              | recruitment_demands.read    | ✅                | ✅                   |
| demandas              | recruitment_demands.create  | ✅                | ❌                   |
| demandas              | recruitment_demands.update  | ✅                | ❌                   |
| demandas              | recruitment_demands.delete  | ✅                | ❌                   |

### 3.4 Financeiro (financeiro_master, financeiro)

| Módulo     | Permission                    | financeiro_master | financeiro       |
| ---------- | ----------------------------- | ----------------- | ---------------- |
| financeiro | finance.dashboard.read        | ✅                | ✅               |
| financeiro | finance.accounts_receivable.* | ✅                | ✅ (create/read) |
| financeiro | finance.accounts_payable.*    | ✅                | ✅ (create/read) |
| financeiro | finance.cashflow.read         | ✅                | ✅               |
| financeiro | finance.billing.*             | ✅                | ✅ (create/read) |
| financeiro | finance.reconciliation.read   | ✅                | ❌               |

### 3.5 Recursos Humanos (rh_master, rh)

| Módulo | Permission       | rh_master | rh  |
| ------ | ---------------- | --------- | --- |
| rh     | employees.read   | ✅        | ✅  |
| rh     | employees.create | ✅        | ❌  |
| rh     | employees.update | ✅        | ❌  |
| rh     | employees.delete | ✅        | ❌  |
| rh     | departments.read | ✅        | ✅  |
| rh     | positions.read   | ✅        | ✅  |

### 3.6 Comercial (comercial_master, comercial)

| Módulo    | Permission       | comercial_master | comercial |
| --------- | ---------------- | ---------------- | --------- |
| comercial | companies.read   | ✅               | ✅        |
| comercial | companies.update | ✅               | ❌        |
| comercial | contracts.read   | ✅               | ✅        |
| comercial | contracts.create | ✅               | ❌        |

### 3.7 Operações (operacao_master, operacao)

| Módulo    | Permission        | operacao_master | operacao |
| --------- | ----------------- | --------------- | -------- |
| operacoes | operations.read   | ✅              | ✅       |
| operacoes | operations.create | ✅              | ✅       |
| operacoes | operations.update | ✅              | ❌       |
| estoque   | stock.read        | ✅              | ✅       |
| estoque   | stock.create      | ✅              | ❌       |

### 3.8 Suporte (suporte_master, suporte_ti, suporte)

| Módulo  | Permission              | suporte_master | suporte_ti | suporte |
| ------- | ----------------------- | -------------- | ---------- | ------- |
| suporte | support_tickets.read    | ✅             | ✅         | ✅      |
| suporte | support_tickets.create  | ✅             | ✅         | ✅      |
| suporte | support_tickets.update  | ✅             | ✅         | ❌      |
| suporte | support_tickets.resolve | ✅             | ❌         | ❌      |

### 3.9 Candidatos (candidato)

| Módulo       | Permission                       | candidato           |
| ------------ | -------------------------------- | ------------------- |
| conta        | candidates.self.read             | ✅                  |
| conta        | candidates.self.update           | ✅ (próprio perfil) |
| candidaturas | applications.self.read           | ✅                  |
| candidaturas | applications.self.create         | ✅                  |
| documentos   | candidates.documents.self.read   | ✅                  |
| documentos   | candidates.documents.self.upload | ✅                  |

---

## 4. Diferenças entre Estado Atual e Proposto

| Item                                         | Estado Atual                                | Estado Proposto                              | Ação Necessária                                  |
| -------------------------------------------- | ------------------------------------------- | -------------------------------------------- | ------------------------------------------------ |
| admin_master ROOT                            | Não explícito (depende de 113/247 vínculos) | ROOT explícito, auditável, com escopo global | Regra explícita no contrato de autorização + RLS |
| owner                                        | Não existe                                  | Criar com escopo tenant                      | Migration + seed                                 |
| gestor                                       | Não existe                                  | Criar com escopo tenant                      | Migration + seed                                 |
| recrutador_master                            | Não existe                                  | Criar com escopo tenant                      | Migration + seed                                 |
| recrutador                                   | Existe (recruiter), 0 permissões            | Conceder permissões de execução              | Seed de role_permissions                         |
| funcionario                                  | Não existe                                  | Criar com escopo tenant                      | Migration + seed                                 |
| membership_role                              | Texto livre, sem FK                         | Vincular a roles                             | Constraint/alteração de schema                   |
| RLS nas tabelas de identidade                | Ausente                                     | Implementar                                  | Migration                                        |
| Dois caminhos de auth (frontend vs contrato) | Inconsistentes                              | Unificar: contrato é fonte única             | Corrigir AuthContext para não bypassar           |

---

## 5. Regras de Herança e Escopo

1. **Não há herança automática de permissões entre papéis.** Um `gestor` não herda automaticamente as permissões de `recrutador`.
2. **Escopo de tenant é isolado.** Um `owner` do tenant A não vê dados do tenant B.
3. **admin_master tem escopo global** mas está sujeito a RLS e auditoria — não desativa isolamento.
4. **Sufixo `_master` não é ROOT.** É liderança de domínio dentro do escopo.
5. **Uma permissão de tenant não se confunde com permissão global.**
6. **Nenhum papel filho pode ampliar autoridade recebida do contexto superior.**

---

**Próximo entregável:** `03-MAPA-HIERARQUICO.md` (mapa hierárquico funcional por domínio).
