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
  console.log('Connected! Fixing paper trading balance...\n');

  // Delete existing portfolios to reset
  const deleteCount = await client.query("DELETE FROM public.portfolios WHERE type = 'paper'");
  console.log('Deleted', deleteCount.rowCount, 'existing paper portfolios');

  // Update handle_new_user to NOT create portfolio automatically
  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $func$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, timezone)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'Asia/Kolkata')
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END
    $func$
  `);

  console.log('Updated handle_new_user to NOT create portfolio');
  console.log('Now paper trading will only be available after Starter plan purchase');

  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });