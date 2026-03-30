"use client";

import { motion } from "framer-motion";
import { PartyPopper, Calendar, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type Birthday } from "@/hooks/use-birthdays";

interface HeroSectionProps {
  birthdays: Birthday[];
  getDaysRemaining: (date: string) => number;
}

export function HeroSection({ birthdays, getDaysRemaining }: HeroSectionProps) {
  if (birthdays.length === 0) return null;

  const nextBirthday = birthdays[0];
  const daysLeft = getDaysRemaining(nextBirthday.date);
  const isToday = daysLeft === 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden glass-dark rounded-3xl p-8 border-2 border-indigo-500/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PartyPopper size={300} strokeWidth={0.5} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-40 h-40 rounded-3xl bg-indigo-500/20 flex items-center justify-center overflow-hidden border-2 border-white/10 p-4">
              {nextBirthday.avatar_url ? (
                <img 
                  src={nextBirthday.avatar_url} 
                  alt={nextBirthday.name} 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              ) : (
                <span className="text-6xl font-bold text-indigo-400">
                  {nextBirthday.name.charAt(0)}
                </span>
              )}
            </div>
            {isToday && (
              <div className="absolute -top-4 -right-4 bg-pink-500 text-white p-3 rounded-2xl shadow-xl animate-bounce">
                <PartyPopper size={24} />
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-indigo-300 border border-white/10 mb-4">
              <Star size={14} className="fill-indigo-300" />
              Upcoming Celebration
            </span>
            <h1 className="text-5xl md:text-6xl font-bold font-display mb-2 drop-shadow-lg">
              {nextBirthday.name}
            </h1>
            <p className="text-xl text-slate-400 flex items-center justify-center md:justify-start gap-2">
              <Calendar size={20} className="text-indigo-400" />
              Next on {format(parseISO(nextBirthday.date), "MMMM d")}
              <span className="text-indigo-500 font-bold ml-2">
                • {isToday ? "Happening Today!" : `In ${daysLeft} days`}
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      </motion.div>
    </div>
  );
}
