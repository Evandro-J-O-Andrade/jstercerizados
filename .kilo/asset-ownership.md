# Asset Ownership / Domínio de Imagens

## Regra

Cada asset pertence a um domínio. Se for usado em mais de um lugar, ele deve viver no domínio canônico ou em `global/` se for realmente institucional.

## Domínios canônicos

| Domínio       | Pasta canônica                        | Substitui        |
| ------------- | ------------------------------------- | ---------------- |
| Serviços      | `public/images/servicos/`             | `services/`      |
| Clientes      | `public/images/clientes/`             | `clients/`       |
| Parceiros     | `public/images/parceiros/`            | `partners/`      |
| Candidatos    | `public/images/candidatos/`           | `candidates/`    |
| Contato       | `public/images/contato/`              | `contact/`       |
| Empresas      | `public/images/empresas/`             | `company/`       |
| Sobre         | `public/images/sobre/`                | `about/`         |
| Login         | `public/images/login/`                | —                |
| Home          | `public/images/home/`                 | —                |
| Hero          | `public/images/hero/`                 | —                |
| Global        | `public/images/global/`               | —                |
| Favicon       | `public/images/global/favicon/`       | `favicons/`      |
| Brand         | `public/images/global/brand/`         | `brand/`         |
| Backgrounds   | `public/images/global/backgrounds/`   | `backgrounds/`   |
| Icons         | `public/images/global/icons/`         | `icons/`         |
| Illustrations | `public/images/global/illustrations/` | `illustrations/` |
| Placeholders  | `public/images/global/placeholders/`  | `placeholders/`  |
| Logos         | `public/images/logos/`                | —                |

## Assets específicos por página

| Página           | Asset                   | Caminho canônico                                 |
| ---------------- | ----------------------- | ------------------------------------------------ |
| Sobre (hero)     | `bannersobre.jpg`       | `/images/sobre/bannersobre.jpg`                  |
| Login (hero)     | `herologin.jpg`         | `/images/login/herologin.jpg`                    |
| Contato (hero)   | `contato.webp`          | `/images/contato/contato.webp`                   |
| Trabalhe Conosco | `trabalhe-conosco.webp` | `/images/trabalhe-conosco/trabalhe-conosco.webp` |
| Suporte          | `suporte.webp`          | `/images/suporte/hero/suporte.webp`              |

## Regras de referência

1. Nenhuma referência deve apontar para pasta legada.
2. Assets específicos de uma página devem ficar no domínio daquela página.
3. Assets institucionais/compartilhados devem ficar em `global/`.
4. Placeholders de 37 bytes não são assets válidos; devem ser removidos ou substituídos.
5. Órfãos não são automaticamente lixo; podem ser reservados para features futuras.

## Correções aplicadas

| Arquivo                | Alteração                                                   |
| ---------------------- | ----------------------------------------------------------- |
| `src/pages/Sobre.tsx`  | `about-team.webp` → `bannersobre.jpg`                       |
| `src/config/images.ts` | login hero: `hero.svg` → `herologin.jpg`                    |
| `src/mock/services.ts` | todas referências `/images/services/` → `/images/servicos/` |
