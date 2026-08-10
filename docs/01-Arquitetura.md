# Arquitetura — JSEmpregos

## Princípios

- **Feature-Based Architecture**: cada funcionalidade possui seu próprio diretório com components, hooks, types e services.
- **Clean Architecture**: separação clara entre camadas (UI, lógica de negócio, dados).
- **SOLID**: princípios de design orientados a objetos aplicados ao React.
- **DRY / KISS**: código reutilizável e simples.

## Camadas

```
Presentation (UI Components)
    ↓
Features (Business Logic per domain)
    ↓
Services (Data access, APIs, Mocks)
    ↓
Types (Shared interfaces and types)
```

## Estrutura de Feature

Cada feature segue esta estrutura:

```
features/<feature-name>/
├── components/
│   ├── <Feature>Form.tsx
│   ├── <Feature>List.tsx
│   └── <Feature>Card.tsx
├── hooks/
│   └── use<Feature>.ts
├── types/
│   └── index.ts
├── services/
│   ├── api/          (real API calls)
│   ├── mock/         (mocked data)
│   └── integrations/ (n8n, WhatsApp, etc.)
├── constants/
│   └── index.ts
└── index.ts          (public API of the feature)
```

## Padrão de Services

Os services são desacoplados dos componentes. Inicialmente usam dados mockados (localStorage), e posteriormente serão substituídos por chamadas reais ao Supabase sem alterar os componentes.

```
services/
├── mock/       → Dados simulados (localStorage)
├── api/        → Chamadas reais (Supabase)
└── integrations/ → n8n, WhatsApp, SMTP, etc.
```

## Fluxo de Dados

1. Usuário interage com o componente (UI).
2. Componente chama o hook ou service correspondente.
3. Service processa a requisição (mock ou real).
4. Dados são retornados ao componente.
5. Componente re-renderiza com os novos dados.
