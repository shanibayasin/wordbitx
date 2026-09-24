'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Kanban, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card.tsx';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarah.jenkins@acme.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in simulation / NextAuth flow
      if (!email || !password) {
        throw new Error('Please fill in both email and password.');
      }
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950/90 text-white shadow-2xl backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Kanban className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome back to WordbitX</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your organization dashboard and sales pipeline
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-indigo-300 block">Demo Admin Credentials:</span>
              <span>sarah.jenkins@acme.io / password123</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold py-2">
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <p className="text-xs text-center text-slate-400">
              Need a new tenant workspace?{' '}
              <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
                Register Organization
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
