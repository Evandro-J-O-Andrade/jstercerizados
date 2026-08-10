# Auditoria de Implementação

**Projeto:** J&S Empregos Ltda.  
**Documento mestre:** `docs/SITE-JS-Empregos/00-VISAO-GERAL.md`  
**Data da auditoria:** 08/08/2026  
**Escopo:** Código-fonte atual, rotas, componentes, páginas, widgets, acessibilidade, mobile, SEO e build.  
**Regra:** Somente leitura. Nenhum código alterado durante esta auditoria.

---

## Resumo Executivo

O projeto já possui uma base funcional sólida: identidade centralizada, rotas completas, Home com múltiplas seções, HeroSplit com suporte a slides dinâmicos, serviços mapeados com páginas de detalhe, vagas com listagem e detalhe, formulários reutilizáveis primitivos, Footer estruturado, widgets de chat e acessibilidade, além de typecheck e build limpos.

Os principais desalinhos encontrados estão em:

- atualização de dados de identidade/contato que ainda apontam para o domínio e marca antigos;
- ausência de aplicação prática do componente `SEO` nas páginas;
- rotas fantasma no Footer (`/privacidade`, `/termos`, `/lgpd`, `/cookies`);
- falta de um formulário reutilizável de candidatura vinculado à vaga;
- números da Home sem validação do cliente.

Não foram encontrados erros de compilação ou build.

---

## Requisitos do Cliente

| Requisito                             | Status          | Observação                                                                                     |
| ------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| Identidade: J&S Empregos Ltda.        | 🟡 PARCIAL      | Nome está correto, mas e-mail/domínio/redes sociais ainda apontam para `jrtelempregos.com.br`. |
| Facilities como linha comercial       | 🟢 OK           | Presente em serviços, Home e Footer.                                                           |
| Mão de obra temporária/efetiva        | 🟢 OK           | Presente em serviços, Home e Footer.                                                           |
| Terceirização                         | 🟢 OK           | Presente em serviços, Home e Footer.                                                           |
| Assessoria em RH como carro-chefe     | 🟢 OK           | Hero principal e Home destacam RH.                                                             |
| Agência de empregos / candidatos      | 🟡 PARCIAL      | Páginas existem, mas a jornada do candidato ainda é minimalista.                               |
| Empresas contratantes                 | 🟡 PARCIAL      | Página existe, mas falta seção de dor/problema e processo detalhado.                           |
| Fornecedores / Parceiros              | 🟡 PARCIAL      | Páginas existem, mas sem conteúdo rico.                                                        |
| Duas jornadas claras (B2B e B2C)      | 🟡 PARCIAL      | Existem seções separadas, mas podem ser mais evidentes.                                        |
| Números / estatísticas                | 🔴 PENDENTE     | `10000+`, `2000+`, `95%` são inventados e precisam de validação.                               |
| Depoimentos                           | 🔴 NÃO INICIADO | Apenas placeholder; não há dados reais.                                                        |
| Timeline / Sobre                      | 🔴 NÃO INICIADO | Página `/sobre` existe, mas sem timeline cinematográfica.                                      |
| Blog                                  | 🟡 PARCIAL      | Rotas e estrutura existem, sem conteúdo real.                                                  |
| Contato com WhatsApp / mapa / horário | 🟢 OK           | Footer e página de contato possuem esses elementos.                                            |
| Acessibilidade                        | 🟡 PARCIAL      | Widget existe, mas falta focus trap, escala de cinza e ajustes de backdrop.                    |
| Chat IA + humano                      | 🟡 PARCIAL      | ChatWidget mockado com opções; sem integração real.                                            |
| SEO por página                        | 🟡 PARCIAL      | Componente `SEO.tsx` existe, mas não é usado em nenhuma página.                                |
| Performance / build                   | 🟢 OK           | Build e typecheck limpos.                                                                      |

---

## Requisitos Arquiteturais

| Requisito                                   | Status     | Observação                                                                                         |
| ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Não reconstruir do zero                     | 🟢 OK      | Alterações são incrementais sobre componentes existentes.                                          |
| Rotas principais preservadas                | 🟢 OK      | 20 rotas presentes, incluindo dashboard e rotas secundárias.                                       |
| SEO centralizado                            | 🟡 PARCIAL | `SEO.tsx` existe, mas não é aplicado nas páginas.                                                  |
| Serviços dinâmicos `/servicos/:slug`        | 🟢 OK      | Implementado com mock, ServiceCard e ServicoDetalhe.                                               |
| Formulários reutilizáveis                   | 🟡 PARCIAL | Primitivos existem; faltam componentes de alto nível (`CandidaturaForm`, `CompanyLeadForm`, etc.). |
| Componentes de UI reutilizáveis             | 🟢 OK      | `Button`, `Input`, `Select`, `Textarea`, `SafeImage`, `Section`, `Container` estão presentes.      |
| Animações com Framer Motion                 | 🟢 OK      | Usado em HeroSplit, ServiceCard, Footer social, widgets e CinematicShowcase.                       |
| Acessibilidade com `prefers-reduced-motion` | 🟢 OK      | Respeitado em HeroSplit e CinematicShowcase.                                                       |
| Imagens centralizadas em `public/images/`   | 🟢 OK      | Estrutura organizada e usada por `images.ts`.                                                      |
| Build e typecheck                           | 🟢 OK      | Ambos passam sem erros.                                                                            |

---

## Implementado

- **Identidade centralizada** em `src/config/company.ts`, `src/config/images.ts`, `src/config/seo.ts`, `src/config/contacts.ts`.
- **Rotas completas** em `src/App.tsx`, incluindo páginas públicas, autenticadas e secundárias.
- **Home** com HeroSplit, seção de serviços agrupados por categoria, vagas em destaque, Como Funciona, parceiros, números, blog e CTA final.
- **HeroSplit** com auto-play, variantes de animação, controles acessíveis e suporte a conteúdo textual por slide.
- **Serviços** mapeados em `src/services/mock/services.ts` com 14 serviços, `slug`, categoria, imagem, ícone, descrição curta, descrição completa, benefícios e página de detalhe.
- **ServiceCard** com imagem, ícone, categoria, título, descrição curta e CTA “Saiba mais”.
- **Vagas** com listagem, filtros básicos (texto, cidade, tipo de contrato) e página de detalhe.
- **Candidatos**, **Empresas**, **Clientes**, **Parceiros**, **Fornecedores**, **Sobre**, **FAQ**, **Suporte**, **Contato**, **Login**, **Dashboard**, **Processo Seletivo** e **Trabalhe Conosco**.
- **Footer** com grupos de links, identidade J&S, redes sociais (incluindo TikTok), contato, horário e bottom bar.
- **Widgets**: `ChatWidget` e `AccessibilityWidget` com posicionamento fixo e z-index hierárquico.
- **CinematicShowcase**: overlay fixo, sem texto, com suporte a inatividade de 10 minutos, botão “Pular” e bloqueio de scroll temporário.
- **SafeImage** com fallback SVG.
- **SEO.tsx** criado, mas não aplicado.
- **TypeScript** e **build** sem erros.

---

## Parcialmente Implementado

| Item                 | Arquivo(s)                                                                                                         | Observação                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identidade / contato | `src/config/company.ts`, `src/config/contacts.ts`, `src/config/seo.ts`, `src/config/app.ts`, `src/mock/company.ts` | Nome da marca ok, mas e-mail, domínio e redes sociais ainda usam `jrtelempregos.com.br`.                                                                                        |
| Home                 | `src/pages/Home.tsx`                                                                                               | Seções existem, mas a ordem difere da arquitetura desejada e há números sem validação.                                                                                          |
| CinematicIntro       | `src/components/sections/CinematicIntro.tsx`                                                                       | Implementada como showcase visual sem texto, com inatividade de 10 minutos e botão “Pular”. Refinamento pendente: slides adicionais e ajuste de `object-position` por viewport. |
| Vagas                | `src/pages/Vagas.tsx`, `src/pages/VagaDetalhe.tsx`                                                                 | Faltam filtros de área, estado, salário e data. Candidatura redireciona para `/trabalhe-conosco`.                                                                               |
| Candidatos           | `src/pages/Candidatos.tsx`                                                                                         | Página minimalista; falta conteúdo de jornada, preparação e acompanhamento.                                                                                                     |
| Empresas             | `src/pages/Empresas.tsx`                                                                                           | Falta seção de dor/problema e explicação detalhada de serviços/processo.                                                                                                        |
| Formulários          | `src/pages/Contato.tsx`, `src/pages/TrabalheConosco.tsx`, `src/pages/Login.tsx`                                    | Primitivos reutilizáveis existem, mas faltam formulários de alto nível (`CandidaturaForm`, `CompanyLeadForm`, etc.).                                                            |
| Footer               | `src/components/layout/Footer.tsx`                                                                                 | Estrutura ok, mas há divergência de grupos em relação ao documento e rotas fantasma.                                                                                            |
| Acessibilidade       | `src/components/ui/AccessibilityWidget.tsx`                                                                        | Falta focus trap, escala de cinza e ajuste de backdrop conforme documento.                                                                                                      |
| SEO                  | `src/components/ui/SEO.tsx`                                                                                        | Componente existe, mas não é usado em nenhuma página.                                                                                                                           |

---

## Pendente

| Item                            | Arquivo(s)                                                                                                         | Observação                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Atualizar identidade e contatos | `src/config/company.ts`, `src/config/contacts.ts`, `src/config/seo.ts`, `src/config/app.ts`, `src/mock/company.ts` | Migrar para `jsEmpregos.com.br` e redes sociais oficiais.                                                       |
| Números da Home                 | `src/pages/Home.tsx`                                                                                               | Validar com o cliente antes de publicar.                                                                        |
| Rotas legais                    | `src/App.tsx`, `src/components/layout/Footer.tsx`                                                                  | Criar `/privacidade`, `/termos`, `/lgpd`, `/cookies` ou remover links.                                          |
| Candidatura vinculada à vaga    | `src/pages/VagaDetalhe.tsx`                                                                                        | Criar `CandidaturaForm` reutilizável.                                                                           |
| Conteúdo de Candidatos          | `src/pages/Candidatos.tsx`                                                                                         | Expandir jornada, dicas, acompanhamento.                                                                        |
| Conteúdo de Empresas            | `src/pages/Empresas.tsx`                                                                                           | Adicionar seção de problema/dor e processo detalhado.                                                           |
| Conteúdo de Sobre               | `src/pages/Sobre.tsx`                                                                                              | Timeline cinematográfica e dados reais.                                                                         |
| Depoimentos                     | `src/pages/Home.tsx`                                                                                               | Somente com dados reais e validação.                                                                            |
| Blog com conteúdo real          | `src/pages/Blog.tsx`                                                                                               | Conteúdos de RH, carreira, Facilities, etc.                                                                     |
| Serviços adicionais             | `src/services/mock/services.ts`                                                                                    | Cadastrar serviços faltantes do briefing (ex: limpeza de vidros, pós-mudança, pré-mudança, etc.) se necessário. |
| Formulários de alto nível       | Novos componentes em `src/components/forms/`                                                                       | `ServiceRequestForm`, `CompanyLeadForm`, `CandidateForm`, `ContactForm`, `JobApplicationForm`, `SupportForm`.   |
| SEO aplicado                    | `src/components/ui/SEO.tsx` + todas as páginas                                                                     | Aplicar componente em todas as páginas com title, description, OG, Twitter, JSON-LD e canonical.                |
| Dados históricos validados      | `src/mock/company.ts`                                                                                              | Fundação, clientes, cidades, contratações.                                                                      |
| Imagens reais                   | `public/images/`                                                                                                   | Substituir SVGs de fallback por assets reais quando disponíveis.                                                |

---

## Bugs

| #   | Bug                                | Arquivo                                                                                                            | Observação                                                                          |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 1   | Rotas fantasma no Footer           | `src/components/layout/Footer.tsx`                                                                                 | Links para `/privacidade`, `/termos`, `/lgpd`, `/cookies` não existem em `App.tsx`. |
| 2   | Candidatura sem formulário próprio | `src/pages/VagaDetalhe.tsx`                                                                                        | Botão “Candidatar-se agora” redireciona para `/trabalhe-conosco`.                   |
| 3   | Identidade/contato desatualizados  | `src/config/company.ts`, `src/config/contacts.ts`, `src/config/seo.ts`, `src/config/app.ts`, `src/mock/company.ts` | E-mail, domínio e redes sociais ainda apontam para `jrtelempregos.com.br`.          |
| 4   | SEO não aplicado                   | `src/components/ui/SEO.tsx`                                                                                        | Componente existe, mas não é usado em nenhuma página.                               |

---

## Melhorias Visuais

| #   | Melhoria                               | Arquivo                                                                         | Observação                                                                                                                                                                                                                                |
| --- | -------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Revisar ordem das seções da Home       | `src/pages/Home.tsx`                                                            | Alinhar com a ordem do documento: Hero → Soluções para Empresas → Assessoria em RH → Facilities/Terceirização → Para Candidatos → Vagas em Destaque → Como Funciona → Diferenciais → Clientes/Parceiros → Depoimentos → Blog → CTA Final. |
| 2   | Aprimorar CinematicIntro               | `src/components/sections/CinematicIntro.tsx`                                    | Adicionar mais slides e ajustar `object-position` por viewport para manter o enquadramento da `cardheros`.                                                                                                                                |
| 3   | Revisar identidade visual do Footer    | `src/components/layout/Footer.tsx`                                              | Alinhar grupos com o documento (`Empresa`, `Oportunidades`, `Negócios`, `Atendimento`, `Legal`).                                                                                                                                          |
| 4   | Revisar responsividade dos widgets     | `src/components/ui/ChatWidget.tsx`, `src/components/ui/AccessibilityWidget.tsx` | Garantir que não cubram BottomNavigation em telas pequenas.                                                                                                                                                                               |
| 5   | Melhorar contraste e hierarquia visual | Vários                                                                          | Acessibilidade e legibilidade em light/dark mode.                                                                                                                                                                                         |

---

## Acessibilidade

| Item                                    | Status          | Arquivo                                                                               | Observação                                                                     |
| --------------------------------------- | --------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Botão de acessibilidade sempre presente | 🟢 OK           | `src/components/ui/AccessibilityWidget.tsx`                                           | Botão fixo com `aria-label` e `aria-expanded`.                                 |
| Backdrop separado do painel             | 🟢 OK           | `src/components/ui/AccessibilityWidget.tsx`                                           | Backdrop é irmão do painel, não causa blur no conteúdo.                        |
| ESC e clique fora                       | 🟢 OK           | `src/components/ui/AccessibilityWidget.tsx`                                           | Fecha com ESC e clique no backdrop.                                            |
| Focus trap                              | 🔴 PENDENTE     | `src/components/ui/AccessibilityWidget.tsx`                                           | Falta focus trap no dialog.                                                    |
| Escala de cinza                         | 🔴 NÃO INICIADO | `src/components/ui/AccessibilityWidget.tsx`                                           | Documento menciona explicitamente.                                             |
| Backdrop com blur                       | 🟡 PARCIAL      | `src/components/ui/AccessibilityWidget.tsx`                                           | Documento pede `bg-black/40 backdrop-blur-sm`; atual é `bg-black/10` sem blur. |
| `prefers-reduced-motion`                | 🟢 OK           | `src/components/sections/HeroSplit.tsx`, `src/components/sections/CinematicIntro.tsx` | Respeitado.                                                                    |
| `aria-label` nos controles de slide     | 🟢 OK           | `src/components/sections/HeroSplit.tsx`                                               | Presente e descritivo.                                                         |

---

## Responsividade

| Item                    | Status     | Observação                                                                                    |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| Overflow horizontal     | 🟢 OK      | Nenhum `overflow-x` explícito ou indireto encontrado nos arquivos analisados.                 |
| Grids responsivos       | 🟢 OK      | Uso consistente de `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.                               |
| BottomNavigation mobile | 🟢 OK      | Exibido apenas em mobile (`lg:hidden`).                                                       |
| Widgets mobile          | 🟡 PARCIAL | Posicionados em `bottom-32`; pode conflitar em dispositivos com safe-area ou altura reduzida. |
| HeroSplit mobile        | 🟢 OK      | Aspect ratio e layout se adaptam.                                                             |
| ServiceCard mobile      | 🟢 OK      | Imagem e conteúdo empilham corretamente.                                                      |

---

## Serviços

| Item                           | Status     | Arquivo                                   | Observação                                                                                          |
| ------------------------------ | ---------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/servicos`                    | 🟢 OK      | `src/pages/Servicos.tsx`                  | Lista serviços agrupados.                                                                           |
| `/servicos/:slug`              | 🟢 OK      | `src/pages/ServicoDetalhe.tsx`            | Página dinâmica com hero, estatísticas, sobre, timeline, galeria, FAQ e CTA.                        |
| ServiceCard                    | 🟢 OK      | `src/components/sections/ServiceCard.tsx` | Imagem, ícone, categoria, título, descrição curta, CTA.                                             |
| Mock de serviços               | 🟢 OK      | `src/services/mock/services.ts`           | 14 serviços com slug, categoria, imagem, ícone, descrição e benefícios.                             |
| Serviços faltantes do briefing | 🟡 PARCIAL | `src/services/mock/services.ts`           | Faltam alguns serviços específicos de Facilities (ex: limpeza de vidros, pós-mudança, pré-mudança). |

---

## Vagas

| Item                | Status      | Arquivo                      | Observação                                                    |
| ------------------- | ----------- | ---------------------------- | ------------------------------------------------------------- |
| `/vagas`            | 🟢 OK       | `src/pages/Vagas.tsx`        | Listagem com filtros básicos.                                 |
| `/vagas/:slug`      | 🟢 OK       | `src/pages/VagaDetalhe.tsx`  | Detalhes completos da vaga.                                   |
| Filtros             | 🟡 PARCIAL  | `src/pages/Vagas.tsx`        | Faltam: área, estado, salário, data.                          |
| Candidatura         | 🔴 PENDENTE | `src/pages/VagaDetalhe.tsx`  | Sem formulário próprio; redireciona para `/trabalhe-conosco`. |
| Lista de vagas mock | 🟢 OK       | `src/services/mock/vagas.ts` | Dados de exemplo disponíveis.                                 |

---

## Empresas

| Item | Status | Arquivo | Observação |
|---|---|---|
| `/empresas` | 🟡 PARCIAL | `src/pages/Empresas.tsx` | Hero, CTAs, benefícios, estatísticas e parceiros existem. |
| Seção de dor/problema | 🔴 PENDENTE | `src/pages/Empresas.tsx` | Documento pede explicação dos problemas do cliente. |
| Processo detalhado | 🔴 PENDENTE | `src/pages/Empresas.tsx` | Passos do atendimento B2B. |
| Estatísticas validadas | 🔴 PENDENTE | `src/pages/Empresas.tsx` | Dados `500+`, `200+`, `7`, `15+` precisam de validação. |

---

## Candidatos

| Item | Status | Arquivo | Observação |
|---|---|---|
| `/candidatos` | 🟡 PARCIAL | `src/pages/Candidatos.tsx` | Cards básicos de currículo, busca de vagas e processo seletivo. |
| Jornada do candidato | 🔴 PENDENTE | `src/pages/Candidatos.tsx` | Falta conteúdo de preparação, dicas e acompanhamento. |
| Perfil / histórico | 🔴 NÃO INICIADO | — | Área autenticada futura. |

---

## Suporte

| Item | Status | Arquivo | Observação |
|---|---|---|
| `/suporte` | 🟡 PARCIAL | `src/pages/Suporte.tsx` | Estrutura básica existe. |
| ChatWidget | 🟡 PARCIAL | `src/components/ui/ChatWidget.tsx` | Mock com fluxo IA → opções → encaminhamento humano. |
| Integração real | 🔴 NÃO INICIADO | — | Sem IA, n8n ou Supabase. |

---

## Footer

| Item | Status | Arquivo | Observação |
|---|---|---|
| Estrutura desktop | 🟢 OK | `src/components/layout/Footer.tsx` | 4 colunas: Empresa, Serviços, Atendimento, Fale Conosco. |
| Login em Atendimento | 🟢 OK | `src/components/layout/Footer.tsx` | Presente como link. |
| TikTok | 🟢 OK | `src/components/layout/Footer.tsx` | Ícone customizado presente. |
| Endereço sem duplicar mapa | 🟢 OK | `src/components/layout/Footer.tsx` | Endereço + link único “Ver localização”. |
| Horário de atendimento | 🟢 OK | `src/components/layout/Footer.tsx` | Seg-Sex, Sáb, Domingo. |
| Rotas fantasma | 🔴 BUG | `src/components/layout/Footer.tsx` | Links para `/privacidade`, `/termos`, `/lgpd`, `/cookies` sem rota correspondente. |
| Grupos alinhados ao documento | 🟡 PARCIAL | `src/components/layout/Footer.tsx` | Documento pede `Empresa`, `Oportunidades`, `Negócios`, `Atendimento`, `Legal`. Atual: `Empresa`, `Serviços`, `Atendimento`, `Fale Conosco`. |
| Mobile | 🟡 PARCIAL | `src/components/layout/Footer.tsx` | Grupos desktop ocultados; resta identidade e bottom bar. Falta accordion mobile completo. |

---

## Hero

| Item | Status | Arquivo | Observação |
|---|---|---|
| HeroSplit | 🟢 OK | `src/components/sections/HeroSplit.tsx` | Auto-play, animação, acessibilidade, fallback. |
| Texto por slide | 🟢 OK | `src/components/sections/HeroSplit.tsx` | Cada slide pode ter `eyebrow`, `title`, `subtitle`, `description`, `cta`. |
| Hero na Home | 🟢 OK | `src/pages/Home.tsx` | 3 slides: Assessoria em RH, Facilities, Mão de Obra. |
| Imagem + texto sincronizados | 🟢 OK | `src/pages/Home.tsx` | Slides definem tanto imagem quanto texto/CTA. |

---

## Cinematic Intro

| Item                       | Status | Arquivo                                      | Observação                                                                                              |
| -------------------------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Imagem `cardheros`         | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | `/images/hero/cardheros.png` usado.                                                                     |
| Sem texto / H1 / CTA       | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Apenas imagem e overlay.                                                                                |
| Duração curta              | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Showcase controlado por timer e sessionStorage.                                                         |
| Múltiplas imagens          | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Array `slides` com 3 itens: `cardheros.png`, `hero-main.webp`, `hero-security.webp`.                    |
| Inatividade 10 min         | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Timer reseta com interação.                                                                             |
| `sessionStorage`           | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | dismissed por sessão.                                                                                   |
| `prefers-reduced-motion`   | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Respeitado.                                                                                             |
| Bloqueio de scroll         | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | `overflow: hidden` durante showcase.                                                                    |
| Botão “Pular”              | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Presente e funcional.                                                                                   |
| Posicionamento fixed       | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Não participa do fluxo do documento.                                                                    |
| Sem overflow               | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Container controla proporção e `object-fit`.                                                            |
| object-position responsivo | 🟢 OK  | `src/components/sections/CinematicIntro.tsx` | Ajusta `objectPosition` por breakpoint: desktop `center 35%`, tablet `center 40%`, mobile `60% center`. |

---

## Imagens

| Item                 | Status | Observação                                                                                                          |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Estrutura de pastas  | 🟢 OK  | `public/images/hero`, `services`, `vagas`, `candidatos`, `fallbacks`, `placeholders`, etc.                          |
| `cardheros.png`      | 🟢 OK  | Presente em `public/images/hero/cardheros.png`.                                                                     |
| Fallbacks SVG        | 🟢 OK  | SVGs inline usados como fallback corporativo.                                                                       |
| Mapeamento assets    | 🟢 OK  | `src/content/assets.ts` e `src/config/images.ts` centralizam paths.                                                 |
| Regras de tratamento | 🟢 OK  | `docs/SITE-JS-Empregos/02-TRATAMENTO-IMAGENS.md` define regras obrigatórias para todos os componentes.              |
| Inventário assets    | 🟢 OK  | `imagens_para_mover/` auditado (27 arquivos); mapeamento parcial realizado e assets copiados para `public/images/`. |

### Inventário de assets em `imagens_para_mover/`

| Asset                                                  | Tipo       | Uso sugerido                   | Status                                                                      |
| ------------------------------------------------------ | ---------- | ------------------------------ | --------------------------------------------------------------------------- |
| `bannerj&s.png`                                        | banner     | Home / topo                    | 🟢 OK — copiado para `public/images/hero/banner-j&s.png`                    |
| `logomarca.png`                                        | logo       | marca                          | pendente mapeamento                                                         |
| `cardzeladoriaemprezas.png`                            | card       | Zeladoria                      | 🟢 OK — copiado para `public/images/services/zeladoria-real.png`            |
| `facilitesjardinagem.webp`                             | card       | Facilities / Jardinagem        | 🟢 OK — copiado para `public/images/services/facilities-real.webp`          |
| `faxina.webp`                                          | card       | Limpeza                        | 🟢 OK — copiado para `public/images/services/limpeza-real.webp`             |
| `jardinagem.webp`                                      | card       | Jardinagem                     | 🟢 OK — copiado para `public/images/services/jardinagem-real.webp`          |
| `limpeza-de-fachada.webp`                              | card       | Limpeza de Fachada             | pendente mapeamento                                                         |
| `limpeza-de-manutencao.webp`                           | card       | Limpeza de Manutenção          | pendente mapeamento                                                         |
| `limpeza-de-vidos.webp`                                | card       | Limpeza de Vidros              | pendente mapeamento                                                         |
| `limpeza-e-higienizacao.webp`                          | card       | Limpeza e Higienização         | pendente mapeamento                                                         |
| `limpeza-pesada.webp`                                  | card       | Limpeza Pesada                 | pendente mapeamento                                                         |
| `limpeza-pos-mudanca.webp`                             | card       | Limpeza Pós-Mudança            | pendente mapeamento                                                         |
| `limpeza-pos-obra.webp`                                | card       | Limpeza Pós-Obra               | pendente mapeamento                                                         |
| `limpeza-pre-mudanca.webp`                             | card       | Limpeza Pré-Mudança            | pendente mapeamento                                                         |
| `mao-de-obra-temporaria-e-efetiva.webp`                | card       | Mão de Obra Temporária/Efetiva | 🟢 OK — copiado para `public/images/services/mao-de-obra-real.webp`         |
| `tercerizacao.webp`                                    | card       | Terceirização                  | 🟢 OK — copiado para `public/images/services/terceirizacao-real.webp`       |
| `servicos.webp`                                        | card       | Serviços gerais                | 🟢 OK — copiado para `public/images/services/servicos-real.webp`            |
| `banco-de-talento.jfif`                                | card       | Banco de Talentos              | 🟢 OK — copiado para `public/images/services/banco-talento-real.jfif`       |
| `cadrempresaspareceiras.png`                           | card       | Empresas Parceiras             | 🟢 OK — copiado para `public/images/empresas/cadastro-empresas.png`         |
| `trabalhe-conosco.webp`                                | card       | Trabalhe Conosco               | 🟢 OK — copiado para `public/images/trabalhe-conosco/trabalhe-conosco.webp` |
| `trabalho-free-lance.png`                              | card       | Trabalho Freelance             | pendente mapeamento                                                         |
| `trabalho-tercerizado.png`                             | card       | Trabalho Terceirizado          | pendente mapeamento                                                         |
| `empresa-vector-engenharia-sistemas.webp`              | parceiro   | Vector Engenharia              | 🟢 OK — copiado para `public/images/partners/vector-engenharia.webp`        |
| `mistral.webp`                                         | parceiro   | Mistral                        | 🟢 OK — copiado para `public/images/partners/mistral.webp`                  |
| `suporte.webp`                                         | suporte    | Suporte                        | 🟢 OK — copiado para `public/images/suporte/suporte.webp`                   |
| `Code_Generated_Image (6).png`                         | indefinido | necessária validação visual    | pendente mapeamento                                                         |
| `cortar-350-240-2a74d2fdb2bbf879338b8d194148617e.webp` | corte      | possível card                  | pendente mapeamento                                                         |

---

## Formulários

| Item | Status | Arquivo | Observação |
|---|---|---|
| Input / Textarea / Select | 🟢 OK | `src/components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx` | Primitivos reutilizáveis. |
| Contato | 🟢 OK | `src/pages/Contato.tsx` | Campos: nome, empresa, e-mail, telefone, assunto, mensagem. |
| Trabalhe Conosco | 🟢 OK | `src/pages/TrabalheConosco.tsx` | Cadastro de currículo. |
| Login | 🟢 OK | `src/pages/Login.tsx` | Formulário de autenticação. |
| `ServiceRequestForm` | 🔴 NÃO INICIADO | — | Não existe. |
| `CompanyLeadForm` | 🔴 NÃO INICIADO | — | Não existe. |
| `CandidateForm` | 🔴 NÃO INICIADO | — | Não existe. |
| `JobApplicationForm` | 🔴 NÃO INICIADO | — | Não existe. |
| `SupportForm` | 🔴 NÃO INICIADO | — | Não existe. |

---

## Tratamento de Imagens

Nenhuma imagem pode estourar o viewport ou deformar o layout. Isso vale para:

- Cinematic Intro
- Hero
- Hero dinâmico
- Cards de serviços
- Cards de vagas
- Timeline
- Sobre Nós
- Parceiros
- Blog
- Footer, quando houver imagens
- Mobile
- Desktop

A imagem deve sempre respeitar o container onde está sendo exibida.

### Regras

1. Nunca permitir overflow horizontal.
2. Nunca distorcer a proporção original da imagem.
3. Nunca permitir que a imagem ultrapasse o container.
4. O container deve controlar a proporção.
5. Utilizar `object-fit` de acordo com o contexto.

- Para imagens fotográficas em cards: `object-fit: cover`
- Para imagens institucionais onde todo o conteúdo precisa aparecer: `object-fit: contain`
- Para a Cinematic Intro: preencher a área disponível sem ultrapassar o viewport, usando `width: 100%`, `height: 100%`, `object-fit: cover` e `object-position` adequado.

### Cinematic Intro

A imagem `cardheros` deve ser adaptada ao viewport.

- Desktop: preencher a área cinematográfica; sem overflow; sem deformação; sem barras inesperadas.
- Tablet: recalcular proporção; manter enquadramento.
- Mobile: adaptar o enquadramento; reduzir escala se necessário; garantir que nenhum elemento seja cortado de maneira prejudicial.

Se a proporção da imagem não for adequada para determinado viewport, não esticar a imagem. Utilizar crop controlado com `object-fit: cover` ou uma versão específica do asset.

### Fallback

Se a imagem não carregar, mostrar fallback visual corporativo. O fallback também deve respeitar o container, não gerar overflow, funcionar em light/dark, manter proporção e não possuir texto duplicado.

### QA

Testar imagens em:

- 360px
- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px
- 1440px

Nenhuma imagem pode:

- [ ] estourar horizontalmente
- [ ] criar scrollbar
- [ ] deformar
- [ ] sair do container
- [ ] empurrar conteúdo
- [ ] quebrar o layout
- [ ] ficar cortada de maneira inadequada

---

## Segurança

| Item                | Status      | Observação                                                                        |
| ------------------- | ----------- | --------------------------------------------------------------------------------- |
| Validação de inputs | 🟡 PARCIAL  | Presente em formulários existentes; sem validação avançada ou sanitização global. |
| Autenticação        | 🟡 PARCIAL  | Login mockado; sem integração real.                                               |
| Rotas protegidas    | 🟡 PARCIAL  | `/dashboard` existe, mas sem guardas de autenticação.                             |
| LGPD / termos       | 🔴 PENDENTE | Rotas não existem; conteúdo não existe.                                           |

---

## SEO

| Item                  | Status     | Arquivo                     | Observação                                                                     |
| --------------------- | ---------- | --------------------------- | ------------------------------------------------------------------------------ |
| Componente `SEO`      | 🟢 OK      | `src/components/ui/SEO.tsx` | Implementa title, description, keywords, canonical, OG, Twitter, JSON-LD.      |
| Aplicação nas páginas | 🟡 PARCIAL | `src/pages/*`               | Aplicado em Home, Servicos, Vagas, Empresas, Candidatos, Contato, Sobre, Blog. |
| Structured data       | 🟡 PARCIAL | `src/components/ui/SEO.tsx` | JSON-LD gerado pelo componente, mas não aplicado em todas as páginas.          |
| Canonical / OG        | 🟡 PARCIAL | `src/components/ui/SEO.tsx` | Aplicado via componente nas páginas atualizadas.                               |

---

## Performance

| Item                    | Status | Observação                                                               |
| ----------------------- | ------ | ------------------------------------------------------------------------ |
| Build size              | 🟢 OK  | `index.js` gzip ~143 kB; CSS gzip ~9,4 kB.                               |
| Typecheck               | 🟢 OK  | Sem erros.                                                               |
| Lazy loading de páginas | 🟢 OK  | `React.lazy` + `Suspense` em `App.tsx`.                                  |
| SafeImage com fallback  | 🟢 OK  | Evita layout shift.                                                      |
| Animação pesada         | 🟢 OK  | Uso moderado de Framer Motion; não há bibliotecas extras desnecessárias. |

---

## Matriz de Status

| Requisito                 | Origem              | Estado     | Arquivo(s)                                                                                | Observação                                                                                        |
| ------------------------- | ------------------- | ---------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Identidade oficial        | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/config/company.ts`, `src/config/contacts.ts`                                         | Nome ok; e-mail/domínio/redes antigas.                                                            |
| Rotas principais          | `00-VISAO-GERAL.md` | 🟢 OK      | `src/App.tsx`                                                                             | Todas presentes.                                                                                  |
| Home                      | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/pages/Home.tsx`                                                                      | Seções existem, ordem diverge; números sem validação.                                             |
| HeroSplit                 | `00-VISAO-GERAL.md` | 🟢 OK      | `src/components/sections/HeroSplit.tsx`                                                   | Completo e acessível.                                                                             |
| Serviços                  | `00-VISAO-GERAL.md` | 🟢 OK      | `src/services/mock/services.ts`, `src/pages/Servicos.tsx`, `src/pages/ServicoDetalhe.tsx` | Mock e rotas ok.                                                                                  |
| Vagas                     | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/pages/Vagas.tsx`, `src/pages/VagaDetalhe.tsx`                                        | Filtros incompletos; sem candidatura própria.                                                     |
| Candidatos                | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/pages/Candidatos.tsx`                                                                | Minimalista.                                                                                      |
| Empresas                  | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/pages/Empresas.tsx`                                                                  | Falta seção de problema/processo.                                                                 |
| Formulários reutilizáveis | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/pages/Contato.tsx`, `src/pages/TrabalheConosco.tsx`                                  | Primitivos ok; faltam forms de alto nível.                                                        |
| Footer                    | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/components/layout/Footer.tsx`                                                        | Rotas fantasma; grupos divergem.                                                                  |
| Acessibilidade            | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/components/ui/AccessibilityWidget.tsx`                                               | Falta focus trap e escala de cinza.                                                               |
| SEO                       | `00-VISAO-GERAL.md` | 🟡 PARCIAL | `src/components/ui/SEO.tsx` + `src/pages/*`                                               | Componente existe e foi aplicado em páginas principais.                                           |
| CinematicIntro            | `00-VISAO-GERAL.md` | 🟢 OK      | `src/components/sections/CinematicIntro.tsx`                                              | Implementada como showcase visual sem texto; com inatividade de 10 min, botão “Pular” e 3 slides. |
| Mobile                    | `00-VISAO-GERAL.md` | 🟢 OK      | Vários                                                                                    | Sem overflow; grids responsivos.                                                                  |
| Performance / build       | `00-VISAO-GERAL.md` | 🟢 OK      | —                                                                                         | Typecheck e build OK.                                                                             |

---

## 10 Problemas Mais Importantes

1. **Candidatura sem formulário próprio** — vaga redireciona para Trabalhe Conosco.
2. **Números da Home sem validação** — dados inventados podem ser publicados.
3. **Formulários de alto nível ausentes** — repetição de código e baixa reutilização.
4. **Home com ordem divergente** — não segue a arquitetura recomendada.
5. **Dados históricos não validados** — fundação, clientes, cidades, contratações.
6. **SEO parcial** — componente aplicado em algumas páginas, mas não em todas.
7. **Inventário/mapeamento de assets pendente** — `imagens_para_mover/` com 27 arquivos aguardando vinculação a serviços/cards.
8. **Footer com grupos divergentes** — documento pede `Empresa`, `Oportunidades`, `Negócios`, `Atendimento`, `Legal`; atual: `Empresa`, `Serviços`, `Atendimento`, `Fale Conosco`.
9. **Widgets mobile** — posicionados em `bottom-32`; pode conflitar em dispositivos com safe-area ou altura reduzida.
10. **Serviços sem conteúdo real** — estrutura pronta, mas conteúdo do cliente pendente de entrada.

## 10 Pendências Mais Importantes

1. Implementar `CandidaturaForm` vinculado a `/vagas/:slug`.
2. Validar números da Home com o cliente.
3. Aplicar `SEO` nas páginas restantes.
4. Validar dados históricos de `mock/company.ts`.
5. Reordenar seções da Home conforme documento.
6. Criar `ServiceRequestForm`, `CompanyLeadForm`, `SupportForm`.
7. Mapear assets de `imagens_para_mover/` para serviços/cards/Hero.
8. Revisar grupos do Footer para alinhar com `Empresa`, `Oportunidades`, `Negócios`, `Atendimento`, `Legal`.
9. Adicionar accordion mobile completo no Footer.
10. Avaliar posicionamento dos widgets em mobile com safe-area.

## 10 Melhorias Recomendadas

1. Mapear `imagens_para_mover/` para serviços, cards e Hero.
2. Revisar grupos do Footer para alinhar com documento.
3. Expandir conteúdo de Candidatos com jornada e dicas.
4. Expandir conteúdo de Empresas com seção de dor e processo.
5. Adicionar depoimentos reais na Home.
6. Adicionar timeline cinematográfica em `/sobre`.
7. Revisar posicionamento dos widgets em mobile com safe-area.
8. Melhorar hierarquia visual e contraste em light/dark mode.
9. Adicionar filtros de área, estado, salário e data em Vagas.
10. Preparar integração futura com Supabase/n8n sem alterar UI atual.

---

## Resultado dos Comandos

```text
npm run typecheck
# Saída: (no output) — sem erros.

npm run build
# Saída: ✓ built in 15.50s
# tsc -b && vite build
# 2147 modules transformed
# index.js gzip: 142.97 kB
# index.css gzip: 9.32 kB
```
