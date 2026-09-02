# GAP Matrix — Platform Consolidation V1

**Data:** 2026-09-02
**Status:** FASE 0 (auditoria) — antes de qualquer nova migration

---

## Metodologia

Para cada domínio, 11 critérios são checados:

```
T  = Tabela existe?
C  = Colunas canônicas presentes?
PK = Primary Key?
FK = Foreign Keys para domínios pai?
CO = Constraints (CHECK, UNIQUE)?
I  = Índices de performance?
R  = RLS habilitada?
P  = Policies de leitura/escrita?
S  = Storage (mídia) associado?
E  = Evento de domínio emitido?
O  = Outbox/delivery garantido?
```

🟢 = OK 🟡 = parcial 🔴 = falta ⚪ = N/A para este domínio

---

## 32 Domínios × 11 Critérios

| #   | Domínio                                             | T   | C   | PK  | FK  | CO  | I   | R   | P   | S   | E   | O   | Notas                          |
| --- | --------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ------------------------------ |
| 01  | **Identity** (auth.users, people)                   | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | ⚪  | 🟢  | 🟢  | cadeia completa                |
| 02  | **Tenancy** (tenants, tenant_memberships)           | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | ⚪  | 🟢  | 🟢  | `tenants` sem policy (Advisor) |
| 03  | **RBAC** (roles, permissions, role_assignments)     | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | ⚪  | 🟢  | 🟢  | role `candidate` (5 perms)     |
| 04  | **Candidatos** (candidates, currículo, docs)        | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | docs sem bucket definido       |
| 05  | **Empresas** (companies, customers, partners)       | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | logo via media_assets          |
| 06  | **RH** (employees, contracts, departments)          | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | docs do funcionário sem bucket |
| 07  | **Recrutamento** (jobs, applications, stages)       | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | falta event application.*      |
| 08  | **Entrevistas** (interviews, feedback)              | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟡  | 🔴  | falta integração Meet/Zoom     |
| 09  | **Banco de Talentos** (talent_pool)                 | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟡  | 🔴  |                                |
| 10  | **Contratos** (contracts, parties, terms)           | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | docs em private-documents      |
| 11  | **Serviços** (services CMS)                         | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | sem emit event                 |
| 12  | **Media** (media_assets)                            | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | 🟢  | 🟢  | 🟢  | 🟢  | 🟡  | 🔴  | CHECK entity_type pendente     |
| 13  | **Blog/CMS** (blog_posts, pages)                    | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  | SEO opcional                   |
| 14  | **Estoque** (products, warehouses, stock_movements) | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 15  | **Almoxarifado** (requisitions, EPI, custody)       | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 16  | **Compras** (purchases, suppliers)                  | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 17  | **Ordem de Serviço** (work_orders, checklists)      | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 18  | **Financeiro** (accounts, transactions, payables)   | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 19  | **Fiscal/Contábil** (invoices, taxes)               | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 20  | **PDV** (sales, items, payments)                    | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 21  | **CRM** (leads, contacts, interactions, proposals)  | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 22  | **Chat Humano** (chat_rooms, messages)              | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟡  | 🔴  |                                |
| 23  | **Chatbot IA** (ai_conversations, ai_messages)      | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟡  | 🔴  |                                |
| 24  | **Suporte** (tickets, sla, attachments)             | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | 🟡  | 🟡  | 🔴  |                                |
| 25  | **Notificações** (notifications)                    | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | ⚪  | 🟢  | 🟢  |                                |
| 26  | **E-mail** (email_templates, email_messages)        | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟡  | 🔴  | template vars                  |
| 27  | **Automação** (automation_jobs, executions)         | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟢  | 🟡  |                                |
| 28  | **Domain Events** (domain_events, event_outbox)     | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | 🟢  | ⚪  | 🟢  | 🟢  | canônico                       |
| 29  | **Integrações** (connections, webhooks, sync)       | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | ⚪  | 🟡  | 🔴  | **não existe**                 |
| 30  | **Providers** (whatsapp, sms, google, teams, zoom)  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | 🔴  | ⚪  | 🟡  | 🔴  | **não existe**                 |
| 31  | **Auditoria** (audit_logs)                          | 🟢  | 🟡  | 🟢  | 🟡  | 🟡  | 🟡  | 🟢  | 🟢  | ⚪  | 🟢  | 🟢  |                                |
| 32  | **LGPD** (consents, terms, privacy)                 | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🟡  | 🔴  | parcial                        |

---

## Padrões transversais

| Camada                 | Onde mora                                                        | Status         |
| ---------------------- | ---------------------------------------------------------------- | -------------- |
| Segredos de integração | **Vault / Edge Functions env** (NUNCA em tabela pública)         | 🟢 regra clara |
| Credenciais OAuth      | Tabela `integration_credentials` (apenas referência, ciphertext) | 🔴 a criar     |
| Tokens de API          | Idem                                                             | 🔴 a criar     |
| Webhook inbound        | `webhook_deliveries` (já existe)                                 | 🟢             |
| Webhook outbound       | `event_outbox` + consumer (n8n)                                  | 🟢             |
| Idempotência           | `domain_events.idempotency_key` UNIQUE (já existe)               | 🟢             |
| Retry policy           | Função `get_pending_domain_events` (já existe)                   | 🟢             |
| Audit log              | `audit_logs` (existe)                                            | 🟢             |

---

## Resumo executivo do GAP

**Domínios 100% prontos:** 01, 03, 25, 28, 31
**Domínios com gaps pontuais:** 02 (RLS), 04–22 (eventos/outbox), 26 (template vars), 32 (LGPD)
**Domínios a criar:** **29 (Integrações) e 30 (Providers)** — zero infraestrutura hoje

---

## Decisão arquitetural congelada

```
PostgreSQL  ──grava──►  domain_events
                              │
                              ▼
                          event_outbox
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
            Webhook (n8n)          Consumer (n8n)
                  │                       │
        ┌─────────┼─────────┐    ┌───────┼───────┐
        ▼         ▼         ▼    ▼       ▼       ▼
     WhatsApp   SMS      Email  Google  Microsoft Zoom
```

**Nada de chamadas HTTP externas dentro do banco.**
**Segredos fora do banco.**
**Idempotência por `idempotency_key`.**
**Retry por `event_outbox.processed_at`.**
