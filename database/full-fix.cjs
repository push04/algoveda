// AlgoVeda Full DB Fix Migration
const { Client } = require('pg');

const client = new Client({
  host: 'db.mdofncsxrbmyzhmzwzcm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@Pushpal2004',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

const migrations = [
  // ── Extensions ───────────────────────────────────────────────
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,

  // ── Fix profiles: add missing columns ───────────────────────
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quiz_score INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_unlocked BOOLEAN NOT NULL DEFAULT FALSE`,

  // ── Fix user_subscriptions: add missing columns ──────────────
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ`,
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ`,
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly'`,

  // ── Create portfolios table (code uses this) ─────────────────
  `CREATE TABLE IF NOT EXISTS public.portfolios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name            TEXT NOT NULL DEFAULT 'My Paper Portfolio',
    type            TEXT NOT NULL DEFAULT 'paper',
    initial_capital NUMERIC NOT NULL DEFAULT 100000,
    current_cash    NUMERIC NOT NULL DEFAULT 100000,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── Fix portfolio_holdings: add average_price and current_price ──
  `ALTER TABLE public.portfolio_holdings ADD COLUMN IF NOT EXISTS average_price NUMERIC NOT NULL DEFAULT 0`,
  `ALTER TABLE public.portfolio_holdings ADD COLUMN IF NOT EXISTS current_price NUMERIC`,
  `ALTER TABLE public.portfolio_holdings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE public.portfolio_holdings SET average_price = avg_cost WHERE average_price = 0 AND avg_cost > 0`,

  // ── Fix portfolio_holdings: add FK to portfolios if not exists ──
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='portfolio_holdings'
      AND column_name='portfolio_id'
    ) THEN
      ALTER TABLE public.portfolio_holdings ADD COLUMN portfolio_id UUID;
    END IF;
  END $$`,

  // ── Fix paper_orders: ensure exists and has correct columns ──
  `CREATE TABLE IF NOT EXISTS public.paper_orders (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id   UUID NOT NULL,
    symbol         TEXT NOT NULL,
    side           TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
    quantity       INTEGER NOT NULL CHECK (quantity > 0),
    order_type     TEXT NOT NULL DEFAULT 'MARKET',
    limit_price    NUMERIC,
    executed_price NUMERIC NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'EXECUTED',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── Create daily_picks table ──────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.daily_picks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol        TEXT NOT NULL,
    company_name  TEXT NOT NULL,
    pick_date     DATE NOT NULL,
    recommendation TEXT NOT NULL DEFAULT 'BUY',
    target_price  NUMERIC,
    stop_loss     NUMERIC,
    rationale     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(symbol, pick_date)
  )`,

  // ── Create learning_modules table ────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.learning_modules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    content     JSONB NOT NULL DEFAULT '[]',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_premium  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── Create quiz_questions table ──────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_slug    TEXT NOT NULL,
    question       TEXT NOT NULL,
    options        JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation    TEXT,
    difficulty     TEXT DEFAULT 'medium',
    order_index    INTEGER DEFAULT 0
  )`,

  // ── Create coupons table ─────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.coupons (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             TEXT UNIQUE NOT NULL,
    description      TEXT,
    discount_percent INTEGER,
    discount_amount  NUMERIC,
    valid_from       TIMESTAMPTZ DEFAULT NOW(),
    valid_until      TIMESTAMPTZ,
    max_uses         INTEGER,
    current_uses     INTEGER DEFAULT 0,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── RLS for portfolios ────────────────────────────────────────
  `ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "portfolios_all_own" ON public.portfolios`,
  `CREATE POLICY "portfolios_all_own" ON public.portfolios FOR ALL USING (auth.uid() = user_id)`,

  // ── RLS for portfolio_holdings ────────────────────────────────
  `ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "portfolio_holdings_all" ON public.portfolio_holdings`,
  `CREATE POLICY "portfolio_holdings_all" ON public.portfolio_holdings
    FOR ALL USING (
      portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
    )`,

  // ── RLS for paper_orders ──────────────────────────────────────
  `ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "paper_orders_all" ON public.paper_orders`,
  `CREATE POLICY "paper_orders_all" ON public.paper_orders
    FOR ALL USING (
      portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
    )`,

  // ── RLS for daily_picks (public read) ────────────────────────
  `ALTER TABLE public.daily_picks ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "daily_picks_read" ON public.daily_picks`,
  `CREATE POLICY "daily_picks_read" ON public.daily_picks FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "daily_picks_insert" ON public.daily_picks`,
  `CREATE POLICY "daily_picks_insert" ON public.daily_picks FOR INSERT WITH CHECK (true)`,

  // ── RLS for learning_modules (public read) ────────────────────
  `ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "learning_modules_read" ON public.learning_modules`,
  `CREATE POLICY "learning_modules_read" ON public.learning_modules FOR SELECT USING (true)`,

  // ── RLS for quiz_questions (public read) ─────────────────────
  `ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "quiz_questions_read" ON public.quiz_questions`,
  `CREATE POLICY "quiz_questions_read" ON public.quiz_questions FOR SELECT USING (true)`,

  // ── RLS for coupons ──────────────────────────────────────────
  `ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "coupons_read" ON public.coupons`,
  `CREATE POLICY "coupons_read" ON public.coupons FOR SELECT USING (true)`,

  // ── Trigger for portfolios updated_at ────────────────────────
  `CREATE OR REPLACE FUNCTION public.set_updated_at()
   RETURNS TRIGGER LANGUAGE plpgsql AS $$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $$`,
  `DROP TRIGGER IF EXISTS set_portfolios_updated_at ON public.portfolios`,
  `CREATE TRIGGER set_portfolios_updated_at
     BEFORE UPDATE ON public.portfolios
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,

  // ── Handle new user trigger (create profile) ──────────────────
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
   $$`,
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
  `CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

  // ── Add Starter plan (₹2 one-time) ───────────────────────────
  `INSERT INTO public.subscription_plans
    (name, slug, price_monthly, price_yearly, features, max_backtests, max_watchlists, email_frequency_min, is_active, sort_order)
   VALUES (
     'Starter', 'starter', 200, NULL,
     '["Complete Stock Market A-Z Course","AI-Powered Quiz System","₹1 Lakh Paper Trading Account","20-Question Assessment","Certificate of Completion"]',
     10, 2, 720, true, -1
   )
   ON CONFLICT (slug) DO UPDATE SET
     price_monthly = 200,
     is_active = true,
     features = '["Complete Stock Market A-Z Course","AI-Powered Quiz System","₹1 Lakh Paper Trading Account","20-Question Assessment","Certificate of Completion"]'`,

  // ── Seed learning modules ─────────────────────────────────────
  `INSERT INTO public.learning_modules (slug, title, description, order_index) VALUES
    ('basics', 'Stock Market Basics', 'Learn fundamentals: what stocks are, how exchanges work, types of orders', 1),
    ('technical', 'Technical Analysis', 'Chart patterns, indicators (RSI, MACD, Bollinger Bands) and trend analysis', 2),
    ('fundamental', 'Fundamental Analysis', 'P/E ratio, EPS, revenue growth, balance sheet analysis', 3),
    ('risk', 'Risk Management', 'Position sizing, stop-loss strategies, portfolio diversification', 4)
   ON CONFLICT (slug) DO NOTHING`,

  // ── Seed quiz questions ───────────────────────────────────────
  `INSERT INTO public.quiz_questions (module_slug, question, options, correct_answer, explanation, difficulty, order_index) VALUES
    ('basics', 'What does NSE stand for?',
     '["National Stock Exchange","New Stock Exchange","National Securities Exchange","National Share Exchange"]',
     0, 'NSE stands for National Stock Exchange, India''s largest stock exchange by trading volume.', 'easy', 1),

    ('basics', 'What is a bull market?',
     '["A market with falling prices","A market with rising prices","A market with stable prices","A market with high volatility"]',
     1, 'A bull market is characterized by rising stock prices and investor optimism.', 'easy', 2),

    ('basics', 'What does IPO stand for?',
     '["Initial Public Offering","Internal Public Offering","Initial Private Offering","International Public Offering"]',
     0, 'IPO stands for Initial Public Offering — when a company first sells shares to the public.', 'easy', 3),

    ('basics', 'What is SEBI?',
     '["Stock Exchange Board of India","Securities and Exchange Board of India","Securities Exchange Bureau of India","Stock Exchange Bureau of India"]',
     1, 'SEBI is the Securities and Exchange Board of India, the regulator of Indian capital markets.', 'easy', 4),

    ('basics', 'What is the Sensex?',
     '["An index of 50 NSE stocks","An index of 30 BSE stocks","An index of all BSE stocks","An index of midcap stocks"]',
     1, 'Sensex is the benchmark index of BSE comprising 30 large-cap stocks.', 'medium', 5),

    ('technical', 'What does RSI stand for?',
     '["Relative Strength Index","Real Stock Indicator","Relative Stock Index","Real Strength Indicator"]',
     0, 'RSI (Relative Strength Index) measures the speed and magnitude of price changes.', 'medium', 1),

    ('technical', 'An RSI value above 70 indicates:',
     '["Oversold condition","Overbought condition","Neutral condition","Strong uptrend"]',
     1, 'RSI above 70 signals overbought — the stock may be due for a correction.', 'medium', 2),

    ('technical', 'What is a support level?',
     '["A price where selling pressure is strong","A price where buying interest is strong","The 52-week high","The moving average line"]',
     1, 'Support is a price level where buying demand is strong enough to prevent further price decline.', 'medium', 3),

    ('technical', 'What does MACD stand for?',
     '["Moving Average Convergence Divergence","Market Average Change Direction","Moving Asset Curve Deviation","Market Analysis Curve Direction"]',
     0, 'MACD is Moving Average Convergence Divergence, a trend-following momentum indicator.', 'medium', 4),

    ('technical', 'A golden cross occurs when:',
     '["50-day MA crosses below 200-day MA","50-day MA crosses above 200-day MA","Price crosses above 50-day MA","RSI crosses above 50"]',
     1, 'A golden cross is when the 50-day moving average crosses above the 200-day moving average — a bullish signal.', 'hard', 5),

    ('fundamental', 'What does P/E ratio measure?',
     '["Price relative to earnings","Profit relative to equity","Price relative to equity","Profit relative to expenses"]',
     0, 'Price-to-Earnings (P/E) ratio = Stock Price ÷ Earnings Per Share, measuring how much you pay per rupee of earnings.', 'medium', 1),

    ('fundamental', 'What is EPS?',
     '["Earnings Per Share","Equity Per Share","Earnings Per Stock","Equity Price Score"]',
     0, 'EPS (Earnings Per Share) = Net Profit ÷ Total Shares Outstanding.', 'easy', 2),

    ('fundamental', 'A high debt-to-equity ratio indicates:',
     '["Company has more equity than debt","Company relies heavily on debt financing","Company has no liabilities","Company is highly profitable"]',
     1, 'High D/E ratio means the company uses more debt than equity, increasing financial risk.', 'medium', 3),

    ('fundamental', 'What is the book value of a stock?',
     '["Current market price","Total assets minus total liabilities per share","Annual dividend per share","Earnings per share"]',
     1, 'Book value = (Total Assets - Total Liabilities) ÷ Shares Outstanding — represents net asset value per share.', 'hard', 4),

    ('fundamental', 'What does ROE measure?',
     '["Return on Equity","Rate of Exchange","Return on Earnings","Rate of Equity"]',
     0, 'Return on Equity (ROE) = Net Income ÷ Shareholders Equity, measuring profitability relative to equity.', 'medium', 5),

    ('risk', 'What is a stop-loss order?',
     '["Order to buy at a specific price","Order to sell when price drops to a specific level","Order to hold at a specific price","Order to buy when price rises"]',
     1, 'A stop-loss order automatically sells a position when the price falls to a specified level, limiting losses.', 'easy', 1),

    ('risk', 'What is portfolio diversification?',
     '["Investing all money in one stock","Spreading investments across different assets","Investing only in large-cap stocks","Timing the market perfectly"]',
     1, 'Diversification reduces risk by spreading investments across different assets, sectors, or geographies.', 'easy', 2),

    ('risk', 'What is the risk-reward ratio?',
     '["Profit divided by total capital","Potential profit compared to potential loss","Risk amount divided by reward","Total return on investment"]',
     1, 'Risk-reward ratio = Potential Profit ÷ Potential Loss. A ratio of 2:1 means you risk Rs 1 to potentially gain Rs 2.', 'medium', 3),

    ('risk', 'What does position sizing mean?',
     '["The number of different stocks you own","How much capital to allocate to a single trade","The size of your portfolio","The duration of a trade"]',
     1, 'Position sizing determines how much of your portfolio to allocate to a single trade based on your risk tolerance.', 'medium', 4),

    ('risk', 'What is the maximum drawdown?',
     '["Maximum profit achieved","Largest peak-to-trough decline in portfolio value","Maximum daily loss","Maximum number of losing trades"]',
     1, 'Maximum drawdown is the largest decline from a peak to a trough before recovery — a key risk metric.', 'hard', 5)
  ON CONFLICT DO NOTHING`,
];

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      const preview = sql.replace(/\s+/g, ' ').slice(0, 80);
      try {
        await client.query(sql);
        console.log(`✅ [${i + 1}/${migrations.length}] ${preview}...`);
      } catch (err) {
        const msg = err.message || err;
        if (msg.includes('already exists') || msg.includes('duplicate key')) {
          console.log(`⚠️  [${i + 1}/${migrations.length}] Skipped (already exists): ${preview}...`);
        } else {
          console.error(`❌ [${i + 1}/${migrations.length}] FAILED: ${msg}`);
          console.error('   SQL:', sql.slice(0, 200));
        }
      }
    }

    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
