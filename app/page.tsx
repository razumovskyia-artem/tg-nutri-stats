'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

type Daily = { day: string; kcal: number; prot: number; fat: number; carb: number };
type Agg = { period?: string; kcal?: number; prot?: number; fat?: number; carb?: number };
type Stats = {
  ok: boolean;
  days7: Daily[];
  days30: Daily[];
  agg7?: Agg;
  agg30?: Agg;
};

function useTelegramInit() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (!tg) return; // если открыто не в Telegram — авторизации не будет
    tg.expand();
    const initData = tg.initData || '';
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((r) => r.json())
      .then((j: { ok?: boolean }) => setOk(!!j?.ok))
      .catch(() => setOk(false));
  }, []);

  return ok;
}

export default function Home() {
  const authed = useTelegramInit();
  const [range, setRange] = useState<'7' | '30'>('7');
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/stats')
      .then((r) => r.json())
      .then((j: Stats) => setData(j))
      .catch(() => setData(null));
  }, [authed]);

  const days: Daily[] = (range === '7' ? data?.days7 : data?.days30) ?? [];
  const donutAgg: Agg | undefined = range === '7' ? data?.agg7 : data?.agg30;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">📊 Статистика</h1>

      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${range === '7' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setRange('7')}
        >
          7 дней
        </button>
        <button
          className={`px-3 py-1 rounded ${range === '30' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setRange('30')}
        >
          30 дней
        </button>
      </div>

      {/* Линия: калории по дням */}
      <div className="h-56 bg-white rounded-xl shadow p-3">
        <h2 className="font-medium mb-2">Калории по дням</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="kcal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="kcal" stroke="#8884d8" fillOpacity={1} fill="url(#kcal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Стек-бар: Б/Ж/У по дням */}
      <div className="h-56 bg-white rounded-xl shadow p-3">
        <h2 className="font-medium mb-2">Б/Ж/У по дням</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="prot" stackId="a" />
            <Bar dataKey="fat" stackId="a" />
            <Bar dataKey="carb" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Карточки: суммарные за период */}
      <div className="grid grid-cols-3 gap-2">
        {(['kcal', 'prot', 'fat', 'carb'] as const).map((k) => (
          <div key={k} className="bg-white rounded-xl shadow p-3 text-center">
            <div className="text-xs uppercase text-gray-500">{k}</div>
            <div className="text-lg font-bold">{donutAgg?.[k] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
