# P0 — Matriz de Decisão do Contrato de Roteamento do Portal

**Status:** ✅ ANÁLISE CONCLUÍDA (somente leitura — **nenhuma alteração de código**)
**Predecessor:** A8.3 (`docs/A8.3-pages-dashboard-mapping.md`)
**Escopo:** contrato de roteamento entre `App.tsx`, `ModuleRegistry.ts` e `ModuleDashboardPage.tsx`
**Congelado:** site público, Supabase, `MetroTiles`, os três footers

> Este documento **não implementa** nada. Ele entrega a matriz de decisão
> pedida, com as alternativas e suas consequências, para que a decisão
> "corrigir o ternário × eliminar o mapa × consolidar" seja tomada com
> evidência, não com suposição.

---

## 1. As duas fontes de verdade

```text
FONTE A — PORTAL_MODULES[].features        ✅ ATIVA   (App.tsx:300, 325)
   └──> createModuleDashboardPage(id)      → ModuleDashboardPage
                                            → grid de cartões de features

FONTE B — MODULE_PAGE_MAP + PAGE_COMPONENTS ❌ INERTE (App.tsx:302, 327 inalcançável)
   └──> PAGE_COMPONENTS[...]               → página real do módulo

FONTE C — <Route> explícitos em App.tsx    ✅ ATIVA   (49 rotas /dashboard/*)
   └──> <Componente />                     → página real
```

**Não são duas fontes concorrentes em conflito ativo.** A fonte B está
completamente inerte. O conflito é entre a **fonte A** (ativa, genérica) e a
**fonte C** (ativa, específica) — e elas se sobrepõem em 9 rotas.

---

## 2. Matriz dos 28 módulos

Legenda de destino recomendado:

- **FERRAMENTA** — o módulo deve abrir a página real direto
- **LAUNCHER** — o módulo deve abrir um hub de cards (padrão Windows/Metro, coerente com a arquitetura de Portal já decidida)
- **COMING_SOON** — realmente não implementado
- **DECISÃO PENDENTE** — há mais de uma página candidata em jogo

| #   | Módulo               | Scope  | Rota do módulo                          | Feats              | `MODULE_PAGE_MAP`        | Renderizado **hoje**     | `<Route>` explícito | Destino              |
| --- | -------------------- | ------ | --------------------------------------- | ------------------ | ------------------------ | ------------------------ | ------------------- | -------------------- |
| 1   | `inicio`             | tenant | `/dashboard`                            | 0                  | `DashboardHome`          | `DashboardHome` ✅       | `path: ''`          | FERRAMENTA           |
| 2   | `admin-master`       | global | `/dashboard/global`                     | 1                  | `GlobalDashboardPage`    | `GlobalDashboardPage` ✅ | `global`            | FERRAMENTA           |
| 3   | `tenants`            | global | `/dashboard/tenants`                    | 2                  | `TenantsPage`            | grid de cards ❌         | —                   | FERRAMENTA           |
| 4   | `onboarding`         | global | `/dashboard/onboarding`                 | 2                  | `OnboardingPage`         | grid de cards ❌         | —                   | FERRAMENTA           |
| 5   | `assinaturas`        | global | `/dashboard/assinaturas`                | 2                  | `AssinaturasPage` (stub) | grid de cards ❌         | —                   | COMING_SOON          |
| 6   | `gestao-saas`        | global | `/dashboard/gestao-saas`                | 4                  | `GestaoSaaSPage`         | grid de cards ❌         | —                   | FERRAMENTA           |
| 7   | `usuarios`           | global | `/dashboard/usuarios`                   | 2 (rota duplicada) | `Usuarios`               | grid de cards ❌         | —                   | FERRAMENTA           |
| 8   | `roles-permissoes`   | global | `/dashboard/roles-permissoes`           | 2 (rota duplicada) | `RolesPermissoesPage`    | grid de cards ❌         | —                   | FERRAMENTA           |
| 9   | `auditoria`          | global | `/dashboard/auditoria`                  | 3                  | `AuditoriaPage`          | grid de cards ❌         | `rbac-auditoria` só | FERRAMENTA           |
| 10  | `contratos`          | tenant | `/dashboard/contratos`                  | 2                  | ❌ sem entrada           | grid de cards ❌         | —                   | COMING_SOON          |
| 11  | `rh`                 | tenant | `/dashboard/rh`                         | 5                  | `RhPage` (**órfã**)      | grid de cards ❌         | —                   | **DECISÃO PENDENTE** |
| 12  | `recrutamento`       | tenant | `/dashboard/recrutamento`               | 14                 | `Vagas` (inoperante)     | grid de cards ❌         | —                   | LAUNCHER             |
| 13  | `crm`                | tenant | `/dashboard/crm`                        | 12                 | `ClientesPage`           | grid de cards ❌         | —                   | **DECISÃO PENDENTE** |
| 14  | `financeiro`         | tenant | `/dashboard/financeiro`                 | 6                  | `FinanceiroPage`         | grid de cards ❌         | —                   | LAUNCHER             |
| 15  | `faturamento`        | tenant | `/dashboard/faturamento`                | 5                  | `FaturamentoPage`        | `FaturamentoPage` ✅     | `faturamento`       | FERRAMENTA           |
| 16  | `fiscal`             | tenant | `/dashboard/fiscal`                     | 4                  | `FiscalPage`             | `FiscalPage` ✅          | `fiscal`            | FERRAMENTA           |
| 17  | `contabilidade`      | tenant | `/dashboard/contabilidade`              | 6                  | `ContabilidadePage`      | `ContabilidadePage` ✅   | `contabilidade`     | FERRAMENTA           |
| 18  | `estoque`            | tenant | `/dashboard/estoque`                    | 3                  | `Estoque`                | **ambíguo** ⚠            | `estoque`           | FERRAMENTA           |
| 19  | `servicos`           | tenant | `/dashboard/servicos`                   | 3                  | `Servicos`               | **ambíguo** ⚠            | `servicos`          | FERRAMENTA           |
| 20  | `almoxarifado`       | tenant | `/dashboard/almoxarifado`               | 7                  | `Almoxarifado`           | **ambíguo** ⚠            | `almoxarifado`      | FERRAMENTA           |
| 21  | `suporte`            | tenant | `/dashboard/suporte`                    | 5                  | `Suporte`                | **ambíguo** ⚠            | `suporte`           | FERRAMENTA           |
| 22  | `relatorios`         | tenant | `/dashboard/relatorios`                 | 1                  | `Relatorios`             | `Relatorios` ✅          | `relatorios`        | FERRAMENTA           |
| 23  | `ia`                 | tenant | `/dashboard/ia`                         | 4                  | `IaPage`                 | grid de cards ❌         | —                   | COMING_SOON          |
| 24  | `integracoes`        | global | `/dashboard/integracoes`                | 4                  | `IntegracoesPage`        | grid de cards ❌         | —                   | COMING_SOON          |
| 25  | `configuracoes-saas` | global | `/dashboard/configuracoes`              | 2                  | `Configuracoes`          | grid de cards ❌         | —                   | **DECISÃO PENDENTE** |
| 26  | `preferencias`       | tenant | `/dashboard/configuracoes/preferencias` | 1                  | `Configuracoes`          | grid de cards ❌         | —                   | **DECISÃO PENDENTE** |
| 27  | `minha-conta`        | tenant | `/dashboard/configuracoes/conta`        | 1                  | `Configuracoes`          | grid de cards ❌         | —                   | **DECISÃO PENDENTE** |
| 28  | `seguranca-conta`    | tenant | `/dashboard/configuracoes/seguranca`    | 2                  | `SegurancaPage`          | grid de cards ❌         | `.../sessoes` só    | FERRAMENTA           |

**Resumo:** 9 abrem a página certa · 4 são ambíguos · 15 abrem só um grid de
cartões, sendo 9 deles com página real já escrita.

### 2.1 Por que LAUNCHER é uma resposta legítima

O padrão _Portal → Systems_ já decidido prevê **Card launcher** por sistema.
Logo, `recrutamento` (14 features) e `financeiro` (6 features) **não são
defeito** — são o desenho correto. O defeito é:

1. módulos com **página real pronta** que não a alcançam;
2. launchers cujos cards apontam para **rotas inexistentes** (§3);
3. um **segundo mapa morto** que promete a página real sem entregá-la.

---

## 3. Cobertura das 105 features — 64 sem rota

```text
Total de features em PORTAL_MODULES ............ 105
Com <Route> explícito em App.tsx ..............  41
Sem rota → caem no catch-all ComingSoonPage ....  64   (61%)
```

A cobertura é concentrada em recrutamento (13/14) e financeiro (5/6). Tudo o
mais é lacuna.

### 3.1 Features órfãs por módulo

| Módulo                                                                                | Sem rota               |
| ------------------------------------------------------------------------------------- | ---------------------- |
| `recrutamento`                                                                        | 1 de 14 ✅ melhor caso |
| `financeiro`                                                                          | 1 de 6                 |
| `crm`                                                                                 | 8 de 12                |
| `faturamento`                                                                         | 3 de 5                 |
| `estoque`                                                                             | 2 de 3                 |
| `servicos`                                                                            | 1 de 3                 |
| `relatorios`                                                                          | 0 de 1 ✅              |
| `fiscal`                                                                              | 3 de 4                 |
| `contabilidade`                                                                       | 5 de 6                 |
| `almoxarifado`                                                                        | 5 de 7                 |
| `suporte`                                                                             | 4 de 5                 |
| `ia`, `integracoes`, `contratos`                                                      | 100%                   |
| `tenants`, `onboarding`, `assinaturas`, `gestao-saas`, `usuarios`, `roles-permissoes` | 100%                   |
| `configuracoes-saas`, `minha-conta`                                                   | 100%                   |

**Consequência direta:** o card "Dashboard RH" em `/dashboard/rh` navega para
`/dashboard/funcionarios` (existe ✅). Mas o card "Fechamento" em
`/dashboard/contabilidade` navega para `/dashboard/contabilidade/fechamento`
→ **catch-all → "Em breve"**. O usuário vê um menu completo e encontra telas
vazias.

---

## 4. Conflitos de contrato no registry

| #   | Conflito                                                                                                                                                      | Evidência                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| C1  | `MODULE_PAGE_MAP` aponta para `RhPage`, que `App.tsx` **não importa**                                                                                         | `RhPage.tsx` órfã                          |
| C2  | `contratos` **não tem** entrada em `MODULE_PAGE_MAP`, mas tem página (`ContratosPage`)                                                                        | assimetria                                 |
| C3  | `preferencias` (módulo) aponta como única feature para `/dashboard/notificacoes`                                                                              | módulo "Preferências" entrega Notificações |
| C4  | `rh` tem feature `clientes` → `/dashboard/clientes`, mas a página de clientes (`ClientesPage`) pertence a `crm`                                               | Domains em conflito                        |
| C5  | `crm` tem feature `servicos-gestao` → `/dashboard/servicos`, que também é a rota do módulo `servicos`                                                         | rota reivindicada por 2 módulos            |
| C6  | `estoque` tem feature → `/dashboard/relatorios/almoxarifado`; `servicos` → `/dashboard/relatorios/estoque`; `almoxarifado` → `/dashboard/relatorios/servicos` | relatórios cruzados entre módulos          |
| C7  | `usuarios` tem 2 features com a **mesma** rota `/dashboard/usuarios`                                                                                          | card duplicado no launcher                 |
| C8  | `roles-permissoes` tem 2 features com a **mesma** rota                                                                                                        | card duplicado no launcher                 |
| C9  | `MODULE_PERMISSION_MAP` com `''` em 6 chaves: `inicio`, `servicos`, `ia`, `preferencias`, `minha-conta`, `seguranca-conta`                                    | regra §2 proíbe fallback vazio             |
| C10 | `MODULE_PERMISSION_MAP` tem `empresas` e `sessoes`, que **não são** módulos                                                                                   | chaves órfãs                               |
| C11 | `Configuracoes` é a página de **3 módulos** + `SegurancaPage` para o 4º                                                                                       | 1 página, 4 módulos                        |
| C12 | `contratos` é o **único** módulo sem entrada em `MODULE_PAGE_MAP` — logo não recebe **nenhuma** rota gerada, nem launcher                                     | `App.tsx:289` exige `MODULE_PAGE_MAP[id]`  |
| C13 | `crm` e `rh` declaram features de domínio do outro                                                                                                            | Divergência registry ↔ domínio real        |

---

## 5. Resposta à questão: "rota ausente ≠ arquivo inútil"

Verificado por varredura de todos os imports internos de
`src/pages/dashboard/`:

```text
ApplicationDetailPage.test  ->  ApplicationDetailPage
AssinaturasPage             ->  UnderConstruction
CatalogoPage                ->  UnderConstruction
Financeiro                  ->  UnderConstruction
MonitoramentoPage           ->  UnderConstruction
```

**Nenhuma outra página do dashboard importa outra página do dashboard.** E
fora de `pages/dashboard/`, o único consumidor é
`hooks/useGlobalDashboardStats.ts` → `global-dashboard-model.ts`.

Conclusão — os 15 arquivos sem rota **não estão sendo usados como componente
por outra página**. São páginas cujas rotas não existem:

| Tipo                         | Qtde | Significado                                                                                                                                   |
| ---------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Página real, só falta a rota | 8    | `Usuarios`, `RolesPermissoesPage`, `AuditoriaPage`, `TenantsPage`, `OnboardingPage`, `GestaoSaaSPage`, `GlobalDashboardPage`*, `ClientesPage` |
| Stub sem dados               | 4    | `AssinaturasPage`, `CatalogoPage`, `MonitoramentoPage`, `IntegracoesPage`                                                                     |
| Dashboard sem dono definido  | 3    | `GestaoPage`, `VisaoGeral`, `DashboardRh`                                                                                                     |

\* `GlobalDashboardPage` tem rota (`/dashboard/global`) e renderiza — foi listado
por belongs ao grupo `admin-master`, cuja página _de índice_ está ausente.

**Nenhum arquivo deve ser apagado com base neste achado.** A8.3 já classificou
os 10 órfãos verdadeiros (nenhum import); este quadro trata dos 15 sem rota,
que são um problema diferente.

---

## 6. As alternativas de decisão

Nenhuma executada. Todas com custo e risco.

### Opção 1 — Corrigir o ternário (priorizar `MODULE_PAGE_MAP`)

```tsx
PAGE_COMPONENTS[MODULE_PAGE_MAP[module.id]]
  ? React.createElement(...)
  : <ComingSoonPage />
```

|            |                                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| ✅ Resolve | a fonte B volta a valer; `RhPage` volta a ser alcançável                               |
| ❌ Quebra  | o desenho _launcher_ de `recrutamento`/`financeiro` — 14 e 6 cards viram uma página só |
| ❌ Quebra  | `MODULE_PAGE_MAP` é inerte e omite `contratos` (C12)                                   |
| ❌ Exige   | 28 decisões de módulo→página antes de codar                                            |
| Veredito   | **descartada** — conflita com a arquitetura Portal→Systems já decidida                 |

### Opção 2 — Remover `MODULE_PAGE_MAP` e `PAGE_COMPONENTS`

|            |                                                                       |
| ---------- | --------------------------------------------------------------------- |
| ✅ Resolve | elimina a segunda fonte de verdade; `PORTAL_MODULES` fica único dono  |
| ✅ Resolve | `RhPage` (C1), `contratos` (C2) deixam de ser promessas não cumpridas |
| ❌ Custo   | 30 entradas de mapa + ~70 linhas de `PAGE_COMPONENTS` removidas       |
| ❌ Risco   | preciso confirmar que nada consome esses mapas fora de `App.tsx`      |
| Veredito   | **candidata** — mas só **depois** de decidir o destino das 15 páginas |

### Opção 3 — Declarar a fonte C como o roteador real (recomendada)

```text
PORTAL_MODULES[].features  →  METADADOS de navegação (sidebar, permissões, ordem)
<Route> explícitos          →  ÚNICO roteador
MODULE_PAGE_MAP            →  removido
PAGE_COMPONENTS            →  removido
```

|          |                                                                                 |
| -------- | ------------------------------------------------------------------------------- |
| ✅       | reflete a realidade: 49 rotas reais já existem e funcionam                      |
| ✅       | `ModuleSidebar` continua funcionando — ele lê `features`, não `MODULE_PAGE_MAP` |
| ✅       | o `launcher` (fonte A) é preservado para quem deve ser launcher                 |
| ❌ Exige | corrigir as **64 features sem rota** — o trabalho real                          |
| ❌ Exige | resolver as 4 rotas ambíguas                                                    |
| Veredito | **recomendada**                                                                 |

### Opção 4 — Híbrido: registry como roteador, `<Route>` como exclusão

|          |                                                           |
| -------- | --------------------------------------------------------- |
| ✅       | elimina ambiguidade sem reescrever 49 rotas               |
| ❌       | exige um segundo mapa (o de exclusão) — recria o problema |
| Veredito | **descartada**                                            |

---

## 7. Sequência sugerida (após autorização — não autorizada)

```text
D1  decisão do usuário: Opção 2 ou Opção 3
D2  verificar em runtime as 4 rotas ambíguas (estoque/almoxarifado/servicos/suporte)
D3  decidir destino de RhPage vs DashboardRh  (módulo rh)
D4  decidir destino de ClientesPage           (módulo crm)
D5  desdobrar Configuracoes em 3-4 páginas    (C11)
D6  decidir as 64 features sem rota: criar rota | ComingSoon | remover card
D7  reconciliar MODULE_PERMISSION_MAP          (C9, C10)
D8  só então: A8.4 hooks → … → A8.9 → A9
```

**D6 é o item de maior volume** e o único que muda o que o usuário vê.
D1–D5 e D7 são decisões de contrato, baratas e de baixo risco.

---

## 8. Conformidade

```text
Arquivos de código alterados .... 0
Arquivos movidos ................. 0
Supabase tocado .................. NÃO
Site público tocado ............. NÃO
MetroTiles tocado ................ NÃO
Footer.tsx / PortalFooter / PortalShell  NÃO
Testes executados ................ NÃO
Commit / Push / Deploy .......... NÃO
```

Documento único criado: `docs/P1-ROUTING-CONTRACT-DECISION-MATRIX.md`
