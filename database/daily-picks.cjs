const { Client } = require('pg');

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
  console.log('Creating daily_picks table...');

  try {
    await client.query(`CREATE TABLE IF NOT EXISTS public.daily_picks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol TEXT NOT NULL,
      company_name TEXT,
      pick_date DATE NOT NULL,
      recommendation TEXT,
      target_price NUMERIC,
      stop_loss NUMERIC,
      rationale TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('Table created');
  } catch(e) { console.log('Note:', e.message); }

  try {
    await client.query('ALTER TABLE public.daily_picks ENABLE ROW LEVEL SECURITY');
  } catch(e) {}

  try {
    await client.query('DROP POLICY IF EXISTS daily_picks_read ON public.daily_picks');
    await client.query('CREATE POLICY daily_picks_read ON public.daily_picks FOR SELECT USING (true)');
    console.log('RLS policy created');
  } catch(e) { console.log('Policy note:', e.message); }

  console.log('Done!');
  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });