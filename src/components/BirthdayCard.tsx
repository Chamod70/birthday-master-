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
  onDelete?: () => void;
  onEdit?: () => void;
  index?: number;
}

export function BirthdayCard({
  name,
  date,
  daysRemaining,
  avatar_url,
  onDelete,
  onEdit,
  index = 0,
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
        isToday && "ring-2 ring-indigo-500 bg-indigo-500/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatar_url ? (
            <img 
              src={avatar_url} 
              alt={name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white/10" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
              {name.charAt(0)}
            </div>
          )}
          {isToday && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -bottom-1 -right-1 bg-pink-500 p-1 rounded-full text-white"
            >
              <Cake size={10} />
            </motion.div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <Calendar size={12} />
            {format(parseISO(date), "MMMM d")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-2xl font-bold font-display",
            isToday ? "text-pink-400" : "text-white"
          )}>
            {isToday ? "Today!" : daysRemaining}
          </span>
          {!isToday && (
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Days Left
            </span>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onEdit}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
