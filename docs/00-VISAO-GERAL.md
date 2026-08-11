# Documentação do Projeto — J&S Empregos LTDA

**NÃO ALTERAR ESTE DOCUMENTO SEM AUTORIZAÇÃO EXPRESSA DO RESPONSÁVEL TÉCNICO.**

---

## 1. Visão Geral

Este documento é a **fonte da verdade** para todo o projeto J&S Empregos LTDA. Qualquer pessoa que precise implementar, corrigir ou revisar algo deve seguir as regras aqui descritas antes de mexer no código.

**Objetivo do site:**  
Site-first SaaS para a J&S Empregos LTDA, com captação de leads, vagas, currículos, dashboard administrativo e integração WhatsApp.

**Tipo de projeto:**  
SaaS first site — a presença digital é o produto principal. O site funciona como vitrine, funil de vendas e painel administrativo ao mesmo tempo.

---

## 2. Regras Absolutas (não negociáveis)

- NUNCA mudar o nome da empresa de **"J&S Empregos LTDA"** para **"J&S Terceirizados"** ou qualquer outra variação.
- NUNCA alterar o conteúdo do footer. O footer deve permanecer exatamente como está configurado atualmente.
- Essas regras têm prioridade absoluta sobre qualquer outra instrução de refactoring ou rebranding.

---

## 3. Stack Tecnológico

| Camada             | Tecnologia                   |
| ------------------ | ---------------------------- |
| Frontend           | React 19 + TypeScript        |
| Build              | Vite                         |
| Estilo             | Tailwind CSS v4              |
| Roteamento         | React Router DOM v7          |
| Formulários        | React Hook Form + Zod        |
| Animações          | Framer Motion + GSAP + Lenis |
| Ícones             | Lucide React                 |
| SEO                | React Helmet Async           |
| Backend (futuro)   | Supabase                     |
| Automação (futuro) | n8n                          |
| Chat/IA (futuro)   | WhatsApp Business API + IA   |

---

## 4. Estrutura de Diretórios

```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis (Container, Section)
│   ├── layout/          # Navbar, Footer, BottomNavigation
│   ├── sections/        # Seções de página (Hero, ServiceCard, CinematicShowcase)
│   └── ui/              # Componentes base (Button, Input, SafeImage, SEO)
├── config/              # Configurações globais (company, navigation, seo, images)
├── contexts/            # Contexts (Theme, Auth)
├── hooks/               # Hooks customizados
├── pages/               # Páginas da aplicação
├── services/            # Mock services + integrações futuras
├── styles/              # CSS global e tokens
├── content/             # Conteúdo estático (assets, homeHero)
└── types/               # TypeScript types
```

---

## 5. Convenções de Código

- Sempre usar TypeScript strict mode.
- Componentes funcionais com Hooks.
- Nomes de arquivos em PascalCase para componentes, camelCase para utilitários.
- Estilização优先 com Tailwind classes; CSS global apenas para tokens e animações complexas.
- Nunca commitar secrets ou chaves de API.
- Sempre rodar `npm run lint` e `npm run typecheck` antes de commitar.
- Commits semânticos: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## 6. Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Formatação
npm run format

# Typecheck
npm run typecheck
```

---

## 7. Abertura Cinematográfica (CinematicShowcase)

- A imagem `cardheros.png` é a única imagem oficial da abertura.
- Duração total: **15 segundos** (2.5s entrada + 10s espera + 2.5s saída).
- Abertura deve aparecer **sempre** que o usuário acessar o site ou ficar inativo por 3 minutos.
- Não deve usar `sessionStorage` ou `localStorage` para bloquear a abertura.
- Imagem deve usar `object-contain` para não cortar o conteúdo.
- Textos: "J&S Empregos" (topo) e "Gestão em Recursos Humanos" (rodapé).
- Abertura deve funcionar em dark e light mode (fundo preto sempre).

---

## 8. Segurança e Permissões

- Apenas admins autorizados podem alterar regras de negócio, marca ou conteúdo institucional.
- Qualquer alteração no código deve ser revisada antes de ser mergeada na main.
- Nunca expor dados sensíveis no frontend.

---

## 9. Contato do Responsável Técnico

- **Projeto:** J&S Empregos LTDA
- **Desenvolvimento:** New Wave Sistemas Digital Solutions
- **Repositório:** https://github.com/Evandro-J-O-Andrade/jstercerizados

---

_Última atualização: 2026-08-10_
