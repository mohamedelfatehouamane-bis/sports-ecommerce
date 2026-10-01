'use server'

import { cookies } from 'next/headers';
import { getExpectedToken } from '@/lib/admin-auth-helper';

const COOKIE_NAME = 'admin_session';

interface AuthResponse {
  success: boolean;
  error?: string;
}

export async function loginAdmin(password: string): Promise<AuthResponse> {
  try {
    const expectedPassword = process.env.ADMIN_DASHBOARD_PASSWORD;
    if (!expectedPassword) {
      return { success: false, error: 'Admin dashboard password is not configured on the server.' };
    }

    if (password !== expectedPassword) {
      return { success: false, error: 'Incorrect password.' };
    }

    const token = await getExpectedToken();
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

export async function logoutAdmin(): Promise<AuthResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error('Error in logoutAdmin:', error);
    return { success: false, error: 'Internal server error occurred during logout.' };
  }
}
