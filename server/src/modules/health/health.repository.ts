import { pool } from "../../config/db";

export async function getDatabaseTime(): Promise<string | null> {
  const { rows } = await pool.query<{ now: string }>("SELECT NOW() AS now");
  return rows[0]?.now ?? null;
}
