# J&S Empregos LTDA.

# MASTER PRODUCT & WEBSITE ARCHITECTURE

## Documento Mestre de Arquitetura, Conteúdo, UX/UI, SaaS e Implementação

**Versão:** 1.0
**Data:** 08/08/2026
**Status:** Documento Mestre de Projeto
**Produto:** Plataforma Web / SaaS Institucional + Captação + Recrutamento + Serviços B2B
**Empresa:** J&S Empregos Ltda.

---

# 1. PROPÓSITO DESTE DOCUMENTO

Este documento é a **fonte de verdade do projeto**.

Todo desenvolvimento, refatoração, alteração visual, criação de páginas, criação de componentes e evolução futura deverá respeitar este documento.

O projeto NÃO deve ser tratado como uma simples landing page.

A plataforma deverá combinar:

- presença institucional;
- geração de leads B2B;
- recrutamento;
- vagas;
- jornada de candidatos;
- jornada de empresas;
- serviços de terceirização;
- facilities;
- assessoria em Recursos Humanos;
- parceiros;
- fornecedores;
- atendimento;
- acessibilidade;
- futura automação;
- futura integração com IA;
- futura área autenticada;
- futura operação SaaS.

---

# 2. REGRA FUNDAMENTAL DO PROJETO

## NÃO reconstruir o projeto do zero.

O projeto já possui páginas, componentes, rotas, formulários, mocks, estruturas de navegação e funcionalidades.

A evolução deve seguir:

```text
EXISTENTE
   ↓
AUDITAR
   ↓
PRESERVAR
   ↓
REORGANIZAR
   ↓
MELHORAR
   ↓
EXPANDIR
```

Nunca:

```text
EXISTENTE
   ↓
APAGAR
   ↓
CRIAR OUTRO SITE
```

---

# 3. IDENTIDADE OFICIAL

## Nome oficial

**J&S Empregos Ltda.**

Toda a aplicação deverá utilizar a identidade oficial centralizada em:

```text
src/config/company.ts
```

Não espalhar nomes da empresa manualmente pelo código.

## Proibido

Não utilizar como identidade principal:

- JR;
- JR RH;
- JS Empregos;
- JS Empregos RH;
- qualquer outra variação não autorizada.

Caso apareça uma referência antiga, deve ser identificada durante auditoria.

---

# 4. POSICIONAMENTO ESTRATÉGICO

A J&S Empregos possui uma operação real ligada a:

- terceirização;
- facilities;
- limpeza;
- conservação;
- controle de acesso;
- portaria;
- recepção;
- jardinagem;
- mão de obra temporária;
- mão de obra efetiva;
- Recursos Humanos.

O cliente decidiu direcionar a comunicação comercial para:

# ASSESSORIA EM RECURSOS HUMANOS

Este é o **carro-chefe comercial da nova Home**.

Porém:

> A mudança de posicionamento não significa apagar a história, os serviços ou a operação de terceirização da J&S.

A plataforma deve comunicar a evolução:

```text
J&S Empregos
        │
        ├── Assessoria em RH
        │
        ├── Recrutamento e Seleção
        │
        ├── Mão de Obra Temporária
        │
        ├── Mão de Obra Efetiva
        │
        ├── Terceirização
        │
        └── Facilities
```

---

# 5. FRASE PRINCIPAL DA HOME

O cliente definiu como destaque:

> **Mais eficiência em Recursos Humanos, mais agilidade para sua empresa.**

Esta frase deve ser tratada como o principal posicionamento do Hero.

Texto de apoio:

> **Simplifique processos, reduza o tempo gasto com tarefas operacionais e foque no que realmente importa: o crescimento do seu negócio.**

Não substituir essa mensagem por uma headline genérica de agência de empregos.

---

# 6. SEGUNDA JORNADA: CANDIDATOS

A J&S também possui uma jornada B2C.

O candidato deve conseguir:

- encontrar vagas;
- visualizar detalhes;
- entender requisitos;
- consultar localização;
- consultar tipo de contratação;
- consultar benefícios quando disponíveis;
- candidatar-se;
- cadastrar currículo;
- acompanhar sua jornada futuramente.

Mensagem complementar:

> **Conectando talentos às melhores oportunidades.**

Essa mensagem pode ser utilizada na área de candidatos e em seções secundárias da Home.

---

# 7. MODELO DE DUAS JORNADAS

A experiência deve distinguir claramente:

## B2B — Empresas

Objetivo:

> Encontrar profissionais e soluções de RH/terceirização.

Principais CTAs:

- Contratar Funcionários;
- Divulgar Vaga;
- Solicitar Orçamento;
- Conhecer Soluções;
- Falar com a J&S.

## B2C — Candidatos

Objetivo:

> Encontrar oportunidades profissionais.

Principais CTAs:

- Quero uma Vaga;
- Ver Vagas;
- Cadastrar Currículo;
- Candidatar-se.

---

# 8. SITEMAP PRINCIPAL

## Navegação principal

```text
/
├── /vagas
│   └── /vagas/:slug
│
├── /empresas
├── /candidatos
├── /servicos
│   └── /servicos/:slug
├── /sobre
├── /blog
│   └── /blog/:slug
└── /contato
```

## Páginas secundárias existentes

```text
/clientes
/parceiros
/fornecedores
/trabalhe-conosco
/processo-seletivo
/suporte
/faq
/login
/dashboard
```

Essas páginas devem permanecer.

Não devem necessariamente ocupar espaço no menu principal.

Podem ser distribuídas por:

- submenu;
- CTAs;
- Footer;
- páginas relacionadas;
- área autenticada.

---

# 9. ARQUITETURA DE NAVEGAÇÃO

## Header

Estrutura recomendada:

```text
Logo
Início
Vagas
Empresas
Candidatos
Serviços
Sobre Nós
Blog
Contato

[ Cadastrar Currículo ]
[ Divulgar Vaga ]
```

No mobile:

```text
Logo                         ☰
```

Ao abrir:

- menu lateral;
- overlay;
- backdrop blur;
- foco controlado;
- ESC fecha;
- clique fora fecha;
- scroll da página bloqueado;
- navegação acessível por teclado.

---

# 10. HOME — ARQUITETURA

A Home deve ser a página comercial mais importante.

## Ordem recomendada

```text
1. Hero
2. Soluções para Empresas
3. Assessoria em RH
4. Facilities / Terceirização
5. Para Candidatos
6. Vagas em Destaque
7. Como Funciona
8. Diferenciais
9. Clientes / Parceiros
10. Depoimentos — somente dados reais
11. Blog
12. CTA Final
13. Footer
```

---

# 11. HOME — HERO

## Objetivo

Apresentar imediatamente o posicionamento comercial.

## Layout

Desktop:

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│  TEXTO / CTA                    IMAGEM              │
│                                                     │
│  Mais eficiência em RH...       FOTO DA EQUIPE     │
│                                                     │
│  Texto de apoio                                      │
│                                                     │
│  [Contratar] [Conhecer soluções]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Não utilizar texto sobre imagem como estrutura principal.

Preferir duas colunas.

## Imagem

A imagem deve ser um elemento `<img>`.

Não utilizar `background-image` para o Hero principal.

## Fallback

O componente deverá possuir fallback visual local.

Exemplo:

```text
HeroImage
 ├── loading
 ├── loaded
 └── error
       ↓
    SVG fallback
```

O fallback deve:

- ser corporativo;
- ser acessível;
- funcionar em light mode;
- funcionar em dark mode;
- não depender de rede externa.

---

# 12. COMPONENTE HEROIMAGE

Criar componente reutilizável.

Responsabilidades:

- carregamento;
- fallback;
- erro;
- alt;
- lazy loading quando apropriado;
- transição;
- dark mode;
- reduced motion.

Interface conceitual:

```ts
type HeroImageProps = {
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
};
```

Preparar a estrutura para múltiplas imagens futuramente, mas não implementar carrossel sem necessidade.

---

# 13. SEÇÃO SOLUÇÕES PARA EMPRESAS

Apresentar:

### Assessoria em RH

Carro-chefe.

### Recrutamento e Seleção

Encontrar profissionais adequados às necessidades da empresa.

### Mão de Obra Temporária

Apoio para demandas sazonais e necessidades temporárias.

### Mão de Obra Efetiva

Apoio na contratação de profissionais.

### Terceirização de Serviços

Operação terceirizada conforme necessidade.

### Facilities

- limpeza;
- conservação;
- controle de acesso;
- portaria;
- recepção;
- jardinagem;
- outras soluções reais da empresa.

Cada serviço deve possuir:

```text
/servicos/:slug
```

---

# 14. PÁGINAS DINÂMICAS DE SERVIÇOS

Não criar uma página React diferente para cada serviço.

Utilizar:

```text
/servicos/:slug
```

Exemplo:

```text
/servicos/assessoria-rh
/servicos/recrutamento-selecao
/servicos/mao-de-obra-temporaria
/servicos/terceirizacao
/servicos/limpeza-conservacao
```

A estrutura visual pode ser a mesma.

Os dados mudam conforme o slug.

---

# 15. ARQUITETURA DE DADOS DE SERVIÇOS

Preferir conteúdo desacoplado:

```text
src/content/services/
```

ou:

```text
src/data/services.ts
```

Estrutura:

```ts
{
  (slug,
    title,
    shortDescription,
    description,
    image,
    icon,
    benefits,
    features,
    targetAudience,
    cta);
}
```

A UI não deve conter todo o texto diretamente.

---

# 16. CANDIDATOS

Página:

```text
/candidatos
```

Objetivo:

Apresentar a jornada do candidato.

Conteúdo:

- encontrar vagas;
- cadastrar currículo;
- acompanhar oportunidades;
- preparar currículo;
- processo seletivo;
- orientação profissional.

CTA:

```text
[Ver Vagas]
[Cadastrar Currículo]
```

---

# 17. VAGAS

Página:

```text
/vagas
```

Deve funcionar como catálogo dinâmico.

Filtros previstos:

- cargo;
- cidade;
- estado;
- área;
- tipo de contrato;
- salário;
- data de publicação.

---

# 18. DETALHE DE VAGA

Rota:

```text
/vagas/:slug
```

Ao clicar em uma vaga:

NÃO retornar apenas para `/vagas`.

Abrir a vaga específica.

Exemplo:

```text
/vagas/auxiliar-de-limpeza-poa
```

Página:

```text
Título
Empresa — quando autorizado
Localização
Tipo de contrato
Faixa salarial
Benefícios
Requisitos
Descrição
Responsabilidades
Informações adicionais

[ Candidatar-se ]
```

---

# 19. FORMULÁRIO DE CANDIDATURA

O formulário deve ser reutilizável.

Não duplicar código para cada vaga.

Arquitetura:

```text
VagaDetalhe
      ↓
CandidaturaForm
      ↓
vagaId / vagaSlug
      ↓
dados do candidato
```

O formulário recebe a identificação da vaga.

Exemplo conceitual:

```tsx
<CandidaturaForm vagaId={vaga.id} vagaSlug={vaga.slug} />
```

Assim uma única implementação atende todas as vagas.

---

# 20. TRABALHE CONOSCO

Página existente:

```text
/trabalhe-conosco
```

Deve funcionar como porta de entrada para candidatos.

Pode conter:

- cadastro;
- currículo;
- áreas de interesse;
- oportunidades;
- processo seletivo.

Não transformar essa página em uma segunda página `/vagas`.

---

# 21. EMPRESAS

Página:

```text
/empresas
```

Objetivo:

Converter empresas em leads.

Conteúdo:

- problema;
- solução;
- serviços;
- processo;
- benefícios;
- CTA.

CTA principal:

> **Solicitar orçamento**

CTA secundário:

> **Falar com a J&S**

---

# 22. CLIENTES

Página:

```text
/clientes
```

Pode funcionar como extensão da jornada B2B.

Não confundir:

```text
Clientes
```

com:

```text
Parceiros
```

ou:

```text
Fornecedores
```

Cada entidade possui objetivo próprio.

---

# 23. PARCEIROS

Página:

```text
/parceiros
```

Objetivo:

Apresentar ou captar parceiros estratégicos.

Não inventar empresas.

Somente utilizar:

- logos;
- nomes;
- descrições;

quando fornecidos/autorizados.

---

# 24. FORNECEDORES

Página:

```text
/fornecedores
```

Esta página deve ser preservada.

Objetivo:

Permitir relacionamento/cadastro de fornecedores.

Ela pode evoluir posteriormente para:

```text
Fornecedor
   ↓
Cadastro
   ↓
Análise
   ↓
Relacionamento
   ↓
Área autenticada
```

Não remover apenas porque não está no briefing principal.

---

# 25. SOBRE NÓS

Página:

```text
/sobre
```

Objetivo:

Construir confiança.

Conteúdo:

- história;
- quem somos;
- missão;
- visão;
- valores;
- atuação;
- diferenciais;
- equipe;
- certificações somente se confirmadas.

---

# 26. TIMELINE DA HISTÓRIA

A página Sobre deverá futuramente possuir uma Timeline Cinemática.

Estrutura:

```text
ANO
 │
 ●──────────────
 │
 │ imagem
 │
 │ acontecimento
 │
 ●──────────────
 │
 │ imagem
 │
 │ acontecimento
 │
 ●──────────────
```

Com:

- scroll animation;
- fade;
- deslocamento suave;
- imagens;
- fatos;
- marcos.

Obrigatório:

```text
prefers-reduced-motion
```

Quando o usuário solicitar redução de movimento:

- remover parallax;
- remover animações excessivas;
- manter conteúdo totalmente acessível.

IMPORTANTE:

Não inventar anos ou acontecimentos.

Dados históricos devem vir do cliente.

---

# 27. BLOG

Rotas:

```text
/blog
/blog/:slug
```

Estrutura dinâmica.

Artigos inicialmente podem utilizar dados mockados.

Posteriormente:

```text
Supabase
   ↓
posts
   ↓
slug
   ↓
BlogDetail
```

Conteúdo deve ser separado da UI.

---

# 28. CONTATO

Página:

```text
/contato
```

Campos:

- nome;
- empresa;
- e-mail;
- telefone;
- assunto;
- mensagem.

Informações reais:

- WhatsApp;
- endereço;
- horário;
- e-mail.

Dados oficiais da empresa devem vir de configuração central.

---

# 29. SUPORTE

Página:

```text
/suporte
```

Deve ser o hub de atendimento.

Estrutura:

```text
Precisa de ajuda?

┌────────────────────┐
│ 🤖 Assistente IA   │
└────────────────────┘

┌────────────────────┐
│ 👤 Atendimento     │
│ Humano             │
└────────────────────┘

┌────────────────────┐
│ WhatsApp           │
└────────────────────┘

┌────────────────────┐
│ FAQ                │
└────────────────────┘
```

---

# 30. CHAT IA

O chatbot IA será separado do atendimento humano.

Primeira versão:

- respostas baseadas no conteúdo do site;
- mensagens previamente configuradas;
- estrutura pronta para API;
- interface independente.

Posteriormente:

```text
Frontend
   ↓
n8n
   ↓
LLM
   ↓
Knowledge Base
   ↓
Resposta
```

Não colocar API key diretamente no frontend.

Nunca expor:

```text
OPENAI_API_KEY
GEMINI_API_KEY
```

em código client-side.

---

# 31. ESCALAÇÃO IA → HUMANO

Fluxo futuro:

```text
Usuário
   ↓
Chat IA
   ↓
resolve?
 ┌───────┴────────┐
 SIM              NÃO
 │                 │
 ▼                 ▼
fim          Atendimento humano
                   │
                   ▼
                  n8n
                   │
                   ▼
             equipe J&S
```

A IA não deve fingir ser um atendente humano.

Quando houver transferência:

> “Vou encaminhar seu atendimento para nossa equipe.”

---

# 32. CHAT HUMANO REALTIME

Futura arquitetura:

```text
Supabase
├── chat_rooms
├── chat_messages
├── chat_sessions
└── chat_participants
```

Comunicação:

```text
Supabase Realtime
```

Possível fluxo:

```text
Cliente
   ↕
Chat
   ↕
Supabase Realtime
   ↕
Atendente
```

n8n poderá atuar como orquestrador de eventos e automações.

---

# 33. ACESSIBILIDADE

A acessibilidade é uma funcionalidade global.

O componente:

```text
AccessibilityWidget
```

deve ficar disponível globalmente.

## Recursos

### Visual

- aumentar fonte;
- diminuir fonte;
- reset;
- contraste;
- alto contraste;
- escala de cinza;
- destacar links;
- espaçamento;
- redução de movimento.

### Leitura

- TTS;
- iniciar;
- parar;
- cancelar;
- evitar leitura de elementos ocultos.

Utilizar Web Speech API inicialmente.

Idioma padrão:

```text
pt-BR
```

---

# 34. PAINEL DE ACESSIBILIDADE

Quando aberto:

```text
┌──────────────────────────────┐
│ Acessibilidade          X    │
├──────────────────────────────┤
│ Aumentar texto               │
│ Diminuir texto               │
│ Alto contraste               │
│ Escala de cinza              │
│ Destacar links               │
│ Espaçamento                  │
│ Reduzir animações            │
│ Ler página                   │
├──────────────────────────────┤
│ Atendimento                  │
│ WhatsApp                     │
│ Chat Online                  │
└──────────────────────────────┘
```

O backdrop deve estar:

```text
atrás do painel
```

e não dentro dele.

Usar:

```text
bg-black/40
backdrop-blur-sm
```

ou token equivalente.

---

# 35. REGRAS DO OVERLAY DE ACESSIBILIDADE

Quando aberto:

- bloquear scroll do body;
- `ESC` fecha;
- clique fora fecha;
- foco inicial no painel;
- foco não deve escapar;
- `aria-modal="true"`;
- `role="dialog"`;
- botão de fechar acessível;
- backdrop separado do conteúdo.

---

# 36. WIDGETS FLUTUANTES

Não permitir que widgets cubram:

- Footer;
- BottomNavigation;
- botões;
- links;
- conteúdo importante.

Hierarquia sugerida:

```text
Footer              z-10
BottomNavigation    z-30
Accessibility       z-50
Chat                z-50
Navbar              z-50
```

Em mobile, avaliar posicionamento dinâmico.

Os widgets não podem ficar sobrepostos.

---

# 37. CHAT + ACESSIBILIDADE

Acessibilidade:

```text
Atendimento
 ├── WhatsApp
 └── Chat Online
```

Chat IA pode possuir botão próprio.

Não criar vários botões flutuantes desnecessários.

Objetivo:

```text
menos elementos
mais clareza
```

---

# 38. RESPONSIVIDADE

Desktop:

```text
1280+
```

Tablet:

```text
768+
```

Mobile:

```text
<768
```

Mobile deve possuir:

- menu hamburger;
- sidebar/menu lateral;
- backdrop;
- blur;
- scroll lock;
- foco;
- animação;
- fechamento por ESC.

O menu pode ocupar aproximadamente parte da largura da tela, mantendo o restante como área de backdrop.

---

# 39. CARDS

O site não deve parecer:

- texto solto;
- minimalista excessivamente;
- wireframe;
- template vazio.

Cards devem possuir:

- superfície visual;
- borda;
- contraste;
- radius consistente;
- sombra moderada;
- estados hover/focus;
- conteúdo bem agrupado.

Não utilizar transparência excessiva em cards com texto.

---

# 40. DARK MODE / LIGHT MODE

Todo componente deve funcionar nos dois temas.

Não utilizar:

```text
bg-white
text-black
border-gray-200
```

sem avaliar o contexto.

Preferir tokens semânticos:

```text
bg-background
bg-card
bg-surface
text-foreground
text-muted-foreground
border-border
```

ou os tokens equivalentes existentes.

---

# 41. REGRA PARA CARDS EM TEMA

Ao trocar:

```text
light → dark
dark → light
```

o layout não pode:

- quebrar;
- mudar tamanho abruptamente;
- perder contraste;
- deixar texto invisível;
- deixar borda invisível;
- alterar dimensões de forma inesperada.

Particular atenção:

```text
Login
Cards
Forms
Modal
Dropdown
Chat
Accessibility
Footer
Navbar
```

---

# 42. LOGIN

A página `/login` precisa ser auditada especificamente.

Problema conhecido:

> O card de login aumenta/distorce quando o tema é alterado.

Investigar:

- altura;
- padding;
- transições;
- shadow;
- border;
- background;
- fontes;
- conteúdo condicional;
- troca de tokens.

A mudança de tema deve alterar apenas aparência.

Não deve alterar estrutura/layout.

---

# 43. FORMULÁRIOS

Componentes existentes:

```text
Input
Textarea
Select
Button
Label
```

Devem continuar reutilizáveis.

Todos devem possuir:

- label;
- foco;
- erro;
- placeholder;
- contraste;
- disabled;
- loading quando necessário;
- suporte a dark/light;
- suporte a teclado.

---

# 44. FORMULÁRIOS B2B

Separar:

```text
CompanyLeadForm
```

de:

```text
CandidateForm
```

e:

```text
SupplierForm
```

e:

```text
PartnerForm
```

Não criar um formulário gigante universal.

Pode existir um sistema compartilhado de primitives, mas cada jornada possui seu próprio modelo de dados.

---

# 45. MODELO DE COMPONENTES

Estrutura recomendada:

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   ├── sections/
│   ├── ui/
│   ├── forms/
│   ├── accessibility/
│   ├── chat/
│   └── vacancies/
│
├── pages/
│
├── content/
│   ├── home/
│   ├── services/
│   ├── vacancies/
│   ├── about/
│   └── blog/
│
├── config/
│
├── services/
│
├── hooks/
│
└── types/
```

Não mover tudo de uma vez.

Refatoração incremental.

---

# 46. PRINCÍPIO DE REUTILIZAÇÃO

Antes de criar:

```text
NovoComponente.tsx
```

verificar se já existe componente equivalente.

Exemplo:

```text
Formulario.tsx
Input.tsx
Button.tsx
Card.tsx
Section.tsx
Container.tsx
HeroImage.tsx
```

Reutilizar antes de duplicar.

---

# 47. CONFIGURAÇÃO CENTRAL

Identidade:

```text
src/config/company.ts
```

SEO:

```text
src/config/seo.ts
src/config/seoPages.ts
```

WhatsApp:

```text
src/config/whatsappMessages.ts
```

Social:

```text
SOCIAL_LINKS
```

Não espalhar informações da empresa por páginas.

---

# 48. CONTEÚDO DESACOPLADO

Textos comerciais devem preferencialmente ficar em:

```text
src/content/
```

Exemplo:

```text
src/content/home.ts
src/content/services.ts
src/content/about.ts
src/content/candidates.ts
```

Objetivo:

Alterar conteúdo sem reconstruir componentes inteiros.

---

# 49. SUPABASE — FUTURA CAMADA DE DADOS

O projeto deverá estar preparado para Supabase.

Entidades futuras:

```text
users
candidates
companies
suppliers
partners
vacancies
applications
services
posts
chat_rooms
chat_messages
contact_leads
company_leads
```

Não implementar todas de uma vez.

Priorizar:

```text
vagas
candidaturas
leads
usuários
```

---

# 50. VAGAS — FUTURO BANCO

Modelo conceitual:

```text
vacancies
├── id
├── slug
├── title
├── company_id
├── location
├── contract_type
├── salary_min
├── salary_max
├── description
├── requirements
├── benefits
├── status
├── published_at
└── expires_at
```

---

# 51. CANDIDATURAS

Modelo:

```text
applications
├── id
├── vacancy_id
├── candidate_id
├── status
├── created_at
└── updated_at
```

A vaga é o contexto da candidatura.

---

# 52. SAAS — EVOLUÇÃO FUTURA

A plataforma poderá evoluir para:

```text
                    J&S PLATFORM
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Empresa        Candidato      Operação
          │              │              │
      Publicar       Encontrar        Gestão
        vaga           vaga           vagas
          │              │              │
       Leads         Candidaturas     Processos
```

Futuramente:

```text
Admin
Empresa
Candidato
Fornecedor
Parceiro
Atendente
```

com permissões diferentes.

---

# 53. SEO

Cada página deve possuir:

- title;
- description;
- canonical;
- Open Graph;
- Twitter metadata quando aplicável;
- structured data quando apropriado.

Vagas devem possuir SEO próprio.

Serviços devem possuir SEO próprio.

Blog deve possuir SEO próprio.

---

# 54. ACESSIBILIDADE + SEO

Não criar acessibilidade apenas através do widget.

A própria aplicação deve possuir:

- HTML semântico;
- H1 único por página;
- hierarquia H2/H3;
- alt;
- labels;
- foco;
- keyboard navigation;
- landmarks;
- contraste;
- reduced motion.

O widget é complementar.

---

# 55. ANIMAÇÕES

Usar motion para:

- entrada de seções;
- cards;
- timeline;
- hero;
- transições de menu;
- feedback.

Evitar:

- animações excessivas;
- parallax obrigatório;
- elementos pulando;
- efeitos que prejudicam leitura.

Sempre respeitar:

```text
prefers-reduced-motion
```

---

# 56. IMAGENS

Preferência:

1. imagens reais da empresa;
2. imagens fornecidas pelo cliente;
3. imagens do PDF/portfólio autorizado;
4. placeholders SVG locais.

Nunca inventar:

- funcionários;
- clientes;
- parceiros;
- instalações;
- certificações.

---

# 57. DADOS REAIS

Não inventar:

- quantidade de currículos;
- quantidade de empresas;
- quantidade de contratações;
- percentual de satisfação;
- clientes;
- depoimentos;
- certificações;
- anos de história;
- parceiros.

Se o briefing apresentar um exemplo como:

```text
+10.000 currículos
+500 empresas
+2.000 contratações
95%
```

tratar como:

```text
PENDING CLIENT VERIFICATION
```

até confirmação.

---

# 58. CONTEÚDO LEGAL

Informações jurídicas, tributárias ou trabalhistas extraídas de materiais comerciais devem passar por:

```text
LEGAL REVIEW REQUIRED
```

Não apresentar como aconselhamento jurídico.

---

# 59. FOOTER

Footer deve possuir:

## Empresa

- Sobre;
- Serviços;
- Contato.

## Oportunidades

- Vagas;
- Candidatos;
- Trabalhe Conosco.

## Negócios

- Empresas;
- Parceiros;
- Fornecedores.

## Atendimento

- Suporte;
- FAQ;
- WhatsApp.

## Legal

- Política de Privacidade;
- Termos de Uso.

Footer deve possuir boa hierarquia e não parecer um bloco de texto.

---

# 60. IDENTIDADE CORPORATIVA DO FOOTER

Utilizar dados oficiais:

**J&S Empregos Ltda.**

Informações fornecidas pelo cliente:

```text
Facilities e Mão de Obra Temporária e Efetiva.

CNPJ:
63.251.959/0001-10

Endereço:
Rodovia João Afonso de Souza Castellano,
411 - Sala 04 - Poá, SP.

Telefone/WhatsApp:
(11) 96838-0592

E-mail:
comercial@jsEmpregos.com.br

Domínio:
www.jsEmpregos.com.br
```

Essas informações devem ficar centralizadas na configuração da empresa.

---

# 61. REGRA DE DOMÍNIO

O domínio oficial informado pelo cliente é:

```text
jsEmpregos.com.br
```

Não utilizar domínio de teste como identidade oficial.

---

# 62. REGRA DE IMPLEMENTAÇÃO NO CODEX

Antes de modificar qualquer página:

1. Ler o código atual.
2. Identificar componentes reutilizáveis.
3. Identificar dependências.
4. Verificar rotas.
5. Verificar se existe funcionalidade equivalente.
6. Preservar comportamento existente.
7. Fazer alteração mínima necessária.
8. Executar typecheck.
9. Executar build.
10. Informar arquivos alterados.

---

# 63. REGRA DE NÃO DESTRUIÇÃO

O agente NÃO deve:

- apagar páginas;
- apagar rotas;
- apagar componentes;
- remover fornecedores;
- remover parceiros;
- remover clientes;
- remover suporte;
- remover FAQ;
- remover dashboard;
- remover vagas;
- remover formulários;

sem autorização explícita.

Se algo parecer obsoleto:

```text
REPORTAR
```

antes de remover.

---

# 64. WORKFLOW DE IMPLEMENTAÇÃO

O projeto será desenvolvido página por página.

Ordem:

```text
FASE 0
Auditoria geral

FASE 1
Base visual / tokens / layout

FASE 2
Home

FASE 3
Empresas

FASE 4
Candidatos

FASE 5
Vagas

FASE 6
Detalhe da vaga

FASE 7
Serviços

FASE 8
Detalhe do serviço

FASE 9
Sobre + Timeline

FASE 10
Blog

FASE 11
Contato

FASE 12
Suporte

FASE 13
Parceiros

FASE 14
Fornecedores

FASE 15
Login

FASE 16
Dashboard

FASE 17
Integrações / Supabase

FASE 18
IA / n8n / Chat humano
```

---

# 65. CHECKLIST POR PÁGINA

Antes de considerar uma página concluída:

## Conteúdo

- [ ] conteúdo aprovado;
- [ ] identidade correta;
- [ ] sem informação inventada;
- [ ] CTA correto.

## UX

- [ ] desktop;
- [ ] tablet;
- [ ] mobile;
- [ ] estados vazios;
- [ ] loading;
- [ ] erro;
- [ ] sucesso.

## Acessibilidade

- [ ] teclado;
- [ ] foco;
- [ ] contraste;
- [ ] labels;
- [ ] alt;
- [ ] ARIA quando necessário;
- [ ] reduced motion.

## Tema

- [ ] light;
- [ ] dark;
- [ ] troca de tema sem alteração estrutural;
- [ ] cards legíveis;
- [ ] formulários legíveis.

## Código

- [ ] componentes reutilizados;
- [ ] sem duplicação desnecessária;
- [ ] sem hardcoded desnecessário;
- [ ] conteúdo desacoplado quando apropriado.

## SEO

- [ ] title;
- [ ] description;
- [ ] heading hierarchy;
- [ ] canonical quando necessário.

## Qualidade

- [ ] `npm run typecheck`;
- [ ] `npm run build`;
- [ ] console sem erros;
- [ ] runtime sem erros.

---

# 66. DEFINITION OF DONE

Uma página só está concluída quando:

```text
Conteúdo ✓
UX ✓
UI ✓
Responsividade ✓
Acessibilidade ✓
Dark Mode ✓
Light Mode ✓
SEO ✓
Performance ✓
Runtime ✓
Typecheck ✓
Build ✓
```

---

# 67. PRINCÍPIO FINAL

A plataforma deve parecer:

> **uma empresa real que está evoluindo para uma plataforma digital moderna.**

Não deve parecer:

- uma landing page genérica;
- um template de agência de empregos;
- um dashboard disfarçado;
- um site minimalista vazio;
- um conjunto de páginas desconectadas.

A experiência deve transmitir:

```text
J&S Empregos
        ↓
RH
        ↓
Pessoas
        ↓
Empresas
        ↓
Serviços
        ↓
Terceirização
        ↓
Facilities
        ↓
Tecnologia
        ↓
Atendimento
        ↓
Plataforma SaaS
```

---

# 68. REGRA DE OURO

## O CLIENTE DEFINE O NEGÓCIO.

A equipe técnica define:

- arquitetura;
- componentização;
- UX;
- performance;
- segurança;
- escalabilidade;
- acessibilidade.

Mas não deve substituir a visão comercial do cliente por uma visão própria.

A tecnologia deve **potencializar a J&S**, não transformar a J&S em outra empresa.

---

# 69. COMANDO DE TRABALHO PARA O CODEX

Antes de qualquer implementação, utilizar esta instrução:

> Leia integralmente o documento `J&S-MASTER-ARCHITECTURE.md`.
>
> Você está trabalhando em um projeto existente da J&S Empregos Ltda.
>
> Não trate o projeto como uma aplicação nova.
>
> Preserve rotas, páginas, componentes e funcionalidades existentes.
>
> Antes de alterar código, faça uma auditoria da página solicitada e identifique o que pode ser reutilizado.
>
> A implementação deve respeitar a identidade oficial J&S Empregos Ltda., o posicionamento de Assessoria em Recursos Humanos como carro-chefe comercial e a operação existente de terceirização, facilities e mão de obra.
>
> Não invente conteúdo, números, clientes, parceiros, depoimentos, certificações ou histórico.
>
> Não remova funcionalidades existentes sem autorização.
>
> Use componentes reutilizáveis.
>
> Respeite light mode, dark mode, responsividade, acessibilidade, teclado, foco e prefers-reduced-motion.
>
> Execute typecheck e build após as alterações.
>
> Informe exatamente:
>
> 1. o que foi alterado;
> 2. arquivos alterados;
> 3. componentes reutilizados;
> 4. problemas encontrados;
> 5. testes executados;
> 6. o que ainda falta.
>
> Trabalhe somente na página/escopo solicitado nesta etapa.
>
> Não faça refatorações globais não solicitadas.

---

# 70. ESTRATÉGIA DE DESENVOLVIMENTO

A partir deste documento, o projeto passa a ser trabalhado assim:

```text
MASTER MD
    │
    ├── Página
    │     │
    │     ├── Auditoria
    │     ├── Conteúdo
    │     ├── UX
    │     ├── UI
    │     ├── Componentes
    │     ├── Dados
    │     ├── Acessibilidade
    │     ├── Responsividade
    │     └── Testes
    │
    └── Próxima página
```

Não tentar resolver o site inteiro em uma única alteração.

**Uma página por vez.**

Isso permite validar cada etapa com o cliente e evita regressões.

---

# 71. PRIMEIRA PÁGINA A SER TRABALHADA

## HOME

Prioridade:

1. identidade;
2. Hero;
3. Assessoria em RH;
4. soluções B2B;
5. facilities;
6. jornada B2C;
7. vagas;
8. diferenciais;
9. parceiros/clientes;
10. CTA;
11. acessibilidade;
12. responsive;
13. dark/light;
14. performance.

Somente depois da Home aprovada:

```text
Empresas
↓
Candidatos
↓
Vagas
↓
Serviços
...
```

---

# 72. STATUS DO PROJETO

## Já existente / preservar

- React;
- TypeScript;
- Tailwind CSS;
- rotas;
- Home;
- Vagas;
- Detalhe de vaga;
- Empresas;
- Candidatos;
- Serviços;
- Detalhe de serviços;
- Clientes;
- Parceiros;
- Fornecedores;
- Trabalhe Conosco;
- Processo Seletivo;
- Sobre;
- Blog;
- Suporte;
- FAQ;
- Contato;
- Login;
- Dashboard;
- componentes de formulário;
- componentes de layout;
- configuração central da empresa;
- estrutura de acessibilidade;
- estrutura de chat.

## Em evolução

- Home;
- acessibilidade;
- Chat IA;
- Chat humano;
- Timeline;
- Supabase;
- SaaS;
- automações n8n.

---

# 73. VISÃO FINAL DO PRODUTO

```text
                    J&S Empregos
                           │
              ┌────────────┴────────────┐
              │                         │
           EMPRESAS                  CANDIDATOS
              │                         │
       Assessoria RH                Vagas
       Recrutamento                 Currículo
       Terceirização                Candidatura
       Facilities                   Processo seletivo
       Mão de obra                  Oportunidades
              │                         │
              └────────────┬────────────┘
                           │
                       PLATAFORMA
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Parceiros       Fornecedores      Suporte
          │                │                │
          └────────────────┼────────────────┘
                           │
                       TECNOLOGIA
                           │
              ┌────────────┼────────────┐
              │            │            │
           Supabase       n8n          IA
              │            │            │
              └────────────┼────────────┘
                           │
                     SaaS FUTURO
```

**Este é o norte do projeto.**

---

# 74. ASSETS E EXPERIÊNCIA CINEMATOGRÁFICA

## Regra de prioridade de assets

Os assets reais fornecidos pelo cliente possuem prioridade sobre placeholders.

Ordem de preferência:

1. imagens reais da empresa;
2. imagens fornecidas pelo cliente;
3. imagens do PDF/portfólio autorizado;
4. placeholders SVG locais.

O fallback existente deve ser utilizado exclusivamente quando não houver asset adequado ou quando ocorrer falha de carregamento.

## Catálogo centralizado

Os assets devem ser relacionados ao conteúdo por meio de uma configuração centralizada.

Exemplo conceitual:

```ts
{
  slug: "assessoria-em-rh",
  title: "Assessoria em RH",
  image: "/images/services/assessoria-rh.webp",
  fallback: "/images/fallbacks/service-rh.svg",
}
```

O componente visual deve receber os dados. Não deve conhecer caminhos específicos de arquivos.

## CinematicIntro

O CinematicIntro é uma funcionalidade existente e protegida.

Ela não deve ser removida, substituída por texto ou desativada sem autorização.

### Comportamento

```text
Usuário entra
   ↓
CinematicIntro
   ↓
imagens reais da J&S
   ↓
movimento cinematográfico curto
   ↓
transição
   ↓
HeroSplit
   ↓
conteúdo normal da Home
```

### Regras

- não colocar texto/H1 comercial dentro da imagem;
- não duplicar conteúdo entre CinematicIntro e Hero;
- não permitir overflow horizontal ou vertical;
- não estourar o viewport;
- usar `object-fit: cover` com `object-position` ajustado por viewport;
- respeitar `prefers-reduced-motion`;
- bloquear scroll apenas durante a apresentação;
- mostrar apenas na primeira entrada da sessão;
- permitir reabertura após inatividade configurada;
- oferecer botão "Pular" acessível;
- funcionar no mobile sem cortar elementos importantes.

### Relação com o Hero

O CinematicIntro é uma introdução visual.

O HeroSplit continua responsável pelo texto comercial.

```text
CinematicIntro
      ↓
HeroSplit
      ↓
texto comercial
+
imagem relacionada
      ↓
demais seções
```

## Tratamento obrigatório de imagens

Nenhuma imagem pode estourar o viewport ou deformar o layout.

Isso vale para:

- Cinematic Intro;
- Hero;
- Hero dinâmico;
- Cards de serviços;
- Cards de vagas;
- Timeline;
- Sobre Nós;
- Parceiros;
- Blog;
- Footer, quando houver imagens;
- Mobile;
- Desktop.

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

# 75. WORKFLOW DE IMPLEMENTAÇÃO
