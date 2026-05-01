const { Client } = require('pg');

async function main() {
  require('dotenv').config();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Enrollment'");
  console.log(res.rows.map(r => r.column_name));
  await client.end();
}

main().catch(console.error);
