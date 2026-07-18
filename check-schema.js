const { Client } = require("pg");

async function testUserInsert() {
  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432, database: "postgres", user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Try inserting a simple user
  try {
    // First check table structure
    const r = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    r.rows.forEach(col => console.log(col.column_name + ": " + col.data_type));
  } catch (e) {
    console.log("Error checking schema:", e.message);
  }
  
  await client.end();
}

testUserInsert();
