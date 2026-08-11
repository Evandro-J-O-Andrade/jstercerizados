# Guia de Rollback — J&S Empregos LTDA

**NÃO ALTERAR ESTE DOCUMENTO SEM AUTORIZAÇÃO EXPRESSA DO RESPONSÁVEL TÉCNICO.**

---

## 1. Visão Geral

Este guia explica como reverter alterações no site J&S Empregos LTDA caso algo quebre após uma atualização. Siga os passos abaixo para garantir um rollback seguro e rápido.

---

## 2. Pré-requisitos

- Acesso ao repositório GitHub: https://github.com/Evandro-J-O-Andrade/jstercerizados
- Git instalado na máquina
- Permissão de push para o repositório

---

## 3. Identificando o Problema

Antes de reverter, identifique qual commit causou o problema:

```bash
# Ver histórico de commits
git log --oneline -20

# Ver diferenças do último commit
git diff HEAD~1
```

---

## 4. Rollback Simples (último commit)

Se o problema foi causado pelo último commit:

```bash
# Reverte o último commit mantendo as alterações no working tree
git revert HEAD

# Ou, se quiser descartar completamente:
git reset --hard HEAD~1
```

---

## 5. Rollback para um Commit Específico

Se precisar voltar para um commit específico:

```bash
# Lista os commits
git log --oneline

# Volta para o commit desejado (exemplo: abc1234)
git revert abc1234..HEAD

# Ou reset hard (cuidado: descarta tudo)
git reset --hard abc1234
```

---

## 6. Rollback de um Arquivo Específico

Se apenas um arquivo quebrou:

```bash
# Restaura arquivo para versão anterior
git checkout HEAD~1 -- src/components/sections/CinematicShowcase.tsx

# Ou para um commit específico
git checkout abc1234 -- src/components/sections/CinematicShowcase.tsx
```

---

## 7. Deploy do Rollback

Após reverter localmente:

```bash
# Adiciona as alterações
git add .

# Commita o rollback
git commit -m "rollback: reverte alterações de [data/descricao]"

# Push para o repositório
git push origin main
```

---

## 8. Validação Pós-Rollback

Sempre valide após o rollback:

```bash
# Roda o build
npm run build

# Roda o lint
npm run lint

# Testa localmente
npm run dev
```

---

## 9. Pontos de Atenção

- **Nunca force push** na branch main sem autorização.
- **Sempre commit o rollback** com mensagem clara explicando o motivo.
- **Mantenha o footer intacto** — é uma regra absoluta do projeto.
- **Não altere o nome da empresa** em nenhum documento ou código.
- Se o problema for em produção, priorize rollback rápido, depois investigue a causa.

---

## 10. Contatos de Emergência

- **Responsável Técnico:** New Wave Sistemas Digital Solutions
- **Repositório:** https://github.com/Evandro-J-O-Andrade/jstercerizados
- **Data de criação:** 2026-08-10

---

_Documento de rollback — J&S Empregos LTDA_
