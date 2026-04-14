-- AlgoVeda: Subscription Plans & Payments Migration
-- Run this in Supabase SQL Editor

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. Add is_admin to profiles (if not already there)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'explorer';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. Subscription Plans table (admin manages)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS subscription_plans (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  price_monthly   INTEGER NOT NULL DEFAULT 0,  -- in paise (₹1 = 100 paise)
  price_yearly    INTEGER,
  features        JSONB   NOT NULL DEFAULT '[]',
  limits          JSONB   NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Seed default plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, limits, sort_order)
VALUES
  ('Explorer',       'explorer',    0,       0,
   '["5 Backtests/month","Basic Screener","Daily Digest","Delayed Data"]',
   '{"backtests_per_month":5,"screener_filters":3,"watchlists":1}',
   1),
  ('Researcher',     'researcher',  49900,   499000,
   '["20 Backtests/month","Full Screener","AI Rationale","4hr Digest","5 Watchlists"]',
   '{"backtests_per_month":20,"screener_filters":10,"watchlists":5}',
   2),
  ('Pro Analyst',    'pro',         149900,  1499000,
   '["Unlimited Backtests","Portfolio Analytics","1hr Digest","Priority Support","API Access","Advanced Greeks"]',
   '{"backtests_per_month":-1,"screener_filters":-1,"watchlists":20}',
   3),
  ('Institution',    'institution', 499900,  4999000,
   '["Everything in Pro","5 Team Seats","White-labeling","Dedicated Server","24/7 Concierge","SLA Guarantee"]',
   '{"backtests_per_month":-1,"screener_filters":-1,"watchlists":-1,"team_seats":5}',
   4)
ON CONFLICT (slug) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. User Subscriptions table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id               UUID    NOT NULL REFERENCES subscription_plans(id),
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  status                TEXT    NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','cancelled','expired','pending')),
  billing_cycle         TEXT    NOT NULL DEFAULT 'monthly'
                          CHECK (billing_cycle IN ('monthly','yearly')),
  starts_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON user_subscriptions (user_id, status);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. RLS Policies
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: public read, admin write
DROP POLICY IF EXISTS "plans_public_read" ON subscription_plans;
CREATE POLICY "plans_public_read" ON subscription_plans
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "plans_admin_all" ON subscription_plans;
CREATE POLICY "plans_admin_all" ON subscription_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Subscriptions: users see their own
DROP POLICY IF EXISTS "subs_own_read" ON user_subscriptions;
CREATE POLICY "subs_own_read" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "subs_admin_all" ON user_subscriptions;
CREATE POLICY "subs_admin_all" ON user_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. Make yourself admin (replace with your user UUID)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
