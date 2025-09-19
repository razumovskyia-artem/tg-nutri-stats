import { NextRequest, NextResponse } from 'next/server';
import { verifyInitData } from '@/lib/telegram';
import { cookieName, sign } from '@/lib/session';

export async function POST(req: NextRequest) {
  let json: any;
  try { json = await req.json(); } catch { json = {}; }
  const { initData } = json;
  if (typeof initData !== 'string') {
    return NextResponse.json({ ok: false, error: 'initData required' }, { status: 400 });
  }
  const v = verifyInitData(initData);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });
  }
  const chatId = String(v.userId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, sign(chatId), {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
