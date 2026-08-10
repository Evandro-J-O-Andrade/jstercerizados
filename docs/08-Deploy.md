# Deploy — JSEmpregos

## Hospedagem Frontend

### Opção Recomendada: Cloudflare Pages

- Gratuito para projetos pessoais e pequenos.
- CDN global integrada.
- SSL automático.
- Deploy automático via GitHub.

### Alternativa: Vercel

- Deploy com um comando.
- Preview deployments automáticos.
- Edge functions para funções serverless.

### Alternativa: Netlify

- Deploy simples via Git.
- Form handling integrado (temporário).
- Split testing nativo.

## Configuração de Domínio

1. Registrar domínio `.com.br` (Registro.br ou similar).
2. Configurar DNS apontando para o provedor de hospedagem.
3. Configurar SSL/HTTPS automático.
4. Configurar domínio customizado no painel de hospedagem.

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_URL=
VITE_WHATSAPP_NUMBER=
VITE_SMTP_HOST=
VITE_SMTP_PORT=
VITE_SMTP_USER=
VITE_SMTP_PASS=
VITE_GA_TRACKING_ID=
```

## Build de Produção

```bash
npm run build
```

O output será gerado na pasta `dist/`, pronto para deploy.

## CI/CD (Futuro)

- GitHub Actions para lint, test e build automáticos.
- Deploy automático na branch `main`.
- Preview deployments em PRs.
