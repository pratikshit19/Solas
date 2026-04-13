"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Shield, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email for the confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google login.');
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b] text-slate-200 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Solas OS</h1>
          <p className="text-sm text-slate-500 mt-1">Emotional Operating System</p>
        </div>

        <div className="bg-[#0f0f13] border border-[#1e1e24] p-8 rounded-2xl w-full relative">
          <div className="w-full space-y-5">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-md text-center font-medium">
                {error}
              </div>
            )}
            
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={googleLoading || loading}
              className="w-full py-2.5 rounded-md border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] hover:border-[#3f3f46] text-slate-300 font-medium text-[13px] transition-all flex items-center justify-center gap-2"
            >
              {googleLoading ? <Loader2 className="animate-spin text-slate-500" size={14} /> : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-[#1e1e24]"></div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-1 h-px bg-[#1e1e24]"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2.5 text-[13px] focus:ring-1 focus:border-[#3f3f46] focus:ring-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2.5 text-[13px] focus:ring-1 focus:border-[#3f3f46] focus:ring-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || googleLoading} 
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] text-slate-400 hover:text-violet-400 transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-violet-500 hover:text-violet-400 font-medium transition-colors">Sign Up</span></>
              ) : (
                <>Already have an account? <span className="text-violet-500 hover:text-violet-400 font-medium transition-colors">Sign In</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
