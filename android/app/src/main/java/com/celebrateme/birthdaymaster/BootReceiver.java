package com.celebrateme.birthdaymaster;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        NotificationHelper.ensureChannel(context);
        AlarmScheduler.scheduleDaily6Am(context, false);
    }
}

