const { Client } = require("pg");
const fs = require("fs");

const raw = fs.readFileSync("D:/project-pribadi/web-server/trias-infrastructure/db-backup/portfolio_latest.sql", "utf8");
const lines = raw.split("\n");

function parseCopyRow(line) {
  const vals = [];
  let cur = "";
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === "\x5c" && j + 1 < line.length) {
      const next = line[j + 1];
      if (next === "N") { vals.push(null); cur = ""; j++; continue; }
      else if (next === "t") { cur += "\t"; j++; continue; }
      else { cur += next; j++; continue; }
    }
    if (ch === "\t") { vals.push(cur === "" ? null : cur); cur = ""; }
    else { cur += ch; }
  }
  vals.push(cur === "" ? null : cur);
  return vals;
}

// Parse
const order = ["users", "portfolios", "about", "hero", "contact_info", "experience", "projects", "services", "skills", "testimonials", "gallery", "custom_sections", "contact_messages", "portfolio_visits"];
let blocks = {};
let currentTable = null;
const RE = /COPY public\.(\w+)\s*\(([^)]+)\)\s+FROM stdin;/;

for (const line of lines) {
  const t = line.trim();
  const m = t.match(RE);
  if (m) {
    currentTable = m[1];
    if (!blocks[currentTable]) {
      blocks[currentTable] = { cols: m[2].split(",").map(c => c.trim()), rows: [] };
    }
    continue;
  }
  if (t === "." || t === "\\.") { currentTable = null; continue; }
  if (currentTable && t && currentTable !== "clipper_history") {
    blocks[currentTable].rows.push(parseCopyRow(line));
  }
}

console.log("Parsed:");
for (const tn of order) {
  const b = blocks[tn];
  if (b) console.log("  " + tn + ": " + b.rows.length + " rows (" + b.cols.length + " cols)");
}

async function go() {
  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432, database: "postgres", user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query("SET session_replication_role = replica");

  let total = 0;
  for (const tn of order) {
    const block = blocks[tn];
    if (!block || block.rows.length === 0) continue;
    const ph = block.cols.map((_, i) => "$" + (i + 1)).join(", ");
    const sql = "INSERT INTO public." + tn + " (" + block.cols.join(", ") + ") VALUES (" + ph + ")";
    for (const row of block.rows) {
      try {
        await client.query(sql, row.slice(0, block.cols.length));
        total++;
      } catch (e) {}
    }
    process.stdout.write(".");
  }

  await client.query("SET session_replication_role = origin");
  console.log("\nImported " + total + " rows\n");

  for (const tn of order) {
    try {
      const r = await client.query("SELECT COUNT(*) as cnt FROM public." + tn);
      console.log("  " + tn + ": " + r.rows[0].cnt + " rows");
    } catch (e) {}
  }

  await client.end();
}

go().catch(e => console.error(e.message));