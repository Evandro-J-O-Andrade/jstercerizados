# Matriz de testes de autorização e imutabilidade — tenant_memberships
Ambiente: staging okxqfyoqbhcmflpurfrw (não executar alterações)
Revisão: 2026-10-17

## Perfis testados (reais)
1. admin_master (global)
2. tenant_admin (do tenant alvo)
3. membro comum (mesmo tenant, não-admin)
4. usuário sem vínculo com o tenant

## Objetivos
- Validar proteção de colunas imutáveis (id, person_id, tenant_id, joined_at, created_at)
- Validar UPDATE de status/membership_role conforme hierarquia (quando definida)
- Validar visibilidade SELECT via RLS
- Validar que membro comum não pode alterar papéis de outros membros
- Verificar interação PERMISSIVE/RESTRICTIVE nas políticas UPDATE

## Cenários
| Cenário | Esperado | Observação |
|---|---|---|
| Membro comum tenta alterar membership_role de outro membro | Negado | Não deve herdar autorização por "ser membro" |
| tenant_admin altera membership_role válido (quando hierarquia definida) | Permitido conforme regra | Respeitar promoção/rebaixamento |
| admin_master altera | Conforme hierarquia definida | Global |
| Sem vínculo altera | Negado | RLS bloqueia |
| Tenta alterar id/person_id/tenant_id/joined_at/created_at | Negado (trigger) | Imutabilidade |
| Tenta alterar left_at (se existir) | Definir explicitamente | Não protegido intencionalmente |
| Tenta alterar updated_at | Geralmente permitido (trigger set_updated_at) | Não protegido intencionalmente |
