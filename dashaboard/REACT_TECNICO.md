# React/TSX — como transformar o protótipo em sistema funcional

## Arquivos inclusos

- `03_codigo_react/src/App.tsx` — protótipo React 19 com navegação por célula e cinco views independentes.
- `03_codigo_react/src/moduleCatalog.json` — metadados visuais para 26 células.
- `03_codigo_react/src/styles.css` — design system do protótipo (CSS puro; converter gradualmente para tokens Tailwind existentes).
- `03_codigo_react/preview.html` — prévia HTML estática para inspeção e imagens.
- `03_codigo_react/render_screens.py` — script de captura local Chromium.

## Adaptação no repositório verdadeiro

O `App.tsx` do pacote é uma referência visual **separada**, não deve substituir `src/App.tsx` do projeto real. Em produção, integrar a UI ao CellRegistry, React Router e à estrutura de módulos vigente; não montar registries ou sistemas Auth paralelos.

### Padrão de diretórios de uma célula (proposta)

```text
modules/<celula>/
  routes/
    CellRoutes.tsx
  pages/
    DashboardPage.tsx
    ResourceListPage.tsx
    ResourceNewPage.tsx
    ResourceDetailPage.tsx
    ResourceEditPage.tsx
  components/
    filters/
    tables/
    forms/
    domain-widgets/
  hooks/
  repositories/
  services/
  types/
  permissions/
  tests/
```

### Fonte dos KPIs

No protótipo: `mod.metrics` são números fictícios.  
Em produção: hooks tipados consultam métricas reais com a resolução correta de tenant e permissão. A UI precisa receber `loading`, `error`, `empty`, `data`, `updatedAt` e `source`, sem trocar erro por mock em runtime.

### Padrão CRUD

`ResourceListPage`: consulta paginada por filtro/cursor, ordenação, seleção e ações condicionais.  
`ResourceNewPage`: form Zod e `create`, com confirmação real e redirecionamento ao recurso persistido.  
`ResourceDetailPage`: `getById`, tabs contextuais, timeline, documentos e operações auditadas.  
`ResourceEditPage`: `getById` + `update` com controle de concorrência e validação.  
`ResourceDashboardPage`: métricas reais + visão analítica própria, sem formulário de criação/edição embutido.

### Dados compartilhados entre células

Recrutamento pode ler candidatos e vagas **por contratos explícitos**, e Admin Master pode ler contexto global conforme política. Essa referência não concede privilégios nem expõe dados de terceiros. As permissões de UI e RLS devem ser verificadas separadamente.

### Telas adicionais necessárias

- **Candidato:** marketplace de vagas; detalhe da vaga; candidatura, currículo, evolução de carreira, entrevistas e arquivos.
- **Recrutamento:** ATS Kanban; criação/publicação de vagas; ficha 360° do candidato; entrevista; proposta.
- **Financeiro:** fluxo de caixa; contas a pagar/receber; conciliação; fechamento; aging e liquidação.
- **Admin Master:** tenants; identidade/pessoas; papéis/permissions; auditoria; administração global; Central 24H separada.
- **CMS:** Home, Hero, cards, CTAs, seções, editor de página, preview e publicação.
- **Mídia:** biblioteca, upload, associar, definir principal, avatar, PDF privado e retenção.

## Validação

Os arquivos HTML foram renderizados em Chromium (130 capturas, 0 exceções JS). O `src/App.tsx` foi validado sintaticamente com o parser TypeScript, porém **não houve instalação/build executados** da referência React; ela deverá ser compilada e adaptada no ambiente do usuário.
