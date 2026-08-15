# Mapa Mestre do Projeto — J&S Terceirizados

**Repositório:** `jstercerizados`  
**Branch:** `main`  
**Commit base:** `b931c3b`  
**Data da auditoria:** 2026-08-15  
**Estado:** Sincronizado com `origin/main` — sem conflitos — build limpo

---

## 1. Fonte de verdade do frontend

### 1.1 Entrypoints confirmados

| Arquivo          | Função                           | Status |
| ---------------- | -------------------------------- | ------ |
| `index.html`     | Entry HTML com `lang="pt-BR"`    | ATIVO  |
| `src/main.tsx`   | Bootstrap React + providers      | ATIVO  |
| `src/App.tsx`    | Router + layout global + widgets | ATIVO  |
| `vite.config.ts` | Build/dev com alias `@` → `src`  | ATIVO  |
| `package.json`   | Scripts e dependências           | ATIVO  |

### 1.2 Cadeia de execução

```
index.html
  └── src/main.tsx
       └── src/App.tsx
            ├── CinematicShowcase (intro)
            └── Routes
                 ├── Home
                 ├── Vagas
                 ├── Servicos
                 ├── Empresas
                 ├── Contato
                 └── ...
```

### 1.3 Alias e resolução

O `vite.config.ts` define:

```ts
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
  },
}
```

Todos os imports do projeto usam `@/` como raiz.

---

## 2. Estrutura de código

### 2.1 Estrutura efetivamente utilizada

A estrutura ativa e comprovadamente utilizada pelo build e pelas rotas é:

```
src/
├── animations/          # Animações reutilizáveis (counter, fade, parallax, scroll)
├── components/
│   ├── auth/            # ProtectedRoute
│   ├── common/          # Container
│   ├── error/           # ErrorBoundary
│   ├── feedback/        # Toast
│   ├── forms/           # Formulários reutilizáveis
│   ├── layout/          # Navbar, Footer, BottomNavigation
│   ├── sections/        # Seções de página (Hero, ServiceCard, etc.)
│   └── ui/              # Componentes UI (Button, Input, Card, etc.)
├── config/              # Configurações centrais
├── constants/           # Tokens e constantes
├── content/             # Conteúdo dinâmico (assets, homeHero)
├── contexts/            # Contexts (Theme, Auth, Intro)
├── hooks/               # Hooks reutilizáveis
├── lib/                 # Integrações (Supabase, n8n, OpenRouter)
├── mock/                # Dados mockados
├── pages/               # Páginas/rotas
├── services/
│   └── mock/            # Serviços mockados
├── styles/              # CSS global
├── types/               # Tipos TypeScript
└── utils/               # Utilitários
```

### 2.2 Estrutura paralela / órfã

**NÃO EXISTE** estrutura paralela em inglês.

O que existe são **arquivos duplicados `.js` e `.ts`** na mesma estrutura PT-BR. Esses arquivos `.js` são **órfãos de build** porque:

1. Nenhum `.tsx` importa explicitamente `.js`
2. O build executa `tsc -b` que usa apenas `.ts`
3. Os imports sem extensão resolvem para `.ts` via Vite/TypeScript

### 2.3 Evidências

| Arquivo                                         | Importado por                  | Executado? | Status    |
| ----------------------------------------------- | ------------------------------ | ---------- | --------- |
| `src/App.tsx`                                   | `src/main.tsx`                 | SIM        | ATIVO     |
| `src/main.tsx`                                  | `index.html`                   | SIM        | ATIVO     |
| `src/pages/Home.tsx`                            | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Sobre.tsx`                           | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Servicos.tsx`                        | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Vagas.tsx`                           | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Empresas.tsx`                        | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Contato.tsx`                         | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Clientes.tsx`                        | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Candidatos.tsx`                      | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/DivulgarVaga.tsx`                    | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/TrabalheConosco.tsx`                 | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/ProcessoSeletivo.tsx`                | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Parceiros.tsx`                       | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Fornecedores.tsx`                    | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Blog.tsx`                            | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Login.tsx`                           | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Cadastro.tsx`                        | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/CadastroEmpresa.tsx`                 | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/CadastroCandidato.tsx`               | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/RecuperarSenha.tsx`                  | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Dashboard.tsx`                       | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/NotFound.tsx`                        | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Privacidade.tsx`                     | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Termos.tsx`                          | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/FAQ.tsx`                             | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/Suporte.tsx`                         | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/VagaDetalhe.tsx`                     | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/pages/ServicoDetalhe.tsx`                  | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/layout/Navbar.tsx`              | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/layout/Footer.tsx`              | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/layout/BottomNavigation.tsx`    | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/ui/AccessibilityWidget.tsx`     | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/ui/ChatWidget.tsx`              | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/ui/HumanChatWidget.tsx`         | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/sections/CinematicShowcase.tsx` | `src/App.tsx`                  | SIM        | ATIVO     |
| `src/components/sections/HeroSplit.tsx`         | `src/pages/Home.tsx`           | SIM        | ATIVO     |
| `src/components/sections/HeroSlider.tsx`        | `src/pages/Home.tsx`           | SIM        | ATIVO     |
| `src/components/sections/ServiceCard.tsx`       | `src/pages/Servicos.tsx`       | SIM        | ATIVO     |
| `src/components/forms/ServiceRequestForm.tsx`   | `src/pages/ServicoDetalhe.tsx` | SIM        | ATIVO     |
| `src/components/forms/JobApplicationForm.tsx`   | `src/pages/VagaDetalhe.tsx`    | SIM        | ATIVO     |
| `src/components/forms/DivulgarVagaForm.tsx`     | `src/pages/DivulgarVaga.tsx`   | SIM        | ATIVO     |
| `src/config/*.ts`                               | Vários                         | SIM        | ATIVO     |
| `src/constants/*.ts`                            | Vários                         | SIM        | ATIVO     |
| `src/content/*.ts`                              | Vários                         | SIM        | ATIVO     |
| `src/hooks/*.ts`                                | Vários                         | SIM        | ATIVO     |
| `src/lib/*.ts`                                  | Vários                         | SIM        | ATIVO     |
| `src/mock/*.ts`                                 | Vários                         | SIM        | ATIVO     |
| `src/services/mock/*.ts`                        | Vários                         | SIM        | ATIVO     |
| `src/types/*.ts`                                | Vários                         | SIM        | ATIVO     |
| `src/utils/*.ts`                                | Vários                         | SIM        | ATIVO     |
| `src/animations/*.ts`                           | Vários                         | SIM        | ATIVO     |
| **`src/**/*.js`**                               | **Nenhum**                     | **NÃO**    | **ÓRFÃO** |

---

## 3. Rotas → Páginas → Componentes

### 3.1 Rotas mapeadas

| Rota                      | Página                  | Componentes principais                                |
| ------------------------- | ----------------------- | ----------------------------------------------------- |
| `/`                       | `Home.tsx`              | HeroSplit, HeroSlider, ServiceCard, CinematicShowcase |
| `/vagas`                  | `Vagas.tsx`             | ServiceCard, SEO, Container                           |
| `/vagas/:slug`            | `VagaDetalhe.tsx`       | JobApplicationForm, SafeImage                         |
| `/empresas`               | `Empresas.tsx`          | ServiceCard, SEO, Container                           |
| `/empresas/divulgar-vaga` | `DivulgarVaga.tsx`      | DivulgarVagaForm                                      |
| `/candidatos`             | `Candidatos.tsx`        | SEO, Container                                        |
| `/servicos`               | `Servicos.tsx`          | ServiceCard, SEO, Container                           |
| `/servicos/:slug`         | `ServicoDetalhe.tsx`    | ServiceRequestForm, SafeImage                         |
| `/clientes`               | `Clientes.tsx`          | ClientCard, SafeImage, SEO                            |
| `/parceiros`              | `Parceiros.tsx`         | SEO, Container                                        |
| `/fornecedores`           | `Fornecedores.tsx`      | SEO, Container                                        |
| `/trabalhe-conosco`       | `TrabalheConosco.tsx`   | Formulário, SEO                                       |
| `/processo-seletivo`      | `ProcessoSeletivo.tsx`  | SEO, Container                                        |
| `/sobre`                  | `Sobre.tsx`             | CinematicShowcase, Timeline                           |
| `/blog`                   | `Blog.tsx`              | SEO, Container                                        |
| `/blog/:slug`             | `Blog.tsx`              | SEO, Container                                        |
| `/suporte`                | `Suporte.tsx`           | SEO, Container                                        |
| `/faq`                    | `FAQ.tsx`               | SEO, Container                                        |
| `/contato`                | `Contato.tsx`           | Formulário, SafeImage, SEO                            |
| `/privacidade`            | `Privacidade.tsx`       | SEO, Container                                        |
| `/termos`                 | `Termos.tsx`            | SEO, Container                                        |
| `/login`                  | `Login.tsx`             | Formulário, SEO                                       |
| `/cadastro`               | `Cadastro.tsx`          | SEO, Container                                        |
| `/cadastro/candidato`     | `CadastroCandidato.tsx` | Formulário                                            |
| `/cadastro/empresa`       | `CadastroEmpresa.tsx`   | Formulário                                            |
| `/recuperar-senha`        | `RecuperarSenha.tsx`    | Formulário                                            |
| `/dashboard`              | `Dashboard.tsx`         | ProtectedRoute                                        |
| `/dashboard/candidato`    | `Dashboard.tsx`         | ProtectedRoute                                        |
| `/dashboard/empresa`      | `Dashboard.tsx`         | ProtectedRoute                                        |
| `*`                       | `NotFound.tsx`          | —                                                     |

### 3.2 Componentes globais

| Componente          | Arquivo                                      | Status |
| ------------------- | -------------------------------------------- | ------ |
| Navbar              | `src/components/layout/Navbar.tsx`           | ATIVO  |
| Footer              | `src/components/layout/Footer.tsx`           | ATIVO  |
| BottomNavigation    | `src/components/layout/BottomNavigation.tsx` | ATIVO  |
| AccessibilityWidget | `src/components/ui/AccessibilityWidget.tsx`  | ATIVO  |
| ChatWidget          | `src/components/ui/ChatWidget.tsx`           | ATIVO  |
| HumanChatWidget     | `src/components/ui/HumanChatWidget.tsx`      | ATIVO  |
| PageLoader          | `src/components/ui/PageLoader.tsx`           | ATIVO  |
| ScrollToTop         | `src/components/ui/ScrollToTop.tsx`          | ATIVO  |
| ErrorBoundary       | `src/components/error/ErrorBoundary.tsx`     | ATIVO  |
| ToastProvider       | `src/components/feedback/Toast.tsx`          | ATIVO  |
| ProtectedRoute      | `src/components/auth/ProtectedRoute.tsx`     | ATIVO  |

---

## 4. Arquivos duplicados `.js` / `.ts`

### 4.1 Lista completa de duplicatas

Existem **63 arquivos `.js`** que são duplicatas exatas ou quase-idênticas dos arquivos `.ts` correspondentes.

**Regra de resolução:** Os arquivos `.ts` são a **fonte de verdade**. Os arquivos `.js` são **órfãos de build** e devem ser removidos em uma operação de limpeza controlada.

### 4.2 Por categoria

| Categoria        | Arquivos `.ts` | Arquivos `.js` duplicados |
| ---------------- | -------------- | ------------------------- |
| animations       | 5              | 5                         |
| components/index | 4              | 4                         |
| config           | 11             | 11                        |
| constants        | 8              | 8                         |
| content          | 2              | 2                         |
| hooks            | 4              | 4                         |
| lib              | 5              | 5                         |
| mock             | 6              | 6                         |
| services/mock    | 10             | 10                        |
| types            | 3              | 3                         |
| utils            | 2              | 2                         |

### 4.3 Ação recomendada

Criar um ticket de limpeza para remover todos os arquivos `.js` duplicados após:

1. Confirmar que nenhum build/processo externo depende deles
2. Executar `npm run build` e `npm run typecheck` com apenas os `.ts`
3. Remover em um commit separado: `chore(src): remove duplicate .js files`

---

## 5. Assets

### 5.1 Estrutura de assets

```
public/
├── fonts/                     # Fontes
├── images/
│   ├── about/                 # SVGs sobre
│   ├── backgrounds/           # Backgrounds SVG/WEBP
│   ├── brand/                 # Logo, favicon, og-image
│   ├── candidates/            # Imagens de candidatos
│   ├── careers/               # SVGs de carreira
│   ├── clientes/              # Logos de clientes (ATIVO)
│   ├── clients/               # Placeholders alpha/beta/gama (ÓRFÃO)
│   ├── company/               # Imagens institucionais
│   ├── construcao/            # Imagens de construção
│   ├── contact/               # SVG de contato (ÓRFÃO)
│   ├── contato/               # WEBP de contato (ATIVO)
│   ├── empresas/              # Imagens de empresas
│   ├── fallbacks/             # Fallbacks por página
│   ├── favicons/              # Favicons
│   ├── gallery/               # Placeholder de galeria
│   ├── hero/                  # Hero images por página
│   │   ├── contato/
│   │   ├── fornecedores/
│   │   ├── home/              # ATIVO — cardheros, banners
│   │   ├── login/
│   │   ├── parceiros/
│   │   ├── servicos/
│   │   ├── sobre/
│   │   ├── suporte/
│   │   └── trabalhe-conosco/
│   ├── icons/                 # Ícones SVG
│   ├── illustrations/         # Ilustrações SVG
│   ├── logos/                 # Logos various
│   ├── partners/              # Logos de parceiros (ATIVO)
│   ├── placeholders/          # Placeholders SVG
│   ├── processo-seletivo/     # Imagens de processo seletivo
│   ├── services/              # Imagens de serviços (ATIVO)
│   ├── suporte/               # Imagens de suporte
│   ├── team/                  # SVGs de equipe
│   └── trabalhe-conosco/      # Imagens de vagas
└── ...
```

### 5.2 Assets duplicados ou órfãos

| Caminho                                                   | Status | Observação                                                      |
| --------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `public/images/clientes/`                                 | ATIVO  | Logos reais: Abarca, Vector, Mistral                            |
| `public/images/clients/`                                  | ÓRFÃO  | Placeholders alpha/beta/gama/delta/epslon/zeta — não utilizados |
| `public/images/contato/`                                  | ATIVO  | `contato.webp`                                                  |
| `public/images/contact/`                                  | ÓRFÃO  | `contact.svg` — não utilizado                                   |
| `public/images/hero/home/cardheros*.png`                  | ATIVO  | Múltiplas versões do card hero                                  |
| `public/images/hero/home/Gemini_*.png`                    | ATIVO  | Imagens geradas por IA                                          |
| `public/images/hero/home/empresa-vector-engenharia*.webp` | ATIVO  | Duplicatas em `clientes/` e `partners/`                         |

### 5.3 Referências quebradas identificadas

| Arquivo                  | Referência                                     | Status   | Correção necessária       |
| ------------------------ | ---------------------------------------------- | -------- | ------------------------- |
| `src/mock/clients.js:14` | `/images/clientes/vector-engenharia-real.webp` | QUEBRADO | Arquivo não existe        |
| `src/mock/clients.js:31` | `/images/clientes/vectro-engenharia.png`       | QUEBRADO | Typo + arquivo não existe |
| `src/mock/clients.ts:40` | `/images/clientes/vector-engenharia.webp`      | OK       | Correto                   |

**Nota:** `src/mock/clients.js` está duplicado e não é usado pelo build, mas se for referenciado em runtime, precisa ser corrigido.

---

## 6. CSS / Design System

### 6.1 Arquivos CSS

| Arquivo                 | Função                                      | Status     |
| ----------------------- | ------------------------------------------- | ---------- |
| `src/styles/index.css`  | CSS global com Tailwind + custom properties | ATIVO      |
| `src/styles/z-index.md` | Documentação de z-index                     | REFERÊNCIA |

### 6.2 Design system

Não existe fragmentação de design system. O projeto usa:

- **Tailwind CSS v4** com configuração centralizada
- **Tokens** em `src/constants/` (colors, spacing, breakpoints, icons)
- **Custom properties** no `index.css`

Não há segunda implementação de design system.

---

## 7. Estado funcional por página

| Página            | Estrutura | Conteúdo | Design | Responsividade | SEO | Formulário | Integração | Segurança | Banco | Pronto para produção |
| ----------------- | --------- | -------- | ------ | -------------- | --- | ---------- | ---------- | --------- | ----- | -------------------- |
| Home              | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🔴    | 🟡                   |
| Vagas             | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| VagaDetalhe       | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Servicos          | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| ServicoDetalhe    | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Empresas          | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🔴    | 🟡                   |
| DivulgarVaga      | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Candidatos        | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🔴    | 🟡                   |
| Clientes          | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Parceiros         | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Fornecedores      | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| TrabalheConosco   | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| ProcessoSeletivo  | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Sobre             | 🟢        | 🟢       | 🟢     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Blog              | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Contato           | 🟢        | 🟢       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Suporte           | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| FAQ               | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Login             | 🟢        | 🟢       | 🟡     | 🟡             | 🟢  | 🟢         | 🟢         | 🟡        | 🟡    | 🟡                   |
| Cadastro          | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| CadastroCandidato | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| CadastroEmpresa   | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟢         | 🟡         | 🟡        | 🟡    | 🟡                   |
| RecuperarSenha    | 🟢        | 🟢       | 🟡     | 🟡             | 🟢  | 🟢         | 🟢         | 🟡        | 🟡    | 🟡                   |
| Dashboard         | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟢         | 🟡        | 🟡    | 🟡                   |
| NotFound          | 🟢        | 🟢       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Privacidade       | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |
| Termos            | 🟢        | 🟡       | 🟡     | 🟡             | 🟢  | 🟡         | 🟡         | 🟡        | 🟡    | 🟡                   |

**Legenda:**

- 🟢 = Implementado e funcional
- 🟡 = Implementado, mas precisa de refinamento
- 🔴 = Não implementado ou pendente

---

## 8. Componentes globais preservados

| Componente          | Arquivo                                         | Status | Observação              |
| ------------------- | ----------------------------------------------- | ------ | ----------------------- |
| CinematicIntro      | `src/components/sections/CinematicShowcase.tsx` | ATIVO  | Preservar — não remover |
| HeroSplit           | `src/components/sections/HeroSplit.tsx`         | ATIVO  | Preservar               |
| HeroSlider          | `src/components/sections/HeroSlider.tsx`        | ATIVO  | Preservar               |
| SafeImage           | `src/components/ui/SafeImage.tsx`               | ATIVO  | Preservar               |
| Navbar              | `src/components/layout/Navbar.tsx`              | ATIVO  | Preservar               |
| Footer              | `src/components/layout/Footer.tsx`              | ATIVO  | Preservar               |
| BottomNavigation    | `src/components/layout/BottomNavigation.tsx`    | ATIVO  | Preservar               |
| AccessibilityWidget | `src/components/ui/AccessibilityWidget.tsx`     | ATIVO  | Preservar               |
| ChatWidget          | `src/components/ui/ChatWidget.tsx`              | ATIVO  | Preservar               |
| HumanChatWidget     | `src/components/ui/HumanChatWidget.tsx`         | ATIVO  | Preservar               |
| SEO                 | `src/components/ui/SEO.tsx`                     | ATIVO  | Preservar               |
| ErrorBoundary       | `src/components/error/ErrorBoundary.tsx`        | ATIVO  | Preservar               |
| ToastProvider       | `src/components/feedback/Toast.tsx`             | ATIVO  | Preservar               |
| ProtectedRoute      | `src/components/auth/ProtectedRoute.tsx`        | ATIVO  | Preservar               |

---

## 9. Configurações preservadas

| Arquivo                          | Função                | Status |
| -------------------------------- | --------------------- | ------ |
| `src/config/company.ts`          | Dados da empresa      | ATIVO  |
| `src/config/whatsappMessages.ts` | Mensagens WhatsApp    | ATIVO  |
| `src/config/images.ts`           | Mapeamento de imagens | ATIVO  |
| `src/config/imageFallbacks.ts`   | Fallbacks de imagem   | ATIVO  |
| `src/config/seo.ts`              | Configuração SEO      | ATIVO  |
| `src/config/seoPages.ts`         | SEO por página        | ATIVO  |
| `src/config/navigation.ts`       | Navegação             | ATIVO  |
| `src/config/contacts.ts`         | Contatos              | ATIVO  |
| `src/config/app.ts`              | App config            | ATIVO  |

---

## 10. Integrações

| Integração  | Arquivo                  | Status |
| ----------- | ------------------------ | ------ |
| Supabase    | `src/lib/supabase.ts`    | ATIVO  |
| n8n         | `src/lib/n8n.ts`         | ATIVO  |
| OpenRouter  | `src/lib/openrouter.ts`  | ATIVO  |
| Chat client | `src/lib/chat-client.ts` | ATIVO  |

---

## 11. Commits preservados

```
b931c3b chore(reconcile): merge origin/main improvements with local refinements
d5c4355 fix(nav): remove duplicated contact/whatsapp links and redundant reception card
3aab95b chore: remove unused desktop screenshot assets
38de6c6 fix(images): correct vector client asset path and remove typo file
1dfd238 chore: commit pending changes and assets
1f111eb fix(whatsapp): update CTA messages to objective commercial copy
21b18e6 fix(images): repair broken local asset paths
abb62cd feat(sobre): connect cinematic timeline chapters with web lines
ae6c971 refactor(sobre): add timeline web connection lines between cinematic chapters
8deb910 refactor(sobre): compact timeline spacing and card proximity
66b37d7 docs: relatório GATE-UX-SEC-01
35a1dad feat(premium-ui): cinematic timeline on /sobre
0c7533f feat(premium-ui): cinematic client cases on /clientes
d018e20 refactor(premium-ui): reorganize Home sections and remove timeline
d5b7a39 chore(premium-ui): add design tokens and stabilize clients data
29d628b chore(premium-ui): standardize Card and Button tokens
33a1239 docs(premium-ui): add design system baseline
16f1d20 chore(stabilization): remove duplicate .js files, add ErrorBoundary, NotFound, Toast, team placeholder
7c9755e feat(clients): real assets + premium Clientes page + Home relationships/timeline separation
8c536af feat(clients): add 4 real clients with premium cards and official links
f303688 refactor(empresas/clientes): separate clients, partners, suppliers and commercial sections
9a66891 feat(clients): structure real clients section, remove fake testimonials
9eb82f9 fix(CTA): redirect Solicitar Orçamento from /clientes to /empresas
67b574f fix(GLOBAL-01): make cinematic replay only on hard reload / inactivity, not SPA navigation
49221b9 fix(GLOBAL-01): restore useCallback import in IntroContext runtime
a8041ea fix(GLOBAL-01): prevent cinematic replay, remove duplicate AuthProvider, improve intro timing
f3149bf feat(IA-UX-01): add /empresas/divulgar-vaga flow and fix CTA destinations
```

---

## 12. Problemas identificados

### 12.1 Críticos (bloqueiam produção)

| ID  | Problema                                                                      | Arquivo                  | Ação                            |
| --- | ----------------------------------------------------------------------------- | ------------------------ | ------------------------------- |
| P1  | `src/mock/clients.js` referencia `vector-engenharia-real.webp` que não existe | `src/mock/clients.js:14` | Remover arquivo `.js` duplicado |
| P2  | `src/mock/clients.js` referencia `vectro-engenharia.png` (typo)               | `src/mock/clients.js:31` | Remover arquivo `.js` duplicado |

### 12.2 Médios (devem ser corrigidos em GATE-CONTENT-01)

| ID  | Problema                                                   | Arquivo                  | Ação                         |
| --- | ---------------------------------------------------------- | ------------------------ | ---------------------------- |
| P3  | "Vectro Engenharia" ainda aparece em `src/mock/clients.ts` | `src/mock/clients.ts:39` | Corrigir nome                |
| P4  | Assets órfãos em `public/images/clients/`                  | `public/images/clients/` | Remover ou utilizar          |
| P5  | Assets órfãos em `public/images/contact/`                  | `public/images/contact/` | Remover ou utilizar          |
| P6  | 63 arquivos `.js` duplicados de `.ts`                      | `src/**/*.js`            | Remover em commit de limpeza |

### 12.3 Baixos (não bloqueiam)

| ID  | Problema                                  | Arquivo                                             | Ação                       |
| --- | ----------------------------------------- | --------------------------------------------------- | -------------------------- |
| P7  | Erro SVG no console (`Expected arc flag`) | Componente de ícone                                 | Investigar em GATE-DATA-03 |
| P8  | Placeholders em Privacidade/Termos        | `src/pages/Privacidade.tsx`, `src/pages/Termos.tsx` | Atualizar conteúdo         |

---

## 13. Regra de consolidação permanente

> **REGRA DE CONSOLIDAÇÃO**
>
> O projeto deve possuir uma única implementação ativa para cada página, componente, configuração e fluxo.
>
> Estruturas duplicadas não devem ser removidas por conveniência. Sua utilização deve ser comprovada através de:
>
> - imports
> - rotas
> - entrypoints
> - build
> - referências
>
> Nenhuma refatoração poderá criar uma segunda implementação paralela.
>
> Antes de remover qualquer arquivo:
>
> 1. Confirmar que não é importado por nenhum arquivo ativo
> 2. Confirmar que não é referenciado em configurações
> 3. Confirmar que não é necessário para build
> 4. Documentar a remoção em commit separado

---

## 14. Próximos gates

| Gate             | Objetivo                             | Status       |
| ---------------- | ------------------------------------ | ------------ |
| GATE 0           | Reconciliação e preservação          | ✅ CONCLUÍDO |
| GATE-CONTENT-01  | Conteúdo, posicionamento e /empresas | ⏳ PRÓXIMO   |
| GATE-DESIGN-01   | Design System + Premium CSS          | ⏳ PENDENTE  |
| GATE-DATA-01     | Formulários + fluxos                 | ⏳ PENDENTE  |
| GATE-DATA-03     | Supabase + n8n + integrações         | ⏳ PENDENTE  |
| GATE-SECURITY-01 | Segurança + RLS + validações         | ⏳ PENDENTE  |
| GATE-PRODUCTION  | Deploy + monitoramento               | ⏳ PENDENTE  |

---

## 15. Ação imediata recomendada

1. **Não alterar código** — o estado atual está limpo e sincronizado
2. **Remover screenshots staged** (`smoke-home.png`, `smoke-home-mobile.png`)
3. **Iniciar GATE-CONTENT-01** com foco em:
   - Posicionamento RH como carro-chefe
   - Refinamento de `/empresas`
   - Correção de nomenclatura
   - Auditoria de clientes

---

**Documento gerado por:** Kilo  
**Revisão:** Pendente  
**Próxima atualização:** Após GATE-CONTENT-01
