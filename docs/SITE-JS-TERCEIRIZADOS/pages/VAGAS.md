# VAGAS

**Rotas:**

- `/vagas` — listagem
- `/vagas/:slug` — detalhe da vaga

**Status:** Documentação de referência
**Referência:** `docs/SITE-JS-Empregos/00-VISAO-GERAL.md`

---

## 1. Objetivo

Apresentar vagas disponíveis e permitir candidatura de forma clara, rápida e profissional.

---

## 2. Usuário principal

- Candidatos buscando oportunidades
- Empresas visualizando como suas vagas são apresentadas

---

## 3. Objetivo comercial

- Gerar candidaturas qualificadas
- Direcionar empresas para publicar vagas
- Direcionar candidatos para cadastro de currículo

---

## 4. Rotas

- `/vagas`
- `/vagas/:slug`

---

## 5. Conteúdo fornecido pelo cliente

Exemplos:

- Auxiliar de Produção
- Operador de Empilhadeira
- Conferente
- Analista Administrativo

Campos por vaga:

- título
- empresa (opcional)
- cidade
- estado
- tipo de contrato (CLT, temporário, efetivo)
- salário/faixa salarial
- benefícios
- requisitos
- descrição
- responsabilidades
- modalidade (presencial/híbrido/remoto)
- data de publicação

Não inventar vagas.

---

## 6. Estrutura visual

### `/vagas`

- Hero da página
- Filtros (cargo, cidade, estado, área, tipo de contrato, salário, data)
- Grid de cards de vaga

### `/vagas/:slug`

- Título
- Metadados
- Sobre a vaga
- Responsabilidades
- Requisitos
- Benefícios
- Botão: Candidatar-se

---

## 7. Seções

#### `/vagas`

1. Hero
2. Filtros
3. Lista de vagas
4. CTA: "Cadastrar currículo"

#### `/vagas/:slug`

1. Detalhe da vaga
2. CandidaturaForm
3. CTA: "Ver todas as vagas"

---

## 8. CTAs

- Primário: `Candidatar-se`
- Secundário: `Ver todas as vagas`
- Tertário: `Cadastrar currículo`

---

## 9. Componentes reutilizáveis

- `Section`
- `Container`
- `VagaCard`
- `VagaDetalhe`
- `CandidaturaForm`
- `Button`
- `Badge`
- `Input`
- `Select`

---

## 10. Dados necessários

```ts
// src/services/mock/vagas.ts ou Supabase vacancies
export interface Vaga {
  id: string;
  slug: string;
  titulo: string;
  empresa?: string;
  cidade: string;
  estado: string;
  tipoContrato: string;
  salarioMin?: number;
  salarioMax?: number;
  beneficios?: string[];
  requisitos?: string[];
  descricao?: string;
  responsabilidades?: string[];
  modalidade?: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  publicadaEm?: string;
  status?: string;
}
```

---

## 11. Formulários

`CandidaturaForm`

- Recebe `vagaId` e `vagaSlug`
- Campos: nome, CPF, e-mail, telefone, cidade, currículo (PDF), experiência, mensagem
- Após envio: mensagem de confirmação + opção de WhatsApp

Não duplicar formulário por vaga.

---

## 12. Responsividade

- Desktop: grid 3-4 colunas
- Tablet: grid 2 colunas
- Mobile: grid 1 coluna
- Filtros empilhados no mobile

---

## 13. Dark / Light

- Cards com fundo sólido
- Texto legível em ambos os temas
- Badges com contraste adequado

---

## 14. Acessibilidade

- headings hierárquicos
- labels nos filtros
- aria-label nos cards
- foco visível
- teclado navegável

---

## 15. SEO

- title: "Vagas — J&S Empregos"
- description: "Encontre oportunidades de trabalho..."
- canonical: `/vagas`
- structured data para vagas (quando disponível)

---

## 16. Animações

- entrada suave dos cards
- hover discreto
- respeitar `prefers-reduced-motion`

---

## 17. Estados

- loading: skeleton cards
- empty: "Nenhuma vaga encontrada"
- error: mensagem de erro com retry

---

## 18. Não fazer

- Não inventar vagas
- Não duplicar páginas por vaga
- Não redirecionar `/vagas/:slug` de volta para `/vagas`
- Não criar `FormularioAuxiliar.tsx`, `FormularioOperador.tsx`, etc.

---

## 19. Critérios de aceite

- [ ] Listagem carrega com filtros
- [ ] Clique em vaga abre `/vagas/:slug`
- [ ] Detalhe mostra todos os campos
- [ ] CandidaturaForm funciona com `vagaId`
- [ ] Responsivo mobile/tablet/desktop
- [ ] Dark/light testado
- [ ] Acessibilidade testada

---

## 20. Checklist final

- [ ] typecheck
- [ ] build
- [ ] sem erros de console
- [ ] sem regressões em rotas existentes
