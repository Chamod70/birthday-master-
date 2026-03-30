"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, UserCircle, Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    name: string; 
    date: string; 
    avatar_url?: string; 
    reminder_6pm: boolean; 
    reminder_6am: boolean 
  }) => void;
}

export function AddBirthdayModal({
  isOpen,
  onClose,
  onSave,
}: AddBirthdayModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [avatar_url, setAvatar_url] = useState("");
  const [reminder_6pm, setReminder_6pm] = useState(true);
  const [reminder_6am, setReminder_6am] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    onSave({ name, date, avatar_url, reminder_6pm, reminder_6am });
    setName("");
    setDate("");
    setAvatar_url("");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
          >
            <div className="glass shadow-2xl rounded-3xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="text-indigo-500" />
                  New Birthday
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2 px-1">
                    <UserCircle size={12} /> Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatar_url}
                    onChange={(e) => setAvatar_url(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 ring-indigo-500/50 outline-none placeholder-slate-500 hover:border-white/20 transition-all text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] active:scale-95 transition-all"
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
