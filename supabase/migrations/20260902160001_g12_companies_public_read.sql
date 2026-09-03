-- =============================================================================
-- G12 BACKEND FIX — Public read policy for companies
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Permitir leitura pública de companies ativas para páginas públicas
--          (/empresas, /clientes) sem exigir autenticação + membership.
-- =============================================================================
-- NOTA: Esta policy é restritiva — apenas SELECT de companies ativos.
--        Escrita/update continua exigindo is_tenant_member.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS companies_public_read ON public.companies;

CREATE POLICY companies_public_read
  ON public.companies
  FOR SELECT
  TO public
  USING (status = 'active');

COMMIT;
