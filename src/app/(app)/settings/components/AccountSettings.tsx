"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchUser();
  }, [supabase]);

  const handlePasswordReset = async () => {
    if (!email) return;
    setLoading(true);
    setSuccess(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you absolutely sure you wish to terminate your emotional context and trajectory data? This cannot be undone.");
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      await supabase.auth.signOut();
      router.push('/login');
    } catch(err: any) {
       console.error(err);
       alert("Error deleting account: " + err.message);
       setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div>
        <h2 className="text-lg md:text-xl font-medium text-slate-100 flex items-center gap-2">
          <ShieldCheck size={20} className="text-violet-500 shrink-0" />
          Account Structure
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your credentials and core account identity.</p>
      </div>

      <div className="space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <Label htmlFor="email">Registered Email Address</Label>
          <Input 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled 
            className="opacity-70 bg-[#0f0f13]"
          />
          <p className="text-[11px] md:text-xs text-slate-500 mt-1">Contact support to change your primary email vector.</p>
        </div>

        <div className="pt-4 border-t border-[#1e1e24] space-y-4">
          <h3 className="text-sm font-medium text-slate-200">Security Parameters</h3>
          <p className="text-[11px] md:text-xs text-slate-400 mb-4 leading-relaxed">Ensure your account is using a long, random password cryptographic to stay secure.</p>
          
          <div className="space-y-3">
             <Button onClick={handlePasswordReset} disabled={loading || success} variant="outline" className="w-full justify-center">
               {loading ? "Transmitting link..." : "Send Password Reset Link"}
             </Button>
             
             {success && (
               <div className="flex items-center gap-2 text-[11px] text-emerald-400 p-2 bg-emerald-950/20 rounded border border-emerald-900/30">
                 <CheckCircle2 size={12} className="shrink-0" />
                 <span>Reset instructions transmitted to your email. Ensure to check your spam filter.</span>
               </div>
             )}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#1e1e24]">
          <h3 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-2 w-full">
            <AlertCircle size={16} className="shrink-0" /> Danger Zone
          </h3>
          <p className="text-[11px] md:text-xs text-slate-400 mb-4 leading-relaxed">Permanently format your account and all emotional trajectory data. This action cannot be reversed.</p>
          <Button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            variant="outline" 
            className="w-full justify-center bg-red-950/40 text-red-500 hover:bg-red-900 border border-red-900/50"
          >
            {deleting ? "Formatting Data..." : "Delete Account Data"}
          </Button>
        </div>
      </div>
    </div>
  );
}
