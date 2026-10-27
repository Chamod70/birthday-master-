"use client";

import { motion } from "framer-motion";
import { PartyPopper, Calendar, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type Birthday } from "@/hooks/use-birthdays";

interface HeroSectionProps {
  birthdays: Birthday[];
  getDaysRemaining: (date: string) => number;
  getCurrentAge: (date: string) => number;
}

export function HeroSection({ birthdays, getDaysRemaining, getCurrentAge }: HeroSectionProps) {
  if (birthdays.length === 0) return null;

  const nextBirthday = birthdays[0];
  const daysLeft = getDaysRemaining(nextBirthday.date);
  const isToday = daysLeft === 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4 md:py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden glass rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <PartyPopper size={200} strokeWidth={0.5} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-4 md:gap-8 md:flex-row md:text-left">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[32px] bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-white/10 p-2 md:p-4">
              {nextBirthday.avatar_url ? (
                <img src={nextBirthday.avatar_url} alt={nextBirthday.name} className="w-full h-full object-cover rounded-[24px]" />
              ) : (
                <span className="text-4xl md:text-6xl font-black text-indigo-400">
                  {nextBirthday.name.charAt(0)}
                </span>
              )}
            </div>
            {isToday && (
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-2.5 rounded-2xl shadow-xl animate-bounce">
                <PartyPopper size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-300 border border-indigo-500/20 mb-3">
              <Star size={12} className="fill-indigo-300" />
              Upcoming
            </div>
            
            <div className="mb-2">
              <h1 className="text-3xl md:text-5xl font-black font-display text-white leading-tight break-words">
                {nextBirthday.name}
              </h1>
              <div className="text-indigo-400 text-lg md:text-2xl font-black mt-1">
                Turning {getCurrentAge(nextBirthday.date)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-slate-400 font-bold">
              <div className="flex items-center gap-2 text-sm md:text-lg">
                <Calendar size={16} className="text-indigo-500" />
                {format(parseISO(nextBirthday.date), "MMM d")}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10 hidden md:block" />
              <div className="text-indigo-500 text-sm md:text-lg uppercase tracking-tight">
                {isToday ? "Happening Today!" : `In ${daysLeft} days`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
