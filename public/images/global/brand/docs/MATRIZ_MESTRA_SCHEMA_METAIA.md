# Matriz Mestra — Schema Atual vs Modelo Meta.IA

## Legenda de classificação
- **REAL** — Existe e funcional no remoto
- **PARCIAL** — Existe mas incompleto
- **AUSENTE** — Não existe no remoto
- **INCOMPATÍVEL** — Existe com estrutura diferente do proposto
- **NÃO CONFIRMADO** — Precisa de verificação adicional

## Tabelas existentes no remoto (39 tabelas)

### Identidade e RBAC

| Tabela | Status | Observação |
|--------|--------|------------|
| tenants | REAL | Base de multi-tenancy |
| people | REAL | Identidade da pessoa; precisa verificar vínculo com Auth |
| roles | REAL | Papéis do sistema |
| permissions | REAL | Permissões granulares |
| role_permissions | REAL | Vínculo papel-permissão |
| tenant_memberships | REAL | Vínculo pessoa-tenant-papel |
| root_privileges | REAL | Privilégios globais do ROOT |
| active_tenant_sessions | REAL | Sessões ativas por tenant |

### Remoção (núcleo)

| Tabela | Status | Observação |
|--------|--------|------------|
| remocao | REAL | Tabela central; precisa verificar campos de paciente |
| remocao_paciente | REAL | Dados de paciente vinculados à remoção |
| remocao_unidade | REAL | Unidades de atendimento |
| remocao_setor | REAL | Setores dentro das unidades |
| remocao_dashboard | REAL | View de dashboard |
| remocao_summary | REAL | View de resumo |
| remocao_operacional | REAL | Dados operacionais |
| remocao_status_historico | REAL | Histórico de status |
| remocao_auditoria | REAL | Auditoria de ações |
| remocao_evento | REAL | Eventos da viagem |
| remocao_checkin | REAL | Check-in |
| remocao_checkout | REAL | Check-out |
| remocao_destino_confirmacao | REAL | Confirmação de destino |
| remocao_destinos_externos | REAL | Destinos externos |
| remocao_rota | REAL | Rotas |
| remocao_veiculo | REAL | Veículos |
| remocao_motorista | REAL | Motoristas |
| remocao_motorista_turno | REAL | Turnos de motorista |
| remocao_equipe | REAL | Equipes |
| remocao_equipe_membro | REAL | Membros da equipe |
| remocao_avaliacao_clinica | REAL | Avaliação clínica |
| remocao_checklist | REAL | Checklist |
| remocao_checklist_default | REAL | Checklist padrão |
| remocao_documento | REAL | Documentos |
| remocao_documento_conferencia | REAL | Conferência de documentos |
| remocao_documento_extracao | REAL | Extração de documentos |
| remocao_gps_posicao | REAL | Posições GPS |
| remocao_intercorrencia | REAL | Intercorrências |
| remocao_tabela_referencia | REAL | Tabela de referência |

### Pacientes

| Tabela | Status | Observação |
|--------|--------|------------|
| paciente | AUSENTE | Migration 20261027000000 não aplicada; corrigida localmente |

### Catálogos

| Tabela | Status | Observação |
|--------|--------|------------|
| cid10 | AUSENTE | Migration 20261026000000 não aplicada |
| cbo_ocupacoes | AUSENTE | Migration 20261026000000 não aplicada |
| sigtap_procedimentos | AUSENTE | Migration 20261026000000 não aplicada |

### Views e helpers

| Objeto | Status | Observação |
|--------|--------|------------|
| v_admin_role_id | REAL | View auxiliar |
| v_caller_email | REAL | View auxiliar |
| v_role_id | REAL | View auxiliar |
| tenant_memberships_with_details | REAL | View de memberships |

## Comparação com Modelo Meta.IA

### Domínio: Identidade e Profissionais

| Proposta Meta.IA | Estrutura Atual | Classificação | Ação |
|-------------------|-----------------|---------------|------|
| people (identidade) | people | REAL | Reaproveitar; verificar vínculo com Auth |
| Vínculo funcional | tenant_memberships | REAL | Reaproveitar; pode precisar de campos adicionais |
| Perfil profissional | Implícito em roles | PARCIAL | Avaliar se precisa de tabela dedicada |
| Credenciais (CRM, COREN, etc.) | Não verificado | NÃO CONFIRMADO | Verificar se existe cadastro de credenciais |
| Equipes e escalas | remocao_equipe, remocao_equipe_membro | REAL | Reaproveitar |
| Participação na remoção | remocao_equipe_membro | REAL | Reaproveitar |

### Domínio: Pacientes

| Proposta Meta.IA | Estrutura Atual | Classificação | Ação |
|-------------------|-----------------|---------------|------|
| paciente (cadastro persistente) | paciente (migration pendente) | AUSENTE no remoto | Aplicar migration corrigida |
| remocao_paciente (dados por remoção) | remocao_paciente | REAL | Reaproveitar |
| Vínculo paciente-remoção | remocao.paciente_cadastro_id (migration pendente) | AUSENTE no remoto | Aplicar migration |

### Domínio: Remoções

| Proposta Meta.IA | Estrutura Atual | Classificação | Ação |
|-------------------|-----------------|---------------|------|
| remocao (operação de transporte) | remocao | REAL | Reaproveitar; verificar campos de paciente |
| Estados operacionais | remocao_status_historico | REAL | Reaproveitar |
| Eventos da viagem | remocao_evento | REAL | Reaproveitar |
| Histórico e auditoria | remocao_auditoria, remocao_status_historico | REAL | Reaproveitar |

### Domínio: Catálogos

| Proposta Meta.IA | Estrutura Atual | Classificação | Ação |
|-------------------|-----------------|---------------|------|
| CID-10 | cid10 (migration pendente) | AUSENTE no remoto | Aplicar migration |
| CBO | cbo_ocupacoes (migration pendente) | AUSENTE no remoto | Aplicar migration |
| SIGTAP | sigtap_procedimentos (migration pendente) | AUSENTE no remoto | Aplicar migration |

### Domínio: Documentos e GPS

| Proposta Meta.IA | Estrutura Atual | Classificação | Ação |
|-------------------|-----------------|---------------|------|
| Documentos | remocao_documento, remocao_documento_conferencia, remocao_documento_extracao | REAL | Reaproveitar |
| GPS | remocao_gps_posicao | REAL | Reaproveitar |
| Checklists | remocao_checklist, remocao_checklist_default | REAL | Reaproveitar |

## Decisões de arquitetura

1. **Não criar tabelas duplicadas** — reutilizar people, 	enants, emocao_* existentes.
2. **Paciente é entidade separada** — paciente (cadastro persistente) ≠ emocao_paciente (dados por remoção).
3. **Profissional ≠ Acesso** — CRM é credencial; dmin_gestao é papel de acesso. Dimensões independentes.
4. **Não criar tabela medico exclusiva** — usar people + perfil profissional + credenciais.
5. **Não criar tabela uncionarios paralela** — reutilizar people + 	enant_memberships.
6. **Migrations pendentes** — aplicar apenas com autorização explícita.

## Pendências para verificação adicional

- [ ] Verificar se existe cadastro de credenciais profissionais (CRM, COREN, CREFITO)
- [ ] Verificar vínculo people ↔ Supabase Auth (uth.users)
- [ ] Verificar campos de emocao relacionados a paciente (paciente_id bigint vs paciente_cadastro_id uuid)
- [ ] Verificar RLS de todas as tabelas
- [ ] Verificar se emocao_dashboard view funciona corretamente
- [ ] Verificar histórico de migrations aplicadas no remoto
