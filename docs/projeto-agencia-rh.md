# Projeto JR Empregos

## Evolução para Agência de Empregos e Assessoria em RH

---

## 1. Visão do Cliente

A JR Empregos passará por uma evolução de posicionamento.

Objetivo: transformar a empresa em uma **Agência de Empregos e Assessoria em Recursos Humanos**, conectando:

- **Empresas** que precisam contratar profissionais
- **Candidatos** que buscam novas oportunidades

A terceirização e facilities continuam presentes como soluções complementares no portfólio.

---

## 2. Públicos

### 2.1 Empresas

Captar empresas para contratação de profissionais, publicação de vagas e solicitação de serviços.

### 2.2 Candidatos

Captar currículos, oferecer oportunidades e gerenciar processos seletivos.

### 2.3 Administrativo/RH

Gerenciar candidatos, vagas, processos seletivos, empresas e relatórios.

---

## 3. Estrutura do Site

### 3.1 Página Inicial (Home)

#### Header

```
Logo | Início | Vagas | Empresas | Candidatos | Serviços | Sobre Nós | Blog | Contato
```

CTAs principais:

- **Cadastrar Currículo** (destino: fluxo candidato)
- **Divulgar Vaga** (destino: fluxo empresa)

#### Banner Principal

```
Título:    "Conectando talentos às melhores oportunidades."
Subtexto:  "Encontramos o profissional certo para sua empresa e ajudamos candidatos a conquistar novas oportunidades de trabalho."
Botões:    [Quero uma Vaga] [Contratar Funcionários]
```

#### Vagas em Destaque

Cards de 3-4 vagas com:

- Cargo
- Localidade
- Tipo de contrato
- Faixa salarial (opcional)
- Botão **Candidatar-se**

Botão secundário: **Ver Todas as Vagas**

#### Como Funciona

```
1. Cadastre seu currículo
2. Candidate-se
3. Processo seletivo
4. Contratação
```

#### Por que escolher nossa agência?

- Banco de talentos atualizado
- Atendimento rápido e humanizado
- Equipe especializada em RH
- Resultados comprovados

#### Depoimentos

- Empresas: "Encontrou excelentes profissionais em poucos dias."
- Candidatos: "Consegui emprego através da agência."

#### Números

- +10.000 Currículos
- +500 Empresas Parceiras
- +2.000 Contratações
- 95% de Satisfação

---

### 3.2 Nossos Serviços

#### Para Empresas

1. **Recrutamento e Seleção** — Encontrar profissionais alinhados ao perfil.
2. **Mão de Obra Temporária** — Soluções para demandas temporárias.
3. **Terceirização de Serviços** — Limpeza, segurança, portaria, zeladoria, facilities.
4. **Hunting de Executivos** — Busca especializada de profissionais.
5. **Avaliação de Perfil** — Análise de compatibilidade profissional.
6. **Banco de Talentos** — Acesso ao banco de profissionais.

#### Para Candidatos

1. **Cadastro de Currículo** — Captação para o banco de talentos.
2. **Busca de Vagas** — Visualizar oportunidades.
3. **Alertas de Emprego** — Notificações por e-mail (futuro).
4. **Orientação Profissional** — Conteúdos e suporte.
5. **Atualização de Currículo** — Serviço de apoio profissional.

---

### 3.3 Página de Vagas

Filtros:

- Cargo
- Cidade
- Estado
- Área
- Tipo de Contrato
- Salário
- Data da publicação

Card de vaga:

- Cargo
- Empresa (opcional)
- Localidade
- Tipo de contrato
- Salário
- Benefícios
- Botão **Candidatar-se**

---

### 3.4 Área do Candidato

- Login/Cadastro
- Upload de currículo PDF
- Atualização de dados pessoais
- Experiência profissional
- Cursos
- Formação
- Idiomas
- Vagas favoritas
- Histórico de candidaturas

---

### 3.5 Área da Empresa

- Login/Emissão de Acesso
- Publicar vagas
- Banco de currículos
- Acompanhar processos seletivos
- Agendar entrevistas
- Relatórios
- Histórico de contratações

---

### 3.6 Processo Seletivo

```
1. Cadastro do currículo
2. Análise do perfil
3. Entrevista
4. Contratação
```

---

### 3.7 Sobre Nós

- História
- Missão
- Visão
- Valores
- Diferenciais

---

### 3.8 Blog

- Como fazer um currículo vencedor
- Como se preparar para entrevistas
- Tendências do mercado de trabalho
- Dicas para primeiro emprego

---

### 3.9 Contato

Formulário: Nome, Empresa, E-mail, Telefone, Assunto, Mensagem.

Informações complementares: WhatsApp, Endereço, Horário, Mapa.

---

### 3.10 Login

Login unificado com selector de perfil:

```
[Admin]  [Candidato]  [Empresa]
```

Redireciona para:

- Admin → Dashboard RH
- Candidato → Área do Candidato
- Empresa → Área da Empresa

---

## 4. Dashboard Administrativo RH

### 4.1 Menu

```
Dashboard | Candidatos | Vagas | Processos | Empresas | Entrevistas | Documentos | Relatórios | Configurações
```

### 4.2 Indicadores

- Total de candidatos
- Currículos recebidos (hoje)
- Vagas abertas
- Processos em andamento
- Contratações realizadas

### 4.3 Módulos

- **Candidatos** — lista, busca, filtro, perfil completo
- **Vagas** — CRUD de vagas, publicação
- **Processos Seletivos** — Kanban (Recebidos → Análise → Entrevista → Aprovados → Contratados)
- **Empresas** — CRM leve, histórico de demandas
- **Entrevistas** — agendamento, avaliações
- **Documentos** — currículos em PDF
- **Relatórios** — métricas de recrutamento

---

## 5. Banco de Dados (Supabase)

### 5.1 Tabelas Existentes (preservar)

```
usuarios, perfis, servicos, clientes, leads
```

### 5.2 Novas Tabelas (evolução)

```sql
candidatos
  - id, nome, cpf, telefone, email, cidade, estado,
    cargo_interesse, area_atuacao, experiencia,
    curriculo_url, status, created_at, updated_at

vagas
  - id, titulo, descricao, empresa_id, cidade, estado,
    tipo_contrato, salario_min, salario_max, beneficios,
    requisitos, status, created_at, updated_at

candidaturas
  - id, candidato_id, vaga_id, status,
    (recebido, analisando, entrevista, aprovado, recusado),
    created_at, updated_at

processos_seletivos
  - id, vaga_id, empresa_id, status, data_inicio, data_fim,

entrevistas
  - id, processo_id, candidato_id, data, hora, status,
    avaliacao, observacoes,

empresas_clientes
  - id, razao_social, cnpj, contato, telefone, email,
    segmento, necessidades, created_at,
```

### 5.3 Relacionamentos

```
empresas_clientes → demandas
candidatos → candidaturas → vagas
processos_seletivos → candidaturas → entrevistas
```

### 5.4 Fluxo de WhatsApp

```
candidatura/nova vaga criada/entrevista agendada
→ disparo automático via n8n
→ WhatsApp do candidato/empresa
```

---

## 6. Aproveitamento da Base Atual

| Elemento               | Status       | Observação                         |
| ---------------------- | ------------ | ---------------------------------- |
| WhatsApp First         | ✅ Preservar | Arquitetura de conversão central   |
| Formulários existentes | ✅ Adaptar   | Reaproveitar campos e validações   |
| Trabalhe Conosco       | ✅ Evoluir   | Vira "Cadastro de Currículo"       |
| Upload de currículo    | ✅ Preservar | Reaproveitar componente            |
| Componentes UI         | ✅ Preservar | Button, Input, Textarea, SafeImage |
| Dashboard existente    | ✅ Evoluir   | Base para nova visão RH            |
| Auth context           | ✅ Preservar | Reaproveitar para 3 perfis         |
| Banco Supabase         | ✅ Evoluir   | Adicionar tabelas RH               |
| Estrutura React        | ✅ Preservar | TSX + Tailwind intactos            |
| Imagens/Assets         | ✅ Adaptar   | Recontextualizar para RH           |
| SEO                    | ✅ Preservar | Meta tags e rotas mantidas         |

---

## 7. Cronograma (Sugestão)

### Sprint 1 — Reposicionamento Visual

- [x] Navigation: Vagas + Empresas + Trabalhe Conosco
- [x] Services: 4 novos serviços RH no mock
- [x] Login: profile selector admin/candidato/empresa
- [x] Imagens hero para novas páginas
- [x] Build validado

### Sprint 2 — Conteúdo e Páginas

- [ ] Home: hero copy RH + cards de serviços
- [ ] Servicos: grupo RH + Operacionais
- [ ] Vagas: listagem funcional
- [ ] Empresas: página "Para Empresas"
- [ ] Sobre Nós: identidade Agência de RH

### Sprint 3 — Mobile + Tema

- [ ] Scroll lock no menu mobile
- [ ] Focus trap
- [ ] Safe area iOS
- [ ] Contraste dark/light

### Sprint 4 — Integrações

- [ ] Supabase auth (3 perfis)
- [ ] WhatsApp API flow
- [ ] Chat IA Assistente RH
- [ ] n8n triggers
