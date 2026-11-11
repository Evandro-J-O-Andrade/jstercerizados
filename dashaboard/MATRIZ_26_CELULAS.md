# Matriz visual por célula — 26 domínios

> **Proposta de design**. As rotas indicadas não foram aplicadas ao aplicativo; cada tela exige validação do contexto, authorization guard, repository, RPC/query e RLS.

| Célula | Dashboard (referência) | Recurso CRUD | Ação primária | KPIs visuais |
|---|---|---|---|---|
| 01. `admin-master` — Admin Master | `/dashboard/admin-master` | `tenants` | Nova organização | Tenants ativos, Pessoas globais, Células registradas, Convites pendentes, Eventos críticos, Disponibilidade contratual |
| 02. `admin-tenant` — Admin Tenant | `/dashboard/admin-tenant` | `usuarios` | Criar usuário | Usuários ativos, Convites pendentes, Equipes, Unidades, Papéis atribuídos, Acessos revisados |
| 03. `admin` — Administração | `/dashboard/admin` | `cadastros` | Novo cadastro | Cadastros, Pendências, Aprovações, Revisões, Alterações, Conformidade |
| 04. `core` — CORE | `/dashboard/global` | `celulas` | Inspecionar célula | Células, Contratos válidos, Rotas declaradas, Probes locais, Dependências, Alertas |
| 05. `integracoes` — Integrações | `/dashboard/integracoes` | `conectores` | Novo conector | Conectores, Eventos recebidos, Webhooks, Entregas, Falhas, Pendências |
| 06. `configuracoes-saas` — Configurações SaaS | `/dashboard/configuracoes-saas` | `configuracoes` | Nova configuração | Regras ativas, Flags, Planos, Versões, Pendências, Alterações |
| 07. `preferencias` — Preferências | `/dashboard/preferencias` | `preferencias` | Gerenciar preferências | Preferências, Alertas ativos, Canais, Sessões, Dispositivos, Revisões |
| 08. `candidato` — Candidato | `/candidato` | `candidaturas` | Buscar vagas | Candidaturas, Em análise, Entrevistas, Propostas, Vagas salvas, Perfil completo |
| 09. `recrutamento` — Recrutamento | `/dashboard/recrutamento` | `vagas` | Publicar vaga | Vagas abertas, Candidaturas, Em triagem, Entrevistas, Contratações, Tempo médio |
| 10. `rh` — Recursos Humanos | `/dashboard/rh` | `colaboradores` | Novo colaborador | Colaboradores, Admissões, Afastamentos, Desligamentos, Documentos, Pendências |
| 11. `empresas` — Empresas | `/dashboard/empresas` | `empresas` | Nova empresa | Empresas ativas, Clientes, Parceiros, Fornecedores, Vagas abertas, Contatos |
| 12. `crm` — CRM | `/dashboard/crm` | `oportunidades` | Nova oportunidade | Leads, Oportunidades, Propostas, Negociações, Ganhos, Conversão |
| 13. `servicos` — Serviços | `/dashboard/servicos` | `servicos` | Novo serviço | Serviços publicados, Solicitações, Ordens abertas, Em execução, Finalizadas, Avaliações |
| 14. `operacoes` — Operações | `/dashboard/operacoes` | `ordens` | Nova ordem | Ordens abertas, Em execução, Checklists, Ocorrências, Concluídas, SLA |
| 15. `suporte` — Suporte | `/dashboard/suporte` | `chamados` | Abrir chamado | Chamados abertos, Em atendimento, SLA em risco, Resolvidos, Escalonados, Satisfação |
| 16. `estoque` — Estoque | `/dashboard/estoque` | `produtos` | Novo produto | Itens ativos, Estoque baixo, Movimentos, Entradas, Saídas, Inventários |
| 17. `ava` — AVA e Aprendizagem | `/dashboard/ava` | `cursos` | Novo curso | Cursos ativos, Alunos, Em andamento, Certificados, Avaliações, Conclusões |
| 18. `financeiro` — Financeiro | `/dashboard/financeiro` | `lancamentos` | Novo lançamento | Receitas previstas, Despesas, A receber, A pagar, Saldo projetado, Atrasos |
| 19. `faturamento` — Faturamento | `/dashboard/faturamento` | `faturas` | Nova fatura | Faturas emitidas, Em aberto, Recebidas, Vencidas, Receita prevista, Ciclo médio |
| 20. `contabilidade` — Contabilidade | `/dashboard/contabilidade` | `lancamentos` | Novo lançamento | Lançamentos, Conciliações, Contas, Centros, Fechamentos, Pendências |
| 21. `fiscal` — Fiscal | `/dashboard/fiscal` | `documentos` | Novo documento | Documentos, Notas válidas, Pendências, Impostos, Eventos, Conferências |
| 22. `contratos` — Contratos | `/dashboard/contratos` | `contratos` | Novo contrato | Contratos ativos, A vencer, Renovações, Aditivos, Assinaturas, Valores |
| 23. `pos` — Ponto de Venda | `/dashboard/pos` | `vendas` | Nova venda | Vendas, Transações, Caixas abertos, Ticket médio, Cancelamentos, Fechamentos |
| 24. `relatorios` — Relatórios e BI | `/dashboard/relatorios` | `relatorios` | Novo relatório | Relatórios, Painéis, Exportações, Agendados, Fontes, Alertas |
| 25. `ia` — Inteligência Artificial | `/dashboard/ia` | `agentes` | Novo agente | Agentes ativos, Conversas, Automações, Intervenções, Revisões, Alertas |
| 26. `media` — Mídia e Documentos | `/dashboard/media` | `ativos` | Enviar arquivo | Arquivos, Imagens públicas, Documentos privados, Em uso, Pendentes, Versões |

## Cinco telas propostas por recurso

- Dashboard: `/dashboard/{celula}` ou rota canônica específica; **não contém formulário**.
- Listagem: `/{recurso}`; filtros, paginação, ações, exclusão/arquivamento com confirmação e direitos.
- Criação: `/{recurso}/novo`; página dedicada, contexto, instruções, validações e revisão.
- Detalhe: `/{recurso}/:id`; abas, documentos, auditoria, relacionamentos e timeline.
- Edição: `/{recurso}/:id/editar`; rota separada, pré-carregamento e controle concorrente.

## Valores e comportamento

Todos os KPI, linhas e nomes nas capturas são fictícios; não devem ser usados como seed nem como mock de produção. O Codex deve substituir cada origem pelo repository da célula, modelagem Supabase já existente e autorização correspondente.

### Invariantes protegidas
- Admin Master: `/dashboard/admin-master`.
- Central 24H: `/dashboard/global`.
- Candidato: `/candidato`.
- Recrutamento: `/dashboard/recrutamento/*`.
- P0.1 fechado; P0.2 bloqueado; OBS-01 não autorizado.
- Site público, marca e footer preservados.
- Autorização de endpoint/SQL não pode derivar de menu nem manifesto de UI.