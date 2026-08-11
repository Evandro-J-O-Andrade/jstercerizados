# J&S Empregos LTDA — SaaS First Site

![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Vite](https://img.shields.io/badge/Vite-7-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055ff)

Plataforma web moderna desenvolvida para a **J&S Empregos LTDA**, empresa de assessoria em Recursos Humanos, recrutamento, mão de obra temporária e efetiva, terceirização e facilities.

O projeto foi concebido como um **SaaS first site** — a presença digital é o produto principal, funcionando como vitrine, funil de vendas e painel administrativo em um único ambiente.

---

## Sobre o Projeto

**J&S Empregos LTDA** é uma empresa com 15 anos de experiência no mercado de RH e terceirização, atendendo mais de 200 empresas com 500 profissionais em 50 cidades.

O site-first SaaS foi desenvolvido para:

- Fortalecer a presença digital da empresa
- Captar novos clientes e candidatos
- Centralizar solicitações comerciais
- Receber currículos e gerenciar vagas
- Automatizar atendimentos via WhatsApp e E-mail
- Preparar a empresa para atendimento com Inteligência Artificial

---

## Funcionalidades

### Site Público

- Abertura cinematográfica com animação estilo MGM
- Páginas institucionais (Home, Sobre, Serviços, Contato)
- Listagem de vagas com busca e filtros
- Área do candidato (currículo, processo seletivo)
- Área do cliente (portal, solicitações)
- FAQ e suporte
- Blog (futuro)
- Integração WhatsApp

### Dashboard Administrativo

- Gestão de empresas e clientes
- Gestão de vagas e candidatos
- Gestão de parceiros e fornecedores
- Gestão de currículos
- Gestão de processos seletivos
- Gestão de blog e FAQ
- Gestão de usuários e permissões
- Configurações do sistema

### Recursos de Acessibilidade

- Ajuste de tamanho de texto
- Alto contraste
- Redução de animações
- Modo foco
- Leitura de página (TTS)
- Navegação por teclado

---

## Tecnologias

### Frontend

- **React 19** — Biblioteca JavaScript para interfaces
- **TypeScript** — Tipagem estática
- **Vite** — Build tool ultrarrápida
- **Tailwind CSS v4** — Framework CSS utility-first
- **React Router DOM v7** — Roteamento
- **React Hook Form + Zod** — Formulários e validação
- **Framer Motion** — Animações suaves
- **GSAP** — Animações avançadas
- **Lenis** — Scroll suave
- **Lucide React** — Ícones
- **React Helmet Async** — SEO
- **Class Variance Authority** — Variações de componentes
- **Tailwind Merge + Clsx** — Merge de classes CSS

### Futuras Integrações

- **Supabase** — Backend e autenticação
- **n8n** — Automação de workflows
- **WhatsApp Business API** — Integração oficial
- **SMTP** — Envio de e-mails
- **Google Maps** — Mapa de localização
- **Google Analytics** — Métricas de acesso

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis (Container, Section)
│   ├── layout/          # Layout principal (Navbar, Footer, BottomNavigation)
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

## Documentação

Documentação detalhada do projeto disponível na pasta [`docs/`](./docs/):

- [`00-VISAO-GERAL.md`](./docs/00-VISAO-GERAL.md) — Documento mestre de arquitetura e regras
- [`DOCUMENTACAO-CODIGO.md`](./docs/DOCUMENTACAO-CODIGO.md) — Documentação de código e componentes
- [`ROLLBACK.md`](./docs/ROLLBACK.md) — Guia de rollback para emergências

---

## Comandos Disponíveis

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

## Status

**Sprint 0 — Fundação e Estruturação do Projeto**

---

## Empresa

**J&S Empregos LTDA**  
CNPJ: 63.251.959/0001-10

**Áreas de atuação:**

- Recrutamento e Seleção
- Mão de Obra Temporária e Efetiva
- Terceirização de Serviços
- Assessoria em RH
- Limpeza e Conservação
- Segurança Patrimonial
- Portaria e Controle de Acesso
- Jardinagem e Paisagismo
- Zeladoria e Facilities

**Contato:**

- Telefone: (11) 96838-0592
- E-mail: comercial@jsterceirizados.com.br
- WhatsApp: https://wa.me/5511968380592
- Endereço: Rodovia João Afonso de Souza Castellano, 411, Sala 04, Poá/SP

**Redes sociais:**

- [Instagram](https://instagram.com/jsterceirizados)
- [Facebook](https://facebook.com/jsterceirizados)
- [LinkedIn](https://linkedin.com/company/jsterceirizados)
- [YouTube](https://youtube.com/@jsterceirizados)
- [TikTok](https://tiktok.com/@jsterceirizados)

---

## Desenvolvimento

**New Wave Sistemas Digital Solutions**  
Desenvolvimento e manutenção do projeto.

**Repositório:** https://github.com/Evandro-J-O-Andrade/jstercerizados

---

## Licença

MIT — Copyright © 2026 J&S Empregos LTDA
