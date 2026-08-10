# 08 — Supabase

## 08.1 Cliente

**Arquivo:** `src/lib/supabase.ts`

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('Supabase is not configured.');
    return null;
  }
  client = createClient(url, key);
  return client;
}
```

**Status:** ✅ Configurado (cliente singleton)
**Gap:** Nenhuma tabela além de `chat_rooms` configurada

## 08.2 Schemas propostos

### leads

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text,
  email text not null,
  phone text not null,
  cidade text,
  service_slug text,
  source text,
  mensagem text,
  status text check (status in ('new','contacted','proposal','won','lost')) default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### chat_rooms

```sql
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  subject text,
  status text check (status in ('waiting','active','closed')) default 'waiting',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### chat_messages

```sql
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id),
  sender_type text check (sender_type in ('user','assistant','agent')),
  content text,
  created_at timestamptz default now()
);
```

### vagas (para substituir mock)

```sql
create table vagas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  empresa text,
  cidade text,
  estado text,
  tipo_contrato text,
  nivel text,
  salario_min numeric,
  salario_max numeric,
  modalidade text,
  beneficios text[],
  requisitos text,
  descricao text,
  total_vagas integer,
  status text check (status in ('draft','active','arquivada','contratada')) default 'draft',
  data_publicacao timestamptz default now(),
  created_at timestamptz default now()
);
```

### candidatos (área do candidato)

```sql
create table candidatos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  nome text not null,
  email text,
  cpf text unique,
  rg text,
  telefone text,
  cidade text,
  estado text,
  experiencia text,
  formacao text,
  cursos text[],
  idiomas text[],
  disponibilidade text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### candidaturas

```sql
create table candidaturas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid references candidatos(id),
  vaga_id uuid references vagas(id),
  status text check (status in ('recebido','analise','entrevista','aprovado','rejeitado')) default 'recebido',
  created_at timestamptz default now()
);
```

### favoritas (vagas salvas)

```sql
create table candidato_favoritos (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid references candidatos(id),
  vaga_id uuid references vagas(id),
  created_at timestamptz default now(),
  unique(candidato_id, vaga_id)
);
```

## 08.3 Auth

### Jornada candidato

```text
/candidatos/login  ← auth.users (email + senha)
/candidatos/cadastro
/candidatos/perfil
/candidatos/candidaturas
/candidatos/favoritas
```

### Jornada empresa

```text
/empresas/login
/empresas/dashboard
  - divulgar vaga
  - solicitar orçamento
  - banco de currículos
  - acompanhar processos
  - contratações
```

### Jornada parceiro

```text
/parceiros/login
/parceiros/dashboard
```

### Jornada fornecedor

```text
/fornecedores/login
/fornecedores/dashboard
```
