package com.reactnativehmssdk

import android.content.Intent
import android.content.Intent.FLAG_ACTIVITY_NEW_TASK
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.google.gson.JsonElement
import kotlinx.coroutines.launch
import live.hms.video.audio.HMSAudioManager
import live.hms.video.connection.stats.*
import live.hms.video.error.HMSException
import live.hms.video.media.settings.HMSLayer
import live.hms.video.media.tracks.*
import live.hms.video.sdk.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.enums.AudioMixingMode
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.enums.HMSTrackUpdate
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest
import live.hms.video.sessionstore.HMSKeyChangeListener
import live.hms.video.sessionstore.HmsSessionStore
import live.hms.video.signal.init.*
import live.hms.video.utils.HMSCoroutineScope
import live.hms.video.utils.HmsUtilities
import java.io.File
import java.util.Date

class HMSRNSDK(
  data: ReadableMap?,
  HmsDelegate: HMSManager,
  sdkId: String,
  reactApplicationContext: ReactApplicationContext,
) {
  var hmsSDK: HMSSDK? = null
  var screenshareCallback: Promise? = null
  var audioshareCallback: Promise? = null
  var isAudioSharing: Boolean = false
  var delegate: HMSManager = HmsDelegate
  private var recentRoleChangeRequest: HMSRoleChangeRequest? = null
  private var context: ReactApplicationContext = reactApplicationContext
  private var previewInProgress: Boolean = false
  private var reconnectingStage: Boolean = false
  private var networkQualityUpdatesAttached: Boolean = false
  private var audioMixingMode: AudioMixingMode = AudioMixingMode.TALK_AND_MUSIC
  private var id: String = sdkId
  private var self = this
  private var eventsEnableStatus = mutableMapOf<String, Boolean>()
  private var sessionStore: HmsSessionStore? = null
  private val keyChangeObservers = mutableMapOf<String, HMSKeyChangeListener?>()

  init {
    val builder = HMSSDK.Builder(reactApplicationContext)
    if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("trackSettings", "Map")))) {
      val trackSettings = HMSHelper.getTrackSettings(data?.getMap("trackSettings"))
      if (trackSettings != null) {
        builder.setTrackSettings(trackSettings)
      }
    }

    if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("frameworkInfo", "Map")))) {
      val frameworkInfo = HMSHelper.getFrameworkInfo(data?.getMap("frameworkInfo"))
      if (frameworkInfo != null) {
        builder.setFrameworkInfo(frameworkInfo)
      } else {
        emitCustomError("Unable to decode framework info")
      }
    } else {
      emitCustomError("Framework info not sent in build function")
    }

    if (HMSHelper.areAllRequiredKeysAvailable(data, arrayOf(Pair("logSettings", "Map")))) {
      val logSettings = HMSHelper.getLogSettings(data?.getMap("logSettings"))
      if (logSettings != null) {
        builder.setLogSettings(logSettings)
      }
    }

    this.hmsSDK = builder.build()
  }

  private fun emitCustomError(message: String) {
    if (eventsEnableStatus["ON_ERROR"] != true) {
      return
    }
    val data: WritableMap = Arguments.createMap()
    val hmsError = HMSException(6002, message, message, message, message, null, false)
    data.putString("id", id)
    data.putMap("error", HMSDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  private fun emitRequiredKeysError(message: String) {
    if (eventsEnableStatus["ON_ERROR"] != true) {
      return
    }
    val data: WritableMap = Arguments.createMap()
    val hmsError =
      HMSException(
        6002,
        "REQUIRED_KEYS_NOT_FOUND",
        "SEND_ALL_REQUIRED_KEYS",
        message,
        message,
        null,
        false,
      )
    data.putString("id", id)
    data.putMap("error", HMSDecoder.getError(hmsError))
    delegate.emitEvent("ON_ERROR", data)
  }

  private fun rejectCallback(callback: Promise?, message: String) {
    callback?.reject("6002", message)
  }

  // Handle resetting states and data cleanup
  private fun cleanup() {
    screenshareCallback = null
    audioshareCallback = null
    isAudioSharing = false
    recentRoleChangeRequest = null
    previewInProgress = false
    reconnectingStage = false
    networkQualityUpdatesAttached = false
    eventsEnableStatus.clear()
    sessionStore = null
    keyChangeObservers.clear()
    HMSDecoder.clearRestrictDataStates()
  }

  fun emitHMSError(error: HMSException) {
    if (eventsEnableStatus["ON_ERROR"] != true) {
      return
    }
    val data: WritableMap = Arguments.createMap()
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

  fun emitHMSMessageSuccess(hmsMessage: HMSMessage): ReadableMap {
    val data: WritableMap = Arguments.createMap()
    data.putString("message", hmsMessage.message)
    data.putString("messageId", hmsMessage.messageId)
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
        arrayOf(Pair("username", "String"), Pair("authToken", "String")),
      )
    if (requiredKeys === null) {
      previewInProgress = true
      val config = HMSHelper.getHmsConfig(credentials)

      hmsSDK?.preview(
        config,
        object : HMSPreviewListener {
          override fun onError(error: HMSException) {
            previewInProgress = false
            if (eventsEnableStatus["ON_ERROR"] != true) {
              return
            }
            self.emitHMSError(error)
          }

          override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
            if (eventsEnableStatus["3"] != true) {
              return
            }
            if (type === HMSPeerUpdate.BECAME_DOMINANT_SPEAKER ||
              type === HMSPeerUpdate.NO_DOMINANT_SPEAKER
            ) {
              return
            }
            if (!networkQualityUpdatesAttached && type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
            ) {
              return
            }
            val hmsPeer = HMSDecoder.getHmsPeerSubsetForPeerUpdateEvent(peer, type)
            delegate.emitEvent("3", hmsPeer)
          }

          override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
            if (eventsEnableStatus["ON_ROOM_UPDATE"] != true) {
              return
            }

            val updateType = type.name
            val roomData = HMSDecoder.getHmsRoomSubset(hmsRoom, type)

            val data: WritableMap = Arguments.createMap()

            data.putString("type", updateType)
            data.putMap("room", roomData)
            data.putString("id", id)
            delegate.emitEvent("ON_ROOM_UPDATE", data)
          }

          override fun onPreview(room: HMSRoom, localTracks: Array<HMSTrack>) {
            previewInProgress = false
            if (eventsEnableStatus["ON_PREVIEW"] != true) {
              return
            }
            val previewTracks = HMSDecoder.getPreviewTracks(localTracks)
            val hmsRoom = HMSDecoder.getHmsRoomSubset(room)
            val data: WritableMap = Arguments.createMap()

            data.putArray("previewTracks", previewTracks)
            data.putMap("room", hmsRoom)
            data.putString("id", id)
            delegate.emitEvent("ON_PREVIEW", data)
          }
        },
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
        arrayOf(Pair("username", "String"), Pair("authToken", "String")),
      )
    if (requiredKeys === null) {
      reconnectingStage = false
      val config = HMSHelper.getHmsConfig(credentials)

      HMSCoroutineScope.launch {
        try {
          hmsSDK?.join(
            config,
            object : HMSUpdateListener {
              override fun onChangeTrackStateRequest(details: HMSChangeTrackStateRequest) {
                if (eventsEnableStatus["ON_CHANGE_TRACK_STATE_REQUEST"] != true) {
                  return
                }
                val decodedChangeTrackStateRequest =
                  HMSDecoder.getHmsChangeTrackStateRequest(details, id)
                delegate.emitEvent(
                  "ON_CHANGE_TRACK_STATE_REQUEST",
                  decodedChangeTrackStateRequest,
                )
              }

              override fun onRemovedFromRoom(notification: HMSRemovedFromRoom) {
                super.onRemovedFromRoom(notification)
                if (eventsEnableStatus["ON_REMOVED_FROM_ROOM"] != true) {
                  cleanup() // resetting states and doing data cleanup
                  return
                }
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
                cleanup() // resetting states and doing data cleanup
              }

              override fun onError(error: HMSException) {
                if (eventsEnableStatus["ON_ERROR"] != true) {
                  return
                }
                self.emitHMSError(error)
              }

              override fun onJoin(room: HMSRoom) {
                if (eventsEnableStatus["ON_JOIN"] != true) {
                  return
                }
                val roomData = HMSDecoder.getHmsRoomSubset(room)

                val data: WritableMap = Arguments.createMap()

                data.putMap("room", roomData)
                data.putString("id", id)
                delegate.emitEvent("ON_JOIN", data)
              }

              override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
                if (eventsEnableStatus["3"] != true) {
                  return
                }
                if (type === HMSPeerUpdate.BECAME_DOMINANT_SPEAKER ||
                  type === HMSPeerUpdate.NO_DOMINANT_SPEAKER
                ) {
                  return
                }
                if (!networkQualityUpdatesAttached &&
                  type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
                ) {
                  return
                }
                val hmsPeer = HMSDecoder.getHmsPeerSubsetForPeerUpdateEvent(peer, type)
                delegate.emitEvent("3", hmsPeer)
              }

              override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
                if (eventsEnableStatus["ON_ROOM_UPDATE"] != true) {
                  return
                }

                val updateType = type.name
                val roomData = HMSDecoder.getHmsRoomSubset(hmsRoom, type)

                val data: WritableMap = Arguments.createMap()

                data.putString("type", updateType)
                data.putMap("room", roomData)
                data.putString("id", id)
                delegate.emitEvent("ON_ROOM_UPDATE", data)
              }

              override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
                if (eventsEnableStatus["ON_TRACK_UPDATE"] != true) {
                  return
                }
                val updateType = type.name
                val hmsPeer = HMSDecoder.getHmsPeerSubset(peer)
                val hmsTrack = HMSDecoder.getHmsTrack(track)

                val data: WritableMap = Arguments.createMap()

                data.putMap("peer", hmsPeer)
                data.putMap("track", hmsTrack)
                data.putString("type", updateType)
                data.putString("id", id)
                delegate.emitEvent("ON_TRACK_UPDATE", data)
              }

              override fun onMessageReceived(message: HMSMessage) {
                if (eventsEnableStatus["ON_MESSAGE"] != true) {
                  return
                }
                val data: WritableMap = Arguments.createMap()

                data.putMap("sender", HMSDecoder.getHmsPeerSubset(message.sender))
                data.putString("message", message.message)
                data.putString("messageId", message.messageId)
                data.putString("type", message.type)
                data.putString("time", message.serverReceiveTime.toString())
                data.putString("id", id)
                data.putMap("recipient", HMSDecoder.getHmsMessageRecipient(message.recipient))

                delegate.emitEvent("ON_MESSAGE", data)
              }

              override fun onReconnected() {
                reconnectingStage = false
                if (eventsEnableStatus["RECONNECTED"] != true) {
                  return
                }
                val data: WritableMap = Arguments.createMap()
                data.putString("event", "RECONNECTED")
                data.putString("id", id)
                delegate.emitEvent("RECONNECTED", data)
              }

              override fun onReconnecting(error: HMSException) {
                reconnectingStage = true
                if (eventsEnableStatus["RECONNECTING"] != true) {
                  return
                }
                val data: WritableMap = Arguments.createMap()
                data.putMap("error", HMSDecoder.getError(error))
                data.putString("event", "RECONNECTING")
                data.putString("id", id)
                delegate.emitEvent("RECONNECTING", data)
              }

              override fun onRoleChangeRequest(request: HMSRoleChangeRequest) {
                recentRoleChangeRequest = request
                if (eventsEnableStatus["ON_ROLE_CHANGE_REQUEST"] != true) {
                  return
                }
                val decodedChangeRoleRequest = HMSDecoder.getHmsRoleChangeRequest(request, id)
                delegate.emitEvent("ON_ROLE_CHANGE_REQUEST", decodedChangeRoleRequest)
              }

              override fun onSessionStoreAvailable(sessionStore: HmsSessionStore) {
                self.sessionStore = sessionStore
                if (eventsEnableStatus["ON_SESSION_STORE_AVAILABLE"] != true) {
                  return
                }
                val data: WritableMap = Arguments.createMap()
                data.putString("id", id)
                delegate.emitEvent("ON_SESSION_STORE_AVAILABLE", data)
              }
            },
          )
        } catch (e: HMSException) {
          self.emitHMSError(e)
        }

        hmsSDK?.addAudioObserver(
          object : HMSAudioListener {
            override fun onAudioLevelUpdate(speakers: Array<HMSSpeaker>) {
              if (eventsEnableStatus["ON_SPEAKER"] != true) {
                return
              }
              val data: WritableMap = Arguments.createMap()
              data.putString("event", "ON_SPEAKER")

              val peers: WritableArray = Arguments.createArray()
              for (speaker in speakers) {
                if (speaker.peer != null && speaker.hmsTrack != null) {
                  val speakerArray: WritableMap = Arguments.createMap()
                  speakerArray.putInt("level", speaker.level)
                  speakerArray.putMap("peer", HMSDecoder.getHmsPeerSubset(speaker.peer))
                  speakerArray.putMap("track", HMSDecoder.getHmsTrack(speaker.hmsTrack))
                  peers.pushMap(speakerArray)
                }
              }
              data.putArray("speakers", peers)
              data.putString("id", id)
              delegate.emitEvent("ON_SPEAKER", data)
            }
          },
        )

        hmsSDK?.addRtcStatsObserver(
          object : HMSStatsObserver {
            override fun onLocalAudioStats(
              audioStats: HMSLocalAudioStats,
              hmsTrack: HMSTrack?,
              hmsPeer: HMSPeer?,
            ) {
              if (eventsEnableStatus["ON_LOCAL_AUDIO_STATS"] != true || hmsPeer == null || hmsTrack == null) {
                return
              }
              val localAudioStats = HMSDecoder.getLocalAudioStats(audioStats) // [bitrate, bytesSent, roundTripTime]
              val track = HMSDecoder.getHmsLocalAudioTrack(hmsTrack as HMSLocalAudioTrack)
              val peer = HMSDecoder.getHmsPeerSubset(hmsPeer)

              val data: WritableMap = Arguments.createMap()
              data.putArray("localAudioStats", localAudioStats)
              data.putMap("track", track)
              data.putMap("peer", peer)
              data.putString("id", id)
              delegate.emitEvent("ON_LOCAL_AUDIO_STATS", data)
            }

            override fun onLocalVideoStats(
              videoStats: List<HMSLocalVideoStats>,
              hmsTrack: HMSTrack?,
              hmsPeer: HMSPeer?,
            ) {
              if (eventsEnableStatus["ON_LOCAL_VIDEO_STATS"] != true || hmsPeer == null || hmsTrack == null) {
                return
              }
              val localVideoStats = HMSDecoder.getLocalVideoStats(videoStats) // List<[bitrate, bytesSent, roundTripTime, frameRate, resolution]>
              val track = HMSDecoder.getHmsLocalVideoTrack(hmsTrack as HMSLocalVideoTrack)
              val peer = HMSDecoder.getHmsPeerSubset(hmsPeer)

              val data: WritableMap = Arguments.createMap()
              data.putArray("localVideoStats", localVideoStats)
              data.putMap("track", track)
              data.putMap("peer", peer)
              data.putString("id", id)
              delegate.emitEvent("ON_LOCAL_VIDEO_STATS", data)
            }

            override fun onRTCStats(rtcStats: HMSRTCStatsReport) {
              if (eventsEnableStatus["ON_RTC_STATS"] != true) {
                return
              }
              val video = HMSDecoder.getHMSRTCStats(rtcStats.video) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
              val audio = HMSDecoder.getHMSRTCStats(rtcStats.audio) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
              val combined = HMSDecoder.getHMSRTCStats(rtcStats.combined) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]

              val data: WritableMap = Arguments.createMap()
              data.putArray("video", video)
              data.putArray("audio", audio)
              data.putArray("combined", combined)
              data.putString("id", id)
              delegate.emitEvent("ON_RTC_STATS", data)
            }

            override fun onRemoteAudioStats(
              audioStats: HMSRemoteAudioStats,
              hmsTrack: HMSTrack?,
              hmsPeer: HMSPeer?,
            ) {
              if (eventsEnableStatus["ON_REMOTE_AUDIO_STATS"] != true || hmsPeer == null || hmsTrack == null) {
                return
              }
              val remoteAudioStats = HMSDecoder.getRemoteAudioStats(audioStats) // [bitrate, bytesReceived, jitter, packetsLost, packetsReceived]
              val track = HMSDecoder.getHmsRemoteAudioTrack(hmsTrack as HMSRemoteAudioTrack)
              val peer = HMSDecoder.getHmsPeerSubset(hmsPeer)

              val data: WritableMap = Arguments.createMap()
              data.putArray("remoteAudioStats", remoteAudioStats)
              data.putMap("track", track)
              data.putMap("peer", peer)
              data.putString("id", id)
              delegate.emitEvent("ON_REMOTE_AUDIO_STATS", data)
            }

            override fun onRemoteVideoStats(
              videoStats: HMSRemoteVideoStats,
              hmsTrack: HMSTrack?,
              hmsPeer: HMSPeer?,
            ) {
              if (eventsEnableStatus["ON_REMOTE_VIDEO_STATS"] != true || hmsPeer == null || hmsTrack == null) {
                return
              }
              val remoteVideoStats = HMSDecoder.getRemoteVideoStats(videoStats) // [bitrate, bytesReceived, frameRate, jitter, packetsLost, packetsReceived, resolution]
              val track = HMSDecoder.getHmsRemoteVideoTrack(hmsTrack as HMSRemoteVideoTrack)
              val peer = HMSDecoder.getHmsPeerSubset(hmsPeer)

              val data: WritableMap = Arguments.createMap()
              data.putArray("remoteVideoStats", remoteVideoStats)
              data.putMap("track", track)
              data.putMap("peer", peer)
              data.putString("id", id)
              delegate.emitEvent("ON_REMOTE_VIDEO_STATS", data)
            }
          },
        )
      }
    } else {
      val errorMessage = "join: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun getAuthTokenByRoomCode(data: ReadableMap, promise: Promise) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("roomCode", "String")),
      )

    if (requiredKeys === null) {
      val roomCode = data.getString("roomCode")!!
      val userId = data.getString("userId")
      val endpoint = data.getString("endpoint")

      val tokenRequest = TokenRequest(roomCode, userId)
      val tokenRequestOptions: TokenRequestOptions? = endpoint?.let { TokenRequestOptions(endpoint = it) }

      hmsSDK?.getAuthTokenByRoomCode(
        tokenRequest,
        tokenRequestOptions,
        object : HMSTokenListener {
          override fun onError(error: HMSException) {
            promise.reject(error.code.toString(), "${error.message}: ${error.description}")
          }

          override fun onTokenSuccess(string: String) {
            promise.resolve(string)
          }
        },
      )
    } else {
      val errorMessage = "getAuthTokenByRoomCode: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
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

  fun leave(callback: Promise?, fromPIP: Boolean = false) {
    if (reconnectingStage) {
      val errorMessage = "Still in reconnecting stage"

      if (fromPIP) {
        self.emitHMSError(HMSException(101, errorMessage, "PIP Action", "Leave called from PIP Window", "HMSRNSDK #Function leave"))
      } else {
        callback?.reject("101", errorMessage)
      }
    } else {
      hmsSDK?.leave(
        object : HMSActionResultListener {
          override fun onSuccess() {
            if (fromPIP) {
              context.currentActivity?.moveTaskToBack(false)

              if (eventsEnableStatus["ON_PIP_ROOM_LEAVE"] != true) {
                return
              }
              val map: WritableMap = Arguments.createMap()
              map.putString("id", id)
              delegate.emitEvent("ON_PIP_ROOM_LEAVE", map)
            } else {
              callback?.resolve(emitHMSSuccess())
            }
            cleanup() // resetting states and doing data cleanup
          }

          override fun onError(error: HMSException) {
            if (!fromPIP) {
              callback?.reject(error.code.toString(), error.message)
            }
            self.emitHMSError(error)
          }
        },
      )
    }
  }

  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("message", "String"), Pair("type", "String")),
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
            callback?.resolve(emitHMSMessageSuccess(hmsMessage))
          }
        },
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
        arrayOf(Pair("message", "String"), Pair("roles", "Array"), Pair("type", "String")),
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
            callback?.resolve(emitHMSMessageSuccess(hmsMessage))
          }
        },
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
        arrayOf(Pair("message", "String"), Pair("peerId", "String"), Pair("type", "String")),
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
              callback?.resolve(emitHMSMessageSuccess(hmsMessage))
            }
          },
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

  @kotlin.Deprecated("Use #Function changeRoleOfPeer instead")
  fun changeRole(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("peerId", "String"), Pair("role", "String"), Pair("force", "Boolean")),
      )
    if (requiredKeys === null) {
      val peerId = data.getString("peerId")
      val role = data.getString("role")
      val force = data.getBoolean("force")

      if (peerId !== null && role !== null) {
        val hmsPeer = HMSHelper.getPeerFromPeerId(peerId, hmsSDK?.getRoom())
        if (hmsPeer == null) {
          callback?.reject("4000", "PEER_NOT_FOUND")
          return
        }
        val hmsRole = HMSHelper.getRoleFromRoleName(role, hmsSDK?.getRoles())
        if (hmsRole == null) {
          callback?.reject("4000", "ROLE_NOT_FOUND")
          return
        }

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
          },
        )
      }
    } else {
      val errorMessage = "changeRole: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun changeRoleOfPeer(data: ReadableMap, promise: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("peerId", "String"), Pair("role", "String"), Pair("force", "Boolean")),
      )
    if (requiredKeys === null) {
      val peerId = data.getString("peerId")
      val role = data.getString("role")
      val force = data.getBoolean("force")

      if (peerId !== null && role !== null) {
        val hmsPeer = HMSHelper.getPeerFromPeerId(peerId, hmsSDK?.getRoom())
        if (hmsPeer == null) {
          promise?.reject("4000", "PEER_NOT_FOUND")
          return
        }
        val hmsRole = HMSHelper.getRoleFromRoleName(role, hmsSDK?.getRoles())
        if (hmsRole == null) {
          promise?.reject("4000", "ROLE_NOT_FOUND")
          return
        }

        hmsSDK?.changeRoleOfPeer(
          hmsPeer,
          hmsRole,
          force,
          object : HMSActionResultListener {
            override fun onSuccess() {
              promise?.resolve(emitHMSSuccess())
            }
            override fun onError(error: HMSException) {
              self.emitHMSError(error)
              promise?.reject(error.code.toString(), error.message)
            }
          },
        )
      }
    } else {
      val errorMessage = "changeRoleOfPeer: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun changeRoleOfPeersWithRoles(data: ReadableMap, promise: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("ofRoles", "Array"), Pair("toRole", "String")),
      )
    if (requiredKeys === null) {
      val ofRoles = data.getArray("ofRoles")
      val toRole = data.getString("toRole")

      if (ofRoles !== null && toRole !== null) {
        val hmsRoles = hmsSDK?.getRoles()

        val ofRolesArrayList = ArrayList(ofRoles.toArrayList().map { it.toString() })

        val ofHMSRoles = HMSHelper.getRolesFromRoleNames(ofRolesArrayList, hmsRoles)
        val toHMSRole = HMSHelper.getRoleFromRoleName(toRole, hmsRoles)

        if (toHMSRole !== null) {
          hmsSDK?.changeRoleOfPeersWithRoles(
            ofHMSRoles,
            toHMSRole,
            object : HMSActionResultListener {
              override fun onSuccess() {
                promise?.resolve(emitHMSSuccess())
              }
              override fun onError(error: HMSException) {
                self.emitHMSError(error)
                promise?.reject(error.code.toString(), error.message)
              }
            },
          )
        }
      }
    } else {
      val errorMessage = "changeRoleOfPeersWithRoles: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun changeTrackState(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("trackId", "String"), Pair("mute", "Boolean")),
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
          },
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
          if (data.getString("type") == HMSTrackType.AUDIO.toString()) {
            HMSTrackType.AUDIO
          } else {
            HMSTrackType.VIDEO
          }
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
        },
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
        arrayOf(Pair("peerId", "String"), Pair("reason", "String")),
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
          },
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
        arrayOf(Pair("lock", "Boolean"), Pair("reason", "String")),
      )
    if (requiredKeys === null) {
      hmsSDK?.endRoom(
        data.getString("reason") as String,
        data.getBoolean("lock"),
        object : HMSActionResultListener {
          override fun onSuccess() {
            callback?.resolve(emitHMSSuccess())
            cleanup() // resetting states and doing data cleanup
          }
          override fun onError(error: HMSException) {
            self.emitHMSError(error)
            callback?.reject(error.code.toString(), error.message)
          }
        },
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
        },
      )
      recentRoleChangeRequest = null
    } else {
      val errorMessage = "acceptRoleChange: recentRoleChangeRequest not found"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun remoteMuteAllAudio(callback: Promise?) {
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
          },
        )
      }
      if (customError === null) {
        callback?.resolve(emitHMSSuccess())
      } else {
        rejectCallback(callback, customError!!.message)
      }
    }
    rejectCallback(callback, "Audio tracks not found")
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
        arrayOf(Pair("trackId", "String"), Pair("playbackAllowed", "Boolean")),
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

  fun getLocalPeer(callback: Promise?) {
    val localPeer = HMSDecoder.getHmsLocalPeer(hmsSDK?.getLocalPeer())
    callback?.resolve(localPeer)
  }

  fun getRemotePeers(callback: Promise?) {
    val remotePeers = HMSDecoder.getHmsRemotePeers(hmsSDK?.getRemotePeers())
    callback?.resolve(remotePeers)
  }

  fun getRoles(callback: Promise?) {
    val roles = HMSDecoder.getAllRoles(hmsSDK?.getRoles())
    callback?.resolve(roles)
  }

  fun setVolume(data: ReadableMap) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(
        data,
        arrayOf(Pair("trackId", "String"), Pair("volume", "Float")),
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
          },
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
        arrayOf(Pair("record", "Boolean")),
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
          },
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
      },
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
      },
    )
  }

  fun startHLSStreaming(data: ReadableMap, callback: Promise?) {
    val hlsConfig = HMSHelper.getHLSConfig(data)
    hmsSDK?.startHLSStreaming(
      hlsConfig,
      object : HMSActionResultListener {
        override fun onSuccess() {
          callback?.resolve(emitHMSSuccess())
        }
        override fun onError(error: HMSException) {
          callback?.reject(error.code.toString(), error.message)
          self.emitHMSError(error)
        }
      },
    )
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
      },
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
          },
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

  fun enableNetworkQualityUpdates() {
    networkQualityUpdatesAttached = true
  }

  fun disableNetworkQualityUpdates() {
    networkQualityUpdatesAttached = false
  }

  fun getAudioDevicesList(callback: Promise?) {
    callback?.resolve(HMSHelper.getAudioDevicesList(hmsSDK?.getAudioDevicesList()))
  }

  fun getAudioOutputRouteType(callback: Promise?) {
    callback?.resolve(hmsSDK?.getAudioOutputRouteType()?.name)
  }

  fun switchAudioOutput(data: ReadableMap) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("audioDevice", "String")))
    if (requiredKeys === null) {
      val audioDevice = data.getString("audioDevice")
      hmsSDK?.switchAudioOutput(HMSHelper.getAudioDevice(audioDevice))
    } else {
      val errorMessage = "switchAudioOutput: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun setAudioMode(data: ReadableMap) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("audioMode", "Int")))
    if (requiredKeys === null) {
      val audioMode = data.getInt("audioMode")
      hmsSDK?.setAudioMode(audioMode)
    } else {
      val errorMessage = "setAudioMode: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
    }
  }

  fun setAudioDeviceChangeListener() {
    hmsSDK?.setAudioDeviceChangeListener(
      object : HMSAudioManager.AudioManagerDeviceChangeListener {
        override fun onAudioDeviceChanged(
          device: HMSAudioManager.AudioDevice?,
          audioDevicesList: Set<HMSAudioManager.AudioDevice>?,
        ) {
          if (eventsEnableStatus["ON_AUDIO_DEVICE_CHANGED"] != true) {
            return
          }
          val data: WritableMap = Arguments.createMap()
          data.putString("device", device?.name)
          data.putArray("audioDevicesList", HMSHelper.getAudioDevicesSet(audioDevicesList))
          data.putString("id", id)
          delegate.emitEvent("ON_AUDIO_DEVICE_CHANGED", data)
        }

        override fun onError(error: HMSException) {
          self.emitHMSError(error)
        }
      },
    )
  }

  fun startAudioshare(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("audioMixingMode", "String")))
    if (requiredKeys === null) {
      audioshareCallback = callback
      runOnUiThread {
        val intent = Intent(context, HMSAudioshareActivity::class.java)
        intent.flags = FLAG_ACTIVITY_NEW_TASK
        intent.putExtra("id", id)
        intent.putExtra("audioMixingMode", data.getString("audioMixingMode"))
        context.startActivity(intent)
      }
    } else {
      val errorMessage = "startAudioshare: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun isAudioShared(callback: Promise?) {
    callback?.resolve(isAudioSharing)
  }

  fun stopAudioshare(callback: Promise?) {
    hmsSDK?.stopAudioshare(
      object : HMSActionResultListener {
        override fun onError(error: HMSException) {
          audioshareCallback = null
          callback?.reject(error.code.toString(), error.message)
          self.emitHMSError(error)
        }
        override fun onSuccess() {
          isAudioSharing = false
          audioshareCallback = null
          callback?.resolve(emitHMSSuccess())
        }
      },
    )
  }

  fun getAudioMixingMode(): AudioMixingMode {
    return audioMixingMode
  }

  fun setAudioMixingMode(data: ReadableMap, callback: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("audioMixingMode", "String")))
    if (requiredKeys === null) {
      val mode = HMSHelper.getAudioMixingMode(data.getString("audioMixingMode"))
      audioMixingMode = mode
      hmsSDK?.setAudioMixingMode(mode)
      callback?.resolve(emitHMSSuccess())
    } else {
      val errorMessage = "setAudioMixingMode: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(callback, errorMessage)
    }
  }

  fun getPeerProperty(data: ReadableMap): WritableMap? {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("peerId", "String"), Pair("property", "String")))

    val nativeHmsSDK = hmsSDK

    if (requiredKeys !== null || nativeHmsSDK === null) {
      return null
    }

    val peerId = data.getString("peerId")!!
    val property = data.getString("property")!!

    val hmsRoom = nativeHmsSDK.getRoom()

    val peer = HMSHelper.getPeerFromPeerId(peerId, hmsRoom)

    if (peer !== null) {
      val result: WritableMap = Arguments.createMap()

      when (property) {
        "name" -> {
          result.putString("name", peer.name)
        }
        "isLocal" -> {
          result.putBoolean("isLocal", peer.isLocal)
        }
        "networkQuality" -> {
          if (peer.networkQuality !== null) {
            result.putMap("networkQuality", HMSDecoder.getHmsNetworkQuality(peer.networkQuality))
          }
        }
        "metadata" -> {
          result.putString("metadata", peer.metadata)
        }
        "role" -> {
          result.putMap("role", HMSDecoder.getHmsRole(peer.hmsRole))
        }
        "customerUserID" -> {
          if (peer.customerUserID !== null) {
            result.putString("customerUserID", peer.customerUserID)
          }
        }
        "audioTrack" -> {
          if (peer.audioTrack !== null) {
            result.putMap("audioTrack", HMSDecoder.getHmsAudioTrack(peer.audioTrack))
          }
        }
        "videoTrack" -> {
          if (peer.videoTrack !== null) {
            result.putMap("videoTrack", HMSDecoder.getHmsVideoTrack(peer.videoTrack))
          }
        }
        "auxiliaryTracks" -> {
          result.putArray("auxiliaryTracks", HMSDecoder.getAllTracks(peer.auxiliaryTracks))
        }
        else -> null
      }

      return result
    }

    return null
  }

  fun getRoomProperty(data: ReadableMap): WritableMap? {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("property", "String")))

    val nativeHmsSDK = hmsSDK

    if (requiredKeys !== null || nativeHmsSDK === null) {
      return null
    }

    val property = data.getString("property")!!

    val hmsRoom = nativeHmsSDK.getRoom()

    if (hmsRoom !== null) {
      val data: WritableMap = Arguments.createMap()

      when (property) {
        "sessionId" -> {
          data.putString("sessionId", hmsRoom.sessionId)
        }
        "name" -> {
          data.putString("name", hmsRoom.name)
        }
        "metaData" -> {
          data.putString("metaData", null)
        }
        "peerCount" -> {
          hmsRoom.peerCount.let {
            if (it == null) {
              data.putNull("peerCount")
            } else {
              data.putInt("peerCount", it)
            }
          }
        }
        "peers" -> {
          data.putArray("peers", HMSDecoder.getAllPeers(hmsRoom.peerList))
        }
        "localPeer" -> {
          data.putMap("localPeer", HMSDecoder.getHmsLocalPeer(hmsRoom.localPeer))
        }
        "browserRecordingState" -> {
          data.putMap("browserRecordingState", HMSDecoder.getHMSBrowserRecordingState(hmsRoom.browserRecordingState))
        }
        "rtmpHMSRtmpStreamingState" -> {
          data.putMap("rtmpHMSRtmpStreamingState", HMSDecoder.getHMSRtmpStreamingState(hmsRoom.rtmpHMSRtmpStreamingState))
        }
        "serverRecordingState" -> {
          data.putMap("serverRecordingState", HMSDecoder.getHMSServerRecordingState(hmsRoom.serverRecordingState))
        }
        "hlsStreamingState" -> {
          data.putMap("hlsStreamingState", HMSDecoder.getHMSHlsStreamingState(hmsRoom.hlsStreamingState))
        }
        "hlsRecordingState" -> {
          data.putMap("hlsRecordingState", HMSDecoder.getHMSHlsRecordingState(hmsRoom.hlsRecordingState))
        }
      }

      return data
    }

    return null
  }

  fun enableEvent(data: ReadableMap, promise: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("eventType", "String")))
    if (requiredKeys === null) {
      val eventType = data.getString("eventType")

      if (eventType != null) {
        eventsEnableStatus[eventType] = true
        promise?.resolve(emitHMSSuccess())
      }
    } else {
      val errorMessage = "enableEvent: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun disableEvent(data: ReadableMap, promise: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("eventType", "String")))
    if (requiredKeys === null) {
      val eventType = data.getString("eventType")

      if (eventType != null) {
        eventsEnableStatus[eventType] = false
        promise?.resolve(emitHMSSuccess())
      }
    } else {
      val errorMessage = "disableEvent: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun restrictData(data: ReadableMap, promise: Promise?) {
    val requiredKeys =
      HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("roleName", "String")))
    if (requiredKeys === null) {
      val roleName = data.getString("roleName")
      if (roleName != null) {
        HMSDecoder.setRestrictRoleData(roleName, true)
        promise?.resolve(emitHMSSuccess())
      }
    } else {
      val errorMessage = "restrictData: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun getRemoteVideoTrackFromTrackId(data: ReadableMap, promise: Promise) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (remoteVideoTrack === null) {
        promise.reject("101", "TRACK_NOT_FOUND")
      } else {
        promise.resolve(HMSDecoder.getHmsRemoteVideoTrack(remoteVideoTrack))
      }
    } else {
      val errorMessage = "getRemoteVideoTrackFromTrackId: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun getRemoteAudioTrackFromTrackId(data: ReadableMap, promise: Promise) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (remoteAudioTrack === null) {
        promise.reject("101", "TRACK_NOT_FOUND")
      } else {
        promise.resolve(HMSDecoder.getHmsRemoteAudioTrack(remoteAudioTrack))
      }
    } else {
      val errorMessage = "getRemoteAudioTrackFromTrackId: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun getVideoTrackLayer(data: ReadableMap, promise: Promise) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (remoteVideoTrack === null) {
        promise.reject("101", "TRACK_NOT_FOUND")
      } else {
        val layer = remoteVideoTrack.getLayer()
        promise.resolve(layer.name)
      }
    } else {
      val errorMessage = "getVideoTrackLayer: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun getVideoTrackLayerDefinition(data: ReadableMap, promise: Promise) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())
      if (remoteVideoTrack === null) {
        promise.reject("101", "TRACK_NOT_FOUND")
      } else {
        val layerDefinition = remoteVideoTrack.getLayerDefinition()

        promise.resolve(HMSDecoder.getSimulcastLayerDefinitions(layerDefinition))
      }
    } else {
      val errorMessage = "getVideoTrackLayerDefinition: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun setVideoTrackLayer(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("trackId", "String"), Pair("layer", "String")))
    if (requiredKeys === null) {
      val trackId = data.getString("trackId")
      val layerString = data.getString("layer")

      if (HMSLayer.values().find { it.name == layerString } === null) {
        // DOUBT: which error to throw here?
        // emitError or 101 or 6000?
        promise?.reject("6000", "INVALID_LAYER")
        return
      }

      val remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, hmsSDK?.getRoom())

      if (remoteVideoTrack === null) {
        promise?.reject("101", "TRACK_NOT_FOUND")
      } else {
        val layer = HMSLayer.valueOf(layerString!!)
        remoteVideoTrack.setLayer(layer)
        promise?.resolve(true)
      }
    } else {
      val errorMessage = "setVideoTrackLayer: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  fun captureImageAtMaxSupportedResolution(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("flash", "Boolean")))
    if (requiredKeys === null) {
      val localPeer = hmsSDK?.getLocalPeer().let {
        if (it == null) {
          promise?.reject("6004", "An instance of Local Peer could not be found! Please check if a Room is joined.")
          return
        } else {
          it
        }
      }
      val localVideoTrack = localPeer.videoTrack.let {
        if (it == null) {
          promise?.reject("6004", "Video Track of Local Peer could not be found! Please check if the Local Peer has permission to publish video & video is unmuted currently.")
          return
        } else {
          it
        }
      }
      val cameraControl = localVideoTrack.getCameraControl().let {
        if (it == null) {
          promise?.reject("6004", "Camera Controls not available!")
          return
        } else {
          it
        }
      }

      val flashSupported = cameraControl.isFlashSupported()
      var flashActionOnSuccess = 0 // 0 - Do nothing on success, 1 - set flash on, 2 - set flash off
      if (flashSupported) {
        val useFlash = data.getBoolean("flash")

        val flashEnabled = cameraControl.isFlashEnabled()

        // if flash option is true, and flash is already on
        // -> do nothing now and on success

        // if flash option is true, and flash is off
        // -> turn it on and later turn it off
        if (useFlash && !flashEnabled) {
          cameraControl.setFlash(true)
          flashActionOnSuccess = 2
        }

        // if flash option is false, and flash is on
        // -> turn it off and later turn it on
        if (!useFlash && flashEnabled) {
          cameraControl.setFlash(false)
          flashActionOnSuccess = 1
        }

        // if flash option is false, and flash is off
        // -> do nothing now and on success
      }

      val dir = context.getExternalFilesDir("images")
      val imagePath = "$dir/hms_${Date().time}.jpg"
      val savePath = File(imagePath)

      cameraControl.captureImageAtMaxSupportedResolution(
        savePath,
      ) { success ->
        if (flashActionOnSuccess > 0) {
          cameraControl.setFlash(flashActionOnSuccess === 1)
        }
        if (success) {
          promise?.resolve(imagePath)
        } else {
          promise?.reject("6004", "Could Not Capture Image!")
        }
      }
    } else {
      val errorMessage = "captureImageAtMaxSupportedResolution: $requiredKeys"
      self.emitRequiredKeysError(errorMessage)
      rejectCallback(promise, errorMessage)
    }
  }

  // Mark: Session Store

  fun setSessionMetadataForKey(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("key", "String")))
    if (requiredKeys === null) {
      val key = data.getString("key")!!
      val value = data.getString("value")

      sessionStore.let {
        if (it === null) {
          val errorMessage = "setSessionMetadataForKey: HmsSessionStore instance is not available!"
          rejectCallback(promise, errorMessage)
          return
        }

        it.set(
          value, // data/value
          key, // key
          object : HMSActionResultListener {
            override fun onError(error: HMSException) {
              promise?.reject(error.code.toString(), error.message)
            }
            override fun onSuccess() {
              val result: WritableMap = Arguments.createMap()
              result.putBoolean("success", true)
              result.putString("finalValue", value)
              promise?.resolve(result)
            }
          },
        )
      }
    } else {
      val errorMessage = "setSessionMetadataForKey: $requiredKeys"
      rejectCallback(promise, errorMessage)
    }
  }

  fun getSessionMetadataForKey(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("key", "String")))
    if (requiredKeys === null) {
      val key = data.getString("key")!!

      sessionStore.let {
        if (it === null) {
          val errorMessage = "setSessionMetadataForKey: HmsSessionStore instance is not available!"
          rejectCallback(promise, errorMessage)
          return
        }

        it.get(
          key,
          object : HMSSessionMetadataListener {
            override fun onError(error: HMSException) {
              promise?.reject(error.code.toString(), error.message)
            }

            override fun onSuccess(sessionMetadata: JsonElement?) {
              sessionMetadata.let { sm ->
                if (sm == null) {
                  promise?.resolve(null)
                } else {
                  if (sm.isJsonPrimitive) {
                    promise?.resolve(sm.asString)
                  } else if (sm.isJsonNull) {
                    promise?.resolve(null)
                  } else {
                    promise?.resolve(sm.toString())
                  }
                }
              }
            }
          },
        )
      }
    } else {
      val errorMessage = "getSessionMetadataForKey: $requiredKeys"
      rejectCallback(promise, errorMessage)
    }
  }

  fun addKeyChangeListener(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("keys", "Array"), Pair("uniqueId", "String")))
    if (requiredKeys === null) {
      val keys = ArrayList(data.getArray("keys")!!.toArrayList().map { it.toString() })
      val uniqueId = data.getString("uniqueId")!!

      sessionStore.let {
        if (it === null) {
          val errorMessage = "setSessionMetadataForKey: HmsSessionStore instance is not available!"
          rejectCallback(promise, errorMessage)
          return
        }

        val keyChangeListener = object : HMSKeyChangeListener {
          override fun onKeyChanged(key: String, value: JsonElement?) {
            val map = Arguments.createMap()
            map.putString("id", id)
            map.putString("key", key)

            value.let { sm ->
              if (sm == null) {
                map.putString("value", null)
              } else {
                if (sm.isJsonPrimitive) {
                  map.putString("value", sm.asString)
                } else if (sm.isJsonNull) {
                  map.putString("value", null)
                } else {
                  map.putString("value", sm.toString())
                }
              }
            }

            delegate.emitEvent("ON_SESSION_STORE_CHANGED", map)
          }
        }

        val actionResultListener = object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            promise?.reject(error.code.toString(), error.message)
          }
          override fun onSuccess() {
            keyChangeObservers[uniqueId] = keyChangeListener
            promise?.resolve(true)
          }
        }

        it.addKeyChangeListener(
          keys,
          keyChangeListener,
          actionResultListener,
        )
      }
    } else {
      val errorMessage = "addKeyChangeListener: $requiredKeys"
      rejectCallback(promise, errorMessage)
    }
  }

  fun removeKeyChangeListener(data: ReadableMap, promise: Promise?) {
    val requiredKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("uniqueId", "String")))
    if (requiredKeys === null) {
      val uniqueId = data.getString("uniqueId")!!

      sessionStore.let { localSessionStore ->
        if (localSessionStore === null) {
          val errorMessage = "removeKeyChangeListener: HmsSessionStore instance is not available!"
          rejectCallback(promise, errorMessage)
          return
        }

        keyChangeObservers[uniqueId].let {
          if (it == null) {
            val errorMessage = "removeKeyChangeListener: No listener found to remove for the '$uniqueId' uniqueId passed."
            rejectCallback(promise, errorMessage)
          } else {
            localSessionStore.removeKeyChangeListener(it)
            keyChangeObservers.remove(uniqueId)
            promise?.resolve(true)
          }
        }
      }
    } else {
      val errorMessage = "removeKeyChangeListener: $requiredKeys"
      rejectCallback(promise, errorMessage)
    }
  }

  fun getRoomLayout(data: ReadableMap, promise: Promise?) {
    val unavailableKeys = HMSHelper.getUnavailableRequiredKey(data, arrayOf(Pair("authToken", "String")))

    if (unavailableKeys != null) {
      val errorMessage = "getRoomLayout: $unavailableKeys"
      rejectCallback(promise, errorMessage)
      return
    }

    val authToken = data.getString("authToken")!!
    val endpoint = data.getString("endpoint")

    val layoutRequestOptions = endpoint?.let {
      LayoutRequestOptions(endpoint)
    }

    hmsSDK?.getRoomLayout(
      authToken,
      layoutRequestOptions,
      object : HMSLayoutListener {
        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.message)
        }

        override fun onLayoutSuccess(layout: HMSRoomLayout) {
          promise?.resolve(layout.toString())
        }
      }
    )
  }
}
