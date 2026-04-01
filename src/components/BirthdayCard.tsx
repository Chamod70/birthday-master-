"use client";

import { motion } from "framer-motion";
import { Cake, MoreVertical, Trash2, Edit2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface BirthdayCardProps {
  name: string;
  date: string;
  daysRemaining: number;
  avatar_url?: string;
  relationship?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  index?: number;
}

export function BirthdayCard({
  name,
  date,
  daysRemaining,
  avatar_url,
  relationship = "Friend",
  onDelete,
  onEdit,
  index = 0,
}: BirthdayCardProps) {
  const isToday = daysRemaining === 0;
  
  const relColors: any = {
    Family: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    Friend: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Colleague: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Other: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group glass rounded-[28px] p-5 flex items-center justify-between transition-all hover:bg-white/10 hover:translate-x-1 border border-white/5",
        isToday && "ring-2 ring-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
      )}
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          {avatar_url ? (
            <img src={avatar_url} alt={name} className="w-14 h-14 rounded-[20px] object-cover border-2 border-white/10 shadow-xl" />
          ) : (
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-xl">
              {name.charAt(0)}
            </div>
          )}
          {isToday && (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -bottom-2 -right-2 bg-pink-500 p-2 rounded-xl text-white shadow-lg border-2 border-[#020617]">
              <Cake size={12} strokeWidth={3} />
            </motion.div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-black text-xl tracking-tight text-white/90">{name}</h3>
            <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", relColors[relationship] || relColors.Other)}>
              {relationship}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest">
            <Calendar size={14} className="text-slate-600" />
            {format(parseISO(date), "MMMM d")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className={cn("text-3xl font-black font-display tracking-tight", isToday ? "text-indigo-400" : "text-white")}>
            {isToday ? "PARTY!" : daysRemaining}
          </div>
          {!isToday && <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Days Left</div>}
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <button onClick={onDelete} className="p-3 bg-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/20 rounded-2xl transition-all border border-transparent hover:border-red-500/30">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
