# C2.1 — Administração & Identity — Matriz de Implementação

## Objetivo

Mapear todas as entidades do domínio de Administração & Identity antes de implementar qualquer página.

## Entidades mapeadas

| Tabela                     | Tela               | CRUD    | Tenant | Role                             | Permission                                                                          | RLS | Repository                   |
| -------------------------- | ------------------ | ------- | ------ | -------------------------------- | ----------------------------------------------------------------------------------- | --- | ---------------------------- |
| `people`                   | Usuários           | C/R/U   | ✅     | admin_master / tenant_admin / RH | `people.read`, `people.create`, `people.update`, `people.disable`                   | ✅  | `UsersRepository` ✅         |
| `tenants`                  | Tenants            | R       | ✅     | admin_master                     | `tenants.read`, `tenants.create`, `tenants.update`, `tenants.delete`                | ✅  | `TenantRepository` ❌        |
| `tenant_memberships`       | Membros do Tenant  | C/R/U   | ✅     | tenant_admin / admin_master      | `tenant_memberships.read`, `tenant_memberships.create`, `tenant_memberships.update` | ✅  | ❌                           |
| `roles`                    | Roles & Permissões | C/R/U/D | ✅     | admin_master                     | `roles.read`, `roles.create`, `roles.update`, `roles.delete`                        | ✅  | `RoleRepository` ❌          |
| `permissions`              | Roles & Permissões | R       | ✅     | admin_master                     | `permissions.read`                                                                  | ✅  | `PermissionRepository` ❌    |
| `role_assignments`         | Membros do Tenant  | C/R/U   | ✅     | tenant_admin / admin_master      | `role_assignments.read`, `role_assignments.create`, `role_assignments.update`       | ✅  | ❌                           |
| `role_permissions`         | Roles & Permissões | C/R/U/D | ✅     | admin_master                     | `role_permissions.*`                                                                | ✅  | ❌                           |
| `first_login_state`        | — (contexto)       | U       | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `legal_acceptances`        | LGPD / Termos      | R       | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `sessions`                 | Sessões            | R/D     | ✅     | admin_master / security_manager  | `sessions.read`, `sessions.revoke`                                                  | ✅  | ❌                           |
| `security_events`          | Segurança          | R       | ✅     | security_manager / admin_master  | `security_events.read`                                                              | ✅  | `SecurityEventRepository` ❌ |
| `audit_logs`               | Auditoria          | R       | ✅     | admin_master                     | `audit.read`, `audit.export`                                                        | ✅  | `AuditLogRepository` ❌      |
| `domain_events`            | Auditoria          | R       | ✅     | admin_master / tenant_admin      | `domain_events.read`                                                                | ✅  | ❌                           |
| `notifications`            | Notificações       | R       | ✅     | —                                | `notifications.read`                                                                | ✅  | `NotificationRepository` ❌  |
| `notification_deliveries`  | —                  | R       | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `notification_preferences` | —                  | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `consents`                 | LGPD               | C/R     | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `privacy_requests`         | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `data_export_requests`     | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `data_deletion_requests`   | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           |
| `password_policies`        | Segurança          | R/U     | ✅     | it_admin / security_manager      | `password_policies.read`, `password_policies.update`                                | ✅  | ❌                           |
| `tenant_settings`          | Configurações      | R/U     | ✅     | tenant_admin                     | `tenant.manage`                                                                     | ✅  | ❌                           |

## Estado atual do frontend

| Entidade             | Página                    | Repository           | CRUD |
| -------------------- | ------------------------- | -------------------- | ---- |
| `people`             | `Usuarios.tsx`            | `UsersRepository` ✅ | R    |
| `tenants`            | `TenantsPage.tsx`         | direto no componente | R    |
| `roles`              | `RolesPermissoesPage.tsx` | direto no componente | R    |
| `permissions`        | `RolesPermissoesPage.tsx` | direto no componente | R    |
| `role_permissions`   | `RbacAuditPage.tsx`       | direto no componente | R    |
| `role_assignments`   | `RbacAuditPage.tsx`       | direto no componente | R    |
| `tenant_memberships` | —                         | ❌                   | ❌   |
| `domain_events`      | `AuditoriaPage.tsx`       | direto no componente | R    |
| `notifications`      | `NotificationsPage.tsx`   | direto no componente | R    |
| `legal_acceptances`  | `LgpdPage.tsx`            | direto no componente | R    |

## Prioridade de implementação

### Alta

1. `TenantRepository` — CRUD de tenants com tenant_id
2. `RoleRepository` — CRUD de roles
3. `PermissionRepository` — listagem de permissions
4. Atualizar `Usuarios.tsx` para CRUD completo de `people`
5. Página de membros do tenant (`tenant_memberships` + `role_assignments`)

### Média

6. `SecurityEventRepository` — listagem de `security_events`
7. `AuditLogRepository` — listagem de `audit_logs`
8. Página de sessões (`sessions`)
9. Página de configurações (`tenant_settings`)

### Baixa

10. LGPD completo (`consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`)
11. `notification_deliveries` e `notification_preferences`
12. `password_policies`

## Regras de implementação

1. **Toda query respeita `tenant_id`** quando a role for tenant-scoped.
2. **Admin master** pode consultar globalmente quando a policy permitir.
3. **Nunca retornar senha, token ou dados sensíveis** em logs ou payloads.
4. **Repositories sempre recebem `tenantId`** e aplicam filtro via RLS + query.
5. **Páginas não inventam permissões**: usam apenas as permissões já seedadas no Cloud.
6. **Atualizar tipos TypeScript** antes de implementar repositories.

## Próximos passos

1. Criar tipos TypeScript para entidades faltantes.
2. Criar repositories/supabase基盤 para cada entidade.
3. Atualizar páginas existentes para usar repositories.
4. Implementar CRUDs faltantes.
5. Validar typecheck/build.
