# CHECK BOULER 24H — Recuperação do menu Master, V4

**Objetivo:** corrigir a redução indevida de links do Admin Master, preservar as 26 células registradas e fornecer navegação global → domínio → home/CRUD sem duplicar o shell. Este é um **patch focal de sidebar**, não uma recriação de toda a plataforma.

## O que estava errado

- O catálogo anterior usava filtros de `MODULE_PERMISSION_MAP`, `cell.permissions`, `effectiveScopes`, `hasTenant`, `navigation.sidebar`, exclusões manuais (`core`, `candidato`) **antes de montar a lista do Admin Master**. Isso reduzia o número de entradas globalmente visíveis.
- Em versões anteriores, o botão `Todos os módulos` apontava para `/dashboard/modulos` ou `/dashboard/global`. O proprietário definiu a **Home Master como** `/dashboard/admin-master`. A Central 24H `/dashboard/global` é outra aplicação de observabilidade (P0.1), não a Home Master.
- Visibilidade de link, autorização de navegação e autorização de operações são problemas diferentes. Este patch **mostra todos os contratos** para o Master, mas chama `dispatcherMaster.isAuthorized` antes de cada entrada e mantém guards/RLS posteriores. Não faz bypass de RBAC.
- `src/shell/ModuleLayout.tsx` e `AdminTenantLayout.tsx` publicados ainda podem montar outro `<aside>`, `<main>` e `<footer>`. Este patch de menu **não afirma resolver** esse outro problema estrutural na worktree dirty. Há um scanner read-only para localizar riscos.

## Arquivos entregues

```
src/components/navigation/master-navigation-model.ts
src/components/navigation/MasterContextSidebar.tsx
src/shell/ModuleLayout.tsx                            # PATCH OPCIONAL de conteúdo
src/modules/admin-tenant/layout/AdminTenantLayout.tsx # PATCH OPCIONAL de conteúdo
tests/master-sidebar.model.test.ts
scripts/apply_master_sidebar.py
scripts/scan_route_ownership.mjs
scripts/verify-master-navigation.mjs
```

O componente lê `cellRegistry.getAll()` em tempo de execução, sem segunda lista hardcoded. Se existirem 26 contratos, o Master vê os 26 nomes — inclusive células com status `disabled`, `collision` ou `unrouted` (neste caso, sem link ativo, não escondidas). Módulos tenant sem tenant selecionado aparecem **bloqueados**, não autorizados automaticamente.

- **Home Master** `/dashboard/admin-master`: sidebar global com todas as células registradas, Home Master e Central 24H.
- **Dentro da célula** `/dashboard/rh/*` ou `/dashboard/recrutamento/*`: uma sidebar com os recursos daquela célula; botão `Voltar à Home Master`.
- **Início da célula**: retorna a sua própria `homeRoute`.
- **CRUD**: páginas com `/:id` continuam sendo acessadas a partir de listagem/detalhe, sem links inválidos na sidebar.
- **Segurança**: a sidebar pergunta ao `dispatcherMaster.isAuthorized()` antes de entrar num módulo; as páginas existentes seguem sob route guard e RLS, que precisam ser confirmados. A API do Dispatcher não substitui guards no backend.
- **Não-master**: catálogo continua filtrado por escopo, tenant e gate da rota. Nenhum Master bypass foi adicionado.

## Instalação no Windows

Extraia a pasta para `C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4`.

1. Verificação sem escrita:

```powershell
python C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4\scripts\apply_master_sidebar.py C:\NewWaveProjetos\jrtercerisados
node C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4\scripts\scan_route_ownership.mjs C:\NewWaveProjetos\jrtercerisados
```

2. Para aplicar a correção da sidebar, **apenas depois de conferir os diffs locais**:

```powershell
python C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4\scripts\apply_master_sidebar.py C:\NewWaveProjetos\jrtercerisados --apply
```

A sidebar atualmente está `dirty` conforme o relatório do Kilo. O script deve **bloquear** neste ponto para não perder trabalho concorrente. Se você decidir substituir **apenas a implementação dessa sidebar**, o script exige consentimento explícito:

```powershell
python C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4\scripts\apply_master_sidebar.py C:\NewWaveProjetos\jrtercerisados --apply --replace-dirty-sidebar
```

Nesse caso, o script **faz backup obrigatório** do arquivo anterior em `.check-bouler-backup/`, escreve os dois componentes novos e o teste de regressão e troca somente `src/modules/admin/AdminSidebar/index.tsx` por um adapter. Não mexe no `AdminShell`, `App.tsx`, DispatcherMaster, rotas RH, Supabase ou footer.

### Correção opcional das **segundas shells**

Se o scan confirmar que `ModuleLayout` e `AdminTenantLayout` estão dentro do `AdminShell` e ainda montam `<aside>/<main>/<footer>`, pode ativar a correção desses **dois** arquivos junto da sidebar:

```powershell
python C:\Temp\CHECK_BOULER_MASTER_SIDEBAR_V4\scripts\apply_master_sidebar.py C:\NewWaveProjetos\jrtercerisados --apply --replace-dirty-sidebar --repair-shells
```

O script bloqueia automaticamente shells dirty. Em caso de revisão explícita e backup, existe `--replace-dirty-shells`, mas **não recomendo utilizá-lo sem comparar os diffs**. As duas substituições são wrappers de conteúdo que preservam assinatura; a única sidebar/header/main/footer passa a vir de `AdminShell`. O footer institucional do `AdminShell` **não** é alterado. Esta correção é separada porque o seu worktree pode já conter uma solução equivalente do Codex.
 **Não executar esse último comando sem rever as alterações que sairão da sidebar de Kilo.**

3. No repositório local, validar:

```powershell
npx tsc --noEmit
npx vitest run tests/master-sidebar.model.test.ts --pool=forks --maxWorkers=1
npx eslint src/components/navigation/master-navigation-model.ts src/components/navigation/MasterContextSidebar.tsx
npm run build
```

4. Homologação no navegador autenticado (não realizada neste ambiente):

- `/dashboard/admin-master`: contar 26 células no sidebar sem sumiços; conferir o estado de cada célula.
- `/dashboard/recrutamento`: sidebar **apenas Recrutamento**, dashboard do Codex preservado.
- `/dashboard/recrutamento/vagas/novo`: mesma sidebar, sem segunda.
- `Voltar à Home Master`: restaura as 26 células.
- `/dashboard/rh`: dashboard RH próprio; `/dashboard/financeiro` idem, respeitando as rotas realmente registradas.
- Verificar que cada clique passa pelo Dispatcher, guarda de rota e RLS; uma tela visível não equivale a uma operação liberada.
- Contar `<main>`, sidebar global, header e footer no DOM. O scanner pode apontar possíveis shells aninhados, mas não prova duplicação sem browser. Verificar desktop/mobile, dark/light, deep-link, refresh e tenant.

## Limitação fundamental

O repositório GitHub representa o código remoto **e não contém as alterações não commitadas do Kilo** descritas pelo usuário. Não tenho acesso a `C:\NewWaveProjetos\jrtercerisados`. O patch está pronto para integração **local**, mas não foi integrado ou compilado na worktree Windows. Os testes executados neste ambiente cobrem o modelo puro e a sintaxe do TS/TSX, não as autorizações reais nem o browser.

Não excluir legacy, criar mocks, alterar Auth/RLS/migrations, modificar DispatcherMaster/P0.2, footer ou publicar commits automaticamente.
