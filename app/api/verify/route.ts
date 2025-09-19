import { NextRequest, NextResponse } from 'next/server';
import { verifyInitData } from '@/lib/telegram';
import { cookieName, sign } from '@/lib/session';

type VerifyBody = { initData: string };

export async function POST(req: NextRequest) {
  const bodyUnknown: unknown = await req.json().catch(() => null);

  const isValid =
    bodyUnknown &&
    typeof bodyUnknown === 'object' &&
    bodyUnknown !== null &&
    typeof (bodyUnknown as Record<string, unknown>).initData === 'string';

  if (!isValid) {
    return NextResponse.json({ ok: false, error: 'initData required' }, { status: 400 });
  }

  const { initData } = bodyUnknown as VerifyBody;

  const v = verifyInitData(initData);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });
  }

  const chatId = String(v.userId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, sign(chatId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
