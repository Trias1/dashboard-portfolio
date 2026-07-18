const { Client } = require("pg");
const fs = require("fs");

const raw = fs.readFileSync("D:/project-pribadi/web-server/trias-infrastructure/db-backup/portfolio_latest.sql", "utf8");
const lines = raw.split("\n");

function parseCopyRow(line) {
  const vals = [];
  let cur = "";
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === "\\" && j + 1 < line.length) {
      const next = line[j + 1];
      if (next === "N") { vals.push(null); cur = ""; j++; continue; }
      else { cur += next; j++; continue; }
    }
    if (ch === "\t") { vals.push(cur === "" ? null : cur); cur = ""; }
    else cur += ch;
  }
  vals.push(cur === "" ? null : cur);
  return vals;
}

// Find users
let cols = null;
let rows = [];
let inTable = false;

for (const line of lines) {
  const t = line.trim();
  const m = t.match(/COPY public\.(\w+)\s*\(([^)]+)\)\s+FROM stdin;/);
  if (m) {
    inTable = (m[1] === "users");
    if (inTable) cols = m[2].split(",").map(c => c.trim());
    continue;
  }
  if (t === "." || t === "\\.") { inTable = false; continue; }
  if (inTable && t) rows.push(parseCopyRow(line));
}

async function go() {
  const client = new Client({
    host: "db.ywqmijxbdcmsuiufskvk.supabase.co",
    port: 5432, database: "postgres", user: "postgres",
    password: "@Zulfatrias010598",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const ph = cols.map((_, i) => "$" + (i + 1)).join(", ");
  const sql = "INSERT INTO public.users (" + cols.join(", ") + ") VALUES (" + ph + ")";

  for (let i = 0; i < rows.length; i++) {
    try {
      await client.query(sql, rows[i]);
      console.log("Row " + i + " OK!");
    } catch (e) {
      console.log("Row " + i + " ERROR:", e.message.slice(0, 120));
    }
  }

  await client.end();
}

go();
