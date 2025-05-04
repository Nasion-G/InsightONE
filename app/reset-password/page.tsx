'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [msisdn, setMsisdn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let normMsisdn = msisdn.replace(/\s+/g, '');
      if (normMsisdn.startsWith('+')) normMsisdn = normMsisdn.slice(1);
      console.log('Attempting password reset for:', { msisdn: normMsisdn });
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msisdn: normMsisdn }),
      });
      const data = await res.json();
      console.log('Reset password response:', { status: res.status, data });
      
      if (!res.ok) {
        setError(data.error || 'Password reset failed');
        throw new Error(data.error || 'Password reset failed');
      }
      
      // Redirect to set password page
      router.push('/set-password');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-sm animate-fadein z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-white">Reset Password</CardTitle>
          <CardDescription className="text-white/80">Enter your MSISDN to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="msisdn" className="text-lg font-medium text-white">
                MSISDN
              </label>
              <Input
                id="msisdn"
                type="text"
                placeholder="Enter your MSISDN"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 btn-animated" 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Reset Password'}
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