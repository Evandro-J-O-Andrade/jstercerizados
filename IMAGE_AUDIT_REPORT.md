# Relatório de Auditoria de Imagens

Data: 2026-08-10

## Estrutura Atual

### Pastas Encontradas

- `about/` - SVGs sobre missão, equipe, valores, visão
- `backgrounds/` - SVGs e WebP de fundo
- `brand/` - Logos, favicons, og-image
- `candidates/` - Imagens de candidatos
- `careers/` - SVGs e WebP de recrutamento/trabalhadores
- `clientes/` - 1 imagem (empresas.png)
- `clients/` - 6 SVGs de logos de clientes
- `company/` - SVGs e WebP sobre a empresa
- `contact/` - SVGs de contato/localização
- `empresas/` - 1 imagem (cadastro-empresas.png)
- `fallbacks/` - 3 fallbacks existentes (contato, servicos, vagas)
- `favicons/` - favicons
- `gallery/` - placeholder
- `hero/` - Muitas subpastas e arquivos
- `icons/` - SVGs de ícones
- `illustrations/` - SVGs de ilustrações
- `logos/` - Logos da empresa
- `partners/` - SVGs e WebP de parceiros
- `placeholders/` - SVGs de placeholder
- `processo-seletivo/` - 1 imagem
- `services/` - 48 imagens de serviços
- `suporte/` - suporte.webp (consolidado de support/)
- `team/` - 7 SVGs de equipe
- `trabalhe-conosco/` - 1 imagem

## Problemas Identificados

### 1. Pastas Duplicadas/Redundantes

- `clientes/` e `clients/` - mesmo propósito
- `about/` e `company/` - conteúdo sobreposto (missão, valores, equipe)
- `suporte/` e `support/` - já consolidado

### 2. Nomes Não Padronizados

- Mistura de kebab-case, camelCase, underscores
- Arquivos como `redimencionar-1000-1000-b12c78afebdc59ee01d0a5a49cf7681a.webp`
- `cardheros.png`, `bannerjs.png`

### 3. Logos com Nome Antigo

- `logos/js-tercerizados-branco.svg/webp` - já renomeado

### 4. Falta de Fallbacks

- `fallbacks/` tem apenas: contato.png, servicos.png, vagas.png
- Faltam: empresas, parceiros, candidatos, blog

### 5. Estrutura de Hero Bagunçada

- `hero/home/` tem arquivos temporários `redimencionar-*`
- Subpastas por página: contato, fornecedores, login, parceiros, servicos, sobre, suporte, trabalhe-conosco
- Mistura de SVGs e PNGs na raiz do hero

### 6. Mistura de Formatos

- SVGs, PNGs, WebPs misturados sem padronização
- Mesmo conteúdo em múltiplos formatos (ex: logo.svg, logo.webp, logomarca.png)

## Proposta de Reorganização

### Estrutura Nova

```
public/images/
├── brand/                     # Mantém - identidade da marca
│   ├── logo.svg
│   ├── logo-dark.svg
│   ├── logo-white.svg
│   ├── logo-footer.webp
│   ├── og-image.svg
│   └── watermark-logo.svg
│
├── logos/                     # Renomear arquivos restantes para padronizar
│   ├── js-empregos-branco.svg
│   ├── js-empregos-branco.webp
│   ├── logomarca.png
│   ├── logomarca-1.png
│   ├── sidebar-icon.svg
│   └── sidebar-logo.svg
│
├── favicons/                  # Mantém
├── backgrounds/               # Mantém
├── icons/                     # Mantém
├── illustrations/             # Mantém
│
├── fallbacks/                 # Expandir com fallbacks categorizados
│   ├── default.webp           # NOVO - fallback global
│   ├── vagas.webp             # JÁ EXISTE
│   ├── servicos.webp          # JÁ EXISTE
│   ├── contato.webp           # JÁ EXISTE
│   ├── empresas.webp          # NOVO
│   ├── parceiros.webp         # NOVO
│   ├── candidatos.webp        # NOVO
│   └── blog.webp              # NOVO
│
├── team/                      # Manter - SVGs da equipe
│
├── clients/                   # Consolidar clientes aqui
│   ├── alpha.svg
│   ├── beta.svg
│   ├── delta.svg
│   ├── epslon.svg
│   ├── gama.svg
│   └── zeta.svg
│
├── services/                  # Manter - já bem organizado
│
├── partners/                  # Renomear alguns arquivos
│   ├── business.svg
│   ├── network.svg
│   ├── partnership.svg
│   ├── company-a.svg → parceiro-a.svg
│   ├── company-b.svg → parceiro-b.svg
│   ├── company-c.svg → parceiro-c.svg
│   ├── company-d.svg → parceiro-d.svg
│   ├── company-e.svg → parceiro-e.svg
│   ├── company-f.svg → parceiro-f.svg
│   ├── mistral.webp
│   ├── vector-engenharia.webp
│   ├── cadrempresaspareceiras.png → cadastro-empresas-pareceiras.png
│   └── partnership.webp
│
├── hero/                      # Reorganizar
│   ├── home/
│   │   ├── hero-01.svg
│   │   ├── hero-02.svg
│   │   ├── hero-03.svg
│   │   ├── fallback.svg
│   │   ├── hero-main.webp
│   │   ├── banner-principal.png
│   │   └── banner-secundario.png
│   ├── servicos/
│   ├── sobre/
│   ├── empresas/
│   ├── candidatos/
│   ├── parceiros/
│   ├── contato/
│   ├── suporte/
│   ├── processo-seletivo/
│   ├── trabalhe-conosco/
│   └── login/
│
├── company/                   # Consolidar com about/ - REMOVER
│   └── (mover conteúdo para pastas apropriadas)
│
├── about/                     # Consolidar com company/ - REMOVER
│   └── (mover conteúdo para pastas apropriadas)
│
├── candidates/                # Manter
├── careers/                   # Manter
├── contact/                   # Manter
├── empresas/                  # Manter
├── gallery/                   # Manter
├── placeholders/              # Manter
├── processo-seletivo/         # Manter
├── suporte/                   # Manter (consolidado)
├── team/                      # Manter
└── trabalhe-conosco/          # Manter
```

## Ações Imediatas

1. ✅ Consolidar `support/` em `suporte/` - FEITO
2. ✅ Renomear logos `js-tercerizados` para `js-empregos` - FEITO
3. Renomear arquivos de hero para nomes descritivos
4. Criar fallbacks faltantes
5. Atualizar referências no código

## Arquivos a Renomear

### Hero

- `hero/redimencionar-1000-1000-b12c78afebdc59ee01d0a5a49cf7681a.webp` → `hero/home/banner-principal.webp`
- `hero/redimencionar-269-60-8d6bd0e6fcc05c8ce8704def9f578921.webp` → `hero/home/banner-secundario.webp`
- `hero/redimencionar-527-692-cd437b5e6a83aa35b78dfafd154ec77c.png` → `hero/home/banner-terciario.png`
- `hero/cardheros.png` → `hero/home/card-hero.png`
- `hero/bannerjs.png` → `hero/home/banner-js.png`
- `hero/banner-j&s.png` → `hero/home/banner-js-empregos.png`

### Partners

- `partners/company-a.svg` → `partners/parceiro-a.svg`
- `partners/company-b.svg` → `partners/parceiro-b.svg`
- `partners/company-c.svg` → `partners/parceiro-c.svg`
- `partners/company-d.svg` → `partners/parceiro-d.svg`
- `partners/company-e.svg` → `partners/parceiro-e.svg`
- `partners/company-f.svg` → `partners/parceiro-f.svg`
- `partners/cadrempresaspareceiras.png` → `partners/cadastro-empresas-pareceiras.png`

### Logos

- `logos/jslogomarca.png` → `logos/logomarca.png`
- `logos/jslogomarca1.png` → `logos/logomarca-1.png`

### Services

- `services/trabalho-tercerizado.png` → `services/trabalho-terceirizado.png`
- `services/trabalho-free-lance.png` → `services/trabalho-freelance.png`

## Fallbacks a Criar

- `fallbacks/default.webp` (global)
- `fallbacks/empresas.webp`
- `fallbacks/parceiros.webp`
- `fallbacks/candidatos.webp`
- `fallbacks/blog.webp`

## Código a Atualizar

### src/config/assets.ts

- Atualizar caminhos após renomeações

### src/content/assets.ts

- Atualizar caminhos após renomeações

### src/mock/services.ts

- Atualizar caminhos após renomeações

### src/mock/partners.ts

- Atualizar caminhos após renomeações

### src/pages/*

- Verificar todas as referências a imagens
