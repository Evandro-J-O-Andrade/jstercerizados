# Refatoração JR Empregos — Migração para Agência de RH

**Data:** 06/08/2026  
**Status:** Alterações aplicadas localmente, build validado, aguardando revisão  
**Objetivo:** Reposicionar de terceirização para Agência de Empregos/RH sem perder base existente

---

## Diretriz Central

> **Não refatorar a essência.** Preservar a arquitetura de conversão WhatsApp First, formulários e captação. Adaptar posicionamento e produto.

---

## 1. Auditoria Comparativa — Arquivo por Arquivo

| Arquivo                            | Estado Anterior                                                     | Estado Atual                                                                    | Status                                                       |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/App.tsx`                      | Rotas: clientes, parceiros, fornecedores, suporte, trabalhe-conosco | Rotas: vagas, empresas, trabalhe-conosco, servicos, login                       | **Mantido** TrabalheConosco; **adicionado** Vagas + Empresas |
| `src/config/navigation.ts`         | Início, Serviços, Sobre, Trabalhe Conosco, FAQ, Contato, Login      | Início, Vagas, Empresas, Serviços, Trabalhe Conosco, Sobre, FAQ, Contato, Login | **Mantido** + expandido                                      |
| `src/pages/TrabalheConosco.tsx`    | Formulário com campos condicionais, upload PDF, WhatsApp flow       | **Removido de rotas** → restaurado                                              | **Recuperado**                                               |
| `src/pages/Login.tsx`              | Glass premium + hero background                                     | Design genérico                                                                 | **Reavançado**: profile selector admin/candidato/empresa     |
| `src/pages/Home.tsx`               | HeroSlider 3 slides + Brand3D                                       | HeroSlider + Brand3D                                                            | **Preservado**                                               |
| `src/components/layout/Footer.tsx` | 4 zones + dark/light                                                | 4 zones + dark/light                                                            | **Preservado**                                               |
| `src/components/ui/*`              | Button, Input, Textarea, SafeImage                                  | Button (to prop), SafeImage (fallback)                                          | **Preservado**                                               |
| `src/services/mock/services.ts`    | 8 serviços operacionais (Limpeza, Segurança, Zeladoria...)          | 11 serviços (4 RH + 7 Operacionais)                                             | **Expandido**                                                |

---

## 2. Novo Modelo de Produto

### Públicos

| Público       | Objetivo                                                              |
| ------------- | --------------------------------------------------------------------- |
| **Candidato** | Cadastrar currículo, buscar vagas, participar de processos            |
| **Empresa**   | Publicar vagas, acessar banco de talentos, solicitar profissionais    |
| **RH/Admin**  | Gerenciar processos seletivos, analisar currículos, administrar vagas |

### Arquitetura de Conversão (preservada)

```
Candidato → Formulário → Upload Currículo → WhatsApp RH → Banco

Empresa → Formulário → WhatsApp Comercial → CRM

Fluxos existentes mantidos. Posicionamento adaptado.
```

---

## 3. Novo Menu de Navegação

```
Home | Vagas | Empresas | Serviços | Trabalhe Conosco | Sobre | Contato | Login
```

- **Trabalhe Conosco** permanece (vai virar "Banco de Talentos" ou "Área do Candidato")
- **Vagas** permite busca/candidatura
- **Empresas** captura demanda B2B

---

## 4. Serviços — Reorganizados

### Recursos Humanos

| Serviço                | Slug                   | Imagem                                     |
| ---------------------- | ---------------------- | ------------------------------------------ |
| Recrutamento & Seleção | `recrutamento-selecao` | `/images/services/recrutamento.svg` ✅     |
| Banco de Talentos      | `banco-de-talentos`    | `/images/services/banco-talentos.svg` ✅   |
| Avaliação de Perfil    | `avaliacao-perfil`     | `/images/services/avaliacao-perfil.svg` ✅ |
| Executive Search       | `hunting`              | `/images/services/hunting.svg` ✅          |

### Soluções Operacionais (mantidas)

| Serviço               | Slug                    | Imagem                                       |
| --------------------- | ----------------------- | -------------------------------------------- |
| Segurança Patrimonial | `seguranca-patrimonial` | `/images/services/seguranca-patrimonial.svg` |
| Limpeza Profissional  | `limpeza`               | `/images/services/limpeza.svg`               |
| Portaria Inteligente  | `portaria`              | `/images/services/portaria.svg`              |
| Zeladoria Preventiva  | `zeladoria`             | `/images/services/zeladoria.svg`             |

---

## 5. Login — Perfis Unificados

Manter design premium (glass + hero).

Adicionar selector de perfil:

```
[Admin]  [Candidato]  [Empresa]
```

Rotas futuras:

- `/login/admin` → Dashboard RH
- `/login/candidato` → Área do Candidato
- `/login/empresa` → Área da Empresa

---

## 6. Banco de Dados (Supabase)

### Estrutura atual (preservar)

```sql
usuarios, perfis, empresas, servicos, leads,
contatos, whatsapp_messages, emails_enviados
```

### Novas tabelas (evolução)

```sql
candidatos     — dados pessoais + currículo + área de interesse
vagas          — cargo, descrição, empresa, status, tipo, salário
candidaturas   — relação candidato × vaga + status (recebido, analisando, entrevista, aprovado, recusado)
processos      — kanban de recrutamento
entrevistas    — data, avaliação, status
```

---

## 7. Dashboard RH (futuro)

Módulos:

```
Dashboard | Candidatos | Vagas | Processos | Empresas | Relatórios | Configurações
```

---

## 8. Checklist — Próximos Passos

```markdown
## Sprint 1 — Reposicionamento visual ✅

- [x] Navigation: Vagas + Empresas + Trabalhe Conosco
- [x] Rotas: trabalhe-conosco restaurado
- [x] Services: 4 novos serviços RH no mock
- [x] Login: profile selector admin/candidato/empresa
- [x] Imagens hero login/servicos criadas
- [x] Build + tsc --noEmit validados

## Sprint 2 — Conteúdo + UX

- [ ] Home.tsx: ajustar hero copy para Agência de RH
- [ ] Home.tsx: adicionar cards de serviços RH
- [ ] Servicos.tsx: agrupar em RH + Operacionais
- [ ] TrabalheConosco.tsx: reforçar posicionamento "Banco de Talentos"
- [ ] Vagas.tsx: migrar stub → listagem funcional
- [ ] Empresas.tsx: página "Para Empresas"

## Sprint 3 — Mobile + Tema

- [ ] Scroll lock no menu mobile
- [ ] Focus trap no modal drawer
- [ ] Safe area (iOS)
- [ ] Contraste dark/light audit

## Sprint 4 — Integrações

- [ ] Supabase auth integration
- [ ] WhatsApp API flow (já parcialmente mockado)
- [ ] Chat IA Assistente RH
- [ ] n8n workflow triggers
```

---

## 9. Regras para o Kilo

1. **Nunca** criar um componente do zero quando um existente pode ser adaptado.
2. **Nunca** remover rotas sem consultar este documento.
3. **Sempre** preservar a arquitetura WhatsApp First.
4. **Sempre** validar com `tsc --noEmit` + `npm run build` antes de sugerir.
5. O commit só ocorre após aprovação explícita.
