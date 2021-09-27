package com.reactnativehmssdk

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.util.*
import live.hms.video.sdk.models.HMSConfig
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.enums.HMSTrackUpdate
import live.hms.video.sdk.models.*
import live.hms.video.media.tracks.*
import live.hms.video.utils.HMSCoroutineScope
import live.hms.video.error.HMSException
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reactnativehmssdk.HmsModule.Companion.REACT_CLASS
import kotlinx.coroutines.launch
import live.hms.video.sdk.*
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest

@ReactModule(name = REACT_CLASS)
class HmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val REACT_CLASS = "HmsManager"
  }
  private var hmsSDK: HMSSDK? = null
  private var recentRoleChangeRequest: HMSRoleChangeRequest? = null
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
    var config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    if (credentials.getString("endpoint") != null) {
      config = HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String, initEndpoint = credentials.getString("endpoint") as String)
    }

    hmsSDK?.preview(config, object: HMSPreviewListener {
      override fun onError(error: HMSException) {
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
    var config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    if (credentials.getString("endpoint") != null) {
      config = HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String, initEndpoint = credentials.getString("endpoint") as String)
    }

    HMSCoroutineScope.launch {
      hmsSDK?.join(config, object : HMSUpdateListener {
        override fun onChangeTrackStateRequest(details: HMSChangeTrackStateRequest) {
//          Not yet implemented
        }

        override fun onRemovedFromRoom(notification: HMSRemovedFromRoom) {
          super.onRemovedFromRoom(notification)

          val data: WritableMap = Arguments.createMap();

          val requestedBy = HmsDecoder.getHmsRemotePeer(notification.peerWhoRemoved)
          val roomEnded = notification.roomWasEnded
          val reason = notification.reason

          data.putMap("requestedBy", requestedBy)
          data.putBoolean("roomEnded", roomEnded)
          data.putString("reason", reason)

          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_REMOVED_FROM_ROOM", data)
        }

        override fun onError(error: HMSException) {
          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ERROR", "ERROR")
        }

        override fun onJoin(room: HMSRoom) {
          val roomData = HmsDecoder.getHmsRoom(room)
          val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
          val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
          val roles = HmsDecoder.getAllRoles(hmsSDK?.getRoles())

          val data: WritableMap = Arguments.createMap();

          data.putMap("room", roomData)
          data.putMap("localPeer", localPeerData)
          data.putArray("remotePeers", remotePeerData)
          data.putArray("roles", roles)
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
          val data: WritableMap = Arguments.createMap()

          data.putString("sender", message.sender.name)
          data.putString("message", message.message)
          data.putString("type", message.type)
          data.putString("time", message.serverReceiveTime.toString())
          data.putString("event", "ON_MESSAGE")

          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_MESSAGE", data)
        }

        override fun onReconnected() {
          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("RECONNECTED", "RECONNECTED")
        }

        override fun onReconnecting(error: HMSException) {
          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("RECONNECTING", "RECONNECTING")
        }

        override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
          val decodedChangeRoleRequest = HmsDecoder.getHmsRoleChangeRequest(request)
          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_ROLE_CHANGE_REQUEST", decodedChangeRoleRequest)
          recentRoleChangeRequest = request
        }
      })

      hmsSDK?.addAudioObserver(object: HMSAudioListener {
        override fun onAudioLevelUpdate(speakers: Array<HMSSpeaker>) {
          val data: WritableMap = Arguments.createMap()
          val count = speakers.size

          data.putInt("count", count)
          data.putString("event", "ON_SPEAKER")

          var peers: WritableArray = Arguments.createArray()
          for (speaker in speakers) {
            val peerId = speaker.peer?.peerID
            peers.pushString(peerId)
          }
          data.putArray("peers", peers)
          reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ON_SPEAKER", data)
        }
      })
    }
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
    if(hmsSDK?.getLocalPeer()?.videoTrack?.isMute?:true){
    }else{
      HMSCoroutineScope.launch {
        hmsSDK?.getLocalPeer()?.videoTrack?.switchCamera()
      }
    }
  }

  @ReactMethod
  fun leave() {
    hmsSDK?.leave()
  }

  @ReactMethod
  fun sendBroadcastMessage(data:ReadableMap) {
    val type = if(data.getString("type") !== null) data.getString("type") else "chat"
    hmsSDK?.sendBroadcastMessage(data.getString("message") as String,type as String,object : HMSMessageResultListener {
      override fun onError(error: HMSException) {
      }
      override fun onSuccess(hmsMessage: HMSMessage) {
      }
    })
  }

  @ReactMethod
  fun sendGroupMessage(data:ReadableMap) {
    val message = data.getString("message")
    val targetedRoles = data.getArray("roles")?.toArrayList() as? ArrayList<String>
    val roles = hmsSDK?.getRoles()
    val encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles);

    if (message != null) {
      hmsSDK?.sendGroupMessage(message, "chat", encodedTargetedRoles, object : HMSMessageResultListener {
        override fun onError(error: HMSException) {
        }
        override fun onSuccess(hmsMessage: HMSMessage) {
        }
      })
    }
  }

  @ReactMethod
  fun sendDirectMessage(data:ReadableMap) {
    val message = data.getString("message")
    val peerId = data.getString("peerId")

    val peers = hmsSDK?.getPeers()

    val peer = HmsHelper.getPeerFromPeerId(peerId, peers)


    if (message != null && peer != null) {
      hmsSDK?.sendDirectMessage(message, "chat", peer,
        object : HMSMessageResultListener {
          override fun onError(error: HMSException) {
          }

          override fun onSuccess(hmsMessage: HMSMessage) {
          }
        })
    }
  }

  @ReactMethod
  fun changeRole(data: ReadableMap) {
    val peerId = data.getString("peerId")
    val role = data.getString("role")
    val force = data.getBoolean("force")

    if (peerId !== null &&  role !== null) {
      val hmsPeer = HmsHelper.getPeerFromPeerId(peerId, hmsSDK?.getPeers())
      val hmsRole = HmsHelper.getRoleFromRoleName(role, hmsSDK?.getRoles())

      if (hmsRole != null && hmsPeer != null) {
        hmsSDK?.changeRole(hmsPeer as HMSRemotePeer, hmsRole, force, object : HMSActionResultListener {
          override fun onSuccess() {
          }

          override fun onError(error: HMSException) {
          }
        })
      }
    }
  }

  @ReactMethod
  fun changeTrackState(data: ReadableMap) {
    val trackId = data.getString("trackId")
    val mute = data.getBoolean("mute")

    val remotePeers = hmsSDK?.getRemotePeers()

    val track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)

    if (track != null) {
      hmsSDK?.changeTrackState(track, mute, object: HMSActionResultListener {
        override fun onSuccess() {
        }

        override fun onError(error: HMSException) {
        }
      })
    }
  }

  @ReactMethod
  fun removePeer(data: ReadableMap) {
    val peerId = data.getString("peerId")
    var reason = data.getString("reason")

    if (reason == null) {
      reason = ""
    }

    val peers = hmsSDK?.getRemotePeers()

    val peer = HmsHelper.getRemotePeerFromPeerId(peerId, peers)

    if (peer != null) {
      hmsSDK?.removePeerRequest(peer, reason, object: HMSActionResultListener {
        override fun onSuccess() {
        }

        override fun onError(error: HMSException) {
        }
      })
    }
  }

  @ReactMethod
  fun endRoom(data: ReadableMap) {
    val lock = data.getBoolean("lock")
    var reason =  data.getString("reason")
    if (reason == null) {
      reason = ""
    }

    hmsSDK?.endRoom(reason, lock, object: HMSActionResultListener {
      override fun onSuccess() {
      }

      override fun onError(error: HMSException) {
      }
    })
  }

  @ReactMethod
  fun acceptRoleChange() {
    if (recentRoleChangeRequest !== null) {
      hmsSDK?.acceptChangeRole(recentRoleChangeRequest!!, object: HMSActionResultListener {
        override fun onSuccess() {
          recentRoleChangeRequest = null
        }

        override fun onError(error: HMSException) {
          recentRoleChangeRequest = null
        }
      })
    }
  }
}
