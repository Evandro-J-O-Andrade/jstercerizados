# Seed de Homologação — J&S Empregos

Data da execução: 2026-08-25T22:13:23.275Z
Tenant: J&S Empregos LTDA
Tenant ID: d480af07-ab6b-4561-ac3a-2a0b0c1267b5
Ambiente: Homologação
Versão do seed: 1.0.0
Status: Concluído

## Usuários Criados

| Nome               | E-mail                              | Role               | Tenant      | Credencial inicial | Troca obrigatória |
| ------------------ | ----------------------------------- | ------------------ | ----------- | ------------------ | ----------------- |
| Admin Master Teste | teste.adminmaster@jsempregos.com.br | admin_master       | js-empregos | `—`                | Sim               |
| Tenant Admin Teste | teste.tenantadmin@jsempregos.com.br | tenant_admin       | js-empregos | `—`                | Sim               |
| RH Teste           | teste.rh@jsempregos.com.br          | rh_manager         | js-empregos | `—`                | Sim               |
| Financeiro Teste   | teste.financeiro@jsempregos.com.br  | finance_manager    | js-empregos | `—`                | Sim               |
| Fiscal Teste       | teste.fiscal@jsempregos.com.br      | fiscal_manager     | js-empregos | `—`                | Sim               |
| Contador Teste     | teste.contador@jsempregos.com.br    | accountant         | js-empregos | `—`                | Sim               |
| Operacional Teste  | teste.operacional@jsempregos.com.br | operations_manager | js-empregos | `—`                | Sim               |
| Recrutador Teste   | teste.recrutador@jsempregos.com.br  | recruiter          | js-empregos | `—`                | Sim               |
| Suporte Teste      | teste.suporte@jsempregos.com.br     | support            | js-empregos | `—`                | Sim               |
| Viewer Teste       | teste.viewer@jsempregos.com.br      | viewer             | js-empregos | `—`                | Sim               |

## Matriz de Permissões

### teste.adminmaster@jsempregos.com.br

Role: admin_master (global)

Permissões:

- applications.advance
- applications.create
- applications.history.read
- applications.read
- applications.reject
- applications.update
- audit_logs.read
- candidates.create
- candidates.delete
- candidates.documents.manage
- candidates.documents.read
- candidates.profile.read
- candidates.read
- candidates.update
- chat.create
- chat.handoff
- chat.read
- companies.create
- companies.delete
- companies.read
- companies.update
- contracts.create
- contracts.read
- contracts.renew
- contracts.update
- dashboard.read
- documents.create
- documents.read
- documents.version
- files.delete
- files.read
- files.upload
- jobs.close
- jobs.create
- jobs.delete
- jobs.publish
- jobs.read
- jobs.update
- lgpd.manage_consent
- lgpd.manage_retention
- lgpd.read
- notifications.create
- notifications.read
- people.create
- people.delete
- people.read
- people.update
- products.create
- products.delete
- products.read
- products.update
- purchase_orders.confirm
- purchase_orders.create
- purchase_orders.read
- purchase_orders.update
- purchase_receipts.confirm
- purchase_receipts.create
- purchase_receipts.read
- recruitment_demands.create
- recruitment_demands.delete
- recruitment_demands.read
- recruitment_demands.update
- recruitment.advance
- recruitment.create
- recruitment.delete
- recruitment.read
- recruitment.reject
- recruitment.stage.manage
- recruitment.update
- reports.read
- roles.create
- roles.delete
- roles.read
- roles.update
- security_events.read
- service_orders.complete
- service_orders.create
- service_orders.read
- service_orders.update
- stock_movements.create
- stock_movements.read
- support_tickets.create
- support_tickets.read
- support_tickets.resolve
- support_tickets.update
- talent_pool.manage
- talent_pool.match
- talent_pool.read
- tasks.assign
- tasks.create
- tasks.read
- tasks.update
- tenants.create
- tenants.delete
- tenants.read
- tenants.update

Total de permissões: 96

### teste.tenantadmin@jsempregos.com.br

Role: tenant_admin (tenant)

Permissões:

- accounting.chart_of_accounts.create
- accounting.chart_of_accounts.delete
- accounting.chart_of_accounts.read
- accounting.chart_of_accounts.update
- accounting.dashboard.read
- accounting.entries.create
- accounting.entries.delete
- accounting.entries.read
- accounting.entries.update
- accounting.reconciliation.read
- accounting.reports.export
- accounting.reports.read
- accounting.trial_balance.read
- applications.advance
- applications.approve
- applications.create
- applications.history.read
- applications.read
- applications.reject
- applications.update
- audit_logs.read
- audit.export
- audit.read
- billing.cancel
- billing.create
- billing.export
- billing.read
- billing.update
- candidates.create
- candidates.delete
- candidates.documents.manage
- candidates.documents.read
- candidates.profile.read
- candidates.read
- candidates.update
- chat.create
- chat.handoff
- chat.read
- companies.create
- companies.delete
- companies.read
- companies.update
- contracts.create
- contracts.read
- contracts.renew
- contracts.update
- dashboard.read
- documents.create
- documents.publish
- documents.read
- documents.update
- documents.version
- files.create
- files.delete
- files.read
- files.update
- files.upload
- finance.accounts_payable.create
- finance.accounts_payable.delete
- finance.accounts_payable.read
- finance.accounts_payable.update
- finance.accounts_receivable.create
- finance.accounts_receivable.delete
- finance.accounts_receivable.read
- finance.accounts_receivable.update
- finance.approve
- finance.billing.cancel
- finance.billing.create
- finance.billing.read
- finance.billing.update
- finance.cashflow.read
- finance.create
- finance.dashboard.read
- finance.delete
- finance.export
- finance.read
- finance.reconcile
- finance.reports.export
- finance.reports.read
- finance.suppliers.read
- finance.update
- fiscal.dashboard.read
- fiscal.invoices.cancel
- fiscal.invoices.issue
- fiscal.invoices.read
- fiscal.invoices.void
- fiscal.reports.export
- fiscal.reports.read
- fiscal.taxes.read
- integrations.create
- integrations.delete
- integrations.manage
- integrations.test
- integrations.update
- jobs.archive
- jobs.close
- jobs.create
- jobs.delete
- jobs.publish
- jobs.read
- jobs.update
- lgpd.manage_consent
- lgpd.manage_retention
- lgpd.read
- notifications.create
- notifications.read
- people.create
- people.delete
- people.read
- people.update
- permissions.read
- products.create
- products.delete
- products.read
- products.update
- purchase_orders.confirm
- purchase_orders.create
- purchase_orders.read
- purchase_orders.update
- purchase_receipts.confirm
- purchase_receipts.create
- purchase_receipts.read
- recruitment_demands.create
- recruitment_demands.delete
- recruitment_demands.read
- recruitment_demands.update
- recruitment.advance
- recruitment.create
- recruitment.delete
- recruitment.read
- recruitment.reject
- recruitment.stage.manage
- recruitment.update
- reports.export
- reports.generate
- reports.read
- roles.create
- roles.read
- roles.update
- security_events.read
- service_orders.cancel
- service_orders.complete
- service_orders.create
- service_orders.read
- service_orders.update
- stock_movements.create
- stock_movements.export
- stock_movements.read
- support_tickets.close
- support_tickets.create
- support_tickets.read
- support_tickets.resolve
- support_tickets.update
- talent_pool.manage
- talent_pool.match
- talent_pool.read
- tasks.assign
- tasks.create
- tasks.read
- tasks.update
- tenant.manage
- tenant.update

Total de permissões: 162

### teste.rh@jsempregos.com.br

Role: rh_manager (tenant)

Permissões:

- applications.advance
- applications.approve
- applications.create
- applications.history.read
- applications.interview
- applications.read
- applications.reject
- applications.update
- candidates.create
- candidates.delete
- candidates.documents.manage
- candidates.documents.read
- candidates.export
- candidates.profile.read
- candidates.read
- candidates.update
- dashboard.read
- files.create
- files.delete
- files.read
- files.update
- jobs.archive
- jobs.close
- jobs.create
- jobs.delete
- jobs.publish
- jobs.read
- jobs.update
- people.create
- people.export
- people.read
- people.update
- recruitment_demands.create
- recruitment_demands.delete
- recruitment_demands.read
- recruitment_demands.update
- recruitment.advance
- recruitment.create
- recruitment.delete
- recruitment.read
- recruitment.reject
- recruitment.stage.manage
- recruitment.update
- reports.export
- reports.generate
- reports.read
- talent_pool.manage
- talent_pool.match
- talent_pool.read

Total de permissões: 49

### teste.financeiro@jsempregos.com.br

Role: finance_manager (tenant)

Permissões:

- accounting.dashboard.read
- billing.cancel
- billing.create
- billing.export
- billing.read
- billing.update
- companies.read
- dashboard.read
- files.read
- finance.accounts_payable.create
- finance.accounts_payable.delete
- finance.accounts_payable.read
- finance.accounts_payable.update
- finance.accounts_receivable.create
- finance.accounts_receivable.delete
- finance.accounts_receivable.read
- finance.accounts_receivable.update
- finance.approve
- finance.billing.cancel
- finance.billing.create
- finance.billing.read
- finance.billing.update
- finance.cashflow.read
- finance.create
- finance.dashboard.read
- finance.delete
- finance.export
- finance.forecast
- finance.read
- finance.reconcile
- finance.reports.export
- finance.reports.read
- finance.suppliers.read
- finance.update
- fiscal.dashboard.read
- fiscal.invoices.issue
- fiscal.invoices.read
- people.read
- reports.export
- reports.generate
- reports.read

Total de permissões: 41

### teste.fiscal@jsempregos.com.br

Role: fiscal_manager (tenant)

Permissões:

- accounting.dashboard.read
- companies.read
- dashboard.read
- files.read
- finance.dashboard.read
- finance.read
- fiscal.dashboard.read
- fiscal.invoices.cancel
- fiscal.invoices.issue
- fiscal.invoices.read
- fiscal.invoices.void
- fiscal.reports.export
- fiscal.reports.read
- fiscal.taxes.read
- people.read
- reports.export
- reports.generate
- reports.read

Total de permissões: 18

### teste.contador@jsempregos.com.br

Role: accountant (tenant)

Permissões:

- accounting.chart_of_accounts.create
- accounting.chart_of_accounts.delete
- accounting.chart_of_accounts.read
- accounting.chart_of_accounts.update
- accounting.dashboard.read
- accounting.entries.create
- accounting.entries.delete
- accounting.entries.read
- accounting.entries.update
- accounting.reconciliation.read
- accounting.reports.export
- accounting.reports.read
- accounting.trial_balance.read
- companies.read
- dashboard.read
- files.read
- finance.dashboard.read
- finance.export
- finance.read
- finance.reports.export
- fiscal.dashboard.read
- fiscal.reports.export
- reports.export
- reports.generate
- reports.read

Total de permissões: 25

### teste.operacional@jsempregos.com.br

Role: operations_manager (tenant)

Permissões:

- companies.create
- companies.read
- companies.update
- contracts.create
- contracts.read
- contracts.update
- dashboard.read
- documents.create
- documents.read
- files.read
- people.create
- people.read
- people.update
- products.create
- products.read
- products.update
- purchase_orders.create
- purchase_orders.read
- purchase_orders.update
- purchase_receipts.create
- purchase_receipts.read
- reports.export
- reports.generate
- reports.read
- service_orders.complete
- service_orders.create
- service_orders.read
- service_orders.update
- stock_movements.create
- stock_movements.read
- support_tickets.create
- support_tickets.read
- support_tickets.update
- tasks.create
- tasks.read
- tasks.update

Total de permissões: 36

### teste.recrutador@jsempregos.com.br

Role: recruiter (tenant)

Permissões:

- applications.advance
- applications.approve
- applications.create
- applications.history.read
- applications.interview
- applications.read
- applications.reject
- applications.update
- candidates.create
- candidates.documents.read
- candidates.export
- candidates.profile.read
- candidates.read
- candidates.update
- dashboard.read
- jobs.archive
- jobs.create
- jobs.publish
- jobs.read
- jobs.update
- recruitment_demands.read
- recruitment.advance
- recruitment.create
- recruitment.read
- recruitment.reject
- recruitment.update
- reports.read
- talent_pool.match
- talent_pool.read

Total de permissões: 29

### teste.suporte@jsempregos.com.br

Role: support (tenant)

Permissões:

- chat.create
- chat.read
- dashboard.read
- files.read
- people.read
- support_tickets.close
- support_tickets.create
- support_tickets.read
- support_tickets.resolve
- support_tickets.update

Total de permissões: 10

### teste.viewer@jsempregos.com.br

Role: viewer (tenant)

Permissões:

- companies.read
- contracts.read
- dashboard.read
- documents.read
- files.read
- people.read
- products.read
- purchase_orders.read
- purchase_receipts.read
- reports.read
- service_orders.read
- stock_movements.read
- support_tickets.read
- tasks.read

Total de permissões: 14

## Dados Criados por Tabela

| Tabela                | Registros criados | IDs / referência                       | Relacionamentos    |
| --------------------- | ----------------- | -------------------------------------- | ------------------ |
| tenants               | 1                 | `d480af07-ab6b-4561-ac3a-2a0b0c1267b5` | —                  |
| people                | 10                | IDs                                    | auth.users         |
| tenant_memberships    | 10                | IDs                                    | people → tenant    |
| role_assignments      | 10                | IDs                                    | people → role      |
| first_login_state     | 10                | IDs                                    | people             |
| companies             | 4                 | IDs                                    | tenant             |
| company_relationships | 0                 | IDs                                    | companies → tenant |
| candidates            | 3                 | IDs                                    | people → tenant    |
| jobs                  | 20                | IDs                                    | tenant             |
| applications          | 3                 | IDs                                    | candidate → job    |

## Usuários de Homologação por Sistema

### Administração

- teste.adminmaster@jsempregos.com.br (admin_master)
- teste.tenantadmin@jsempregos.com.br (tenant_admin)

### RH

- teste.rh@jsempregos.com.br (rh_manager)
- teste.recrutador@jsempregos.com.br (recruiter)

### Financeiro

- teste.financeiro@jsempregos.com.br (finance_manager)

### Fiscal

- teste.fiscal@jsempregos.com.br (fiscal_manager)

### Contabilidade

- teste.contador@jsempregos.com.br (accountant)

### Operacional

- teste.operacional@jsempregos.com.br (operations_manager)

### Suporte

- teste.suporte@jsempregos.com.br (support)

### Visualizador

- teste.viewer@jsempregos.com.br (viewer)

## Cenários de Homologação

### ADMIN_MASTER

Deve conseguir:

- acessar gestão da plataforma
- gerenciar tenants
- gerenciar usuários
- gerenciar roles
- acessar módulos permitidos
- executar CRUD conforme permissões

### TENANT_ADMIN

Deve conseguir:

- administrar o tenant J&S
- gerenciar usuários do tenant
- configurar módulos
- acessar todos os módulos operacionais

### FINANCE_MANAGER

Deve conseguir:

- acessar Financeiro
- consultar contas a pagar e receber
- criar registros permitidos
- editar registros permitidos
- visualizar relatórios permitidos

Não deve conseguir:

- acessar funcionalidades sem permissão
- gerenciar usuários
- acessar configurações de tenant

## Primeiro Acesso

Credencial inicial de todas as contas de teste:

```
(valor não documentado — removido em 2026-09-30)
```

> A credencial inicial existiu e foi distribuída pelo procedimento de seed. O valor
> não é documentado neste repositório. Por ter sido versionado, é considerada
> comprometida e deve ser rotacionada nas contas `teste.*` antes de qualquer
> reutilização. Ver "Remoção da credencial em texto puro" ao final deste documento.

Estado inicial:

```
must_change_password = true
first_login_completed = false
terms_version = v1
privacy_version = v1
lgpd_consent_version = v1
```

Fluxo:

1. Login com senha inicial
2. Sistema detecta first login
3. Tela de troca obrigatória de senha
4. Aceite de termos e LGPD
5. Acesso liberado ao dashboard

## Validação Final do Seed

| Item                          | Status |
| ----------------------------- | ------ |
| Tenant criado                 | ✓      |
| Roles criadas                 | ✓      |
| Permissões sincronizadas      | ✓      |
| Usuários de teste criados     | ✓      |
| Memberships criadas           | ✓      |
| Role assignments criadas      | ✓      |
| First login state configurado | ✓      |
| Empresas populadas            | ✓      |
| Candidatos populados          | ✓      |
| Vagas populadas               | ✓      |
| Aplicações criadas            | ✓      |
| Idempotência                  | ✓      |
| RBAC consistente              | ✓      |
| Foreign keys válidos          | ✓      |
| Documentação gerada           | ✓      |

---

_Documento gerado automaticamente pelo seed de homologação._

---

# Plano de Seed — 21 Contas Institucionais (DESENHO, NÃO EXECUTADO)

Status: **PLANO APROVADO PARA DESENHO — NENHUMA ALTERAÇÃO EXECUTADA**
Data: 2026-09-30
Tenant-alvo: J&S Empregos LTDA — `d480af07-ab6b-4561-ac3a-2a0b0c1267b5`
Levantamento utilizado: seção “Levantamento read-only 2026-09-30” ao final deste documento
Ambiente: produção — leitura via conexão `default_transaction_read_only = on`

> Nenhum SQL de escrita foi executado. Nenhum usuário foi criado. Nenhuma role,
> permission, membership ou RLS foi alterada. Este documento é desenho técnico
> e requer revisão explícita antes de qualquer execução.

## 1. Decisões fixadas

| Item                   | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Endereço de candidatos | `candidatos@jsempregos.com.br` (typo `canditatos@` recusado) |
| Tenant                 | J&S Empregos LTDA — `d480af07-ab6b-4561-ac3a-2a0b0c1267b5`   |
| Total de contas        | 21                                                           |
| Contas existentes      | 2 (`financeiro@`, `gestor@`) — não duplicar                  |
| Contas novas           | 19                                                           |
| Identificador da conta | `auth.users.email`. Nome é dado cadastral editável.          |
| Idempotência           | Obrigatória em todas as etapas                               |
| Roles `deprecated`     | Proibidas (`operator`, `support`, `it_admin`)                |
| Roles com 0 permissões | Proibidas sem decisão explícita                              |
| Criação de role/perm   | Proibida nesta etapa                                         |

## 2. Matriz das 21 contas

Fonte de verdade: `roles` e `role_permissions` do banco em 2026-09-30.

| Email                            | Nome inicial            | Área          | Role proposta        | Role existe? | Permissões > 0? | Tenant      | Ação                         |
| -------------------------------- | ----------------------- | ------------- | -------------------- | ------------ | --------------- | ----------- | ---------------------------- |
| `financeiro@jsempregos.com.br`   | Financeiro J&S Empregos | Financeiro    | `finance_manager`    | Sim · active | Sim · 41        | js-empregos | **Reutilizar**               |
| `gestor@jsempregos.com.br`       | Gestor J&S Empregos     | Gestão        | `tenant_admin`       | Sim · active | Sim · 168       | js-empregos | **Reutilizar**               |
| `adm@jsempregos.com.br`          | Administração           | Administração | `tenant_admin`       | Sim · active | Sim · 168       | js-empregos | Criar                        |
| `atendimento@jsempregos.com.br`  | Atendimento             | Atendimento   | `support_agent`      | Sim · active | Sim · 11        | js-empregos | Criar                        |
| `candidatos@jsempregos.com.br`   | Candidatos              | Candidatos    | `candidato`          | Sim · active | Sim · 15        | js-empregos | Criar                        |
| `comercial@jsempregos.com.br`    | Comercial               | Comercial     | `commercial`         | Sim · active | Sim · 24        | js-empregos | Criar                        |
| `contabil@jsempregos.com.br`     | Contabilidade           | Contábil      | `accounting_manager` | Sim · active | Sim · 23        | js-empregos | Criar                        |
| `dp@jsempregos.com.br`           | Departamento Pessoal    | DP            | `rh_manager`         | Sim · active | Sim · 51        | js-empregos | Criar + GAP de modelagem     |
| `juridico@jsempregos.com.br`     | Jurídico                | Jurídico      | `lawyer`             | Sim · active | Sim · 10        | js-empregos | Criar                        |
| `rh@jsempregos.com.br`           | Recursos Humanos        | RH            | `rh_manager`         | Sim · active | Sim · 51        | js-empregos | Criar                        |
| `selecao@jsempregos.com.br`      | Seleção                 | Recrutamento  | `recruiter`          | Sim · active | Sim · 29        | js-empregos | Criar                        |
| `suporte@jsempregos.com.br`      | Suporte                 | Suporte       | `support_agent`      | Sim · active | Sim · 11        | js-empregos | Criar                        |
| `contato@jsempregos.com.br`      | Contato                 | Geral         | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `diretoria@jsempregos.com.br`    | Diretoria               | Diretoria     | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `empresas@jsempregos.com.br`     | Empresas                | Empresas      | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `fornecedores@jsempregos.com.br` | Fornecedores            | Suprimentos   | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `lgpd@jsempregos.com.br`         | LGPD                    | Privacidade   | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `marketing@jsempregos.com.br`    | Marketing               | Marketing     | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `parcerias@jsempregos.com.br`    | Parcerias               | Parcerias     | —                    | —            | —               | js-empregos | **GAP — decisão necessária** |
| `noreply@jsempregos.com.br`      | No Reply                | Sistema       | —                    | —            | —               | —           | **GAP — conta de sistema**   |
| `notificacoes@jsempregos.com.br` | Notificações            | Sistema       | —                    | —            | —               | —           | **GAP — conta de sistema**   |

Resumo: **2 reutilizar · 10 criar com role válida · 9 GAP.**

## 3. Roles do catálogo REAIS (evidência)

### 3.1 Ativas e com permissões — elegíveis

| Role                  | Setor      | Nível      | Permissões |
| --------------------- | ---------- | ---------- | ---------- |
| `admin_master`        | system     | 0 (global) | 96         |
| `tenant_admin`        | tenant     | 1          | 168        |
| `rh_manager`          | rh         | 2          | 51         |
| `finance_manager`     | finance    | 2          | 41         |
| `operations_manager`  | operations | 2          | 36         |
| `billing_manager`     | finance    | 2          | 28         |
| `accountant`          | accounting | 4          | 25         |
| `commercial`          | commercial | 4          | 24         |
| `accounting_manager`  | accounting | 2          | 23         |
| `operations_operator` | operations | 4          | 21         |
| `fiscal_manager`      | fiscal     | 2          | 18         |
| `candidato`           | special    | 7          | 15         |
| `viewer`              | special    | 7          | 14         |
| `it_operator`         | it         | 4          | 13         |
| `stock_manager`       | stock      | 2          | 12         |
| `facilities_manager`  | facilities | 2          | 12         |
| `support_agent`       | support    | 4          | 11         |
| `lawyer`              | legal      | 4          | 10         |
| `security_manager`    | security   | 2          | 7          |

### 3.2 Ativas com ZERO permissões — proibidas nesta etapa

29 roles. As que tocam diretamente as contas em questão:

| Role                                             | Setor      | Permissões | Impacto                                             |
| ------------------------------------------------ | ---------- | ---------- | --------------------------------------------------- |
| `rh`                                             | rh         | 0          | Seria a role “natural” de `rh@`; proibida.          |
| `rh_supervisor`                                  | rh         | 0          | —                                                   |
| `rh_assistant`                                   | rh         | 0          | —                                                   |
| `support_manager`                                | support    | 0          | Seria a role “natural” de `suporte@`; proibida.     |
| `support_supervisor`                             | support    | 0          | —                                                   |
| `support_assistant`                              | support    | 0          | —                                                   |
| `commercial_manager`                             | commercial | 0          | Seria a role “natural” de `comercial@`; proibida.   |
| `commercial_supervisor`                          | commercial | 0          | —                                                   |
| `commercial_assistant`                           | commercial | 0          | —                                                   |
| `company_representative`                         | commerce   | 0          | Role semanticamente exata de `empresas@`; proibida. |
| `it_manager`                                     | it         | 0          | —                                                   |
| `it_supervisor` / `it_assistant`                 | it         | 0          | —                                                   |
| `accounting_supervisor` / `accounting_assistant` | accounting | 0          | —                                                   |
| `billing_supervisor` / `billing_assistant`       | finance    | 0          | —                                                   |
| `finance_supervisor` / `finance_assistant`       | finance    | 0          | —                                                   |
| `fiscal_supervisor` / `fiscal_assistant`         | fiscal     | 0          | —                                                   |
| `operations_supervisor` / `operations_assistant` | operations | 0          | —                                                   |
| `security_supervisor` / `security_assistant`     | security   | 0          | —                                                   |
| `stock_supervisor` / `stock_assistant`           | stock      | 0          | —                                                   |
| `facilities_supervisor` / `facilities_assistant` | facilities | 0          | —                                                   |

**Estas 29 roles são GAP arquitetural separado. Não serão “consertadas” para viabilizar este seed.**

### 3.3 Deprecated — proibidas

| Role       | Substituta declarada  |
| ---------- | --------------------- |
| `operator` | `operations_operator` |
| `support`  | `support_agent`       |
| `it_admin` | `it_operator`         |

## 4. GAPs detalhados

| #   | Conta           | Motivo                                                                                 | Candidatos técnicos (não escolhidos)                                                |
| --- | --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| G1  | `contato@`      | Não existe role “geral / contato”.                                                     | `viewer` (14, somente leitura) — adequação duvidosa                                 |
| G2  | `diretoria@`    | Não existe role “diretoria / executivo”.                                               | `tenant_admin` (168) — decisão de governança, não técnica                           |
| G3  | `empresas@`     | A role semanticamente exata (`company_representative`) tem **0 permissões**.           | `operations_manager` (36) ou `commercial` (24) — concedem muito mais que “empresas” |
| G4  | `fornecedores@` | Não existe setor `suprimentos` / `fornecedores`.                                       | `stock_manager` (12) ou `operations_manager` (36) — ambos com `purchase_orders`     |
| G5  | `lgpd@`         | Não existe role `lgpd` / `dpo`. `lgpd.*` só existe em `admin_master` e `tenant_admin`. | `tenant_admin` (168) ou `security_manager` (7)                                      |
| G6  | `marketing@`    | Não existe setor `marketing`.                                                          | `commercial` (24)                                                                   |
| G7  | `parcerias@`    | Não existe setor `parcerias`.                                                          | `commercial` (24) ou `operations_manager` (36)                                      |
| G8  | `noreply@`      | Conta de sistema, não humana. Não deve receber role humana.                            | Nenhuma. Ver seção 6.                                                               |
| G9  | `notificacoes@` | Conta de sistema, não humana. Não deve receber role humana.                            | Nenhuma. Ver seção 6.                                                               |

### GAP de modelagem (não bloqueia, mas registrar)

**`dp@` (Departamento Pessoal)** não possui setor próprio. O único papel do setor `rh`
com permissões é `rh_manager` (51), que é exatamente a mesma role proposta para `rh@`.
Consequência: DP e RH ficariam com autorização idêntica, e `rh@` poderia executar
ações de DP sem qualquer distinção no RBAC. Decisão pendente do negócio.

**`candidatos@`** com role `candidato` (15 permissões, nível 7, setor `special`) precisa
de validação de que a RLS de auto-isolamento do candidato aceita um `person` sem registro
correspondente em `candidates`. Não validado nesta etapa.

## 5. Algoritmo de seed idempotente

### 5.1 Pré-condições a verificar antes de executar

1. Existência da função/trigger `handle_new_auth_user` **no banco**. Se ausente,
   o seed deve inserir `people` explicitamente em vez de confiar no trigger.
2. Existência de `public.first_login_state` e de suas colunas
   (`person_id`, `must_change_password`, `terms_version`, `privacy_version`,
   `lgpd_consent_version`, `first_login_completed`).
3. Existência de índice único em `people.email`. Se não existir, a idempotência
   **não pode** usar `ON CONFLICT (email)` — deve usar `SELECT` + inserção
   condicional dentro de transação.
4. Existência de restrição única em `tenant_memberships(person_id, tenant_id)` e
   `role_assignments(person_id, role_id, tenant_id)`. Mesma regra: sem isso,
   deduplicar por `SELECT` explícito.
5. Papel de execução com direito de escrita em `auth.users` (Admin API) e em
   `public`. A conexão de leitura usada no levantamento **não serve** para o seed.

### 5.2 Ordem segura de criação

```
Para cada conta, na ordem:

  1. auth.users
     └─ Auth Admin API: createUser({ email, email_confirm: true,
                                     user_metadata: { full_name } })
        ├─ não existe → cria; trigger_handle_new_user cria `people`
        ├─ já existe  → NÃO recria; reaproveita o id
        └─ e-mail desativado/banned/soft-deleted → ABORTAR e registrar GAP

  2. people
     └─ SELECT por auth_user_id
        ├─ existe       → reutilizar; NÃO sobrescrever full_name
        ├─ não existe   → INSERT (id, auth_user_id, full_name, email, status)
        └─ full_name divergente → registrar, NÃO sobrescrever

  3. first_login_state
     └─ SELECT por person_id
        ├─ não existe → INSERT (must_change_password = true,
                                terms/privacy/lgpd = 'v1',
                                first_login_completed = false)
        └─ já existe  → reutilizar

  4. tenant_memberships
     └─ SELECT WHERE person_id = ? AND tenant_id = J&S
        ├─ não existe → INSERT (status 'active', membership_role 'member')
        └─ já existe  → reutilizar

  5. role_assignments
     └─ SELECT WHERE person_id = ? AND role_id = ? AND tenant_id = J&S
        ├─ não existe → INSERT
        ├─ já existe  → reutilizar
        └─ existe com OUTRA role → NÃO sobrescrever; registrar para revisão
```

### 5.3 Regras de idempotência — comportamento esperado

| Situação no banco                                                  | Comportamento do seed                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Usuário não existe                                                 | Criar `auth.users`; a cadeia 2–5 é criada em sequência.                   |
| `auth.users` existe, `people` não                                  | **Não** criar usuário duplicado. Reconciliar `people` por `auth_user_id`. |
| `auth.users` + `people` existem                                    | Reutilizar. Não tocar em `full_name`, `status` ou timestamps.             |
| Membership já existe                                               | Não duplicar.                                                             |
| Role assignment já existe (mesma role)                             | Não duplicar.                                                             |
| Role assignment com role **diferente**                             | **NÃO** sobrescrever. Registrar para revisão humana.                      |
| Dados conflitantes (nome divergente, status inativo, conta banida) | **NÃO** corrigir. Registrar GAP.                                          |
| E-mail duplicado em `auth.users`                                   | Abortar apenas aquela conta.                                              |
| Role inexistente ou com 0 permissões                               | Abortar aquela conta. Não criar role nem permission.                      |

Toda a execução deve ocorrer em transação por conta, de forma que uma falha
individual não deixe cadeia parcial.

## 6. Contas de sistema (`noreply@`, `notificacoes@`)

O modelo atual **não possui** papel de serviço. Não há role `system`, `service`,
`integration` ou `machine`, e `tenant_memberships.membership_role` é texto livre
com valor observado `member`.

Ambas as contas ficam como **GAP**. Avaliação necessária antes de qualquer decisão:

1. Elas precisam de login humano? Provavelmente **não**. Se não, não devem existir
   em `auth.users` — um remetente de e-mail não é um usuário do Portal.
2. Se forem apenas endereços de envio (`noreply@`, `notificacoes@`), devem ser
   configurados no provedor de e-mail e **fora** do banco de identidade.
3. Se precisarem de acesso ao sistema, exige um desenho novo de service account,
   que é GAP arquitetural e está fora do escopo deste seed.

Nenhuma das duas foi incluída no fluxo de criação até essa decisão.

## 7. Senha inicial

A senha inicial **não aparece** neste documento, no código, no SQL, no Git, no
relatório nem em log de terminal.

Mecanismo previsto: o valor é obtido de um cofre de segredos / variável de
ambiente injetada **no momento da execução**, e nunca é persistido em arquivo.
Todas as contas nascem com `must_change_password = true` e
`first_login_completed = false`, forçando troca no primeiro acesso.

## 8. Segurança

- Somente leitura foi executado até aqui, com `default_transaction_read_only = on`.
- Nenhum hash de senha, refresh token, secret ou credencial foi lido ou exibido.
- Nenhuma migration foi criada ou aplicada.
- Nenhuma RLS, grant ou permissão foi alterada.

## 9. Pendências para a revisão

1. Decidir os 9 GAPs (G1–G9) da seção 4.
2. Decidir o modelo de contas de sistema (seção 6).
3. Confirmar as 5 pré-condições da seção 5.1.
4. Validar se `candidato` (15 permissões) é aceitável para `candidatos@`.
5. Decidir se DP e RH podem compartir `rh_manager` sem distinção.
6. Autorizar, ou não, a execução do seed.

---

## Levantamento read-only 2026-09-30

Base do plano acima. Execução somente-SELECT, conexão com
`default_transaction_read_only = on` e `statement_timeout = 30s`.
Projeto: `okxqfyoqbhcmflpurfrw`. Nenhuma escrita realizada.

### Volumetria

| Tabela               | Total                              |
| -------------------- | ---------------------------------- |
| `auth.users`         | 23 (12 em `@jsempregos.com.br`)    |
| `people`             | 41 (22 com `auth_user_id`, 19 sem) |
| `tenants`            | 3                                  |
| `tenant_memberships` | 43                                 |
| `role_assignments`   | 37                                 |
| `roles`              | 53 (50 `active`, 3 `deprecated`)   |
| `permissions`        | 230                                |

### Integridade referencial — todas zeradas

| Verificação                                           | Órfãos |
| ----------------------------------------------------- | ------ |
| `people.auth_user_id` sem `auth.users` correspondente | 0      |
| `tenant_memberships` sem `people`                     | 0      |
| `tenant_memberships` sem `tenants`                    | 0      |
| `role_assignments` sem `people`                       | 0      |
| `role_assignments` sem `roles`                        | 0      |
| E-mails duplicados em `people`                        | 0      |

### Contas existentes no domínio

| E-mail                         | `auth.users`            | `people`   | Membership   | Role              | Último acesso |
| ------------------------------ | ----------------------- | ---------- | ------------ | ----------------- | ------------- |
| `financeiro@jsempregos.com.br` | `f7dfd4a2` · confirmado | `993ae2a4` | J&S · active | `finance_manager` | nunca         |
| `gestor@jsempregos.com.br`     | `41c0039a` · confirmado | `a6798b31` | J&S · active | `tenant_admin`    | 2026-08-27    |

Os outros 19 e-mails da lista não existem em `auth.users` nem em `people`.
`canditatos@` e `candidatos@` estavam ambos ausentes; a decisão foi por
`candidatos@jsempregos.com.br`.

### Personas sem login

`admin@`, `admin.tenant@`, `gerente@` e `operador@` existem em `people` com
membership e role, mas com `auth_user_id = NULL`. Não são contas de auth.

### Dados de teste em produção

10 contas `teste.*@jsempregos.com.br` com `auth.users`, `people` e roles reais
(`teste.adminmaster` = `admin_master`, `teste.tenantadmin` = `tenant_admin`,
`teste.rh` = `rh_manager`, entre outras). Registrado como pendência;
não alterado.

### Estrutura de `permissions`

A tabela `permissions` **não possui coluna `name`**. O catálogo é
`id`, `code`, `resource`, `action`, `description`. Qualquer verificação de
permissão por nome deve usar `code`.

### Nota de segurança sobre este documento

As seções anteriores deste arquivo, geradas pelo seed de homologação de
2026-08-25, continham uma senha inicial em texto puro. Achado tratado em
2026-09-30 — ver seção “Remoção da credencial em texto puro”.

---

## Auditoria de pré-condições — 2026-09-30

Somente SELECT. Conexão com `default_transaction_read_only = on` e
`statement_timeout = 30s`. Nenhuma escrita, nenhuma migration, nenhuma alteração
de role, permission, membership ou RLS.

### Resultado

| Pré-condição                   | Resultado | Evidência                                                                                         |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| `handle_new_auth_user`         | **OK**    | função `public.handle_new_auth_user()` retorna `trigger`, `SECURITY DEFINER`, `VOLATILE`          |
| Trigger de sincronização ativo | **OK**    | `on_auth_user_created` · `AFTER INSERT ON auth.users FOR EACH ROW` · `tgenabled = O` (habilitado) |
| `first_login_state`            | **OK**    | relação existe, 10 colunas, 36 linhas                                                             |
| `people.email` UNIQUE          | **NÃO**   | única restrição é `UNIQUE (auth_user_id)`; nenhum índice único sobre `email`                      |
| `tenant_memberships` UNIQUE    | **OK**    | `uq_tenant_membership_person_tenant` → `UNIQUE (person_id, tenant_id)` · 0 duplicadas             |
| `role_assignments` UNIQUE      | **OK**    | `uq_role_assignment_person_role_tenant` → `UNIQUE (person_id, role_id, tenant_id)` · 0 duplicadas |

### Consequências para o algoritmo

1. **`ON CONFLICT (email)` em `people` não é viável.** Não existe índice único sobre
   `people.email`. A idempotência de `people` deve ser feita por `SELECT` por
   `auth_user_id` e, na ausência dele, por `SELECT` por e-mail, dentro de transação.
   `people` pode, no estado atual, receber dois registros com o mesmo e-mail.
2. **`ON CONFLICT` funciona em `tenant_memberships` e `role_assignments`**, nos
   respectively pares e trios acima.
3. **Ressalva de NULL em `role_assignments`.** Em Postgres, NULLs são distintos em
   índices únicos. Atribuições com `tenant_id IS NULL` — caso de `admin@jsempregos.com.br`
   com `admin_master` — **não** serão cobertas por
   `ON CONFLICT (person_id, role_id, tenant_id)`. Para elas, a deduplicação precisa
   ser explícita.
4. **`first_login_state` tem duas colunas que não constam da migration do repositório**:
   `welcome_completed_at timestamptz` e `signup_origin text`. O desenho do seed deve
   considerar ambas.
5. **5 pessoas não possuem `first_login_state`.** Nenhuma açãoautomaticamente;
   registrado como pendência.

### Contas `teste.*` — inspeção

Nenhuma senha, hash ou token foi lido. Dez contas, todas com e-mail confirmado,
sem soft-delete e sem banimento.

| E-mail               | Person     | Tenant      | Role                             | person status | must_change | 1º login | Último acesso |
| -------------------- | ---------- | ----------- | -------------------------------- | ------------- | ----------- | -------- | ------------- |
| `teste.adminmaster@` | `cdb12511` | js-empregos | `admin_master` [global l0]       | active        | true        | não      | 2026-09-03    |
| `teste.tenantadmin@` | `79c4eefb` | js-empregos | `tenant_admin` [tenant l1]       | active        | false       | **sim**  | 2026-08-26    |
| `teste.rh@`          | `5c19c8b9` | js-empregos | `rh_manager` [tenant l2]         | active        | true        | não      | 2026-08-25    |
| `teste.financeiro@`  | `fd29323b` | js-empregos | `finance_manager` [tenant l2]    | active        | true        | não      | nunca         |
| `teste.fiscal@`      | `41bb38a4` | js-empregos | `fiscal_manager` [tenant l2]     | active        | false       | não      | 2026-08-26    |
| `teste.contador@`    | `a722a803` | js-empregos | `accountant` [tenant l4]         | active        | true        | não      | nunca         |
| `teste.operacional@` | `b4e68e98` | js-empregos | `operations_manager` [tenant l2] | active        | true        | não      | nunca         |
| `teste.recrutador@`  | `d83280e9` | js-empregos | `recruiter` [tenant l4]          | active        | false       | **sim**  | 2026-08-27    |
| `teste.suporte@`     | `5c8ed14a` | js-empregos | `support_agent` [tenant l4]      | active        | true        | não      | nunca         |
| `teste.viewer@`      | `ac54e25a` | js-empregos | `viewer` [tenant l7]             | active        | false       | **sim**  | 2026-08-26    |

(E-mails abreviados; todos em `@jsempregos.com.br`.)

Observações:

- **Nunca acessaram: 4 contas** — `financeiro`, `contador`, `operacional`, `suporte`.
- **Uso mais recente: 2026-09-03** (`teste.adminmaster`), há ~27 dias.
- **4 contas concluíram o primeiro login** e trocaram a senha
  (`tenantadmin`, `recrutador`, `viewer`) ou o estado é inconsistente (`fiscal`:
  `must_change_password = false` mas `first_login_completed = false`).
- **Efeito colateral contido**: 10 `people`, 10 `tenant_memberships`,
  10 `role_assignments`, **0 registros em `candidates`** e **0 em `legal_acceptances`**.
  Nenhuma delas sustenta dado de negócio.
- **Desvio em relação a este documento**: a tabela original deste arquivo registra
  `teste.suporte@` com role `support`, hoje `deprecated` no banco. O registro real é
  `support_agent`. A documentação estava desatualizada.
- **Contagens de permissão deste documento também estão desatualizadas**:
  `rh_manager` 49 aqui contra 51 no banco; `tenant_admin` 162 aqui contra 168 no banco.
  O RBAC evoluiu depois do seed de 2026-08-25.

Nenhuma conta `teste.*` foi desativada, removida ou alterada. A decisão de
desativar, remover ou preservar é individual e permanece pendente.

---

## Remoção da credencial em texto puro — 2026-09-30

Ação: o valor da senha inicial das contas `teste.*` foi removido deste documento.

- Tabela “Usuários Criados”: coluna `Senha inicial` renomeada para
  `Credencial inicial`, valor substituído por `—` nas 10 linhas.
- Seção “Primeiro Acesso”: bloco do valor substituído por indicação de que a
  credencial existe e não é documentada.
- Nenhuma senha foi adicionada a este documento, ao código, a SQL, a log ou a relatório.

**Risco residual — CONFIRMADO por verificação de versionamento, 2026-09-30**:

A remoção acima atingiu apenas o working tree. A busca no histórico
(`git log --all -S`) confirma que o valor **está commitado** em `52f0306`, e
`git branch -r --contains 52f0306` confirma que esse commit está presente em
`origin/main` e em mais 9 branches remotas.

Consequência: **a credencial foi publicada no remoto GitHub** e deve ser tratada
como comprometida. Isso não é hipótese.

Itens obrigatórios, nesta ordem:

1. **Rotacionar** a credencial nas 10 contas `teste.*` e verificar que a antiga
   deixa de funcionar. Operação administrativa independente do seed.
2. Só depois avaliar necessidade de limpeza histórica.
3. **Rewrite de histórico: não fazer agora.** É operação destrutiva, afeta clones,
   branches, referências, PRs e hashes, e está corretamente marcado como ⏸️.

---

## Correção de premissa — `finance_manager` NÃO está sem permissões

Registro de 2026-09-30. Uma leitura intermediária registrou que
`financeiro@ → finance_manager → 0 permissions`. Isso é **falso** e foi
verificado diretamente no catálogo.

| Role                 | Status | Scope  | Permissões | Pessoas com a role |
| -------------------- | ------ | ------ | ---------- | ------------------ |
| `finance_manager`    | active | tenant | **41**     | 2                  |
| `rh_manager`         | active | tenant | 51         | 1                  |
| `tenant_admin`       | active | tenant | 168        | 3                  |
| `admin_master`       | active | global | 96         | 3                  |
| `accounting_manager` | active | tenant | 23         | 0                  |
| `commercial`         | active | tenant | 24         | 0                  |
| `support_agent`      | active | tenant | 11         | 1                  |
| `recruiter`          | active | tenant | 29         | 1                  |
| `lawyer`             | active | tenant | 10         | 0                  |
| `candidato`          | active | tenant | 15         | 16                 |

As 41 permissões de `finance_manager` cobrem `finance.*` (contas a pagar e
receber, billing, cashflow, forecast, reconcile, export), `billing.*`,
`accounting.dashboard.read`, `fiscal.invoices.issue`, `companies.read`,
`people.read` e `reports.*`.

**Conclusão**: `financeiro@` é uma conta funcional e válida. Não existe GAP de
autorização para o Financeiro, e não há motivate para reatribuir role.

Consequência para a lista de decisões: o item
“`finance_manager` com 0 permissions” é **removido das pendências**, por ser
baseado em premissa incorreta. Ele não é o mesmo que o GAP das 29 roles ativas
sem permissões, que continua válido e independente.

---

## Schema drift registrado — `first_login_state`

Produção tem 10 colunas; a migration `20260825000004_first_access_tables.sql`
declara 8. Divergências:

| Coluna em produção                 | Migration |
| ---------------------------------- | --------- |
| `welcome_completed_at timestamptz` | ausente   |
| `signup_origin text`               | ausente   |

Registrado para reconciliação futura. **Não corrigido nesta etapa.** A origem
dessas colunas não está versionada no repositório e precisa ser identificada
antes de qualquer migration que reconstrua a tabela.

---

## Pendências de `first_login_state`

5 pessoas não possuem linha em `first_login_state`. Nenhuma ação taken.
Classificação pendente de investigação: são registros históricos legítimos
(pessoas sem login, como `admin@` / `admin.tenant@` / `gerente@` / `operador@`,
que têm `auth_user_id IS NULL`) ou uma lacuna real do fluxo de primeiro acesso?

Como `first_login_state.person_id` é a chave primária e referencia `people.id`,
a ausência da linha é compatível com o comportamento atual do fluxo, mas isso
precisa ser confirmado no código do primeiro acesso antes de o seed passar a
criar essa linha para as contas novas.

---

## Estado final do discovery

Fase encerrada como **P0 — Discovery + Homologação técnica do seed: CONCLUÍDO**.

Nada foi executado no banco. Sem escrita, sem migration, sem criação de conta,
sem alteração de role, permission, membership ou RLS.

Pendências vigentes:

| Item                                                         | Situação                         |
| ------------------------------------------------------------ | -------------------------------- |
| 9 GAPs de roles institucionais                               | 🔴 decidir                       |
| `adm` / `diretoria` / `gestor` compartilhando `tenant_admin` | 🔴 decidir                       |
| DP vs RH usando `rh_manager`                                 | 🔴 decidir                       |
| 5 `people` sem `first_login_state`                           | 🟠 investigar                    |
| 10 contas `teste.*`                                          | 🟠 classificar individualmente   |
| Rotação da credencial publicada no remoto                    | 🔴 necessária                    |
| Rewrite de histórico Git                                     | ⏸️ não fazer agora               |
| Schema drift de `first_login_state`                          | 🟡 registrado                    |
| `finance_manager` sem permissões                             | ✅ removido — premissa incorreta |
| `temp-auth.json` sem `.gitignore`                            | ✅ resolvido — P0.6              |
| Seed das 21 contas                                           | ⏸️ bloqueado                     |

---

## P0.6 — Higiene de segredo e versionamento — 2026-09-30

Executado. Sem tocar no banco, sem rewrite de histórico, sem alteração de
conteúdo de arquivo local.

| Item                                     | Antes       | Depois                                              |
| ---------------------------------------- | ----------- | --------------------------------------------------- |
| `temp-auth.json` no `.gitignore`         | não         | **sim** — `.gitignore:50`, padrão `temp-auth*.json` |
| `temp-auth.json` trackeado               | não         | não (inalterado)                                    |
| `temp-auth.json` visível no `git status` | sim         | **não**                                             |
| Conteúdo do arquivo                      | 4.883 bytes | 4.883 bytes (inalterado)                            |

Verificações executadas:

- `git check-ignore -v temp-auth.json` → `.gitignore:50:temp-auth*.json`
- `git ls-files --error-unmatch temp-auth.json` → não trackeado
- `git status --short` → o arquivo não aparece

O arquivo **não foi apagado, movido nem lido em conteúdo**. Nenhum valor de
credencial foi exibido. O objetivo era exclusivamente impedir versionamento
acidental via `git add .`.

Padrões adicionais cobertos pela mesma seção do `.gitignore`, para evitar
recorrência: `temp-auth*.json`, `auth-session*.json`, `*.session.json`.

Varrimento do diretório raiz por nomes com aparência de segredo:

| Arquivo                       | Ignorado                            | Trackeado |
| ----------------------------- | ----------------------------------- | --------- |
| `env_SUPABASE_SECRET_KEY.txt` | sim (via `env_*.txt`, preexistente) | não       |
| `temp-auth.json`              | **sim (corrigido nesta etapa)**     | não       |

Nenhum outro arquivo de credencial desprotegido foi encontrado na raiz.
