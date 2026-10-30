# Auditoria de Reconcilia√ß√£o ‚Äî Schema Enterprise

## Migrations existentes

20 migrations em supabase/migrations/ (20261009000001 a 20261027000000).

## Tabelas verificadas no remoto (via secret key)

- tenants: EXISTS
- people: EXISTS
- roles: EXISTS
- permissions: EXISTS
- role_permissions: EXISTS
- tenant_memberships: EXISTS
- remocao: EXISTS
- remocao_paciente: EXISTS
- remocao_unidade: EXISTS
- remocao_dashboard: EXISTS
- paciente: MISSING (migration 20261027000000 n√£o aplicada)
- cid10: MISSING (migration 20261026000000 n√£o aplicada)
- cbo_ocupacoes: MISSING
- sigtap_procedimentos: MISSING

## Matriz de reconcilia√ß√£o (resumo)

| √Årea | Proposta Enterprise | Atual | Classifica√ß√£o |
|------|---------------------|-------|---------------|
| Pacientes | patients (nome social, m√£e, CNS, endere√ßo) | paciente (enxuto) | PARCIAL ‚Äî adicionar campos √∫teis |
| CID-10 | cid10 | cid10 (migration pendente) | AUSENTE no remoto |
| CBO | cbo | cbo_ocupacoes (migration pendente) | AUSENTE no remoto |
| SIGTAP | sigtap (compet√™ncia) | sigtap_procedimentos (migration pendente) | AUSENTE no remoto |
| Organiza√ß√µes | organizations | tenants | INCOMPAT√çVEL ‚Äî usar tenants |
| Unidades | unidades | remocao_unidade | INCOMPAT√çVEL ‚Äî usar remocao_unidade |
| Profissionais | profissionais | people + tenant_memberships | INCOMPAT√çVEL ‚Äî mapear para people |
| Remo√ß√µes | remocoes | remocao | INCOMPAT√çVEL ‚Äî adaptar campos |
| RLS | permissivas (OR) | RLS por tenant | INCOMPAT√çVEL ‚Äî reutilizar helpers |

## Problemas do SQL enterprise

1. RLS permissiva combinada com pol√≠tica motorista (OR anula restri√ß√£o).
2. Aus√™ncia de pol√≠ticas para GPS, anexos, checklists, evolu√ß√µes, hist√≥rico.
3. Views pressup√µem campos (s.nome, s.valor_total) que podem n√£o existir.
4. Coluna gerada `idade` depende de age() (n√£o imut√°vel).
5. Gerador de c√≥digo redundante (DEFAULT j√° gera).
6. Seed com CNPJ fict√≠cio.
7. Estados operacionais incompat√≠veis com enums atuais.

## Seguran√ßa

- admin_master: escopo global (verificar root_privileges).
- admin_gestao: tenant/unidade (verificar role_permissions).
- Suporte: permiss√µes expl√≠citas.
- Gestores: limitados √† unidade.
- RLS efetiva no banco.

## Pend√™ncias remotas

- Aplicar migration 20261026000000 (catalogos).
- Aplicar migration 20261027000000 (paciente) ‚Äî corrigida (√≠ndice √∫nico parcial).
- Verificar hist√≥rico de migrations aplicadas.

## Valida√ß√£o local

- Type-check: PASS
- Lint: PASS (warnings pr√©-existentes)
- Build: PASS (28s)

## Complemento ó SIGTAP, CID-10 e faturamento

### SIGTAP e competÍncia
- Chave composta (codigo, competencia) j· prevista na migration 20261026000000.
- Preservar histÛrico de competÍncias mensais.
- Campos: valores SH/SA/SP/total, nomes, grupos, subgrupos, forma de organizaÁ„o, CIDs permitidos, CBOs permitidos, sexo, faixas et·rias.
- N„o remover/substituir dados sem estratÈgia explÌcita de migraÁ„o.

### CID-10
- Campos: categoria, subcategoria, descricao, capitulo.
- EstratÈgia de importaÁ„o e atualizaÁ„o do cat·logo oficial.
- Diferenciar dados oficiais importados de exemplos manuais.

### Dados de exemplo
- N„o tratar procedimentos/valores numÈricos do SQL como cat·logo oficial validado.
- N„o introduzir como seed de produÁ„o.
- Registrar quais dados precisam ser conferidos com fonte oficial e competÍncia aplic·vel.

### Views de faturamento
- SQL usa remocoes, projeto usa remocao. Adaptar sem criar tabela paralela.
- Verificar FK do paciente, campo de procedimento e relaÁ„o com competÍncia SIGTAP.
- N„o adotar automaticamente fÛrmula valor_total + km_total * 1.2 (hipÛtese, n„o regra oficial).
- Diferenciar valor de referÍncia do procedimento, estimativa interna e valor efetivamente faturado.
- N„o declarar view correta antes de validar colunas e tipos contra schema real.

### SeguranÁa
- Definir como consultas respeitar„o tenant, unidade e permissıes.
- Avaliar RLS e exposiÁ„o de dados pessoais em views.
- N„o conceder acesso p˙blico nem introduzir permissıes amplas.

### Busca e desempenho
- Avaliar Ìndices de busca textual em portuguÍs e Ìndices de cÛdigo.
- Confirmar extens„o e configuraÁ„o necess·rias antes de criar Ìndices.
- Evitar Ìndices duplicados e objetos redundantes.

