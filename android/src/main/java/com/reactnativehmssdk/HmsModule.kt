package com.reactnativehmssdk

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat.requestPermissions
import androidx.core.content.ContextCompat
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
    if (ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.CAMERA)
      == PackageManager.PERMISSION_DENIED){
      println("request");
      requestPermissions(currentActivity as Activity,
        arrayOf(Manifest.permission.CAMERA),
        200)
    }
    else{
      println("granted")
    }

    println("Credentials")
    println(credentials)
    val config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    hmsSDK?.join(config, object : HMSUpdateListener {
      override fun onError(error: HMSException) {
        println("error")
        println(error)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ERROR", "ERROR")
      }

      override fun onJoin(room: HMSRoom) {
        println("room")
        println(room)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_JOIN", "ON_JOIN")
      }

      override fun onPeerUpdate(type: HMSPeerUpdate, hmsPeer: HMSPeer) {
        println("Peer")
        println(hmsPeer)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_PEER_UPDATE", "ON_PEER_UPDATE")
      }

      override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
        println("HMSRoom")
        println(hmsRoom)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ROOM_UPDATE", "ON_ROOM_UPDATE")
      }

      override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
        println("HMSTrack")
        println(peer)
        println(track)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_TRACK_UPDATE", "ON_TRACK_UPDATE")
      }

      override fun onMessageReceived(message: HMSMessage) {
        println("message")
        println(message)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_MESSAGE", "ON_MESSAGE")
      }

      override fun onReconnected() {
        println("Reconnected")
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("RECONNECTED", "RECONNECTED")
      }

      override fun onReconnecting(error: HMSException) {
        println("Reconnecting")
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("RECONNECTING", "RECONNECTING")
      }

      override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
        println("Role Change")
        print(request)
      }
    })
  }
}
