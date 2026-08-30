-- =============================================================================
-- FASE 3 — Files: alinhar `file_uploads` ao contrato canônico
-- =============================================================================
-- Cria tabela genérica de uploads de arquivos.
-- =============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  uploaded_by       uuid,
  file_name         text NOT NULL,
  file_path         text NOT NULL,
  file_url          text NOT NULL,
  mime_type         text,
  size_bytes        bigint,
  context_type      text,
  context_id        uuid,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_file_uploads_tenant_id
  ON public.file_uploads (tenant_id);

CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by
  ON public.file_uploads (uploaded_by)
  WHERE uploaded_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_file_uploads_context
  ON public.file_uploads (context_type, context_id)
  WHERE context_type IS NOT NULL AND context_id IS NOT NULL;

-- 3. RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS file_uploads_read ON public.file_uploads;
CREATE POLICY file_uploads_read
  ON public.file_uploads
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
      AND tm.tenant_id = file_uploads.tenant_id
    )
  );

DROP POLICY IF EXISTS file_uploads_insert ON public.file_uploads;
CREATE POLICY file_uploads_insert
  ON public.file_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.person_id = (
        SELECT p.id FROM public.people p
        WHERE p.auth_user_id = auth.uid()
      )
      AND tm.status = 'active'
      AND tm.tenant_id = file_uploads.tenant_id
    )
  );

-- 4. Comentários
COMMENT ON TABLE public.file_uploads IS
  'Registro genérico de arquivos enviados. Suporta contexto por entidade (candidate, job, etc).';

COMMENT ON COLUMN public.file_uploads.uploaded_by IS
  'Pessoa que fez o upload (pode ser NULL para uploads anônimos/sistema).';

COMMENT ON COLUMN public.file_uploads.file_name IS
  'Nome original do arquivo.';

COMMENT ON COLUMN public.file_uploads.file_path IS
  'Caminho/storage path do arquivo.';

COMMENT ON COLUMN public.file_uploads.file_url IS
  'URL pública ou assinada do arquivo.';

COMMENT ON COLUMN public.file_uploads.mime_type IS
  'Tipo MIME do arquivo (ex: application/pdf, image/jpeg).';

COMMENT ON COLUMN public.file_uploads.size_bytes IS
  'Tamanho do arquivo em bytes.';

COMMENT ON COLUMN public.file_uploads.context_type IS
  'Tipo da entidade relacionada (ex: candidate, job, person).';

COMMENT ON COLUMN public.file_uploads.context_id IS
  'ID da entidade relacionada.';
