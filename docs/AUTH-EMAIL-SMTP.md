# AUTH EMAIL / SMTP — Configuração Operacional

## Visão Geral

O Supabase Auth utiliza um serviço de e-mail para:

- Confirmação de cadastro (signup)
- Recuperação de senha (password reset)
- E-mails transacionais do Auth

Este documento descreve como configurar o envio de e-mails do Auth.

## Arquitetura

```
Candidato informa e-mail
        ↓
supabase.auth.signUp()
        ↓
Supabase Auth
        ↓
SMTP configurado
        ↓
E-mail enviado para o ENDEREÇO INFORMADO PELO CANDIDATO
        ↓
Link de confirmação
        ↓
jsempregos.com.br/auth/callback
        ↓
email_confirmed_at = timestamp
```

## Regras Importantes

### Remetente vs Destinatário

- **SMTP_USER** é o remetente/infraestrutura do sistema.
- **O e-mail de confirmação NÃO é enviado para SMTP_USER.**
- A confirmação é enviada para o e-mail informado pelo candidato no cadastro.

### Exemplo

```
Candidato informa: joao@gmail.com
        ↓
Confirmação é enviada para: joao@gmail.com
        ↓
Remetente: notificacoes@jsempregos.com.br
```

### Notificações Internas

`notificacoes@jsempregos.com.br` é reservado para notificações internas do sistema e não é o destinatário dos links de confirmação do candidato.

## Configuração do Supabase Auth

### SMTP Settings

| Campo         | Valor                            |
| ------------- | -------------------------------- |
| SMTP Host     | `smtp.hostinger.com`             |
| SMTP Port     | `465` (SSL) ou `587` (TLS)       |
| SMTP User     | `notificacoes@jsempregos.com.br` |
| SMTP Password | `<DEFINIR NO AMBIENTE>`          |
| Sender Name   | `J&S Empregos LTDA`              |
| Sender Email  | `notificacoes@jsempregos.com.br` |

### URL Configuration

| Campo        | Valor                                     |
| ------------ | ----------------------------------------- |
| Site URL     | `https://jsempregos.com.br`               |
| Redirect URL | `https://jsempregos.com.br/auth/callback` |

### Email Auth

| Configuração         | Estado      |
| -------------------- | ----------- |
| Email Auth           | Ativo       |
| Confirm Email        | Obrigatório |
| Confirm Email Change | Obrigatório |
| Secure Email Change  | Obrigatório |
| Recovery Email       | Obrigatório |

## Fluxo Esperado

### Cadastro

1. Candidato informa e-mail e senha.
2. `supabase.auth.signUp()` é chamado.
3. HTTP 200 — usuário criado.
4. `data.session` = null (confirmação obrigatória).
5. `data.user.email_confirmed_at` = null.
6. Supabase Auth envia e-mail de confirmação via SMTP.
7. E-mail chega no endereço informado pelo candidato.
8. Candidato clica no link de confirmação.
9. `email_confirmed_at` é preenchido pelo Supabase.
10. Login com e-mail + senha é permitido.

### Recuperação de Senha

1. Usuário clica "Esqueci minha senha".
2. `supabase.auth.resetPasswordForEmail()` é chamado.
3. Link de recuperação é enviado para o e-mail da conta.
4. Usuário redefine a senha.
5. Login com nova senha.

## Teste Pós-Configuração

### Passo a Passo

1. Cadastrare um novo candidato com e-mail real.
2. Verificar HTTP 200 na resposta de `signUp()`.
3. Verificar que `data.session` inicialmente é null.
4. Verificar recebimento do e-mail de confirmação.
5. Clicar no link de confirmação.
6. Verificar que `email_confirmed_at` deixa de ser null.
7. Fazer login com e-mail + senha.
8. Confirmar acesso ao dashboard.

## Segurança

### Não Fazer

- Não commitar credenciais reais no Git.
- Não colocar `SMTP_PASS` em variáveis do frontend (`VITE_*`).
- Não criar Edge Function de envio de e-mail.
- Não criar sistema próprio de e-mail.
- Não alterar `AuthContext.tsx`, `Login.tsx`, `CadastroCandidato.tsx`.
- Não desabilitar Email + Password.

### Credenciais

- `SMTP_PASS` deve ser configurado apenas no ambiente seguro do Supabase.
- Nunca exponha credenciais no browser.
- Nunca exponha credenciais em logs.

## Domínio Canônico

- Domínio oficial: `jsempregos.com.br`
- URLs de autenticação devem apontar para o domínio oficial.
- Confirmar se o site abre com ou sem `www` antes de configurar as URLs.

## Provedor SMTP

- Provedor: Hostinger
- Conta: `notificacoes@jsempregos.com.br`
- Confirmar host, porta e método TLS/SSL no painel da Hostinger.

## Documentação Relacionada

- `.env.example` — Template de variáveis de ambiente
- `docs/07-Roadmap.md` — Planejamento de SMTP
- `docs/AUDIT-INTEGRATIONS-COMPLETA.md` — Auditoria de integrações
