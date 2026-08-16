# GATE-BRAND-ASSETS-01 — Mapeamento de Identidade Visual

## 1. Objetivo

Mapear os assets de identidade da marca J&S Empregos sem executar substituições ou limpeza destrutiva.

## 2. Assets de identidade identificados

### 2.1 Favicon

| Arquivo                                               | Tamanho       | Referenciado | Destino atual                       |
| ----------------------------------------------------- | ------------- | ------------ | ----------------------------------- |
| `public/images/favicons/favicon.svg`                  | 681 bytes     | ✅ Sim       | `<link rel="icon">` em `index.html` |
| `public/images/favicons/favicon.png`                  | 275881 bytes  | ❌ Não       | —                                   |
| `public/images/favicons/favicon.jpg`                  | 422631 bytes  | ❌ Não       | —                                   |
| `public/images/favicons/favicon-dark.svg`             | 685 bytes     | ❌ Não       | —                                   |
| `public/images/favicons/favicon-light.svg`            | 681 bytes     | ❌ Não       | —                                   |
| `public/images/favicons/favicon.webp`                 | 37 bytes      | ❌ Não       | Placeholder corrompido              |
| `public/images/favicons/escudojs.png`                 | 1531615 bytes | ❌ Não       | Escudo J&S — sem uso atual          |
| `public/images/global/favicon/favicon.svg`            | 681 bytes     | ❌ Não       | Duplicata exata do favicon.svg      |
| `public/images/global/favicon/favicon.webp`           | 37 bytes      | ❌ Não       | Placeholder corrompido              |
| `public/images/global/favicon/faveicon.jpg`           | 422631 bytes  | ❌ Não       | Duplicata de favicons/favicon.jpg   |
| `imagens para mover/favicon e logo marca/favicon.png` | 275881 bytes  | ❌ Não       | Duplicata de favicons/favicon.png   |

### 2.2 Logomarca principal

| Arquivo                                                       | Tamanho       | Referenciado | Destino atual                    |
| ------------------------------------------------------------- | ------------- | ------------ | -------------------------------- |
| `public/images/global/brand/logomarca.png`                    | 2043161 bytes | ❌ Não       | —                                |
| `public/images/global/brand/jslogomarca.png`                  | 2043161 bytes | ❌ Não       | Mesmo SHA de logomarca.png       |
| `public/images/logos/logomarca.png`                           | 2043161 bytes | ❌ Não       | Mesmo SHA de logomarca.png       |
| `public/images/brand/logomarca.png`                           | 1272090 bytes | ❌ Não       | Tamanho diferente                |
| `public/images/hero/home/logomarca.png`                       | 1272090 bytes | ❌ Não       | Mesmo SHA de brand/logomarca.png |
| `public/images/home/sections/logomarca.png`                   | 1272090 bytes | ❌ Não       | Mesmo SHA de brand/logomarca.png |
| `public/images/global/brand/logomarca-1.png`                  | 188723 bytes  | ❌ Não       | Photoroom                        |
| `public/images/global/brand/jslogomarca-Photoroom.png`        | 188723 bytes  | ❌ Não       | Mesmo SHA de logomarca-1.png     |
| `public/images/logos/logomarca-1.png`                         | 188723 bytes  | ❌ Não       | Mesmo SHA de logomarca-1.png     |
| `public/images/global/brand/logomarca.jpg`                    | 551681 bytes  | ❌ Não       | —                                |
| `public/images/global/brand/logmarca3d.png`                   | 1196806 bytes | ❌ Não       | —                                |
| `imagens para mover/logomarca.jpg`                            | 551681 bytes  | ❌ Não       | —                                |
| `imagens para mover/jslogomarca.png`                          | 2043161 bytes | ❌ Não       | —                                |
| `imagens para mover/jslogomarca-Photoroom.png`                | 188723 bytes  | ❌ Não       | —                                |
| `imagens para mover/logmarca3d.png`                           | 1196806 bytes | ❌ Não       | —                                |
| `imagens para mover/favicon e logo marca/logomarca.png`       | 274001 bytes  | ❌ Não       | Tamanho diferente                |
| `imagens para mover/favicon e logo marca/logomarcafooter.png` | 452999 bytes  | ❌ Não       | —                                |

### 2.3 Escudo J&S

| Arquivo                               | Tamanho       | Referenciado | Destino pretendido        |
| ------------------------------------- | ------------- | ------------ | ------------------------- |
| `public/images/favicons/escudojs.png` | 1531615 bytes | ❌ Não       | A definir — sem uso atual |

### 2.4 Outros assets de marca

| Arquivo                                              | Tamanho    | Referenciado | Destino atual                                   |
| ---------------------------------------------------- | ---------- | ------------ | ----------------------------------------------- |
| `public/images/global/brand/logo.svg`                | 683 bytes  | ✅ Sim       | Navbar, Footer, SEO schema, manifest            |
| `public/images/brand/logo.svg`                       | 683 bytes  | ❌ Não       | Duplicata exata                                 |
| `public/images/global/brand/logo-dark.svg`           | 433 bytes  | ❌ Não       | —                                               |
| `public/images/global/brand/logo-white.svg`          | 685 bytes  | ❌ Não       | —                                               |
| `public/images/global/brand/logo-footer.webp`        | 7802 bytes | ❌ Não       | —                                               |
| `public/images/brand/logo-footer.webp`               | 7802 bytes | ❌ Não       | —                                               |
| `public/images/global/brand/sidebar-logo.svg`        | 1248 bytes | ✅ Sim       | Config `IMAGES.logo.sidebar`                    |
| `public/images/logos/sidebar-logo.svg`               | 1248 bytes | ❌ Não       | Duplicata exata                                 |
| `public/images/global/brand/sidebar-icon.svg`        | 739 bytes  | ✅ Sim       | Config `IMAGES.logo.sidebarIcon`                |
| `public/images/global/brand/watermark-logo.svg`      | 859 bytes  | ✅ Sim       | Config `IMAGES.hero.watermark` + ServicoDetalhe |
| `public/images/brand/watermark-logo.svg`             | 859 bytes  | ❌ Não       | Duplicata exata                                 |
| `public/images/global/brand/og-image.svg`            | 3853 bytes | ✅ Sim       | SEO.tsx fallback + index.html og:image          |
| `public/images/brand/og-image.svg`                   | 3853 bytes | ❌ Não       | Duplicata exata                                 |
| `public/images/global/brand/apple-touch-icon.svg`    | 693 bytes  | ✅ Sim       | index.html                                      |
| `public/images/brand/apple-touch-icon.svg`           | 693 bytes  | ❌ Não       | Duplicata exata                                 |
| `public/images/global/brand/js-empregos-branco.svg`  | 457 bytes  | ❌ Não       | —                                               |
| `public/images/logos/js-empregos-branco.svg`         | 457 bytes  | ❌ Não       | —                                               |
| `public/images/global/brand/js-empregos-branco.webp` | 37 bytes   | ❌ Não       | Placeholder                                     |
| `public/images/logos/js-empregos-branco.webp`        | 37 bytes   | ❌ Não       | Placeholder                                     |

## 3. Mapeamento de referências no código

### 3.1 `index.html`

```html
<link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg" />
<link rel="apple-touch-icon" href="/images/brand/apple-touch-icon.svg" />
<meta property="og:image" content="/images/brand/og-image.svg" />
<meta name="twitter:image" content="/images/brand/og-image.svg" />
```

### 3.2 `src/config/images.ts`

```ts
logo: {
  light: '/images/global/brand/logo.svg',
  dark: '/images/global/brand/logo.svg',
  sidebar: '/images/global/brand/sidebar-logo.svg',
  sidebarIcon: '/images/global/brand/sidebar-icon.svg',
  favicon: '/images/global/favicon/favicon.svg',
},
hero: {
  watermark: '/images/global/brand/watermark-logo.svg',
}
```

### 3.3 `src/components/layout/Navbar.tsx`

```tsx
src={IMAGES.logo.dark} // → /images/global/brand/logo.svg
```

### 3.4 `src/components/layout/Footer.tsx`

```tsx
src={IMAGES.logo.dark} // → /images/global/brand/logo.svg
```

### 3.5 `src/components/ui/SEO.tsx`

```ts
const pageImage = image ?? '/images/brand/og-image.svg';
// Schema.org
logo: '/images/brand/logo.svg',
```

### 3.6 `src/pages/ServicoDetalhe.tsx`

```tsx
src = '/images/brand/watermark-logo.svg';
```

### 3.7 `public/manifest.json`

```json
{
  "src": "/images/brand/logo.svg"
}
```

## 4. Análise de adequação

### 4.1 Favicon

**Atual:** `public/images/favicons/favicon.svg` (681 bytes)

**Candidatos:**

- `public/images/favicons/favicon.png` (275881 bytes) — PNG maior, não referenciado
- `public/images/favicons/favicon.jpg` (422631 bytes) — JPG maior, não referenciado
- `public/images/favicons/escudojs.png` (1531615 bytes) — Escudo J&S, não referenciado

**Avaliação:**

- O SVG atual é leve e funciona como favicon.
- `escudojs.png` é um PNG grande (1.5 MB). Para favicon, seria necessário redimensionar para 32x32 ou 64x64 e converter para PNG/ICO. Não recomendado como está.
- `favicon.png` e `favicon.jpg` são versões rasterizadas; se quiser usar PNG/JPG como favicon, seria melhor otimizar antes.

### 4.2 Logomarca principal

**Atual:** `public/images/global/brand/logo.svg` (683 bytes) — usado em Navbar, Footer, SEO, manifest

**Candidatos:**

- `public/images/global/brand/logomarca.png` (2043161 bytes) — PNG grande, não referenciado
- `public/images/global/brand/logomarca.jpg` (551681 bytes) — JPG médio, não referenciado
- `public/images/global/brand/logmarca3d.png` (1196806 bytes) — 3D, não referenciado
- `imagens para mover/logomarca.jpg` (551681 bytes) — mesma imagem de logomarca.jpg

**Avaliação:**

- O SVG atual é vetorial, leve e adequado para navbar/footer.
- `logomarca.png` é um PNG de 2 MB — muito pesado para uso web direto sem compressão/redimensionamento.
- `logomarca.jpg` é um JPG de 551 KB — também pesado para navbar.
- `logmarca3d.png` é uma versão 3D — pode ser útil para hero institucional ou landing, mas não para navbar compacta.

### 4.3 Escudo J&S (`escudojs.png`)

**Arquivo:** `public/images/favicons/escudojs.png` (1531615 bytes)

**Avaliação:**

- PNG de 1.5 MB — precisa ser redimensionado e otimizado antes de qualquer uso web.
- Como é um escudo/brasão, pode funcionar como:
  - Avatar institucional em dashboards
  - Selo em certificados/documentos
  - Elemento decorativo em seção Sobre
  - Ícone de perfil organizacional
- **Não recomendado para navbar/footer** sem antes verificar proporções e redimensionar.

### 4.4 Logomarca footer

**Arquivo:** `imagens para mover/favicon e logo marca/logomarcafooter.png` (452999 bytes)

**Avaliação:**

- Ainda em `imagens para mover/` — não movido para `public/`
- Tamanho de 453 KB — precisa de otimização
- Se for uma versão compacta/horizontal do footer, pode substituir o SVG atual no Footer após validação visual.

## 5. Estrutura recomendada

```
public/images/
├── favicons/
│   ├── favicon.svg          # atual, leve, OK
│   ├── favicon.png          # opcional, se quiser fallback PNG
│   └── escudojs.png         # futuro: redimensionar para 64x64 ou 128x128
│
├── global/
│   └── brand/
│       ├── logo.svg         # atual, usado em Navbar/Footer/SEO
│       ├── logo-dark.svg    # opcional, se precisar variante escura
│       ├── logo-white.svg   # opcional, se precisar variante clara
│       ├── logo-footer.webp # opcional, se quiser versão footer
│       ├── sidebar-logo.svg # atual, OK
│       ├── sidebar-icon.svg # atual, OK
│       ├── watermark-logo.svg # atual, OK
│       ├── og-image.svg     # atual, OK
│       ├── apple-touch-icon.svg # atual, OK
│       ├── logomarca.png    # futuro: versão PNG para download/impressão
│       └── logomarca.jpg    # futuro: versão JPG compacta
│
├── logos/
│   ├── logomarca.png        # legado — consolidar em global/brand/
│   ├── logomarca-1.png      # legado — consolidar em global/brand/
│   ├── sidebar-logo.svg     # legado — consolidar em global/brand/
│   └── js-empregos-branco.svg # legado — avaliar uso
│
└── favicons/                # legado — consolidar em favicons/
    ├── favicon-dark.svg
    ├── favicon-light.svg
    ├── favicon.webp         # placeholder — remover
    ├── escudojs.png         # manter — avaliar uso futuro
    ├── favicon.png
    ├── favicon.jpg
    ├── logmarca3d-Photoroom.png
    └── logomarca-Photoroom.png
```

## 6. Ações sugeridas (sem execução)

### 6.1 Imediatas (sem risco)

1. **Confirmar se `escudojs.png` será usado em algum componente futuro** antes de redimensionar/otimizar.
2. **Decidir se `logomarcafooter.png` substituirá o SVG atual no Footer** — requer avaliação visual das proporções.
3. **Decidir se `logomarca.png` (2 MB) será usado em algum lugar** — se sim, otimizar antes de referenciar.

### 6.2 Médio prazo

4. **Consolidar duplicatas** de brand assets em `global/brand/` após confirmar que não há referências quebradas.
5. **Remover placeholders de 37 bytes** após confirmar que não são referenciados.
6. **Atualizar `manifest.json`** se a logo principal for trocada de `.svg` para `.png`.

### 6.3 Não fazer agora

- ❌ Não substituir `logo.svg` por `logomarca.png` sem testar proporções na Navbar/Footer
- ❌ Não usar `escudojs.png` como favicon sem redimensionar
- ❌ Não apagar SVGs de brand antes de confirmar que os PNGs correspondentes estão referenciados
- ❌ Não mover `imagens para mover/` para `public/` sem classificação prévia

## 7. Conclusão

Os assets de identidade visual estão **mapeados e classificados**.

O sistema atual usa:

- `logo.svg` para Navbar/Footer/SEO
- `sidebar-logo.svg` para sidebar
- `sidebar-icon.svg` para ícone
- `watermark-logo.svg` para marca d'água
- `og-image.svg` para Open Graph
- `apple-touch-icon.svg` para iOS
- `favicon.svg` para favicon

Os candidatos a substituição (`logomarca.png`, `logomarcafooter.png`, `escudojs.png`) **existem mas não estão referenciados**. Qualquer substituição deve ser feita apenas após:

1. Validação visual das proporções
2. Otimização de tamanho
3. Atualização do registry `src/config/images.ts`
4. Teste em todos os breakpoints

**Nenhuma alteração foi executada.** Este é um relatório de diagnóstico para embasar a próxima etapa.
