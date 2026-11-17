import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "users.json");
let sqlClient;
let schemaPromise;

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return { users: [] };
    throw error;
  }
}

function write(data) {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE); // atomic replace
}

function getSqlClient() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL or POSTGRES_URL must be configured in production.");
    }
    return null;
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("The Neon connection string must be a valid PostgreSQL URL.");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech")
  ) {
    throw new Error("The configured database URL is not a Neon PostgreSQL connection.");
  }

  if (!sqlClient) sqlClient = neon(connectionString);
  return sqlClient;
}

async function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reset_token_hash TEXT,
        reset_expires BIGINT NOT NULL DEFAULT 0
      )
    `;
  }

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
    resetTokenHash: row.reset_token_hash,
    resetExpires: Number(row.reset_expires),
  };
}

export const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");

export async function findUserByEmail(email) {
  const sql = getSqlClient();
  if (!sql) return read().users.find((u) => u.email === email) || null;

  await ensureSchema(sql);
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function findUserById(id) {
  const sql = getSqlClient();
  if (!sql) return read().users.find((u) => u.id === id) || null;

  await ensureSchema(sql);
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function createUser({ name, email, passwordHash }) {
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    resetTokenHash: null,
    resetExpires: 0,
  };

  const sql = getSqlClient();
  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      INSERT INTO users (id, name, email, password_hash, created_at, reset_token_hash, reset_expires)
      VALUES (${user.id}, ${name}, ${email}, ${passwordHash}, ${user.createdAt}, NULL, 0)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;
    return rows[0] ? fromRow(rows[0]) : null;
  }

  const db = read();
  if (db.users.some((existing) => existing.email === email)) return null;
  db.users.push(user);
  write(db);
  return user;
}

export async function updateUser(id, patch) {
  const sql = getSqlClient();
  if (sql) {
    await ensureSchema(sql);
    const hasPasswordHash = Object.prototype.hasOwnProperty.call(patch, "passwordHash");
    const hasResetTokenHash = Object.prototype.hasOwnProperty.call(patch, "resetTokenHash");
    const hasResetExpires = Object.prototype.hasOwnProperty.call(patch, "resetExpires");
    const rows = await sql`
      UPDATE users SET
        password_hash = CASE WHEN ${hasPasswordHash} THEN ${hasPasswordHash ? patch.passwordHash : null} ELSE password_hash END,
        reset_token_hash = CASE WHEN ${hasResetTokenHash} THEN ${hasResetTokenHash ? patch.resetTokenHash : null} ELSE reset_token_hash END,
        reset_expires = CASE WHEN ${hasResetExpires} THEN ${hasResetExpires ? patch.resetExpires : null} ELSE reset_expires END
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] ? fromRow(rows[0]) : null;
  }

  const db = read();
  const i = db.users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  db.users[i] = { ...db.users[i], ...patch };
  write(db);
  return db.users[i];
}

export async function findUserByResetToken(token) {
  const h = hashToken(token);
  const sql = getSqlClient();
  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT * FROM users
      WHERE reset_token_hash = ${h} AND reset_expires > ${Date.now()}
      LIMIT 1
    `;
    return rows[0] ? fromRow(rows[0]) : null;
  }

  return (
    read().users.find(
      (u) => u.resetTokenHash === h && u.resetExpires > Date.now()
    ) || null
  );
}
