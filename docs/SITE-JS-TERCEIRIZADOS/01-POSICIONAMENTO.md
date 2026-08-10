# 01 — Posicionamento

## Essência

A J&S Empregos LTDA não é apenas uma **agência de empregos** ou apenas uma **empresa de RH**.

Ela opera simultaneamente em dois mercados:

- **RH estratégico** — assessoria, recrutamento, seleção, gestão de pessoas
- **Economia criativa** — mão de obra temporária/efetiva, terceirização, facilities

A Home page precisa **vender primeiro Assessoria em RH**, mas apresentar **claramente Facilities e terceirização** como linhas de negócio complementares.

## Hierarquia de conteúdo (Home)

```text
ENTRADA CINEMATOGRÁFICA
        ↓
HERO PRINCIPAL (storytelling)
        ↓
ASSESSORIA EM RH — CARRO-CHEFE
        ↓
NOSSAS SOLUÇÕES (cards resumidos)
        ↓
FACILITIES
        ↓
MÃO DE OBRA TEMPORÁRIA E EFETIVA
        ↓
TERCEIRIZAÇÃO
        ↓
VAGAS EM DESTAQUE
        ↓
COMO FUNCIONA (jornada do candidato)
        ↓
PARA EMPRESAS
        ↓
PARA CANDIDATOS
        ↓
CLIENTES / PARCEIROS
        ↓
SOBRE A J&S
        ↓
BLOG / CONTEÚDOS
        ↓
CTA FINAL
        ↓
FOOTER (existente — refinado)
```

## Jornadas do usuário

```text
             J&S Empregos LTDA
                    │
         ┌──────────┼───────────┐
         │          │           │
    EMPRESAS   CANDIDATOS    PARCEIROS
                        │
                   FORNECEDORES
```

### Empresas

- Contratar profissionais
- Solicitar orçamento
- Publicar vaga
- Acompanhar processo
- Entrar na área da empresa (/empresas)
- Acessar dashboard (/dashboard)

### Candidatos

- Ver vagas (/vagas)
- Cadastrar currículo (/trabalhe-conosco)
- Candidatar-se
- Acompanhar candidatura
- Área do candidato (login futuro)

### Parceiros

- Quero ser parceiro (/parceiros)
- Apresentar empresa
- Serviços oferecidos
- Contato

### Fornecedores

- Quero fornecer (/fornecedores)
- Cadastro
- Produtos/serviços
- Contato comercial

## Contraste com implementação atual

| Item                         | Estado atual                                                                                | Gap                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Hero storytelling            | HeroSplit com 5 slides estáticos                                                            | Precisa de hero dinâmico com mediação de conteúdo   |
| Assessoria em RH carro-chefe | Presente, mas não priorizada visualmente                                                    | RH precisa ser o primeiro slide destacado           |
| Four journeys                | Empresas e Candidatos existem; Parceiros/Fornecedores existem mas sem integração de jornada | Conectar todas as jornadas ao chat IA e formulários |
