"use client";

import React, { useEffect, useState } from 'react';
import { Shield, MessageCircle, BarChart2, BookOpen, AlertCircle, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    };
    fetchUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = user?.user_metadata?.name || user?.email;

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-slate-200 font-sans overflow-hidden">
      {/* Professional Minimal Sidebar */}
      <aside className="w-64 border-r border-[#1e1e24] bg-[#0f0f13] flex flex-col justify-between flex-shrink-0 hidden md:flex z-20">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 tracking-tight">Solas OS</h1>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarItem active={pathname === '/sanctuary'} href="/sanctuary" icon={<MessageCircle size={16} />} label="Sanctuary" />
            <SidebarItem active={pathname === '/insights'} href="/insights" icon={<BarChart2 size={16} />} label="Insights" />
            <SidebarItem active={pathname === '/journal'} href="/journal" icon={<BookOpen size={16} />} label="Journal" />
            <SidebarItem active={pathname.startsWith('/settings')} href="/settings" icon={<Settings size={16} />} label="Settings" />
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors">
            <AlertCircle size={16} /> Crisis Support
          </button>
          
          <div className="border-t border-[#1e1e24] pt-4">
            <div className="flex items-center gap-3 px-3 py-2 group cursor-default">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden shadow-sm border border-white/5">
                 {user?.user_metadata?.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                 ) : (
                   displayName?.charAt(0).toUpperCase()
                 )}
               </div>
               <div className="truncate flex-1">
                 <p className="text-xs font-medium text-slate-300 truncate">{displayName}</p>
                 <p className="text-[10px] text-slate-500">
                   {user?.user_metadata?.tier === 'sentinel' ? 'Sentinel Pilot' : 'Standard Pilot'}
                 </p>
               </div>
               <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-[#1e1e24] transition-colors" title="Log out">
                 <LogOut size={14} />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative bg-[#0a0a0b]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-3 border-b border-[#1e1e24] bg-[#0a0a0b] z-20 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Solas</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/sanctuary" className={cn("p-1.5 rounded-md", pathname === '/sanctuary' ? "bg-[#1e1e24] text-violet-400" : "text-slate-500")}><MessageCircle size={16}/></Link>
            <Link href="/insights" className={cn("p-1.5 rounded-md", pathname === '/insights' ? "bg-[#1e1e24] text-violet-400" : "text-slate-500")}><BarChart2 size={16}/></Link>
            <Link href="/journal" className={cn("p-1.5 rounded-md", pathname === '/journal' ? "bg-[#1e1e24] text-violet-400" : "text-slate-500")}><BookOpen size={16}/></Link>
            <Link href="/settings" className={cn("p-1.5 rounded-md", pathname.startsWith('/settings') ? "bg-[#1e1e24] text-violet-400" : "text-slate-500")}><Settings size={16}/></Link>
            
            <div className="w-px h-4 bg-slate-800 mx-1"></div>
            
            <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-500 hover:text-red-400"><LogOut size={16}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ active, href, icon, label }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-[#1e1e24] text-slate-100" 
          : "text-slate-500 hover:text-slate-300 hover:bg-[#1e1e24]/50"
      )}
    >
      <span className={active ? "text-violet-400" : "text-slate-500"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
