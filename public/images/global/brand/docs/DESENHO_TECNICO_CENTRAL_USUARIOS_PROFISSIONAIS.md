# Remoção Alpha — Desenho Técnico: Central de Gestão de Usuários e Profissionais

## 1. Modelo de domínio

- **Pessoa** (`people`): identidade civil (nome, email, telefone, cpf, data_nascimento, genero, ativo). PK = auth.users.id.
- **Conta Auth** (Supabase Auth): credencial. Trigger `on_auth_user_create_person` cria people automaticamente.
- **Membership** (`tenant_memberships`): vínculo pessoa↔tenant+role, status enum, unique(tenant,person).
- **Profissional** (`profissional`, migração 20261031000000 PENDENTE): qualificação, tipo, situação, admissão.
- **Registro** (`profissional_registro`): CRM/COREN/CNH/CBO, número, UF, validade.
- **Qualificação** (`profissional_qualificacao`): especialidade, cbo_codigo.
- **Unidade** (`profissional_unidade`): N:N profissional↔remocao_unidade, funcao, elegivel_escala.
- **Papel** (`roles`/`permissions`/`role_permissions`): autorização de sistema, independente da profissão.

Relacionamentos: auth.users 1:1 people; people 1:N tenant_memberships; people 1:1 profissional (pendente); profissional 1:N registros/qualificações; profissional N:N unidades.

## 2. Contratos de serviço

1. **Criar/localizar pessoa**: upsert em people (id=auth.uid). Idempotente.
2. **Convidar conta Auth**: supabase.auth.admin (backend/edge function, nunca frontend). Tratar falha parcial com compensação.
3. **Associar conta↔pessoa↔tenant**: insert tenant_memberships. Validar is_root/has_permission.
4. **Vincular unidades**: insert profissional_unidade (pendente de migração).
5. **Dados profissionais**: upsert profissional + registros/qualificações.
6. **Atribuir papéis**: update tenant_memberships.role_id. Validar hierarquia (nivel).
7. **Suspender/reativar**: update status (ativo/inativo/suspenso). Sem delete.
8. **Recuperação de acesso**: supabase.auth.resetPasswordForEmail.
9. **Auditoria**: tabela admin_audit_log (proposta, não existente).

Falhas parciais: usar transação; compensar (rollback) em erro. Idempotência via upsert/unique constraints.

## 3. Autorização e isolamento

| Perfil | Escopo |
|---|---|
| admin_master (ROOT) | Global, todas as operações. is_admin_master() RPC. |
| admin_gestao | Próprio tenant. has_permission('admin.users.manage'). |
| suporte_ti/master/suporte | Conforme permissões carregadas. |
| Operacionais | Sem admin. |

Proteção: RLS em tenant_memberships (tenant_id = get_active_tenant_id() + has_permission). Hierarquia: não atribuir papel de nivel >= próprio. admin_master não atribuível por vínculo.

## 4. RLS e banco

- Aplicar migração 20261031000000 (profissional*) — pendente, aguardar autorização.
- Criar admin_audit_log (proposta): actor, target, action, before/after, timestamp.
- RLS em profissional*: tenant_id = get_active_tenant_id().
- Índices: profissional(tenant_id, pessoa_id), profissional_unidade(profissional_id, unidade_id).

## 5. Interface

Evolução de AdminManagementPage.tsx e GlobalAdministrationPage.tsx:
- Listagem com busca/filtros/paginação (já existe).
- Formulário multipasso: identificação → pessoal → profissional → unidades → permissões → endereço → documentos → revisão.
- Condicionais: CRM/COREN/CBO só se aplicável.
- Estados: loading, empty, success, error, partial failure.
- Contraste dark mode: usar tokens var(--rem-*).

## 6. Testes e aceite

- Pessoa sem conta Auth (permitido quando justificado).
- Convite + associação Auth↔pessoa.
- Duplicidade CPF/email/registro.
- Falhas parciais com compensação.
- Multi-unidade.
- Isolamento tenant/unidade.
- Elevação de privilégios bloqueada.
- Suspensão/reativação sem perder histórico.
- TypeScript, lint, testes, build.

## 7. Plano de implementação

1. Confirmar estado remoto (acesso indisponível — hipótese).
2. Autorizar aplicação da migração profissional pendente.
3. Criar edge function para criação de conta Auth (service_role server-side).
4. Implementar serviços de pessoa/profissional/vínculo com testes.
5. Construir central administrativa por etapas.
6. Validar RLS, IDOR, regressão.

## Restrições

- Sem alteração de banco remoto.
- Sem migrações aplicadas.
- Sem commit/push.
- Estado remoto não confirmado.