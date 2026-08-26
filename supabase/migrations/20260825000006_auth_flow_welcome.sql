-- =============================================================================
-- POST-LOGIN FLOW — WELCOME TRACKING
-- =============================================================================
-- Purpose:
--   - Add welcome_completed_at to first_login_state to track whether the
--     user has passed through the post-login welcome screen.
--   - This supports the flow:
--       LOGIN → AUTH → TERMS → WELCOME → DASHBOARD

-- -----------------------------------------------------------------------------
-- 1. FIRST LOGIN STATE — WELCOME COLUMN
-- -----------------------------------------------------------------------------

alter table public.first_login_state
  add column if not exists welcome_completed_at timestamptz;

comment on column public.first_login_state.welcome_completed_at is
  'Timestamp when the user completed the post-login welcome screen.';
