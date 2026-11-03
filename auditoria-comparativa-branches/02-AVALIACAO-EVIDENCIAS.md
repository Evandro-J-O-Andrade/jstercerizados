# AVALIAÇÃO POR ARTEFATO - EVIDÊNCIAS

Data: 2026-11-02 22:49:40

## PortalSidebar - origin/test/sobre-layout-fix-478743c vs main

- Branch traz hierarquia expansível (módulos > features > sub-features)
- Auto-expansão por rota, controle de nós recolhidos, agrupamento por categoria
- Estado recolhível, info usuário, data/hora, voltar ao site, troca de conta
- Usa AccountContext + ModuleRegistry

Main atual tem PortalSidebar, mas shell principal usa AdminSidebar fixo (/dashboard via AppShell/AdminShell).
**Recomendação:** Avaliar extração da lógica hierárquica para navegação global conectada ao catálogo (sem copiar arquivo inteiro). Verificar integração com CellRegistry.

## Home - origin/snapshot/pc-trabalho-20260901 vs main

- Snapshot tem HeroSplit + seções bem compostas
- Main evoluiu para hooks públicos (usePublicJobsAsVagas/usePublicClients) e melhor tratamento erros
- Jobs snapshot usa tenant_id fixo (problema)
  **Recomendação:** Extrair composição visual HeroSplit/cards, migrar para hooks públicos da main.

## Arquitetura navegação - CRÍTICO (main)

- AdminSidebar fixo (13 itens hardcoded) em shell principal
- admin-master registrado mas não integrado ao shell/navegação
- cell-to-module-definition força scope tenant e não respeita homeRoute
- Dependências legacy ainda presentes
- Global sidebar do banco existe mas não conectada
  **Ação:** Fechar matriz antes de integração visual.

# AVALIAÇÃO FORMULÁRIOS

Data: 2026-11-02 22:50:11

## JobApplicationForm

- Snapshot: envia via WhatsApp (buildJobApplicationMessage) + sanitização, abre link
- Main: usa RHF + Zod, abre WhatsApp (sem persistência clara no trecho analisado)
  **Observação:** Precisa verificar se main persiste candidatura (repository/service/RPC). Snapshot também mostra envio via WhatsApp. Ambos não comprovam persistência completa.

## Conclusão

Formulários precisam auditoria de persistência (banco). UX/sanitização podem ser aproveitadas.

## Próximos passos

- Verificar persistência candidatura em main (buscar createApplication/aplicar vaga)
- Comparar Kanban candidato entre branches
- Consolidar matriz final com evidências + riscos + aproveitável
