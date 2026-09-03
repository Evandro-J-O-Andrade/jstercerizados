-- =============================================================================
-- BLOCO 3 - VIEW public_services_v1 + seed dos 20 servicos institucionais
-- =============================================================================
-- Purpose:
--   Expor publicamente (anon/authenticated) o catalogo de servicos publicados
--   da J&S Empregos LTDA com escopo multi-tenant seguro via slug do tenant.
--
--   Decisoes aprovadas:
--     - tenant_id NAO exposto no contrato publico
--     - VIEW restringe internamente a tenants.slug = 'js-empregos'
--     - Seed resolve tenant por slug (sem UUID hardcoded)
--     - Seed idempotente via ON CONFLICT (id) DO UPDATE
--     - 20 servicos institucionais (8 RH + 11 Facilities + 1 Terceirizacao)
--     - Features de candidato (cadastro-curriculo, busca-vagas, alertas-emprego,
--       orientacao-profissional, atualizacao-curriculo) NAO entram no catalogo
--     - gallery em media_assets (entity_type='service') - nao em services.metadata
--     - mock/services.ts preservado como fallback
--     - contrato VIEW explicito (nao usa s.*)
--
--   Conteudo derivado de src/services/mock/services.ts (snapshot aprovado).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. VIEW public_services_v1
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.public_services_v1 AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.category,
  s.short_description,
  s.description,
  s.card_image_url,
  s.hero_image_url,
  s.hero_title,
  s.hero_subtitle,
  s.icon,
  s.benefits,
  s.process_steps,
  s.cta_title,
  s.cta_description,
  s.cta_button_text,
  s.cta_button_url,
  s.status,
  s.published_at,
  s.display_order,
  s.seo_title,
  s.seo_description,
  s.seo_keywords
FROM public.services s
WHERE s.status = 'published'
  AND s.tenant_id = (
    SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1
  );

COMMENT ON VIEW public.public_services_v1 IS
  'Public read-only view exposing the institutional service catalog of '
  'J&S Empregos LTDA (tenant slug = js-empregos). Used by /servicos and '
  '/servicos/:slug. tenant_id is intentionally NOT exposed.';

ALTER VIEW public.public_services_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_services_v1 TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. Seed - 20 servicos institucionais
-- -----------------------------------------------------------------------------
--   Categorias:
--     rh            (8)  - Recursos Humanos
--     facilities    (11) - Facilities / operacionais
--     terceirizacao (1)  - Terceirizacao
--
--   Conteudo derivado de src/services/mock/services.ts.
--   Campos do banco sem equivalente no MOCK recebem NULL/valor seguro.
-- -----------------------------------------------------------------------------

-- Resolve o tenant canonico pelo slug (padrao usado em 20260824000001_seed_jobs.sql).
WITH js_tenant AS (
  SELECT id AS tenant_id
  FROM public.tenants
  WHERE slug = 'js-empregos'
  LIMIT 1
)
INSERT INTO public.services (
  id,
  tenant_id,
  slug,
  name,
  category,
  short_description,
  description,
  card_image_url,
  hero_image_url,
  icon,
  benefits,
  status,
  published_at,
  display_order
)
SELECT
  v.id::uuid,
  js_tenant.tenant_id,
  v.slug,
  v.name,
  v.category,
  v.short_description,
  v.description,
  v.card_image_url,
  v.hero_image_url,
  v.icon,
  v.benefits::jsonb,
  'published',
  now(),
  v.display_order
FROM js_tenant
CROSS JOIN (VALUES
  -- Recursos Humanos (8)
  (
    'a1b2c3d4-0001-7000-8000-000000000001'::text,
    'recrutamento-selecao',
    'Recrutamento e Seleção',
    'rh',
    'Encontramos os melhores talentos para as posições estratégicas da sua empresa.',
    'Serviço completo de recrutamento e seleção de profissionais qualificados para sua empresa. Encontramos os melhores talentos para as posições estratégicas da sua organização.',
    '/images/servicos/recrutamento-selecao/recrutamento-alt.jfif',
    '/images/servicos/recrutamento-selecao/recrutamento-alt.jfif',
    'users',
    '["Acesso a currículos qualificados","Triagem inicial qualificada","Avaliação de competências técnicas","Processo seletivo ágil","Garantia de contratação","Suporte até a contratação"]',
    10
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000002'::text,
    'mao-de-obra-temporaria',
    'Mão de Obra Temporária',
    'rh',
    'Solução rápida e flexível para picos de demanda e projetos específicos.',
    'Solução rápida e flexível para picos de demanda, substituições e projetos. Conectamos sua empresa a profissionais qualificados para períodos específicos.',
    '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    'clock',
    '["Contratação flexível por período","Profissionais pré-qualificados","Redução de custos trabalhistas","Escalabilidade sob demanda","Compliance total com a Lei 6.019/74","Gestão completa incluída"]',
    20
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000003'::text,
    'mao-de-obra-efetiva',
    'Mão de Obra Efetiva',
    'rh',
    'Contratação de profissionais permanentes com seleção completa e acompanhamento.',
    'Contratação de profissionais para posições permanentes com um processo seletivo completo e acompanhamento pós-contratação para garantir a adaptação.',
    '/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg',
    '/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg',
    'award',
    '["Processo seletivo completo","Acompanhamento pós-contratação","Garantia de substituição","Redução de turnover","Alinhamento com a cultura da empresa"]',
    30
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000004'::text,
    'assessoria-rh',
    'Assessoria em RH',
    'rh',
    'Profissional de RH dedicado para processos seletivos, gestão e consultoria estratégica.',
    'Tenha um profissional de RH dedicado à sua empresa para cuidar de processos seletivos, gestão de pessoas e consultoria estratégica.',
    '/images/servicos/assessoria-rh.png',
    '/images/servicos/assessoria-rh.png',
    'briefcase',
    '["Profissional de RH dedicado","Otimização de processos internos","Consultoria em gestão de pessoas","Redução de custos com departamento de RH","Suporte em legislação trabalhista"]',
    40
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000005'::text,
    'avaliacao-perfil',
    'Avaliação de Perfil',
    'rh',
    'Avaliações psicométricas e entrevistas para garantir o candidato ideal.',
    'Avaliação psicométrica, testes técnicos e entrevistas estruturadas para garantir que o candidato certo esteja no lugar certo.',
    '/images/servicos/avaliacao-perfil/avaliacao-perfil.jpg',
    '/images/servicos/avaliacao-perfil/avaliacao-perfil.jpg',
    'target',
    '["Testes técnicos online","Avaliação comportamental","Entrevistas estruturadas","Análise de competências","Score de adequação","Recomendações personalizadas"]',
    50
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000006'::text,
    'banco-de-talentos',
    'Banco de Talentos',
    'rh',
    'Cadastre seu currículo e seja encontrado por empresas parceiras.',
    'Mantenha seu currículo atualizado no nosso Banco de Talentos e seja encontrado por empresas que buscam profissionais como você.',
    '/images/servicos/banco-de-talentos/banco-de-talentos.jpg',
    '/images/servicos/banco-de-talentos/banco-de-talentos.jpg',
    'users',
    '["Cadastro rápido e gratuito","Currículo visível para empresas parceiras","Atualização de dados","Alertas de novas vagas","Acesso a currículos qualificados"]',
    60
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000007'::text,
    'processo-de-rh',
    'Processo de RH',
    'rh',
    'Estruturamos todo o processo de recrutamento e seleção da sua empresa.',
    'Estruturamos todo o processo de recrutamento e seleção da sua empresa, desde a abertura da vaga até a integração do novo colaborador.',
    '/images/servicos/processo-de-rh/processo-de-rh.jpg',
    '/images/servicos/solucao-rh.jfif',
    'briefcase',
    '["Estruturação de processos","Metodologias de seleção","Acompanhamento de indicadores","Integração de novos colaboradores","Relatórios de eficiência","Melhoria contínua"]',
    70
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000008'::text,
    'hunting',
    'Executive Search (Hunting)',
    'rh',
    'Busca discreta e direcionada para cargos de alta performance e liderança.',
    'Busca discreta e direcionada para cargos de alta performance e liderança. Encontramos profissionais que não estão no mercado, mas que são ideais para sua vaga.',
    '/images/servicos/hunting/executive-search.jpg',
    '/images/servicos/hunting/executive-search.jpg',
    'search',
    '["Busca discreta e confidencial","Headhunting especializado","Acesso a perfis raros","Validação de competências","Oferta personalizada","Garantia de resultado"]',
    80
  ),
  -- Facilities / Operacionais (11)
  (
    'a1b2c3d4-0001-7000-8000-000000000009'::text,
    'facilities',
    'Facilities',
    'facilities',
    'Serviços operacionais integrados: limpeza, segurança, portaria e zeladoria.',
    'Como solução complementar, oferecemos terceirização de serviços operacionais: limpeza, segurança, portaria, jardinagem, recepção e zeladoria.',
    '/images/servicos/facilities/facilities-real.webp',
    '/images/servicos/facilities/facilities-real.webp',
    'building',
    '["Redução de custos operacionais","Profissionais treinados e certificados","Gestão completa de equipes","Conformidade legal garantida","SLA e KPIs de qualidade","Foco no seu core business"]',
    90
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000010'::text,
    'jardinagem',
    'Jardinagem',
    'facilities',
    'Manutenção e conservação de áreas verdes com qualidade e profissionalismo.',
    'Serviço completo de jardinagem e paisagismo para manter suas áreas verdes sempre cuidadas, com projetos personalizados e manutenção periódica.',
    '/images/servicos/jardinagem/jardinagem-real.webp',
    '/images/servicos/jardinagem/jardinagem-real.webp',
    'leaf',
    '["Projetos paisagísticos","Manutenção de jardins","Cuidados com plantas e grama","Sistemas de irrigação","Limpeza de áreas verdes","Equipe especializada"]',
    100
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000011'::text,
    'limpeza-de-fachada',
    'Limpeza de Fachada',
    'facilities',
    'Limpeza especializada de fachadas e vidros com segurança e qualidade.',
    'Serviço especializado de limpeza de fachadas e vidros com técnicas seguras, produtos ecológicos e equipe treinada para alturas.',
    '/images/servicos/limpeza-de-fachada/limpeza-de-fachada.webp',
    '/images/servicos/limpeza-fachada.svg',
    'sparkles',
    '["Equipe treinada para altura","Produtos ecológicos","Equipamentos de segurança","Acabamento impecável","Agendamento flexível","Garantia de qualidade"]',
    110
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000012'::text,
    'limpeza-de-vidros',
    'Limpeza de Vidros',
    'facilities',
    'Limpeza profissional de vidros e espelhos sem marcas e sem riscos.',
    'Serviço especializado de limpeza de vidros e espelhos com produtos e técnicas que garantem acabamento sem marcas, sem riscos e sem resíduos.',
    '/images/servicos/limpeza-de-vidros/limpeza-de-vidros.webp',
    '/images/servicos/limpeza-vidros.svg',
    'sparkles',
    '["Produtos específicos para vidro","Sem marcas ou riscos","Equipe treinada","Atendimento residencial e comercial","Agendamento rápido","Garantia de satisfação"]',
    120
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000013'::text,
    'faxina-diarista',
    'Faxina Diarista',
    'facilities',
    'Serviço de faxina residencial e comercial com limpeza profunda e organização.',
    'Serviço de faxina diarista residencial e comercial com limpeza profunda, organização de ambientes e atenção aos detalhes para deixar tudo impecável.',
    '/images/servicos/faxina-diarista/faxina.webp',
    '/images/servicos/faxina.svg',
    'sparkles',
    '["Limpeza profunda","Organização de ambientes","Produtos ecológicos","Profissionais treinados","Atendimento personalizado","Flexibilidade de horário"]',
    130
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000014'::text,
    'limpeza-pos-obra',
    'Limpeza Pós-Obra',
    'facilities',
    'Limpeza pós-obra para deixar imóveis novos ou reformados prontos para uso.',
    'Serviço especializado de limpeza pós-obra para remover resíduos de construção, poeira e sujeira pesada, deixando o imóvel pronto para uso.',
    '/images/servicos/limpeza-pos-obra/limpeza-pos-obra.webp',
    '/images/servicos/limpeza-pos-obra.svg',
    'sparkles',
    '["Remoção de resíduos","Limpeza profunda","Produtos específicos","Equipe equipada","Atendimento rápido","Garantia de resultado"]',
    140
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000015'::text,
    'limpeza-pre-mudanca',
    'Limpeza Pré-Mudança',
    'facilities',
    'Preparação completa do imóvel antes da mudança para proteger superfícies e itens.',
    'Serviço de limpeza pré-mudança para preparar imóveis antes da mudança, removendo poeira, sujeira e protegendo áreas e itens. Garanta um ambiente limpo e seguro durante todo o processo de mudança.',
    '/images/servicos/limpeza-pre-mudanca/limpeza-pre-mudanca.webp',
    '/images/servicos/limpeza-pre-mudanca.svg',
    'sparkles',
    '["Limpeza profunda completa","Proteção de superfícies","Remoção de poeira e detritos","Equipe especializada","Agendamento flexível","Garantia de satisfação"]',
    150
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000016'::text,
    'limpeza-pos-mudanca',
    'Limpeza Pós-Mudança',
    'facilities',
    'Limpeza profunda e organização do imóvel após a mudança para deixar tudo impecável.',
    'Serviço de limpeza pós-mudança para deixar seu imóvel impecável após a mudança. Removemos poeira da mudança, organizamos e higienizamos todos os ambientes.',
    '/images/servicos/limpeza-pos-mudanca/limpeza-pos-mudanca.webp',
    '/images/servicos/limpeza-pos-mudanca.svg',
    'sparkles',
    '["Limpeza profunda pós-mudança","Remoção de poeira da mudança","Higienização completa","Organização de ambientes","Equipe especializada","Acabamento impecável"]',
    160
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000017'::text,
    'zeladoria-manutencao',
    'Zeladoria e Manutenção',
    'facilities',
    'Manutenção preventiva e conservação de instalações para condomínios e empresas.',
    'Serviço de zeladoria com manutenção preventiva, conservação de instalações e suporte operacional para condomínios e empresas.',
    '/images/servicos/zeladoria/zeladoria-real.png',
    '/images/servicos/zeladoria.svg',
    'wrench',
    '["Manutenção preventiva","Conservação de instalações","Suporte operacional","Pequenos reparos","Gestão de áreas comuns","Inspeções regulares"]',
    170
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000018'::text,
    'controle-acesso',
    'Controle de Acesso',
    'facilities',
    'Portaria 24h, recepção e controle de fluxo de pessoas para sua empresa ou condomínio.',
    'Serviço completo de controle de acesso com portaria 24h, recepção e monitoramento de fluxo de pessoas, garantindo segurança e organização.',
    '/images/servicos/controle-acesso/controle-de-acesso.jpg',
    '/images/servicos/controle-acesso/controle-de-acesso.jpg',
    'shield',
    '["Portaria 24h","Recepção e atendimento","Controle de fluxo de pessoas","Interfonia e catraca","Relatórios de acesso","Equipe treinada"]',
    180
  ),
  (
    'a1b2c3d4-0001-7000-8000-000000000019'::text,
    'portaria',
    'Recepção e Portaria',
    'facilities',
    'Equipe qualificada para recepção, portaria e segurança do seu local.',
    'Serviço de recepção e portaria com equipe qualificada para atender visitantes, controlar acesso e garantir a segurança do seu estabelecimento.',
    '/images/servicos/portaria/recepcao-e-portaria.jpg',
    '/images/servicos/portaria/recepcao-e-portaria.jpg',
    'clipboard-check',
    '["Atendimento a visitantes","Controle de veículos","Portaria 24h","Equipe uniformizada","Protocolo de entregas","Horários flexíveis"]',
    190
  ),
  -- Terceirizacao (1)
  (
    'a1b2c3d4-0001-7000-8000-000000000020'::text,
    'terceirizacao',
    'Terceirização',
    'terceirizacao',
    'Terceirização de serviços operacionais e equipes especializadas para sua empresa.',
    'Terceirização de serviços operacionais e equipes especializadas para reduzir custos, aumentar a eficiência e garantir conformidade trabalhista.',
    '/images/servicos/terceirizacao/terceirizacao-real.webp',
    '/images/servicos/terceirizacao/terceirizacao-real.webp',
    'building',
    '["Redução de custos","Equipes qualificadas","Gestão de pessoas","Conformidade trabalhista","Escalabilidade","Foco no core business"]',
    200
  )
) AS v(
  id,
  slug,
  name,
  category,
  short_description,
  description,
  card_image_url,
  hero_image_url,
  icon,
  benefits,
  display_order
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  card_image_url = EXCLUDED.card_image_url,
  hero_image_url = EXCLUDED.hero_image_url,
  icon = EXCLUDED.icon,
  benefits = EXCLUDED.benefits,
  status = 'published',
  published_at = EXCLUDED.published_at,
  display_order = EXCLUDED.display_order;

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Validation
-- -----------------------------------------------------------------------------

SELECT 'public_services_v1 view + 20 services seeded' AS status;
