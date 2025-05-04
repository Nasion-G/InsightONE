import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserRoleFromJWT(token: string): string | null {
  const payload = verifyJWT(token);
  if (payload && typeof payload === 'object' && 'role' in payload) {
    return (payload as any).role;
  }
  return null;
} 