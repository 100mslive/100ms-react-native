package live.hms.rn;

import android.content.res.Configuration;
import android.os.Bundle;
import android.view.WindowManager;

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
  public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
    HMSManager.Companion.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
  }

  @Override
  protected void onResume() {
    super.onResume();
    HMSManager.Companion.onResume();
  }

  @Override
  protected void onUserLeaveHint() {
    super.onUserLeaveHint();
    HMSManager.Companion.onUserLeaveHint();
  }
}
