"use client";

import React, { useState } from 'react';
import { User as UserIcon, Shield, Bell, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileSettings from './components/ProfileSettings';
import AccountSettings from './components/AccountSettings';
import Preferences from './components/Preferences';
import Billing from './components/Billing';

type SettingsTab = 'profile' | 'account' | 'preferences' | 'billing';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="flex-1 w-full h-full mx-auto p-3 sm:p-6 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:flex-row">
        
        {/* Settings Navigation */}
        <aside className="w-full md:w-56 lg:w-64 flex-shrink-0">
          <div className="mb-4 md:mb-8 hidden md:block">
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your identity and app behavior.</p>
          </div>
          
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
        </aside>

        {/* Settings Content */}
        <div className="flex-1 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
           {/* Decorative aesthetic blob */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           
           <div className="relative z-10 w-full">
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

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center md:justify-start gap-2 px-3 py-2 md:py-2.5 rounded-lg text-[13px] md:text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none",
        active 
          ? "bg-[#1e1e24] text-violet-400 shadow-sm" 
          : "text-slate-500 hover:text-slate-300 hover:bg-[#1e1e24]/50"
      )}
    >
      <span className={active ? "text-violet-400" : "text-slate-500"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
