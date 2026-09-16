# J&S Empregos — Inventário Geral, Diretrizes de Refinamento e Continuidade

## 1. Objetivo deste documento

Este documento é a referência para as próximas etapas do projeto J&S Empregos.

A regra principal é:

> **Não criar infraestrutura duplicada. Primeiro auditar o que já existe, reutilizar o que estiver correto e corrigir somente o que estiver quebrado ou incompleto.**

O projeto é uma plataforma digital de RH, recrutamento, atendimento e captação de oportunidades, com automações integradas, e não apenas um site institucional com chatbot.

---

## 2. Ecossistema já existente

### Site / área pública

- Home
- Vagas
- Detalhes de vagas
- Empresas
- Candidatos
- Serviços
- Clientes
- Parceiros
- Fornecedores
- Trabalhe Conosco
- Processo Seletivo
- Sobre
- Blog
- FAQ
- Suporte
- Login
- Formulários públicos
- SEO
- Responsividade
- Acessibilidade

### RH / Recrutamento

- Cadastro de candidatos
- Currículo
- Upload de currículo em PDF
- Experiência profissional
- Formação
- Cursos
- Idiomas
- Banco de candidatos / talentos
- Vagas
- Candidaturas
- Histórico de candidaturas
- Processo seletivo
- Entrevistas
- Empresas
- Publicação de vagas
- Acompanhamento de processos
- Contratações

### Atendimento / IA

- ChatWidget
- HumanChatWidget
- `/api/chat`
- OpenRouter
- `src/ai/knowledge.ts`
- `src/lib/chat-client.ts`
- `useRealtimeChat.ts`
- `chat_rooms`
- `chat_messages`
- Atendimento humano
- Suporte público
- Suporte no Dashboard
- Tickets
- Categorias de suporte
- Repository de suporte

### Automação

- n8n
- Workflows existentes
- Integração com WhatsApp
- Disparos automáticos
- Notificações
- Automações de candidatos
- Automações de empresas
- Automações de processo seletivo
- Automações de suporte
- Eventos → n8n → canais externos

Fluxo conceitual:

```text
Site / Dashboard
       ↓
    Supabase
       ↓
     Evento
       ↓
      n8n
   ┌───┼────┐
   ↓   ↓    ↓
WhatsApp E-mail Automação
```

### E-mail

Existe também a camada de comunicação por e-mail.

**Pendência conhecida:**

- Há situação em que o e-mail esperado para o candidato não chega.

Essa pendência deve ser investigada como fluxo completo:

- geração do evento;
- chamada da automação;
- workflow;
- provider SMTP/API;
- destinatário;
- template;
- logs;
- resposta do provider;
- spam/bounce;
- confirmação de entrega.

Não criar um segundo sistema de e-mail antes de auditar o atual.

### Segurança / identidade

- Supabase Auth
- RLS
- RBAC
- Multi-tenancy
- `people`
- `tenant_memberships`
- `role_assignments`
- Roles
- Permissions
- Auditoria
- Domain events
- Turnstile
- Sessão
- Proteção de formulários
- Tratamento de erros
- Logs

Arquitetura canônica:

```text
auth.users
   ↓
people
   ↓
tenant_memberships
   ↓
role_assignments
   ↓
roles
   ↓
permissions
```

---

## 3. Regra absoluta para dados mockados / fallback

As páginas que atualmente utilizam dados mockados devem **continuar utilizando o mock como fallback**.

### Nunca fazer

- Remover o mock apenas porque o banco foi conectado.
- Apagar dados de demonstração.
- Deixar a página branca enquanto o banco responde.
- Mostrar erro técnico como conteúdo principal.
- Fazer a UI depender exclusivamente da conexão com o Supabase.

### Comportamento desejado

O fallback deve participar da renderização desde o início.

```text
Renderização da página
       ↓
UI base + dados fallback/mock
       ↓
Tentativa de conexão com backend
       ↓
 ┌───────────────┬────────────────┐
 │               │                │
Banco OK       Banco lento      Banco falhou
 │               │                │
Atualiza UI    Mantém fallback   Mantém fallback
 │               │                │
dados reais    loading/standby   feedback discreto
```

A página deve existir visualmente **antes** da resposta do banco.

Quando os dados reais chegarem:

- substituir/mesclar o fallback;
- atualizar cards/listas;
- manter layout estável;
- não causar tela branca;
- não desmontar a página inteira.

Quando o backend falhar:

- manter o fallback quando possível;
- informar o estado de maneira amigável;
- registrar erro técnico nos logs;
- permitir retry quando fizer sentido.

---

## 4. Padrão de UI resiliente

A aplicação deve funcionar com estados explícitos:

- `loading`
- `ready`
- `empty`
- `error`
- `offline`
- `standby`
- `fallback`

Nunca transformar esses estados em uma página vazia.

### Exemplo conceitual

```text
Página
 ├── Header
 ├── Hero
 ├── Cards
 ├── Conteúdo
 ├── Formulários
 └── Feedback

Backend:
 ├── carregando → UI permanece renderizada
 ├── sucesso → dados reais entram
 ├── vazio → estado empty
 ├── erro → fallback + aviso
 └── offline → fallback + estado offline
```

---

## 5. Conceito de "standby"

Componentes e áreas que ainda não possuem dados reais completos podem permanecer em **standby**.

Exemplos:

- card pré-configurado;
- painel aguardando dados;
- seção com estado vazio orientado;
- recurso desabilitado com `hidden`, `false`, feature flag ou estado controlado.

Porém:

> **Standby não significa página em branco.**

A interface deve continuar apresentando estrutura, contexto e feedback.

---

## 6. Refinamento visual obrigatório

Próxima fase deve priorizar refinamento de UI/UX, sem reconstruir a arquitetura.

### CSS / Layout

- espaçamentos;
- grid;
- responsividade;
- hierarquia visual;
- alinhamento;
- largura de containers;
- comportamento mobile;
- estados hover/focus/active;
- dark/light mode;
- contraste;
- acessibilidade;
- consistência entre páginas.

### Cards

Criar/refinar padrões reutilizáveis existentes para:

- vagas;
- candidatos;
- empresas;
- serviços;
- métricas;
- chamados;
- processos;
- atividades;
- notificações;
- dashboards.

Os cards devem ter estados:

- normal;
- loading;
- empty;
- error;
- disabled;
- standby.

### Textos

Revisar:

- títulos;
- subtítulos;
- labels;
- CTAs;
- mensagens de erro;
- mensagens de sucesso;
- estados vazios;
- feedback de carregamento.

Evitar texto técnico para o usuário final.

### Inputs

Revisar:

- label;
- placeholder;
- helper text;
- required;
- disabled;
- readOnly;
- validação;
- erro;
- sucesso;
- foco;
- acessibilidade;
- máscara/formatação;
- mensagens consistentes.

### Formulários

Todo formulário deve possuir:

- estado inicial;
- preenchimento;
- validação;
- envio;
- loading;
- sucesso;
- erro;
- retry;
- proteção;
- feedback.

Nunca deixar o usuário sem resposta após clicar em uma ação.

---

## 7. Tratamento de erros

Todo fluxo relevante deve ter tratamento de erro.

### Princípio

```text
Erro técnico
   ↓
capturar
   ↓
registrar/logar
   ↓
normalizar
   ↓
feedback amigável
   ↓
fallback / retry / recuperação
```

Nunca exibir stack trace, erro bruto do banco ou mensagem interna para o cliente.

---

## 8. Segurança

Todo refinamento deve preservar:

- RLS;
- RBAC;
- isolamento por tenant;
- autenticação;
- autorização;
- validação server-side;
- proteção contra abuso;
- Turnstile;
- proteção de endpoints;
- logs;
- auditoria;
- princípio do menor privilégio;
- proteção de dados pessoais.

Nunca colocar segredo:

- no frontend;
- em código público;
- em logs;
- em mensagens para o usuário.

---

## 9. LGPD

Os fluxos envolvendo candidatos, empresas e contatos devem considerar LGPD desde a implementação.

Pontos a validar:

- consentimento;
- finalidade;
- minimização de dados;
- retenção;
- acesso;
- alteração;
- exclusão quando aplicável;
- transparência;
- segurança;
- histórico/auditoria;
- upload de currículo;
- comunicação por WhatsApp;
- comunicação por e-mail.

Não criar coleta de dados sem finalidade definida.

---

## 10. Contexto, usuários, roles e permissões

Sempre considerar o contexto de identidade e autorização existente.

Antes de criar qualquer consulta ou controle novo, verificar se já existem abstrações para:

- `getUser`
- `setUser`
- contexto do usuário
- contexto de sessão
- `getListUser`
- `getListRoles`
- `getListPermissions`
- helpers de RBAC
- tenant atual
- membership
- role assignment

A regra é:

> **Reutilizar os contextos e helpers existentes antes de criar novos hooks, providers, queries ou serviços.**

Não duplicar:

- AuthContext;
- RBAC;
- permission resolver;
- user resolver;
- tenant resolver.

---

## 11. Dashboard

Todas as áreas de Dashboard devem ser auditadas.

A Dashboard inicial pode começar simples, mas a arquitetura deve ser preparada para ficar completa e operacional.

Ela deve considerar:

### O que o usuário possui

- perfil;
- empresa/tenant;
- permissões;
- responsabilidades;
- dados relacionados.

### O que o usuário pode visualizar

- módulos;
- páginas;
- métricas;
- candidatos;
- vagas;
- processos;
- chamados;
- notificações;
- relatórios.

### O que o usuário pode fazer

- criar;
- editar;
- publicar;
- aprovar;
- visualizar;
- acompanhar;
- responder;
- encerrar;
- administrar.

### Com quem pode fazer

- usuários;
- equipes;
- candidatos;
- empresas;
- atendentes;
- gestores;
- administradores;
- parceiros, quando aplicável.

A UI deve ser dinâmica baseada no contexto real de:

- usuário;
- tenant;
- role;
- permissions;
- estado do recurso.

---

## 12. Cards e áreas dinâmicas no Dashboard

Não deixar buracos visuais.

Se determinado módulo ainda não possui dados:

```text
┌─────────────────────────────┐
│ Processos seletivos         │
│ Aguardando movimentações    │
│                             │
│ Nenhum processo novo ainda  │
│                             │
│ [Criar processo]            │
└─────────────────────────────┘
```

Em vez de:

```text
[ espaço vazio ]
```

Ou:

```text
Erro ao carregar
```

A interface deve explicar o estado e, quando possível, oferecer uma ação.

---

## 13. Páginas com feedback

É obrigatório levantar todas as páginas que atualmente apresentam:

- tela branca;
- loading infinito;
- erro bruto;
- dados ausentes;
- card quebrado;
- formulário sem feedback;
- ação sem resposta;
- componente condicionado que desaparece sem explicação;
- rota sem conteúdo;
- dados dependentes exclusivamente do banco.

Criar um inventário:

| Página   | Estado atual | Problema     | Fallback | Ação     |
| -------- | ------------ | ------------ | -------- | -------- |
| Página X | loading      | infinito     | sim/não  | corrigir |
| Página Y | error        | erro bruto   | sim/não  | corrigir |
| Página Z | empty        | sem contexto | sim/não  | corrigir |

**Objetivo:** nenhuma página importante deve permanecer em branco para o cliente.

---

## 14. TDD obrigatório

Toda correção funcional relevante deve seguir TDD quando aplicável:

```text
1. Identificar comportamento esperado
2. Escrever/ajustar teste
3. Reproduzir falha
4. Implementar menor correção
5. Rodar testes
6. Verificar integração
7. Revisar regressões
```

Não considerar uma alteração concluída somente porque "parece funcionar".

---

## 15. Regra de desenvolvimento

Antes de implementar qualquer coisa:

1. procurar componente existente;
2. procurar hook existente;
3. procurar repository existente;
4. procurar service existente;
5. procurar utilitário existente;
6. procurar rota existente;
7. procurar contexto/provider existente;
8. procurar tabela/API existente;
9. procurar workflow n8n existente;
10. procurar integração existente.

Somente depois decidir se é necessário criar algo novo.

---

## 16. Regra para assets

Não apagar ou substituir imagens/assets sem verificar primeiro o estado atual do repositório.

Especial atenção para:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- SVG
- logos
- banners
- favicons

Um asset removido intencionalmente não deve ser recuperado automaticamente.

Um asset criado pelo projeto não deve ser apagado em favor de outro apenas por parecer semelhante.

---

## 17. E-mail do candidato — pendência

Pendência específica:

> **O e-mail esperado pelo candidato não está chegando em determinados fluxos.**

Isso deve ser tratado como investigação do pipeline existente.

Checklist:

```text
Evento
 ↓
Frontend/API
 ↓
Supabase / backend
 ↓
n8n ou serviço de e-mail
 ↓
Workflow
 ↓
Provider
 ↓
SMTP/API
 ↓
Destinatário
 ↓
Entrega
 ↓
Inbox/Spam/Bounce
```

Registrar evidências antes de alterar a implementação.

Não criar um segundo provider sem descobrir primeiro por que o atual não entrega.

---

## 18. Automação WhatsApp / n8n

Manter a infraestrutura existente.

Auditar:

- workflows;
- triggers;
- webhooks;
- credenciais por ambiente;
- payloads;
- retries;
- logs;
- idempotência;
- tratamento de falha;
- limites de disparo;
- templates;
- status de entrega;
- relação com candidatos/empresas;
- relação com suporte.

Disparos automáticos devem evitar duplicidade.

---

## 19. Suporte

Manter a arquitetura atual:

```text
ChatWidget
   ├── IA
   │    └── /api/chat
   │         └── OpenRouter
   │
   └── Atendimento humano
        └── HumanChatWidget
             └── Supabase Realtime
                  ├── chat_rooms
                  └── chat_messages

Suporte público
   └── support.repository
        └── support_tickets

Dashboard
   └── Suporte
        └── atendentes
```

Não criar:

- ChatWidget2;
- novo chatbot;
- novo ticket system;
- novo repository de suporte;
- nova integração de IA.

Possíveis refinamentos futuros:

1. presença online/offline do atendente;
2. notificação de novo chamado;
3. histórico completo;
4. encerramento automático;
5. métricas de atendimento.

---

## 20. Separação de problemas

Problemas devem ser tratados na área correta.

Exemplo:

### Auth / Turnstile

Problema de autenticação/proteção.

### Supabase 429

Rate limit do Auth.

### Dashboard candidates 400

Problema específico da consulta/dashboard.

### E-mail não recebido

Problema de comunicação/automação/provider.

### Chat/Realtime

Problema de atendimento.

Não misturar esses diagnósticos.

---

## 21. Critério de qualidade para cada página

Uma página só deve ser considerada pronta quando:

- renderiza sem backend;
- possui fallback quando necessário;
- não fica branca;
- possui loading controlado;
- possui empty state;
- possui error state;
- possui feedback;
- possui responsividade;
- possui acessibilidade;
- possui validação;
- respeita RBAC;
- respeita RLS;
- respeita LGPD;
- não expõe dados indevidos;
- possui testes relevantes;
- não duplica infraestrutura;
- não quebra o mock existente.

---

## 22. Próximas etapas recomendadas

### Fase 1 — Inventário técnico

Levantar implementação real do repositório e comparar com este documento.

### Fase 2 — Páginas e estados

Encontrar todas as páginas com:

- branco;
- loading infinito;
- erro;
- dados ausentes;
- fallback inexistente.

### Fase 3 — UI/UX

Refinar:

- CSS;
- layouts;
- cards;
- textos;
- inputs;
- formulários;
- estados;
- responsividade.

### Fase 4 — Dashboards

Auditar todas as Dashboards e garantir:

- contexto;
- permissões;
- módulos;
- ações;
- cards;
- estados;
- navegação.

### Fase 5 — Comunicação

Corrigir o fluxo de e-mail do candidato.

### Fase 6 — Automação

Auditar n8n + WhatsApp + e-mail + suporte.

### Fase 7 — Segurança

Executar revisão:

- Auth;
- RBAC;
- RLS;
- LGPD;
- Turnstile;
- validações;
- logs;
- auditoria.

### Fase 8 — TDD e regressão

Testar cada correção e validar que:

- mock continua funcionando;
- fallback continua funcionando;
- banco real continua funcionando;
- páginas não ficam brancas;
- dashboards não quebram;
- permissões continuam corretas.

---

## 23. Regra final

> **A aplicação nunca deve depender de uma única condição para conseguir renderizar.**

Backend indisponível não pode significar página branca.

Banco vazio não pode significar layout quebrado.

API lenta não pode significar loading infinito.

Permissão ausente não pode significar erro técnico.

Funcionalidade em standby não pode significar buraco visual.

Erro deve ser tratado, registrado e apresentado de maneira compreensível.

O usuário deve sempre receber uma interface funcional, contextualizada e segura.

**Renderizar primeiro. Conectar depois. Atualizar quando os dados chegarem. Recuperar quando falhar. Nunca deixar a experiência morrer por causa de uma dependência externa.**

---

## 24. Regra para os próximos agentes

Antes de modificar qualquer parte do projeto, ler este documento e seguir a sequência:

```text
INVENTARIAR
    ↓
AUDITAR
    ↓
REPRODUZIR
    ↓
TESTAR
    ↓
CORRIGIR
    ↓
VALIDAR
    ↓
SÓ ENTÃO REFINAR
```

**Não reconstruir o que já existe.**
**Não remover mocks/fallbacks.**
**Não apagar assets sem confirmação.**
**Não criar sistemas paralelos.**
**Não deixar páginas brancas.**
**Não ignorar segurança, LGPD ou permissões.**
**Sempre usar TDD para correções funcionais relevantes.**
Perfeito. Esse inventário muda a abordagem: **não devemos criar nada novo**.

Pelo que você trouxe, a arquitetura de Chat/Atendimento já está consolidada:

```text
ChatWidget
   ├── IA → /api/chat → OpenRouter
   └── Atendimento humano
          ↓
     HumanChatWidget
          ↓
     Supabase Realtime
          ↓
     chat_rooms / chat_messages

Suporte público
   ↓
support.repository
   ↓
support_tickets

Dashboard
   ↓
Suporte.tsx
   ↓
Atendentes
```

### Minha leitura do estado

| Área                 | Situação               |
| -------------------- | ---------------------- |
| Chat IA              | ✅ Implementado        |
| Base de conhecimento | ✅ Implementada        |
| Chat humano          | ✅ Implementado        |
| Realtime             | ✅ Implementado        |
| Tickets              | ✅ CRUD                |
| Suporte público      | ✅ Implementado        |
| Dashboard de suporte | ✅ Implementado        |
| Banco                | ✅ Estrutura existente |
| Nova implementação   | ❌ **Não necessária**  |

Então, se o objetivo agora é continuar o projeto, a regra deve ser:

> **Primeiro auditar o que já existe; depois corrigir apenas o que estiver quebrado. Não criar `ChatWidget2`, novo sistema de tickets, novo repository ou nova integração.**

Os quatro pontos que você listou como possíveis ajustes são justamente candidatos a uma **fase de validação**, não a uma reconstrução:

1. **Online/offline do atendente**
2. **Notificação de novo chamado**
3. **Histórico completo**
4. **Encerramento automático**

E eu manteria isso separado do problema atual de **Auth/Turnstile/429**. O `429 email rate limit exceeded` é do Supabase Auth e não tem relação com essa arquitetura de atendimento.

Se você quiser que eu faça a auditoria real do que está no projeto, preciso do repositório/arquivos atuais para não trabalhar em cima desse inventário apenas. Pode enviar os arquivos relevantes aqui:

A partir deles, eu comparo **implementação real × inventário**, identifico o que já funciona e aponto somente as correções necessárias — sem duplicar infraestrutura.
Sim — **exatamente isso**. O inventário que você trouxe de Chat/Atendimento não representa o projeto inteiro. Ele é só **uma parte da infraestrutura** que já construímos.

O que precisamos considerar no escopo da **J&S Empregos** é o ecossistema completo que já levantamos, e **não sair criando coisas novas em cima do que já existe**.

### O que já temos no projeto

**1. Atendimento / IA**

- Chatbot IA
- `ChatWidget`
- `HumanChatWidget`
- Base de conhecimento `knowledge.ts`
- Chat em tempo real
- Atendimento humano
- Tickets / chamados
- Página pública de Suporte
- Suporte dentro do Dashboard

**2. Automação**

- **n8n**
- Workflows de automação
- Integração com **WhatsApp**
- Disparos automáticos
- Notificações
- Automação de etapas do atendimento
- Automação relacionada a candidatos, empresas e processos
- Possibilidade de acionar fluxos a partir de eventos do sistema

**3. WhatsApp**
A ideia não é simplesmente colocar um botão de WhatsApp no site.

Temos a camada de **WhatsApp + automação**, para coisas como:

- confirmação de cadastro;
- comunicação com candidato;
- aviso de candidatura;
- atualização de processo seletivo;
- contato com empresa;
- notificações;
- atendimento;
- encaminhamento para humano;
- disparos controlados pelos workflows do n8n.

Ou seja:

**Site/Supabase → evento → n8n → WhatsApp → candidato/empresa**

**4. Suporte**
Além do chatbot, temos a estrutura de:

- chamados;
- categorias;
- histórico;
- atendimento humano;
- realtime;
- dashboard do atendente;
- acompanhamento dos chamados;
- automações relacionadas ao suporte.

**5. RH / Recrutamento**
Também não podemos esquecer:

- cadastro de candidatos;
- currículo;
- upload de PDF;
- banco de candidatos;
- vagas;
- candidatura;
- histórico de candidaturas;
- processo seletivo;
- empresas;
- publicação de vagas;
- acompanhamento;
- entrevistas;
- contratação;
- área da empresa;
- área do candidato.

**6. Segurança / infraestrutura**
E isso também faz parte do produto:

- Supabase Auth;
- RLS;
- RBAC;
- multi-tenancy;
- `people`;
- `tenant_memberships`;
- `role_assignments`;
- permissões;
- auditoria;
- eventos de domínio;
- Turnstile;
- proteção de formulários;
- sessão;
- recuperação de identidade;
- logs.

### E tem uma distinção importante

O projeto não é:

> **"um site com chatbot".**

É muito mais próximo de:

> **J&S Empregos — plataforma digital de RH, recrutamento, atendimento e captação de oportunidades, com automação integrada.**

A arquitetura que estamos montando fica mais parecida com:

```text
                    J&S EMPREGOS
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      SITE             RH/ATS          SUPORTE
        │                │                │
   ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
   │    │    │      │    │    │      │    │    │
 Vagas Empresas Candidatos Processo Tickets Chat
        │                │                │
        └────────────────┼────────────────┘
                         │
                      SUPABASE
                         │
              ┌──────────┴──────────┐
              │                     │
             n8n                 Realtime
              │
       ┌──────┼──────┐
       │      │      │
   WhatsApp E-mail Automação
```

E ainda temos **SEO, acessibilidade, responsividade, painel administrativo, notificações, integrações e infraestrutura de deploy**.

Então você está certo em corrigir isso: **não podemos apresentar o inventário como se o Chat/Atendimento fosse todo o sistema.**

E principalmente: **não devemos mandar um agente criar outro n8n, outro chatbot, outro sistema de tickets ou outra automação**, porque isso quebraria justamente a regra que você já estabeleceu de primeiro levantar o que existe e reutilizar a infraestrutura existente.

Se formos consolidar a documentação agora, o correto é montar um **Inventário Geral da Plataforma J&S Empregos**, separando **Site + RH/ATS + Candidato + Empresa + Suporte + IA + WhatsApp + n8n + Segurança + Supabase + Administração + Deploy**, com o status de cada item.
