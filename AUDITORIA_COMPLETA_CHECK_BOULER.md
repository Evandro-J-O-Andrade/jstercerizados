# AUDITORIA COMPLETA — CHECK BOULER 24h

## 1. Inventário do Supabase (Fonte da Verdade)

| Item                       | Quantidade |
| -------------------------- | ---------- |
| Tabelas em `public`        | 221        |
| Views                      | 5          |
| Funções                    | 233        |
| Triggers                   | 84         |
| Políticas RLS              | 602        |
| Tabelas com RLS habilitada | 221        |

### Alertas do Verificador Supabase

- View com `SECURITY DEFINER`
- 10 funções com `search_path` mutável
- Funções `SECURITY DEFINER` executáveis por `anon`/`authenticated`
- Proteção contra senhas comprometidas desabilitada
- 266 FKs sem índice de cobertura
- 33 avaliações de funções de auth em políticas RLS
- 44 políticas permissivas sobrepostas

---

## 2. Divergências Críticas Identificadas

### 2.1 Candidaturas (`applications`)

| Banco (atual)                                                                                                             | Recrutamento espera                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `id`, `candidate_id`, `job_id`, `status`, `created_at`, `updated_at`, `tenant_id`, `metadata`, `created_by`, `applied_at` | `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` |

Dois repositórios usam contratos diferentes para a mesma tabela.

### 2.2 Preferências do Candidato

- Código consulta `candidate_preferences` → **Tabela não existe no inventário atual (221 tabelas)**

### 2.3 Cursos do Candidato

| Repositório usa         | Tabela real tem                                    |
| ----------------------- | -------------------------------------------------- |
| `hours`, `completed_at` | `completion_date`, `expiration_date` (sem `hours`) |

### 2.4 Chat Humano

| Código tenta usar                       | Schema real tem                                      |
| --------------------------------------- | ---------------------------------------------------- |
| `visitor_id`, `subject` em `chat_rooms` | `tenant_id`, `type`, `title`, `created_by_person_id` |
| `role` em `chat_messages`               | `sender_type`, `sender_person_id`                    |

### 2.5 n8n / Edge Functions

- Código chama `handoff` → **Não aparece nas funções implantadas** (apenas `noop-doc-check` e `turnstile-siteverify`)

---

## 3. Diagnóstico por Módulo

### Candidato e Recrutamento

- **Estrutura separada confirmada**: Módulos com rotas, dashboards e repositórios próprios
- **Integração pendente**: Dois repositórios de `applications` com contratos diferentes
- **Cadastro interno**: Botão "Novo Candidato" sem ação conectada; `createCandidate()` exige `person_id` existente

### Financeiro

- **Divergência de permissões**: Catálogo usa `finance.read`, rotas exigem `finance.dashboard.read`
- **Base funcional**: CRUD de contas a pagar/receber, lançamentos, plano de contas

### Estoque e PDV

- **Rotas compartilham telas legadas**: Várias rotas apontam para `EstoquePage` e `FaturamentoPage`
- **Separação funcional pendente**

### Contabilidade

- **Estrutura própria**: Rotas para lançamentos, plano de contas, balancetes
- **Integração contábil pendente**

---

## 4. Matriz de Maturidade por Domínio

| Domínio                 | Estado                                      | Ação                                         |
| ----------------------- | ------------------------------------------- | -------------------------------------------- |
| Identidade e permissões | Estrutura existe, validação pendente        | Validar ciclo de cadastro, login, vinculação |
| Candidato               | Dashboard, rotas, CRUD parcial              | Corrigir divergências de schema              |
| Recrutamento            | Dashboard, rotas, repositórios              | Alinhar `applications` ao schema real        |
| Empresas                | `companies`, relacionamentos                | Mapear CRUD e reutilização                   |
| Financeiro              | CRUD identificado                           | Confirmar autorização por operação           |
| Contabilidade           | Rotas próprias                              | Validar repositórios e integração            |
| Estoque                 | Rotas compartilham telas                    | Separar operações por função                 |
| PDV                     | Rota compartilhada                          | Separar responsabilidades                    |
| Chat IA/Humano          | Widgets, divergência de schema              | Corrigir contratos de dados                  |
| n8n/Automação           | Código presente, implantação não confirmada | Confirmar ambiente                           |
| Blog                    | Conteúdo fixo no código                     | Substituir por leitura real                  |
| Cursos                  | `candidate_courses` apenas                  | Corrigir campos divergentes                  |
| Portal Suporte          | Módulo, dashboard, sidebar                  | Completar administração transversal          |

---

## 5. Linha de Trabalho por Passagem

### Passagem A — Inventário do Banco

Mapear tabelas por domínio, PKs, FKs, índices, RLS, permissões.

### Passagem B — Inventário do Código

Conferir rotas, dashboards, sidebars, formulários, repositórios, hooks, testes.

### Passagem C — Matriz Banco ↔ Código ↔ Célula

Para cada entidade: tabela canônica, módulo responsável, telas, CRUDs, relações, permissões.

### Passagem D — Fechar Contratos e Dependências

Resolver divergências: candidaturas, preferências, cursos, chat, notificações.

### Passagem E — Implementar por Células

1. Identidade e contratos de acesso
2. Candidato e Recrutamento
3. Empresas, Blog, Cursos
4. Chat, Notificações, Automação
5. Portal de Suporte

### Passagem F — Validar Antes de Publicar

Testes unitários, integração, autorização/RLS, fluxos completos, regressão visual.

---

## 6. Status Atual

- ✅ Levantamento e desenho de arquitetura concluídos
- ✅ Auditoria somente leitura: Supabase + GitHub (branch main)
- ✅ Divergências críticas identificadas e documentadas
- ✅ Arquitetura-alvo definida com células, contratos e rotas
- 🚫 Nenhuma alteração em arquivos, banco, migrations, RLS, commits, push ou deploy
