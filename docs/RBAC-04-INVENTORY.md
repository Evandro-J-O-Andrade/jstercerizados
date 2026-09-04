# RBAC-04 — Inventário Somente Leitura

**Data**: 2026-09-04  
**Escopo**: Diagnóstico somente leitura — nenhuma alteração no banco  
**Objetivo**: Levantar estado atual de roles, permissões, assignments, uso no frontend e divergências antes de definir plano de correção.

---

## 1. Resumo executivo

- **52 roles** cadastradas (49 ativas, 3 deprecated).
- **3 roles deprecated** com `replacement_role_id` definido: `it_admin`, `operator`, `support`.
- **~150 permissões** catalogadas no banco.
- **1 função de verificação** em uso: `user_has_permission(auth_user_id, resource, action, tenant_id)`.
- **Nenhuma tabela `role_resource_permissions`** encontrada; o catálogo atual usa `role_permissions` simples.
- **Frontend referencia ~110 permissões** no formato `resource.action`.

---

## 2. Inventário de roles

| Slug | Name | Scope | Level | Sector | Status | Replacement |
|------|------|-------|-------|--------|--------|-------------|
| admin_master | admin_master | global | 0 | system | active | — |
| tenant_admin | tenant_admin | tenant | 1 | tenant | active | — |
| accounting_manager | accounting_manager | tenant | 2 | accounting | active | — |
| commercial_manager | commercial_manager | tenant | 2 | commercial | active | — |
| facilities_manager | facilities_manager | tenant | 2 | facilities | active | — |
| billing_manager | billing_manager | tenant | 2 | finance | active | — |
| finance_manager | finance_manager | tenant | 2 | finance | active | — |
| fiscal_manager | fiscal_manager | tenant | 2 | fiscal | active | — |
| it_manager | it_manager | tenant | 2 | it | active | — |
| operations_manager | operations_manager | tenant | 2 | operations | active | — |
| rh_manager | rh_manager | tenant | 2 | rh | active | — |
| security_manager | security_manager | tenant | 2 | security | active | — |
| stock_manager | stock_manager | tenant | 2 | stock | active | — |
| support_manager | support_manager | tenant | 2 | support | active | — |
| accounting_supervisor | accounting_supervisor | tenant | 3 | accounting | active | — |
| commercial_supervisor | commercial_supervisor | tenant | 3 | commercial | active | — |
| facilities_supervisor | facilities_supervisor | tenant | 3 | facilities | active | — |
| billing_supervisor | billing_supervisor | tenant | 3 | finance | active | — |
| finance_supervisor | finance_supervisor | tenant | 3 | finance | active | — |
| fiscal_supervisor | fiscal_supervisor | tenant | 3 | fiscal | active | — |
| it_supervisor | it_supervisor | tenant | 3 | it | active | — |
| operations_supervisor | operations_supervisor | tenant | 3 | operations | active | — |
| rh_supervisor | rh_supervisor | tenant | 3 | rh | active | — |
| security_supervisor | security_supervisor | tenant | 3 | security | active | — |
| stock_supervisor | stock_supervisor | tenant | 3 | stock | active | — |
| support_supervisor | support_supervisor | tenant | 3 | support | active | — |
| accountant | accountant | tenant | 4 | accounting | active | — |
| commercial | commercial | tenant | 4 | commercial | active | — |
| finance | finance | tenant | 4 | finance | active | — |
| it_admin | it_admin | tenant | 4 | it | deprecated | it_operator |
| it_operator | it_operator | tenant | 4 | it | active | — |
| lawyer | lawyer | tenant | 4 | legal | active | — |
| operations_operator | operations_operator | tenant | 4 | operations | active | — |
| operator | operator | tenant | 4 | operations | deprecated | operations_operator |
| recruiter | recruiter | tenant | 4 | recruitment | active | — |
| rh | rh | tenant | 4 | rh | active | — |
| support | support | tenant | 4 | support | deprecated | support_agent |
| support_agent | support_agent | tenant | 4 | support | active | — |
| accounting_assistant | accounting_assistant | tenant | 5 | accounting | active | — |
| commercial_assistant | commercial_assistant | tenant | 5 | commercial | active | — |
| facilities_assistant | facilities_assistant | tenant | 5 | facilities | active | — |
| billing_assistant | billing_assistant | tenant | 5 | finance | active | — |
| finance_assistant | finance_assistant | tenant | 5 | finance | active | — |
| fiscal_assistant | fiscal_assistant | tenant | 5 | fiscal | active | — |
| it_assistant | it_assistant | tenant | 5 | it | active | — |
| operations_assistant | operations_assistant | tenant | 5 | operations | active | — |
| rh_assistant | rh_assistant | tenant | 5 | rh | active | — |
| security_assistant | security_assistant | tenant | 5 | security | active | — |
| stock_assistant | stock_assistant | tenant | 5 | stock | active | — |
| support_assistant | support_assistant | tenant | 5 | support | active | — |
| candidato | candidato | tenant | 7 | special | active | — |
| viewer | viewer | tenant | 7 | special | active | — |

---

## 3. Inventário de permissões (amostra — 150+)

| Resource | Action | Code | Descrição |
|----------|--------|------|-----------|
| accounting | reports | accounting.reports | Visualizar relatórios contábeis |
| accounting | trial_balance | accounting.trial_balance | accounting.trial_balance.read |
| accounting.chart_of_accounts | create | accounting.chart_of_accounts.create | Criar conta contábil |
| accounting.chart_of_accounts | delete | accounting.chart_of_accounts.delete | Remover conta contábil |
| accounting.chart_of_accounts | read | accounting.chart_of_accounts.read | Visualizar plano de contas |
| accounting.chart_of_accounts | update | accounting.chart_of_accounts.update | Atualizar conta contábil |
| accounting.dashboard | read | accounting.dashboard.read | Ler dashboard contábil |
| accounting.entries | create | accounting.entries.create | Criar lançamento |
| accounting.entries | delete | accounting.entries.delete | Remover lançamento |
| accounting.entries | read | accounting.entries.read | Visualizar lançamentos |
| accounting.entries | update | accounting.entries.update | Atualizar lançamento |
| accounting.reconciliation | read | accounting.reconciliation.read | Visualizar conciliação |
| accounting.reports | export | accounting.reports.export | Exportar relatórios contábeis |
| accounting.reports | read | accounting.reports.read | Visualizar relatórios contábeis |
| accounting.trial_balance | read | accounting.trial_balance.read | Visualizar balancete |
| ai | configure | ai.configure | Configurar IA |
| ai | test | ai.test | Testar IA |
| applications | advance | applications.advance | Avançar status da candidatura |
| applications | approve | applications.approve | Aprovar candidatura |
| applications | create | applications.create | Registrar candidatura |
| applications | interview | applications.interview | Agendar entrevista |
| applications | read | applications.read | Visualizar candidaturas |
| applications | reject | applications.reject | Rejeitar candidatura |
| applications | update | applications.update | Atualizar candidatura |
| applications.history | read | applications.history.read | Consultar histórico de status |
| audit | export | audit.export | Exportar logs de auditoria |
| audit | filter | audit.filter | Filtrar logs de auditoria |
| audit | read | audit.read | Visualizar logs de auditoria |
| audit_logs | read | audit_logs.read | Ler auditoria |
| auth | change_password | auth.change_password | Alterar senha |
| auth | revoke_session | auth.revoke_session | Encerrar sessão |
| automations | create | automations.create | Criar automação |
| automations | toggle | automations.toggle | Ativar/desativar automação |
| automations | update | automations.update | Atualizar automação |
| billing | cancel | billing.cancel | Cancelar fatura |
| billing | create | billing.create | Criar fatura |
| billing | export | billing.export | Exportar faturamento |
| billing | read | billing.read | Visualizar faturamento |
| billing | update | billing.update | Atualizar fatura |
| candidate_documents | create | candidate_documents.create | Enviar currículo e documentos |
| candidate_documents | read | candidate_documents.read | Visualizar próprios documentos |
| candidate_documents | update | candidate_documents.update | Atualizar próprios documentos |
| candidate_job_alerts | manage | candidate_job_alerts.manage | Gerenciar próprios alertas de vagas |
| candidate_profile | read | candidate_profile.read | Visualizar próprio perfil profissional |
| candidate_profile | update | candidate_profile.update | Atualizar próprio perfil profissional |
| candidates | create | candidates.create | Cadastrar candidato |
| candidates | delete | candidates.delete | Remover candidato |
| candidates | export | candidates.export | Exportar candidatos |
| candidates | read | candidates.read | Visualizar candidatos |
| candidates | self.read | candidates.self.read | Visualizar próprio perfil de candidato |
| candidates | self.update | candidates.self.update | Atualizar próprio perfil de candidato |
| candidates | update | candidates.update | Editar candidato |
| candidates.documents | manage | candidates.documents.manage | Gerenciar documentos do candidato |
| candidates.documents | read | candidates.documents.read | Consultar documentos do candidato |
| candidates.profile | read | candidates.profile.read | Consultar perfil completo do candidato |
| chat | create | chat.create | Criar conversa |
| chat | handoff | chat.handoff | Transferir atendimento |
| chat | read | chat.read | Ler conversa |
| companies | convert | companies.convert | Converter lead em cliente |
| companies | create | companies.create | Criar empresa |
| companies | delete | companies.delete | Remover empresa |
| companies | read | companies.read | Ler empresa |
| companies | update | companies.update | Atualizar empresa |
| contracts | create | contracts.create | Criar contrato |
| contracts | delete | contracts.delete | Remover contrato |
| contracts | export | contracts.export | Exportar contrato |
| contracts | read | contracts.read | Ler contrato |
| contracts | renew | contracts.renew | Renovar contrato |
| contracts | update | contracts.update | Atualizar contrato |
| dashboard | read | dashboard.read | Ler dashboard |
| documents | create | documents.create | Criar documento |
| documents | publish | documents.publish | Publicar documento |
| documents | read | documents.read | Ler documento |
| documents | update | documents.update | Atualizar documento |
| documents | version | documents.version | Criar versão de documento |
| domain_events | read | domain_events.read | Visualizar eventos/indicadores |
| employees | create | employees.create | Criar funcionários |
| employees | delete | employees.delete | Remover funcionários |
| employees | read | employees.read | Visualizar funcionários |
| employees | update | employees.update | Atualizar funcionários |
| files | create | files.create | Upload de arquivo |
| files | delete | files.delete | Remover arquivo |
| files | read | files.read | Ler arquivo |
| files | update | files.update | Atualizar arquivo |
| files | upload | files.upload | Enviar arquivo |
| finance | accounts_payable | finance.accounts_payable | finance.accounts_payable.create |
| finance | accounts_receivable | finance.accounts_receivable | finance.accounts_receivable.create |
| finance | approve | finance.approve | Aprovar pagamento |
| finance | billing | finance.billing | finance.billing.cancel |
| finance | cashflow | finance.cashflow | finance.cashflow.read |
| finance | collections | finance.collections | finance.collections.manage |
| finance | create | finance.create | Criar lançamento financeiro |
| finance | dashboard | finance.dashboard | finance.dashboard.read |
| finance | delete | finance.delete | Remover lançamento financeiro |
| finance | export | finance.export | Exportar financeiro |
| finance | forecast | finance.forecast | Projetar fluxo de caixa |
| finance | read | finance.read | Visualizar financeiro |
| finance | reconcile | finance.reconcile | Reconciliar lançamento |
| finance | reject | finance.reject | Rejeitar pagamento |
| finance | reports | finance.reports | finance.reports.export |
| finance | suppliers | finance.suppliers | finance.suppliers.read |
| finance | update | finance.update | Atualizar lançamento financeiro |
| finance.accounts_payable | create | finance.accounts_payable.create | Criar conta a pagar |
| finance.accounts_payable | delete | finance.accounts_payable.delete | Remover conta a pagar |
| finance.accounts_payable | read | finance.accounts_payable.read | Visualizar contas a pagar |
| finance.accounts_payable | update | finance.accounts_payable.update | Atualizar conta a pagar |
| finance.accounts_receivable | create | finance.accounts_receivable.create | Criar conta a receber |
| finance.accounts_receivable | delete | finance.accounts_receivable.delete | Remover conta a receber |
| finance.accounts_receivable | read | finance.accounts_receivable.read | Visualizar contas a receber |
| finance.accounts_receivable | update | finance.accounts_receivable.update | Atualizar conta a receber |
| finance.billing | cancel | finance.billing.cancel | Cancelar fatura |
| finance.billing | create | finance.billing.create | Criar fatura |
| finance.billing | read | finance.billing.read | Visualizar fatura |
| finance.billing | update | finance.billing.update | Atualizar fatura |
| finance.cashflow | read | finance.cashflow.read | Visualizar fluxo de caixa |
| finance.collections | manage | finance.collections.manage | Gerenciar cobranças |
| finance.dashboard | read | finance.dashboard.read | Visualizar dashboard financeiro |
| finance.reports | export | finance.reports.export | Exportar relatórios financeiros |
| finance.reports | read | finance.reports.read | Visualizar relatórios financeiros |
| finance.suppliers | read | finance.suppliers.read | Visualizar fornecedores |
| fiscal | dashboard | fiscal.dashboard | fiscal.dashboard.read |
| fiscal | invoices | fiscal.invoices | Cancelar nota fiscal |
| fiscal | reports | fiscal.reports | fiscal.reports.export |
| fiscal | taxes | fiscal.taxes | fiscal.taxes.read |
| fiscal.dashboard | read | fiscal.dashboard.read | Visualizar dashboard fiscal |
| fiscal.invoices | cancel | fiscal.invoices.cancel | Cancelar nota fiscal |
| fiscal.invoices | issue | fiscal.invoices.issue | Emitir nota fiscal |
| fiscal.invoices | read | fiscal.invoices.read | Visualizar notas fiscais |
| fiscal.invoices | void | fiscal.invoices.void | Anular nota fiscal |
| fiscal.reports | export | fiscal.reports.export | Exportar relatórios fiscais |
| fiscal.reports | read | fiscal.reports.read | Visualizar relatórios fiscais |
| fiscal.taxes | read | fiscal.taxes.read | Visualizar impostos |
| integrations | create | integrations.create | Criar integração |
| integrations | delete | integrations.delete | Remover integração |
| integrations | manage | integrations.manage | Gerenciar integrações |
| integrations | test | integrations.test | Testar integração |
| integrations | update | integrations.update | Atualizar integração |
| jobs | archive | jobs.archive | Arquivar vaga |
| jobs | close | jobs.close | Encerrar vaga |
| jobs | create | jobs.create | Criar vaga |
| jobs | delete | jobs.delete | Excluir vaga |
| jobs | export | jobs.export | Exportar vagas |
| jobs | publish | jobs.publish | Publicar vaga |
| jobs | read | jobs.read | Visualizar vagas |
| jobs | update | jobs.update | Editar vaga |
| lgpd | manage_consent | lgpd.manage_consent | Gerenciar consentimento |
| lgpd | manage_retention | lgpd.manage_retention | Gerenciar retenção |
| lgpd | read | lgpd.read | Ler dados LGPD |
| notifications | create | notifications.create | Criar notificação |
| notifications | read | notifications.read | Ler notificação |
| people | create | people.create | Criar pessoa |
| people | delete | people.delete | Remover pessoa |
| people | disable | people.disable | Desativar pessoa/usuário |
| people | export | people.export | Exportar pessoas/usuários |
| people | read | people.read | Ler pessoa |
| people | update | people.update | Atualizar pessoa |
| permissions | create | permissions.create | Criar permissão |
| permissions | delete | permissions.delete | Remover permissão |
| permissions | read | permissions.read | Visualizar permissões |
| permissions | update | permissions.update | Atualizar permissão |
| products | create | products.create | Criar produto |
| products | delete | products.delete | Remover produto |
| products | read | products.read | Ler produto |
| products | update | products.update | Atualizar produto |
| purchase_orders | confirm | purchase_orders.confirm | Confirmar pedido de compra |
| purchase_orders | create | purchase_orders.create | Criar pedido de compra |
| purchase_orders | read | purchase_orders.read | Ler pedido de compra |
| purchase_orders | update | purchase_orders.update | Atualizar pedido de compra |
| purchase_receipts | confirm | purchase_receipts.confirm | Confirmar recebimento |
| purchase_receipts | create | purchase_receipts.create | Criar recebimento |
| purchase_receipts | read | purchase_receipts.read | Ler recebimento |
| recruitment | advance | recruitment.advance | Avançar candidato para próxima etapa |
| recruitment | close | recruitment.close | Encerrar processo seletivo |
| recruitment | create | recruitment.create | Criar processo seletivo |
| recruitment | delete | recruitment.delete | Excluir processo seletivo |
| recruitment | read | recruitment.read | Visualizar processos seletivos |
| recruitment | reject | recruitment.reject | Reprovar candidato |
| recruitment | update | recruitment.update | Editar processo seletivo |
| recruitment_demands | create | recruitment_demands.create | Abrir nova demanda de recrutamento |
| recruitment_demands | delete | recruitment_demands.delete | Excluir demanda de recrutamento |
| recruitment_demands | read | recruitment_demands.read | Consultar demandas de recrutamento |
| recruitment_demands | update | recruitment_demands.update | Editar demanda de recrutamento |
| recruitment.stage | manage | recruitment.stage.manage | Gerenciar etapas do processo |
| reports | export | reports.export | Exportar relatório |
| reports | generate | reports.generate | Gerar relatório |
| reports | read | reports.read | Ler relatórios |
| roles | create | roles.create | Criar role |
| roles | delete | roles.delete | Remover role |
| roles | read | roles.read | Ler role |
| roles | update | roles.update | Atualizar role |
| security_events | export | security_events.export | Exportar eventos de segurança |
| security_events | read | security_events.read | Ler eventos de segurança |
| service_orders | cancel | service_orders.cancel | Cancelar ordem de serviço |
| service_orders | complete | service_orders.complete | Concluir ordem de serviço |
| service_orders | create | service_orders.create | Criar ordem de serviço |
| service_orders | read | service_orders.read | Ler ordem de serviço |
| service_orders | update | service_orders.update | Atualizar ordem de serviço |
| service_orders.dashboard | read | service_orders.dashboard.read | Ler dashboard de ordens de serviço |
| sessions | read | sessions.read | Ler sessões |
| stock_movements | create | stock_movements.create | Criar movimentação |
| stock_movements | export | stock_movements.export | Exportar movimentações |
| stock_movements | read | stock_movements.read | Ler movimentação |
| stock.dashboard | read | stock.dashboard.read | Ler dashboard de estoque |
| support_tickets | close | support_tickets.close | Fechar chamado |
| support_tickets | create | support_tickets.create | Criar ticket |
| support_tickets | read | support_tickets.read | Ler ticket |
| support_tickets | resolve | support_tickets.resolve | Resolver ticket |
| support_tickets | update | support_tickets.update | Atualizar ticket |
| support.dashboard | read | support.dashboard.read | Ler dashboard de suporte |
| talent_pool | manage | talent_pool.manage | Administrar talentos do banco |
| talent_pool | match | talent_pool.match | Executar matching candidato-vaga |
| talent_pool | read | talent_pool.read | Consultar banco de talentos |
| tasks | assign | tasks.assign | Atribuir tarefa |
| tasks | create | tasks.create | Criar tarefa |
| tasks | read | tasks.read | Ler tarefa |
| tasks | update | tasks.update | Atualizar tarefa |
| tenant | manage | tenant.manage | Gerenciar tenant |
| tenant | update | tenant.update | Atualizar tenant |
| tenants | activate | tenants.activate | Ativar tenant |
| tenants | create | tenants.create | Criar tenant |
| tenants | delete | tenants.delete | Remover tenant |
| tenants | read | tenants.read | Ler tenant |
| tenants | update | tenants.update | Atualizar tenant |
| warehouse.dashboard | read | warehouse.dashboard.read | Ler dashboard de almoxarifado |

---

## 4. Mapeamento role_permissions (ativo)

| Role | Permission | Scope |
|------|-----------|-------|
| admin_master | *(todas)* | global |
| tenant_admin | applications.reject | tenant |
| tenant_admin | applications.update | tenant |
| tenant_admin | applications.history.read | tenant |
| tenant_admin | audit.export | tenant |
| tenant_admin | audit.read | tenant |
| tenant_admin | audit_logs.read | tenant |
| tenant_admin | billing.cancel | tenant |
| tenant_admin | billing.create | tenant |
| tenant_admin | billing.export | tenant |
| tenant_admin | billing.read | tenant |
| tenant_admin | billing.update | tenant |
| tenant_admin | candidates.create | tenant |
| tenant_admin | candidates.delete | tenant |
| tenant_admin | candidates.read | tenant |
| tenant_admin | candidates.update | tenant |
| tenant_admin | candidates.documents.manage | tenant |
| tenant_admin | candidates.documents.read | tenant |
| tenant_admin | candidates.profile.read | tenant |
| tenant_admin | chat.create | tenant |
| tenant_admin | chat.handoff | tenant |
| tenant_admin | chat.read | tenant |
| tenant_admin | companies.create | tenant |
| tenant_admin | companies.delete | tenant |
| tenant_admin | companies.read | tenant |
| tenant_admin | companies.update | tenant |
| tenant_admin | contracts.create | tenant |
| tenant_admin | contracts.read | tenant |
| tenant_admin | contracts.renew | tenant |
| tenant_admin | contracts.update | tenant |
| tenant_admin | dashboard.read | tenant |
| tenant_admin | documents.create | tenant |
| tenant_admin | documents.publish | tenant |
| tenant_admin | documents.read | tenant |
| tenant_admin | documents.update | tenant |
| tenant_admin | documents.version | tenant |
| tenant_admin | employees.read | tenant |
| tenant_admin | files.create | tenant |
| tenant_admin | files.delete | tenant |
| tenant_admin | files.read | tenant |
| tenant_admin | files.update | tenant |
| tenant_admin | files.upload | tenant |
| tenant_admin | finance.approve | tenant |
| tenant_admin | finance.create | tenant |
| tenant_admin | finance.delete | tenant |
| tenant_admin | finance.export | tenant |
| tenant_admin | finance.read | tenant |
| tenant_admin | finance.reconcile | tenant |
| tenant_admin | finance.update | tenant |
| tenant_admin | finance.accounts_payable.create | tenant |
| tenant_admin | finance.accounts_payable.delete | tenant |
| tenant_admin | finance.accounts_payable.read | tenant |
| tenant_admin | finance.accounts_payable.update | tenant |
| tenant_admin | finance.accounts_receivable.create | tenant |
| tenant_admin | finance.accounts_receivable.delete | tenant |
| tenant_admin | finance.accounts_receivable.read | tenant |
| tenant_admin | finance.accounts_receivable.update | tenant |
| tenant_admin | finance.billing.cancel | tenant |
| tenant_admin | finance.billing.create | tenant |
| tenant_admin | finance.billing.read | tenant |
| tenant_admin | finance.billing.update | tenant |
| tenant_admin | finance.cashflow.read | tenant |
| tenant_admin | finance.dashboard.read | tenant |
| tenant_admin | finance.reports.export | tenant |
| tenant_admin | finance.reports.read | tenant |
| tenant_admin | finance.suppliers.read | tenant |
| tenant_admin | fiscal.dashboard.read | tenant |
| tenant_admin | fiscal.invoices.cancel | tenant |
| tenant_admin | fiscal.invoices.issue | tenant |
| tenant_admin | fiscal.invoices.read | tenant |
| tenant_admin | fiscal.invoices.void | tenant |
| tenant_admin | fiscal.reports.export | tenant |
| tenant_admin | fiscal.reports.read | tenant |
| tenant_admin | fiscal.taxes.read | tenant |
| tenant_admin | integrations.create | tenant |
| tenant_admin | integrations.delete | tenant |
| tenant_admin | integrations.manage | tenant |
| tenant_admin | integrations.test | tenant |
| tenant_admin | integrations.update | tenant |
| tenant_admin | jobs.archive | tenant |
| tenant_admin | jobs.close | tenant |
| tenant_admin | jobs.create | tenant |
| tenant_admin | jobs.delete | tenant |
| tenant_admin | jobs.publish | tenant |
| tenant_admin | jobs.read | tenant |
| tenant_admin | jobs.update | tenant |
| tenant_admin | lgpd.manage_consent | tenant |
| tenant_admin | lgpd.manage_retention | tenant |
| tenant_admin | lgpd.read | tenant |
| tenant_admin | notifications.create | tenant |
| tenant_admin | notifications.read | tenant |
| tenant_admin | people.create | tenant |
| tenant_admin | people.delete | tenant |
| tenant_admin | people.read | tenant |
| tenant_admin | people.update | tenant |
| tenant_admin | permissions.read | tenant |
| tenant_admin | products.create | tenant |
| tenant_admin | products.delete | tenant |
| tenant_admin | products.read | tenant |
| tenant_admin | products.update | tenant |
| tenant_admin | purchase_orders.confirm | tenant |
| tenant_admin | purchase_orders.create | tenant |
| tenant_admin | purchase_orders.read | tenant |
| tenant_admin | purchase_orders.update | tenant |
| tenant_admin | purchase_receipts.confirm | tenant |
| tenant_admin | purchase_receipts.create | tenant |
| tenant_admin | purchase_receipts.read | tenant |
| tenant_admin | recruitment.advance | tenant |
| tenant_admin | recruitment.create | tenant |
| tenant_admin | recruitment.delete | tenant |
| tenant_admin | recruitment.read | tenant |
| tenant_admin | recruitment.reject | tenant |
| tenant_admin | recruitment.update | tenant |
| tenant_admin | recruitment_demands.create | tenant |
| tenant_admin | recruitment_demands.delete | tenant |
| tenant_admin | recruitment_demands.read | tenant |
| tenant_admin | recruitment_demands.update | tenant |
| tenant_admin | recruitment.stage.manage | tenant |
| tenant_admin | reports.export | tenant |
| tenant_admin | reports.generate | tenant |
| tenant_admin | reports.read | tenant |
| tenant_admin | roles.create | tenant |
| tenant_admin | roles.read | tenant |
| tenant_admin | roles.update | tenant |
| tenant_admin | security_events.read | tenant |
| tenant_admin | service_orders.cancel | tenant |
| tenant_admin | service_orders.complete | tenant |
| tenant_admin | service_orders.create | tenant |
| tenant_admin | service_orders.read | tenant |
| tenant_admin | service_orders.update | tenant |
| tenant_admin | service_orders.dashboard.read | tenant |
| tenant_admin | sessions.read | tenant |
| tenant_admin | stock_movements.create | tenant |
| tenant_admin | stock_movements.export | tenant |
| tenant_admin | stock_movements.read | tenant |
| tenant_admin | stock.dashboard.read | tenant |
| tenant_admin | support_tickets.close | tenant |
| tenant_admin | support_tickets.create | tenant |
| tenant_admin | support_tickets.read | tenant |
| tenant_admin | support_tickets.resolve | tenant |
| tenant_admin | support_tickets.update | tenant |
| tenant_admin | support.dashboard.read | tenant |
| tenant_admin | talent_pool.manage | tenant |
| tenant_admin | talent_pool.match | tenant |
| tenant_admin | talent_pool.read | tenant |
| tenant_admin | tasks.assign | tenant |
| tenant_admin | tasks.create | tenant |
| tenant_admin | tasks.read | tenant |
| tenant_admin | tasks.update | tenant |
| tenant_admin | tenant.manage | tenant |
| tenant_admin | tenant.update | tenant |
| tenant_admin | warehouse.dashboard.read | tenant |
| viewer | companies.read | tenant |
| viewer | contracts.read | tenant |
| viewer | dashboard.read | tenant |
| viewer | documents.read | tenant |
| viewer | files.read | tenant |
| viewer | people.read | tenant |
| viewer | products.read | tenant |
| viewer | purchase_orders.read | tenant |
| viewer | purchase_receipts.read | tenant |
| viewer | reports.read | tenant |
| viewer | service_orders.read | tenant |
| viewer | stock_movements.read | tenant |
| viewer | support_tickets.read | tenant |
| viewer | tasks.read | tenant |

---

## 5. Permissões usadas pelo frontend

Arquivos principais: `ModuleRegistry.ts`, `App.tsx`, `ProtectedRoute.tsx`, `PermissionGuard.tsx`, `useNavigation.ts`, `filterNavigation.ts`, `rbac.ts`.

### 5.1 Permissões referenciadas no frontend

| Permission | Onde é usada |
|------------|-------------|
| domain_events.read | ModuleRegistry, App.tsx |
| tenants.read | ModuleRegistry |
| tenants.create | ModuleRegistry |
| tenants.update | ModuleRegistry |
| tenants.delete | ModuleRegistry |
| tenants.activate | ModuleRegistry |
| finance.read | ModuleRegistry |
| finance.create | ModuleRegistry |
| finance.update | ModuleRegistry |
| finance.delete | ModuleRegistry |
| finance.approve | ModuleRegistry |
| finance.reject | ModuleRegistry |
| finance.export | ModuleRegistry |
| people.read | ModuleRegistry |
| people.create | ModuleRegistry |
| people.update | ModuleRegistry |
| people.delete | ModuleRegistry |
| people.disable | ModuleRegistry |
| people.export | ModuleRegistry |
| roles.read | ModuleRegistry |
| roles.create | ModuleRegistry |
| roles.update | ModuleRegistry |
| roles.delete | ModuleRegistry |
| permissions.read | ModuleRegistry |
| permissions.create | ModuleRegistry |
| permissions.update | ModuleRegistry |
| permissions.delete | ModuleRegistry |
| audit.read | ModuleRegistry, App.tsx |
| audit.export | ModuleRegistry |
| audit.filter | ModuleRegistry |
| security_events.read | ModuleRegistry, App.tsx |
| security_events.export | ModuleRegistry |
| integrations.manage | ModuleRegistry |
| integrations.create | ModuleRegistry |
| integrations.update | ModuleRegistry |
| integrations.delete | ModuleRegistry |
| integrations.test | ModuleRegistry |
| tenant.manage | ModuleRegistry, App.tsx |
| tenant.update | ModuleRegistry |
| sessions.read | ModuleRegistry, App.tsx |
| companies.read | App.tsx |
| companies.create | ModuleRegistry |
| companies.update | ModuleRegistry |
| companies.delete | ModuleRegistry |
| companies.convert | App.tsx |
| jobs.read | App.tsx, testes |
| jobs.create | ModuleRegistry |
| jobs.update | ModuleRegistry |
| jobs.archive | ModuleRegistry |
| jobs.publish | ModuleRegistry |
| jobs.export | ModuleRegistry |
| candidates.read | App.tsx |
| candidates.create | ModuleRegistry |
| candidates.update | ModuleRegistry |
| candidates.delete | ModuleRegistry |
| candidates.export | ModuleRegistry |
| candidates.self.read | testes |
| applications.read | App.tsx |
| applications.approve | ModuleRegistry |
| applications.reject | ModuleRegistry |
| applications.interview | ModuleRegistry |
| recruitment.read | App.tsx |
| recruitment.create | ModuleRegistry |
| recruitment.update | ModuleRegistry |
| recruitment.close | ModuleRegistry |
| recruitment.stage.manage | App.tsx, ModuleRegistry |
| contracts.read | App.tsx |
| contracts.create | ModuleRegistry |
| contracts.update | ModuleRegistry |
| contracts.delete | ModuleRegistry |
| contracts.renew | ModuleRegistry |
| contracts.export | ModuleRegistry |
| reports.read | App.tsx |
| reports.export | ModuleRegistry |
| reports.generate | ModuleRegistry |
| finance.dashboard.read | App.tsx |
| finance.accounts_payable.read | App.tsx |
| finance.accounts_payable.create | ModuleRegistry |
| finance.accounts_payable.update | ModuleRegistry |
| finance.accounts_payable.delete | ModuleRegistry |
| finance.accounts_receivable.read | App.tsx |
| finance.accounts_receivable.create | ModuleRegistry |
| finance.accounts_receivable.update | ModuleRegistry |
| finance.accounts_receivable.delete | ModuleRegistry |
| finance.collections.manage | ModuleRegistry |
| finance.cashflow.read | App.tsx |
| finance.reports.export | ModuleRegistry |
| finance.billing.create | ModuleRegistry |
| finance.billing.update | ModuleRegistry |
| finance.billing.cancel | ModuleRegistry |
| fiscal.dashboard.read | App.tsx |
| fiscal.invoices.read | ModuleRegistry |
| fiscal.invoices.issue | ModuleRegistry |
| fiscal.invoices.cancel | ModuleRegistry |
| fiscal.invoices.void | ModuleRegistry |
| fiscal.taxes.read | ModuleRegistry |
| fiscal.reports.read | ModuleRegistry |
| fiscal.reports.export | ModuleRegistry |
| accounting.dashboard.read | ModuleRegistry |
| accounting.chart_of_accounts.read | ModuleRegistry |
| accounting.chart_of_accounts.create | ModuleRegistry |
| accounting.chart_of_accounts.update | ModuleRegistry |
| accounting.chart_of_accounts.delete | ModuleRegistry |
| accounting.entries.read | ModuleRegistry |
| accounting.entries.create | ModuleRegistry |
| accounting.entries.update | ModuleRegistry |
| accounting.entries.delete | ModuleRegistry |
| accounting.trial_balance.read | ModuleRegistry |
| accounting.reconciliation.read | ModuleRegistry |
| accounting.reports.read | ModuleRegistry |
| accounting.reports.export | ModuleRegistry |
| stock_movements.read | ModuleRegistry |
| products.read | ModuleRegistry |
| products.create | ModuleRegistry |
| products.update | ModuleRegistry |
| products.delete | ModuleRegistry |
| service_orders.read | App.tsx |
| service_orders.create | ModuleRegistry |
| service_orders.update | ModuleRegistry |
| service_orders.complete | ModuleRegistry |
| service_orders.cancel | ModuleRegistry |
| support_tickets.read | App.tsx |
| support_tickets.create | ModuleRegistry |
| support_tickets.update | ModuleRegistry |
| support_tickets.resolve | ModuleRegistry |
| support_tickets.close | ModuleRegistry |
| files.create | ModuleRegistry |
| files.update | ModuleRegistry |
| files.delete | ModuleRegistry |
| employees.read | App.tsx |
| ai.configure | ModuleRegistry |
| ai.test | ModuleRegistry |
| automations.create | ModuleRegistry |
| automations.update | ModuleRegistry |
| automations.toggle | ModuleRegistry |
| auth.change_password | ModuleRegistry |
| auth.revoke_session | ModuleRegistry |
| account.manage | testes, navigation |
| notifications.read | App.tsx |
| stock.dashboard.read | App.tsx |
| warehouse.dashboard.read | App.tsx |
| support.dashboard.read | App.tsx |

---

## 6. Análise de divergências

### 6.1 Permissões no banco mas não utilizadas no frontend

Lista de permissões catalogadas no banco que **não possuem referência direta** no código frontend atual:

- `finance.accounts_payable` (somente action `accounts_payable` sem `.read`/`.create` no frontend)
- `finance.accounts_receivable` (mesmo caso)
- `finance.billing` (somente `finance.billing.cancel/create/read/update` estão no frontend, mas o recurso pai `finance.billing` não)
- `finance.collections` (somente `finance.collections.manage` no frontend)
- `finance.dashboard` (somente `finance.dashboard.read` no frontend)
- `finance.forecast`
- `finance.reports` (somente `finance.reports.export/read` no frontend)
- `finance.suppliers` (somente `finance.suppliers.read` no frontend)
- `fiscal.dashboard` (somente `fiscal.dashboard.read` no frontend)
- `fiscal.invoices` (somente ações filhas no frontend)
- `fiscal.reports` (somente ações filhas)
- `fiscal.taxes` (somente `fiscal.taxes.read` no frontend)
- `stock.dashboard` (somente `stock.dashboard.read` no frontend)
- `warehouse.dashboard` (somente `warehouse.dashboard.read` no frontend)
- `support.dashboard` (somente `support.dashboard.read` no frontend)

### 6.2 Permissões referenciadas no frontend mas ausentes no catálogo

**Nenhuma divergência encontrada.** Todas as permissões usadas no frontend existem no catálogo do banco.

### 6.3 Permissões perigosas

| Permission | Risk Level | Motivo |
|------------|-----------|--------|
| finance.delete | HIGH | Exclusão direta de lançamento financeiro |
| accounting.entries.delete | HIGH | Exclusão direta de lançamento contábil |
| people.delete | HIGH | Exclusão de pessoa/usuário |
| people.disable | MEDIUM | Desativação de usuário |
| companies.delete | MEDIUM | Exclusão de empresa |
| contracts.delete | MEDIUM | Exclusão de contrato |
| jobs.delete | MEDIUM | Exclusão de vaga |
| candidates.delete | MEDIUM | Exclusão de candidato |
| tenants.delete | HIGH | Exclusão de tenant |
| roles.delete | MEDIUM | Exclusão de role |
| permissions.delete | MEDIUM | Exclusão de permissão do catálogo |
| integrations.delete | MEDIUM | Remoção de integração |
| products.delete | MEDIUM | Exclusão de produto |

---

## 7. Impacto sobre RLS e `user_has_permission()`

### 7.1 Função atual

```sql
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_auth_user_id uuid,
    p_resource text,
    p_action text,
    p_tenant_id uuid DEFAULT NULL
) RETURNS boolean SECURITY DEFINER
```

A função verifica:
1. Se existe `role_assignments` com role `global` + `role_permissions` + `permissions` compatíveis.
2. Se existe `role_assignments` com role `tenant` + `role_permissions` + `permissions` + `tenant_memberships` compatíveis.

### 7.2 Observações

- **admin_master** tem bypass por escopo `global` em ambas as consultas.
- Não há suporte a `role_resource_permissions` (tabela não existe).
- A função **não considera** permissões com `resource` composto como `accounting.entries` (somente compara `resource` exato). Isso significa que `user_has_permission('...', 'accounting', 'entries.delete')` não funcionará; precisa ser `user_has_permission('...', 'accounting.entries', 'delete')`.

---

## 8. Matriz de divergência — permissões perigosas

| Role | Permission | Scope | Atual | Esperado | Divergência |
|------|-----------|-------|-------|----------|-------------|
| tenant_admin | finance.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — tenant_admin não deveria ter exclusão financeira direta |
| tenant_admin | accounting.entries.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — tenant_admin não deveria ter exclusão contábil direta |
| tenant_admin | people.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de pessoas deve ser restrita |
| tenant_admin | companies.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de empresas deve ser restrita |
| tenant_admin | contracts.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de contratos deve ser restrita |
| tenant_admin | jobs.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de vagas deve ser restrita |
| tenant_admin | candidates.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de candidatos deve ser restrita |
| tenant_admin | tenants.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — tenant_admin não deve deletar tenants |
| tenant_admin | roles.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de roles deve ser restrita |
| tenant_admin | permissions.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de permissões deve ser restrita |
| tenant_admin | integrations.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de integrações deve ser restrita |
| tenant_admin | products.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de produtos deve ser restrita |
| tenant_admin | files.delete | tenant | ⚠️ ATIVA | ❌ REMOVER | Encontrada — exclusão de arquivos deve ser restrita |
| finance | finance.delete | tenant | ❌ NÃO ATIVA | ❌ REMOVER | Não encontrada — OK |
| accountant | accounting.entries.delete | tenant | ❌ NÃO ATIVA | ❌ REMOVER | Não encontrada — OK |
| viewer | *(nenhuma perigosa)* | tenant | ✅ OK | ✅ OK | Nenhuma |

---

## 9. Próximos passos (RBAC-04 Fase 2)

1. Revisar esta matriz com usuário.
2. Definir quais permissões devem ser efetivamente removidas de `tenant_admin`.
3. Planejar migration de correção (somente após aprovação).
4. Atualizar `user_has_permission()` se necessário para suportar `role_resource_permissions` ou recursos compostos.

---

**Fim do documento — RBAC-04 Fase 1 concluída.**
