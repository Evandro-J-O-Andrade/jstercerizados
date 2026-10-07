# MAPA DE MÍDIA — J&S EMPREGOS LTDA

Data: 2026-10-06  
Branch: main @ 1f75702  
Escopo: somente leitura. Nenhum arquivo alterado.

---

## 1. INVENTÁRIO DE ARQUIVOS

### 1.1 `public/images`
Encontradas **200+ imagens** organizadas em subpastas.

#### Pastas principais
| Pasta | Arquivos | Função identificada |
|-------|----------|---------------------|
| `home/` | 20+ | Hero, cards, seções |
| `services/` | 60+ | Cards de serviços, galeria, hero |
| `servicos/` | 80+ | DUPLICADO de `services/` |
| `sobre/` | 30+ | Banners, equipe, CEO, valores |
| `team/` | 9 | DUPLICADO de `sobre/equipe/` |
| `login/` | 100+ | Pacote de profissões, banners, logos |
| `logos/` | 6 | Logos da marca |
| `parceiros/` | 13 | Imagens de parceiros |
| `partners/` | 13 | DUPLICADO de `parceiros/` |
| `vagas/` | 5 | Hero de vagas |
| `suporte/` | 2 | Hero de suporte |
| `icons/` | 9 | Ícones institucionais |
| `illustrations/` | 3 | Ilustrações corporativas |
| `placeholders/` | 3 | Fallbacks globais |
| `processo-seletivo/` | 1 | Imagem de processo |

#### Duplicidades confirmadas
| Arquivo A | Arquivo B | Status |
|-----------|-----------|--------|
| `public/images/parceiros/` | `public/images/partners/` | 🔴 Duplicado |
| `public/images/sobre/equipe/` | `public/images/team/` | 🔴 Duplicado |
| `public/images/services/` | `public/images/servicos/` | 🔴 Duplicado |
| `bannersobre.png` | `bannersobre-.png` | ⚠️ Nome parecido |
| `bannersobre.png` | `bannersobreHD.png` | ⚠️ Nome parecido |
| `bannersobre.png` | `bannersobreMenor.png` | ⚠️ Nome parecido |
| `bannersobre.png` | `bannersobrequalidadefraca.png` | ⚠️ Nome parecido |
| `bannersobre.png` | `bannersobreSemfundo.png` | ⚠️ Nome parecido |
| `bannersobre.png` | `bannersobreSite_EMPREGOS_HD_FUNDO_PRETO.png` | ⚠️ Nome parecido |
| `herologin.jpg` | `herologin.png` | ⚠️ Mesmo arquivo, formatos diferentes |
| `herologin.jpg` | `herologin1.jpg` | ⚠️ Nome parecido |
| `herologin.jpg` | `herologinGrande.jpg` | ⚠️ Nome parecido |
| `logo-js-empregos-Photoroom.png` | `LOGO_JS_SIMBOLO_DOURADO_TRANSP.png` | ⚠️ Logos diferentes? |
| `logomarca.png` | `logomarca-1.png` | ⚠️ Nome parecido |

### 1.2 `src/assets`
**Não existe.** Nenhum arquivo encontrado.

### 1.3 `imagens_para_mover`
**Não existe.** Pasta não encontrada no repositório atual.

---

## 2. REFERÊNCIAS NO CÓDIGO

### 2.1 SafeImage — componente central
Usado em **14 páginas/componentes**:
- `Home.tsx`
- `Sobre.tsx`
- `ServicoDetalhe.tsx`
- `Servicos.tsx`
- `Empresas.tsx`
- `EmpresaDetalhe.tsx`
- `Parceiros.tsx`
- `Fornecedores.tsx`
- `Vagas.tsx`
- `VagaDetalhe.tsx`
- `Login.tsx`
- `ContentBoundary.tsx`
- testes

### 2.2 Configurações de imagem
| Arquivo | Tipo | Status |
|---------|------|--------|
| `src/config/images.ts` | Centralizado | ✅ |
| `src/content/assets.ts` | SERVICE_IMAGES | ✅ |
| `src/components/media/MediaUploader.types.ts` | Tipos | ✅ |

### 2.3 Padrão de consumo
```tsx
<SafeImage
  src={IMAGES.hero.login.src}
  fallbackSrc={IMAGES.hero.login.fallback}
/>
```

**Bom:** Uso do componente `SafeImage` com fallback.

**Problema:** Referências hardcoded diretas a `/images/servicos/gallery-01.svg` etc. em `ServicoDetalhe.tsx`.

---

## 3. MAPA FUNCIONAL

### 3.1 Heroes
| Página | Arquivo | Status |
|--------|---------|--------|
| Home | `home/hero/hero-main.webp` | ✅ |
| Home | `home/hero/hero-security.webp` | ✅ |
| Home | `home/hero/hero-main.svg` | ✅ |
| Home | `home/hero/hero-overlay.svg` | ✅ |
| Home | `home/hero/hero-profissional.svg` | ✅ |
| Sobre | `sobre/banner-js-empregos.jpg` | ✅ |
| Sobre | `sobre/bannersobre.png` | ✅ |
| Serviços | `services/hero.webp` | ✅ |
| Serviços | `servicos/hero/hero.webp` | 🔴 Duplicado |
| Vagas | `vagas/hero/recruitment.webp` | ✅ |
| Suporte | `suporte/hero/suporte.webp` | ✅ |
| Login | `login/herologin.jpg` | ✅ |

### 3.2 Banners
| Página | Arquivo | Status |
|--------|---------|--------|
| Sobre | `sobre/banner-js-empregos.jpg` | ✅ |
| Sobre | `sobre/bannersobre.png` | ✅ |
| Sobre | `sobre/banner-js-empregosAzul.jpg` | ⚠️ Não referenciado |
| Sobre | `sobre/bannerjrtercerizado.png` | ⚠️ Não referenciado |
| Sobre | `sobre/bannersobre-.png` | ⚠️ Nome suspeito |
| Sobre | `sobre/bannersobreHD.png` | ⚠️ Não referenciado |
| Sobre | `sobre/bannersobreMenor.png` | ⚠️ Não referenciado |
| Sobre | `sobre/bannersobrequalidadefraca.png` | ⚠️ Não referenciado |
| Sobre | `sobre/bannersobreSemfundo.png` | ⚠️ Não referenciado |
| Sobre | `sobre/bannersobreSite_EMPREGOS_HD_FUNDO_PRETO.png` | ⚠️ Não referenciado |

### 3.3 Cards
| Página | Arquivo | Status |
|--------|---------|--------|
| Home | `home/cards/cardheros.png` | ✅ |
| Home | `home/cards/cardherosoriginal.png` | ⚠️ Não referenciado |
| Home | `home/cards/cardherosSite.png` | ⚠️ Não referenciado |
| Home | `home/cards/cardherosteste.png` | ⚠️ Não referenciado |
| Home | `home/cards/ChatGPT Image 20 de set. de 2026, 01_09_10.png` | 🗑️ Provisório |
| Home | `home/cards/Gemini_Generated_Image_*.jpg` | 🗑️ Provisório |
| Home | `home/cards/generate-a-service-card-for-cleaning-and-conservat.jpg` | 🗑️ Provisório |

### 3.4 Logos
| Arquivo | Status |
|---------|--------|
| `logos/js-empregos-branco.svg` | ✅ |
| `logos/js-empregos-branco.webp` | ✅ |
| `logos/logomarca.png` | ✅ |
| `logos/logomarca-1.png` | ⚠️ Duplicado? |
| `logos/sidebar-icon.svg` | ✅ |
| `logos/sidebar-logo.svg` | ✅ |
| `login/logo-js-empregos-Photoroom.png` | ⚠️ Não referenciado |
| `login/LOGO_JS_SIMBOLO_DOURADO_TRANSP.png` | ⚠️ Não referenciado |

### 3.5 Galerias
| Entidade | Arquivos | Status |
|----------|----------|--------|
| Serviços | `services/gallery-01.svg` a `gallery-04.svg` | ✅ |
| Serviços | `servicos/gallery/gallery-01.svg` a `gallery-04.svg` | 🔴 Duplicado |
| Sobre/Equipe | `sobre/equipe/*.svg` | ✅ |
| Sobre/Equipe | `team/*.svg` | 🔴 Duplicado |
| Parceiros | `parceiros/*.svg` | ✅ |
| Parceiros | `partners/*.svg` | 🔴 Duplicado |

### 3.6 Depoimentos/Equipe
| Arquivo | Status |
|---------|--------|
| `sobre/equipe/ana-costa.svg` | ✅ |
| `sobre/equipe/carlos-silva.svg` | ✅ |
| `sobre/equipe/fernanda-oliveira.svg` | ✅ |
| `sobre/equipe/marcos-lima.svg` | ✅ |
| `sobre/equipe/patricia-rocha.svg` | ✅ |
| `sobre/equipe/placeholder.svg` | ✅ |
| `sobre/equipe/ricardo-santos.svg` | ✅ |
| `sobre/equipe/thiago-mendes.svg` | ✅ |
| `team/*.svg` | 🔴 Duplicado de `sobre/equipe/` |

### 3.7 Institucional
| Arquivo | Status |
|---------|--------|
| `sobre/mission.svg` | ✅ |
| `sobre/mission.webp` | ✅ |
| `sobre/values.svg` | ✅ |
| `sobre/values.webp` | ✅ |
| `sobre/vision.svg` | ✅ |
| `sobre/about.svg` | ✅ |
| `sobre/about-team.svg` | ✅ |
| `sobre/about-team.webp` | ✅ |
| `sobre/contrato.webp` | ⚠️ Não referenciado |
| `sobre/ceo.jpeg` | ✅ |
| `sobre/ceo.png` | ⚠️ Duplicado? |

### 3.8 Login/Profissões
| Pasta | Arquivos | Status |
|-------|----------|--------|
| `login/zip_por_profissao-PACOTE_300_PROFISSOES_J_S_150_ATUAL/` | 100+ | ⚠️ Pacote de profissões |

**Problema:** Pasta com nome genérico, sem classificação clara. Parece ser um pacote de imagens de profissões para login.

### 3.9 Vagas
| Arquivo | Status |
|---------|--------|
| `vagas/hero/recruitment.svg` | ✅ |
| `vagas/hero/recruitment.webp` | ✅ |
| `vagas/hero/workers.svg` | ✅ |
| `vagas/hero/workers.webp` | ✅ |

### 3.10 Suporte
| Arquivo | Status |
|---------|--------|
| `suporte/hero/suporte.webp` | ✅ |
| `suporte/suporte.webp` | ✅ |

### 3.11 Ícones
| Arquivo | Status |
|---------|--------|
| `icons/building.svg` | ✅ |
| `icons/check.svg` | ✅ |
| `icons/clock.svg` | ✅ |
| `icons/quality.svg` | ✅ |
| `icons/shield.svg` | ✅ |
| `icons/support.svg` | ✅ |
| `icons/users.svg` | ✅ |
| `icons/wrench.svg` | ✅ |

### 3.12 Ilustrações
| Arquivo | Status |
|---------|--------|
| `illustrations/corporate.svg` | ✅ |
| `illustrations/office.svg` | ✅ |
| `illustrations/team.svg` | ✅ |

### 3.13 Placeholders
| Arquivo | Status |
|---------|--------|
| `placeholders/hero-fallback.svg` | ✅ |
| `placeholders/image-placeholder.svg` | ✅ |
| `placeholders/service-fallback.svg` | ✅ |

### 3.14 Processo Seletivo
| Arquivo | Status |
|---------|--------|
| `processo-seletivo/processo.png` | ✅ |

---

## 4. INTEGRIDADE

### 4.1 Arquivos referenciados que não existem
| Referência no código | Arquivo esperado | Status |
|---------------------|------------------|--------|
| `/images/servicos/gallery-01.svg` | `public/images/servicos/gallery-01.svg` | ✅ Existe |
| `/images/servicos/gallery-02.svg` | `public/images/servicos/gallery-02.svg` | ✅ Existe |
| `/images/servicos/gallery-03.svg` | `public/images/servicos/gallery-03.svg` | ✅ Existe |
| `/images/servicos/gallery-04.svg` | `public/images/servicos/gallery-04.svg` | ✅ Existe |
| `/images/sobre/bannersobre.png` | `public/images/sobre/bannersobre.png` | ✅ Existe |
| `/images/sobre/ceo.png` | `public/images/sobre/ceo.png` | ✅ Existe |

### 4.2 Arquivos existentes sem referência
| Arquivo | Status |
|---------|--------|
| `public/images/sobre/banner-js-empregosAzul.jpg` | 🗑️ Órfão |
| `public/images/sobre/bannerjrtercerizado.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobre-.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobreHD.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobreMenor.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobrequalidadefraca.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobreSemfundo.png` | 🗑️ Órfão |
| `public/images/sobre/bannersobreSite_EMPREGOS_HD_FUNDO_PRETO.png` | 🗑️ Órfão |
| `public/images/sobre/contrato.webp` | 🗑️ Órfão |
| `public/images/home/cards/cardherosoriginal.png` | 🗑️ Órfão |
| `public/images/home/cards/cardherosSite.png` | 🗑️ Órfão |
| `public/images/home/cards/cardherosteste.png` | 🗑️ Órfão |
| `public/images/home/cards/ChatGPT Image 20 de set. de 2026, 01_09_10.png` | 🗑️ Provisório |
| `public/images/home/cards/Gemini_Generated_Image_*.jpg` | 🗑️ Provisório |
| `public/images/home/cards/generate-a-service-card-for-cleaning-and-conservat.jpg` | 🗑️ Provisório |
| `public/images/login/logo-js-empregos-Photoroom.png` | 🗑️ Órfão |
| `public/images/login/LOGO_JS_SIMBOLO_DOURADO_TRANSP.png` | 🗑️ Órfão |
| `public/images/login/herologin.jpg` | ⚠️ Referenciado? |
| `public/images/login/herologin1.jpg` | 🗑️ Órfão |
| `public/images/login/herologinGrande.jpg` | 🗑️ Órfão |
| `public/images/login/teste1.jpg` | 🗑️ Órfão |
| `public/images/login/teste2.jpg` | 🗑️ Órfão |
| `public/images/login/teste3.jpg` | 🗑️ Órfão |
| `public/images/login/teste5.jpg` | 🗑️ Órfão |
| `public/images/login/teste7.jpg` | 🗑️ Órfão |
| `public/images/login/teste8.jpg` | 🗑️ Órfão |
| `public/images/parceiros/empresa-vector-engenharia-sistemas.webp` | ⚠️ Referenciado? |
| `public/images/parceiros/empresa-vector-engenharia.webp` | ⚠️ Referenciado? |
| `public/images/partners/empresa-vector-engenharia-sistemas.webp` | 🗑️ Duplicado |
| `public/images/partners/empresa-vector-engenharia.webp` | 🗑️ Duplicado |
| `public/images/sobre/ceo.jpeg` | ⚠️ Referenciado? |
| `public/images/team/*.svg` | 🗑️ Duplicado de `sobre/equipe/` |

### 4.3 Referências quebradas
Nenhuma referência quebrada encontrada no código. Todos os arquivos referenciados existem em `public/images/`.

### 4.4 Referências apontando para local antigo
Nenhuma referência a `jsterceirizados.com.br` em código de aplicação.

### 4.5 Extensões inconsistentes
| Arquivo | Problema |
|---------|----------|
| `herologin.jpg` + `herologin.png` | Mesmo arquivo em dois formatos |
| `bannersobre.png` + `bannersobreHD.png` + `bannersobreMenor.png` | Mesmo banner, versões diferentes |
| `facilities.png` + `facilities.webp` + `facilities.svg` | Mesmo asset, formatos diferentes |
| `limpeza.jpg` + `limpeza.webp` | Mesmo asset, formatos diferentes |

---

## 5. DESTINO FUTURO

| Tipo | Destino provável | Arquivos |
|------|------------------|----------|
| Assets estáticos versionados | Git/public | `icons/`, `illustrations/`, `placeholders/` |
| Logo/branding oficial | Git/public | `logos/`, `login/logo-js-empregos-Photoroom.png` |
| Imagens públicas estáveis | Git/public | `home/hero/`, `sobre/bannersobre.png`, `vagas/hero/` |
| Mídia administrável | Supabase Storage | `services/`, `servicos/`, `parceiros/`, `partners/` |
| Upload de usuário | Supabase Storage | `login/zip_por_profissao-*` |
| Conteúdo editorial gerenciável | Supabase | `sobre/ceo.*`, `sobre/equipe/`, `team/` |
| Arquivos temporários/provisórios | Remover após validação | `home/cards/Gemini_*`, `ChatGPT Image *.png`, `generate-a-service-card-*.jpg` |
| Duplicados | Consolidar | `parceiros/` vs `partners/`, `sobre/equipe/` vs `team/`, `services/` vs `servicos/` |

---

## 6. CLASSIFICAÇÃO POR CONSUMIDOR

| Consumidor | Arquivo | Função | Status |
|------------|---------|--------|--------|
| Home | `home/hero/hero-main.webp` | Hero principal | ✅ |
| Home | `home/cards/cardheros.png` | Card hero | ✅ |
| Home | `home/sections/hero-01.svg` | Seção | ✅ |
| Sobre | `sobre/bannersobre.png` | Banner | ✅ |
| Sobre | `sobre/ceo.png` | CEO | ✅ |
| Sobre | `sobre/equipe/*.svg` | Equipe | ✅ |
| Serviços | `services/*.webp` | Cards | ✅ |
| Serviços | `servicos/gallery/*.svg` | Galeria | 🔴 Duplicado |
| Vagas | `vagas/hero/*.webp` | Hero | ✅ |
| Login | `login/herologin.jpg` | Hero login | ✅ |
| Login | `login/zip_por_profissao-*` | Profissões | ⚠️ |

---

## 7. PROBLEMAS CRÍTICOS

### P0
1. **Duplicação massiva**: `parceiros/` vs `partners/`, `sobre/equipe/` vs `team/`, `services/` vs `servicos/`
2. **Arquivos provisórios em produção**: `Gemini_Generated_Image_*.jpg`, `ChatGPT Image *.png`, `generate-a-service-card-*.jpg`

### P1
3. **Órfãos sem referência**: 20+ arquivos sem uso identificado
4. **Extensões inconsistentes**: mesmos assets em `.jpg`, `.png`, `.webp`, `.svg`
5. **Pacote de profissões sem classificação**: `login/zip_por_profissao-PACOTE_300_PROFISSOES_J_S_150_ATUAL/`

### P2
6. **Nomes de arquivo com espaços/caracteres especiais**: `mao-de-obra-temporaria - Copia.jpg`
7. **Falta de convenção de nomenclatura**: mistura de `kebab-case`, `snake_case`, `PascalCase`

---

## 8. PRÓXIMOS PASSOS

1. **Consolidar duplicidades**: escolher uma pasta canônica para cada domínio
2. **Remover provisórios**: excluir arquivos de teste/Gerados por IA
3. **Classificar órfãos**: validar se realmente não são usados
4. **Definir convenção**: `dominio/categoria/purpose-01.ext`
5. **Migrar para Supabase**: apenas mídia administrável
6. **Manter no Git**: logos, ícones, fallbacks, assets institucionais estáveis

---

## 9. EVIDÊNCIAS

**Nenhum arquivo alterado.** Todos os achados são baseados em leitura do sistema de arquivos e grep no código.

**Arquivos auditados:** 200+ em `public/images/`.

**Comandos executados:**
- `Get-ChildItem` para inventário
- `Select-String` para referências
- `read` para análise de componentes
