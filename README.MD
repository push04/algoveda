# 🧠 AlgoVeda — AI-Powered Market Research & Trading Intelligence Platform

> **"Where Quantitative Rigor Meets Indian Market Intelligence"**

---

## 📛 Platform Name Candidates (Top 10)

| # | Name | Meaning / Why It Works |
|---|------|------------------------|
| 1 | **AlgoVeda** ⭐ | *Algo* (algorithmic) + *Veda* (ancient knowledge, Sanskrit) — wisdom meets quant |
| 2 | **QuantRishi** | *Quant* (quantitative analyst) + *Rishi* (sage/scholar) — scholarly market intelligence |
| 3 | **NiftyEdge** | *Nifty* (NSE's flagship index) + *Edge* (competitive advantage in trading) |
| 4 | **MarketSage** | A wise, experienced market advisor — clean, professional, globally recognized |
| 5 | **ProfitPulse** | Real-time heartbeat of the market delivering profits — energetic, memorable |
| 6 | **AlphaLens** | *Alpha* (excess returns above benchmark) + *Lens* (deep, focused research view) |
| 7 | **BullScript** | *Bull* (market optimism) + *Script* (code-driven strategies) — developer-first branding |
| 8 | **ZenithQuant** | *Zenith* (peak performance) + *Quant* — aspirational, premium positioning |
| 9 | **TradeMind** | Intelligent trading decisions powered by AI — simple, memorable, B2C friendly |
| 10 | **StockOracle** | AI-powered prediction and research engine — mystique + confidence |

> **Recommended: AlgoVeda** — unique, culturally resonant, memorable, `.com` friendly, and positions the product as authoritative knowledge for the Indian market.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Business Model & Monetization](#business-model--monetization)
3. [Tech Stack Deep Dive](#tech-stack-deep-dive)
4. [Free APIs & Open-Source Libraries](#free-apis--open-source-libraries)
5. [System Architecture](#system-architecture)
6. [Database Schema](#database-schema)
7. [Feature Breakdown](#feature-breakdown)
8. [Serverless Function Design](#serverless-function-design)
9. [Vercel Cron Jobs](#vercel-cron-jobs)
10. [Admin Panel](#admin-panel)
11. [Subscription & Payment System](#subscription--payment-system)
12. [Security & Best Practices](#security--best-practices)
13. [Folder Structure](#folder-structure)
14. [Environment Variables](#environment-variables)
15. [Deployment Guide](#deployment-guide)
16. [Roadmap](#roadmap)

---

## 🎯 Project Overview

**AlgoVeda** is a fully serverless, multi-tenant SaaS platform that empowers retail investors and traders in the Indian market with:

- **AI-Generated Market Research Reports** (backed by real data, not opinion)
- **Backtesting Engine** — proof that a strategy would have worked historically
- **Paper Trading Simulator** — risk-free strategy validation with live market prices
- **Stock Screener** — filter stocks by fundamentals + technicals with AI rationale
- **Real-Time Email Digests** — automated market updates every 3–4 hours
- **Portfolio Analytics** — holdings analysis with risk metrics and benchmarking
- **Strategy Builder** — visual, no-code strategy construction for non-developers
- **Subscription-Gated Access** — tiered plans via Razorpay for recurring revenue

The platform is designed for **market research and education**, not direct trading execution — meaning users gain insight, proof via backtests, and curated stock ideas, while maintaining full regulatory compliance in India.

---

## 💰 Business Model & Monetization

### Revenue Streams

| Stream | Description | Monthly Potential |
|--------|-------------|-------------------|
| **Subscription Plans** | Tiered access via Razorpay | ₹499 – ₹4,999/user/month |
| **Pay-Per-Report** | One-time deep research reports | ₹99 – ₹499/report |
| **Premium Signals** | High-conviction stock picks via email | Add-on ₹299/month |
| **API Access** | Developers access our screener/backtest APIs | ₹999/month |
| **White-Label** | License the platform to SEBI-registered RIAs | ₹15,000+/month |

### Subscription Tiers (Razorpay Plans)

```
┌─────────────────────────────────────────────────────────────┐
│  FREE TIER — ₹0/month                                        │
│  • 2 backtests/month                                         │
│  • 5 screener filters                                        │
│  • Daily email digest (1x/day)                               │
│  • 30-day historical data                                    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  RESEARCHER — ₹499/month                                     │
│  • 20 backtests/month                                        │
│  • Full screener (all filters)                               │
│  • Email digest every 4 hours                                │
│  • 5-year historical data                                    │
│  • AI stock rationale                                        │
│  • Paper trading simulator                                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  PRO ANALYST — ₹1,499/month                                  │
│  • Unlimited backtests                                       │
│  • All Researcher features                                   │
│  • Email digest every 1 hour                                 │
│  • 20-year historical data                                   │
│  • Portfolio risk analytics                                  │
│  • Custom strategy builder                                   │
│  • Options chain analysis                                    │
│  • Sector rotation signals                                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  INSTITUTION — ₹4,999/month                                  │
│  • All Pro features                                          │
│  • REST API access                                           │
│  • Team seats (up to 5 users)                                │
│  • Priority email support                                    │
│  • Custom report branding                                    │
│  • White-glove onboarding                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack Deep Dive

### Core Infrastructure

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | Next.js 14 (App Router) | UI, SSR, routing |
| **Backend** | Vercel Serverless Functions | API endpoints, business logic |
| **Database** | Supabase (PostgreSQL) | All persistent data storage |
| **Auth** | Supabase Auth | JWT-based, email/OAuth |
| **Realtime** | Supabase Realtime | Live dashboard updates |
| **Storage** | Supabase Storage | PDF reports, chart images |
| **AI Engine** | Groq Cloud API | LLM inference (stock commentary) |
| **Market Data** | Fyers API | NSE/BSE live data, history |
| **Payments** | Razorpay API | Subscriptions, one-time charges |
| **Email** | Resend (via Supabase) | Transactional + digest emails |
| **Scheduling** | Vercel Cron Jobs | Automated recurring tasks |
| **Cache** | Upstash Redis (free tier) | Rate limiting, short-lived cache |
| **Monitoring** | Vercel Analytics + Sentry | Errors, performance |

---

## 📡 Free APIs & Open-Source Libraries

### Market Data APIs (All Free Tiers)

| API | Free Limit | Best For | URL |
|-----|-----------|---------|-----|
| **Fyers API** | No monthly fee, ~10 req/sec | NSE/BSE live + historical, streaming | fyers.in/api |
| **Alpha Vantage** | 25 calls/day (free), 500/day ($50/mo) | Global OHLCV, fundamental data | alphavantage.co |
| **Yahoo Finance** (via `yahoo-finance2`) | Unlimited (unofficial) | Global prices, screener, options | npm: yahoo-finance2 |
| **Financial Modeling Prep (FMP)** | 250 calls/day | P/E, EPS, financials, DCF | financialmodelingprep.com |
| **Finnhub.io** | 60 calls/min | Real-time quotes, news, sentiment | finnhub.io |
| **EOD Historical Data** | 20 calls/day | 60+ exchanges EOD prices | eodhistoricaldata.com |
| **MarketStack** | 100 requests/mo | Intraday + EOD for 70+ exchanges | marketstack.com |
| **Stooq** | Unlimited (unofficial) | Polish + global historical CSVs | stooq.com |
| **FRED (Federal Reserve)** | Unlimited | Macro data (inflation, rates, GDP) | fred.stlouisfed.org/docs/api |
| **World Bank Open Data** | Unlimited | GDP, CPI, country-level macro | data.worldbank.org/developers |
| **NSE India (Official)** | Unlimited (scraping-based) | NSE indices, FII/DII, circuit filters | nseindia.com |
| **BSE India (Official)** | Unofficial scraping | BSE announcements, filings | bseindia.com |
| **RBI Data (DBIE)** | Unlimited | Interest rates, forex, monetary policy | dbie.rbi.org.in |
| **Open Exchange Rates** | 1,000 req/mo | USD/INR + 170 currencies | openexchangerates.org |
| **CoinGecko** | 30 calls/min (free) | Crypto prices (BTC, ETH sentiment) | coingecko.com/api |

### News & Sentiment APIs (Free Tiers)

| API | Free Limit | Best For |
|-----|-----------|---------|
| **NewsAPI.org** | 100 req/day | Financial news headlines |
| **GNews.io** | 100 req/day | Google News aggregation |
| **TheNewsAPI** | 100 req/day | Business news with sentiment |
| **Marketaux** | 100 req/day | Stock-specific news + sentiment score |
| **Stocknews API** | 50 req/day | US + Indian stock news |

### Open-Source Libraries

#### Backtesting & Strategy

```json
{
  "backtesting.py": "Simple Pythonic backtesting framework",
  "backtrader": "Feature-rich strategy backtesting with indicators",
  "vectorbt": "Ultra-fast vectorized backtesting (NumPy-based)",
  "zipline-reloaded": "Quantopian's backtester, reloaded for Python 3",
  "bt": "Flexible backtesting framework for Python",
  "nautilus_trader": "High-performance Rust core with Python API"
}
```

#### Technical Indicators (Node.js/TypeScript)

```json
{
  "trading-signals": "SMA, EMA, RSI, MACD, Bollinger Bands — TypeScript",
  "technicalindicators": "30+ indicators for Node.js",
  "tulind": "Node bindings for Tulip Indicators (C library)",
  "bfj": "Big streaming JSON for large data sets",
  "danfo.js": "Pandas-like DataFrame for Node.js"
}
```

#### Technical Indicators (Python for Vercel Python Functions)

```python
# requirements.txt
ta                    # Technical Analysis library (200+ indicators)
ta-lib                # TA-Lib Python wrapper
pandas-ta             # 130+ pandas-based indicators
finta                 # Financial Technical Analysis
pyti                  # Python Technical Indicators
stockstats            # Statistics/indicators for stock DataFrames
```

#### Quantitative Finance (Python)

```python
pyportfolioopt        # Portfolio optimization (MPT, Black-Litterman)
riskfolio-lib         # Advanced portfolio optimization
scipy                 # Statistical distributions, optimization
statsmodels           # Time series models (ARIMA, GARCH)
arch                  # ARCH/GARCH volatility modeling
hurst                 # Hurst exponent for mean-reversion detection
pykalman              # Kalman filter for pairs trading
empyrical             # Risk/return metrics (Sharpe, Sortino, Calmar)
```

#### Data Fetching & Processing (Node.js)

```json
{
  "yahoo-finance2": "Unofficial Yahoo Finance client for Node",
  "axios": "HTTP client for API calls",
  "cheerio": "Fast HTML parsing for scraping NSE/BSE",
  "puppeteer-core": "Headless browser for complex scraping",
  "csv-parse": "Streaming CSV parser for historical data",
  "mathjs": "Math expression evaluator for custom formulas",
  "ml-regression": "Linear/polynomial regression in Node.js",
  "simple-statistics": "Statistical functions (mean, std, correlation)"
}
```

#### Email & Notifications

```json
{
  "resend": "Modern email API (free 3,000 emails/mo)",
  "@sendgrid/mail": "SendGrid client (free 100 emails/day)",
  "nodemailer": "SMTP email sending",
  "react-email": "React-based beautiful email templates",
  "@react-email/components": "Pre-built email UI components"
}
```

#### UI & Frontend

```json
{
  "recharts": "Composable charting library for React",
  "lightweight-charts": "TradingView's chart library (open-source)",
  "chart.js": "Flexible charts with react-chartjs-2",
  "apexcharts": "Interactive charts including candlestick",
  "react-table": "Headless table for data grids",
  "@tanstack/react-query": "Server state management",
  "zustand": "Lightweight client state management",
  "tailwindcss": "Utility-first CSS framework",
  "shadcn/ui": "Accessible component library on Radix UI",
  "framer-motion": "Animations and transitions",
  "react-admin": "Admin panel framework with Supabase adapter"
}
```

#### Utilities

```json
{
  "date-fns": "Date manipulation",
  "zod": "Runtime schema validation",
  "lodash": "Utility functions",
  "p-limit": "Concurrency limiting for API calls",
  "p-retry": "Retry failed API calls with backoff",
  "ioredis": "Redis client for Upstash caching"
}
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER (Browser / Mobile)                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 App Router                          │   │
│  │   /app                  /app/admin          /app/api              │   │
│  │   (Public pages)        (React-Admin)       (API Routes)          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Serverless Fns  │  │   Python Fns     │  │    Edge Functions    │   │
│  │  (Node.js 20)    │  │  (backtesting)   │  │  (price triggers)    │   │
│  │  /api/*          │  │  /api/python/*   │  │  /api/edge/*         │   │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬───────────┘   │
│           │                    │                        │                │
│  ┌────────▼────────────────────▼────────────────────────▼──────────┐   │
│  │                    VERCEL CRON SCHEDULER                          │   │
│  │  • /api/cron/market-digest    (every 3 hours)                    │   │
│  │  • /api/cron/alert-check      (every 15 minutes)                 │   │
│  │  • /api/cron/fyers-refresh    (daily 8:00 AM IST)                │   │
│  │  • /api/cron/screener-run     (daily 6:00 AM IST)                │   │
│  │  • /api/cron/backtest-queue   (every 5 minutes)                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────────┐
         │                       │                           │
┌────────▼─────────┐  ┌─────────▼──────────┐  ┌────────────▼──────────┐
│  SUPABASE         │  │  EXTERNAL APIS      │  │  THIRD-PARTY SERVICES │
│                   │  │                     │  │                       │
│  • PostgreSQL DB  │  │  • Fyers API        │  │  • Razorpay           │
│  • Auth (JWT)     │  │  • Alpha Vantage    │  │  • Resend Email       │
│  • Realtime WS    │  │  • Yahoo Finance    │  │  • Groq AI            │
│  • Storage (PDFs) │  │  • FMP Financials   │  │  • Sentry             │
│  • Row-Level Sec  │  │  • Finnhub News     │  │  • Upstash Redis      │
│  • Edge Functions │  │  • FRED Macro       │  │  • PostHog Analytics  │
│  • Supabase       │  │  • NSE/BSE          │  │                       │
│    pg-vector      │  │  • CoinGecko Crypto │  │                       │
└───────────────────┘  └─────────────────────┘  └───────────────────────┘
```

### Data Flow: Market Digest Email

```
Vercel Cron (every 3h)
    │
    ▼
/api/cron/market-digest
    │
    ├─► Fetch Nifty 50 top movers (Fyers API)
    ├─► Fetch sector performance (Yahoo Finance)
    ├─► Fetch macro news headlines (Finnhub / Marketaux)
    ├─► Get user watchlists from Supabase
    ├─► Run Groq AI to generate 150-word commentary
    ├─► Render React Email template
    └─► Send via Resend API
            │
            ▼
        User's Inbox (personalized per subscription tier)
```

### Data Flow: Backtest Request

```
User clicks "Run Backtest"
    │
    ▼
POST /api/backtest
    │
    ├─► Validate user's subscription tier (Supabase RLS)
    ├─► Check quota: backtests_used < plan_limit
    ├─► Queue job in Supabase `backtest_jobs` table
    │
    ▼
Background pick-up (Vercel Cron every 5min OR immediate)
    │
    ├─► Fetch historical OHLCV from cache / Fyers / Yahoo
    ├─► Run strategy via Python function (vectorbt/backtrader)
    ├─► Compute metrics: CAGR, Sharpe, Max Drawdown, Win Rate
    ├─► Generate equity curve data (JSON)
    ├─► Ask Groq AI to write strategy analysis paragraph
    ├─► Save results to `backtest_results` table
    └─► Supabase Realtime notifies frontend → renders chart
```

---

## 🗄️ Database Schema

```sql
-- ==========================================
-- USERS & AUTH
-- ==========================================

-- Extends Supabase Auth users table
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  role            TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
  is_active       BOOLEAN DEFAULT TRUE,
  fyers_user_id   TEXT,                      -- Fyers linked account
  fyers_token     TEXT,                      -- Encrypted access token
  fyers_token_expiry TIMESTAMPTZ,
  timezone        TEXT DEFAULT 'Asia/Kolkata',
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SUBSCRIPTIONS
-- ==========================================

CREATE TABLE public.subscription_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,              -- 'Researcher', 'Pro Analyst'
  slug             TEXT UNIQUE NOT NULL,
  razorpay_plan_id TEXT UNIQUE,               -- Razorpay plan ID
  price_monthly    INTEGER NOT NULL,           -- in paise (₹499 = 49900)
  price_yearly     INTEGER,
  features         JSONB,                      -- Feature flags
  max_backtests    INTEGER DEFAULT 5,
  max_watchlists   INTEGER DEFAULT 1,
  email_frequency_min INTEGER DEFAULT 1440,    -- minutes between digests
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id),
  plan_id                 UUID NOT NULL REFERENCES public.subscription_plans(id),
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_customer_id     TEXT,
  status                  TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','active','paused','cancelled','expired','halted')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT FALSE,
  backtests_used_this_month INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id),
  subscription_id   UUID REFERENCES public.subscriptions(id),
  razorpay_event    TEXT,                     -- 'invoice.paid', 'payment.failed'
  razorpay_payload  JSONB,
  amount_paise      INTEGER,
  status            TEXT,
  processed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MARKET DATA CACHE
-- ==========================================

CREATE TABLE public.ohlcv_cache (
  id          BIGSERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL,
  exchange    TEXT NOT NULL DEFAULT 'NSE',
  interval    TEXT NOT NULL,                  -- '1d', '1h', '15m'
  timestamp   TIMESTAMPTZ NOT NULL,
  open        NUMERIC(12,4),
  high        NUMERIC(12,4),
  low         NUMERIC(12,4),
  close       NUMERIC(12,4),
  volume      BIGINT,
  source      TEXT,                           -- 'fyers', 'yahoo', 'alpha_vantage'
  UNIQUE (symbol, exchange, interval, timestamp)
);
CREATE INDEX idx_ohlcv_symbol_ts ON ohlcv_cache(symbol, timestamp DESC);

CREATE TABLE public.fundamental_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol        TEXT NOT NULL,
  exchange      TEXT NOT NULL DEFAULT 'NSE',
  pe_ratio      NUMERIC(10,2),
  pb_ratio      NUMERIC(10,2),
  eps           NUMERIC(10,4),
  market_cap    BIGINT,
  revenue       BIGINT,
  net_income    BIGINT,
  debt_equity   NUMERIC(10,4),
  roe           NUMERIC(10,4),
  roa           NUMERIC(10,4),
  dividend_yield NUMERIC(8,4),
  beta          NUMERIC(8,4),
  sector        TEXT,
  industry      TEXT,
  raw_data      JSONB,
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (symbol, exchange)
);

CREATE TABLE public.news_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol      TEXT,                           -- NULL means general market news
  headline    TEXT NOT NULL,
  summary     TEXT,
  url         TEXT,
  source      TEXT,
  sentiment   NUMERIC(4,2),                   -- -1 to +1
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_news_symbol ON news_cache(symbol, published_at DESC);

-- ==========================================
-- WATCHLISTS & PORTFOLIOS
-- ==========================================

CREATE TABLE public.watchlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  name        TEXT NOT NULL DEFAULT 'My Watchlist',
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.watchlist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol       TEXT NOT NULL,
  exchange     TEXT DEFAULT 'NSE',
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  notes        TEXT,
  alert_above  NUMERIC(12,4),
  alert_below  NUMERIC(12,4),
  UNIQUE (watchlist_id, symbol)
);

CREATE TABLE public.portfolios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  name        TEXT NOT NULL DEFAULT 'My Portfolio',
  type        TEXT DEFAULT 'real' CHECK (type IN ('real','paper')),
  currency    TEXT DEFAULT 'INR',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.portfolio_holdings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol       TEXT NOT NULL,
  exchange     TEXT DEFAULT 'NSE',
  quantity     NUMERIC(12,4) NOT NULL,
  avg_cost     NUMERIC(12,4) NOT NULL,
  bought_at    TIMESTAMPTZ,
  notes        TEXT,
  UNIQUE (portfolio_id, symbol)
);

-- ==========================================
-- BACKTESTING
-- ==========================================

CREATE TABLE public.strategies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  name          TEXT NOT NULL,
  description   TEXT,
  type          TEXT CHECK (type IN ('momentum','mean_reversion','breakout','ma_crossover',
                                      'rsi','macd','custom','fundamental')),
  parameters    JSONB NOT NULL,               -- Strategy-specific params
  is_public     BOOLEAN DEFAULT FALSE,        -- Community sharing
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.backtest_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  strategy_id     UUID REFERENCES public.strategies(id),
  symbol          TEXT NOT NULL,
  exchange        TEXT DEFAULT 'NSE',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  interval        TEXT DEFAULT '1d',
  initial_capital NUMERIC(15,2) DEFAULT 100000,
  status          TEXT DEFAULT 'queued'
    CHECK (status IN ('queued','running','completed','failed')),
  progress        INTEGER DEFAULT 0,
  queued_at       TIMESTAMPTZ DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_message   TEXT
);

CREATE TABLE public.backtest_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID UNIQUE NOT NULL REFERENCES public.backtest_jobs(id),
  user_id           UUID NOT NULL REFERENCES public.profiles(id),
  -- Performance Metrics
  total_return_pct  NUMERIC(10,4),
  cagr_pct          NUMERIC(10,4),
  sharpe_ratio      NUMERIC(8,4),
  sortino_ratio     NUMERIC(8,4),
  calmar_ratio      NUMERIC(8,4),
  max_drawdown_pct  NUMERIC(8,4),
  max_drawdown_duration INTEGER,             -- days
  volatility_annual NUMERIC(8,4),
  win_rate_pct      NUMERIC(8,4),
  profit_factor     NUMERIC(8,4),
  total_trades      INTEGER,
  winning_trades    INTEGER,
  losing_trades     INTEGER,
  avg_win_pct       NUMERIC(8,4),
  avg_loss_pct      NUMERIC(8,4),
  -- Benchmark
  benchmark_return  NUMERIC(10,4),           -- Nifty 50 return same period
  alpha             NUMERIC(8,4),
  beta              NUMERIC(8,4),
  -- Raw Data (stored as JSONB for large arrays)
  equity_curve      JSONB,                   -- [{date, value}, ...]
  trades_log        JSONB,                   -- [{date, action, price, qty}, ...]
  monthly_returns   JSONB,                   -- [[year, jan, feb, ...], ...]
  drawdown_series   JSONB,
  -- AI Analysis
  ai_analysis       TEXT,                    -- Groq-generated commentary
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PAPER TRADING
-- ==========================================

CREATE TABLE public.paper_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  portfolio_id    UUID NOT NULL REFERENCES public.portfolios(id),
  symbol          TEXT NOT NULL,
  exchange        TEXT DEFAULT 'NSE',
  order_type      TEXT CHECK (order_type IN ('MARKET','LIMIT','SL','SL-M')),
  side            TEXT CHECK (side IN ('BUY','SELL')),
  quantity        INTEGER NOT NULL,
  limit_price     NUMERIC(12,4),
  trigger_price   NUMERIC(12,4),
  executed_price  NUMERIC(12,4),
  status          TEXT DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','EXECUTED','CANCELLED','REJECTED')),
  strategy_id     UUID REFERENCES public.strategies(id),
  signal_reason   TEXT,
  placed_at       TIMESTAMPTZ DEFAULT NOW(),
  executed_at     TIMESTAMPTZ
);

-- ==========================================
-- SCREENER
-- ==========================================

CREATE TABLE public.screener_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_by        TEXT DEFAULT 'cron',         -- 'cron' or user_id
  filter_config JSONB NOT NULL,              -- Applied filters
  results       JSONB NOT NULL,              -- [{symbol, score, reasons}, ...]
  ai_summary    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.saved_screens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  name          TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  alert_on_match BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ALERTS & EMAIL PREFERENCES
-- ==========================================

CREATE TABLE public.alert_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  symbol          TEXT,
  alert_type      TEXT CHECK (alert_type IN ('price_above','price_below',
                              'percent_change','volume_spike','rsi_overbought',
                              'rsi_oversold','ma_crossover','news_mention')),
  threshold       NUMERIC(12,4),
  is_active       BOOLEAN DEFAULT TRUE,
  last_triggered  TIMESTAMPTZ,
  trigger_count   INTEGER DEFAULT 0,
  channel         TEXT DEFAULT 'email' CHECK (channel IN ('email','push')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.email_preferences (
  id               UUID PRIMARY KEY REFERENCES public.profiles(id),
  digest_enabled   BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT '4h' CHECK (digest_frequency IN ('1h','2h','3h','4h','6h','12h','24h')),
  include_watchlist BOOLEAN DEFAULT TRUE,
  include_nifty50  BOOLEAN DEFAULT TRUE,
  include_macro    BOOLEAN DEFAULT TRUE,
  include_ai_picks BOOLEAN DEFAULT TRUE,
  include_news     BOOLEAN DEFAULT TRUE,
  next_send_at     TIMESTAMPTZ,
  last_sent_at     TIMESTAMPTZ,
  unsubscribed_at  TIMESTAMPTZ
);

CREATE TABLE public.email_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id),
  type        TEXT,                           -- 'digest', 'alert', 'report'
  subject     TEXT,
  resend_id   TEXT,
  status      TEXT,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AI REPORTS
-- ==========================================

CREATE TABLE public.research_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id),
  symbol        TEXT,
  report_type   TEXT CHECK (report_type IN ('stock_deep_dive','sector_analysis',
                            'macro_outlook','portfolio_review','strategy_explain')),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,                -- Full report in Markdown
  key_metrics   JSONB,
  rating        TEXT CHECK (rating IN ('Strong Buy','Buy','Hold','Sell','Strong Sell')),
  price_target  NUMERIC(12,4),
  model_used    TEXT DEFAULT 'llama-3.1-70b-versatile',
  tokens_used   INTEGER,
  is_public     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own backtests" ON public.backtest_results
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON public.paper_orders
  FOR ALL USING (auth.uid() = user_id);
```

---

## ✨ Feature Breakdown

### 1. 📊 Backtesting Engine

**Endpoint:** `POST /api/backtest`

**What it does:**
- Accepts a strategy definition (type + parameters) and date range
- Fetches OHLCV data from Fyers API (primary) with Yahoo Finance fallback
- Caches data in `ohlcv_cache` to avoid repeated API calls
- Runs strategy using **vectorbt** (Python Vercel function) or **trading-signals** (Node.js for simpler strategies)
- Computes full performance report: CAGR, Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor, Alpha, Beta vs Nifty 50
- Generates equity curve, trade log, and monthly returns matrix
- Calls **Groq AI** to write a 200-word analysis of the strategy's performance
- Returns results via Supabase Realtime to update the frontend in real-time

**Built-in Strategies:**
| Strategy | Parameters | Description |
|---------|-----------|-------------|
| MA Crossover | fast_period, slow_period | Buy when fast MA crosses above slow MA |
| RSI Reversal | rsi_period, oversold, overbought | Buy on oversold, sell on overbought |
| MACD Signal | fast, slow, signal | Classic MACD histogram crossover |
| Bollinger Breakout | period, std_dev | Buy on breakout above upper band |
| EMA + Volume | ema_period, vol_multiplier | EMA trend + volume confirmation |
| Mean Reversion | lookback, z_threshold | Buy when price is 2σ below mean |
| Momentum | lookback, top_n | Buy top N% momentum stocks each month |
| Dual Momentum | abs_momentum, rel_momentum | Gary Antonacci's dual momentum |
| Golden Cross | — | 50-day vs 200-day SMA crossover |
| Custom Expression | formula | User writes raw boolean logic |

**Vercel Python Function Example:**
```python
# api/python/backtest.py
import vectorbt as vbt
import pandas as pd
from http.server import BaseHTTPRequestHandler
import json

def run_backtest(symbol, start, end, strategy_params, initial_capital=100000):
    # Fetch price data
    price = vbt.YFData.download(
        f"{symbol}.NS", start=start, end=end, missing_index='drop'
    ).get('Close')
    
    if strategy_params['type'] == 'ma_crossover':
        fast = price.vbt.MA(strategy_params['fast_period'])
        slow = price.vbt.MA(strategy_params['slow_period'])
        entries = fast.vbt.crossed_above(slow)
        exits  = fast.vbt.crossed_below(slow)
        
    portfolio = vbt.Portfolio.from_signals(
        price, entries, exits,
        init_cash=initial_capital,
        fees=0.001,   # 0.1% brokerage + STT approximation
        slippage=0.001
    )
    
    stats = portfolio.stats()
    return {
        'total_return_pct': float(stats['Total Return [%]']),
        'cagr_pct': float(stats['Annualized Return [%]']),
        'sharpe_ratio': float(stats['Sharpe Ratio']),
        'max_drawdown_pct': float(stats['Max Drawdown [%]']),
        'win_rate_pct': float(stats['Win Rate [%]']),
        'total_trades': int(stats['Total Trades']),
        'equity_curve': portfolio.value().to_dict(),
        'trades': portfolio.trades.records_readable.to_dict('records')
    }
```

---

### 2. 📈 Paper Trading Simulator

**Endpoints:** `POST /api/paper-trade/order`, `GET /api/paper-trade/portfolio`

**What it does:**
- Maintains a virtual portfolio in Supabase with realistic P&L tracking
- Fetches real-time prices from Fyers API to simulate fills
- Supports Market, Limit, Stop-Loss, and Stop-Limit orders
- Simulates brokerage + STT + GST costs (₹20 flat like Zerodha or 0.1%)
- Runs strategy signals automatically in paper mode (cron-driven)
- Shows portfolio P&L, position sizing, and portfolio-level metrics
- Uses Fyers' own **Validation Mode** (`is_amo: false, offline_order: true`) to validate order feasibility

**Paper Trading Flow:**
```
User enables "Auto Paper Trade" for a strategy
        │
        ▼
Cron: /api/cron/paper-signals (every 15 min on market hours)
        │
        ├─► Fetch live Nifty/stocks from Fyers API
        ├─► Run strategy logic (Node.js indicators)
        ├─► If signal detected → INSERT into paper_orders
        ├─► Simulate fill at current market price
        ├─► Update portfolio_holdings balance
        └─► Notify user via Supabase Realtime
```

---

### 3. 🔍 Stock Screener

**Endpoint:** `POST /api/screener/run`, `GET /api/screener/results`

**Filter Categories:**
```
FUNDAMENTAL FILTERS:
  • P/E Ratio (range)
  • P/B Ratio (range)
  • EPS Growth YoY (%)
  • Revenue Growth YoY (%)
  • Debt-to-Equity (max)
  • ROE (min %)
  • Dividend Yield (range)
  • Market Cap (micro/small/mid/large/mega)
  • Promoter Holding (min %)
  • FII Holding Change (%)

TECHNICAL FILTERS:
  • Price vs 52-week High/Low (%)
  • Above/Below 20/50/200 EMA
  • RSI (range: e.g., 30-50 for entry)
  • MACD Histogram (positive/negative)
  • Volume vs 20-day avg (multiple)
  • Bollinger Band position
  • ADX > 25 (trending)

MOMENTUM FILTERS:
  • 1-month, 3-month, 6-month, 1-year return
  • Relative strength vs Nifty 50
  • 52-week momentum score

SECTOR FILTERS:
  • Sector (IT, Banking, FMCG, Pharma, Auto, etc.)
  • Index membership (Nifty 50, Nifty 500, etc.)
```

**AI Rationale Generation:**
For each screened stock, Groq AI generates a 3-sentence investment thesis:
```javascript
// /api/screener/ai-rationale.js
const prompt = `
You are a SEBI-registered research analyst writing for Indian retail investors.
Given these stock metrics: ${JSON.stringify(stockMetrics)}
Write a 3-sentence research note explaining WHY this stock passed the screen,
its key strengths, and 1 risk to monitor. Be factual, not promotional.
`;
```

---

### 4. 📧 Automated Email Digest System

**Cron:** `GET /api/cron/market-digest` — runs every 3 hours (configurable per user)

**Email Structure (per digest):**

```
📊 AlgoVeda Market Digest — 2:00 PM IST, Mon 12 Jan 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 MARKET SNAPSHOT
  Nifty 50:     23,450  ▲ 0.82% (+191 pts)
  Sensex:       77,200  ▲ 0.79%
  Nifty Bank:   49,850  ▲ 1.12%
  India VIX:    13.2    ▼ -0.8%

🔥 YOUR WATCHLIST MOVERS
  RELIANCE    ▲ 2.14%  at ₹2,847  (hit 52W high)
  INFY        ▼ -0.83% at ₹1,542
  HDFCBANK    ▲ 0.45%  at ₹1,698

🤖 AI COMMENTARY (powered by Groq)
  "Markets extended gains as FII buying returned to banking stocks..."

🎯 TODAY'S SCREENER PICKS (Pro & above)
  1. TITAN    — Momentum + Volume breakout | P/E: 74 | ROE: 28%
  2. LTIM     — Technical breakout above 200 EMA | FII buying ↑

📰 KEY NEWS
  • RBI holds repo rate at 6.5% — impact on bank margins...
  • Q3 IT sector earnings preview...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  Manage preferences | 🔕 Unsubscribe | 📊 Full Dashboard
```

**Email Implementation:**
```typescript
// lib/email/digest-template.tsx
import { render } from '@react-email/render';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDigest(userId: string, digestData: DigestData) {
  const html = await render(<MarketDigestEmail data={digestData} />);
  
  await resend.emails.send({
    from: 'AlgoVeda Research <digest@algoveda.in>',
    to: digestData.userEmail,
    subject: `📊 Market Digest — ${formatTime()} IST`,
    html,
  });
}
```

---

### 5. 🤖 Groq AI Integration

**Use Cases Across Platform:**

| Feature | Groq Model | Prompt Task |
|---------|-----------|-------------|
| Backtest Analysis | `llama-3.1-70b-versatile` | Explain strategy performance in plain English |
| Stock Rationale | `llama-3.1-70b-versatile` | 3-sentence research note per screened stock |
| Market Commentary | `llama-3.3-70b-versatile` | 150-word daily market summary |
| Risk Report | `mixtral-8x7b-32768` | Portfolio risk analysis |
| Q&A Chatbot | `llama-3.1-8b-instant` | Fast answers to market questions |
| Report Writer | `llama-3.1-70b-versatile` | Full stock deep-dive reports (2,000 words) |
| Alert Explanation | `llama-3.1-8b-instant` | "Why did this alert trigger?" |

**Groq API Integration:**
```typescript
// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateMarketCommentary(data: MarketSnapshot): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior market analyst at a leading Indian brokerage. 
        You write clear, factual, balanced market commentary for retail investors. 
        Never give direct buy/sell advice. Focus on facts and context.`
      },
      {
        role: 'user',
        content: `Write a 120-word market commentary for the Indian equity market.
        Data: ${JSON.stringify(data)}
        Format: 2 short paragraphs. First paragraph: what happened today.
        Second paragraph: what to watch tomorrow.`
      }
    ],
    temperature: 0.4,
    max_tokens: 300,
  });
  
  return response.choices[0].message.content ?? '';
}
```

---

### 6. 📉 Portfolio Analytics

**Features:**
- Holdings P&L (realized + unrealized)
- Sector-wise allocation pie chart
- Portfolio beta vs Nifty 50
- Correlation matrix between holdings
- Risk metrics: VaR (95%), CVaR, portfolio volatility
- Benchmark comparison: portfolio vs Nifty 50, Nifty 500
- Rebalancing suggestions (deviation from target allocation)
- Tax harvesting opportunities (highlight loss positions for tax offset)

**Endpoint:** `GET /api/portfolio/:id/analytics`

---

### 7. 🚨 Smart Alert System

**Alert Types:**
```
Price Alerts:    Above ₹X, Below ₹X, % change in session
Technical:       RSI crosses 30/70, MA crossover, Volume spike 3x
Fundamental:     Earnings date approaching, Dividend announcement
News:            Company mentioned in major news (Finnhub webhooks)
Pattern:         Breakout from consolidation (detected by Python fn)
Options:         Put/Call ratio crosses threshold
Macro:           Nifty 50 drops > 1.5% in a session
```

**Alert Evaluation Cron (every 15 min, market hours only):**
```typescript
// api/cron/alert-check.ts
export async function GET(req: Request) {
  const marketHours = isMarketHours(); // 9:15 AM – 3:30 PM IST
  if (!marketHours) return Response.json({ skipped: true });

  const activeAlerts = await supabase
    .from('alert_configs')
    .select('*, profiles(email)')
    .eq('is_active', true);

  const symbols = [...new Set(activeAlerts.data.map(a => a.symbol))];
  const prices = await fetchBatchQuotes(symbols); // Fyers batch quote

  for (const alert of activeAlerts.data) {
    const price = prices[alert.symbol]?.ltp;
    if (shouldTrigger(alert, price)) {
      await sendAlertEmail(alert, price);
      await updateAlertLog(alert.id);
    }
  }
}
```

---

### 8. 📊 Macro Dashboard

Real-time macro indicators fetched from FRED + RBI + World Bank:
- **India 10Y Bond Yield** (RBI)
- **USD/INR Exchange Rate** (Open Exchange Rates)
- **India CPI / WPI Inflation** (World Bank / FRED)
- **FII/DII Net Buying** (NSE scraper, daily)
- **India GDP Growth Rate** (World Bank)
- **Crude Oil Price** (FRED: DCOILWTICO)
- **Gold (MCX)** (Yahoo Finance: GC=F)
- **US Fed Funds Rate** (FRED: FEDFUNDS)
- **India PMI** (Finnhub)
- **VIX India** (NSE scraper)

---

### 9. 🎓 Strategy Explanation Engine

For every strategy + backtest, an AI-powered explanation is generated:

```
STRATEGY: RSI Mean Reversion (RSI-14, Buy <35, Sell >65)
PERIOD: Jan 2020 – Dec 2024 on RELIANCE.NS

📌 WHAT THE STRATEGY DOES:
   This strategy buys RELIANCE shares when the 14-day RSI drops
   below 35 (indicating oversold conditions) and sells when RSI
   exceeds 65 (overbought). It's a classic mean-reversion approach...

📊 WHAT THE BACKTEST SHOWS:
   Over 5 years, the strategy generated 34 trades with a 68% win rate.
   The CAGR of 18.4% outpaced the benchmark (Nifty 50) by 4.2%...

⚠️ RISKS & LIMITATIONS:
   1. Works best in ranging markets, struggles in strong trends
   2. Transaction costs reduce returns in volatile periods
   3. Past performance does not guarantee future results...

🔑 KEY TAKEAWAY:
   This strategy shows statistical edge in RELIANCE specifically,
   but requires 5%+ position sizing discipline to capture the edge.
```

---

## ⚡ Serverless Function Design

### Complete API Route Map

```
/api/
├── auth/
│   ├── callback.ts              # Supabase OAuth callback
│   └── fyers-connect.ts         # Fyers OAuth initiation
│
├── market/
│   ├── quote.ts                 # Single/batch quote fetch
│   ├── historical.ts            # OHLCV data with cache
│   ├── search.ts                # Symbol search
│   ├── overview.ts              # Market breadth overview
│   └── sector-performance.ts   # Sectoral indices
│
├── screener/
│   ├── run.ts                   # Execute screen with filters
│   ├── results/[id].ts          # Get saved screen results
│   ├── saved.ts                 # CRUD saved screens
│   └── ai-rationale.ts         # Groq rationale for a stock
│
├── backtest/
│   ├── submit.ts                # Queue a backtest job
│   ├── status/[jobId].ts        # Poll job status
│   ├── results/[jobId].ts       # Full results
│   └── strategies.ts            # CRUD strategies
│
├── paper-trade/
│   ├── order.ts                 # Place paper order
│   ├── portfolio.ts             # Get paper portfolio
│   ├── positions.ts             # Open positions
│   └── history.ts               # Order history
│
├── portfolio/
│   ├── [id]/analytics.ts        # Full analytics
│   ├── [id]/holdings.ts         # Holdings CRUD
│   └── [id]/snapshot.ts         # P&L snapshot
│
├── alerts/
│   ├── create.ts                # Create alert
│   ├── list.ts                  # User's alerts
│   └── delete/[id].ts          # Delete alert
│
├── research/
│   ├── generate.ts              # Generate AI report (async)
│   ├── reports.ts               # List reports
│   └── report/[id].ts          # Get specific report
│
├── email/
│   ├── preferences.ts           # Get/update email prefs
│   └── unsubscribe.ts           # One-click unsubscribe
│
├── subscription/
│   ├── plans.ts                 # List plans
│   ├── create.ts                # Create Razorpay subscription
│   ├── cancel.ts                # Cancel subscription
│   └── usage.ts                 # Current usage vs limits
│
├── webhooks/
│   ├── razorpay.ts              # Razorpay event handler
│   └── fyers.ts                 # Fyers order/data updates
│
├── admin/
│   ├── users.ts                 # User management
│   ├── stats.ts                 # Platform stats
│   └── plans.ts                 # Plan management
│
└── cron/
    ├── market-digest.ts         # Email digest sender
    ├── alert-check.ts           # Alert evaluator
    ├── fyers-refresh.ts         # Token refresh
    ├── screener-run.ts          # Daily screener
    ├── backtest-queue.ts        # Background job processor
    ├── fundamental-sync.ts      # Refresh fundamental cache
    └── news-fetch.ts            # News aggregation
```

### Middleware Architecture

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10s'),  // 20 req/10sec per user
});

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Auth check for protected routes
  const { data: { session } } = await supabase.auth.getSession();
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // 2. Admin route protection
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles').select('role').single();
    if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 });
  }
  
  // 3. Rate limiting for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const identifier = session?.user.id ?? req.ip ?? 'anonymous';
    const { success } = await ratelimit.limit(identifier);
    if (!success) return new Response('Too Many Requests', { status: 429 });
  }
  
  return res;
}
```

---

## ⏰ Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/fyers-refresh",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/screener-run",
      "schedule": "30 0 * * 1-5"
    },
    {
      "path": "/api/cron/fundamental-sync",
      "schedule": "0 1 * * 6"
    },
    {
      "path": "/api/cron/news-fetch",
      "schedule": "*/30 3-12 * * 1-5"
    },
    {
      "path": "/api/cron/alert-check",
      "schedule": "*/15 3-10 * * 1-5"
    },
    {
      "path": "/api/cron/market-digest",
      "schedule": "30 4,7,10,13 * * 1-5"
    },
    {
      "path": "/api/cron/backtest-queue",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/paper-signals",
      "schedule": "*/15 3-10 * * 1-5"
    }
  ]
}
```

> **Times are in UTC.** Market hours (IST 9:15–15:30) = UTC 3:45–10:00.

| Cron | Schedule (UTC) | What it does |
|------|---------------|-------------|
| `fyers-refresh` | 02:00 daily | Refresh all Fyers OAuth tokens |
| `screener-run` | 00:30 weekdays | Pre-market stock screen, cache results |
| `fundamental-sync` | 01:00 Saturday | Update P/E, P/B, EPS for all watchlisted stocks |
| `news-fetch` | Every 30min (market hours) | Fetch & score news sentiment |
| `alert-check` | Every 15min (market hours) | Evaluate all price/technical alerts |
| `market-digest` | 10:00, 13:00, 16:00, 19:00 IST | Send personalized email digests |
| `backtest-queue` | Every 5min | Process queued backtest jobs |
| `paper-signals` | Every 15min (market hours) | Run auto paper-trade strategies |

---

## 🎛️ Admin Panel

Built with **React-Admin** connected to Supabase via a custom data provider.

**Route:** `/admin` (restricted to `role = 'admin'` in profiles)

### Admin Panel Sections

#### 1. Dashboard (Overview)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Total Users │   Active Sub │  MRR (₹)     │  Churn Rate  │
│     1,248    │     387      │  ₹3,42,600   │   2.1%       │
└──────────────┴──────────────┴──────────────┴──────────────┘
• Daily signups chart (30 days)
• Revenue by plan (Researcher / Pro / Institution)
• Backtest jobs today: 128 completed, 3 failed
• Email digest sent today: 2,341
• API usage: Fyers 4,200/10,000, Yahoo Finance 89/500
• Top 10 most backtested symbols
```

#### 2. User Management
- List all users with subscription status, plan, last login
- Filter by plan, status, sign-up date
- View individual user's backtests, alerts, portfolio
- Manually upgrade/downgrade plan
- Send one-off emails to users
- Export user list (CSV)
- Impersonate user (view their dashboard as them)

#### 3. Subscription & Plan Management
- Create/edit Razorpay plans (sync to `subscription_plans` table)
- View all active/cancelled subscriptions
- Process refund (via Razorpay API)
- View failed payments and retry
- Revenue analytics: MRR, ARR, LTV per cohort

#### 4. Content & Screener Config
- Edit AI prompts (stored in DB, no redeploy needed)
- Manage "Featured Screener" configurations
- Curate "Editor's Picks" stocks for digest
- Add/remove indices from macro dashboard

#### 5. System Health
- API quota usage across all 3rd-party APIs
- Recent cron job logs (success/failure)
- Email delivery rates (Resend dashboard data)
- Supabase DB size and query performance
- Error log viewer (Sentry integration)

#### 6. Compliance & Audit
- Research report review queue (flag AI-generated content for review)
- User complaint log
- DPDP Act compliance: data export/deletion requests

**React-Admin Setup:**
```typescript
// admin/AdminApp.tsx
import { Admin, Resource, ListGuesser } from 'react-admin';
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from '../lib/supabase';

const dataProvider = supabaseDataProvider({
  instanceUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  supabaseClient: supabase,
  resources: [
    { name: 'profiles', schema: 'public' },
    { name: 'subscriptions', schema: 'public' },
    { name: 'backtest_results', schema: 'public' },
    { name: 'research_reports', schema: 'public' },
    { name: 'email_logs', schema: 'public' },
  ]
});

export const AdminApp = () => (
  <Admin dataProvider={dataProvider} basename="/admin">
    <Resource name="profiles" list={UserList} edit={UserEdit} />
    <Resource name="subscriptions" list={SubscriptionList} />
    <Resource name="backtest_results" list={BacktestList} show={BacktestShow} />
  </Admin>
);
```

---

## 💳 Subscription & Payment System

### Razorpay Integration Flow

```
1. USER chooses plan on pricing page
        │
        ▼
2. POST /api/subscription/create
   ├─ Create/fetch Razorpay customer (rzp.customers.create)
   ├─ Create Razorpay subscription (rzp.subscriptions.create)
   └─ Return { subscription_id, short_url }
        │
        ▼
3. Frontend opens Razorpay Checkout
   └─ rzp.open({ subscription_id, ... })
        │
        ▼
4. User completes payment
        │
        ▼
5. Razorpay fires webhook to POST /api/webhooks/razorpay
   ├─ Verify HMAC-SHA256 signature
   ├─ subscription.activated → set status='active' in Supabase
   ├─ invoice.paid → extend period_end, reset monthly quotas
   ├─ payment.failed → send warning email to user
   └─ subscription.cancelled → downgrade to free tier
        │
        ▼
6. User's dashboard reflects new access immediately
   (Supabase Realtime updates subscription status)
```

**Webhook Handler:**
```typescript
// api/webhooks/razorpay.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature')!;
  
  // CRITICAL: Verify signature before trusting payload
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSig) {
    return new Response('Invalid signature', { status: 400 });
  }
  
  const event = JSON.parse(body);
  
  switch (event.event) {
    case 'subscription.activated':
      await activateSubscription(event.payload.subscription.entity);
      break;
    case 'invoice.paid':
      await renewSubscription(event.payload.subscription.entity);
      break;
    case 'payment.failed':
      await handlePaymentFailure(event.payload);
      break;
    case 'subscription.cancelled':
      await cancelSubscription(event.payload.subscription.entity);
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

---

## 🔒 Security & Best Practices

### Secret Management
```bash
# .env.local (never commit to Git)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # Safe to expose (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # NEVER expose client-side

FYERS_APP_ID=XXXX-100                          # From Fyers developer portal
FYERS_SECRET_KEY=xxxxxxxxxxxx
FYERS_REDIRECT_URI=https://algoveda.in/api/auth/fyers-callback

RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxx

GROQ_API_KEY=gsk_xxxxxxxxxxxx

ALPHA_VANTAGE_API_KEY=xxxxxxxxxxxx
FINNHUB_API_KEY=xxxxxxxxxxxx
FMP_API_KEY=xxxxxxxxxxxx

RESEND_API_KEY=re_xxxxxxxxxxxx

UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxx

CRON_SECRET=xxxxxxxxxxxx                       # Protect cron routes

SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

### Fyers Token Management
```typescript
// lib/fyers/token-manager.ts
export async function getFyersToken(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('fyers_token, fyers_token_expiry')
    .eq('id', userId)
    .single();

  // Token valid?
  if (profile?.fyers_token && new Date(profile.fyers_token_expiry) > new Date()) {
    return profile.fyers_token;
  }

  // Token expired — this should have been refreshed by cron
  // Log and alert admin
  await reportTokenExpiry(userId);
  throw new Error('Fyers token expired. Please reconnect your Fyers account.');
}
```

### API Rate Limiting Strategy
```
Fyers API:      10 req/sec → Use Upstash Redis token bucket
Alpha Vantage:  25 calls/day → Store in Redis counter, reset midnight
Yahoo Finance:  Unlimited (unofficial) → Back-off on 429s
FMP:            250 calls/day → Redis counter
Finnhub:        60 calls/min → Sliding window in Redis
Groq:           6,000 req/min (generous) → Per-user quota in DB
```

### Input Validation
```typescript
// Use Zod for all API inputs
import { z } from 'zod';

const BacktestSchema = z.object({
  symbol: z.string().regex(/^[A-Z]{2,20}$/).max(20),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  initial_capital: z.number().min(10000).max(10000000),
  strategy_type: z.enum(['ma_crossover','rsi','macd','bollinger','custom']),
  parameters: z.record(z.union([z.string(), z.number()])),
});
```

---

## 📁 Folder Structure

```
algoveda/
├── app/                           # Next.js App Router
│   ├── (marketing)/               # Public marketing pages
│   │   ├── page.tsx               # Landing page
│   │   ├── pricing/page.tsx
│   │   └── features/page.tsx
│   ├── (app)/                     # Authenticated app
│   │   ├── dashboard/page.tsx
│   │   ├── screener/page.tsx
│   │   ├── backtest/
│   │   │   ├── page.tsx           # Strategy list
│   │   │   ├── new/page.tsx       # Create backtest
│   │   │   └── [id]/page.tsx      # Backtest result
│   │   ├── paper-trade/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── alerts/page.tsx
│   │   ├── research/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                     # React-Admin panel
│   │   └── [[...rest]]/page.tsx
│   └── api/                       # Serverless functions
│       ├── market/...
│       ├── backtest/...
│       ├── screener/...
│       ├── subscription/...
│       ├── webhooks/...
│       └── cron/...
│
├── lib/                           # Shared business logic
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (service role)
│   │   └── middleware.ts
│   ├── fyers/
│   │   ├── client.ts
│   │   ├── token-manager.ts
│   │   ├── market-data.ts
│   │   └── paper-trade.ts
│   ├── market-data/
│   │   ├── alpha-vantage.ts
│   │   ├── yahoo-finance.ts
│   │   ├── finnhub.ts
│   │   ├── fmp.ts
│   │   └── aggregator.ts          # Unified data fetcher with fallbacks
│   ├── indicators/
│   │   ├── moving-averages.ts     # SMA, EMA, WMA
│   │   ├── oscillators.ts         # RSI, Stochastic, CCI
│   │   ├── momentum.ts            # MACD, Rate of Change
│   │   ├── volatility.ts          # Bollinger, ATR, Keltner
│   │   └── volume.ts              # OBV, VWAP, Chaikin MF
│   ├── backtest/
│   │   ├── engine.ts              # Node.js backtest engine
│   │   ├── metrics.ts             # Performance calculations
│   │   └── strategies/
│   │       ├── ma-crossover.ts
│   │       ├── rsi-reversal.ts
│   │       ├── macd.ts
│   │       └── index.ts
│   ├── groq/
│   │   ├── client.ts
│   │   ├── commentary.ts
│   │   ├── rationale.ts
│   │   └── report-writer.ts
│   ├── razorpay/
│   │   ├── client.ts
│   │   ├── subscriptions.ts
│   │   └── webhooks.ts
│   ├── email/
│   │   ├── resend.ts
│   │   ├── templates/
│   │   │   ├── digest.tsx          # React Email template
│   │   │   ├── alert.tsx
│   │   │   ├── welcome.tsx
│   │   │   └── report.tsx
│   │   └── digest-builder.ts
│   └── utils/
│       ├── date.ts
│       ├── format.ts
│       ├── rate-limiter.ts        # Upstash Redis wrapper
│       └── market-calendar.ts     # NSE trading calendar
│
├── python/                        # Python serverless functions
│   ├── requirements.txt
│   ├── backtest_vectorbt.py
│   ├── portfolio_optimizer.py
│   └── technical_analysis.py
│
├── components/                    # React components
│   ├── charts/
│   │   ├── CandlestickChart.tsx   # lightweight-charts
│   │   ├── EquityCurve.tsx
│   │   ├── DrawdownChart.tsx
│   │   └── ReturnHeatmap.tsx
│   ├── screener/
│   ├── backtest/
│   ├── portfolio/
│   └── ui/                        # shadcn/ui components
│
├── hooks/
│   ├── useMarketData.ts
│   ├── useBacktest.ts
│   └── useSubscription.ts
│
├── supabase/
│   ├── migrations/                # SQL migration files
│   └── seed.sql
│
├── vercel.json                    # Cron + function config
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Deployment Guide

### Step 1: Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Apply migrations
supabase db push

# Enable Auth providers
# In Supabase Dashboard → Auth → Providers → Enable Email

# Enable Row Level Security (already in migration)
# Enable Realtime on: backtest_jobs, paper_orders, subscriptions
```

### Step 2: Fyers API Setup
```
1. Register at fyers.in/api
2. Create an App — get App ID and Secret Key
3. Set Redirect URI: https://yourdomain.vercel.app/api/auth/fyers-callback
4. Implement OAuth2 flow to get access_token
5. Token is valid for 1 day — refresh daily via cron
```

### Step 3: Razorpay Setup
```
1. Create Razorpay account (Test mode first)
2. Dashboard → Settings → Webhooks → Add endpoint:
   https://yourdomain.vercel.app/api/webhooks/razorpay
3. Enable events: subscription.*, invoice.*, payment.*
4. Copy Webhook Secret to env vars
5. Create Plans:
   rzp.plans.create({
     period: 'monthly', interval: 1,
     item: { name: 'Researcher', amount: 49900, currency: 'INR' }
   });
```

### Step 4: Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add all environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RAZORPAY_KEY_SECRET production
# ... (all vars from .env.local)

# Enable cron jobs (requires Vercel Pro or above)
# vercel.json already contains cron config
```

### Step 5: Domain & Email
```
1. Add custom domain in Vercel dashboard
2. Set up Resend:
   - Add domain to Resend (DNS records)
   - Verify sending domain
3. Configure SPF/DKIM for digest emails to avoid spam folder
```

### Step 6: Monitoring Setup
```bash
# Sentry for error tracking
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# PostHog for analytics
npm install posthog-js
```

---

## 🗺️ Roadmap

### Phase 1 — MVP (Month 1-2)
- [x] Auth (Supabase), user onboarding
- [x] Fyers API integration + token management
- [x] Basic backtesting (MA Crossover, RSI) with charts
- [x] Stock screener (P/E, P/B, RSI filters)
- [x] Email digest (daily, Nifty 50 + watchlist)
- [x] Razorpay subscriptions (2 tiers)
- [x] Admin panel (React-Admin basic setup)

### Phase 2 — Growth (Month 3-4)
- [ ] Paper trading simulator (full P&L tracking)
- [ ] Groq AI commentary on all reports
- [ ] 8 built-in strategies for backtesting
- [ ] Alert system (price + RSI + MA alerts)
- [ ] Macro dashboard (FRED + RBI data)
- [ ] Portfolio analytics (Sharpe, VaR, sector allocation)
- [ ] Email digest personalization (frequency + content controls)

### Phase 3 — Scale (Month 5-6)
- [ ] Options chain analyzer (PCR, OI, Max Pain)
- [ ] Sector rotation model (momentum-based)
- [ ] AI deep-dive report writer (2,000 words per stock)
- [ ] Community screen sharing
- [ ] Referral program (Razorpay affiliate payout)
- [ ] API access tier for developers
- [ ] Mobile app (Expo, using same API layer)

### Phase 4 — Enterprise (Month 7+)
- [ ] White-label offering for SEBI-registered RIAs
- [ ] Multi-user team seats
- [ ] Custom report branding
- [ ] Advanced quant: pairs trading, stat-arb screener
- [ ] Earnings calendar with AI analysis
- [ ] Mutual fund / ETF comparison engine
- [ ] Integration: Zerodha Kite API (for SEBI-registered clients)

---

## ⚖️ Legal & Compliance Notes

> **IMPORTANT:** This platform provides **market research tools and educational content**, not investment advice. All users must be shown and agree to the following disclaimer:

```
DISCLAIMER: AlgoVeda is a market research and analysis tool.
All content generated by this platform is for educational and
informational purposes only and does not constitute investment
advice, a recommendation, or a solicitation to buy or sell any
security. Past performance (including backtests) does not guarantee
future results. Backtests are simulated with historical data and do
not account for all real-world trading conditions. Always consult a
SEBI-registered investment advisor before making investment decisions.
AlgoVeda is not registered with SEBI as an investment advisor.
```

**SEBI Compliance:**
- Do **NOT** display live buy/sell recommendations without SEBI IA registration
- Frame all outputs as "research tools", "screeners", and "educational backtests"
- Do NOT provide tips, advisory services, or subscription-based investment advice without SEBI Investment Adviser (IA) registration
- Paper trading and backtesting are permissible as educational tools
- Screener results are permissible as data-driven filtering tools

**DPDP Act (India Data Protection):**
- Store only necessary user data
- Provide data export endpoint (`GET /api/user/export`)
- Provide data deletion endpoint (`DELETE /api/user/account`)
- Privacy policy must cover data usage

---

## 📦 Quick Start

```bash
# Clone repository
git clone https://github.com/yourname/algoveda.git
cd algoveda

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Set up database
supabase db push

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🤝 Contributing

Built with ❤️ for the Indian retail investor community.

For feature requests, bug reports, or partnership inquiries:
- Email: team@algoveda.in
- Twitter: @AlgoVeda
- GitHub Issues: github.com/algoveda/platform/issues

---

*AlgoVeda — Wisdom-Driven Market Intelligence for Every Investor*