-- =============================================================================
-- FASE 3 — Reconciliação: `recruitment_demands`
-- =============================================================================
-- Adiciona colunas ausentes sem alterar políticas RLS existentes.
-- =============================================================================

ALTER TABLE public.recruitment_demands
  ADD COLUMN IF NOT EXISTS contact_name       text,
  ADD COLUMN IF NOT EXISTS contact_email      text,
  ADD COLUMN IF NOT EXISTS contact_phone      text,
  ADD COLUMN IF NOT EXISTS description        text,
  ADD COLUMN IF NOT EXISTS urgency            text,
  ADD COLUMN IF NOT EXISTS service_type       text,
  ADD COLUMN IF NOT EXISTS responsible_person_id uuid;

CREATE INDEX IF NOT EXISTS idx_recruitment_demands_urgency
  ON public.recruitment_demands (urgency)
  WHERE urgency IS NOT NULL;

COMMENT ON COLUMN public.recruitment_demands.contact_name IS
  'Nome do contato na empresa solicitante (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.contact_email IS
  'E-mail do contato na empresa solicitante (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.contact_phone IS
  'Telefone do contato na empresa solicitante (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.description IS
  'Descrição detalhada da demanda (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.urgency IS
  'Urgência da demanda (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.service_type IS
  'Tipo de serviço solicitado (reconciliado).';

COMMENT ON COLUMN public.recruitment_demands.responsible_person_id IS
  'Pessoa responsável pelo atendimento na J&S (reconciliado).';
