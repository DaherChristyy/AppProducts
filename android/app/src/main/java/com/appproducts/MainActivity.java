package com.appproducts;

import android.os.Bundle;
import android.content.Intent; 
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null); 
    }

    @Override
    protected String getMainComponentName() {
        return "AppProducts"; 
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    
    
}
