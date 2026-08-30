-- =============================================================================
-- FASE 1 — Core / CRM: alinhar `companies` ao contrato canônico
-- =============================================================================
-- Esta migration expande `companies` sem destruir dados existentes.
-- Mantém `tenant_id` por compatibilidade com o banco real atual e adiciona
-- apenas colunas/índices/policies que faltam para o modelo canônico.
-- =============================================================================

-- 1. Colunas adicionais em `companies` (apenas se não existirem)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS trading_name         text,
  ADD COLUMN IF NOT EXISTS cnpj                 text,
  ADD COLUMN IF NOT EXISTS cnpj_root            text,
  ADD COLUMN IF NOT EXISTS state_registration   text,
  ADD COLUMN IF NOT EXISTS municipal_registration text,
  ADD COLUMN IF NOT EXISTS company_type_id      uuid,
  ADD COLUMN IF NOT EXISTS industry             text,
  ADD COLUMN IF NOT EXISTS phone                text,
  ADD COLUMN IF NOT EXISTS email                text,
  ADD COLUMN IF NOT EXISTS website              text,
  ADD COLUMN IF NOT EXISTS linkedin_url         text,
  ADD COLUMN IF NOT EXISTS logo_url             text,
  ADD COLUMN IF NOT EXISTS address              jsonb,
  ADD COLUMN IF NOT EXISTS size                 text,
  ADD COLUMN IF NOT EXISTS is_active            boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS metadata             jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by           uuid,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();

-- 2. Índices para performance e RLS
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id
  ON public.companies (tenant_id);

CREATE INDEX IF NOT EXISTS idx_companies_cnpj
  ON public.companies (cnpj)
  WHERE cnpj IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_status
  ON public.companies (status);

CREATE INDEX IF NOT EXISTS idx_companies_company_type_id
  ON public.companies (company_type_id)
  WHERE company_type_id IS NOT NULL;

-- 3. Unique constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'companies_cnpj_key'
      AND table_name = 'companies'
  ) THEN
    ALTER TABLE public.companies
      ADD CONSTRAINT companies_cnpj_key UNIQUE (cnpj);
  END IF;
END $$;

-- 4. RLS em companies (manter compatibilidade com tenant_id atual)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_read ON public.companies;
CREATE POLICY companies_read
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.person_id = (
        SELECT p.id FROM public.people p
        WHERE p.auth_user_id = auth.uid()
      )
      AND tm.status = 'active'
      AND tm.tenant_id = companies.tenant_id
    )
  );

DROP POLICY IF EXISTS companies_admin ON public.companies;
CREATE POLICY companies_admin
  ON public.companies
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 5. Trigger de updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Comentários
COMMENT ON TABLE public.companies IS
  'Empresas do sistema. Mantém tenant_id para compatibilidade com o banco real atual. O escopo multi-tenant é garantido por RLS e company_relationships.';

COMMENT ON COLUMN public.companies.tenant_id IS
  'Tenant proprietário da empresa. Mantido para compatibilidade com o banco real atual.';
