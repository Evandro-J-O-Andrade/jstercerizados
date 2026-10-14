# Levantamento Estrutural - CHECK BOULER 24h

## Contexto Geral

O CHECK BOULER 24h é uma plataforma SaaS empresarial organizada por módulos independentes (células), cada um com seu próprio núcleo operacional, rotas, dashboards, CRUDs, formulários, repositórios, permissões e testes. A arquitetura segue o modelo de identidade, autorização e execução centralizados (espinha dorsal) com módulos autônomos que se comunicam por contratos e dados compartilhados no Supabase.

---

## 1. Arquitetura Oficial: Células, Módulos e Núcleos

### CHECK BOULER 24h - Plataforma SaaS • Governança • Execução • Auditoria

**Núcleo de Identidade**: Auth, pessoas, tenants, contexto e autorização  
**Núcleo de Execução**: Registro, despacho, contexto e ciclo de vida das células  
**Núcleo de Dados**: Supabase, relações, RLS, consultas e auditoria  
**Núcleo Analítico**: Indicadores, relatórios e gestão consolidada

**Células e Módulos de Negócio**:

- Candidato
- Recrutamento
- Vagas
- Empresas
- Financeiro
- Contabilidade
- Contratos
- Documentos
- Suporte

Cada célula tem seu núcleo operacional, suas rotas, seu dashboard e seus recursos de acesso aos dados.

---

## 2. Regras que Vamos Preservar

| Elemento                | Decisão                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tabelas do banco        | Todas devem ser inventariadas e mapeadas para um módulo responsável                                                                        |
| Módulos                 | Cada domínio tem sua pasta, suas rotas, seus arquivos e seu ciclo de vida                                                                  |
| Núcleo do módulo        | Contém dashboard, sidebar contextual quando necessária, páginas, formulários, CRUD, repositórios, permissões e testes                      |
| Reutilização            | Compartilhamos componentes e serviços quando fizer sentido; isso não elimina a identidade nem o núcleo do módulo                           |
| Relações                | Integração por chaves estrangeiras, índices, consultas e joins coerentes com o esquema real                                                |
| CRUD                    | Teremos recursos globais reutilizáveis e operações específicas de cada módulo, respeitando permissões e RLS                                |
| Cabeçalho e rodapé      | Podem ser globais ou específicos conforme a necessidade; não vamos duplicar componentes sem motivo                                         |
| Portal                  | Deixa de ser a entrada obrigatória para todas as áreas. Passa a dar suporte à governança, configurações, AVA, análise, gestão e relatórios |
| Dashboards operacionais | Permanecem dentro de seus respectivos módulos                                                                                              |
| Candidato               | Continua isolado do Recrutamento, com integração entre perfis, vagas e candidaturas                                                        |

---

## 3. A Árvore de CRUD que Precisamos Construir

### CRUD Global (Compartilhado)

Componentes genéricos, formulários-base, tabelas, paginação, filtros, validação, estados de carregamento, tratamento de erros, upload e utilitários de acesso a dados. São ferramentas compartilhadas, não uma autorização para acessar qualquer tabela.

### CRUD por Módulo

Cada domínio implementa suas regras, campos, relacionamentos, operações permitidas, validações de negócio e testes. Por exemplo, Financeiro controla suas transações; Recrutamento controla suas candidaturas; Candidato controla seus próprios dados permitidos.

---

## 4. Auditoria do AuthContext

**Diagnóstico**: A carga inicial pode filtrar as atribuições de papel usando `currentTenantId` antes de o contexto ter sido inicializado.

**Divergência importante**: O histórico de inspeção do banco indicava `roles.scope` (`global` ou `tenant`), enquanto o relatório apresentado menciona `roles.is_global`. Precisamos confirmar qual estrutura está no código local e no banco antes de aceitar a correção como definitiva.

**Correção proposta**:

```typescript
const currentTenantIdForFilter = currentTenantId ?? primaryTenantId;
```

É uma candidata a resolver o filtro inicial, mas ainda exige validar se `primaryTenantId` corresponde ao contexto correto para aquela sessão e executar os testes de identidade e troca de tenant.

---

## 5. Próxima Etapa de Trabalho

1. Reconstruir o inventário real do repositório, incluindo alterações locais, arquivos não rastreados e módulos já implementados
2. Recuperar e aproveitar a matriz existente de banco ↔ código ↔ células, sem refazer uma auditoria já concluída
3. Construir o mapa completo de tabelas e módulos, identificando relações, chaves estrangeiras, índices, views, funções e permissões
4. Definir o contrato comum dos núcleos das células e a árvore de CRUD global
5. Organizar os módulos existentes e identificar somente as lacunas reais
6. Validar identidade, permissões, integração entre módulos e testes

**Inventário histórico**: 226 tabelas, 5 views, 233 funções e uma matriz Banco ↔ Código ↔ Células (datada de 08/10/2026)

**Regra final**: Nenhuma pasta será criada apenas para preencher uma árvore bonita, nenhuma tabela ficará sem módulo responsável e nenhum módulo perderá sua autonomia porque existe código reutilizável.

---

## 6. Analogia com Active Directory

O CHECK BOULER 24h foi pensado com uma arquitetura inspirada no Active Directory (AD): hierarquia organizacional, usuários, grupos, políticas, permissões e herança controlada.

### Fluxo Lógico

```
Autenticação → Identidade (auth.users → people) → Tenant e contexto ativo
→ Papéis, grupos e políticas → Autorização efetiva → Dispatcher / CellRegistry
→ Célula autorizada → Dashboard, CRUD e operações → Supabase + RLS + auditoria
→ Indicadores e relatórios
```

### Herança Controlada

- Política global: requisitos mínimos de segurança
- Política do tenant: restrições organizacionais
- Política do módulo: operações e requisitos próprios
- Permissão específica: não pode anular restrição superior por acidente
- Precedência entre concessões, negações e exceções deve ser definida e testada

---

## 7. Seis Contratos Fundamentais da Espinha Dorsal

| Contrato             | Responsabilidade                                                             |
| -------------------- | ---------------------------------------------------------------------------- |
| `Identity / Tenant`  | Identificar a pessoa autenticada e determinar o tenant e o contexto ativos   |
| `Authorization`      | Validar papéis, permissões, políticas e escopo                               |
| `Execution`          | Controlar o contexto em que uma operação é executada                         |
| `Cell`               | Definir como uma célula é registrada, inicializada, identificada e integrada |
| `View / Data`        | Padronizar contratos de dados, consultas e apresentação                      |
| `Resilience / Audit` | Tratar erros, isolamento de falhas, rastreabilidade e auditoria              |

Componentes estruturais: `CellRegistry`, `Dispatcher`, `ExecutionContext`, `types.ts`

---

## 8. Referências de Mercado para Qualidade Visual

1. **Salesforce** - Análise acionável, dashboards interativos, filtros, comparações
2. **HubSpot** - Gestão por equipe, relatórios customizáveis, visão integrada
3. **Microsoft Dynamics 365** - Operação diária, indicadores + listas de trabalho + funis
4. **ServiceNow** - Workspaces por contexto, painéis configuráveis, indicadores operacionais

---

## 9. Padrão Visual e Funcional do CHECK BOULER 24h

### Qualidade Proposta

- **Analytics de verdade**: Indicadores ligados a dados reais, comparação temporal, metas, tendências
- **Dashboards orientados ao trabalho**: Cada perfil vê prioridades, pendências, alertas e ações úteis
- **CRUD empresarial completo**: Busca, filtros, paginação, ordenação, formulários consistentes
- **Acabamento profissional**: Hierarquia visual clara, tipografia consistente, densidade controlada
- **Segurança e rastreabilidade**: Dados restritos ao contexto, operações protegidas pela RLS

### Identidade Visual Própria

- Uma marca, uma plataforma, diferentes experiências de trabalho
- Núcleo compartilhado define padrões visuais e de interação
- Cada célula controla sua experiência operacional
- Dispatcher e mecanismos existentes integrados, sem arquitetura concorrente

---

## 10. Auditoria Inicial - Resultados do Supabase

### Inventário Atual (consulta direta)

| Item                       | Resultado |
| -------------------------- | --------- |
| Tabelas em `public`        | 221       |
| Views                      | 5         |
| Funções                    | 233       |
| Triggers                   | 84        |
| Políticas RLS              | 602       |
| Tabelas com RLS habilitada | 221       |

### Alertas do Verificador Supabase

- View com `SECURITY DEFINER`
- 10 funções com `search_path` mutável
- Funções `SECURITY DEFINER` executáveis por `anon` ou `authenticated`
- Proteção contra senhas comprometidas desabilitada
- 266 FKs sem índice de cobertura
- 33 avaliações de funções de auth em políticas RLS
- 44 políticas permissivas sobrepostas

---

## 11. Diagnóstico por Módulo (Código GitHub - branch main)

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

## 12. Divergências Críticas Identificadas

### 1. Candidaturas (`applications`)

| Banco (atual)                                                                                                             | Recrutamento espera                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `id`, `candidate_id`, `job_id`, `status`, `created_at`, `updated_at`, `tenant_id`, `metadata`, `created_by`, `applied_at` | `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` |

### 2. Preferências do Candidato

- Código consulta `candidate_preferences` → **Tabela não existe no inventário atual (221 tabelas)**

### 3. Cursos do Candidato

| Repositório usa         | Tabela real tem                                    |
| ----------------------- | -------------------------------------------------- |
| `hours`, `completed_at` | `completion_date`, `expiration_date` (sem `hours`) |

### 4. Chat Humano

| Código tenta usar                       | Schema real tem                                      |
| --------------------------------------- | ---------------------------------------------------- |
| `visitor_id`, `subject` em `chat_rooms` | `tenant_id`, `type`, `title`, `created_by_person_id` |
| `role` em `chat_messages`               | `sender_type`, `sender_person_id`                    |

### 5. n8n / Edge Functions

- Código chama `handoff` → **Não aparece nas funções implantadas** (apenas `noop-doc-check` e `turnstile-siteverify`)

---

## 13. Estrutura de Módulos Proposta

```
src/
├── platform/
│   ├── router/
│   │   └── ModuleRouter.tsx
│   └── permissions/
├── components/
│   └── shared/
├── modules/
│   ├── candidato/
│   ├── recrutamento/
│   ├── vagas/
│   ├── empresas/
│   ├── financeiro/
│   ├── contabilidade/
│   ├── contratos/
│   ├── documentos/
│   ├── suporte/
│   └── configuracoes/
└── contexts/
    └── identidade/
```

### Cada Módulo (Célula)

```
src/modules/{modulo}/
├── routes/
├── dashboards/
│   └── Dashboard{Modulo}.tsx
├── pages/
├── components/
├── forms/
├── repositories/
├── hooks/
├── sidebar/
├── navbar/
├── admin/
├── permissions/
└── tests/
```

---

## 14. Mapa de Rotas Proposto

| Núcleo         | Base de Rota    | Dashboard Principal       |
| -------------- | --------------- | ------------------------- |
| Candidato      | `/candidato`    | `DashboardCandidato.tsx`  |
| Recrutamento   | `/recrutamento` | `DashboardRecrutador.tsx` |
| Empresas       | `/empresas`     | `DashboardEmpresas.tsx`   |
| Blog           | `/blog`         | Listagem + detalhe        |
| Cursos         | `/cursos`       | Catálogo + área do aluno  |
| Admin Cursos   | `/cursos/admin` | Gestão de cursos          |
| Portal Suporte | `/suporte`      | Dashboard transversal     |

---

## 15. Experiência do Candidato (Referências)

### Descoberta Inteligente

- Vagas recomendadas baseadas no perfil/preferências
- Busca por cargo, cidade, salário, contrato, modalidade
- Favoritos e alertas de novas oportunidades
- Explicação do match (por que a vaga combina)

### Perfil que Evolui

- Currículo estruturado (experiência, formação, cursos, competências, idiomas)
- Indicador de completude com sugestões práticas
- Importação de PDF com revisão obrigatória
- Preview do currículo

### Jornada Transparente

- Histórico de candidaturas com etapa atual
- Convites para entrevistas com orientações
- Notificações de mudanças reais (sem promessas)

---

## 16. Portal de Suporte (Transversal)

**Não é portal de entrada operacional**. Área administrativa para:

- Configurações globais e parâmetros
- Gerenciamento de domínios e ambientes
- Dashboards analíticos consolidados
- Monitoramento técnico, auditoria, suporte
- Gestão de acessos (respeitando permissões reais)

---

## 17. Integração Candidato ↔ Recrutamento

### Fluxo Correto

```
Cadastro do candidato → Pessoa + identidade vinculadas
         ↓
Vaga publicada → applications (registro canônico compartilhado)
         ↓
Recrutamento: triagem, etapas, avaliação, decisão
         ↓
Contratação → Vínculo de funcionário → Contrato + alocação no cliente
         ↓
Portal do Candidato: acompanha status
```

### Requisitos de Integração

- Mesmo registro canônico de `applications` (não cópias independentes)
- Contrato de dados unificado para `applications`
- Cadastro pelo recrutador: criar/associar pessoa → perfil candidato → provisionar acesso seguro
- Favoritos ≠ Candidaturas (sinais diferentes para matching)

---

## 18. Empresas, Clientes, Parceiros, Fornecedores, Funcionários

### Categorias Distintas

- **Empresas contratantes**: Solicitam recrutamento/profissionais
- **Clientes**: Contratam serviços da J&S (terceirização, mão de obra)
- **Parceiros**: Cooperam na prestação/encaminhamento
- **Fornecedores**: Materiais/serviços para operação
- **Funcionários efetivos**: Vínculo com a própria operação
- **Profissionais alocados**: Disponibilizados para clientes/contratos

**Uma organização pode ter múltiplos papéis** → Verificar se `company_relationships` + `company_relationship_types` suportam isso sem duplicar cadastros.

---

## 19. Blog, Cursos e Treinamentos - Separação de Produtos

| Produto                  | Finalidade                                                    |
| ------------------------ | ------------------------------------------------------------- |
| **Blog**                 | Artigos administráveis, categorias, busca, conteúdo editorial |
| **Catálogo de Cursos**   | Cursos, descrição, instrutor, carga horária, modalidade       |
| **Matrículas**           | Inscrição e acompanhamento por aluno                          |
| **Área de Aprendizagem** | Aulas, materiais, progresso, retomada                         |
| **Avaliações**           | Questionários, resultados, tentativas                         |
| **Certificados**         | Emissão verificável pós-conclusão                             |
| **Admin de Cursos**      | CRUD, publicação, relatórios, permissões                      |
| **Integração Candidato** | Cursos concluídos → competências no perfil                    |

**Atenção**: `candidate_courses` = cursos no currículo (input do candidato). **Não** é catálogo de cursos ofertados nem plataforma de aprendizagem.

---

## 20. Modelo de Dados - Cursos e Empresas

```
companies (já existe)
    ↓
course_providers (proposto) → Relaciona empresas aos cursos + tipo de participação
    ↓
courses (proposto) → Catálogo oficial: publicação, carga horária, modalidade
    ↓
course_enrollments → Matrículas
    ↓
course_lessons → Aulas e materiais
```

---

## 21. Automação, Chat e Notificações

### Chat com Gestor Online

1. Visitante abre chat → resposta IA
2. Solicita humano → sistema identifica atendentes elegíveis + disponibilidade real
3. Se gestor online → notificação + conversa tempo real
4. Se ninguém disponível → registra solicitação + informa próximo passo (sem fingir presença)
5. Histórico, mensagens, atribuição, encerramento → registrados com permissões

### Estruturas Encontradas no Banco

- `chat_rooms`, `chat_participants`, `chat_messages`, `chat_handoffs`
- `ai_conversations`, `ai_messages`
- `notifications`, `notification_deliveries`, `notification_preferences`
- `domain_events`, `event_outbox`, `event_deliveries`
- `automation_jobs`, `automation_executions`
- `email_templates`, `email_messages`
- `webhook_deliveries`, `integration_webhooks`, `integration_credentials`, `integration_connections`

### Divergências Críticas

- **Chat humano**: Código usa campos inexistentes no schema atual
- **n8n**: Função `handoff` não implantada no ambiente consultado
- **Presença online**: Não confirmada implementação (tabela `sessions` tem `expires_at` apenas)

---

## 22. Linha de Trabalho Completa (Ordem Certa)

### Passagem A - Inventário do Banco

Mapear tabelas por domínio, PKs, FKs, índices, RLS, permissões. Registrar tabelas por célula, compartilhadas, relações ausentes/divergentes.

### Passagem B - Inventário do Código

Conferir rotas, dashboards, sidebars, navbars, formulários, repositórios, hooks, serviços, uploads, testes. Identificar código duplicado, componentes que apenas aparentam funcionar, páginas sem integração real.

### Passagem C - Matriz Banco ↔ Código ↔ Célula

Para cada entidade: tabela canônica, módulo responsável, telas, CRUDs permitidos, relações, permissões, testes necessários.

### Passagem D - Fechar Contratos e Dependências

Resolver divergências que impedem funcionamento: candidaturas, preferências, cursos no currículo, chat, notificações. Separar: ajuste de frontend, configuração externa, alteração de schema.

### Passagem E - Implementar por Células (Ordem de Dependência)

1. Identidade e contratos de acesso
2. Candidato e Recrutamento (consolidar)
3. Empresas, Blog, Cursos
4. Chat, Notificações, Automação
5. Portal de Suporte (capacidades transversais + dashboards analíticos)

### Passagem F - Validar Antes de Publicar

Testes unitários, integração, autorização/RLS, fluxos completos, regressão visual. Deploy só após validação e autorização explícita.

---

## 23. Ficha de Trabalho por Item (Para Não Perder a Linha)

Cada item do levantamento deve ter:

- Domínio e célula responsável
- Tabelas reais e respectivas relações
- Arquivos e rotas existentes
- CRUDs e permissões necessários
- Estado: **confirmado / incompleto / divergente / não encontrado**
- Dependências e riscos
- Próxima ação verificável
- Critério de conclusão e testes

---

## 24. Status Atual

✅ **Levantamento e desenho de arquitetura concluídos**  
✅ **Auditoria somente leitura: Supabase + GitHub (branch main)**  
✅ **Divergências críticas identificadas e documentadas**  
✅ **Arquitetura-alvo definida com células, contratos e rotas**

⏳ **Próximo**: Fechar inventário completo das tabelas e rotas existentes (especialmente cursos, empresas, chat, automação, identidade) e transformar divergências em lista de trabalho rastreável.

🚫 **Nenhuma alteração realizada**: Sem migrations, alterações de RLS, criação de usuários, modificação de arquivos, commits, push ou deploy.

---

## 25. Princípios Norteadores

1. **Supabase é Source of Truth** - Não inventar dados, não substituir reais por mocks
2. **Documentação primeiro, código depois** - Ler .mds antes de qualquer ação
3. **Não duplicar** - Procurar antes de criar; reutilizar ou propor melhoria
4. **Git e produção só com autorização explícita** - Commit, push, deploy requerem aprovação separada
5. **Segurança no banco** - RLS obrigatório; interface oculta ações, mas backend impede acessos
6. **Integração sem fusão** - Módulos conversam por contratos, não viram um só
7. **Qualidade visual + funcionalidade real** - Sem dados falsos, gráficos decorativos, botões que não executam
8. **Identidade visual própria** - CHECK BOULER reconhecível, não cópia de Salesforce/HubSpot/etc
