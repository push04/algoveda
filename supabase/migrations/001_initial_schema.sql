-- ==========================================
-- ALGOVEDA DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create tables

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
  is_active BOOLEAN DEFAULT TRUE,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  features JSONB,
  max_backtests INTEGER DEFAULT 5,
  max_watchlists INTEGER DEFAULT 1,
  email_frequency_min INTEGER DEFAULT 1440,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','paused','cancelled','expired','halted')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  backtests_used_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlists
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL DEFAULT 'My Watchlist',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist Items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(watchlist_id, symbol)
);

-- Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  type TEXT DEFAULT 'paper' CHECK (type IN ('real','paper')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Holdings
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  quantity NUMERIC(12,4) NOT NULL,
  avg_cost NUMERIC(12,4) NOT NULL,
  bought_at TIMESTAMPTZ,
  UNIQUE(portfolio_id, symbol)
);

-- Backtest Jobs
CREATE TABLE IF NOT EXISTS public.backtest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  interval TEXT DEFAULT '1d',
  initial_capital NUMERIC(15,2) DEFAULT 100000,
  strategy_type TEXT,
  strategy_params JSONB,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
  progress INTEGER DEFAULT 0,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Backtest Results
CREATE TABLE IF NOT EXISTS public.backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE NOT NULL REFERENCES public.backtest_jobs(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  total_return_pct NUMERIC(10,4),
  cagr_pct NUMERIC(10,4),
  sharpe_ratio NUMERIC(8,4),
  sortino_ratio NUMERIC(8,4),
  calmar_ratio NUMERIC(8,4),
  max_drawdown_pct NUMERIC(8,4),
  win_rate_pct NUMERIC(8,4),
  total_trades INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  equity_curve JSONB,
  trades_log JSONB,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper Orders
CREATE TABLE IF NOT EXISTS public.paper_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id),
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  order_type TEXT CHECK (order_type IN ('MARKET','LIMIT','SL','SL-M')),
  side TEXT CHECK (side IN ('BUY','SELL')),
  quantity INTEGER NOT NULL,
  limit_price NUMERIC(12,4),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','EXECUTED','CANCELLED','REJECTED')),
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Alert Configs
CREATE TABLE IF NOT EXISTS public.alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  symbol TEXT,
  alert_type TEXT CHECK (alert_type IN ('price_above','price_below','percent_change','volume_spike','rsi_overbought','rsi_oversold')),
  threshold NUMERIC(12,4),
  is_active BOOLEAN DEFAULT TRUE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Preferences
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY REFERENCES public.profiles(id),
  digest_enabled BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT '4h' CHECK (digest_frequency IN ('1h','2h','3h','4h','6h','12h','24h')),
  include_nifty50 BOOLEAN DEFAULT TRUE,
  include_watchlist BOOLEAN DEFAULT TRUE,
  include_ai_picks BOOLEAN DEFAULT TRUE,
  include_news BOOLEAN DEFAULT TRUE,
  include_macro BOOLEAN DEFAULT TRUE
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users see own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own watchlist items" ON public.watchlist_items FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.watchlists WHERE id = watchlist_id));
CREATE POLICY "Users manage own portfolios" ON public.portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own holdings" ON public.portfolio_holdings FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id));
CREATE POLICY "Users manage own backtest jobs" ON public.backtest_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own backtest results" ON public.backtest_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own paper orders" ON public.paper_orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own alerts" ON public.alert_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own email prefs" ON public.email_preferences FOR ALL USING (auth.uid() = id);

-- 4. Seed default plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, features, max_backtests, max_watchlists)
VALUES 
  ('Explorer', 'explorer', 0, '{"backtests": 5, "screener": "basic"}', 5, 1),
  ('Researcher', 'researcher', 499, '{"backtests": 20, "screener": "full", "ai": true}', 20, 5),
  ('Pro Analyst', 'pro-analyst', 1499, '{"backtests": -1, "screener": "full", "ai": true, "portfolio": true}', -1, 10),
  ('Institution', 'institution', 4999, '{"backtests": -1, "api": true, "team": 5}', -1, 50)
ON CONFLICT (slug) DO NOTHING;

-- 5. Create trigger for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Watchlist', true);
  
  INSERT INTO public.portfolios (user_id, name, type)
  VALUES (NEW.id, 'Paper Portfolio', 'paper');
  
  INSERT INTO public.email_preferences (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();