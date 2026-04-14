-- ============================================================
-- AlgoVeda — Complete Database Schema
-- Run this on Supabase PostgreSQL to set up all tables
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  plan          TEXT NOT NULL DEFAULT 'explorer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBSCRIPTION PLANS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  razorpay_plan_id    TEXT,
  price_monthly       INTEGER NOT NULL DEFAULT 0,
  price_yearly        INTEGER,
  features            JSONB NOT NULL DEFAULT '[]',
  limits              JSONB NOT NULL DEFAULT '{}',
  max_backtests       INTEGER NOT NULL DEFAULT 5,
  max_watchlists      INTEGER NOT NULL DEFAULT 1,
  email_frequency_min INTEGER NOT NULL DEFAULT 1440,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USER SUBSCRIPTIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id                   UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','paused','cancelled','expired','halted')),
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  backtests_used_this_month INTEGER NOT NULL DEFAULT 0,
  razorpay_order_id         TEXT,
  razorpay_payment_id       TEXT,
  razorpay_subscription_id  TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BACKTEST JOBS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backtest_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  strategy_id     TEXT,
  symbol          TEXT NOT NULL,
  exchange        TEXT NOT NULL DEFAULT 'NSE',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  interval        TEXT NOT NULL DEFAULT '1d',
  initial_capital NUMERIC NOT NULL DEFAULT 100000,
  parameters      JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
  progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  error_message   TEXT,
  queued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

-- ─── BACKTEST RESULTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backtest_results (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                 UUID REFERENCES public.backtest_jobs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id                UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_return_pct       NUMERIC,
  cagr_pct               NUMERIC,
  sharpe_ratio           NUMERIC,
  sortino_ratio          NUMERIC,
  calmar_ratio           NUMERIC,
  max_drawdown_pct       NUMERIC,
  max_drawdown_duration  INTEGER,
  volatility_annual      NUMERIC,
  win_rate_pct           NUMERIC,
  profit_factor          NUMERIC,
  total_trades           INTEGER,
  winning_trades         INTEGER,
  losing_trades          INTEGER,
  avg_win_pct            NUMERIC,
  avg_loss_pct           NUMERIC,
  benchmark_return       NUMERIC,
  alpha                  NUMERIC,
  beta                   NUMERIC,
  equity_curve           JSONB,
  trades_log             JSONB,
  monthly_returns        JSONB,
  drawdown_series        JSONB,
  ai_analysis            TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAPER PORTFOLIOS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.paper_portfolios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL DEFAULT 'My Paper Portfolio',
  initial_capital NUMERIC NOT NULL DEFAULT 100000,
  current_cash    NUMERIC NOT NULL DEFAULT 100000,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAPER ORDERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.paper_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  portfolio_id   UUID REFERENCES public.paper_portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol         TEXT NOT NULL,
  exchange       TEXT NOT NULL DEFAULT 'NSE',
  order_type     TEXT NOT NULL DEFAULT 'MARKET' CHECK (order_type IN ('MARKET','LIMIT','SL','SL-M')),
  side           TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  limit_price    NUMERIC,
  trigger_price  NUMERIC,
  executed_price NUMERIC,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','EXECUTED','CANCELLED','REJECTED')),
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at    TIMESTAMPTZ
);

-- ─── PORTFOLIO HOLDINGS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.paper_portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol       TEXT NOT NULL,
  exchange     TEXT NOT NULL DEFAULT 'NSE',
  quantity     INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  avg_cost     NUMERIC NOT NULL DEFAULT 0,
  bought_at    TIMESTAMPTZ,
  notes        TEXT,
  UNIQUE (portfolio_id, symbol)
);

-- ─── WATCHLISTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.watchlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL DEFAULT 'My Watchlist',
  symbols    JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ALERT CONFIGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alert_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol        TEXT,
  alert_type    TEXT NOT NULL CHECK (alert_type IN ('price_above','price_below','percent_change','volume_spike','rsi_overbought','rsi_oversold','ma_crossover','news_mention')),
  threshold     NUMERIC,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  channel       TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','push')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMAIL PREFERENCES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  digest_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  digest_frequency  TEXT NOT NULL DEFAULT '6h' CHECK (digest_frequency IN ('1h','2h','3h','4h','6h','12h','24h')),
  include_watchlist BOOLEAN NOT NULL DEFAULT TRUE,
  include_nifty50   BOOLEAN NOT NULL DEFAULT TRUE,
  include_macro     BOOLEAN NOT NULL DEFAULT FALSE,
  include_ai_picks  BOOLEAN NOT NULL DEFAULT TRUE,
  include_news      BOOLEAN NOT NULL DEFAULT TRUE,
  next_send_at      TIMESTAMPTZ,
  last_sent_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RESEARCH REPORTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.research_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  symbol      TEXT,
  report_type TEXT NOT NULL DEFAULT 'stock_deep_dive' CHECK (report_type IN ('stock_deep_dive','sector_analysis','macro_outlook','portfolio_review','strategy_explain')),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  key_metrics JSONB,
  rating      TEXT CHECK (rating IN ('Strong Buy','Buy','Hold','Sell','Strong Sell')),
  price_target NUMERIC,
  model_used  TEXT NOT NULL DEFAULT 'llama3-70b-8192',
  tokens_used INTEGER,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_portfolios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports   ENABLE ROW LEVEL SECURITY;

-- subscription_plans: public read (no RLS needed)
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;

-- ─── PROFILE POLICIES ───────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── USER SUBSCRIPTION POLICIES ─────────────────────────────
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.user_subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.user_subscriptions;
CREATE POLICY "subscriptions_insert_own" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_update_own" ON public.user_subscriptions;
CREATE POLICY "subscriptions_update_own" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── BACKTEST JOB POLICIES ──────────────────────────────────
DROP POLICY IF EXISTS "backtest_jobs_all_own" ON public.backtest_jobs;
CREATE POLICY "backtest_jobs_all_own" ON public.backtest_jobs
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "backtest_results_all_own" ON public.backtest_results;
CREATE POLICY "backtest_results_all_own" ON public.backtest_results
  FOR ALL USING (auth.uid() = user_id);

-- ─── PAPER TRADING POLICIES ─────────────────────────────────
DROP POLICY IF EXISTS "paper_portfolios_all_own" ON public.paper_portfolios;
CREATE POLICY "paper_portfolios_all_own" ON public.paper_portfolios
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "paper_orders_all_own" ON public.paper_orders;
CREATE POLICY "paper_orders_all_own" ON public.paper_orders
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_holdings_all_own" ON public.portfolio_holdings;
CREATE POLICY "portfolio_holdings_all_own" ON public.portfolio_holdings
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM public.paper_portfolios WHERE user_id = auth.uid())
  );

-- ─── OTHER POLICIES ─────────────────────────────────────────
DROP POLICY IF EXISTS "watchlists_all_own" ON public.watchlists;
CREATE POLICY "watchlists_all_own" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_all_own" ON public.alert_configs;
CREATE POLICY "alerts_all_own" ON public.alert_configs
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "email_prefs_all_own" ON public.email_preferences;
CREATE POLICY "email_prefs_all_own" ON public.email_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "research_select_own_or_public" ON public.research_reports;
CREATE POLICY "research_select_own_or_public" ON public.research_reports
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "research_insert_own" ON public.research_reports;
CREATE POLICY "research_insert_own" ON public.research_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER set_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_portfolios_updated_at ON public.paper_portfolios;
CREATE TRIGGER set_portfolios_updated_at
  BEFORE UPDATE ON public.paper_portfolios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED DATA — Subscription Plans
-- ============================================================
INSERT INTO public.subscription_plans
  (name, slug, price_monthly, price_yearly, features, max_backtests, max_watchlists, email_frequency_min, is_active, sort_order)
VALUES
  (
    'Explorer', 'explorer', 0, 0,
    '["5 Backtests/month","Basic Stock Screener","Daily Email Digest","1 Watchlist","Community Access"]',
    5, 1, 1440, true, 0
  ),
  (
    'Researcher', 'researcher', 149900, 1499000,
    '["50 Backtests/month","Advanced Screener with Filters","6-hour Email Digest","5 Watchlists","AI Research (10/month)","Price & Volume Alerts","Paper Trading"]',
    50, 5, 360, true, 1
  ),
  (
    'Pro Analyst', 'pro', 399900, 3999000,
    '["Unlimited Backtests","Full Screener Access","1-hour Digest","Unlimited Watchlists","Unlimited AI Research","Smart Multi-condition Alerts","Paper Trading","Sector Deep-Dives","Priority Support"]',
    999, 99, 60, true, 2
  ),
  (
    'Institution', 'institution', 999900, 9999000,
    '["Everything in Pro","REST API Access","Custom Strategy Builder","Dedicated Account Manager","White-label Reports","Team Access (up to 5 seats)","SLA Guarantee","On-boarding Call"]',
    9999, 9999, 15, true, 3
  )
ON CONFLICT (slug) DO NOTHING;
