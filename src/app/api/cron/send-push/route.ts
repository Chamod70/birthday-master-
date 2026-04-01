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

    let pushCount = 0;

    for (const birthday of birthdays) {
      if (!birthday.birthday_date) continue;
      
      const [y, m, d] = birthday.birthday_date.split("-").map(Number);
      let nextBirthday = new Date(currentYear, m - 1, d);
      if (nextBirthday < today) nextBirthday = new Date(currentYear + 1, m - 1, d);
      
      const daysDiff = Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const alreadySentDDay = birthday.last_notification_year === currentYear && birthday.last_notification_type === "d-day";

      // Trigger condition: It's the birthday, reminder is on, and not already sent this year
      if (daysDiff === 0 && birthday.reminder_6am && !alreadySentDDay) {
        
        // Find subscriptions for this specific user
        const userSubscriptions = subscriptions.filter(s => s.user_id === birthday.user_id);
        let sentAny = false;

        for (const sub of userSubscriptions) {
          try {
            const parsedSub = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;
            
            await webpush.sendNotification(parsedSub, JSON.stringify({
              title: "Happy Birthday! 🎂",
              body: `Wish ${birthday.name} a happy birthday today!`,
              icon: birthday.avatar_url || "/icons/icon-192x192.png",
            }));

            sentAny = true;
            pushCount++;
          } catch (e: any) {
            console.error(`Push failed for sub of user ${birthday.user_id}:`, e);
          }
        }

        // Log the outcome to Supabase
        await supabase.from("notification_logs").insert({
          birthday_id: birthday.id,
          user_id: birthday.user_id,
          status: sentAny ? "sent" : "failed",
          error_message: sentAny ? null : "No active subscriptions reached"
        });

        if (sentAny) {
          // Update birthday record to prevent double-sending
          await supabase.from("birthdays").update({
            last_notification_year: currentYear,
            last_notification_type: "d-day"
          }).eq("id", birthday.id);
        }
      }
    }

    return NextResponse.json({ success: true, processed: birthdays.length, pushed: pushCount });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
