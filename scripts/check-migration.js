const fs = require('fs');
const s = fs.readFileSync('supabase/migrations/20260816001200_rls_consolidation.sql', 'utf8');
const issues = [];
if (/revoke default/g.test(s)) issues.push('revoke default invalid');
if (/actor_person_id/.test(s)) issues.push('actor_person_id legacy');
if (/tenant_membership_id/.test(s)) issues.push('tenant_membership_id legacy');
if (/uploaded_by/.test(s)) issues.push('uploaded_by non-existent');
if (/not in \('\d+'/.test(s)) issues.push('not in constraint invalid');
console.log(issues.length === 0 ? 'Audit 012: PASS (0 issues)' : 'Issues: ' + issues.join(', '));
