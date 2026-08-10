# Automações — JSEmpregos

## Arquitetura de Automação

```
Usuário
  ↓
Site (React)
  ↓
Formulário
  ↓
Supabase (Banco de Dados)
  ↓
n8n (Automação)
  ↓
─────────────────
│                 │
│                 │
E-mail       WhatsApp
│                 │
│                 │
Equipe      Cliente
│
Dashboard
```

## Princípio Fundamental

**O formulário NUNCA envia diretamente para o WhatsApp.** Todos os dados são persistidos no Supabase primeiro, garantindo que nenhuma solicitação seja perdida.

## Fluxos de Automação

### Fluxo 1 — Orçamento

1. Usuário preenche formulário de orçamento.
2. Dados são gravados na tabela `orcamentos` com status `Novo`.
3. n8n é acionado via webhook.
4. n8n envia e-mail para a equipe comercial.
5. n8n monta mensagem com os dados do formulário.
6. Usuário é redirecionado para WhatsApp com mensagem pré-preenchida.

### Fluxo 2 — Trabalhe Conosco

1. Candidato preenche formulário e envia currículo.
2. Dados gravados em `curriculos` com status `Recebido`.
3. Currículo é salvo em storage.
4. n8n envia notificação para RH.
5. WhatsApp envia mensagem de confirmação ao candidato.

### Fluxo 3 — Parceiros

1. Empresa se cadastra como parceira.
2. Dados gravados em `parceiros` com status `Pending`.
3. n8n notifica equipe de Comercial B2B.
4. E-mail de boas-vindas enviado.

### Fluxo 4 — Fornecedores

1. Fornecedor se cadastra.
2. Dados gravados em `fornecedores`.
3. n8n notifica equipe de Compras.

## Equipe por Formulário

| Formulário       | Equipe          |
| ---------------- | --------------- |
| Orçamento        | Comercial       |
| Trabalhe Conosco | RH              |
| Parceiros        | Comercial B2B   |
| Fornecedores     | Compras         |
| Contato          | Atendimento     |
| Suporte          | Suporte Técnico |

## Futuro: IA no WhatsApp

Agentes especializados no n8n:

- **Agente Comercial**: qualifica leads e agenda visitas.
- **Agente RH**: tria currículos e agenda entrevistas.
- **Agente Parcerias**: atende empresas interessadas em parceria.
- **Agente Compras**: organiza propostas de fornecedores.
- **Agente Suporte**: atende clientes ativos.
