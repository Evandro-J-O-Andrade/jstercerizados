-- =============================================================================
-- GATE-DATA-04.013 — RLS: Candidate Self-Isolation Policies
-- =============================================================================
-- Purpose:
--   - Ensure candidates can only access their own data
--   - Maintain admin/RH access to all candidates via permissions
--   - Fix cross-candidate data leakage within same tenant
--
-- Strategy:
--   - Drop broad member policies
--   - Add self-isolation policies for candidate role
--   - Preserve admin/RH access via user_has_permission()
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Drop existing broad member policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS candidates_member_read ON public.candidates;
DROP POLICY IF EXISTS candidates_member_update ON public.candidates;
DROP POLICY IF EXISTS candidates_member_write ON public.candidates;

DROP POLICY IF EXISTS candidate_skills_member_read ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_member_update ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_member_write ON public.candidate_skills;

DROP POLICY IF EXISTS candidate_experiences_member_read ON public.candidate_experiences;
DROP POLICY IF EXISTS candidate_experiences_member_update ON public.candidate_experiences;
DROP POLICY IF EXISTS candidate_experiences_member_write ON public.candidate_experiences;

DROP POLICY IF EXISTS candidate_education_member_read ON public.candidate_education;
DROP POLICY IF EXISTS candidate_education_member_update ON public.candidate_education;
DROP POLICY IF EXISTS candidate_education_member_write ON public.candidate_education;

DROP POLICY IF EXISTS candidate_courses_member_read ON public.candidate_courses;
DROP POLICY IF EXISTS candidate_courses_member_update ON public.candidate_courses;
DROP POLICY IF EXISTS candidate_courses_member_write ON public.candidate_courses;

DROP POLICY IF EXISTS candidate_languages_member_read ON public.candidate_languages;
DROP POLICY IF EXISTS candidate_languages_member_update ON public.candidate_languages;
DROP POLICY IF EXISTS candidate_languages_member_write ON public.candidate_languages;

DROP POLICY IF EXISTS candidate_documents_member_read ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_member_update ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_member_write ON public.candidate_documents;

DROP POLICY IF EXISTS applications_member_read ON public.applications;
DROP POLICY IF EXISTS applications_member_update ON public.applications;
DROP POLICY IF EXISTS applications_member_write ON public.applications;

-- -----------------------------------------------------------------------------
-- 2. Self-isolation policies for candidates
--    (idempotent: DROP IF EXISTS before CREATE)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS candidates_self_read ON public.candidates;
DROP POLICY IF EXISTS candidates_self_update ON public.candidates;
DROP POLICY IF EXISTS candidates_self_insert ON public.candidates;
DROP POLICY IF EXISTS candidate_skills_self_read ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_self_update ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_self_insert ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_experiences_self_read ON public.candidate_experiences;
DROP POLICY IF EXISTS candidate_experiences_self_update ON public.candidate_experiences;
DROP POLICY IF EXISTS candidate_experiences_self_insert ON public.candidate_experiences;
DROP POLICY IF EXISTS candidate_education_self_read ON public.candidate_education;
DROP POLICY IF EXISTS candidate_education_self_update ON public.candidate_education;
DROP POLICY IF EXISTS candidate_education_self_insert ON public.candidate_education;
DROP POLICY IF EXISTS candidate_courses_self_read ON public.candidate_courses;
DROP POLICY IF EXISTS candidate_courses_self_update ON public.candidate_courses;
DROP POLICY IF EXISTS candidate_courses_self_insert ON public.candidate_courses;
DROP POLICY IF EXISTS candidate_languages_self_read ON public.candidate_languages;
DROP POLICY IF EXISTS candidate_languages_self_update ON public.candidate_languages;
DROP POLICY IF EXISTS candidate_languages_self_insert ON public.candidate_languages;
DROP POLICY IF EXISTS candidate_documents_self_read ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_self_update ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_self_insert ON public.candidate_documents;
DROP POLICY IF EXISTS applications_self_read ON public.applications;
DROP POLICY IF EXISTS applications_self_update ON public.applications;
DROP POLICY IF EXISTS applications_self_insert ON public.applications;

-- candidates
CREATE POLICY candidates_self_read ON public.candidates
  FOR SELECT
  USING (
    is_tenant_member(tenant_id)
    AND (
      person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
      OR user_has_permission(auth.uid(), 'candidates', 'read', tenant_id)
    )
  );

CREATE POLICY candidates_self_update ON public.candidates
  FOR UPDATE
  USING (
    is_tenant_member(tenant_id)
    AND (
      person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
      OR user_has_permission(auth.uid(), 'candidates', 'update', tenant_id)
    )
  )
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND (
      person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
      OR user_has_permission(auth.uid(), 'candidates', 'update', tenant_id)
    )
  );

CREATE POLICY candidates_self_insert ON public.candidates
  FOR INSERT
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND (
      person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
      OR user_has_permission(auth.uid(), 'candidates', 'create', tenant_id)
    )
  );

-- candidate_skills
CREATE POLICY candidate_skills_self_read ON public.candidate_skills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_skills_self_update ON public.candidate_skills
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_skills_self_insert ON public.candidate_skills
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- candidate_experiences
CREATE POLICY candidate_experiences_self_read ON public.candidate_experiences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_experiences.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_experiences_self_update ON public.candidate_experiences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_experiences.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_experiences.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_experiences_self_insert ON public.candidate_experiences
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_experiences.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- candidate_education
CREATE POLICY candidate_education_self_read ON public.candidate_education
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_education_self_update ON public.candidate_education
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_education_self_insert ON public.candidate_education
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- candidate_courses
CREATE POLICY candidate_courses_self_read ON public.candidate_courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_courses.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_courses_self_update ON public.candidate_courses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_courses.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_courses.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_courses_self_insert ON public.candidate_courses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_courses.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- candidate_languages
CREATE POLICY candidate_languages_self_read ON public.candidate_languages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_languages.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_languages_self_update ON public.candidate_languages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_languages.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_languages.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_languages_self_insert ON public.candidate_languages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_languages.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- candidate_documents
CREATE POLICY candidate_documents_self_read ON public.candidate_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_documents_self_update ON public.candidate_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY candidate_documents_self_insert ON public.candidate_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'candidates', 'create', c.tenant_id)
        )
    )
  );

-- applications
CREATE POLICY applications_self_read ON public.applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'applications', 'read', c.tenant_id)
        )
    )
  );

CREATE POLICY applications_self_update ON public.applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'applications', 'update', c.tenant_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'applications', 'update', c.tenant_id)
        )
    )
  );

CREATE POLICY applications_self_insert ON public.applications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND is_tenant_member(c.tenant_id)
        AND (
          c.person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
          OR user_has_permission(auth.uid(), 'applications', 'create', c.tenant_id)
        )
    )
  );
