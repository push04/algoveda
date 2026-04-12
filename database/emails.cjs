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
  console.log('Connected! Creating email_logs table...');

  try {
    await client.query(`CREATE TABLE IF NOT EXISTS public.email_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      email_type TEXT,
      recipient TEXT NOT NULL,
      subject TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('Created email_logs table');
  } catch(e) { console.log('Note:', e.message); }

  try {
    await client.query('ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY');
    console.log('RLS enabled');
  } catch(e) {}

  try {
    await client.query('DROP POLICY IF EXISTS email_logs_all_own ON public.email_logs');
    await client.query('CREATE POLICY email_logs_all_own ON public.email_logs FOR ALL USING (auth.uid() = user_id)');
    console.log('Policy created');
  } catch(e) {}

  console.log('Done!');
  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });