package live.hms.rn

import androidx.multidex.MultiDexApplication
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.reactnativehmssdk.HmssdkPackage
import com.facebook.react.shell.MainReactPackage
// Manually linked package imports (RN 0.77.3 autolinking broken in monorepo)
import com.hms.reactnativevideoplugin.ReactNativeVideoPluginPackage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage
import com.reactnativecommunity.blurview.BlurViewPackage
import org.reactnative.maskedview.RNCMaskedViewPackage
import com.shopify.reactnative.flash_list.ReactNativeFlashListPackage
import com.airbnb.android.react.lottie.LottiePackage
import com.learnium.RNDeviceInfo.RNDeviceInfo
import com.swmansion.gesturehandler.RNGestureHandlerPackage
import com.imagepicker.ImagePickerPackage
import com.BV.LinearGradient.LinearGradientPackage
import org.devio.rn.splashscreen.SplashScreenReactPackage
import com.zoontek.rnpermissions.RNPermissionsPackage
import com.swmansion.reanimated.ReanimatedPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage
import com.swmansion.rnscreens.RNScreensPackage
import com.mrousavy.camera.react.CameraPackage
import com.reactnativecommunity.webview.RNCWebViewPackage

class MainApplication :
  MultiDexApplication(),
  ReactApplication {
  override val reactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getPackages(): List<ReactPackage> {
        // Manual package list since autolinking is disabled for monorepo compatibility
        return listOf(
          MainReactPackage(), // Core React Native package (provides AppState, ImageLoader, WebSocketModule, etc.)
          HmssdkPackage(),
          ReactNativeVideoPluginPackage(),
          AsyncStoragePackage(),
          BlurViewPackage(),
          RNCMaskedViewPackage(),
          ReactNativeFlashListPackage(),
          LottiePackage(),
          RNDeviceInfo(),
          RNGestureHandlerPackage(),
          ImagePickerPackage(),
          LinearGradientPackage(),
          SplashScreenReactPackage(),
          RNPermissionsPackage(),
          ReanimatedPackage(),
          SafeAreaContextPackage(),
          RNScreensPackage(),
          CameraPackage(),
          RNCWebViewPackage(),
        )
      }

      override fun getJSMainModuleName(): String = "index"

      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

      override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
    }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
