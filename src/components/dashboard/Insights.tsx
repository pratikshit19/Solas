"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { Activity, Brain, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockMoodData = [
  { day: 'Mon', intensity: 4, resilience: 60 },
  { day: 'Tue', intensity: 6, resilience: 55 },
  { day: 'Wed', intensity: 3, resilience: 65 },
  { day: 'Thu', intensity: 5, resilience: 72 },
  { day: 'Fri', intensity: 2, resilience: 80 },
  { day: 'Sat', intensity: 3, resilience: 78 },
  { day: 'Sun', intensity: 1, resilience: 85 },
];

const mockTriggers = [
  { name: 'Work', count: 12 },
  { name: 'Social', count: 5 },
  { name: 'Health', count: 3 },
  { name: 'Future', count: 8 },
];

export const InsightsDashboard = () => {
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
      <div className="col-span-1 md:col-span-2 lg:col-span-3 h-[360px] p-5 bg-[#0f0f13] border border-[#1e1e24] rounded-xl flex flex-col">
        <h3 className="text-[13px] font-medium text-slate-300 mb-4 flex items-center gap-2">
          Mood & Resilience Trend
        </h3>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMoodData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
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
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#475569" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#475569', strokeWidth: 0 }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Triggers Bar Chart */}
      <div className="col-span-1 h-[360px] p-5 bg-[#0f0f13] border border-[#1e1e24] rounded-xl flex flex-col">
        <h3 className="text-[13px] font-medium text-slate-300 mb-4">Triggers</h3>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTriggers} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} width={45} />
              <Tooltip 
                cursor={{fill: '#1e1e24'}} 
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f8fafc', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1000}>
                {mockTriggers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={'#4c1d95'} opacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

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
