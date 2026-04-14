// Verify database state
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

async function run() {
  await client.connect();

  // Check table count
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log(`\n✅ ${tables.rows.length} tables in public schema`);

  // Plans
  const plans = await client.query('SELECT name, slug, price_monthly, max_backtests FROM public.subscription_plans ORDER BY sort_order');
  console.log(`\n✅ ${plans.rows.length} subscription plans:`);
  plans.rows.forEach(r => console.log(`   • ${r.name}: ₹${r.price_monthly/100}/mo, max_backtests=${r.max_backtests}`));

  // Profile columns check
  const profileCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND table_schema='public' ORDER BY column_name`);
  const requiredCols = ['id','email','full_name','is_admin','role','plan','is_active'];
  const existingCols = profileCols.rows.map(r => r.column_name);
  requiredCols.forEach(col => {
    const ok = existingCols.includes(col);
    console.log(`${ok ? '✅' : '❌'} profiles.${col}`);
  });

  // Trigger check
  const triggers = await client.query(`SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema='public' OR event_object_schema='auth' ORDER BY trigger_name`);
  console.log(`\n✅ ${triggers.rows.length} triggers:`);
  triggers.rows.forEach(t => console.log(`   • ${t.trigger_name} on ${t.event_object_table}`));

  await client.end();
}

run().catch(e => console.error('❌', e.message));
