# 07 — Formulários

## 07.1 ServiceRequestForm

### Localização

`src/components/forms/ServiceRequestForm.tsx`

### Status atual

- ✅ Implementado
- ✅ Reutilizável (`serviceSlug`, `serviceName` props)
- ✅ Campos: name, company, email, phone, city, service, environment, message, bestTime
- ❌ Submissão via WhatsApp (não Supabase)
- ❌ Não persiste no Supabase
- ❌ Não integra n8n

### Refatoração necessária

```tsx
<ServiceRequestForm
  service="facilities" // slug do serviço
  source="service-page" // onde foi acionado
  onSuccess={handleLead} // callback após sucesso
/>
```

### Fluxo

```text
Formulário
  ↓
Validação cliente
  ↓
POST → {api}/leads (ou Supabase direto)
  ↓
n8n recebe webhook
  ↓
- WhatsApp → comercial
- E-mail → equipe
- Supabase → leads table
  ↓
Confirmação ao usuário: "Solicitação enviada!"
```

## 07.2 JobApplicationForm

### Localização

`src/components/forms/JobApplicationForm.tsx`

### Status atual

- ✅ Implementado (formulário para candidatar-se a vagas)
- Verificar integração com vagas

## 07.3 Lead — Supabase schema

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

-- Índices
create index leads_service_idx on leads(service_slug);
create index leads_status_idx on leads(status);
create index leads_created_idx on leads(created_at desc);

-- Triggers
create trigger update_updated_at before update on leads
  for each row execute function update_updated_at_column();
```

## 07.4 Props padrão de formulários

| Prop            | Tipo         | Descrição                   |
| --------------- | ------------ | --------------------------- |
| `service`       | `string`     | slug do serviço             |
| `source`        | `string`     | página/origem do formulário |
| `onSuccess`     | `() => void` | callback após envio         |
| `className`     | `string`     | classes adicionais          |
| `initialValues` | `object`     | valores iniciais (opcional) |

## 07.5 Componentes UI de formulário

### Input (`src/components/ui/Input.tsx`)

- Label + input
- Placeholder
- Required
- Error state
- Loading (skeleton)

### Select (`src/components/ui/Select.tsx`)

- Label + select
- Options array
- Required
- Error state

### Textarea (`src/components/ui/Textarea.tsx`)

- Label + textarea
- Rows
- Placeholder
- Required

### Button (`src/components/ui/Button.tsx`)

- `variant`: primary | secondary | outline | ghost
- `size`: sm | lg | xl
- `loading` prop
- `leftIcon` / `rightIcon` props
