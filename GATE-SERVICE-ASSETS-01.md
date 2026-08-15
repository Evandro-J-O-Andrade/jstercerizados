# GATE-SERVICE-ASSETS-01 — Relatório de Mapeamento de Assets

> **Fase:** Implementação cirúrgica de mappings de imagem
> **Data:** 2026-08-15
> **Regra:** Nome do arquivo é a referência do serviço/cliente. Não renomear assets sem necessidade. Não inventar asset para preencher lacuna.

---

## 1. Assets de Serviços

### 1.1 Inventário de arquivos

Pasta: `public/images/services/`

Total: 53 arquivos.

### 1.2 Serviços no catálogo

Fonte: `src/services/mock/services.ts` (`mockServices`)

Total: 25 serviços.

### 1.3 Matching — Antes / Depois

| Serviço                    | Asset antes                  | Asset depois               | Status                     |
| -------------------------- | ---------------------------- | -------------------------- | -------------------------- |
| Recrutamento e Seleção     | `recrutamento-alt.jfif`      | `recrutamento-alt.jfif`    | ✅                         |
| Mão de Obra Temporária     | `mao-de-obra-real.webp`      | `mao-de-obra-real.webp`    | ✅                         |
| Mão de Obra Efetiva        | `mao-de-obra-real.webp`      | `mao-de-obra-real.webp`    | ⚠️ repetido com temporária |
| Assessoria em RH           | `assessoria-rh.png`          | `assessoria-rh.png`        | ✅                         |
| Avaliação de Perfil        | `avaliacao-perfil.svg`       | `avaliacao-perfil.svg`     | ✅                         |
| Banco de Talentos          | `banco-talento.jfif`         | `banco-talento.jfif`       | ✅                         |
| Processo de RH             | `avaliacao-perfil.svg`       | `solucao-rh.jfif`          | ✅ corrigido               |
| Executive Search (Hunting) | `hunting.svg`                | `hunting.svg`              | ✅                         |
| Facilities                 | `facilities-real.webp`       | `facilities-real.webp`     | ✅                         |
| Jardinagem                 | `jardinagem-real.webp`       | `jardinagem-real.webp`     | ✅                         |
| Limpeza de Fachada         | `limpeza-de-fachada.webp`    | `limpeza-de-fachada.webp`  | ✅                         |
| Limpeza de Vidros          | `limpeza-de-vidros.webp`     | `limpeza-de-vidros.webp`   | ✅                         |
| Faxina Diarista            | `faxina.webp`                | `faxina.webp`              | ✅                         |
| Limpeza Pós-Obra           | `limpeza-pos-obra.webp`      | `limpeza-pos-obra.webp`    | ✅                         |
| Limpeza Pré-Mudança        | `limpeza-pre-mudanca.webp`   | `limpeza-pre-mudanca.webp` | ✅                         |
| Limpeza Pós-Mudança        | `limpeza-pos-mudanca.webp`   | `limpeza-pos-mudanca.webp` | ✅                         |
| Terceirização              | `terceirizacao-real.webp`    | `terceirizacao-real.webp`  | ✅                         |
| Zeladoria e Manutenção     | `limpeza-de-manutencao.webp` | `zeladoria-real.png`       | ✅ corrigido               |
| Cadastro de Currículo      | `banco-talento.jfif`         | `banco-talento.jfif`       | ⚠️ repetido                |
| Busca de Vagas             | `recrutamento-alt.jfif`      | `recrutamento-alt.jfif`    | ⚠️ repetido                |
| Alertas de Emprego         | `banco-talento.jfif`         | `banco-talento.jfif`       | ⚠️ repetido                |
| Orientação Profissional    | `avaliacao-perfil.svg`       | `avaliacao-perfil.svg`     | ⚠️ repetido                |
| Atualização de Currículo   | `banco-talento.jfif`         | `banco-talento.jfif`       | ⚠️ repetido                |
| Controle de Acesso         | `controle-acesso.jfif`       | `controle-acesso.jfif`     | ✅                         |
| Recepção e Portaria        | `portaria.svg`               | `portaria.svg`             | ✅                         |

### 1.4 Assets sem serviço correspondente (pendências)

| Arquivo                             | Motivo                                                    |
| ----------------------------------- | --------------------------------------------------------- |
| `assessoria-rh2.png`                | Duplicata de `assessoria-rh.png`                          |
| `banco-talento-real.jfif`           | Duplicata de `banco-talento.jfif`                         |
| `banco-talentos.svg`                | Slug divergente (`banco-talentos` vs `banco-de-talentos`) |
| `cardzeladoria.png`                 | Sem serviço correspondente                                |
| `facilities.png`                    | Duplicata                                                 |
| `facilities.svg`                    | Duplicata                                                 |
| `facilities-alt.jfif`               | Duplicata                                                 |
| `facilities-jardinagem.webp`        | Sem serviço correspondente                                |
| `gallery-01.svg` a `gallery-04.svg` | Genéricos de galeria                                      |
| `hero.webp`                         | Genérico                                                  |
| `jardinagem-real.webp`              | Duplicata de `jardinagem.webp`                            |
| `limpeza.svg`                       | Genérico                                                  |
| `limpeza-escritorio.jfif`           | Sem serviço correspondente                                |
| `limpeza-higienizacao.webp`         | Sem serviço correspondente                                |
| `limpeza-pesada.webp`               | Sem serviço correspondente                                |
| `reception.svg`                     | Duplicata de `recepcao.svg`                               |
| `security.svg`                      | Genérico                                                  |
| `seguranca-patrimonial.svg`         | Slug divergente                                           |
| `servicos.png`                      | Genérico                                                  |
| `servicos-real.webp`                | Genérico                                                  |
| `solucao-rh.jfif`                   | Agora usado por `processo-de-rh`                          |
| `trabalho-freelance.png`            | Sem serviço correspondente                                |
| `trabalho-terceirizado.png`         | Sem serviço correspondente                                |
| `zeladoria.svg`                     | Sem serviço correspondente                                |

### 1.5 Serviços sem imagem própria (pendências)

| Serviço                  | Asset atual             | Problema                           |
| ------------------------ | ----------------------- | ---------------------------------- |
| Mão de Obra Efetiva      | `mao-de-obra-real.webp` | Mesmo asset de Temporária          |
| Cadastro de Currículo    | `banco-talento.jfif`    | Mesmo asset de Banco de Talentos   |
| Busca de Vagas           | `recrutamento-alt.jfif` | Mesmo asset de Recrutamento        |
| Alertas de Emprego       | `banco-talento.jfif`    | Mesmo asset de Banco de Talentos   |
| Orientação Profissional  | `avaliacao-perfil.svg`  | Mesmo asset de Avaliação de Perfil |
| Atualização de Currículo | `banco-talento.jfif`    | Mesmo asset de Banco de Talentos   |

> **Ação:** Não inventar asset. Registrar como pendência para produção futura.

---

## 2. Assets de Clientes

### 2.1 Inventário de arquivos

Pasta: `public/images/clientes/`

Total: 8 arquivos.

### 2.2 Clientes no catálogo

Fonte: `src/mock/clients.ts` (`CLIENTS_LIST`)

Total: 4 clientes.

### 2.3 Matching — Antes / Depois

| Cliente           | Asset antes              | Asset depois             | Status                 |
| ----------------- | ------------------------ | ------------------------ | ---------------------- |
| Abarca Móveis     | `abarca-moveis.avif`     | `abarca-moveis.avif`     | ✅                     |
| Vector Engenharia | `vector-engenharia.webp` | `vector-engenharia.webp` | ✅                     |
| Mistral Vidros    | `mistral-vidros.webp`    | `mistral-vidros.webp`    | ✅                     |
| Vectro Engenharia | `vector-engenharia.webp` | `vector-engenharia.webp` | ⚠️ repetido com Vector |

### 2.4 Assets sem cliente correspondente (pendências)

| Arquivo                                   | Motivo                                                         |
| ----------------------------------------- | -------------------------------------------------------------- |
| `empresas.png`                            | Genérico                                                       |
| `empresa-vector-engenharia.webp`          | Sem cliente correspondente                                     |
| `empresa-vector-engenharia-sistemas.webp` | Sem cliente correspondente                                     |
| `logo abarca_Prancheta 1.avif`            | Nome divergente (`logo abarca_Prancheta 1` vs `abarca-moveis`) |

### 2.5 Clientes sem imagem própria (pendências)

| Cliente           | Problema                         |
| ----------------- | -------------------------------- |
| Vectro Engenharia | Mesmo asset de Vector Engenharia |

> **Ação:** Não inventar asset. Registrar como pendência para produção futura.

---

## 3. Correções aplicadas

| Arquivo                         | Correção                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `src/content/assets.ts`         | `zeladoriaReal` alterado de `limpeza-de-manutencao.webp` para `zeladoria-real.png` |
| `src/content/assets.ts`         | Adicionado `processoRh: '/images/services/solucao-rh.jfif'`                        |
| `src/services/mock/services.ts` | `processo-de-rh` agora usa `SERVICE_IMAGES.processoRh`                             |

---

## 4. Validação

- `npx tsc --noEmit` — ✅ PASS
- `npm run build` — ✅ PASS
- `git diff --check` — ✅ PASS

---

## 5. Próximos passos

1. Produzir assets específicos para serviços repetidos (Mão de Obra Efetiva, Cadastro de Currículo, etc.)
2. Produzir asset para `Vectro Engenharia`
3. Limpar assets duplicados/sem uso após aprovação

---

---

## 6. Classificação por domínio

> Regra: página é dona dos seus assets. `global/` somente para recursos genuinamente transversais.

### 6.1 GLOBAL — Identidade e recursos transversais

| Arquivo atual                                  | Tipo         | Destino                 |
| ---------------------------------------------- | ------------ | ----------------------- |
| `brand/logo.svg`                               | Brand        | `global/brand/`         |
| `brand/logo-dark.svg`                          | Brand        | `global/brand/`         |
| `brand/logo-white.svg`                         | Brand        | `global/brand/`         |
| `brand/logo-footer.webp`                       | Brand        | `global/brand/`         |
| `brand/og-image.svg`                           | Brand        | `global/brand/`         |
| `brand/watermark-logo.svg`                     | Brand        | `global/brand/`         |
| `brand/apple-touch-icon.svg`                   | Brand        | `global/brand/`         |
| `logos/js-empregos-branco.svg`                 | Brand        | `global/brand/`         |
| `logos/js-empregos-branco.webp`                | Brand        | `global/brand/`         |
| `logos/logomarca.png`                          | Brand        | `global/brand/`         |
| `logos/logomarca-1.png`                        | Brand        | `global/brand/`         |
| `logos/sidebar-icon.svg`                       | Brand        | `global/brand/`         |
| `logos/sidebar-logo.svg`                       | Brand        | `global/brand/`         |
| `favicons/favicon.svg`                         | Favicon      | `global/favicon/`       |
| `favicons/favicon-dark.svg`                    | Favicon      | `global/favicon/`       |
| `favicons/favicon-light.svg`                   | Favicon      | `global/favicon/`       |
| `favicons/favicon.webp`                        | Favicon      | `global/favicon/`       |
| `icons/building.svg`                           | Icon         | `global/icons/`         |
| `icons/check.svg`                              | Icon         | `global/icons/`         |
| `icons/clock.svg`                              | Icon         | `global/icons/`         |
| `icons/quality.svg`                            | Icon         | `global/icons/`         |
| `icons/shield.svg`                             | Icon         | `global/icons/`         |
| `icons/support.svg`                            | Icon         | `global/icons/`         |
| `icons/users.svg`                              | Icon         | `global/icons/`         |
| `icons/wrench.svg`                             | Icon         | `global/icons/`         |
| `illustrations/corporate.svg`                  | Illustration | `global/illustrations/` |
| `illustrations/office.svg`                     | Illustration | `global/illustrations/` |
| `illustrations/team.svg`                       | Illustration | `global/illustrations/` |
| `placeholders/hero-fallback.svg`               | Placeholder  | `global/placeholders/`  |
| `placeholders/image-placeholder.svg`           | Placeholder  | `global/placeholders/`  |
| `placeholders/service-fallback.svg`            | Placeholder  | `global/placeholders/`  |
| `backgrounds/dots.svg`                         | Background   | `global/backgrounds/`   |
| `backgrounds/grid.svg`                         | Background   | `global/backgrounds/`   |
| `backgrounds/noise.svg`                        | Background   | `global/backgrounds/`   |
| `backgrounds/pattern.svg`                      | Background   | `global/backgrounds/`   |
| `backgrounds/waves.svg`                        | Background   | `global/backgrounds/`   |
| `imagens para mover/faveicon.jpg`              | Favicon      | `global/favicon/`       |
| `imagens para mover/jslogomarca.png`           | Brand        | `global/brand/`         |
| `imagens para mover/jslogomarca-Photoroom.png` | Brand        | `global/brand/`         |
| `imagens para mover/logomarca.jpg`             | Brand        | `global/brand/`         |
| `imagens para mover/logmarca3d.png`            | Brand        | `global/brand/`         |

**Total global:** 40 arquivos

### 6.2 HOME

| Arquivo atual                                                           | Tipo   | Destino          |
| ----------------------------------------------------------------------- | ------ | ---------------- |
| `hero/home/banner-principal.webp`                                       | Banner | `home/banners/`  |
| `hero/home/banner-secundario.webp`                                      | Banner | `home/banners/`  |
| `hero/home/banner-terciario.png`                                        | Banner | `home/banners/`  |
| `hero/home/cardheros.png`                                               | Card   | `home/cards/`    |
| `hero/home/cardheros1.png`                                              | Card   | `home/cards/`    |
| `hero/home/cardheros2.png`                                              | Card   | `home/cards/`    |
| `hero/home/cardheros3.png`                                              | Card   | `home/cards/`    |
| `hero/home/cardherosteste.png`                                          | Card   | `home/cards/`    |
| `hero/home/fallback.svg`                                                | UI     | `home/sections/` |
| `hero/home/hero-01.svg`                                                 | Hero   | `home/sections/` |
| `hero/home/hero-02.svg`                                                 | Hero   | `home/sections/` |
| `hero/home/hero-03.svg`                                                 | Hero   | `home/sections/` |
| `hero/home/logomarca.png`                                               | Brand  | `home/sections/` |
| `hero/banner-js.png`                                                    | Banner | `home/banners/`  |
| `hero/banner-js-empregos.png`                                           | Banner | `home/banners/`  |
| `hero/hero-main.svg`                                                    | Hero   | `home/hero/`     |
| `hero/hero-main.webp`                                                   | Hero   | `home/hero/`     |
| `hero/hero-overlay.svg`                                                 | Hero   | `home/hero/`     |
| `hero/hero-profissional.svg`                                            | Hero   | `home/hero/`     |
| `hero/hero-security.svg`                                                | Hero   | `home/hero/`     |
| `hero/hero-security.webp`                                               | Hero   | `home/hero/`     |
| `hero/servicos-hero.webp`                                               | Hero   | `home/sections/` |
| `imagens para mover/banner.jpg`                                         | Banner | `home/banners/`  |
| `imagens para mover/ChatGPT Image 15 de ago. de 2026, 02_01_29 (1).png` | AI     | `home/sections/` |
| `imagens para mover/Gemini_Generated_Image_*.png`                       | AI     | `home/sections/` |

**Total home:** 28 arquivos

### 6.3 SERVIÇOS

| Arquivo atual                                       | Tipo    | Destino                            |
| --------------------------------------------------- | ------- | ---------------------------------- |
| `services/assessoria-rh.png`                        | Serviço | `servicos/assessoria-rh/`          |
| `services/assessoria-rh2.png`                       | Serviço | `servicos/assessoria-rh/`          |
| `services/avaliacao-perfil.svg`                     | Serviço | `servicos/avaliacao-perfil/`       |
| `services/banco-talento.jfif`                       | Serviço | `servicos/banco-de-talentos/`      |
| `services/banco-talento-real.jfif`                  | Serviço | `servicos/banco-de-talentos/`      |
| `services/banco-talentos.svg`                       | Serviço | `servicos/banco-de-talentos/`      |
| `services/cleaning.svg`                             | Serviço | `servicos/limpeza/`                |
| `services/controle-acesso.jfif`                     | Serviço | `servicos/controle-acesso/`        |
| `services/controle-acesso.svg`                      | Serviço | `servicos/controle-acesso/`        |
| `services/facilities-alt.jfif`                      | Serviço | `servicos/facilities/`             |
| `services/facilities-jardinagem.webp`               | Serviço | `servicos/facilities/`             |
| `services/facilities-real.webp`                     | Serviço | `servicos/facilities/`             |
| `services/facilities.png`                           | Serviço | `servicos/facilities/`             |
| `services/facilities.svg`                           | Serviço | `servicos/facilities/`             |
| `services/faxina.webp`                              | Serviço | `servicos/faxina-diarista/`        |
| `services/gallery-01.svg` a `gallery-04.svg`        | UI      | `servicos/gallery/`                |
| `services/hero.webp`                                | Hero    | `servicos/hero/`                   |
| `services/hunting.svg`                              | Serviço | `servicos/hunting/`                |
| `services/jardinagem-real.webp`                     | Serviço | `servicos/jardinagem/`             |
| `services/jardinagem.webp`                          | Serviço | `servicos/jardinagem/`             |
| `services/limpeza-de-fachada.webp`                  | Serviço | `servicos/limpeza-de-fachada/`     |
| `services/limpeza-de-manutencao.webp`               | Serviço | `servicos/limpeza/`                |
| `services/limpeza-de-vidros.webp`                   | Serviço | `servicos/limpeza-de-vidros/`      |
| `services/limpeza-escritorio.jfif`                  | Serviço | `servicos/limpeza/`                |
| `services/limpeza-higienizacao.webp`                | Serviço | `servicos/limpeza/`                |
| `services/limpeza-pesada.webp`                      | Serviço | `servicos/limpeza-pesada/`         |
| `services/limpeza-pos-mudanca.webp`                 | Serviço | `servicos/limpeza-pos-mudanca/`    |
| `services/limpeza-pos-obra.webp`                    | Serviço | `servicos/limpeza-pos-obra/`       |
| `services/limpeza-pre-mudanca.webp`                 | Serviço | `servicos/limpeza-pre-mudanca/`    |
| `services/limpeza-real.webp`                        | Serviço | `servicos/limpeza/`                |
| `services/limpeza.svg`                              | Serviço | `servicos/limpeza/`                |
| `services/maintenance.svg`                          | Serviço | `servicos/zeladoria/`              |
| `services/mao-de-obra-real.webp`                    | Serviço | `servicos/mao-de-obra/`            |
| `services/mao-de-obra.webp`                         | Serviço | `servicos/mao-de-obra/`            |
| `services/monitoramento.svg`                        | Serviço | `servicos/controle-acesso/`        |
| `services/portaria.svg`                             | Serviço | `servicos/portaria/`               |
| `services/recepcao.svg`                             | Serviço | `servicos/portaria/`               |
| `services/reception.svg`                            | Serviço | `servicos/portaria/`               |
| `services/recrutamento-alt.jfif`                    | Serviço | `servicos/recrutamento-selecao/`   |
| `services/recrutamento.svg`                         | Serviço | `servicos/recrutamento-selecao/`   |
| `services/security.svg`                             | Serviço | `servicos/seguranca-patrimonial/`  |
| `services/seguranca-patrimonial.svg`                | Serviço | `servicos/seguranca-patrimonial/`  |
| `services/servicos-real.webp`                       | Serviço | `servicos/hero/`                   |
| `services/servicos.png`                             | Serviço | `servicos/hero/`                   |
| `services/solucao-rh.jfif`                          | Serviço | `servicos/processo-de-rh/`         |
| `services/terceirizacao-real.webp`                  | Serviço | `servicos/terceirizacao/`          |
| `services/terceirizacao.webp`                       | Serviço | `servicos/terceirizacao/`          |
| `services/trabalho-freelance.png`                   | Serviço | `servicos/trabalho-freelance/`     |
| `services/trabalho-terceirizado.png`                | Serviço | `servicos/trabalho-terceirizado/`  |
| `services/zeladoria-real.png`                       | Serviço | `servicos/zeladoria/`              |
| `services/zeladoria.svg`                            | Serviço | `servicos/zeladoria/`              |
| `imagens para mover/Avaliacao de Perfi.jpg`         | Serviço | `servicos/avaliacao-perfil/`       |
| `imagens para mover/Banco de Talentos.jpg`          | Serviço | `servicos/banco-de-talentos/`      |
| `imagens para mover/Controle de Acesso.jpg`         | Serviço | `servicos/controle-acesso/`        |
| `imagens para mover/Executive Search (Hunting).jpg` | Serviço | `servicos/hunting/`                |
| `imagens para mover/limpeza.jpg`                    | Serviço | `servicos/limpeza/`                |
| `imagens para mover/limpezaantes.jpg`               | Serviço | `servicos/limpeza/`                |
| `imagens para mover/Mão de Obra Efetiva.jpg`        | Serviço | `servicos/mao-de-obra-efetiva/`    |
| `imagens para mover/Mão de Obra Temporaria.jpg`     | Serviço | `servicos/mao-de-obra-temporaria/` |
| `imagens para mover/Processo de RH.jpg`             | Serviço | `servicos/processo-de-rh/`         |
| `imagens para mover/Recepcao e Portaria.jpg`        | Serviço | `servicos/portaria/`               |
| `imagens para mover/recepcao.jpg`                   | Serviço | `servicos/portaria/`               |
| `imagens para mover/recepcao.png`                   | Serviço | `servicos/portaria/`               |
| `imagens para mover/Segurança.jpg`                  | Serviço | `servicos/seguranca-patrimonial/`  |
| `imagens para mover/Terceirizacao.jpg`              | Serviço | `servicos/terceirizacao/`          |
| `imagens para mover/Zeladoria e Manutencao.jpg`     | Serviço | `servicos/zeladoria/`              |

**Total serviços:** 64 arquivos

### 6.4 CLIENTES/PARCEIROS

| Arquivo atual                                                      | Tipo        | Destino      |
| ------------------------------------------------------------------ | ----------- | ------------ |
| `clientes/abarca-moveis.avif`                                      | Cliente     | `clientes/`  |
| `clientes/empresa-vector-engenharia-sistemas.webp`                 | Cliente     | `clientes/`  |
| `clientes/empresa-vector-engenharia.webp`                          | Cliente     | `clientes/`  |
| `clientes/empresas.png`                                            | Cliente     | `clientes/`  |
| `clientes/logo abarca_Prancheta 1.avif`                            | Cliente     | `clientes/`  |
| `clientes/mistral-vidros-real.webp`                                | Cliente     | `clientes/`  |
| `clientes/mistral-vidros.webp`                                     | Cliente     | `clientes/`  |
| `clientes/vector-engenharia.webp`                                  | Cliente     | `clientes/`  |
| `clients/alpha.svg`                                                | Placeholder | `clientes/`  |
| `clients/beta.svg`                                                 | Placeholder | `clientes/`  |
| `clients/delta.svg`                                                | Placeholder | `clientes/`  |
| `clients/epslon.svg`                                               | Placeholder | `clientes/`  |
| `clients/gama.svg`                                                 | Placeholder | `clientes/`  |
| `clients/zeta.svg`                                                 | Placeholder | `clientes/`  |
| `partners/business.svg`                                            | Partner     | `parceiros/` |
| `partners/cadastro-empresas-pareceiras.png`                        | Partner     | `parceiros/` |
| `partners/empresa-abarca.avif`                                     | Partner     | `parceiros/` |
| `partners/mistral.webp`                                            | Partner     | `parceiros/` |
| `partners/network.svg`                                             | Partner     | `parceiros/` |
| `partners/parceiro-a.svg`                                          | Partner     | `parceiros/` |
| `partners/parceiro-b.svg`                                          | Partner     | `parceiros/` |
| `partners/parceiro-c.svg`                                          | Partner     | `parceiros/` |
| `partners/parceiro-d.svg`                                          | Partner     | `parceiros/` |
| `partners/parceiro-e.svg`                                          | Partner     | `parceiros/` |
| `partners/parceiro-f.svg`                                          | Partner     | `parceiros/` |
| `partners/partnership.svg`                                         | Partner     | `parceiros/` |
| `partners/partnership.webp`                                        | Partner     | `parceiros/` |
| `partners/vector-engenharia.webp`                                  | Partner     | `parceiros/` |
| `hero/home/empresa-vector-engenharia.webp`                         | Partner     | `parceiros/` |
| `hero/home/empresa-vector-engenharia-sistemas.webp`                | Partner     | `parceiros/` |
| `hero/home/mistral.webp`                                           | Partner     | `parceiros/` |
| `imagens para mover/Abarca Moveis.jpg`                             | Cliente     | `clientes/`  |
| `imagens para mover/Vector Engenharia e Sistemas de Automacao.jpg` | Cliente     | `clientes/`  |
| `imagens para mover/Mistral Vidros.jpg`                            | Cliente     | `clientes/`  |
| `imagens para mover/Vectro Engenharia.jpg`                         | Cliente     | `clientes/`  |

**Total clientes/parceiros:** 35 arquivos

### 6.5 SOBRE/EMPRESA

| Arquivo atual                        | Tipo   | Destino           |
| ------------------------------------ | ------ | ----------------- |
| `about/mission.svg`                  | Sobre  | `sobre/mission/`  |
| `about/team.svg`                     | Sobre  | `sobre/equipe/`   |
| `about/values.svg`                   | Sobre  | `sobre/values/`   |
| `about/vision.svg`                   | Sobre  | `sobre/vision/`   |
| `company/about-team.svg`             | Sobre  | `sobre/equipe/`   |
| `company/about-team.webp`            | Sobre  | `sobre/equipe/`   |
| `company/about.svg`                  | Sobre  | `sobre/about/`    |
| `company/contrato.webp`              | Sobre  | `sobre/contrato/` |
| `company/mission.svg`                | Sobre  | `sobre/mission/`  |
| `company/mission.webp`               | Sobre  | `sobre/mission/`  |
| `company/values.svg`                 | Sobre  | `sobre/values/`   |
| `company/values.webp`                | Sobre  | `sobre/values/`   |
| `team/ana-costa.svg`                 | Equipe | `sobre/equipe/`   |
| `team/carlos-silva.svg`              | Equipe | `sobre/equipe/`   |
| `team/fernanda-oliveira.svg`         | Equipe | `sobre/equipe/`   |
| `team/marcos-lima.svg`               | Equipe | `sobre/equipe/`   |
| `team/patricia-rocha.svg`            | Equipe | `sobre/equipe/`   |
| `team/placeholder.svg`               | Equipe | `sobre/equipe/`   |
| `team/ricardo-santos.svg`            | Equipe | `sobre/equipe/`   |
| `team/thiago-mendes.svg`             | Equipe | `sobre/equipe/`   |
| `team/time-rh.jfif`                  | Equipe | `sobre/equipe/`   |
| `imagens para mover/nossaequipe.jpg` | Equipe | `sobre/equipe/`   |

**Total sobre/empresa:** 22 arquivos

### 6.6 CONTATO/SUPORTE

| Arquivo atual                    | Tipo    | Destino         |
| -------------------------------- | ------- | --------------- |
| `contact/contact.svg`            | Contato | `contato/hero/` |
| `contact/location.svg`           | Contato | `contato/hero/` |
| `contato/contato.webp`           | Contato | `contato/hero/` |
| `suporte/suporte.webp`           | Suporte | `suporte/hero/` |
| `imagens para mover/contato.png` | Contato | `contato/hero/` |

**Total contato/suporte:** 5 arquivos

### 6.7 VAGAS/CARREIRAS

| Arquivo atual                    | Tipo     | Destino                 |
| -------------------------------- | -------- | ----------------------- |
| `careers/recruitment.svg`        | Carreira | `vagas/hero/`           |
| `careers/recruitment.webp`       | Carreira | `vagas/hero/`           |
| `careers/workers.svg`            | Carreira | `vagas/hero/`           |
| `careers/workers.webp`           | Carreira | `vagas/hero/`           |
| `processo-seletivo/processo.png` | Processo | `processo-seletivo/`    |
| `fallbacks/vagas.png`            | Fallback | `vagas/fallbacks/`      |
| `fallbacks/candidatos.svg`       | Fallback | `candidatos/fallbacks/` |

**Total vagas/carreiras:** 7 arquivos

### 6.8 CANDIDATOS/EMPRESAS

| Arquivo atual                       | Tipo      | Destino               |
| ----------------------------------- | --------- | --------------------- |
| `candidates/busca-vagas.png`        | Candidato | `candidatos/hero/`    |
| `candidates/cadastro-curriculo.png` | Candidato | `candidatos/hero/`    |
| `empresas/cadastro-empresas.png`    | Empresa   | `empresas/hero/`      |
| `fallbacks/empresas.svg`            | Fallback  | `empresas/fallbacks/` |

**Total candidatos/empresas:** 4 arquivos

### 6.9 CONSTRUÇÃO

| Arquivo atual                        | Tipo       | Destino       |
| ------------------------------------ | ---------- | ------------- |
| `construcao/cardenconstrucao.png`    | Construção | `construcao/` |
| `construcao/galeriaenconstrucao.png` | Construção | `construcao/` |

**Total construção:** 2 arquivos

### 6.10 TRABALHE CONOSCO

| Arquivo atual                            | Tipo             | Destino                  |
| ---------------------------------------- | ---------------- | ------------------------ |
| `trabalhe-conosco/trabalhe-conosco.webp` | Trabalhe conosco | `trabalhe-conosco/hero/` |

**Total trabalhe conosco:** 1 arquivo

### 6.11 HERO ESPECÍFICOS POR PÁGINA

| Arquivo atual                    | Tipo | Destino                  |
| -------------------------------- | ---- | ------------------------ |
| `hero/contato/hero.svg`          | Hero | `contato/hero/`          |
| `hero/fornecedores/hero.svg`     | Hero | `parceiros/hero/`        |
| `hero/login/hero.svg`            | Hero | `login/hero/`            |
| `hero/parceiros/hero.svg`        | Hero | `parceiros/hero/`        |
| `hero/servicos/hero.svg`         | Hero | `servicos/hero/`         |
| `hero/sobre/hero.svg`            | Hero | `sobre/hero/`            |
| `hero/suporte/hero.svg`          | Hero | `suporte/hero/`          |
| `hero/trabalhe-conosco/hero.svg` | Hero | `trabalhe-conosco/hero/` |

**Total hero específicos:** 8 arquivos

### 6.12 UI / FALLBACKS / PLACEHOLDERS / BACKGROUNDS

| Arquivo atual                | Tipo       | Destino                |
| ---------------------------- | ---------- | ---------------------- |
| `backgrounds/hero-bg.webp`   | Background | `home/backgrounds/`    |
| `backgrounds/hero-grid.svg`  | Background | `home/backgrounds/`    |
| `backgrounds/hero-lines.svg` | Background | `home/backgrounds/`    |
| `gallery/placeholder.svg`    | Gallery    | `global/placeholders/` |
| `fallbacks/blog.svg`         | Fallback   | `blog/fallbacks/`      |
| `fallbacks/contato.png`      | Fallback   | `contato/fallbacks/`   |
| `fallbacks/default.svg`      | Fallback   | `global/fallbacks/`    |
| `fallbacks/parceiros.svg`    | Fallback   | `parceiros/fallbacks/` |
| `fallbacks/servicos.png`     | Fallback   | `servicos/fallbacks/`  |

**Total UI/Fallbacks/Backgrounds:** 11 arquivos

---

## 7. Estrutura-alvo

```
public/images/
├── global/
│   ├── brand/
│   ├── favicon/
│   ├── icons/
│   ├── illustrations/
│   ├── placeholders/
│   └── backgrounds/
├── home/
│   ├── banners/
│   ├── cards/
│   ├── sections/
│   └── hero/
├── servicos/
│   ├── hero/
│   ├── gallery/
│   ├── fallbacks/
│   ├── recrutamento-selecao/
│   ├── mao-de-obra-temporaria/
│   ├── mao-de-obra-efetiva/
│   ├── avaliacao-perfil/
│   ├── hunting/
│   ├── banco-de-talentos/
│   ├── processo-de-rh/
│   ├── facilities/
│   ├── jardinagem/
│   ├── limpeza/
│   ├── limpeza-de-fachada/
│   ├── limpeza-de-vidros/
│   ├── limpeza-pesada/
│   ├── limpeza-pre-mudanca/
│   ├── limpeza-pos-mudanca/
│   ├── limpeza-pos-obra/
│   ├── faxina-diarista/
│   ├── terceirizacao/
│   ├── zeladoria/
│   ├── controle-acesso/
│   └── portaria/
├── parceiros/
│   ├── hero/
│   └── fallbacks/
├── clientes/
│   └── fallbacks/
├── sobre/
│   ├── hero/
│   ├── equipe/
│   ├── mission/
│   ├── values/
│   ├── vision/
│   └── contrato/
├── contato/
│   ├── hero/
│   └── fallbacks/
├── suporte/
│   └── hero/
├── vagas/
│   ├── hero/
│   └── fallbacks/
├── candidatos/
│   ├── hero/
│   └── fallbacks/
├── empresas/
│   ├── hero/
│   └── fallbacks/
├── processo-seletivo/
├── trabalhe-conosco/
│   └── hero/
├── construcao/
└── blog/
    ├── hero/
    └── fallbacks/
```

---

## 8. Plano de migração controlada

### 8.1 Princípios

1. **Não mover sem referência atualizada.** O código deve ser atualizado antes ou junto com a movimentação do arquivo.
2. **Migração por família.** Mover uma pasta/domínio por vez, não tudo de uma vez.
3. **Build + testes após cada família.** Se algo quebrar, sabemos exatamente qual migração causou.
4. **Manter origem até validação.** Só remover o arquivo antigo após confirmar que a nova referência funciona em produção.
5. **Compatibilidade durante transição.** Se necessário, manter redirecionamentos/aliases temporários.

### 8.2 Ordem sugerida

| Ordem | Família                     | Motivo                      |
| ----- | --------------------------- | --------------------------- |
| 1     | Global                      | Base para todas as páginas  |
| 2     | Fallbacks                   | Reduzem warnings no console |
| 3     | Home                        | Página principal            |
| 4     | Serviços                    | Maior volume de assets      |
| 5     | Clientes/Parceiros          | Médio volume                |
| 6     | Sobre/Empresa               | Baixo volume                |
| 7     | Contato/Suporte             | Baixo volume                |
| 8     | Vagas/Carreiras             | Baixo volume                |
| 9     | Candidatos/Empresas         | Baixo volume                |
| 10    | Construção/Trabalhe Conosco | Baixo volume                |

### 8.3 Passos por família

1. Mapear todas as referências no código para a família
2. Atualizar `src/content/assets.ts` com novos caminhos
3. Atualizar referências diretas em componentes/páginas
4. Mover arquivos para nova estrutura
5. Rodar `npm run build` e `npx tsc --noEmit`
6. Validar visualmente
7. Commit
8. Só então remover arquivos antigos (opcional, pode ser um commit separado)

---

## 9. Referências no código a atualizar

### 9.1 Arquivos centrais

| Arquivo                         | Função                          |
| ------------------------------- | ------------------------------- |
| `src/content/assets.ts`         | Mapeamento central de assets    |
| `src/config/images.ts`          | Configuração de imagens do site |
| `src/services/mock/services.ts` | Catálogo de serviços            |
| `src/mock/clients.ts`           | Lista de clientes               |
| `src/mock/partners.ts`          | Lista de parceiros              |
| `src/content/homeHero.ts`       | Hero da home                    |

### 9.2 Componentes/páginas com referências diretas

| Arquivo                            | Referências                   |
| ---------------------------------- | ----------------------------- |
| `src/pages/ServicoDetalhe.tsx`     | Gallery, overlay, backgrounds |
| `src/pages/Servicos.tsx`           | Indireto via `mockServices`   |
| `src/pages/Home.tsx`               | Indireto via `homeHero`       |
| `src/pages/Contato.tsx`            | Contato assets                |
| `src/pages/Sobre.tsx`              | About assets                  |
| `src/pages/Vagas.tsx`              | Vagas assets                  |
| `src/components/layout/Navbar.tsx` | Brand assets                  |
| `src/components/layout/Footer.tsx` | Brand assets                  |

---

## 10. Duplicatas a consolidar

### 10.1 Clientes

| Arquivo A                                          | Arquivo B                                           | Ação                      |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------- |
| `clientes/empresa-vector-engenharia.webp`          | `partners/vector-engenharia.webp`                   | Consolidar em `clientes/` |
| `clientes/empresa-vector-engenharia-sistemas.webp` | `hero/home/empresa-vector-engenharia-sistemas.webp` | Consolidar em `clientes/` |
| `clientes/mistral-vidros.webp`                     | `partners/mistral.webp`                             | Consolidar em `clientes/` |
| `clientes/logo abarca_Prancheta 1.avif`            | `clientes/abarca-moveis.avif`                       | Remover duplicata         |

### 10.2 Serviços

| Arquivo A                     | Arquivo B                          | Ação                                    |
| ----------------------------- | ---------------------------------- | --------------------------------------- |
| `services/mao-de-obra.webp`   | `services/mao-de-obra-real.webp`   | Consolidar em `servicos/mao-de-obra/`   |
| `services/jardinagem.webp`    | `services/jardinagem-real.webp`    | Consolidar em `servicos/jardinagem/`    |
| `services/terceirizacao.webp` | `services/terceirizacao-real.webp` | Consolidar em `servicos/terceirizacao/` |
| `services/facilities.png`     | `services/facilities-real.webp`    | Consolidar em `servicos/facilities/`    |
| `services/limpeza-real.webp`  | `services/faxina.webp`             | Verificar se são o mesmo serviço        |

### 10.3 Sobre/Empresa

| Arquivo A                | Arquivo B                 | Ação       |
| ------------------------ | ------------------------- | ---------- |
| `company/about-team.svg` | `company/about-team.webp` | Consolidar |
| `company/mission.svg`    | `company/mission.webp`    | Consolidar |
| `company/values.svg`     | `company/values.webp`     | Consolidar |

### 10.4 Careers

| Arquivo A                 | Arquivo B                  | Ação       |
| ------------------------- | -------------------------- | ---------- |
| `careers/recruitment.svg` | `careers/recruitment.webp` | Consolidar |
| `careers/workers.svg`     | `careers/workers.webp`     | Consolidar |

### 10.5 Hero/Home

| Arquivo A            | Arquivo B                     | Ação       |
| -------------------- | ----------------------------- | ---------- |
| `hero/banner-js.png` | `hero/banner-js-empregos.png` | Consolidar |

---

## 11. Regras finais para execução

1. **Não inventar assets.** Se um serviço/cliente não tem imagem própria, registrar como pendência.
2. **Não apagar origem antes da validação.** Manter arquivos antigos até confirmar que a nova estrutura funciona.
3. **Um domínio por vez.** Não migrar tudo de uma vez.
4. **Build e testes obrigatórios** após cada migração.
5. **Commit por família** para permitir rollback cirúrgico.

---

**Fim do relatório.**
