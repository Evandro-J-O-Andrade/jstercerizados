# GATE-ERROR-UX-01 — Error Handling, Feedback e Fallback

**Baseline:** `4f3bd1a`  
**Data:** 2026-08-15  
**Status:** ESPECIFICAÇÃO  
**Próximo gate:** `GATE-CONTENT-01`

---

## 1. Objetivo

Implementar uma camada transversal de tratamento de erros que:

1. **Nunca** vaze mensagens técnicas para o usuário
2. Padronize feedback visual em toda a aplicação
3. Forneça fallbacks para componentes e integrações críticas
4. Separe logs técnicos de mensagens de usuário
5. Torne a aplicação resiliente a falhas de API, Supabase, n8n, Chat e rede

**Não é objetivo:** alterar conteúdo, layout, CSS premium ou componentes funcionais existentes.

---

## 2. Escopo

### 2.1 Inclui

| Item                      | Descrição                                        |
| ------------------------- | ------------------------------------------------ |
| Error Boundary global     | Captura erros de renderização do React           |
| Error Normalizer          | Transforma erros técnicos em mensagens amigáveis |
| Feedback components       | Toast, alerta inline, banner de erro             |
| Fallback components       | Estado vazio, erro de carregamento, timeout      |
| Tratamento de fetch/API   | Timeout, network error, abort                    |
| Tratamento de validação   | Zod/Yup → mensagens amigáveis                    |
| Tratamento de Supabase    | Erros de RLS, conexão, query                     |
| Tratamento de n8n         | Webhook error, timeout, 4xx/5xx                  |
| Tratamento de Chat IA     | Fallback para chat humano                        |
| Tratamento de Chat humano | Fallback para WhatsApp                           |
| Tratamento de rotas       | 404, 403, 500                                    |
| Logging técnico           | Console/remote logging sem exposição ao usuário  |

### 2.2 Não inclui

| Item                                | Descrição                                        |
| ----------------------------------- | ------------------------------------------------ |
| CSS Premium                         | Proibido até GATE-CONTENT-01 fechar              |
| Alteração de componentes funcionais | Permitido apenas adicionar error handling        |
| Conteúdo                            | Fora de escopo                                   |
| SEO                                 | Fora de escopo                                   |
| Forms                               | Apenas adicionar error handling, não reconstruir |

---

## 3. Arquitetura

### 3.1 Camadas de erro

```text
                    ┌─────────────────────┐
                    │   AÇÃO DO USUÁRIO   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Validação / TDD     │
                    │ contrato de dados   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ API / Supabase /    │
                    │ n8n / Chat / etc.   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Error Normalizer    │
                    └──────────┬──────────┘
                               ↓
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
           Feedback          Fallback         Logging
              ↓                ↓                ↓
        usuário entende    aplicação segue    dev/admin
```

### 3.2 Fluxo de tratamento

```text
Erro ocorre
     ↓
Error Normalizer
     ↓
├── É erro técnico conhecido?
│   ├── SIM → mapear para mensagem amigável
│   └── NÃO → mapear para mensagem genérica
     ↓
Separar:
├── Mensagem para usuário (amigável)
├── Detalhe técnico (log)
└── Código HTTP/status (se aplicável)
     ↓
Feedback + Fallback
```

### 3.3 Códigos HTTP mapeados

| Código | Mensagem amigável                    | Ação                          |
| ------ | ------------------------------------ | ----------------------------- |
| `400`  | Solicitação inválida                 | Mostrar campo com erro        |
| `401`  | Sessão necessária                    | Redirecionar login            |
| `403`  | Acesso não autorizado                | Mostrar mensagem              |
| `404`  | Página não encontrada                | Página 404                    |
| `408`  | Tempo excedido                       | Oferecer retry                |
| `422`  | Dados inválidos                      | Mostrar campos com erro       |
| `429`  | Muitas tentativas                    | Aguardar e tentar novamente   |
| `500`  | Erro inesperado                      | Mensagem genérica + log       |
| `502`  | Serviço indisponível                 | Mensagem de indisponibilidade |
| `503`  | Serviço temporariamente indisponível | Mensagem + retry              |
| `504`  | Tempo limite excedido                | Mensagem + retry              |

### 3.4 Erros não-HTTP mapeados

| Erro                                     | Causa provável       | Mensagem amigável                               |
| ---------------------------------------- | -------------------- | ----------------------------------------------- |
| `Expected string, received boolean`      | Validação Zod/schema | Não foi possível processar os dados informados. |
| `TypeError: undefined is not a function` | Código/bug           | Tivemos um problema inesperado.                 |
| `NetworkError`                           | Sem conexão          | Verifique sua conexão e tente novamente.        |
| `Failed to fetch`                        | API indisponível     | Serviço temporariamente indisponível.           |
| `JSON parse error`                       | Resposta inválida    | Não foi possível processar a resposta.          |
| `Supabase error`                         | Banco/RLS            | Não foi possível concluir a operação.           |
| `n8n webhook error`                      | Automação            | Serviço temporariamente indisponível.           |
| `Chat IA error`                          | API/Limite           | Assistente temporariamente indisponível.        |

---

## 4. Componentes

### 4.1 ErrorBoundary

```text
src/components/errors/
├── ErrorBoundary.tsx          # Wrapper global
├── ErrorFallback.tsx          # UI de fallback
├── NotFound.tsx               # 404
├── ServiceUnavailable.tsx     # 502/503/504
└── UnexpectedError.tsx        # 500/erro genérico
```

### 4.2 Error Normalizer

```text
src/lib/
├── error-normalizer.ts        # Normaliza erros técnicos → amigáveis
├── logger.ts                  # Logging técnico separado
└── api-client.ts              # Fetch com timeout/retry/fallback
```

### 4.3 Feedback components

```text
src/components/feedback/
├── Toast.tsx                  # Notificação temporária
├── Alert.tsx                  # Alerta inline
├── Banner.tsx                 # Banner de página
└── Loading.tsx                # Estado de carregamento
```

### 4.4 Fallback components

```text
src/components/fallback/
├── EmptyState.tsx             # Estado vazio
├── ErrorState.tsx             # Estado de erro com retry
├── TimeoutState.tsx           # Timeout com retry
└── OfflineState.tsx           # Sem conexão
```

---

## 5. Implementação

### 5.1 Ordem de implementação

1. `src/lib/logger.ts` — Logging técnico
2. `src/lib/error-normalizer.ts` — Normalização de erros
3. `src/components/errors/ErrorBoundary.tsx` — Boundary global
4. `src/components/errors/NotFound.tsx` — 404
5. `src/components/errors/ServiceUnavailable.tsx` — 502/503/504
6. `src/components/errors/UnexpectedError.tsx` — 500
7. `src/components/feedback/Toast.tsx` — Toast notifications
8. `src/components/feedback/Alert.tsx` — Alertas inline
9. `src/components/fallback/ErrorState.tsx` — Estado de erro com retry
10. Integração em componentes existentes (forms, chat, páginas)

### 5.2 Error Normalizer

Responsável por transformar qualquer erro em:

```ts
interface NormalizedError {
  userMessage: string;
  technicalDetail: string;
  statusCode?: number;
  canRetry: boolean;
  logToConsole: boolean;
}
```

### 5.3 ErrorBoundary

- Captura erros de renderização
- Mostra fallback apropriado
- Loga erro técnico
- Oferece opção de retry/reload

### 5.4 Integrações específicas

| Integração  | Erro tratado          | Fallback                  |
| ----------- | --------------------- | ------------------------- |
| Supabase    | RLS, conexão, query   | Mensagem + retry          |
| n8n         | Webhook timeout, 5xx  | Mensagem + retry          |
| Chat IA     | API error, limite     | Fallback para chat humano |
| Chat humano | Serviço indisponível  | Fallback para WhatsApp    |
| Forms       | Validação Zod         | Campos com erro inline    |
| Upload      | Falha de rede/arquivo | Mensagem + retry          |
| Imagens     | Falha de carregamento | SafeImage já existe       |

---

## 6. TDD

### 6.1 Testes unitários

| Arquivo                    | Cenários                                                        |
| -------------------------- | --------------------------------------------------------------- |
| `error-normalizer.test.ts` | Mapeamento de códigos HTTP, erros técnicos, mensagens amigáveis |
| `logger.test.ts`           | Logging sem exposição, níveis de log                            |
| `api-client.test.ts`       | Timeout, retry, network error                                   |

### 6.2 Testes de integração

| Cenário                             | Esperado                                          |
| ----------------------------------- | ------------------------------------------------- |
| 404 em rota inexistente             | Página 404 amigável                               |
| 500 em API                          | Mensagem genérica + log técnico                   |
| `Expected string, received boolean` | "Não foi possível processar os dados informados." |
| Network error                       | "Verifique sua conexão e tente novamente."        |
| Supabase offline                    | Mensagem + retry automático                       |
| n8n timeout                         | Mensagem + botão retry                            |
| Chat IA falha                       | Fallback para chat humano                         |
| Chat humano falha                   | Fallback para WhatsApp                            |

### 6.3 Critérios de aceite TDD

- [ ] Todo erro técnico tem mensagem amigável mapeada
- [ ] Nenhum `console.error` ou stack trace aparece na UI
- [ ] Todos os fallbacks funcionam offline/simulação
- [ ] Retry funciona onde aplicável
- [ ] Logs técnicos são capturados sem exposição

---

## 7. Critérios de Aceite do Gate

| Critério                                                | Status |
| ------------------------------------------------------- | ------ |
| Error Boundary global implementado                      | ⬜     |
| 404 revisado e integrado                                | ⬜     |
| Normalizador de erros central                           | ⬜     |
| Mensagens amigáveis para todos os códigos HTTP          | ⬜     |
| Tratamento de erros não-HTTP                            | ⬜     |
| Feedback visual padronizado (Toast/Alert/Banner)        | ⬜     |
| Fallback para componentes críticos                      | ⬜     |
| Tratamento de fetch/timeout/retry                       | ⬜     |
| Tratamento de validação Zod                             | ⬜     |
| Tratamento de Supabase                                  | ⬜     |
| Tratamento de n8n                                       | ⬜     |
| Tratamento de Chat IA                                   | ⬜     |
| Tratamento de Chat humano                               | ⬜     |
| Logging técnico separado                                | ⬜     |
| TDD/testes dos principais cenários                      | ⬜     |
| Nenhum erro técnico cru na UI                           | ⬜     |
| `Expected string, received boolean` corrigido na origem | ⬜     |
| `tsc --noEmit` PASS                                     | ⬜     |
| `npm run build` PASS                                    | ⬜     |
| `git diff --check` PASS                                 | ⬜     |

---

## 8. Sequência de Gates

```text
GATE-ARCH-01 — Auditoria de Duplicatas .js ✅
GATE-ARCH-02 — Consolidação JS → TS ✅
GATE-ERROR-UX-01 — Error Handling + Feedback + Fallback ⏳ PRÓXIMO
GATE-CONTENT-01 — Conteúdo e Arquitetura Comercial ⏳
CHAT-UX-01 — Experiência do Chat IA e humano ⏳
GATE-DATA-03 — Formulários e integrações ⏳
PREMIUM UI — Design System e CSS ⏳
GATE-SECURITY-01 — Segurança e RLS ⏳
QA/PRODUCTION — Smoke test e deploy ⏳
```

---

## 9. Regras de Desenvolvimento

### 9.1 Sem reconstrução

Não substituir componentes funcionais. Apenas adicionar error handling.

### 9.2 Sem CSS Premium

Não alterar tokens, estilos ou componentes visuais além do necessário para feedback de erro.

### 9.3 TDD primeiro

Implementar testes antes do código. O normalizador de erros deve ser testado exaustivamente.

### 9.4 Sem vazamento técnico

Nunca mostrar stack traces, códigos de biblioteca ou detalhes de implementação para o usuário.

### 9.5 Logging obrigatório

Todo erro deve ser logado com contexto suficiente para debug, mas sem exposição na UI.

---

## 10. Documentos de Referência

| Documento        | Caminho                                                      | Status |
| ---------------- | ------------------------------------------------------------ | ------ |
| Mapa Mestre      | `docs/SITE-JS-TERCEIRIZADOS/03-MAPA-MESTRE-PROJETO.md`       | ✅     |
| Auditoria JS     | `docs/SITE-JS-TERCEIRIZADOS/04-AUDITORIA-DUPLICATAS-JS.md`   | ✅     |
| GATE-CONTENT-01  | `docs/SITE-JS-TERCEIRIZADOS/04-GATE-CONTENT-01.md`           | ⏳     |
| Consolidação JS  | `docs/SITE-JS-TERCEIRIZADOS/05-GATE-ARCH-02-CONSOLIDACAO.md` | ✅     |
| GATE-ERROR-UX-01 | `docs/SITE-JS-TERCEIRIZADOS/06-GATE-ERROR-UX-01.md`          | ⏳     |

---

**Aprovado por:** [aguardando aprovação]  
**Próxima revisão:** Após implementação
