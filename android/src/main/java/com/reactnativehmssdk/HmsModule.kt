package com.reactnativehmssdk

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reactnativehmssdk.HmsModule.Companion.REACT_CLASS
import java.util.UUID

@ReactModule(name = REACT_CLASS)
class HmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val REACT_CLASS = "HmsManager"
  }
  private var hmsCollection = mutableMapOf<String, HmsSDK>()
  override fun getName(): String {
    return "HmsManager"
  }

  fun getHmsInstance(): MutableMap<String, HmsSDK> {
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
      val sdkInstance = HmsSDK(data, this, randomUUIDString, reactApplicationContext)

      hmsCollection[randomUUIDString] = sdkInstance

      callback?.resolve(randomUUIDString)
    } else {
      val randomUUIDString = "12345"
      val sdkInstance = HmsSDK(data, this, randomUUIDString, reactApplicationContext)

      hmsCollection[randomUUIDString] = sdkInstance

      callback?.resolve(randomUUIDString)
    }
  }

  @ReactMethod
  fun preview(credentials: ReadableMap) {
    val hms = HmsHelper.getHms(credentials, hmsCollection)

    hms?.preview(credentials)
  }

  @ReactMethod
  fun join(credentials: ReadableMap) {
    val hms = HmsHelper.getHms(credentials, hmsCollection)

    hms?.join(credentials)
  }

  @ReactMethod
  fun setLocalMute(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.setLocalMute(data)
  }

  @ReactMethod
  fun setLocalVideoMute(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.setLocalVideoMute(data)
  }

  @ReactMethod
  fun switchCamera(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.switchCamera()
  }

  @ReactMethod
  fun leave(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.leave(callback)
  }

  @ReactMethod
  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.sendBroadcastMessage(data, callback)
  }

  @ReactMethod
  fun sendGroupMessage(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.sendGroupMessage(data, callback)
  }

  @ReactMethod
  fun sendDirectMessage(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.sendDirectMessage(data, callback)
  }

  @ReactMethod
  fun changeRole(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.changeRole(data, callback)
  }

  @ReactMethod
  fun changeTrackState(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.changeTrackState(data, callback)
  }

  @ReactMethod
  fun changeTrackStateRoles(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.changeTrackStateRoles(data, callback)
  }

  @ReactMethod
  fun isMute(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.isMute(data, callback)
  }

  @ReactMethod
  fun removePeer(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.removePeer(data, callback)
  }

  @ReactMethod
  fun isPlaybackAllowed(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.isPlaybackAllowed(data, callback)
  }

  @ReactMethod
  fun getRoom(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.getRoom(callback)
  }

  @ReactMethod
  fun setPlaybackAllowed(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.setPlaybackAllowed(data)
  }

  @ReactMethod
  fun endRoom(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.endRoom(data, callback)
  }

  @ReactMethod
  fun acceptRoleChange(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.acceptRoleChange(callback)
  }

  @ReactMethod
  fun setVolume(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.setVolume(data)
  }

  @ReactMethod
  fun getVolume(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.getVolume(data, callback)
  }

  @ReactMethod
  fun muteAllPeersAudio(data: ReadableMap) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.muteAllPeersAudio(data)
  }

  @ReactMethod
  fun changeMetadata(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.changeMetadata(data, callback)
  }

  @ReactMethod
  fun startRTMPOrRecording(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.startRTMPOrRecording(data, callback)
  }

  @ReactMethod
  fun stopRtmpAndRecording(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.stopRtmpAndRecording(callback)
  }

  @ReactMethod
  fun startHLSStreaming(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.startHLSStreaming(data, callback)
  }

  @ReactMethod
  fun stopHLSStreaming(data: ReadableMap, callback: Promise?) {
    val hms = HmsHelper.getHms(data, hmsCollection)

    hms?.stopHLSStreaming(callback)
  }

  fun emitEvent(event: String, data: WritableMap) {
    reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(event, data)
  }
}
