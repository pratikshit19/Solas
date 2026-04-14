"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Brain, Zap, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200 selection:bg-violet-500/30 overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/C:/Users/Pratikshit/.gemini/antigravity/brain/9e803187-d209-4194-8ac1-dbbd11782a6f/solas_landing_hero_1776207102106.png')] bg-cover bg-center opacity-20 mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 h-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Shield className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">Solas OS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors">SignIn</Link>
          <Link href={session ? "/sanctuary" : "/login"}>
            <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full px-5 text-xs font-bold">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-40 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/30 border border-violet-500/20 text-[10px] uppercase tracking-widest font-bold text-violet-400 mb-8"
          >
            <Sparkles size={12} /> Sentinel AI Now Active
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-100 mb-8 leading-[1.1]"
          >
            Your Emotional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 italic">Operating System.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Solas is a private, high-fidelity sanctuary for your mind. Powered by flagship intelligence to help you restructure thoughts and track your emotional trajectory.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={session ? "/sanctuary" : "/login"}>
              <Button size="lg" className="h-14 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-base shadow-2xl shadow-white/10 group">
                {session ? 'Return to Sanctuary' : 'Start Your Journey'}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button size="lg" variant="outline" className="h-14 px-8 border-slate-800 text-slate-300 hover:bg-[#18181b] rounded-full font-bold text-base">
                View Sentinel Pro
              </Button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={itemVariants}
            className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            <FeatureCard 
              icon={<Brain className="text-violet-400" />}
              title="Cognitive Analysis"
              description="Identify and restructure 15+ types of cognitive distortions with real-time AI guidance."
            />
            <FeatureCard 
              icon={<Zap className="text-violet-400" />}
              title="High-Parameter Reasoning"
              description="Powered by Llama-3.3-70B for deep emotional resonance and logical consistency."
            />
            <FeatureCard 
              icon={<Lock className="text-violet-400" />}
              title="End-to-End Privacy"
              description="Your data is your own. Strictly encrypted, never sold, and locally processed where possible."
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Refined Footer */}
      <footer className="relative z-10 py-12 border-t border-[#1e1e24] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            © 2026 Solas OS. Beyond Mental Health.
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-600">
            <Link href="#" className="hover:text-slate-400">Privacy</Link>
            <Link href="#" className="hover:text-slate-400">Terms</Link>
            <Link href="#" className="hover:text-slate-400">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-8 rounded-2xl bg-[#0f0f13] border border-[#1e1e24] hover:border-violet-500/30 transition-all hover:bg-[#131317] group">
      <div className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
