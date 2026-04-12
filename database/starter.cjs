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
  console.log('Connected! Adding Starter plan...');

  const sql = `INSERT INTO public.subscription_plans (name, slug, price_monthly, max_ai_suggestions, features, is_active, sort_order)
VALUES ('Starter - Rs 2 Learning', 'starter', 2, 999, '["Complete Stock Market Course","AI MCQ Generator","Unlock Rs 1 Lakh Paper Trading"]', TRUE, 0)
ON CONFLICT (slug) DO UPDATE SET price_monthly = 2, name = 'Starter - Rs 2 Learning'`;

  await client.query(sql);
  console.log('Starter plan added');

  const res = await client.query('SELECT name, slug, price_monthly FROM public.subscription_plans ORDER BY sort_order');
  console.log('All Plans:', res.rows.map(r => `${r.name}: Rs${r.price_monthly}`).join(', '));

  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });