# FRONTEND-BACKEND-CONTRACT-VALIDATION.md

**Data:** 2026-08-18  
**Escopo:** Validação de conformidade do código existente contra o contrato V2.1  
**Objetivo:** Identificar referências legadas que precisam ser atualizadas antes do dry-run

---

## 1. Resumo Executivo

| Categoria | Status | Quantidade |
|-----------|--------|------------|
| **Arquivos analisados** | — | 15 |
| **Referências legadas encontradas** | ⚠️ | 8 |
| **Referências conformes** | ✅ | ~120 |
| **Bloqueadores para dry-run** | ❌ | 2 |

---

## 2. Referências Legadas Encontradas

### 2.1 Roles legadas em código

| Arquivo | Linha | Referência | Problema | V2.1 Esperado |
|---------|-------|------------|----------|---------------|
| `src/App.tsx` | 126 | `allowedRoles={['candidato', 'admin']}` | Role `candidato` não existe na V2.1 | `['candidate', ...]` ou permission-based |
| `src/App.tsx` | 134 | `allowedRoles={['empresa', 'admin']}` | Role `empresa` não existe na V2.1 | `['company', ...]` ou permission-based |
| `src/pages/Login.tsx` | 55 | `if (role === 'candidato')` | Role `candidato` não existe | Mapear para tenant role ou permission |
| `src/pages/Login.tsx` | 56 | `if (role === 'empresa')` | Role `empresa` não existe | Mapear para tenant role ou permission |
| `src/pages/Dashboard.tsx` | 381 | `const isCandidate = role === 'candidato'` | Role `candidato` não existe | Verificar permissão `candidates.read` |
| `src/pages/Dashboard.tsx` | 382 | `const isCompany = role === 'empresa'` | Role `empresa` não existe | Verificar permissão `companies.read` |
| `src/pages/Dashboard.tsx` | 458 | `{role === 'admin' &&` | Role `admin` não existe na V2.1 | `admin_master` ou `tenant_admin` |
| `src/components/layout/BottomNavigation.tsx` | 58 | `profile?.role === 'admin'` | Role `admin` não existe | `admin_master` ou `tenant_admin` |
| `src/components/layout/BottomNavigation.tsx` | 60 | `profile?.role === 'empresa'` | Role `empresa` não existe | Mapear para tenant role |

### 2.2 Outras referências legadas

| Arquivo | Linha | Referência | Problema | V2.1 Esperado |
|---------|-------|------------|----------|---------------|
| `src/constants/colors.ts` | 14 | `admin: 'bg-primary/10 text-primary'` | Hardcoded role `admin` | Usar `admin_master` ou mapping dinâmico |
| `src/types/common.ts` | 93 | `category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato'` | Valor `candidato` como categoria | Separar domínio de autorização |
| `src/config/seoPages.ts` | 156 | `'candidato'` | URL pública `/candidatos` | OK (rota pública) |
| `src/config/seoPages.ts` | 157 | `'empresa'` | URL pública `/empresas` | OK (rota pública) |
| `src/config/whatsappMessages.ts` | 5 | `candidate: ...` | Valor de domínio `candidate` | OK (contexto de mensagem) |
| `src/config/whatsappMessages.ts` | 6 | `company: ...` | Valor de domínio `company` | OK (contexto de mensagem) |

---

## 3. Análise por Componente

### 3.1 AuthContext

| Aspecto | Status | Observação |
|---------|--------|------------|
| `people` como tabela de identidade | ✅ | Correto |
| `auth_user_id` como FK para auth.users | ✅ | Correto |
| `tenant_memberships` com `person_id` | ✅ | Correto |
| `role_assignments` consultado corretamente | ✅ | Correto |
| `is_admin_master` calculado | ✅ | Correto |
| `tenant_id` carregado | ✅ | Correto |

**Conclusão:** AuthContext está alinhado com V2.1.

### 3.2 ProtectedRoute

| Aspecto | Status | Observação |
|---------|--------|------------|
| `allowedRoles` | ⚠️ | Usa roles legadas (`candidato`, `empresa`, `admin`) |
| `requireAdminMaster` | ✅ | Implementado corretamente |
| `requireTenantAccess` | ✅ | Implementado corretamente |

**Conclusão:** ProtectedRoute funciona, mas precisa atualizar os roles de referência.

### 3.3 App.tsx (Rotas)

| Rota | Status | Observação |
|------|--------|------------|
| `/dashboard/*` | ✅ | Usa roles corretos (`admin_master`, `tenant_admin`, etc.) |
| `/dashboard/candidato` | ❌ | Usa `candidato` e `admin` (legacy) |
| `/dashboard/empresa` | ❌ | Usa `empresa` e `admin` (legacy) |

**Conclusão:** Rotas de dashboard precisam ser atualizadas.

### 3.4 Dashboard.tsx

| Aspecto | Status | Observação |
|---------|--------|------------|
| `role === 'admin'` | ❌ | Role `admin` não existe |
| `role === 'candidato'` | ❌ | Role `candidato` não existe |
| `role === 'empresa'` | ❌ | Role `empresa` não existe |

**Conclusão:** Dashboard precisa ser refatorado para usar permissions ou roles V2.1.

### 3.5 Login.tsx

| Aspecto | Status | Observação |
|---------|--------|------------|
| `getDashboardPath(role)` | ❌ | Mapeia roles legadas para paths |
| `role === 'candidato'` | ❌ | Role legada |
| `role === 'empresa'` | ❌ | Role legada |

**Conclusão:** Login precisa ser atualizado para usar roles V2.1 ou permissions.

### 3.6 BottomNavigation.tsx

| Aspecto | Status | Observação |
|---------|--------|------------|
| `profile?.role === 'admin'` | ❌ | Role legada |
| `profile?.role === 'empresa'` | ❌ | Role legada |
| `candidateNavItems` | ⚠️ | Nome OK, mas precisa de role correta |

**Conclusão:** Navegação precisa ser atualizada.

### 3.7 Mock Data

| Arquivo | Status | Observação |
|---------|--------|------------|
| `src/mock/vagas.ts` | ✅ | Dados de vagas, sem referência a roles |
| `src/mock/services.ts` | ✅ | Dados de serviços, sem referência a roles |
| `src/mock/clients.ts` | ✅ | Dados de clientes, sem referência a roles |
| `src/mock/testimonials.ts` | ✅ | Dados de depoimentos, sem referência a roles |
| `src/config/seoPages.ts` | ✅ | URLs públicas, OK |
| `src/config/whatsappMessages.ts` | ✅ | Contexto de mensagem, OK |

**Conclusão:** Mock data está OK.

### 3.8 Chat

| Arquivo | Status | Observação |
|---------|--------|------------|
| `src/components/ui/ChatWidget.tsx` | ✅ | Usa `message.role` (user/assistant), não role de sistema |
| `src/components/ui/HumanChatWidget.tsx` | ✅ | Usa `message.role` (user/assistant), não role de sistema |

**Conclusão:** Chat está OK.

---

## 4. Backend / Supabase Queries

### 4.1 AuthContext (queries)

| Query | Status | Observação |
|-------|--------|------------|
| `supabase.from('people').select('*').eq('auth_user_id', authUserId)` | ✅ | Correto |
| `supabase.from('tenant_memberships').select('tenant_id').eq('person_id', personData.id)` | ✅ | Correto |
| `supabase.from('people').update(...).eq('auth_user_id', user.id)` | ✅ | Correto |

### 4.2 Outras queries no código

Não encontramos queries diretas a:
- `profiles`
- `company_relationship_id`
- `tenant_membership_id`
- `actor_person_id`
- `notification_preferences`
- `role_resource_permissions`
- `talent_pool_memberships`

**Conclusão:** Backend queries estão conformes.

---

## 5. Matriz de Conformidade

| Componente | Conforme | Não Conforme | Observação |
|------------|----------|--------------|------------|
| AuthContext | ✅ | — | 100% alinhado |
| ProtectedRoute | ⚠️ | allowedRoles usa roles legadas | Precisa atualizar |
| App.tsx rotas | ⚠️ | `/dashboard/candidato`, `/dashboard/empresa` | Atualizar roles |
| Dashboard.tsx | ❌ | Usa `candidato`, `empresa`, `admin` | Refatorar para permissions |
| Login.tsx | ❌ | Usa `candidato`, `empresa` | Atualizar mapeamento |
| BottomNavigation.tsx | ❌ | Usa `admin`, `empresa` | Atualizar roles |
| Mock data | ✅ | — | OK |
| Chat | ✅ | — | OK |
| Supabase queries | ✅ | — | OK |

---

## 6. Ações Corretivas Necessárias

### 6.1 Bloqueadores (dry-run)

1. **Dashboard.tsx** — Remover referências a `candidato`, `empresa`, `admin`. Usar permissions (`candidates.read`, `companies.read`, `jobs.read`) ou roles V2.1 (`tenant_admin`, `rh_manager`, `recruiter`, `viewer`).
2. **App.tsx** — Atualizar rotas `/dashboard/candidato` e `/dashboard/empresa` para usar roles V2.1 ou remover rotas específicas.
3. **Login.tsx** — Atualizar `getDashboardPath` para usar roles V2.1.

### 6.2 Não bloqueadores

4. **ProtectedRoute.tsx** — `allowedRoles` pode continuar funcionando, mas deve receber roles V2.1.
5. **BottomNavigation.tsx** — Atualizar condições de role.
6. **constants/colors.ts** — Atualizar `admin` para `admin_master` ou remover hardcoded.
7. **types/common.ts** — `candidato` como categoria é OK (domínio), mas documentar.

---

## 7. Checkpoint

```text
FRONTEND
├── AuthContext           ✅
├── ProtectedRoute        ⚠️  allowedRoles legados
├── App.tsx               ⚠️  rotas legacy
├── Dashboard.tsx         ❌  roles legados
├── Login.tsx             ❌  roles legados
├── BottomNavigation.tsx  ❌  roles legados
└── Mock/Chat/Config      ✅

BACKEND
└── Supabase queries      ✅

DRY-RUN
❌ BLOQUEADO por frontend contract
```

---

## 8. Próximo Passo

Corrigir as referências legadas no frontend antes de executar o dry-run.

Especificamente:
1. Atualizar `Dashboard.tsx`
2. Atualizar `App.tsx`
3. Atualizar `Login.tsx`
4. Atualizar `BottomNavigation.tsx`
5. Atualizar `ProtectedRoute.tsx` (se necessário)
