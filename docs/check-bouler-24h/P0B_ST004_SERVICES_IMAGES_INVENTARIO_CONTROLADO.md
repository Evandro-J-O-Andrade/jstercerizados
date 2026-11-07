# P0-B / ST-004 — Inventário controlado `services-images` (artefato único, read-only)

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H) / Supabase `js-empregos` (`okxqfyoqbhcmflpurfrw`)  
**Data:** 2026-11-06 | **Baseline:** `main@b9de729`  
**Escopo:** inventário **somente de metadados/caminhos/policies/refs** do bucket `services-images` para subsidiar a decisão de `SELECT` público (ST-004). **Nenhuma consulta executada** nesta preparação. **Nenhuma alteração** remota/Supabase, migration, código, commit, push ou deploy.  
**Princípio de minimização:** **não baixar, renderizar, copiar nem expor conteúdo** de objetos. Exportar apenas metadados necessários (path, owner, timestamps, mimetype/size quando presentes em metadata, contagem, refs). Qualquer objeto **potencialmente sensível, ambíguo ou não classificável** deve ser tratado como **privado/restrito até classificação formal**.

## 1. Estado P0-B (entrada)

| Item                               | Estado                                            |
| ---------------------------------- | ------------------------------------------------- |
| I/U/D `authenticated` cross-tenant | Correção preparada em draft (não aplicada)        |
| `SELECT` público                   | **Não aprovado**; depende de inventário + decisão |
| ST-003                             | Aguardando validação controlada autorizada        |
| ST-004                             | **PENDENTE** — inventário e decisão               |
| ST-006                             | Aguardando captura estado atual                   |
| Migration versionada               | Não criada                                        |

## 2. Consultas read-only (executar **somente** com autorização explícita)

> Usar conta/ambiente autorizado; registrar data/hora, executor, projeto, total retornado, filtros e hash/ID do resultado. Limitar colunas; evitar `select *` em tabelas sensíveis fora do escopo.

### Q1 — Bucket (ST-006 baseline)

```sql
select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
where id = 'services-images';
```

### Q2 — Policies `storage.objects` para o bucket (ST-006)

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'services_images%'
order by policyname;
```

### Q3 — Contagem total (sem conteúdo)

```sql
select count(*)::bigint as object_count
from storage.objects
where bucket_id = 'services-images';
```

### Q4 — Metadados/paginados (sem conteúdo)

```sql
-- Paginar por created_at/id; ajustar LIMIT/OFFSET ou cursor conforme volume.
select
  id,
  name,                  -- path
  bucket_id,
  owner,                 -- uuid (tratar como identificador; não expor além do necessário)
  created_at,
  updated_at,
  last_accessed_at,
  (metadata->>'mimetype') as mimetype,
  (metadata->>'size')::bigint as size_bytes,
  (metadata->>'eTag') as etag
from storage.objects
where bucket_id = 'services-images'
order by created_at desc, id desc
limit 500;
-- Repetir com offset/cursor até cobrir total (Q3). Registrar paginação.
```

### Q5 — Distribuição por tipo/tamanho/extensão inferida (agregado)

```sql
select
  coalesce(metadata->>'mimetype','unknown') as mimetype,
  count(*)::bigint as n,
  min((metadata->>'size')::bigint) as min_bytes,
  max((metadata->>'size')::bigint) as max_bytes,
  round(avg((metadata->>'size')::bigint)) as avg_bytes
from storage.objects
where bucket_id = 'services-images'
group by 1
order by n desc;
```

### Q6 — Padrões de path (prefixos) para detectar namespace/tenant/entidade

```sql
select split_part(name,'/',1) as prefix1,
       split_part(name,'/',2) as prefix2,
       count(*)::bigint as n
from storage.objects
where bucket_id = 'services-images'
group by 1,2
order by n desc
limit 200;
```

### Q7 — Referências em `services` (cruzamento; adaptar nomes se schema divergir)

```sql
-- Verificar existência/nomes reais das colunas antes de cruzar em produção.
select id, tenant_id, slug, card_image_url, hero_image_url, updated_at
from public.services
where coalesce(card_image_url,'') ilike '%services-images%'
   or coalesce(hero_image_url,'') ilike '%services-images%';
```

### Q8 — Referências em catálogo de mídia (se aplicável)

```sql
-- Executar somente se tabela/colunas existirem; confirmar schema.
select id, tenant_id, bucket_id, path, entity_type, entity_id, visibility, created_at
from public.media_assets
where bucket_id = 'services-images'
   or coalesce(path,'') ilike '%services-images%';
```

## 3. Critérios de classificação (por objeto/path)

| Classe                                | Critério                                                                                                                                                                                 | Tratamento para ST-004                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Público intencional**               | Mime imagem permitida; path/nome coerente com asset de serviço; **referenciado** por `services`/catálogo público aprovado; sem PII/sensível; tenant/uso compatível com exposição pública | Pode sustentar manter `SELECT` público **se** conjunto for exclusivamente desta classe e política de negócio confirmar |
| **Público provável (não confirmado)** | Imagem plausível de serviço, mas sem referência cruzada clara ou metadados incompletos                                                                                                   | **Não** sustenta decisão automática; tratar como **restrito até confirmar**                                            |
| **Privado/sensível**                  | Documento (pdf/doc), dado pessoal, nome/path sugerindo CPF/RG/contrato/comprovante, avatar/currículo/documento RH, ou qualquer sinal de PII/confidencial                                 | **Bloqueia** `SELECT` público amplo; manter restrito; plano de remediação/migração separada                            |
| **Órfão técnico**                     | Sem referência conhecida; não sensível aparente por metadados                                                                                                                            | Não autoriza exposição pública por omissão; classificar após revisão controlada                                        |
| **Indeterminado**                     | Metadados insuficientes, mime `unknown`, extensão ambígua, acesso/contexto incerto                                                                                                       | **Privado/restrito até classificação formal**                                                                          |

## 4. Cruzamento de referências (evidências exigidas)

1. Q3/Q4/Q5/Q6 + Q7/Q8: matriz `objeto/path` × `referenciado?` × `classe`.
2. Para refs encontradas em `services-images`: registrar se URL é Storage pública, path interno, ou legado; **não** abrir conteúdo.
3. Verificar consistência com achado local: imagens de serviço usam majoritariamente URLs estáticas/`card_image_url`/`hero_image_url` (baseline) — divergências são sinal de uso real do bucket.
4. Se `object_count=0`: registrar bucket vazio; ST-004 pode ser decidido como “sem objetos a expor”, mas ainda confirmar se bucket deve permanecer público e se I/U/D permanece bloqueado (fase 1).

## 5. Evidências a coletar (pacote mínimo)

- Saídas Q1–Q8 (CSV/JSON/MD), com paginação completa ou critério de amostragem documentado.
- Tabela de classificação por objeto (ou por padrão, se volume alto e homogêneo), com justificativa.
- Decisão proposta ST-004: manter `SELECT` público / restringir / restringir após migração, com riscos.
- Lista de objetos sensíveis/indeterminados: **apenas contagem/categorias/ações requeridas**, sem PII/conteúdo.
- Assinatura: executor, data/hora, autorização, ambiente.

## 6. Critério de decisão ST-004 (após inventário)

- **Aprovar `SELECT` público (fase 1):** somente se Q3=0 **ou** 100% dos objetos classificados como **Público intencional** com evidência de referência/uso público legítimo e nenhum sensível/indeterminado.
- **Não aprovar:** qualquer sensível, indeterminado não resolvido, documento não-imagem, PII potencial, ou falta de evidência de intencionalidade pública.
- **Decisão intermediária:** manter I/U/D bloqueado (fase 1) e restringir `SELECT`/migrar objetos após plano autorizado.

## 7. Limites

- Read-only; sem `service_role` para bypass exceto se explicitamente autorizado para inventário administrativo, e ainda assim sem download de conteúdo.
- Não alterar policies/buckets/dados. Não criar migration. Migration versionada P0-B continua condicionada à decisão explícita sobre `SELECT`.
- Respeitar LGPD/minimização: metadados mínimos, acesso controlado, descarte seguro de exports temporários.

**Próxima ação autorizável:** executar Q1–Q8 em ambiente controlado (read-only) e produzir o relatório de inventário com classificação. **Aguardando autorização explícita para executar consultas.**
