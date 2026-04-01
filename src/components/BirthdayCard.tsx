import { motion, AnimatePresence } from "framer-motion";
import { Cake, Trash2, Calendar, UserCircle, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useBirthdays } from "@/hooks/use-birthdays";

interface BirthdayCardProps {
  id: string;
  name: string;
  date: string;
  daysRemaining: number;
  avatar_url?: string;
  relationship?: string;
  notes?: string;
  age?: number;
  onDelete?: () => void;
  index?: number;
}

export function BirthdayCard({
  id,
  name,
  date,
  daysRemaining,
  avatar_url,
  relationship = "Other",
  notes,
  age,
  onDelete,
  index = 0,
}: BirthdayCardProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name, date, relationship, notes: notes || "" });
  
  const { updateBirthday } = useBirthdays();
  const isToday = daysRemaining === 0;
  
  const relColors: any = {
    Family: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    Friend: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Colleague: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Office: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Other: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateBirthday(id, editedData as any);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => !isEditing && setIsSelected(!isSelected)}
      className={cn(
        "group relative glass rounded-[28px] transition-all cursor-pointer border border-white/5 overflow-hidden",
        isSelected ? "bg-white/10 ring-2 ring-indigo-500/50 shadow-2xl" : "hover:bg-white/5",
        isEditing && "ring-2 ring-amber-500/50",
        isToday && "ring-2 ring-pink-500/50 bg-pink-500/5 shadow-[0_0_40px_rgba(236,72,153,0.1)]"
      )}
    >
      <div className="p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative shrink-0">
            {avatar_url ? (
              <img src={avatar_url} alt={name} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-white/10 shadow-lg" />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                {name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input 
                autoFocus
                value={editedData.name}
                onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white w-full outline-none focus:bg-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-black text-lg md:text-xl tracking-tight text-white/90 truncate">
                {name}
                {age && <span className="ml-2 text-indigo-400 text-sm">({age})</span>}
              </h3>
            )}
            
            <div className="flex items-center gap-3 mt-1">
               {isEditing ? (
                 <select 
                  value={editedData.relationship}
                  onChange={(e) => setEditedData({...editedData, relationship: e.target.value as any})}
                  className="bg-white/5 border border-white/10 rounded-lg text-[10px] text-white px-1 outline-none"
                  onClick={(e) => e.stopPropagation()}
                 >
                   <option value="Friend">Friend</option>
                   <option value="Family">Family</option>
                   <option value="Colleague">Colleague</option>
                   <option value="Office">Office</option>
                   <option value="Other">Other</option>
                 </select>
               ) : (
                 <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0", relColors[relationship] || relColors.Other)}>
                  {relationship}
                </span>
               )}
               
               {isEditing ? (
                 <input 
                  type="date"
                  value={editedData.date}
                  onChange={(e) => setEditedData({...editedData, date: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-lg text-[10px] text-white px-1 outline-none"
                  onClick={(e) => e.stopPropagation()}
                 />
               ) : (
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-widest truncate">
                    <Calendar size={12} />
                    {format(parseISO(date), "MMM d")}
                  </p>
               )}
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className={cn("text-2xl md:text-3xl font-black font-display tracking-tight leading-none", isToday ? "text-pink-400" : "text-white")}>
                {isToday ? "BDAY!" : daysRemaining === 1 ? "TOMW" : daysRemaining}
              </div>
              {!isToday && <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-1">Days</div>}
            </div>
            <ChevronRight className={cn("text-slate-700 transition-transform", isSelected && "rotate-90 text-indigo-500")} size={16} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 space-y-4">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-1 flex items-center gap-2"><MessageSquare size={10} /> Note</p>
                {isEditing ? (
                  <textarea 
                    value={editedData.notes}
                    onChange={(e) => setEditedData({...editedData, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-slate-300 outline-none focus:bg-white/10 h-20"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-sm text-slate-300 italic">{notes || "No notes added yet..."}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                 {isEditing ? (
                    <>
                      <button 
                        onClick={handleSave}
                        className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition-all border border-emerald-500/20 active:scale-95"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                        className="px-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/5"
                      >
                        Cancel
                      </button>
                    </>
                 ) : (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition-all border border-indigo-500/20 active:scale-95"
                      >
                        Edit Details
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition-all border border-red-500/20 active:scale-95 flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
