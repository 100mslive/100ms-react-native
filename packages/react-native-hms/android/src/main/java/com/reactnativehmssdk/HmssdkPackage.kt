package com.reactnativehmssdk

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HmssdkPackage : ReactPackage {
//  protected val rtcStatsDataSource: Flow<Int> = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9).asFlow()
//  protected val rtcStatUseCase = RTCStatUseCase(rtcStatsDataSource)
//  protected val rtcStatViewModel =  RTCStatViewModel(rtcStatUseCase)

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
//    return listOf(HMSManager(reactContext, rtcStatsDataSource))
    return listOf(HMSManager(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf<ViewManager<*, *>>(
//      HMSSDKViewManager(rtcStatViewModel),
      HMSSDKViewManager(),
      HMSHLSPlayerManager(),
      HMSTrackStatsViewManager(reactContext),
    )
  }
}
