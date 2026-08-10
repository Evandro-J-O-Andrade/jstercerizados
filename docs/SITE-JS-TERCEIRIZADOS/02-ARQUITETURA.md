# 02 — Arquitetura

## 02.1 Arquitetura de componentes

```text
<App>
  ├── <ScrollToTop />
  ├── <Navbar />
  ├── <main>
  │     ├── <CinematicShowcase />          ← Única imagem (cardheros), 6s
  │     ├── <InactivityShowcase />         ← Reaparece após 10min inativo
  │     ├── <HeroDynamic />                ← Hero storytelling (substitui HeroSplit)
  │     ├── <Solutions />                  ← Cards de serviços (RH carro-chefe)
  │     ├── <FacilitiesSolutions />       ← Cards de facilities
  │     ├── <MaoDeObraSolutions />        ← Cards de mão de obra (temp/efet)
  │     ├── <Terceirizacao />             ← Card de terceirização
  │     ├── <JobHighlights />              ← Vagas em destaque
  │     ├── <ComoFunciona />               ← Jornada candidato
  │     ├── <ParaEmpresas />               ← Jornada empresa
  │     ├── <ParaCandidatos />             ← Jornada candidato
  │     ├── <ClientesParceiros />          ← Logos
  │     ├── <Testimonials />               ← Depoimentos
  │     ├── <Stats />                      ← Resultados
  │     ├── <BlogPreview />                ← Últimos posts
  │     └── <CtaFinal />                   ← CTA final
  │
  ├── <Footer />                           ← NÃO reescrever
  ├── <BottomNavigation />
  ├── <AccessibilityWidget />             ← Layer separado, não dentro de Footer
  ├── <ChatWidget />                      ← IA → escala para
  └── <HumanChatWidget />                 ← humano
```

> **Arquitetura de acessibilidade:** App → Page → Backdrop → AccessibilityPanel
> NÃO App → AccessibilityPanel → tudo

## 02.2 Cinematic Showcase — regras de exibição

```text
Primeira visita (sessionStorage)
      ↓
mostra abertura (6s)

Usuário continua navegando
      ↓
não mostra novamente nesta sessão

10 minutos de inatividade
      ↓
pode mostrar novamente (InactivityShowcase)

Usuário clica "Pular"
      ↓
encerra imediatamente
```

### Requisitos não-neguosi

- [x] Nunca estourar a imagem (overflow-x: hidden global)
- [x] Nunca travar scroll (body.overflow = 'hidden')
- [x] Nunca ficar tempo demais (~6s máximo)
- [x] Nunca exigir clique para pular (botão secundário disponível)
- [x] Nunca repetir H1 do Hero (sr-only apenas)
- [x] Nunca aparecer toda vez que recarrega (sessionStorage)
- [x] Nunca atrapalhar acessibilidade (prefers-reduced-motion → skip 500ms)

### Animação (6.5s total)

| Fase     | Duração | Animação                                                   |
| -------- | ------- | ---------------------------------------------------------- |
| black    | 200ms   | Tela preta                                                 |
| entering | 2s      | scale 1.2→0.85→1.05→1, y 10%→0→-2%→0, rotate 2°→-1°→0.5°→0 |
| holding  | 3s      | scale+y pulse infinito (mirror)                            |
| closing  | 1.5s    | fade out + zoom 1.1                                        |

### Imagem (cardheros)

- `object-fit: cover` — preserva proporção
- `object-position` responsivo via CSS:
  - Mobile: `center 40%`
  - sm (640px+): `center 35%`
  - md (768px+): `center 33%`
  - lg (1024px+): `center 30%`
- Fallback: SVG corporativo (`/images/hero/home/fallback.svg`)
- **Futuro:** sequência de imagens cinematográficas (multi-slide, curto)

## 02.3 Hero dinâmico — storytelling

Substitui o HeroSplit mecânico.

### Conceito

```text
               J&S TERCEIRIZADOS

  Mais eficiência em Recursos Humanos,
  mais agilidade para sua empresa.

  [Contratar Funcionários] [Quero uma Vaga]

           ┌───────────────┐
           │    IMAGEM     │
           │     RH        │
           └───────────────┘
```

A mídia e texto mudam conforme a vertente de negócio:

| Vertente         | Imagem             | Eyebrow          | Title                             |
| ---------------- | ------------------ | ---------------- | --------------------------------- |
| Assessoria em RH | equipe/reunião     | ASSESSORIA EM RH | Mais eficiência em RH...          |
| Facilities       | limpeza/manutenção | FACILITIES       | Ambientes mais eficientes...      |
| Mão de obra      | trabalhadores      | MÃO DE OBRA      | Mais agilidade para contratar...  |
| Terceirização    | operação coletiva  | TERCEIRIZAÇÃO    | Redução de custos operacionais... |

### Implementação

```tsx
<HeroDynamic
  slides={HERO_STORY_SLIDES} // conteúdo de @/content/heroStory.ts
  autoPlay={introComplete}
  interval={8000} // 8s por tela (slow reveal)
/>
```

- Cada "slide" é uma **história** com: imagem + copy + CTAs
- Auto-play pausa no hover
- Navegação por dots (não contador)
- Transição suave (cross-fade + subtle scale)

## 02.4 Serviços — arquitetura

### Home — cards resumidos

Home mostra **cards resumidos**, não texto extenso.

```text
### Assessoria em RH

> Profissional de RH dedicado à sua empresa para apoiar contratação, gestão e desenvolvimento de pessoas.

**Saiba mais →**
```

### `/servicos` — lista completa

Lista todos os serviços como `ServiceCard`, agrupados por categoria:

- Soluções em RH (recrutamento, seleção, assessoria, mão de obra)
- Soluções Operacionais (facilities, limpeza, jardinagem, terceirização)
- Para Candidatos (cadastro, busca, alertas)

### `/servicos/:slug` — página individual

Hero com imagem + título + descrição +
CTA "Solicitar orçamento" → `ServiceRequestForm`

## 02.5 Formulário de contratação — arquitetura reutilizável

```text
Card
 ↓
Saiba mais
 ↓
Página do serviço
 ↓
Solicitar orçamento
 ↓
<ServiceRequestForm service="facilities" />
 ↓
Lead → Supabase (tabela: leads)
 ↓
n8n webhook → e-mail / WhatsApp / atendimento
```

### Props do formulário

```tsx
<ServiceRequestForm
  service="facilities" // slug do serviço
  source="service-page" // onde foi acionado
  onSuccess={handleLeadSent} // callback
/>
```

### Integração Supabase

Tabela `leads`:

```sql
id, nome, empresa, email, phone, cidade, service_slug, source, mensagem, status, created_at
```

### Orquestração n8n

Webhook recebe o lead → envia WhatsApp → cria ticket no Supabase → notifica atendente.

## 02.6 Chat IA + humano — arquitetura

```text
Site
 ↓
Chat IA (ChatWidget)
  - responde com base em: KB J&S + conteúdo site + FAQ
 ↓
resolve?
 ├── sim → encerra
 │
 └── não
       ↓
"Posso encaminhar você para atendimento."
       ↓
Chat humano (HumanChatWidget)
       ↓
n8n orquestra → Supabase (chat_rooms) → atendente
```

### Supabase tables (chat)

```sql
chat_rooms:        id, visitor_id, subject, status, created_at, updated_at
chat_messages:     id, room_id, sender_type, content, created_at
```

## 02.7 Quatro jornadas — endpoints

| Jornada      | Página          | Funcionalidades                                                           |
| ------------ | --------------- | ------------------------------------------------------------------------- |
| Empresas     | `/empresas`     | Contratar, solicitar orçamento, divulgar vaga, acompanhar processo, login |
| Candidatos   | `/candidatos`   | Ver vagas, cadastrar currículo, acompanhar candidatura, login             |
| Parceiros    | `/parceiros`    | Quero ser parceiro, serviços, contato                                     |
| Fornecedores | `/fornecedores` | Quero fornecer, cadastro, produtos, contato                               |

### Área do candidato (roadmap)

```text
/candidatos/login
/candidatos/cadastro
/candidatos/perfil        ← currículo, formação, experiências, cursos, idiomas
/candidatos/candidaturas  ← histórico de candidaturas
/candidatos/favoritas     ← vagas salvas
```

### Área da empresa (roadmap)

```text
/empresas/login
/empresas/dashboard
  - divulgar vaga
  - solicitar orçamento
  - banco de currículos
  - acompanhar processos
  - entrevistas
  - contratações
```

## 02.8 Imagem — sistema global

### Diretório

```text
src/assets/js-terceirizados/
├── hero/
├── rh/
├── facilities/
├── limpeza/
├── jardinagem/
├── terceirizacao/
├── vagas/
├── empresa/
├── candidatos/
├── parceiros/
└── cinematic/
```

### Render

```text
imagem real
   ↓
carregou?
 ├── sim → mostra (object-cover / contain conforme contexto)
 └── não → fallback SVG (respeita container, funciona light/dark)
```

### Regras

| Contexto          | object-fit | object-position       |
| ----------------- | ---------- | --------------------- |
| Cinematic Intro   | cover      | responsivo (ver 02.2) |
| Hero              | cover      | center                |
| Cards de serviços | cover      | center                |
| Cards de vagas    | cover      | center top            |
| Timeline          | contain    | center                |
| Sobre (hero)      | cover      | center 30%            |
| Parceiros (logo)  | contain    | center                |
| Footer (logo)     | contain    | center                |

### QA

Breakpoints: 360px, 375px, 390px, 414px, 768px, 1024px, 1280px, 1440px

Nenhuma imagem pode:

- [ ] estourar horizontalmente
- [ ] criar scrollbar
- [ ] deformar
- [ ] sair do container
- [ ] empurrar conteúdo
- [ ] quebrar o layout
- [ ] ficar cortada de maneira inadequada
