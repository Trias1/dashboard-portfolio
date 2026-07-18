const { Client } = require("pg");
const fs = require("fs");

const raw = fs.readFileSync("D:/project-pribadi/web-server/trias-infrastructure/db-backup/portfolio_latest.sql", "utf8");
const lines = raw.split("\n");

const COPY_PATTERN = /COPY public\.(\w+)\s*\(([^)]+)\)\s+FROM stdin;/;

// Parse only users table
let usersCols = null;
let usersRows = [];
let inUsers = false;

for (const line of lines) {
  const t = line.trim();
  const m = t.match(COPY_PATTERN);
  
  if (m) {
    inUsers = (m[1] === "users");
    if (inUsers) {
      usersCols = m[2].split(",").map(c => c.trim());
    }
    continue;
  }
  
  if (t === "\\.") {
    inUsers = false;
    continue;
  }
  
  if (inUsers && t) {
    const vals = [];
    let cur = "";
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === "\\" && j + 1 < line.length) {
        cur += line[j + 1];
        j++;
      } else if (ch === "\t") {
        vals.push(cur === "\\N" ? null : cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    vals.push(cur === "\\N" ? null : cur);
    usersRows.push(vals);
  }
}

console.log("Users columns:", usersCols);
console.log("Users rows:", usersRows.length);
console.log("First row:", JSON.stringify(usersRows[0]));

async function importUsers() {
  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432, database: "postgres", user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // First, let's try inserting WITHOUT foreign key constraints
  // Disable FK checks temporarily
  await client.query("SET session_replication_role = replica");
  
  const ph = usersCols.map((_, i) => "$" + (i + 1)).join(", ");
  const sql = "INSERT INTO public.users (" + usersCols.join(", ") + ") VALUES (" + ph + ")";
  
  let success = 0;
  for (const row of usersRows) {
    try {
      await client.query(sql, row);
      success++;
    } catch (e) {
      console.log("Error inserting row:", e.message.slice(0, 100));
      console.log("  Row:", JSON.stringify(row).slice(0, 100));
    }
  }
  
  await client.query("SET session_replication_role = origin");
  console.log("Inserted", success, "/", usersRows.length, "users");
  
  // Restore FK checks and try other tables
  if (success > 0) {
    const count = await client.query("SELECT COUNT(*) FROM public.users");
    console.log("Total users now:", count.rows[0].count);
  }
  
  await client.end();
}

importUsers().catch(e => console.error(e.message));
