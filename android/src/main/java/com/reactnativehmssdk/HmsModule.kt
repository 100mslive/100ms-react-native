package com.reactnativehmssdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.*
import live.hms.video.sdk.HMSSDK
import live.hms.video.sdk.models.HMSConfig
import live.hms.video.sdk.HMSUpdateListener
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.enums.HMSTrackUpdate
import live.hms.video.sdk.models.*
import live.hms.video.media.tracks.*
import live.hms.video.utils.HMSCoroutineScope
import live.hms.video.error.HMSException
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class HmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var hmsSDK: HMSSDK? = null;

  override fun getName(): String {
    return "HmsManager"
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun build() {
    hmsSDK = HMSSDK
      .Builder(reactApplicationContext)
      .build()
  }

  @ReactMethod
  fun join(credentials: ReadableMap) {
    println("Credentials")
    println(credentials)
    val config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    hmsSDK?.join(config, object : HMSUpdateListener {
      override fun onError(error: HMSException) {
        println("error")
        println(error)
      }

      override fun onJoin(room: HMSRoom) {
        println("room")
        println(room)
      }

      override fun onPeerUpdate(type: HMSPeerUpdate, hmsPeer: HMSPeer) {
        println("Peer")
        println(hmsPeer)
      }

      override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
        println("HMSRoom")
        println(hmsRoom)
      }

      override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
        println("HMSTrack")
        println(peer)
        println(track)
      }

      override fun onMessageReceived(message: HMSMessage) {
        println("message")
        println(message)
      }

      override fun onReconnected() {
        println("Reconnected")
      }

      override fun onReconnecting(error: HMSException) {
        println("Reconnecting")
      }

      override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
        println("Role Change")
        print(request)
      }
    })
  }
}
