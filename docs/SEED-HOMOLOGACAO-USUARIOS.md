# Seed de Homologação — J&S Empregos

Data da execução: 2026-08-25T22:13:23.275Z
Tenant: J&S Empregos LTDA
Tenant ID: d480af07-ab6b-4561-ac3a-2a0b0c1267b5
Ambiente: Homologação
Versão do seed: 1.0.0
Status: Concluído

## Usuários Criados

| Nome               | E-mail                              | Role               | Tenant      | Senha inicial | Troca obrigatória |
| ------------------ | ----------------------------------- | ------------------ | ----------- | ------------- | ----------------- |
| Admin Master Teste | teste.adminmaster@jsempregos.com.br | admin_master       | js-empregos | `saas@123456` | Sim               |
| Tenant Admin Teste | teste.tenantadmin@jsempregos.com.br | tenant_admin       | js-empregos | `saas@123456` | Sim               |
| RH Teste           | teste.rh@jsempregos.com.br          | rh_manager         | js-empregos | `saas@123456` | Sim               |
| Financeiro Teste   | teste.financeiro@jsempregos.com.br  | finance_manager    | js-empregos | `saas@123456` | Sim               |
| Fiscal Teste       | teste.fiscal@jsempregos.com.br      | fiscal_manager     | js-empregos | `saas@123456` | Sim               |
| Contador Teste     | teste.contador@jsempregos.com.br    | accountant         | js-empregos | `saas@123456` | Sim               |
| Operacional Teste  | teste.operacional@jsempregos.com.br | operations_manager | js-empregos | `saas@123456` | Sim               |
| Recrutador Teste   | teste.recrutador@jsempregos.com.br  | recruiter          | js-empregos | `saas@123456` | Sim               |
| Suporte Teste      | teste.suporte@jsempregos.com.br     | support            | js-empregos | `saas@123456` | Sim               |
| Viewer Teste       | teste.viewer@jsempregos.com.br      | viewer             | js-empregos | `saas@123456` | Sim               |

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

Senha inicial de todas as contas de teste:

```
saas@123456
```

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
