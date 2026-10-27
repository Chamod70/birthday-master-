"use client";

import { motion } from "framer-motion";
import { Cake, MoreVertical, Trash2, Edit2, Calendar } from "lucide-react";
import { cn } from "../lib/utils";
import { format, parseISO } from "date-fns";

interface BirthdayCardProps {
  name: string;
  date: string;
  daysRemaining: number;
  age: number;
  avatar_url?: string;
  onDelete: () => void;
  onEdit: () => void;
  index: number;
}

export function BirthdayCard({
  name,
  date,
  daysRemaining,
  age,
  avatar_url,
  onDelete,
  onEdit,
  index,
}: BirthdayCardProps) {
  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group glass rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-white/10",
        isToday && "ring-2 ring-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatar_url ? (
            <div className="relative">
               <img 
                 src={avatar_url} 
                 alt={name} 
                 className="w-12 h-12 rounded-full object-cover border-2 border-white/10" 
               />
               <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg">
              {name.charAt(0)}
            </div>
          )}
          {isToday && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -bottom-1 -right-1 bg-pink-500 p-1.5 rounded-full text-white shadow-lg border border-white/20"
            >
              <Cake size={10} />
            </motion.div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            {age > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                 Turning {age}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} className="opacity-70" />
            {format(parseISO(date), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-2xl font-bold font-display tracking-tight",
            isToday ? "text-pink-400 animate-pulse" : "text-white"
          )}>
            {isToday ? "Today!" : daysRemaining}
          </span>
          {!isToday && (
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Days Left
            </span>
          )}
        </div>

        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onEdit}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              if (confirm("Meka delete karannada?")) onDelete?.();
            }}
            className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all active:scale-90"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
