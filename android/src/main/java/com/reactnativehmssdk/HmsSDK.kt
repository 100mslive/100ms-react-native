package com.reactnativehmssdk
import com.facebook.react.bridge.*
import java.util.*
import live.hms.video.sdk.models.HMSConfig
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.enums.HMSTrackUpdate
import live.hms.video.sdk.models.*
import live.hms.video.media.tracks.*
import live.hms.video.utils.HMSCoroutineScope
import live.hms.video.error.HMSException
import kotlinx.coroutines.launch
import live.hms.video.sdk.*
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest

class HmsSDK(HmsDelegate: HmsModule, sdkId: String, reactApplicationContext: ReactApplicationContext) {
  var hmsSDK: HMSSDK? = null
  private var recentRoleChangeRequest: HMSRoleChangeRequest? = null
  val delegate: HmsModule = HmsDelegate
  val id: String = sdkId

  init {
    this.hmsSDK = HMSSDK
      .Builder(reactApplicationContext)
      .build()
  }

  fun preview(credentials: ReadableMap) {
    var config =
      HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String)

    if (credentials.getString("endpoint") != null) {
      config = HMSConfig(credentials.getString("username") as String, credentials.getString("authToken") as String, initEndpoint = credentials.getString("endpoint") as String)
    }

    hmsSDK?.preview(config, object: HMSPreviewListener {
      override fun onError(error: HMSException) {
        val data: WritableMap = Arguments.createMap();
        data.putString("ERROR", "ERROR")
        data.putString("id", id)
        delegate.emitEvent("ON_ERROR", data)
      }

      override fun onPreview(room: HMSRoom, localTracks: Array<HMSTrack>) {
        val previewTracks = HmsDecoder.getPreviewTracks(localTracks)
        val hmsRoom = HmsDecoder.getHmsRoom(room)
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val data: WritableMap = Arguments.createMap()

        data.putMap("previewTracks", previewTracks)
        data.putMap("room", hmsRoom)
        data.putMap("localPeer", localPeerData)
        data.putString("id", id)
        delegate.emitEvent("ON_PREVIEW", data)
      }
    })
  }

  fun join(credentials: ReadableMap) {
    var config =
      HMSConfig(credentials.getString("username") as String,  credentials.getString("authToken") as String)

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
          data.putString("id", id)
          delegate.emitEvent("ON_REMOVED_FROM_ROOM", data)
        }

        override fun onError(error: HMSException) {
          val data: WritableMap = Arguments.createMap();
          data.putString("ERROR", error.description)
          delegate.emitEvent("ON_ERROR", data)
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
          data.putString("id", id)
          delegate.emitEvent("ON_JOIN", data)
        }

        override fun onPeerUpdate(type: HMSPeerUpdate, hmsPeer: HMSPeer) {

          val typeString = type.name
          val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
          val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

          val data: WritableMap = Arguments.createMap();

          data.putString("type", typeString)
          data.putMap("localPeer", localPeerData)
          data.putArray("remotePeers", remotePeerData)
          data.putString("id", id)
          delegate.emitEvent("ON_PEER_UPDATE", data)
        }

        override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
          val typeString = type.name
          val roomData = HmsDecoder.getHmsRoom(hmsRoom)
          val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
          val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

          val data: WritableMap = Arguments.createMap();

          data.putString("type", typeString)
          data.putMap("room", roomData)
          data.putMap("localPeer", localPeerData)
          data.putArray("remotePeers", remotePeerData)
          data.putString("id", id)
          delegate.emitEvent("ON_ROOM_UPDATE", data)
        }

        override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
          val typeString = type.name
//        val roomData = HmsDecoder.getHmsRoom(hmsSDK.room)
          val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
          val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

          val data: WritableMap = Arguments.createMap();

          data.putString("type", typeString)
//        data.putMap("room", roomData)
          data.putMap("localPeer", localPeerData)
          data.putArray("remotePeers", remotePeerData)
          data.putString("id", id)
          delegate.emitEvent("ON_TRACK_UPDATE", data)
        }

        override fun onMessageReceived(message: HMSMessage) {
          val data: WritableMap = Arguments.createMap()

          data.putString("sender", message.sender.name)
          data.putString("message", message.message)
          data.putString("type", message.type)
          data.putString("time", message.serverReceiveTime.toString())
          data.putString("id", id)
          data.putString("event", "ON_MESSAGE")

          delegate.emitEvent("ON_MESSAGE", data)
        }

        override fun onReconnected() {
          val data: WritableMap = Arguments.createMap()
          data.putString("event", "RECONNECTED")
          data.putString("id", id)
          delegate.emitEvent("RECONNECTED", data)
        }

        override fun onReconnecting(error: HMSException) {
          val data: WritableMap = Arguments.createMap()
          data.putString("event", "RECONNECTED")
          data.putString("id", id)
          delegate.emitEvent("RECONNECTING", data)
        }

        override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
          val decodedChangeRoleRequest = HmsDecoder.getHmsRoleChangeRequest(request, id)
          delegate.emitEvent("ON_ROLE_CHANGE_REQUEST", decodedChangeRoleRequest)
          recentRoleChangeRequest = request
        }
      })

      hmsSDK?.addAudioObserver(object: HMSAudioListener {
        override fun onAudioLevelUpdate(speakers: Array<HMSSpeaker>) {
          val data: WritableMap = Arguments.createMap()
          val count = speakers.size

          data.putInt("count", count)
          data.putString("event", "ON_SPEAKER")
          data.putString("id", id)

          val peers: WritableArray = Arguments.createArray()
          for (speaker in speakers) {
            val peerId = speaker.peer?.peerID
            peers.pushString(peerId)
          }
          data.putArray("peers", peers)
          delegate.emitEvent("ON_SPEAKER", data)
        }
      })
    }
  }

  fun setLocalMute(data:ReadableMap) {
    val isMute = data.getBoolean("isMute")
    hmsSDK?.getLocalPeer()?.audioTrack?.setMute(isMute)
  }

  fun setLocalVideoMute(data:ReadableMap) {
    val isMute = data.getBoolean("isMute")
    hmsSDK?.getLocalPeer()?.videoTrack?.setMute(isMute)
  }

  fun switchCamera() {
    if(hmsSDK?.getLocalPeer()?.videoTrack?.isMute?:true){
    }else{
      HMSCoroutineScope.launch {
        hmsSDK?.getLocalPeer()?.videoTrack?.switchCamera()
      }
    }
  }

  fun leave() {
    hmsSDK?.leave()
  }

  fun sendBroadcastMessage(data:ReadableMap) {
    val type = if(data.getString("type") !== null) data.getString("type") else "chat"
    hmsSDK?.sendBroadcastMessage(data.getString("message") as String,type as String,object : HMSMessageResultListener {
      override fun onError(error: HMSException) {
      }
      override fun onSuccess(hmsMessage: HMSMessage) {
      }
    })
  }

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

  fun isMute(data: ReadableMap, callback: Promise?) {
    val trackId = data.getString("trackId")

    val remotePeers = hmsSDK?.getRemotePeers()
    val localPeer = hmsSDK?.getLocalPeer()

    val localTrack = HmsHelper.getLocalTrackFromTrackId(trackId, localPeer)

    if (localTrack == null) {
      val track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)

      if (track != null) {
        val mute = track.isMute
        callback?.resolve(mute)
      } else {
        callback?.reject("101", "NOT_FOUND")
      }
    } else {
      val mute = localTrack.isMute
      callback?.resolve(mute)
    }
  }

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

  fun muteAllPeersAudio(data: ReadableMap) {
    val mute = data.getBoolean("mute")
    val peers = hmsSDK?.getRemotePeers()
    if (peers != null) {
      for (remotePeer in peers) {
        val peerId = remotePeer.peerID
        val peer = HmsHelper.getRemotePeerFromPeerId(peerId, peers)
        if (peerId != null) {
          if(mute){
            peer?.audioTrack?.setVolume(0.0)
          }else{
            peer?.audioTrack?.setVolume(1.0)
          }
        }
      }
      val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
      val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

      val data: WritableMap = Arguments.createMap();

      data.putMap("localPeer", localPeerData)
      data.putArray("remotePeers", remotePeerData)
      data.putString("id", id)
      delegate.emitEvent("ON_PEER_UPDATE", data)
    }
  }
}
