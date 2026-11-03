# CONSOLIDAÇÃO ESTÁGIOS 01/01b - BRANCHES

Data: 2026-11-02 21:45:38
Modo: SOMENTE LEITURA

## Estado

- Estágio 01 (Layouts): Quase concluído
- Estágio 01b (Navegação/Sidebar): Em diagnóstico - mapa arquitetural definido
- Auditoria branches: Em andamento (12 documentos criados)

## Principais achados

**Arquitetura atual está ALINHADA com proposta:**

- Sidebar global por módulos + sidebar local por célula
- CellRegistry como catálogo canônico com ponte para legado
- DispatcherMaster autoridade central
- AuthorizationContract com default deny
- AdminTenantSidebar como exemplo de sidebar local independente
- AccountContext filtra módulos/features por permissões

**Pontos de atenção:**

- Duas fontes paralelas (legado/ModuleRegistry + CellRegistry) - necessidade de unificação gradual
- AdminTenantSidebar usa AuthContext direto (permissions) vs AccountContext
- Paridade entre visibilidade menu e autorização rota precisa validação
- PortalSidebar vs navegação por células - integração a mapear

## Próximos

1. Fechar leitura layouts restantes
2. Completar mapeamento paridade guards x catálogo
3. Cruzar com branches (PortalSidebar melhorias)
4. Consolidar matriz melhorias com evidências

Documentos: auditoria-branches/00-10 + anteriores
