import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.mdofncsxrbmyzhmzwzcm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@Pushpal2004',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  await client.connect();
  console.log('✅ Connected! Running education migration...');

  try {
    await client.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0");
  } catch(e) {}
  try {
    await client.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education_unlocked BOOLEAN DEFAULT FALSE");
  } catch(e) {}

  await client.query(`CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_percent INTEGER,
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW())`).catch(() => {});

  await client.query(`CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW())`).catch(() => {});

  await client.query(`CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_slug TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    order_index INTEGER DEFAULT 0)`).catch(() => {});

  // Fix: use price_monthly instead of price
  await client.query(`INSERT INTO public.subscription_plans (name, slug, price_monthly, billing_cycle, max_ai_suggestions, features, is_active)
VALUES ('Starter - ₹2 Learning', 'starter', 2, 'once', 999, '["Complete Stock Market Course", "AI MCQ Generator", "Unlock ₹1 Lakh Paper Trading"]', TRUE)
ON CONFLICT (slug) DO UPDATE SET price_monthly = 2`).catch(() => {});

  await client.query(`INSERT INTO public.coupons (code, description, discount_percent, max_uses) VALUES 
('LAUNCH50', 'Launch 50% off', 50, 1000),
('FIRST100', 'First 100 free', 100, 100)
ON CONFLICT (code) DO NOTHING`).catch(() => {});

  await client.query(`INSERT INTO public.learning_modules (slug, title, description, order_index) VALUES 
('basics-intro', 'Stock Market Basics', 'What is stock market', 1),
('types-orders', 'Types of Orders', 'Market, Limit, Stop-Loss', 2),
('reading-charts', 'Reading Charts', 'Candlesticks, trends', 3),
('technical-indicators', 'Technical Indicators', 'RSI, MACD', 4),
('fundamental-analysis', 'Fundamental Analysis', 'PE, EPS', 5)
ON CONFLICT (slug) DO NOTHING`).catch(() => {});

  await client.query(`INSERT INTO public.quiz_questions (module_slug, question, options, correct_answer, explanation, difficulty) VALUES 
('basics-intro', 'What is a stock market?', '["Grocery store", "Shares marketplace", "Bank", "Restaurant"]', 1, 'Where company shares are traded', 'easy'),
('basics-intro', 'What is NIFTY 50?', '["BSE top 50", "NSE top 50", "Company", "Bond"]', 1, 'Top 50 NSE companies', 'easy'),
('types-orders', 'What is Market Order?', '["Fixed price", "Best available price", "Delayed", "Stop"]', 1, 'Executes immediately at best price', 'medium'),
('types-orders', 'What is Stop-Loss?', '["Profit guarantee", "Limit losses", "Buy order", "Hold"]', 1, 'Auto-sells to limit losses', 'medium'),
('reading-charts', 'Green candlestick means?', '["Price fell", "Price up", "Same", "Volatile"]', 1, 'Close > Open = Profit', 'easy')`).catch(() => {});

  const [plans, coupons, modules, questions] = await Promise.all([
    client.query("SELECT name, price_monthly, slug FROM public.subscription_plans WHERE slug IN ('starter', 'explorer')"),
    client.query("SELECT code, discount_percent FROM public.coupons"),
    client.query("SELECT slug, title FROM public.learning_modules"),
    client.query("SELECT COUNT(*) as cnt FROM public.quiz_questions")
  ]);

  console.log('\n✅ Education Migration Complete!\n');
  console.log('📋 Plans:', plans.rows.map(p => `${p.name}: ₹${p.price_monthly}`).join(', '));
  console.log('🏷️ Coupons:', coupons.rows.map(c => `${c.code} (-${c.discount_percent}%)`).join(', '));
  console.log('📖 Modules:', modules.rows.map(m => m.title).join(', '));
  console.log('❓ Questions:', questions.rows[0].cnt);

  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error('Error:', e.message); process.exit(1); });