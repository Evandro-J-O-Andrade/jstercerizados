-- =============================================================================
-- FASE 4 — Serviços: relacionamento `company_services` ↔ `services`
-- =============================================================================
-- Adiciona FK para `services` e índices em `company_services`.
-- =============================================================================

-- 1. service_id em company_services
ALTER TABLE public.company_services
  ADD COLUMN IF NOT EXISTS service_id uuid;

-- 2. FK idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'company_services_service_id_fkey'
      AND table_name = 'company_services'
  ) THEN
    ALTER TABLE public.company_services
      ADD CONSTRAINT company_services_service_id_fkey
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_company_services_service_id
  ON public.company_services (service_id)
  WHERE service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_company_services_company_id
  ON public.company_services (company_id);

COMMENT ON COLUMN public.company_services.service_id IS
  'Serviço do catálogo associado (reconciliado).';
