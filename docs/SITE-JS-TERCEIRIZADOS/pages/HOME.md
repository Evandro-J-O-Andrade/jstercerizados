# HOME — Arquitetura e Implementação

## Hierarquia

```text
Cinematic Showcase (cardheros, 6s)
Inactivity Showcase (reaparece após inatividade)
Hero Dynamic (storytelling: RH → Facilities → Mão de obra → Terceirização)
Assessoria em RH (carro-chefe — card destacado)
Soluções (4 cards: RH, Recrutamento, Mão de obra, Terceirização)
Facilities (4 cards: limpeza, segurança, jardinagem, portaria)
Mão de Obra Temporária + Efetiva (2 cards)
Terceirização (1 card)
Vagas em Destaque (4 cards)
Como Funciona (4 steps — jornada do candidato)
Para Empresas (CTA comercial)
Para Candidatos (3 cards)
Clientes / Parceiros (logos)
Depoimentos (testimonials)
Resultados (stats: 15+ anos, 200+ clientes, 500+ profissionais, 50 cidades)
Blog (4 posts)
CTA Final (ver vagas / contratar)
```

## Seções detalhadas

### 1. Cinematic Showcase

**Componente:** `CinematicShowcase` (implementado)

- Única imagem: `cardheros`
- `sessionStorage` para não repetir
- Scroll lock, pular, reduced motion

### 2. Hero Dynamic

**Novo componente substituindo HeroSplit**

```tsx
<HeroDynamic
  slides={HERO_STORY_SLIDES}
  autoPlay={introComplete}
  interval={8000}
/>
```

#### Conteúdo (HERO_STORY_SLIDES)

Slide 1 — **Assessoria em RH** (carro-chefe)

- Eyebrow: ASSESSORIA EM RECURSOS HUMANOS
- Title: Mais eficiência em Recursos Humanos, mais agilidade para sua empresa.
- Image: `/images/services/assessoria-rh.png`
- CTAs:
  - [Contritar Funcionários] → `/servicos/assessoria-rh`
  - [Ver vagas] → `/vagas`

Slide 2 — **Facilities**

- Eyebrow: FACILITIES
- Title: Ambientes mais eficientes, equipes mais preparadas.
- Image: `/images/services/facilities-real.webp`
- CTAs:
  - [Conheça nossas soluções] → `/servicos/facilities`
  - [Solicitar orçamento] → `/contato?assunto=facilities`

Slide 3 — **Mão de Obra**

- Eyebrow: MÃO DE OBRA TEMPORÁRIA E EFETIVA
- Title: Mais agilidade para formar a equipe que sua empresa precisa.
- Image: `/images/services/mao-de-obra-real.webp`
- CTAs:
  - [Contritar profissionais] → `/servicos/mao-de-obra-temporaria`
  - [Ver vagas] → `/clientes`

Slide 4 — **Terceirização**

- Eyebrow: TERCEIRIZAÇÃO
- Title: Redução de custos e mais eficiência operacional.
- Image: `/images/services/terceirizacao-real.webp`
- CTAs:
  - [Conhecer soluções] → `/servicos/terceirizacao`
  - [Solicitar orçamento] → `/contato?assunto=terceirizacao`

### 3. Assessoria em RH (carro-chefe separado)

Após o Hero, um bloco destacado para Assessoria em RH:

```text
Assessoria em RH dedicada
[Profissional de RH na sua empresa]
[Saiba mais →]  [Contritar agora →]
```

### 4–6. Cards de soluções

Agrupados em grids:

- RH (4 cards)
- Facilities (4 cards)
- Mão de obra (2 cards)
- Terceirização (1 card)

Cada card: imagem + ícone + título + descrição curta + "Saiba mais"

### 7. Vagas em destaque

```tsx
const destaques = mockGetVagas().slice(0, 4);
```

Mostra: titulo, empresa, cidade, tipoContrato, modalidade, salário, botão "Ver vaga"

### 8. Como Funciona

4 steps: Cadastre currículo → Candidate-se → Processo Seletivo → Contratação

### 9. Para Empresas

```text
Precisa contratar?
[Solicitar Orçamento] [Falar no WhatsApp]
```

### 10. Para Candidatos

3 cards: Currículo, Buscar Vagas, Processo Seletivo

### 11. Clientes / Parceiros

Logos em grid (grayscale → color on hover)

### 12. Depoimentos

2 testimonials em grid

### 13. Resultados

4 stats: 15+ anos, 200+ clientes, 500+ profissionais, 50 cidades

### 14. Blog

4 posts em grid

### 15. CTA Final

```text
Pronto para dar o próximo passo?
[Está procurando uma nova oportunidade?] → /vagas
[Precisa de profissionais para sua empresa?] → /empresas
```

## Estado atual vs. blueprint

| Item                          | Atual                 | Blueprint                  | Gap          |
| ----------------------------- | --------------------- | -------------------------- | ------------ |
| Progress bar counter          | Removido ✅           | —                          | ✅ Resolvido |
| Hero storytelling             | HeroSplit (carrossel) | HeroDynamic (storytelling) | Alto         |
| Card "Mão de obra efetiva"    | Inline text           | Card separado              | Médio        |
| Card "Terceirização"          | Inline text           | Card separado              | Médio        |
| Card "Assessoria RH" destaque | Inline                | Card destacado após Hero   | Médio        |
