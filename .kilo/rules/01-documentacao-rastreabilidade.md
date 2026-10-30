# REGRA PERMANENTE — DOCUMENTAÇÃO E RASTREABILIDADE DO CÓDIGO

**Versão:** 1.0
**Data:** 2026-10-14
**Escopo:** todo o repositório, agentes Kilo, comandos e worktrees

## Objetivo

Todo código novo ou alterado deve ser compreensível, rastreável e documentado para facilitar manutenção e diagnóstico sem precisar solicitar comentários a cada tarefa.

---

## 1. Antes de alterar

- Inspecionar os arquivos, componentes, rotas e imports relacionados.
- Identificar a implementação existente e suas dependências.
- Não presumir nomes de arquivos, caminhos, tabelas ou comportamentos.
- Preservar funcionalidades existentes e áreas protegidas do projeto.
- Não executar alterações no banco, migrations, seeds, RLS, commits, pushes ou deploys sem autorização explícita.

## 2. Comentários no código

- Escrever comentários em português do Brasil.
- Documentar funções, componentes, hooks, consultas e regras de negócio relevantes.
- Explicar por que uma regra existe, quais dados recebe, o que retorna e quais efeitos produz.
- Comentar decisões não óbvias, validações, permissões, tratamento de erros e integrações.
- Usar JSDoc em funções públicas, APIs internas importantes e componentes reutilizáveis quando apropriado.
- Evitar comentários redundantes que apenas repetem o código.
- Atualizar os comentários quando a implementação mudar; remover explicações desatualizadas.
- Não afirmar que algo funciona sem verificar a implementação.

## 3. Galeria de serviços

- Rastrear a origem das imagens da pasta galeria até sua exibição na mini landing page de cada serviço.
- Identificar a rota, a slug, o componente de detalhes, a sessão de galeria e a origem dos dados.
- Documentar como adicionar, substituir e remover imagens.
- Verificar caminhos, nomes de arquivos, formatos, fallback para imagem ausente e comportamento responsivo.
- Não duplicar imagens ou criar outro mecanismo de galeria sem necessidade.
- Respeitar a arquitetura e o padrão de organização já existentes.

## 4. Entrega de cada tarefa

Registrar:

1. Diagnóstico inicial.
2. Arquivos inspecionados.
3. Arquivos criados ou modificados.
4. Regras e funções documentadas.
5. Testes executados e resultados reais.
6. Pendências e riscos conhecidos.
7. Procedimento para manutenção futura.

## 5. Limites

- Não reformatar arquivos inteiros sem necessidade.
- Não modificar áreas fora do escopo.
- Não inventar dados, imagens, rotas ou resultados de testes.
- Não considerar uma tarefa concluída apenas porque o código foi escrito.
- Priorizar alterações pequenas, revisáveis e com testes de regressão.