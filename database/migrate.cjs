// Targeted migration to add missing columns and fix database issues
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
  // ── subscription_plans: add missing columns ──────────────
  `ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT`,
  `ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_backtests INTEGER NOT NULL DEFAULT 5`,
  `ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_watchlists INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS email_frequency_min INTEGER NOT NULL DEFAULT 1440`,

  // ── Update existing plan limits ──────────────────────────
  `UPDATE public.subscription_plans SET max_backtests=5, max_watchlists=1, email_frequency_min=1440 WHERE slug='explorer'`,
  `UPDATE public.subscription_plans SET max_backtests=50, max_watchlists=5, email_frequency_min=360 WHERE slug='researcher'`,
  `UPDATE public.subscription_plans SET max_backtests=999, max_watchlists=99, email_frequency_min=60 WHERE slug='pro'`,
  `UPDATE public.subscription_plans SET max_backtests=9999, max_watchlists=9999, email_frequency_min=15 WHERE slug='institution'`,

  // ── user_subscriptions: add missing columns ──────────────
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS backtests_used_this_month INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT`,

  // ── portfolios: add missing columns ─────────────────────
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS initial_capital NUMERIC NOT NULL DEFAULT 100000`,
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS current_cash NUMERIC NOT NULL DEFAULT 100000`,
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,

  // ── email_preferences: add user_id column ────────────────
  `ALTER TABLE public.email_preferences ADD COLUMN IF NOT EXISTS user_id UUID`,
  `UPDATE public.email_preferences SET user_id = id WHERE user_id IS NULL`,

  // ── backtest_jobs: add parameters column ─────────────────
  `ALTER TABLE public.backtest_jobs ADD COLUMN IF NOT EXISTS parameters JSONB NOT NULL DEFAULT '{}'`,

  // ── watchlists: add symbols column for compatibility ──────
  `ALTER TABLE public.watchlists ADD COLUMN IF NOT EXISTS symbols JSONB NOT NULL DEFAULT '[]'`,
  `ALTER TABLE public.watchlists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,

  // ── Create set_updated_at function ───────────────────────
  `CREATE OR REPLACE FUNCTION public.set_updated_at()
   RETURNS TRIGGER LANGUAGE plpgsql AS $func$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $func$`,

  // ── Create handle_new_user function ──────────────────────
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
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
   $func$`,

  // ── Triggers ─────────────────────────────────────────────
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
  `CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

  `DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles`,
  `CREATE TRIGGER set_profiles_updated_at
     BEFORE UPDATE ON public.profiles
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,

  `DROP TRIGGER IF EXISTS set_plans_updated_at ON public.subscription_plans`,
  `CREATE TRIGGER set_plans_updated_at
     BEFORE UPDATE ON public.subscription_plans
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,

  // ── Fix email_preferences RLS policy ─────────────────────
  `DROP POLICY IF EXISTS "email_prefs_all_own" ON public.email_preferences`,
  `CREATE POLICY "email_prefs_all_own" ON public.email_preferences
     FOR ALL USING (auth.uid() = user_id)`,

  // ── Add portfolio policy ──────────────────────────────────
  `DROP POLICY IF EXISTS "portfolios_all_own" ON public.portfolios`,
  `CREATE POLICY "portfolios_all_own" ON public.portfolios
     FOR ALL USING (auth.uid() = user_id)`,
];

async function run() {
  await client.connect();
  console.log('Connected! Running targeted migration...\n');

  let ok = 0, fail = 0;

  for (const stmt of migrations) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
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

  console.log(`\n📊 Migration: ${ok} ok, ${fail} failed`);

  // Verify final state
  const plans = await client.query(
    'SELECT name, slug, price_monthly, max_backtests, max_watchlists FROM public.subscription_plans ORDER BY sort_order'
  );
  console.log('\n💳 Plans (with limits):');
  plans.rows.forEach(r =>
    console.log(`  ${r.name}: ₹${r.price_monthly/100}/mo | backtests=${r.max_backtests} watchlists=${r.max_watchlists}`)
  );

  await client.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
