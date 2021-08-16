package com.reactnativehmssdk

import com.facebook.react.bridge.*
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
import com.facebook.react.modules.core.DeviceEventManagerModule
import live.hms.video.sdk.HMSPreviewListener

class HmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var hmsSDK: HMSSDK? = null;

  override fun getName(): String {
    return "HmsManager"
  }

  fun getHmsInstance(): HMSSDK? {
    return hmsSDK
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
  fun preview(credentials: ReadableMap) {
    print("inside preview")
    val config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    hmsSDK?.preview(config, object: HMSPreviewListener {
      override fun onError(error: HMSException) {
        println("error")
        println(error)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ERROR", "ERROR")
      }

      override fun onPreview(room: HMSRoom, localTracks: Array<HMSTrack>) {
        val previewTracks = HmsDecoder.getPreviewTracks(localTracks)
        val hmsRoom = HmsDecoder.getHmsRoom(room)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val data: WritableMap = Arguments.createMap();
        data.putMap("previewTracks", previewTracks)
        data.putMap("room", hmsRoom)
        data.putMap("localPeer", localPeerData)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_PREVIEW", data)
      }

    })
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
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ERROR", "ERROR")
      }

      override fun onJoin(room: HMSRoom) {
        println("room")
        println(room)

        val roomData = HmsDecoder.getHmsRoom(room)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val data: WritableMap = Arguments.createMap();

        data.putMap("room", roomData)
        data.putMap("localPeer", localPeerData)
        data.putArray("remotePeers", remotePeerData)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_JOIN", data)
      }

      override fun onPeerUpdate(type: HMSPeerUpdate, hmsPeer: HMSPeer) {

//        val roomData = HmsDecoder.getHmsRoom(hmsSDK.room)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val data: WritableMap = Arguments.createMap();

//        data.putMap("room", roomData)
        data.putMap("localPeer", localPeerData)
        data.putArray("remotePeers", remotePeerData)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_PEER_UPDATE", data)
      }

      override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
        println("HMSRoom")
        println(hmsRoom)
        val roomData = HmsDecoder.getHmsRoom(hmsRoom)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val data: WritableMap = Arguments.createMap();

        data.putMap("room", roomData)
        data.putMap("localPeer", localPeerData)
        data.putArray("remotePeers", remotePeerData)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ROOM_UPDATE", data)
      }

      override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
        println("HMSTrack")
        println(peer)
        println(track)

//        val roomData = HmsDecoder.getHmsRoom(hmsSDK.room)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val data: WritableMap = Arguments.createMap();

//        data.putMap("room", roomData)
        data.putMap("localPeer", localPeerData)
        data.putArray("remotePeers", remotePeerData)
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_TRACK_UPDATE", data)
      }

      override fun onMessageReceived(message: HMSMessage) {
        println("message")
        println(message)

        val data: WritableMap = Arguments.createMap()

        data.putString("sender", message.sender.name)
        data.putString("messsage", message.message)
        data.putString("type", message.type)
        data.putString("time", message.time.toString())
        data.putString("event", "ON_MESSAGE")

        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_MESSAGE", data)
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
  
  @ReactMethod
  fun setLocalMute(isMute:Boolean) {
    hmsSDK?.getLocalPeer()?.audioTrack?.setMute(isMute)
  }

  @ReactMethod
  fun setLocalVideoMute(isMute:Boolean) {
    hmsSDK?.getLocalPeer()?.videoTrack?.setMute(isMute)
  }

  @ReactMethod
  fun switchCamera() {
//    hmsSDK?.getLocalPeer()?.videoTrack?.switchCamera()
    print("inside switchCamera")
  }

  @ReactMethod
  fun leave() {
    hmsSDK?.leave()
  }

}
