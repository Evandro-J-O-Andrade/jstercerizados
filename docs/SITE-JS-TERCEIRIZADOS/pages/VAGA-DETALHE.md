# VAGA DETALHE

**Rota:** `/vagas/:slug`
**Status:** Documentação de referência
**Referência:** `docs/SITE-JS-Empregos/00-VISAO-GERAL.md`, `pages/VAGAS.md`

---

## 1. Objetivo

Apresentar os detalhes de uma vaga específica e captar a candidatura.

---

## 2. Usuário principal

- Candidatos interessados na vaga

---

## 3. Objetivo comercial

- Converter visualização em candidatura
- Capturar currículo e dados do candidato
- Direcionar para cadastro no banco de talentos

---

## 4. Rotas

- `/vagas/:slug`

---

## 5. Conteúdo fornecido pelo cliente

Mesmo conteúdo de VAGAS.md, porém em detalhe.

---

## 6. Estrutura visual

- Título
- Metadados: localização, contrato, modalidade, salário
- Benefícios
- Requisitos
- Descrição
- Responsabilidades
- Informações adicionais
- CandidaturaForm

---

## 7. Seções

1. Detalhe da vaga
2. CandidaturaForm
3. CTA secundário: "Ver todas as vagas"

---

## 8. CTAs

- Primário: `Candidatar-se`
- Secundário: `Ver todas as vagas`

---

## 9. Componentes reutilizáveis

- `VagaDetalhe`
- `CandidaturaForm`
- `Section`
- `Container`
- `Button`
- `Badge`

---

## 10. Dados necessários

Mesmo modelo de `Vaga` de VAGAS.md.

---

## 11. Formulários

`CandidaturaForm`

- Recebe `vagaId`, `vagaSlug`, `vagaTitulo`
- Campos: nome, CPF, e-mail, telefone, cidade, currículo, experiência, mensagem
- Após envio: confirmação + WhatsApp

---

## 12. Responsividade

- Desktop: conteúdo em coluna confortável
- Mobile: coluna única, botões empilhados

---

## 13. Dark / Light

- Texto legível
- Campos de formulário com contraste adequado

---

## 14. Acessibilidade

- H1 único
- labels nos inputs
- foco visível
- teclado navegável

---

## 15. SEO

- title: "{Título da vaga} — J&S Empregos"
- description: resumo da vaga
- canonical: `/vagas/:slug`

---

## 16. Animações

- entrada suave das seções
- respeitar `prefers-reduced-motion`

---

## 17. Estados

- loading
- empty
- error
- success

---

## 18. Não fazer

- Não duplicar formulário por vaga
- Não inventar campos
- Não redirecionar automaticamente para `/vagas`

---

## 19. Critérios de aceite

- [ ] Slug válido carrega vaga
- [ ] Slug inválido mostra erro
- [ ] Formulário recebe contexto da vaga
- [ ] Envio simulado funciona
- [ ] Responsivo
- [ ] Dark/light testado
- [ ] Acessibilidade testada

---

## 20. Checklist final

- [ ] typecheck
- [ ] build
- [ ] sem erros de console
- [ ] sem regressões em `/vagas`
