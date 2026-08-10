# Benchmark — JS Empregos

## Visão geral

Análise da estrutura e conteúdo do site da JS Empregos, comparado com o nosso projeto.

### Site atual: `https://www.jsEmpregos.com.br`

| Item                | JS Empregos            | Nosso Projeto               | Ação        |
| ------------------- | ---------------------- | --------------------------- | ----------- |
| Site institucional  | ✅ Sim                 | ✅ Sim                      | Mantém      |
| PWA                 | ❌ Não                 | ✅ Planejado                | Evoluir     |
| Tecnologia avançada | ❌ Básico              | ✅ SaaS-ready               | Diferencial |
| Automação WhatsApp  | ❌ Não                 | ✅ n8n                      | Adicionar   |
| Área do cliente     | ❌ Não                 | ✅ Futuro SaaS              | Diferencial |
| Área de parceiros   | ❌ Não                 | ✅ Futuro SaaS              | Diferencial |
| Banco de talentos   | ✅ Básico (formulário) | ✅ Inteligente (multi-step) | Aperfeiçoar |
| Dashboard           | ❌ Não                 | ✅ Futuro SaaS              | Diferencial |
| Lead qualification  | ❌ Não                 | ✅ Supabase + n8n           | Diferencial |

---

## 1. Estrutura de navegação

### JS Empregos

```
Home
Empresa
  └ Serviços
  └ Clientes
  └ Trabalhe Conosco
  └ Contato
```

### Nosso Projeto

```
Home
Sobre
Serviços
  └ [slug] — página individual
Clientes
Parceiros
Fornecedores
Trabalhe Conosco
Contato
Login
  └ Dashboard (protegido)
```

### Gap

- JS não tem páginas individuais para cada serviço
- JS não tem área de login/dashboard
- JS não tem seção de parceiros/fornecedores separada

---

## 2. Serviços

### JS Empregos oferece

| Serviço                      | JS  | Nós |
| ---------------------------- | --- | --- |
| Terceirização de mão de obra | ✅  | ✅  |
| Limpeza                      | ✅  | ✅  |
| Conservação                  | ✅  | ✅  |
| Gestão de RH                 | ✅  | ✅  |
| Segurança Patrimonial        | —   | ✅  |
| Controle de Acesso           | —   | ✅  |
| Portaria                     | —   | ✅  |
| Zeladoria                    | —   | ✅  |
| Facilities                   | —   | ✅  |

### Nossa vantagem

- Mais serviços listados
- Cada serviço com página individual
- SEO otimizado por serviço
- Chamada para ação personalizada

---

## 3. Página "Empresa" (Sobre)

### JS Empregos

- Texto institucional curto
- Missão e visão (sem valores detalhados)
- Foco em experiência e confiança

### Nosso Projeto

- Proposta: expandir significativamente
- Adicionar: timeline da empresa
- Adicionar: missão, visão e valores como cards
- Adicionar: diferenciais com ícones
- Adicionar: metodologia de trabalho

### Ação

Criar uma página "Sobre" que contenha:

```
Hero institucional
Quem Somos
Nossa História (timeline)
Missão
Visão
Valores
Diferenciais
Metodologia
```

---

## 4. Trabalhe Conosco

### JS Empregos

- Formulário simples com: nome, email, telefone, vaga desejada, currículo
- Área limitada

### Nosso Projeto

- Formulário multi-step (já implementado)
- Validações condicionais por vaga (já implementado)
- Banco de talentos com status (futuro Supabase)
- Fluxo: candidato → banco → RH → WhatsApp automático

### Gap

JS é básico; nós já temos arquitetura superior.

---

## 5. Contato

### JS Empregos

- Formulário com: nome, email, telefone, assunto, mensagem
- Dados de contato no rodapé
- WhatsApp fixo

### Nosso Projeto

- Formulário já implementado com Zod + React Hook Form
- Dados centralizados em `src/config/contacts.ts`
- WhatsApp dinâmico via `getWhatsAppUrl()`

### Gap

JS tem dados fixos no HTML; nós centralizamos tudo.

---

## 6. Rodapé

### JS Empregos

- Logo
- Menu de navegação
- Dados de contato
- Redes sociais (limitadas)

### Nosso Projeto

- Navbar e Footer reutilizáveis (componentes)
- Social links centralizados em config
- Bottom Navigation para mobile (futuro)

### Ação

Expandir o footer com:

```
Colunas:
 Empresa | Serviços | Links Rápidos | Contato
 Logo      Lista de    Links rápidos   Telefone
           serviços  com navegação  Email
                     Redes sociais  Endereço
                     Jurisdicional
```

---

## 7. Conteúdo originais (não copiar)

### Missão (proposta)

> Transformar a terceirização em uma experiência segura, eficiente e transparente, conectando empresas a profissionais qualificados e soluções operacionais inteligentes.

### Visão (proposta)

> Ser referência em soluções terceirizadas, unindo pessoas, processos e tecnologia para entregar excelência operacional.

### Valores (proposta)

1. **Compromisso** — Cumprimos o que prometemos
2. **Transparência** — Relacionamento claro e honesto
3. **Segurança** — Proteção de patrimônio e pessoas
4. **Respeito** — Valorização de colaboradores e clientes
5. **Qualidade** — Excelência em cada detalhe
6. **Inovação** — Tecnologia aplicada ao dia a dia

---

## 8. Conclusão

| Critério                | JS Empregos | Nosso Projeto         |
| ----------------------- | ----------- | --------------------- |
| Estrutura institucional | Bom         | Excelente             |
| Tecnologia              | Básica      | SaaS-ready            |
| Automação               | Nenhuma     | n8n + WhatsApp        |
| Área do cliente         | Nenhuma     | Dashboard futuro      |
| SEO                     | Básico      | Otimizado por serviço |
| Experiência do usuário  | Funcional   | Premium               |

**Diferencial:** Nosso projeto já parte de uma arquitetura SaaS, com formulários inteligentes, validações avançadas e preparação para Supabase, n8n e integrações.
