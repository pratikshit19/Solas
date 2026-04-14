"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during the request.');
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
          <p className="text-sm text-slate-500 mt-1">Recovery Flow</p>
        </div>

        <div className="bg-[#0f0f13] border border-[#1e1e24] p-8 rounded-2xl w-full">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-slate-100">Reset Password</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your email and we'll send you a recovery link.</p>
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
                  <Mail className="text-emerald-400 w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-200 font-medium">Email Sent</p>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">
                    Check your inbox for a link to reset your password. It may take a few minutes.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full mt-4 text-[13px] border-[#27272a] text-slate-400">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2.5 text-[13px] focus:ring-1 focus:border-[#3f3f46] focus:ring-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                />

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center pt-2 border-t border-[#1e1e24]/50">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-[11px] text-slate-500 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
