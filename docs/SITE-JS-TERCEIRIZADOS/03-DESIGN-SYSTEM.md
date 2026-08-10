# 03 — Design System

## 03.1 Paleta de cores

### Cores principais

| Token                  | Light                  | Dark                   |
| ---------------------- | ---------------------- | ---------------------- |
| `--primary`            | `#2563eb` (blue-600)   | `#3b82f6` (blue-500)   |
| `--primary-foreground` | `#ffffff`              | `#0f172a`              |
| `--secondary`          | `#7c3aed` (violet-600) | `#8b5cf6` (violet-500) |
| `--background`         | `#ffffff`              | `#0f172a`              |
| `--surface`            | `#f8fafc`              | `#1e293b`              |
| `--surface-alt`        | `#f1f5f9`              | `#334155`              |
| `--card`               | `#ffffff`              | `#1e293b`              |
| `--border`             | `#e2e8f0`              | `#334155`              |
| `--muted`              | `#f1f5f9`              | `#334155`              |
| `--muted-foreground`   | `#94a3b8`              | `#94a3b8`              |

### Cores de serviços (para destaque visual)

| Serviço          | Cor                |
| ---------------- | ------------------ |
| Assessoria em RH | `text-blue-600`    |
| Recrutamento     | `text-indigo-600`  |
| Mão de obra      | `text-amber-600`   |
| Terceirização    | `text-emerald-600` |
| Facilities       | `text-cyan-600`    |
| Limpeza          | `text-lime-600`    |
| Jardinagem       | `text-green-600`   |

## 03.2 Tipografia

### Fontes

- **Principal:** Inter (varias: 100 900, `font-display`)
- **Monoespaçada:** JetBrains Mono (varias: 100 900)

### Escala de títulos

| Elemento | Classe                    | Mobile | Desktop              |
| -------- | ------------------------- | ------ | -------------------- |
| H1       | `text-4xl font-extrabold` | 36px   | 48px → `sm:text-5xl` |
| H2       | `text-3xl font-bold`      | 30px   | 36px → `sm:text-4xl` |
| H3       | `text-xl font-semibold`   | 20px   | 24px → `lg:text-2xl` |
| Body     | `text-lg`                 | 18px   | —                    |
| Small    | `text-sm`                 | 14px   | —                    |

## 03.3 Componentes

### Button

| Variante    | Uso                             |
| ----------- | ------------------------------- |
| `primary`   | Ações primárias (CTA principal) |
| `secondary` | Ações secundárias               |
| `outline`   | Ações secundárias discretas     |
| `ghost`     | Links/Contexto leve             |

Tamanhos: `sm`, `lg`, `xl`

### SafeImage

```tsx
<SafeImage
  src="/images/..."
  alt="descrição"
  className="h-full w-full object-cover"
  loading="lazy" // ou "eager" para above-fold
  decoding="async"
  skeleton={true} // ou false para imagens críticas
  fallbackSrc="/images/fallbacks/..."
  fallbackType="services" // mapeia para IMAGE_FALLBACKS
/>
```

### Section

```tsx
<Section className="bg-surface-alt">
  <Container>{/* content */}</Container>
</Section>
```

- `Section` = wrapper com padding vertical
- `Container` = max-width centralizado + horizontal padding

## 03.4 Spacing / Grid

### Breakpoints Tailwind

| Prefixo   | Min-width |
| --------- | --------- |
| (default) | 0px       |
| `sm`      | 640px     |
| `md`      | 768px     |
| `lg`      | 1024px    |
| `xl`      | 1280px    |
| `2xl`     | 1536px    |

### Grid padrão de cards

- Serviços: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Vagas: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Differentials: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Stats: `grid-cols-2 sm:grid-cols-4`

## 03.5 Motion

### Easing padrão

```ts
const easing = [0.25, 0.4, 0.25, 1];
```

### Variants padrão para scroll

```ts
staggerReveal(0.1); // stagger children
revealUp; // y: 30 → 0, opacity 0 → 1
staggerItem('up'); // item individual
```
