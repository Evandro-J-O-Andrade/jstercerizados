# Auditoria do Schema Remoto — Módulo Profissional

**Data:** 2026-10-24
**Projeto:** Remoção Alpha (Supabase ref: jqamhriokskinifjybfc)
**Escopo:** Tabelas, FKs, índices, RLS e dados existentes relacionados a pessoas, profissionais, motoristas, equipes, veículos e unidades.

---

## 1. Tabelas existentes e estado

| Tabela | Registros | FKs confirmadas | Observação |
|--------|-----------|-----------------|------------|
| `people` | 17 | — | Cadastro central. Sem campos de qualificação profissional. |
| `remocao_motorista` | 0 | `pessoa_id → people.id`, `tenant_id → tenants.id`, `aprovado_por → people.id` | CNH, categoria, validade. Sem dados. |
| `remocao_equipe` | 0 | `remocao_id → remocao.id`, `tenant_id → tenants.id` | Sem registros. |
| `remocao_equipe_membro` | 0 | `equipe_id → remocao_equipe.id` | `profissional_id` **sem FK**. |
| `remocao_veiculo` | 0 | `tenant_id → tenants.id` | Sem veículos. |
| `remocao_unidade` | 2 | `tenant_id → tenants.id` | Santos e POA. |
| `remocao_setor` | 0 | `tenant_id → tenants.id`, `unidade_id → remocao_unidade.id` | Sem setores. |
| `tenant_memberships` | 16 | `person_id → people.id`, `tenant_id → tenants.id`, `role_id → roles.id` | 12 papéis, 39 permissões. |
| `remocao` | 1 | `tenant_id → tenants.id`, `origem_unidade_id → remocao_unidade.id`, `destino_unidade_id → remocao_unidade.id`, `veiculo_id → remocao_veiculo.id`, `created_by → people.id` | Uma remoção persistida. |
| `sigtap_procedimentos` | 0 | — | Catálogo vazio. |
| `cid10` | 0 | — | Catálogo vazio. |
| `cbo_ocupacoes` | 0 | — | Catálogo vazio. |
| `remocao_destinos_externos` | 0 | — | Tabela existe com RLS. |
| `paciente` | 0 | — | Tabela existe. |
| `remocao_procedimento` | 0 | `remocao_id → remocao.id`, `tenant_id → tenants.id` | Relacionamento vazio. |

## 2. Foreign Keys confirmadas

- `remocao_motorista.pessoa_id → people.id` ✅ (FK existe)
- `remocao_equipe_membro.equipe_id → remocao_equipe.id` ✅ (FK existe)
- `remocao_equipe_membro.profissional_id` → **sem FK** ❌
- `remocao_veiculo.tenant_id → tenants.id` ✅
- `remocao_unidade.tenant_id → tenants.id` ✅
- `remocao.tenant_id → tenants.id` ✅
- `remocao.origem_unidade_id → remocao_unidade.id` ✅
- `remocao.destino_unidade_id → remocao_unidade.id` ✅
- `remocao.veiculo_id → remocao_veiculo.id` ✅

## 3. Índices existentes

- `people`: `idx_people_cpf`, `idx_people_email`, `people_pkey`
- `remocao_motorista`: `idx_remocao_motorista_pessoa`, `idx_remocao_motorista_tenant_status`, `idx_remocao_motorista_aprovado`, `remocao_motorista_pkey`, `remocao_motorista_tenant_id_cpf_key`
- `remocao_equipe`: `idx_remocao_equipe_remocao`, `remocao_equipe_pkey`
- `remocao_equipe_membro`: `idx_remocao_equipe_membro_equipe`, `remocao_equipe_membro_pkey`
- `remocao_unidade`: `remocao_unidade_pkey`, `remocao_unidade_tenant_id_codigo_key`

## 4. O que falta

| Item | Status | Ação necessária |
|------|--------|-----------------|
| Campos de qualificação em `people` (CRM, COREN, CNH, CBO, especialidade) | ❌ Ausente | Criar tabela `profissional` separada para não poluir `people` |
| Tabela `profissional_unidade` (many-to-many) | ❌ Ausente | Criar com vínculo, função, situação, vigência, escopo de tenant |
| FK `remocao_equipe_membro.profissional_id → people.id` | ❌ Ausente | Adicionar constraint após confirmar tipo do campo |
| Catálogos (SIGTAP, CID-10, CBO) | ⚠️ Vazio | Planejar importação de fontes oficiais |
| Motoristas, veículos, equipes | ⚠️ Vazio | Preparar cadastros reais (sem dados fictícios) |
| Escalas profissionais | ❌ Ausente | Criar tabela `profissional_escala` |
| Documentos profissionais | ❌ Ausente | Criar tabela `profissional_documento` com metadados e validade |

## 5. Decisões de arquitetura

1. **Manter `people` como cadastro central** — sem colunas de qualificação profissional.
2. **Criar tabela `profissional`** — situação profissional e dados gerais da atuação.
3. **Criar `profissional_registro`** — CRM, COREN e outros, com conselho, UF, categoria e situação.
4. **Criar `profissional_qualificacao`** — especialidades e qualificações com referência a catálogo.
5. **Criar `profissional_unidade`** — vínculo many-to-many com função, situação, vigência e escopo de tenant.
6. **Criar `profissional_documento`** — metadados, validade e referência segura aos documentos.
7. **Manter `remocao_motorista`** — dados específicos da atuação como motorista (CNH, categoria, validade).
8. **Adicionar FK** em `remocao_equipe_membro.profissional_id → people.id`.
9. **Popular catálogos** (SIGTAP, CID-10, CBO) via importação de fontes oficiais.

## 6. Ordem de implementação

1. Criar migration `profissional` + `profissional_registro` + `profissional_unidade` + `profissional_documento` + `profissional_escala`
2. Adicionar FK em `remocao_equipe_membro.profissional_id`
3. Criar repositories e páginas de cadastro
4. Implementar elegibilidade (habilitações, registros vigentes, unidade, escala)
5. Importar catálogos (CBO, SIGTAP, CID-10)
6. Validar RLS, RBAC, isolamento, testes

## 7. Critérios de aceite

- [ ] Formulários criam/atualizam registros reais no banco
- [ ] Relações têm integridade referencial (FKs)
- [ ] Documentos e registros validados conforme regras
- [ ] Escalas impedem alocações incompatíveis
- [ ] RLS bloqueia acessos indevidos
- [ ] Relatórios refletem registros reais
- [ ] Testes, TypeScript, lint e build aprovados
- [ ] Sem dados fictícios
- [ ] Sem migrations redundantes
- [ ] Sem acesso liberado apenas por frontend
