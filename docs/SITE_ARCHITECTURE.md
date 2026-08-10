# Arquitetura do Site — J&S Empregos LTDA

## Agência de Empregos + Assessoria em RH

---

# 1. Posicionamento Oficial

## Marca

- **Razão Social:** J&S Empregos LTDA
- **Posicionamento Comercial:** Agência de Empregos e Assessoria em Recursos Humanos
- **Carro-chefe:** Assessoria em RH
- **Destaques:** Mão de Obra Temporária + Mão de Obra Efetiva
- **Linha secundária:** Facilities

## Hierarquia de comunicação

```
J&S Empregos LTDA
        ↓
AGÊNCIA DE EMPREGOS + ASSESSORIA EM RH
        ↓
RECRUTAMENTO / SELEÇÃO / BANCO DE TALENTOS
        ↓
MÃO DE OBRA TEMPORÁRIA
MÃO DE OBRA EFETIVA
        ↓
FACILITIES (secundário)
```

## Mensagem principal

> **Mais eficiência em RH. Mais resultados para sua empresa.**

## Mensagem secundária

> **Conectando talentos às melhores oportunidades.**

---

# 2. Arquitetura de Páginas

## 2.1 Mapa de rotas

### Rotas públicas

```
/                          → Home
/vagas                     → Lista de vagas
/vagas/:slug               → Detalhe da vaga
/empresas                  → Página B2B
/candidatos                → Portal do candidato
/servicos                  → Catálogo de serviços
/servicos/:slug            → Detalhe do serviço
/trabalhe-conosco          → Cadastro de currículo
/processo-seletivo         → Jornada do candidato
/sobre                     → Sobre a empresa
/clientes                  → Clientes
/parceiros                 → Parceiros
/fornecedores              → Fornecedores
/faq                       → Perguntas frequentes
/suporte                   → Suporte
/contato                   → Contato
/login                     → Login
/blog                      → Blog
```

### Rotas futuras (não implementar agora)

```
/cadastro/candidato        → Cadastro de candidato
/cadastro/empresa          → Cadastro de empresa
/dashboard                 → Dashboard
```

## 2.2 Estrutura de pastas

```
src/
├── pages/
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── sections/
│   │   │   ├── HomeHero.tsx
│   │   │   ├── HomeStats.tsx
│   │   │   ├── HomeServices.tsx
│   │   │   ├── HomeTempEfetiva.tsx
│   │   │   ├── HomeJobs.tsx
│   │   │   ├── HomeProcess.tsx
│   │   │   ├── HomeDifferentials.tsx
│   │   │   ├── HomeClients.tsx
│   │   │   └── HomeCTA.tsx
│   │   └── index.ts
│   │
│   ├── Vagas/
│   │   ├── Vagas.tsx
│   │   ├── VagaDetalhe.tsx
│   │   └── sections/
│   │       ├── VagasHero.tsx
│   │       ├── VagasFilters.tsx
│   │       └── VagasGrid.tsx
│   │
│   ├── Empresas/
│   │   ├── Empresas.tsx
│   │   └── sections/
│   │       ├── EmpresasHero.tsx
│   │       ├── EmpresasSolutions.tsx
│   │       └── EmpresasCTA.tsx
│   │
│   ├── Candidatos/
│   │   ├── Candidatos.tsx
│   │   └── sections/
│   │       ├── CandidatosHero.tsx
│   │       ├── CandidatosFeatures.tsx
│   │       └── CandidatosCTA.tsx
│   │
│   ├── Servicos/
│   │   ├── Servicos.tsx
│   │   ├── ServicoDetalhe.tsx
│   │   └── sections/
│   │       ├── ServicosHero.tsx
│   │       ├── ServicosRH.tsx
│   │       ├── ServicosFacilities.tsx
│   │       └── ServicosCTA.tsx
│   │
│   ├── TrabalheConosco/
│   │   ├── TrabalheConosco.tsx
│   │   └── sections/
│   │       ├── TrabalheHero.tsx
│   │       └── TrabalheForm.tsx
│   │
│   ├── ProcessoSeletivo/
│   │   ├── ProcessoSeletivo.tsx
│   │   └── sections/
│   │       ├── ProcessoHero.tsx
│   │       └── ProcessoSteps.tsx
│   │
│   ├── Sobre/
│   │   ├── Sobre.tsx
│   │   └── sections/
│   │       ├── SobreHero.tsx
│   │       ├── SobreMission.tsx
│   │       ├── SobreValues.tsx
│   │       └── SobreTimeline.tsx
│   │
│   ├── Clientes/
│   ├── Parceiros/
│   ├── Fornecedores/
│   ├── FAQ/
│   ├── Suporte/
│   ├── Contato/
│   ├── Login/
│   └── Blog/
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx
│   │   └── PageLayout.tsx
│   │
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroBadge.tsx
│   │   ├── HeroContent.tsx
│   │   ├── HeroActions.tsx
│   │   ├── HeroBackground.tsx
│   │   └── variants/
│   │       ├── HeroSplit.tsx
│   │       ├── HeroCentered.tsx
│   │       ├── HeroEditorial.tsx
│   │       └── HeroMinimal.tsx
│   │
│   ├── sections/
│   │   ├── Section.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── NumberCounter.tsx
│   │   ├── TestimonialCard.tsx
│   │   └── ClientLogo.tsx
│   │
│   ├── accessibility/
│   │   ├── AccessibilityButton.tsx
│   │   ├── AccessibilityPanel.tsx
│   │   └── TextToSpeech.tsx
│   │
│   ├── chat/
│   │   ├── ChatButton.tsx
│   │   ├── ChatWindow.tsx
│   │   └── ChatInput.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── SafeImage.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       └── Select.tsx
│
├── config/
│   ├── brand.ts
│   ├── seo.ts
│   ├── seoPages.ts
│   ├── navigation.ts
│   ├── company.ts
│   ├── contacts.ts
│   ├── whatsappMessages.ts
│   └── social.ts
│
├── constants/
│   ├── icons.ts
│   ├── routes.ts
│   └── services.ts
│
├── services/
│   ├── mock/
│   │   ├── services.ts
│   │   ├── vagas.ts
│   │   ├── curriculos.ts
│   │   └── index.ts
│   └── seo/
│       ├── generateMetadata.ts
│       └── jsonLd.ts
│
└── styles/
    ├── index.css
    └── tokens.css
```

---

# 3. Estratégia de Conteúdo

## 3.1 Princípio fundamental

> **Home vende a proposta. Páginas internas explicam e convertem.**

Cada página tem uma função clara. Não duplicar conteúdo entre páginas.

## 3.2 Hierarquia de conteúdo

1. **Home** — Apresentação + conversão
2. **Serviços** — Catálogo completo
3. **Vagas** — Listagem + detalhe
4. **Empresas** — Conversão B2B
5. **Candidatos** — Portal do candidato
6. **Trabalhe Conosco** — Captação de currículo
7. **Processo Seletivo** — Jornada do candidato
8. **Sobre** — Institucional
9. **Clientes/Parceiros/Fornecedores** — Prova social
10. **FAQ/Suporte/Contato** — Atendimento

---

# 4. Páginas — Especificação Detalhada

## 4.1 SERVICES PAGE (Prioridade)

### Objetivo

Catálogo completo de serviços organizado por dois pilares: RH e Facilities.

### Estrutura

#### Hero

**Título:** Soluções em RH e Serviços Operacionais

**Texto:**

> Recrutamento, seleção, mão de obra temporária e efetiva, assessoria em RH e facilities. Tudo em um só lugar.

#### Bloco 1: Soluções em RH (carro-chefe)

**Título:** Para Empresas

**Cards:**

1. **Recrutamento e Seleção**
   - Encontramos profissionais alinhados ao perfil da empresa
   - Triagem, avaliação e seleção completas

2. **Mão de Obra Temporária** ⭐ destaque
   - Profissionais para demandas sazonais, substituições e projetos específicos
   - Flexibilidade e agilidade operacional

3. **Mão de Obra Efetiva** ⭐ destaque
   - Contratação de profissionais para posições permanentes
   - Processo seletivo completo

4. **Assessoria em RH**
   - Tenha um profissional de RH dedicado à sua empresa
   - Processos seletivos, gestão de pessoas, consultoria

5. **Banco de Talentos**
   - Base de currículos qualificados e pré-selecionados
   - Acesso rápido a profissionais compatíveis

6. **Avaliação de Perfil**
   - Avaliações psicométricas e técnicas
   - Garantia de alocação correta

#### Bloco 2: Soluções para Candidatos

**Título:** Para Candidatos

**Cards:**

1. **Cadastro de Currículo**
2. **Busca de Vagas**
3. **Alertas de Emprego**
4. **Orientação Profissional**
5. **Atualização de Currículo**

#### Bloco 3: Facilities (secundário)

**Título:** Soluções Operacionais

**Cards:**

1. **Limpeza e Conservação**
   - Limpeza diária, periódica e pós-eventos
   - Produtos ecológicos e equipe treinada

2. **Controle de Acesso**
   - Sistemas inteligentes de acesso
   - Monitoramento e segurança

3. **Portaria**
   - Portaria profissional 24h
   - Recepção e controle de visitantes

4. **Jardinagem e Paisagismo**
   - Manutenção de áreas verdes
   - Paisagismo corporativo

5. **Recepção**
   - Atendimento profissional
   - Gestão de correspondências

6. **Zeladoria**
   - Manutenção preventiva
   - Conservação de instalações

### SEO

- Title: Serviços de RH e Facilities | J&S Empregos
- Description: Recrutamento, seleção, mão de obra temporária e efetiva, assessoria em RH e facilities.

---

## 4.2 JOB BOARD (Vagas)

### Página: /vagas

#### Hero

**Título:** Vagas Disponíveis

**Texto:** Encontre a oportunidade ideal para o seu perfil profissional.

#### Filtros

- **Cargo** (busca textual)
- **Cidade**
- **Estado**
- **Área** (dropdown)
- **Tipo de Contrato** (CLT, Temporário, Estágio, Freelance, Terceirizado, C/D)
- **Faixa Salarial** (min/max)
- **Data de Publicação** (recente, última semana, último mês)

#### Cards de vaga

Cada card exibe:

- Título da vaga
- Empresa (se permitido)
- Cidade/Estado
- Tipo de contrato
- Modalidade (Presencial/Híbrido/Remoto)
- Faixa salarial (se disponível)
- Benefícios (3 primeiros)
- Botão "Ver vaga" → `/vagas/:slug`
- Botão "Candidatar-se" → `/trabalhe-conosco`

### Página: /vagas/:slug

#### Estrutura

```
┌─────────────────────────────────────┐
│ ← Voltar para vagas                 │
│                                      │
│ [Badge: Tipo de Contrato]           │
│                                      │
│ Título da Vaga                       │
│ Empresa                              │
│ Localização • Modalidade             │
│                                      │
│ Faixa Salarial                       │
│ Quantidade de vagas                  │
│                                      │
│ ─── Sobre a vaga ───                 │
│ Descrição completa...                │
│                                      │
│ ─── Requisitos ───                   │
│ Requisitos listados...               │
│                                      │
│ ─── Benefícios ───                   │
│ [Badge] [Badge] [Badge]             │
│                                      │
│ [ Candidatar-se agora ]             │
│                                      │
│ ─── Outras oportunidades ───         │
│ [Ver todas as vagas]                 │
└─────────────────────────────────────┘
```

#### Regras

- NÃO mostrar a listagem de vagas novamente
- NÃO duplicar filtros
- URL canônica própria
- SEO específico da vaga

### SEO /vagas

- Title: Vagas de Emprego | Encontre sua oportunidade | J&S
- Description: Confira centenas de vagas atualizadas diariamente...

### SEO /vagas/:slug

- Title: [Cargo] em [Cidade] | J&S Empregos
- Description: Confira os detalhes da vaga de [cargo] em [cidade], requisitos, benefícios e candidatura.
- Schema: JobPosting (futuro, quando banco real)

---

## 4.3 B2B PAGE (Empresas)

### Objetivo

Converter visitantes empresariais em clientes.

### Estrutura

#### Hero

**Título:** Encontre profissionais qualificados para sua empresa

**Texto:**

> Nossa agência de empregos conecta empresas aos melhores talentos do mercado através de recrutamento, seleção e banco de candidatos.

#### CTAs principais

- **Solicitar Orçamento** → `/contato` ou formulário inline
- **Divulgar Vaga** → `/trabalhe-conosco` ou `/vagas`

#### Bloco: Nossas soluções para empresas

**Cards:**

1. **Recrutamento e Seleção**
   - Processo completo de atração, triagem e seleção

2. **Mão de Obra Temporária**
   - Flexibilidade para picos de demanda
   - Sem encargos trabalhistas

3. **Mão de Obra Efetiva**
   - Contratação permanente qualificada
   - Acompanhamento pós-contratação

4. **Assessoria em RH**
   - Profissional dedicado
   - Consultoria em processos seletivos

5. **Banco de Talentos**
   - Acesso a profissionais pré-selecionados

#### Bloco: Como funciona

1. **Briefing** — Entendemos sua necessidade
2. **Busca** — Selecionamos candidatos compatíveis
3. **Apresentação** — Enviamos os melhores perfis
4. **Contratação** — Você escolhe e contrata

#### Bloco: Diferenciais para empresas

- Processo rápido
- Profissionais qualificados
- Acompanhamento dedicado
- Redução de turnover

#### Bloco: Prova social

Logos de empresas parceiras

#### CTA final

**Pronto para contratar?**
[Solicitar Orçamento]

### SEO

- Title: Recrutamento e Seleção para Empresas | J&S Empregos
- Description: Encontre profissionais qualificados para sua empresa. Mão de obra temporária, efetiva e assessoria em RH.

---

## 4.4 CANDIDATE PAGE (Candidatos)

### Objetivo

Portal de entrada do candidato. Clareza, acolhimento e ação.

### Estrutura

#### Hero

**Título:** Encontre sua próxima oportunidade

**Texto:**

> Cadastre seu currículo, encontre vagas compatíveis com seu perfil e acompanhe sua jornada profissional.

#### CTAs

- **Ver Vagas** → `/vagas`
- **Cadastrar Currículo** → `/trabalhe-conosco`

#### Bloco: O que você pode fazer

**Cards:**

1. **Encontrar vagas**
   - Busque oportunidades alinhadas ao seu perfil

2. **Cadastrar currículo**
   - Envie seu currículo e entre no banco de talentos

3. **Acompanhar candidaturas**
   - Acompanhe o status dos seus processos seletivos

4. **Atualizar perfil**
   - Mantenha seus dados sempre atualizados

#### Bloco: Como funciona

1. **Cadastre-se** — Crie sua conta ou envie currículo
2. **Candidate-se** — Escolha as vagas compatíveis
3. **Processo** — Participa de entrevistas e avaliações
4. **Contratação** — Inicie sua nova oportunidade

#### Bloco: Vantagens

- Currículo visível para empresas parceiras
- Alertas de novas vagas
- Acompanhamento personalizado
- Orientação profissional

#### CTA final

**Sua próxima oportunidade começa aqui.**
[Cadastrar Currículo] [Ver Vagas]

### SEO

- Title: Encontre seu Emprego | Cadastre seu Currículo | J&S
- Description: Cadastre seu currículo no banco de talentos e encontre oportunidades compatíveis com seu perfil.

---

## 4.5 WORK WITH US (Trabalhe Conosco)

### Objetivo

Captação de currículos. Página 100% focada em candidatos.

### Diferenciação de /candidatos

- `/candidatos` → Portal geral do candidato
- `/trabalhe-conosco` → Página de ação: enviar currículo agora

### Estrutura

#### Hero

**Título:** Faça parte do nosso banco de talentos

**Texto:**

> Envie seu currículo e candidate-se às vagas que combinam com seu perfil. Estamos sempre buscando novos talentos.

#### Formulário de cadastro

**Campos:**

- Nome completo
- Telefone/WhatsApp
- Cidade/Estado
- Área de atuação (dropdown)
- Cargo desejado
- Experiência profissional
- Formação
- Currículo (upload PDF/DOC/DOCX)
- Disponibilidade

**Validações:**

- Nome: mínimo 2 caracteres
- Telefone: mínimo 10 caracteres
- Cidade: mínimo 2 caracteres
- Área: obrigatória
- Experiência: mínimo 2 caracteres
- Currículo: obrigatório (PDF/DOC/DOCX, máx 10MB)

**Ação:**

- Enviar currículo
- Redirecionar para WhatsApp com mensagem pré-preenchida

#### Bloco: Por que se cadastrar?

- Acesso a vagas exclusivas
- Acompanhamento de processos
- Orientação profissional
- Entrevistas agendadas

#### CTA alternativo

- Já tem conta? [Login]
- Ver vagas disponíveis → `/vagas`

### SEO

- Title: Envie seu Currículo | Cadastre-se | J&S Empregos
- Description: Cadastre seu currículo e candidate-se às vagas. Entre para o banco de talentos da J&S.

---

## 4.6 ABOUT US (Sobre)

### Objetivo

Transmitir credibilidade, história e valores da empresa.

### Estrutura

#### Hero

**Título:** Sobre a J&S Empregos

**Texto:**

> Especializada em mão de obra temporária e efetiva, recrutamento, seleção e serviços de facilities.

#### Bloco: Quem somos

> A J&S Empregos LTDA é uma empresa especializada em oferecer soluções de terceirização de mão de obra temporária e efetiva, além de serviços de facilities. Nossa missão é conectar empresas aos melhores profissionais, tornando processos de contratação mais eficientes e ágeis.

#### Bloco: Missão

> Conectar empresas aos profissionais certos e ajudar candidatos a conquistarem novas oportunidades, por meio de recrutamento, seleção e um banco de talentos sempre atualizado.

#### Bloco: Visão

> Ser a referência em agência de empregos e assessoria de RH, reconhecida pela excelência no recrutamento e pela conexão humanizada entre empresas e talentos.

#### Bloco: Valores

- Excelência
- Inovação
- Transparência
- Responsabilidade
- Compromisso

#### Bloco: Nossos diferenciais

- Equipe especializada
- Processos ágeis
- Atendimento humanizado
- Tecnologia aplicada
- Rede de empresas parceiras

#### Bloco: Timeline

- 2011 — Fundação
- 2015 — Expansão para Facilities
- 2018 — Tecnologia e processos digitais
- 2020 — Crescimento de clientes
- 2022 — Plataforma digital
- 2024 — Expansão nacional

#### CTA

**Quer fazer parte da nossa história?**
[Cadastrar Currículo] [Fale Conosco]

### SEO

- Title: Sobre Nós | J&S Empregos LTDA
- Description: Conheça a história, missão e valores da J&S Empregos. Especialistas em RH, mão de obra e facilities.

---

# 5. NAVIGATION & SEO STRATEGY

## 5.1 Navbar

### Desktop

```
[Logo]   Início   Vagas   Empresas   Candidatos   Serviços   Sobre   [Login]   [Cadastrar CV]   [Divulgar Vaga]
```

### Mobile

```
[Logo]   [Menu]
  - Início
  - Vagas
  - Empresas
  - Candidatos
  - Serviços
  - Sobre
  - Contato
  - Login
```

### Regras

- Máximo 7-8 itens visíveis
- Itens secundários agrupados em dropdown "Mais" (futuro)
- CTAs destacadas: Cadastrar Currículo + Divulgar Vaga
- Login sempre acessível

## 5.2 Footer

### Estrutura em colunas

```
┌─────────────────────────────────────────────────────────────┐
│ J&S Empregos LTDA                                      │
│ Agência de Empregos e Assessoria em RH                     │
│ [Descrição curta]                                          │
│ [Redes sociais]                                            │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ PARA CANDIDATOS │ PARA EMPRESAS │ EMPRESA     │ ATENDIMENTO  │
│ Vagas          │ Serviços      │ Sobre        │ FAQ          │
│ Trabalhe Con.  │ Temporária    │ Clientes     │ Suporte      │
│ Processo Sel.  │ Efetiva       │ Parceiros    │ Contato      │
│               │ RH            │ Fornecedores │ WhatsApp     │
│               │ Facilities    │              │              │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ Privacidade | Termos | LGPD | Cookies                      │
│ © 2024 J&S Empregos LTDA. Todos os direitos reservados │
└─────────────────────────────────────────────────────────────┘
```

### Regras

- Agrupamento por intenção do usuário
- Links sempre funcionais
- WhatsApp como canal prioritário
- Legal sempre presente

## 5.3 SEO Framework

### Metadata por página

#### `/` — Home

- Title: J&S Empregos LTDA | Agência de Empregos e RH
- Description: Conectamos talentos às melhores oportunidades. Recrutamento, seleção, mão de obra temporária e efetiva.

#### `/vagas`

- Title: Vagas de Emprego | Encontre sua oportunidade | J&S
- Description: Centenas de vagas atualizadas diariamente. Encontre a oportunidade certa para seu perfil.

#### `/vagas/:slug`

- Title: [Cargo] em [Cidade] | J&S Empregos
- Description: Detalhes da vaga de [cargo]: requisitos, benefícios, salário e como se candidatar.

#### `/empresas`

- Title: Recrutamento para Empresas | Contratar Funcionários | J&S
- Description: Encontre profissionais qualificados. Mão de obra temporária, efetiva e assessoria em RH.

#### `/candidatos`

- Title: Encontre seu Emprego | Cadastre seu Currículo | J&S
- Description: Cadastre seu currículo e encontre vagas compatíveis. Acompanhe seus processos seletivos.

#### `/servicos`

- Title: Serviços de RH e Facilities | J&S Empregos
- Description: Soluções completas em RH, mão de obra temporária e efetiva, e facilities.

#### `/servicos/:slug`

- Title: [Serviço] | J&S Empregos
- Description: Conheça nossos serviços de [serviço]: [descrição curta].

#### `/trabalhe-conosco`

- Title: Envie seu Currículo | Cadastre-se | J&S
- Description: Cadastre seu currículo e candidate-se às vagas. Entre para o banco de talentos.

#### `/processo-seletivo`

- Title: Como Funciona o Processo Seletivo | J&S
- Description: Entenda as etapas: cadastro, candidatura, processo seletivo e contratação.

#### `/sobre`

- Title: Sobre Nós | J&S Empregos LTDA
- Description: Conheça a história, missão e valores da J&S. Especialistas em RH e mão de obra.

#### `/clientes`

- Title: Clientes | J&S Empregos
- Description: Empresas que confiam nos nossos serviços de RH e facilities.

#### `/contato`

- Title: Fale Conosco | Contato | J&S
- Description: Entre em contato: WhatsApp, telefone, e-mail. Endereço e horário de atendimento.

#### `/login`

- Title: Login | Acesse sua Conta | J&S
- Description: Acesse sua conta de candidato, empresa ou RH.

### SEO Técnico

1. **Sitemap.xml** — dinâmico quando houver banco real
2. **Robots.txt** — bloquear áreas privadas (/dashboard, /admin)
3. **Canonical** — uma URL por página
4. **Open Graph** — title, description, image, url
5. **Twitter Card** — title, description, image
6. **Schema.org** — Organization, JobPosting (vagas), LocalBusiness
7. **Alt text** — obrigatório em todas as imagens
8. **Heading hierarchy** — H1 único, H2/H3 organizados

### Keywords estratégicas

**Primárias:**

- recrutamento e seleção
- mão de obra temporária
- mão de obra efetiva
- agência de empregos
- assessoria em RH
- banco de talentos

**Secundárias:**

- vagas de emprego
- facilities
- limpeza profissional
- portaria
- controle de acesso
- jardinagem

**Long-tail:**

- recrutamento para empresas em São Paulo
- mão de obra temporária para indústria
- banco de talentos qualificado
- assessoria em RH para pequenas empresas

---

# 6. Development Roadmap

## Fase 1 — Conteúdo e experiência pública

1. Home (estrutura final)
2. Serviços (RH + Facilities)
3. Vagas + VagaDetalhe
4. Empresas (B2B)
5. Candidatos
6. Trabalhe Conosco
7. Processo Seletivo
8. Sobre
9. Clientes/Parceiros/Fornecedores

## Fase 2 — Navegação

1. Navbar agrupada
2. Footer reorganizado
3. Mobile menu

## Fase 3 — SEO

1. Metadata por página
2. Schema.org
3. Sitemap dinâmico
4. SEO de vagas

## Fase 4 — Acessibilidade

1. Botão de acessibilidade
2. Text-to-speech
3. Navegação por teclado
4. ARIA labels

## Fase 5 — Plataforma

1. Supabase
2. Auth + RBAC
3. Dashboard
4. Cadastro de vagas
5. Currículos
6. Candidaturas
7. Entrevistas
8. Notificações

---

# 7. Princípios de Design

## Premium

- Espaço em branco generoso
- Tipografia forte
- Cores sóbrias
- Animações sutis
- Sem efeitos exagerados

## Profissional

- Linguagem clara
- Sem jargões desnecessários
- Foco em resultados
- Provas sociais

## Responsivo

- Mobile-first
- Touch-friendly
- Performance otimizada
- Imagens otimizadas (WebP/AVIF)

## Acessível

- WCAG 2.1 AA
- Contraste adequado
- Navegação por teclado
- Screen reader friendly

---

# 8. Métricas de Sucesso

## Conversão

- Taxa de cadastro de currículos
- Taxa de solicitação de orçamento
- Taxa de clique em vagas
- Tempo na página

## SEO

- Tráfego orgânico
- Posicionamento para "recrutamento", "mão de obra temporária", "RH"
- Páginas indexadas
- Schema markup funcionando

## UX

- Taxa de rejeição
- Tempo de carregamento
- Navegação por página
- Retorno de usuários

---

# 9. Próximos Passos

1. Implementar Services Page (prioridade máxima)
2. Revisar Vagas + VagaDetalhe
3. Revisar Empresas
4. Revisar Candidatos + Trabalhe Conosco
5. Revisar Sobre
6. Aplicar SEO por página
7. Acessibilidade
8. Chat/IA (futuro)
