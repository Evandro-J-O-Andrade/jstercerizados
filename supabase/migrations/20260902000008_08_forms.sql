-- =============================================================================
-- 08 — FORMS (validate / normalize CNPJ / CPF)
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Funções reusáveis de validação de CNPJ/CPF
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Princípio: NÃO aplica retroativamente em colunas existentes.
--            Funções reusáveis em policies, triggers, validação no backend.
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.normalize_cnpj(text);
--   DROP FUNCTION IF EXISTS public.normalize_cpf(text);
--   DROP FUNCTION IF EXISTS public.is_valid_cnpj(text);
--   DROP FUNCTION IF EXISTS public.is_valid_cpf(text);
-- =============================================================================

BEGIN;

-- 8.1 — normalize_cnpj
CREATE OR REPLACE FUNCTION public.normalize_cnpj(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_value IS NULL OR btrim(p_value) = '' THEN NULL
    ELSE regexp_replace(p_value, '[^0-9]', '', 'g')
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_cnpj(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_cnpj(text) TO service_role;

-- 8.2 — normalize_cpf
CREATE OR REPLACE FUNCTION public.normalize_cpf(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_value IS NULL OR btrim(p_value) = '' THEN NULL
    ELSE regexp_replace(p_value, '[^0-9]', '', 'g')
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_cpf(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_cpf(text) TO service_role;

-- 8.3 — is_valid_cnpj (algoritmo dos DV)
CREATE OR REPLACE FUNCTION public.is_valid_cnpj(p_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_digits text;
  v_d1 int; v_d2 int; v_sum int; v_rest int; v_i int;
  v_weights1 int[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  v_weights2 int[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  v_digits := public.normalize_cnpj(p_value);
  IF v_digits IS NULL OR length(v_digits) <> 14 THEN
    RETURN false;
  END IF;
  IF v_digits ~ '^(.)\1{13}$' THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..12 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * v_weights1[v_i];
  END LOOP;
  v_rest := v_sum % 11;
  v_d1 := CASE WHEN v_rest < 2 THEN 0 ELSE 11 - v_rest END;
  IF v_d1 <> (substring(v_digits, 13, 1))::int THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..13 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * v_weights2[v_i];
  END LOOP;
  v_rest := v_sum % 11;
  v_d2 := CASE WHEN v_rest < 2 THEN 0 ELSE 11 - v_rest END;
  IF v_d2 <> (substring(v_digits, 14, 1))::int THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_cnpj(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cnpj(text) TO service_role;

-- 8.4 — is_valid_cpf (algoritmo dos DV)
CREATE OR REPLACE FUNCTION public.is_valid_cpf(p_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_digits text;
  v_d1 int; v_d2 int; v_sum int; v_rest int; v_i int;
BEGIN
  v_digits := public.normalize_cpf(p_value);
  IF v_digits IS NULL OR length(v_digits) <> 11 THEN
    RETURN false;
  END IF;
  IF v_digits ~ '^(.)\1{10}$' THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..9 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * (11 - v_i);
  END LOOP;
  v_rest := (v_sum * 10) % 11;
  v_d1 := CASE WHEN v_rest = 10 THEN 0 ELSE v_rest END;
  IF v_d1 <> (substring(v_digits, 10, 1))::int THEN
    RETURN false;
  END IF;

  v_sum := 0;
  FOR v_i IN 1..10 LOOP
    v_sum := v_sum + (substring(v_digits, v_i, 1))::int * (12 - v_i);
  END LOOP;
  v_rest := (v_sum * 10) % 11;
  v_d2 := CASE WHEN v_rest = 10 THEN 0 ELSE v_rest END;
  IF v_d2 <> (substring(v_digits, 11, 1))::int THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_cpf(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cpf(text) TO service_role;

COMMIT;
