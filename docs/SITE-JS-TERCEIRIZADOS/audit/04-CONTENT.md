# 04 — Conteúdo Audit

## 04.1 Páginas com conteúdo

### Home

- **H1:** Implícito (CinematicShowcase é sr-only)
- **H2s:** Soluções para sua empresa, Soluções em Facilities, Para Candidatos, Vagas em Destaque, Como Funciona, Por que escolher a J&S, Clientes e Parceiros, O que dizem nossos clientes, Resultados, Precisa contratar?, Blog, Pronto para dar o próximo passo?
- **CTAs:** Múltiplos (Saiba mais, Ver vagas, Solicitar Orçamento, etc.)

### Servicos

- **H1:** "Nossos Serviços"
- **H2s:** Soluções em RH, Soluções Operacionais (Facilities)
- **Cards:** 16 serviços via ServiceCard

### ServicoDetalhe

- **H1:** {service.title}
- **Seções:** Premium Hero, Stats, About, Process, Differentials, Gallery, FAQ, CTA Final
- **Formulário:** ServiceRequestForm integrado ✅

### Sobre

- **H1:** "Sobre a {COMPANY.tradingName}"
- **Seções:** Hero text, Nossa Missão, Nossa Visão, Nossos Valores, Nossa Trajetória (timeline), Cobertura Regional
- **Timeline:** 6 marcos (2011-2024) — dados do `COMPANY_TIMELINE`

### Vagas

- **H1:** Implícito (verificar)
- **Cards:** Lista de vagas mock

### VagaDetalhe

- **H1:** {vaga.titulo}
- **Seções:** Informações da vaga, requisitos, benefícios, candidatar-se

### Empresas

- **H1:** "Encontre profissionais qualificados para sua equipe"
- **CTAs:** Divulgar Vaga, Falar com consultor

### Candidatos

- **H1:** "Área do Candidato"
- **Cards:** 3 cards (Currículo, Buscar Vagas, Processo Seletivo)

### Blog

- **H1:** Implícito (verificar)
- **Posts:** 4 posts mock (todos linkam para `/blog`)

### Parceiros

- Lista de empresas parceiras

### Fornecedores

- Formulário de cadastro de fornecedores

### Contato

- Formulário + mapa + informações

## 04.2 Gaps de conteúdo

| Gap                 | Descrição                                                                   | Prioridade |
| ------------------- | --------------------------------------------------------------------------- | ---------- |
| Hero storytelling   | HeroSplit é carrossel, não storytelling                                     | Alta       |
| Cards Home faltando | Mão de obra efetiva e terceirização como cards separados                    | Média      |
| Blog posts reais    | Todos os posts linkam para `/blog` (não têm slug individual)                | Baixa      |
| "Contritar" typo    | Texto "Contritar Funcionários" em HERO_SLIDES — corrigir para "Contratar"   | Baixa      |
| "JS" no Footer      | Aparece como "JS Empregos" em alguns lugares — deve ser "J&S Empregos LTDA" | Baixa      |

## 04.3 Conteúdo institucional

### COMPANY (config/company.ts)

```ts
name: 'J&S Empregos LTDA'
tradingName: 'J&S Empregos LTDA'
brand: 'J&S Empregos'
tagline: 'Mais eficiência em RH. Mais resultados para sua empresa.'
description: 'Assessoria em RH, recrutamento, mão de obra temporária e efetiva, terceirização e facilities...'
businessAreas: [Recrutamento, Mão de obra Temp, Mão de obra Efetiva, Terceirização, Assessoria RH, Limpeza, Segurança Patrimonial, Portaria, Jardinagem, Zeladoria, Facilities]
yearsOfExperience: 15
clientsServed: 200
professionals: 500
citiesCovered: 50
```

### COMPANY_TIMELINE (mock/company.ts)

```text
2011  Fundação da J&S Empregos LTDA
2015  Expansão para Facilities
2018  Tecnologia de Ponta
2020  200 Clientes
2022  Plataforma Digital J&S
2024  50 Cidades
```

### Valores (mock/company.ts)

```text
Compromisso, Excelência, Inovação, Transparência, Responsabilidade
```

### Equipe (mock/company.ts)

```text
3 membros:
- Ricardo Santos (CEO)
- Fernanda Oliveira (Diretora de Operações)
- Thiago Mendes (Diretor de Tecnologia)
```
