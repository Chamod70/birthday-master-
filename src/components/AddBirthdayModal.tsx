"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, UserCircle, Save, Plus, Edit2, Upload, Loader2, Download, Image as ImageIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

interface AddBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    name: string; 
    date: string; 
    relationship?: "Family" | "Friend" | "Colleague" | "Other";
    reminder_6pm: boolean; 
    reminder_6am: boolean;
    notes?: string;
    post_url?: string;
    avatar_url?: string;
  }) => void;
}

export function AddBirthdayModal({
  isOpen,
  onClose,
  onSave,
}: AddBirthdayModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [relationship, setRelationship] = useState<"Family" | "Friend" | "Colleague" | "Other">("Friend");
  const [reminder_6pm, setReminder_6pm] = useState(false);
  const [reminder_6am, setReminder_6am] = useState(true);
  const [notes, setNotes] = useState("");
  const [post_url, setPost_url] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('birthday-posts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('birthday-posts')
        .getPublicUrl(filePath);

      setPost_url(publicUrl);
    } catch (error: any) {
      alert('Error uploading post: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    onSave({ 
      name, 
      date, 
      relationship, 
      reminder_6pm, 
      reminder_6am, 
      notes, 
      post_url,
      avatar_url: post_url // Sync avatar with the post
    });
    setName("");
    setDate("");
    setNotes("");
    setPost_url("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] px-4 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="glass shadow-2xl rounded-[32px] p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Plus size={24} />
                  </div>
                  New Celebration
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                      <User size={12} /> Full Name
                    </label>
                    <input
                      autoFocus
                      required
                      type="text"
                      placeholder="Enter name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 ring-indigo-500/50 outline-none placeholder-slate-500 hover:border-white/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                      <Calendar size={12} /> Birthday Date
                    </label>
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 ring-indigo-500/50 outline-none text-white invert-filter hover:border-white/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                    <UserCircle size={12} /> Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 ring-indigo-500/50 outline-none text-white hover:border-white/20 transition-all appearance-none"
                  >
                    <option value="Friend" className="bg-slate-900">Friend</option>
                    <option value="Family" className="bg-slate-900">Family</option>
                    <option value="Colleague" className="bg-slate-900">Colleague</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>

                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <label className="text-xs uppercase tracking-widest font-bold text-slate-500 block">Notification Settings</label>
                   <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={reminder_6am} 
                          onChange={e => setReminder_6am(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                        />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">6:00 AM (D-Day)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={reminder_6pm} 
                          onChange={e => setReminder_6pm(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                        />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">6:00 PM (D-1)</span>
                      </label>
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                    <Edit2 size={12} /> Notes
                  </label>
                  <textarea
                    placeholder="Add a special note or gift idea..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 ring-indigo-500/50 outline-none placeholder-slate-500 hover:border-white/20 transition-all font-medium h-24 resize-none"
                  />
                </div>

                <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                    <ImageIcon size={12} /> Birthday Post (Image/Design)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className={cn(
                        "w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/10 transition-all text-center",
                        post_url && "border-indigo-500 bg-indigo-500/5"
                      )}>
                        {isUploading ? (
                          <Loader2 size={24} className="animate-spin text-indigo-400 mb-2" />
                        ) : post_url ? (
                          <Check size={24} className="text-emerald-400 mb-2" />
                        ) : (
                          <Upload size={24} className="text-slate-500 mb-2" />
                        )}
                        <span className="text-xs font-bold text-slate-400">
                          {isUploading ? "Uploading..." : post_url ? "Post Uploaded!" : "Click to upload Birthday Post"}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                      </div>
                    </label>
                    {post_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                         <img src={post_url} className="w-full h-full object-cover" alt="Post preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] active:scale-95 transition-all text-white"
                  >
                    <Save size={18} />
                    Save Celebration
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
