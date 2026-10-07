-- =============================================================================
-- J&S Empregos LTDA - Catalogo de Servicos
-- =============================================================================
-- Idempotent: ON CONFLICT (tenant_id, slug) DO NOTHING
-- References tenant by slug, not hardcoded UUID.
--
-- Covers all 20 institutional services from the canonical migration
-- (20260902170003_bloco3_public_services_v1.sql) matching the
-- public_services_v1 view contract.
--
-- Categories:
--   rh            (8)  - Recursos Humanos
--   facilities    (11) - Facilities / operacionais
--   terceirizacao (1)  - Terceirizacao
-- =============================================================================

BEGIN;

WITH js_tenant AS (
  SELECT id AS tenant_id
  FROM public.tenants
  WHERE slug = 'js-empregos'
  LIMIT 1
)
INSERT INTO public.services (
  tenant_id, slug, name, category, short_description, description,
  card_image_url, hero_image_url, icon, benefits, process_steps,
  status, published_at, display_order
)
SELECT
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
  v.process_steps::jsonb,
  'published',
  now(),
  v.display_order
FROM js_tenant
CROSS JOIN (VALUES

  -- =====================================================================
  -- Recursos Humanos (8)
  -- =====================================================================

  (
    'recrutamento-selecao',
    'Recrutamento e Seleção',
    'rh',
    'Encontramos os melhores talentos para as posições estratégicas da sua empresa.',
    'Serviço completo de recrutamento e seleção de profissionais qualificados para sua empresa. Encontramos os melhores talentos para as posições estratégicas da sua organização.',
    '/images/servicos/recrutamento-selecao/recrutamento-alt.jfif',
    '/images/servicos/recrutamento-selecao/recrutamento-alt.jfif',
    'users',
    '["Acesso a currículos qualificados","Triagem inicial qualificada","Avaliação de competências técnicas","Processo seletivo ágil","Garantia de contratação","Suporte até a contratação"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    10
  ),
  (
    'mao-de-obra-temporaria',
    'Mão de Obra Temporária',
    'rh',
    'Solução rápida e flexível para picos de demanda e projetos específicos.',
    'Solução rápida e flexível para picos de demanda, substituições e projetos. Conectamos sua empresa a profissionais qualificados para períodos específicos.',
    '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    'clock',
    '["Contratação flexível por período","Profissionais pré-qualificados","Redução de custos trabalhistas","Escalabilidade sob demanda","Compliance total com a Lei 6.019/74","Gestão completa incluída"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    20
  ),
  (
    'mao-de-obra-efetiva',
    'Mão de Obra Efetiva',
    'rh',
    'Contratação de profissionais permanentes com seleção completa e acompanhamento.',
    'Contratação de profissionais para posições permanentes com um processo seletivo completo e acompanhamento pós-contratação para garantir a adaptação.',
    '/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg',
    '/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg',
    'award',
    '["Processo seletivo completo","Acompanhamento pós-contratação","Garantia de substituição","Redução de turnover","Alinhamento com a cultura da empresa"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    30
  ),
  (
    'assessoria-rh',
    'Assessoria em RH',
    'rh',
    'Profissional de RH dedicado para processos seletivos, gestão e consultoria estratégica.',
    'Tenha um profissional de RH dedicado à sua empresa para cuidar de processos seletivos, gestão de pessoas e consultoria estratégica.',
    '/images/servicos/assessoria-rh.png',
    '/images/servicos/assessoria-rh.png',
    'briefcase',
    '["Profissional de RH dedicado","Otimização de processos internos","Consultoria em gestão de pessoas","Redução de custos com departamento de RH","Suporte em legislação trabalhista"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    40
  ),
  (
    'avaliacao-perfil',
    'Avaliação de Perfil',
    'rh',
    'Avaliações psicométricas e entrevistas para garantir o candidato ideal.',
    'Avaliação psicométrica, testes técnicos e entrevistas estruturadas para garantir que o candidato certo esteja no lugar certo.',
    '/images/servicos/avaliacao-perfil/avaliacao-perfil.jpg',
    '/images/servicos/avaliacao-perfil/avaliacao-perfil.jpg',
    'target',
    '["Testes técnicos online","Avaliação comportamental","Entrevistas estruturadas","Análise de competências","Score de adequação","Recomendações personalizadas"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    50
  ),
  (
    'banco-de-talentos',
    'Banco de Talentos',
    'rh',
    'Cadastre seu currículo e seja encontrado por empresas parceiras.',
    'Mantenha seu currículo atualizado no nosso Banco de Talentos e seja encontrado por empresas que buscam profissionais como você.',
    '/images/servicos/banco-de-talentos/banco-de-talentos.jpg',
    '/images/servicos/banco-de-talentos/banco-de-talentos.jpg',
    'users',
    '["Cadastro rápido e gratuito","Currículo visível para empresas parceiras","Atualização de dados","Alertas de novas vagas","Acesso a currículos qualificados"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    60
  ),
  (
    'processo-de-rh',
    'Processo de RH',
    'rh',
    'Estruturamos todo o processo de recrutamento e seleção da sua empresa.',
    'Estruturamos todo o processo de recrutamento e seleção da sua empresa, desde a abertura da vaga até a integração do novo colaborador.',
    '/images/servicos/processo-de-rh/processo-de-rh.jpg',
    '/images/servicos/solucao-rh.jfif',
    'briefcase',
    '["Estruturação de processos","Metodologias de seleção","Acompanhamento de indicadores","Integração de novos colaboradores","Relatórios de eficiência","Melhoria contínua"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    70
  ),
  (
    'hunting',
    'Executive Search (Hunting)',
    'rh',
    'Busca discreta e direcionada para cargos de alta performance e liderança.',
    'Busca discreta e direcionada para cargos de alta performance e liderança. Encontramos profissionais que não estão no mercado, mas que são ideais para sua vaga.',
    '/images/servicos/hunting/executive-search.jpg',
    '/images/servicos/hunting/executive-search.jpg',
    'search',
    '["Busca discreta e confidencial","Headhunting especializado","Acesso a perfis raros","Validação de competências","Oferta personalizada","Garantia de resultado"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    80
  ),

  -- =====================================================================
  -- Facilities / Operacionais (11)
  -- =====================================================================

  (
    'facilities',
    'Facilities',
    'facilities',
    'Serviços operacionais integrados: limpeza, segurança, portaria e zeladoria.',
    'Como solução complementar, oferecemos terceirização de serviços operacionais: limpeza, segurança, portaria, jardinagem, recepção e zeladoria.',
    '/images/servicos/facilities/facilities-real.webp',
    '/images/servicos/facilities/facilities-real.webp',
    'building',
    '["Redução de custos operacionais","Profissionais treinados e certificados","Gestão completa de equipes","Conformidade legal garantida","SLA e KPIs de qualidade","Foco no seu core business"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    90
  ),
  (
    'jardinagem',
    'Jardinagem',
    'facilities',
    'Manutenção e conservação de áreas verdes com qualidade e profissionalismo.',
    'Serviço completo de jardinagem e paisagismo para manter suas áreas verdes sempre cuidadas, com projetos personalizados e manutenção periódica.',
    '/images/servicos/jardinagem/jardinagem-real.webp',
    '/images/servicos/jardinagem/jardinagem-real.webp',
    'leaf',
    '["Projetos paisagísticos","Manutenção de jardins","Cuidados com plantas e grama","Sistemas de irrigação","Limpeza de áreas verdes","Equipe especializada"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    100
  ),
  (
    'limpeza-de-fachada',
    'Limpeza de Fachada',
    'facilities',
    'Limpeza especializada de fachadas e vidros com segurança e qualidade.',
    'Serviço especializado de limpeza de fachadas e vidros com técnicas seguras, produtos ecológicos e equipe treinada para alturas.',
    '/images/servicos/limpeza-de-fachada/limpeza-de-fachada.webp',
    '/images/servicos/limpeza-fachada/limpeza-de-fachada.webp',
    'sparkles',
    '["Equipe treinada para altura","Produtos ecológicos","Equipamentos de segurança","Acabamento impecável","Agendamento flexível","Garantia de qualidade"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    110
  ),
  (
    'limpeza-de-vidros',
    'Limpeza de Vidros',
    'facilities',
    'Limpeza profissional de vidros e espelhos sem marcas e sem riscos.',
    'Serviço especializado de limpeza de vidros e espelhos com produtos e técnicas que garantem acabamento sem marcas, sem riscos e sem resíduos.',
    '/images/servicos/limpeza-de-vidros/limpeza-de-vidros.webp',
    '/images/servicos/limpeza-de-vidros/limpeza-de-vidros.webp',
    'sparkles',
    '["Produtos específicos para vidro","Sem marcas ou riscos","Equipe treinada","Atendimento residencial e comercial","Agendamento rápido","Garantia de satisfação"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    120
  ),
  (
    'faxina-diarista',
    'Faxina Diarista',
    'facilities',
    'Serviço de faxina residencial e comercial com limpeza profunda e organização.',
    'Serviço de faxina diarista residencial e comercial com limpeza profunda, organização de ambientes e atenção aos detalhes para deixar tudo impecável.',
    '/images/servicos/faxina-diarista/faxina.webp',
    '/images/servicos/faxina-diarista/faxina.webp',
    'sparkles',
    '["Limpeza profunda","Organização de ambientes","Produtos ecológicos","Profissionais treinados","Atendimento personalizado","Flexibilidade de horário"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    130
  ),
  (
    'limpeza-pos-obra',
    'Limpeza Pós-Obra',
    'facilities',
    'Limpeza pós-obra para deixar imóveis novos ou reformados prontos para uso.',
    'Serviço especializado de limpeza pós-obra para remover resíduos de construção, poeira e sujeira pesada, deixando o imóvel pronto para uso.',
    '/images/servicos/limpeza-pos-obra/limpeza-pos-obra.webp',
    '/images/servicos/limpeza-pos-obra/limpeza-pos-obra.webp',
    'sparkles',
    '["Remoção de resíduos","Limpeza profunda","Produtos específicos","Equipe equipada","Atendimento rápido","Garantia de resultado"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    140
  ),
  (
    'limpeza-pre-mudanca',
    'Limpeza Pré-Mudança',
    'facilities',
    'Preparação completa do imóvel antes da mudança para proteger superfícies e itens.',
    'Serviço de limpeza pré-mudança para preparar imóveis antes da mudança, removendo poeira, sujeira e protegendo áreas e itens. Garanta um ambiente limpo e seguro durante todo o processo de mudança.',
    '/images/servicos/limpeza-pre-mudanca/limpeza-pre-mudanca.webp',
    '/images/servicos/limpeza-pre-mudanca/limpeza-pre-mudanca.webp',
    'sparkles',
    '["Limpeza profunda completa","Proteção de superfícies","Remoção de poeira e detritos","Equipe especializada","Agendamento flexível","Garantia de satisfação"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    150
  ),
  (
    'limpeza-pos-mudanca',
    'Limpeza Pós-Mudança',
    'facilities',
    'Limpeza profunda e organização do imóvel após a mudança para deixar tudo impecável.',
    'Serviço de limpeza pós-mudança para deixar seu imóvel impecável após a mudança. Removemos poeira da mudança, organizamos e higienizamos todos os ambientes.',
    '/images/servicos/limpeza-pos-mudanca/limpeza-pos-mudanca.webp',
    '/images/servicos/limpeza-pos-mudanca/limpeza-pos-mudanca.webp',
    'sparkles',
    '["Limpeza profunda pós-mudança","Remoção de poeira da mudança","Higienização completa","Organização de ambientes","Equipe especializada","Acabamento impecável"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    160
  ),
  (
    'zeladoria-manutencao',
    'Zeladoria e Manutenção',
    'facilities',
    'Manutenção preventiva e conservação de instalações para condomínios e empresas.',
    'Serviço de zeladoria com manutenção preventiva, conservação de instalações e suporte operacional para condomínios e empresas.',
    '/images/servicos/zeladoria/zeladoria-real.png',
    '/images/servicos/zeladoria/zeladoria.svg',
    'wrench',
    '["Manutenção preventiva","Conservação de instalações","Suporte operacional","Pequenos reparos","Gestão de áreas comuns","Inspeções regulares"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    170
  ),
  (
    'controle-acesso',
    'Controle de Acesso',
    'facilities',
    'Portaria 24h, recepção e controle de fluxo de pessoas para sua empresa ou condomínio.',
    'Serviço completo de controle de acesso com portaria 24h, recepção e monitoramento de fluxo de pessoas, garantindo segurança e organização.',
    '/images/servicos/controle-acesso/controle-de-acesso.jpg',
    '/images/servicos/controle-acesso/controle-de-acesso.jpg',
    'shield',
    '["Portaria 24h","Recepção e atendimento","Controle de fluxo de pessoas","Interfonia e catraca","Relatórios de acesso","Equipe treinada"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    180
  ),
  (
    'portaria',
    'Recepção e Portaria',
    'facilities',
    'Equipe qualificada para recepção, portaria e segurança do seu local.',
    'Serviço de recepção e portaria com equipe qualificada para atender visitantes, controlar acesso e garantir a segurança do seu estabelecimento.',
    '/images/servicos/portaria/recepcao-e-portaria.jpg',
    '/images/servicos/portaria/recepcao-e-portaria.jpg',
    'clipboard-check',
    '["Atendimento a visitantes","Controle de veículos","Portaria 24h","Equipe uniformizada","Protocolo de entregas","Horários flexíveis"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    190
  ),

  -- =====================================================================
  -- Terceirização (1)
  -- =====================================================================

  (
    'terceirizacao',
    'Terceirização',
    'terceirizacao',
    'Terceirização de serviços operacionais e equipes especializadas para sua empresa.',
    'Terceirização de serviços operacionais e equipes especializadas para reduzir custos, aumentar a eficiência e garantir conformidade trabalhista.',
    '/images/servicos/terceirizacao/terceirizacao-real.webp',
    '/images/servicos/terceirizacao/terceirizacao-real.webp',
    'building',
    '["Redução de custos","Equipes qualificadas","Gestão de pessoas","Conformidade trabalhista","Escalabilidade","Foco no core business"]',
    '[{"step":"01","title":"Solicitação","description":"Entre em contato pelo site ou WhatsApp com suas necessidades."},{"step":"02","title":"Análise","description":"Nossa equipe avalia o perfil e prepara uma proposta personalizada."},{"step":"03","title":"Proposta","description":"Apresentamos a solução ideal com custos e prazos detalhados."},{"step":"04","title":"Execução","description":"Iniciamos a operação com profissionais treinados e equipados."}]',
    200
  )

) AS v(
  slug, name, category, short_description, description,
  card_image_url, hero_image_url, icon, benefits, process_steps,
  display_order
)
ON CONFLICT (tenant_id, slug) DO NOTHING;

COMMIT;

-- Validation
SELECT
  s.category,
  COUNT(*) AS service_count,
  COUNT(ma.id) FILTER (WHERE ma.is_primary) AS with_primary_media
FROM public.services s
LEFT JOIN public.media_assets ma
  ON ma.entity_type = 'service'
  AND ma.entity_id = s.id
WHERE s.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1)
  AND s.status = 'published'
GROUP BY s.category
ORDER BY s.display_order;
