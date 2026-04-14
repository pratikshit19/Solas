"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if we have a session (recovery flow sets a temporary session)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?error=Invalid or expired recovery link');
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password.');
    } finally {
      setLoading(false);
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
          <p className="text-sm text-slate-500 mt-1">Security Flow</p>
        </div>

        <div className="bg-[#0f0f13] border border-[#1e1e24] p-8 rounded-2xl w-full">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-slate-100">Set New Password</h2>
            <p className="text-xs text-slate-500 mt-1">Please enter your new secure password below.</p>
          </div>

          <div className="w-full space-y-5">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-md text-center font-medium">
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-200 font-medium">Password Updated</p>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">
                    Your password has been changed successfully. Redirecting you to login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-3 pr-10 py-2.5 text-[13px] focus:ring-1 focus:border-[#3f3f46] focus:ring-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                    />
                    <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-3 pr-10 py-2.5 text-[13px] focus:ring-1 focus:border-[#3f3f46] focus:ring-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                    />
                    <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
