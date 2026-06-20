import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      invite_token TEXT,
      invite_accepted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] || null;
}

export async function getUserByToken(token: string) {
  const rows = await sql`SELECT * FROM users WHERE invite_token = ${token}`;
  return rows[0] || null;
}

export async function createUser(email: string, name: string, role: string, token: string) {
  const rows = await sql`
    INSERT INTO users (email, name, role, invite_token)
    VALUES (${email}, ${name}, ${role}, ${token})
    RETURNING *
  `;
  return rows[0];
}

export async function acceptInvite(token: string) {
  const rows = await sql`
    UPDATE users SET invite_accepted = TRUE
    WHERE invite_token = ${token}
    RETURNING *
  `;
  return rows[0];
}

export async function getAllUsers() {
  return sql`SELECT id, email, name, role, invite_accepted, created_at FROM users ORDER BY created_at DESC`;
}

export async function deleteUser(id: number) {
  await sql`DELETE FROM users WHERE id = ${id}`;
}
