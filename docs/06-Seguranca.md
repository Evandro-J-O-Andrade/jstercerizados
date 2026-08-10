# Segurança — JSEmpregos

## HTTPS

- Todo o tráfego será servido via HTTPS.
- SSL/TLS configurado automaticamente pelo provedor de hospedagem (Vercel/Cloudflare).

## Content Security Policy (CSP)

- CSP headers configurados para prevenir XSS e injection attacks.
- Restrição de fontes, scripts e styles a domínios confiáveis.

## Headers de Segurança

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Sanitização

- Todos os inputs de formulário são sanitizados no cliente e no servidor.
- Zod schema validation para dados estruturados.
- Escapamento de HTML em conteúdo gerado pelo usuário.

## Rate Limiting

- Limite de requisições por IP nos formulários.
- Proteção contra brute force no login.
- Throttling em envios de formulário.

## Anti-Spam

- Honeypot fields em formulários.
- Rate limiting por formulário.
- CAPTCHA integrado (reCAPTCHA ou Turnstile).
- Validação de tempo mínimo de preenchimento.

## Proteção CSRF

- Tokens CSRF em todas as operações de mutação.
- SameSite cookies configurados.

## Proteção XSS

- React escapa automaticamente valores JSX.
- dangerouslySetInnerHTML evitado ou sanitizado.
- CSP headers restritivos.

## Proteção SQL Injection

- Supabase usa parameterized queries internamente.
- Nunca concatenar inputs diretamente em queries.
- RLS protege contra acesso não autorizado.

## Validação

- **Client-side**: React Hook Form + Zod.
- **Server-side**: Validação no Supabase Edge Functions.
- Ambas as camadas validam independentemente.
