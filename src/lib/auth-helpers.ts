import { NextRequest } from 'next/server';
import { CustomAuth, AuthUser } from '@/lib/custom-auth';

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const user = await CustomAuth.verifySession(sessionToken);
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export function canAccessFinancialRecords(user: AuthUser | null): boolean {
  // Only admins can access financial records
  return user?.role === 'admin';
}
