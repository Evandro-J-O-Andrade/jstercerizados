-- =============================================================================
-- FASE 1 — Core / CRM: alinhar relacionamentos empresariais ao contrato canônico
-- =============================================================================
-- Esta migration expande o schema real sem destruir dados existentes.
-- Mantém `companies.tenant_id` por enquanto e adiciona os relacionamentos
-- tenant-scoped que faltam para o modelo canônico.
-- =============================================================================

-- 1. company_relationship_types
-- Tabela de domínio para tipos de relacionamento empresarial.
CREATE TABLE IF NOT EXISTS public.company_relationship_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.company_relationship_types IS
  'Catálogo de tipos de relacionamento entre empresas e tenants (cliente, fornecedor, parceiro, etc).';

-- 2. company_relationships — colunas adicionais do canônico
ALTER TABLE public.company_relationships
  ADD COLUMN IF NOT EXISTS relationship_type_id  uuid,
  ADD COLUMN IF NOT EXISTS started_at            date,
  ADD COLUMN IF NOT EXISTS ended_at              date,
  ADD COLUMN IF NOT EXISTS metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by            uuid,
  ADD COLUMN IF NOT EXISTS created_at            timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at            timestamptz NOT NULL DEFAULT now();

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_company_relationships_company_id
  ON public.company_relationships (company_id);

CREATE INDEX IF NOT EXISTS idx_company_relationships_tenant_id
  ON public.company_relationships (tenant_id);

CREATE INDEX IF NOT EXISTS idx_company_relationships_relationship_type_id
  ON public.company_relationships (relationship_type_id);

-- FK para catálogo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'company_relationships_relationship_type_id_fkey'
      AND table_name = 'company_relationships'
  ) THEN
    ALTER TABLE public.company_relationships
      ADD CONSTRAINT company_relationships_relationship_type_id_fkey
      FOREIGN KEY (relationship_type_id)
      REFERENCES public.company_relationship_types (id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3. RLS em company_relationship_types
ALTER TABLE public.company_relationship_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_relationship_types_read ON public.company_relationship_types;
CREATE POLICY company_relationship_types_read
  ON public.company_relationship_types
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
    )
  );

DROP POLICY IF EXISTS company_relationship_types_admin ON public.company_relationship_types;
CREATE POLICY company_relationship_types_admin
  ON public.company_relationship_types
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 4. RLS em company_relationships
DROP POLICY IF EXISTS company_relationships_read ON public.company_relationships;
CREATE POLICY company_relationships_read
  ON public.company_relationships
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
    )
  );

DROP POLICY IF EXISTS company_relationships_admin ON public.company_relationships;
CREATE POLICY company_relationships_admin
  ON public.company_relationships
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 5. Seed mínimo de tipos de relacionamento
INSERT INTO public.company_relationship_types (code, name, description)
VALUES
  ('client', 'Cliente', 'Empresa cliente da J&S'),
  ('supplier', 'Fornecedor', 'Empresa fornecedora da J&S'),
  ('partner', 'Parceiro', 'Empresa parceira da J&S'),
  ('candidate_company', 'Empresa de candidato', 'Empresa onde o candidato trabalhou/cliente')
ON CONFLICT (code) DO NOTHING;
