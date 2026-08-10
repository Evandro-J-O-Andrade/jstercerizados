# Frontend — JSEmpregos

## Stack Principal

| Tecnologia         | Versão | Uso                          |
| ------------------ | ------ | ---------------------------- |
| React              | 19     | Biblioteca principal         |
| TypeScript         | ~5.9   | Tipagem estática             |
| Vite               | 7      | Build tool                   |
| Tailwind CSS       | 4      | Estilização                  |
| React Router       | 7      | Roteamento                   |
| Framer Motion      | 12     | Animações                    |
| React Hook Form    | 7      | Gerenciamento de formulários |
| Zod                | 3      | Validação de esquemas        |
| Lucide React       | 0.5    | Ícones                       |
| React Helmet Async | 2      | Meta tags e SEO              |

## Convenções de Código

- **Tipagem forte**: nunca usar `any`.
- **Componentes funcionais**: todos os componentes são funções.
- **Props tipadas**: toda prop recebe interface explícita.
- **Nomeação PascalCase** para componentes.
- **Nomeação camelCase** para variáveis e funções.
- **Barrel exports**: cada módulo exporta tudo via `index.ts`.

## Padrão de Componentes

```tsx
interface ComponentProps {
  // Props tipadas
}

export function Component({ prop }: ComponentProps) {
  return <div>{prop}</div>;
}
```

## SEO

- React Helmet Async para meta tags dinâmicas.
- Open Graph e Twitter Cards em todas as páginas.
- Schema.org para dados estruturados.
- Robots.txt e Sitemap.xml gerados estaticamente.

## Performance

- Lazy Loading com `React.lazy()` para todas as páginas.
- Suspense boundaries com fallback de loading.
- Code Splitting automático via Vite.
- Imagens com `loading="lazy"` e dimensões definidas.

## Acessibilidade

- WCAG 2.1 AA.
- ARIA labels em elementos interativos.
- Navegação por teclado.
- Focus states visíveis.
- Contraste de cores adequado.
