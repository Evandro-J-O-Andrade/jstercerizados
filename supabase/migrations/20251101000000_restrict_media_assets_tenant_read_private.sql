BEGIN;

DROP POLICY IF EXISTS media_assets_tenant_read ON public.media_assets;

CREATE POLICY media_assets_tenant_read
  ON public.media_assets
  FOR SELECT
  USING (
    is_tenant_member(tenant_id)
    AND entity_type NOT IN ('document', 'candidate_document', 'employee_document')
  );

COMMIT;
