# Remoção Alpha — Matriz de Perfis e Permissões

## Perfis e páginas iniciais
- Gestão: Central de Comando, fila de despacho, agendamentos, mapa, cadastros, relatórios, avaliação de equipes.
- Motorista: interface mobile — aceite/recusa, equipe, veículo, checklists, navegação, eventos, encerramento.
- Enfermagem/Médico/Profissionais de apoio: registros e atribuições limitados aos atendimentos autorizados.
- Administração: usuários, papéis, permissões, organizações.
- Suporte: leitura/auxílio conforme permissões.

## Regras
- RLS por tenant e unidade em todas as tabelas.
- `remocao_auditoria` e `remocao_status_historico` imutáveis.
- Status nunca escrito diretamente; usar RPC `update_remocao_status`.
- `service_role` nunca no frontend.
- Permissões no formato `remocao.<entidade>.<acao>`.
