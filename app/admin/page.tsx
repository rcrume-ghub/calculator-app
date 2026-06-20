'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  invite_accepted: boolean;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(({ user }) => {
      if (!user || user.role !== 'admin') { router.replace('/'); return; }
      loadUsers();
    });
  }, [router]);

  async function loadUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus(`Invite sent to ${email}`);
      setName(''); setEmail('');
      loadUsers();
    } else {
      setStatus(`Error: ${data.error}`);
    }
    setLoading(false);
  }

  async function remove(id: number) {
    if (!confirm('Remove this user?')) return;
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadUsers();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button onClick={logout} className="text-sm text-blue-600 hover:underline">Logout</button>
        </div>

        {/* Invite Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
          <form onSubmit={invite} className="flex flex-col gap-3">
            <input
              type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)}
              required className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              required className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
            {status && <p className={`text-sm ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>}
          </form>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          {users.length === 0 ? (
            <p className="text-gray-400 text-sm">No users yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.invite_accepted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.invite_accepted ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => remove(u.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
