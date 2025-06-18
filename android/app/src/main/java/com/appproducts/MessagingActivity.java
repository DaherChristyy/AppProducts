// package com.appproducts; 

// import android.Manifest;
// import android.content.pm.PackageManager;
// import android.os.Build;
// import android.os.Bundle;
// import android.util.Log;
// import android.widget.Toast;
// import com.google.firebase.messaging.RemoteMessage;

// import androidx.activity.result.ActivityResultLauncher;
// import androidx.activity.result.contract.ActivityResultContracts;
// import androidx.annotation.NonNull;
// import androidx.annotation.RequiresApi;
// import androidx.appcompat.app.AppCompatActivity;
// import androidx.core.content.ContextCompat;

// import com.google.android.gms.tasks.OnCompleteListener;
// import com.google.android.gms.tasks.Task;
// import com.google.firebase.messaging.FirebaseMessaging;


// import java.util.concurrent.atomic.AtomicInteger;

// public class MessagingActivity extends AppCompatActivity {

//     private static final String TAG = "MessagingActivity";
//     private static final int NOTIFICATION_REQUEST_CODE = 1234;

//     private final ActivityResultLauncher<String> requestPermissionLauncher =
//             registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
//                 if (isGranted) {
//                     // FCM SDK (and your app) can post notifications.
//                 } else {
//                     // Inform user that the app will not show notifications.
//                 }
//             });

//     @Override
//     protected void onCreate(Bundle savedInstanceState) {
//         super.onCreate(savedInstanceState);
//         if (getIntent().getExtras() != null) {
//             for (String key : getIntent().getExtras().keySet()) {
//                 Object value = getIntent().getExtras().get(key);
//                 Log.d(TAG, "Key: " + key + " Value: " + value);
//             }
//         }
//     }

//     public void runtimeEnableAutoInit() {
//         FirebaseMessaging.getInstance().setAutoInitEnabled(true);
//     }

//     public void deviceGroupUpstream() {
//         String to = "a_unique_key"; // Notification key
//         AtomicInteger msgId = new AtomicInteger();
//         FirebaseMessaging.getInstance().send(new RemoteMessage.Builder(to)
//                 .setMessageId(String.valueOf(msgId.get()))
//                 .addData("hello", "world")
//                 .build());
//     }

//     public void sendUpstream() {
//         final String SENDER_ID = "657873396328";
//         final int messageId = 0;
//         FirebaseMessaging fm = FirebaseMessaging.getInstance();
//         fm.send(new RemoteMessage.Builder(SENDER_ID + "@fcm.googleapis.com")
//                 .setMessageId(Integer.toString(messageId))
//                 .addData("my_message", "Hello World")
//                 .addData("my_action", "SAY_HELLO")
//                 .build());
//     }

//     private void subscribeTopics() {
//         FirebaseMessaging.getInstance().subscribeToTopic("weather")
//                 .addOnCompleteListener(task -> {
//                     String msg = "Subscribed";
//                     if (!task.isSuccessful()) {
//                         msg = "Subscribe failed";
//                     }
//                     Log.d(TAG, msg);
//                     Toast.makeText(MessagingActivity.this, msg, Toast.LENGTH_SHORT).show();
//                 });
//     }

//     private void logRegToken() {
//         FirebaseMessaging.getInstance().getToken()
//                 .addOnCompleteListener(task -> {
//                     if (!task.isSuccessful()) {
//                         Log.w(TAG, "Fetching FCM registration token failed", task.getException());
//                         return;
//                     }
//                     String token = task.getResult();
//                     Log.d(TAG, "FCM Registration token: " + token);
//                     Toast.makeText(MessagingActivity.this, "FCM Registration token: " + token, Toast.LENGTH_SHORT).show();
//                 });
//     }

//     private void askNotificationPermission() {
//         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
//             if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
//                     == PackageManager.PERMISSION_GRANTED) {
//                 // Permission granted
//             } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
//                 // Show rationale UI
//             } else {
//                 requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
//             }
//         }
//     }
// }
