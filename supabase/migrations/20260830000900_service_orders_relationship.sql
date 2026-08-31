-- =============================================================================
-- FASE 4 — Serviços: `service_orders` referência operacional
-- =============================================================================
-- Adiciona `company_relationship_id` e índice em `service_orders`.
-- =============================================================================

-- 1. company_relationship_id em service_orders
ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS company_relationship_id uuid;

-- 2. FK idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'service_orders_company_relationship_id_fkey'
      AND table_name = 'service_orders'
  ) THEN
    ALTER TABLE public.service_orders
      ADD CONSTRAINT service_orders_company_relationship_id_fkey
      FOREIGN KEY (company_relationship_id) REFERENCES public.company_relationships(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índice
CREATE INDEX IF NOT EXISTS idx_service_orders_company_relationship_id
  ON public.service_orders (company_relationship_id)
  WHERE company_relationship_id IS NOT NULL;

COMMENT ON COLUMN public.service_orders.company_relationship_id IS
  'Relação comercial responsável pela ordem de serviço (reconciliado).';
