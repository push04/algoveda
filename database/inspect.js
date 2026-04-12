// Inspect existing Supabase database structure
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
  console.log('Connected!\n');

  // Get all tables and their columns
  const tables = ['profiles', 'subscription_plans', 'user_subscriptions', 'backtest_jobs',
    'backtest_results', 'portfolios', 'paper_orders', 'portfolio_holdings',
    'watchlists', 'watchlist_items', 'alert_configs', 'email_preferences',
    'research_reports', 'strategies', 'saved_screens'];

  for (const table of tables) {
    try {
      const cols = await client.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (cols.rows.length > 0) {
        console.log(`\n=== ${table} ===`);
        cols.rows.forEach(c => {
          const def = c.column_default ? ` DEFAULT ${c.column_default.slice(0,30)}` : '';
          const nullable = c.is_nullable === 'NO' ? ' NOT NULL' : '';
          console.log(`  ${c.column_name} (${c.data_type})${nullable}${def}`);
        });
      }
    } catch (e) {
      console.log(`  Table ${table}: ${e.message}`);
    }
  }

  // Check RLS
  console.log('\n=== RLS Status ===');
  const rls = await client.query(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  rls.rows.forEach(r => console.log(`  ${r.tablename}: RLS=${r.rowsecurity}`));

  // Check existing policies
  console.log('\n=== Policies ===');
  const policies = await client.query(`
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `);
  policies.rows.forEach(p => console.log(`  ${p.tablename}: ${p.policyname} (${p.cmd})`));

  await client.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
