# 05 — Imagens e Assets

## 05.1 Regra obrigatória

> **Nenhuma imagem pode estourar o viewport ou deformar o layout.**

Isso vale para: Cinematic Intro, Hero, Hero dinâmico, cards, timeline, Sobre Nós, Parceiros, Blog, Footer, mobile e desktop.

### REGRAS

1. Nunca permitir overflow horizontal.
2. Nunca distorcer a proporção original da imagem.
3. Nunca permitir que a imagem ultrapasse o container.
4. O container deve controlar a proporção.
5. Utilizar `object-fit` de acordo com o contexto.

## 05.2 object-fit por contexto

| Contexto               | object-fit | object-position       |
| ---------------------- | ---------- | --------------------- |
| Cinematic Intro        | `cover`    | responsivo (ver 05.4) |
| Hero (dynamic)         | `cover`    | `center`              |
| Cards de serviços      | `cover`    | `center`              |
| Cards de vagas         | `cover`    | `center top`          |
| Timeline institucional | `contain`  | `center`              |
| Sobre (hero image)     | `cover`    | `center 30%`          |
| Parceiros (logos)      | `contain`  | `center`              |
| Footer (logo)          | `contain`  | `center`              |

## 05.3 Sistema de fallback

```text
imagem real
   ↓
SafeImage tenta carregar
   ↓
erro?
 ├── sim → fallback por categoria (IMAGE_FALLBACKS)
 └── não → fallback global (/images/fallbacks/global.svg)
   ↓
se fallback também falhar → componente visual padrão (SVG icon)
```

### IMAGE_FALLBACKS

Configurado em `@/config/imageFallbacks`:

- `global` → `/images/fallbacks/global.svg`
- `services` → `/images/fallbacks/servicos.png`
- `vagas` → `/images/fallbacks/vagas.png`
- `contato` → `/images/fallbacks/contato.png`

### Fallback visual corporativo

O fallback também deve:

- [ ] respeitar o container
- [ ] não gerar overflow
- [ ] funcionar em light/dark
- [ ] manter proporção
- [ ] não possuir texto duplicado

## 05.4 object-position responsivo — Cinematic Showcase

Implementado no CSS global (`src/styles/index.css`):

```css
.cinematic-hero-image img {
  object-position: center 40%;
}
@media (min-width: 640px) {
  .cinematic-hero-image img {
    object-position: center 35%;
  }
}
@media (min-width: 768px) {
  .cinematic-hero-image img {
    object-position: center 33%;
  }
}
@media (min-width: 1024px) {
  .cinematic-hero-image img {
    object-position: center 30%;
  }
}
```

### Lógica de composição

- **Desktop (lg 1024px+):** `center 30%` — o topo da imagem é ligeiramente cortado, mantendo o assunto central visível
- **Tablet (md 768px+):** `center 33%` — foco mais central
- **Mobile (sm 640px+):** `center 35%` — enquadramento mais conservador
- **Mobile (default <640px):** `center 40%` — prioriza o topo da imagem

> A regra de ouro: **o asset se adapta ao layout; o layout nunca deve ser quebrado para acomodar o asset.**

## 05.5 Estrutura de pastas de imagens

### Proposta (não implementada ainda)

```text
src/assets/js-terceirizados/
├── hero/
├── rh/
├── facilities/
├── limpeza/
├── jardinagem/
├── terceirizacao/
├── vagas/
├── empresa/
├── candidatos/
├── parceiros/
└── cinematic/
```

### Atual (existente)

```text
public/images/
├── brand/           — logos, favicon, watermark
├── candidates/
├── backgrounds/
├── hero/            — home/, sobre/, servicos/, etc.
├── services/
├── team/
├── partners/
├── empresas/
├── fallbacks/
├── support/
└── trabalhe-conosco/
```

## 05.6 QA — breakpoints de teste

| Width  | Device        |
| ------ | ------------- |
| 360px  | Small Android |
| 375px  | iPhone SE     |
| 390px  | iPhone 14     |
| 414px  | iPhone Plus   |
| 768px  | iPad          |
| 1024px | iPad Pro      |
| 1280px | Laptop        |
| 1440px | Desktop       |

### Checklist de QA

Nenhuma imagem pode:

- [ ] estourar horizontalmente
- [ ] criar scrollbar
- [ ] deformar
- [ ] sair do container
- [ ] empurrar conteúdo
- [ ] quebrar o layout
- [ ] ficar cortada de forma inadequada

## 05.7 Assets obsoletos

### `SHOWCASE_SLIDES` (`src/content/assets.ts:61-92`)

**Status:** Obsoleto

- O CinematicShowcase agora usa apenas `cardheros` (imagem única).
- `SHOWCASE_SLIDES` ainda existe no código mas não é mais referenciado.
- **Ação:** Remover no cleanup de tech debt.

### `homeSlides` em `HERO_ASSETS` (`src/content/assets.ts:51-55`)

**Status:** Obsoleto

- `HERO_ASSETS.homeSlides` não é referenciado em nenhum component.
- As imagens de hero agora vêm de `homeHero.ts` → `HERO_SLIDES`.
- **Ação:** Remover no cleanup.
