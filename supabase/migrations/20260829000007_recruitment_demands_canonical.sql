-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `recruitment_demands` ao contrato canônico
-- =============================================================================
-- Expande `recruitment_demands` sem destruir dados existentes.
-- Mantém colunas atuais e adiciona apenas o que está ausente no banco real.
-- =============================================================================

-- 1. Colunas adicionais em `recruitment_demands`
ALTER TABLE public.recruitment_demands
  ADD COLUMN IF NOT EXISTS contact_name       text,
  ADD COLUMN IF NOT EXISTS contact_email      text,
  ADD COLUMN IF NOT EXISTS contact_phone      text,
  ADD COLUMN IF NOT EXISTS description        text,
  ADD COLUMN IF NOT EXISTS urgency            text,
  ADD COLUMN IF NOT EXISTS service_type       text,
  ADD COLUMN IF NOT EXISTS quantity           integer,
  ADD COLUMN IF NOT EXISTS responsible_person_id uuid,
  ADD COLUMN IF NOT EXISTS metadata           jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by         uuid,
  ADD COLUMN IF NOT EXISTS updated_at         timestamptz NOT NULL DEFAULT now();

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_recruitment_demands_tenant_id
  ON public.recruitment_demands (tenant_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_demands_status
  ON public.recruitment_demands (status);

CREATE INDEX IF NOT EXISTS idx_recruitment_demands_urgency
  ON public.recruitment_demands (urgency)
  WHERE urgency IS NOT NULL;

-- 3. RLS em recruitment_demands
ALTER TABLE public.recruitment_demands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recruitment_demands_read ON public.recruitment_demands;
CREATE POLICY recruitment_demands_read
  ON public.recruitment_demands
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
      AND tm.tenant_id = recruitment_demands.tenant_id
    )
  );

DROP POLICY IF EXISTS recruitment_demands_admin ON public.recruitment_demands;
CREATE POLICY recruitment_demands_admin
  ON public.recruitment_demands
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 4. Trigger de updated_at
DROP TRIGGER IF EXISTS update_recruitment_demands_updated_at ON public.recruitment_demands;
CREATE TRIGGER update_recruitment_demands_updated_at
  BEFORE UPDATE ON public.recruitment_demands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. Comentários
COMMENT ON TABLE public.recruitment_demands IS
  'Demandas de recrutamento vindas de empresas clientes. Representa a intenção de contratar antes de virar vaga publicada.';

COMMENT ON COLUMN public.recruitment_demands.contact_name IS
  'Nome do contato na empresa solicitante.';

COMMENT ON COLUMN public.recruitment_demands.contact_email IS
  'E-mail do contato na empresa solicitante.';

COMMENT ON COLUMN public.recruitment_demands.contact_phone IS
  'Telefone do contato na empresa solicitante.';

COMMENT ON COLUMN public.recruitment_demands.description IS
  'Descrição detalhada da demanda de recrutamento.';

COMMENT ON COLUMN public.recruitment_demands.urgency IS
  'Urgência da demanda (ex: baixa, media, alta, critica).';

COMMENT ON COLUMN public.recruitment_demands.service_type IS
  'Tipo de serviço solicitado (ex: recrutamento, selecao, hunting).';

COMMENT ON COLUMN public.recruitment_demands.quantity IS
  'Quantidade de vagas demandadas.';

COMMENT ON COLUMN public.recruitment_demands.responsible_person_id IS
  'Pessoa responsável pelo atendimento da demanda na J&S.';
