import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken, acceptInvite } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const user = await getUserByToken(token);
  if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

  await acceptInvite(token);

  const jwt = signToken({ userId: user.id, email: user.email, role: user.role });

  const res = NextResponse.redirect(
    new URL(user.role === 'admin' ? '/admin' : '/calculator', req.nextUrl.origin)
  );
  res.cookies.set('auth_token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
