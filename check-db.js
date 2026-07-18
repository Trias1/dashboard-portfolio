const { Client } = require("pg");

async function main() {
  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    // Check existing tables
    const tables = await client.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("Tables in database:");
    tables.rows.forEach(t => console.log("  - " + t.tablename));
    
    // Create rate_limits safely
    console.log("\nCreating rate_limits table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id BIGSERIAL PRIMARY KEY,
        identifier TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'global',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
      ON rate_limits (identifier, type, created_at)
    `);
    console.log("rate_limits table OK!");
    
    // Check storage bucket
    const buckets = await client.query("SELECT id, name FROM storage.buckets WHERE name = 'uploads'");
    if (buckets.rows.length === 0) {
      await client.query("INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)");
      console.log("uploads bucket created!");
    } else {
      console.log("uploads bucket already exists!");
    }
    
    console.log("\n? SEMUA BERES!");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
