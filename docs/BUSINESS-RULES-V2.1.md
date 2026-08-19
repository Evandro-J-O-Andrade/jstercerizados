# BUSINESS-RULES-V2.1.md

**Data:** 2026-08-18  
**Escopo:** Regras de negócio canônicas do J&S Empregos LTDA  
**Objetivo:** Documentar regras antes de implementar/migrar

---

## 1. Identidade e Acesso

### 1.1 People-First

- `people` é a entidade de identidade central.
- `auth.users` é apenas autenticação (Supabase Auth).
- `people.auth_user_id` é opcional e único.
- Uma pessoa pode existir sem `auth_user_id` (convidados, leads).
- `tenant_memberships` relaciona `people` a `tenants`.
- `role_assignments` atribui roles a `people` dentro de um `tenant` ou globalmente.
- `profiles.role` não é fonte de autorização.

### 1.2 Tipos de Usuário

**Público (não autenticado)**
- Visitante: acesso a site público, vagas, cadastro de currículo.

**Autenticado — Domínio**
- Candidato: pessoa física buscando emprego.
- Empresa: pessoa jurídica solicitando profissionais.
- Parceiro: pessoa jurídica com relacionamento comercial.
- Fornecedor: pessoa jurídica fornecendo serviços/produtos.

**Autenticado — Operacional**
- Recrutador/RH: gerencia vagas, candidatos, processos.
- Atendimento: responde chamados e chat.
- Financeiro: gerencia contas a receber/pagar, documentos fiscais.
- Supervisor/Gestor: acompanha operação, ordens de serviço, estoque.

**Autenticado — Administrativo**
- Admin Master (`admin_master`): acesso global, auditoria, gestão de tenants.
- Tenant Admin (`tenant_admin`): administração do tenant J&S.

### 1.3 Regras de Acesso

- Nenhuma role hardcoded no frontend (`admin`, `empresa`, `candidato`).
- Roles são consultadas via `role_assignments` + `roles`.
- `admin_master` é global (`tenant_id IS NULL`).
- Tenant roles são scoped por `tenant_id`.
- Service Role Key jamais no frontend.

---

## 2. Candidatos

### 2.1 Cadastro

- Candidato pode cadastrar currículo sem login.
- Currículo PDF fica em Storage privado.
- Dados pessoais respeitam LGPD.

### 2.2 Processo Seletivo

```
Pessoa
 → Cadastro
 → Consentimento LGPD
 → Currículo/dados profissionais
 → Perfil de candidato
 → Banco de candidatos
 → Candidatura
 → Processo seletivo
 → Entrevista
 → Aprovação/Reprovação
 → Contratação
```

### 2.3 Regras

- Candidatura pertence a `candidate` + `job`.
- Histórico de processo seletivo é imutável.
- Exclusão de candidato não destrói registros de auditoria.
- Candidato pode atualizar seus próprios dados.
- RH visualiza candidatos conforme permissão.
- Vaga com descrição completa → aparece em `/vagas`.
- Cargo sem descrição de vaga → entra no Banco de Talentos.

### 2.4 Banco de Talentos

- Candidato pode ser adicionado ao banco de talentos.
- Entrada requer consentimento explícito.
- Candidato pode sair do banco de talentos.
- Matching de vagas é automático.

---

## 3. Vagas

### 3.1 Estados

```
Rascunho
 → Publicada
 → Recebendo candidaturas
 → Encerrada
 → Arquivada
```

### 3.2 Regras

- Quem pode publicar: RH/Recrutador/Admin.
- Quem pode editar: RH/Recrutador/Admin.
- Quem pode encerrar: RH/Recrutador/Admin.
- Vaga pode ser reaberta.
- Empresa não vê candidatos diretamente (J&S faz a triagem).
- J&S aprova vaga antes da publicação (opcional).

---

## 4. Empresas

### 4.1 Entidades

- `companies`: entidade jurídica/comercial.
- `company_relationships`: relacionamento comercial (client, partner, supplier).
- `company_contacts`: contatos da empresa via `people`.

### 4.2 Regras

- Uma empresa pode ter múltiplos papéis (cliente + parceiro).
- Company é tenant-scoped (`companies.tenant_id`).
- Empresa pode ter:
  - administrador;
  - RH;
  - gestor;
  - usuários convidados.

---

## 5. Serviços

### 5.1 Hierarquia

**Principal**
- Recrutamento e Seleção
- Mão de Obra Temporária
- Mão de Obra Efetiva
- Processos de RH
- Avaliação de Perfil

**Secundário**
- Facilities
- Limpeza
- Portaria
- Zeladoria
- Serviços terceirizados

---

## 6. Ordem de Serviço

### 6.1 Fluxo

```
Solicitação
 → Aprovação
 → Separação
 → Entrega
 → Baixa
```

### 6.2 Regras

- Ordem de Serviço é documento operacional (não fiscal).
- Gera 2 cópias: cliente + J&S interna.
- QR Code para validação online.
- Aceite obrigatório do cliente.
- Status: open, waiting, assigned, resolved, closed.

### 6.3 Campos

- número único;
- data;
- cliente;
- CNPJ;
- serviço;
- período;
- quantidade;
- valor;
- responsável;
- assinaturas;
- aceite.

---

## 7. Estoque / Almoxarifado

### 7.1 Entidades

- `products`: produto cadastrado.
- `warehouses`: armazéns/locais.
- `stock_balances`: saldo por produto/local.
- `stock_movements`: movimentações (ledger).
- `stock_entries`: entradas.
- `stock_exits`: saídas.
- `stock_inventory`: inventário.
- `stock_adjustments`: ajustes.

### 7.2 Regras

- `stock_movements` é ledger (imutável).
- `stock_balances` é estado derivado.
- Requisição de almoxarifado requer aprovação.
- Transferência entre locais registra movimentação.

---

## 8. Atendimento / Suporte

### 8.1 Entidades

- `support_tickets`: chamados.
- `support_ticket_categories`: categorias.
- `support_ticket_messages`: mensagens.
- `support_ticket_assignments`: atribuições.
- `support_ticket_status_history`: histórico.

### 8.2 Regras

- SLA por categoria.
- Atribuição automática ou manual.
- Histórico imutável.
- Chamado pode ser reaberto.

---

## 9. Chat

### 9.1 Fluxo

```
Visitante
 → Chat IA
 → IA resolve?
   ├── SIM → encerra
   └── NÃO → Handoff
              → Chat Humano
                 → Atendente
```

### 9.2 Regras

- IA não inventa informações.
- IA usa base de conhecimento oficial.
- IA pode coletar lead.
- IA pode encaminhar para humano.
- Conversa possui sessão.
- Mensagens possuem autor/origem.
- Atendimento humano registra quem assumiu.
- Status: open, waiting, assigned, resolved, closed.

---

## 10. Financeiro

### 10.1 Entidades

- `financial_accounts`: contas.
- `financial_categories`: categorias.
- `cost_centers`: centros de custo.
- `accounts_receivable`: contas a receber.
- `accounts_payable`: contas a pagar.
- `financial_transactions`: lançamentos.
- `invoices`: notas fiscais/comprovantes.
- `payments`: pagamentos.
- `expenses`: despesas.
- `revenues`: receitas.

### 10.2 Regras

- Contas a receber vinculadas a `companies` (clientes).
- Contas a pagar vinculadas a `suppliers` (fornecedores).
- Lançamentos imutáveis após conciliação.
- Relatórios para contabilidade.

---

## 11. Fiscal

### 11.1 Entidades

- `fiscal_documents`: documentos fiscais.
- `fiscal_document_items`: itens.
- `fiscal_document_events`: eventos.
- `fiscal_document_status_history`: histórico.
- `fiscal_configurations`: configurações.
- `fiscal_integrations`: integrações.

### 11.2 Regras

- NFS-e é emitida por integração fiscal externa.
- Sistema gera documentos operacionais (OS, comprovante).
- Eventos fiscais são imutáveis.
- XML/DANFE armazenados no Storage.

---

## 12. LGPD

### 12.1 Entidades

- `consents`: consentimentos.
- `legal_acceptances`: aceites legais.
- `privacy_requests`: solicitações de privacidade.
- `data_export_requests`: exportação de dados.
- `data_deletion_requests`: exclusão/anonymização.
- `data_retention_policies`: políticas de retenção.

### 12.2 Regras

- Consentimento é obrigatório antes de coletar dados sensíveis.
- Versão do documento aceito é registrada.
- IP e user_agent registrados no aceite.
- Candidato pode revogar consentimento.
- Exclusão/anonymização deve preservar auditoria.
- Dados de currículo são sensíveis (Storage privado).

---

## 13. Notificações

### 13.1 Entidades

- `notifications`: notificações.
- `notification_deliveries`: entregas por canal.
- `notification_preferences`: preferências.

### 13.2 Regras

- Notificação é criada por evento de domínio.
- Entregas são idempotentes (`notification_id + channel`).
- Canais: email, whatsapp, in_app, push.
- Categorias: transactional, matching, marketing, system.
- Preferências respeitam LGPD.

---

## 14. Automações / Eventos

### 14.1 Entidades

- `domain_events`: eventos de domínio.
- `webhooks`: webhooks.
- `automation_queue`: fila de automação.

### 14.2 Regras

- Eventos são imutáveis.
- Eventos são entregues a n8n para processamento.
- n8n marca `published_at` após sucesso.
- Retry automático com `delivery_attempts`.
- Idempotência por `idempotency_key`.

---

## 15. Storage

### 15.1 Entidades

- `files`: arquivos.
- `file_access_logs`: logs de acesso.

### 15.2 Regras

- Arquivos são privados por padrão.
- `object_key` é gerado pelo sistema (não usar nome original).
- Acesso via signed URL.
- Logs de acesso são append-only.

---

## 16. Segurança

### 16.1 First Login

```
Cadastro
 → Confirmação
 → Primeiro login
 → Termos de Uso
 → Política de Privacidade
 → Consentimentos
 → Alteração obrigatória de senha
 → Sistema
```

### 16.2 Regras

- Senha temporária obrigatória para contas criadas por admin.
- Troca de senha obrigatória no primeiro acesso.
- Termos, Privacidade e Consentimentos são separados.
- Versão aceita é registrada.
- IP e user_agent registrados.

### 16.3 Security Center

- Sessões ativas.
- Últimos logins.
- Tentativas de login.
- Alterações de senha.
- Alterações de permissões.
- Aceites legais.
- Eventos de segurança.

---

## 17. Relatórios

### 17.1 Tipos

- RH: vagas, candidatos, entrevistas, contratações.
- Empresas: clientes, demandas, vagas por empresa.
- Operacional: ordens de serviço, chamados, SLA, estoque.
- Financeiro: faturamento, contas a receber/pagar, notas fiscais.
- Exportação: PDF, CSV, Excel.

---

## 18. Multi-tenant

### 18.1 Regras

- Todos os dados operacionais são tenant-scoped.
- RLS garante isolamento.
- `admin_master` é global (bypass).
- Service Role Key não exposta ao frontend.
- Nenhuma cross-tenant query sem validação explícita.

---

## 19. Invariantes

| ID | Regra |
|----|-------|
| INVARIANT-001 | `COUNT(people)` preservado |
| INVARIANT-002 | `COUNT(tenant_memberships)` preservado |
| INVARIANT-003 | `admin_master` global (`tenant_id IS NULL`) |
| INVARIANT-004 | Sem FKs órfãs |
| INVARIANT-005 | Isolamento tenant |
| INVARIANT-006 | `notifications` sem dependência direta de `auth.users` |
| INVARIANT-007 | `jobs.company_id` válido |
| INVARIANT-008 | Sem roles legacy (`admin`, `empresa`, `candidato`) |
| INVARIANT-009 | `auth_user_id` único |
| INVARIANT-010 | `tenant_id` válido em todas as tabelas tenant-scoped |

---

## 20. Próximos Passos

1. Validar regras contra frontend/backend.
2. Escrever migrador baseado nas regras.
3. Executar `--mode=analyze`.
4. Preparar ambiente descartável.
5. Executar `--mode=dry-run`.
6. Produzir evidências.
7. Autorizar `--mode=apply`.
