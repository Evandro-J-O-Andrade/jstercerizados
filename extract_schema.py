import json
with open('supabase-real-schema-core.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

t = data['tables']

for tn in ['people', 'tenants', 'tenant_memberships', 'tenant_settings', 'roles', 'role_assignments']:
    cols = t[tn]
    print(f'=== {tn} ({len(cols)} cols) ===')
    for c in cols:
        cn = c['column_name']
        dt = c['data_type']
        nb = c['is_nullable']
        cd = c.get('column_default', '')
        print(f'  {cn} | {dt} | nullable={nb} | default={cd}')
    print()

print('=== rowCounts ===')
for k in ['people', 'tenants', 'tenant_memberships', 'candidates', 'first_login_state', 'role_assignments', 'roles', 'companies']:
    if k in data.get('rowCounts', {}):
        print(f'  {k}: {data["rowCounts"][k]} rows')

print()
print('=== tenant_memberships sample ===')
for item in data.get('tenantMembershipsSample', [])[:5]:
    print(item)

print()
print('=== people sample ===')
for item in data.get('peopleSample', [])[:5]:
    print(item)

print()
print('=== role_assignments sample ===')
for item in data.get('roleAssignmentsSample', [])[:5]:
    print(item)

print()
print('=== companies in allTables? ===')
all_tables = data.get('allTables', [])
print('companies' in all_tables)
print([t for t in all_tables if 'comp' in t.lower()])
