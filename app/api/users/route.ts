import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllUsers, deleteUser } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
