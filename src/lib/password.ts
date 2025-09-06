import bcrypt from 'bcryptjs';

/**
 * Utility functions for password hashing and verification
 */

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random password
 * @param length Password length (default: 12)
 * @returns Random password
 */
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// For manual password hashing (useful for creating initial admin user)
if (require.main === module) {
  const password = process.argv[2];
  
  if (!password) {
    console.log('Usage: tsx src/lib/password.ts <password>');
    console.log('Example: tsx src/lib/password.ts admin123');
    process.exit(1);
  }
  
  hashPassword(password).then(hash => {
    console.log('Password:', password);
    console.log('Hashed:', hash);
  });
}
