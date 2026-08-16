# GATE-TALENT-01 — Diagnóstico: Banco de Talentos

## 1. Componente identificado

**Arquivo:** `src/pages/TrabalheConosco.tsx`

## 2. Fluxo atual

```text
TrabalheConosco.tsx
       │
       ▼
react-hook-form + zod
       │
       ▼
onSubmit (linha 101)
       │
       ▼
mockSubmitCandidate()  ← src/services/mock/curriculos.ts
       │
       ▼
localStorage (chave: jst_candidates)
       │
       ▼
setSubmitted(true) → tela "Currículo Enviado!"
```

## 3. Arquitetura definida vs implementação atual

| Camada      | Documentação/Planejamento     | Implementação atual                   |
| ----------- | ----------------------------- | ------------------------------------- |
| Frontend    | React + react-hook-form + zod | ✅ Implementado                       |
| Backend     | Supabase PostgreSQL           | ❌ Não implementado para candidaturas |
| Automação   | n8n webhook                   | ❌ Não implementado para candidaturas |
| Storage     | Supabase Storage (currículo)  | ❌ Não implementado                   |
| Notificação | n8n → WhatsApp + e-mail       | ❌ Não implementado                   |

## 4. Diagnóstico detalhado

### 4.1 Formulário

- **Componente:** `TrabalheConosco.tsx`
- **Validação:** Zod schema (`candidateSchema`) com campos: name, cpf, rg, phone, email, city, positions, experience, courses, availability, schedule, resume, resumeFile
- **Biblioteca:** `react-hook-form` + `zodResolver`
- **Estado:** `isSubmitting` controla loading/disabled do botão

### 4.2 Submit

- **Função:** `mockSubmitCandidate()` (linha 104)
- **Payload construído:**
  - Dados sanitizados (name, cpf, rg, phone, email, city, experience, position, resume, availability, courses, status, resumeFileName)
  - `status: 'received'` hardcoded
  - `id` gerado via `crypto.randomUUID()`
  - `createdAt` timestamp ISO

### 4.3 Destino

- **Arquivo:** `src/services/mock/curriculos.ts`
- **Função:** `mockSubmitCandidate(data)`
- **Ação:** Salva no `localStorage` do navegador (chave `jst_candidates`)
- **NÃO envia para:**
  - Supabase
  - n8n
  - Qualquer endpoint HTTP
  - Qualquer API externa

### 4.4 Confirmação/Erro

- **Sucesso:** `setSubmitted(true)` → tela com mensagem "Currículo Enviado!"
- **Erro:** Não há tratamento de erro no `onSubmit` (sem try/catch)
- **Loading:** Botão mostra spinner via `loading={isSubmitting}` e fica disabled
- **Prevenção de duplo envio:** `disabled={isSubmitting}` previne cliques múltiplos

## 5. Arquitetura existente que pode ser reutilizada

### 5.1 Supabase client

- **Arquivo:** `src/lib/supabase.ts`
- **Função:** `getSupabaseClient()` — retorna `SupabaseClient | null`
- **Uso atual:** AuthContext, HumanChatWidget, useRealtimeChat
- **Disponibilidade:** Sim, mas requer `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### 5.2 n8n proxy

- **Arquivo:** `functions/api/handoff.ts`
- **Função:** Proxy para n8n webhook via `N8N_WEBHOOK_URL`
- **Uso atual:** Chat humano (handoff)
- **Disponibilidade:** Sim, mas requer deploy das Functions e variável `N8N_WEBHOOK_URL`

### 5.3 Tabelas Supabase relevantes

- **Schema:** `supabase/schema.sql` (1330 linhas)
- **Tabelas mapeadas:**
  - `candidates` — para perfis de candidatos
  - `candidate_documents` — para currículos/arquivos
  - `webhooks` — para integração n8n
  - `automation_queue` — para fila de automação
  - `emails` — para notificações

## 6. Causa raiz do problema

O formulário **não está quebrado**; ele está **intencionalmente mockado**.

O fluxo atual:

1. ✅ Validação funciona
2. ✅ Submit funciona
3. ✅ Payload é construído
4. ✅ Dados são salvos (no localStorage)
5. ✅ Tela de sucesso é exibida

**Mas:** os dados **não chegam a nenhum destino real** (Supabase/n8n).

Isso é consistente com o status do projeto: **frontend implementado, backend/integração pendente**.

## 7. Bloqueadores identificados

| Bloqueador                  | Status | Detalhe                                                                    |
| --------------------------- | ------ | -------------------------------------------------------------------------- |
| Supabase não configurado    | ⚠️     | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` vazios em `.env.local`      |
| Tabelas não criadas         | ❓     | Schema existe em `supabase/schema.sql`, mas não confirmado se foi aplicado |
| n8n webhook não configurado | ❓     | `N8N_WEBHOOK_URL` não confirmado                                           |
| Upload de currículo         | ❌     | Arquivo é recebido mas não enviado para Supabase Storage                   |
| LGPD/consentimento          | ⚠️     | Não há checkbox explícito de consentimento no formulário atual             |

## 8. Impacto LGPD

Dados coletados sem consentimento explícito:

- Nome completo
- CPF
- RG
- Telefone
- E-mail
- Cidade
- Experiência profissional
- Cursos
- Disponibilidade
- Escala preferida
- Currículo (texto + arquivo)

**Risco:** Sem consentimento explícito e sem política de retenção/configuração de armazenamento, o fluxo atual não está conforme LGPD para produção.

## 9. Recomendação de correção

### Fase 1 — Infraestrutura

1. Configurar `.env.local` com Supabase
2. Aplicar migrations do schema
3. Configurar `N8N_WEBHOOK_URL` nas Functions

### Fase 2 — Integração

1. Criar serviço `src/services/candidates.ts` substituindo mock
2. Implementar insert em `candidates` + `candidate_documents`
3. Implementar webhook n8n para notificações
4. Manter mock como fallback quando Supabase não configurado

### Fase 3 — LGPD

1. Adicionar checkbox de consentimento LGPD
2. Implementar política de retenção
3. Adicionar link para política de privacidade

## 10. Conclusão

**O formulário do Banco de Talentos NÃO está enviando dados para lugar nenhum porque está intencionalmente mockado para localStorage.**

A arquitetura Supabase + n8n está documentada e parcialmente implementada em outras partes do sistema (auth, chat), mas **não foi conectada ao fluxo de candidaturas**.

O próximo passo correto é:

1. Definir se o destino é Supabase direto ou via n8n
2. Implementar a integração
3. Adicionar tratamento de erro e LGPD

**Não corrigir apenas "o botão não funciona" — a causa é a ausência de integração backend, não um bug no frontend.**
