# MAPA HIERÁRQUICO FUNCIONAL — CHECK BOULER 24H

**Data:** 2026-10-30  
**Status:** Proposta em revisão — nenhuma alteração aplicada  
**Modelo:** Floresta de domínios (analogia Active Directory: Forest → Domain → OU → Groups → Users)  
**Regra:** cada domínio tem sua própria árvore de autoridade. Não existe cadeia linear única que subordine todos os papéis a um único tronco.

---

## 1. Estrutura Conceitual — Floresta de Domínios

```
PLATAFORMA (escopo global)
└── admin_master — ROOT global do SaaS
    └── Escopo: todos os tenants, todos os domínios
    └── Autoridade: tenants.*, roles.*, permissions.*, audit.read, system.*
    └── Sujeito a RLS e auditoria. Não desativa isolamento de tenant.

TENANT J&S Empregos LTDA (escopo de tenant)
├── owner — proprietário do tenant (autoridade máxima interna)
│   └── tenant_admin — administrador delegado do tenant
│       └── gestores autorizados (equipes, setores, operações)
│           └── funcionario — acesso operacional conforme atribuições
│
├── RECRUTAMENTO (domínio funcional autônomo)
│   ├── recrutador_master — liderança da célula de recrutamento
│   │   └── recrutador — execução de atividades de recrutamento
│   └── (não subordina automaticamente a gestor/owner)
│
├── FINANCEIRO (domínio funcional autônomo)
│   ├── financeiro_master — liderança do domínio financeiro
│   └── financeiro — execução das operações financeiras
│
├── RECURSOS HUMANOS (domínio funcional autônomo)
│   ├── rh_master — liderança do domínio de RH
│   └── rh — execução operacional de RH
│
├── COMERCIAL (domínio funcional autônomo)
│   ├── comercial_master — liderança do domínio comercial
│   └── comercial — execução das operações comerciais
│
├── OPERAÇÕES (domínio funcional autônomo)
│   ├── operacao_master — liderança do domínio de operações
│   └── operacao — execução das operações operacionais
│
└── SUPORTE (domínio funcional autônomo)
    ├── suporte_master — liderança do domínio de suporte
    ├── suporte_ti — suporte técnico especializado
    └── suporte — atendimento e suporte ao usuário

CANDIDATOS (perfil externo, escopo self)
└── candidato — acesso apenas aos próprios dados e candidaturas
```

---

## 2. Regras de Separação de Conceitos

| Conceito               | Definição                                   | Exemplo                                                                                                 |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Autoridade**         | Quem pode administrar quem                  | `owner` administra `tenant_admin` dentro do tenant; `admin_master` administra a plataforma              |
| **Escopo**             | Onde a autoridade pode ser exercida         | `admin_master` = global; `owner` = próprio tenant; `recrutador_master` = recrutamento do próprio tenant |
| **Função operacional** | O que a pessoa executa dentro de um domínio | `recrutador` executa vagas/candidatos; `financeiro` executa lançamentos financeiros                     |

> `recrutador_master` não está subordinado funcionalmente a `gestor` de maneira automática. Um `financeiro_master` não depende de uma hierarquia de recrutamento. Cada domínio opera de forma autônoma dentro do tenant.

> `funcionario` é uma condição funcional de vínculo interno. `candidato` é um perfil externo. Nenhum dos dois herda permissões simplesmente por ocupar posição consecutiva em uma lista.

---

## 3. Mapa de Autoridade por Domínio

### 3.1 Plataforma / ROOT

| Papel        | Escopo | Pode administrar                    | Limite                                             |
| ------------ | ------ | ----------------------------------- | -------------------------------------------------- |
| admin_master | global | Todos os tenants, todos os domínios | RLS e auditoria aplicados; não desativa isolamento |

### 3.2 Gestão do Tenant

| Papel        | Escopo | Pode administrar                         | Limite                                           |
| ------------ | ------ | ---------------------------------------- | ------------------------------------------------ |
| owner        | tenant | Próprio tenant (não outros tenants)      | Não tem autoridade global                        |
| tenant_admin | tenant | Recursos delegados no próprio tenant     | Não se torna ROOT; não administra outros tenants |
| gestor       | tenant | Equipes, setores e operações autorizadas | Não tem privilégios de ROOT nem de owner         |
| funcionario  | tenant | Próprias tarefas e dados autorizados     | Não acessa dados de outros sem autorização       |

### 3.3 Recrutamento

| Papel             | Escopo | Pode administrar                                       | Limite                                                        |
| ----------------- | ------ | ------------------------------------------------------ | ------------------------------------------------------------- |
| recrutador_master | tenant | Recrutadores e processos seletivos (escopo autorizado) | Não é segundo administrador global; não administra financeiro |
| recrutador        | tenant | Vagas, candidatos, processos (execução)                | Não altera permissões administrativas                         |

### 3.4 Domínios Especializados

| Domínio          | Liderança (`_master`) | Operação            |
| ---------------- | --------------------- | ------------------- |
| Financeiro       | financeiro_master     | financeiro          |
| Recursos Humanos | rh_master             | rh                  |
| Comercial        | comercial_master      | comercial           |
| Operações        | operacao_master       | operacao            |
| Suporte          | suporte_master        | suporte_ti, suporte |

Regra: o sufixo `_master` significa liderança daquele domínio dentro do escopo atribuído. **Não** significa ROOT global.

---

## 4. Fluxo de Resolução (Dispatcher Master)

O Dispatcher Master resolve, em ordem:

1. **Identidade** — auth.users → people
2. **Tenant** — tenant_memberships (ativo)
3. **Unidade** — vinculada à pessoa/tenant
4. **Departamento** — vinculado à unidade/pessoa
5. **Grupo** — vinculado à pessoa/departamento
6. **Papel ativo** — role_assignments → roles (escopo global ou tenant)
7. **Escopo** — derivado do papel + contexto de execução
8. **Permissões** — roles → role_permissions → permissions (default DENY)
9. **Célula de destino** — roteamento por permissão efetiva

Cada célula consulta o **contrato central de autorização**. Nenhuma célula cria RBAC paralelo.

---

## 5. Isolamento e Limites

| Situação                                     | Regra                                                   |
| -------------------------------------------- | ------------------------------------------------------- |
| admin_master acessa tenant alheio            | Permitido (escopo global), com auditoria e RLS          |
| owner acessa outro tenant                    | Bloqueado (escopo = próprio tenant)                     |
| tenant_admin acessa outro tenant             | Bloqueado                                               |
| gestor acessa equipe de outro setor          | Bloqueado (sem atribuição explícita)                    |
| recrutador_master acessa financeiro          | Bloqueado (sem domínio financeiro)                      |
| recrutador altera permissões admin           | Bloqueado (não tem role admin)                          |
| funcionario acessa dados de outro usuário    | Bloqueado (sem autorização)                             |
| candidato acessa currículo de terceiro       | Bloqueado (RLS de self-isolation)                       |
| Escalonamento de privilégio (self-elevation) | Bloqueado (nenhuma atribuição eleva próprio privilégio) |

---

## 6. O que NÃO é herança implícita

- `gestor` não herda `recrutador` automaticamente.
- `recrutador_master` não herda `admin_master`.
- `funcionario` não herda permissões de outros colaboradores.
- Nome de papel não concede permissão. Apenas `role_permissions` explícitas concedem.
- Posicionamento consecutivo na lista não implica subordinação funcional.

---

**Próximo entregável:** `04-MIGRACAO-PROPOSA-RBAC-GLOBAL.sql` e `05-SEED-GLOBAL-REVISAO.sql` (em revisão, não aplicar).
