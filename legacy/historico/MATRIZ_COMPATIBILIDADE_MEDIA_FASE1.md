# MATRIZ DE COMPATIBILIDADE - C�LULA MEDIA FASE 1

**Documento:** MATRIZ_COMPATIBILIDADE_MEDIA_FASE1.md  
**Vers�o:** 1.1  
**Fase:** 1 - Elabora��o e Auditoria de Compatibilidade  
**Branch de Refer�ncia:** main  
**Arquitetura:** CHECK BOULER 24H  
**Estado:** **N�O APROVADA** - M�ltiplos bloqueadores e riscos de seguran�a pendentes

---

## 1. Resumo Executivo

Auditoria com consultas diretas ao banco remoto e inspe��o integral da Edge Function media-upload v2 implantada. Foram confirmados novos bloqueadores, incluindo incompatibilidade entre fun��o e schema (purpose), aus�ncia de fluxo de URL assinada e ruptura da continuidade de contexto com o DispatcherMaster.

## 2. Status por Item

| Item | Descri��o                       | Status                                   | Observa��o                                                                                                                                                                             |
| :--- | :------------------------------ | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Storage e privacidade           | PENDENTE DE APROVA��O                    | Aus�ncia de fluxo de URL assinada para private-documents. services-images sem isolamento por tenant/entidade.                                                                          |
| 2    | RPCs e privil�gios / identidade | ABERTO                                   | Origem de pp.current_person_id() n�o comprovada.                                                                                                                                       |
| 3    | Tenant e DispatcherMaster       | BLOQUEADO                                | media-upload resolve pela membership mais recente (created_at DESC), sem receber tenant selecionado ou contexto do DispatcherMaster.                                                   |
| 4    | Schema e relacionamentos        | PARCIALMENTE CONCLU�DO                   | jobs.company_id ? companies.id confirmado. Incompatibilidade entity_type e nova incompatibilidade com coluna purpose. jobs.company_relationship_id sem FK identificada.                |
| 5    | RLS em media_assets             | VALIDADO (leitura de metadados privados) | media_assets_tenant_read exclui document, candidate_document e employee_document. �nica outra SELECT permissiva restrita a service publicado. Sem exposi��o identificada via policies. |
| 6    | MediaPicker e consumidores      | N�O INICIADO                             | Aguardando libera��o.                                                                                                                                                                  |
| 7    | Resili�ncia entre c�lulas       | N�O INICIADO                             | Aguardando libera��o.                                                                                                                                                                  |

## 3. Item 1 - Storage e Privacidade

### Buckets Remotos

| Bucket            | P�blico | Limite | Observa��o                                                                                                              |
| :---------------- | :------ | :----- | :---------------------------------------------------------------------------------------------------------------------- |
| vatars            | Sim     | 5 MB   | Leitura p�blica. Escrita restrita � pasta uth.uid().                                                                    |
| public-media      | Sim     | 10 MB  | Leitura p�blica. Escrita/UPDATE/DELETE restritos a service_role.                                                        |
| private-documents | N�o     | 20 MB  | **Sem policy pr�pria em storage.objects**. Usa getPublicUrl() na fun��o implantada.                                     |
| services-images   | Sim     | 5 MB   | Leitura p�blica. Escrita/UPDATE/DELETE para autenticados com qualquer membership ativa, sem filtro por tenant/entidade. |

**Achado:** A media-upload v2 chama getPublicUrl() para todos os buckets. Para private-documents (curr�culos) n�o h� gera��o de createSignedUrl().

## 4. Item 3 - Tenant e DispatcherMaster (BLOQUEADO)

An�lise da media-upload v2 implantada:

` ypescript
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

- N�o recebe currentTenantId do frontend
- N�o recebe contexto do DispatcherMaster
- Resolve pelo tenant da membership ativa mais recente
- Usa esse tenant para autoriza��o, valida��o de entidade, inser��o em media_assets e webhook
- **Quebra a continuidade de contexto exigida pelo CHECK BOULER 24H**

## 5. Item 4 - Schema e Relacionamentos

### Novas Evid�ncias

- **Incompatibilidade purpose:** A fun��o consulta e insere purpose em media_assets, mas n�o existe coluna purpose no schema remoto. A finalidade � gravada em metadata. Isso afeta deduplica��o e l�gica de prim�rio.
- **Incompatibilidade entity_type:** Fun��o aceita partner, supplier, person. Constraint media_assets_entity_type_check aceita apenas service, company, job, log_post, page, vatar, document, candidate_document, employee_document.
- **FKs:** jobs.company_id ? companies.id confirmado. jobs.company_relationship_id existe sem FK identificada.
- **Dados:** media_assets e storage.objects vazios no momento da consulta.

## 6. Item 5 - RLS

- RLS habilitado em media_assets (
  ls_enabled=true,
  ls_forced=false)
- media_assets_tenant_read: USING (is_tenant_member(tenant_id)) - abrangente, sem distin��o entre p�blico/privado
- Leitura de metadados por qualquer membro ativo do tenant exp�e ucket_id, storage_path, ile_url, ile_name, entity_type, entity_id, uploaded_by, metadata

## 7. Invent�rio Edge Functions Remotas

| Fun��o               | Vers�o | Status |
| :------------------- | :----- | :----- |
| media-upload         | 2      | Ativa  |
| loop-doc-check       | 4      | Ativa  |
| turnstile-siteverify | 6      | Ativa  |

N�o foi encontrada media-admin na listagem remota.

## 8. Auditoria RLS ? public.media_assets (2026-10-31)

Evid�ncias via `pg_policies`:

| Policy                                     | Permissive | Roles                | Cmd    | Condi��o                                                                                                                                                                                                            |
| :----------------------------------------- | :--------- | :------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| media_assets_public_published_service_read | PERMISSIVE | {anon,authenticated} | SELECT | entity_type='service' AND EXISTS(services s JOIN tenants t ON s.tenant_id=t.id) WHERE s.id=entity_id AND s.tenant_id=media_assets.tenant_id AND s.status='published' AND t.slug='js-empregos' AND t.status='active' |
| media_assets_tenant_read                   | PERMISSIVE | {public}             | SELECT | is_tenant_member(tenant_id) AND (entity_type <> ALL (ARRAY['document'::text,'candidate_document'::text,'employee_document'::text]))                                                                                 |
| media_assets_tenant_insert                 | PERMISSIVE | {public}             | INSERT | WITH CHECK is_tenant_member(tenant_id) AND uploaded_by=current_person_id()                                                                                                                                          |
| media_assets_tenant_update                 | PERMISSIVE | {public}             | UPDATE | is_tenant_member(tenant_id) AND uploaded_by=current_person_id()                                                                                                                                                     |
| media_assets_tenant_delete                 | PERMISSIVE | {public}             | DELETE | is_tenant_member(tenant_id) AND uploaded_by=current_person_id()                                                                                                                                                     |

**Conclus�o:** media_assets_tenant_read exclui os tr�s tipos de documentos. A �nica outra policy SELECT permissiva restringe-se a service publicado. Combina��o por OR n�o reabre acesso aos documentos exclu�dos. N�o foi identificada exposi��o de metadados dos tr�s tipos via policies apresentadas.

## 9. Decis�o e Recomenda��o

**Fase 1: N�O APROVADA - BLOQUEADA**

**Bloqueadores:**

| Bloqueador                                                                | Estado                        |
| :------------------------------------------------------------------------ | :---------------------------- |
| Leitura de metadados privados via RLS                                     | VALIDADO                      |
| Continuidade do tenant pelo DispatcherMaster                              | PENDENTE                      |
| Entrega privada por signed URL                                            | PENDENTE DE VALIDA��O PR�TICA |
| Origem e integridade de current_person_id()                               | PENDENTE                      |
| Reconcilia��o das 40 migra��es remotas sem arquivo correspondente em main | PENDENTE                      |

**Pr�xima sequ�ncia:**

1. Preservar evid�ncia RLS nesta matriz (feito).
2. Recuperar hist�rico remoto: priorizar migra��es de storage privado e hardening 14/10 e 26/10.
3. Fechar continuidade de identidade/tenant: comprovar valida��o backend sem sele��o silenciosa por tenantIds[0] ou membership mais recente.
4. Validar entrega privada: fluxo de autoriza��o, gera��o, expira��o e renova��o de signed URLs sem exposi��o p�blica.

**Restri��es mantidas:** Somente leitura. Sem migrations, altera��es de dados, pol�ticas, deploy ou redeploy da Edge Function. N�o iniciar contratos TypeScript, MediaPicker ou implementa��o da c�lula antes do fechamento dos bloqueadores e aprova��o formal da Fase 1.
