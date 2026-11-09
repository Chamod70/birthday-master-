import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSriLankaToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formatted = formatter.format(new Date());
  const parts = formatted.split('-').map(Number);
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
    dateKey: formatted,
  };
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ birthdays: [], hasBirthdaysToday: false }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.auth.signInWithPassword({
      email: 'champikachamod70@gmail.com',
      password: 'Celebrate123Master!',
    });

    const { data: birthdays } = await supabase.from('birthdays').select('*');
    const { month: currentMonth, day: currentDay, dateKey } = getSriLankaToday();

    const todaysBirthdays = (birthdays || [])
      .filter((b: any) => {
        if (!b.birthday_date) return false;
        const [, m, d] = b.birthday_date.split('-').map(Number);
        return m === currentMonth && d === currentDay && b.reminder_6am !== false;
      })
      .map((b: any) => ({
        id: b.id,
        name: b.name,
        date: b.birthday_date,
        relationship: b.relationship || 'Friend',
      }));

    return NextResponse.json(
      {
        date: dateKey,
        hasBirthdaysToday: todaysBirthdays.length > 0,
        birthdays: todaysBirthdays,
        allBirthdays: (birthdays || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          date: b.birthday_date,
          reminder_6am: b.reminder_6am !== false,
        })),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message, birthdays: [], hasBirthdaysToday: false }, { status: 500 });
  }
}

