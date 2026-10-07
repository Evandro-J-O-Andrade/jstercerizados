# CORE/SHELL CONTRACT — J&S EMPREGOS LTDA

Data: 2026-10-06  
Branch: main @ 1f75702  
Escopo: contrato arquitetural entre Core, Shell e Células.  
Modo: somente leitura. Nenhum arquivo alterado.

---

## 1. PROPÓSITO

Estabelecer a fronteira definitiva entre:
- **Core**: infraestrutura transversal mínima
- **Shell**: chrome/container do SaaS
- **Células**: módulos de negócio autônomos

Este contrato complementa `CELL-CONTRACT.md` e define o que cada camada pode e não pode fazer.

---

## 2. CAMADAS

### 2.1 Core
**Responsabilidade:** infraestrutura transversal, sem regra de negócio.

```
Core
├── auth/
│   └── AuthContext, PermissionGuard, AuthRoute, ProtectedRoute
├── identity/
│   └── people, tenant_memberships, role_assignments
├── tenant/
│   └── TenantContext, AccountContext
├── permissions/
│   └── permission.repository, role.repository, MODULE_PERMISSION_MAP
├── notifications/
│   └── NotificationContext, toast
├── upload/
│   └── MediaUploader, media-assets.repository, useMediaUpload
├── audit/
│   └── audit.repository, logs
├── navigation/
│   └── useNavigation, NavigationItem, navigation.repository
├── layout/
│   └── ErrorBoundary, ContentBoundary, RouteLoadingFallback
└── primitives/
    └── UI base (Button, Input, Card, etc.)
```

**Core NÃO pode conter:**
- regras de Empresas
- regras de Vagas
- regras de Candidatos
- regras de Parceiros
- regras de Fornecedores
- regras de Serviços
- regras de Recrutamento
- regras de RH
- regras de Financeiro
- regras de Estoque
- regras de Fiscal
- regras de Operações
- regras de POS

### 2.2 Shell
**Responsabilidade:** chrome do SaaS, viewport, contexto, navegação global.

```
Shell
├── PortalShell
│   ├── Auth boundary
│   ├── Tenant context
│   ├── Permission context
│   ├── Navigation host
│   ├── Header
│   ├── Viewport
│   ├── Error boundary
│   └── Module outlet
├── PortalSidebar
├── PortalHeader
├── ModuleWorkspace
└── ModuleRouter
```

**Shell NÃO pode conter:**
- regras de negócio de módulo
- CRUD específico
- formulários de negócio
- mídia específica de célula
- dados de entidade
- footer público

### 2.3 Células
**Responsabilidade:** regras de negócio, UI operacional, dados.

```
Cell
├── dashboard/
├── pages/
├── components/
├── forms/
├── hooks/
├── repositories/
├── services/
├── types/
├── validation/
├── permissions/
├── routes/
├── navigation/
├── media/
└── tests/
```

**Célula NÃO pode:**
- importar componentes internos de outra célula
- importar repositories de outra célula
- importar services de outra célula
- importar types de domínio de outra célula
- acessar Supabase diretamente
- importar PublicLayout/PublicFooter/PublicNavbar
- acessar regras de negócio do Core

---

## 3. DEPENDÊNCIAS ATUAIS

### 3.1 PortalShell
**Arquivo:** `src/components/portal/PortalShell.tsx`

**Imports:**
- `PortalSidebar` — ✅ Shell
- `PortalHeader` — ✅ Shell
- `AccountProvider` — ✅ Core
- `ModuleProvider` — ✅ Core
- `COMPANY`, `NEW_WAVE_URL` — ✅ Config

**Problema identificado:**
- Renderiza `<footer>` próprio com copyright e link New Wave
- Esse footer é institucional, não do SaaS
- Representa vazamento de Public UI para o Shell

**Blast radius:** Afeta todas as rotas `/dashboard/*`

### 3.2 PublicLayout
**Arquivo:** `src/components/layout/PublicLayout.tsx`

**Imports:**
- `Navbar` — ✅ Public
- `Footer` — ✅ Public
- `PublicBottomNavigation` — ✅ Public
- `ScrollToTop` — ✅ Public

**Status:** ✅ Limpo. Sem dependências de Core/Shell/Células.

### 3.3 App.tsx — Rotas públicas vs SaaS
**Rotas públicas (`PublicLayout`):**
- `/` — Home
- `/sobre`
- `/servicos`
- `/servicos/:slug`
- `/vagas`
- `/vagas/:slug`
- `/empresas`
- `/parceiros`
- `/fornecedores`
- `/candidatos`
- `/clientes`
- `/processo-seletivo`
- `/trabalhe-conosco`
- `/suporte`
- `/faq`
- `/contato`
- `/privacidade`
- `/termos`
- `/cadastro`
- `/cadastro/candidato`
- `/cadastro/empresa`
- `/login`
- `/entrar/*`
- `/recuperar-senha`
- `/redefinir-senha`
- `/alterar-senha`
- `/onboarding`
- `/primeiro-acesso/*`

**Rotas SaaS (`PortalShell`):**
- `/dashboard/*` — todas as rotas administrativas

**Problema:** Nenhum vazamento público para SaaS ou vice-versa.

---

## 4. VAZAMENTOS IDENTIFICADOS

### 4.1 Footer no PortalShell (P1)
**Arquivo:** `src/components/portal/PortalShell.tsx:59-72`

```tsx
<footer className="border-border/50 bg-background/50 shrink-0 border-t">
  <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-muted-foreground text-xs">
        © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos reservados.
      </p>
      <a href={NEW_WAVE_URL} target="_blank" rel="noreferrer" className="...">
        Desenvolvido por New Wave Sistemas Digital Solutions
      </a>
    </div>
  </div>
</footer>
```

**Problema:** Footer público dentro do Shell do SaaS.

**Impacto:**
- UX confusa: usuário no dashboard veem footer institucional
- Acoplamento: `PortalShell` importa `COMPANY` e `NEW_WAVE_URL`
- Manutenção: alterações no footer público afetam o SaaS

**Solução proposta:** Remover footer do `PortalShell`. O footer público pertence exclusivamente ao `PublicLayout`.

### 4.2 ModuleProvider duplicado (P2)
**Arquivos:**
- `src/App.tsx` — `ModuleProvider` em `/dashboard/*`
- `src/components/portal/PortalShell.tsx` — `ModuleProvider` no Shell

**Problema:** Dois `ModuleProvider` na árvore. O de `App.tsx` é suficiente.

**Solução:** Remover `ModuleProvider` de `PortalShell.tsx`.

### 4.3 CandidatoContainer + PortalShell (P2)
**Arquivo:** `src/App.tsx`

```tsx
<Route path="/candidato/*" element={<CandidatoContainer />} />
```

**Problema:** `CandidatoContainer` é uma célula autônoma, mas está dentro de `App.tsx`, não do `PortalShell`.

**Impacto:** Não há vazamento, mas a navegação do candidato não passa pelo `PortalShell`.

**Solução:** Manter isolado. Candidato é um portal próprio, não um módulo do dashboard.

---

## 5. CONTRATO DE DEPENDÊNCIA

### 5.1 Permitido
```
Core → Shell → Cell
Core → Cell
Shell → Cell
Cell → Core (somente contratos)
```

### 5.2 Proibido
```
Cell → Shell
Cell → PublicLayout
Cell → PublicFooter
Shell → Business module
PublicLayout → Core
PublicLayout → Shell
```

### 5.3 Dependências transversais permitidas
- `MediaAsset` — tipo global de mídia
- `PageTemplate` — tipo global de página
- `NavigationItem` — tipo global de navegação
- `COMPANY` — config global
- `NEW_WAVE_URL` — config global

---

## 6. NÚCLEO / CABEÇA DEFINITIVO

### 6.1 Core (mínimo)
```
src/core/
├── auth/
├── identity/
├── tenant/
├── permissions/
├── notifications/
├── upload/
├── audit/
├── navigation/
└── layout/
```

### 6.2 Shell
```
src/shell/
├── PortalShell.tsx
├── PortalSidebar.tsx
├── PortalHeader.tsx
├── ModuleWorkspace.tsx
├── ModuleRouter.tsx
└── ModuleRegistry.tsx
```

### 6.3 Células
```
src/modules/
├── candidato/
├── recrutamento/
├── suporte/
├── empresas/
├── servicos/
├── parceiros/
├── fornecedores/
├── financeiro/
├── fiscal/
├── estoque/
├── operacoes/
├── pos/
├── rh/
└── ...
```

### 6.4 Public
```
src/public/
├── layout/
│   ├── PublicLayout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── PublicBottomNavigation.tsx
├── pages/
│   ├── Home.tsx
│   ├── Sobre.tsx
│   ├── Servicos.tsx
│   ├── ServicoDetalhe.tsx
│   ├── Vagas.tsx
│   ├── VagaDetalhe.tsx
│   ├── Empresas.tsx
│   ├── Parceiros.tsx
│   ├── Fornecedores.tsx
│   ├── Candidatos.tsx
│   ├── Clientes.tsx
│   ├── ProcessoSeletivo.tsx
│   ├── TrabalheConosco.tsx
│   ├── Suporte.tsx
│   ├── FAQ.tsx
│   ├── Contato.tsx
│   ├── Privacidade.tsx
│   ├── Termos.tsx
│   ├── Cadastro.tsx
│   ├── Login.tsx
│   └── ...
└── components/
    └── ...
```

---

## 7. CRITÉRIO DE CONCLUSÃO DA FASE C

A Fase C está concluída quando:

1. ✅ `PortalShell` não importa regras de negócio
2. ✅ `PortalShell` não renderiza footer público
3. ✅ `PublicLayout` não importa Core/Shell
4. ✅ Nenhuma célula importa `PublicLayout` ou `PublicFooter`
5. ✅ Dependências são unidirecionais: Core → Shell → Cell
6. ✅ `ModuleProvider` aparece uma única vez na árvore
7. ✅ Candidato permanece isolado (portal próprio)
8. ✅ Blast radius mapeado e validado

---

## 8. BLAST RADIUS — CORE/SHELL

### 8.1 Se `PortalShell` quebrar
- ❌ Todas as rotas `/dashboard/*`
- ❌ `PortalSidebar`
- ❌ `PortalHeader`
- ❌ `ModuleRouter`
- ❌ `ModuleRegistry`
- ⚠️ `App.tsx` — rota pai
- ⚠️ `AccountProvider` — contexto compartilhado

### 8.2 Se `PublicLayout` quebrar
- ❌ Rotas públicas
- ❌ Home, Sobre, Serviços, Vagas, etc.
- ⚠️ `Footer` — componente público
- ⚠️ `Navbar` — componente público

### 8.3 Se `Core` quebrar
- ❌ Tudo (Auth, Tenant, Permissions, Notifications, Upload)

### 8.4 Se uma Célula quebrar
- ✅ Outras células continuam
- ✅ Shell continua
- ✅ Core continua
- ✅ Páginas públicas continuam

---

## 9. PRÓXIMOS PASSOS

1. Remover footer do `PortalShell.tsx` (P1)
2. Remover `ModuleProvider` duplicado de `PortalShell.tsx` (P2)
3. Validar que `App.tsx` é o único ponto de composição
4. Fechar Fase C
5. Iniciar Fase D — Primeira Célula Piloto

---

**Nenhum arquivo alterado.**
