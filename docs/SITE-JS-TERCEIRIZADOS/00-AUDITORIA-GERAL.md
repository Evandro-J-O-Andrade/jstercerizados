# 02 — Auditoria Geral

## 02.1 Estrutura de rotas

### Rotas existentes (`src/App.tsx`)

| Rota                 | Página             | Status          |
| -------------------- | ------------------ | --------------- |
| `/`                  | `Home`             | ✅ Implementada |
| `/vagas`             | `Vagas`            | ✅ Implementada |
| `/vagas/:slug`       | `VagaDetalhe`      | ✅ Implementada |
| `/empresas`          | `Empresas`         | ✅ Implementada |
| `/candidatos`        | `Candidatos`       | ✅ Implementada |
| `/servicos`          | `Servicos`         | ✅ Implementada |
| `/servicos/:slug`    | `ServicoDetalhe`   | ✅ Implementada |
| `/clientes`          | `Clientes`         | ✅ Implementada |
| `/parceiros`         | `Parceiros`        | ✅ Implementada |
| `/fornecedores`      | `Fornecedores`     | ✅ Implementada |
| `/trabalhe-conosco`  | `TrabalheConosco`  | ✅ Implementada |
| `/processo-seletivo` | `ProcessoSeletivo` | ✅ Implementada |
| `/sobre`             | `Sobre`            | ✅ Implementada |
| `/blog`              | `Blog`             | ✅ Implementada |
| `/blog/:slug`        | `Blog`             | ✅ Implementada |
| `/suporte`           | `Suporte`          | ✅ Implementada |
| `/faq`               | `FAQ`              | ✅ Implementada |
| `/contato`           | `Contato`          | ✅ Implementada |
| `/privacidade`       | `Privacidade`      | ✅ Implementada |
| `/termos`            | `Termos`           | ✅ Implementada |
| `/login`             | `Login`            | ✅ Implementada |
| `/dashboard`         | `Dashboard`        | ✅ Implementada |
| `/dashboard/*`       | `Dashboard`        | ✅ Implementada |
| `*`                  | Redirect `/`       | ✅              |

### Rotas faltantes (necessárias)

| Rota proposta              | Motivo                                        |
| -------------------------- | --------------------------------------------- |
| `/parceiros/login`         | Área do parceiro (futuro SaaS)                |
| `/fornecedores/login`      | Área do fornecedor (futuro SaaS)              |
| `/candidatos/login`        | Área do candidato (especificada no blueprint) |
| `/candidatos/perfil`       | Perfil candidato                              |
| `/candidatos/candidaturas` | Candidaturas                                  |
| `/candidatos/favoritas`    | Vagas favoritas                               |

## 02.2 Componentes críticos

### CinematicShowcase (`src/components/sections/CinematicShowcase.tsx`)

**Status:** ✅ Implementado — 6 fases (black / entering / holding / closing)

- Duração total: ~6s (2s enter + 3s hold + 1.5s exit)
- `sessionStorage` para não repetir em sessão
- Scroll lock via `body.overflow = 'hidden'`
- Botão "Pular" secundário
- `prefers-reduced-motion` → skip em 500ms
- Sem texto na imagem (sr-only apenas)
- **FIX aplicado:** `object-position` responsivo via CSS (`.cinematic-hero-image img`)
- **Pendência:** Ainda usa apenas `cardheros` (imagem única). Roadmap indica sequência de imagens para futuro.

### HeroSplit (`src/components/sections/HeroSplit.tsx`)

**Status:** ✅ Implementado como carrossel de 5 slides

- Slides definidos em `src/content/homeHero.ts` (HERO_SLIDES)
- Cada slide: eyebrow + icon, title, description, image, CTAs (primary/secondary/candidate)
- Auto-play ativado apenas após intro cinematográfica (`introComplete`)
- **FIX aplicado:** Removida barra de progresso contador "01 / 05"
- **Pendência:** Não é um "hero storytelling" — é um carrossel mecânico. Precisa de reescrita para hero dinâmico.

### HeroSlider (`src/components/sections/HeroSlider.tsx`)

**Status:** Existe mas não usado na Home atual

- Similar ao HeroSplit mas sem split layout
- Não está referenciado no Home.tsx

### ServiceCard (`src/components/sections/ServiceCard.tsx`)

**Status:** ✅ Implementado

- Usa `SafeImage` para images de serviços
- Category labeling (RH / Facilities / Terceirização / Candidato)
- **Gap:** Não há cards para "Mão de Obra Temporária" e "Efetiva" como cards separados na Home — eles são listados como solutions inline, não como ServiceCard.

### SafeImage (`src/components/ui/SafeImage.tsx`)

**Status:** ✅ Implementado com fallback

- Fallback por categoria (IMAGE_FALLBACKS) → fallback global
- Skeleton loading opcional
- `className` vai para wrapper div; `style` via spread para img
- **Gap:** `object-position` do img é hardcoded como `object-cover` — não responsive per slide

### Footer (`src/components/layout/Footer.tsx`)

**Status:** ✅ Implementado (549 linhas)

- **REGRA CRÍTICA:** NÃO reescrever. Apenas refinar.
- Estrutura: identidade + links (Empresa/Serviços/Candidatos/Empresas/Atendimento) + Fale Conosco + bottom bar
- Social links inclui TikTok ✅, WhatsApp, Instagram, Facebook, LinkedIn, YouTube
- Login dentro de "Atendimento" ✅ (já implementado corretamente)
- Bottom bar: copyright + "Desenvolvido por New Wave" — NÃO alterar

### AccessibilityWidget (`src/components/ui/AccessibilityWidget.tsx`)

**Status:** ✅ Implementado (616 linhas)

- Font size, high contrast, reduced motion, highlight links, increased spacing, focus mode
- TTS (texto-para-fala) integrado
- **Pendência:** Precisa ser desacoplado do Footer — arquitetura deve ser `<App> → Página → Backdrop → AccessibilityPanel`

### ChatWidget (`src/components/ui/ChatWidget.tsx`)

**Status:** ✅ Implementado (413 linhas)

- Chat IA inicial com opções de fluxo (candidate/company/job_info/hire)
- Integração com HumanChatWidget para escalonamento
- **Pendência:** Base de conhecimento não conectada a conteúdo do site

### HumanChatWidget (`src/components/ui/HumanChatWidget.tsx`)

**Status:** ✅ Implementado (304 linhas)

- Conecta via Supabase realtime (`chat_rooms`)
- Cria sala de chat com visitor_id
- **Pendência:** N8N não está integrado como orquestrador de escalonamento

## 02.3 Dados / Conteúdo

### Mock de Serviços (`src/services/mock/services.ts`)

- 16 serviços organizados por category: `rh`, `facilities`, `terceirizacao`, `candidato`
- Cada serviço tem: id, slug, title, shortDescription, description, benefits[], image, icon, category
- **Gap:** Não há serviços para "Mão de Obra Efetiva" como entidade única (usa o mesmo slug de temporária)

### Mock de Vagas (`src/services/mock/vagas.ts`)

- Vagas mock com: titulo, empresa, cidade, estado, tipoContrato, modalidade, salario, beneficios, requisitos
- **Gap:** Não há integração Supabase para vagas reais

### Config (`src/config/`)

- `company.ts` — COMPANY, SOCIAL_LINKS (com TikTok ✅)
- `images.ts` — IMAGES, HERO_IMAGES
- `navigation.ts` — NAVIGATION_LINKS, DASHBOARD_LINKS

### Content (`src/content/`)

- `assets.ts` — SERVICE_IMAGES, CANDIDATE_IMAGES, FALLBACK_IMAGES, HERO_ASSETS, SHOWCASE_SLIDES, PARTNER_ASSETS
- `homeHero.ts` — HERO_SLIDES (5 slides com dados de hero storytelling)

## 02.4 Sistema de Imagens

### Diretório de imagens

- **Local:** `/public/images/` (organizado por subpastas)
- **NÃO existe** `src/assets/` ou pasta `imangens_para_mover/`

### Estrutura de pastas de imagens existente

```text
public/images/
├── brand/           — logos, favicon, watermark
├── candidates/      — cadastro, busca de vagas
├── backgrounds/     — hero-grid, hero-lines, waves, pattern, noise
├── hero/            — home/, sobre/, servicos/, parceiros/, fornecedores/, suporte/, contato/, login/
├── services/        — todas as imagens de serviços
├── team/            — placeholders de equipe
├── partners/        — logos de parceiros
├── empresas/        — cadastro empresarial
├── fallbacks/       — imagens fallback
├── support/         — suporte
├── trabalhe-conosco/
└── blog/
```

### SafeImage + Fallback

- `IMAGE_FALLBACKS` configurado em `@/config/imageFallbacks`
- `global` fallback: `/images/fallbacks/global.svg`
- Por categoria (services, vagas, etc.)

## 02.5 Supabase

- Cliente configurado em `src/lib/supabase.ts`
- Tabelas referenciadas: `chat_rooms`
- **Gap:** Não há tabelas para leads, vagas, candidaturas, serviços — tudo mockado
- N8N não está conectado

## 02.6 Home — Seções atuais (1124 linhas)

| Ordem | Seção              | Componente          | Status            |
| ----- | ------------------ | ------------------- | ----------------- |
| 1     | CinematicShowcase  | CinematicShowcase   | ✅                |
| 2     | InactivityShowcase | InactivityShowcase  | ✅                |
| 3     | HERO               | HeroSplit           | ✅ (carrossel)    |
| 4     | Para Empresas      | Solutions grid      | ✅ (cards inline) |
| 5     | Facilities         | Solutions grid      | ✅ (cards inline) |
| 6     | Para Candidatos    | Benefits grid       | ✅ (cards inline) |
| 7     | Vagas em Destaque  | mockGetVagas        | ✅                |
| 8     | Como Funciona      | Steps               | ✅                |
| 9     | Por que J&S        | Differentials       | ✅                |
| 10    | Clientes/Parceiros | PARTNERS_LOGOS      | ✅                |
| 11    | Depoimentos        | CLIENT_TESTIMONIALS | ✅                |
| 12    | Resultados         | Stats               | ✅                |
| 13    | Precisa contratar? | CTA                 | ✅                |
| 14    | Blog               | Posts               | ✅                |
| 15    | CTA Final          | CTA                 | ✅                |

## 02.7 Gaps identificados na auditoria

| #   | Gap                                                                                | Severidade |
| --- | ---------------------------------------------------------------------------------- | ---------- |
| 1   | Hero é carrossel mecânico, não storytelling                                        | Alta       |
| 2   | Mão de obra temporária/efetiva não é card separado na Home                         | Média      |
| 3   | Terceirização não é card separado na Home                                          | Média      |
| 4   | ServiceRequestForm usa WhatsApp, não Supabase                                      | Alta       |
| 5   | Chat IA não conecta a conteúdo do site                                             | Média      |
| 6   | N8N não é orquestrador                                                             | Alta       |
| 7   | AccessibilityWidget não é layer separado                                           | Alta       |
| 8   | Timeline do Sobre é genérica, não cinematográfica                                  | Média      |
| 9   | Não há `/candidatos/login`, `/candidatos/perfil`                                   | Alta       |
| 10  | `SHOWCASE_SLIDES` no assets.ts é obsoleto (CinematicShowcase usa apenas cardheros) | Baixa      |
