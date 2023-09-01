package com.reactnativehmssdk

import com.facebook.react.bridge.*
import live.hms.video.connection.degredation.QualityLimitationReasons
import live.hms.video.connection.stats.*
import live.hms.video.connection.stats.quality.HMSNetworkQuality
import live.hms.video.error.HMSException
import live.hms.video.media.settings.*
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.enums.HMSPeerUpdate
import live.hms.video.sdk.models.enums.HMSRoomUpdate
import live.hms.video.sdk.models.role.*
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest

object HMSDecoder {
  private var restrictRoleData = mutableMapOf<String, Boolean>()

  fun setRestrictRoleData(roleName: String, value: Boolean) {
    this.restrictRoleData[roleName] = value
  }

  fun clearRestrictDataStates() {
    this.restrictRoleData.clear()
  }

  fun getHmsRoomSubset(hmsRoom: HMSRoom?, hmsRoomUpdateType: HMSRoomUpdate? = null): WritableMap {
    val room: WritableMap = Arguments.createMap()
    if (hmsRoom != null) {
      room.putString("id", hmsRoom.roomId)

      when (hmsRoomUpdateType) {
        HMSRoomUpdate.ROOM_PEER_COUNT_UPDATED -> {
          // When ROOM_PEER_COUNT_UPDATED update type is received then `peerCount` should be a valid value
          // using `0` as default
          room.putInt("peerCount", hmsRoom.peerCount ?: 0)
        }
        HMSRoomUpdate.HLS_RECORDING_STATE_UPDATED -> {
          hmsRoom.hlsRecordingState?.let {
            room.putMap("hlsRecordingState", this.getHMSHlsRecordingState(it))
          }
        }
        HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED -> {
          hmsRoom.browserRecordingState?.let {
            room.putMap(
              "browserRecordingState",
              this.getHMSBrowserRecordingState(it),
            )
          }
        }
        HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED -> {
          hmsRoom.hlsStreamingState?.let {
            room.putMap("hlsStreamingState", this.getHMSHlsStreamingState(it))
          }
        }
        HMSRoomUpdate.RTMP_STREAMING_STATE_UPDATED -> {
          hmsRoom.rtmpHMSRtmpStreamingState?.let {
            room.putMap(
              "rtmpHMSRtmpStreamingState",
              this.getHMSRtmpStreamingState(it),
            )
          }
        }
        HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED -> {
          hmsRoom.serverRecordingState?.let {
            room.putMap(
              "serverRecordingState",
              this.getHMSServerRecordingState(it),
            )
          }
        }
        HMSRoomUpdate.ROOM_MUTED -> {
          print("ROOM_MUTED received")
        }
        HMSRoomUpdate.ROOM_UNMUTED -> {
          print("ROOM_UNMUTED received")
        }
        else -> {
          print("Unknown Room Update Type received")
        }
      }
    }
    return room
  }

  fun getHmsRoom(hmsRoom: HMSRoom?): WritableMap {
    val room: WritableMap = Arguments.createMap()
    if (hmsRoom != null) {
      room.putString("id", hmsRoom.roomId)
      hmsRoom.sessionId?.let {
        room.putString("sessionId", it)
      }
      room.putString("name", hmsRoom.name)
      room.putString("metaData", null)
      // hmsRoom.startedAt?.let {
      //   room.putString("startedAt", it.toString())
      // }

      hmsRoom.browserRecordingState?.let {
        room.putMap(
          "browserRecordingState",
          this.getHMSBrowserRecordingState(it),
        )
      }

      hmsRoom.rtmpHMSRtmpStreamingState?.let {
        room.putMap(
          "rtmpHMSRtmpStreamingState",
          this.getHMSRtmpStreamingState(it),
        )
      }

      hmsRoom.serverRecordingState?.let {
        room.putMap(
          "serverRecordingState",
          this.getHMSServerRecordingState(it),
        )
      }

      hmsRoom.hlsStreamingState?.let {
        room.putMap("hlsStreamingState", this.getHMSHlsStreamingState(hmsRoom.hlsStreamingState))
      }

      hmsRoom.hlsRecordingState?.let {
        room.putMap("hlsRecordingState", this.getHMSHlsRecordingState(hmsRoom.hlsRecordingState))
      }

      hmsRoom.localPeer?.let {
        room.putMap("localPeer", this.getHmsLocalPeer(it))
      }

      room.putArray("peers", this.getAllPeers(hmsRoom.peerList))

      hmsRoom.peerCount.let {
        if (it == null) {
          room.putNull("peerCount")
        } else {
          room.putInt("peerCount", it)
        }
      }
    }
    return room
  }

  fun getHmsPeerSubsetForPeerUpdateEvent(hmsPeer: HMSPeer?, peerUpdateType: HMSPeerUpdate): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsPeer != null) {
      peer.putString(peerUpdateType.ordinal.toString(), hmsPeer.peerID)
      peer.putString("name", hmsPeer.name)

      when (peerUpdateType) {
        HMSPeerUpdate.METADATA_CHANGED -> {
          peer.putString("metadata", hmsPeer.metadata)
        }
        HMSPeerUpdate.ROLE_CHANGED -> {
          peer.putMap("role", this.getHmsRole(hmsPeer.hmsRole))
        }
        HMSPeerUpdate.NETWORK_QUALITY_UPDATED -> {
          hmsPeer.networkQuality?.let {
            peer.putMap("networkQuality", this.getHmsNetworkQuality(it))
          }
        }
        HMSPeerUpdate.NAME_CHANGED -> {
          print("$peerUpdateType received")
        }
        else -> {
          print("Unhandled Peer Update Type received: $peerUpdateType")
        }
      }
    }
    return peer
  }

  fun getHmsPeerSubset(hmsPeer: HMSPeer?, peerUpdateType: HMSPeerUpdate? = null): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsPeer != null) {
      peer.putString("peerID", hmsPeer.peerID)
      peer.putString("name", hmsPeer.name)

      if (peerUpdateType !== null) {
        when (peerUpdateType) {
          HMSPeerUpdate.METADATA_CHANGED -> {
            peer.putString("metadata", hmsPeer.metadata)
          }
          HMSPeerUpdate.ROLE_CHANGED -> {
            peer.putMap("role", this.getHmsRole(hmsPeer.hmsRole))
          }
          HMSPeerUpdate.NETWORK_QUALITY_UPDATED -> {
            hmsPeer.networkQuality?.let {
              peer.putMap("networkQuality", this.getHmsNetworkQuality(it))
            }
          }
          HMSPeerUpdate.NAME_CHANGED -> {
            print("$peerUpdateType received")
          }
          else -> {
            print("Unhandled Peer Update Type received: $peerUpdateType")
          }
        }
      }
    }
    return peer
  }

  fun getHmsPeer(hmsPeer: HMSPeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsPeer != null) {
      peer.putString("peerID", hmsPeer.peerID)
      peer.putString("name", hmsPeer.name)
      peer.putBoolean("isLocal", hmsPeer.isLocal)

      hmsPeer.customerUserID?.let {
        peer.putString("customerUserID", it)
      }

      peer.putString("joinedAt", hmsPeer.joinedAt.toString())

      peer.putString("metadata", hmsPeer.metadata)

      peer.putMap("role", this.getHmsRole(hmsPeer.hmsRole))

      hmsPeer.networkQuality?.let {
        peer.putMap("networkQuality", this.getHmsNetworkQuality(it))
      }

      hmsPeer.audioTrack?.let {
        peer.putMap("audioTrack", this.getHmsAudioTrack(it))
      }

      hmsPeer.videoTrack?.let {
        peer.putMap("videoTrack", this.getHmsVideoTrack(it))
      }

      hmsPeer.auxiliaryTracks.let {
        peer.putArray("auxiliaryTracks", this.getAllTracks(it))
      }
    }
    return peer
  }

  fun getHmsAudioTrack(hmsAudioTrack: HMSAudioTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (hmsAudioTrack != null) {
      hmsTrack.putString("type", hmsAudioTrack.type.name)
      hmsTrack.putString("trackId", hmsAudioTrack.trackId)
      hmsTrack.putString("source", hmsAudioTrack.source)
      hmsTrack.putString("trackDescription", hmsAudioTrack.description)
      hmsTrack.putBoolean("isMute", hmsAudioTrack.isMute)
    }
    return hmsTrack
  }

  fun getHmsVideoTrack(hmsVideoTrack: HMSVideoTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (hmsVideoTrack != null) {
      hmsTrack.putString("type", hmsVideoTrack.type.name)
      hmsTrack.putString("trackId", hmsVideoTrack.trackId)
      hmsTrack.putString("source", hmsVideoTrack.source)
      hmsTrack.putString("trackDescription", hmsVideoTrack.description)
      hmsTrack.putBoolean("isMute", hmsVideoTrack.isMute)
      hmsTrack.putBoolean("isDegraded", hmsVideoTrack.isDegraded)
    }
    return hmsTrack
  }

  fun getHmsTrack(track: HMSTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (track != null) {
      hmsTrack.putString("trackId", track.trackId)
      hmsTrack.putString("source", track.source)
      hmsTrack.putString("trackDescription", track.description)
      hmsTrack.putBoolean("isMute", track.isMute)
      hmsTrack.putString("type", track.type.name)
    }
    return hmsTrack
  }

  fun getAllRoles(roles: List<HMSRole>?): WritableArray {
    val decodedRoles: WritableArray = Arguments.createArray()
    if (roles != null) {
      for (role in roles) {
        val decodedRole = this.getHmsRole(role)
        decodedRoles.pushMap(decodedRole)
      }
    }
    return decodedRoles
  }

  fun getHmsRole(hmsRole: HMSRole?): WritableMap {
    val role: WritableMap = Arguments.createMap()
    if (hmsRole != null) {
      role.putString("name", hmsRole.name)
      if (this.restrictRoleData[hmsRole.name] != true) {
        role.putMap("permissions", this.getHmsPermissions(hmsRole.permission))
        hmsRole.publishParams?.let {
          role.putMap("publishSettings", this.getHmsPublishSettings(it))
        }
        hmsRole.subscribeParams?.let {
          role.putMap("subscribeSettings", this.getHmsSubscribeSettings(it))
        }

        role.putInt("priority", hmsRole.priority)
      }
    }
    return role
  }

  private fun getHmsPermissions(hmsPermissions: PermissionsParams?): WritableMap {
    val permissions: WritableMap = Arguments.createMap()
    if (hmsPermissions != null) {
      permissions.putBoolean("endRoom", hmsPermissions.endRoom)
      permissions.putBoolean("removeOthers", hmsPermissions.removeOthers)
      permissions.putBoolean("mute", hmsPermissions.mute)
      permissions.putBoolean("browserRecording", hmsPermissions.browserRecording)
      permissions.putBoolean("unmute", hmsPermissions.unmute)
      permissions.putBoolean("hlsStreaming", hmsPermissions.hlsStreaming)
      permissions.putBoolean("rtmpStreaming", hmsPermissions.rtmpStreaming)
      permissions.putBoolean("changeRole", hmsPermissions.changeRole)
    }
    return permissions
  }

  private fun getHmsPublishSettings(hmsPublishSettings: PublishParams?): WritableMap {
    val publishSettings: WritableMap = Arguments.createMap()
    if (hmsPublishSettings != null) {
      hmsPublishSettings.audio?.let {
        publishSettings.putMap("audio", this.getHmsAudioSettings(it))
      }

      hmsPublishSettings.video?.let {
        publishSettings.putMap("video", this.getHmsVideoSettings(it))
      }

      hmsPublishSettings.screen?.let {
        publishSettings.putMap("screen", this.getHmsVideoSettings(it))
      }

      hmsPublishSettings.simulcast?.let {
        publishSettings.putMap("simulcast", this.getHmsSimulcastSettings(it))
      }

      publishSettings.putArray("allowed", this.getWriteableArray(hmsPublishSettings.allowed))
    }
    return publishSettings
  }

  private fun getWriteableArray(array: List<String>?): WritableArray {
    val decodedArray: WritableArray = Arguments.createArray()
    if (array != null) {
      for (value in array) {
        decodedArray.pushString(value)
      }
    }
    return decodedArray
  }

  private fun getHmsAudioSettings(hmsAudioSettings: AudioParams?): WritableMap {
    val audioSettings: WritableMap = Arguments.createMap()
    if (hmsAudioSettings != null) {
      audioSettings.putInt("bitRate", hmsAudioSettings.bitRate)
      audioSettings.putString("codec", hmsAudioSettings.codec.name)
    }
    return audioSettings
  }

  private fun getHmsVideoSettings(hmsVideoSettings: VideoParams?): WritableMap {
    val videoSettings: WritableMap = Arguments.createMap()
    if (hmsVideoSettings != null) {
      videoSettings.putInt("bitRate", hmsVideoSettings.bitRate)
      videoSettings.putInt("frameRate", hmsVideoSettings.frameRate)
      videoSettings.putInt("width", hmsVideoSettings.width)
      videoSettings.putInt("height", hmsVideoSettings.height)
      videoSettings.putString("codec", hmsVideoSettings.codec.name)
    }
    return videoSettings
  }

  private fun getHmsSimulcastSettings(hmsSimulcastSettings: Simulcast?): WritableMap {
    val simulcastSettings: WritableMap = Arguments.createMap()
    if (hmsSimulcastSettings != null) {
      hmsSimulcastSettings.video?.let {
        simulcastSettings.putMap("video", getHmsVideoSimulcastLayersParams(it))
      }
      hmsSimulcastSettings.screen?.let {
        simulcastSettings.putMap("screen", getHmsVideoSimulcastLayersParams(it))
      }
    }
    return simulcastSettings
  }

  private fun getHmsVideoSimulcastLayersParams(hmsVideoSimulcastLayersParams: VideoSimulcastLayersParams?): WritableMap {
    val videoSimulcastLayersParams: WritableMap = Arguments.createMap()
    if (hmsVideoSimulcastLayersParams != null) {
      hmsVideoSimulcastLayersParams.layers?.let {
        val layersParams = Arguments.createArray()
        it.forEach { layer -> layersParams.pushMap(getHmsLayerParams(layer)) }
        videoSimulcastLayersParams.putArray("layers", layersParams)
      }
    }
    return videoSimulcastLayersParams
  }

  private fun getHmsLayerParams(hmsLayerParams: LayerParams?): WritableMap {
    val layerParams: WritableMap = Arguments.createMap()
    if (hmsLayerParams != null) {
      hmsLayerParams.rid?.let {
        layerParams.putString("rid", it)
      }
      hmsLayerParams.maxBitrate?.let {
        layerParams.putInt("maxBitrate", it)
      }
      hmsLayerParams.scaleResolutionDownBy?.let {
        layerParams.putDouble("scaleResolutionDownBy", it.toDouble())
      }
      hmsLayerParams.maxFramerate?.let {
        layerParams.putInt("maxFramerate", it)
      }
    }
    return layerParams
  }

  fun getHmsLocalPeer(hmsLocalPeer: HMSLocalPeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsLocalPeer != null) {
      peer.putString("peerID", hmsLocalPeer.peerID)

      hmsLocalPeer.audioTrack?.let {
        peer.putMap("localAudioTrackData", this.getHmsLocalAudioTrack(it))
      }

      hmsLocalPeer.videoTrack?.let {
        peer.putMap("localVideoTrackData", this.getHmsLocalVideoTrack(it))
      }
    }
    return peer
  }

  fun getHmsLocalAudioTrack(track: HMSLocalAudioTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (track != null) {
      hmsTrack.putDouble("volume", track.volume)
      hmsTrack.putMap("settings", this.getHmsAudioTrackSettings(track.settings))
      hmsTrack.putString("trackId", track.trackId)
      hmsTrack.putString("source", track.source)
      hmsTrack.putString("trackDescription", track.description)
      hmsTrack.putBoolean("isMute", track.isMute)
      hmsTrack.putString("type", track.type.name)
    }
    return hmsTrack
  }

  fun getHmsLocalVideoTrack(track: HMSLocalVideoTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (track != null) {
      hmsTrack.putBoolean("isDegraded", track.isDegraded)
      hmsTrack.putMap("settings", this.getHmsVideoTrackSettings(track.settings))
      hmsTrack.putString("trackId", track.trackId)
      hmsTrack.putString("source", track.source)
      hmsTrack.putString("trackDescription", track.description)
      hmsTrack.putBoolean("isMute", track.isMute)
      hmsTrack.putString("type", track.type.name)
    }
    return hmsTrack
  }

  private fun getHmsAudioTrackSettings(hmsAudioTrackSettings: HMSAudioTrackSettings?): WritableMap {
    val settings: WritableMap = Arguments.createMap()
    if (hmsAudioTrackSettings != null) {
      settings.putBoolean(
        "useHardwareAcousticEchoCanceler",
        hmsAudioTrackSettings.useHardwareAcousticEchoCanceler,
      )
      settings.putString("initialState", hmsAudioTrackSettings.initialState.name)
    }
    return settings
  }

  private fun getHmsVideoTrackSettings(hmsVideoTrackSettings: HMSVideoTrackSettings?): WritableMap {
    val settings: WritableMap = Arguments.createMap()
    if (hmsVideoTrackSettings != null) {
      settings.putString("cameraFacing", hmsVideoTrackSettings.cameraFacing.name)
      settings.putBoolean("disableAutoResize", hmsVideoTrackSettings.disableAutoResize)
      settings.putBoolean("forceSoftwareDecoder", hmsVideoTrackSettings.forceSoftwareDecoder)
      settings.putString("initialState", hmsVideoTrackSettings.initialState.name)
    }
    return settings
  }

  private fun getHmsVideoTrackResolution(hmsResolution: HMSVideoResolution): WritableArray {
    val resolution: WritableArray = Arguments.createArray() // [width, height]
    resolution.pushInt(hmsResolution.width)
    resolution.pushInt(hmsResolution.height)

    return resolution
  }

  fun getHmsRemotePeers(remotePeers: List<HMSRemotePeer>?): WritableArray {
    val peers: WritableArray = Arguments.createArray()
    if (remotePeers != null) {
      for (peer in remotePeers) {
        peers.pushMap(this.getHmsRemotePeer(peer))
      }
    }
    return peers
  }

  fun getHmsRemotePeer(hmsRemotePeer: HMSRemotePeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsRemotePeer != null) {
      peer.putString("peerID", hmsRemotePeer.peerID)

      hmsRemotePeer.audioTrack?.let {
        peer.putMap("remoteAudioTrackData", this.getHmsRemoteAudioTrack(it))
      }

      hmsRemotePeer.videoTrack?.let {
        peer.putMap("remoteVideoTrackData", this.getHmsRemoteVideoTrack(hmsRemotePeer.videoTrack))
      }
    }
    return peer
  }

  fun getHmsRemoteAudioTrack(track: HMSRemoteAudioTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (track != null) {
      hmsTrack.putBoolean("isPlaybackAllowed", track.isPlaybackAllowed)
      hmsTrack.putString("trackId", track.trackId)
      hmsTrack.putString("source", track.source)
      hmsTrack.putString("trackDescription", track.description)
      hmsTrack.putBoolean("isMute", track.isMute)
      hmsTrack.putString("type", track.type.name)
    }
    return hmsTrack
  }

  fun getHmsRemoteVideoTrack(track: HMSRemoteVideoTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (track != null) {
      hmsTrack.putBoolean("isDegraded", track.isDegraded)
      hmsTrack.putBoolean("isPlaybackAllowed", track.isPlaybackAllowed)
      hmsTrack.putString("trackId", track.trackId)
      hmsTrack.putString("source", track.source)
      hmsTrack.putString("trackDescription", track.description)
      hmsTrack.putBoolean("isMute", track.isMute)
      hmsTrack.putString("type", track.type.name)
    }
    return hmsTrack
  }

  fun getPreviewTracks(tracks: Array<HMSTrack>?): WritableArray {
    val hmsTracks: WritableArray = Arguments.createArray()
    if (tracks != null) {
      for (track: HMSTrack in tracks) {
        if (track is HMSLocalVideoTrack) {
          hmsTracks.pushMap(this.getHmsLocalVideoTrack(track))
        }
        if (track is HMSLocalAudioTrack) {
          hmsTracks.pushMap(this.getHmsLocalAudioTrack(track))
        }
      }
    }
    return hmsTracks
  }

  fun getHmsRoleChangeRequest(request: HMSRoleChangeRequest, id: String?): WritableMap {
    val roleChangeRequest: WritableMap = Arguments.createMap()
    if (id != null) {
      request.requestedBy?.let {
        roleChangeRequest.putMap("requestedBy", this.getHmsPeerSubset(it))
      }
      roleChangeRequest.putMap("suggestedRole", this.getHmsRole(request.suggestedRole))
      roleChangeRequest.putString("id", id)
      return roleChangeRequest
    }
    return roleChangeRequest
  }

  fun getHmsChangeTrackStateRequest(request: HMSChangeTrackStateRequest, id: String): WritableMap {
    val changeTrackStateRequest: WritableMap = Arguments.createMap()

    request.requestedBy?.let {
      changeTrackStateRequest.putMap("requestedBy", this.getHmsPeerSubset(it))
    }
    changeTrackStateRequest.putString("trackType", request.track.type.name)
    changeTrackStateRequest.putBoolean("mute", request.mute)
    changeTrackStateRequest.putString("id", id)

    return changeTrackStateRequest
  }

  fun getError(error: HMSException?): WritableMap? {
    if (error !== null) {
      val decodedError: WritableMap = Arguments.createMap()
      decodedError.putInt("code", error.code)
      decodedError.putString("description", error.description)
      decodedError.putString("message", error.message)
      decodedError.putString("name", error.name)
      decodedError.putString("action", error.action)
      decodedError.putBoolean("isTerminal", error.isTerminal)
      return decodedError
    }
    return null
  }

  fun getHMSBrowserRecordingState(data: HMSBrowserRecordingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      input.putBoolean("initialising", false)

      input.putBoolean("running", data.running)

      data.startedAt?.let {
        input.putString("startedAt", it.toString())
      }

      data.stoppedAt?.let {
        input.putString("stoppedAt", it.toString())
      }

      data.error?.let {
        input.putMap("error", this.getError(it))
      }
    }
    return input
  }

  fun getHMSRtmpStreamingState(data: HMSRtmpStreamingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      input.putBoolean("running", data.running)

      data.startedAt?.let {
        input.putString("startedAt", it.toString())
      }

      data.stoppedAt?.let {
        input.putString("stoppedAt", it.toString())
      }

      data.error?.let {
        input.putMap("error", this.getError(it))
      }
    }
    return input
  }

  fun getHMSServerRecordingState(data: HMSServerRecordingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      input.putBoolean("running", data.running)

      data.startedAt?.let {
        input.putString("startedAt", it.toString())
      }

      data.error?.let {
        input.putMap("error", this.getError(it))
      }
    }
    return input
  }

  fun getHMSHlsStreamingState(data: HMSHLSStreamingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      input.putBoolean("running", data.running)
      data.variants?.let {
        input.putArray("variants", this.getHMSHLSVariant(it))
      }
    }
    return input
  }

  fun getHMSHlsRecordingState(data: HmsHlsRecordingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      data.running?.let { input.putBoolean("running", it) }

      data.startedAt?.let {
        input.putString("startedAt", it.toString())
      }

      data.hlsRecordingConfig?.let { input.putBoolean("singleFilePerLayer", it.singleFilePerLayer) }
      data.hlsRecordingConfig?.let { input.putBoolean("videoOnDemand", it.videoOnDemand) }
    }
    return input
  }

  private fun getHMSHLSVariant(data: ArrayList<HMSHLSVariant>?): ReadableArray {
    val variants = Arguments.createArray()
    if (data !== null) {
      for (variant in data) {
        val input = Arguments.createMap()
        input.putString("hlsStreamUrl", variant.hlsStreamUrl)
        input.putString("meetingUrl", variant.meetingUrl)
        input.putString("metadata", variant.metadata)
        variant.startedAt?.let {
          input.putString("startedAt", it.toString())
        }
        variants.pushMap(input)
      }
    }
    return variants
  }

  private fun getHmsSubscribeSettings(hmsSubscribeSettings: SubscribeParams?): WritableMap {
    val subscribeSettings: WritableMap = Arguments.createMap()
    if (hmsSubscribeSettings != null) {
      subscribeSettings.putInt("maxSubsBitRate", hmsSubscribeSettings.maxSubsBitRate)

      hmsSubscribeSettings.subscribeDegradationParam?.let {
        subscribeSettings.putMap("subscribeDegradation", this.getHmsSubscribeDegradationSettings(it))
      }

      subscribeSettings.putArray(
        "subscribeTo",
        this.getWriteableArray(hmsSubscribeSettings.subscribeTo),
      )
    }
    return subscribeSettings
  }

  private fun getHmsSubscribeDegradationSettings(
    hmsSubscribeDegradationParams: SubscribeDegradationParams?,
  ): WritableMap {
    val subscribeDegradationParams: WritableMap = Arguments.createMap()
    if (hmsSubscribeDegradationParams != null) {
      subscribeDegradationParams.putString(
        "degradeGracePeriodSeconds",
        hmsSubscribeDegradationParams.degradeGracePeriodSeconds.toString(),
      )
      subscribeDegradationParams.putString(
        "packetLossThreshold",
        hmsSubscribeDegradationParams.packetLossThreshold.toString(),
      )
      subscribeDegradationParams.putString(
        "recoverGracePeriodSeconds",
        hmsSubscribeDegradationParams.recoverGracePeriodSeconds.toString(),
      )
    }
    return subscribeDegradationParams
  }

  fun getAllPeers(peers: List<HMSPeer>?): WritableArray {
    val decodedPeers: WritableArray = Arguments.createArray()
    if (peers != null) {
      for (peer in peers) {
        val decodedPeer = this.getHmsPeerSubset(peer)
        decodedPeers.pushMap(decodedPeer)
      }
    }
    return decodedPeers
  }

  fun getAllTracks(tracks: MutableList<HMSTrack>?): WritableArray {
    val decodedTracks: WritableArray = Arguments.createArray()
    if (tracks != null) {
      for (track in tracks) {
        val decodedTrack = this.getHmsTrack(track)
        decodedTracks.pushMap(decodedTrack)
      }
    }
    return decodedTracks
  }

  fun getHmsMessageRecipient(recipient: HMSMessageRecipient?): WritableMap {
    val hmsRecipient: WritableMap = Arguments.createMap()
    if (recipient != null) {
      recipient.recipientPeer?.let {
        hmsRecipient.putMap("recipientPeer", this.getHmsPeerSubset(it))
      }

      hmsRecipient.putArray("recipientRoles", this.getAllRoles(recipient.recipientRoles))
      hmsRecipient.putString("recipientType", recipient.recipientType.name)
    }
    return hmsRecipient
  }

  fun getHmsNetworkQuality(networkQuality: HMSNetworkQuality?): WritableMap {
    val hmsNetworkQuality: WritableMap = Arguments.createMap()
    if (networkQuality != null) {
      hmsNetworkQuality.putInt("downlinkQuality", networkQuality.downlinkQuality)
    }
    return hmsNetworkQuality
  }

  fun getHMSRTCStats(hmsRtcStats: HMSRTCStats?): WritableArray {
    val rtcStats: WritableArray = Arguments.createArray() // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
    if (hmsRtcStats != null) {
      rtcStats.pushDouble(hmsRtcStats.bitrateReceived)
      rtcStats.pushDouble(hmsRtcStats.bitrateSent)
      rtcStats.pushString(hmsRtcStats.bytesReceived.toString())
      rtcStats.pushString(hmsRtcStats.bytesSent.toString())
      rtcStats.pushString(hmsRtcStats.packetsLost.toString())
      rtcStats.pushString(hmsRtcStats.packetsReceived.toString())
      rtcStats.pushDouble(hmsRtcStats.roundTripTime)
    }
    return rtcStats
  }

  fun getLocalAudioStats(hmsLocalAudioStats: HMSLocalAudioStats?): WritableArray {
    val localAudioStats: WritableArray = Arguments.createArray()

    if (hmsLocalAudioStats != null) {
      val bitrate = hmsLocalAudioStats.bitrate ?: -1.0
      localAudioStats.pushDouble(bitrate)

      val bytesSent = hmsLocalAudioStats.bytesSent.let { if (it === null) "" else it.toString() }
      localAudioStats.pushString(bytesSent)

      val roundTripTime = hmsLocalAudioStats.roundTripTime ?: -1.0
      localAudioStats.pushDouble(roundTripTime)
    }
    return localAudioStats
  }

  fun getLocalVideoStats(hmsLocalVideoStats: List<HMSLocalVideoStats>): WritableArray {
    val stats: WritableArray = Arguments.createArray()

    for (stat in hmsLocalVideoStats) {
      val localVideoStats: WritableArray = Arguments.createArray() // [bitrate, bytesSent, roundTripTime, frameRate, resolution, layer, qualityLimitationReasons]

      val bitrate = stat.bitrate ?: -1.0
      localVideoStats.pushDouble(bitrate)

      val bytesSent = stat.bytesSent.let { if (it === null) "" else it.toString() }
      localVideoStats.pushString(bytesSent)

      val roundTripTime = stat.roundTripTime ?: -1.0
      localVideoStats.pushDouble(roundTripTime)

      val frameRate = stat.frameRate ?: -1.0
      localVideoStats.pushDouble(frameRate)

      stat.resolution.let {
        if (it === null) {
          localVideoStats.pushNull()
        } else {
          localVideoStats.pushArray(getHmsVideoTrackResolution(it)) // [width, height]
        }
      }

      val layer = stat.hmsLayer.let { if (it === null) HMSLayer.HIGH.name else it.name }
      localVideoStats.pushString(layer)

      val qualityLimitationReasons = getHmsQualityLimitationReasons(stat.qualityLimitationReason)
      localVideoStats.pushMap(qualityLimitationReasons)

      stats.pushArray(localVideoStats)
    }

    return stats
  }

  private fun getHmsQualityLimitationReasons(hmsQualityLimitationReasons: QualityLimitationReasons?): WritableMap {
    val qualityLimitationReasons: WritableMap = Arguments.createMap()

    if (hmsQualityLimitationReasons != null) {
      hmsQualityLimitationReasons.bandWidth?.let { qualityLimitationReasons.putDouble("bandwidth", it) }
      hmsQualityLimitationReasons.cpu?.let { qualityLimitationReasons.putDouble("cpu", it) }
      hmsQualityLimitationReasons.none?.let { qualityLimitationReasons.putDouble("none", it) }
      hmsQualityLimitationReasons.other?.let { qualityLimitationReasons.putDouble("other", it) }
      hmsQualityLimitationReasons.qualityLimitationResolutionChanges?.let { qualityLimitationReasons.putInt("qualityLimitationResolutionChanges", it.toInt()) }
      qualityLimitationReasons.putString("reason", hmsQualityLimitationReasons.reason.name)
    }
    return qualityLimitationReasons
  }

  fun getRemoteAudioStats(hmsRemoteAudioStats: HMSRemoteAudioStats?): WritableArray {
    val remoteAudioStats: WritableArray = Arguments.createArray()

    if (hmsRemoteAudioStats != null) {
      val bitrate = hmsRemoteAudioStats.bitrate ?: -1.0
      remoteAudioStats.pushDouble(bitrate)

      val bytesReceived = hmsRemoteAudioStats.bytesReceived.let { if (it === null) "" else it.toString() }
      remoteAudioStats.pushString(bytesReceived)

      val jitter = hmsRemoteAudioStats.jitter ?: -1.0
      remoteAudioStats.pushDouble(jitter)

      val packetsLost = hmsRemoteAudioStats.packetsLost ?: -1
      remoteAudioStats.pushInt(packetsLost)

      val packetsReceived = hmsRemoteAudioStats.packetsReceived.let { if (it === null) "" else it.toString() }
      remoteAudioStats.pushString(packetsReceived)
    }
    return remoteAudioStats
  }

  fun getRemoteVideoStats(hmsRemoteVideoStats: HMSRemoteVideoStats?): WritableArray {
    val remoteVideoStats: WritableArray = Arguments.createArray() // [bitrate, bytesReceived, frameRate, jitter, packetsLost, packetsReceived, resolution]

    if (hmsRemoteVideoStats != null) {
      val bitrate = hmsRemoteVideoStats.bitrate ?: -1.0
      remoteVideoStats.pushDouble(bitrate)

      val bytesReceived = hmsRemoteVideoStats.bytesReceived.let { if (it === null) "" else it.toString() }
      remoteVideoStats.pushString(bytesReceived)

      val frameRate = hmsRemoteVideoStats.frameRate ?: -1.0
      remoteVideoStats.pushDouble(frameRate)

      val jitter = hmsRemoteVideoStats.jitter ?: -1.0
      remoteVideoStats.pushDouble(jitter)

      val packetsLost = hmsRemoteVideoStats.packetsLost ?: -1
      remoteVideoStats.pushInt(packetsLost)

      val packetsReceived = hmsRemoteVideoStats.packetsReceived.let { if (it === null) "" else it.toString() }
      remoteVideoStats.pushString(packetsReceived)

      hmsRemoteVideoStats.resolution.let {
        if (it === null) {
          remoteVideoStats.pushNull()
        } else {
          remoteVideoStats.pushArray(getHmsVideoTrackResolution(it)) // [width, height]
        }
      }
    }
    return remoteVideoStats
  }

  private fun getSimulcastLayerDefinition(hmsSimulcastLayerDefinition: HMSSimulcastLayerDefinition): WritableMap {
    val simulcastLayerDefinition: WritableMap = Arguments.createMap()
    simulcastLayerDefinition.putString("layer", hmsSimulcastLayerDefinition.layer.name)
    simulcastLayerDefinition.putArray("resolution", getHmsVideoTrackResolution(hmsSimulcastLayerDefinition.resolution)) // [width, height]
    return simulcastLayerDefinition
  }

  fun getSimulcastLayerDefinitions(hmsSimulcastLayerDefinitions: List<HMSSimulcastLayerDefinition>): WritableArray {
    val simulcastLayerDefinitions: WritableArray = Arguments.createArray()
    hmsSimulcastLayerDefinitions.forEach { simulcastLayerDefinitions.pushMap(getSimulcastLayerDefinition(it)) }
    return simulcastLayerDefinitions
  }
}
