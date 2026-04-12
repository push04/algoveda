// Migration: Fix profiles RLS + research rate limiting
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
  // Allow users to update their own profile
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
  END $$`,

  // Allow users to read their own profile (in case missing)
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
    ) THEN
      CREATE POLICY "Users can read own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;
  END $$`,

  // Create research_usage table for rate limiting
  `CREATE TABLE IF NOT EXISTS public.research_usage (
    id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol   TEXT NOT NULL DEFAULT '',
    used_at  TIMESTAMPTZ DEFAULT now() NOT NULL
  )`,

  `ALTER TABLE public.research_usage ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'research_usage' AND policyname = 'Users can manage own usage'
    ) THEN
      CREATE POLICY "Users can manage own usage" ON public.research_usage
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$`,

  // Service role can also read (for admin)
  `CREATE INDEX IF NOT EXISTS idx_research_usage_user_time
    ON public.research_usage (user_id, used_at DESC)`,

  // Allow email_preferences management for own row
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'email_preferences' AND policyname = 'Users can manage own prefs'
    ) THEN
      CREATE POLICY "Users can manage own prefs" ON public.email_preferences
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$`,
];

async function run() {
  await client.connect();
  console.log('Connected to Supabase Postgres\n');
  let passed = 0;
  for (let i = 0; i < migrations.length; i++) {
    try {
      await client.query(migrations[i]);
      console.log(`  [${i + 1}/${migrations.length}] ✓`);
      passed++;
    } catch (e) {
      console.log(`  [${i + 1}/${migrations.length}] skip: ${e.message.split('\n')[0]}`);
    }
  }
  await client.end();
  console.log(`\n✓ Done: ${passed}/${migrations.length} migrations applied`);
}

run().catch(e => { console.error(e); process.exit(1); });
