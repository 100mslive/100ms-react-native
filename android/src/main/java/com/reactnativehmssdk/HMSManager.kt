package com.reactnativehmssdk

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reactnativehmssdk.HMSManager.Companion.REACT_CLASS
import java.util.UUID

@ReactModule(name = REACT_CLASS)
class HMSManager(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), Application.ActivityLifecycleCallbacks {
  companion object {
    const val REACT_CLASS = "HMSManager"
    var hmsCollection = mutableMapOf<String, HMSRNSDK>()
  }
  override fun getName(): String {
    return "HMSManager"
  }

  fun getHmsInstance(): MutableMap<String, HMSRNSDK> {
    return hmsCollection
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun build(data: ReadableMap?, callback: Promise?) {
    val hasItem = hmsCollection.containsKey("12345")
    if (hasItem) {
      val uuid = UUID.randomUUID()
      val randomUUIDString = uuid.toString()
      val sdkInstance = HMSRNSDK(data, this, randomUUIDString, reactApplicationContext)

      hmsCollection[randomUUIDString] = sdkInstance

      callback?.resolve(randomUUIDString)
    } else {
      val randomUUIDString = "12345"
      val sdkInstance = HMSRNSDK(data, this, randomUUIDString, reactApplicationContext)

      hmsCollection[randomUUIDString] = sdkInstance

      callback?.resolve(randomUUIDString)
    }
  }

  @ReactMethod
  fun preview(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.preview(credentials)
  }

  @ReactMethod
  fun join(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.join(credentials)
  }

  @ReactMethod
  fun setLocalMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalMute(data)
  }

  @ReactMethod
  fun setLocalVideoMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalVideoMute(data)
  }

  @ReactMethod
  fun switchCamera(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchCamera()
  }

  @ReactMethod
  fun leave(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.leave(callback)
  }

  @ReactMethod
  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendBroadcastMessage(data, callback)
  }

  @ReactMethod
  fun sendGroupMessage(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendGroupMessage(data, callback)
  }

  @ReactMethod
  fun sendDirectMessage(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendDirectMessage(data, callback)
  }

  @ReactMethod
  fun changeRole(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRole(data, callback)
  }

  @ReactMethod
  fun changeTrackState(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackState(data, callback)
  }

  @ReactMethod
  fun changeTrackStateForRoles(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackStateForRoles(data, callback)
  }

  @ReactMethod
  fun isMute(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isMute(data, callback)
  }

  @ReactMethod
  fun removePeer(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.removePeer(data, callback)
  }

  @ReactMethod
  fun isPlaybackAllowed(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isPlaybackAllowed(data, callback)
  }

  @ReactMethod
  fun getRoom(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoom(callback)
  }

  @ReactMethod
  fun setPlaybackAllowed(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackAllowed(data)
  }

  @ReactMethod
  fun endRoom(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.endRoom(data, callback)
  }

  @ReactMethod
  fun acceptRoleChange(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.acceptRoleChange(callback)
  }

  @ReactMethod
  fun setVolume(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setVolume(data)
  }

  @ReactMethod
  fun getVolume(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVolume(data, callback)
  }

  @ReactMethod
  fun setPlaybackForAllAudio(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackForAllAudio(data)
  }

  @ReactMethod
  fun remoteMuteAllAudio(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.remoteMuteAllAudio(callback)
  }

  @ReactMethod
  fun changeMetadata(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeMetadata(data, callback)
  }

  @ReactMethod
  fun startScreenshare(data: ReadableMap, callback: Promise?) {
    currentActivity?.application?.registerActivityLifecycleCallbacks(this)
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startScreenshare(callback)
  }

  @ReactMethod
  fun isScreenShared(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isScreenShared(callback)
  }

  @ReactMethod
  fun stopScreenshare(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
    hms?.stopScreenshare(callback)
  }

  @ReactMethod
  fun startRTMPOrRecording(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startRTMPOrRecording(data, callback)
  }

  @ReactMethod
  fun stopRtmpAndRecording(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopRtmpAndRecording(callback)
  }

  @ReactMethod
  fun startHLSStreaming(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startHLSStreaming(data, callback)
  }

  @ReactMethod
  fun stopHLSStreaming(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopHLSStreaming(callback)
  }

  @ReactMethod
  fun resetVolume(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.resetVolume()
  }

  @ReactMethod
  fun changeName(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeName(data, callback)
  }

  @ReactMethod
  fun destroy(data: ReadableMap, callback: Promise?) {
    val id = data.getString("id")
    hmsCollection.remove(id)
    val result: WritableMap = Arguments.createMap()
    result.putBoolean("success", true)
    result.putString("message", "$id removed")
    callback?.resolve(result)
  }

  @ReactMethod
  fun enableRTCStats(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.enableRTCStats()
  }

  @ReactMethod
  fun disableRTCStats(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.disableRTCStats()
  }

  @ReactMethod
  fun getAudioDevicesList(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioDevicesList(callback)
  }

  @ReactMethod
  fun getAudioOutputRouteType(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioOutputRouteType(callback)
  }

  @ReactMethod
  fun switchAudioOutput(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchAudioOutput(data)
  }

  @ReactMethod
  fun setAudioMode(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioMode(data)
  }

  @ReactMethod
  fun setAudioDeviceChangeListener(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioDeviceChangeListener()
  }

  fun emitEvent(event: String, data: WritableMap) {
    reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(event, data)
  }

  override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}

  override fun onActivityStarted(activity: Activity) {}

  override fun onActivityResumed(activity: Activity) {}

  override fun onActivityPaused(activity: Activity) {}

  override fun onActivityStopped(activity: Activity) {}

  override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}

  override fun onActivityDestroyed(activity: Activity) {
    try {
      if (activity.componentName.shortClassName == ".MainActivity") {
        for (key in hmsCollection.keys) {
          val hmsLocalPeer = hmsCollection[key]?.hmsSDK?.getLocalPeer()
          if (hmsLocalPeer != null) {
            hmsCollection[key]?.leave(null)
          }
        }
        currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
        hmsCollection = mutableMapOf()
      }
    } catch (e: Exception) {
      //      Log.d("error", e.message)
    }
  }
}
