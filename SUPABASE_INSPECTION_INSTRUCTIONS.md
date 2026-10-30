# LEVANTAMENTO DE ESQUEMA SUPABASE — J&S Empregos LTDA

## Como executar

1. Acesse o Supabase Dashboard: https://app.supabase.com/project/okxqfyoqbhcmflpurfrw/sql
2. Cole o conteúdo de `supabase_schema_inspection.sql` no SQL Editor
3. Clique em **RUN** para executar
4. Repita com `supabase_security_inspection.sql`
5. Copie os resultados de cada query e cole aqui para análise

## Arquivos criados

| Arquivo | Conteúdo |
|---------|----------|
| `supabase_schema_inspection.sql` | Tabelas, colunas, FKs, unique constraints, PKs, views, materialized views, funções, triggers, roles, permissões em tabelas, políticas RLS, tabelas com RLS, índices, resumo por tabela |
| `supabase_security_inspection.sql` | Funções SECURITY DEFINER, storage buckets, tabelas auth, extensões Postgres, publications (realtime), tabelas na publication, cron jobs, tabelas sem RLS, tabelas com RLS sem políticas |

## O que cada seção retorna

### `supabase_schema_inspection.sql`

| Seção | O que mostra | Para que serve |
|-------|-------------|----------------|
| 1. Tabelas | Nome e tipo de cada tabela pública | Inventário de todas as entidades |
| 2. Colunas | Nome, tipo, tamanho, nullable, default, posição | Estrutura detalhada de cada tabela |
| 3. Foreign Keys | Tabela origem → destino, colunas, nome da FK | Relacionamentos e integridade referencial |
| 4. Unique Constraints | Colunas com unicidade | Regras de negócio de unicidade |
| 5. Primary Keys | Colunas PK de cada tabela | Identificadores primários |
| 6. Views | Definição SQL de cada view | Consultas predefinidas expostas |
| 7. Materialized Views | Definição de cada MV | Consultas materializadas para performance |
| 8. Funções | Nome, tipo, tipo de retorno, definição | Lógica de banco (RPC, triggers, etc.) |
| 9. Triggers | Nome, tabela, evento, função, timing | Automação no banco |
| 10. Roles | Nome, superusuário, login, bypass RLS | Papéis de banco de dados |
| 11. Permissões em tabelas | Quem tem SELECT/INSERT/UPDATE/DELETE em cada tabela | Controle de acesso por tabela |
| 12. Políticas RLS | Nome, comando, definição USING/WITH CHECK | Controle de nível de linha |
| 13. Tabelas com RLS | Qual tabela tem RLS habilitado/forçado | Status de segurança por tabela |
| 14. Índices | Nome e definição de cada índice | Performance e otimização |
| 15. Resumo por tabela | Contagem de colunas, timestamps, UUIDs | Visão geral rápida |

### `supabase_security_inspection.sql`

| Seção | O que mostra | Para que serve |
|-------|-------------|----------------|
| A. Funções SECURITY DEFINER | Funções que executam com privilégios do dono | Risco de segurança se expostas indevidamente |
| B. Storage Buckets | Buckets, público/privado, limite de tamanho, MIME types | Armazenamento de arquivos (avatares, documentos) |
| C. Tabelas auth | Tabelas do esquema auth (usuários, identidades) | Gestão de autenticação |
| D. Extensões Postgres | Nome, versão, esquema | Recursos do banco habilitados |
| E. Publications | Publicações do Realtime | Sincronização em tempo real |
| F. Tabelas na publication | Quais tabelas são replicadas via Realtime | Quais dados são atualizados em tempo real |
| G. Cron Jobs | Nome, schedule, comando, ativo | Tarefas agendadas no banco |
| H. Tabelas sem RLS | Tabelas sem segurança de nível de linha | Risco de exposição de dados |
| I. Tabelas com RLS sem políticas | Tabelas com RLS mas sem políticas definidas | Dados bloqueados (sem acesso) |

## O que enviar de volta

Após executar, cole aqui:
1. Os resultados de cada query (ou um resumo das tabelas principais)
2. Quaisquer funções SECURITY DEFINER encontradas
3. Quais buckets de storage existem
4. Quais tabelas estão sem RLS
5. Quais tabelas estão na publication do Realtime

Com esses dados, conseguimos:
- Mapear as FKs entre `people`, `candidates`, `applications`, `jobs`, etc.
- Verificar se há tabela `accounts` ou similar
- Confirmar se `tenant_memberships` existe e suas colunas
- Identificar funções inseguras (SECURITY DEFINER)
- Planejar a correção do contexto de módulo baseado nos dados reais do banco

## Observações

- Todas as queries são **READ-ONLY** (SELECT apenas). Não alteram nada no banco.
- O esquema `auth` é gerenciado pelo Supabase Auth; algumas tabelas podem não ser visíveis dependendo do nível de acesso.
- Se alguma query retornar erro de permissão, execute apenas as que tiverem acesso e reporte quais falharam.
