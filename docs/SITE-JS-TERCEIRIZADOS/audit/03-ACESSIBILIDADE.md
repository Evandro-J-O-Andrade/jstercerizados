# 03 — Acessibilidade Audit

## 03.1 Recursos implementados

| Recurso                  | Local                       | Status              |
| ------------------------ | --------------------------- | ------------------- |
| prefers-reduced-motion   | `useReducedMotion` (framer) | ✅ Global           |
| Font size toggle         | AccessibilityWidget         | ✅                  |
| High contrast toggle     | AccessibilityWidget         | ✅                  |
| Reduced motion toggle    | AccessibilityWidget         | ✅                  |
| Highlight links toggle   | AccessibilityWidget         | ✅                  |
| Increased spacing toggle | AccessibilityWidget         | ✅                  |
| Focus mode toggle        | AccessibilityWidget         | ✅                  |
| TTS (texto-para-fala)    | AccessibilityWidget         | ✅                  |
| Teclado navegável        | Todos componentes           | ✅ (verificar foco) |
| Focus ring visível       | `focus-visible:ring`        | ✅ Parcial          |
| Skip link                | ❌                          | Não implementado    |
| ESC fecha modais         | ❌                          | Parcial             |
| Landmarks ARIA           | ❌                          | Não implementado    |

## 03.2 Problemas críticos

### 1. AccessibilityWidget como layer turvo

**Problema:** O AccessibilityWidget está posicionado após o Footer em App.tsx. Quando aberto, ele cria um overlay que escurece a página — mas o próprio painel pode ficar turvo se o backdrop não for implementado corretamente.

**Correção:** Implementar arquitetura:

```text
<App>
  ├── <main />
  ├── <Footer />
  ├── <Backdrop />          ← overlay que escurece
  ├── <AccessibilityPanel /> ← painel em cima do backdrop
  ├── <ChatWidget />
  └── <HumanChatWidget />
```

### 2. CinematicShowcase e foco

**Problema:** A abertura cinematográfica usa `position: fixed` e `z-[90]`. Se o usuário navegar com teclado durante a animação, o foco pode ficar preso.

**Solução:**

- `tabindex="-1"` no container
- Retornar o foco ao final da animação
- ESC pula a animação

## 03.3 Checklist de acessibilidade

### HTML

- [ ] `lang="pt-BR"` no `<html>`
- [ ] Skip link no topo da página
- [ ] Landmarks ARIA (`banner`, `main`, `contentinfo`, `navigation`)

### Imagens

- [ ] `alt` em todas as imagens
- [ ] `aria-hidden="true"` em SVGs decorativos
- [ ] Texto alternativo para imagens informativas

### Formulários

- [ ] `label` associado a cada `input`
- [ ] `aria-required` em campos obrigatórios
- [ ] Mensagens de erro acessíveis (`aria-live`)

### Navegação

- [ ] Foco visível em todos os elementos interativos
- [ ] Ordem de tabulação lógica
- [ ] ESC fecha modais, menus, painéis
- [ ] `aria-expanded` em menus colapsáveis

### Animações

- [ ] `prefers-reduced-motion` respeitado em todos os componentes
- [ ] CinematicShowcase: skip 500ms ✅
- [ ] HeroSplit: pausa auto-play no hover ✅
