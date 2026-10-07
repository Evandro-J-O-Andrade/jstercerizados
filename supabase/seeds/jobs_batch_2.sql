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
  ('Auxiliar de Limpeza','auxiliar-de-limpeza','Profissional para limpeza de áreas administrativas e produtivas, com benefícios após efetivação.','Limpeza de áreas administrativas e produtivas, banheiros, vestiários, refeitório, escritórios, descarte de resíduos, abastecimento de materiais de higiene, limpeza de vidros, móveis e equipamentos, apoio em áreas de produção, conservação dos equipamentos, comunicação de irregularidades, cumprimento das normas de segurança e EPIs.','Ensino Médio concluído. Experiência na área.','Vale Transporte, Restaurante na empresa, Assistência Médica após efetivação (Intermédica), Assistência Odontológica após efetivação (Porto Seguro), Convênio Farmácia, Convênio Facil Card, Convênio SESI, Convênio Faculdade',NULL,NULL,'negotiate','temporary','junior','44h','onsite','Arujá','SP',NULL,'2026-08-04T07:00:00Z','{"area":"Industrial","workload":"44h","vacancies":1,"status":"ATIVA"}'),
  ('Auxiliar de marcenaria','auxiliar-de-marcenaria','Profissional para fabricação, montagem e acabamento de estandes, cenários e mobiliários.','Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.','Disponibilidade para viagens. Disponibilidade para período noturno. Disponibilidade para finais de semana e feriados quando necessário.','Alimentação, Vale Transporte, Pagamento de Horas Extras',3000,NULL,'monthly','temporary','junior','220h','onsite','Arujá','SP',NULL,'2026-08-05T08:00:00Z','{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'),
  ('Eletricista de instalação','eletricista-de-instalacao','Profissional para montagem, instalação e manutenção de sistemas elétricos, iluminação e circuitos.','Montagem, instalação, desmontagem de sistemas elétricos, iluminação, fitas e mangueiras de LED, refletores, luminárias, passagem de cabos, quadros, tomadas, circuitos temporários, inspeções, testes, manutenção corretiva, carga e descarga, organização de materiais, EPIs.','Experiência com fitas/mangueiras de LED é diferencial. Conhecimento em instalações elétricas residenciais básicas, circuitos, tomadas, interruptores, luminárias.','Alimentação, Vale Transporte, Pagamento de Horas Extras',3500,NULL,'monthly','clt','mid','220h','onsite','Arujá','SP',NULL,'2026-08-06T08:00:00Z','{"area":"Industrial","workload":"220h","vacancies":1,"status":"ATIVA"}'),
  ('Mecânico industrial','mecanico-industrial','Profissional para manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.','Manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.','Técnico em Mecânica Industrial concluído. Experiência comprovada mínima de 3 anos.','Vale Transporte, Participação de lucros',3600,NULL,'monthly','clt','mid','44h','onsite','Arujá','SP',NULL,'2026-08-07T08:00:00Z','{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sexta, horário comercial","work_schedule":"Segunda a sexta, horário comercial","vacancies":1,"status":"ATIVA"}'),
  ('Assistente de compras','assistente-de-compras','Profissional para pesquisa de fornecedores, cotações, negociação e apoio nas compras.','Pesquisa de fornecedores, homologação, cotações, negociação, pedidos, notas fiscais, planilhas, controles, apoio ao superior.','Ensino Médio concluído. Excel intermediário. Curso profissionalizante em compras/suprimentos ou áreas correlatas.','VT, Café na empresa, VR R$ 380,00, Cesta Básica Física, Seguro de Vida, PLR',NULL,NULL,'negotiate','temporary','junior','44h','onsite','Arujá','SP','A combinar','2026-08-08T08:00:00Z','{"area":"Administração Comercial/Vendas","workload":"44h","workSchedule":"A combinar","work_schedule":"A combinar","vacancies":1,"status":"ATIVA"}'),
  ('Líder de produção','lider-de-producao','Profissional para liderança de equipe, acompanhamento da produção e gestão de melhorias.','Liderança de equipe, acompanhamento da produção, cronograma, desempenho, feedback, banco de horas, escalas, melhorias, comunicação entre áreas.','Ensino Médio concluído. Excel intermediário. Experiência em segmento alimentício é diferencial.','Refeição no local, Vale Alimentação, Vale Transporte, Plano de Saúde custeado 75% pela empresa, Plano Odontológico',3000,NULL,'monthly','temporary','leadership','44h','onsite','Arujá','SP','Segunda a sexta, 5h às 14h48','2026-08-09T08:00:00Z','{"area":"Industrial","workload":"44h","workSchedule":"Segunda a sexta, 5h às 14h48","work_schedule":"Segunda a sexta, 5h às 14h48","vacancies":1,"status":"ATIVA"}'),
  ('Auxiliar administrativo','auxiliar-administrativo','Profissional para atendimento, gestão imobiliária e rotinas administrativas.','Atendimento, relacionamento com inquilinos, proprietários e prestadores, suporte jurídico, cálculos de aluguéis, multas e juros, sistema de gestão imobiliária, dados cadastrais, certidões, rotinas administrativas.','Ensino Médio completo. Experiência administrativa. Excel intermediário. Sistema imobiliário é diferencial. Residir em Arujá.','Vale-Transporte',2500,NULL,'monthly','clt','junior','44h','onsite','Arujá','SP','Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.','2026-08-10T08:00:00Z','{"area":"Administração de Empresas / Patrimônio - Gestão","workload":"44h","workSchedule":"Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.","work_schedule":"Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.","vacancies":1,"status":"ATIVA"}'),
  ('Auxiliar de expedição','auxiliar-de-expedicao','Profissional para separação, conferência, embalagem e expedição de pedidos de e-commerce.','Separação, conferência, pedidos de e-commerce, embalagem, etiquetagem, estoque, recebimento, expedição, organização.','Experiência comprovada. Separação, conferência, embalagem, etiquetagem, estoque, recebimento. Residir em Arujá.','Vale Transporte, Refeição no local, bônus de até R$ 500 por meta',1777.62,NULL,'monthly','clt','junior','44h','onsite','Arujá','SP','Segunda a sexta, 08h às 17h48','2026-08-11T08:00:00Z','{"area":"Logística","workload":"44h","workSchedule":"Segunda a sexta, 08h às 17h48","work_schedule":"Segunda a sexta, 08h às 17h48","vacancies":1,"status":"ATIVA"}')
) AS v(title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, published_at, metadata)
ON CONFLICT (tenant_id, slug) DO NOTHING;