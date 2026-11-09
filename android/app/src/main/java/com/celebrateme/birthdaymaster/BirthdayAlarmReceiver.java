package com.celebrateme.birthdaymaster;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.PowerManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class BirthdayAlarmReceiver extends BroadcastReceiver {
    public static final String PREFS_NAME = "CelebrateMePrefs";
    public static final String KEY_BIRTHDAYS_JSON = "birthdays_json";
    public static final String KEY_LAST_NOTIFIED_DATE = "last_notified_date";
    private static final String CLOUD_API_URL = "https://birthday-master2.vercel.app/api/today-birthdays";

    @Override
    public void onReceive(Context context, Intent intent) {
        // 1. Immediately schedule tomorrow's 6:00 AM alarm so the daily chain never breaks
        AlarmScheduler.scheduleDaily6Am(context, true);

        final PendingResult pendingResult = goAsync();
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        final PowerManager.WakeLock wakeLock = pm != null
                ? pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "CelebrateMe:Daily6AmAlarm")
                : null;
        if (wakeLock != null) {
            wakeLock.acquire(15000);
        }

        new Thread(() -> {
            try {
                checkAndNotify(context.getApplicationContext(), false);
            } finally {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
                pendingResult.finish();
            }
        }).start();
    }

    public static void checkAndNotify(Context context, boolean isManualTest) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String todayFull = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String todayMonthDay = new SimpleDateFormat("MM-dd", Locale.US).format(new Date());

        if (!isManualTest) {
            String lastNotified = prefs.getString(KEY_LAST_NOTIFIED_DATE, "");
            if (todayFull.equals(lastNotified)) {
                return;
            }
        }

        // Try refreshing from cloud API first (with short timeout)
        try {
            URL url = new URL(CLOUD_API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();
                JSONObject responseObj = new JSONObject(sb.toString());
                if (responseObj.has("allBirthdays")) {
                    JSONArray allArr = responseObj.getJSONArray("allBirthdays");
                    prefs.edit().putString(KEY_BIRTHDAYS_JSON, allArr.toString()).apply();
                }
            }
            conn.disconnect();
        } catch (Exception ignored) {
            // Offline or timeout - fallback to locally synced SharedPreferences
        }

        String birthdaysJson = prefs.getString(KEY_BIRTHDAYS_JSON, "[]");
        List<String> birthdayNamesToday = new ArrayList<>();

        try {
            JSONArray arr = new JSONArray(birthdaysJson);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                String dateStr = obj.optString("date", obj.optString("birthday_date", ""));
                boolean reminder6am = obj.optBoolean("reminder_6am", true);
                String name = obj.optString("name", "Friend");

                if (reminder6am && dateStr.length() >= 10) {
                    String monthDay = dateStr.substring(5, 10);
                    if (todayMonthDay.equals(monthDay)) {
                        birthdayNamesToday.add(name);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        if (!birthdayNamesToday.isEmpty()) {
            for (int i = 0; i < birthdayNamesToday.size(); i++) {
                String name = birthdayNamesToday.get(i);
                NotificationHelper.showNotification(
                        context,
                        1000 + i,
                        "Happy Birthday! 🎂",
                        "Wish " + name + " a happy birthday today!"
                );
            }
        } else {
            NotificationHelper.showNotification(
                    context,
                    2000,
                    "NO BIRTHDAY TODAY",
                    "No birthdays scheduled for today. Have a great day! ✨"
            );
        }

        if (!isManualTest) {
            prefs.edit().putString(KEY_LAST_NOTIFIED_DATE, todayFull).apply();
        }
    }
}

