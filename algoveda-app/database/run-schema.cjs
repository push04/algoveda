// Run Supabase schema migration — statement by statement
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Split into individual statements (split on ; that end a statement)
const statements = raw
  .split(/;(?=\s*(?:--[^\n]*\n|\s)*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|DO|\$\$))/i)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

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
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!\n');

    let ok = 0;
    let skip = 0;
    let fail = 0;

    for (const stmt of statements) {
      const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
      try {
        await client.query(stmt + ';');
        console.log(`✅ ${preview}`);
        ok++;
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('does not exist') && stmt.includes('DROP')) {
          console.log(`⏭  SKIP (already ok): ${preview}`);
          skip++;
        } else {
          console.error(`❌ FAILED: ${preview}`);
          console.error(`   Error: ${err.message}`);
          fail++;
        }
      }
    }

    console.log(`\n📊 Results: ${ok} ok, ${skip} skipped, ${fail} failed`);

    // Verify tables
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in public schema:');
    res.rows.forEach(r => console.log('  -', r.table_name));

    // Count subscription plans
    try {
      const plans = await client.query('SELECT name, slug, price_monthly FROM public.subscription_plans ORDER BY sort_order');
      console.log('\n💳 Subscription Plans:');
      plans.rows.forEach(r => console.log(`  - ${r.name} (${r.slug}): ₹${r.price_monthly / 100}/mo`));
    } catch (e) {
      console.log('Plans table not available:', e.message);
    }

  } catch (err) {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
