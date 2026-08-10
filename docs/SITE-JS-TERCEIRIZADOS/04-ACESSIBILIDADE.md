# 04 — Acessibilidade

## 04.1 Princípios

- Acessibilidade é **feature global**, não detalhe visual.
- O painel de acessibilidade **não pode ficar turvo** junto com o backdrop.
- Arquitetura: `<App> → Página → Backdrop → AccessibilityPanel`

## 04.2 Recursos implementados

### AccessibilityWidget (`src/components/ui/AccessibilityWidget.tsx`)

| Recurso               | Teclas              | Observação                |
| --------------------- | ------------------- | ------------------------- |
| Font size             | A+ / A- / Reset     | 10 escalas (70%–150%)     |
| Alto contraste        | Toggle              | Inverte para preto/branco |
| Reduzir movimento     | Toggle              | `prefers-reduced-motion`  |
| Destacar links        | Toggle              | underline + border        |
| Espaçamento           | Toggle              | aumenta margens           |
| Focus mode            | Toggle              | destaca foco ativo        |
| TTS (Texto-para-fala) | Play / Pause / Stop | Web Speech API            |

## 04.3 Recursos que precisam de correção

### Problema atual

O `AccessibilityWidget` é instanciado dentro de `App.tsx` após o `Footer`, e o `Footer` recebe `onOpenAccessibility` como prop. Isso cria uma dependência: o Footer precisa abrir o painel de acessibilidade.

### Arquitetura correta

```text
<App>
  ├── <Navbar />
  ├── <main>
  │   └── <Backdrop />          ← overlay escuro quando acessibilidade abrita
  │   └── <Page />              ← conteúdo da página
  │
  ├── <Footer />                ← sem prop onOpenAccessibility
  ├── <AccessibilityPanel />    ← portal fixo, independente de página
  ├── <ChatWidget />
  └── <HumanChatWidget />
```

O `Backdrop` escurece a página quando o painel está aberto, mantendo o painel visível e não turvo.

## 04.4 Checklist de acessibilidade

### Implantado

- [x] `prefers-reduced-motion` (framer-motion `useReducedMotion`)
- [x] `aria-label` em links e botões
- [x] `role="main"` via `<main>`
- [x] `aria-hidden="true"` em decorativos
- [x] Foco visível (`focus-visible:ring`)
- [x] Teclado navegável
- [x] TTS integrado
- [x] Contraste (alto contraste toggle)

### Pendências

- [ ] Landmarks ARIA (`role="navigation"`, `role="banner"`, `role="contentinfo"`)
- [ ] Skip link ("Ir ao conteúdo")
- [ ] `lang="pt-BR"` no `<html>`
- [ ] Alt text em todos os SVG decorativos (`aria-hidden="true"`)
- [ ] Redução de movimento em animações complexas (CinematicShowcase, HeroSlider)
- [ ] Botão ESC para fechar modais/painéis

## 04.5 QA — Dispositivos de teste

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
