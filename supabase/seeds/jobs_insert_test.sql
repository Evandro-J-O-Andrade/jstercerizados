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
  ('Analista de RH - Folha de Pagamento','analista-rh-folha-de-pagamento','Responsável pelo processamento mensal da folha de pagamento, cálculos de salários, férias, 13º salário e encargos sociais.','Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.','Formação superior em RH, Administração, Ciências Atuárias, Pedagogia ou áreas afins. Conhecimento em legislação trabalhista e previdenciária. Experiência em processamento de folha de pagamento. Conhecimento em sistemas de RH e ERP. Excelente atenção a detalhes e capacidade analítica. Disponibilidade para trabalho em regime presencial.','Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida',5000.00,NULL,'monthly','clt','mid','40h','onsite','Arujá','SP',NULL,'2026-08-01T10:00:00Z','{"area":"Recursos Humanos","workload":"40h","workSchedule":"8h às 17h, segunda a sexta-feira","work_schedule":"8h às 17h, segunda a sexta-feira","vacancies":1,"status":"ATIVA"}'),
  ('Ajudante geral','ajudante-geral','Profissional para suporte às atividades operacionais, carga e descarga, apoio à produção e logística.','Suporte às atividades operacionais, carga e descarga, apoio à produção e logística, organização, normas de segurança.','Ensino Médio concluído. Experiência mínima de 1 ano.','Vale Transporte',2112.28,NULL,'monthly','temporary','junior','44h','onsite','Arujá','SP',NULL,'2026-08-02T09:00:00Z','{"area":"Administração de Empresas","workload":"44h","workSchedule":"Segunda a sexta, 7h40 às 17h28","work_schedule":"Segunda a sexta, 7h40 às 17h28","vacancies":1,"status":"ATIVA"}'),
  ('Pintor I','pintor-i','Profissional para preparação e pintura de superfícies metálicas em linha de produção.','Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.','Ensino Médio concluído. Experiência na área.','Almoço no local, Vale transporte, Fretado',15.56,NULL,'negotiate','temporary','junior','44h','onsite','Arujá','SP',NULL,'2026-08-03T08:00:00Z','{"area":"Produção/Fabricação","workload":"44h","workSchedule":"Segunda a sábado, 15h10 às 23h19, com 1h de refeição","work_schedule":"Segunda a sábado, 15h10 às 23h19, com 1h de refeição","vacancies":1,"status":"ATIVA"}')
) AS v(title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, published_at, metadata)
ON CONFLICT (tenant_id, slug) DO NOTHING;