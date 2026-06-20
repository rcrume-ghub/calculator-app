import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail, createUser } from '@/lib/db';
import { sendInviteEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, name } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const token = randomBytes(32).toString('hex');
  await createUser(email, name, 'member', token);

  try {
    await sendInviteEmail(email, name, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `User created but email failed: ${message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
