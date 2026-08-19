-- ============================================================
-- DRY-RUN VALIDATION
-- ============================================================

\echo '=== Running Validation ==='
\i supabase/specs/sql/25_validation.sql
\echo '=== Validation Complete ==='

-- ============================================================
-- VALIDATION REPORT
-- ============================================================

\echo '=== Validation Report ==='
SELECT gate, suite, test_name, status, message
FROM public.validation_results
WHERE executed_at >= now() - interval '1 hour'
ORDER BY executed_at DESC, gate, suite, test_name;

\echo '=== Summary ==='
SELECT 
  count(*) as total,
  count(*) filter (where status = 'PASS') as pass,
  count(*) filter (where status = 'FAIL') as fail,
  count(*) filter (where status = 'ERROR') as error
FROM public.validation_results
WHERE executed_at >= now() - interval '1 hour';
