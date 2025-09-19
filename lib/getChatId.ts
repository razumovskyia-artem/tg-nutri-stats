import { cookies } from 'next/headers';
import { cookieName, unsign } from '@/lib/session';
export function getChatIdFromCookie() {
  const c = cookies().get(cookieName)?.value;
  if (!c) return null;
  const v = unsign(c);
  return v ? Number(v) : null;
}
