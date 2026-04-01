import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

webpush.setVapidDetails(
  'mailto:champikachamod70@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
  try {
    // 1. Authenticate forcefully as the owner to bypass RLS
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'champikachamod70@gmail.com',
      password: 'Celebrate123Master!'
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Auth failed for cron: " + authError?.message }, { status: 401 });
    }

    // 2. Fetch Birthdays & Subscriptions
    const [{ data: birthdays }, { data: subscriptions }] = await Promise.all([
      supabase.from("birthdays").select("*"),
      supabase.from("push_subscriptions").select("*")
    ]);

    if (!birthdays || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: "No data or subscriptions" });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const currentHour = today.getHours();

    let pushCount = 0;

    for (const birthday of birthdays) {
      if (!birthday.birthday_date) continue;
      const [y, m, d] = birthday.birthday_date.split("-").map(Number);
      
      let nextBirthday = new Date(currentYear, m - 1, d);
      if (nextBirthday < today) nextBirthday = new Date(currentYear + 1, m - 1, d);
      
      const days = Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const alreadySentDDay = birthday.last_notification_year === currentYear && birthday.last_notification_type === "d-day";

      let title = "";
      let body = "";
      let newType = "";

      // Send ONLY at 6 AM on the actual birthday
      if (days === 0 && birthday.reminder_6am && !alreadySentDDay) {
         title = "It's Birthday Time! 🎂";
         body = `Wish ${birthday.name} a happy birthday today!`;
         newType = "d-day";
      }

      if (title !== "") {
         const payload = JSON.stringify({ title, body, icon: birthday.avatar_url });
         
         let sent = false;
         for (const sub of subscriptions) {
           try {
              let parsedSub;
              if (typeof sub.subscription === 'string') parsedSub = JSON.parse(sub.subscription);
              else parsedSub = sub.subscription;
              
              await webpush.sendNotification(parsedSub, payload);
              pushCount++;
              sent = true;
           } catch (e) {
              console.error("Web Push failed", e);
           }
         }

         if (sent) {
           // Update DB
           await supabase.from("birthdays").update({
             last_notification_year: currentYear,
             last_notification_type: newType
           }).eq("id", birthday.id);
         }
      }
    }

    return NextResponse.json({ success: true, pushed: pushCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
