# V2.1 — Seed Master

> **Propósito**: único documento de referência para popular o banco de dados V2.1
> com dados de exemplo (seeds) que alimentam as páginas existentes.
>
> **Regra**: os seeds devem ser **idempotentes** (`ON CONFLICT DO NOTHING`) e
> **preservar exatamente** os dados que já existem nos mocks.

---

## 1. Ordem de Execução

```text
001. Skills (global)
002. Tenants + Company Types + Relationship Types
003. People (identidades)
004. Companies (empresas globais)
005. Company Relationships (clientes/parceiros/fornecedores)
006. Jobs (17 vagas do mock)
007. Candidates (currículos)
008. Services (serviços)
009. Recruitment Processes (processos seletivos)
010. Financial Transactions (movimentações)
011. Stock Movements (estoque)
012. Support Tickets (chamados)
013. Settings (configurações)
```

---

## 2. Dados a serem populados

### 2.1 Skills (global) — 8 habilidades canônicas

**Fonte**: `supabase/migrations/20260816000400_candidates.sql` + `20260817000100_seed.sql`

| ID                                     | Nome                     | Categoria      |
| -------------------------------------- | ------------------------ | -------------- |
| `aaaaaaaa-0000-0000-0001-000000000001` | Limpeza                  | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000002` | Higiene                  | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000003` | Manutenção               | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000004` | Conserto                 | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000005` | Pintura                  | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000006` | Eletricidade             | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000007` | Encanamento              | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000008` | Jardinagem               | Facilities     |
| `aaaaaaaa-0000-0000-0001-000000000009` | Portaria                 | Security       |
| `aaaaaaaa-0000-0000-0001-000000000010` | Segurança                | Security       |
| `aaaaaaaa-0000-0000-0001-000000000011` | Cuidados com idosos      | Healthcare     |
| `aaaaaaaa-0000-0000-0001-000000000012` | Enfermagem               | Healthcare     |
| `aaaaaaaa-0000-0000-0001-000000000013` | Administração            | Administrativo |
| `aaaaaaaa-0000-0000-0001-000000000014` | Logística                | Logística      |
| `aaaaaaaa-0000-0000-0001-000000000015` | Produção                 | Industrial     |
| `aaaaaaaa-0000-0000-0001-000000000016` | Qualidade                | Industrial     |
| `aaaaaaaa-0000-0000-0001-000000000017` | Segurança do Trabalho    | Industrial     |
| `aaaaaaaa-0000-0000-0001-000000000018` | Recursos Humanos         | RH             |
| `aaaaaaaa-0000-0000-0001-000000000019` | Contabilidade            | Financeiro     |
| `aaaaaaaa-0000-0000-0001-000000000020` | Tecnologia da Informação | TI             |
| `office-excel`                         | Microsoft Excel          | Office         |
| `office-word`                          | Microsoft Word           | Office         |
| `portaria`                             | Portaria                 | Operacional    |
| `limpeza`                              | Limpeza Profissional     | Operacional    |
| `lideranca`                            | Liderança                | Comportamental |
| `javascript`                           | JavaScript               | Tech           |
| `react`                                | React                    | Tech           |
| `comunicacao`                          | Comunicação              | Comportamental |

**Status**: ✅ Já existe em `20260816000400_candidates.sql` e `20260817000100_seed.sql`

---

### 2.2 Tenants (global)

**Fonte**: mock não tem tenant; seed é o tenant J&S Empregos LTDA

| Campo    | Valor                                  |
| -------- | -------------------------------------- |
| `id`     | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `name`   | `J&S Empregos LTDA`                    |
| `slug`   | `js-empregos`                          |
| `plan`   | `enterprise`                           |
| `status` | `active`                               |

**Status**: ✅ Já existe em `20260816000100_core_people_tenants.sql`

---

### 2.3 Company Types (global)

**Fonte**: `supabase/migrations/20260816000300_companies.sql`

| Código            | Nome                            |
| ----------------- | ------------------------------- |
| `corporation`     | Sociedade Anônima               |
| `limited_company` | Sociedade Limitada              |
| `epp`             | Empresa de Pequeno Porte        |
| `mei`             | Microempreendedor Individual    |
| `nonprofit`       | Organização Sem Fins Lucrativos |
| `government`      | Entidade Pública                |

**Status**: ✅ Já existe na migration

---

### 2.4 Company Relationship Types (global)

**Fonte**: `supabase/migrations/20260816000300_companies.sql`

| Código     | Nome       |
| ---------- | ---------- |
| `client`   | Cliente    |
| `partner`  | Parceiro   |
| `supplier` | Fornecedor |

**Status**: ✅ Já existe na migration

---

### 2.5 Companies (global) + Relationships (tenant-scoped)

**Fonte**: `src/services/mock/clientes.ts`, `parceiros.ts`, `fornecedores.ts`

Os mocks atuais usam `localStorage` e não têm dados pré-cadastrados. Vamos criar seeds baseadas no cenário de negócio da J&S:

**Empresas globais (companies)**:

| Nome              | Nome Fantasia     | CNPJ               | Tipo              | Email                            | Telefone        |
| ----------------- | ----------------- | ------------------ | ----------------- | -------------------------------- | --------------- |
| J&S Empregos LTDA | J&S Terceirizados | 12.345.678/0001-90 | `limited_company` | comercial@jsterceirizados.com.br | (11) 96838-0592 |

**Relationships** (para tenant `a1b2c3d4-e5f6-7890-abcd-ef1234567890`):

| Empresa           | Tipo     | Status |
| ----------------- | -------- | ------ |
| J&S Empregos LTDA | client   | active |
| J&S Empregos LTDA | partner  | active |
| J&S Empregos LTDA | supplier | active |

**Status**: ❌ Precisa criar migration de seed

---

### 2.6 Jobs (17 vagas do mock)

**Fonte**: `src/services/mock/vagas.ts`

As 17 vagas devem ser preservadas EXATAMENTE como estão no mock, mapeadas para o schema V2.1:

| #   | Slug                                | Título                            | Tipo Contrato | Nível     | Modalidade | Cidade    | Estado | Salário Min | Status    |
| --- | ----------------------------------- | --------------------------------- | ------------- | --------- | ---------- | --------- | ------ | ----------- | --------- |
| 1   | analista-rh-folha-de-pagamento      | Analista de RH Folha de pagamento | CLT           | PLENO     | PRESENCIAL | Arujá     | SP     | 5000        | published |
| 2   | ajudante-geral                      | Ajudante geral                    | CLT           | JUNIOR    | PRESENCIAL | Arujá     | SP     | 2112.28     | published |
| 3   | pintor-i                            | Pintor I                          | TEMPORARIO    | JUNIOR    | PRESENCIAL | Arujá     | SP     | 15.56       | published |
| 4   | auxiliar-de-limpeza                 | Auxiliar de Limpeza               | TEMPORARIO    | JUNIOR    | PRESENCIAL | Arujá     | SP     | null        | published |
| 5   | auxiliar-de-marcenaria              | Auxiliar de marcenaria            | TEMPORARIO    | JUNIOR    | PRESENCIAL | Arujá     | SP     | 3000        | published |
| 6   | eletricista-de-instalacao           | Eletricista de instalação         | CLT           | PLENO     | PRESENCIAL | Arujá     | SP     | 3500        | published |
| 7   | mecanico-industrial                 | Mecânico industrial               | CLT           | PLENO     | PRESENCIAL | Arujá     | SP     | 3600        | published |
| 8   | assistente-de-compras               | Assistente de compras             | TEMPORARIO    | JUNIOR    | PRESENCIAL | Arujá     | SP     | null        | published |
| 9   | lider-de-producao                   | Líder de produção                 | TEMPORARIO    | LIDERANCA | PRESENCIAL | Arujá     | SP     | 3000        | published |
| 10  | auxiliar-administrativo             | Auxiliar administrativo           | CLT           | JUNIOR    | PRESENCIAL | Arujá     | SP     | 2500        | published |
| 11  | auxiliar-de-expedicao               | Auxiliar de expedição             | CLT           | JUNIOR    | PRESENCIAL | Arujá     | SP     | 1777.62     | published |
| 13  | auxiliar-de-producao-oportunidade-1 | Auxiliar de Produção              | CLT           | JUNIOR    | PRESENCIAL | Arujá     | SP     | 2112.28     | published |
| 14  | auxiliar-de-producao-oportunidade-2 | Auxiliar de Produção              | TEMPORARIO    | JUNIOR    | PRESENCIAL | Arujá     | SP     | 1800        | published |
| 15  | auxiliar-de-producao-oportunidade-3 | Auxiliar de Produção              | CLT           | JUNIOR    | PRESENCIAL | Arujá     | SP     | 1950        | published |
| 16  | analista-de-sistemas-sr             | Analista de Sistemas Sênior       | CLT           | SENIOR    | REMOTO     | São Paulo | SP     | 8000        | published |
| 17  | assistente-administrativo-remoto    | Assistente Administrativo         | CLT           | PLENO     | REMOTO     | São Paulo | SP     | 3500        | published |
| 18  | consultor-de-vendas-hibrido         | Consultor de Vendas               | CLT           | PLENO     | HIBRIDO    | São Paulo | SP     | 4000        | published |

**Mapeamento de campos**:

| Campo Mock         | Campo V2.1                | Observação                                                               |
| ------------------ | ------------------------- | ------------------------------------------------------------------------ |
| `id` (string)      | `id` (UUID)               | Gerar UUID novo                                                          |
| `slug`             | `slug`                    | Manter                                                                   |
| `titulo`           | `title`                   | Mapear                                                                   |
| `empresa`          | `company_relationship_id` | FK para company_relationships                                            |
| `cidade`           | `city`                    | Mapear                                                                   |
| `estado`           | `state`                   | Mapear                                                                   |
| `tipoContrato`     | `contract_type`           | Converter: CLT→clt, TEMPORARIO→temporary, ESTAGIO→internship, etc.       |
| `nivel`            | `seniority`               | Converter: JUNIOR→junior, PLENO→mid, SENIOR→senior, LIDERANCA→leadership |
| `salarioMin`       | `salary_min`              | Mapear                                                                   |
| `salarioMax`       | `salary_max`              | Mapear (se existir)                                                      |
| `modalidade`       | `work_mode`               | Converter: PRESENCIAL→onsite, REMOTO→remote, HIBRIDO→hybrid              |
| `area`             | `metadata.area`           | JSONB                                                                    |
| `workload`         | `metadata.workload`       | JSONB                                                                    |
| `workSchedule`     | `metadata.workSchedule`   | JSONB                                                                    |
| `beneficios`       | `metadata.benefits`       | JSONB array                                                              |
| `responsibilities` | `responsibilities`        | TEXT                                                                     |
| `requisitos`       | `requirements`            | TEXT                                                                     |
| `descricao`        | `description`             | TEXT                                                                     |
| `vagas`            | `metadata.vacancies`      | JSONB                                                                    |
| `status`           | `status`                  | ATIVA→published                                                          |
| `data_publicacao`  | `published_at`            | timestamptz                                                              |

**Status**: ❌ Precisa criar migration de seed

---

### 2.7 Candidates (currículos)

**Fonte**: `src/services/mock/curriculos.ts`

O mock não tem dados pré-cadastrados — tudo vem de `localStorage`. Vamos criar seeds de exemplo:

**Candidatos de exemplo** (5 registros):

| Nome           | Email              | Telefone        | Documento      | Status   |
| -------------- | ------------------ | --------------- | -------------- | -------- |
| João Silva     | joao@example.com   | (11) 99999-1111 | 123.456.789-00 | active   |
| Maria Souza    | maria@example.com  | (11) 99999-2222 | 987.654.321-00 | active   |
| Pedro Oliveira | pedro@example.com  | (11) 99999-3333 | 456.789.123-00 | active   |
| Ana Costa      | ana@example.com    | (11) 99999-4444 | 321.654.987-00 | inactive |
| Carlos Pereira | carlos@example.com | (11) 99999-5555 | 654.987.321-00 | pending  |

**Skills associadas** (cada candidato terá 2-3 skills):

| Candidato      | Skills                          |
| -------------- | ------------------------------- |
| João Silva     | Limpeza, Higiene                |
| Maria Souza    | Administração, Microsoft Excel  |
| Pedro Oliveira | Produção, Segurança do Trabalho |
| Ana Costa      | Enfermagem, Cuidados com idosos |
| Carlos Pereira | Logística, Administração        |

**Status**: ❌ Precisa criar migration de seed

---

### 2.8 Services (serviços)

**Fonte**: `src/services/mock/services.ts` — 14 serviços

Os serviços são conteúdo editorial, não dados transacionais. Podem ser populados como `service_orders` ou em uma tabela separada `services`.

**Serviços a seedar**:

1. Recrutamento e Seleção (`recrutamento-selecao`)
2. Mão de Obra Temporária (`mao-de-obra-temporaria`)
3. Mão de Obra Efetiva (`mao-de-obra-efetiva`)
4. Assessoria em RH (`assessoria-rh`)
5. Avaliação de Perfil (`avaliacao-perfil`)
6. Banco de Talentos (`banco-de-talentos`)
7. Processo de RH (`processo-de-rh`)
8. Executive Search (Hunting) (`hunting`)
9. Facilities (`facilities`)
10. Jardinagem (`jardinagem`)
11. Limpeza de Fachada (`limpeza-de-fachada`)
12. Limpeza de Vidros (`limpeza-de-vidros`)
13. Faxina Diarista (`faxina-diarista`)
14. Limpeza Pós-Obra (`limpeza-pos-obra`)
15. Limpeza Pré-Mudança (`limpeza-pre-mudanca`)
16. Limpeza Pós-Mudança (`limpeza-pos-mudanca`)
17. Terceirização (`terceirizacao`)
18. Zeladoria e Manutenção (`zeladoria-manutencao`)
19. Cadastro de Currículo (`cadastro-curriculo`)
20. Busca de Vagas (`busca-vagas`)
21. Alertas de Emprego (`alertas-emprego`)
22. Orientação Profissional (`orientacao-profissional`)
23. Atualização de Currículo (`atualizacao-curriculo`)
24. Controle de Acesso (`controle-acesso`)
25. Recepção e Portaria (`portaria`)

**Status**: ❌ Precisa criar migration de seed (ou manter como conteúdo editorial em JSON)

---

### 2.9 Recruitment Processes (processos seletivos)

**Fonte**: não existe mock — dados a definir

Sugestão: 3 processos de exemplo:

| Título                                | Descrição                                | Status | Vaga     |
| ------------------------------------- | ---------------------------------------- | ------ | -------- |
| Processo Seletivo - Analista RH       | Seleção para vaga de Analista de RH      | open   | Vaga #1  |
| Processo Seletivo - Auxiliar Produção | Seleção para Auxiliar de Produção        | open   | Vaga #13 |
| Processo Seletivo - Analista Sistemas | Seleção para Analista de Sistemas Sênior | draft  | Vaga #16 |

**Status**: ❌ Precisa criar migration de seed

---

### 2.10 Financial Transactions (movimentações financeiras)

**Fonte**: não existe mock — dados a definir

Sugestão: 5 transações de exemplo:

| Descrição                | Categoria    | Tipo    | Valor    |
| ------------------------ | ------------ | ------- | -------- |
| Pagamento - Fornecedor A | Fornecedores | expense | 2500.00  |
| Recebimento - Cliente X  | Clientes     | income  | 8500.00  |
| Pagamento - Folha RH     | RH           | expense | 15000.00 |
| Recebimento - Serviço Y  | Serviços     | income  | 3200.00  |
| Pagamento - Aluguel      | Operacional  | expense | 4500.00  |

**Status**: ❌ Precisa criar migration de seed

---

### 2.11 Stock Movements (estoque)

**Fonte**: não existe mock — dados a definir

Sugestão: 3 movimentações de exemplo:

| Produto             | Tipo       | Quantidade |
| ------------------- | ---------- | ---------- |
| Material de Limpeza | in         | 50         |
| EPIs                | out        | 20         |
| Equipamentos        | adjustment | 5          |

**Status**: ❌ Precisa criar migration de seed

---

### 2.12 Support Tickets (chamados)

**Fonte**: `src/services/mock/contatos.ts` — CRUD sem seed inicial

Sugestão: 3 tickets de exemplo:

| Título                   | Descrição                                       | Status      |
| ------------------------ | ----------------------------------------------- | ----------- |
| Problema com login       | Não consigo acessar minha conta                 | open        |
| Dúvida sobre vaga        | Quero mais informações sobre a vaga de Analista | in_progress |
| Atualização de currículo | Preciso atualizar meu currículo                 | resolved    |

**Status**: ❌ Precisa criar migration de seed

---

### 2.13 Settings (configurações)

**Fonte**: não existe mock — dados a definir

Sugestão: configurações do tenant J&S:

| Chave             | Valor                                    |
| ----------------- | ---------------------------------------- |
| `site.name`       | `J&S Empregos LTDA`                      |
| `site.url`        | `https://jsterceirizados.com.br`         |
| `site.logo`       | `/uploads/images/configuracoes/logo.png` |
| `whatsapp.number` | `5511968380592`                          |
| `phone.number`    | `(11) 96838-0592`                        |
| `email.contact`   | `comercial@jsterceirizados.com.br`       |
| `primary_color`   | `#16a34a`                                |

**Status**: ❌ Precisa criar migration de seed

---

## 3. Matriz de Dependências

```text
001_core_people_tenants.sql
   ↓
002_identity_people_auth.sql
   ↓
003_companies.sql
   ↓
004_candidates.sql
   ↓
005_jobs.sql
   ↓
006_applications.sql
   ↓
007_rbac.sql
   ↓
008_storage.sql
   ↓
009_domain_events.sql
   ↓
010_notifications.sql
   ↓
011_talent_pool.sql
   ↓
012_rls_consolidation.sql
   ↓
013_seed.sql (skills, company_types, relationship_types, roles, permissions)
   ↓
014_seed_companies.sql (companies + relationships) ← NOVO
   ↓
015_seed_jobs.sql (17 vagas) ← NOVO
   ↓
016_seed_candidates.sql (currículos) ← NOVO
   ↓
017_seed_services.sql (serviços) ← NOVO
   ↓
018_seed_recruitment.sql (processos seletivos) ← NOVO
   ↓
019_seed_financial.sql (transações) ← NOVO
   ↓
020_seed_stock.sql (estoque) ← NOVO
   ↓
021_seed_support.sql (chamados) ← NOVO
   ↓
022_seed_settings.sql (configurações) ← NOVO
```

---

## 4. Regras de Seed

1. **Idempotente**: todas as inserções usam `ON CONFLICT DO NOTHING`
2. **UUIDs fixos**: usar UUIDs conhecidos para facilitar referências em testes
3. **Tenant**: todas as seeds são para o tenant `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
4. **Sem credenciais**: não incluir senhas, tokens, service_role keys
5. **Dados brasileiros**: nomes, CPFs, telefones, endereços no formato BR
6. **Empresa**: sempre `J&S Empregos LTDA` — regra de AGENTS.md
7. **Status coerente**: `published` para vagas ativas, `active` para registros ativos

---

## 5. Próximas Migrations a Criar

| Ordem | Arquivo                               | Conteúdo                          |
| ----- | ------------------------------------- | --------------------------------- |
| 051   | `20260824005100_seed_companies.sql`   | Companies + company_relationships |
| 052   | `20260824005200_seed_jobs.sql`        | 17 vagas do mock                  |
| 053   | `20260824005300_seed_candidates.sql`  | 5 candidatos + skills             |
| 054   | `20260824005400_seed_services.sql`    | Serviços editoriais               |
| 055   | `20260824005500_seed_recruitment.sql` | Processos seletivos               |
| 056   | `20260824005600_seed_financial.sql`   | Transações financeiras            |
| 057   | `20260824005700_seed_stock.sql`       | Movimentações de estoque          |
| 058   | `20260824005800_seed_support.sql`     | Chamados de suporte               |
| 059   | `20260824005900_seed_settings.sql`    | Configurações do tenant           |

---

_Documento gerado em: 2026-08-24_
_Versão: V2.1_
_Empresa: J&S Empregos LTDA_
