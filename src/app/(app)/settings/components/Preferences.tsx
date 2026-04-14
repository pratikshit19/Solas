"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Bell, Moon, BrainCircuit, CheckCircle2, Hash, Smartphone, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    dailyCheckins: true,
    crisisAlerts: true,
    darkMode: true,
    dataProcessing: true
  });
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState<'standard' | 'sentinel'>('standard');
  const supabase = createClient();

  useEffect(() => {
    // Load preferences and tier on mount
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.preferences) {
        setPrefs((prev) => ({ ...prev, ...user.user_metadata.preferences }));
      }
      if (user?.user_metadata?.tier === 'sentinel') {
        setTier('sentinel');
      }
    };
    fetchData();
  }, [supabase]);

  // Instantly toggle UI and send diff to backend
  const togglePref = async (key: keyof typeof prefs) => {
    const newVal = !prefs[key];
    const newPrefs = { ...prefs, [key]: newVal };
    setPrefs(newPrefs);
    setSaving(true);
    
    try {
      await supabase.auth.updateUser({
        data: { preferences: newPrefs }
      });
    } catch(err) {
      console.error(err);
      // rollback on error
      setPrefs(prefs); 
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <Bell size={20} className="text-violet-500 shrink-0" />
            Global Constraints
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure how Solas operates implicitly.</p>
        </div>
        {saving && <span className="text-[10px] text-slate-500 uppercase flex items-center bg-[#1e1e24] px-2 py-1 rounded tracking-widest font-semibold shadow-inner border border-white/5 animate-pulse">Syncing</span>}
      </div>

      <div className="space-y-8 max-w-2xl w-full">
        
        {/* Communications section */}
        <section className="space-y-3 md:space-y-4">
          <h3 className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">Communication Protocol</h3>
          <div className="space-y-4 p-4 rounded-xl border border-[#1e1e24] bg-[#0c0c0e]">
             <ToggleItem 
               label="Daily Reflections" 
               description="Receive minimal pulse-checks via email to track your trajectory."
               active={prefs.dailyCheckins}
               onClick={() => togglePref('dailyCheckins')}
             />
             <div className="h-px w-full bg-[#1e1e24]"></div>
             <ToggleItem 
               label="Safety Alerts" 
               description="Critical notifications if the engine identifies a potential crisis state."
               active={prefs.crisisAlerts}
               onClick={() => togglePref('crisisAlerts')}
             />
          </div>
        </section>

        {/* System section */}
        <section className="space-y-3 md:space-y-4">
          <h3 className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">System Interface</h3>
          <div className="space-y-4 p-4 rounded-xl border border-[#1e1e24] bg-[#0c0c0e]">
             <ToggleItem 
               label="Absolute Dark Mode" 
               description="Force strict hardware-accelerated dark aesthetics."
               active={prefs.darkMode}
               onClick={() => togglePref('darkMode')}
               icon={<Moon size={14} className="text-slate-500 shrink-0" />}
             />
             <div className="h-px w-full bg-[#1e1e24]"></div>
             <ToggleItem 
               label="Continuous Processing" 
               description="Allow the OS to passively process journals in the background."
               active={prefs.dataProcessing}
               onClick={() => togglePref('dataProcessing')}
               icon={<BrainCircuit size={14} className="text-slate-500 shrink-0" />}
             />
          </div>
        </section>

        {/* Sentinel Integrations section */}
        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">Sentinel Integrations</h3>
            {tier !== 'sentinel' && (
              <span className="text-[9px] bg-violet-950/40 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Pro</span>
            )}
          </div>
          <div className={cn(
             "space-y-4 p-4 rounded-xl border border-[#1e1e24] bg-[#0c0c0e] relative overflow-hidden",
             tier !== 'sentinel' && "opacity-60"
          )}>
             <ToggleItem 
               label="Slack Sync" 
               description="Forward high-intensity insights to your private Slack workspace."
               active={tier === 'sentinel' && (prefs as any).slackSync}
               onClick={tier === 'sentinel' ? () => togglePref('slackSync' as any) : undefined}
               icon={<Hash size={14} className="text-slate-500 shrink-0" />}
               disabled={tier !== 'sentinel'}
             />
             <div className="h-px w-full bg-[#1e1e24]"></div>
             <ToggleItem 
               label="SMS Affirmations" 
               description="Daily SMS grounding exercises during identified stress windows."
               active={tier === 'sentinel' && (prefs as any).smsSync}
               onClick={tier === 'sentinel' ? () => togglePref('smsSync' as any) : undefined}
               icon={<Smartphone size={14} className="text-slate-500 shrink-0" />}
               disabled={tier !== 'sentinel'}
             />
             {tier !== 'sentinel' && (
               <div className="absolute inset-0 z-10 bg-[#0a0a0b]/10 backdrop-blur-[1px] flex items-center justify-center">
                  <Link href="/settings" className="flex items-center gap-2 text-[11px] font-bold text-violet-400 bg-[#18181b] px-3 py-1.5 rounded-full border border-violet-500/30 hover:bg-[#27272a] transition-all">
                    <Lock size={12} /> Unlock with Sentinel
                  </Link>
               </div>
             )}
          </div>
        </section>

      </div>
    </div>
  );
}

function ToggleItem({ label, description, active, onClick, icon, disabled }: any) {
  return (
    <div className={cn("flex items-center justify-between gap-4", disabled && "pointer-events-none opacity-50")}>
      <div className="flex items-start gap-2.5 md:gap-3 flex-1 min-w-0">
        {icon && <div className="mt-0.5 md:mt-1">{icon}</div>}
        <div className="min-w-0">
          <p className="text-[13px] md:text-sm font-medium text-slate-200 truncate">{label}</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 max-w-sm mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-10 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 cursor-pointer",
          active ? "bg-violet-600" : "bg-[#27272a]"
        )}
      >
        <span 
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm",
            active ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
