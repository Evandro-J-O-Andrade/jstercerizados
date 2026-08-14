# GATE-UX-SEC-01 — Auditoria transversal

Data: 2026-08-14
Status: Concluído

## 1. Navegação

| Item           | Status | Observação                                                                                    |
| -------------- | ------ | --------------------------------------------------------------------------------------------- |
| 404            | OK     | `NotFound.tsx` existe, mas falta link de navegação alternativa no conteúdo além do botão home |
| Links internos | OK     | `react-router-dom` consistente em toda a aplicação                                            |
| Links externos | OK     | `target="_blank"` + `rel="noopener noreferrer"` aplicados                                     |
| WhatsApp       | OK     | `getWhatsAppUrl()` usado em várias páginas                                                    |
| SPA            | OK     | `ScrollToTop` + `AnimatePresence` implementados                                               |
| Reload         | OK     | Comportamento padrão do browser                                                               |
| Cinematic      | OK     | `CinematicShowcase` com skip, `prefers-reduced-motion` respeitado                             |

## 2. Feedbacks

| Item                 | Status  | Observação                                                                            |
| -------------------- | ------- | ------------------------------------------------------------------------------------- |
| Sucesso              | OK      | `success` state + ícone + mensagem clara em formulários                               |
| Erro                 | OK      | `FormAlert` + `error` em inputs                                                       |
| Loading              | OK      | `loading` no Button + `isSubmitting`                                                  |
| Timeout              | FALTA   | Nenhum tratamento de timeout em requisições                                           |
| Vaga preenchida      | FALTA   | Sem estado/indicação visual                                                           |
| Vaga encerrada       | FALTA   | Sem estado/indicação visual                                                           |
| Serviço indisponível | FALTA   | Sem estado/indicação visual                                                           |
| Página em construção | PARCIAL | `Termos.tsx` e `Privacidade.tsx` têm placeholder, mas sem design system de “em breve” |

## 3. Segurança

| Item                 | Status          | Observação                               |
| -------------------- | --------------- | ---------------------------------------- |
| Anti-bot             | FALTA           | Sem CAPTCHA ou camada anti-bot           |
| Rate limit           | FALTA           | Nenhum throttling no frontend            |
| Validação            | OK              | Zod + react-hook-form + sanitize utils   |
| LGPD                 | OK              | Checkbox de consentimento em formulários |
| Upload de currículo  | FALTA validação | Input file sem restrição de tipo/tamanho |
| Abuso de formulários | FALTA           | Sem cooldown ou bloqueio adaptativo      |

## 4. Identidade

| Item                         | Status | Observação                                                                                                  |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| Pessoa → Identidade → Papéis | OK     | `AuthContext` já tem roles: `admin`, `candidato`, `empresa`, `rh`, `comercial`, `financeiro`, `atendimento` |
| Perfil único                 | OK     | Um `profile` por usuário, não duplicado por relação                                                         |
| Multi-perfil                 | FALTA  | Se uma pessoa for tanto `candidato` quanto `empresa`, hoje precisa de duas contas                           |

## GATE-DATA-03 — Identidade consolidada

Modelo aprovado para implementação futura:

```
Pessoa (1 login)
 ├── Identidade única (email/senha ou social)
 └── Papéis (array de roles)
      ├── candidato
      ├── empresa
      ├── rh
      ├── comercial
      ├── financeiro
      ├── atendimento
      └── admin
```

**Regra:** uma pessoa = uma conta. Os papéis definem o que ela pode fazer, não criam contas separadas.
