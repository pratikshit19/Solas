"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { Activity, Brain, Shield, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Loader2, Calendar } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const InsightsDashboard = () => {
  const [tier, setTier] = React.useState<'standard' | 'sentinel'>('standard');
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any[]>([]);
  const [triggers, setTriggers] = React.useState<any[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.tier === 'sentinel') {
        setTier('sentinel');
      }

      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (journalData) {
        // Process Trends
        const dayMap: any = {};
        journalData.forEach((entry: any) => {
          const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
          if (!dayMap[day]) dayMap[day] = { intensity: 0, resilience: 0, count: 0 };
          dayMap[day].intensity += entry.intensity;
          dayMap[day].resilience += (10 - entry.intensity) * 10; // Simple mapping
          dayMap[day].count++;
        });

        const chartData = DAYS.map(day => ({
          day,
          intensity: dayMap[day] ? dayMap[day].intensity / dayMap[day].count : 0,
          resilience: dayMap[day] ? dayMap[day].resilience / dayMap[day].count : 0
        }));
        setData(chartData);

        // Process Triggers
        const trigMap: any = {};
        journalData.forEach((entry: any) => {
          if (entry.emotion) {
            trigMap[entry.emotion] = (trigMap[entry.emotion] || 0) + 1;
          }
        });
        setTriggers(Object.entries(trigMap).map(([name, count]) => ({ name, count })));
      }
      setLoading(false);
    };
    fetchAllData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-3" /> Distilling insights...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric Cards */}
      <MetricCard 
        title="Resilience Score" 
        value="82" 
        change="+5%" 
        icon={<Shield className="text-slate-400 w-4 h-4" />} 
      />
      <MetricCard 
        title="Mood Stability" 
        value="High" 
        change="Stable" 
        icon={<Activity className="text-slate-400 w-4 h-4" />} 
      />
      <MetricCard 
        title="Distortions Identified" 
        value="14" 
        change="-2" 
        icon={<Brain className="text-slate-400 w-4 h-4" />} 
      />
      <MetricCard 
        title="Exercises Done" 
        value="12" 
        change="+3" 
        icon={<Zap className="text-slate-400 w-4 h-4" />} 
      />

      {/* Main Trends Graph */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 h-[360px] p-5 bg-[#0f0f13] border border-[#1e1e24] rounded-xl flex flex-col relative overflow-hidden">
        <h3 className="text-[13px] font-medium text-slate-300 mb-4 flex items-center gap-2">
          Mood & Resilience Trend
        </h3>
        <div className={cn("flex-1 w-full relative", tier !== 'sentinel' && "blur-md select-none pointer-events-none")}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c1d95" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4c1d95" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e24" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f8fafc', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="resilience" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorRes)" 
                  strokeWidth={2}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
              <Activity size={32} className="opacity-20" />
              <p className="text-xs">Insufficient data for trend mapping.</p>
            </div>
          )}
        </div>
        {tier !== 'sentinel' && <SentinelGate overlayText="Deep Trend Analysis" />}
      </div>

      {/* Triggers Bar Chart */}
      <div className="col-span-1 h-[360px] p-5 bg-[#0f0f13] border border-[#1e1e24] rounded-xl flex flex-col relative overflow-hidden">
        <h3 className="text-[13px] font-medium text-slate-300 mb-4">Emotions Identified</h3>
        <div className={cn("flex-1 w-full relative", tier !== 'sentinel' && "blur-md select-none pointer-events-none")}>
          {triggers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggers} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} width={55} />
                <Tooltip 
                  cursor={{fill: '#1e1e24'}} 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1000}>
                  {triggers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={'#4c1d95'} opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
              <Zap size={32} className="opacity-20" />
              <p className="text-xs">No emotion profile yet.</p>
            </div>
          )}
        </div>
        {tier !== 'sentinel' && <SentinelGate overlayText="Emotional Blueprint" />}
      </div>

      {/* Mood Heatmap */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 p-6 bg-[#0f0f13] border border-[#1e1e24] rounded-xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="text-[13px] font-medium text-slate-300 flex items-center gap-2">
            <Calendar size={14} className="text-violet-400" /> Consistency Map
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Less <div className="flex gap-1"><div className="w-3 h-3 bg-[#18181b] rounded-sm border border-white/5" /><div className="w-3 h-3 bg-violet-900/40 rounded-sm" /><div className="w-3 h-3 bg-violet-600/60 rounded-sm" /><div className="w-3 h-3 bg-violet-500 rounded-sm" /></div> More
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1.5 w-full">
          {Array.from({ length: 84 }).map((_, i) => (
             <div 
               key={i} 
               className={cn(
                 "aspect-square w-full rounded-[2px] border border-white/5",
                 Math.random() > 0.7 ? "bg-violet-600/60" : Math.random() > 0.9 ? "bg-violet-400" : "bg-[#18181b]"
               )}
             />
          ))}
        </div>
        <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-medium">84 Day Emotional Trajectory View</p>
      </div>
    </div>
  );
};

const SentinelGate = ({ overlayText }: { overlayText: string }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0b]/40 backdrop-blur-[2px] p-6 text-center">
    <div className="w-10 h-10 bg-violet-600/20 border border-violet-500/30 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]">
      <Lock className="text-violet-400 w-4 h-4" />
    </div>
    <h4 className="text-sm font-semibold text-slate-100 mb-1">{overlayText}</h4>
    <p className="text-[11px] text-slate-500 mb-4 max-w-[160px]">Available exclusively for Sentinel members.</p>
    <Link href="/settings">
      <Button variant="outline" className="h-8 text-[11px] px-4 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300">
        Upgrade to Sentinel
      </Button>
    </Link>
  </div>
);

const MetricCard = ({ title, value, change, icon }: any) => (
  <div className="flex flex-col gap-3 p-5 bg-[#0f0f13] border border-[#1e1e24] rounded-xl transition-all hover:bg-[#131318]">
    <div className="flex justify-between items-center">
      <div className="p-2 border border-[#27272a] bg-[#18181b] rounded-lg">{icon}</div>
      <span className={cn(
        "text-[10px] uppercase font-semibold px-2 py-1 rounded bg-[#18181b] border border-[#27272a]",
        change.startsWith('+') ? "text-slate-300" : "text-slate-400"
      )}>
        {change}
      </span>
    </div>
    <div>
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1 mt-2">{title}</p>
      <h4 className="text-2xl font-semibold text-slate-200">{value}</h4>
    </div>
  </div>
);
