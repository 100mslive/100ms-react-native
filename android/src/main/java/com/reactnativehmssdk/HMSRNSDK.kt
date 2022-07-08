package com.reactnativehmssdk

import android.content.Intent
import android.content.Intent.FLAG_ACTIVITY_NEW_TASK
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import java.util.*
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
import live.hms.video.utils.HmsUtilities

class HMSRNSDK(
    data: ReadableMap?,
    HmsDelegate: HMSManager,
    sdkId: String,
    reactApplicationContext: ReactApplicationContext
) {
  var hmsSDK: HMSSDK? = null
  var screenshareCallback: Promise? = null
  var delegate: HMSManager = HmsDelegate
  private var recentRoleChangeRequest: HMSRoleChangeRequest? = null
  private var context: ReactApplicationContext = reactApplicationContext
  private var previewInProgress: Boolean = false
  private var reconnectingStage: Boolean = false
  private var id: String = sdkId
  private var self = this

  init {
    val trackSettings = HMSHelper.getTrackSettings(data)
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
    data.putMap("error", HMSDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  private fun emitRequiredKeysError(message: String) {
    val data: WritableMap = Arguments.createMap()
    val hmsError =
        HMSException(102, "REQUIRED_KEYS_NOT_FOUND", "SEND_ALL_REQUIRED_KEYS", message, message)
    data.putString("event", "ON_ERROR")
    data.putString("id", id)
    data.putMap("error", HMSDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  private fun rejectCallback(callback: Promise?, message: String) {
    callback?.reject("102", message)
  }

  fun emitHMSError(error: HMSException) {
    val data: WritableMap = Arguments.createMap()
    data.putString("event", "ON_ERROR")
    data.putString("id", id)
    data.putMap("error", HMSDecoder.getError(error))
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
      self.emitCustomError("PREVIEW_IS_IN_PROGRESS")
      return
    }
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            credentials,
            arrayOf(Pair("username", "String"), Pair("authToken", "String"))
        )
    if (requiredKeys === null) {
      previewInProgress = true
      val config = HMSHelper.getHmsConfig(credentials)

      hmsSDK?.preview(
          config,
          object : HMSPreviewListener {
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              previewInProgress = false
            }

            override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
              if (type === HMSPeerUpdate.AUDIO_TOGGLED ||
                      type === HMSPeerUpdate.VIDEO_TOGGLED ||
                      type === HMSPeerUpdate.BECAME_DOMINANT_SPEAKER ||
                      type === HMSPeerUpdate.NO_DOMINANT_SPEAKER ||
                      type === HMSPeerUpdate.RESIGNED_DOMINANT_SPEAKER ||
                      type === HMSPeerUpdate.STARTED_SPEAKING ||
                      type === HMSPeerUpdate.STOPPED_SPEAKING
              ) {
                return
              }
              val updateType = type.name
              val roomData = HMSDecoder.getHmsRoom(hmsSDK?.getRoom())
              val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
              val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
              val hmsPeer = HMSDecoder.getHmsPeer(peer)

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
              val roomData = HMSDecoder.getHmsRoom(hmsRoom)
              val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
              val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

              val data: WritableMap = Arguments.createMap()

              data.putString("type", updateType)
              data.putMap("room", roomData)
              data.putMap("localPeer", localPeerData)
              data.putArray("remotePeers", remotePeerData)
              data.putString("id", id)
              delegate.emitEvent("ON_ROOM_UPDATE", data)
            }

            override fun onPreview(room: HMSRoom, localTracks: Array<HMSTrack>) {
              val previewTracks = HMSDecoder.getPreviewTracks(localTracks)
              val hmsRoom = HMSDecoder.getHmsRoom(room)
              val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
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
      val errorMessage = "preview: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun join(credentials: ReadableMap) {
    if (previewInProgress) {
      self.emitCustomError("PREVIEW_IS_IN_PROGRESS")
      return
    }
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            credentials,
            arrayOf(Pair("username", "String"), Pair("authToken", "String"))
        )
    if (requiredKeys === null) {
      val config = HMSHelper.getHmsConfig(credentials)

      HMSCoroutineScope.launch {
        try {
          hmsSDK?.join(
              config,
              object : HMSUpdateListener {
                override fun onChangeTrackStateRequest(details: HMSChangeTrackStateRequest) {
                  val decodedChangeTrackStateRequest =
                      HMSDecoder.getHmsChangeTrackStateRequest(details, id)
                  delegate.emitEvent(
                      "ON_CHANGE_TRACK_STATE_REQUEST",
                      decodedChangeTrackStateRequest
                  )
                }

                override fun onRemovedFromRoom(notification: HMSRemovedFromRoom) {
                  super.onRemovedFromRoom(notification)

                  val data: WritableMap = Arguments.createMap()
                  val requestedBy =
                      HMSDecoder.getHmsRemotePeer(notification.peerWhoRemoved as HMSRemotePeer?)
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
                  val roomData = HMSDecoder.getHmsRoom(room)
                  val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val roles = HMSDecoder.getAllRoles(hmsSDK?.getRoles())

                  val data: WritableMap = Arguments.createMap()

                  data.putMap("room", roomData)
                  data.putMap("localPeer", localPeerData)
                  data.putArray("remotePeers", remotePeerData)
                  data.putArray("roles", roles)
                  data.putString("id", id)
                  delegate.emitEvent("ON_JOIN", data)
                }

                override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
                  if (type === HMSPeerUpdate.AUDIO_TOGGLED ||
                          type === HMSPeerUpdate.VIDEO_TOGGLED ||
                          type === HMSPeerUpdate.BECAME_DOMINANT_SPEAKER ||
                          type === HMSPeerUpdate.NO_DOMINANT_SPEAKER ||
                          type === HMSPeerUpdate.RESIGNED_DOMINANT_SPEAKER ||
                          type === HMSPeerUpdate.STARTED_SPEAKING ||
                          type === HMSPeerUpdate.STOPPED_SPEAKING
                  ) {
                    return
                  }
                  val updateType = type.name
                  val roomData = HMSDecoder.getHmsRoom(hmsSDK?.getRoom())
                  val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val hmsPeer = HMSDecoder.getHmsPeer(peer)

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
                  val roomData = HMSDecoder.getHmsRoom(hmsRoom)
                  val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

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
                  val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
                  val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
                  val roomData = HMSDecoder.getHmsRoom(hmsSDK?.getRoom())
                  val hmsPeer = HMSDecoder.getHmsPeer(peer)
                  val hmsTrack = HMSDecoder.getHmsTrack(track)

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

                  data.putMap("sender", HMSDecoder.getHmsPeer(message.sender))
                  data.putString("message", message.message)
                  data.putString("type", message.type)
                  data.putString("time", message.serverReceiveTime.toString())
                  data.putString("id", id)
                  data.putMap("recipient", HMSDecoder.getHmsMessageRecipient(message.recipient))

                  delegate.emitEvent("ON_MESSAGE", data)
                }

                override fun onReconnected() {
                  reconnectingStage = false
                  val data: WritableMap = Arguments.createMap()
                  data.putString("event", "RECONNECTED")
                  data.putString("id", id)
                  delegate.emitEvent("RECONNECTED", data)
                }

                override fun onReconnecting(error: HMSException) {
                  reconnectingStage = true
                  val data: WritableMap = Arguments.createMap()
                  data.putMap("error", HMSDecoder.getError(error))
                  data.putString("event", "RECONNECTING")
                  data.putString("id", id)
                  delegate.emitEvent("RECONNECTING", data)
                }

                override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
                  val decodedChangeRoleRequest = HMSDecoder.getHmsRoleChangeRequest(request, id)
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
                data.putString("event", "ON_SPEAKER")

                val peers: WritableArray = Arguments.createArray()
                for (speaker in speakers) {
                  val speakerArray: WritableMap = Arguments.createMap()
                  speakerArray.putMap("peer", HMSDecoder.getHmsPeer(speaker.peer))
                  speakerArray.putInt("level", speaker.level)
                  speakerArray.putMap("track", HMSDecoder.getHmsTrack(speaker.hmsTrack))
                  peers.pushMap(speakerArray)
                }
                data.putArray("speakers", peers)
                data.putString("id", id)
                delegate.emitEvent("ON_SPEAKER", data)
              }
            }
        )
      }
    } else {
      val errorMessage = "join: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun setLocalMute(data: ReadableMap) {
    val isMute = data.getBoolean("isMute")
    hmsSDK?.getLocalPeer()?.audioTrack?.setMute(isMute)
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
    if (reconnectingStage) {
      callback?.reject("101", "Still in reconnecting stage")
    } else {
      hmsSDK?.leave(
          object : HMSActionResultListener {
            override fun onSuccess() {
              screenshareCallback = null
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

  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("message", "String"), Pair("type", "String"))
        )
    if (requiredKeys === null) {
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
      val errorMessage = "sendBroadcastMessage: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun sendGroupMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("message", "String"), Pair("roles", "Array"), Pair("type", "String"))
        )
    if (requiredKeys === null) {
      val targetedRoles = data.getArray("roles")?.toArrayList() as? ArrayList<String>
      val roles = hmsSDK?.getRoles()
      val encodedTargetedRoles = HMSHelper.getRolesFromRoleNames(targetedRoles, roles)

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
      val errorMessage = "sendGroupMessage: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun sendDirectMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("message", "String"), Pair("peerId", "String"), Pair("type", "String"))
        )
    if (requiredKeys === null) {
      val peerId = data.getString("peerId")
      val peer = HMSHelper.getPeerFromPeerId(peerId, hmsSDK?.getRoom())
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
      val errorMessage = "sendDirectMessage: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun changeRole(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("peerId", "String"), Pair("role", "String"), Pair("force", "Boolean"))
        )
    if (requiredKeys === null) {
      val peerId = data.getString("peerId")
      val role = data.getString("role")
      val force = data.getBoolean("force")

      if (peerId !== null && role !== null) {
        val hmsPeer = HMSHelper.getPeerFromPeerId(peerId, hmsSDK?.getRoom())
        val hmsRole = HMSHelper.getRoleFromRoleName(role, hmsSDK?.getRoles())

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
      val errorMessage = "changeRole: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun changeTrackState(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("trackId", "String"), Pair("mute", "Boolean"))
        )
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val mute = data.getBoolean("mute")
      val track = HMSHelper.getTrackFromTrackId(trackId, hmsSDK?.getRoom())
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
      val errorMessage = "changeTrackState: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun changeTrackStateForRoles(data: ReadableMap, callback: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("mute", "Boolean")))
    if (requiredKeys === null) {
      val mute: Boolean = data.getBoolean("mute")
      val type =
          if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("type", "String")))) {
            if (data.getString("type") == HMSTrackType.AUDIO.toString()) HMSTrackType.AUDIO
            else HMSTrackType.VIDEO
          } else {
            null
          }
      val source =
          if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("source", "String")))) {
            data.getString("source")
          } else {
            null
          }
      val targetedRoles =
          if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("roles", "Array")))) {
            data.getArray("roles")?.toArrayList() as? ArrayList<String>
          } else {
            null
          }
      val roles = hmsSDK?.getRoles()
      val encodedTargetedRoles = HMSHelper.getRolesFromRoleNames(targetedRoles, roles)
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
      val errorMessage = "changeTrackStateForRoles: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun isMute(data: ReadableMap, callback: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val track = HMSHelper.getTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (track == null) {
        callback?.reject("101", "TRACK_NOT_FOUND")
      } else {
        val mute = track.isMute
        callback?.resolve(mute)
      }
    } else {
      val errorMessage = "isMute: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun removePeer(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("peerId", "String"), Pair("reason", "String"))
        )
    if (requiredKeys === null) {
      val peerId = data.getString("peerId")
      val peer = HMSHelper.getRemotePeerFromPeerId(peerId, hmsSDK?.getRoom())

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
      val errorMessage = "removePeer: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun endRoom(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("lock", "Boolean"), Pair("reason", "String"))
        )
    if (requiredKeys === null) {
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
      val errorMessage = "endRoom: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
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
    } else {
      val errorMessage = "acceptRoleChange: recentRoleChangeRequest not found"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun remoteMuteAllAudio() {
    val allAudioTracks = hmsSDK?.getRoom()?.let { HmsUtilities.getAllAudioTracks(it) }
    if (allAudioTracks != null) {
      var customError: HMSException? = null
      for (audioTrack in allAudioTracks) {
        hmsSDK?.changeTrackState(
            audioTrack,
            true,
            object : HMSActionResultListener {
              override fun onSuccess() {}
              override fun onError(error: HMSException) {
                customError = error
              }
            }
        )
      }
      if (customError != null) {
        self.emitHMSError(customError!!)
      }
    }
  }

  fun setPlaybackForAllAudio(data: ReadableMap) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("mute", "Boolean")))
    if (requiredKeys === null) {
      val mute = data.getBoolean("mute")
      val peers = hmsSDK?.getRemotePeers()
      if (peers != null) {
        for (remotePeer in peers) {
          val peerId = remotePeer.peerID
          val peer = HMSHelper.getRemotePeerFromPeerId(peerId, hmsSDK?.getRoom())
          peer?.audioTrack?.isPlaybackAllowed = !mute
        }
        val localPeerData = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
        val remotePeerData = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())

        val map: WritableMap = Arguments.createMap()

        map.putMap("localPeer", localPeerData)
        map.putArray("remotePeers", remotePeerData)
        map.putString("id", id)
        delegate.emitEvent("ON_PEER_UPDATE", map)
      }
    } else {
      val errorMessage = "setPlaybackForAllAudio: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun setPlaybackAllowed(data: ReadableMap) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("trackId", "String"), Pair("playbackAllowed", "Boolean"))
        )
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val playbackAllowed = data.getBoolean("playbackAllowed")
      val remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, hmsSDK?.getRoom())
      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (remoteAudioTrack != null) {
        remoteAudioTrack.isPlaybackAllowed = playbackAllowed
      } else if (remoteVideoTrack != null) {
        remoteVideoTrack.isPlaybackAllowed = playbackAllowed
      }
    } else {
      val errorMessage = "setPlaybackAllowed: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun isPlaybackAllowed(data: ReadableMap, callback: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, hmsSDK?.getRoom())
      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())
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
          callback?.reject("101", "TRACK_NOT_FOUND")
        }
      }
    } else {
      val errorMessage = "isPlaybackAllowed: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun getRoom(callback: Promise?) {
    val roomData = HMSDecoder.getHmsRoom(hmsSDK?.getRoom())
    callback?.resolve(roomData)
  }

  fun setVolume(data: ReadableMap) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("trackId", "String"), Pair("volume", "Float"))
        )

    if (requiredKeys === null) {
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
        this.emitCustomError("TRACK_NOT_FOUND")
      } else {
        this.emitCustomError("REMOTE_PEERS_NOT_FOUND")
      }
    } else {
      val errorMessage = "setVolume: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun getVolume(data: ReadableMap, callback: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")

      val localPeer = hmsSDK?.getLocalPeer()

      if (localPeer?.audioTrack?.trackId == trackId) {
        val volume = localPeer?.audioTrack?.volume
        callback?.resolve(volume)
        return
      }
      callback?.reject("101", "TRACK_IDS_DO_NOT_MATCH")
    } else {
      val errorMessage = "getVolume: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun changeMetadata(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("metadata", "String")))
    if (requiredKeys === null) {
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
      val errorMessage = "changeMetadata: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun startRTMPOrRecording(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(
            data,
            arrayOf(Pair("record", "Boolean"), Pair("meetingURL", "String"))
        )
    if (requiredKeys === null) {
      val config = HMSHelper.getRtmpConfig(data)
      if (config === null) {
        val errorMessage = "startRTMPOrRecording: INVALID_MEETING_URL_PASSED"
        self.emitRequiredKeysError(errorMessage)
        rejectCallback(callback, errorMessage)
      } else {
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
      }
    } else {
      val errorMessage = "startRTMPOrRecording: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
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

  fun startScreenshare(callback: Promise?) {
    screenshareCallback = callback
    runOnUiThread {
      val intent = Intent(context, HmsScreenshareActivity::class.java)
      intent.flags = FLAG_ACTIVITY_NEW_TASK
      intent.putExtra("id", id)
      context.startActivity(intent)
    }
  }

  fun isScreenShared(callback: Promise?) {
    callback?.resolve(hmsSDK?.isScreenShared())
  }

  fun stopScreenshare(callback: Promise?) {
    hmsSDK?.stopScreenshare(
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            screenshareCallback = null
            callback?.reject(error.code.toString(), error.message)
            self.emitHMSError(error)
          }
          override fun onSuccess() {
            screenshareCallback = null
            callback?.resolve(emitHMSSuccess())
          }
        }
    )
  }

  fun startHLSStreaming(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
        HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("meetingURLVariants", "Array")))
    if (requiredKeys === null) {
      val meetingURLVariants =
          data.getArray("meetingURLVariants")?.toArrayList() as? ArrayList<HashMap<String, String>>
      val hlsMeetingUrlVariant = HMSHelper.getHMSHLSMeetingURLVariants(meetingURLVariants)
      val hlsRecordingConfig = HMSHelper.getHlsRecordingConfig(data)
      val config = HMSHLSConfig(hlsMeetingUrlVariant, hlsRecordingConfig)

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
      val errorMessage = "startHLSStreaming: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
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

  fun resetVolume() {
    val remotePeers = hmsSDK?.getRemotePeers()

    if (remotePeers != null) {
      for (peer in remotePeers) {
        val playbackAllowed = peer.audioTrack?.isPlaybackAllowed
        if (playbackAllowed !== null && playbackAllowed) {
          peer.audioTrack?.setVolume(10.0)
        }
        val auxTracks = peer.auxiliaryTracks

        for (track in auxTracks) {
          if (track.type === HMSTrackType.AUDIO) {

            (track as? HMSRemoteAudioTrack)?.setVolume(10.0)
          }
        }
      }
    }
  }

  fun changeName(data: ReadableMap, callback: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("name", "String")))
    if (requiredKeys === null) {
      val name = data.getString("name")
      if (name != null && name != "") {
        hmsSDK?.changeName(
            name,
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
        self.emitCustomError("NAME_UNDEFINED")
        callback?.reject("101", "NAME_UNDEFINED")
      }
    } else {
      val errorMessage = "changeName: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }
}
