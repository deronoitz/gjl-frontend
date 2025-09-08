import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client for auth operations
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthUser {
  id: string;
  houseNumber: string;
  name: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  houseNumber: string;
  password: string;
}

export interface RegisterData {
  houseNumber: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}

export class CustomAuth {
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Login user with house number and password
   */
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; sessionToken: string } | null> {
    try {
      // Get user by house number
      const { data: user, error: userError } = await supabaseService
        .from('users')
        .select('*')
        .eq('house_number', credentials.houseNumber)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

      if (!isPasswordValid) {
        console.error('Invalid password');
        return null;
      }

      // Create session token
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      // Save session to database
      const { error: sessionError } = await supabaseService
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error('Failed to create session:', sessionError);
        return null;
      }

      // Update last login
      await supabaseService
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Clean up expired sessions for this user
      await this.cleanUserExpiredSessions(user.id);

      return {
        user: this.mapDbUserToAuthUser(user),
        sessionToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<AuthUser | null> {
    try {
      // Check if house number already exists
      const { data: existingUser } = await supabaseService
        .from('users')
        .select('house_number')
        .eq('house_number', userData.houseNumber)
        .single();

      if (existingUser) {
        throw new Error('House number already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create user
      const { data: newUser, error } = await supabaseService
        .from('users')
        .insert({
          house_number: userData.houseNumber,
          name: userData.name,
          password_hash: passwordHash,
          role: userData.role || 'user',
        })
        .select()
        .single();

      if (error || !newUser) {
        console.error('Failed to create user:', error);
        return null;
      }

      return this.mapDbUserToAuthUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  /**
   * Verify session token and get user
   */
  static async verifySession(sessionToken: string): Promise<AuthUser | null> {
    try {
      // Get session with user data
      const { data: session, error } = await supabaseService
        .from('user_sessions')
        .select(`
          user_id,
          expires_at,
          users (*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session || !session.users) {
        return null;
      }

      // Get user data
      const user = Array.isArray(session.users) ? session.users[0] : session.users;

      return this.mapDbUserToAuthUser(user as { id: string; house_number: string; name: string; phone_number?: string; role: 'admin' | 'user'; created_at?: string; updated_at?: string; });
    } catch (error) {
      console.error('Session verification error:', error);
      return null;
    }
  }

  /**
   * Logout user (remove session)
   */
  static async logout(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabaseService
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return !error;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Update user data
   */
  static async updateUser(userId: string, updates: Partial<RegisterData>): Promise<AuthUser | null> {
    try {
      const updateData: Record<string, string> = {};

      if (updates.houseNumber) updateData.house_number = updates.houseNumber;
      if (updates.name) updateData.name = updates.name;
      if (updates.role) updateData.role = updates.role;

      if (updates.password) {
        updateData.password_hash = await bcrypt.hash(updates.password, 12);
      }

      // Always update the timestamp
      updateData.updated_at = new Date().toISOString();

      const { data: updatedUser, error } = await supabaseService
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('Failed to update user:', error);
        return null;
      }

      return this.mapDbUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  /**
   * Generate secure session token
   */
  private static generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Map database user to AuthUser interface
   */
  private static mapDbUserToAuthUser(dbUser: { id: string; house_number: string; name: string; phone_number?: string; role: 'admin' | 'user'; created_at?: string; updated_at?: string; }): AuthUser {
    return {
      id: dbUser.id,
      houseNumber: dbUser.house_number,
      name: dbUser.name,
      phoneNumber: dbUser.phone_number,
      role: dbUser.role,
      createdAt: dbUser.created_at ? new Date(dbUser.created_at) : undefined,
      updatedAt: dbUser.updated_at ? new Date(dbUser.updated_at) : undefined,
    };
  }

  /**
   * Clean expired sessions for a user
   */
  private static async cleanUserExpiredSessions(userId: string): Promise<void> {
    try {
      await supabaseService
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Failed to clean expired sessions:', error);
    }
  }

  /**
   * Clean all expired sessions (can be run as a cron job)
   */
  static async cleanAllExpiredSessions(): Promise<void> {
    try {
      await supabaseService.rpc('clean_expired_sessions');
    } catch (error) {
      console.error('Failed to clean expired sessions:', error);
    }
  }
}
