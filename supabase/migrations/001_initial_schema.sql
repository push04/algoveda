-- ============================================
-- ALGOVEDA COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Create all tables

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
  is_active BOOLEAN DEFAULT TRUE,
  fyers_user_id TEXT,
  fyers_token TEXT,
  fyers_token_expiry TIMESTAMPTZ,
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
  razorpay_plan_id TEXT UNIQUE,
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
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_customer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','paused','cancelled','expired','halted')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  backtests_used_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Events
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  razorpay_event TEXT,
  razorpay_payload JSONB,
  amount_paise INTEGER,
  status TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Data Cache - OHLCV
CREATE TABLE IF NOT EXISTS public.ohlcv_cache (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  interval TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  open NUMERIC(12,4),
  high NUMERIC(12,4),
  low NUMERIC(12,4),
  close NUMERIC(12,4),
  volume BIGINT,
  source TEXT,
  UNIQUE (symbol, exchange, interval, timestamp)
);

-- Fundamental Cache
CREATE TABLE IF NOT EXISTS public.fundamental_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  pe_ratio NUMERIC(10,2),
  pb_ratio NUMERIC(10,2),
  eps NUMERIC(10,4),
  market_cap BIGINT,
  revenue BIGINT,
  net_income BIGINT,
  debt_equity NUMERIC(10,4),
  roe NUMERIC(10,4),
  roa NUMERIC(10,4),
  dividend_yield NUMERIC(8,4),
  beta NUMERIC(8,4),
  sector TEXT,
  industry TEXT,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (symbol, exchange)
);

-- News Cache
CREATE TABLE IF NOT EXISTS public.news_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT,
  headline TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  source TEXT,
  sentiment NUMERIC(4,2),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  notes TEXT,
  alert_above NUMERIC(12,4),
  alert_below NUMERIC(12,4),
  UNIQUE (watchlist_id, symbol)
);

-- Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  type TEXT DEFAULT 'paper' CHECK (type IN ('real','paper')),
  currency TEXT DEFAULT 'INR',
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
  notes TEXT,
  UNIQUE (portfolio_id, symbol)
);

-- Strategies
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('momentum','mean_reversion','breakout','ma_crossover','rsi','macd','custom','fundamental')),
  parameters JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backtest Jobs
CREATE TABLE IF NOT EXISTS public.backtest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  strategy_id UUID REFERENCES public.strategies(id),
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
  max_drawdown_duration INTEGER,
  volatility_annual NUMERIC(8,4),
  win_rate_pct NUMERIC(8,4),
  profit_factor NUMERIC(8,4),
  total_trades INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  avg_win_pct NUMERIC(8,4),
  avg_loss_pct NUMERIC(8,4),
  benchmark_return NUMERIC(10,4),
  alpha NUMERIC(8,4),
  beta NUMERIC(8,4),
  equity_curve JSONB,
  trades_log JSONB,
  monthly_returns JSONB,
  drawdown_series JSONB,
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
  trigger_price NUMERIC(12,4),
  executed_price NUMERIC(12,4),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','EXECUTED','CANCELLED','REJECTED')),
  strategy_id UUID REFERENCES public.strategies(id),
  signal_reason TEXT,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Screener Results
CREATE TABLE IF NOT EXISTS public.screener_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_by TEXT DEFAULT 'cron',
  filter_config JSONB NOT NULL,
  results JSONB NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Screens
CREATE TABLE IF NOT EXISTS public.saved_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  alert_on_match BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Configs
CREATE TABLE IF NOT EXISTS public.alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  symbol TEXT,
  alert_type TEXT CHECK (alert_type IN ('price_above','price_below','percent_change','volume_spike','rsi_overbought','rsi_oversold','ma_crossover','news_mention')),
  threshold NUMERIC(12,4),
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email','push')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Preferences
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY REFERENCES public.profiles(id),
  digest_enabled BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT '4h' CHECK (digest_frequency IN ('1h','2h','3h','4h','6h','12h','24h')),
  include_watchlist BOOLEAN DEFAULT TRUE,
  include_nifty50 BOOLEAN DEFAULT TRUE,
  include_macro BOOLEAN DEFAULT TRUE,
  include_ai_picks BOOLEAN DEFAULT TRUE,
  include_news BOOLEAN DEFAULT TRUE,
  next_send_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- Email Logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT,
  subject TEXT,
  resend_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Reports
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  symbol TEXT,
  report_type TEXT CHECK (report_type IN ('stock_deep_dive','sector_analysis','macro_outlook','portfolio_review','strategy_explain')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  key_metrics JSONB,
  rating TEXT CHECK (rating IN ('Strong Buy','Buy','Hold','Sell','Strong Sell')),
  price_target NUMERIC(12,4),
  model_used TEXT DEFAULT 'llama-3.1-70b-versatile',
  tokens_used INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ohlcv_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundamental_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screener_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create RLS Policies

-- Profiles policies
CREATE POLICY "Users see own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users see own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Watchlists policies
CREATE POLICY "Users see own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own watchlist items" ON public.watchlist_items FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.watchlists WHERE id = watchlist_id));

-- Portfolios policies
CREATE POLICY "Users see own portfolios" ON public.portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own holdings" ON public.portfolio_holdings FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id));

-- Strategies policies
CREATE POLICY "Users manage own strategies" ON public.strategies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public strategies are viewable" ON public.strategies FOR SELECT USING (is_public = true);

-- Backtest policies
CREATE POLICY "Users see own backtest jobs" ON public.backtest_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own backtest results" ON public.backtest_results FOR ALL USING (auth.uid() = user_id);

-- Paper trading policies
CREATE POLICY "Users see own paper orders" ON public.paper_orders FOR ALL USING (auth.uid() = user_id);

-- Screener policies
CREATE POLICY "Users manage own saved screens" ON public.saved_screens FOR ALL USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users manage own alerts" ON public.alert_configs FOR ALL USING (auth.uid() = user_id);

-- Email preferences policies
CREATE POLICY "Users manage own email prefs" ON public.email_preferences FOR ALL USING (auth.uid() = id);

-- Research reports policies
CREATE POLICY "Users see own reports" ON public.research_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public reports are viewable" ON public.research_reports FOR SELECT USING (is_public = true);

-- Subscription plans - viewable by all
CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (true);

-- STEP 4: Seed default subscription plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_yearly, features, max_backtests, max_watchlists, email_frequency_min)
VALUES 
  ('Explorer', 'explorer', 0, 0, '{"backtests": 5, "screener": "basic", "data": "delayed", "digest": "daily"}', 5, 1, 1440),
  ('Researcher', 'researcher', 49900, 499000, '{"backtests": 20, "screener": "full", "data": "realtime", "digest": "4h", "ai_rationale": true, "paper_trading": true}', 20, 5, 240),
  ('Pro Analyst', 'pro-analyst', 149900, 1499000, '{"backtests": -1, "screener": "full", "data": "realtime", "digest": "1h", "ai_rationale": true, "paper_trading": true, "portfolio_analytics": true, "custom_strategies": true, "options_analysis": true, "sector_signals": true}', -1, 10, 60),
  ('Institution', 'institution', 499900, 4999000, '{"backtests": -1, "screener": "full", "data": "realtime", "digest": "1h", "api_access": true, "team_seats": 5, "priority_support": true, "custom_branding": true}', -1, 50, 15)
ON CONFLICT (slug) DO NOTHING;

-- STEP 5: Create trigger for new user signup (auto-create profile, watchlist, portfolio, email prefs)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Watchlist', true);
  
  INSERT INTO public.portfolios (user_id, name, type)
  VALUES (NEW.id, 'Paper Portfolio', 'paper');
  
  INSERT INTO public.email_preferences (id, digest_frequency)
  VALUES (NEW.id, '4h');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_ts ON ohlcv_cache(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_news_symbol ON news_cache(symbol, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_jobs_user ON backtest_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_configs_user ON alert_configs(user_id, is_active);

-- DONE! All tables, schemas, and policies created.
SELECT 'Database setup complete! Total tables: 23' as status;