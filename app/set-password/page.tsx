'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      console.log('Attempting to set new password');
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      console.log('Set password response:', { status: res.status, data });
      
      if (!res.ok) {
        setError(data.error || 'Failed to set password');
        throw new Error(data.error || 'Failed to set password');
      }
      
      // Redirect to login page
      router.push('/login');
    } catch (error: any) {
      console.error('Set password error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-sm animate-fadein z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-white">Set New Password</CardTitle>
          <CardDescription className="text-white/80">Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="password" className="text-lg font-medium text-white">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-lg font-medium text-white">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 btn-animated" 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Set Password'}
            </Button>
            <div className="flex flex-col items-center gap-3 mt-4">
              <Link href="/login" className="text-white/80 hover:text-white hover:underline text-lg transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 