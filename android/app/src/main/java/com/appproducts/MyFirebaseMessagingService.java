    // package com.appproducts;

    // import android.app.NotificationChannel;
    // import android.app.NotificationManager;
    // import android.app.PendingIntent;
    // import android.content.Context;
    // import android.content.Intent;
    // import android.media.RingtoneManager;
    // import android.net.Uri;
    // import android.os.Build;
    // import android.util.Log;

    // import androidx.annotation.NonNull;
    // import androidx.core.app.NotificationCompat;
    // import androidx.work.OneTimeWorkRequest;
    // import androidx.work.WorkManager;
    // import androidx.work.Worker;
    // import androidx.work.WorkerParameters;

    // import com.google.firebase.messaging.FirebaseMessagingService;
    // import com.google.firebase.messaging.RemoteMessage;

    // public class MyFirebaseMessagingService extends FirebaseMessagingService {

    //     private static final String TAG = "MyFirebaseMsgService";

    //     @Override
    //     public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
    //         Log.d(TAG, "From: " + remoteMessage.getFrom());

    //         // Handle data payload
    //         if (!remoteMessage.getData().isEmpty()) {
    //             Log.d(TAG, "Data Payload: " + remoteMessage.getData());
    //             scheduleJob(); // Use WorkManager for long-running background tasks
    //         }

    //         // Handle notification payload
    //         if (remoteMessage.getNotification() != null) {
    //             String title = remoteMessage.getNotification().getTitle();
    //             String body = remoteMessage.getNotification().getBody();
    //             Log.d(TAG, "Notification Title: " + title);
    //             Log.d(TAG, "Notification Body: " + body);
    //             sendNotification(title, body);
    //         }
    //     }

    //     @Override
    //     public void onNewToken(@NonNull String token) {
    //         Log.d(TAG, "Refreshed FCM token: " + token);
    //         sendRegistrationToServer(token);
    //     }

    //     private void scheduleJob() {
    //         OneTimeWorkRequest work = new OneTimeWorkRequest.Builder(MyWorker.class).build();
    //         WorkManager.getInstance(this).enqueue(work);
    //     }

    //     private void handleNow() {
    //         Log.d(TAG, "Short-lived task completed.");
    //     }

    //     private void sendRegistrationToServer(String token) {
    //         // TODO: Send the token to your backend server if needed
    //     }

    //     private void sendNotification(String title, String messageBody) {
    //         Intent intent = new Intent(this, MainActivity.class);
    //         intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

    //         PendingIntent pendingIntent = PendingIntent.getActivity(
    //                 this, 0, intent, PendingIntent.FLAG_IMMUTABLE
    //         );

    //         String channelId = "fcm_default_channel";
    //         Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

    //         NotificationCompat.Builder notificationBuilder =
    //                 new NotificationCompat.Builder(this, channelId)
    //                         .setSmallIcon(R.mipmap.ic_launcher)
    //                         .setContentTitle(title != null ? title : "New Message")
    //                         .setContentText(messageBody)
    //                         .setAutoCancel(true)
    //                         .setSound(defaultSoundUri)
    //                         .setContentIntent(pendingIntent);

    //         NotificationManager notificationManager =
    //                 (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

    //         // Create notification channel on Android O and above
    //         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    //             NotificationChannel channel = new NotificationChannel(
    //                     channelId,
    //                     "FCM Notifications",
    //                     NotificationManager.IMPORTANCE_DEFAULT
    //             );
    //             notificationManager.createNotificationChannel(channel);
    //         }

    //         notificationManager.notify(0, notificationBuilder.build());
    //     }

    //     // WorkManager task (used for long-running background work)
    //     public static class MyWorker extends Worker {
    //         public MyWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
    //             super(context, workerParams);
    //         }

    //         @NonNull
    //         @Override
    //         public Result doWork() {
    //             Log.d(TAG, "Doing background work in MyWorker");
    //             return Result.success();
    //         }
    //     }
    // }
