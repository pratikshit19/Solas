"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Bell, Moon, BrainCircuit, CheckCircle2 } from 'lucide-react';
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
  const supabase = createClient();

  useEffect(() => {
    // Load preferences from Metadata on mount
    const fetchPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.preferences) {
        setPrefs((prev) => ({ ...prev, ...user.user_metadata.preferences }));
      }
    };
    fetchPrefs();
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
          <h2 className="text-xl md:text-2xl font-medium text-slate-100 flex items-center gap-2">
            <Bell size={20} className="text-violet-500 shrink-0" />
            Global Constraints
          </h2>
          <p className="text-[12px] md:text-sm text-slate-500 mt-1">Configure how Solas operates implicitly.</p>
        </div>
        {saving && <span className="text-[10px] text-slate-500 uppercase flex items-center bg-[#1e1e24] px-2 py-1 rounded tracking-widest font-semibold shadow-inner">Syncing</span>}
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

      </div>
    </div>
  );
}

function ToggleItem({ label, description, active, onClick, icon }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-2.5 md:gap-3 flex-1 min-w-0">
        {icon && <div className="mt-0.5 md:mt-1">{icon}</div>}
        <div className="min-w-0">
          <p className="text-[13px] md:text-sm font-medium text-slate-200 truncate">{label}</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 max-w-sm mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
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
