# Remoção Alpha — Fase 2A: Inventário Técnico do Modelo de Dados

## 1. Inventário de tabelas (evidência por migração)

### 1.1 Identidade e acesso

| Tabela | Migração | Colunas-chave | PK/FK |
|---|---|---|---|
| tenants | 20261009000001 | id, nome, razao_social, cnpj, email, telefone, endereco, ativo, config, created_at, updated_at | PK id |
| people | 20261009000001 | id (==auth.users.id), nome, email, telefone, data_nascimento, cpf, genero, ativo, created_at, updated_at | PK id; trigger on_auth_user_create_person |
| roles | 20261009000001 | id, key, nome, descricao, nivel, sistema, created_at, updated_at | PK id; unique key |
| permissions | 20261009000001 | id, key, nome, descricao, categoria, created_at | PK id; unique key |
| role_permissions | 20261009000001 | role_id, permission_id, created_at | PK (role_id, permission_id); FK cascade |
| tenant_memberships | 20261009000002 | id, tenant_id, person_id, role_id, status (enum), convidado_por, convidado_em, aprovado_por, aprovado_em, expira_em, created_at, updated_at | PK id; FK tenants/people/roles; unique (tenant_id, person_id) |

### 1.2 Unidades e profissionais

| Tabela | Migração | Colunas-chave |
|---|---|---|
| remocao_unidade | 20261009000004 | id, tenant_id, nome, ... (verificar) |
| profissional | 20261031000000 (PENDENTE) | id, tenant_id, pessoa_id, tipo_profissional, situacao, data_admissao, data_desligamento, observacoes, created_by, updated_by; unique (tenant_id, pessoa_id) |
| profissional_registro | 20261031000000 (PENDENTE) | id, tenant_id, profissional_id, tipo_registro, numero, uf, categoria, data_emissao, data_validade, situacao, orgao_emissor |
| profissional_qualificacao | 20261031000000 (PENDENTE) | id, tenant_id, profissional_id, especialidade, cbo_codigo, data_obtencao, situacao |
| profissional_unidade | 20261031000000 (PENDENTE) | id, tenant_id, profissional_id, unidade_id, funcao, situacao, data_inicio, data_fim, elegivel_escala |

### 1.3 Operação (referência)

| Tabela | Migração | Uso |
|---|---|---|
| remocao | 20261009000004+ | solicitação de remoção |
| remocao_equipe / remocao_equipe_membro | 20261029+ | equipes operacionais |
| remocao_gps_posicao | — | posições GPS |
| remocao_evento | — | auditoria operacional |

### 1.4 Catálogos (pendentes/aplicados)

- cid10, cbo_ocupacoes, sigtap_procedimentos: migrações 20261026/20261027 (aplicadas remotamente — confirmado pelo relatório anterior).

## 2. Diagrama textual

```
auth.users (Supabase Auth)
   └── 1:1 people (id = auth.users.id)  [trigger on_auth_user_create_person]
         ├── N:1 tenant_memberships (person_id) ── N:1 tenants
         │       └── N:1 roles (role_id) ── N:N permissions (role_permissions)
         └── 1:1 profissional (pessoa_id) [PENDENTE]
               ├── 1:N profissional_registro
               ├── 1:N profissional_qualificacao
               └── N:N profissional_unidade ── N:1 remocao_unidade
```

## 3. Matriz requisito × suporte atual

| Requisito (cadastro ref.) | Suporte | Evidência | Lacuna |
|---|---|---|---|
| Identidade pessoal (nome, CPF, telefone, nascimento) | Existe | people | — |
| Conta Auth vinculada | Existe | trigger on_auth_user_create_person | criação admin segura (backend) |
| Multi-tenant/unidade | Existe | tenant_memberships + profissional_unidade | — |
| Papel de autorização | Existe | roles + role_permissions | — |
| Profissional (tipo, situação, admissão) | Parcial (pendente) | profissional migration | não aplicada remotamente |
| Registros de conselho (CRM/COREN/CNH/CBO) | Parcial (pendente) | profissional_registro | não aplicada |
| Especialidades/CBO | Parcial (pendente) | profissional_qualificacao | não aplicada |
| Vínculo profissional↔unidade | Parcial (pendente) | profissional_unidade | não aplicada |
| Equipes/motoristas/escalas/viaturas | Existe (operação) | remocao_equipe* | verificar FK para profissional |
| Endereços/CEP | Parcial | people não tem endereço; remocao_unidade tem? | verificar |
| Documentos/anexos | Existe (storage) | 3 grupos documentais | verificar tabelas |
| Auditoria administrativa | Ausente | apenas remocao_evento | criar tabela |
| Soft-delete | Parcial | ativo boolean em people/tenants | sem histórico de suspensão |

## 4. Proposta de modelo (reutilizar, não duplicar)

- Reutilizar people, tenant_memberships, roles, permissions, remocao_unidade.
- Aplicar a migração profissional_module (já desenhada, pendente) — sem alterações novas.
- Adicionar tabela de auditoria administrativa (migration nova, após autorização).
- Manter profissional (qualificação) independente de tenant_memberships.role (autorização).
- Soft-delete via situacao/ativo, não apagar registros (preservar histórico).

## 5. Migrações/RLS potencialmente necessárias (sem executar)

1. Aplicar 20261031000000_profissional_module.sql (se não aplicada).
2. Criar tabela admin_audit_log (ação, ator, alvo, antes/depois, timestamp).
3. RLS em profissional*: filtrar por tenant_id = get_active_tenant_id(); ROOT bypass via service role em backend.
4. Políticas de leitura de PII (CPF, registros) restritas a perfis autorizados.

## 6. Plano de implementação e critérios de aceite

1. Confirmar estado remoto (acesso atualmente indisponível — erro de permissão).
2. Autorizar aplicação da migração profissional pendente.
3. Implementar backend seguro (edge function) para criação de conta Auth + people + profissional + vínculo, com rollback em falha parcial.
4. Construir Central de Gestão em etapas: identidade → profissional → vínculo unidade → permissões.
5. Testes: RLS, IDOR, integridade referencial, soft-delete, auditoria.

**Critérios de aceite:** nenhum usuário ganha acesso operacional apenas por cadastro; profissão ≠ permissão; isolamento tenant/unidade preservado; histórico operacional não comprometido.

## 7. Evidências vs hipóteses

- Evidências: migrações locais versionadas (listadas acima).
- Hipóteses não verificadas: estado real do banco remoto (acesso indisponível), tabelas não versionadas, RLS aplicada de fato, existência de dados de teste.