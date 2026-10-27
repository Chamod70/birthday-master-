"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Cake, User, SortAsc, Bell, Filter, Calendar } from "lucide-react";
import { BirthdayCard } from "@/components/BirthdayCard";
import { HeroSection } from "@/components/HeroSection";
import { AddBirthdayModal } from "@/components/AddBirthdayModal";
import { ImportExcelModal } from "@/components/ImportExcelModal";
import { useBirthdays } from "@/hooks/use-birthdays";
import { cn } from "@/lib/utils";
import { FileSpreadsheet } from "lucide-react";

export default function Home() {
  const { 
    birthdays, 
    user,
    addBirthday, 
    addBirthdays,
    deleteBirthday, 
    getDaysRemaining, 
    getCurrentAge,
    subscribeToPush,
    checkNotifications,
    isLoaded,
    errorMsg,
    stats
  } = useBirthdays();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "stats">("all");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredBirthdays = birthdays.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || b.relationship === filterType;
    return matchesSearch && matchesFilter;
  });

  const upcoming30Days = birthdays.filter(b => getDaysRemaining(b.date) <= 30);

  const handleSignIn = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const email = "champikachamod70@gmail.com";
    const password = "Celebrate123Master!";
    
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
         const { error: signUpError } = await supabase.auth.signUp({ email, password });
         if (!signUpError) window.location.reload();
         else alert("Signup failed: " + signUpError.message);
      } else {
         alert("Error: " + signInError.message);
      }
    } else {
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const interval = setInterval(checkNotifications, 1000 * 60 * 15);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  useEffect(() => {
    if (isLoaded) checkNotifications();
  }, [isLoaded, birthdays.length, checkNotifications]);

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar pb-32 relative bg-[#020617] text-slate-200 min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12 relative z-10">
        {/* Modern Header */}
        <header className="flex items-center justify-between mb-8 md:mb-16">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-2xl">
              <Cake size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Celebrate<span className="text-indigo-400">Me</span>
              </h1>
            </div>
          </motion.div>
          
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2">
            {!user ? (
              <button onClick={handleSignIn} className="px-4 py-2.5 glass rounded-xl text-[10px] md:text-sm font-black text-white hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2 uppercase tracking-widest">
                <User size={14} /> Cloud
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <button onClick={subscribeToPush} className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl transition-all"><Bell size={18} /></button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button onClick={handleSignOut} className="p-2.5 text-slate-400 rounded-xl transition-all"><User size={18} /></button>
              </div>
            )}
          </motion.div>
        </header>

        {/* Hero Section - Upcoming Highlight */}
        {isLoaded && birthdays.length > 0 && (
          <HeroSection 
            birthdays={birthdays} 
            getDaysRemaining={getDaysRemaining} 
            getCurrentAge={getCurrentAge}
          />
        )}

        {/* Dynamic Navigation Tabs */}
        <div className="flex justify-center mb-10 md:mb-12 sticky top-6 z-20">
           <div className="glass p-1.5 rounded-full border border-white/10 flex gap-1 shadow-2xl backdrop-blur-2xl">
              {[
                { id: 'all', label: 'All', icon: Cake },
                { id: 'upcoming', label: 'Coming', icon: Calendar },
                { id: 'stats', label: 'Stats', icon: SortAsc }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-7 md:px-10 py-3 rounded-full text-xs font-black flex items-center gap-2 transition-all",
                    activeTab === tab.id ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/30" : "text-slate-400 hover:text-white"
                  )}
                >
                  <tab.icon size={16} />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
           </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "all" && (
            <motion.div key="all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               {/* Controls */}
               <div className="flex flex-col gap-3 mb-6">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[20px] p-4 pl-14 outline-none text-white focus:bg-white/10 transition-all font-medium placeholder-slate-600"
                    />
                  </div>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-300 outline-none hover:bg-white/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="All" className="bg-slate-900">All Contacts</option>
                    <option value="Family" className="bg-slate-900">Family</option>
                    <option value="Friend" className="bg-slate-900">Friend</option>
                    <option value="Colleague" className="bg-slate-900">Colleague</option>
                    <option value="Office" className="bg-slate-900">Office</option>
                  </select>
               </div>

               <div className="flex justify-between items-center mb-6 px-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Cake className="text-indigo-400" size={20} />
                    All Contacts
                  </h2>
                  <button 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all uppercase tracking-widest"
                  >
                    <FileSpreadsheet size={16} />
                    Import Excel
                  </button>
               </div>
               
               {/* Birthday Grid */}
               <div className="grid gap-3">
                  {filteredBirthdays.length > 0 ? (
                    filteredBirthdays.map((b, i) => (
                      <BirthdayCard 
                        key={b.id} 
                        id={b.id}
                        name={b.name} 
                        date={b.date} 
                        daysRemaining={getDaysRemaining(b.date)} 
                        avatar_url={b.avatar_url} 
                        relationship={b.relationship} 
                        notes={b.notes}
                        age={getCurrentAge(b.date)}
                        onDelete={() => deleteBirthday(b.id)} 
                        post_url={b.post_url}
                        index={i} 
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center glass rounded-[32px] border-dashed border-2 border-white/10 opacity-40">
                       <Filter className="mx-auto mb-4 text-slate-600" size={40} />
                       <p className="text-lg font-bold">Nothing found</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === "upcoming" && (
            <motion.div key="upcoming" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl md:text-3xl font-black">Next 30 Days</h2>
                  <div className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full font-black text-[10px] md:text-sm border border-indigo-500/30 uppercase tracking-widest">{upcoming30Days.length} Events</div>
               </div>
               
               <div className="grid gap-3">
                  {upcoming30Days.length > 0 ? (upcoming30Days.map((b, i) => (
                    <BirthdayCard 
                      key={b.id} 
                      id={b.id}
                      name={b.name} 
                      date={b.date} 
                      daysRemaining={getDaysRemaining(b.date)} 
                      avatar_url={b.avatar_url} 
                      relationship={b.relationship} 
                      notes={b.notes}
                      age={getCurrentAge(b.date)}
                      post_url={b.post_url}
                      onDelete={() => deleteBirthday(b.id)} 
                      index={i} 
                    />
                  ))) : (
                    <div className="py-20 text-center opacity-40">No celebrations in the next month.</div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               {/* Quick Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Celebrations", value: stats.total, color: "indigo" },
                    { label: "Birthdays This Month", value: stats.thisMonth, color: "fuchsia" },
                    { label: "Next 30 Days", value: stats.next30Days, color: "emerald" }
                  ].map((stat, i) => (
                    <div key={i} className="glass rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                       <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform", 
                         stat.color === 'indigo' ? "bg-indigo-500/20" : stat.color === 'fuchsia' ? "bg-fuchsia-500/20" : "bg-emerald-500/20")} 
                       />
                       <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                       <h3 className="text-5xl font-black font-display">{stat.value}</h3>
                    </div>
                  ))}
               </div>

               {/* Month Chart Placeholder */}
               <div className="glass rounded-[40px] p-10 border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-3"><Cake className="text-indigo-500" /> Yearly Breakdown</h3>
                    <div className="flex gap-1">
                       {stats.monthlyBreakdown.map((m, i) => (
                         <div key={i} className="flex flex-col items-center gap-2 group flex-1 min-w-0">
                            <div className="w-full relative h-[150px] bg-white/5 rounded-full overflow-hidden flex flex-col justify-end">
                               <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${(m.count / (Math.max(...stats.monthlyBreakdown.map(x => x.count)) || 1)) * 100}%` }}
                                 className="bg-indigo-500 w-full group-hover:bg-indigo-400 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                               />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{m.name}</span>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] shadow-[0_20px_50px_-15px_rgba(99,102,241,1)] flex items-center justify-center text-white z-50 border-t border-white/30 active:scale-95 transition-transform"><Plus size={40} strokeWidth={3} /></motion.button>
      <AddBirthdayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addBirthday} />
      <ImportExcelModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={addBirthdays} />
    </main>
  );
}

