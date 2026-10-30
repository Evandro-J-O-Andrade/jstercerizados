# Sistema Remocao Alpha — Blueprint (Markdown nativo)

> Origem: `docs/Sistema-Remocao-Alpha-Blueprint.html` (prototipo de interface). Dados de exemplo (pacientes, contagens, viaturas) sao ilustrativos e NAO devem ser tratados como producao.

## 1. Visoes por perfil

- Gestao (desktop): central de comando, fila operacional, KPIs, filtros, acompanhamento GPS.
- Motorista (mobile): fluxo em 5 etapas, offline-first, navegacao inferior, checklist.

## 2. Navegacao (sidebar)

Itens: Central de Remocoes, Nova Remocao, Relatorios, Dashboard Analitico, Gestao de Acessos, Admin Global, Minha Conta.

## 3. Central de Remocoes

### KPIs operacionais

- Viaturas disponiveis / ocupadas
- Remocoes criticas ativas
- Espera media atual
- Remocoes aguardando >= 15 min

### Fila / Kanban

Colunas por etapa operacional (status reais do enum `remocao_status`):

Solicitada, Em avaliacao, Aguardando destino, Destino confirmado, Aguardando equipe, Equipe confirmada, Aguardando motorista, Motorista check-in, Motorista confirmado, Checklist pendente, Pronta para saida, Em deslocamento, Chegada destino, Paciente entregue, Retornando, Retornou unidade, Encerrada, Suspensa, Intercorrencia, Cancelada, Nao realizada.

Cartao exibe: numero, paciente, prioridade, origem, destino, equipe, motorista, viatura, tempo de espera.

### Filtros

Etapa (todas/pendentes/transito/concluidas/canceladas), prioridade, busca (paciente/numero/motorista).

### Acompanhamento GPS

Ultima posicao da remocao selecionada. GPS e evidencia, nao confirmacao automatica de chegada/entrega.

## 4. Fluxo do motorista (5 etapas)

1. Check-in na origem
2. Checklist de seguranca (oxigenio, maca, cinto, desfibrilador)
3. Embarque do paciente
4. Transito / chegada ao destino
5. Check-out e relatorio final assinado

Operacao offline-first com sincronizacao e prevencao de duplicidade.

## 5. Solicitacao de remocao

Campos: paciente (nome, prontuario, nascimento, sexo, diagnostico, condicao clinica, precaucoes, alergias, necessidades especiais), origem (unidade, setor, leito), destino (unidade, setor, endereco, contato), finalidade, prioridade, tipo de transporte, nivel de suporte, necessidade medica, justificativa, agendamento (data, horario saida, horario atendimento), documentos.

Catalogos: CID-10, SIGTAP (por competencia), CBO. Compatibilidade CID/SIGTAP nao verificada automaticamente.

## 6. Documentos

3 grupos: avatar/profissional/paciente. Anexos PDF/JPG/PNG ate 20MB.

## 7. Permissoes

Formato `remocao.<entidade>.<acao>`. RBAC + RLS por tenant/unidade. Navegacao visivel nao substitui autorizacao no backend.

## 8. Auditoria

Eventos operacionais com responsavel, horario e contexto. `remocao_auditoria` e `remocao_status_historico` imutaveis.

## 9. Identidade visual

Tokens em `remocao.css`. Sidebar compacta, tema claro/escuro, Lucide icons (sem emojis). Responsivo desktop/tablet/mobile.

## 10. Integracoes (nao comprovadas)

CMDPro, Google Sheets, n8n: tratar como separadas, com contratos/credenciais proprios. Nao assumir disponibilidade.

## 11. Restricoes

- Supabase e fonte de verdade; sem Prisma.
- Status via RPC `update_remocao_status`, nunca escrita direta.
- GPS e evidencia, nao confirmacao.
- Sem dados ficticios em producao.
- Sem alteracao de banco remoto sem autorizacao.
