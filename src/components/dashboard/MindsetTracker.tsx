"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Loader2, Calendar, TrendingUp, 
  Smile, Frown, Zap, Coffee, Cloud, AlertCircle, 
  Heart, Target, HelpCircle, Save, History, 
  PlusCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { getSolasResponse } from '@/lib/ai/engine';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#10b981', icon: <Smile size={20} /> },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#6366f1', icon: <Heart size={20} /> },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#f59e0b', icon: <AlertCircle size={20} /> },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#3b82f6', icon: <Frown size={20} /> },
  { id: 'overthinking', label: 'Overthinking', emoji: '😵‍💫', color: '#8b5cf6', icon: <Brain size={20} /> },
  { id: 'confused', label: 'Confused', emoji: '😕', color: '#94a3b8', icon: <HelpCircle size={20} /> },
  { id: 'frustrated', label: 'Frustrated', emoji: '😠', color: '#ef4444', icon: <Zap size={20} /> },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: '#fbbf24', icon: <Zap size={20} /> },
  { id: 'stuck', label: 'Stuck', emoji: '🐌', color: '#78350f', icon: <Cloud size={20} /> },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', color: '#ec4899', icon: <Heart size={20} /> },
];

type MoodLog = {
  id: string;
  mood: string;
  intensity: number;
  note: string;
  created_at: string;
};

export const MindsetTracker = () => {
  const [view, setView] = useState<'LOG' | 'STATS'>('LOG');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MoodLog[]>([]);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [tier, setTier] = useState<'standard' | 'sentinel'>('standard');
  const [logsToday, setLogsToday] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setTier(user.user_metadata?.tier || 'standard');

    const { data: moodData } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (moodData) {
      setHistory(moodData);
      
      // Count today's logs
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const count = moodData.filter(log => new Date(log.created_at) >= startOfDay).length;
      setLogsToday(count);

      // Generate AI guidance if there's a recent log and none yet
      if (moodData.length > 0 && !aiGuidance) {
        generateAiGuidance(moodData[0]);
      }
    }
    setLoading(false);
  };

  const generateAiGuidance = async (log: MoodLog) => {
    setIsGeneratingAi(true);
    try {
      const prompt = `Based on my current mindset: "${log.mood}" (intensity ${log.intensity}/10) and my note: "${log.note}", provide 3 brief, actionable steps I can take to better my day. Maintain a Stoic, empathetic, and professional tone. Return as a short list.`;
      const response = await getSolasResponse(prompt, [], 'STOIC', tier);
      setAiGuidance(response.content);
    } catch (err) {
      console.error('AI Guidance failed', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mood_logs')
        .insert([{
          user_id: user.id,
          mood: selectedMood,
          intensity,
          note
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase Error:', error);
        alert(`Save failed: ${error.message || 'Unknown error'}. Have you run the SQL migration?`);
        throw error;
      }

      const newHistory = [data, ...history];
      setHistory(newHistory);
      setLogsToday(logsToday + 1);
      generateAiGuidance(data);
      
      // Reset form partially
      setSelectedMood(null);
      setNote('');
      setIntensity(5);
      setView('STATS');
    } catch (err: any) {
      console.error('Save failed details:', err);
    } finally {
      setSaving(false);
    }
  };

  const isLimitReached = tier === 'standard' && logsToday >= 3;

  // Statistics Processing
  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => {
      const dayLogs = history.filter(log => 
        new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short' }) === day
      );
      return {
        name: day,
        intensity: dayLogs.length > 0 ? dayLogs.reduce((acc, current) => acc + current.intensity, 0) / dayLogs.length : 0,
        count: dayLogs.length
      };
    });
  };

  const getMoodDistribution = () => {
    const dist: Record<string, number> = {};
    history.forEach(log => {
      dist[log.mood] = (dist[log.mood] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ 
      name: MOODS.find(m => m.id === name)?.label || name, 
      value,
      color: MOODS.find(m => m.id === name)?.color || '#4c1d95'
    })).sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-3" /> Aligning with your mindset...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e1e24] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Brain className="text-violet-400" /> Daily Mindset
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your evolution and calibrate your focus.</p>
        </div>
        <div className="flex bg-[#0f0f13] border border-[#1e1e24] p-1 rounded-lg">
          <button 
            onClick={() => setView('LOG')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
              view === 'LOG' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <PlusCircle size={14} /> Log State
          </button>
          <button 
            onClick={() => setView('STATS')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
              view === 'STATS' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <TrendingUp size={14} /> Insights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {view === 'LOG' ? (
              <motion.div 
                key="log-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-[#0f0f13] border border-[#1e1e24] rounded-xl p-6 md:p-8"
              >
                {isLimitReached ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-[#1e1e24]">
                      <Calendar className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">Daily Threshold Reached</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      Standard tier includes 3 mindset logs per day. Upgrade to Sentinel for unlimited tracking and deeper history.
                    </p>
                    <Button variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                      Explore Sentinel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">How are you feeling right now?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {MOODS.map(mood => (
                          <button
                            key={mood.id}
                            onClick={() => setSelectedMood(mood.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 group",
                              selectedMood === mood.id 
                                ? "bg-violet-600/10 border-violet-500/50 ring-1 ring-violet-500/50" 
                                : "bg-[#18181b] border-[#27272a] hover:border-slate-700"
                            )}
                          >
                            <span className={cn("text-2xl transition-transform group-hover:scale-110", selectedMood === mood.id ? "grayscale-0" : "grayscale opacity-60")}>
                              {mood.emoji}
                            </span>
                            <span className={cn("text-[11px] font-medium", selectedMood === mood.id ? "text-violet-400" : "text-slate-500")}>
                              {mood.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                          Intensity <span>{intensity}/10</span>
                        </label>
                        <input 
                          type="range" min="1" max="10" 
                          value={intensity}
                          onChange={(e) => setIntensity(parseInt(e.target.value))}
                          className="w-full accent-violet-600 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-600 italic">How strongly are you experiencing this?</p>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mindset Note (Optional)</label>
                        <textarea 
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="What's triggering this state?"
                          className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700 text-slate-200 resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={!selectedMood || saving}
                      className="w-full py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {saving ? "Synthesizing State..." : "Log Mindset"}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="stats-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[380px]">
                  <div className="bg-[#0f0f13] border border-[#1e1e24] rounded-xl p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Intensity Trend (Last 7 Days)</h3>
                    <div className="flex-1 w-full">
                      {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getWeeklyData()}>
                            <defs>
                              <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e24" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                            <YAxis hide domain={[0, 10]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="intensity" stroke="#8b5cf6" fill="url(#colorInt)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState />
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0f0f13] border border-[#1e1e24] rounded-xl p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Dominant States</h3>
                    <div className="flex-1 w-full overflow-y-auto pr-2 custom-scrollbar">
                      {history.length > 0 ? (
                        <div className="space-y-4">
                          {getMoodDistribution().map((item, i) => (
                             <div key={item.name} className="space-y-1.5">
                               <div className="flex justify-between text-[11px] font-medium">
                                 <span className="text-slate-300">{item.name}</span>
                                 <span className="text-slate-500">{item.value} times</span>
                               </div>
                               <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${(item.value / history.length) * 100}%` }}
                                   className="h-full rounded-full"
                                   style={{ backgroundColor: item.color }}
                                 />
                               </div>
                             </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState />
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent History */}
                <div className="bg-[#0f0f13] border border-[#1e1e24] rounded-xl p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Trajectory</h3>
                  <div className="space-y-3">
                    {history.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-lg">
                            {MOODS.find(m => m.id === log.mood)?.emoji}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 capitalize">{log.mood}</p>
                            <p className="text-[10px] text-slate-600">{new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            log.intensity > 7 ? "bg-red-950/20 text-red-500" : "bg-violet-950/20 text-violet-400"
                          )}>
                            In: {log.intensity}
                          </div>
                          <ChevronRight size={14} className="text-slate-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Panel: AI Guidance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-b from-[#13131a] to-[#0f0f13] border border-[#1e1e24] rounded-xl p-6 flex flex-col h-full min-h-[300px]">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center border border-violet-500/20">
                 <Sparkles className="text-violet-400 w-4 h-4" />
               </div>
               <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Mindset Guidance</h3>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center text-center">
               {isGeneratingAi ? (
                 <div className="space-y-4">
                    <Loader2 className="animate-spin text-violet-500 mx-auto" size={24} />
                    <p className="text-[11px] text-slate-500">Synthesizing therapeutic protocol...</p>
                 </div>
               ) : aiGuidance ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6 text-left w-full"
                 >
                   <div className="p-4 bg-violet-600/5 border border-violet-500/10 rounded-lg">
                      <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">
                        {aiGuidance}
                      </p>
                   </div>
                   <div className="flex items-center gap-2 px-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-[10px] text-slate-600 font-medium">Updated based on your last check-in</span>
                   </div>
                 </motion.div>
               ) : (
                 <div className="space-y-4 px-4">
                    <Target size={32} className="text-slate-800 mx-auto" />
                    <p className="text-[11px] text-slate-600">Log your mindset to reveal adaptive strategies for your day.</p>
                 </div>
               )}
             </div>

             <div className="mt-8 pt-6 border-t border-[#1e1e24]">
                <div className="p-4 bg-[#0a0a0b] border border-[#1e1e24] rounded-lg">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <History size={10} /> Daily Persistence
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-full", i < logsToday ? "bg-violet-500" : "bg-slate-800")} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{logsToday} / 3 Logs</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2">
    <Calendar size={24} className="opacity-20" />
    <p className="text-[10px] font-medium uppercase tracking-widest">Calibration data missing</p>
  </div>
);
