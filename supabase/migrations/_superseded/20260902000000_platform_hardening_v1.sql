-- =============================================================================
-- PLATFORM HARDENING + CMS + MEDIA + IDENTITY v1
-- =============================================================================
-- Data:           2026-09-02
-- Projeto:        J&S Empregos (js-empregos)
-- Project ref:    okxqfyoqbhcmflpurfrw
-- Status:         AGUARDANDO OK EXPLÍCITO para aplicação no Supabase
-- Transaction:    BEGIN … COMMIT (atômico — se qualquer seção falhar, nada
--                 é aplicado)
-- Idempotência:   todo CREATE/ALTER envolvido em IF NOT EXISTS / OR REPLACE /
--                 DO $$ / EXISTS checks
-- Não-destrutivo: NUNCA recria tabelas; NUNCA apaga dados; NUNCA renomeia
--                 colunas; NUNCA cria role 'candidato' (já existe 'candidate')
-- =============================================================================
-- Seções:
--   §01 Identity/RBAC       (utilitária, sem auto-execução)
--   §02 CMS                 (índices faltantes + blog_posts SEO opcional)
--   §03 Media               (entity_type CHECK em media_assets)
--   §04 Forms               (validate/normalize CNPJ/CPF)
--   §05 FKs                 (relatório documentado — sem alterações)
--   §06 RLS                 (policies em tenants + company_relationship_types)
--   §07 Security            (search_path + EXECUTE em 9 funções)
--   §08 Integration         (emit_domain_event + índice em event_outbox)
-- =============================================================================

BEGIN;

-- =============================================================================
-- §01 — IDENTITY / RBAC
-- =============================================================================
-- Cadeia canônica:
--   auth.users → people → tenant_memberships → role_assignments → candidate
-- Problema conhecido (da SUPABASE GATE 2026-09-02):
--   6 people sem membership ativo
--   9 people sem role assignment
--   3 candidates sem membership
--   4 candidates sem role 'candidate'
--
-- Esta seção cria APENAS uma função utilitária, MANUAL, para reparar a
-- cadeia. Ela NÃO é executada automaticamente.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.repair_candidate_chain(
  p_person_id uuid,
  p_tenant_id uuid DEFAULT NULL,
  p_role_code text DEFAULT 'candidate'
)
RETURNS TABLE (
  person_id             uuid,
  tenant_membership_id  uuid,
  role_assignment_id    uuid,
  candidate_id          uuid,
  created_membership    boolean,
  created_assignment    boolean,
  created_candidate     boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tenant_membership_id uuid;
  v_role_assignment_id   uuid;
  v_candidate_id         uuid;
  v_role_id              uuid;
  v_resolved_tenant_id   uuid;
  v_created_membership   boolean := false;
  v_created_assignment   boolean := false;
  v_created_candidate    boolean := false;
BEGIN
  -- 1) pessoa precisa existir
  IF NOT EXISTS (SELECT 1 FROM public.people WHERE id = p_person_id) THEN
    RAISE EXCEPTION 'repair_candidate_chain: person % não encontrada', p_person_id;
  END IF;

  -- 2) resolver tenant (argumento tem prioridade, senão pega o primeiro ativo)
  IF p_tenant_id IS NOT NULL THEN
    v_resolved_tenant_id := p_tenant_id;
  ELSE
    SELECT tm.tenant_id INTO v_resolved_tenant_id
    FROM public.tenant_memberships tm
    WHERE tm.person_id = p_person_id
      AND tm.status = 'active'
    ORDER BY tm.joined_at DESC NULLS LAST
    LIMIT 1;
  END IF;

  IF v_resolved_tenant_id IS NULL THEN
    RAISE EXCEPTION 'repair_candidate_chain: nenhum tenant resolvido para person %', p_person_id;
  END IF;

  -- 3) garantir tenant_membership (idempotente)
  SELECT id INTO v_tenant_membership_id
  FROM public.tenant_memberships
  WHERE person_id = p_person_id
    AND tenant_id = v_resolved_tenant_id;

  IF v_tenant_membership_id IS NULL THEN
    INSERT INTO public.tenant_memberships (person_id, tenant_id, status, joined_at)
    VALUES (p_person_id, v_resolved_tenant_id, 'active', now())
    RETURNING id INTO v_tenant_membership_id;
    v_created_membership := true;
  END IF;

  -- 4) garantir role_assignment (idempotente)
  SELECT id INTO v_role_id
  FROM public.roles
  WHERE code = p_role_code
  LIMIT 1;

  IF v_role_id IS NOT NULL THEN
    SELECT id INTO v_role_assignment_id
    FROM public.role_assignments
    WHERE person_id = p_person_id
      AND role_id = v_role_id
      AND (tenant_id = v_resolved_tenant_id OR tenant_id IS NULL);

    IF v_role_assignment_id IS NULL THEN
      INSERT INTO public.role_assignments (person_id, role_id, tenant_id, assigned_at)
      VALUES (p_person_id, v_role_id, v_resolved_tenant_id, now())
      RETURNING id INTO v_role_assignment_id;
      v_created_assignment := true;
    END IF;
  END IF;

  -- 5) garantir candidate (idempotente)
  SELECT id INTO v_candidate_id
  FROM public.candidates
  WHERE person_id = p_person_id
    AND tenant_id = v_resolved_tenant_id;

  IF v_candidate_id IS NULL THEN
    INSERT INTO public.candidates (person_id, tenant_id, status)
    VALUES (p_person_id, v_resolved_tenant_id, 'active')
    RETURNING id INTO v_candidate_id;
    v_created_candidate := true;
  END IF;

  RETURN QUERY
  SELECT p_person_id, v_tenant_membership_id, v_role_assignment_id,
         v_candidate_id, v_created_membership, v_created_assignment, v_created_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) TO service_role;
COMMENT ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) IS
  'Utilitária de reparo da cadeia auth.users → people → tenant_memberships → role_assignments → candidate. NÃO é executada automaticamente. Use SELECT repair_candidate_chain(''<person_id>''::uuid) para diagnosticar e reparar manualmente um registro.';

-- =============================================================================
-- §02 — CMS (fechar publicação / SEO / ordenação)
-- =============================================================================
-- Ações conservadoras:
--   - jobs: índice composto para listagem pública (status + published_at desc)
--   - blog_posts: colunas SEO opcionais (somente se a tabela existir)
-- =============================================================================

-- 2.1 jobs: índice composto (somente se faltar)
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_published
  ON public.jobs (tenant_id, status, published_at DESC)
  WHERE status = 'published';

-- 2.2 blog_posts: SEO (somente se a tabela existir)
DO $$
BEGIN
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.blog_posts
             ADD COLUMN IF NOT EXISTS seo_title       varchar(70),
             ADD COLUMN IF NOT EXISTS seo_description varchar(160)';
  END IF;
END $$;

-- =============================================================================
-- §03 — MEDIA (padronização do contrato)
-- =============================================================================
-- Ações:
--   - media_assets: CHECK constraint de entity_type (se a tabela existir e
--     ainda não houver)
--   - bucket services-images: marcado como deprecated em comentário
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.media_assets') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.media_assets'::regclass
        AND conname  = 'media_assets_entity_type_check'
    ) THEN
      EXECUTE $SQL$
        ALTER TABLE public.media_assets
        ADD CONSTRAINT media_assets_entity_type_check
        CHECK (entity_type IN (
          'service', 'company', 'job', 'blog_post', 'page',
          'avatar', 'document',
          'candidate_document', 'employee_document'
        ))
      $SQL$;
    END IF;
  END IF;
END $$;

-- bucket legado: comentário de deprecation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'services-images') THEN
    EXECUTE $SQL$
      COMMENT ON COLUMN storage.buckets.name IS
      'DEPRECATED: bucket services-images é legado. Use public-media (10MB, image/*) para novas features. services-images existe apenas para não quebrar URLs históricas.'
    $SQL$;
  END IF;
END $$;

-- =============================================================================
-- §04 — FORMS (validate / normalize CNPJ / CPF)
-- =============================================================================
-- NÃO aplica retroativamente em colunas existentes. Apenas cria funções
-- reusáveis para uso em policies, triggers e validação no backend.
-- =============================================================================

-- 4.1 normalize_cnpj(text) → text (somente dígitos, ou NULL se entrada vazia)
CREATE OR REPLACE FUNCTION public.normalize_cnpj(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_value IS NULL OR btrim(p_value) = '' THEN NULL
    ELSE regexp_replace(p_value, '[^0-9]', '', 'g')
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_cnpj(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_cnpj(text) TO service_role;

-- 4.2 normalize_cpf(text) → text
CREATE OR REPLACE FUNCTION public.normalize_cpf(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_value IS NULL OR btrim(p_value) = '' THEN NULL
    ELSE regexp_replace(p_value, '[^0-9]', '', 'g')
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_cpf(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_cpf(text) TO service_role;

-- 4.3 is_valid_cnpj(text) → boolean (algoritmo dos DV)
CREATE OR REPLACE FUNCTION public.is_valid_cnpj(p_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_digits text;
  v_d1 int; v_d2 int; v_sum int; v_rest int;
  v_i int;
  v_weights1 int[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  v_weights2 int[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  v_digits := public.normalize_cnpj(p_value);
  IF v_digits IS NULL OR length(v_digits) <> 14 THEN
    RETURN false;
  END IF;
  IF v_digits ~ '^(.)\1{13}$' THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..12 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * v_weights1[v_i];
  END LOOP;
  v_rest := v_sum % 11;
  v_d1 := CASE WHEN v_rest < 2 THEN 0 ELSE 11 - v_rest END;
  IF v_d1 <> (substring(v_digits, 13, 1))::int THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..13 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * v_weights2[v_i];
  END LOOP;
  v_rest := v_sum % 11;
  v_d2 := CASE WHEN v_rest < 2 THEN 0 ELSE 11 - v_rest END;
  IF v_d2 <> (substring(v_digits, 14, 1))::int THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_cnpj(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cnpj(text) TO service_role;

-- 4.4 is_valid_cpf(text) → boolean (algoritmo dos DV)
CREATE OR REPLACE FUNCTION public.is_valid_cpf(p_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_digits text;
  v_d1 int; v_d2 int; v_sum int; v_rest int;
  v_i int;
BEGIN
  v_digits := public.normalize_cpf(p_value);
  IF v_digits IS NULL OR length(v_digits) <> 11 THEN
    RETURN false;
  END IF;
  IF v_digits ~ '^(.)\1{10}$' THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..9 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * (11 - v_i);
  END LOOP;
  v_rest := (v_sum * 10) % 11;
  v_d1 := CASE WHEN v_rest = 10 THEN 0 ELSE v_rest END;
  IF v_d1 <> (substring(v_digits, 10, 1))::int THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..10 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * (12 - v_i);
  END LOOP;
  v_rest := (v_sum * 10) % 11;
  v_d2 := CASE WHEN v_rest = 10 THEN 0 ELSE v_rest END;
  IF v_d2 <> (substring(v_digits, 11, 1))::int THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_cpf(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cpf(text) TO service_role;

-- =============================================================================
-- §05 — FKs (RELATÓRIO — nenhuma alteração de schema)
-- =============================================================================
-- Para rodar manualmente no SQL Editor e auditar:
--
--   SELECT
--     tc.table_name   AS from_table,
--     kcu.column_name AS from_column,
--     ccu.table_name  AS to_table,
--     ccu.column_name AS to_column,
--     rc.delete_rule
--   FROM information_schema.table_constraints tc
--   JOIN information_schema.key_column_usage        kcu USING (constraint_name)
--   JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
--   JOIN information_schema.referential_constraints rc USING (constraint_name)
--   WHERE tc.constraint_type = 'FOREIGN KEY'
--     AND ccu.table_name IN (
--       'tenants', 'companies', 'people', 'candidates', 'jobs',
--       'services', 'company_relationships'
--     )
--   ORDER BY ccu.table_name, tc.table_name;
--
-- Esta seção é apenas documentação. Nenhum DDL é emitido.
-- =============================================================================

-- =============================================================================
-- §06 — RLS (policies faltantes em tenants + company_relationship_types)
-- =============================================================================
-- Advisor reportou: RLS ligado mas sem policies nessas duas tabelas.
-- Estratégia: SELECT-only para authenticated (leitura básica do próprio
-- tenant / dos tipos de relacionamento), sem permitir escrita direta.
-- Toda escrita deve passar pelo backend autenticado com service_role.
-- =============================================================================

-- 6.1 tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_member_read ON public.tenants;
CREATE POLICY tenants_member_read
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (public.is_tenant_member(id));

-- 6.2 company_relationship_types (catálogo global, leitura para authenticated)
ALTER TABLE public.company_relationship_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_relationship_types_authenticated_read ON public.company_relationship_types;
CREATE POLICY company_relationship_types_authenticated_read
  ON public.company_relationship_types
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- §07 — SECURITY (search_path + EXECUTE em funções SECURITY DEFINER)
-- =============================================================================
-- Apenas fixa search_path. NÃO mexe em lógica, assinatura ou corpo da
-- função além do SET search_path. Idempotente via CREATE OR REPLACE.
-- =============================================================================

-- 7.1 handle_new_auth_user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_meta jsonb;
  v_full_name text;
  v_email text;
BEGIN
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email := new.email;
  v_full_name := v_meta ->> 'full_name';
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := v_meta ->> 'name';
  END IF;
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := split_part(v_email, '@', 1);
  END IF;

  IF EXISTS (SELECT 1 FROM public.people WHERE auth_user_id = new.id) THEN
    UPDATE public.people
    SET email = new.email,
        full_name = v_full_name
    WHERE auth_user_id = new.id
      AND (email IS DISTINCT FROM new.email
           OR full_name IS DISTINCT FROM v_full_name);
  ELSE
    INSERT INTO public.people (id, auth_user_id, full_name, email, status)
    VALUES (gen_random_uuid(), new.id, v_full_name, v_email, 'active');
  END IF;

  RETURN new;
END;
$$;

-- 7.2 handle_auth_user_updated
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF new.email IS DISTINCT FROM old.email THEN
    UPDATE public.people
    SET email = new.email
    WHERE auth_user_id = new.id;
  END IF;
  RETURN new;
END;
$$;

-- 7.3 handle_auth_user_deleted
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.people
  SET auth_user_id = NULL
  WHERE auth_user_id = old.id;
  RETURN old;
END;
$$;

-- 7.4 is_tenant_member (não recriar corpo — apenas garantir search_path via
-- ALTER FUNCTION, se a função existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='is_tenant_member'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.is_tenant_member(uuid) SET search_path = public, pg_temp';
  END IF;
END $$;

-- 7.5 is_admin_master
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='is_admin_master'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.is_admin_master() SET search_path = public, pg_temp';
  END IF;
END $$;

-- 7.6 user_has_permission (pode ter múltiplas assinaturas; aplica em todas)
DO $$
DECLARE
  v_func record;
BEGIN
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='user_has_permission'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
END $$;

-- 7.7 user_permissions
DO $$
DECLARE
  v_func record;
BEGIN
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='user_permissions'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
END $$;

-- 7.8 user_tenant_ids
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='user_tenant_ids'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.user_tenant_ids() SET search_path = public, pg_temp';
  END IF;
END $$;

-- 7.9 bootstrap_candidate_identity (todas as assinaturas)
DO $$
DECLARE
  v_func record;
BEGIN
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='bootstrap_candidate_identity'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
END $$;

-- =============================================================================
-- §08 — INTEGRATION (emit_domain_event + índice em event_outbox)
-- =============================================================================
-- Estratégia: domain_events já é canônico (vide 20260816000900).
-- Esta seção só:
--   - cria função utilitária emit_domain_event (idempotente, transacional)
--   - cria índice em event_outbox se a tabela existir
--   - NÃO coloca URL/token de webhook no banco (segredo fica no consumer)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.emit_domain_event(
  p_event_name     text,
  p_aggregate_type text,
  p_aggregate_id   uuid,
  p_tenant_id      uuid,
  p_payload        jsonb DEFAULT '{}'::jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO public.domain_events (
    event_name, event_version, aggregate_type, aggregate_id,
    tenant_id, payload, idempotency_key, occurred_at
  ) VALUES (
    p_event_name, 1, p_aggregate_type, p_aggregate_id,
    p_tenant_id, p_payload, p_idempotency_key, now()
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO authenticated;

COMMENT ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) IS
  'Emite evento de domínio gravando em public.domain_events. Use para acionar automações (n8n) via event_outbox/consumer. NÃO armazene webhooks/segredos nesta função.';

-- 8.2 event_outbox: índice (se a tabela existir)
DO $$
BEGIN
  IF to_regclass('public.event_outbox') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname='public' AND tablename='event_outbox'
        AND indexname='idx_event_outbox_processed_created'
    ) THEN
      EXECUTE 'CREATE INDEX idx_event_outbox_processed_created
               ON public.event_outbox (processed_at, created_at)
               WHERE processed_at IS NULL';
    END IF;
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- ROLLBACK PLAN (rodar manualmente, por seção, em caso de falha)
-- =============================================================================
-- §01:  DROP FUNCTION IF EXISTS public.repair_candidate_chain(uuid, uuid, text);
-- §02:  DROP INDEX  IF EXISTS public.idx_jobs_tenant_status_published;
--       (colunas SEO em blog_posts: removidas manualmente após conferir)
-- §03:  ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
--       (comentário de bucket: reescrever manualmente se desejado)
-- §04:  DROP FUNCTION IF EXISTS public.normalize_cnpj(text);
--       DROP FUNCTION IF EXISTS public.normalize_cpf(text);
--       DROP FUNCTION IF EXISTS public.is_valid_cnpj(text);
--       DROP FUNCTION IF EXISTS public.is_valid_cpf(text);
-- §05:  N/A (somente documentação)
-- §06:  DROP POLICY IF EXISTS tenants_member_read                          ON public.tenants;
--       DROP POLICY IF EXISTS company_relationship_types_authenticated_read ON public.company_relationship_types;
-- §07:  (search_path pode ser revertido via ALTER FUNCTION … RESET search_path
--        em cada função listada em §07.1 a §07.9. handle_new_auth_user,
--        handle_auth_user_updated, handle_auth_user_deleted foram regerados
--        com o mesmo corpo — não há perda funcional.)
-- §08:  DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);
--       DROP INDEX  IF EXISTS public.idx_event_outbox_processed_created;
-- =============================================================================
