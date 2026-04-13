"use client";

import React, { useState } from 'react';
import { PenTool, Brain, History, Save, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type JournalEntry = {
  id: string;
  date: string;
  situation: string;
  emotion: string;
  intensity: number;
  thought: string;
  reframed: string;
};

const DUMMY_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000).toISOString(),
    situation: 'Upcoming project presentation at work',
    emotion: 'Anxiety',
    intensity: 8,
    thought: 'I am going to freeze up and everyone will think I am incompetent.',
    reframed: 'I have prepared thoroughly. Even if I stumble, it does not erase my expertise or value.',
  }
];

export const GuidedJournal = () => {
  const [view, setView] = useState<'NEW' | 'HISTORY'>('NEW');
  const [entries, setEntries] = useState<JournalEntry[]>(DUMMY_ENTRIES);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [situation, setSituation] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState<number>(5);
  const [thought, setThought] = useState('');
  const [reframed, setReframed] = useState('');

  const handleSave = () => {
    if (!situation || !thought) return;
    
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      situation,
      emotion,
      intensity,
      thought,
      reframed
    };

    setEntries([newEntry, ...entries]);
    // Reset form
    setSituation(''); setEmotion(''); setIntensity(5); setThought(''); setReframed('');
    setView('HISTORY');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[500px]">
      
      {/* Refined Minimal Navigation Column */}
      <div className="w-full lg:w-48 flex-shrink-0 flex flex-col gap-2">
        <button 
          onClick={() => { setView('NEW'); setActiveEntry(null); }}
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-md transition-all text-xs font-medium border",
            view === 'NEW' 
              ? "bg-[#1e1e24] border-[#27272a] text-slate-100" 
              : "bg-transparent border-transparent hover:bg-[#18181b] text-slate-500"
          )}
        >
          <PenTool size={14} className={view === 'NEW' ? "text-violet-400" : ""} /> Log Entry
        </button>
        <button 
          onClick={() => { setView('HISTORY'); setActiveEntry(null); }}
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-md transition-all text-xs font-medium border",
            view === 'HISTORY' 
              ? "bg-[#1e1e24] border-[#27272a] text-slate-100" 
              : "bg-transparent border-transparent hover:bg-[#18181b] text-slate-500"
          )}
        >
          <History size={14} className={view === 'HISTORY' ? "text-violet-400" : ""} /> History
        </button>

        {view === 'HISTORY' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-1 max-h-48 lg:max-h-none border border-[#1e1e24] lg:border-none p-2 lg:p-0 rounded-md">
            <h4 className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest pl-2 mb-2 hidden lg:block">Past Logs</h4>
            {entries.map(entry => (
              <button 
                key={entry.id}
                onClick={() => setActiveEntry(entry)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-md text-[13px] font-medium transition-all truncate",
                  activeEntry?.id === entry.id
                    ? "bg-[#18181b] text-slate-200 border border-[#27272a]"
                    : "bg-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0f0f13] border border-[#1e1e24] lg:border-transparent"
                )}
              >
                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} - {entry.situation}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#0f0f13] border border-[#1e1e24] rounded-xl relative">
        {view === 'NEW' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="mb-10 border-b border-[#1e1e24] pb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-1 flex items-center gap-3">
                Cognitive Restructuring
              </h2>
              <p className="text-[13px] text-slate-500">Record an automatic thought and logically process it.</p>
            </div>

            <div className="space-y-8 max-w-2xl">
              
              {/* Situation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. The Situation</label>
                <textarea 
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Objective facts only. E.g., 'My manager asked to speak with me.'"
                  className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-[13px] focus:ring-1 focus:ring-[#3f3f46] focus:border-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200 resize-none"
                />
              </div>

              {/* Emotion & Intensity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Primary Emotion</label>
                  <input 
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    type="text" 
                    placeholder="E.g., Panic, Sadness"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-[13px] focus:ring-1 focus:ring-[#3f3f46] focus:border-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>3. Intensity</span>
                    <span className="text-violet-400">{intensity} / 10</span>
                  </label>
                  <input 
                    type="range" min="1" max="10" 
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full accent-violet-600 mt-[14px]"
                  />
                </div>
              </div>

              {/* Automatic Thought */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">4. Automatic Thought</label>
                <textarea 
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="What was the immediate thought? E.g., 'I am going to be fired.'"
                  className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-[13px] focus:ring-1 focus:ring-[#3f3f46] focus:border-[#3f3f46] outline-none transition-all placeholder:text-slate-600 text-slate-200 resize-none"
                />
              </div>

              {/* Reframing */}
              <div className="space-y-2 pt-4">
                <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-2">
                   Rational Reframe
                </label>
                <textarea 
                  value={reframed}
                  onChange={(e) => setReframed(e.target.value)}
                  placeholder="Challenge the thought objectively..."
                  className="w-full h-32 bg-violet-600/5 border border-violet-500/20 rounded-lg p-4 text-[13px] focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-600 text-slate-200 resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSave} 
                  disabled={!situation || !thought}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-md bg-white hover:bg-slate-200 text-black font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> Commit Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'HISTORY' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {!activeEntry ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <BookOpen size={32} className="text-[#27272a]" />
                <p className="text-[13px]">Select an entry from the sidebar.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeEntry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="max-w-2xl space-y-8"
                >
                   <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                      {new Date(activeEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h2 className="text-xl font-semibold text-slate-100 mt-2">{activeEntry.situation}</h2>
                   </div>

                   <div className="flex gap-3">
                     <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] rounded text-[11px] font-medium text-slate-300">
                       Emotion: {activeEntry.emotion}
                     </span>
                     <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] rounded text-[11px] font-medium text-slate-300">
                       Intensity: {activeEntry.intensity} / 10
                     </span>
                   </div>

                   <div className="p-5 bg-red-950/10 border border-red-900/20 rounded-xl">
                     <div className="text-[10px] font-semibold text-red-500/70 uppercase tracking-widest mb-2">Automatic Thought</div>
                     <p className="text-slate-300 text-[14px]">"{activeEntry.thought}"</p>
                   </div>

                   <div className="p-5 bg-violet-900/10 border border-violet-800/30 rounded-xl">
                     <div className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest mb-2">Rational Reframe</div>
                     <p className="text-slate-200 text-[14px]">"{activeEntry.reframed}"</p>
                   </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
