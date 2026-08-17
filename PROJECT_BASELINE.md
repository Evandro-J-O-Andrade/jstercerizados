# J&S Empregos — Project Baseline

## Identidade

- Nome: J&S Empregos LTDA
- Posicionamento: Agência de Empregos + Consultoria de RH

## Stack

- Frontend: React + TypeScript + Vite
- Estilo: Tailwind CSS + Framer Motion + Lucide React
- Roteamento: React Router
- Backend/DB: Supabase (PostgreSQL)
- Automação: n8n (domain events → notifications)

## Database

- Migrations aplicadas: 001–013
- Schema: `public`
- Regra: não alterar migrations já aplicadas; próximas alterações devem ser feitas via novas migrations

## Authentication

- Supabase Auth (email/senha)
- `people` como entidade canônica de identidade
- `people.auth_user_id` → vínculo 1:1 com `auth.users`
- Criação de `people` automática via trigger após cadastro no Auth

## Multi-tenancy

- `companies` = entidade comercial global
- `tenants` = organização com acesso ao SaaS
- `tenant_memberships` = vínculo pessoa ↔ tenant
- `role_assignments` = papel da pessoa dentro do tenant
- Isolamento por RLS usando:
  - `auth.uid()`
  - `people.auth_user_id`
  - `tenant_memberships.tenant_id`

## RBAC

- `roles` global + tenant
- `permissions` global
- `role_permissions` = papel ↔ permissão
- `role_assignments` = pessoa ↔ papel
- Papéis confirmados:
  - `admin_master` (global)
  - `tenant_admin`
  - `rh_manager`
  - `recruiter`
  - `finance`
  - `support`
  - `content_manager`
  - `viewer`

## Admin Master

- Global: `tenant_id = NULL`
- Provisionado no banco
- Secret Key antiga revogada
- Nova Secret Key fora do Git
- Acesso administrativo global confirmado

## Rotas públicas

- `/`
- `/vagas`
- `/vagas/:slug`
- `/empresas`
- `/candidatos`
- `/servicos`
- `/servicos/:slug`
- `/clientes`
- `/parceiros`
- `/fornecedores`
- `/trabalhe-conosco`
- `/processo-seletivo`
- `/sobre`
- `/blog`
- `/blog/:slug`
- `/suporte`
- `/faq`
- `/contato`
- `/privacidade`
- `/termos`
- `/login`
- `/cadastro`
- `/cadastro/candidato`
- `/cadastro/empresa`
- `/recuperar-senha`

## Rotas protegidas

- `/dashboard` — admin
- `/dashboard/candidato` — candidato + admin
- `/dashboard/empresa` — empresa + admin

## Fluxo de login esperado

- `/login`
- `signInWithPassword()`
- `auth.users`
- `people`
- `role_assignments`
- `admin_master`
- `ProtectedRoute`
- `/dashboard`

## Assets

- Estrutura por domínio em `public/images/`
- Registro central em `src/content/assets.ts`
- Fallbacks em `src/config/imageFallbacks.ts`
- Staging `imagens para mover/` commitado no GitHub
- UTF-8 validado em `src/pages/ServicoDetalhe.tsx`

## Bloqueios atuais

- Migration 012 ainda depende de RPC `get_user_roles` ausente
- Frontend ainda usa roles legados (`admin`, `empresa`, `candidato`) em vez dos papéis canônicos do RBAC
- `ProtectedRoute` e `AuthContext` ainda não foram alinhados ao novo modelo

## Pendente

- Login frontend end-to-end
- ProtectedRoute alinhado a `admin_master` / `tenant_admin`
- Cadastro de empresas no admin
- Provisionamento de tenant + membros
- Convite de acesso via Supabase Auth
- Portal da empresa

## Regras fixas

- Não apagar imagens antigas sem validação visual
- Não expor `tenant_membership_id`
- Não usar `actor_person_id` em `role_assignments`
- Não alterar migrations aplicadas
- Não quebrar isolamento multi-tenant
- Não misturar `companies` com `tenants`
- Não remover `imagens para mover/` sem auditoria
