export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'analyst';
  is_admin: boolean;
  is_active: boolean;
  timezone: string;
  onboarding_done: boolean;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  razorpay_plan_id?: string;
  price_monthly: number;
  price_yearly?: number;
  features: Json;
  limits: Json;
  max_backtests: number;
  max_watchlists: number;
  email_frequency_min: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'expired' | 'halted';
  billing_cycle: 'monthly' | 'yearly';
  starts_at?: string;
  ends_at?: string;
  cancel_at_period_end: boolean;
  backtests_used_this_month: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  created_at: string;
  plan?: SubscriptionPlan;
}

export interface BacktestJob {
  id: string;
  user_id: string;
  strategy_id?: string;
  symbol: string;
  exchange: string;
  start_date: string;
  end_date: string;
  interval: string;
  initial_capital: number;
  strategy_type?: string;
  strategy_params?: Json;
  parameters?: Json;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  queued_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface BacktestResult {
  id: string;
  job_id: string;
  user_id: string;
  total_return_pct?: number;
  cagr_pct?: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
  calmar_ratio?: number;
  max_drawdown_pct?: number;
  max_drawdown_duration?: number;
  volatility_annual?: number;
  win_rate_pct?: number;
  profit_factor?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  avg_win_pct?: number;
  avg_loss_pct?: number;
  benchmark_return?: number;
  alpha?: number;
  beta?: number;
  equity_curve?: Json;
  trades_log?: Json;
  monthly_returns?: Json;
  drawdown_series?: Json;
  ai_analysis?: string;
  created_at: string;
  job?: BacktestJob;
}

/** Paper trading portfolio (DB table: portfolios) */
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  type: 'paper' | 'live';
  currency: string;
  initial_capital: number;
  current_cash: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaperOrder {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  exchange: string;
  order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  side: 'BUY' | 'SELL';
  quantity: number;
  limit_price?: number;
  trigger_price?: number;
  executed_price?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  placed_at: string;
  executed_at?: string;
}

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  symbol: string;
  exchange: string;
  quantity: number;
  avg_cost: number;
  bought_at?: string;
  notes?: string;
  current_price?: number;
  pnl?: number;
  pnl_pct?: number;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  symbols?: Json;
  created_at: string;
  updated_at?: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  exchange: string;
  added_at: string;
  notes?: string;
  alert_above?: number;
  alert_below?: number;
}

export interface AlertConfig {
  id: string;
  user_id: string;
  symbol?: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike' | 'rsi_overbought' | 'rsi_oversold' | 'ma_crossover' | 'news_mention';
  threshold?: number;
  is_active: boolean;
  last_triggered?: string;
  trigger_count: number;
  channel: 'email' | 'push';
  created_at: string;
}

export interface EmailPreferences {
  id: string;
  user_id?: string;
  digest_enabled: boolean;
  digest_frequency: '1h' | '2h' | '3h' | '4h' | '6h' | '12h' | '24h';
  include_watchlist: boolean;
  include_nifty50: boolean;
  include_macro: boolean;
  include_ai_picks: boolean;
  include_news: boolean;
  next_send_at?: string;
  last_sent_at?: string;
}

export interface ResearchReport {
  id: string;
  user_id?: string;
  symbol?: string;
  report_type: 'stock_deep_dive' | 'sector_analysis' | 'macro_outlook' | 'portfolio_review' | 'strategy_explain';
  title: string;
  content: string;
  key_metrics?: Json;
  rating?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  price_target?: number;
  model_used: string;
  tokens_used?: number;
  is_public: boolean;
  created_at: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type?: string;
  parameters: Json;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedScreen {
  id: string;
  user_id: string;
  name: string;
  filter_config: Json;
  alert_on_match: boolean;
  created_at: string;
}
