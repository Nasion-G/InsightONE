import { createHash } from 'crypto';

export function hashPassword(password: string): string {
  if (!process.env.PASSWORD_SALT) {
    throw new Error('PASSWORD_SALT environment variable is not set');
  }
  return createHash('sha256')
    .update(password + process.env.PASSWORD_SALT)
    .digest('hex');
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
} 