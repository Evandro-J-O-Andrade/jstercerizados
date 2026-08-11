# Phase 2 — Chatbot Intelligence Roadmap

**Status:** ✅ GATE-0 aprovado (2026-08-11)  
**Foco:** Evoluir o chatbot de resposta genérica para classificação de intenções e respostas contextuais.

---

## Visão geral

O chatbot atual (GATE-0) responde com base em um prompt de sistema fixo enviado ao OpenRouter. A Fase 2 introduz **classificação de intenções (intent classification)** para:

1. Direcionar o usuário para o fluxo correto (candidato, empresa, serviço, vaga, etc.)
2. Reduzir latência e custo chamando a LLM apenas quando necessário
3. Fornecer respostas mais precisas baseadas no conteúdo real do site

---

## Arquitetura (pós-Fase 2)

```
Usuario → mensagem
  ↓
IntentClassifier (regex preto | IA fallback)
  ↓ classifica
Intent: { name: "candidato_cadastro", confidence: 0.95 }
  ↓
Router:
  ├── high confidence (>= 0.9) → Bot Institucional (FAQ)
  ├── medium confidence (0.5–0.9) → IA (OpenRouter)
  └── low confidence (< 0.5) → escala para Humano
  ↓
Resposta renderizada no ChatWidget
```

---

## 2.1 Modos de chat

| Modo                  | Descrição                                | Tecnologia                      |
| --------------------- | ---------------------------------------- | ------------------------------- |
| **Bot Institucional** | FAQ, políticas, informações corporativas | Regex + respostas pré-definidas |
| **IA (contextual)**   | Perguntas abertas, interpretação livre   | OpenRouter GPT-5.2              |
| **Humano**            | Atendimento via Supabase Realtime + n8n  | Supabase + n8n + Evolution API  |

### Fluxo de decisão

```ts
IntentClassifier.classify(message):
  - Regex para intents de alta confiança (ex: "como me cadastrar", "horário de atendimento")
  - Se regex falhar → IA fallback (prompt de classificação)
  - confidence >= 0.9 → Bot Institucional
  - 0.5 <= confidence < 0.9 → IA contextual
  - confidence < 0.5 → escala para humano (onRequestHuman)
```

### Por que regex + IA fallback?

| Abordagem               | Vantagem                  | Desvantagem                        |
| ----------------------- | ------------------------- | ---------------------------------- |
| Regex puro              | Zero latência, zero custo | Não entende variações de linguagem |
| IA pura                 | Alta precisão             | Custo e latência por chamada       |
| **Híbrida (escolhida)** | Velocidade + precisão     | Mais complexidade de manutenção    |

---

## Sprints

### Sprint 1: Intent Classification (estimada: 2 dias)

**Objetivo:** Detectar intenções do usuário de forma híbrida.

**Entregáveis:**

1. `src/lib/intent-classifier.ts`
   - `IntentClassifier` class
   - `classify(message: string): Promise<IntentResult>`
   - Regex patterns para intents comuns
   - IA fallback via `sendChatRequest` com prompt de classificação
   - Tipos: `IntentResult { name: string; confidence: number; matchedPattern?: string }`

2. `src/lib/intents.json` (ou `.ts`)
   - Lista de intents:
     - `candidate_register` — "como cadastrar currículo", "enviar cv"
     - `candidate_process` — "como funciona processo seletivo", "etapas"
     - `candidate_vacancies` — "onde vejo vagas", "vagas disponíveis"
     - `company_hire` — "contratar", "orçamento", "serviços"
     - `service_rh` — "assessoria rh", "recrutamento"
     - `service_temp` — "mão de obra temporária", "terceirização"
     - `faq_hours` — "horário de atendimento", "horas"
     - `faq_location` — "onde fica", "endereço"
     - `support` — "falar com atendente", "humano"

3. Integração no `ChatWidget`
   - Chamar `IntentClassifier.classify()` antes de `sendChatRequest`
   - Se `intent.name === 'support'` → chamar `onRequestHuman()`
   - Se `intent.confidence >= 0.9` → usar resposta pré-definida
   - Se `intent.confidence < 0.9` → usar IA (OpenRouter) com histórico

**Validação:**

- `npx tsc --noEmit`
- `npm run build`
- Testes: 5 frases de exemplo classificadas corretamente

---

### Sprint 2: Knowledge Base (estimada: 3 dias)

**Objetivo:** Conectar o chatbot ao conteúdo real do site (serviços, FAQ, vagas).

**Entregáveis:**

1. `src/lib/knowledge-base.ts`
   - Busca semantica simples (ou regex) sobre serviços e FAQ
   - Carrega dados de `/servicos`, `/faq`, `/vagas`
   - `searchKnowledgeBase(query: string): KnowledgeResult[]`

2. `src/content/kb-data.ts`
   - Dados estáticos de serviços (extraídos do site)
   - FAQ (extraído de `/faq`)
   - Vagas (fetch runtime de `/vagas` ou dados mockados)

3. Integração no `ChatWidget`
   - Respostas do "Bot Institucional" baseadas em KB
   - Links clicáveis para `/servicos/slug`, `/vagas`, etc.

**Validação:**

- Perguntas sobre serviços retornam informações corretas
- Links direcionam para páginas reais

---

### Sprint 3: Context & Memory (estimada: 2 dias)

**Objetivo:** Manter contexto entre mensagens e personalizar respostas.

**Entregáveis:**

1. Session management
   - Persistir histórico de conversa no `sessionStorage`
   - Restaurar conversa ao reabrir o widget

2. User profiling
   - Detectar se usuário é candidato ou empresa (via intent)
   - Armazenar perfil em `localStorage`: `{ isCandidate: boolean, isCompany: boolean }`
   - Personalizar responses com base no perfil

3. Summarization (opcional)
   - Resumir histórico longo antes de enviar à LLM
   - Reduz tokens e custo

**Validação:**

- Conversa persiste ao recarregar página
- Respostas consideram perfil do usuário

---

### Sprint 4: Monitoring & Analytics (estimada: 1 dia)

**Objetivo:** Rastrear performance e identificar melhorias.

**Entregáveis:**

1. `src/lib/chat-analytics.ts`
   - Log de: intent detectada, confidence, fallback usado, escalation para humano
   - Eventos enviados para n8n webhook (via `sendToN8n`)

2. Dashboard Simples (n8n → Google Sheets ou Supabase)
   - Contagem de conversas
   - Taxa de escalonamento para humano
   - Intenções mais comuns

**Validação:**

- Dados visíveis em dashboard após interações de teste

---

## Cronograma resumido

| Sprint    | Duração    | Entrega                       |
| --------- | ---------- | ----------------------------- |
| Sprint 1  | 2 dias     | Intent classification híbrida |
| Sprint 2  | 3 dias     | Knowledge base integrada      |
| Sprint 3  | 2 dias     | Contexto e memory persistente |
| Sprint 4  | 1 dia      | Analytics e monitoring        |
| **Total** | **8 dias** | Chatbot inteligente completo  |

---

## Configuração necessária

### Cloudflare Secrets (para produção)

| Secret               | Sprint | Uso                       |
| -------------------- | ------ | ------------------------- |
| `OPENROUTER_API_KEY` | 1      | Classificação IA fallback |
| `N8N_WEBHOOK_URL`    | 1      | Analytics + handoff       |

### Supabase (para human chat)

| Tabela          | Colunas                           | Sprint   |
| --------------- | --------------------------------- | -------- |
| `chat_rooms`    | id, visitor_id, subject, status   | (GATE-0) |
| `chat_messages` | id, room_id, sender_type, content | (GATE-0) |

---

## Prioridades de risco

| Item                         | Risco    | Mitigação                                             |
| ---------------------------- | -------- | ----------------------------------------------------- |
| OpenRouter sem crédito       | 🔴 Alto  | Adicionar créditos antes da Sprint 1                  |
| Supabase não configurado     | 🟡 Médio | Configurar `.env.local` antes da validação            |
| Regex patterns insuficientes | 🟢 Baixo | Começar com 10 intents-chave, expandir iterativamente |

---

## Próximos passos

1. Adicionar créditos à conta OpenRouter
2. Configurar Supabase em `.env.local`
3. Definir secrets no Cloudflare Pages
4. Iniciar Sprint 1: Intent Classification
