-- ============================================================================
-- AUDITORIA: Identidade ROOT global vs Tenant — J&S Empregos LTDA
-- Projeto: okxqfyoqbhcmflpurfrw | Modo: somente leitura
-- ============================================================================
-- Substitua <person_id> pelo ID da pessoa do usuário (obtido via people.auth_user_id)
-- ============================================================================

-- 1. Quem é o usuário: pessoa vinculada ao auth.users
SELECT id, auth_user_id, full_name, email, phone, status, created_at
FROM public.people
WHERE auth_user_id = '<auth_user_id_do_usuario>';

-- 2. Todas as role_assignments do usuário (com escopo do role)
SELECT ra.id, ra.person_id, ra.role_id, ra.tenant_id, ra.assigned_at, ra.expires_at,
       r.name AS role_name, r.scope AS role_scope, r.is_global
FROM public.role_assignments ra
JOIN public.roles r ON r.id = ra.role_id
WHERE ra.person_id = '<person_id>'
ORDER BY ra.assigned_at DESC;

-- 3. Existe role admin_master com escopo global?
SELECT id, name, scope, is_global, description
FROM public.roles
WHERE name = 'admin_master';

-- 4. O usuário tem admin_master com tenant_id IS NULL (assignment global)?
SELECT ra.id, ra.person_id, ra.role_id, ra.tenant_id, ra.assigned_at, ra.expires_at,
       r.name AS role_name, r.scope AS role_scope
FROM public.role_assignments ra
JOIN public.roles r ON r.id = ra.role_id
WHERE ra.person_id = '<person_id>'
  AND r.name = 'admin_master';

-- 5. Todos os tenants e memberships ativas do usuário
SELECT m.id, m.person_id, m.tenant_id, m.membership_role, m.status, m.joined_at,
       t.name AS tenant_name, t.slug AS tenant_slug
FROM public.tenant_memberships m
JOIN public.tenants t ON t.id = m.tenant_id
WHERE m.person_id = '<person_id>'
ORDER BY m.created_at DESC;

-- 6. O usuário tem membership ativa no tenant J&S?
SELECT m.id, m.person_id, m.tenant_id, m.membership_role, m.status,
       t.name AS tenant_name
FROM public.tenant_memberships m
JOIN public.tenants t ON t.id = m.tenant_id
WHERE m.person_id = '<person_id>'
  AND m.status = 'active'
  AND (t.name ILIKE '%J&S%' OR t.slug ILIKE '%js%');

-- 7. Quais roles globais existem no sistema (para comparar)
SELECT id, name, scope, is_global
FROM public.roles
WHERE scope = 'global'
ORDER BY name;

-- 8. Qual tenant está definido como current no contexto (se houver tabela de sessão/contexto)
--    Esta consulta depende do esquema específico; ajustar se necessário
-- SELECT * FROM public.user_sessions WHERE person_id = '<person_id>';

-- ============================================================================
-- INTERPRETAÇÃO ESPERADA:
--
-- Se a consulta 3 retornar admin_master com scope='global' MAS a consulta 4
-- não retornar nenhuma linha com tenant_id IS NULL, então o usuário tem o papel
-- admin_master mas NÃO tem uma assignment global. O papel está vinculado a um
-- tenant específico, então isAdminMaster = false no DispatcherMaster.
--
-- Se a consulta 4 retornar admin_master com tenant_id IS NULL, então o usuário
-- tem autoridade ROOT global e o DispatcherMaster deve retornar /dashboard/global.
--
-- Se a consulta 5 mostrar membership ativa apenas no tenant J&S, o contexto
-- atual é tenant-scoped, não global.
-- ============================================================================
