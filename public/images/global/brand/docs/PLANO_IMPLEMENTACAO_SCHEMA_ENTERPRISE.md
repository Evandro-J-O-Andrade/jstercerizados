# Plano de Implementação — Schema Enterprise

## Fase 1 — Auditoria e reconciliação (concluída)

Matriz criada em docs/AUDITORIA_RECONCILIACAO_SCHEMA_ENTERPRISE.md.

## Fase 2 — Migrations pendentes

1. Aplicar 20261026000000 (catalogos: cid10, cbo_ocupacoes, sigtap_procedimentos).
2. Aplicar 20261027000000 (paciente + índice CPF único parcial) — corrigida.

## Fase 3 — Campos funcionais (incremental)

- Avaliar campos de paciente (nome social, CNS, endereço estruturado) — adicionar somente os necessários.
- Avaliar profissionais (CRM/COREN/CREFITO/CNH) — mapear para people + habilitações.
- Avaliar frota, checklists, GPS, agendamentos — planejar migrations incrementais.

## Fase 4 — Segurança e relatórios

- Validar RLS por tenant/unidade.
- Validar permissões por perfil.
- Validar views analíticas.

## Validação

- TypeScript: PASS
- Lint: PASS
- Build: PASS
- Testes: pendente (rodar vitest)
