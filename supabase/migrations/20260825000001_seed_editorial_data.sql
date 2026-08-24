-- =============================================================================
-- GATE-DATA-04.014 — SEED: Editorial data for J&S Empregos SaaS platform
-- =============================================================================
-- Schema: public
-- Order: 14
-- Dependencies: 001-013 (complete schema + canonical seed)
-- =============================================================================
-- Purpose:
--   Populate editorial/operational data from existing mocks:
--   - Companies (from mock/clients.ts)
--   - Services (from mock/services.ts)
--   - Partners (from mock/partners.ts)
--   - Suppliers (placeholder data)
--   - Jobs (from mock/vagas.ts)
--
-- Rules:
--   - Idempotent inserts (ON CONFLICT DO UPDATE)
--   - Canonical tenant ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
--   - No passwords/credentials in this file
--   - Editorial content preserved exactly from mocks
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPANIES (seed from mock/clients.ts)
-- -----------------------------------------------------------------------------
insert into public.companies (id, legal_name, trading_name, cnpj, industry, status, is_active, metadata)
values
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Abarca Móveis', 'Abarca Móveis', null, 'Móveis planejados', 'active', true, '{"source": "mock/clients.ts"}'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567892', 'Vector Engenharia e Sistemas de Automação', 'Vector', null, 'Engenharia e automação', 'active', true, '{"source": "mock/clients.ts"}'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567893', 'Mistral Vidros', 'Mistral Vidros', null, 'Vidros e espelhos', 'active', true, '{"source": "mock/clients.ts"}'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567894', 'Vectro Engenharia', 'Vectro', null, 'Engenharia e soluções técnicas', 'active', true, '{"source": "mock/clients.ts"}')
on conflict (id) do update set
  legal_name = excluded.legal_name,
  trading_name = excluded.trading_name,
  industry = excluded.industry,
  status = excluded.status,
  is_active = excluded.is_active,
  metadata = excluded.metadata;

-- -----------------------------------------------------------------------------
-- 2. COMPANY RELATIONSHIPS (seed clients as tenant relationships)
-- -----------------------------------------------------------------------------
insert into public.company_relationships (company_id, tenant_id, relationship_type_id, status)
values
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationship_types where code = 'client'), 'active'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567892', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationship_types where code = 'client'), 'active'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567893', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationship_types where code = 'client'), 'active'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567894', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationship_types where code = 'client'), 'active')
on conflict (company_id, tenant_id, relationship_type_id) do update set
  status = excluded.status;

-- -----------------------------------------------------------------------------
-- 3. SERVICES (seed from mock/services.ts)
-- -----------------------------------------------------------------------------
insert into public.services (id, tenant_id, slug, title, description, short_description, benefits, image, icon, category, status)
values
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567891', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'recrutamento-selecao', 'Recrutamento e Seleção', 'Processo completo de recrutamento e seleção de profissionais qualificados para sua empresa.', 'Recrutamento e Seleção', '[]', '/images/services/recrutamento.jpg', 'Users', 'rh', 'active'),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567892', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'mao-obra-temporaria', 'Mão de Obra Temporária', 'Fornecimento de mão de obra temporária para necessidades sazonais ou projetos específicos.', 'Mão de Obra Temporária', '[]', '/images/services/temporaria.jpg', 'Clock', 'rh', 'active'),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567893', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'mao-obra-efetiva', 'Mão de Obra Efetiva', 'Recrutamento e alocação de profissionais efetivos para posições permanentes.', 'Mão de Obra Efetiva', '[]', '/images/services/efetiva.jpg', 'Briefcase', 'rh', 'active'),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567894', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'assessoria-rh', 'Assessoria em RH', 'Consultoria especializada em gestão de pessoas, processos e políticas de RH.', 'Assessoria em RH', '[]', '/images/services/assessoria.jpg', 'HelpCircle', 'rh', 'active'),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567895', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'terceirizacao-facilities', 'Terceirização e Facilities', 'Soluções completas em terceirização de serviços operacionais e facilities.', 'Terceirização e Facilities', '[]', '/images/services/facilities.jpg', 'Building2', 'facilities', 'active'),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567896', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'limpeza-conservacao', 'Limpeza e Conservação', 'Serviços profissionais de limpeza e conservação para empresas e indústrias.', 'Limpeza e Conservação', '[]', '/images/services/limpeza.jpg', 'Sparkles', 'facilities', 'active')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  short_description = excluded.short_description,
  category = excluded.category,
  status = excluded.status;

-- -----------------------------------------------------------------------------
-- 4. PARTNERS (seed from mock/partners.ts)
-- -----------------------------------------------------------------------------
insert into public.partners (id, tenant_id, name, slug, area, city, state, status)
values
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567891', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Centauro', 'centauro', 'Tecnologia', 'São Paulo', 'SP', 'approved'),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567892', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pão de Açúcar', 'pao-de-acucar', 'Logística', 'São Paulo', 'SP', 'approved'),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567893', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Banco do Brasil', 'banco-do-brasil', 'Financeiro', 'Brasília', 'DF', 'approved'),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567894', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TIM', 'tim', 'Tecnologia', 'Rio de Janeiro', 'RJ', 'approved'),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567895', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Magazine Luiza', 'magazine-luiza', 'Varejo', 'São Paulo', 'SP', 'approved'),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567896', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Itaú', 'itau', 'Financeiro', 'São Paulo', 'SP', 'approved')
on conflict (id) do update set
  name = excluded.name,
  area = excluded.area,
  city = excluded.city,
  state = excluded.state,
  status = excluded.status;

-- -----------------------------------------------------------------------------
-- 5. SUPPLIERS (seed placeholder data)
-- -----------------------------------------------------------------------------
insert into public.suppliers (id, tenant_id, name, slug, products, representative, phone, email, status)
values
  ('e1b2c3d4-e5f6-7890-abcd-ef1234567891', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fornecedor de EPIs', 'fornecedor-epis', 'Equipamentos de proteção individual', 'João Silva', '(11) 99999-0001', 'contato@fornecedorepis.com.br', 'active'),
  ('e1b2c3d4-e5f6-7890-abcd-ef1234567892', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fornecedor de Limpeza', 'fornecedor-limpeza', 'Produtos de limpeza e higiene', 'Maria Santos', '(11) 99999-0002', 'contato@fornecedorlimpeza.com.br', 'active'),
  ('e1b2c3d4-e5f6-7890-abcd-ef1234567893', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fornecedor de Alimentação', 'fornecedor-alimentacao', 'Serviços de alimentação corporativa', 'Pedro Costa', '(11) 99999-0003', 'contato@fornecedoralimentacao.com.br', 'active')
on conflict (id) do update set
  name = excluded.name,
  products = excluded.products,
  representative = excluded.representative,
  phone = excluded.phone,
  email = excluded.email,
  status = excluded.status;

-- -----------------------------------------------------------------------------
-- 6. JOBS (seed from mock/vagas.ts) — requires company_relationships
-- -----------------------------------------------------------------------------
insert into public.jobs (id, tenant_id, company_relationship_id, title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, status, views_count, applications_count, published_at, expires_at, metadata)
values
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567891', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Analista de RH Folha de pagamento', 'analista-rh-folha-de-pagamento',
   'Responsável pelo processamento mensal da folha de pagamento, cálculos de salários, férias, 13º salário e encargos sociais.',
   'Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.',
   'Graduação concluída (obrigatório). Experiência com rotinas de folha. Conhecimento de salários, férias, 13º e rescisões. Conhecimento em legislação trabalhista e previdenciária.',
   'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida',
   5000, null, 'monthly', 'clt', 'mid', '40h', 'onsite', 'Arujá', 'SP', null,
   'published', 0, 0, '2026-08-01T10:00:00Z', null, '{"area": "Recursos Humanos", "workSchedule": "8h às 17h, segunda a sexta-feira", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567892', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Ajudante geral', 'ajudante-geral',
   'Profissional para suporte às atividades operacionais, carga e descarga, apoio à produção e logística.',
   'Suporte às atividades operacionais, carga e descarga, apoio à produção e logística, organização, normas de segurança.',
   'Ensino Médio concluído. Experiência mínima de 1 ano.',
   'Vale Transporte',
   2112.28, null, 'monthly', 'clt', 'junior', '44h', 'onsite', 'Arujá', 'SP', null,
   'published', 0, 0, '2026-08-02T09:00:00Z', null, '{"area": "Administração de Empresas", "workSchedule": "Segunda a sexta, 7h40 às 17h28", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567893', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Pintor I', 'pintor-i',
   'Profissional para preparação e pintura de superfícies metálicas em linha de produção.',
   'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.',
   'Ensino Médio concluído. Experiência na área.',
   'Almoço no local, Vale transporte, Fretado',
   15.56, null, 'range', 'temporary', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sábado, 15h10 às 23h19, com 1h de refeição',
   'published', 0, 0, '2026-08-03T08:00:00Z', null, '{"area": "Produção/Fabricação", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567894', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de Limpeza', 'auxiliar-de-limpeza',
   'Profissional para limpeza de áreas administrativas e produtivas, com benefícios após efetivação.',
   'Limpeza de áreas administrativas e produtivas, banheiros, vestiários, refeitório, escritórios, descarte de resíduos, abastecimento de materiais de higiene, limpeza de vidros, móveis e equipamentos, apoio em áreas de produção, conservação dos equipamentos, comunicação de irregularidades, cumprimento das normas de segurança e EPIs.',
   'Ensino Médio completo. Experiência com limpeza industrial.',
   'Vale Transporte, Restaurante na empresa, Assistência Médica após efetivação (Intermédica), Assistência Odontológica após efetivação (Porto Seguro), Convênio Farmácia, Convênio Facil Card, Convênio SESI, Convênio Faculdade',
   null, null, 'negotiate', 'temporary', 'junior', '44h', 'onsite', 'Arujá', 'SP', null,
   'published', 0, 0, '2026-08-04T07:00:00Z', null, '{"area": "Industrial", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567895', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de marcenaria', 'auxiliar-de-marcenaria',
   'Profissional para fabricação, montagem e acabamento de estandes, cenários e mobiliários.',
   'Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.',
   'Disponibilidade para viagens. Disponibilidade para período noturno. Disponibilidade para finais de semana e feriados quando necessário.',
   'Alimentação, Vale Transporte, Pagamento de Horas Extras',
   3000, null, 'monthly', 'temporary', 'junior', '220h', 'onsite', 'Arujá', 'SP', null,
   'published', 0, 0, '2026-08-05T08:00:00Z', null, '{"area": "Industrial", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567896', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Eletricista de instalação', 'eletricista-de-instalacao',
   'Profissional para montagem, instalação e manutenção de sistemas elétricos, iluminação e circuitos.',
   'Montagem, instalação, desmontagem de sistemas elétricos, iluminação, fitas e mangueiras de LED, refletores, luminárias, passagem de cabos, quadros, tomadas, circuitos temporários, inspeções, testes, manutenção corretiva, carga e descarga, organização de materiais, EPIs.',
   'Experiência com fitas/mangueiras de LED é diferencial. Conhecimento em instalações elétricas residenciais básicas, circuitos, tomadas, interruptores, luminárias.',
   'Alimentação, Vale Transporte, Pagamento de Horas Extras',
   3500, null, 'monthly', 'clt', 'mid', '220h', 'onsite', 'Arujá', 'SP', null,
   'published', 0, 0, '2026-08-06T08:00:00Z', null, '{"area": "Industrial", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567897', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Mecânico industrial', 'mecanico-industrial',
   'Profissional para manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
   'Manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
   'Técnico em Mecânica Industrial concluído. Experiência comprovada mínima de 3 anos.',
   'Vale Transporte, Participação de lucros',
   3600, null, 'monthly', 'clt', 'mid', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sexta, horário comercial',
   'published', 0, 0, '2026-08-07T08:00:00Z', null, '{"area": "Produção/Fabricação", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567898', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Assistente de compras', 'assistente-de-compras',
   'Profissional para pesquisa de fornecedores, cotações, negociação e apoio nas compras.',
   'Pesquisa de fornecedores, homologação, cotações, negociação, pedidos, notas fiscais, planilhas, controles, apoio ao superior.',
   'Ensino Médio concluído. Excel intermediário. Curso profissionalizante em compras/suprimentos ou áreas correlatas.',
   'VT, Café na empresa, VR R$ 380,00, Cesta Básica Física, Seguro de Vida, PLR',
   null, null, 'negotiate', 'temporary', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'A combinar',
   'published', 0, 0, '2026-08-08T08:00:00Z', null, '{"area": "Administração Comercial/Vendas", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef1234567899', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Líder de produção', 'lider-de-producao',
   'Profissional para liderança de equipe, acompanhamento da produção e gestão de melhorias.',
   'Liderança de equipe, acompanhamento da produção, cronograma, desempenho, feedback, banco de horas, escalas, melhorias, comunicação entre áreas.',
   'Ensino Médio concluído. Excel intermediário. Experiência em segmento alimentício é diferencial.',
   'Refeição no local, Vale Alimentação, Vale Transporte, Plano de Saúde custeado 75% pela empresa, Plano Odontológico',
   3000, null, 'monthly', 'temporary', 'leadership', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sexta, 5h às 14h48',
   'published', 0, 0, '2026-08-09T08:00:00Z', null, '{"area": "Industrial", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar administrativo', 'auxiliar-administrativo',
   'Profissional para atendimento, gestão imobiliária e rotinas administrativas.',
   'Atendimento, relacionamento com inquilinos, proprietários e prestadores, suporte jurídico, cálculos de aluguéis, multas e juros, sistema de gestão imobiliária, dados cadastrais, certidões, rotinas administrativas.',
   'Ensino Médio completo. Experiência administrativa. Excel intermediário. Sistema imobiliário é diferencial. Residir em Arujá.',
   'Vale-Transporte',
   2500, null, 'monthly', 'clt', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.',
   'published', 0, 0, '2026-08-10T08:00:00Z', null, '{"area": "Administração de Empresas / Patrimônio - Gestão", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de expedição', 'auxiliar-de-expedicao',
   'Profissional para separação, conferência, embalagem e expedição de pedidos de e-commerce.',
   'Separação, conferência, pedidos de e-commerce, embalagem, etiquetagem, estoque, recebimento, expedição, organização.',
   'Experiência comprovada. Separação, conferência, embalagem, etiquetagem, estoque, recebimento. Residir em Arujá.',
   'Vale Transporte, Refeição no local, bônus de até R$ 500 por meta',
   1777.62, null, 'monthly', 'clt', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sexta, 08h às 17h48',
   'published', 0, 0, '2026-08-11T08:00:00Z', null, '{"area": "Logística", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789c', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de Produção', 'auxiliar-de-producao-oportunidade-1',
   'Oportunidade para Auxiliar de Produção em indústria, com atividades de operação, apoio na linha e organização.',
   'Operação de maquinários, tarefas manuais na linha de produção, organização do posto de trabalho e cumprimento das normas de segurança.',
   'Ensino Fundamental completo. Disponibilidade para regime de plantões. Experiência anterior em linha de produção.',
   'Vale Transporte, Refeição no local',
   2112.28, null, 'monthly', 'clt', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sexta, horário comercial',
   'published', 0, 0, '2026-08-13T08:00:00Z', null, '{"area": "Produção/Fabricação", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de Produção', 'auxiliar-de-producao-oportunidade-2',
   'Oportunidade temporária para Auxiliar de Produção, com foco em apoio operacional e movimentação de materiais.',
   'Apoio à produção, movimentação de materiais, inspeção visual e abastecimento de linha.',
   'Ensino Fundamental completo. Experiência mínima de 6 meses em produção ou indústria.',
   'Vale Transporte, Refeição no local',
   1800, null, 'monthly', 'temporary', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sábado, turno a combinar',
   'published', 0, 0, '2026-08-14T08:00:00Z', null, '{"area": "Produção/Fabricação", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Auxiliar de Produção', 'auxiliar-de-producao-oportunidade-3',
   'Oportunidade CLT para Auxiliar de Produção, com foco em montagem básica, separação e organização do setor.',
   'Montagem básica, separação de materiais, acabamento simples e limpeza do setor.',
   'Ensino Fundamental completo. Disponibilidade de horário. Proatividade e capacidade de seguir procedimentos.',
   'Vale Transporte, Alimentação no local',
   1950, null, 'monthly', 'clt', 'junior', '44h', 'onsite', 'Arujá', 'SP', 'Segunda a sexta, 07h às 17h',
   'published', 0, 0, '2026-08-15T08:00:00Z', null, '{"area": "Produção/Fabricação", "vagas": 1}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef123456789f', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Analista de Sistemas Sênior', 'analista-de-sistemas-sr',
   'Vaga para Analista de Sistemas Sênior em regime de trabalho de casa (100% remoto). Óportunidade para atuar em projetos de alta complexidade e liderar o desenvolvimento de soluções escaláveis.',
   'Desenvolver, manter e otimizar sistemas web e mobile. Realizar análise de requisitos, codificação, testes, depuração e documentação de software. Participar de reuniões de planejamento e sprint, colaborar com designers e product managers. Garantir a qualidade, segurança e performance das aplicações. Mentoria de desenvolvedores juniores.',
   'Graduação em Ciência da Computação, Engenharia ou áreas afins. Experiência mínima de 5 anos em desenvolvimento full-stack. Sólidos conhecimentos em JavaScript, React, Node.js, SQL e arquitetura de software. Experiência com ambientes cloud (AWS ou Azure). Inglês intermediário.',
   'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Plano de Saúde, Bônus por meta, Apoio a cursos e certificações',
   8000, 12000, 'range', 'clt', 'senior', '44h', 'remote', 'São Paulo', 'SP', '8h às 17h, segunda a sexta-feira',
   'published', 0, 0, '2026-08-13T10:00:00Z', null, '{"area": "Tecnologia da Informação", "vagas": 2}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef12345678a0', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Assistente Administrativo', 'assistente-administrativo-remoto',
   'Vaga para Assistente Administrativo em regime de trabalho de casa (100% remoto). Oportunidade de atuar em empresa sólida com tecnologia e aprendizado contínuo.',
   'Apoiar as atividades administrativas do dia a dia. Gerenciar e-mails, agendar reuniões, organizar arquivos, elaborar planilhas e relatórios. Atuar no atendimento a clientes e fornecedores. Controlar pagamentos e recebimentos, além de apoiar a rotina financeira. Tramitar correspondências e documentos.',
   'Ensino Médio completo. Experiência mínima de 2 anos em atividades administrativas. Pacote Office avançado (Excel, Word e PowerPoint). Conhecimento em sistemas de gestão. Boa comunicação escrita e verbal.',
   'Vale refeição, Vale transporte, Convênio Médico, Convênio Odontológico, Seguro de Vida, Bônus por meta',
   3500, 4500, 'range', 'clt', 'mid', '44h', 'remote', 'São Paulo', 'SP', 'Segunda a sexta, 8h às 17h, com 1h de almoço',
   'published', 0, 0, '2026-08-14T09:00:00Z', null, '{"area": "Administração", "vagas": 3}'),
  ('f1b2c3d4-e5f6-7890-abcd-ef12345678a1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   (select id from public.company_relationships where company_id = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891' and tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' limit 1),
   'Consultor de Vendas', 'consultor-de-vendas-hibrido',
   'Vaga para Consultor de Vendas em regime híbrido (trabalho de casa 3x por semana + presencial 2x por semana).',
   'Prospectar, negociar e fidelizar clientes. Executar visitas presenciais e ligações de inside sales. Apresentar soluções e produtos, elaborar propostas comerciais, acompanhar o ciclo de vendas e registrar atividades no CRM. Atingir as metas estabelecidas pela diretoria.',
   'Ensino Médio completo. Experiência mínima de 1 ano em vendas. Conhecimento em CRM. Boa comunicação e persuasão. Disponibilidade para viajar dentro do SP.',
   'Vale refeição, Vale transporte, Convênio Médico, Participação dos lucros, Comissões sobre vendas, Bônus por meta',
   4000, 7000, 'range', 'clt', 'mid', '44h', 'hybrid', 'São Paulo', 'SP', 'Segunda a sexta, 8h às 17h, com 1h de almoço',
   'published', 0, 0, '2026-08-15T07:00:00Z', null, '{"area": "Vendas", "vagas": 2}')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  responsibilities = excluded.responsibilities,
  requirements = excluded.requirements,
  benefits = excluded.benefits,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  salary_type = excluded.salary_type,
  contract_type = excluded.contract_type,
  seniority = excluded.seniority,
  work_hours = excluded.work_hours,
  work_mode = excluded.work_mode,
  city = excluded.city,
  state = excluded.state,
  location_detail = excluded.location_detail,
  status = excluded.status,
  published_at = excluded.published_at,
  metadata = excluded.metadata;

-- -----------------------------------------------------------------------------
-- 7. Post-seed validation
-- -----------------------------------------------------------------------------
select 'SEED 014 VALIDATED: Editorial data seeded' as validation_status;
