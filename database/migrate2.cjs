// Migration 2: portfolio on signup + AI suggestion limits
const { Client } = require('pg');

const client = new Client({
  host: 'db.mdofncsxrbmyzhmzwzcm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@Pushpal2004',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

const migrations = [
  // Add max_ai_suggestions to subscription_plans
  `ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_ai_suggestions INTEGER NOT NULL DEFAULT 2`,

  // Set plan-specific suggestion limits
  `UPDATE public.subscription_plans SET max_ai_suggestions=2 WHERE slug='explorer'`,
  `UPDATE public.subscription_plans SET max_ai_suggestions=10 WHERE slug='researcher'`,
  `UPDATE public.subscription_plans SET max_ai_suggestions=50 WHERE slug='pro'`,
  `UPDATE public.subscription_plans SET max_ai_suggestions=999 WHERE slug='institution'`,

  // Ensure portfolios table has type column
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'paper'`,

  // Ensure portfolios has name column
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'My Paper Portfolio'`,

  // Add portfolio RLS if not exists
  `ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "portfolios_user_own" ON public.portfolios`,
  `CREATE POLICY "portfolios_user_own" ON public.portfolios
     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`,

  // Add paper_orders RLS
  `ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "paper_orders_user_own" ON public.paper_orders`,
  `CREATE POLICY "paper_orders_user_own" ON public.paper_orders
     FOR ALL USING (
       portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
     ) WITH CHECK (
       portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
     )`,

  // Add portfolio_holdings RLS
  `ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "holdings_user_own" ON public.portfolio_holdings`,
  `CREATE POLICY "holdings_user_own" ON public.portfolio_holdings
     FOR ALL USING (
       portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
     ) WITH CHECK (
       portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid())
     )`,

  // Update handle_new_user to also create paper portfolio
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
   DECLARE
     new_portfolio_id UUID;
   BEGIN
     INSERT INTO public.profiles (id, email, full_name, avatar_url)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
       NEW.raw_user_meta_data->>'avatar_url'
     )
     ON CONFLICT (id) DO NOTHING;

     INSERT INTO public.portfolios (user_id, name, type, initial_capital, current_cash, is_active)
     VALUES (NEW.id, 'My Paper Portfolio', 'paper', 100000, 100000, true)
     ON CONFLICT DO NOTHING;

     RETURN NEW;
   END;
   $func$`,

  // Recreate trigger to pick up new function
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
  `CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

  // Create portfolios for existing users who don't have one
  `INSERT INTO public.portfolios (user_id, name, type, initial_capital, current_cash, is_active)
   SELECT p.id, 'My Paper Portfolio', 'paper', 100000, 100000, true
   FROM public.profiles p
   WHERE NOT EXISTS (
     SELECT 1 FROM public.portfolios po WHERE po.user_id = p.id AND po.type = 'paper'
   )`,

  // Add updated_at to paper_orders if missing
  `ALTER TABLE public.paper_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,

  // Add current_price to portfolio_holdings for P&L tracking
  `ALTER TABLE public.portfolio_holdings ADD COLUMN IF NOT EXISTS current_price NUMERIC`,
  `ALTER TABLE public.portfolio_holdings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
];

async function run() {
  await client.connect();
  console.log('Connected! Running migration 2...\n');

  let ok = 0, fail = 0;

  for (const stmt of migrations) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 100);
    try {
      await client.query(stmt);
      console.log(`✅ ${preview}`);
      ok++;
    } catch (err) {
      console.error(`❌ ${preview}`);
      console.error(`   ${err.message}`);
      fail++;
    }
  }

  console.log(`\n📊 Migration 2: ${ok} ok, ${fail} failed`);

  // Verify
  const plans = await client.query(
    'SELECT name, slug, max_ai_suggestions FROM public.subscription_plans ORDER BY sort_order'
  );
  console.log('\n💡 AI suggestion limits:');
  plans.rows.forEach(r => console.log(`  ${r.name}: ${r.max_ai_suggestions} suggestions`));

  const portfolios = await client.query(
    'SELECT COUNT(*) as cnt FROM public.portfolios WHERE type=\'paper\''
  );
  console.log(`\n💼 Paper portfolios: ${portfolios.rows[0].cnt}`);

  await client.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
