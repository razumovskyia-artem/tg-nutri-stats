import crypto from 'crypto';
const COOKIE_NAME = 'tgstats_session';
const SECRET = process.env.TELEGRAM_BOT_TOKEN || 'dev';

export function sign(value: string) {
  const sig = crypto.createHmac('sha256', SECRET).update(value).digest('hex');
  return `${value}.${sig}`;
}
export function unsign(signed: string) {
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const sig = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(value).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null;
}
export const cookieName = COOKIE_NAME;
