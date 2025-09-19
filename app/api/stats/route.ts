import { NextResponse } from 'next/server';
import { supaSrv } from '@/lib/supabase';
import { getChatIdFromCookie } from '@/lib/getChatId';

export async function GET() {
  const chatId = getChatIdFromCookie();
  if (!chatId) return NextResponse.json({ ok: false, error: 'no auth' }, { status: 401 });

  const d7 = new Date(Date.now() - 6 * 86400000).toISOString().slice(0,10);
  const d30 = new Date(Date.now() - 29 * 86400000).toISOString().slice(0,10);

  const { data: days7 } = await supaSrv
    .from('v_daily_totals').select('*').eq('chat_id', chatId).gte('day', d7).order('day', { ascending: true });

  const { data: days30 } = await supaSrv
    .from('v_daily_totals').select('*').eq('chat_id', chatId).gte('day', d30).order('day', { ascending: true });

  const { data: agg7 } = await supaSrv.rpc('f_totals_since', { chat: chatId, days: 7 });
  const { data: agg30 } = await supaSrv.rpc('f_totals_since', { chat: chatId, days: 30 });

  return NextResponse.json({ ok: true, days7, days30, agg7: agg7?.[0], agg30: agg30?.[0] });
}
