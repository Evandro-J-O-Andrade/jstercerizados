# C2.1 — Administração & Identity — Matriz de Implementação

## Objetivo

Mapear todas as entidades do domínio de Administração & Identity antes de implementar qualquer página.

## Entidades mapeadas

| Tabela                     | Tela               | CRUD    | Tenant | Role                             | Permission                                                                          | RLS | Repository                   | Status   |
| -------------------------- | ------------------ | ------- | ------ | -------------------------------- | ----------------------------------------------------------------------------------- | --- | ---------------------------- | -------- |
| `people`                   | Usuários           | C/R/U   | ✅     | admin_master / tenant_admin / RH | `people.read`, `people.create`, `people.update`, `people.disable`                   | ✅  | `UsersRepository` ✅         | Fechado  |
| `tenants`                  | Tenants            | C/R/U/D | ✅     | admin_master                     | `tenants.read`, `tenants.create`, `tenants.update`, `tenants.delete`                | ✅  | `TenantRepository` ✅        | Fechado  |
| `tenant_memberships`       | Membros do Tenant  | C/R/U   | ✅     | tenant_admin / admin_master      | `tenant_memberships.read`, `tenant_memberships.create`, `tenant_memberships.update` | ✅  | ❌                           | Backlog  |
| `roles`                    | Roles & Permissões | C/R/U/D | ✅     | admin_master                     | `roles.read`, `roles.create`, `roles.update`, `roles.delete`                        | ✅  | `RoleRepository` ✅          | Fechado  |
| `permissions`              | Roles & Permissões | C/R/U   | ✅     | admin_master                     | `permissions.read`, `permissions.create`                                            | ✅  | `PermissionRepository` ✅    | Fechado  |
| `role_assignments`         | Membros do Tenant  | C/R/U   | ✅     | tenant_admin / admin_master      | `role_assignments.read`, `role_assignments.create`, `role_assignments.update`       | ✅  | ❌                           | Backlog  |
| `role_permissions`         | Roles & Permissões | C/R/U/D | ✅     | admin_master                     | `role_permissions.*`                                                                | ✅  | ❌                           | Backlog  |
| `first_login_state`        | — (contexto)       | U       | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Contexto |
| `legal_acceptances`        | LGPD / Termos      | R       | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Contexto |
| `sessions`                 | Sessões            | R/D     | ✅     | admin_master / security_manager  | `sessions.read`, `sessions.revoke`                                                  | ✅  | ❌                           | Fechado  |
| `security_events`          | Segurança          | R       | ✅     | security_manager / admin_master  | `security_events.read`                                                              | ✅  | `SecurityEventRepository` ✅ | Fechado  |
| `audit_logs`               | Auditoria          | R       | ✅     | admin_master                     | `audit.read`, `audit.export`                                                        | ✅  | `AuditLogRepository` ✅      | Fechado  |
| `domain_events`            | Auditoria          | R       | ✅     | admin_master / tenant_admin      | `domain_events.read`                                                                | ✅  | ❌                           | Fechado  |
| `notifications`            | Notificações       | R       | ✅     | —                                | `notifications.read`                                                                | ✅  | `NotificationRepository` ✅  | Fechado  |
| `notification_deliveries`  | —                  | R       | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `notification_preferences` | —                  | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `consents`                 | LGPD               | C/R     | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `privacy_requests`         | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `data_export_requests`     | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `data_deletion_requests`   | LGPD               | C/R/U   | ✅     | —                                | —                                                                                   | ✅  | ❌                           | Backlog  |
| `password_policies`        | Segurança          | R/U     | ✅     | it_admin / security_manager      | `password_policies.read`, `password_policies.update`                                | ✅  | ❌                           | Backlog  |
| `tenant_settings`          | Configurações      | R/U     | ✅     | tenant_admin                     | `tenant.manage`                                                                     | ✅  | ❌                           | Backlog  |

## Estado atual do frontend

| Entidade          | Página                    | Repository                   | CRUD    | Status  |
| ----------------- | ------------------------- | ---------------------------- | ------- | ------- |
| `people`          | `Usuarios.tsx`            | `UsersRepository` ✅         | R       | Fechado |
| `tenants`         | `TenantsPage.tsx`         | `TenantRepository` ✅        | C/R/U/D | Fechado |
| `roles`           | `RolesPermissoesPage.tsx` | `RoleRepository` ✅          | C/R/U/D | Fechado |
| `permissions`     | `RolesPermissoesPage.tsx` | `PermissionRepository` ✅    | C/R     | Fechado |
| `security_events` | `SegurancaPage.tsx`       | `SecurityEventRepository` ✅ | R       | Fechado |
| `audit_logs`      | `AuditoriaPage.tsx`       | `AuditLogRepository` ✅      | R       | Fechado |
| `notifications`   | `NotificationsPage.tsx`   | `NotificationRepository` ✅  | R       | Fechado |
| `sessions`        | `SessoesPage.tsx`         | ❌                           | R/D     | Fechado |

## Itens fechados em C2.1

- [x] Matriz de implementação documentada
- [x] Tipos TypeScript criados para entidades do domínio
- [x] Repositories criados: `tenant`, `role`, `permission`, `security`, `audit`, `notification`
- [x] Página `Usuarios.tsx` com busca, filtros e ações
- [x] Página `TenantsPage.tsx` com CRUD completo via repository
- [x] Página `RolesPermissoesPage.tsx` com CRUD de roles e permissões
- [x] Página `SegurancaPage.tsx` com roles + security events
- [x] Página `AuditoriaPage.tsx` com audit_logs + security_events
- [x] Página `NotificationsPage.tsx` com NotificationRepository
- [x] Página `SessoesPage.tsx` com listagem e revogação
- [x] Rotas registradas no `ModuleRegistry` e `App.tsx`

## Backlog após C2.1

- `tenant_memberships` — página de membros do tenant
- `role_assignments` — CRUD via página de membros
- `role_permissions` — vinculação role/permission
- `notification_deliveries` e `notification_preferences`
- `consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`
- `password_policies`
- `tenant_settings`

## Próximos passos

1. Validar typecheck/build.
2. Considerar C2.1 concluída.
3. Iniciar C2.2 — RH.
