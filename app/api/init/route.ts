import { NextResponse } from 'next/server';
import { initDb, getUserByEmail, createUser } from '@/lib/db';
import { randomBytes } from 'crypto';

// Called once on first deploy to set up DB and create the admin user
export async function GET() {
  await initDb();

  const adminEmail = process.env.ADMIN_EMAIL || 'rdc2424@gmail.com';
  const existing = await getUserByEmail(adminEmail);

  if (!existing) {
    const token = randomBytes(32).toString('hex');
    await createUser(adminEmail, 'Admin', 'admin', token);
  }

  return NextResponse.json({ ok: true, message: 'Database initialized' });
}
