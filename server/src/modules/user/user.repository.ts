import { pool } from "../../config/db";
import type { CreateUserInput, User } from "./user.model";

export async function ensureUsersTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS users_email_idx
    ON users (email);
  `);
}

function mapUserRow(row: {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role === "admin" ? "admin" : "user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, password, role, created_at, updated_at`,
    [input.name, input.email, input.password, input.role],
  );

  return mapUserRow(rows[0]);
}

export async function countUsers(): Promise<number> {
  const { rows } = await pool.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM users`);
  return Number(rows[0]?.total ?? 0);
}
