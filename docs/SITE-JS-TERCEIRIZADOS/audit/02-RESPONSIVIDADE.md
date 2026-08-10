# 02 — Responsividade Audit

## 02.1 Breakpoints testados

| Width  | Device        | Status                |
| ------ | ------------- | --------------------- |
| 360px  | Small Android | ⚠️ Verificar overflow |
| 375px  | iPhone SE     | ⚠️ Verificar overflow |
| 390px  | iPhone 14     | ⚠️ Verificar overflow |
| 414px  | iPhone Plus   | ⚠️ Verificar overflow |
| 768px  | iPad          | ⚠️ Verificar layout   |
| 1024px | iPad Pro      | ⚠️ Verificar layout   |
| 1280px | Laptop        | ✅                    |
| 1440px | Desktop       | ✅                    |

## 02.2 Componentes com risco de overflow

### HeroSplit

- **Imagem:** usa `aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3]`
- **Risco:** A imagem do slide pode não respeitar o container em todos os breakpoints
- **Status:** Progress bar removida ✅, mas verificar proporção da imagem

### CinematicShowcase

- **Imagem:** `fixed inset-0` + `object-cover` + `object-position` responsivo
- **Risco:** Baixo (imagem preenche viewport, sem overflow)
- **Status:** ✅

### ServiceCard

- **Imagem:** `aspect-[4/3]` wrapper + `h-52 sm:h-56`
- **Risco:** Baixo

### Sobre.tsx

- **Imagem:** `SafeImage` com `h-full w-full object-cover` dentro de `grid-cols-1 lg:grid-cols-2`
- **Risco:** Médio — em mobile, a imagem pode ficar muito grande

### ServicoDetalhe.tsx

- **Imagem hero:** `min-h-[85vh]` com `object-cover` — preenche viewport
- **Risco:** Baixo

## 02.3 Testes de QA de imagens

### Checklist (aplicar a todos os componentes)

Nenhuma imagem pode:

- [ ] Estourar horizontalmente
- [ ] Criar scrollbar
- [ ] Deformar
- [ ] Sair do container
- [ ] Empurrar conteúdo
- [ ] Quebrar layout
- [ ] Ficar cortada de forma inadequada

## 02.4 Mobile first

### BottomNavigation

- Aparece apenas em mobile (`lg:pb-0` na main)
- Precisa de overlay quando aberto

### Footer mobile

- Usa `MobileAccordion` para colapsar seções
- `defaultOpen` apenas para "Empresa"

### Navbar mobile

- Hamburger → drawer
- Precisa de focus trap
