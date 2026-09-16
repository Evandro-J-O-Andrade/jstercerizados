---
name: Diretriz Permanente - Leitura Obrigatória
description: Regra máxima de leitura de documentação antes de qualquer ação
alwaysApply: true
---

# Diretriz Permanente — Leitura Obrigatória

## Regra Máxima

**ANTES** de executar qualquer tarefa, alterar qualquer arquivo, escrever código,
executar migration, alterar banco, criar componente, modificar rota, fazer commit,
deployment, merge ou qualquer outra ação no projeto:

> **LEIA PRIMEIRO todas as diretrizes e documentações relevantes disponíveis na worktree atual.**

Nunca inicie uma tarefa baseado apenas na mensagem atual do usuário.

---

## Ordem Obrigatória

Sempre seguir esta sequência:

1. **Ler diretrizes do agente** (`AGENTS.md`, `.kilo/agent/*.md`)
2. **Localizar e ler arquivos `.md` relevantes** (`docs/`, `supabase/`, raiz)
3. **Identificar regras, decisões e restrições vigentes**
4. **Verificar se a funcionalidade solicitada já existe**
5. **Buscatpor componente, hook, service, repository, rota, função, RPC, migration ou estrutura equivalente**
6. **Analisar estado atual antes de criar qualquer coisa**
7. **Informar conflitos ou ambiguidades encontrados**
8. **Planejar a execução apenas após verificação completa**
9. **Implementar SOMENTE com autorização explícita**

---

## Documentação tem Prioridade

A documentação existente faz parte da especificação do projeto. Nunca ignore um `.md` porque:

- parece antigo;
- está em outra pasta;
- possui nome diferente;
- foi criado por outra etapa;
- parece ser apenas uma auditoria;
- contém histórico.

Classifique cada documento:

```
DOCUMENTO
VERSÃO/CONTEXTO
DECISÃO
CONFLITO
ESTADO ATUAL DO CÓDIGO
```

Quando houver documentos conflitantes: **NÃO escolha silenciosamente.** Registre o conflito explicitamente.

---

## Não Duplicar

Antes de criar qualquer coisa, procure primeiro se já existe:

- componentes, páginas, rotas, layouts, hooks, contexts, services, repositories, utilities, types, models
- dashboards, MetricGrid, MetricCard, cards, tabelas, formulários, modais, notificações, e-mails
- RPCs, migrations, Edge Functions, integrações

**Se já existir: reutilize ou proponha melhoria. Não crie duplicação.**

---

## Supabase é Source of Truth

- Nunca inventar dados
- Nunca substituir dados reais por mocks sem autorização
- Nunca criar tabelas, RPCs, migrations ou estruturas sem verificar o schema/documentação

Identificar sempre a cadeia:

```
Interface → Hook/Context → Repository/Service → RPC/Query → Supabase → Dados reais
```

---

## Git

Nunca executar automaticamente:

- `git push`
- deploy
- release
- merge
- produção

### Commit

Commit somente com **autorização explícita**.

### Push

Push somente com **autorização explícita**.

### Deploy

Deploy somente com **autorização explícita**.

Frases como "terminou", "pode continuar", "faça a implementação", "corrija" **NÃO** significam autorização para push ou deploy.

---

## Produção

Nunca assumir que uma alteração deve ir para produção. Sempre exigir **autorização explícita** antes de qualquer ação de produção.

---

## Regra de Segurança

Nunca alterar SEM primeiro verificar documentação, estado atual e autorização:

- Auth
- SMTP
- Turnstile
- RBAC
- RLS
- triggers
- migrations
- banco de produção
- configurações de produção

---

## Regra de Auditoria

Quando a tarefa for de auditoria: **NÃO IMPLEMENTAR.**

Primeiro produzir evidências. Classificar cada item como:

- `REAL` — implementado e funcionando
- `PARCIAL` — implementado mas incompleto
- `MOCK` — dados falsos/simulados
- `ESPECIFICADO` — existe em docs mas não implementado
- `NÃO IMPLEMENTADO` — não existe
- `ÓRFÃO` — implementado mas sem uso
- `OBSOLETO` — substituído por algo novo
- `CONFLITANTE` — conflito entre docs/código

Nunca afirmar que algo está implementado sem evidência no código e, quando aplicável, no banco.

---

## Regra Final

**DOCUMENTAÇÃO PRIMEIRO.**  
**CÓDIGO DEPOIS.**  
**IMPLEMENTAÇÃO SOMENTE APÓS VERIFICAÇÃO E AUTORIZAÇÃO.**  
**COMMIT SOMENTE COM AUTORIZAÇÃO.**  
**PUSH SOMENTE COM AUTORIZAÇÃO.**  
**DEPLOY SOMENTE COM AUTORIZAÇÃO.**

Quando houver dúvida: **PARE, DOCUMENTE, PERGUNTE ANTES DE ALTERAR.**
