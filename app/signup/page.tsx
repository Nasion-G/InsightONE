'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function SignupPage() {
  const [identifier, setIdentifier] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!contractNumber) {
      setError('Contract number is required');
      setLoading(false);
      return;
    }

    try {
      let normIdentifier = identifier.replace(/\s+/g, '');
      if (normIdentifier.startsWith('+')) normIdentifier = normIdentifier.slice(1);
      console.log('Attempting signup with:', { identifier: normIdentifier, contract_number: contractNumber });
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: normIdentifier,
          password,
          contract_number: contractNumber
        }),
      });
      const data = await res.json();
      console.log('Signup response:', { status: res.status, data });
      
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        throw new Error(data.error || 'Signup failed');
      }
      
      // Redirect to login page after successful signup
      router.push('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => router.push('/')}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 btn-animated"
        >
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-sm animate-fadein z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-white">Sign Up</CardTitle>
          <CardDescription className="text-white/80">Create your account to access the Smart SME Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="contractNumber" className="text-lg font-medium text-white">
                Contract Number
              </label>
              <Input
                id="contractNumber"
                type="text"
                placeholder="Enter your contract number"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-lg font-medium text-white">
                MSISDN or Phone Number
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your MSISDN or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-lg font-medium text-white">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
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
                placeholder="Confirm your password"
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
              {loading ? 'Loading...' : 'Sign Up'}
            </Button>
            <div className="flex flex-col items-center gap-3 mt-4">
              <Link href="/login" className="text-white/80 hover:text-white hover:underline text-lg transition-colors">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 