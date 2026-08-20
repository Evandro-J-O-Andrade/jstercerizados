# Assistente IA J&S

## Arquitetura

- `ChatWidget.tsx`: interface do visitante e histórico da conversa.
- `/api/chat`: Cloudflare Pages Function; mantém a chave do OpenRouter no servidor.
- `src/ai/knowledge.ts`: conhecimento oficial e estruturado da J&S.
- `src/ai/prompts.ts`: comportamento, guardrails e regras da assistente.
- `/api/handoff`: ponte server-side para o n8n quando o visitante solicita atendimento humano.
- `HumanChatWidget.tsx`: canal de atendimento em tempo real baseado na infraestrutura Supabase já existente no projeto.

## Secrets do Cloudflare Pages

Configure em **Settings → Variables and Secrets** para o ambiente de produção:

- `OPENROUTER_API_KEY` — chave `sk-or-v1-...` do OpenRouter.
- `N8N_WEBHOOK_URL` — webhook de entrada do fluxo de handoff no n8n.

Não use `VITE_OPENROUTER_API_KEY`. Qualquer variável `VITE_*` é destinada ao bundle do navegador.

## n8n

O endpoint `/api/handoff` envia um evento `human_handoff` com:

- `source`
- `conversationId`
- `intent`
- `page`
- `visitor`
- últimas mensagens da conversa
- `createdAt`

O workflow pode então criar/atualizar lead, notificar a equipe, iniciar WhatsApp Business API, registrar CRM e disparar follow-up.

## Atendimento humano em tempo real

O projeto já possui `HumanChatWidget` + `useRealtimeChat`, usando Supabase Realtime e as tabelas `chat_rooms` e `chat_messages`. Para operação real, a instância Supabase precisa estar configurada, com RLS/realtime e uma interface operacional para os atendentes.

O botão de atendimento humano não depende da IA para funcionar: ele cria o handoff e abre o canal humano.

## Próximas evoluções

1. Streaming da resposta da IA.
2. Tool calling para vagas e dados reais.
3. RAG/knowledge base indexada.
4. Persistência de conversas IA.
5. Identidade do visitante/lead.
6. Dashboard operacional para atendentes.
7. WhatsApp Business API via n8n.
8. Rate limiting e observabilidade por conversa.
