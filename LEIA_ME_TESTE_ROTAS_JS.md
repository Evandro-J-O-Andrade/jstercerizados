# J&S Empregos — Verificação de todos os links e rotas (CHECK BOULER 24H)

## O que está incluído

`teste_rotas_jsempregos.mjs` realiza uma **auditoria de navegação somente leitura** no código LOCAL atualizado (não no GitHub desatualizado).

- Varre `src/` e identifica destinos internos estáticos (`to`, `href`, `navigate`, `homeRoute`, `route`, `<Route path>`).
- Abre cada destino no Chromium via Playwright e registra URL final, redirects, erros e headings.
- Descobre páginas parametrizadas pelos links reais renderizados e tenta clicar em links visíveis, sem executar formulários ou botões de escrita.
- Diferencia redirecionamento para Auth/seleção de tenant de erro de rota.
- Sinaliza retorno de `/dashboard/recrutamento/*` para `/dashboard/admin-master`.
- Salva `route-audit-resultados/rotas.md` e `route-audit-resultados/rotas.json` no projeto.

**Importante:** links dependentes de botões JavaScript não são clicados automaticamente; rotas parametrizadas sem dados reais não são adivinhadas. Para cobertura por perfil, é necessário estado de autenticação correspondente. Os resultados devem ser conferidos no navegador para confirmar a página correta, não apenas URL 200.

## Instalar no projeto (sem alterar código de produção)

1. Coloque `teste_rotas_jsempregos.mjs` na pasta `scripts/` do seu repositório local.
2. No terminal PowerShell, na raiz do projeto, confirme que Vite está rodando na porta 3000 e que `npm install` já foi feito.
3. Rode primeiro o teste público:

```powershell
$env:ROUTE_AUDIT_STATES='anon'
node scripts/teste_rotas_jsempregos.mjs
```

4. Para auditar páginas autenticadas, salve o estado **localmente**, manualmente, com Playwright (não publique/compartilhe esses arquivos):

```powershell
New-Item -ItemType Directory -Force playwright/.auth | Out-Null
npx playwright codegen --save-storage=playwright/.auth/admin-master.json http://localhost:3000/login
```

No navegador aberto, autentique-se normalmente e feche a janela após a sessão estar estabelecida. Repita apenas para perfis de teste realmente autorizados (Recrutador, RH, Candidato). Adicione `playwright/.auth/` ao `.gitignore` local para não versionar tokens de sessão.

```powershell
$env:ROUTE_AUDIT_STATES='anon;admin_master:playwright/.auth/admin-master.json'
$env:ROUTE_AUDIT_MAX_PAGES='350'
$env:ROUTE_AUDIT_MAX_CLICKS='300'
node scripts/teste_rotas_jsempregos.mjs
```

Para testar todos os perfis já disponíveis:

```powershell
$env:ROUTE_AUDIT_STATES='anon;admin_master:playwright/.auth/admin-master.json;recrutador:playwright/.auth/recrutador.json;rh:playwright/.auth/rh.json;candidato:playwright/.auth/candidato.json'
node scripts/teste_rotas_jsempregos.mjs
```

## Gate de aceite

Para cada link com permissão, conferir **rota solicitada → URL final → título/componente → conteúdo funcional**. Falhas relevantes: `RETORNO_INDEVIDO_ADMIN`, `REDIRECT`, `REDIRECT_CLICK`, `ERRO_TECNICO`, `EXCECAO_JAVASCRIPT`, `FALLBACK_OU_404`, `SESSAO_AUSENTE`, `ERRO_CLICK`. `AUTH_OU_CONTEXTO` para visitante anônimo normalmente é esperado, não aprovação da rota privada.

Dar atenção a:
- `/dashboard/global` (Central 24H) e `/dashboard/admin-master` (Governança) separados.
- `/dashboard/recrutamento/candidatos`, detalhes, e `/dashboard/rh/candidatos`.
- Links legados `/dashboard/candidato`, `/dashboard/candidatos`, `:id`, `:id/documentos`.
- `/dashboard/recrutamento/habilidades` (suspeita de rota inexistente).
- `/dashboard/vagas`, `/dashboard/candidaturas`, `/dashboard/banco-de-talentos` (resolução legada).
- `/candidato/*` self-service, `/dashboard/ava/*`, `/dashboard/suporte/*`, menus públicos e navegação mobile.
- Tenant ausente e troca de tenant; acesso negado por perfil é esperado, nunca mostra dados de outro tenant.

**Escopo:** script local, não altera CORE/Dispatcher, Auth, RLS, Supabase, migrations, rotas ou o P0.1. Não executa commit/push/deploy. Os arquivos de autenticação são sensíveis, não os envie.
