# Design System — J&S Empregos LTDA

Checkpoint de referência: `16f1d20`

---

## 1. Paleta

### Semântica

| Token              | Light              | Dark               | Uso                |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `background`       | `hsl(215 82% 97%)` | `hsl(215 35% 10%)` | Fundo geral        |
| `foreground`       | `hsl(215 33% 20%)` | `hsl(0 0% 97%)`    | Texto principal    |
| `surface`          | `#ffffff`          | `hsl(215 33% 20%)` | Superfície elevada |
| `surface-alt`      | `hsl(215 45% 93%)` | `hsl(215 28% 28%)` | Seções alternadas  |
| `card`             | `#ffffff`          | `hsl(215 33% 20%)` | Cards              |
| `border`           | `hsl(215 30% 85%)` | `hsl(215 28% 30%)` | Bordas             |
| `primary`          | `hsl(43 74% 40%)`  | `hsl(43 74% 40%)`  | Ação principal     |
| `secondary`        | `hsl(215 30% 85%)` | `hsl(215 28% 28%)` | Ação secundária    |
| `muted`            | `hsl(215 45% 93%)` | `hsl(215 28% 28%)` | Fundo suave        |
| `muted-foreground` | `hsl(215 15% 45%)` | `hsl(215 10% 70%)` | Texto secundário   |
| `accent`           | `hsl(43 74% 40%)`  | `hsl(215 28% 28%)` | Destaque           |
| `success`          | `hsl(140 60% 45%)` | `hsl(140 60% 55%)` | Sucesso            |
| `warning`          | `hsl(43 90% 50%)`  | `hsl(43 90% 60%)`  | Alerta             |
| `danger`           | `hsl(0 84% 60%)`   | `hsl(0 70% 60%)`   | Erro               |

### Marca

| Token              | Valor     | Uso             |
| ------------------ | --------- | --------------- |
| `navy`             | `215`     | Base estrutural |
| `gold`             | `43`      | Ação principal  |
| `social-whatsapp`  | `#25d366` | WhatsApp        |
| `social-instagram` | `#e4405f` | Instagram       |
| `social-facebook`  | `#1877f2` | Facebook        |
| `social-linkedin`  | `#0a66c2` | LinkedIn        |
| `social-youtube`   | `#ff0000` | YouTube         |
| `social-tiktok`    | `#fe2c55` | TikTok          |

---

## 2. Tipografia

- Fonte primária: **Inter** (100–900)
- Fonte mono: **JetBrains Mono**
- Tamanhos: `xs` até `8xl`
- Heading weight: **700**
- Letter spacing headings: `-0.02em`
- Line-height relaxed: `1.8` (acessibilidade)

---

## 3. Espaçamento

| Token | Valor     |
| ----- | --------- |
| `xs`  | `0.25rem` |
| `sm`  | `0.5rem`  |
| `md`  | `1rem`    |
| `lg`  | `1.5rem`  |
| `xl`  | `2rem`    |
| `2xl` | `3rem`    |
| `3xl` | `4.5rem`  |
| `4xl` | `6rem`    |

Grid responsivo:

- `sm`: `minmax(250px, 1fr)`
- `md`: `minmax(300px, 1fr)`
- `lg`: `minmax(350px, 1fr)`
- `xl`: `minmax(400px, 1fr)`

---

## 4. Bordas e Radius

| Token     | Valor     |
| --------- | --------- |
| `none`    | `0`       |
| `sm`      | `0.25rem` |
| `DEFAULT` | `0.5rem`  |
| `md`      | `0.5rem`  |
| `lg`      | `0.75rem` |
| `xl`      | `1rem`    |
| `2xl`     | `1.5rem`  |
| `3xl`     | `2rem`    |
| `full`    | `9999px`  |

Cards padrão: `rounded-2xl` (`1.5rem`)
Cards compactos: `rounded-xl` (`1rem`)

---

## 5. Sombras

| Token      | Valor                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| `premium`  | `0 4px 24px hsla(215, 35%, 10%, 0.08), 0 1px 3px hsla(215, 35%, 10%, 0.06)`                                     |
| `elevated` | `0 20px 60px hsla(215, 35%, 10%, 0.15), 0 4px 20px hsla(215, 35%, 10%, 0.1), 0 0 0 1px hsla(43, 74%, 40%, 0.1)` |
| `dramatic` | `0 20px 25px -5px rgba(16, 42, 67, 0.15), 0 8px 10px -6px rgba(16, 42, 67, 0.1)`                                |
| `glass`    | `0 8px 32px hsla(215, 35%, 10%, 0.2)`                                                                           |
| `glow`     | `0 0 20px hsla(43, 74%, 40%, 0.4)`                                                                              |
| `glow-lg`  | `0 0 30px hsla(43, 74%, 40%, 0.5), 0 4px 20px hsla(215, 35%, 10%, 0.3)`                                         |

---

## 6. Animações

### Easing

| Token      | Valor                               |
| ---------- | ----------------------------------- |
| `smooth`   | `cubic-bezier(0.4, 0, 0.2, 1)`      |
| `bounce`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)`        |

### Duração

| Token     | Valor  |
| --------- | ------ |
| `fast`    | `0.2s` |
| `normal`  | `0.3s` |
| `slow`    | `0.5s` |
| `slowest` | `0.8s` |

### Keyframes

- `float-slow`: 8s, translateY(-20px) rotate(2deg)
- `float-medium`: 6s, translateY(-10px) rotate(-1deg)
- `float-fast`: 4s, translateY(-15px) rotate(-1deg)
- `pulse-glow`: 3s, opacity 0.3–0.6
- `gradient-shift`: 6s, background-position
- `shimmer`: 2s, translateX(-100%) → translateX(100%)

---

## 7. Estados

### Hover

- Cards: `translateY(-1px)` + borda + sombra
- Botões: `brightness(1.05)` ou `scale(1.02)`
- Links: cor `primary/80`

### Focus

- Outline: `2px solid hsl(var(--primary))`
- Outline offset: `2px`
- Focus mode: `.focus-mode :focus`

### Active/Tap

- Scale: `0.98`
- Duração: `0.1s`

---

## 8. Acessibilidade

- `prefers-reduced-motion`: `.reduce-motion` desativa animações
- High contrast: `.high-contrast`
- Highlight links: `.highlight-links`
- Increased spacing: `.increased-spacing` (line-height 1.8, letter-spacing 0.02em)
- Fonte display: `swap`

---

## 9. Componentes base

### Card

- Raio: `rounded-2xl`
- Borda: `1px solid hsl(var(--border))`
- Fundo: `hsl(var(--card))`
- Sombra: `shadow-premium`
- Hover: `shadow-premium` + borda + translateY

### Botão

- Raio: `rounded-full` (primário) / `rounded-xl` (secundário)
- Padding: `px-6 py-3`
- Font: `font-medium`
- Transição: `transition-colors`

### Input

- Raio: `rounded-lg`
- Borda: `1px solid hsl(var(--border))`
- Focus: `border-primary` + ring

---

## 10. Regras de uso

1. **Nunca usar cor hardcoded** fora de `src/styles/index.css`
2. **Sempre usar tokens semânticos** (`primary`, `surface`, `muted-foreground`)
3. **Evitar glassmorphism** sem propósito
4. **Manter hierarquia visual**: surface → card → conteúdo
5. **Mobile-first**: responsividade real, não apenas redução
6. **Acessibilidade first**: contraste, foco, reduced-motion
7. **Performance**: animações em `transform`/`opacity` apenas
8. **Consistência**: reutilizar componentes antes de criar novos

---

## 11. Próximos passos

- [ ] PREMIUM-02: padronizar Card/Button/Surface system
- [ ] PREMIUM-03: Home visual hierarchy
- [ ] PREMIUM-04: Clientes / mini-cases
- [ ] PREMIUM-05: Timeline Comic
- [ ] PREMIUM-06: Mobile premium
- [ ] AI-01: Chatbot
- [ ] A11Y-01: Acessibilidade
- [ ] FINAL-AUDIT
