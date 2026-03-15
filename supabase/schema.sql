-- ============================================================
-- NarrateAML — Supabase PostgreSQL Schema
-- Run this against your Supabase project SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: get_current_user_id()
-- Reads Clerk JWT sub claim from request context
-- Set via: SET request.jwt.claims = '{"sub":"user_xxx"}'
-- ============================================================
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_id text;
BEGIN
  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
    user_id := claims->>'sub';
  EXCEPTION WHEN OTHERS THEN
    user_id := NULL;
  END;
  RETURN user_id;
END;
$$;

-- ============================================================
-- HELPER: update_updated_at() — reused trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLE: users
-- Synced from Clerk on first sign-in
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id             TEXT UNIQUE NOT NULL,
  email                     TEXT NOT NULL,
  full_name                 TEXT,
  role                      TEXT,
  institution_name          TEXT,
  institution_type          TEXT,
  plan                      TEXT NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free', 'pro', 'team', 'lifetime')),
  billing_status            TEXT DEFAULT 'active'
                              CHECK (billing_status IN ('active', 'past_due', 'canceled', 'trialing')),
  narratives_used_this_month INT NOT NULL DEFAULT 0,
  monthly_limit             INT NOT NULL DEFAULT 3,
  reset_date                TIMESTAMPTZ,
  onboarding_completed      BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_role           TEXT,
  onboarding_institution_type TEXT,
  onboarding_str_volume     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (clerk_user_id = get_current_user_id());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (clerk_user_id = get_current_user_id());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (clerk_user_id = get_current_user_id());

-- ============================================================
-- TABLE: narratives
-- ============================================================
CREATE TABLE IF NOT EXISTS public.narratives (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title                       TEXT,
  subject_name                TEXT,
  subject_type                TEXT,
  transaction_type            TEXT,
  transaction_amount          NUMERIC(14, 2),
  transaction_currency        TEXT NOT NULL DEFAULT 'CAD',
  reporting_period_start      DATE,
  reporting_period_end        DATE,
  form_data                   JSONB,
  narrative_text              TEXT,
  word_count                  INT,
  estimated_time_saved_minutes INT NOT NULL DEFAULT 45,
  readiness_status            TEXT NOT NULL DEFAULT 'draft'
                                CHECK (readiness_status IN ('draft', 'edited', 'exported', 'archived')),
  revision_notes              TEXT,
  is_deleted                  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER narratives_updated_at
  BEFORE UPDATE ON public.narratives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_narratives_user_created
  ON public.narratives(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_narratives_user_subject
  ON public.narratives(user_id, subject_name);

CREATE INDEX IF NOT EXISTS idx_narratives_user_type
  ON public.narratives(user_id, transaction_type);

CREATE INDEX IF NOT EXISTS idx_narratives_user_active
  ON public.narratives(user_id, is_deleted, created_at DESC);

ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "narratives_select_own" ON public.narratives
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "narratives_insert_own" ON public.narratives
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "narratives_update_own" ON public.narratives
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "narratives_delete_own" ON public.narratives
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  form_data   JSONB NOT NULL DEFAULT '{}',
  is_shared   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_templates_user_created
  ON public.templates(user_id, created_at DESC);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select_own" ON public.templates
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
    OR (
      is_shared = TRUE
      AND user_id IN (
        SELECT tm.team_owner_user_id
        FROM public.team_memberships tm
        JOIN public.users u ON u.id = tm.member_user_id
        WHERE u.clerk_user_id = get_current_user_id()
      )
    )
  );

CREATE POLICY "templates_insert_own" ON public.templates
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "templates_update_own" ON public.templates
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "templates_delete_own" ON public.templates
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: usage_log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL
               CHECK (action IN ('generate', 'export_docx', 'export_pdf', 'template_save')),
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_log_user_created
  ON public.usage_log(user_id, created_at DESC);

ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_log_select_own" ON public.usage_log
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "usage_log_insert_own" ON public.usage_log
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: team_memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_memberships (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_owner_user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role                TEXT NOT NULL DEFAULT 'member'
                        CHECK (role IN ('owner', 'admin', 'member')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_owner_user_id, member_user_id)
);

ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_memberships_select_own" ON public.team_memberships
  FOR SELECT USING (
    team_owner_user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
    OR member_user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "team_memberships_insert_own" ON public.team_memberships
  FOR INSERT WITH CHECK (
    team_owner_user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "team_memberships_delete_own" ON public.team_memberships
  FOR DELETE USING (
    team_owner_user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  status                  TEXT,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions(stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  entity_type  TEXT,
  entity_id    UUID,
  action       TEXT NOT NULL,
  before_data  JSONB,
  after_data   JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- TABLE: notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  usage_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
  billing_alerts  BOOLEAN NOT NULL DEFAULT TRUE,
  product_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_select_own" ON public.notification_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = get_current_user_id()
    )
  );

-- ============================================================
-- FUNCTION: reset_monthly_usage()
-- Run via pg_cron on the 1st of each month, or via API cron job
-- ============================================================
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET
    narratives_used_this_month = 0,
    reset_date = NOW(),
    updated_at = NOW()
  WHERE plan = 'free';

  -- Log the reset
  INSERT INTO public.audit_logs (entity_type, action, after_data)
  VALUES (
    'system',
    'monthly_usage_reset',
    jsonb_build_object('reset_at', NOW(), 'affected_plan', 'free')
  );
END;
$$;

-- ============================================================
-- FUNCTION: get_user_usage_stats(p_user_id UUID)
-- Returns aggregated usage stats for dashboard
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id UUID)
RETURNS TABLE (
  total_narratives  BIGINT,
  total_exports     BIGINT,
  hours_saved       NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.narratives
     WHERE user_id = p_user_id AND is_deleted = FALSE) AS total_narratives,
    (SELECT COUNT(*) FROM public.usage_log
     WHERE user_id = p_user_id
       AND action IN ('export_docx', 'export_pdf')) AS total_exports,
    (SELECT COUNT(*) * 45.0 / 60.0
     FROM public.narratives
     WHERE user_id = p_user_id AND is_deleted = FALSE) AS hours_saved;
END;
$$;
