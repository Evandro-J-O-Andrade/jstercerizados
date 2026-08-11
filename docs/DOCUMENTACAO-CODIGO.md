# Documentação de Código — J&S Empregos LTDA

**NÃO ALTERAR ESTE DOCUMENTO SEM AUTORIZAÇÃO EXPRESSA DO RESPONSÁVEL TÉCNICO.**

---

## 1. Estrutura do Projeto

### 1.1 Diretórios Principais

| Diretório                  | Descrição                                                |
| -------------------------- | -------------------------------------------------------- |
| `src/components/common/`   | Componentes reutilizáveis (Container, Section)           |
| `src/components/layout/`   | Layout principal (Navbar, Footer, BottomNavigation)      |
| `src/components/sections/` | Seções de página (Hero, ServiceCard, CinematicShowcase)  |
| `src/components/ui/`       | Componentes base (Button, Input, SafeImage, SEO)         |
| `src/config/`              | Configurações globais (company, navigation, seo, images) |
| `src/contexts/`            | Contexts (Theme, Auth)                                   |
| `src/hooks/`               | Hooks customizados                                       |
| `src/pages/`               | Páginas da aplicação                                     |
| `src/services/`            | Mock services + integrações futuras                      |
| `src/styles/`              | CSS global e tokens                                      |
| `src/content/`             | Conteúdo estático (assets, homeHero)                     |

### 1.2 Convenções de Nomenclatura

- **Componentes:** PascalCase (`ServiceCard.tsx`, `CinematicShowcase.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useTheme.ts`, `useFocusTrap.ts`)
- **Utilities:** camelCase (`cn.ts`, `format.ts`)
- **Configs:** camelCase (`company.ts`, `navigation.ts`, `seo.ts`)

---

## 2. Componentes Principais

### 2.1 CinematicShowcase

**Arquivo:** `src/components/sections/CinematicShowcase.tsx`

**Função:** Abertura cinematográfica do site com animação estilo MGM.

**Comportamento:**

- Exibe imagem `cardheros.png` em tela cheia com fundo preto
- Duração total: 15 segundos (2.5s entrada + 10s espera + 2.5s saída)
- Textos: "J&S Empregos" (topo) e "Gestão em Recursos Humanos" (rodapé)
- Aparece sempre no primeiro acesso e após 3 minutos de inatividade
- Botão "Pular" para pular a animação

**Dependências:**

- `framer-motion` — animações
- `HERO_ASSETS.cardheros` — imagem principal

### 2.2 SafeImage

**Arquivo:** `src/components/ui/SafeImage.tsx`

**Função:** Componente de imagem com tratamento de erros e fallback.

**Comportamento:**

- Pré-carrega imagem antes de exibir
- Trata cache de imagens corretamente
- Exibe skeleton durante carregamento
- Aplica fallback em caso de erro
- Suporta prop `objectFit` para controlar ajuste da imagem

**Props principais:**

- `src` — URL da imagem
- `alt` — texto alternativo
- `objectFit` — ajuste da imagem (`cover`, `contain`, etc.)
- `fallback` — componente de fallback customizado
- `skeleton` — exibe skeleton durante carregamento

### 2.3 AccessibilityWidget

**Arquivo:** `src/components/ui/AccessibilityWidget.tsx`

**Função:** Painel de acessibilidade com configurações globais.

**Comportamento:**

- Ajuste de tamanho de texto (80% a 150%)
- Alto contraste
- Reduzir animações
- Destacar links
- Espaçamento de texto
- Modo foco
- Leitura de página (TTS)
- Configurações salvas no `localStorage`
- Permanecem aplicadas mesmo após fechar o painel

**Dependências:**

- `localStorage` — persistência das configurações
- `SpeechSynthesis` — leitura de texto

### 2.4 ServiceCard

**Arquivo:** `src/components/sections/ServiceCard.tsx`

**Função:** Card de serviço exibido nas páginas de serviços.

**Comportamento:**

- Exibe imagem, título, descrição e ícone
- Animação de entrada com `framer-motion`
- Hover com efeito de elevação e glow
- Link para página de detalhe do serviço

**Dependências:**

- `SafeImage` — imagem do serviço
- `framer-motion` — animações

---

## 3. Contextos

### 3.1 ThemeContext

**Arquivo:** `src/contexts/ThemeContext.tsx`

**Função:** Gerenciamento de tema (dark/light).

**Comportamento:**

- Salva preferência no `localStorage`
- Aplica classe `dark` no `<html>`
- Respeita preferência do sistema (`prefers-color-scheme`)

### 3.2 AuthContext

**Arquivo:** `src/contexts/AuthContext.tsx`

**Função:** Gerenciamento de autenticação.

**Comportamento:**

- Salva usuário no `localStorage`
- Gerencia estado de autenticação
- Mock de usuário para desenvolvimento

---

## 4. Configurações Globais

### 4.1 Company

**Arquivo:** `src/config/company.ts`

**Função:** Dados institucionais da empresa.

**Conteúdo:**

- Nome, CNPJ, telefone, email
- Endereço completo
- Redes sociais
- Descrição e tagline
- Áreas de atuação
- Números de experiência (anos, clientes, profissionais, cidades)

### 4.2 Navigation

**Arquivo:** `src/config/navigation.ts`

**Função:** Links de navegação do site.

**Conteúdo:**

- `NAVIGATION_LINKS` — links públicos
- `DASHBOARD_LINKS` — links do dashboard

### 4.3 Images

**Arquivo:** `src/config/images.ts`

**Função:** URLs de imagens utilizadas no site.

**Conteúdo:**

- Logo, favicon, og-image
- Imagens de herói (cardheros, bannerjs, homeSlides)

---

## 5. Serviços Mock

### 5.1 Estrutura

```
src/services/mock/
├── vagas.ts          # Mock de vagas
├── services.ts       # Mock de serviços
├── clients.ts        # Mock de clientes
├── partners.ts       # Mock de parceiros
├── fornecedores.ts   # Mock de fornecedores
├── curriculos.ts     # Mock de currículos
└── parceiros.ts      # Mock de parceiros
```

### 5.2 Padrão

Todos os mocks seguem o mesmo padrão:

- Dados em memória + `localStorage`
- Funções CRUD (create, read, update, delete)
- Tipagem TypeScript forte

---

## 6. Estilos

### 6.1 Tokens

**Arquivo:** `src/styles/index.css`

**Função:** Tokens de design e variáveis CSS.

**Tokens principais:**

- Cores: `--primary`, `--secondary`, `--background`, `--foreground`, `--card`, etc.
- Superfícies: `--surface`, `--surface-alt`
- Sombras: `--shadow-premium`, `--shadow-glow`, `--shadow-glow-lg`
- Animações: `animate-float`, `animate-float-slow`, `animate-float-medium`

### 6.2 Z-Index

**Arquivo:** `src/styles/z-index.md`

**Função:** Escala de z-index padronizada.

**Escala:**

- `z-0` a `z-10` — Conteúdo normal, cards, seções
- `z-20` — Modais e painéis
- `z-30` — CinematicShowcase
- `z-40` — Backdrop de modais
- `z-50` — AccessibilityWidget, mobile drawer
- `z-[60]` — Botões flutuantes (chat, acessibilidade)
- `z-[70]` — Painel de acessibilidade
- `z-80` — Toasts e notificações
- `z-[90]` — Modais principais
- `z-[100]` — CinematicShowcase (mais alto)

---

## 7. Rotas

### 7.1 Rotas Públicas

| Rota                 | Página            | Descrição                                   |
| -------------------- | ----------------- | ------------------------------------------- |
| `/`                  | Home              | Página inicial com abertura cinematográfica |
| `/vagas`             | Vagas             | Listagem de vagas                           |
| `/servicos`          | Serviços          | Listagem de serviços                        |
| `/sobre`             | Sobre             | Sobre a empresa                             |
| `/blog`              | Blog              | Blog (futuro)                               |
| `/contato`           | Contato           | Formulário de contato                       |
| `/suporte`           | Suporte           | Central de ajuda                            |
| `/faq`               | FAQ               | Perguntas frequentes                        |
| `/empresas`          | Empresas          | Para empresas parceiras                     |
| `/candidatos`        | Candidatos        | Para candidatos                             |
| `/parceiros`         | Parceiros         | Parceiros                                   |
| `/fornecedores`      | Fornecedores      | Fornecedores                                |
| `/clientes`          | Clientes          | Área do cliente                             |
| `/trabalhe-conosco`  | Trabalhe Conosco  | Cadastro de currículo                       |
| `/processo-seletivo` | Processo Seletivo | Etapas do processo                          |
| `/login`             | Login             | Login de usuário                            |

### 7.2 Rotas Protegidas

| Rota           | Página    | Descrição              |
| -------------- | --------- | ---------------------- |
| `/dashboard`   | Dashboard | Painel administrativo  |
| `/dashboard/*` | Dashboard | Sub-rotas do dashboard |

---

## 8. Regras de Negócio

### 8.1 Captação de Leads

- Todos os formulários do site geram leads
- Leads são salvos no `localStorage` (mock) e futuramente no Supabase
- Integração WhatsApp para atendimento imediato

### 8.2 Vagas

- Vagas são criadas e gerenciadas no dashboard
- Candidatos se candidatam pela página "Trabalhe Conosco"
- Processo seletivo tem 4 etapas: Inscrição, Triagem, Entrevista, Proposta

### 8.3 Serviços

- Categorias: RH, Facilities, Terceirização, Limpeza, Jardinagem, Segurança, Portaria
- Cada serviço tem página de detalhe
- Orçamento via formulário ou WhatsApp

### 8.4 Clientes

- Empresas que contratam serviços
- Funil: LEAD → PROSPECT → NEGOCIACAO → CLIENTE_ATIVO
- Contratos com data de vencimento

---

## 9. Integrações Futuras

| Integração            | Status    | Descrição                       |
| --------------------- | --------- | ------------------------------- |
| Supabase              | Planejado | Backend e autenticação          |
| n8n                   | Planejado | Automação de workflows          |
| WhatsApp Business API | Planejado | Integração oficial com WhatsApp |
| SMTP                  | Planejado | Envio de e-mails                |
| Google Maps           | Planejado | Mapa de localização             |
| Google Analytics      | Planejado | Métricas de acesso              |

---

## 10. Manutenção

### 10.1 Antes de Qualquer Alteração

1. Leia este documento e o `00-VISAO-GERAL.md`
2. Verifique se a alteração segue as regras absolutas
3. Rode `npm run typecheck` e `npm run lint`
4. Teste localmente com `npm run dev`

### 10.2 Após Qualquer Alteração

1. Rode `npm run build` para garantir que o build funciona
2. Verifique se não quebrou nenhuma funcionalidade existente
3. Commite com mensagem semântica
4. Push para o repositório

### 10.3 Rollback

Consulte o documento `ROLLBACK.md` para procedimentos de rollback.

---

## 11. Contatos

- **Empresa:** J&S Empregos LTDA
- **Desenvolvimento:** New Wave Sistemas Digital Solutions
- **Repositório:** https://github.com/Evandro-J-O-Andrade/jstercerizados
- **Data de criação:** 2026-08-10

---

_Documentação de código — J&S Empregos LTDA_
