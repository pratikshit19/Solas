"use client";

import React, { useState } from 'react';
import { User as UserIcon, Shield, Bell, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

// Standardized Absolute Imports
import ProfileSettings from '@/app/(app)/settings/components/ProfileSettings';
import AccountSettings from '@/app/(app)/settings/components/AccountSettings';
import Preferences from '@/app/(app)/settings/components/Preferences';
import Billing from '@/app/(app)/settings/components/Billing';

type SettingsTab = 'profile' | 'account' | 'preferences' | 'billing';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] md:text-sm font-medium transition-all whitespace-nowrap",
        active 
          ? "bg-[#1e1e24] text-violet-400 shadow-sm ring-1 ring-white/10" 
          : "text-slate-500 hover:text-slate-300 hover:bg-[#1e1e24]/50"
      )}
    >
      <span className={active ? "text-violet-400" : "text-slate-500"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="flex-1 w-full h-full mx-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-0 md:gap-8">
        
        {/* Settings Navigation */}
        <aside className="w-full md:w-56 lg:w-64 flex-shrink-0 sticky top-4 md:relative z-20 bg-[#0a0a0b] md:bg-transparent pb-6 md:p-0 border-b md:border-b-0 border-[#1e1e24] md:border-none">
          <div className="mb-4 md:mb-8 hidden md:block">
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your identity and app behavior.</p>
          </div>
          
          <div className="relative">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-0.5">
              <TabButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<UserIcon size={14} />} 
                label="Profile" 
              />
              <TabButton 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')} 
                icon={<Shield size={14} />} 
                label="Account" 
              />
              <TabButton 
                active={activeTab === 'preferences'} 
                onClick={() => setActiveTab('preferences')} 
                icon={<Bell size={14} />} 
                label="Preferences" 
              />
              <TabButton 
                active={activeTab === 'billing'} 
                onClick={() => setActiveTab('billing')} 
                icon={<CreditCard size={14} />} 
                label="Billing" 
              />
            </nav>
            {/* Horizontal scroll hint (subtle fade) indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0b] to-transparent pointer-events-none md:hidden"></div>
          </div>
        </aside>

        {/* Settings Content Card */}
        <div className="flex-1 rounded-none md:rounded-2xl border-x-0 md:border border-[#1e1e24] bg-[#0c0c0e] p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px]">
           {/* Decorative aesthetic blob */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           
           <div className="relative z-10 w-full" key={activeTab}>
             {activeTab === 'profile' && <ProfileSettings />}
             {activeTab === 'account' && <AccountSettings />}
             {activeTab === 'preferences' && <Preferences />}
             {activeTab === 'billing' && <Billing />}
           </div>
        </div>
        
      </div>
    </div>
  );
}
