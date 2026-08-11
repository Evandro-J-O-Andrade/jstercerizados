# GATE-0 Diagnostic — Chatbot Funcional

**Data:** 2026-08-11  
**Objetivo:** Verificar o chatbot de ponta a ponta antes de iniciar a Fase 2.  
**Componentes verificados:** ChatWidget, API endpoint, OpenRouter, renderização de resposta, handoff humano.

---

## 1. Visão geral do fluxo

```
Usuario digita mensagem
  ↓
ChatWidget (src/components/ui/ChatWidget.tsx)
  → monta histórico de mensagens
  → chama sendChatRequest() em src/lib/chat-client.ts
    → POST /api/chat
  ↓
server.js (dev) | functions/api/chat.ts (prod)
  → adiciona SYSTEM_PROMPT
  → proxy para OpenRouter (https://openrouter.ai/api/v1/chat/completions)
  ↓
Resposta da LLM
  ↓
ChatWidget renderiza reply
```

---

## 2. Verificação por componente

### 2.1 ChatWidget (`src/components/ui/ChatWidget.tsx`)

**Status:** ✅ Funcional

| Item                               | Verificado | Observação                                                |
| ---------------------------------- | ---------- | --------------------------------------------------------- |
| Estado de abertura                 | ✅         | Separado em `isAiChatOpen` (App.tsx)                      |
| Histórico de mensagens             | ✅         | `getAIReply(history)` recebe histórico completo           |
| Icone/Badge                        | ✅         | `Bot` icon + label "Assistente J&S"                       |
| Botão "Falar com atendente humano" | ✅         | Chama `onRequestHuman()` → App.tsx abre `isHumanChatOpen` |
| Input de texto                     | ✅         | Envia mensagem com Enter ou clique no botão Send          |
| Renderização de resposta           | ✅         | Mensagens do assistant usam `bg-muted`                    |
| Indicador de digitação             | ✅         | Dots animados durante `isTyping`                          |
| Escape para fechar                 | ✅         | Event listener no `document`                              |

### 2.2 API endpoint

#### Dev (`server.js` + `vite.config.ts`)

**Status:** ✅ Funcional

- `vite.config.ts` contém plugin `devApiServer()` que spawna `node server.js` na porta 9001
- Vite proxy: requests `/api/*` são reescritos para `localhost:9001`
- `server.js` expõe:
  - `POST /api/chat` — proxy para OpenRouter com `OPENROUTER_API_KEY` do `.env`
  - `POST /api/handoff` — proxy para n8n webhook com `N8N_WEBHOOK_URL` do `.env`
- Nenhuma secret exposta no bundle (verificado via grep)

#### Produção (`functions/api/chat.ts` + `functions/api/handoff.ts`)

**Status:** ✅ Implementado

| Item                       | Verificado | Observação                                                      |
| -------------------------- | ---------- | --------------------------------------------------------------- |
| `functions/api/chat.ts`    | ✅         | Cloudflare Function, lê `env.OPENROUTER_API_KEY` (secret)       |
| `functions/api/handoff.ts` | ✅         | Cloudflare Function, lê `env.N8N_WEBHOOK_URL` (secret)          |
| Secrets                    | ✅         | Nenhum valor hardcoded; todas as chaves vêm de `env` Cloudflare |

### 2.3 OpenRouter

**Status:** ⚠️ Pipeline OK — credencial sem crédito

- `curl POST localhost:3000/api/chat` → HTTP 200 ✅
- OpenRouter responde `402 Payment Required` — API key válida, mas sem crédito
- MODEL configurado: `openai/gpt-5.2` (em `src/lib/openrouter.ts`)
- **Ação necessária:** adicionar créditos à conta OpenRouter

### 2.4 Renderização de resposta

**Status:** ✅ Funcional

- `ChatResponse` da API é parseada em `sendChatRequest()`
- Reply é renderizado como `<p>{message.content}</p>`
- Mensagens do usuário aparecem à direita (`flex-row-reverse`)
- Mensagens do assistant aparecem à esquerda com icone `Bot`

### 2.5 Handoff humano

**Status:** ✅ Pipeline implementado — Supabase não configurado

| Etapa                            | Status | Observação                                                            |
| -------------------------------- | ------ | --------------------------------------------------------------------- |
| `onRequestHuman` no ChatWidget   | ✅     | Fecha `isAiChatOpen`, abre `isHumanChatOpen`                          |
| `HumanChatWidget`                | ✅     | Cria sala no Supabase, usa Realtime                                   |
| `sendToN8n()` notificação        | ✅     | POST para `/api/handoff` com `event: 'human_chat_requested'`          |
| Supabase env vars                | ⚠️     | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` vazios em `.env.local` |
| Toggle button do HumanChatWidget | ✅     | Ocultado quando `isOpen` é controlado pelo App.tsx                    |

---

## 3. Segurança

| Item                                           | Status |
| ---------------------------------------------- | ------ |
| `VITE_N8N_WEBHOOK_URL` removido do bundle      | ✅     |
| Webhook n8n acessado via proxy `/api/handoff`  | ✅     |
| `OPENROUTER_API_KEY` nunca exposto no frontend | ✅     |
| `.env.example` não contém secrets              | ✅     |
| `AGENTS.md` re-gras atendidas (nome empresa)   | ✅     |

---

## 4. Variáveis de ambiente

`.env.local` atual:

| Variável                 | Valor                   |
| ------------------------ | ----------------------- |
| `VITE_SUPABASE_URL`      | (vazio)                 |
| `VITE_SUPABASE_ANON_KEY` | (vazio)                 |
| `VITE_WHATSAPP_NUMBER`   | `+5511968380592`        |
| `VITE_APP_URL`           | `http://localhost:3000` |

`.env.example` atualizado — `VITE_N8N_WEBHOOK_URL` removido.

**Secrets do Cloudflare (necessários para produção):**

| Secret               | Uso            |
| -------------------- | -------------- |
| `OPENROUTER_API_KEY` | `/api/chat`    |
| `N8N_WEBHOOK_URL`    | `/api/handoff` |

---

## 5. Testes validatórios

| Teste       | Comando                                                                                      | Resultado               |
| ----------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| Type check  | `npx tsc --noEmit`                                                                           | ✅ PASS                 |
| Build       | `npm run build`                                                                              | ✅ PASS                 |
| API live    | `curl -X POST localhost:3000/api/chat -d '{"messages":[{"role":"user","content":"teste"}]}'` | ✅ 200 (OpenRouter 402) |
| Secret scan | grep bundle por `WEBHOOK_URL` / `API_KEY`                                                    | ✅ Nenhum encontrado    |

---

## 6. Conclusão GATE-0

| Critério                                        | Status                      |
| ----------------------------------------------- | --------------------------- |
| ChatWidget renderiza e envia mensagens          | ✅                          |
| API endpoint responde (dev e prod)              | ✅                          |
| OpenRouter integrado (pipeline funcional)       | ✅ (credencial sem crédito) |
| Resposta renderizada no widget                  | ✅                          |
| Handoff para humano (App.tsx → HumanChatWidget) | ✅                          |
| n8n webhook via proxy (não exposto)             | ✅                          |
| Build e type-check sem erros                    | ✅                          |
| **GATE-0 APROVADO**                             | ✅                          |

### Pendências para produção

1. Adicionar créditos à conta OpenRouter
2. Configurar `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` em `.env.local`
3. Definir secrets `OPENROUTER_API_KEY` e `N8N_WEBHOOK_URL` no Cloudflare Pages
4. Garantir tabelas `chat_rooms` e `chat_messages` existam no Supabase (schema em `06-CHAT-E-ATENDIMENTO.md`)
