-- =============================================================================
-- V2.1 — Seed Jobs (17 vagas do mock)
-- Data: 2026-08-24
-- Empresa: J&S Empregos LTDA
-- Escopo: Popular tabela jobs com as mesmas 17 vagas do mock público
-- Ordem: 006
-- Dependencies: 001_tenants, 004_companies, 005_company_relationships
-- =============================================================================
-- Propósito:
--   Manter a página /vagas visualmente igual após a migração do mock para
--   banco real. Seed idempotente usando slugs como chave lógica.
-- =============================================================================

BEGIN;

-- Tenant J&S Empregos LTDA
-- Ajuste o ID se o seed de tenants usar outro UUID
WITH tenant AS (
  SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1
),
company_rel AS (
  SELECT id FROM public.company_relationships
  WHERE tenant_id = (SELECT id FROM tenant)
    AND company_id IS NOT NULL
  LIMIT 1
),
seed_jobs AS (
  -- 1: Analista de RH Folha de pagamento
  SELECT 'analista-rh-folha-de-pagamento'::varchar(200) AS slug
  UNION ALL SELECT 'ajudante-geral'
  UNION ALL SELECT 'pintor-i'
  UNION ALL SELECT 'auxiliar-de-limpeza'
  UNION ALL SELECT 'auxiliar-de-marcenaria'
  UNION ALL SELECT 'eletricista-de-instalacao'
  UNION ALL SELECT 'mecanico-industrial'
  UNION ALL SELECT 'assistente-de-compras'
  UNION ALL SELECT 'lider-de-producao'
  UNION ALL SELECT 'auxiliar-administrativo'
  UNION ALL SELECT 'auxiliar-de-expedicao'
  UNION ALL SELECT 'auxiliar-de-producao-oportunidade-1'
  UNION ALL SELECT 'auxiliar-de-producao-oportunidade-2'
  UNION ALL SELECT 'auxiliar-de-producao-oportunidade-3'
  UNION ALL SELECT 'analista-de-sistemas-sr'
  UNION ALL SELECT 'assistente-administrativo-remoto'
  UNION ALL SELECT 'consultor-de-vendas-hibrido'
)
INSERT INTO public.jobs (
  id,
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
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenant),
  (SELECT id FROM company_rel),
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
  created_at,
  updated_at
FROM (
  VALUES
  -- 1: Analista de RH Folha de pagamento
  (
    'Analista de RH Folha de pagamento',
    'analista-rh-folha-de-pagamento',
    'Responsável pelo processamento mensal da folha de pagamento, cálculos de salários, férias, 13º salário e encargos sociais.',
    'Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.',
    'Graduação concluída (obrigatório). Experiência com rotinas de folha. Conhecimento de salários, férias, 13º e rescisões. Conhecimento em legislação trabalhista e previdenciária.',
    'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida',
    5000,
    NULL,
    'monthly',
    'clt',
    'mid',
    '40h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    'published',
    '2026-08-01T10:00:00Z',
    NULL,
    '{"area":"Recursos Humanos","workload":"40h","workSchedule":"8h às 17h, segunda a sexta-feira","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-01T10:00:00Z',
    '2026-08-01T10:00:00Z'
  ),
  -- 2: Ajudante geral
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
    'clt',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    'published',
    '2026-08-02T09:00:00Z',
    NULL,
    '{"area":"Administração de Empresas","workload":"44h","workSchedule":"Segunda a sexta, 7h40 às 17h28","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-02T09:00:00Z',
    '2026-08-02T09:00:00Z'
  ),
  -- 3: Pintor I
  (
    'Pintor I',
    'pintor-i',
    'Profissional para preparação e pintura de superfícies metálicas em linha de produção.',
    'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.',
    'Ensino Médio concluído. Experiência na área.',
    'Almoço no local, Vale transporte, Fretado',
    15.56,
    NULL,
    'hourly',
    'temporary',
    'junior',
    '44h',
    'onsite',
    'Arujá',
    'SP',
    NULL,
    'published',
    '2026-08-03T08:00:00Z',
    NULL,
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, 15h10 às 23h19, com 1h de refeição","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-03T08:00:00Z',
    '2026-08-03T08:00:00Z'
  ),
  -- 4: Auxiliar de Limpeza
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
    'published',
    '2026-08-04T07:00:00Z',
    NULL,
    '{"area":"Industrial","workload":"44h","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-04T07:00:00Z',
    '2026-08-04T07:00:00Z'
  ),
  -- 5: Auxiliar de marcenaria
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
    'published',
    '2026-08-05T08:00:00Z',
    NULL,
    '{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-05T08:00:00Z',
    '2026-08-05T08:00:00Z'
  ),
  -- 6: Eletricista de instalação
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
    'published',
    '2026-08-06T08:00:00Z',
    NULL,
    '{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-06T08:00:00Z',
    '2026-08-06T08:00:00Z'
  ),
  -- 7: Mecânico industrial
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
    'Segunda a sexta, horário comercial',
    'published',
    '2026-08-07T08:00:00Z',
    NULL,
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-07T08:00:00Z',
    '2026-08-07T08:00:00Z'
  ),
  -- 8: Assistente de compras
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
    'published',
    '2026-08-08T08:00:00Z',
    NULL,
    '{"area":"Administração Comercial/Vendas","workload":"44h","workSchedule":"A combinar","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-08T08:00:00Z',
    '2026-08-08T08:00:00Z'
  ),
  -- 9: Líder de produção
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
    'published',
    '2026-08-09T08:00:00Z',
    NULL,
    '{"area":"Industrial","workload":"44h","workSchedule":"Segunda a sexta, 5h às 14h48","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-09T08:00:00Z',
    '2026-08-09T08:00:00Z'
  ),
  -- 10: Auxiliar administrativo
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
    'published',
    '2026-08-10T08:00:00Z',
    NULL,
    '{"area":"Administração de Empresas / Patrimônio - Gestão","workload":"44h","workSchedule":"Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-10T08:00:00Z',
    '2026-08-10T08:00:00Z'
  ),
  -- 11: Auxiliar de expedição
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
    'published',
    '2026-08-11T08:00:00Z',
    NULL,
    '{"area":"Logística","workload":"44h","workSchedule":"Segunda a sexta, 08h às 17h48","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-11T08:00:00Z',
    '2026-08-11T08:00:00Z'
  ),
  -- 13: Auxiliar de Produção - oportunidade 1
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
    'Segunda a sexta, horário comercial',
    'published',
    '2026-08-13T08:00:00Z',
    NULL,
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-13T08:00:00Z',
    '2026-08-13T08:00:00Z'
  ),
  -- 14: Auxiliar de Produção - oportunidade 2
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
    'Segunda a sábado, turno a combinar',
    'published',
    '2026-08-14T08:00:00Z',
    NULL,
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, turno a combinar","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-14T08:00:00Z',
    '2026-08-14T08:00:00Z'
  ),
  -- 15: Auxiliar de Produção - oportunidade 3
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
    'Segunda a sexta, 07h às 17h',
    'published',
    '2026-08-15T08:00:00Z',
    NULL,
    '{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, 07h às 17h","vacancies":1,"status":"ATIVA"}'::jsonb,
    '2026-08-15T08:00:00Z',
    '2026-08-15T08:00:00Z'
  ),
  -- 16: Analista de Sistemas Sênior
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
    'published',
    '2026-08-13T10:00:00Z',
    NULL,
    '{"area":"Tecnologia da Informação","workload":"44h","workSchedule":"8h às 17h, segunda a sexta-feira","vacancies":2,"status":"ATIVA"}'::jsonb,
    '2026-08-13T10:00:00Z',
    '2026-08-13T10:00:00Z'
  ),
  -- 17: Assistente Administrativo
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
    'published',
    '2026-08-14T09:00:00Z',
    NULL,
    '{"area":"Administração","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":3,"status":"ATIVA"}'::jsonb,
    '2026-08-14T09:00:00Z',
    '2026-08-14T09:00:00Z'
  ),
  -- 18: Consultor de Vendas
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
    'published',
    '2026-08-15T07:00:00Z',
    NULL,
    '{"area":"Vendas","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":2,"status":"ATIVA"}'::jsonb,
    '2026-08-15T07:00:00Z',
    '2026-08-15T07:00:00Z'
  )
) AS data(
  title, slug, description, responsibilities, requirements, benefits,
  salary_min, salary_max, salary_type, contract_type, seniority,
  work_hours, work_mode, city, state, location_detail,
  status, published_at, expires_at, metadata, created_at, updated_at
)
ON CONFLICT (tenant_id, slug) DO NOTHING;

COMMIT;
