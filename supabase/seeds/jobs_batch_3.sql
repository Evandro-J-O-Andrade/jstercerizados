WITH js_tenant AS (
  SELECT id AS tenant_id
  FROM public.tenants
  WHERE slug = 'js-empregos'
  LIMIT 1
),
js_company_rel AS (
  SELECT id AS company_relationship_id
  FROM public.company_relationships
  WHERE tenant_id = (SELECT tenant_id FROM js_tenant)
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
  ('Auxiliar de Produção','auxiliar-de-producao-oportunidade-1','Oportunidade para Auxiliar de Produção em indústria, com atividades de operação, apoio na linha e organização.','Operação de maquinários, tarefas manuais na linha de produção, organização do posto de trabalho e cumprimento das normas de segurança.','Ensino Fundamental completo. Disponibilidade para regime de plantões. Experiência anterior em linha de produção.','Vale Transporte, Refeição no local',2112.28,NULL,'monthly','clt','junior','44h','onsite','Arujá','SP',NULL,'2026-08-13T08:00:00Z','{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","work_schedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'),
  ('Auxiliar de Produção','auxiliar-de-producao-oportunidade-2','Oportunidade temporária para Auxiliar de Produção, com foco em apoio operacional e movimentação de materiais.','Apoio à produção, movimentação de materiais, inspeção visual e abastecimento de linha.','Ensino Fundamental completo. Experiência mínima de 6 meses em produção ou indústria.','Vale Transporte, Refeição no local',1800,NULL,'monthly','temporary','junior','44h','onsite','Arujá','SP',NULL,'2026-08-14T08:00:00Z','{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, turno a combinar","work_schedule":"Segunda a sábado, turno a combinar","vacancies":1,"status":"ATIVA"}'),
  ('Auxiliar de Produção','auxiliar-de-producao-oportunidade-3','Oportunidade CLT para Auxiliar de Produção, com foco em montagem básica, separação e organização do setor.','Montagem básica, separação de materiais, acabamento simples e limpeza do setor.','Ensino Fundamental completo. Disponibilidade de horário. Proatividade e capacidade de seguir procedimentos.','Vale Transporte, Alimentação no local',1950,NULL,'monthly','clt','junior','44h','onsite','Arujá','SP',NULL,'2026-08-15T08:00:00Z','{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, 07h às 17h","work_schedule":"Segunda a sexta, 07h às 17h","vacancies":1,"status":"ATIVA"}'),
  ('Analista de Sistemas Sênior','analista-de-sistemas-sr','Vaga para Analista de Sistemas Sênior em regime de trabalho de casa (100% remoto). Óportunidade para atuar em projetos de alta complexidade e liderar o desenvolvimento de soluções escaláveis.','Desenvolver, manter e otimizar sistemas web e mobile. Realizar análise de requisitos, codificação, testes, depuração e documentação de software. Participar de reuniões de planejamento e sprint, colaborar com designers e product managers. Garantir a qualidade, segurança e performance das aplicações. Mentoria de desenvolvedores juniores.','Graduação em Ciência da Computação, Engenharia ou áreas afins. Experiência mínima de 5 anos em desenvolvimento full-stack. Sólidos conhecimentos em JavaScript, React, Node.js, SQL e arquitetura de software. Experiência com ambientes cloud (AWS ou Azure). Inglês intermediário.','Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Plano de Saúde, Bônus por meta, Apoio a cursos e certificações',8000,12000,'range','clt','senior','44h','remote','São Paulo','SP',NULL,'2026-08-13T10:00:00Z','{"area":"Tecnologia da Informação","workload":"44h","workSchedule":"8h às 17h, segunda a sexta-feira","work_schedule":"8h às 17h, segunda a sexta-feira","vacancies":2,"status":"ATIVA"}'),
  ('Assistente Administrativo','assistente-administrativo-remoto','Vaga para Assistente Administrativo em regime de trabalho de casa (100% remoto). Oportunidade de atuar em empresa sólida com tecnologia e aprendizado contínuo.','Apoiar as atividades administrativas do dia a dia. Gerenciar e-mails, agendar reuniões, organizar arquivos, elaborar planilhas e relatórios. Atuar no atendimento a clientes e fornecedores. Controlar pagamentos e recebimentos, além de apoiar a rotina financeira. Tramitar correspondências e documentos.','Ensino Médio completo. Experiência mínima de 2 anos em atividades administrativas. Pacote Office avançado (Excel, Word e PowerPoint). Conhecimento em sistemas de gestão. Boa comunicação escrita e verbal.','Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Bônus por meta',3500,4500,'range','clt','mid','44h','remote','São Paulo','SP','Segunda a sexta, 8h às 17h, com 1h de almoço','2026-08-14T09:00:00Z','{"area":"Administração","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":3,"status":"ATIVA"}'),
  ('Consultor de Vendas','consultor-de-vendas-hibrido','Vaga para Consultor de Vendas em regime híbrido (trabalho de casa 3x por semana + presencial 2x por semana).','Prospectar, negociar e fidelizar clientes. Executar visitas presenciais e ligações de inside sales. Apresentar soluções e produtos, elaborar propostas comerciais, acompanhar o ciclo de vendas e registrar atividades no CRM. Atingir as metas estabelecidas pela diretoria.','Ensino Médio completo. Experiência mínima de 1 ano em vendas. Conhecimento em CRM. Boa comunicação e persuasão. Disponibilidade para viajar dentro do SP.','Vale refeição, Vale transporte, Convênio Médico, Participação dos lucros, Comissões sobre vendas, Bônus por meta',4000,7000,'range','clt','mid','44h','hybrid','São Paulo','SP','Segunda a sexta, 8h às 17h, com 1h de almoço','2026-08-15T07:00:00Z','{"area":"Vendas","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":2,"status":"ATIVA"}'),
  ('Desenvolvedor React','desenvolvedor-react','Oportunidade para Desenvolvedor React em regime presencial, atuando no desenvolvimento de interfaces modernas.','Desenvolver, manter e evoluir interfaces React modernas, com TypeScript, em ambiente ágil. Participar de code reviews, testes automatizados e decisões de arquitetura frontend. Atuar próximo do time de design e produto para entregar experiências de alta qualidade.','Formação superior em Ciências da Computação, Sistemas ou áreas afins. Experiência de 2 anos em React e TypeScript. Conhecimento em testes automatizados e boas práticas de desenvolvimento.','Plano de saúde, vale-refeição, ticket-restaurant, auxílio-creche, bonificação por desempenho, capacitação profissional, trabalho remoto.',5000,NULL,'monthly','clt','senior','44h','onsite','São Paulo','SP',NULL,'2026-08-13T10:00:00Z','{"area":"Tecnologia da Informação","workload":"44h","vacancies":1,"status":"ATIVA"}'),
  ('Analista de RH','analista-de-rh','Vaga para Analista de RH atuando nos subsistemas de recrutamento, folha e gestão de pessoas.','Atuar nos subsistemas de RH: recrutamento e seleção, admissão, folha, benefícios, treinamento e desenvolvimento, gestão de desempenho e clima. Apoiar gestores e colaboradores em rotinas trabalhistas, atendimento e indicadores da área.','Formação superior em RH, Administração, Psicologia ou áreas afins. Experiência em gestão de pessoas. Conhecimento em legislação trabalhista. Boa comunicação e empatia.','Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Plano de Saúde, Bônus por meta, Capacitação profissional.',5000,NULL,'monthly','clt','mid','44h','onsite','São Paulo','SP','Segunda a sexta, 8h às 17h, com 1h de almoço','2026-08-13T10:00:00Z','{"area":"Recursos Humanos","workload":"44h","workSchedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","work_schedule":"Segunda a sexta, 8h às 17h, com 1h de almoço","vacancies":1,"status":"ATIVA"}')
) AS v(title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, published_at, metadata)
ON CONFLICT (tenant_id, slug) DO NOTHING;