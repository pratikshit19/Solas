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
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setName(user.user_metadata?.name || '');
      setBio(user.user_metadata?.bio || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    };
    fetchUser();
  }, [supabase]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, bio, avatar_url: avatarUrl }
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-100 tracking-tight">Public Profile</h2>
        <p className="text-sm text-slate-500 mt-1">This information enables Solas to personalize your experience.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 pb-8 border-b border-white/5 text-center sm:text-left">
         <div className="relative group shrink-0">
           <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-violet-600/80 to-indigo-500/80 flex items-center justify-center text-2xl md:text-3xl font-semibold text-white shadow-xl overflow-hidden ring-4 ring-white/5 transition-all group-hover:ring-violet-500/30">
             {avatarUrl ? (
               <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
             ) : (
               name ? name.charAt(0).toUpperCase() : '?'
             )}
           </div>
           {uploading && (
             <div className="absolute inset-0 bg-[#0a0a0b]/60 rounded-full flex items-center justify-center">
               <span className="text-[10px] font-bold text-white animate-pulse">...</span>
             </div>
           )}
         </div>
         <div className="flex-1 w-full max-w-sm">
           <h3 className="text-sm md:text-base font-medium text-slate-200">Avatar OS</h3>
           <p className="text-xs text-slate-500 mt-1">Upload a custom vector or profile image.</p>
           <div className="mt-4">
             <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#27272a] hover:text-slate-100 transition-all">
               <span>{uploading ? "Uploading..." : "Select Image"}</span>
               <input 
                 type="file" 
                 className="hidden" 
                 accept="image/*"
                 onChange={uploadAvatar}
                 disabled={uploading}
               />
             </label>
           </div>
         </div>
      </div>

      <div className="space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Display Identity</Label>
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
            placeholder="A brief overview of your current journey..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-[10px] text-slate-500 mt-1 flex justify-end">{bio.length}/300</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving || uploading} className="w-full sm:w-auto bg-slate-100 text-[#0a0a0b] hover:bg-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all">
            {saving ? "Updating..." : "Update Profile"}
          </Button>
          {success && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} /> Identity Refined
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
