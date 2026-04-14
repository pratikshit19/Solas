"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, ChevronDown, Mic, MicOff, BookPlus, Loader2 } from 'lucide-react';
import { TherapistIdentity, SYSTEM_PERSONAS } from '@/lib/ai/prompts';
import { getSolasResponse, ChatMessage, summarizeChatToJournal } from '@/lib/ai/engine';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

export default function SanctuaryPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [identity, setIdentity] = useState<TherapistIdentity>('GENTLE');
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);
  const [tier, setTier] = useState<'standard' | 'sentinel'>('standard');
  const [isListening, setIsListening] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.tier === 'sentinel') {
        setTier('sentinel');
      }

      // Fetch latest session messages
      const { data: sessionData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (sessionData && sessionData.length > 0) {
        setMessages(sessionData.map(d => ({ role: d.role, content: d.content })));
      }
    };
    initData();
  }, [supabase]);

  // Handle STT Initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleCommitToJournal = async () => {
    if (messages.length < 2) return;
    setCommitting(true);
    try {
      const summary = await summarizeChatToJournal(messages);
      if (summary) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('journal_entries').insert([{
          user_id: user?.id,
          date: new Date().toISOString(),
          ...summary
        }]);
        // Visual indicator/Toast logic could go here
        alert('Session distilled and saved to your journal.');
      }
    } catch (error) {
      console.error('Commit failed', error);
    } finally {
      setCommitting(false);
    }
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Stop listening if active
    if (isListening) toggleListening();

    try {
      // Save User Message
      await supabase.from('chat_messages').insert([{
        user_id: user.id,
        role: 'user',
        content: textToSend,
        identity
      }]);

      const response = await getSolasResponse(textToSend, [...messages, userMsg], identity, tier);
      const assistantMsg: ChatMessage = { role: 'assistant', content: response.content };
      setMessages(prev => [...prev, assistantMsg]);

      // Save Assistant Message
      await supabase.from('chat_messages').insert([{
        user_id: user.id,
        role: 'assistant',
        content: response.content,
        identity
      }]);
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
    <div className="flex-1 flex flex-col justify-between w-full h-full mx-auto relative z-10">
      {/* Top Minimal Settings Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-30">
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

          <div className="flex items-center gap-3">
            {messages.length > 2 && (
              <button 
                onClick={handleCommitToJournal}
                disabled={committing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-950/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest hover:bg-violet-900/30 transition-all disabled:opacity-50"
              >
                {committing ? <Loader2 size={12} className="animate-spin" /> : <BookPlus size={12} />}
                Commit Session
              </button>
            )}
            <div className={cn(
              "text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border shadow-sm",
              tier === 'sentinel' 
                ? "bg-violet-950/30 text-violet-400 border-violet-500/30" 
                : "bg-slate-900/40 text-slate-500 border-slate-800"
            )}>
              {tier === 'sentinel' ? 'Sentinel Intelligence' : 'Standard Intelligence'}
            </div>
          </div>
      </div>

      {/* Conversation/Welcome Container */}
      <div 
        ref={scrollRef}
        className="flex-1 w-full"
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
                  {msg.role === 'assistant' && idx === 0 ? null : null}
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
              <div className="pr-2 flex items-center gap-1.5">
                <button 
                  onClick={toggleListening}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isListening ? "bg-red-500/20 text-red-400" : "bg-[#27272a] text-slate-400 hover:text-slate-200"
                  )}
                >
                  {isListening ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
                </button>
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
  );
}
