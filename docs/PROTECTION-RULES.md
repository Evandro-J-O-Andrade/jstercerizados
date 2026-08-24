# Regras de Proteção do Projeto

## 1. Princípio fundamental

**Não altere, remova, renomeie ou refatore arquivos existentes sem permissão expressa do usuário.**

Isso vale mesmo que o arquivo pareça pequeno, obsoleto, mal nomeado ou “fácil de melhorar”.

## 2. Arquivos e áreas protegidas

Estas áreas estão bloqueadas por padrão e não devem ser tocadas sem autorização explícita:

- `src/pages/Login.tsx`
- `src/pages/dashboard/**`
- Qualquer página pública que ainda dependa de mock para funcionar
- Arquivos de autenticação (`AuthContext*`, helpers de auth)
- Arquivos de layout já estabelecidos (`PublicLayout`, `AppShell`, `DashboardShell`, sidebar, header)
- Seeds, migrations e documentação já revisados

## 3. O que é permitido fazer

Sem pedir, você pode:

- Ler arquivos para entender o código
- Executar comandos de verificação: `tsc --noEmit`, `npm run lint`, `npm run build`
- Criar novos arquivos quando eu pedir explicitamente
- Aplicar mudanças que eu descrever passo a passo

## 4. O que NÃO é permitido fazer

Sem permissão expressa, NÃO faça:

- alterar Tipos, interfaces ou schemas já existentes;
- renomear variáveis, componentes ou arquivos;
- remover mocks ainda necessários;
- modificar login, dashboard, sidebar, header ou shell;
- aplicar migrations ou seeds no banco sem eu confirmar;
- mudar regras de RLS, auth ou políticas de segurança;
- alterar `.env`, `.env.example` ou qualquer variável de ambiente;
- apagar conteúdo editorial, textos, imagens ou estrutura visual existente.

## 5. Regra de leitura obrigatória

Antes de executar qualquer tarefa, leia:

- `AGENTS.md`
- Este arquivo (`docs/PROTECTION-RULES.md`)
- Qualquer outro `.md` relevante para a tarefa atual

## 6. Regra de execução

Execute **somente** o que for solicitado.

Se uma solicitação for ambígua, pare e peça esclarecimento.

Não antecipe passos “lógicos” sem confirmação.

## 7. Como pedir permissão

Quando eu precisar alterar algo protegido, eu devo:

1. Identificar o arquivo e a linha exata;
2. Explicar o motivo da alteração;
3. Esperar sua autorização antes de editar.

## 8. Estado atual protegido

Até segunda ordem:

- `/servicos` está em mock e **não deve ser conectado ao Supabase**
- `/vagas` está em mock e **não deve ser conectado ao Supabase**
- `/empresas` está em hook real e **não deve ser alterada até o seed ser aplicado**
- Login e Dashboard **estão intocáveis**

Qualquer mudança nessas páginas depende de autorização expressa.
