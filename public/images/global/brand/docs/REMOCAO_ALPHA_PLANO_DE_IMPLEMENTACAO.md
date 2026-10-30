# Remoção Alpha — Plano de Implementação

## Fases
- P0 — Segurança e inventário (RLS, permissões, auditoria de segredos).
- P1 — Cadastros e fundação de dados (pessoas, pacientes, profissionais, endereços, estabelecimentos).
- P2 — Solicitação, regulação e despacho (CRUD de remoção ponta a ponta).
- P3 — Experiências por perfil (Gestão, Motorista, profissionais).
- P4 — GPS, eventos e integrações (CEP, n8n, Google Calendar, mapas).
- P5 — Relatórios, indicadores e qualidade visual.

## Critérios de aceite
- Cadastro de remoção conclui com confirmação real e listagem atualizada.
- Loading encerra em sucesso e falha.
- RLS/tenant/unidade preservados.
- Testes + tsc + lint + build verdes.

## Segurança pendente
- `.env` com credenciais versionadas: verificar exposição e planejar rotação. Adicionar ao `.gitignore` não remove conteúdo já versionado.
