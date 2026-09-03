-- =============================================================================
-- BLOCO 9 — Seed enriquecido + view estendida: /vagas contrato completo
-- =============================================================================
-- Purpose:
--   Reproduzir o snapshot MOCK aprovado de /vagas (src/services/mock/vagas.ts)
--   alimentado pelo banco. A view `public_jobs_v1` Bloco 2 + Bloco 8 só
--   expunha title, location, salary (texto), contract_type, work_mode, etc.
--   Faltavam no contrato: seniority (nivel), work_hours (workload), city, state
--   (split canônico), responsibilities, salary_min/Max numéricos, area (via metadata).
--
--   Esta migration:
--     1. Estende public_jobs_v1 com TODAS as colunas canônicas.
--     2. Popula as 19 vagas published com dados do MOCK quando o título bate,
--        ou com defaults razoáveis para as 2 vagas extras do DB.
--     3. Idempotente: usa COALESCE (não sobrescreve mudanças manuais).
--     4. Não cria colunas novas em jobs (todas já existem no schema).
--     5. Não toca em MOCK (src/services/mock/vagas.ts preservado como fallback
--        e referência).
--
--   Após esta migration:
--     - public_jobs_v1 expõe: job_id, title, slug, status, description,
--       responsibilities, requirements, benefits, contract_type, work_mode,
--       location, location_raw, salary_text, salary_min, salary_max,
--       salary_type, seniority, work_hours, city, state, area, work_schedule,
--       company_id, company_name, company_logo_url, published_at, expires_at,
--       metadata, views_count, applications_count, tenant_id
--     - 19 cards no /vagas renderizam com todos os campos do MOCK.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. VIEW public_jobs_v1 — extend contract
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.public_jobs_v1;

CREATE VIEW public.public_jobs_v1 AS
SELECT
  j.id              AS job_id,
  j.title           AS title,
  j.slug            AS slug,
  j.status          AS status,
  j.description     AS description,
  j.responsibilities AS responsibilities,
  j.requirements    AS requirements,
  j.benefits        AS benefits,

  coalesce(j.contract_type, j.employment_type, 'clt') AS contract_type,
  j.work_mode       AS work_mode,

  CASE
    WHEN j.city IS NOT NULL AND j.state IS NOT NULL THEN
      trim(both ' ' from (j.city || ', ' || j.state))
    WHEN j.city IS NOT NULL THEN j.city
    WHEN j.location IS NOT NULL THEN j.location
    ELSE NULL
  END AS location,
  j.location        AS location_raw,
  j.city            AS city,
  j.state           AS state,

  CASE
    WHEN j.salary IS NOT NULL AND length(trim(j.salary)) > 0 THEN j.salary
    WHEN j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL THEN
      'R$ ' || to_char(j.salary_min, 'FM999G999G990D00')
        || ' – R$ ' || to_char(j.salary_max, 'FM999G999G990D00')
    WHEN j.salary_min IS NOT NULL THEN
      'R$ ' || to_char(j.salary_min, 'FM999G999G990D00')
    ELSE NULL
  END AS salary_text,
  j.salary_min      AS salary_min,
  j.salary_max      AS salary_max,
  j.salary_type     AS salary_type,

  j.seniority       AS seniority,
  j.work_hours      AS work_hours,
  j.metadata->>'area' AS area,
  j.metadata->>'work_schedule' AS work_schedule,

  c.id              AS company_id,
  c.name            AS company_name,
  COALESCE(
    (
      SELECT ma.file_url
      FROM public.media_assets ma
      WHERE ma.tenant_id = c.tenant_id
        AND ma.entity_type = 'company'
        AND ma.entity_id = c.id
        AND (ma.is_primary = true OR ma.alt_text ILIKE '%logo%')
      ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC
      LIMIT 1
    ),
    c.logo_url
  ) AS company_logo_url,

  j.published_at    AS published_at,
  j.expires_at      AS expires_at,
  j.metadata        AS metadata,
  j.views_count     AS views_count,
  j.applications_count AS applications_count,

  j.tenant_id       AS tenant_id
FROM public.jobs j
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE j.status = 'published'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true';

COMMENT ON VIEW public.public_jobs_v1 IS
  'Public read-only view exposing published jobs joined with company '
  '(via jobs.company_id), excluding jobs whose company is marked as test '
  '(companies.metadata->>''is_test'' = ''true''). Contract: job_id, title, '
  'slug, status, description, responsibilities, requirements, benefits, '
  'contract_type, work_mode, location, location_raw, city, state, '
  'salary_text, salary_min, salary_max, salary_type, seniority, work_hours, '
  'area (via metadata), work_schedule (via metadata), company_id, '
  'company_name, company_logo_url (media_assets -> companies.logo_url), '
  'published_at, expires_at, metadata, views_count, applications_count, '
  'tenant_id.';

ALTER VIEW public.public_jobs_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_jobs_v1 TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. SEED — populate missing fields from MOCK (idempotent via COALESCE)
--    Source of truth: src/services/mock/vagas.ts (Bloco 9.1)
-- -----------------------------------------------------------------------------

-- 1. Analista de RH Folha de pagamento (id 030dab74-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '40h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.'),
  salary_min = COALESCE(salary_min, 5000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Recursos Humanos'), 'work_schedule', COALESCE(metadata->>'work_schedule', '8h às 17h, segunda a sexta-feira'))
WHERE id = '030dab74-fd35-4e5d-ba5d-397863ce3b2f';

-- 2. Ajudante geral (id 7e299dec-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Suporte às atividades operacionais, carga e descarga, apoio à produção e logística, organização, normas de segurança.'),
  salary_min = COALESCE(salary_min, 2112.28),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Administração de Empresas'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 7h40 às 17h28'))
WHERE id = '7e299dec-79f1-4ad1-a2fc-ebbacaea2d86';

-- 3. Pintor I (id db9f9e1d-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.'),
  salary_min = COALESCE(salary_min, 15.56),
  salary_type = COALESCE(salary_type, 'hourly'),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Produção/Fabricação'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sábado, 15h10 às 23h19, com 1h de refeição'))
WHERE id = 'db9f9e1d-0d13-4252-899d-933fb271d865';

-- 4. Auxiliar de Limpeza (id 744840af-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Limpeza de áreas administrativas e produtivas, banheiros, vestiários, refeitório, escritórios, descarte de resíduos, abastecimento de materiais de higiene, limpeza de vidros, móveis e equipamentos, apoio em áreas de produção, conservação dos equipamentos, comunicação de irregularidades, cumprimento das normas de segurança e EPIs.'),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Industrial'))
WHERE id = '744840af-a9f3-4301-b8a7-bce665c9076d';

-- 5. Auxiliar de marcenaria (id b1bf44c5-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '220h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.'),
  salary_min = COALESCE(salary_min, 3000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Industrial'))
WHERE id = 'b1bf44c5-06cd-462d-b6eb-10965d5284e4';

-- 6. Eletricista de instalação (id 08404295-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '220h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Montagem, instalação, desmontagem de sistemas elétricos, iluminação, fitas e mangueiras de LED, refletores, luminárias, passagem de cabos, quadros, tomadas, circuitos temporários, inspeções, testes, manutenção corretiva, carga e descarga, organização de materiais, EPIs.'),
  salary_min = COALESCE(salary_min, 3500),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Industrial'))
WHERE id = '08404295-1fd9-4244-a633-0af58dc3fedb';

-- 7. Mecânico industrial (id 0e274c83-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.'),
  salary_min = COALESCE(salary_min, 3600),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Produção/Fabricação'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, horário comercial'))
WHERE id = '0e274c83-8b93-4a31-b180-dde1e5a849c0';

-- 8. Assistente de compras (id 20fb7eec-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Pesquisa de fornecedores, homologação, cotações, negociação, pedidos, notas fiscais, planilhas, controles, apoio ao superior.'),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Administração Comercial/Vendas'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'A combinar'))
WHERE id = '20fb7eec-ea29-48f5-a0e9-a5faa9d3fa93';

-- 9. Líder de produção (id 74a55950-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'LIDERANCA'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Liderança de equipe, acompanhamento da produção, cronograma, desempenho, feedback, banco de horas, escalas, melhorias, comunicação entre áreas.'),
  salary_min = COALESCE(salary_min, 3000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Industrial'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 5h às 14h48'))
WHERE id = '74a55950-1024-4c04-b31b-1e5886b14aaa';

-- 10. Auxiliar administrativo (id 90267b5d-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Atendimento, relacionamento com inquilinos, proprietários e prestadores, suporte jurídico, cálculos de aluguéis, multas e juros, sistema de gestão imobiliária, dados cadastrais, certidões, rotinas administrativas.'),
  salary_min = COALESCE(salary_min, 2500),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Administração de Empresas / Patrimônio - Gestão'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.'))
WHERE id = '90267b5d-df0f-47b8-a945-f9201a93c937';

-- 11. Auxiliar de expedição (id c0685720-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Separação, conferência, pedidos de e-commerce, embalagem, etiquetagem, estoque, recebimento, expedição, organização.'),
  salary_min = COALESCE(salary_min, 1777.62),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Logística'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 08h às 17h48'))
WHERE id = 'c0685720-c314-4e54-b356-363f8cd01226';

-- 12. Auxiliar de Produção (id 320bdd94-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Operação de maquinários, tarefas manuais na linha de produção, organização do posto de trabalho e cumprimento das normas de segurança.'),
  salary_min = COALESCE(salary_min, 2112.28),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Produção/Fabricação'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, horário comercial'))
WHERE id = '320bdd94-5a16-4487-bfb7-221daf18ff6f';

-- 13. Analista de Sistemas Sênior (id b3d503c8-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'SENIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'remote'),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Desenvolver, manter e otimizar sistemas web e mobile. Realizar análise de requisitos, codificação, testes, depuração e documentação de software. Participar de reuniões de planejamento e sprint, colaborar com designers e product managers. Garantir a qualidade, segurança e performance das aplicações. Mentoria de desenvolvedores juniores.'),
  salary_min = COALESCE(salary_min, 8000),
  salary_max = COALESCE(salary_max, 12000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Tecnologia da Informação'), 'work_schedule', COALESCE(metadata->>'work_schedule', '8h às 17h, segunda a sexta-feira'))
WHERE id = 'b3d503c8-d7f5-4ee4-ad5b-f7a722789422';

-- 14. Auxiliar de Produção (id a5acf4bd-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Apoio à produção, movimentação de materiais, inspeção visual e abastecimento de linha.'),
  salary_min = COALESCE(salary_min, 1800),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Produção/Fabricação'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sábado, turno a combinar'))
WHERE id = 'a5acf4bd-b691-4607-b6c1-e806e5613320';

-- 15. Assistente Administrativo (id a753e404-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'remote'),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Apoiar as atividades administrativas do dia a dia. Gerenciar e-mails, agendar reuniões, organizar arquivos, elaborar planilhas e relatórios. Atuar no atendimento a clientes e fornecedores. Controlar pagamentos e recebimentos, além de apoiar a rotina financeira. Tramitar correspondências e documentos.'),
  salary_min = COALESCE(salary_min, 3500),
  salary_max = COALESCE(salary_max, 4500),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Administração'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 8h às 17h, com 1h de almoço'))
WHERE id = 'a753e404-4856-47b7-9093-79aacdc2c2a3';

-- 16. Consultor de Vendas (id 7dc46711-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'hybrid'),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Prospectar, negociar e fidelizar clientes. Executar visitas presenciais e ligações de inside sales. Apresentar soluções e produtos, elaborar propostas comerciais, acompanhar o ciclo de vendas e registrar atividades no CRM. Atingir as metas estabelecidas pela diretoria.'),
  salary_min = COALESCE(salary_min, 4000),
  salary_max = COALESCE(salary_max, 7000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Vendas'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 8h às 17h, com 1h de almoço'))
WHERE id = '7dc46711-66d5-4341-b96a-8d15d36cabeb';

-- 17. Auxiliar de Produção (id 4300092f-...)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'JUNIOR'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'Arujá'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Montagem básica, separação de materiais, acabamento simples e limpeza do setor.'),
  salary_min = COALESCE(salary_min, 1950),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Produção/Fabricação'), 'work_schedule', COALESCE(metadata->>'work_schedule', 'Segunda a sexta, 07h às 17h'))
WHERE id = '4300092f-45a0-41b2-ace6-092d78ef3e12';

-- 18. Desenvolvedor React (id 09603ac9-... — extra do DB, sem entrada no MOCK)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Desenvolver, manter e evoluir interfaces React modernas, com TypeScript, em ambiente ágil. Participar de code reviews, testes automatizados e decisões de arquitetura frontend. Atuar próximo do time de design e produto para entregar experiências de alta qualidade.'),
  salary_min = COALESCE(salary_min, 5000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Tecnologia da Informação'))
WHERE id = '09603ac9-e8fb-4da0-af34-7a0abae49ee5';

-- 19. Analista de RH (id d60b982f-... — extra do DB, sem entrada no MOCK)
UPDATE public.jobs SET
  seniority = COALESCE(seniority, 'PLENO'),
  work_hours = COALESCE(work_hours, '44h'),
  work_mode = COALESCE(work_mode, 'onsite'),
  city = COALESCE(city, 'São Paulo'),
  state = COALESCE(state, 'SP'),
  responsibilities = COALESCE(responsibilities, 'Atuar nos subsistemas de RH: recrutamento e seleção, admissão, folha, benefícios, treinamento e desenvolvimento, gestão de desempenho e clima. Apoiar gestores e colaboradores em rotinas trabalhistas, atendimento e indicadores da área.'),
  salary_min = COALESCE(salary_min, 5000),
  metadata = metadata || jsonb_build_object('area', COALESCE(metadata->>'area', 'Recursos Humanos'))
WHERE id = 'd60b982f-f786-4115-b87a-7c5d3f8a011d';

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Validation
-- -----------------------------------------------------------------------------
SELECT
  j.title,
  j.seniority,
  j.work_hours,
  j.work_mode,
  j.city,
  j.state,
  j.salary_min,
  j.salary_max,
  j.salary_type,
  j.metadata->>'area' AS area
FROM public.jobs j
WHERE j.status = 'published'
ORDER BY j.published_at;
