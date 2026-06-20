'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(({ user }) => {
        if (!user) return;
        router.replace(user.role === 'admin' ? '/admin' : '/calculator');
      });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Calculator App</h1>
        <p className="text-gray-500">Check your email for your login link.</p>
      </div>
    </main>
  );
}
