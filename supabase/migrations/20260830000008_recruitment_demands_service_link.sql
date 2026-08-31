-- =============================================================================
-- FASE 4 — Serviços: vincular `recruitment_demands` ao catálogo `services`
-- =============================================================================
-- Adiciona `service_id` em `recruitment_demands` para ligar demanda de RH
-- ao serviço do catálogo (ex: Limpeza → 10 Auxiliares de Limpeza).
-- =============================================================================

-- 1. service_id em recruitment_demands
ALTER TABLE public.recruitment_demands
  ADD COLUMN IF NOT EXISTS service_id uuid;

-- 2. FK idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'recruitment_demands_service_id_fkey'
      AND table_name = 'recruitment_demands'
  ) THEN
    ALTER TABLE public.recruitment_demands
      ADD CONSTRAINT recruitment_demands_service_id_fkey
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índice
CREATE INDEX IF NOT EXISTS idx_recruitment_demands_service_id
  ON public.recruitment_demands (service_id)
  WHERE service_id IS NOT NULL;

COMMENT ON COLUMN public.recruitment_demands.service_id IS
  'Serviço do catálogo que originou a demanda de recrutamento (reconciliado).';
