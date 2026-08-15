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

**Fim do relatório.**
