import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'followup_session';
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'super-secure-dev-session-secret-key-32-chars-long'
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  orgSlug: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  expiresAt: number;
}

export async function createSessionToken(
  payload: Omit<SessionPayload, 'expiresAt'>,
  durationDays = 30
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + durationDays * 24 * 60 * 60;
  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, 'expiresAt'>) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
