import crypto from 'crypto';
import { z } from 'zod';
const initDataSchema = z.object({ hash: z.string() }).passthrough();

function buildDataCheckString(obj: Record<string, string>) {
  const entries = Object.entries(obj)
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  return entries;
}

export function verifyInitData(rawInitData: string) {
  const params = new URLSearchParams(rawInitData);
  const obj: Record<string, string> = {};
  params.forEach((v, k) => { obj[k] = v; });

  const parsed = initDataSchema.safeParse(obj);
  if (!parsed.success) return { ok: false, reason: 'bad initData' } as const;

  const { TELEGRAM_BOT_TOKEN } = process.env as Record<string, string>;
  if (!TELEGRAM_BOT_TOKEN) return { ok: false, reason: 'no bot token' } as const;

  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const dataCheckString = buildDataCheckString(obj);
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(obj.hash));
  if (!isValid) return { ok: false, reason: 'bad signature' } as const;

  const userRaw = obj.user ? JSON.parse(obj.user) : null;
  const chatRaw = obj.chat ? JSON.parse(obj.chat) : null;
  const userId = userRaw?.id ?? chatRaw?.id;
  if (!userId) return { ok: false, reason: 'no user id' } as const;

  return { ok: true, userId: Number(userId) } as const;
}
