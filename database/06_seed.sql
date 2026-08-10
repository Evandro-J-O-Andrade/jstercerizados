-- =============================================================================
-- DATA SEMILL — Seed data for testing
-- =============================================================================
-- Execute AFTER tables + relationships + indexes + views
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Empresa (default company / tenant)
-- -----------------------------------------------------------------------------
INSERT INTO empresa (razao_social, nome_fantasia, cnpj, telefone, email, site, endereco, cidade, estado)
VALUES (
  'JS Empregos Ltda',
  'JS Empregos',
  '00000000000000',
  '(11) 96838-0592',
  'contato@jstercerizados.com.br',
  'https://jstercerizados.com.br',
  'Rodovia João Afonso de Souza Castellano, 411 - Poá, SP',
  'Poá',
  'SP'
);


-- -----------------------------------------------------------------------------
-- Usuário administrador
-- -----------------------------------------------------------------------------
-- Senha: Admin@123
-- Hash bcrypt gerado com: bcrypt.hashSync('Admin@123', 10)
INSERT INTO usuarios (empresa_id, nome, email, senha_hash, telefone, perfil, ativo, ultimo_login)
VALUES (
  1,
  'Administrador JS',
  'admin@jsEmpregos.com.br',
  '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  '(11) 96838-0592',
  'ADMIN',
  1,
  CURRENT_TIMESTAMP
);

-- NOTE: Replace the senha_hash above with a real bcrypt hash.
-- You can generate one in the backend using:
--   const bcrypt = require('bcrypt');
--   console.log(bcrypt.hashSync('Admin@123', 10));


-- -----------------------------------------------------------------------------
-- Usuários de apoio (sales, RH, support)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (empresa_id, nome, email, senha_hash, telefone, perfil, ativo)
VALUES
  (1, 'Carlos Comercial', 'carlos@jsEmpregos.com.br', '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '(11) 90000-0001', 'COMERCIAL', 1),
  (1, 'Fernanda RH',      'fernanda@jsEmpregos.com.br', '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '(11) 90000-0002', 'RH', 1),
  (1, 'Patrícia Atendimento', 'patricia@jsEmpregos.com.br', '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '(11) 90000-0003', 'ATENDIMENTO', 1);


-- -----------------------------------------------------------------------------
-- Permissões padrão
-- -----------------------------------------------------------------------------
INSERT INTO permissoes (nome, descricao, modulo)
VALUES
  ('cliente.visualizar',   'Visualizar clientes',    'CRM'),
  ('cliente.criar',        'Criar clientes',         'CRM'),
  ('cliente.editar',       'Editar clientes',        'CRM'),
  ('cliente.excluir',      'Excluir clientes',       'CRM'),
  ('lead.visualizar',      'Visualizar leads',       'CRM'),
  ('lead.criar',           'Criar leads',            'CRM'),
  ('candidato.visualizar', 'Visualizar candidatos',  'RH'),
  ('candidato.criar',      'Criar candidatos',       'RH'),
  ('ticket.visualizar',    'Visualizar tickets',     'Suporte'),
  ('ticket.criar',         'Criar tickets',          'Suporte'),
  ('relatorio.visualizar', 'Acessar relatórios',     'Financeiro'),
  ('admin.gerenciar',      'Painel administrativo',  'Admin');

-- Admin gets all permissions
INSERT INTO usuario_permissoes (usuario_id, permissao_id)
SELECT 1, id FROM permissoes;


-- -----------------------------------------------------------------------------
-- Serviços padrão
-- -----------------------------------------------------------------------------
INSERT INTO servicos (nome, descricao, icone, categoria, preco_base, unidade_medida)
VALUES
  ('Segurança Patrimonial', 'Vigilância e monitoramento de áreas', 'shield', 'Segurança', 5000.00, 'porcento'),
  ('Controle de Acesso',    'Catracas e credenciais de acesso',    'access-control', 'Segurança', 3000.00, 'porcento'),
  ('Portaria 24h',          'Atendimento e controle de fluxo',     'portaria', 'Segurança', 8000.00, 'fixo'),
  ('Limpeza Profissional',  'Higienização e limpeza de instalações', 'cleaning', 'Limpeza', 2500.00, 'fixo'),
  ('Zeladoria Preventiva',  'Manutenção preditiva e corretiva',    'maintenance', 'Manutenção', 4000.00, 'fixo'),
  ('Facilities Integrado',  'Gestão integrada de serviços',        'facilities', 'Facilities', 10000.00, 'porcento');


-- -----------------------------------------------------------------------------
-- Clientes de teste (5)
-- -----------------------------------------------------------------------------
INSERT INTO clientes (usuario_id, razao_social, nome_fantasia, cnpj, responsavel, cargo, telefone, email, cidade, estado, origem, status)
VALUES
  (2, 'ABC Logística Ltda',     'ABC Logística', '11111111000111', 'Mariana Santos', 'Diretora', '(11) 3331-0001', 'contato@abclog.com.br', 'São Paulo', 'SP', 'SITE', 'CLIENTE_ATIVO'),
  (2, 'DEF Construções',        'DEF Construções', '22222222000122', 'Roberto Lima', 'Gerente', '(11) 3332-0002', 'contato@defconst.com.br', 'Campinas', 'SP', 'WHATSAPP', 'NEGOCIACAO'),
  (2, 'GHI Comercial',          'GHI Comercial', '33333333000133', 'Patrícia Costa', 'Proprietária', '(11) 3333-0003', 'contato@ghi.com.br', 'Barueri', 'SP', 'SITE', 'CLIENTE_ATIVO'),
  (2, 'JKL Indústria',          'JKL Indústria', '44444444000144', 'Vicente Rocha', 'Diretor', '(11) 3334-0004', 'contato@jkl.com.br', 'Santo André', 'SP', 'INDICACAO', 'PROSPECT'),
  (2, 'MNO Condomínios',        'MNO Condomínios', '55555555000155', 'Cláudia Mendes', 'Sócia-Diretora', '(11) 3335-0005', 'contato@mno.com.br', 'Osasco', 'SP', 'SITE', 'CLIENTE_ATIVO');


-- -----------------------------------------------------------------------------
-- Leads de teste (10)
-- -----------------------------------------------------------------------------
INSERT INTO leads (nome, empresa, email, telefone, origem, tipo_lead, mensagem, status)
VALUES
  ('Ana Silva',    'Ana & CIA',      'ana@exemplo.com.br', '(11) 91000-0001', 'SITE', 'CLIENTE', 'Interessado em segurança patrimonial', 'NOVO'),
  ('Bruno Costa',  'BC Serviços',    'bruno@exemplo.com.br', '(11) 91000-0002', 'WHATSAPP', 'CLIENTE', 'Quero saber sobre portaria', 'CONTATO_REALIZADO'),
  ('Carla Dias',   'CD Comércio',    'carla@exemplo.com.br', '(11) 91000-0003', 'INSTAGRAM', 'CLIENTE', 'Orçamento para limpeza', 'QUALIFICADO'),
  ('Daniel Pires', 'DP Soluções',    'daniel@exemplo.com.br', '(11) 91000-0004', 'GOOGLE', 'CLIENTE', 'Interessado em facilities', 'PROPOSTA_ENVIADA'),
  ('Eduarda Rua',  'ER Empreendimentos', 'eduarda@exemplo.com.br', '(11) 91000-0005', 'SITE', 'CLIENTE', 'Consultoria de segurança', 'CONVERTIDO'),
  ('Fábio Nunes',  'FN Logística',   'fabio@exemplo.com.br', '(11) 91000-0006', 'WHATSAPP', 'CLIENTE', 'Preciso de zeladoria', 'NOVO'),
  ('Gabriela Torres', 'GT Comércio', 'gabriela@exemplo.com.br', '(11) 91000-0007', 'SITE', 'CLIENTE', 'Quero contratar', 'DESCARTADO'),
  ('Hernani Vieira', 'HV Serviços',  'hernani@exemplo.com.br', '(11) 91000-0008', 'INDICACAO', 'PARCEIRO', 'Oferecemos serviços de limpeza', 'NOVO'),
  ('Isabela Lopes', 'IL Comercial',  'isabela@exemplo.com.br', '(11) 91000-0009', 'SITE', 'CLIENTE', 'Interessado em portaria 24h', 'QUALIFICADO'),
  ('Jorge Santos', 'JS Indústria',   'jorge@exemplo.com.br', '(11) 91000-0010', 'WHATSAPP', 'CLIENTE', 'Preciso de segurança', 'NOVO');


-- -----------------------------------------------------------------------------
-- Candidatos de teste (5)
-- -----------------------------------------------------------------------------
INSERT INTO candidatos (nome, cpf, telefone, email, cidade, estado, vaga_interesse, experiencia, status)
VALUES
  ('Lucas Mendes', '(11) 92000-0001', 'lucas@exemplo.com.br', 'São Paulo', 'SP', 'AUXILIAR_LIMPEZA', '3 anos de experiência em limpeza corporativa', 'NOVO'),
  ('Mariana Duarte', '(11) 92000-0002', 'mariana@exemplo.com.br', 'Santo André', 'SP', 'CONTROLADOR_ACESSO', 'Certificada em segurança', 'ENTREVISTA'),
  ('Otávio Freitas', '(11) 92000-0003', 'otavio@exemplo.com.br', 'São Bernardo', 'SP', 'ZELADOR', '5 anos como zelador industrial', 'APROVADO'),
  ('Patrícia Nunes', '(11) 92000-0004', 'patricia@exemplo.com.br', 'Osasco', 'SP', 'PORTEIRO', 'Experiência em portaria 24h', 'TRIAGEM'),
  ('Ricardo Alves', '(11) 92000-0005', 'ricardo@exemplo.com.br', 'Barueri', 'SP', 'RECEPCIONISTA', 'Bilingue inglês', 'NOVO');


-- -----------------------------------------------------------------------------
-- Tickets de teste (5)
-- -----------------------------------------------------------------------------
INSERT INTO tickets (protocolo, cliente_id, usuario_id, categoria, assunto, descricao, prioridade, status)
VALUES
  ('SUP-20260806-001', 1, 2, 'LIMPEZA', 'Solicitacao limpeza setor 3', 'Cliente solicita limpeza extra no setor 3', 'MEDIA', 'ABERTO'),
  ('SUP-20260806-002', 1, 2, 'SEGURANCA', 'Porta do setor 5 travando', 'A porta do credenciamento do setor 5 nao abre', 'ALTA', 'EM_ANALISE'),
  ('SUP-20260806-003', 3, 2, 'ACESSO', 'Repor crachas', 'Precisamos de novo crachas para visitantes', 'BAIXA', 'ABERTO'),
  ('SUP-20260806-004', 2, 4, 'FACILITIES', 'Ar-condicionado', 'Ar-condicionado do 5o andar esta quente', 'URGENTE', 'ABERTO'),
  ('SUP-20260806-005', 4, 2, 'ZELADORIA', 'Vazamento no banheiro', 'Vazamento na torneira do banheiro dos visitantes', 'MEDIA', 'ABERTO');


-- -----------------------------------------------------------------------------
-- Webhooks padrão
-- -----------------------------------------------------------------------------
INSERT INTO webhooks (evento, url, metodo, ativo, secret)
VALUES
  ('NOVO_LEAD',            'https://hooks.jsEmpregos.com/webhook/n8n/leads',  'POST', 1, 'whsec_xxxxxxxxxx'),
  ('NOVO_CLIENTE',         'https://hooks.jsEmpregos.com/webhook/n8n/clientes', 'POST', 1, 'whsec_yyyyyyyyyy'),
  ('NOVO_CANDIDATO',       'https://hooks.jsEmpregos.com/webhook/n8n/rh',     'POST', 1, 'whsec_zzzzzzzzzz'),
  ('NOVO_TICKET',          'https://hooks.jsEmpregos.com/webhook/n8n/tickets', 'POST', 1, 'whsec_aaaaaaaaaa'),
  ('NOVO_PARCEIRO',        'https://hooks.jsEmpregos.com/webhook/n8n/parceiros', 'POST', 1, 'whsec_bbbbbbbbbb'),
  ('CONTRATO_VENCENDO',    'https://hooks.jsEmpregos.com/webhook/n8n/contratos', 'POST', 0, 'whsec_cccccccccc');
