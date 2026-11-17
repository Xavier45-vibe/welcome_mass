import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Minimal file-backed store behind a repository interface.
// Swap these functions for Postgres/Prisma in production without touching callers.
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "users.json");

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

export const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");

export function findUserByEmail(email) {
  return read().users.find((u) => u.email === email) || null;
}

export function findUserById(id) {
  return read().users.find((u) => u.id === id) || null;
}

export function createUser({ name, email, passwordHash }) {
  const db = read();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    resetTokenHash: null,
    resetExpires: 0,
  };
  db.users.push(user);
  write(db);
  return user;
}

export function updateUser(id, patch) {
  const db = read();
  const i = db.users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  db.users[i] = { ...db.users[i], ...patch };
  write(db);
  return db.users[i];
}

export function findUserByResetToken(token) {
  const h = hashToken(token);
  return (
    read().users.find(
      (u) => u.resetTokenHash === h && u.resetExpires > Date.now()
    ) || null
  );
}
