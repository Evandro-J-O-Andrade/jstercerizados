# Z-Index e Overlays

## Escala de z-index

| Camada                      | z-index        | Uso                                           |
| --------------------------- | -------------- | --------------------------------------------- |
| Base                        | `z-0` a `z-10` | Conteúdo normal, cards, seções                |
| Overlays leves              | `z-20`         | Badges, tooltips, pequenos destaques          |
| Navegação inferior          | `z-30`         | `BottomNavigation`                            |
| Overlays / Backdrops        | `z-40`         | ChatWidget backdrop, Footer, backdrops gerais |
| Modais e painéis principais | `z-50`         | AccessibilityWidget, mobile drawer, modais    |

## Regras

- Nunca usar valores acima de `z-50` sem avaliação.
- Backdrops devem estar sempre abaixo do painel que eles cobrem.
- Painéis de acessibilidade e modais devem ter prioridade máxima (`z-50`).
- Evitar `z-50` em elementos permanentes (botões flutuantes, headers) que não sejam modais.

## Backdrops

Padrão recomendado:

```text
bg-black/30 backdrop-blur-sm
```

Exceções:

- CinematicIntro: `bg-black/20` (intencionalmente mais leve)
- Navbar scroll: `backdrop-blur-xl` sem fundo preto (efeito glass)

## Sombras

| Nome              | Uso               |
| ----------------- | ----------------- |
| `shadow-premium`  | Cards principais  |
| `shadow-elevated` | Cards elevados    |
| `shadow-glow`     | Botões com glow   |
| `shadow-glow-lg`  | Botões flutuantes |
| `shadow-2xl`      | Drawers e modais  |
