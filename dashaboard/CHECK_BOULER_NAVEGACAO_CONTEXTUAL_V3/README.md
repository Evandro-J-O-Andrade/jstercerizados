# CHECK BOULER 24H — Navegação contextual V3

**Projeto:** J&S Empregos LTDA · React 19 + TSX + Tailwind + CellRegistry

## O que é esta entrega

Esta entrega é **código real** para a camada de navegação. Não é um protótipo com dados falsos nem uma nova aplicação. Foi adaptada a partir das estruturas `AppShell`, `AdminShell`, `AdminSidebar`, `ModuleRouter`, `CellRegistry` e `AccountContext` consultadas no `origin/main` do repositório GitHub `Evandro-J-O-Andrade/jstercerizados` em 09/11/2026.

Ela faz:

- **Home Master** em `/dashboard/admin-master`: continua sendo a home de governança do Admin Master, com menu global.
- **Central de módulos** em `/dashboard/modulos`: nova página de seleção por cards, pesquisa e grupos, somente para módulos autorizados.
- **Central 24H** em `/dashboard/global`: continua separada, preservando P0.1.
- Ao entrar em `/dashboard/recrutamento`, `/dashboard/rh`, `/dashboard/financeiro` etc., o **mesmo** sidebar do AppShell troca para o menu do domínio; o global desaparece da lista.
- **Início do módulo** volta sempre para a home proprietária, não para o dashboard global.
- **Todos os módulos** abre `/dashboard/modulos` sem passar pelo `DashboardHome`/DispatcherMaster, que faz redirecionamento pós-login em `/dashboard`.
- Rotas internas de CRUD, `novo` e `:id/editar` continuam no domínio da célula. A sidebar não cria uma URL genérica para editar sem ID.
- O módulo ativo e seu título são resolvidos **da URL e do CellRegistry**, sem um segundo registry ou menus de 26 módulos hardcoded.
- `AdminModuleLayout`, `ModuleLayout` e `AdminTenantLayout` tornam-se **fronteiras de conteúdo**, sem renderizar segundo sidebar/header/main/footer. Este é o conserto estrutural para as células Financeiro, Fiscal, Estoque, Admin Tenant etc., que atualmente montam shells aninhados dentro de `AdminShell`.
- Módulos não autorizados são ocultos na UI e duas células com o mesmo `homeRoute` são excluídas da navegação; a autorização de fato continua em guards e RLS.

**Importante:** não converte automaticamente as páginas financeiras/RH/CRM que ainda estejam em código legacy. O shell fica contextual, e a migração das páginas operacionais é uma etapa distinta. Nenhum dado do Supabase foi alterado.

## Os arquivos de código

```text
src/
  components/navigation/
    cell-navigation-model.ts             # regras puras e unicidade das rotas
    cell-navigation-model.test.ts        # testes de invariantes
    useCellNavigation.ts                  # CellRegistry + AccountContext + URL
    ContextualCellSidebar.tsx            # sidebar única global/local
    ModuleHubPage.tsx                    # escolha de ambientes por cards
  modules/admin/AdminSidebar/index.tsx  # adapter para o shell canônico
  shell/AdminModuleLayout.tsx            # remove segunda sidebar interna
  shell/ModuleLayout.tsx                 # remove shell duplicado nas células
  modules/admin-tenant/layout/
    AdminTenantLayout.tsx                # remove shell duplicado do Admin Tenant
```

O script também faz **edições mínimas**, preservando o restante dos arquivos:

- `src/App.tsx`: adiciona a rota `/dashboard/modulos` sob o Auth/ProtectedRoute existente.
- `src/shell/AdminShell.tsx`: ajusta somente o título contextual do `AdminHeader`, mantendo o footer **literalmente inalterado**.

## Instalação segura no Windows

Extraia o ZIP, por exemplo para:

`C:\Temp\CHECK_BOULER_NAVEGACAO_CONTEXTUAL_V3`

Primeiro execute uma simulação, sem modificar arquivos:

```powershell
python C:\Temp\CHECK_BOULER_NAVEGACAO_CONTEXTUAL_V3\scripts\install_navigation.py C:\NewWaveProjetos\jrtercerisados
```

Se nenhuma alteração concorrente ou divergência de baseline for encontrada, aplique localmente:

```powershell
python C:\Temp\CHECK_BOULER_NAVEGACAO_CONTEXTUAL_V3\scripts\install_navigation.py C:\NewWaveProjetos\jrtercerisados --apply
```

O script **abortará sem modificar nada** se encontrar App/Shell/AdminSidebar já alterados, novas páginas existentes, ou falha ao localizar as âncoras. Isso é proposital: já há mudanças concorrentes do Codex no worktree. Se bloquear, mescle o código de forma seletiva após rever os diffs. Não use `git reset --hard`, `git checkout .`, `git clean` nem sobrescreva arquivos concorrentes.

Se aplicar, gera backups em `.check-bouler-backup/<timestamp>/` antes de substituir os arquivos existentes.

## Validação obrigatória no projeto real

```powershell
npx tsc --noEmit
npx eslint src/components/navigation src/modules/admin/AdminSidebar/index.tsx src/shell/AdminModuleLayout.tsx src/shell/AdminShell.tsx
npx vitest run src/components/navigation/cell-navigation-model.test.ts --pool=forks --maxWorkers=1
npm run build
```

No navegador com sessão autorizada, verificar:

1. `/dashboard/admin-master` → Home Master, **sidebar global**.
2. `/dashboard/modulos` → cards dos módulos autorizados; clicáveis.
3. Selecionar **Recrutamento** → `/dashboard/recrutamento` com **sidebar local** e dashboard existente preservado.
4. Abrir `/dashboard/recrutamento/vagas`, `/vagas/novo` e `/:id/editar` → mesma sidebar local, sem sidebar duplicada.
5. Voltar por **Todos os módulos** → `/dashboard/modulos`, sem redirecionar involuntariamente.
6. Entrar em **RH** e **Financeiro** → menu próprio, nunca o menu de Recrutamento.
7. Refresh nas subrotas, mobile drawer, dark/light, um único `main`, footer institucional preservado. Testar especialmente Financeiro, Fiscal, Estoque e Admin Tenant, que tinham shells próprios aninhados.
8. Mudar tenant e permissões → o menu deve refletir o novo contexto. Não usar frontend como prova de segurança.
9. Verificar os testes de layout antigos: alguns asserts sobre a sidebar anterior precisam de revisão legítima, nunca desativação silenciosa.

## O que foi realmente testado aqui

- Sintaxe TypeScript/TSX dos arquivos do pacote: verificada usando TypeScript `transpileModule`.
- Lógica pura de propriedade/isolamento: 7 verificações locais passaram em harness Node com stubs para o mapa de permissões.
- **Não** rodei `npm run build`, testes de integração, Playwright ou Supabase real porque o worktree `C:\NewWaveProjetos\jrtercerisados` não está disponível neste ambiente.
- Também **não** visualizei o seu `http://localhost:3000/dashboard/recrutamento` — examinei a implementação disponível no GitHub, onde o dashboard usa KPIs reais e pipeline/funil.

## Governança

- Sem migration, RLS, Auth, SMTP, Supabase remoto, commit, push, merge ou deploy.
- P0.1/P0.2/OBS-01/P0-B preservados, DispatcherMaster intacto.
- Footer e identidade `J&S Empregos LTDA` intactos.
- Sem mocks novos, sem páginas de `legacy/portal` reativadas.
- O pacote **não altera o Dashboard de Recrutamento**, apenas sua navegação circundante.

## Arquitetura de navegação

```text
AdminShell ÚNICO
├── AdminHeader contextual
├── Sidebar ÚNICA
│   ├── Home Master / Central de módulos → menu GLOBAL
│   └── /dashboard/<célula>/* → menu LOCAL da célula
│        ├── Início do módulo → /dashboard/<célula>
│        ├── Gestão e processos → rotas estáticas autorizadas
│        ├── Ações autorizadas → novo/criar quando declaradas
│        └── Todos os módulos → /dashboard/modulos
├── main ÚNICO → dashboard/listagem/criação/detalhe/edição da célula
└── footer institucional EXISTENTE (não modificado)
```

**Atenção:** este é o primeiro passo funcional da experiência que você definiu. O refinamento visual de cada uma das 26 células e a reconstrução de seus CRUDs permanecem projetos independentes, respeitando os contratos e dados reais de cada domínio.
