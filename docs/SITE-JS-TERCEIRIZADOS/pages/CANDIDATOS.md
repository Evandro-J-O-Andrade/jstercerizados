# CANDIDATOS — Arquitetura e Implementação

## Rotas

| Rota                       | Descrição                            | Auth        |
| -------------------------- | ------------------------------------ | ----------- |
| `/candidatos`              | Página institucional para candidatos | ❌          |
| `/candidatos/login`        | Login do candidato                   | ✅ (futuro) |
| `/candidatos/cadastro`     | Cadastro de candidato                | ✅ (futuro) |
| `/candidatos/perfil`       | Perfil com currículo                 | ✅ (futuro) |
| `/candidatos/candidaturas` | Histórico de candidaturas            | ✅ (futuro) |
| `/candidatos/favoritas`    | Vagas salvas                         | ✅ (futuro) |

## Página atual (`/candidatos`)

### Estrutura

```text
Hero: "Área do Candidato"
  ↓
3 cards: Currículo | Buscar Vagas | Processo Seletivo
  ↓
Botão: [Entrar na sua conta] → /login
```

### Conteúdo

- **Título:** "Área do Candidato"
- **Descrição:** "Cadastre seu currículo, candidate-se às vagas e acompanhe seus processos seletivos em um só lugar."
- **Cards:**
  - Currículo: "Crie e mantenha seu currículo atualizado..."
  - Buscar Vagas: "Encontre oportunidades alinhadas ao seu perfil..."
  - Processo Seletivo: "Conheça as etapas do nosso processo..."

## Área do candidato (roadmap)

### Perfil candidato

```text
/candidatos/perfil
  ├── Dados pessoais (nome, email, cpf, rg, telefone)
  ├── Localização (cidade, estado)
  ├── Formação
  │   └── [Adicionar formação]
  ├── Experiência
  │   └── [Adicionar experiência]
  ├── Cursos
  │   └── [Adicionar curso]
  ├── Idiomas
  │   └── [Adicionar idioma]
  ├── Configurações de disponibilidade
  └── [Salvar]
```

### Candidaturas

```text
/candidatos/candidaturas
  └── Lista de candidaturas:
      - vaga (titulo, empresa, imagem)
      - data da candidatura
      - status (recebido/analise/entrevista/aprovado/rejeitado)
      - detalhes
```

### Vagas favoritas

```text
/candidatos/favoritas
  └── Lista de vagas salvas:
      - titulo, empresa, cidade
      - data de publicação
      - [Ver vaga]
```

## Jornada candidato

```text
Candidato visita site
  ↓
"Para Candidatos" (Home ou /candidatos)
  ↓
Clique em "Ver vagas"
  ↓
Filtra vagas em /vagas
  ↓
Clica em vaga → /vagas/:slug
  ↓
"Candidatar-se" → JobApplicationForm
  ↓
n8n → e-mail + WhatsApp (confirmação)
  ↓
Candidato entra em /candidatos/login
  ↓
Acompanha candidatura em /candidatos/candidaturas
```

## Supabase tables

```sql
candidatos (
  id, user_id, nome, email, cpf, rg, telefone,
  cidade, estado, experiencia, formacao,
  cursos[], idiomas[], disponibilidade,
  created_at, updated_at
)

candidaturas (
  id, candidato_id, vaga_id,
  status, created_at
)

candidato_favoritos (
  id, candidato_id, vaga_id, created_at
)
```
