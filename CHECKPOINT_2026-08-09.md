# Ponto de Restauração — J&S Terceirizados LTDA

Data: 2026-08-09

## Objetivo

Corrigir consistência visual, overlays, responsividade, acessibilidade, UTF-8 e layout em todas as páginas, preservando a arquitetura existente.

## Alterações realizadas

### 1. Overlays com fundo opaco + blur

- Criadas classes CSS `.overlay-backdrop` e `.overlay-panel` em `src/styles/index.css`
- Aplicadas em:
  - `src/components/ui/ChatWidget.tsx`
  - `src/components/ui/HumanChatWidget.tsx`
  - `src/components/ui/AccessibilityWidget.tsx`
  - `src/components/layout/Navbar.tsx` (drawer mobile)
- Garante legibilidade do texto sobre os painéis e desfoca o fundo atrás deles

### 2. Barra de rolagem removida

- `src/styles/index.css` agora usa `scrollbar-width: none` e `::-webkit-scrollbar { display: none }`
- Rolagem permanece funcional, mas sem barra visual na lateral

### 3. Botões flutuantes mobile alinhados

- `ChatWidget.tsx` e `HumanChatWidget.tsx`: ambos posicionados em `bottom-[calc(6rem+env(safe-area-inset-bottom))]`
- `AccessibilityWidget.tsx`: mesma altura do chat no mobile
- Cores unificadas: `bg-primary text-primary-foreground`

### 4. Ícones dos botões flutuantes

- **Acessibilidade** (`AccessibilityWidget.tsx`):
  - Desktop: ícone de cadeira + texto “Acessibilidade”
  - Mobile: apenas ícone de cadeira
- **Fale com atendente / Chat** (`ChatWidget.tsx` e `HumanChatWidget.tsx`):
  - Desktop: ícone `Headphones` + texto “Fale com atendente”
  - Mobile: apenas ícone `Headphones`

### 5. Menu mobile do Navbar reorganizado

- Links agrupados por categoria com cabeçalhos:
  - **Navegação**
  - **Empresas**
  - **Candidatos**
  - **Ações**
- Drawer agora usa `.overlay-panel` e `.overlay-backdrop`
- Espaçamento entre grupos aumentado

### 6. Footer mobile ajustado

- Adicionado link **Login** na seção **Atendimento** (`src/components/layout/Footer.tsx`)
- Aumentado `padding-bottom` do container mobile para `pb-56`
- Adicionado `<div className="mt-6" />` no accordion Fale Conosco para empurrar conteúdo
- Bottom Bar (`© ...` / `Desenvolvido por ...`) agora com `bg-background/95` + `backdrop-blur-xl` no mobile, garantindo que o texto não fique escondido pelos ícones flutuantes
- No desktop, Bottom Bar continua transparente

### 7. Navegação inferior (BottomNavigation) atualizada

- Adicionado item **Login** com ícone `LogIn`
- Barra inferior mobile agora exibe: Início, Vagas, Serviços, Empresas, Candidatos e Login

### 8. Ícones de redes sociais do footer com cor e animação

- Cada rede tem sua cor própria (`bg` + `iconColor`):
  - WhatsApp: verde `#25d366`
  - Instagram: rosa `#e4405f`
  - Facebook: azul `#1877f2`
  - TikTok: vermelho/rosa `#fe2c55`
  - LinkedIn: azul `#0a66c2`
  - YouTube: vermelho `#ff0000`
- Animação no hover: brilho colorido com `blur-md` aparece atrás do ícone
- Compatível com dark e light mode

### 9. Demais ajustes anteriores preservados

- Lazy Supabase initialization
- CSS utility classes: `.card-base`, `.card-hover`, `.section-heading`, `.btn-primary`, `.input-base`
- `border-border` adicionado em cards de múltiplas páginas
- Footer restruturado em grid 12 colunas
- Metallic gradient hover effects nos ícones sociais do footer desktop
- Toggle knobs da acessibilidade alterados para `bg-background`
- Estilos do Blog corrigidos

## Arquivos modificados

- `src/styles/index.css`
- `src/components/ui/AccessibilityWidget.tsx`
- `src/components/ui/ChatWidget.tsx`
- `src/components/ui/HumanChatWidget.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/BottomNavigation.tsx`

## Build e validação

- `npm run build` — sucesso
- `npx tsc --noEmit` — sem erros

## Observação

Este commit serve como ponto de restauração seguro antes de iniciar a refatoração.
