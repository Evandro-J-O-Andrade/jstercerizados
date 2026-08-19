# V21 — Database Final Matrix

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Método:** cruzamento entre `DATABASE-ASIS-TO-V21-MAPPING.md`, `BUSINESS-RULES-V2.1.md`, `docs/sql/*.sql` e `V2.1-GAP-ANALYSIS.md`.

## Objetivo

Registrar, para cada domínio V2.1, se a regra de negócio possui suporte concreto no banco canônico e em quais camadas: tabela, constraint, RLS, function/RPC, trigger, audit, event, outbox, storage.

## Legenda

- 🟢 EXISTS / PRESERVE
- 🟡 EXISTS / REWRITE OU TRANSFORM
- 🔵 NEW
- 🟠 LEGACY
- 🔴 GAP / MISSING
- 🟣 CONFLICT / DECISÃO NECESSÁRIA

## Matriz

| Domínio      | Regra                      | Tabela                                                                       | Constraint | RLS | Function/RPC                       | Trigger            | Audit | Event | Outbox | Storage | Status |
| ------------ | -------------------------- | ---------------------------------------------------------------------------- | ---------- | --- | ---------------------------------- | ------------------ | ----- | ----- | ------ | ------- | ------ |
| Core         | People-First identity      | `people`                                                                     | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| Core         | Tenant membership          | `tenant_memberships`                                                         | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| Core         | RBAC                       | `roles`, `permissions`, `role_assignments`                                   | ✅         | ✅  | `user_has_permission()`            | —                  | ✅    | —     | —      | —       | 🟢     |
| CRM          | Empresas                   | `companies`                                                                  | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| CRM          | Relacionamentos            | `company_relationships`                                                      | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| RH           | Candidatos                 | `candidates`                                                                 | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | ✅      | 🟢     |
| RH           | Candidaturas               | `applications`                                                               | ✅         | ✅  | —                                  | —                  | ✅    | ✅    | —      | —       | 🟢     |
| RH           | Entrevistas                | `interviews`                                                                 | ✅         | ✅  | —                                  | —                  | ✅    | ✅    | —      | —       | 🟢     |
| RH           | Publicar vaga              | `jobs`                                                                       | ✅         | ✅  | `publish_job()`                    | —                  | ✅    | ✅    | —      | —       | 🟡     |
| RH           | Aprovar candidato          | `applications`                                                               | ✅         | ✅  | `approve_candidate()`              | —                  | ✅    | ✅    | —      | —       | 🟡     |
| RH           | Skills/idiomas/experiência | `skills`, `candidate_skills`, `candidate_experiences`, `candidate_languages` | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| Serviços     | Ordem de serviço           | `service_orders`                                                             | ✅         | ✅  | `complete_service_order()`         | —                  | ✅    | ✅    | —      | ✅      | 🟡     |
| Contratos    | Vencimento/renovação       | `contracts`                                                                  | ✅         | ✅  | `renew_contract()`                 | `contract_history` | ✅    | ✅    | —      | ✅      | 🟡     |
| Estoque      | Entrada/saída/ajuste       | `stock_movements`, `stock_balances`                                          | ✅         | ✅  | `receive_stock()`, `issue_stock()` | —                  | ✅    | ✅    | —      | —       | 🟡     |
| Almoxarifado | Custódia de terceiros      | `third_party_custody`, `third_party_custody_items`                           | ✅         | ✅  | `register_custody_return()`        | —                  | ✅    | ✅    | —      | —       | 🔵     |
| Financeiro   | Contas a receber/pagar     | `accounts_receivable`, `accounts_payable`                                    | ✅         | ✅  | `register_payment()`               | —                  | ✅    | ✅    | —      | —       | 🟡     |
| Fiscal       | Documento fiscal           | `fiscal_documents`                                                           | ✅         | ✅  | —                                  | —                  | ✅    | ✅    | —      | ✅      | 🟡     |
| Atendimento  | SLA/ticket                 | `support_tickets`                                                            | ✅         | ✅  | `resolve_ticket()`                 | —                  | ✅    | ✅    | —      | ✅      | 🟡     |
| Chat         | IA/humano/handoff          | `chat_rooms`, `chat_messages`, `ai_conversations`, `chat_handoffs`           | ✅         | ✅  | `create_handoff()`                 | —                  | ✅    | ✅    | —      | —       | 🟢     |
| Notificações | E-mail/WhatsApp            | `notifications`, `notification_deliveries`                                   | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟢     |
| Automação    | Eventos/outbox             | `domain_events`, `event_outbox`, `event_deliveries`                          | ✅         | ✅  | —                                  | —                  | ✅    | ✅    | ✅     | —       | 🟡     |
| LGPD         | Consentimento/aceite       | `consents`, `legal_acceptances`                                              | ✅         | ✅  | `register_consent()`               | —                  | ✅    | —     | —      | —       | 🟡     |
| Segurança    | First login                | `first_login_state`                                                          | ✅         | ✅  | —                                  | —                  | ✅    | —     | —      | —       | 🟡     |
| Relatórios   | Dashboard/executivo        | Views/materialized views                                                     | —          | —   | —                                  | —                  | —     | —     | —      | —       | 🔴     |

## Observações

- 🟡 = já existe no AS-IS ou no DDL, mas precisa ajuste/implementação de comportamento.
- 🔵 = nova entidade necessária para fechar regra já definida.
- 🔴 = ainda sem estrutura no DDL atual.

## Próximo passo

1. Transformar todos os 🟡 em 🟢 via RPCs, triggers, views e outbox.
2. Implementar os 🔵 como migrations separadas.
3. Fechar os 🔴 com decisão explícita antes do dry-run.
