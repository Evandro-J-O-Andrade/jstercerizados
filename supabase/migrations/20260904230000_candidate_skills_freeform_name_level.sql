-- =============================================================================
-- GATE-DATA-04.014 — Align candidate_skills schema to free-form name/level
-- =============================================================================
-- Purpose:
--   - Decouple candidate_skills from the global skills catalog (skill_id FK)
--   - Store skill as free-form text (name) with a proficiency level
--   - Keep skill_id as nullable for backward-compatible joins
--   - Add updated_at trigger for audit consistency
--
-- Architecture:
--   - Existing rows: migrate proficiency -> level, skill_id -> nullable
--   - Existing rows: populate name from global skills table join
--   - New rows: name is required, level is the proficiency level
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add new columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  ADD COLUMN IF NOT EXISTS name varchar(150);

ALTER TABLE public.candidate_skills
  ADD COLUMN IF NOT EXISTS level varchar(20)
    CHECK (level IN ('basic', 'intermediate', 'advanced', 'expert'));

ALTER TABLE public.candidate_skills
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- -----------------------------------------------------------------------------
-- 2. Data migration: populate name + level from existing data
-- -----------------------------------------------------------------------------

UPDATE public.candidate_skills
SET
  name = COALESCE(
    candidate_skills.name,
    (SELECT s.name FROM public.skills s WHERE s.id = candidate_skills.skill_id)
  ),
  level = COALESCE(candidate_skills.level, candidate_skills.proficiency)
WHERE candidate_skills.proficiency IS NOT NULL
   OR candidate_skills.skill_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Enforce name NOT NULL
-- -----------------------------------------------------------------------------

-- If any rows still have NULL name (orphaned skill_id), set a fallback
UPDATE public.candidate_skills
SET name = 'Habilidade sem nome'
WHERE name IS NULL;

ALTER TABLE public.candidate_skills
  ALTER COLUMN name SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. Make skill_id nullable (no longer required)
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  ALTER COLUMN skill_id DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. Drop obsolete columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  DROP COLUMN IF EXISTS proficiency;

ALTER TABLE public.candidate_skills
  DROP COLUMN IF EXISTS years_experience;

ALTER TABLE public.candidate_skills
  DROP COLUMN IF EXISTS last_used_at;

-- -----------------------------------------------------------------------------
-- 6. Drop old unique constraint on (candidate_id, skill_id)
--    and old FK/index
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  DROP CONSTRAINT IF EXISTS candidate_skills_candidate_id_skill_id_unique;

ALTER TABLE public.candidate_skills
  DROP CONSTRAINT IF EXISTS candidate_skills_skill_id_fkey;

DROP INDEX IF EXISTS idx_candidate_skills_skill;

-- -----------------------------------------------------------------------------
-- 7. Add updated_at trigger
-- -----------------------------------------------------------------------------

CREATE TRIGGER update_candidate_skills_updated_at
  BEFORE UPDATE ON public.candidate_skills
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 8. Add index on name for candidate-side search
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_candidate_skills_name
  ON public.candidate_skills(name);

-- -----------------------------------------------------------------------------
-- 9. Update unique constraint to (candidate_id, name)
--    to prevent duplicate skills per candidate
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  ADD CONSTRAINT candidate_skills_candidate_id_name_unique
  UNIQUE (candidate_id, name);
