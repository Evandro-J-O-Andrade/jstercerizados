-- =============================================================================
-- J&S Empregos LTDA - Vagas de Emprego
-- =============================================================================
-- Idempotent: ON CONFLICT (tenant_id, slug) DO NOTHING
-- References tenant by slug, not hardcoded UUID.
--
-- Covers all 19 published jobs:
--   - 17 from the canonical mock (src/services/mock/vagas.ts)
--   - 2 extra from Bloco 9 (desenvolvedor-react, analista-de-rh)
--
-- Data source: migration 20260824000001_seed_jobs.sql + Bloco 9 enrichment
-- (seniority, work_hours, metadata.area, metadata.work_schedule).
--
-- Columns match the jobs table schema (20260816000500_jobs.sql).
-- =============================================================================

BEGIN;

WITH js_tenant AS (
  SELECT id AS tenant_id
  FROM public.tenants
  WHERE slug = 'js-empregos'
  LIMIT 1
),
js_company_rel AS (
  SELECT id AS company_relationship_id
  FROM public.company_relationships
  WHERE tenant_id = (SELECT id FROM js_tenant)
    AND company_id IS NOT NULL
  LIMIT 1
)
INSERT INTO public.jobs (
  tenant_id,
  company_relationship_id,
  title,
  slug,
  description,
  responsibilities,
  requirements,
  benefits,
  salary_min,
  salary_max,
  salary_type,
  contract_type,
  seniority,
  work_hours,
  work_mode,
  city,
  state,
  location_detail,
  status,
  published_at,
  expires_at,
  metadata,
  views_count,
  applications_count
)
SELECT
  js_tenant.tenant_id,
  js_company_rel.company_relationship_id,
  v.title,
  v.slug,
  v.description,
  v.responsibilities,
  v.requirements,
  v.benefits,
  v.salary_min::numeric,
  v.salary_max::numeric,
  v.salary_type,
  v.contract_type,
  v.seniority,
  v.work_hours,
  v.work_mode,
  v.city,
  v.state,
  v.location_detail,
  'published',
  v.published_at::timestamptz,
  NULL,
  v.metadata::jsonb,
  0,
  0
FROM js_tenant
CROSS JOIN js_company_rel
CROSS JOIN (VALUES

  -- =====================================================================
  -- 1. Analista de RH Folha de pagamento
  -- =====================================================================
  (
    'Analista de RH - Folha de Pagamento',
    'analista-rh-folha-de-pagamento',
    'Responsável pelo processamento mensal da folha de pagamento, cálculos de salários, férias, 13º salário e encargos sociais.',
    'Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.',
    'Formação superior em RH, Administração, Ciências Atuárias, Pedagogia ou áreas afins. Conhecimento em legislação trabalhista e previdenciária. Experiência em processamento de folha de pagamento. Conhecimento em sistemas de RH e ERP. Excelente atenção a detalhes e capacidade analítica. Disponibilidade para trabalho em regime presencial.',
    'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida',
    5000.00,
    NULL,
    'monthly',
    'clt',
    'mid',
    '40h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-01T10:00:00Z',
    '{"area":"Recursos Humanos","workload":"40h","workSchedule":"8h às 17h, segunda a sexta-feira","work_schedule":"8h às 17h, segunda a sexta-feira","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 2. Ajudante geral
  -- =====================================================================
  (
    'Ajudante geral',
    'ajudante-geral',
    'Profissional para suporte às atividades operacionais, carga e descarga, apoio à produção e logística.',
    'Suporte às atividades operacionais, carga e descarga, apoio à produção e logística, organização, normas de segurança.',
    'Ensino Médio concluído. Experiência mínima de 1 ano.',
    'Vale Transporte',
    2112.28,
    NULL,
    'monthly',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-02T09:00:00Z',
    '{"area":"Administração de Empresas","workload":"44h","workSchedule":"Segunda a sexta, 7h40 às 17h28","work_schedule":"Segunda a sexta, 7h40 às 17h28","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 3. Pintor I
  -- =====================================================================
  (
    'Pintor I',
    'pintor-i',
    'Profissional para preparação e pintura de superfícies metálicas em linha de produção.',
    'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.',
    'Ensino Médio concluído. Experiência na área.',
    'Almoço no local, Vale transporte, Fretado',
    15.56,
    NULL,
    'negotiate',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-03T08:00:00Z',
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, 15h10 às 23h19, com 1h de refeição","work_schedule":"Segunda a sábado, 15h10 às 23h19, com 1h de refeição","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 4. Auxiliar de Limpeza
  -- =====================================================================
  (
    'Auxiliar de Limpeza',
    'auxiliar-de-limpeza',
    'Profissional para limpeza de áreas administrativas e produtivas, com benefícios após efetivação.',
    'Limpeza de áreas administrativas e produtivas, banheiros, vestiários, refeitório, escritórios, descarte de resíduos, abastecimento de materiais de higiene, limpeza de vidros, móveis e equipamentos, apoio em áreas de produção, conservação dos equipamentos, comunicação de irregularidades, cumprimento das normas de segurança e EPIs.',
    'Ensino Médio concluído. Experiência na área.',
    'Vale Transporte, Restaurante na empresa, Assistência Médica após efetivação (Intermédica), Assistência Odontológica após efetivação (Porto Seguro), Convênio Farmácia, Convênio Facil Card, Convênio SESI, Convênio Faculdade',
    NULL,
    NULL,
    'negotiate',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-04T07:00:00Z',
    '{"area":"Industrial","workload":"44h","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 5. Auxiliar de marcenaria
  -- =====================================================================
  (
    'Auxiliar de marcenaria',
    'auxiliar-de-marcenaria',
    'Profissional para fabricação, montagem e acabamento de estandes, cenários e mobiliários.',
    'Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.',
    'Disponibilidade para viagens. Disponibilidade para período noturno. Disponibilidade para finais de semana e feriados quando necessário.',
    'Alimentação, Vale Transporte, Pagamento de Horas Extras',
    3000,
    NULL,
    'monthly',
    'temporary',
    'junior',
    '220h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-05T08:00:00Z',
    '{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 6. Eletricista de instalação
  -- =====================================================================
  (
    'Eletricista de instalação',
    'eletricista-de-instalacao',
    'Profissional para montagem, instalação e manutenção de sistemas elétricos, iluminação e circuitos.',
    'Montagem, instalação, desmontagem de sistemas elétricos, iluminação, fitas e mangueiras de LED, refletores, luminárias, passagem de cabos, quadros, tomadas, circuitos temporários, inspeções, testes, manutenção corretiva, carga e descarga, organização de materiais, EPIs.',
    'Experiência com fitas/mangueiras de LED é diferencial. Conhecimento em instalações elétricas residenciais básicas, circuitos, tomadas, interruptores, luminárias.',
    'Alimentação, Vale Transporte, Pagamento de Horas Extras',
    3500,
    NULL,
    'monthly',
    'clt',
    'mid',
    '220h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-06T08:00:00Z',
    '{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 7. Mecânico industrial
  -- =====================================================================
  (
    'Mecânico industrial',
    'mecanico-industrial',
    'Profissional para manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
    'Manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
    'Técnico em Mecânica Industrial concluído. Experiência comprovada mínima de 3 anos.',
    'Vale Transporte, Participação de lucros',
    3600,
    NULL,
    'monthly',
    'clt',
    'mid',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-07T08:00:00Z',
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","work_schedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 8. Assistente de compras
  -- =====================================================================
  (
    'Assistente de compras',
    'assistente-de-compras',
    'Profissional para pesquisa de fornecedores, cotações, negociação e apoio nas compras.',
    'Pesquisa de fornecedores, homologação, cotações, negociação, pedidos, notas fiscais, planilhas, controles, apoio ao superior.',
    'Ensino Médio concluído. Excel intermediário. Curso profissionalizante em compras/suprimentos ou áreas correlatas.',
    'VT, Café na empresa, VR R$ 380,00, Cesta Básica Física, Seguro de Vida, PLR',
    NULL,
    NULL,
    'negotiate',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    'A combinar',
    '2026-08-08T08:00:00Z',
    '{"area":"Administração Comercial/Vendas","workload":"44h","workSchedule":"A combinar","work_schedule":"A combinar","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 9. Líder de produção
  -- =====================================================================
  (
    'Líder de produção',
    'lider-de-producao',
    'Profissional para liderança de equipe, acompanhamento da produção e gestão de melhorias.',
    'Liderança de equipe, acompanhamento da produção, cronograma, desempenho, feedback, banco de horas, escalas, melhorias, comunicação entre áreas.',
    'Ensino Médio concluído. Excel intermediário. Experiência em segmento alimentício é diferencial.',
    'Refeição no local, Vale Alimentação, Vale Transporte, Plano de Saúde custeado 75% pela empresa, Plano Odontológico',
    3000,
    NULL,
    'monthly',
    'temporary',
    'leadership',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    'Segunda a sexta, 5h às 14h48',
    '2026-08-09T08:00:00Z',
    '{"area":"Industrial","workload":"44h","workSchedule":"Segunda a sexta, 5h às 14h48","work_schedule":"Segunda a sexta, 5h às 14h48","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 10. Auxiliar administrativo
  -- =====================================================================
  (
    'Auxiliar administrativo',
    'auxiliar-administrativo',
    'Profissional para atendimento, gestão imobiliária e rotinas administrativas.',
    'Atendimento, relacionamento com inquilinos, proprietários e prestadores, suporte jurídico, cálculos de aluguéis, multas e juros, sistema de gestão imobiliária, dados cadastrais, certidões, rotinas administrativas.',
    'Ensino Médio completo. Experiência administrativa. Excel intermediário. Sistema imobiliário é diferencial. Residir em Arujá.',
    'Vale-Transporte',
    2500,
    NULL,
    'monthly',
    'clt',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    'Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.',
    '2026-08-10T08:00:00Z',
    '{"area":"Administração de Empresas / Patrimônio - Gestão","workload":"44h","workSchedule":"Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.","work_schedule":"Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 11. Auxiliar de expedição
  -- =====================================================================
  (
    'Auxiliar de expedição',
    'auxiliar-de-expedicao',
    'Profissional para separação, conferência, embalagem e expedição de pedidos de e-commerce.',
    'Separação, conferência, pedidos de e-commerce, embalagem, etiquetagem, estoque, recebimento, expedição, organização.',
    'Experiência comprovada. Separação, conferência, embalagem, etiquetagem, estoque, recebimento. Residir em Arujá.',
    'Vale Transporte, Refeição no local, bônus de até R$ 500 por meta',
    1777.62,
    NULL,
    'monthly',
    'clt',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    'Segunda a sexta, 08h às 17h48',
    '2026-08-11T08:00:00Z',
    '{"area":"Logística","workload":"44h","workSchedule":"Segunda a sexta, 08h às 17h48","work_schedule":"Segunda a sexta, 08h às 17h48","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 12. Auxiliar de Produção (oportunidade 1)
  -- =====================================================================
  (
    'Auxiliar de Produção',
    'auxiliar-de-producao-oportunidade-1',
    'Oportunidade para Auxiliar de Produção em indústria, com atividades de operação, apoio na linha e organização.',
    'Operação de maquinários, tarefas manuais na linha de produção, organização do posto de trabalho e cumprimento das normas de segurança.',
    'Ensino Fundamental completo. Disponibilidade para regime de plantões. Experiência anterior em linha de produção.',
    'Vale Transporte, Refeição no local',
    2112.28,
    NULL,
    'monthly',
    'clt',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-13T08:00:00Z',
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","work_schedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 13. Auxiliar de Produção (oportunidade 2)
  -- =====================================================================
  (
    'Auxiliar de Produção',
    'auxiliar-de-producao-oportunidade-2',
    'Oportunidade temporária para Auxiliar de Produção, com foco em apoio operacional e movimentação de materiais.',
    'Apoio à produção, movimentação de materiais, inspeção visual e abastecimento de linha.',
    'Ensino Fundamental completo. Experiência mínima de 6 meses em produção ou indústria.',
    'Vale Transporte, Refeição no local',
    1800,
    NULL,
    'monthly',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-14T08:00:00Z',
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, turno a combinar","work_schedule":"Segunda a sábado, turno a combinar","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 14. Auxiliar de Produção (oportunidade 3)
  -- =====================================================================
  (
    'Auxiliar de Produção',
    'auxiliar-de-producao-oportunidade-3',
    'Oportunidade CLT para Auxiliar de Produção, com foco em montagem básica, separação e organização do setor.',
    'Montagem básica, separação de materiais, acabamento simples e limpeza do setor.',
    'Ensino Fundamental completo. Disponibilidade de horário. Proatividade e capacidade de seguir procedimentos.',
    'Vale Transporte, Alimentação no local',
    1950,
    NULL,
    'monthly',
    'clt',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    '2026-08-15T08:00:00Z',
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, 07h às 17h","work_schedule":"Segunda a sexta, 07h às 17h","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 15. Analista de Sistemas Sênior (remote)
  -- =====================================================================
  (
    'Analista de Sistemas Sênior',
    'analista-de-sistemas-sr',
    'Vaga para Analista de Sistemas Sênior em regime de trabalho de casa (100% remoto). Óportunidade para atuar em projetos de alta complexidade e liderar o desenvolvimento de soluções escaláveis.',
    'Desenvolver, manter e otimizar sistemas web e mobile. Realizar análise de requisitos, codificação, testes, depuração e documentação de software. Participar de reuniões de planejamento e sprint, colaborar com designers e product managers. Garantir a qualidade, segurança e performance das aplicações. Mentoria de desenvolvedores juniores.',
    'Graduação em Ciência da Computação, Engenharia ou áreas afins. Experiência mínima de 5 anos em desenvolvimento full-stack. Sólidos conhecimentos em JavaScript, React, Node.js, SQL e arquitetura de software. Experiência com ambientes cloud (AWS ou Azure). Inglês intermediário.',
    'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Plano de Saúde, Bônus por meta, Apoio a cursos e certificações',
    8000,
    12000,
    'range',
    'clt',
    'senior',
    '44h',
    'remote',
    'São Paulo',
    'SP',
    NULL,
    '2026-08-13T10:00:00Z',
    '{"area":"Tecnologia da Informação","workload":"44h","workSchedule":"8h às 17h, segunda a sexta-feira","work_schedule":"8h às 17h, segunda a sexta-feira","vacancies":2,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 16. Assistente Administrativo (remoto)
  -- =====================================================================
  (
    'Assistente Administrativo',
    'assistente-administrativo-remoto',
    'Vaga para Assistente Administrativo em regime de trabalho de casa (100% remoto). Oportunidade de atuar em empresa sólida com tecnologia e aprendizado contínuo.',
    'Apoiar as atividades administrativas do dia a dia. Gerenciar e-mails, agendar reuniões, organizar arquivos, elaborar planilhas e relatórios. Atuar no atendimento a clientes e fornecedores. Controlar pagamentos e recebimentos, além de apoiar a rotina financeira. Tramitar correspondências e documentos.',
    'Ensino Médio completo. Experiência mínima de 2 anos em atividades administrativas. Pacote Office avançado (Excel, Word e PowerPoint). Conhecimento em sistemas de gestão. Boa comunicação escrita e verbal.',
    'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Bônus por meta',
    3500,
    4500,
    'range',
    'clt',
    'mid',
    '44h',
    'remote',
    'São Paulo',
    'SP',
    'Segunda a sexta, 8h às 17h, com 1h de almoço',
    '2026-08-14T09:00:00Z',
    '{"area":"Administração","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":3,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 17. Consultor de Vendas (híbrido)
  -- =====================================================================
  (
    'Consultor de Vendas',
    'consultor-de-vendas-hibrido',
    'Vaga para Consultor de Vendas em regime híbrido (trabalho de casa 3x por semana + presencial 2x por semana).',
    'Prospectar, negociar e fidelizar clientes. Executar visitas presenciais e ligações de inside sales. Apresentar soluções e produtos, elaborar propostas comerciais, acompanhar o ciclo de vendas e registrar atividades no CRM. Atingir as metas estabelecidas pela diretoria.',
    'Ensino Médio completo. Experiência mínima de 1 ano em vendas. Conhecimento em CRM. Boa comunicação e persuasão. Disponibilidade para viajar dentro do SP.',
    'Vale refeição, Vale transporte, Convênio Médico, Participação dos lucros, Comissões sobre vendas, Bônus por meta',
    4000,
    7000,
    'range',
    'clt',
    'mid',
    '44h',
    'hybrid',
    'São Paulo',
    'SP',
    'Segunda a sexta, 8h às 17h, com 1h de almoço',
    '2026-08-15T07:00:00Z',
    '{"area":"Vendas","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":2,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 18. Desenvolvedor React (extra - Bloco 9)
  -- =====================================================================
  (
    'Desenvolvedor React',
    'desenvolvedor-react',
    'Oportunidade para Desenvolvedor React em regime presencial, atuando no desenvolvimento de interfaces modernas.',
    'Desenvolver, manter e evoluir interfaces React modernas, com TypeScript, em ambiente ágil. Participar de code reviews, testes automatizados e decisões de arquitetura frontend. Atuar próximo do time de design e produto para entregar experiências de alta qualidade.',
    'Formação superior em Ciências da Computação, Sistemas ou áreas afins. Experiência de 2 anos em React e TypeScript. Conhecimento em testes automatizados e boas práticas de desenvolvimento.',
    'Plano de saúde, vale-refeição, ticket-restaurant, auxílio-creche, bonificação por desempenho, capacitação profissional, trabalho remoto.',
    5000,
    NULL,
    'monthly',
    'clt',
    'senior',
    '44h',
    'onsite',
    'São Paulo',
    'SP',
    NULL,
    '2026-08-13T10:00:00Z',
    '{"area":"Tecnologia da Informação","workload":"44h","vacancies":1,"status":"ATIVA"}'
  ),

  -- =====================================================================
  -- 19. Analista de RH (extra - Bloco 9)
  -- =====================================================================
  (
    'Analista de RH',
    'analista-de-rh',
    'Vaga para Analista de RH atuando nos subsistemas de recrutamento, folha e gestão de pessoas.',
    'Atuar nos subsistemas de RH: recrutamento e seleção, admissão, folha, benefícios, treinamento e desenvolvimento, gestão de desempenho e clima. Apoiar gestores e colaboradores em rotinas trabalhistas, atendimento e indicadores da área.',
    'Formação superior em RH, Administração, Psicologia ou áreas afins. Experiência em gestão de pessoas. Conhecimento em legislação trabalhista. Boa comunicação e empatia.',
    'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Plano de Saúde, Bônus por meta, Capacitação profissional.',
    5000,
    NULL,
    'monthly',
    'clt',
    'mid',
    '44h',
    'onsite',
    'São Paulo',
    'SP',
    'Segunda a sexta, 8h às 17h, com 1h de almoço',
    '2026-08-13T10:00:00Z',
    '{"area":"Recursos Humanos","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":1,"status":"ATIVA"}'
  )

) AS v(
  title, slug, description, responsibilities, requirements, benefits,
  salary_min, salary_max, salary_type, contract_type, seniority,
  work_hours, work_mode, city, state, location_detail,
  published_at, metadata
)
ON CONFLICT (tenant_id, slug) DO NOTHING;

COMMIT;

-- =============================================================================
-- Validation
-- =============================================================================
SELECT
  COUNT(*) AS total_jobs,
  COUNT(*) FILTER (WHERE work_mode = 'onsite') AS onsite_jobs,
  COUNT(*) FILTER (WHERE work_mode = 'remote') AS remote_jobs,
  COUNT(*) FILTER (WHERE work_mode = 'hybrid') AS hybrid_jobs,
  COUNT(*) FILTER (WHERE contract_type = 'clt') AS clt_jobs,
  COUNT(*) FILTER (WHERE contract_type = 'temporary') AS temporary_jobs
FROM public.jobs
WHERE tenant_id = (SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1)
  AND status = 'published';
