# Remoção Alpha — Fluxos Operacionais

## Transições de status
Enforced by `validar_transicao_status()` no banco. Frontend deve chamar `update_remocao_status()` RPC, nunca escrever `status` diretamente.

## Fluxos principais
1. Solicitação → validação → persistência → confirmação → atualização da listagem.
2. Regulação → atribuição de motorista/veículo/equipe → aceite/recusa.
3. Deslocamento → chegada → embarque → entrega → encerramento.
4. Cancelamento, não realização, vaga zero, evasão, intercorrências.
5. Evoluções por profissional; GPS como evidência operacional (não confirma embarque/entrega sozinho).
6. Auditoria e histórico imutáveis.

## Integrações
- CEP: ViaCEP/BrasilAPI para preenchimento; validação manual permitida.
- n8n: orquestração assíncrona; falha não pode bloquear fluxo central.
- Google Calendar: sincronização de agendamentos; banco é fonte da verdade.
- GPS: posições associadas a motorista/veículo/remoção com timestamp, precisão e origem.
