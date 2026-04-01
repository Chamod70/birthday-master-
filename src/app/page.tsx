"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Cake, User, SortAsc, Bell, Filter } from "lucide-react";
import { BirthdayCard } from "@/components/BirthdayCard";
import { HeroSection } from "@/components/HeroSection";
import { AddBirthdayModal } from "@/components/AddBirthdayModal";
import { useBirthdays } from "@/hooks/use-birthdays";

export default function Home() {
  const { 
    birthdays, 
    user,
    addBirthday, 
    deleteBirthday, 
    getDaysRemaining, 
    subscribeToPush,
    checkNotifications,
    isLoaded,
    errorMsg
  } = useBirthdays();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignIn = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const email = "champikachamod70@gmail.com";
    const password = "Celebrate123Master!"; // Dummy password for background connect
    
    // First try to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
         // User doesn't exist, create it!
         const { error: signUpError } = await supabase.auth.signUp({ email, password });
         if (signUpError) {
           if (signUpError.message.includes("User already registered")) {
              alert("Oya kalin try kalapu nisa parana account ekak hadila thiyenawa. Supabase Dashboard eken -> Authentication -> Users gihin 'champikachamod70@gmail.com' eka Delete karala aith try karanna! (Nattam apita wena podi email address ekak test karanna wenawa).");
           } else {
              alert("Signup failed: " + signUpError.message + " - Did you turn off 'Confirm Email'?");
           }
         } else {
           // Should be logged in automatically!
           alert("Successfully connected to cloud for the first time! 🎉");
           window.location.reload();
         }
      } else if (signInError.message.includes("Email not confirmed")) {
         alert("Please disable 'Confirm email' in Supabase Dashboard -> Auth -> Providers -> Email, then try again!");
      } else {
         alert("Error: " + signInError.message);
      }
    } else {
      alert("Successfully connected to Cloud! 🎉");
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Set interval to check for notifications periodically
  useEffect(() => {
    const interval = setInterval(checkNotifications, 1000 * 60 * 15); // Check every 15 mins
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Check once when loaded
  useEffect(() => {
    if (isLoaded) checkNotifications();
  }, [isLoaded, birthdays.length, checkNotifications]);

  const testNotification = async () => {
    if (Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification("🚀 CelebrateMe Test", {
          body: "This is a test alert! Your notifications are working supiri! 🎉",
          vibrate: [200, 100, 200],
          tag: 'test-notification'
        } as any);
      } catch (e) {
        // Fallback for non-SW environments
        new Notification("🚀 CelebrateMe Test", {
          body: "This is a test alert! Notifications are working! 🎉",
        });
      }
    } else {
      subscribeToPush();
    }
  };

  const filteredBirthdays = birthdays.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 glass rounded-2xl text-indigo-500 shadow-xl border-indigo-500/30">
              <Cake size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-white/90">
                Celebrate<span className="text-indigo-500">Me</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Birthday Master
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!user ? (
              <button 
                onClick={handleSignIn}
                className="px-6 py-3 glass rounded-2xl text-sm font-bold text-indigo-400 hover:text-white transition-all active:scale-95 flex items-center gap-2"
              >
                <User size={16} /> Cloud Sync
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={testNotification}
                  className="px-4 py-2 glass rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
                >
                  TEST
                </button>
                <button 
                  onClick={subscribeToPush}
                  className="p-3 glass rounded-2xl text-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-90"
                  title="Enable True Background Notifications"
                >
                  <Bell size={20} />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-3 glass rounded-2xl text-slate-400 hover:text-red-400 transition-all active:scale-90"
                  title="Disconnect Cloud"
                >
                  <User size={20} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        {isLoaded && birthdays.length > 0 && (
          <HeroSection 
            birthdays={birthdays} 
            getDaysRemaining={getDaysRemaining} 
          />
        )}

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8 mt-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search celebrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 ring-indigo-500/30 outline-none placeholder-slate-500 transition-all focus:bg-white/10"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar shrink-0">
             <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3 border-white/5 whitespace-nowrap bg-indigo-500/5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user ? "Cloud DB" : "Local"}</span>
                <span className="text-2xl font-bold font-display text-indigo-400">{birthdays.length}</span>
             </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
             <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
               {searchQuery ? "Search Results" : "Upcoming Birthdays"}
             </h2>
             <SortAsc size={14} className="text-slate-600" />
          </div>

          {errorMsg ? (
            <div className="py-20 text-center text-red-500 uppercase tracking-widest text-sm font-bold bg-red-500/10 rounded-3xl p-4">
              Error loading: {errorMsg}
            </div>
          ) : !isLoaded ? (
            <div className="py-20 text-center animate-pulse text-indigo-500/50 uppercase tracking-widest text-sm font-bold">
              Loading Celebrations...
            </div>
          ) : filteredBirthdays.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredBirthdays.map((birthday, index) => (
                  <BirthdayCard
                    key={birthday.id}
                    name={birthday.name}
                    date={birthday.date}
                    daysRemaining={getDaysRemaining(birthday.date)}
                    avatar_url={birthday.avatar_url}
                    onDelete={() => deleteBirthday(birthday.id)}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-20 flex flex-col items-center justify-center text-center opacity-40 glass rounded-[32px] border-dashed border-2"
             >
               <Cake size={48} className="mb-4 text-slate-600" strokeWidth={1} />
               <p className="text-slate-400 font-medium">No celebrations found.</p>
               <p className="text-xs text-slate-600 uppercase mt-1 tracking-widest">Add your first contact below</p>
             </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center text-white z-50 border border-white/20 active:scale-90 transition-transform"
      >
        <Plus size={32} />
      </motion.button>

      <AddBirthdayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addBirthday}
      />
    </main>
  );
}

