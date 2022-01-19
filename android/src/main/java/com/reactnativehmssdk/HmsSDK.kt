package com.reactnativehmssdk

import com.facebook.react.bridge.*
import kotlinx.coroutines.launch
import live.hms.video.error.HMSException
import live.hms.video.media.tracks.HMSRemoteAudioTrack
import live.hms.video.media.tracks.HMSTrack
import live.hms.video.media.tracks.HMSTrackType
import live.hms.video.sdk.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.enums.HMSTrackUpdate
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest
import live.hms.video.utils.HMSCoroutineScope

class HmsSDK(
    data: ReadableMap?,
    HmsDelegate: HmsModule,
    sdkId: String,
    reactApplicationContext: ReactApplicationContext
) {
  var hmsSDK: HMSSDK? = null
  private var recentRoleChangeRequest: HMSRoleChangeRequest? = null
  private var previewInProgress: Boolean = false
  private var delegate: HmsModule = HmsDelegate
  private var id: String = sdkId
  private var self = this

  init {
    val trackSettings = HmsHelper.getTrackSettings(data)
    if (trackSettings == null) {
      this.hmsSDK = HMSSDK.Builder(reactApplicationContext).build()
    } else {
      this.hmsSDK = HMSSDK.Builder(reactApplicationContext).setTrackSettings(trackSettings).build()
    }
  }

  private fun emitCustomError(message: String) {
    val data: WritableMap = Arguments.createMap()
    val hmsError = HMSException(102, message, message, message, message)
    data.putString("event", "ON_ERROR")
    data.putString("id", id)
    data.putMap("error", HmsDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  private fun emitRequiredKeysError() {
    val data: WritableMap = Arguments.createMap()
    val hmsError =
        HMSException(
            102,
            "NOT_FOUND",
            "SEND_ALL_REQUIRED_KEYS",
            "REQUIRED_KEYS_NOT_FOUND",
            "REQUIRED_KEYS_NOT_FOUND"
        )
    data.putString("event", "ON_ERROR")
    data.putString("id", id)
    data.putMap("error", HmsDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  fun emitHMSError(error: HMSException) {
    val data: WritableMap = Arguments.createMap()
    data.putString("event", "ON_ERROR")
    data.putString("id", id)
    data.putMap("error", HmsDecoder.getError(error))
    delegate.emitEvent("ON_ERROR", data)
  }

  fun emitHMSSuccess(message: HMSMessage? = null): ReadableMap {
    val hmsMessage =
        if (message !== null) message.message else "function call executed successfully"
    val data: WritableMap = Arguments.createMap()
    data.putBoolean("success", true)
    data.putString("message", hmsMessage)
    return data
  }

  fun preview(credentials: ReadableMap) {
    if (previewInProgress) {
      self.emitCustomError("PREVIEW_ALREADY_IN_PROGRESS")
      return
    }
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            credentials,
            arrayOf(Pair("username", "String"), Pair("authToken", "String"))
        )
    if (requiredKeys) {
      previewInProgress = true
      var config =
          HMSConfig(
              credentials.getString("username") as String,
              credentials.getString("authToken") as String,
          )

      when {
        HmsHelper.areAllRequiredKeysAvailable(
            credentials,
            arrayOf(Pair("endpoint", "String"), Pair("metadata", "String"))
        ) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  initEndpoint = credentials.getString("endpoint") as String,
                  metadata = credentials.getString("metadata") as String,
              )
        }
        HmsHelper.areAllRequiredKeysAvailable(credentials, arrayOf(Pair("endpoint", "String"))) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  initEndpoint = credentials.getString("endpoint") as String,
              )
        }
        HmsHelper.areAllRequiredKeysAvailable(credentials, arrayOf(Pair("metadata", "String"))) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  metadata = credentials.getString("metadata") as String,
              )
        }
      }

      hmsSDK?.preview(
          config,
          object : HMSPreviewListener {
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              previewInProgress = false
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
              previewInProgress = false
            }
          }
      )
    } else {
      self.emitRequiredKeysError()
    }
  }

  fun join(credentials: ReadableMap) {
    if (previewInProgress) {
      self.emitCustomError("PREVIEW_IS_IN_PROGRESS")
      return
    }
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            credentials,
            arrayOf(Pair("username", "String"), Pair("authToken", "String"))
        )
    if (requiredKeys) {
      var config =
          HMSConfig(
              credentials.getString("username") as String,
              credentials.getString("authToken") as String
          )

      when {
        HmsHelper.areAllRequiredKeysAvailable(
            credentials,
            arrayOf(Pair("endpoint", "String"), Pair("metadata", "String"))
        ) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  initEndpoint = credentials.getString("endpoint") as String,
                  metadata = credentials.getString("metadata") as String,
              )
        }
        HmsHelper.areAllRequiredKeysAvailable(credentials, arrayOf(Pair("endpoint", "String"))) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  initEndpoint = credentials.getString("endpoint") as String,
              )
        }
        HmsHelper.areAllRequiredKeysAvailable(credentials, arrayOf(Pair("metadata", "String"))) -> {
          config =
              HMSConfig(
                  credentials.getString("username") as String,
                  credentials.getString("authToken") as String,
                  metadata = credentials.getString("metadata") as String,
              )
        }
      }

      HMSCoroutineScope.launch {
        try {
          hmsSDK?.join(
              config,
              object : HMSUpdateListener {
                override fun onChangeTrackStateRequest(details: HMSChangeTrackStateRequest) {
                  val decodedChangeTrackStateRequest =
                      HmsDecoder.getHmsChangeTrackStateRequest(details, id)
                  delegate.emitEvent(
                      "ON_CHANGE_TRACK_STATE_REQUEST",
                      decodedChangeTrackStateRequest
                  )
                }

                override fun onRemovedFromRoom(notification: HMSRemovedFromRoom) {
                  super.onRemovedFromRoom(notification)

                  val data: WritableMap = Arguments.createMap()
                  val requestedBy =
                      HmsDecoder.getHmsRemotePeer(notification.peerWhoRemoved as HMSRemotePeer?)
                  val roomEnded = notification.roomWasEnded
                  val reason = notification.reason

                  data.putMap("requestedBy", requestedBy)
                  data.putBoolean("roomEnded", roomEnded)
                  data.putString("reason", reason)
                  data.putString("id", id)

                  delegate.emitEvent("ON_REMOVED_FROM_ROOM", data)
                }

                override fun onError(error: HMSException) {
                  self.emitHMSError(error)
                }

                override fun onJoin(room: HMSRoom) {
                  val roomData = HmsDecoder.getHmsRoom(room)
                  val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val roles = HmsDecoder.getAllRoles(hmsSDK?.getRoles())

                  val data: WritableMap = Arguments.createMap()

                  data.putMap("room", roomData)
                  data.putMap("localPeer", localPeerData)
                  data.putArray("remotePeers", remotePeerData)
                  data.putArray("roles", roles)
                  data.putString("id", id)
                  delegate.emitEvent("ON_JOIN", data)
                }

                override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
                  val updateType = type.name
                  val roomData = HmsDecoder.getHmsRoom(hmsSDK?.getRoom())
                  val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val hmsPeer = HmsDecoder.getHmsPeer(peer)

                  val data: WritableMap = Arguments.createMap()

                  data.putMap("peer", hmsPeer)
                  data.putMap("room", roomData)
                  data.putString("type", updateType)
                  data.putMap("localPeer", localPeerData)
                  data.putArray("remotePeers", remotePeerData)
                  data.putString("id", id)
                  delegate.emitEvent("ON_PEER_UPDATE", data)
                }

                override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
                  val updateType = type.name
                  val roomData = HmsDecoder.getHmsRoom(hmsRoom)
                  val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

                  val data: WritableMap = Arguments.createMap()

                  data.putString("type", updateType)
                  data.putMap("room", roomData)
                  data.putMap("localPeer", localPeerData)
                  data.putArray("remotePeers", remotePeerData)
                  data.putString("id", id)
                  delegate.emitEvent("ON_ROOM_UPDATE", data)
                }

                override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
                  val updateType = type.name
                  val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val roomData = HmsDecoder.getHmsRoom(hmsSDK?.getRoom())
                  val hmsPeer = HmsDecoder.getHmsPeer(peer)
                  val hmsTrack = HmsDecoder.getHmsTrack(track)

                  val data: WritableMap = Arguments.createMap()

                  data.putMap("peer", hmsPeer)
                  data.putMap("track", hmsTrack)
                  data.putMap("room", roomData)
                  data.putString("type", updateType)
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
                  data.putString("event", "RECONNECTING")
                  data.putString("id", id)
                  delegate.emitEvent("RECONNECTING", data)
                }

                override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
                  val decodedChangeRoleRequest = HmsDecoder.getHmsRoleChangeRequest(request, id)
                  delegate.emitEvent("ON_ROLE_CHANGE_REQUEST", decodedChangeRoleRequest)
                  recentRoleChangeRequest = request
                }
              }
          )
        } catch (e: HMSException) {
          self.emitHMSError(e)
        }

        hmsSDK?.addAudioObserver(
            object : HMSAudioListener {
              override fun onAudioLevelUpdate(speakers: Array<HMSSpeaker>) {
                val data: WritableMap = Arguments.createMap()
                data.putInt("count", speakers.size)
                data.putString("event", "ON_SPEAKER")

                val peers: WritableArray = Arguments.createArray()
                for (speaker in speakers) {
                  val speakerArray: WritableMap = Arguments.createMap()
                  speakerArray.putMap("peer", HmsDecoder.getHmsPeer(speaker.peer))
                  speakerArray.putInt("level", speaker.level)
                  speakerArray.putMap("track", HmsDecoder.getHmsTrack(speaker.hmsTrack))
                  peers.pushMap(speakerArray)
                }
                data.putArray("peers", peers)
                data.putString("id", id)
                delegate.emitEvent("ON_SPEAKER", data)
              }
            }
        )
      }
    } else {
      self.emitRequiredKeysError()
    }
  }

  fun setLocalMute(data: ReadableMap) {
    val isMute = data.getBoolean("isMute")
    hmsSDK?.getLocalPeer()?.audioTrack?.setMute(isMute)
    val type = if (isMute) "TRACK_MUTED" else "TRACK_UNMUTED"
    val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
    val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
    val roomData = HmsDecoder.getHmsRoom(hmsSDK?.getRoom())

    val map: WritableMap = Arguments.createMap()

    map.putMap("room", roomData)
    map.putString("type", type)
    map.putMap("localPeer", localPeerData)
    map.putArray("remotePeers", remotePeerData)
    map.putString("id", id)
    delegate.emitEvent("ON_TRACK_UPDATE", map)
  }

  fun setLocalVideoMute(data: ReadableMap) {
    val isMute = data.getBoolean("isMute")
    hmsSDK?.getLocalPeer()?.videoTrack?.setMute(isMute)
  }

  fun switchCamera() {
    if (hmsSDK?.getLocalPeer()?.videoTrack?.isMute == false) {
      HMSCoroutineScope.launch { hmsSDK?.getLocalPeer()?.videoTrack?.switchCamera() }
    }
  }

  fun leave(callback: Promise?) {
    hmsSDK?.leave(
        object : HMSActionResultListener {
          override fun onSuccess() {
            callback?.resolve(emitHMSSuccess())
          }

          override fun onError(error: HMSException) {
            callback?.reject(error.code.toString(), error.message)
            self.emitHMSError(error)
          }
        }
    )
  }

  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("message", "String"), Pair("type", "String"))
        )
    if (requiredKeys) {
      hmsSDK?.sendBroadcastMessage(
          data.getString("message") as String,
          data.getString("type") as String,
          object : HMSMessageResultListener {
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              callback?.reject(error.code.toString(), error.message)
            }
            override fun onSuccess(hmsMessage: HMSMessage) {
              callback?.resolve(emitHMSSuccess(hmsMessage))
            }
          }
      )
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun sendGroupMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("message", "String"), Pair("roles", "Array"), Pair("type", "String"))
        )
    if (requiredKeys) {
      val targetedRoles = data.getArray("roles")?.toArrayList() as? ArrayList<String>
      val roles = hmsSDK?.getRoles()
      val encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles)

      hmsSDK?.sendGroupMessage(
          data.getString("message") as String,
          data.getString("type") as String,
          encodedTargetedRoles,
          object : HMSMessageResultListener {
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              callback?.reject(error.code.toString(), error.message)
            }
            override fun onSuccess(hmsMessage: HMSMessage) {
              callback?.resolve(emitHMSSuccess(hmsMessage))
            }
          }
      )
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun sendDirectMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("message", "String"), Pair("peerId", "String"), Pair("type", "String"))
        )
    if (requiredKeys) {
      val peerId = data.getString("peerId")
      val peers = hmsSDK?.getPeers()
      val peer = HmsHelper.getPeerFromPeerId(peerId, peers)
      if (peer != null) {
        hmsSDK?.sendDirectMessage(
            data.getString("message") as String,
            data.getString("type") as String,
            peer,
            object : HMSMessageResultListener {
              override fun onError(error: HMSException) {
                self.emitHMSError(error)
                callback?.reject(error.code.toString(), error.message)
              }
              override fun onSuccess(hmsMessage: HMSMessage) {
                callback?.resolve(emitHMSSuccess(hmsMessage))
              }
            }
        )
      } else {
        self.emitCustomError("PEER_NOT_FOUND")
        callback?.reject("101", "PEER_NOT_FOUND")
      }
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun changeRole(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("peerId", "String"), Pair("role", "String"), Pair("force", "Boolean"))
        )
    if (requiredKeys) {
      val peerId = data.getString("peerId")
      val role = data.getString("role")
      val force = data.getBoolean("force")

      if (peerId !== null && role !== null) {
        val hmsPeer = HmsHelper.getPeerFromPeerId(peerId, hmsSDK?.getPeers())
        val hmsRole = HmsHelper.getRoleFromRoleName(role, hmsSDK?.getRoles())

        if (hmsRole != null && hmsPeer != null) {
          hmsSDK?.changeRole(
              hmsPeer,
              hmsRole,
              force,
              object : HMSActionResultListener {
                override fun onSuccess() {
                  callback?.resolve(emitHMSSuccess())
                }
                override fun onError(error: HMSException) {
                  self.emitHMSError(error)
                  callback?.reject(error.code.toString(), error.message)
                }
              }
          )
        }
      }
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun changeTrackState(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("trackId", "String"), Pair("mute", "Boolean"))
        )
    if (requiredKeys) {
      val trackId = data.getString("trackId")
      val mute = data.getBoolean("mute")
      val remotePeers = hmsSDK?.getRemotePeers()
      val track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)
      if (track != null) {
        hmsSDK?.changeTrackState(
            track,
            mute,
            object : HMSActionResultListener {
              override fun onSuccess() {
                callback?.resolve(emitHMSSuccess())
              }
              override fun onError(error: HMSException) {
                self.emitHMSError(error)
                callback?.reject(error.code.toString(), error.message)
              }
            }
        )
      }
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun changeTrackStateForRoles(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(
                Pair("mute", "Boolean"),
            )
        )
    if (requiredKeys) {
      val mute: Boolean = data.getBoolean("mute")
      val type =
          if (HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("type", "String")))) {
            if (data.getString("type") == HMSTrackType.AUDIO.toString()) HMSTrackType.AUDIO
            else HMSTrackType.VIDEO
          } else {
            null
          }
      val source =
          if (HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("source", "String")))) {
            data.getString("source")
          } else {
            null
          }
      val targetedRoles =
          if (HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("roles", "Array")))) {
            data.getArray("roles")?.toArrayList() as? ArrayList<String>
          } else {
            null
          }
      val roles = hmsSDK?.getRoles()
      val encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles)
      hmsSDK?.changeTrackState(
          mute,
          type,
          source,
          encodedTargetedRoles,
          object : HMSActionResultListener {
            override fun onSuccess() {
              callback?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              callback?.reject(error.code.toString(), error.message)
            }
          }
      )
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun isMute(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys) {
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
    } else {
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun removePeer(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("peerId", "String"), Pair("reason", "String"))
        )
    if (requiredKeys) {
      val peerId = data.getString("peerId")
      val peers = hmsSDK?.getRemotePeers()
      val peer = HmsHelper.getRemotePeerFromPeerId(peerId, peers)

      if (peer != null) {
        hmsSDK?.removePeerRequest(
            peer,
            data.getString("reason") as String,
            object : HMSActionResultListener {
              override fun onSuccess() {
                callback?.resolve(emitHMSSuccess())
              }
              override fun onError(error: HMSException) {
                self.emitHMSError(error)
                callback?.reject(error.code.toString(), error.message)
              }
            }
        )
      } else {
        self.emitCustomError("PEER_NOT_FOUND")
        callback?.reject("101", "PEER_NOT_FOUND")
      }
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun endRoom(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("lock", "Boolean"), Pair("reason", "String"))
        )
    if (requiredKeys) {
      hmsSDK?.endRoom(
          data.getString("reason") as String,
          data.getBoolean("lock"),
          object : HMSActionResultListener {
            override fun onSuccess() {
              callback?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              callback?.reject(error.code.toString(), error.message)
            }
          }
      )
    } else {
      self.emitRequiredKeysError()
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
    }
  }

  fun acceptRoleChange(callback: Promise?) {
    if (recentRoleChangeRequest !== null) {

      hmsSDK?.acceptChangeRole(
          recentRoleChangeRequest!!,
          object : HMSActionResultListener {
            override fun onSuccess() {
              callback?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              callback?.reject(error.code.toString(), error.message)
            }
          }
      )

      recentRoleChangeRequest = null
    }
  }

  fun muteAllPeersAudio(data: ReadableMap) {
    val requiredKeys = HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("mute", "Boolean")))
    if (requiredKeys) {
      val mute = data.getBoolean("mute")
      val peers = hmsSDK?.getRemotePeers()
      if (peers != null) {
        for (remotePeer in peers) {
          val peerId = remotePeer.peerID
          val peer = HmsHelper.getRemotePeerFromPeerId(peerId, peers)
          peer?.audioTrack?.isPlaybackAllowed = !mute
        }
        val localPeerData = HmsDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HmsDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val map: WritableMap = Arguments.createMap()

        map.putMap("localPeer", localPeerData)
        map.putArray("remotePeers", remotePeerData)
        map.putString("id", id)
        delegate.emitEvent("ON_PEER_UPDATE", map)
      }
    } else {
      this.emitRequiredKeysError()
    }
  }

  fun setPlaybackAllowed(data: ReadableMap) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("trackId", "String"), Pair("playbackAllowed", "Boolean"))
        )
    if (requiredKeys) {
      val trackId = data.getString("trackId")
      val playbackAllowed = data.getBoolean("playbackAllowed")
      val remotePeers = hmsSDK?.getRemotePeers()
      val remoteAudioTrack = HmsHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
      val remoteVideoTrack = HmsHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
      if (remoteAudioTrack != null) {
        remoteAudioTrack.isPlaybackAllowed = playbackAllowed
      } else if (remoteVideoTrack != null) {
        remoteVideoTrack.isPlaybackAllowed = playbackAllowed
      }
    } else {
      this.emitRequiredKeysError()
    }
  }

  fun isPlaybackAllowed(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys) {
      val trackId = data.getString("trackId")
      val remotePeers = hmsSDK?.getRemotePeers()
      val remoteAudioTrack = HmsHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
      val remoteVideoTrack = HmsHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
      when {
        remoteAudioTrack != null -> {
          val isPlaybackAllowed = remoteAudioTrack.isPlaybackAllowed
          callback?.resolve(isPlaybackAllowed)
        }
        remoteVideoTrack != null -> {
          val isPlaybackAllowed = remoteVideoTrack.isPlaybackAllowed
          callback?.resolve(isPlaybackAllowed)
        }
        else -> {
          callback?.reject("101", "NOT_FOUND")
        }
      }
    } else {
      callback?.reject("101", "TRACK_ID_NOT_FOUND")
    }
  }

  fun getRoom(callback: Promise?) {
    val roomData = HmsDecoder.getHmsRoom(hmsSDK?.getRoom())
    callback?.resolve(roomData)
  }

  fun setVolume(data: ReadableMap) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("trackId", "String"), Pair("volume", "Float"))
        )

    if (requiredKeys) {
      val trackId = data.getString("trackId")
      val volume = data.getDouble("volume")

      val remotePeers = hmsSDK?.getRemotePeers()

      if (remotePeers != null) {
        for (peer in remotePeers) {
          val audioTrackId = peer.audioTrack?.trackId

          if (audioTrackId == trackId) {
            peer.audioTrack?.setVolume(volume)
            return
          }

          for (auxTrack in peer.auxiliaryTracks) {
            if (auxTrack.trackId == trackId && auxTrack.type == HMSTrackType.AUDIO) {
              val trackExtracted = auxTrack as? HMSRemoteAudioTrack

              if (trackExtracted != null) {
                trackExtracted.setVolume(volume)
                return
              }
            }
          }
        }
      }
    } else {
      this.emitRequiredKeysError()
    }
  }

  fun getVolume(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("trackId", "String")))

    if (requiredKeys) {
      val trackId = data.getString("trackId")

      val localPeer = hmsSDK?.getLocalPeer()

      if (localPeer?.audioTrack?.trackId == trackId) {
        val volume = localPeer?.audioTrack?.volume
        callback?.resolve(volume)
        return
      }
      callback?.reject("101", "TRACK_IDS_DO_NOT_MATCH")
    } else {
      callback?.reject("101", "TRACK_NOT_FOUND")
    }
  }

  fun changeMetadata(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("metadata", "String")))

    if (requiredKeys) {
      val metadata = data.getString("metadata")

      if (metadata != null) {
        hmsSDK?.changeMetadata(
            metadata,
            object : HMSActionResultListener {
              override fun onSuccess() {
                callback?.resolve(emitHMSSuccess())
              }
              override fun onError(error: HMSException) {
                callback?.reject(error.code.toString(), error.message)
                self.emitHMSError(error)
              }
            }
        )
      }
    } else {
      self.emitRequiredKeysError()
    }
  }

  fun startRTMPOrRecording(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("record", "Boolean"), Pair("meetingURL", "String"))
        )
    if (requiredKeys) {
      val record = data.getBoolean("record")
      val meetingURL = data.getString("meetingURL") as String
      var rtmpURLs = data.getArray("rtmpURLs")
      if (rtmpURLs == null) {
        rtmpURLs = Arguments.createArray()
      }
      val rtmpURLsList = HmsHelper.getRtmpUrls(rtmpURLs)
      val config = HMSRecordingConfig(meetingURL, rtmpURLsList, record)

      hmsSDK?.startRtmpOrRecording(
          config,
          object : HMSActionResultListener {
            override fun onSuccess() {
              callback?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              callback?.reject(error.code.toString(), error.message)
              self.emitHMSError(error)
            }
          }
      )
    } else {
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
      self.emitRequiredKeysError()
    }
  }

  fun stopRtmpAndRecording(callback: Promise?) {
    hmsSDK?.stopRtmpAndRecording(
        object : HMSActionResultListener {
          override fun onSuccess() {
            callback?.resolve(emitHMSSuccess())
          }
          override fun onError(error: HMSException) {
            callback?.reject(error.code.toString(), error.message)
            self.emitHMSError(error)
          }
        }
    )
  }

  fun startHLSStreaming(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HmsHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("meetingURLVariants", "Array")))
    if (requiredKeys) {
      val meetingURLVariants =
          data.getArray("meetingURLVariants")?.toArrayList() as? ArrayList<HashMap<String, String>>
      val hlsMeetingUrlVariant = HmsHelper.getHMSHLSMeetingURLVariants(meetingURLVariants)
      val config = HMSHLSConfig(hlsMeetingUrlVariant)

      hmsSDK?.startHLSStreaming(
          config,
          object : HMSActionResultListener {
            override fun onSuccess() {
              callback?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              callback?.reject(error.code.toString(), error.message)
              self.emitHMSError(error)
            }
          }
      )
    } else {
      callback?.reject("101", "REQUIRED_KEYS_NOT_FOUND")
      self.emitRequiredKeysError()
    }
  }

  fun stopHLSStreaming(callback: Promise?) {
    hmsSDK?.stopHLSStreaming(
        null,
        object : HMSActionResultListener {
          override fun onSuccess() {
            callback?.resolve(emitHMSSuccess())
          }
          override fun onError(error: HMSException) {
            callback?.reject(error.code.toString(), error.message)
            self.emitHMSError(error)
          }
        }
    )
  }
}
