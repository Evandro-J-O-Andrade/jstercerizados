# GATE-PROJECT-BASELINE-HOME-01.md

**Documento-base de restauração. Fonte de verdade técnica. Last updated:** 2026-08-16
**Repos:** `https://github.com/Evandro-J-O-Andrade/jrtercerisados`
**Branch base atual:** `main` @ `09d83f6863056622ca76110a9716427c4648bc64`

---

## 1. Estado do Projeto

| Campo                                        | Valor                                                                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome corporativo (obrigatório — não alterar) | `J&S Empregos LTDA`                                                                                                                                |
| Trading name                                 | `J&S Empregos LTDA`                                                                                                                                |
| Marca (UI)                                   | `J&S Empregos`                                                                                                                                     |
| Tagline                                      | `Mais eficiência em RH. Mais resultados para sua empresa.`                                                                                         |
| Posicionamento                               | Agência de Empregos + Assessoria em RH, Mão de Obra Temporária/Efetiva, Terceirização e Facilities                                                 |
| Stack                                        | React 19 + TypeScript (ESM), Vite, TailwindCSS v4 (via `@tailwindcss/jit`), Framer Motion, Lucide React, Zod, Zustand, Supabase JS, OpenRouter SDK |
| Domínio / e-mail                             | `jsterceirizados.com.br` / `comercial@jsterceirizados.com.br`                                                                                      |
| WhatsApp                                     | `(11) 96838-0592`                                                                                                                                  |

### Stack técnico (package.json)

```
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run",
  "prepare": "husky"
}
```

### Rotas / SPA

```
/
/vagas                 → Vagas.tsx
/vagas/:slug           → VagaDetalhe.tsx
/empresas              → Empresas.tsx
/empresas/divulgar-vaga → DivulgarVaga.tsx
/candidatos            → Candidatos.tsx
/servicos              → Servicos.tsx
/servicos/:slug        → ServicoDetalhe.tsx
/clientes              → Clientes.tsx
/parceiros             → Parceiros.tsx
/fornecedores          → Fornecedores.tsx
/trabalhe-conosco      → TrabalheConosco.tsx
/processo-seletivo     → ProcessoSeletivo.tsx
/sobre                 → Sobre.tsx
/blog                  → Blog.tsx
/blog/:slug            → Blog.tsx
/suporte               → Suporte.tsx
/faq                   → FAQ.tsx
/contato               → Contato.tsx
/privacidade           → Privacidade.tsx
/termos                → Termos.tsx
/login                 → Login.tsx
/cadastro              → Cadastro.tsx
/cadastro/candidato    → CadastroCandidato.tsx
/cadastro/empresa      → CadastroEmpresa.tsx
/recuperar-senha       → RecuperarSenha.tsx
/dashboard             → Dashboard.tsx (protegida — admin)
/dashboard/candidato   → Dashboard.tsx (protegida — candidato|admin)
/dashboard/empresa     → Dashboard.tsx (protegida — empresa|admin)
```

---

## 2. Mapa Completo de Arquivos

```text
src/
├── App.tsx                                  # Root — layout global, providers, rotas
├── index.tsx                                # Entry — tema, AuthProvider, StrictMode
├── app.html                                 # Template HTML base
├── types/
│   ├── common.ts                            # Tipos: Vaga, Service, Company, etc.
│   ├── chat.ts
│   └── index.ts
│
├── config/
│   ├── company.ts                           # COMPANY — fonte única de marca → NUNCA ALTERAR nome
│   ├── navigation.ts                        # NAV_CONFIG
│   ├── contacts.ts                          # SOCIAL_LINKS
│   ├── images.ts                            # IMAGES — catálogo de assets
│   ├── whatsappMessages.ts                  # Mensagens padrão WhatsApp
│   ├── seo.ts / seoPages.ts                 # Metadados globais e por página
│   └── index.ts                             # Barrel
│
├── services/
│   ├── mock/
│   │   ├── vagas.ts                         # Dataset de vagas → PROTEGIDO editorialmente
│   │   ├── services.ts                      # Catalogo de serviços
│   │   ├── clientes.ts
│   │   ├── fornecedores.ts
│   │   ├── parceiros.ts
│   │   ├── contatos.ts
│   │   ├── curriculos.ts
│   │   └── index.ts
│   └── api/                                 # Integrações Supabase
│
├── lib/                                     # Utilitários, hooks
│   ├── supabase.ts
│   ├── utils.ts
│   └── hooks/
│
├── components/
│   ├── common/
│   │   ├── Container.tsx                    # max-w-6xl global — NÃO USAR PARA FOOTER
│   │   └── index.ts
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                       # Desktop + drawer mobile — PROTEGIDO
│   │   ├── Footer.tsx                       # max-w-[1600px], próprio grid — PROTEGIDO
│   │   ├── BottomNavigation.tsx             # Mobile only (lg:hidden) — PROTEGIDO
│   │   └── index.ts
│   │
│   ├── sections/
│   │   ├── HeroSplit.tsx                    # max-w-[1600px] — wide banner
│   │   ├── HeroSlider.tsx                   # max-w-[1600px]
│   │   ├── ServiceCard.tsx                  # h-52 sm:h-56 — PROTEGIDO
│   │   ├── CinematicShowcase.tsx
│   │   ├── InactivityShowcase.tsx
│   │   ├── Brand3D.tsx
│   │   ├── HeroImage.tsx
│   │   ├── NumberCounter.tsx
│   │   ├── ClientCard.tsx
│   │   ├── Section.tsx
│   │   └── index.ts
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── SafeImage.tsx                    # Cache-aware image loader
│   │   ├── SEO.tsx
│   │   ├── PageLoader.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── ChatWidget.tsx                   # Float — PROTEGIDO
│   │   ├── HumanChatWidget.tsx              # Float — PROTEGIDO
│   │   ├── AccessibilityWidget.tsx          # Float — PROTEGIDO
│   │   └── index.ts
│   │
│   └── forms/
│       ├── JobApplicationForm.tsx           # Zod + RHF — PROTEGIDO
│       ├── ServiceRequestForm.tsx
│       └── DivulgarVagaForm.tsx
│
├── pages/
│   ├── Home.tsx                             # Layout: Section + Container — max-w-6xl
│   ├── Servicos.tsx                         # Grid: lg:grid-cols-3 xl:grid-cols-4
│   ├── Sobre.tsx                            # Timeline cinematográfica
│   ├── Vagas.tsx                            # Filtros completos
│   ├── VagaDetalhe.tsx
│   ├── Empresas.tsx
│   ├── Clientes.tsx
│   ├── Parceiros.tsx
│   ├── Fornecedores.tsx
│   ├── Contato.tsx
│   ├── Suporte.tsx
│   ├── FAQ.tsx
│   ├── Blog.tsx
│   ├── ProcessoSeletivo.tsx
│   ├── TrabalheConosco.tsx
│   ├── Candidatos.tsx
│   ├── Login.tsx
│   ├── Cadastro.tsx
│   ├── CadastroCandidato.tsx
│   ├── CadastroEmpresa.tsx
│   ├── RecuperarSenha.tsx
│   ├── Dashboard.tsx
│   ├── DivulgarVaga.tsx
│   ├── Privacidade.tsx
│   ├── Termos.tsx
│   └── NotFound.tsx
│
└── styles/
    └── index.css                            # Theme vars, utility classes, global resets
```

---

## 3. Estado Atual de Cada Arquivo (Snapshot forense)

### `src/App.tsx` — linha 136 (CORRETO no HEAD atual)

```tsx
// App.tsx:136
<div className="pb-56 lg:pb-0">
  <Footer ... />
</div>
```

**Status:** ✅ CORRETO. Reflete o checkpoint (`pb-56`), não o valor `pb-[100px]` do commit `99b3bf2`.

```tsx
// main.tsx (raiz do layout)
<div className="flex min-h-screen flex-col overflow-x-hidden">
  <main className="flex-1 pt-16 pb-24 lg:pt-20 lg:pb-0">
```

| Classe           | Props                                   | Impacto                                  |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| `pb-24` (mobile) | 96px bottom no `<main>`                 | Faz espaço para BottomNavigation fixa    |
| `pb-56` (mobile) | 14rem no wrapper do Footer              | Empurra Footer acima de BottomNavigation |
| `pt-16 / pt-20`  | Navbar fixa (desktop 80px, mobile 64px) | Offset de âncora correto                 |

### `src/components/layout/Footer.tsx` — PROTEGIDO

**Container:**

```tsx
<div className="mx-auto max-w-[1600px] px-4 py-16 pb-28 sm:px-6 lg:px-8">
```

**Elementos críticos preservados:**

- Logo: `J&S` em dourado (primary) + `Empregos` em foreground
- Bottom Bar: `© {year} J&S Empregos LTDA` + `Desenvolvido por New Wave Sistemas Digital Solutions`
- Fale Conosco: cards de contato (telefone, e-mail, endereço, mapa)
- Social icons: WhatsApp, Instagram, Facebook, TikTok, LinkedIn, YouTube — cada um com cor própria
- Mobile accordions: Empresa, Serviços, Candidatos, Empresas, Contato
- Desktop grid: 5 colunas (`lg:grid-cols-5`) dentro de `lg:col-span-9`

**NÃO ALTERAR:** Conteúdo textual, links, Bottom Bar, cores.

### `src/components/layout/Navbar.tsx` — PROTEGIDO

```tsx
// Navbar.tsx:247
<div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
```

- Ícones do desktop (`topNavLinks`): Home, Vagas, Serviços, Sobre Nós, Blog — **não remover**
- Drawer mobile: `.overlay-panel` + `.overlay-backdrop`, safe-area insets, focus trap, ESC
- Dropdown em mobile usa `MobileAccordion` com ChevronRight/X
- Desktop: dropdown hover para Empresas, Candidatos, Contato, Entrar
- Mobile drawer social: WhatsApp, Instagram, Facebook, LinkedIn, YouTube, TikTok

### `src/components/layout/BottomNavigation.tsx`

```tsx
// BottomNavigation.tsx:66-67
<nav className="...fixed right-0 bottom-0 left-0 z-30 border-t lg:hidden">
  <div className="...pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
```

- **Mobile only** (`lg:hidden`)
- Itens: Início, Vagas, Serviços, Empresas, Candidatos, Login (ícone `LogIn`)
- `z-30` — deve ficar acima de Footer mobile
- Safe-area insets aplicados

### `src/components/common/Container.tsx` — AMPLAMENTE USADO

```tsx
export function Container({ children, className }) {
  return (
    <div
      className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
```

**Observação:** `max-w-6xl` = 1152px. **NÃO usar Container para Footer** — Footer tem seu próprio `max-w-[1600px]`.

### `src/components/sections/ServiceCard.tsx` — PROTEGIDO

Estrutura atual:

```tsx
// Imagem: h-52 sm:h-56 (336px → 384px)
<div className="relative h-52 overflow-hidden sm:h-56">
  <SafeImage src={service.image} ... />
  // Icon overlay fixo: h-12 w-12
  <div className="bg-primary text-primary-foreground absolute bottom-4 left-4 ...">
    <Icon className="h-6 w-6" />
  </div>
</div>

// Conteúdo: p-5 sm:p-6
<div className="p-5 sm:p-6">
  <span className="text-xs font-semibold uppercase"> {category} </span>
  <h3 className="text-xl font-bold"> {title} </h3>
  <p className="text-sm"> {shortDescription} </p>
  <div className="flex items-center gap-2 pt-6">
    Saiba mais →
  </div>
</div>
```

**Referência histórica (`19a93fb`):**

- `ServicioDetalhe`: mantém `image`, `shortDescription`, `responsibilities`, `requisitos`, `beneficios`
- Grid em `Servicos.tsx`: `lg:grid-cols-3 xl:grid-cols-4`
- **NÃO** possuir `min-h-[420px]` — removido após checkpoint

### `src/pages/Home.tsx` — PROTEGIDO

9 seções, todas usando `<Section>` + `<Container>` (`max-w-6xl`):

1. HeroSplit (cinematic showcase) — `max-w-[1600px]` (wide)
2. Consultoria RH (Home) — `lg:grid-cols-3`
3. Facilities — `lg:grid-cols-4`
4. Para Candidatos — `md:grid-cols-2`
5. Vagas em Destaque — `md:grid-cols-2 lg:grid-cols-4`
6. Diferenciais J&S — `sm:grid-cols-2 lg:grid-cols-3`
7. Relacionamentos (Clientes/Parceiros/Fornecedores/Empresas) — `sm:grid-cols-2 lg:grid-cols-4`
8. Clientes Reais — `sm:grid-cols-3 md:grid-cols-4`
9. CTA Comercial Final — `sm:grid-cols-2`

### `src/pages/Servicos.tsx` — PROTEGIDO

- Grid: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (4 cards por linha no desktop)
- `ServiceCard` usado para ambas categorias (RH + Facilities)
- Filtra `mockServices` por `category: 'rh'` e `category: 'facilities' \| 'terceirizacao'`

### `src/pages/Sobre.tsx`

Timeline (§7 do checkpoint):

- `TimelineWebConnector` (linhas 139-154): elemento visual `<div className="hidden h-28 w-full lg:block">` com conectores de rede/circuito
- `CinematicChapter`: animado com Framer Motion (entrada lateral desktop, vertical mobile)
- Layout: `COMPANY_TIMELINE.map` → grid alternado (left/right image)
- `prefers-reduced-motion` respeitado

### `src/components/forms/JobApplicationForm.tsx`

- Zod schema com validação LGPD (`boolean`)
- Sanitização centralizada (`sanitizeText`, `sanitizeName`, etc.)
- WhatsApp message builder integrado
- Props: `{ jobTitle?: string }`

### `src/services/mock/vagas.ts` — PROTEGIDO EDITORIALMENTE

**18 vagas ativas** (IDs 1-18), todas com:

- `titulo`, `slug`, `empresa` ("J&S Empregos LTDA"), `cidade`, `estado`, `tipoContrato`, `nivel`, `salarioMin`, `salarioMax` (quando aplicável), `modalidade` (PRESENCIAL/HIBRIDO/REMOTO), `area`, `workload`, `workSchedule`, `beneficios[]`, `responsibilities`, `requisitos`, `descricao`, `vagas`, `status`, `dataPublicacao`

**Três vagas REMOTO/HIBRIDO** adicionadas no commit `6554a27`:

| ID  | Slug                             | Título                      | Modalidade | Salário           |
| --- | -------------------------------- | --------------------------- | ---------- | ----------------- |
| 16  | analista-de-sistemas-sr          | Analista de Sistemas Sênior | REMOTO     | R$ 8.000 - 12.000 |
| 17  | assistente-administrativo-remoto | Assistente Administrativo   | REMOTO     | R$ 3.500 - 4.500  |
| 18  | consultor-de-vendas-hibrido      | Consultor de Vendas         | HIBRIDO    | R$ 4.000 - 7.000  |

### `src/styles/index.css`

- Theme tokens: HSL nativos (`--background`, `--foreground`, `--card`, `--primary`, etc.)
- Dark mode via `.dark` class (toggle no Navbar)
- Utility classes: `.overlay-backdrop`, `.overlay-panel`, `.card-base`, `.card-hover`, `.section-heading`, `.btn-primary`, `.input-base`
- Scrollbar: `scrollbar-width: none; ::-webkit-scrollbar { display: none }`
- Root: `html, body, #root { min-height: 100vh }` — **classificar para revisão**

### Usos de viewport height (`vh`)

| Arquivo                   | Linha | Uso                                       | Classificação                                         |
| ------------------------- | ----- | ----------------------------------------- | ----------------------------------------------------- |
| `index.css`               | 563   | `html, body, #root { min-height: 100vh }` | ⚠️ Revisar — pode interferir em mobile                |
| `AccessibilityWidget.tsx` | 251   | `max-h-[calc(100vh-6rem)]` (mobile)       | ❌ Inadequado — usa `100vh` sem `safe-area-inset-top` |
| `HeroSlider.tsx`          | 51    | `<section className="... min-h-screen">`  | OK — herda root                                       |
| Várias páginas            | —     | `min-h-screen`                            | OK — herda root                                       |

---

## 4. Sistema de Layout

### Desktop — wide, não espremido

| Componente                 | Container  | Largura              | Observação                                             |
| -------------------------- | ---------- | -------------------- | ------------------------------------------------------ |
| `Container.tsx`            | Global     | `max-w-6xl` (1152px) | Usado em Home, Servicos, Sobre, páginas institucionais |
| `Navbar`                   | Próprio    | `max-w-[1600px]`     | Não usa Container                                      |
| `Footer`                   | Próprio    | `max-w-[1600px]`     | Não usar Container para Footer                         |
| `HeroSplit` / `HeroSlider` | Próprio    | `max-w-[1600px]`     | Banner hero wide                                       |
| `Fale Conosco` cards       | Full width | `w-full`             | Dentro de Footer, alinhados ao centro                  |

### Mobile — Footer x BottomNavigation

**Problema:** BottomNavigation fixa (`lg:hidden`) sobreponha o Footer no mobile.

**Solução (checkpoint §6 + commit `09d83f6`):**

- `<main>` tem `pb-24` (mobile) / `pb-0` (desktop)
- Wrapper do Footer tem `pb-56` (mobile) / `pb-0` (desktop)
- Bottom Bar do footer (`border-t pt-10`) agora fica **dentro** do scroll, acima da BottomNavigation

```tsx
// App.tsx
<div className="flex min-h-screen flex-col overflow-x-hidden">
  <Navbar />
  <main className="flex-1 pt-16 pb-24 lg:pt-20 lg:pb-0">
    {' '}
    {/* pb-24 mobile = 96px */}
    {/* rotas */}
  </main>
  <div className="pb-56 lg:pb-0">
    {' '}
    {/* pb-56 mobile = 14rem */}
    <Footer />
  </div>
  <BottomNavigation /> {/* fixed bottom-0 */}
</div>
```

**Regra crítica:** Nunca alterar `Container.tsx` (`max-w-6xl`) para resolver Footer — eles são sistemas independentes.

---

## 5. Referências de Commit (auditadas)

| Hash      | Mensagem                                                                            | Arquivos                                               | Status            |
| --------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------- |
| `19a93fb` | `feat(error-handling): complete GATE-ERROR-UX-01 stabilization`                     | `JobApplicationForm.tsx`, `Navbar.tsx`, `Servicos.tsx` | ✅ Local          |
| `6554a27` | `feat(vagas): adicionar filtro remoto e novas vagas REMOTO/HIBRIDO`                 | `Vagas.tsx`, `vagas.ts`                                | ✅ Local          |
| `c15d95f` | `fix: remove footer mobile buttons and ensure bottom nav stays above content`       | Múltiplos                                              | ✅ Local          |
| `09d83f6` | `fix(footer): restaurar padding-bottom mobile pb-56 conforme CHECKPOINT_2026-08-09` | `App.tsx`                                              | ✅ Local          |
| `99b3bf2` | `fix(footer): corrigir corte do Footer no mobile adicionando pb-[100px]`            | `App.tsx`                                              | ✅ Local          |
| `8774b41` | (não especificado)                                                                  | —                                                      | ❌ Não encontrado |
| `46bebba` | (não especificado)                                                                  | —                                                      | ❌ Não encontrado |
| `7fd8f55` | (não especificado)                                                                  | —                                                      | ❌ Não encontrado |
| `f77ab73` | (não especificado)                                                                  | —                                                      | ❌ Não encontrado |

### Evolução do padding Footer mobile

```
Antes de 99b3bf2:      <div className="lg:pb-0">       (sem padding mobile)
99b3bf2 (especulativo): <div className="pb-[100px] lg:pb-0"> (valor temporário)
09d83f6 (atual):        <div className="pb-56 lg:pb-0">      (correção → pb-56)
```

**Valor canônico:** `pb-56` (14rem = 224px), conforme `CHECKPOINT_2026-08-09.md` §6.

---

## 6. Regra de Proteção (NÃO ALTERAR SEM GATE)

### PROTEGIDO — Footer

- **NÃO ALTERAR** o conteúdo textual do Footer
- **NÃO ALTERAR** a Bottom Bar (`© ...` / `Desenvolvido por ...`)
- **NÃO ALTERAR** o nome da empresa de "J&S Empregos LTDA" para qualquer variação
- Solução mobile (`pb-56`) é específica do Footer × BottomNavigation, **não justifica** alterações globais

### PROTEGIDO — Navbar

- Ícones do desktop (`topNavLinks`) são **obrigatórios** — não remover para "cabê-lo"
- Drawer mobile usa `.overlay-panel` e `.overlay-backdrop`
- Safe-area insets (`env(safe-area-inset-*)`) aplicados

### PROTEGIDO — ServiceCard

- Imagem: `h-52 sm:h-56`
- Conteúdo: `p-5 sm:p-6`
- Icon overlay: `h-12 w-12` fixo no bottom-left
- CTA: "Saiba mais" alinhado abaixo da descrição

### PROTEGIDO EDITORIALMENTE — vagas.ts

- As 18 vagas são conteúdo editorial
- NÃO simplificar para título + salário
- Todos os campos (`responsibilities`, `requisitos`, `beneficios`, `descricao`, etc.) devem ser preservados

### PROTEGIDO — Container.tsx

- `max-w-6xl` (1152px)
- **NÃO** usar para Footer, Navbar, Hero — componentes com wide layout próprio

---

## 7. Sistema de Viewport Height (vw/vh)

| Uso                        | Localização                         | Status        | Ação                             |
| -------------------------- | ----------------------------------- | ------------- | -------------------------------- |
| `min-height: 100vh`        | `index.css:563` (html, body, #root) | ⚠️ Revisar    | Considerar `100dvh` para mobile  |
| `max-h-[calc(100vh-6rem)]` | `AccessibilityWidget.tsx:251`       | ❌ Inadequado | Falta `env(safe-area-inset-top)` |
| `min-h-screen`             | Múltiplas páginas                   | OK            | Herda do root                    |
| `min-h-[80vh]`             | `HeroSlider.tsx`                    | OK            | Conteúdo hero                    |

---

## 8. Timeline / Linha do Tempo (`/sobre`)

### Especificação Visual

```text
Desktop (lg:block):
┌─────────────────────────────────┐
│  TimelineWebConnector           │
│  - h-28, centralizado          │
│  - linha vertical (w-px)       │
│  - nós hexagonais concêntricos │
│  - estilo rede/circuito        │
└─────────────────────────────────┘

Mobile (hidden lg:block):
┌─────────────────────────────────┐
│  CinematicChapter               │
│  - Entrada lateral (desktop)    │
│  - Entrada vertical (mobile)    │
│  - prefers-reduced-motion OK    │
└─────────────────────────────────┘
```

**Elementos:**

- `TimelineWebConnector`: 6 elementos posicionados absolutamente (`top-[18%]`, `top-[25%]`, `top-[75%]`, `top-[82%]`) criando efeito de conexão em espiral
- `CinematicChapter`: imagem + texto em grid alternado (`lg:grid-cols-2`), entrada com Framer Motion
- `COMPANY_TIMELINE`: fonte de dados (importado de `@/content/about` ou similar)

**Regra:** Timeline é uma **narrativa conectada**, não cards independentes. Manter conectores web.

---

## 9. Typografia

| Elemento          | Desktop                   | Mobile        | Observação                              |
| ----------------- | ------------------------- | ------------- | --------------------------------------- |
| H1 Home           | `text-4xl font-extrabold` | `sm:text-5xl` | Hero banner                             |
| H1 páginas        | `text-4xl font-bold`      | `sm:text-5xl` | Título principal                        |
| H2 seções         | `text-3xl font-bold`      | `sm:text-4xl` | Subtítulo                               |
| Body              | `text-lg`                 | —             | Descrições                              |
| Footer links      | `text-xs`                 | `text-sm`     | Desktop uppercase, mobile accordion     |
| Footer bottom bar | `text-xs`                 | `text-xs`     | ⚠️ Pode parecer pequeno — manter padrão |
| Navbar            | `text-sm`                 | `text-sm`     | Com ícones `h-4 w-4`                    |
| BottomNavigation  | `text-[10px]`             | `text-[10px]` | Label abaixo ícone `h-6 w-6`            |

---

## 10. Vagas — Dataset Editorial

### 18 vagas ativas (IDs 1-18)

| ID  | Slug                             | Modalidade | Contrato   | Salário         |
| --- | -------------------------------- | ---------- | ---------- | --------------- |
| 1   | analista-rh-folha-de-pagamento   | PRESENCIAL | CLT        | R$ 5.000,00     |
| 2   | ajudante-geral                   | PRESENCIAL | CLT        | R$ 2.112,28     |
| 3   | pintor-i                         | PRESENCIAL | TEMPORARIO | R$ 15,56/h      |
| 4   | auxiliar-de-limpeza              | PRESENCIAL | TEMPORARIO | R$ 2.112,28     |
| 5   | auxiliar-de-marcenaria           | PRESENCIAL | TEMPORARIO | R$ 3.000,00     |
| 6   | eletricista-de-instalacao        | PRESENCIAL | CLT        | R$ 3.500,00     |
| ... | ...                              | ...        | ...        | ...             |
| 16  | analista-de-sistemas-sr          | REMOTO     | CLT        | R$ 8.000-12.000 |
| 17  | assistente-administrativo-remoto | REMOTO     | CLT        | R$ 3.500-4.500  |
| 18  | consultor-de-vendas-hibrido      | HIBRIDO    | CLT        | R$ 4.000-7.000  |

### Formato de salário consolidado

```tsx
// Vagas.tsx: exibe com formatação BRL
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );
```

- **Formato:** `R$ X.XXX,XX` (ex: `R$ 15,56 / hora` ou `R$ 10.500,00`)
- **Não usar:** `R$ 10500` sem formatação

---

## 11. Fonte de Verdade

```text
├── docs/
│   └── GATE-PROJECT-BASELINE-HOME-01.md  ← ESTE DOCUMENTO (fonte única)
│
├── CHECKPOINT_2026-08-09.md              ← Referência histórica de estilo
│
└── src/                                  ← Implementação (segue este baseline)
```

**Regra:** Nenhum agente pode alterar uma área marcada como PROTEGIDA sem:

1. Atualizar este documento (`docs/GATE-PROJECT-BASELINE-HOME-01.md`)
2. Referenciar com commit hash + data
3. Passar por validação (typecheck + tests)

Issues e mensagens de commit são **secundários** — este documento é a fonte primária.
