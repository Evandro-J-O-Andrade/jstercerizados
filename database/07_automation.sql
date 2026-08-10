-- =============================================================================
-- AUTOMAÇÃO — Event triggers & scheduled jobs
-- =============================================================================
-- Data definitions that describe how events map to n8n / automation flows
-- Run AFTER tables, relationships, indexes, views, and seeds
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EVENTOS_AUTOMACAO (Event catalog — defines what triggers automation)
-- -----------------------------------------------------------------------------
CREATE TABLE eventos_automacao (
    id                  BIGINT      PRIMARY KEY AUTO_INCREMENT,
    codigo              VARCHAR(50) UNIQUE NOT NULL,
    nome                VARCHAR(150) NOT NULL,
    descricao           TEXT,
    tabela_referencia   VARCHAR(100),
    condicao            VARCHAR(255),
    payload_template    JSON,
    ativo               TINYINT(1) DEFAULT 1,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO eventos_automacao (codigo, nome, descricao, tabela_referencia, condicao)
VALUES
  ('LEAD_NOVO',              'Novo Lead no Site',            'Disparar quando um lead é criado via site',           'leads',      'status = NOVO'),
  ('LEAD_QUALIFICADO',       'Lead Qualificado',             'Lead moved to qualified stage',                          'leads',      'status = QUALIFICADO'),
  ('LEAD_CONVERTIDO',        'Lead Convertido',              'Lead converted to client',                             'leads',      'status = CONVERTIDO'),
  ('CLIENTE_NOVO',           'Novo Cliente Ativado',         'New active client created',                            'clientes',   'status = CLIENTE_ATIVO'),
  ('CONTRATO_VENCENDO',      'Contrato Próximo ao Vencimento', 'Contract expiring within 30 days',                     'contratos',  'status = ATIVO AND data_fim <= DATE_ADD(NOW(), INTERVAL 30 DAY)'),
  ('TICKET_URGENTE',         'Ticket Urgente Abierto',       'High-priority ticket created',                         'tickets',    'prioridade IN (ALTA, URGENTE)'),
  ('TICKET_ATRIBUIDO',       'Ticket Atribuído',             'Ticket assigned to a collaborator',                   'tickets',    'responsavel_id IS NOT NULL'),
  ('CANDIDATO_NOVO',         'Novo Candidato',               'New candidate registered',                             'candidatos', 'status = NOVO'),
  ('CANDIDATO_APROVADO',     'Candidato Aprovado',           'Candidate approved',                                   'candidatos', 'status = APROVADO'),
  ('PARCEIRO_VALIDADO',      'Parceiro Validado',            'Partner approved',                                     'parceiros',  'status = ATIVO'),
  ('MENSAGEM_RECEITA',       'Nova Mensagem WhatsApp',       'New inbound WhatsApp message',                      'mensagens',  'tipo = ENTRADA'),
  ('AUTOMACAO_DIARIA',       'Tarefa Diária',                'Daily scheduled task (e.g. report generation)',      'fila_automacao', 'evento = AUTOMACAO_DIARIA'),
  ('VAGA_PUBLICADA',         'Nova Vaga Publicada',          'New job listing published',                          'vagas',       'status = ATIVA'),
  ('CANDIDATURA_NOVA',       'Nova Candidatura',             'Candidate applied to a job',                         'candidaturas', 'status = ENVIADO'),
  ('ENTREVISTA_AGENDADA',    'Entrevista Agendada',          'Interview scheduled for candidate',                  'entrevistas', 'status = AGENDADA');


-- -----------------------------------------------------------------------------
-- FLUXOS_AUTOMACAO (n8n workflow definitions — metadata reference)
-- -----------------------------------------------------------------------------
CREATE TABLE fluxos_automacao (
    id                  BIGINT      PRIMARY KEY AUTO_INCREMENT,
    nome                VARCHAR(150) NOT NULL,
    evento_id           BIGINT NOT NULL,
    n8n_webhook_id      VARCHAR(100),
    n8n_workflow_id     VARCHAR(100),
    ordem_execucao      INT DEFAULT 0,
    ativo               TINYINT(1) DEFAULT 1,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_fluxos_evento (evento_id),
    INDEX idx_fluxos_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO fluxos_automacao (nome, evento_id, n8n_webhook_id, n8n_workflow_id, ordem_execucao)
VALUES
  ('Notificar Comercial - Lead Novo',       1,  'wh_lead_novo',          'wf_notifica_comercial',  1),
  ('Criar Cliente no SaaS',                  4,  'wh_cliente_novo',       'wf_cria_cliente',        1),
  ('Alerta de Contrato Vencendo',            5,  'wh_contrato_vencendo',  'wf_alerta_contrato',     1),
  ('Notificar Gestor - Ticket Urgente',      6,  'wh_ticket_urgente',     'wf_notifica_gerente',    1),
  ('Atribuir Ticket ao Gestor',               7,  'wh_ticket_atribuido',   'wf_atribui_ticket',      1),
  ('Onboarding de Candidato Aprovado',       8,  'wh_cand_aprovado',      'wf_onboarding_rh',       1),
  ('Aprovar Parceiro e Criar Conta',         9,  'wh_parceiro_ok',        'wf_aprova_parceiro',     1),
  ('Resposta Automática WhatsApp',          10,  'wh_msg_entrada',        'wf_resposta_whatsapp',   1),
  ('Relatório Diário Automatizado',         11,  'wh_diario',             'wf_relatorio_diario',    1),
  ('Notificar Comercial - Lead Convertido',  3,  'wh_lead_convertido',    'wf_notifica_conversao',  1);


-- -----------------------------------------------------------------------------
-- TEMPLATE_EMAIL (Reusable email templates)
-- -----------------------------------------------------------------------------
CREATE TABLE templates_email (
    id                  BIGINT      PRIMARY KEY AUTO_INCREMENT,
    codigo              VARCHAR(50) UNIQUE NOT NULL,
    nome                VARCHAR(150) NOT NULL,
    assunto             VARCHAR(255) NOT NULL,
    corpo_html          LONGTEXT NOT NULL,
    corpo_texto         LONGTEXT,
    variaveis           JSON,
    ativo               TINYINT(1) DEFAULT 1,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_templates_codigo (codigo),
    INDEX idx_templates_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO templates_email (codigo, nome, assunto, corpo_html, corpo_texto, variaveis)
VALUES
  ('LEAD_CONFIRMACAO',
   'Confirmação de Recebimento do Lead',
   'Obrigado pelo contato, {{nome}}!',
   '<p>Olá {{nome}},</p><p>Recebemos sua solicitação e nossa equipe entrará em contato em breve.</p><p>Protocolo: {{protocolo}}</p>',
   'Ola {{nome}}, Recebemos sua solicitacao e nossa equipe entrara em contato em breve. Protocolo: {{protocolo}}',
   '["nome", "protocolo", "empresa"]'),

  ('LEAD_DISTRIBUICAO',
   'Distribuição de Lead para Comercial',
   '[URGENTE] Novo lead qualificado: {{nome}}',
   '<p>Novo lead atribuído: {{nome}}</p><p>Empresa: {{empresa}}</p><p>Telefone: {{telefone}}</p><p>Prazo primeiro contato: 2h</p>',
   'Novo lead atribuido: {{nome}} - {{empresa}} - {{telefone}} - Prazo contato 2h',
   '["nome", "empresa", "telefone"]');


-- -----------------------------------------------------------------------------
-- TEMPLATE_WHATSAPP (Reusable WhatsApp message templates)
-- -----------------------------------------------------------------------------
CREATE TABLE templates_whatsapp (
    id                  BIGINT      PRIMARY KEY AUTO_INCREMENT,
    codigo              VARCHAR(50) UNIQUE NOT NULL,
    nome                VARCHAR(150) NOT NULL,
    template            VARCHAR(255),
    corpo               TEXT,
    variaveis           JSON,
    ativo               TINYINT(1) DEFAULT 1,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_wa_template_codigo (codigo),
    INDEX idx_wa_template_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO templates_whatsapp (codigo, nome, template, corpo, variaveis)
VALUES
  ('BOAS_VINDAS',
   'Mensagem de Boas-vindas',
   'Hello, {{1}}! Thank you for contacting JS Empregos. How can we help you?',
   'Ola {{nome}}, obrigado por entrar em contato com JS Empregos! Como podemos ajudar?',
   '["nome"]');
