# EMPRESAS — Arquitetura e Implementação

## Rota

| Rota                  | Descrição                          |
| --------------------- | ---------------------------------- |
| `/empresas`           | Página institucional para empresas |
| `/empresas/login`     | Login da empresa (futuro)          |
| `/empresas/dashboard` | Área da empresa (futuro)           |

## Página atual (`/empresas`)

### Estrutura

```text
Hero
  ↓
CTAs: [Divulgar Vaga] [Falar com consultor (WhatsApp)]
  ↓
Benefícios (4 cards)
  ↓
Empresas Parceiras (logos)
```

### Conteúdo

- **Hero:** "Encontre profissionais qualificados para sua equipe"
- **CTA principal:** "Divulgar Vaga" → `/trabalhe-conosco`
- **CTA secundário:** "Falar com um consultor" → WhatsApp
- **Benefícios:**
  - Recrutamento Ágil (7 dias)
  - WhatsApp First
  - Garantia de Qualidade
  - Preços transparentes

## Área da empresa (roadmap)

```text
/empresas/login
/empresas/dashboard
  ├── divulgar vaga
  ├── solicitar orçamento
  ├── banco de currículos
  ├── acompanhar processos
  ├── entrevistas
  └── contratações
```

### Features

1. **Publicar vaga** — formulário com todos os campos do schema Vaga
2. **Solicitar orçamento** — integração com ServiceRequestForm
3. **Banco de currículos** — busca e filtragem de candidatos
4. **Acompanhar processos** — kanban de status (recebido → análise → entrevista → aprovado/rejeitado)
5. **Calendário de entrevistas** — integração com calendário
6. **Contratações** — histórico de contratações realizadas

### Supabase tables

Já definidas em `08-SUPABASE.md`:

- `vagas` (com empresa_id)
- `candidaturas`
- `candidatos` (com empresa_id opcional)

## Jornada empresa

```text
Empresa visita site
  ↓
"Precisa contratar?" (Home ou /empresas)
  ↓
Clique em "Divulgar Vaga" ou "Solicitar Orçamento"
  ↓
Formulário (ServiceRequestForm ou JobApplicationForm)
  ↓
n8n → WhatsApp + e-mail
  ↓
Atendente entra em contato
  ↓
Empresa publica vaga no dashboard
  ↓
Candidatos se candidatam
  ↓
Empresa acompanha em /empresas/dashboard
```
