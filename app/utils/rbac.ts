import { verifyJWT } from './jwt';

export function requireRole(req: Request, allowedRoles: string[]): { user: any } | { error: string } {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header' };
  }
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyJWT(token);
  if (!payload || typeof payload !== 'object' || !('role' in payload)) {
    return { error: 'Invalid or expired token' };
  }
  if (!allowedRoles.includes((payload as any).role)) {
    return { error: 'Forbidden: insufficient role' };
  }
  return { user: payload };
} 