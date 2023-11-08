package live.hms.rn;

import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.react.ReactActivity;

import org.devio.rn.splashscreen.SplashScreen;
import com.reactnativehmssdk.HMSManager;

// import live.hms.rn.R;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "RNExample";
  }
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this, R.id.lottie); // here
    SplashScreen.setAnimationFinished(true);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    super.onCreate(savedInstanceState);
  }


  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Log.e("PIP", "onConfigurationChanged: " + newConfig.orientation);
//    adjustFullScreen(newConfig);
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    Log.e("PIP", "onWindowFocusChanged: " + hasFocus);
//    if (hasFocus) {
//      HMSManager.Companion.onWindowFocusChanged(true);
//    }
  }

  private void adjustFullScreen(Configuration config) {
    Log.e("PIP", "adjustFullScreen: " + config.orientation);
//    View view = findViewById(android.R.id.content).getRootView();
//    final WindowInsetsControllerCompat insetsController =
//      ViewCompat.getWindowInsetsController(getWindow().getDecorView());
//      view.setAdjustViewBounds(true);
  }
  @Override
  public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
    Log.e("PIP", "onPictureInPictureModeChanged: " + isInPictureInPictureMode);
//    HMSManager.Companion.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
  }

  @Override
  protected void onResume() {
    super.onResume();
    Log.e("PIP", "onResume:");
    HMSManager.Companion.onResume();
  }

  @Override
  protected void onUserLeaveHint() {
    super.onUserLeaveHint();
    Log.e("PIP", "onUserLeaveHint:");
    HMSManager.Companion.onUserLeaveHint();
  }
}
