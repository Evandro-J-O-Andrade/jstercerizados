# C1.5 — Role × Permission Matrix

## Estado

- 20 roles
- 211 permissions
- 668 role_permissions

## Objetivo

Documentar a relação entre roles e permissions para evitar inventar permissão ou papel.

## Roles confirmadas

- admin_master
- tenant_admin
- rh_manager
- finance_manager
- finance
- operations_manager
- recruiter
- billing_manager
- accountant
- commercial
- accounting_manager
- operator
- fiscal_manager
- viewer
- it_admin
- facilities_manager
- lawyer
- stock_manager
- support
- security_manager

## Observação

A matriz detalhada por permissão será extraída do banco.
Por enquanto, manter a regra:
nenhuma permissão pode ser inventada no frontend sem existir em `public.permissions`.
