const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/algoveda'
});

async function migrate() {
  await client.connect();
  console.log('📚 Running education migration...\n');

  const sql = `

-- Add quiz_score to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education_unlocked BOOLEAN DEFAULT FALSE;

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  discount_amount NUMERIC,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  plan_ids UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning content table
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  order_index INTEGER DEFAULT 0
);

-- Enable RLS on new tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Coupons policies (admins only for write, all for read)
CREATE POLICY "coupons_read" ON public.coupons FOR ALL USING (true);
CREATE POLICY "coupons_admin" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Learning modules policies (public read, admin write)
CREATE POLICY "learning_modules_read" ON public.learning_modules FOR SELECT USING (true);
CREATE POLICY "learning_modules_admin" ON public.learning_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Quiz questions policies (public read, admin write)
CREATE POLICY "quiz_questions_read" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "quiz_questions_admin" ON public.quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Add ₹2 (Starter) plan
INSERT INTO public.subscription_plans (name, slug, price, billing_cycle, max_ai_suggestions, max_backtests, max_watchlists, features, is_active)
VALUES (
  'Starter - ₹2 Learning',
  'starter',
  2,
  'once',
  999,
  0,
  1,
  '["Complete Stock Market A-Z Course", "50+ Interactive Lessons", "AI-Powered MCQ Generator", "Certificate on Completion", "Unlock ₹1 Lakh Paper Trading"]',
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET price = 2, max_ai_suggestions = 999, features = '["Complete Stock Market A-Z Course", "50+ Interactive Lessons", "AI-Powered MCQ Generator", "Certificate on Completion", "Unlock ₹1 Lakh Paper Trading"]'
WHERE slug = 'starter';

-- Create seed coupons
INSERT INTO public.coupons (code, description, discount_percent, max_uses)
VALUES 
  ('LAUNCH50', 'Launch offer - 50% off', 50, 1000),
  ('FIRST100', 'First 100 users - Free access', 100, 100),
  ('STUDENT20', 'Student discount - 20% off', 20, 500)
ON CONFLICT (code) DO NOTHING;

-- Seed learning modules
INSERT INTO public.learning_modules (slug, title, description, order_index, is_premium)
VALUES 
  ('basics-intro', 'Stock Market Basics', 'Understanding what is stock market, how it works', 1, FALSE),
  ('types-orders', 'Types of Orders', 'Market, Limit, Stop-Loss, SLM, AMO orders', 2, FALSE),
  ('reading-charts', 'Reading Charts', 'Candlesticks, trends, support, resistance', 3, FALSE),
  ('technical-indicators', 'Technical Indicators', 'RSI, MACD, Moving Averages, Bollinger Bands', 4, FALSE),
  ('fundamental-analysis', 'Fundamental Analysis', 'PE ratio, EPS, book value, dividend', 5, FALSE),
  ('risk-management', 'Risk Management', 'Position sizing, portfolio diversification', 6, FALSE)
ON CONFLICT (slug) DO NOTHING;

-- Seed quiz questions for basics
INSERT INTO public.quiz_questions (module_slug, question, options, correct_answer, explanation, difficulty, order_index)
VALUES 
  ('basics-intro', 'What is a stock market?', 
   '["A place to buy groceries", "A marketplace for buying/selling company shares", "A bank", "A grocery store"]', 
   1, 'Stock market is where companies list their shares and investors trade them', 'easy', 1),
  ('basics-intro', 'What does NIFTY 50 represent?', 
   '["Top 50 companies listed on BSE", "Top 50 companies listed on NSE", "A single company", "A type of bond"]', 
   1, 'NIFTY 50 is the 50 largest Indian companies on NSE by market cap', 'easy', 2),
  ('basics-intro', 'What is Demat account?', 
   '["A bank account for money", "An electronic account to hold shares", "A savings account", "A credit card"]', 
   1, 'Demat holds shares in electronic form, like a bank account for stocks', 'easy', 3),
  ('types-orders', 'What is a Market Order?', 
   '["Order at a fixed price", "Buy/sell immediately at best available price", "Order to buy only when price rises", "Order to sell only when price falls"]', 
   1, 'Market orders execute immediately at the best available market price', 'medium', 1),
  ('types-orders', 'What is a Stop-Loss Order?', 
   '["Guaranteed profit order", "Auto-sell when price drops to limit", "Order that never executes", "Order to buy atany price"]', 
   1, 'Stop-loss automatically sells when price falls to limit to limit losses', 'medium', 2),
  ('types-orders', 'What is SLM (Stop-Loss Market)?', 
   ['Same as Limit Order', 'Converts to market order when trigger hit', 'Order that never executes', 'Fixed price order'], 
   1, 'SLM converts to market order once trigger price is hit', 'medium', 3),
  ('reading-charts', 'What does a Green Candlestick indicate?', 
   '["Price fell", "Price closed higher than open", "Price remained same", "High volatility"]', 
   1, 'Green candle = closing price higher than opening price = profit', 'easy', 1),
  ('reading-charts', 'What is Support level?', 
   '["Price ceiling", "Price floor where buying typically increases", "Highest price", "Average price"]', 
   1, 'Support is a price level where stock tends to find buying interest', 'medium', 2),
  ('reading-charts', 'What is Resistance?', 
   '["Price floor", "Price ceiling where selling typically increases", 'Lowest price', 'Average price"]', 
   1, 'Resistance is a price level where selling pressure prevents further rise', 'medium', 3)
ON CONFLICT DO NOTHING;

  `;

  const queries = sql.split(';').filter(q => q.trim());
  
  for (const query of queries) {
    if (query.trim()) {
      try {
        await client.query(query);
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
          console.log('⚠️  Query error:', e.message);
        }
      }
    }
  }

  console.log('\n✅ Education migration complete!\n');
  
  // Check migration results
  const [plans, coupons, modules] = await Promise.all([
    client.query("SELECT name, slug, price FROM public.subscription_plans WHERE slug = 'starter'"),
    client.query("SELECT code, discount_percent FROM public.coupons"),
    client.query("SELECT COUNT(*) as cnt FROM public.learning_modules")
  ]);

  console.log('💰 Starter plan:', plans.rows[0] || 'NOT FOUND');
  console.log('🏷️  Coupons:', coupons.rows.map(c => `${c.code} (${c.discount_percent}%)`).join(', ') || 'none');
  console.log('📖 Learning modules:', modules.rows[0].cnt);

  await client.end();
}

migrate().catch(e => {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
});