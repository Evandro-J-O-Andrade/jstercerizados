# CHECK BOULER 24H — Catálogo visual de dashboards e fluxos CRUD

**Empresa:** J&S Empregos LTDA  
**Situação:** protótipos de UX/UI, **NÃO** screenshots do sistema em produção.  
**Atenção:** nomes, números, datas, KPIs, status e registros são **somente amostras visuais**, explicitamente identificadas como `DADOS FICTÍCIOS / SEM CONEXÃO`.

## O que este pacote contém

| Diretório | Conteúdo |
|---|---|
| `00_referencias_existentes/` | Artes anteriores da conversa, imagens fornecidas pelo usuário e novas composições visuais geradas. |
| `01_dashboards_26_celulas/` | **26 dashboards**, cada um com identidade, KPIs, funil/etapas, atividades e tabela vinculados conceitualmente a sua célula. |
| `02_crud_e_jornadas/01_listagem/` | **26 listagens** CRUD com filtros, resultados, ações e paginação. |
| `02_crud_e_jornadas/02_criacao/` | **26 páginas exclusivas de criação**; o formulário não fica no dashboard. |
| `02_crud_e_jornadas/03_detalhes/` | **26 páginas de detalhe** com vínculos, dados, timeline e histórico. |
| `02_crud_e_jornadas/04_edicao/` | **26 páginas exclusivas de edição**. |
| `03_codigo_react/` | Prévia HTML offline, CSS e React/TSX de referência com catálogo JSON das 26 células. |
| `04_documentacao/` | Matriz de telas, modelo de rotas, instruções para Codex e checklist de aceite. |

**Total de capturas estruturadas:** 130 PNGs + artes conceituais anteriores. 

## Qualidade e limitação

Estes protótipos mostram o **sistema de design**, sua densidade e estrutura, mas não concluem a implementação real de cada célula. O Codex deve adaptar widgets e fluxos próprios por domínio, em vez de renderizar o mesmo gráfico/kanban em todas as áreas. Exemplo: Financeiro exige fluxo de caixa, aging, conciliação e análises monetárias; RH exige headcount, admissões, afastamentos e turnover; Admin Master exige governança e auditoria; Recrutamento exige ATS/kanban; Candidato exige vagas, currículo, candidaturas e evolução.

**As URLs abaixo são apenas propostas.** No projeto real, reconciliar cada rota com `App.tsx`, CellRegistry, DispatcherMaster, P0.1 e P0.2; preservar aliases existentes.

## Execução do protótipo

### Visualização sem instalação

Abra `03_codigo_react/preview.html` localmente no navegador; exemplo de parâmetro:

- `?cell=financeiro&view=dashboard`
- `?cell=admin-tenant&view=new`
- `?cell=candidato&view=detail`
- `?cell=servicos&view=list`

Se o navegador bloquear acesso local, use um servidor HTTP local.

### React / TSX de referência

```bash
cd 03_codigo_react
npm install
npm run dev
```

Código da referência em `03_codigo_react/src/App.tsx`, catálogo em `src/moduleCatalog.json`, estilos em `src/styles.css`.

**Não foi executado `npm install` nem `npm run build` deste protótipo nesta sessão.** O TSX teve apenas validação de parse; capturas HTML foram renderizadas em Chromium com zero erros JS.

## Contrato de qualidade funcional a cumprir no projeto real

1. `Dashboard` é exclusivamente visão analítica por perfil/célula e deve consumir indicadores reais do banco.
2. `List` concentra busca, filtros, paginação, seleção e ações autorizadas; não exibe formulário inline.
3. `New` é uma rota exclusiva com formulário contextual, validação Zod e fluxos por etapas.
4. `Details` é uma página própria com visão 360°, relacionamentos, documentos, histórico e ações.
5. `Edit` é uma rota exclusiva com dados reais, validações e controles de mudança.
6. Todas as views usam estados `loading`, `empty`, `error`, `forbidden`, `success`, `offline` quando aplicáveis.
7. Dados públicos publicados podem usar snapshots versionados com revalidação; **não** usar cache público como fonte de autorização, nem reutilizar dados privados entre usuários/tenants.
8. Forms só podem exibir sucesso após persistência confirmada. Upload deve usar Media e Storage apropriados; PDFs privados jamais em bucket público por conveniência.
9. Auth, RBAC/RLS, CSP, Turnstile, Storage, migrations, Supabase remoto e produção têm gates próprios de aprovação.
10. Preservar o nome **J&S Empregos LTDA** e o footer institucional conforme `AGENTS.md`.

## Estratégia de migração recomendada

**G0:** documentação, baseline visual/funcional e inventário.  
**G1:** estabilizar testes CORE, ModuleRouter, aliases, navegação e guards; preservar P0.2.  
**G2:** candidato/ativação por e-mail, com autorização de Auth/SMTP e teste real.  
**G3:** migrar fluxos CRUD operacionais por células; componentes sem dependência de `legacy/portal`.  
**G4:** Page Builder declarativo, mídia e conteúdo; cache público com snapshots.  
**G5:** publicação progressiva de vagas, serviços, blog, Home e demais páginas sem alterar a experiência pública aprovada antes da homologação.  
**G6:** retirada final do legado autenticado após testes completos e rollback comprovado.

Nenhum código do repositório original ou configuração de produção foi alterado para criar este pacote.
