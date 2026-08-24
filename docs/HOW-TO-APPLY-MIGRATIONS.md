# Como aplicar migrations e seed no Supabase remoto

Este documento descreve a ordem correta de execução das migrations no Supabase SQL Editor.

## Pré-requisitos

1. Acessar o Supabase Dashboard do projeto
2. Ir em **SQL Editor**
3. Ter permissão de administrador no projeto

## Ordem de execução

### 1. Primeiro: RLS para leitura pública de jobs publicadas

Copie o conteúdo de `supabase/migrations/20260825000002_rls_published_jobs_public.sql` e execute no SQL Editor.

Esta migration adiciona:

- Policy para leitura pública de jobs com `status = 'published'`
- Acesso permitido para `anon` e `authenticated`
- Apenas SELECT; INSERT/UPDATE/DELETE bloqueados para público

**Importante:** executar esta migration ANTES do seed para que, assim que os dados forem inseridos, já estejam visíveis publicamente.

### 2. Segundo: Seed de dados editoriais

Copie o conteúdo de `supabase/migrations/20260825000001_seed_editorial_data.sql` e execute no SQL Editor.

Este seed insere:

- 4 companies (clientes)
- 4 company_relationships
- 6 services
- 6 partners
- 3 suppliers
- 17 jobs (vagas editoriais)

Todos os inserts são idempotentes (`ON CONFLICT DO UPDATE`), podendo ser executados múltiplas vezes sem duplicar dados.

### 3. Terceiro: Verificação e reconciliação

Copie o conteúdo de `supabase/migrations/20260825000003_reconcile_local_vs_cloud.sql` e execute as queries no SQL Editor.

Esta migration contém queries de verificação:

- Listar todos os jobs
- Contar jobs por status
- Verificar tenant alignment
- Listar companies, relationships, services, partners, suppliers
- Verificar se as 17 vagas foram inseridas corretamente

## Validação esperada

Após executar as migrations, você deve ver:

### Jobs

```sql
SELECT COUNT(*) FROM public.jobs WHERE status = 'published';
-- Esperado: 17
```

### Companies

```sql
SELECT COUNT(*) FROM public.companies;
-- Esperado: 4
```

### Services

```sql
SELECT COUNT(*) FROM public.services;
-- Esperado: 6
```

### Partners

```sql
SELECT COUNT(*) FROM public.partners;
-- Esperado: 6
```

### Suppliers

```sql
SELECT COUNT(*) FROM public.suppliers;
-- Esperado: 3
```

## Teste de leitura pública

Após aplicar as migrations, teste a leitura pública de jobs:

```sql
-- Como anon user (simular)
SELECT id, title, slug, status, city, state, contract_type
FROM public.jobs
WHERE status = 'published'
ORDER BY created_at DESC;
```

Esperado: 17 vagas retornadas.

## Troubleshooting

### Erro de permissão

Se houver erro de permissão ao executar as migrations:

1. Verificar se você é administrador do projeto Supabase
2. Verificar se o RLS não está bloqueando a execução das migrations

### Dados duplicados

Os seeds usam `ON CONFLICT DO UPDATE`, então dados duplicados não serão criados. Os registros existentes serão atualizados.

### Jobs não aparecem publicamente

Verificar:

1. Se a migration RLS foi executada
2. Se os jobs têm `status = 'published'`
3. Se há jobs com `status = 'draft'` (estes não são visíveis publicamente)
