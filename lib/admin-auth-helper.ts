import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session';

async function hashValue(val: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(val);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getExpectedToken(): Promise<string> {
  const pwd = process.env.ADMIN_DASHBOARD_PASSWORD || 'default_admin_password';
  return await hashValue(`admin-dashboard-salt-${pwd}`);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const expected = await getExpectedToken();
  return token === expected;
}

/**
 * Validates the current admin session from cookies.
 * Call this at the very beginning of every protected Server Action and API Route.
 * Throws an Error if unauthorized.
 */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    throw new Error('Unauthorized');
  }

  const isValid = await verifySessionToken(sessionToken);
  if (!isValid) {
    throw new Error('Unauthorized');
  }
}
