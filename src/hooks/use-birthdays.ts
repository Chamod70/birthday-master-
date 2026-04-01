"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  differenceInDays, 
  addYears, 
  isBefore, 
  startOfDay, 
  isSameDay,
  setYear,
  parseISO
} from "date-fns";
import { createClient } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";

export interface Birthday {
  id: string;
  user_id?: string;
  name: string;
  date: string;
  avatar_url?: string;
  relationship?: "Family" | "Friend" | "Colleague" | "Other";
  reminder_6am: boolean;
  reminder_6pm: boolean;
  notes?: string;
  last_notification_type?: "d-1" | "d-day";
  last_notification_year?: number;
}

const supabase = createClient();

export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load User
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from("birthdays")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          // Map 'birthday_date' to 'date' for local state
          const mapped = data.map((d: any) => ({
            ...d,
            date: d.birthday_date,
            birthday_date: undefined
          }));
          setBirthdays(mapped);
        }
      } else {
        const saved = localStorage.getItem("celebrate-me-birthdays");
        if (saved) {
          setBirthdays(JSON.parse(saved));
        }
      }
    } catch (e: any) {
      console.error("Fetch Error:", e);
      setErrorMsg(e.message || "Failed to fetch birthdays");
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Local if no user
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem("celebrate-me-birthdays", JSON.stringify(birthdays));
    }
  }, [birthdays, isLoaded, user]);

  const addBirthday = async (data: Omit<Birthday, "id">) => {
    if (user) {
      const payload = {
        name: data.name,
        birthday_date: data.date, 
        avatar_url: data.avatar_url,
        relationship: data.relationship,
        reminder_6am: data.reminder_6am,
        reminder_6pm: data.reminder_6pm,
        notes: data.notes,
        user_id: user.id
      };

      const { data: inserted, error } = await supabase
        .from("birthdays")
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        alert("Failed to save birthday: " + error.message);
        console.error("Insert Error", error);
      } else if (inserted) {
        setBirthdays((prev) => [{ ...inserted, date: inserted.birthday_date }, ...prev]);
      }
    } else {
      const newB: Birthday = { ...data, id: crypto.randomUUID() };
      setBirthdays((prev) => [newB, ...prev]);
    }
  };

  const deleteBirthday = async (id: string) => {
    if (user) {
      await supabase.from("birthdays").delete().eq("id", id);
    }
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
  };

  const getDaysRemaining = (dateString: string) => {
    const today = startOfDay(new Date());
    const [year, month, day] = dateString.split("-").map(Number);
    let nextBirthday = new Date(today.getFullYear(), month - 1, day);
    if (isBefore(nextBirthday, today)) nextBirthday = addYears(nextBirthday, 1);
    return differenceInDays(nextBirthday, today);
  };

  const sortedBirthdays = [...birthdays].sort((a, b) => {
    return getDaysRemaining(a.date) - getDaysRemaining(b.date);
  });

  const checkNotifications = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentHour = now.getHours();

    let stateChanged = false;
    const updatedBirthdays = birthdays.map((birthday) => {
      const days = getDaysRemaining(birthday.date);
      let newB = { ...birthday };

      const alreadySentDDay = birthday.last_notification_year === currentYear && birthday.last_notification_type === "d-day";

      if (days === 0 && birthday.reminder_6am && currentHour >= 6 && !alreadySentDDay) {
        new Notification("It's Birthday Time! 🎂", { 
          body: `Wish ${birthday.name} a happy birthday today!`,
          icon: birthday.avatar_url || undefined
        });
        newB.last_notification_year = currentYear;
        newB.last_notification_type = "d-day";
        stateChanged = true;
      }
      return newB;
    });

    if (stateChanged) {
      setBirthdays(updatedBirthdays);
    }
  }, [birthdays, getDaysRemaining]);

  const subscribeToPush = async () => {
    if (!user || !("serviceWorker" in navigator)) return;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      subscription: subscription.toJSON(),
    });
    
    if (error) {
       alert("Error saving push subscription: " + error.message);
    } else {
       alert("Cloud Background Notifications Enabled! 🚀");
    }
  };

  const stats = {
    total: birthdays.length,
    thisMonth: birthdays.filter(b => {
      const m = parseInt(b.date.split("-")[1]);
      return m === (new Date().getMonth() + 1);
    }).length,
    next30Days: birthdays.filter(b => getDaysRemaining(b.date) <= 30).length,
    monthlyBreakdown: Array.from({ length: 12 }, (_, i) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        name: monthNames[i],
        count: birthdays.filter(b => parseInt(b.date.split("-")[1]) === (i + 1)).length
      };
    })
  };

  return {
    birthdays: sortedBirthdays,
    user,
    addBirthday,
    deleteBirthday,
    getDaysRemaining,
    subscribeToPush,
    checkNotifications,
    isLoaded,
    fetchData,
    errorMsg,
    stats,
  };
}
