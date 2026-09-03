-- =============================================================================
-- BLOCO 8.1 — Seed: contrato de conteúdo aprovado para /clientes
-- =============================================================================
-- Purpose:
--   Popular companies.logo_url, companies.description, companies.website e
--   company_relationships.metadata (hero_image_url, description) com o conteúdo
--   que existia em src/mock/clients.ts (CLIENTS_LIST) — fonte de verdade do
--   visual aprovado.
--
--   Esta migration é IDEMPOTENTE e BLINDADA:
--     - Usa os UUIDs canônicos do banco (confirmados no Bloco 1)
--     - Só atualiza se o campo estiver NULL (não sobrescreve mudanças manuais)
--     - Preserva testes, preserva company_social_links, preserva media_assets
--
--   Hospedagem das imagens:
--     - Paths relativos servidos pelo Vite (opção C aprovada 2026-09-03)
--     - Decisão futura (G11) pode migrar para Supabase Storage + media_assets
--       sem mudar este contrato (a view já tem COALESCE)
--
--   Após esta migration:
--     - public_companies_by_type retorna logo_url, image_url, description,
--       website populados para os 4 clientes
--     - /clientes renderiza 4 cards premium idênticos ao snapshot MOCK aprovado
--     - ClientCaseFallback NÃO é mais acionado para esses 4 clientes
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Abarca Móveis
-- -----------------------------------------------------------------------------
UPDATE public.companies
SET
  logo_url = COALESCE(logo_url, '/images/clientes/Abarca Moveis.jpg'),
  description = COALESCE(description, 'Móveis planejados e soluções em design de interiores para projetos residenciais e comerciais.'),
  website = COALESCE(website, 'https://www.abarcamoveis.com.br/')
WHERE id = 'e0e5799b-59dc-41d8-b7dd-7448db990971';

UPDATE public.company_relationships
SET metadata = metadata ||
  jsonb_build_object(
    'display_name', COALESCE(metadata->>'display_name', 'Abarca Móveis'),
    'description', COALESCE(metadata->>'description', 'Móveis planejados e soluções em design de interiores para projetos residenciais e comerciais.'),
    'website', COALESCE(metadata->>'website', 'https://www.abarcamoveis.com.br/'),
    'source', COALESCE(metadata->>'source', 'official_website')
  )
WHERE company_id = 'e0e5799b-59dc-41d8-b7dd-7448db990971'
  AND relationship_type = 'client';

-- -----------------------------------------------------------------------------
-- 2. VECTOR (Vector Engenharia e Sistemas de Automação)
-- -----------------------------------------------------------------------------
UPDATE public.companies
SET
  logo_url = COALESCE(logo_url, '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg'),
  description = COALESCE(description, 'Engenharia, automação industrial e sistemas inteligentes para indústria e empresas.'),
  website = COALESCE(website, 'https://vector.com.br/')
WHERE id = '6c2ec019-b59e-4ff0-9e44-a54190d0d0d6';

UPDATE public.company_relationships
SET metadata = metadata ||
  jsonb_build_object(
    'display_name', COALESCE(metadata->>'display_name', 'VECTOR'),
    'description', COALESCE(metadata->>'description', 'Engenharia, automação industrial e sistemas inteligentes para indústria e empresas.'),
    'website', COALESCE(metadata->>'website', 'https://vector.com.br/'),
    'source', COALESCE(metadata->>'source', 'official_website')
  )
WHERE company_id = '6c2ec019-b59e-4ff0-9e44-a54190d0d0d6'
  AND relationship_type = 'client';

-- -----------------------------------------------------------------------------
-- 3. Mistral Vidros (única com hero image)
-- -----------------------------------------------------------------------------
UPDATE public.companies
SET
  logo_url = COALESCE(logo_url, '/images/clientes/Mistral Vidros.jpg'),
  description = COALESCE(description, 'Vidros e espelhos de alta qualidade para projetos residenciais, comerciais e arquitetônicos.'),
  website = COALESCE(website, 'https://mistralvidros.com.br/')
WHERE id = '79c2a556-772e-4291-b727-8102c4dae127';

UPDATE public.company_relationships
SET metadata = metadata ||
  jsonb_build_object(
    'display_name', COALESCE(metadata->>'display_name', 'Mistral Vidros'),
    'description', COALESCE(metadata->>'description', 'Vidros e espelhos de alta qualidade para projetos residenciais, comerciais e arquitetônicos.'),
    'website', COALESCE(metadata->>'website', 'https://mistralvidros.com.br/'),
    'hero_image_url', COALESCE(metadata->>'hero_image_url', '/images/clientes/mistral-vidros-real.webp'),
    'source', COALESCE(metadata->>'source', 'official_website')
  )
WHERE company_id = '79c2a556-772e-4291-b727-8102c4dae127'
  AND relationship_type = 'client';

-- -----------------------------------------------------------------------------
-- 4. Vectro Engenharia (typo aceito como nome comercial — P3)
-- -----------------------------------------------------------------------------
UPDATE public.companies
SET
  logo_url = COALESCE(logo_url, '/images/clientes/Vectro Engenharia.jpg'),
  description = COALESCE(description, 'Engenharia e soluções técnicas para projetos residenciais, comerciais e industriais.'),
  website = COALESCE(website, 'https://www.vectroengenharia.com.br/')
WHERE id = 'b012a1f2-cef6-4cf4-8c33-e83b0796ae13';

UPDATE public.company_relationships
SET metadata = metadata ||
  jsonb_build_object(
    'display_name', COALESCE(metadata->>'display_name', 'Vectro Engenharia'),
    'description', COALESCE(metadata->>'description', 'Engenharia e soluções técnicas para projetos residenciais, comerciais e industriais.'),
    'website', COALESCE(metadata->>'website', 'https://www.vectroengenharia.com.br/'),
    'source', COALESCE(metadata->>'source', 'official_website')
  )
WHERE company_id = 'b012a1f2-cef6-4cf4-8c33-e83b0796ae13'
  AND relationship_type = 'client';

COMMIT;

-- -----------------------------------------------------------------------------
-- Validation
-- -----------------------------------------------------------------------------
SELECT
  c.name AS company,
  c.logo_url,
  c.description,
  c.website,
  cr.metadata->>'hero_image_url' AS hero_image_url,
  cr.metadata->>'description' AS rel_description
FROM public.companies c
INNER JOIN public.company_relationships cr
  ON cr.company_id = c.id
  AND cr.relationship_type = 'client'
INNER JOIN public.company_relationship_types crt
  ON crt.code = cr.relationship_type
WHERE c.status = 'active'
  AND cr.status = 'active'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
ORDER BY c.name;
