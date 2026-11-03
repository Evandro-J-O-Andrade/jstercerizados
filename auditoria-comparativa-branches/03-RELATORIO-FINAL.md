# RELATÓRIO FINAL - AUDITORIA COMPARATIVA POR ARTEFATO

Data: 2026-11-02 22:52:27
Modo: SOMENTE LEITURA

## 1) Navegação (PRIORITÁRIO ARQUITETURAL)

| Item                                                                                 | Origem                               | Avaliação                    | Aproveitável                          |
| ------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------- | ------------------------------------- |
| PortalSidebar hierárquico (módulos>features>sub-features, auto-expansão, categorias) | origin/test/sobre-layout-fix-478743c | Melhor UX que atual          | Sim - lógica de hierarquia/expansão   |
| PortalHeader contexto/busca/troca conta/tema                                         | origin/test/sobre-layout-fix-478743c | Melhor UX                    | Sim                                   |
| AdminSidebar fixo (hardcoded)                                                        | main                                 | Limita navegação global      | NÃO - precisa substituir por catálogo |
| cell-to-module-definition força scope tenant / não respeita homeRoute                | main                                 | Bloqueia admin-master global | CRÍTICO corrigir                      |

## 2) Institucional/Home

| Item                                  | Origem                               | Avaliação                                     | Aproveitável                                  |
| ------------------------------------- | ------------------------------------ | --------------------------------------------- | --------------------------------------------- |
| HeroSplit + composição Home           | origin/snapshot/pc-trabalho-20260901 | Boa composição visual                         | Sim - visual, migrar para hooks públicos main |
| usePublicJobsAsVagas/usePublicClients | main                                 | Melhor (sem tenant_id fixo, tratamento erros) | PRESERVAR                                     |
| Sobre (partículas/timeline)           | origin/test/sobre-layout-fix-478743c | Rico visualmente                              | Avaliar com cautela, preservar identidade     |

## 3) Formulários

| Item                                     | Origem           | Avaliação                                         | Aproveitável                      |
| ---------------------------------------- | ---------------- | ------------------------------------------------- | --------------------------------- |
| JobApplicationForm (RHF+Zod+sanitização) | main vs snapshot | Ambos enviam via WhatsApp, persistência não clara | Auditoria persistência necessária |

## 4) Operação

| Item               | Origem | Avaliação           | Aproveitável                                   |
| ------------------ | ------ | ------------------- | ---------------------------------------------- |
| CandidaturasKanban | main   | Presente com etapas | Avaliar vs branches se houver versões melhores |

## Recomendações

1. **Arquitetura primeiro:** Corrigir shell principal (conectar catálogo/CellRegistry), corrigir cell-to-module-definition (respeitar scope global + homeRoute), integrar admin-master
2. **Navegação visual:** Extrair hierarquia PortalSidebar/Header da branch test/sobre-layout-fix-478743c
3. **Home:** Aproveitar composição HeroSplit/sections do snapshot migrando para hooks públicos da main
4. **Formulários:** Investigar persistência candidatura antes de alterar fluxo
5. **Sem merge integral** - extrair por artefato com dependências/risco

Documentos gerados em auditoria-comparativa-branches/
