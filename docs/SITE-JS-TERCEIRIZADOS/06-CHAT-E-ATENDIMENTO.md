# 06 — Chat IA + Atendimento

## 06.1 Arquitetura

```text
Site
 ↓
Chat IA (ChatWidget)
  - responde com base em:
    - base de conhecimento J&S
    - conteúdo do site
    - serviços
    - FAQ
 ↓
resolve?
 ├── sim → encerra
 │
 └── não
       ↓
"Posio encaminhar voc para atendimento."
       ↓
Chat humano (HumanChatWidget)
       ↓
n8n orquestra
       ↓
Supabase (chat_rooms, chat_messages)
       ↓
atendente / WhatsApp / e-mail
```

## 06.2 Componentes existentes

### ChatWidget (`src/components/ui/ChatWidget.tsx`)

**Status:** ✅ Implementado (413 linhas)

- Modo IA inicial com opções de fluxo
- Opções: candidato, empresa, vaga, hire, support_human
- Transição automática para HumanChatWidget

**Pendências:**

- [ ] Conectar base de conhecimento (FAQ, serviços, vagas)
- [ ] Respostas dinâmicas baseadas em conteúdo do site
- [ ] Integração com OpenAI / LLM via n8n

### HumanChatWidget (`src/components/ui/HumanChatWidget.tsx`)

**Status:** ✅ Implementado (304 linhas)

- Cria sala no Supabase (`chat_rooms`)
- Realtime via `useRealtimeChat` hook
- visitor_id persistido no localStorage

**Pendências:**

- [ ] Conexão com n8n para roteamento de atendente
- [ ] Notificação para atendente (Webhook)
- [ ] Integração com WhatsApp Business API

## 06.3 Supabase — tabelas de chat

```sql
-- Salas de chat
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  subject text,
  status text check (status in ('waiting','active','closed')) default 'waiting',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mensagens
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id),
  sender_type text check (sender_type in ('user','assistant','agent')),
  content text,
  created_at timestamptz default now()
);
```

## 06.4 n8n Workflow (esboço)

### Trigger: Novo lead via formulário

```
Webhook (POST /lead)
  ↓
[Parse JSON]
  ↓
[Format WhatsApp message]
  → send to WhatsApp (Evolution API / Twilio)
  ↓
[Supabase Insert] → leads table
  ↓
[Email to commercial team] (SMTP)
```

### Trigger: Chat IA escala para humano

```
Webhook (POST /chat-escalate)
  ↓
[Supabase Insert] → chat_rooms + chat_messages
  ↓
[Slack/Email notification] → team
  ↓
[Update chat status] → 'active'
```

## 06.5 Base de conhecimento

O ChatWidget deve responder com base em:

1. **`/faq`** — Perguntas frequentes
2. **`/servicos`** — Lista de serviços
3. **`/servicos/:slug`** — Detalhes de cada serviço
4. **`/vagas`** — Vagas disponíveis
5. **`/empresas`** — Soluções para empresas
6. **`/candidatos`** — Soluções para candidatos
7. **Conteúdo da empresa** — missão, visão, valores, história

### Formato

```json
{
  "intent": "como_funciona_processo_seletivo",
  "confidence": 0.92,
  "response": "O processo seletivo J&S tem 4 etapas...",
  "actions": [
    { "label": "Ver vagas", "href": "/vagas" },
    { "label": "Falar com atendente", "value": "escalate" }
  ]
}
```

## 06.6 Posicionamento na página

```text
BottomNavigation
ChatWidget (fixo canto inferior direito)
HumanChatWidget (modal dentro do ChatWidget)
```

- ChatWidget: sempre visível (não aparece durante CinematicShowcase)
- AccessibilityWidget: sempre visível (layer separado)
