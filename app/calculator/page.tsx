'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalculatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(({ user }) => {
      if (!user) { router.replace('/'); return; }
      setUser(user);
    });
  }, [router]);

  function input(val: string) {
    if (resetNext) { setDisplay(val); setResetNext(false); return; }
    setDisplay(display === '0' ? val : display + val);
  }

  function decimal() {
    if (resetNext) { setDisplay('0.'); setResetNext(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  }

  function operate(nextOp: string) {
    const cur = parseFloat(display);
    if (prev !== null && op && !resetNext) {
      const result = calculate(prev, cur, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setResetNext(true);
  }

  function calculate(a: number, b: number, operation: string) {
    if (operation === '+') return a + b;
    if (operation === '-') return a - b;
    if (operation === '×') return a * b;
    if (operation === '÷') return b !== 0 ? a / b : NaN;
    return b;
  }

  function equals() {
    if (prev === null || !op) return;
    const result = calculate(prev, parseFloat(display), op);
    setDisplay(isNaN(result) ? 'Error' : String(result));
    setPrev(null);
    setOp(null);
    setResetNext(true);
  }

  function clear() {
    setDisplay('0'); setPrev(null); setOp(null); setResetNext(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  }

  const btn = (label: string, onClick: () => void, cls = '') => (
    <button key={label} onClick={onClick}
      className={`h-16 rounded-xl text-xl font-semibold transition-colors ${cls}`}>
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm text-blue-600 hover:underline">Logout</button>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4 shadow-xl">
          {/* Display */}
          <div className="text-right text-white text-4xl font-light px-2 py-4 overflow-hidden">
            {display.length > 12 ? parseFloat(display).toExponential(4) : display}
          </div>
          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {btn('AC', clear, 'col-span-2 bg-gray-400 hover:bg-gray-300 text-gray-900')}
            {btn('+/-', () => setDisplay(String(parseFloat(display) * -1)), 'bg-gray-400 hover:bg-gray-300 text-gray-900')}
            {btn('÷', () => operate('÷'), op === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white')}

            {['7','8','9'].map(n => btn(n, () => input(n), 'bg-gray-600 hover:bg-gray-500 text-white'))}
            {btn('×', () => operate('×'), op === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white')}

            {['4','5','6'].map(n => btn(n, () => input(n), 'bg-gray-600 hover:bg-gray-500 text-white'))}
            {btn('-', () => operate('-'), op === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white')}

            {['1','2','3'].map(n => btn(n, () => input(n), 'bg-gray-600 hover:bg-gray-500 text-white'))}
            {btn('+', () => operate('+'), op === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white')}

            {btn('0', () => input('0'), 'col-span-2 bg-gray-600 hover:bg-gray-500 text-white')}
            {btn('.', decimal, 'bg-gray-600 hover:bg-gray-500 text-white')}
            {btn('=', equals, 'bg-orange-500 hover:bg-orange-400 text-white')}
          </div>
        </div>
      </div>
    </main>
  );
}
