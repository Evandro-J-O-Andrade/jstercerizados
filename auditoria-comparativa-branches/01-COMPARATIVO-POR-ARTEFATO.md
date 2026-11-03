# COMPARATIVO POR ARTEFATO - INÍCIO

Data: 2026-11-02 22:48:41

## 1) Navegação / Sidebar

### Branch: origin/test/sobre-layout-fix-478743c

Arquivo: src/components/portal/PortalSidebar.tsx (618 linhas)
Características observadas:

- Hierarquia expansível: módulo > feature > sub-feature
- Auto-expansão por rota (ensureExpandedForRoute)
- Agrupamento por categoria (INÍCIO, PLATAFORMA, OPERAÇÃO, IA & AUTOMAÇÃO, SEGURANÇA, DOCUMENTOS, CONTA)
- Ícones dinâmicos (ICON_MAP)
- Estado collapsed (recolhível)
- Informações de usuário/contexto/data-hora
- Botão \"Voltar para o site\"
- Suporte a troca de conta (switchAccount)

### Main atual

- PortalSidebar existe (analisado anteriormente)
- AdminSidebar fixo em shell principal (/dashboard via AppShell/AdminShell)
- AdminTenantSidebar próprio
- ModuleRouter usa CellRegistry

## 2) Home / Institucional

### Branch: origin/snapshot/pc-trabalho-20260901

Arquivo: src/pages/Home.tsx
Características:

- HeroSplit com slides configurados
- Seções: Consultoria RH, Facilities, Para Candidatos, Vagas em Destaque, Diferenciais, Relacionamentos, Clientes reais, CTA
- Usa useQuery para clientes/jobs (com tenant_id fixo em jobs)
- ClientCard/SafeImage

### Main atual

- Evoluiu com usePublicJobsAsVagas/usePublicClients
- Melhor tratamento erros/estados
- Arquitetura mais alinhada com repositórios

## 3) Formulários

### Branch: origin/snapshot/pc-trabalho-20260901

- JobApplicationForm, ServiceRequestForm, DivulgarVagaForm presentes
- JobApplicationForm monta mensagem e tenta abrir WhatsApp (sem persistência clara)

### Main atual

- Usa React Hook Form + Zod
- Precisa auditoria de persistência completa

## Conclusão parcial

- PortalSidebar da branch test/sobre-layout-fix-478743c tem melhor hierarquia UX
- Home snapshot tem boa composição visual, mas camada dados precisa integração com abordagem main
- Formulários precisam verificação de persistência

## 4) Dashboard/Kanban

### Main atual

- src/modules/candidato/pages/CandidaturasKanban.tsx existe (etapas: Enviada, Triagem, Entrevista, Entrevista técnica, Proposta, Contratado, Rejeitado, Desistente, Em espera)

### Branches a verificar

- feat/database-v21-local-rebuild (hooks/repositories)
- checkpoint-before-enterprise-dashboard (dashboards)
- feat/admin-master-global-dashboard

## 5) Navegação arquitetura (CRÍTICO)

Main: AdminSidebar fixo no shell principal, não usa CellRegistry. PortalSidebar contextual.
Branch test/sobre-layout-fix-478743c: PortalSidebar com melhor hierarquia.
Necessário cruzar com diagnóstico anterior (shell fixo, conversão células com scope tenant, dependências legacy).

## Plano de ação

1. Comparar PortalSidebar/Header test/sobre-layout-fix-478743c vs main (evidências)
2. Comparar Home snapshot vs main
3. Comparar formulários (JobApplicationForm/ServiceRequestForm)
4. Verificar Kanban branches
5. Consolidar matriz com \"porquê melhor\" + riscos + aproveitável
