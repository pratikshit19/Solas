"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2 } from 'lucide-react';

export default function ProfileSettings() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.name) {
        setName(user.user_metadata.name);
      }
      if (user?.user_metadata?.bio) {
        setBio(user.user_metadata.bio);
      }
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, bio, avatar_url: avatarUrl }
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Clear message
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-slate-100">Public Profile</h2>
        <p className="text-[12px] md:text-sm text-slate-500 mt-1">This information enables Solas to personalize your experience.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 pb-10 border-b border-[#1e1e24] text-center sm:text-left">
         <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-2xl md:text-3xl font-semibold text-white shadow-xl overflow-hidden relative group shrink-0">
           {avatarUrl ? (
             <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
           ) : (
             name ? name.charAt(0).toUpperCase() : '?'
           )}
         </div>
         <div className="flex-1 w-full max-w-sm">
           <h3 className="text-sm md:text-base font-medium text-slate-200">Avatar Mapping</h3>
           <p className="text-[11px] md:text-xs text-slate-500 mt-1">Provide a URL for your profile picture vector.</p>
           <Input 
             className="mt-3 text-[12px] h-10" 
             placeholder="https://example.com/photo.jpg" 
             value={avatarUrl}
             onChange={(e) => setAvatarUrl(e.target.value)}
           />
         </div>
      </div>

      <div className="space-y-8 max-w-md w-full">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-semibold">Display Identity</Label>
          <Input 
            id="name" 
            placeholder="How should Solas address you?" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Emotional Context (Bio)</Label>
          <textarea
            id="bio"
            rows={4}
            className="flex w-full rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 resize-none"
            placeholder="A brief overview of your current journey or emotional state..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-[10px] text-slate-500 mt-1 flex justify-end">{bio.length}/300</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-slate-100 text-[#0a0a0b] hover:bg-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all">
            {saving ? "Updating..." : "Update Profile"}
          </Button>
          {success && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} /> Saved mapped vectors
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
