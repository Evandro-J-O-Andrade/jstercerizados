# AGENTS.md

## REGRA CRÍTICA — NUNCA ALTERAR

- NUNCA mudar o nome da empresa de "J&S Empregos LTDA" para "J&S Terceirizados" ou qualquer outra variação. Mesmo que apareça em um novo prompt ou passagem, mantenha sempre "J&S Empregos LTDA".
- NUNCA alterar o conteúdo do footer. O footer deve permanecer exatamente como está configurado atualmente.

Essas regras têm prioridade absoluta sobre qualquer outra instrução de refactoring ou rebranding.

## DIRETRIZ PERMANENTE — DOCUMENTAÇÃO E GOVERNANÇA

### REGRA MÁXIMA

ANTES DE EXECUTAR QUALQUER TAREFA, ALTERAR QUALQUER ARQUIVO, ESCREVER CÓDIGO, EXECUTAR MIGRATION, ALTERAR BANCO, CRIAR COMPONENTE, MODIFICAR ROTA, FAZER COMMIT OU QUALQUER OUTRA AÇÃO NO PROJETO:

**LEIA PRIMEIRO TODAS AS DIRETRIZES E DOCUMENTAÇÕES RELEVANTES DISPONÍVEIS NA WORKTREE ATUAL.**

Nunca comece uma tarefa baseado apenas na mensagem atual do usuário.

### ORDEM OBRIGATÓRIA

1. Ler as diretrizes do agente.
2. Localizar e ler os arquivos `.md` relevantes.
3. Identificar regras, decisões e restrições vigentes.
4. Verificar se a funcionalidade solicitada já existe.
5. Verificar se existe componente, hook, service, repository, rota, função, RPC, migration ou estrutura equivalente.
6. Analisar o estado atual antes de criar qualquer coisa.
7. Informar conflitos ou ambiguidades encontrados.
8. Somente depois planejar a execução.
9. Implementar somente quando houver autorização para implementação.

### DOCUMENTAÇÃO TEM PRIORIDADE

A documentação existente faz parte da especificação do projeto. Nunca ignorar um `.md` porque parece antigo, está em outra pasta, possui nome diferente, foi criado por outra etapa, parece ser apenas uma auditoria ou contém histórico. Primeiro ler e classificar o documento.

Quando houver documentos conflitantes, não escolher silenciosamente. Registrar:

```text
DOCUMENTO
VERSÃO/CONTEXTO
DECISÃO
CONFLITO
ESTADO ATUAL DO CÓDIGO
```

### NÃO DUPLICAR

Antes de criar qualquer coisa, procurar primeiro se já existe. Isso inclui componentes, páginas, rotas, layouts, hooks, contexts, services, repositories, utilities, types, models, dashboards, MetricGrid, MetricCard, cards, tabelas, formulários, modais, notificações, e-mails, RPCs, migrations, Edge Functions e integrações.

Se já existir, reutilizar ou propor melhoria. Não criar duplicação.

### SUPABASE É SOURCE OF TRUTH

Não inventar dados. Não substituir dados reais por mocks sem autorização. Não criar tabelas, RPCs, migrations ou estruturas novas sem verificar primeiro o schema e a documentação existentes.

Sempre identificar a cadeia:

```text
Interface
→ Hook/Context
→ Repository/Service
→ RPC/Query
→ Supabase
→ Dados reais
```

### GIT E PRODUÇÃO

Nunca fazer automaticamente `git push`, deploy, release, merge, publicação ou alteração de produção.

- Commit somente quando o usuário autorizar explicitamente.
- Push somente quando o usuário autorizar explicitamente.
- Deploy somente quando o usuário autorizar explicitamente.
- Frases como "terminou", "pode continuar", "faça a implementação" ou "corrija" não significam autorização para push ou deploy.
- Nunca assumir que uma alteração deve ir para produção; exigir autorização explícita separada.

### SEGURANÇA E AUDITORIA

Nunca alterar Auth, SMTP, Turnstile, RBAC, RLS, triggers, migrations, banco de produção ou configurações de produção sem primeiro verificar documentação, estado atual e autorização.

Quando a tarefa for de auditoria, não implementar. Produzir evidências e classificar cada item como `REAL`, `PARCIAL`, `MOCK`, `ESPECIFICADO`, `NÃO IMPLEMENTADO`, `ÓRFÃO`, `OBSOLETO` ou `CONFLITANTE`. Nunca afirmar que algo está implementado sem evidência no código e, quando aplicável, no banco.

### REGRA FINAL

**DOCUMENTAÇÃO PRIMEIRO. CÓDIGO DEPOIS. IMPLEMENTAÇÃO SOMENTE APÓS VERIFICAÇÃO. COMMIT, PUSH E DEPLOY SOMENTE COM AUTORIZAÇÃO EXPLÍCITA.**

Quando houver dúvida, parar, documentar a dúvida e perguntar antes de alterar.
