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

function getSriLankaToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.format(new Date()).split('-').map(Number);
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
    dateKey: formatter.format(new Date()),
  };
}

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

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: "No active push subscriptions" });
    }

    const birthdayList = birthdays || [];

    // 3. Process each birthday using Sri Lanka Time (Asia/Colombo, UTC+5:30)
    const { year: currentYear, month: currentMonth, day: currentDay } = getSriLankaToday();

    let pushCount = 0;
    const usersWithBirthdayToday = new Set<string>();

    for (const birthday of birthdayList) {
      if (!birthday.birthday_date) continue;
      
      const [, m, d] = birthday.birthday_date.split("-").map(Number);
      const isBirthdayToday = m === currentMonth && d === currentDay;

      if (isBirthdayToday && birthday.reminder_6am !== false) {
        if (birthday.user_id) {
          usersWithBirthdayToday.add(birthday.user_id);
        }

        const alreadySentDDay =
          birthday.last_notification_year === currentYear &&
          birthday.last_notification_type === "d-day";

        if (!alreadySentDDay) {
          const userSubscriptions = subscriptions.filter(s => s.user_id === birthday.user_id);
          let sentAny = false;

          for (const sub of userSubscriptions) {
            try {
              const parsedSub = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;
              
              await webpush.sendNotification(parsedSub, JSON.stringify({
                title: "Happy Birthday! 🎂",
                body: `Wish ${birthday.name} a happy birthday today!`,
                icon: birthday.avatar_url || "/favicon.ico",
              }));

              sentAny = true;
              pushCount++;
            } catch (e: any) {
              console.error(`Push failed for sub of user ${birthday.user_id}:`, e);
            }
          }

          await supabase.from("notification_logs").insert({
            birthday_id: birthday.id,
            user_id: birthday.user_id,
            status: sentAny ? "sent" : "failed",
            error_message: sentAny ? null : "No active subscriptions reached"
          });

          if (sentAny) {
            await supabase.from("birthdays").update({
              last_notification_year: currentYear,
              last_notification_type: "d-day"
            }).eq("id", birthday.id);
          }
        }
      }
    }

    // 4. Send "NO BIRTHDAY TODAY" at 6:00 AM for subscribed users who have NO birthdays today
    const uniqueUserIds = Array.from(new Set(subscriptions.map(s => s.user_id).filter(Boolean)));
    let noBirthdayPushCount = 0;

    for (const userId of uniqueUserIds) {
      if (!usersWithBirthdayToday.has(userId)) {
        const userSubscriptions = subscriptions.filter(s => s.user_id === userId);
        let sentNoBirthday = false;

        for (const sub of userSubscriptions) {
          try {
            const parsedSub = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;

            await webpush.sendNotification(parsedSub, JSON.stringify({
              title: "NO BIRTHDAY TODAY",
              body: "No birthdays scheduled for today. Have a great day! ✨",
              icon: "/favicon.ico",
            }));

            sentNoBirthday = true;
            pushCount++;
            noBirthdayPushCount++;
          } catch (e: any) {
            console.error(`No-birthday push failed for user ${userId}:`, e);
          }
        }

        try {
          await supabase.from("notification_logs").insert({
            birthday_id: null,
            user_id: userId,
            status: sentNoBirthday ? "sent" : "failed",
            error_message: sentNoBirthday ? "NO BIRTHDAY TODAY" : "No active subscriptions reached (NO BIRTHDAY TODAY)"
          });
        } catch {}
      }
    }

    // 5. Update Heartbeat Table (Always updates, so user sees "Daily Activity")
    await supabase.from("cron_heartbeat").insert({
      last_run_at: new Date().toISOString(),
      status: "ok",
      processed_count: birthdayList.length,
      pushed_count: pushCount
    });

    return NextResponse.json({
      success: true,
      processed: birthdayList.length,
      pushed: pushCount,
      noBirthdayPushed: noBirthdayPushCount,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    try {
      await supabase.from("cron_heartbeat").insert({
        last_run_at: new Date().toISOString(),
        status: "error",
        processed_count: 0,
        pushed_count: 0
      });
    } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
