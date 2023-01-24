package com.reactnativehmssdk

import com.facebook.react.bridge.*
import live.hms.video.connection.stats.*
import live.hms.video.connection.stats.quality.HMSNetworkQuality
import live.hms.video.error.HMSException
import live.hms.video.media.settings.HMSAudioTrackSettings
import live.hms.video.media.settings.HMSVideoResolution
import live.hms.video.media.settings.HMSVideoTrackSettings
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.*
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest

object HMSDecoder {

  fun getHmsRoom(hmsRoom: HMSRoom?): WritableMap {
    val room: WritableMap = Arguments.createMap()
    if (hmsRoom != null) {
      room.putString("id", hmsRoom.roomId)
      room.putString("sessionId", hmsRoom.sessionId)
      room.putString("name", hmsRoom.name)
      room.putString("metaData", null)
      hmsRoom.startedAt?.let {
        room.putString("startedAt", it.toString())
      }

      hmsRoom.browserRecordingState?.let {
        room.putMap(
          "browserRecordingState",
          this.getHMSBrowserRecordingState(it)
        )
      }

      hmsRoom.rtmpHMSRtmpStreamingState?.let {
        room.putMap(
          "rtmpHMSRtmpStreamingState",
          this.getHMSRtmpStreamingState(it)
        )
      }

      hmsRoom.serverRecordingState?.let {
        room.putMap(
          "serverRecordingState",
          this.getHMSServerRecordingState(it)
        )
      }

      hmsRoom.hlsStreamingState?.let {
        room.putMap("hlsStreamingState", this.getHMSHlsStreamingState(hmsRoom.hlsStreamingState))
      }

      hmsRoom.hlsRecordingState?.let {
        room.putMap("hlsRecordingState", this.getHMSHlsRecordingState(hmsRoom.hlsRecordingState))
      }

      room.putMap("localPeer", this.getHmsLocalPeer(hmsRoom.localPeer))
      room.putArray("peers", this.getAllPeers(hmsRoom.peerList))
      room.putInt("peerCount", hmsRoom.peerCount)
    }
    return room
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

  private fun getHmsAudioTrack(hmsAudioTrack: HMSAudioTrack?): WritableMap {
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

  private fun getHmsVideoTrack(hmsVideoTrack: HMSVideoTrack?): WritableMap {
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

  private fun getHmsRole(hmsRole: HMSRole?): WritableMap {
    val role: WritableMap = Arguments.createMap()
    if (hmsRole != null) {
      role.putString("name", hmsRole.name)
      role.putMap("permissions", this.getHmsPermissions(hmsRole.permission))
      hmsRole.publishParams?.let {
        role.putMap("publishSettings", this.getHmsPublishSettings(it))
      }
      hmsRole.subscribeParams?.let {
        role.putMap("subscribeSettings", this.getHmsSubscribeSettings(it))
      }

      role.putInt("priority", hmsRole.priority)
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

  fun getHmsLocalPeer(hmsLocalPeer: HMSLocalPeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsLocalPeer != null) {
      peer.putString("peerID", hmsLocalPeer.peerID)
      peer.putString("name", hmsLocalPeer.name)
      peer.putBoolean("isLocal", hmsLocalPeer.isLocal)

      peer.putMap("role", this.getHmsRole(hmsLocalPeer.hmsRole))

      peer.putString("metadata", hmsLocalPeer.metadata)

      hmsLocalPeer.customerUserID?.let {
        peer.putString("customerUserID", it)
      }

      hmsLocalPeer.networkQuality?.let {
        peer.putMap("networkQuality", this.getHmsNetworkQuality(it))
      }

      hmsLocalPeer.audioTrack?.let {
        peer.putMap("audioTrack", this.getHmsAudioTrack(it))
        peer.putMap("localAudioTrackData", this.getHmsLocalAudioTrack(it))
      }

      hmsLocalPeer.videoTrack?.let {
        peer.putMap("videoTrack", this.getHmsVideoTrack(it))
        peer.putMap("localVideoTrackData", this.getHmsLocalVideoTrack(it))
      }

      hmsLocalPeer.auxiliaryTracks.let {
        peer.putArray("auxiliaryTracks", this.getAllTracks(it))
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
        hmsAudioTrackSettings.useHardwareAcousticEchoCanceler
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

  private fun getHmsVideoTrackResolution(hmsResolution: HMSVideoResolution): WritableMap {
    val resolution: WritableMap = Arguments.createMap()
    resolution.putInt("height", hmsResolution.height)
    resolution.putInt("width", hmsResolution.width)
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
      peer.putString("name", hmsRemotePeer.name)
      peer.putBoolean("isLocal", hmsRemotePeer.isLocal)
      peer.putString("metadata", hmsRemotePeer.metadata)
      peer.putMap("role", this.getHmsRole(hmsRemotePeer.hmsRole))

      hmsRemotePeer.customerUserID?.let {
        peer.putString("customerUserID", it)
      }

      hmsRemotePeer.networkQuality?.let {
        peer.putMap("networkQuality", this.getHmsNetworkQuality(it))
      }

      hmsRemotePeer.audioTrack?.let {
        peer.putMap("audioTrack", this.getHmsAudioTrack(it))
        peer.putMap("remoteAudioTrackData", this.getHmsRemoteAudioTrack(it))
      }

      hmsRemotePeer.videoTrack?.let {
        peer.putMap("videoTrack", this.getHmsVideoTrack(hmsRemotePeer.videoTrack))
        peer.putMap("remoteVideoTrackData", this.getHmsRemoteVideoTrack(hmsRemotePeer.videoTrack))
      }

      hmsRemotePeer.auxiliaryTracks.let {
        peer.putArray("auxiliaryTracks", this.getAllTracks(it))
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
        roleChangeRequest.putMap("requestedBy", this.getHmsPeer(it))
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
      changeTrackStateRequest.putMap("requestedBy", this.getHmsPeer(it))
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

  private fun getHMSBrowserRecordingState(data: HMSBrowserRecordingState?): ReadableMap {
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

  private fun getHMSRtmpStreamingState(data: HMSRtmpStreamingState?): ReadableMap {
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

  private fun getHMSServerRecordingState(data: HMSServerRecordingState?): ReadableMap {
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

  private fun getHMSHlsStreamingState(data: HMSHLSStreamingState?): ReadableMap {
    val input = Arguments.createMap()
    if (data !== null) {
      input.putBoolean("running", data.running)
      data.variants?.let {
        input.putArray("variants", this.getHMSHLSVariant(it))
      }
    }
    return input
  }

  private fun getHMSHlsRecordingState(data: HmsHlsRecordingState?): ReadableMap {
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
      subscribeSettings.putArray(
        "subscribeTo",
        this.getWriteableArray(hmsSubscribeSettings.subscribeTo)
      )
    }
    return subscribeSettings
  }

  private fun getHmsSubscribeDegradationSettings(
    hmsSubscribeDegradationParams: SubscribeDegradationParams?
  ): WritableMap {
    val subscribeDegradationParams: WritableMap = Arguments.createMap()
    if (hmsSubscribeDegradationParams != null) {
      subscribeDegradationParams.putString(
        "degradeGracePeriodSeconds",
        hmsSubscribeDegradationParams.degradeGracePeriodSeconds.toString()
      )
      subscribeDegradationParams.putString(
        "packetLossThreshold",
        hmsSubscribeDegradationParams.packetLossThreshold.toString()
      )
      subscribeDegradationParams.putString(
        "recoverGracePeriodSeconds",
        hmsSubscribeDegradationParams.recoverGracePeriodSeconds.toString()
      )
    }
    return subscribeDegradationParams
  }

  private fun getAllPeers(peers: List<HMSPeer>?): WritableArray {
    val decodedPeers: WritableArray = Arguments.createArray()
    if (peers != null) {
      for (peer in peers) {
        val decodedPeer = this.getHmsPeer(peer)
        decodedPeers.pushMap(decodedPeer)
      }
    }
    return decodedPeers
  }

  private fun getAllTracks(tracks: MutableList<HMSTrack>?): WritableArray {
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
        hmsRecipient.putMap("recipientPeer", this.getHmsPeer(it))
      }

      hmsRecipient.putArray("recipientRoles", this.getAllRoles(recipient.recipientRoles))
      hmsRecipient.putString("recipientType", recipient.recipientType.name)
    }
    return hmsRecipient
  }

  private fun getHmsNetworkQuality(networkQuality: HMSNetworkQuality?): WritableMap {
    val hmsNetworkQuality: WritableMap = Arguments.createMap()
    if (networkQuality != null) {
      hmsNetworkQuality.putInt("downlinkQuality", networkQuality.downlinkQuality)
    }
    return hmsNetworkQuality
  }

  fun getHMSRTCStats(hmsRtcStats: HMSRTCStats?): WritableMap {
    val rtcStats: WritableMap = Arguments.createMap()
    if (hmsRtcStats != null) {
      rtcStats.putDouble("bitrateReceived", hmsRtcStats.bitrateReceived)
      rtcStats.putDouble("bitrateSent", hmsRtcStats.bitrateSent)
      rtcStats.putString("bytesSent", hmsRtcStats.bytesSent.toString())
      rtcStats.putString("bytesReceived", hmsRtcStats.bytesReceived.toString())
      rtcStats.putString("packetsLost", hmsRtcStats.packetsLost.toString())
      rtcStats.putString("packetsReceived", hmsRtcStats.packetsReceived.toString())
      rtcStats.putDouble("roundTripTime", hmsRtcStats.roundTripTime)
    }
    return rtcStats
  }

  fun getLocalAudioStats(hmsLocalAudioStats: HMSLocalAudioStats?): WritableMap {
    val localAudioStats: WritableMap = Arguments.createMap()
    if (hmsLocalAudioStats != null) {
      hmsLocalAudioStats.bitrate?.let { localAudioStats.putDouble("bitrate", it) }
      localAudioStats.putString("bytesSent", hmsLocalAudioStats.bytesSent.toString())
      hmsLocalAudioStats.roundTripTime?.let { localAudioStats.putDouble("roundTripTime", it) }
    }
    return localAudioStats
  }

  fun getLocalVideoStats(hmsLocalVideoStats: List<HMSLocalVideoStats>): WritableArray {
    val stats: WritableArray = Arguments.createArray()

    for (stat in hmsLocalVideoStats) {
      val localVideoStats: WritableMap = Arguments.createMap()

      localVideoStats.putString("bytesSent", stat.bytesSent.toString())
      localVideoStats.putMap(
        "resolution",
        stat.resolution?.let { this.getHmsVideoTrackResolution(it) }
      )
      stat.bitrate?.let { localVideoStats.putDouble("bitrate", it) }
      stat.roundTripTime?.let { localVideoStats.putDouble("roundTripTime", it) }
      stat.frameRate?.let { localVideoStats.putDouble("frameRate", it) }
      stats.pushMap(localVideoStats)
    }

    return stats
  }

  fun getRemoteAudioStats(hmsRemoteAudioStats: HMSRemoteAudioStats?): WritableMap {
    val remoteAudioStats: WritableMap = Arguments.createMap()
    if (hmsRemoteAudioStats != null) {
      hmsRemoteAudioStats.bitrate?.let { remoteAudioStats.putDouble("bitrate", it) }
      remoteAudioStats.putString("bytesReceived", hmsRemoteAudioStats.bytesReceived.toString())
      hmsRemoteAudioStats.jitter?.let { remoteAudioStats.putDouble("jitter", it) }
      hmsRemoteAudioStats.packetsLost?.let { remoteAudioStats.putInt("packetsLost", it) }
      remoteAudioStats.putString("packetsReceived", hmsRemoteAudioStats.packetsReceived.toString())
    }
    return remoteAudioStats
  }

  fun getRemoteVideoStats(hmsRemoteVideoStats: HMSRemoteVideoStats?): WritableMap {
    val remoteVideoStats: WritableMap = Arguments.createMap()
    if (hmsRemoteVideoStats != null) {
      remoteVideoStats.putString("bytesReceived", hmsRemoteVideoStats.bytesReceived.toString())
      remoteVideoStats.putString("packetsReceived", hmsRemoteVideoStats.packetsReceived.toString())
      hmsRemoteVideoStats.bitrate?.let { remoteVideoStats.putDouble("bitrate", it) }
      remoteVideoStats.putMap(
        "resolution",
        hmsRemoteVideoStats.resolution?.let { this.getHmsVideoTrackResolution(it) }
      )
      hmsRemoteVideoStats.frameRate?.let { remoteVideoStats.putDouble("frameRate", it) }
      hmsRemoteVideoStats.jitter?.let { remoteVideoStats.putDouble("jitter", it) }
      hmsRemoteVideoStats.packetsLost?.let { remoteVideoStats.putInt("packetsLost", it) }
    }
    return remoteVideoStats
  }
}
