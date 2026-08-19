# V21 — Database Architecture Decisions

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA

## Decisões arquiteturais congeladas para o V2.1

### 1. Arquitetura padrão

Application
→ Function/RPC
→ Transaction
→ Tables + Constraints + RLS
→ History / Audit
→ Domain Event
→ Outbox
→ n8n
→ Integrações externas

### 2. Quando usar Function/RPC

- Operação de negócio que altera mais de uma entidade.
- Transação que precisa ser atômica.
- Comandos: `create_contract()`, `publish_job()`, `approve_candidate()`, `complete_service_order()`, `register_stock_entry()`, `resolve_ticket()`.

### 3. Quando usar Trigger

- `updated_at`
- histórico automático
- garantias internas
- auditoria transversal simples

**Não usar trigger para:**

- WhatsApp
- e-mail
- HTTP
- n8n
- APIs externas

### 4. Quando usar Constraint

- Integridade que o PostgreSQL pode impedir sozinho.
- Exemplos: `quantity >= 0`, `end_date >= start_date`, `UNIQUE`, `NOT NULL`, `CHECK`.

### 5. Quando usar RLS

- Toda tabela tenant-scoped.
- Isolamento derivado de `auth.uid() → people → tenant_memberships → roles → permissions`.
- Nunca confiar em `profile.role`, `user.role`, `empresa`, `candidato`, `admin`.

### 6. Quando usar View

- Leitura agregada.
- Dashboards.
- Relatórios.
- Evita duplicar lógica no frontend.

### 7. Quando usar Domain Event

- Avisar que algo aconteceu.
- Exemplos: `contract.expiring`, `candidate.hired`, `stock.minimum_reached`, `ticket.sla_breached`.
- Evento não executa integração externa.

### 8. Quando usar n8n

- Integrações externas.
- WhatsApp, e-mail, notificações, automações.
- Consome `domain_events` via outbox.

### 9. Quando usar Outbox

- Garantir entrega confiável de eventos.
- Controle de status, attempts, retry, idempotency.
- Evita perder eventos se o n8n cair.

### 10. Auditoria

- Registra quem fez o quê, quando, em qual tenant, sobre qual registro, estado anterior e novo estado.
- Campos obrigatórios: `actor_person_id`, `tenant_id`, `action`, `entity_type`, `entity_id`, `before_data`, `after_data`, `created_at`, `correlation_id`.
- Append-only.

### 11. Idempotência

- Operações externas devem suportar idempotência via `idempotency_key`.
- Aplicável a: domain events, outbox, n8n, webhooks, fiscal, payments, notifications.

### 12. Correlation ID

- Operações importantes devem possuir `correlation_id`.
- Permite rastrear uma operação completa: function → audit → event → outbox → n8n → WhatsApp.

### 13. LGPD

- Termos versionados.
- Consentimentos separados.
- Suporte a aceite, revogação, exportação, correção, anonimização, retenção.
- Registro de versão aceita por pessoa.

### 14. First Login

- Fluxo: conta criada → primeiro login → termos → privacidade → consentimentos → troca obrigatória de senha → acesso normal.
- Backend deve bloquear acesso a áreas protegidas antes do fluxo completo.

### 15. Fiscal

- Documento fiscal separado de documento comercial.
- Não armazenar secrets em texto puro.
- Usar secret manager / referências seguras.
- Registrar requests/responses sem expor credenciais.

### 16. Estoque e custódia

- `stock_movements` é ledger append-only.
- `stock_balances` é estado derivado, não histórico.
- Produtos em posse de terceiros não são baixados automaticamente do estoque.

### 17. Empresas, parceiros, fornecedores

- `companies` é entidade central.
- `company_relationships` representa `CUSTOMER`, `PARTNER`, `SUPPLIER`.
- Uma empresa pode ter múltiplos relacionamentos.

### 18. Relatórios

- Não criar tabelas específicas para relatórios.
- Usar Views e Report Functions.
- KPIs via agregações, não tabelas duplicadas.

## Matriz de decisão

| Necessidade                | Tecnologia                   |
| -------------------------- | ---------------------------- |
| Dado                       | Table                        |
| Integridade                | Constraint                   |
| Segurança/tenant           | RLS                          |
| Operação de negócio        | Function/RPC                 |
| Histórico automático       | Trigger                      |
| Auditoria                  | Audit Log + Function/Trigger |
| Consulta/dashboard         | View / Report Function       |
| Comunicação entre domínios | Domain Event                 |
| WhatsApp/e-mail/API        | n8n                          |
| Arquivos                   | Storage                      |
