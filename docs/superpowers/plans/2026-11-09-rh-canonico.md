# RH Canônico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** concluir as cinco páginas canônicas de RH com contrato real de `employees.id → people.id`, relações existentes e acabamento enterprise responsivo.

**Architecture:** manter `ModuleRouter → rhRoutes → páginas RH → employeesRepository → Supabase`, usando o shell e os tokens atuais. A criação seleciona uma pessoa ativa do tenant ainda sem vínculo funcional e persiste seu UUID como `employees.id`; detalhes carregam posições, contratos, documentos e histórico sem fabricar eventos.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind, Vitest, Supabase JS.

**Spec:** `dashaboard/README.md`, `dashaboard/04_documentacao/MATRIZ_26_CELULAS.md`, referências `10_rh_*.png`.

## Global Constraints

- Preservar o nome J&S Empregos LTDA e o footer.
- Sem migration, alteração remota, Auth, RBAC/RLS, DispatcherMaster, P0.1, P0.2, OBS-01, commit, push ou deploy.
- Não usar dados fictícios no runtime.
- Preservar o isolamento por tenant e as páginas separadas de dashboard, lista, criação, detalhe e edição.

## Review Focus

- Pessoa fora do tenant nunca deve aparecer para criação.
- Pessoa já vinculada não deve poder gerar segundo colaborador.
- Tenant ausente deve impedir leitura e escrita.
- Relações vazias devem produzir estados vazios honestos.
- Tema dark/light e mobile não podem introduzir segunda sidebar ou overflow horizontal.

---

### Task 1: contrato de persistência por PK compartilhada

**Files:** `src/repositories/employees.repository.ts`, `src/types/domain/employee.ts`, testes do repository.

- [ ] Escrever teste que exige `id` no insert e ausência de `person_id`.
- [ ] Implementar opções de pessoas elegíveis do tenant e criação com `employees.id` compartilhado.
- [ ] Carregar relações existentes no detalhe.
- [ ] Executar testes do repository.

### Task 2: formulário de criação e edição

**Files:** `src/modules/rh/pages/RHColaboradorForm*`, páginas New/Edit.

- [ ] Adicionar seleção obrigatória da pessoa apenas na criação.
- [ ] Manter campos persistidos pelo schema e validações acessíveis.
- [ ] Cobrir tenant ausente, lista vazia e erro de consulta.

### Task 3: acabamento das cinco telas

**Files:** dashboard e páginas RH.

- [ ] Corrigir UTF-8 visível na célula RH.
- [ ] Refinar densidade, hierarquia, estados e relações seguindo as referências.
- [ ] Preservar tokens semânticos nos temas dark/light.

### Task 4: validação

- [ ] ESLint direcionado.
- [ ] TypeScript e testes RH/repository.
- [ ] Build.
- [ ] Navegador autenticado em desktop/mobile e dark/light, sem segunda sidebar.
