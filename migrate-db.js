const { Client } = require("pg");
const fs = require("fs");

async function main() {
  const sqlFile = "D:/project-pribadi/web-server/trias-infrastructure/db-backup/portfolio_latest.sql";
  let sql = fs.readFileSync(sqlFile, "utf8");

  // Remove restrict lines and pg_dump metadata
  sql = sql.replace(/\\restrict .+/g, "");
  sql = sql.replace(/\\unrestrict .+/g, "");
  sql = sql.replace(/SET .+;/g, "");
  sql = sql.replace(/SELECT pg_catalog.+;/g, "");
  sql = sql.replace(/ALTER .+ OWNER TO .+;/g, "");
  
  // Remove comment-only lines
  sql = sql.replace(/^--.*$/gm, "");
  
  // Clean up blank lines
  sql = sql.replace(/\n{3,}/g, "\n\n").trim();

  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected!");

    // Split by semicolons
    const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
    console.log(`Found ${statements.length} SQL statements`);

    let success = 0;
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        success++;
        if (i % 5 === 0) process.stdout.write(".");
      } catch (err) {
        if (err.code === "42P07") process.stdout.write("s"); // skip exists
        else if (err.code === "42710") process.stdout.write("s");
        else console.log(`\n  Err #${i}: ${err.message.slice(0, 100)}`);
      }
    }
    
    console.log(`\n\n${success} statements executed successfully!`);

    // Add rate_limits table
    await client.query(`CREATE TABLE IF NOT EXISTS rate_limits (
      id BIGSERIAL PRIMARY KEY,
      identifier TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '"'"'global'"'"',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits (identifier, type, created_at)`);
    console.log("rate_limits table created!");

    // Create storage bucket
    try {
      await client.query(`INSERT INTO storage.buckets (id, name, public) VALUES ('"'"'uploads'"'"', '"'"'uploads'"'"', true) ON CONFLICT (id) DO NOTHING`);
      console.log("uploads bucket created!");
    } catch (e) {
      console.log("Bucket note:", e.message.slice(0, 80));
    }

    console.log("\n? MIGRATION COMPLETE!");
  } catch (err) {
    console.error("Fatal:", err.message);
  } finally {
    await client.end();
  }
}

main();
