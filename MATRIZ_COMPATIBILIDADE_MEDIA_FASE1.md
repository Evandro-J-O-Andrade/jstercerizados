# MATRIZ DE COMPATIBILIDADE - CÉLULA MEDIA FASE 1

**Documento:** MATRIZ_COMPATIBILIDADE_MEDIA_FASE1.md  
**Versão:** 1.1  
**Fase:** 1 - Elaboração e Auditoria de Compatibilidade  
**Branch de Referência:** main  
**Arquitetura:** CHECK BOULER 24H  
**Estado:** **NÃO APROVADA** - Múltiplos bloqueadores e riscos de segurança pendentes

---

## 1. Resumo Executivo

Auditoria com consultas diretas ao banco remoto e inspeção integral da Edge Function media-upload v2 implantada. Foram confirmados novos bloqueadores, incluindo incompatibilidade entre função e schema (purpose), ausência de fluxo de URL assinada e ruptura da continuidade de contexto com o DispatcherMaster.

## 2. Status por Item

| Item | Descrição | Status | Observação |
| :-- | :-- | :-- | :-- |
| 1 | Storage e privacidade | PENDENTE DE APROVAÇÃO | Ausência de fluxo de URL assinada para private-documents. services-images sem isolamento por tenant/entidade. |
| 2 | RPCs e privilégios / identidade | ABERTO | Origem de pp.current_person_id() não comprovada. |
| 3 | Tenant e DispatcherMaster | BLOQUEADO | media-upload resolve pela membership mais recente (created_at DESC), sem receber tenant selecionado ou contexto do DispatcherMaster. |
| 4 | Schema e relacionamentos | PARCIALMENTE CONCLUÍDO | jobs.company_id ? companies.id confirmado. Incompatibilidade entity_type e nova incompatibilidade com coluna purpose. jobs.company_relationship_id sem FK identificada. |
| 5 | RLS em media_assets | VALIDADO (leitura de metadados privados) | media_assets_tenant_read exclui document, candidate_document e employee_document. Única outra SELECT permissiva restrita a service publicado. Sem exposição identificada via policies. |
| 6 | MediaPicker e consumidores | NÃO INICIADO | Aguardando liberação. |
| 7 | Resiliência entre células | NÃO INICIADO | Aguardando liberação. |

## 3. Item 1 - Storage e Privacidade

### Buckets Remotos
| Bucket | Público | Limite | Observação |
| :-- | :-- | :-- | :-- |
| vatars | Sim | 5 MB | Leitura pública. Escrita restrita à pasta uth.uid(). |
| public-media | Sim | 10 MB | Leitura pública. Escrita/UPDATE/DELETE restritos a service_role. |
| private-documents | Não | 20 MB | **Sem policy própria em storage.objects**. Usa getPublicUrl() na função implantada. |
| services-images | Sim | 5 MB | Leitura pública. Escrita/UPDATE/DELETE para autenticados com qualquer membership ativa, sem filtro por tenant/entidade. |

**Achado:** A media-upload v2 chama getPublicUrl() para todos os buckets. Para private-documents (currículos) não há geração de createSignedUrl().

## 4. Item 3 - Tenant e DispatcherMaster (BLOQUEADO)

Análise da media-upload v2 implantada:

`	ypescript
const { data: membership, error: membershipError } =
  await userClient
    .from('tenant_memberships')
    .select('tenant_id')
    .eq('person_id', personId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

const tenantId = membership.tenant_id;
`

- Não recebe currentTenantId do frontend
- Não recebe contexto do DispatcherMaster
- Resolve pelo tenant da membership ativa mais recente
- Usa esse tenant para autorização, validação de entidade, inserção em media_assets e webhook
- **Quebra a continuidade de contexto exigida pelo CHECK BOULER 24H**

## 5. Item 4 - Schema e Relacionamentos

### Novas Evidências
- **Incompatibilidade purpose:** A função consulta e insere purpose em media_assets, mas não existe coluna purpose no schema remoto. A finalidade é gravada em metadata. Isso afeta deduplicação e lógica de primário.
- **Incompatibilidade entity_type:** Função aceita partner, supplier, person. Constraint media_assets_entity_type_check aceita apenas service, company, job, log_post, page, vatar, document, candidate_document, employee_document.
- **FKs:** jobs.company_id ? companies.id confirmado. jobs.company_relationship_id existe sem FK identificada.
- **Dados:** media_assets e storage.objects vazios no momento da consulta.

## 6. Item 5 - RLS
- RLS habilitado em media_assets (ls_enabled=true, ls_forced=false)
- media_assets_tenant_read: USING (is_tenant_member(tenant_id)) - abrangente, sem distinção entre público/privado
- Leitura de metadados por qualquer membro ativo do tenant expõe ucket_id, storage_path, ile_url, ile_name, entity_type, entity_id, uploaded_by, metadata

## 7. Inventário Edge Functions Remotas
| Função | Versão | Status |
| :-- | :-- | :-- |
| media-upload | 2 | Ativa |
| loop-doc-check | 4 | Ativa |
| turnstile-siteverify | 6 | Ativa |

Não foi encontrada media-admin na listagem remota.

## 8. Auditoria RLS ? public.media_assets (2026-10-31)
Evidências via `pg_policies`:

| Policy | Permissive | Roles | Cmd | Condição |
| :-- | :-- | :-- | :-- | :-- |
| media_assets_public_published_service_read | PERMISSIVE | {anon,authenticated} | SELECT | entity_type='service' AND EXISTS(services s JOIN tenants t ON s.tenant_id=t.id) WHERE s.id=entity_id AND s.tenant_id=media_assets.tenant_id AND s.status='published' AND t.slug='js-empregos' AND t.status='active' |
| media_assets_tenant_read | PERMISSIVE | {public} | SELECT | is_tenant_member(tenant_id) AND (entity_type <> ALL (ARRAY['document'::text,'candidate_document'::text,'employee_document'::text])) |
| media_assets_tenant_insert | PERMISSIVE | {public} | INSERT | WITH CHECK is_tenant_member(tenant_id) AND uploaded_by=current_person_id() |
| media_assets_tenant_update | PERMISSIVE | {public} | UPDATE | is_tenant_member(tenant_id) AND uploaded_by=current_person_id() |
| media_assets_tenant_delete | PERMISSIVE | {public} | DELETE | is_tenant_member(tenant_id) AND uploaded_by=current_person_id() |

**Conclusão:** media_assets_tenant_read exclui os três tipos de documentos. A única outra policy SELECT permissiva restringe-se a service publicado. Combinação por OR não reabre acesso aos documentos excluídos. Não foi identificada exposição de metadados dos três tipos via policies apresentadas.

## 9. Decisão e Recomendação

**Fase 1: NÃO APROVADA - BLOQUEADA**

**Bloqueadores:**
| Bloqueador | Estado |
| :-- | :-- |
| Leitura de metadados privados via RLS | VALIDADO |
| Continuidade do tenant pelo DispatcherMaster | PENDENTE |
| Entrega privada por signed URL | PENDENTE DE VALIDAÇÃO PRÁTICA |
| Origem e integridade de current_person_id() | PENDENTE |
| Reconciliação das 40 migrações remotas sem arquivo correspondente em main | PENDENTE |

**Próxima sequência:**
1. Preservar evidência RLS nesta matriz (feito).
2. Recuperar histórico remoto: priorizar migrações de storage privado e hardening 14/10 e 26/10.
3. Fechar continuidade de identidade/tenant: comprovar validação backend sem seleção silenciosa por tenantIds[0] ou membership mais recente.
4. Validar entrega privada: fluxo de autorização, geração, expiração e renovação de signed URLs sem exposição pública.

**Restrições mantidas:** Somente leitura. Sem migrations, alterações de dados, políticas, deploy ou redeploy da Edge Function. Não iniciar contratos TypeScript, MediaPicker ou implementação da célula antes do fechamento dos bloqueadores e aprovação formal da Fase 1.
