# Decisões de negócio pendentes — tenant_memberships
Revisão: 2026-10-17

1. **Hierarquia de papéis**
- Quem pode promover/rebaixar entre owner/admin/manager/recruiter/member?
- Proteção a owner (transferência vs rebaixamento)?
- tenant_admin pode atribuir owner?

2. **Domínio de status**
- Valores aceitos: active/inactive/pending? Outros?
- Transições permitidas (pending->active, active->inactive, etc.)
- Quem pode reativar?

3. **membership_role CHECK**
- Adiar criação: existentes = member, owner
- Incluir member no domínio temporário ou normalizar antes de restringir?

4. **Imutabilidade**
- left_at: deve ser mutável em desligamento? (não protegido)
- updated_at: mantido pelo trigger existente

5. **anon SELECT**
- Manter/revogar? Requer evidências logs Supabase
