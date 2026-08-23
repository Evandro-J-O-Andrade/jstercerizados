# RBAC → Módulos → Rotas

**Data:** 2026-08-23

## Roles

| Role               | Scope  | Descrição                       | Módulos | Permissions |
| ------------------ | ------ | ------------------------------- | ------- | ----------- |
| admin_master       | global | Administrador global do sistema | 21      | 63          |
| commercial         | tenant | Comercial                       | 11      | 19          |
| facilities_manager | tenant | Gerente de Facilities           | 4       | 11          |
| finance            | tenant | Analista Financeiro             | 12      | 19          |
| finance_manager    | tenant | Gerente Financeiro              | 0       | 0           |
| it_admin           | tenant | Administrador de TI             | 4       | 10          |
| lawyer             | tenant | Jurídico                        | 4       | 8           |
| operations_manager | tenant | Gerente de Operações            | 14      | 33          |
| operator           | tenant | Operador                        | 11      | 21          |
| recruiter          | tenant | Recrutador                      | 0       | 0           |
| rh_manager         | tenant | Gerente de Recursos Humanos     | 0       | 0           |
| security_manager   | tenant | Gerente de Segurança            | 3       | 5           |
| stock_manager      | tenant | Gerente de Estoque              | 5       | 9           |
| support            | tenant | Suporte                         | 2       | 5           |
| tenant_admin       | tenant | Administrador do tenant         | 17      | 53          |
| viewer             | tenant | Visualizador                    | 14      | 14          |

## Módulos por Role

### admin_master

**Scope:** global

**Descrição:** Administrador global do sistema

**Módulos disponíveis:**

- 📋 Auditoria → `/dashboard/auditoria`
- 💬 Chat → `/dashboard/chat`
- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📊 Dashboard → `/dashboard/visao-geral`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 🔒 LGPD → `/dashboard/lgpd`
- 🔔 Notificações → `/dashboard/notificacoes`
- 👥 Usuários → `/dashboard/usuarios`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 📈 Relatórios → `/dashboard/relatorios`
- ⚙️ Administração → `/dashboard/admin`
- 🛡️ Segurança → `/dashboard/seguranca`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`
- 🏢 Tenants → `/dashboard/tenants`

### commercial

**Scope:** tenant

**Descrição:** Comercial

**Módulos disponíveis:**

- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📊 Dashboard → `/dashboard/visao-geral`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 🔧 Serviços → `/dashboard/servicos`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

### facilities_manager

**Scope:** tenant

**Descrição:** Gerente de Facilities

**Módulos disponíveis:**

- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 🔧 Serviços → `/dashboard/servicos`
- ✅ Tarefas → `/dashboard/tarefas`

### finance

**Scope:** tenant

**Descrição:** Analista Financeiro

**Módulos disponíveis:**

- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

### finance_manager

**Scope:** tenant

**Descrição:** Gerente Financeiro

**Módulos disponíveis:**

### it_admin

**Scope:** tenant

**Descrição:** Administrador de TI

**Módulos disponíveis:**

- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`
- ⚙️ Administração → `/dashboard/admin`

### lawyer

**Scope:** tenant

**Descrição:** Jurídico

**Módulos disponíveis:**

- 📝 Comercial → `/dashboard/contratos`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`

### operations_manager

**Scope:** tenant

**Descrição:** Gerente de Operações

**Módulos disponíveis:**

- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📊 Dashboard → `/dashboard/visao-geral`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 📈 Relatórios → `/dashboard/relatorios`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

### operator

**Scope:** tenant

**Descrição:** Operador

**Módulos disponíveis:**

- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

### recruiter

**Scope:** tenant

**Descrição:** Recrutador

**Módulos disponíveis:**

### rh_manager

**Scope:** tenant

**Descrição:** Gerente de Recursos Humanos

**Módulos disponíveis:**

### security_manager

**Scope:** tenant

**Descrição:** Gerente de Segurança

**Módulos disponíveis:**

- 📄 Documentos → `/dashboard/documentos`
- 👥 Usuários → `/dashboard/usuarios`
- 🛡️ Segurança → `/dashboard/seguranca`

### stock_manager

**Scope:** tenant

**Descrição:** Gerente de Estoque

**Módulos disponíveis:**

- 📊 Dashboard → `/dashboard/visao-geral`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 📊 Estoque → `/dashboard/estoque`

### support

**Scope:** tenant

**Descrição:** Suporte

**Módulos disponíveis:**

- 💬 Chat → `/dashboard/chat`
- 🎫 Suporte → `/dashboard/suporte`

### tenant_admin

**Scope:** tenant

**Descrição:** Administrador do tenant

**Módulos disponíveis:**

- 📋 Auditoria → `/dashboard/auditoria`
- 💬 Chat → `/dashboard/chat`
- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 🔒 LGPD → `/dashboard/lgpd`
- 🔔 Notificações → `/dashboard/notificacoes`
- 👥 Usuários → `/dashboard/usuarios`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 🛡️ Segurança → `/dashboard/seguranca`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

### viewer

**Scope:** tenant

**Descrição:** Visualizador

**Módulos disponíveis:**

- 🏢 Empresas → `/dashboard/empresas`
- 📝 Comercial → `/dashboard/contratos`
- 📊 Dashboard → `/dashboard/visao-geral`
- 📄 Documentos → `/dashboard/documentos`
- 📁 Arquivos → `/dashboard/arquivos`
- 👥 Usuários → `/dashboard/usuarios`
- 📦 Produtos → `/dashboard/produtos`
- 🛒 Compras → `/dashboard/compras`
- 📥 Recebimentos → `/dashboard/recebimentos`
- 📈 Relatórios → `/dashboard/relatorios`
- 🔧 Serviços → `/dashboard/servicos`
- 📊 Estoque → `/dashboard/estoque`
- 🎫 Suporte → `/dashboard/suporte`
- ✅ Tarefas → `/dashboard/tarefas`

## Mapa de Permissions por Resource

### audit_logs

| Action | Descrição     |
| ------ | ------------- |
| read   | Ler auditoria |

### chat

| Action  | Descrição              |
| ------- | ---------------------- |
| create  | Criar conversa         |
| handoff | Transferir atendimento |
| read    | Ler conversa           |

### companies

| Action | Descrição         |
| ------ | ----------------- |
| create | Criar empresa     |
| delete | Remover empresa   |
| read   | Ler empresa       |
| update | Atualizar empresa |

### contracts

| Action | Descrição          |
| ------ | ------------------ |
| create | Criar contrato     |
| read   | Ler contrato       |
| renew  | Renovar contrato   |
| update | Atualizar contrato |

### dashboard

| Action | Descrição     |
| ------ | ------------- |
| read   | Ler dashboard |

### documents

| Action  | Descrição                 |
| ------- | ------------------------- |
| create  | Criar documento           |
| read    | Ler documento             |
| version | Criar versão de documento |

### files

| Action | Descrição       |
| ------ | --------------- |
| delete | Remover arquivo |
| read   | Ler arquivo     |
| upload | Enviar arquivo  |

### lgpd

| Action           | Descrição               |
| ---------------- | ----------------------- |
| manage_consent   | Gerenciar consentimento |
| manage_retention | Gerenciar retenção      |
| read             | Ler dados LGPD          |

### notifications

| Action | Descrição         |
| ------ | ----------------- |
| create | Criar notificação |
| read   | Ler notificação   |

### people

| Action | Descrição        |
| ------ | ---------------- |
| create | Criar pessoa     |
| delete | Remover pessoa   |
| read   | Ler pessoa       |
| update | Atualizar pessoa |

### products

| Action | Descrição         |
| ------ | ----------------- |
| create | Criar produto     |
| delete | Remover produto   |
| read   | Ler produto       |
| update | Atualizar produto |

### purchase_orders

| Action  | Descrição                  |
| ------- | -------------------------- |
| confirm | Confirmar pedido de compra |
| create  | Criar pedido de compra     |
| read    | Ler pedido de compra       |
| update  | Atualizar pedido de compra |

### purchase_receipts

| Action  | Descrição             |
| ------- | --------------------- |
| confirm | Confirmar recebimento |
| create  | Criar recebimento     |
| read    | Ler recebimento       |

### reports

| Action | Descrição      |
| ------ | -------------- |
| read   | Ler relatórios |

### roles

| Action | Descrição      |
| ------ | -------------- |
| create | Criar role     |
| delete | Remover role   |
| read   | Ler role       |
| update | Atualizar role |

### security_events

| Action | Descrição                |
| ------ | ------------------------ |
| read   | Ler eventos de segurança |

### service_orders

| Action   | Descrição                  |
| -------- | -------------------------- |
| complete | Concluir ordem de serviço  |
| create   | Criar ordem de serviço     |
| read     | Ler ordem de serviço       |
| update   | Atualizar ordem de serviço |

### stock_movements

| Action | Descrição          |
| ------ | ------------------ |
| create | Criar movimentação |
| read   | Ler movimentação   |

### support_tickets

| Action  | Descrição        |
| ------- | ---------------- |
| create  | Criar ticket     |
| read    | Ler ticket       |
| resolve | Resolver ticket  |
| update  | Atualizar ticket |

### tasks

| Action | Descrição        |
| ------ | ---------------- |
| assign | Atribuir tarefa  |
| create | Criar tarefa     |
| read   | Ler tarefa       |
| update | Atualizar tarefa |

### tenants

| Action | Descrição        |
| ------ | ---------------- |
| create | Criar tenant     |
| delete | Remover tenant   |
| read   | Ler tenant       |
| update | Atualizar tenant |

## Rotas Protegidas Atuais

| Rota                             | Permission             | Módulo              |
| -------------------------------- | ---------------------- | ------------------- |
| `/dashboard/visao-geral`         | `dashboard.read`       | Dashboard           | ✅  |
| `/dashboard/vagas`               | `jobs.read`            | Vagas               | ❌  |
| `/dashboard/candidatos`          | `candidates.read`      | Candidatos          | ❌  |
| `/dashboard/empresas`            | `companies.read`       | Empresas            | ✅  |
| `/dashboard/clientes`            | `companies.read`       | Clientes            | ✅  |
| `/dashboard/parceiros`           | `companies.read`       | Parceiros           | ✅  |
| `/dashboard/fornecedores`        | `companies.read`       | Fornecedores        | ✅  |
| `/dashboard/usuarios`            | `people.read`          | Usuários            | ✅  |
| `/dashboard/processos-seletivos` | `recruitment.read`     | Processos Seletivos | ❌  |
| `/dashboard/servicos`            | `service_orders.read`  | Serviços            | ✅  |
| `/dashboard/financeiro`          | `purchase_orders.read` | Financeiro          | ✅  |
| `/dashboard/estoque`             | `stock_movements.read` | Estoque             | ✅  |
| `/dashboard/suporte`             | `support_tickets.read` | Suporte             | ✅  |
| `/dashboard/relatorios`          | `reports.read`         | Relatórios          | ✅  |
| `/dashboard/configuracoes`       | `tenants.read`         | Configurações       | ✅  |

## Divergências

### Permissions sem módulo mapeado

Nenhuma.

### Rotas sem permission correspondente

- `/dashboard/vagas` — `jobs.read`
- `/dashboard/candidatos` — `candidates.read`
- `/dashboard/processos-seletivos` — `recruitment.read`
