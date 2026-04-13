"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Send, Shield,
  MessageCircle, BarChart2, BookOpen, AlertCircle, LogOut, Sparkles, ChevronDown
} from 'lucide-react';
import { InsightsDashboard } from '@/components/dashboard/Insights';
import { GuidedJournal } from '@/components/dashboard/Journal';
import { TherapistIdentity, SYSTEM_PERSONAS } from '@/lib/ai/prompts';
import { getSolasResponse, ChatMessage } from '@/lib/ai/engine';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function SolasApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'journal'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [identity, setIdentity] = useState<TherapistIdentity>('GENTLE');
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
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

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const defaultGreeting = `I am Solas. I am currently operating in ${identity.toLowerCase()} mode. How can we optimize your mental state today?`;
    if (messages.length === 0 || messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: defaultGreeting }]);
    }
  }, [identity]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getSolasResponse(textToSend, history, identity);
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error processing that. Could we try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_PROMPTS = [
    "I am feeling anxious.",
    "Help me reflect on a difficult situation.",
    "Guide me through a grounding exercise."
  ];

  return (
    <main className="flex h-screen bg-[#0a0a0b] text-slate-200 font-sans overflow-hidden">
      
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
            <SidebarItem active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle size={16} />} label="Sanctuary" />
            <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart2 size={16} />} label="Insights" />
            <SidebarItem active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={<BookOpen size={16} />} label="Journal" />
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors">
            <AlertCircle size={16} /> Crisis Support
          </button>
          
          <div className="border-t border-[#1e1e24] pt-4">
            <div className="flex items-center justify-between px-3 py-2">
               <div className="truncate">
                 <p className="text-xs font-medium text-slate-300 truncate">{user?.email}</p>
                 <p className="text-[10px] text-slate-500">Authenticated Pilot</p>
               </div>
               <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-[#1e1e24] transition-colors">
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
            <button onClick={() => setActiveTab('chat')} className={cn("p-1.5 rounded-md", activeTab === 'chat' ? "bg-[#1e1e24]" : "text-slate-500")}><MessageCircle size={16}/></button>
            <button onClick={() => setActiveTab('dashboard')} className={cn("p-1.5 rounded-md", activeTab === 'dashboard' ? "bg-[#1e1e24]" : "text-slate-500")}><BarChart2 size={16}/></button>
            <button onClick={() => setActiveTab('journal')} className={cn("p-1.5 rounded-md", activeTab === 'journal' ? "bg-[#1e1e24]" : "text-slate-500")}><BookOpen size={16}/></button>
            
            <div className="w-px h-4 bg-slate-800 mx-1"></div>
            
            <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-500 hover:text-red-400"><LogOut size={16}/></button>
          </div>
        </header>

        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between w-full mx-auto relative z-10">
            
            {/* Top Minimal Settings Bar */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-center md:justify-start z-30">
               <div className="relative">
                 <button 
                   onClick={() => setShowPersonas(!showPersonas)}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#27272a] bg-[#18181b] text-xs font-medium text-slate-300 hover:bg-[#27272a] transition-colors shadow-sm"
                 >
                   Mode: <span className="text-violet-400 capitalize">{identity.toLowerCase()}</span>
                   <ChevronDown size={14} className="opacity-50" />
                 </button>

                 {showPersonas && (
                   <div className="absolute top-10 left-0 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl overflow-hidden py-1">
                     {(Object.keys(SYSTEM_PERSONAS) as TherapistIdentity[]).map((id) => (
                       <button
                         key={id}
                         onClick={() => { setIdentity(id); setShowPersonas(false); }}
                         className={cn(
                           "w-full text-left px-4 py-2 text-xs transition-colors",
                           identity === id ? "bg-violet-600/10 text-violet-400 font-medium" : "text-slate-400 hover:bg-[#27272a] hover:text-slate-200"
                         )}
                       >
                         {id.replace('_', ' ')}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>

            {/* Conversation/Welcome Container */}
            <div 
              ref={scrollRef}
              className="flex-1 w-full overflow-y-auto px-4 md:px-0 pt-16 pb-40 md:pb-32"
            >
              {messages.length <= 1 ? (
                // Minimal Empty State
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
                  <div className="w-12 h-12 mb-6 border border-[#27272a] rounded-xl flex items-center justify-center bg-[#0f0f13]">
                    <Shield className="text-slate-500 w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-slate-200 mb-2">How can I help you today?</h2>
                  <p className="text-sm text-slate-500 mb-8 max-w-md text-center">
                    Solas is an intelligent mental wellness companion. All conversations are strictly private and end-to-end encrypted.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handleSend(prompt)}
                         className="px-4 py-2 rounded-full border border-[#27272a] bg-[#18181b] text-xs text-slate-400 hover:text-slate-200 hover:border-[#3f3f46] transition-colors"
                       >
                         {prompt}
                       </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Standard Chat Flow
                <div className="w-full max-w-3xl mx-auto space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex w-full",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] md:max-w-[75%] p-4 text-[14px] leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-[#27272a] text-slate-200 rounded-2xl rounded-br-sm" 
                          : "text-slate-300"
                      )}>
                        {msg.role === 'assistant' && idx === 0 ? null /* Optional hiding of sys prompt if desired, keeping for now */ : null}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-4 text-slate-500 text-[14px]">
                        <span className="animate-pulse">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Minimal Input Area */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b] to-transparent pt-10 pb-6 px-4 z-20">
              <div className="max-w-3xl mx-auto">
                 <div className="relative flex items-center bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden focus-within:border-[#3f3f46] focus-within:ring-1 focus-within:ring-[#3f3f46] transition-all">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Message Solas..."
                      className="flex-1 bg-transparent px-4 py-3.5 text-[14px] outline-none text-slate-200 placeholder:text-slate-600"
                    />
                    <div className="pr-2">
                      <button 
                        onClick={() => handleSend()} 
                        disabled={!input.trim() || isTyping}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:bg-[#27272a] disabled:text-slate-500 transition-colors"
                      >
                        <Send size={14} className={input.trim() && !isTyping ? "ml-0.5" : ""} />
                      </button>
                    </div>
                 </div>
                 <p className="text-center text-[10px] text-slate-600 mt-3 flex items-center justify-center gap-1.5 font-medium">
                    <Shield size={10} /> End-to-End Encrypted Session
                 </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Frame Fix */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 overflow-y-auto">
            <InsightsDashboard />
          </div>
        )}

        {/* Journal Frame Fix */}
        {activeTab === 'journal' && (
          <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 overflow-y-auto">
            <GuidedJournal />
          </div>
        )}
      </div>
    </main>
  );
}

function SidebarItem({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-[#1e1e24] text-slate-100" 
          : "text-slate-500 hover:text-slate-300 hover:bg-[#1e1e24]/50"
      )}
    >
      <span className={active ? "text-violet-400" : "text-slate-500"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
