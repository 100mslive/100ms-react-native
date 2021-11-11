package com.reactnativehmssdk

import com.facebook.react.bridge.*
import live.hms.video.error.HMSException
import java.util.*
import live.hms.video.media.settings.HMSAudioTrackSettings
import live.hms.video.media.settings.HMSVideoTrackSettings
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.*
import live.hms.video.sdk.models.trackchangerequest.HMSChangeTrackStateRequest

object HmsDecoder {

  fun getHmsRoom(hmsRoom: HMSRoom?): WritableMap {
    val room: WritableMap = Arguments.createMap()
    if (hmsRoom != null) {
      room.putString("id", hmsRoom.roomId)
      room.putString("name", hmsRoom.name)
      room.putString("metaData", null)
      var peers: WritableArray = Arguments.createArray()
      for (peer in hmsRoom.peerList) {
        peers.pushMap(getHmsPeer(peer))
      }
      room.putArray("peers", peers)
    }
    return room
  }

  fun getHmsPeer(hmsPeer: HMSPeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsPeer != null) {
      peer.putString("peerID", hmsPeer.peerID)
      peer.putString("name", hmsPeer.name)
      peer.putBoolean("isLocal", hmsPeer.isLocal)
      peer.putString(
          "customerUserID",
          if (hmsPeer.customerUserID == null) hmsPeer.customerUserID else ""
      )
      peer.putString(
          "customerDescription",
          if (hmsPeer.customerDescription == null) hmsPeer.customerDescription else ""
      )
      peer.putMap("audioTrack", getHmsAudioTrack(hmsPeer.audioTrack))
      peer.putMap("videoTrack", getHmsVideoTrack(hmsPeer.videoTrack))
      peer.putMap("role", getHmsRole(hmsPeer.hmsRole))
      var auxiliaryTracks: WritableArray = Arguments.createArray()
      for (track in hmsPeer.auxiliaryTracks) {
        auxiliaryTracks.pushMap(getHmsTrack(track))
      }
      peer.putArray("auxiliaryTracks", auxiliaryTracks)
    }
    return peer
  }

  fun getHmsAudioTrack(hmsAudioTrack: HMSAudioTrack?): WritableMap {
    val hmsTrack: WritableMap = Arguments.createMap()
    if (hmsAudioTrack != null) {
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
      hmsTrack.putString("type", track.type.toString())
    }
    return hmsTrack
  }

  fun getAllRoles(roles: List<HMSRole>?): WritableArray {
    val decodedRoles: WritableArray = Arguments.createArray()

    if (roles != null) {
      for (role in roles) {
        val decodedRole = getHmsRole(role)

        decodedRoles.pushMap(decodedRole)
      }
    }

    return decodedRoles
  }

  fun getHmsRole(hmsRole: HMSRole?): WritableMap {
    val role: WritableMap = Arguments.createMap()
    //      val emptyMap: WritableArray = Arguments.createMap();
    if (hmsRole != null) {
      role.putString("name", hmsRole.name)
      role.putMap("permissions", getHmsPermissions(hmsRole.permission))
      role.putMap("publishSettings", getHmsPublishSettings(hmsRole.publishParams))
      role.putInt("priority", hmsRole.priority)
      //        role.putArray("generalPermissions",
      // if(hmsRole.generalPermissions!=null)hmsRole.generalPermissions else emptyMap);
      //        role.putArray("internalPlugins",
      // if(hmsRole.internalPlugins!=null)hmsRole.internalPlugins else emptyMap);
      //        role.putArray("externalPlugins",
      // if(hmsRole.externalPlugins!=null)hmsRole.externalPlugins else emptyMap);
    }
    return role
  }

  fun getHmsPermissions(hmsPermissions: PermissionsParams?): WritableMap {
    val permissions: WritableMap = Arguments.createMap()
    if (hmsPermissions != null) {
      permissions.putBoolean(
          "endRoom",
          if (hmsPermissions.endRoom != null) hmsPermissions.endRoom else false
      )
      permissions.putBoolean(
          "removeOthers",
          if (hmsPermissions.removeOthers != null) hmsPermissions.removeOthers else false
      )
      permissions.putBoolean(
          "mute",
          if (hmsPermissions.mute != null) hmsPermissions.mute else false
      )
      permissions.putBoolean(
          "changeRoleForce",
          if (hmsPermissions.changeRoleForce != null) hmsPermissions.changeRoleForce else false
      )
      permissions.putBoolean(
          "unmute",
          if (hmsPermissions.unmute != null) hmsPermissions.unmute else false
      )
      permissions.putBoolean(
          "recording",
          if (hmsPermissions.recording != null) hmsPermissions.recording else false
      )
      permissions.putBoolean(
          "rtmp",
          if (hmsPermissions.rtmp != null) hmsPermissions.rtmp else false
      )
      permissions.putBoolean(
          "changeRole",
          if (hmsPermissions.changeRole != null) hmsPermissions.changeRole else false
      )
    }
    return permissions
  }

  fun getHmsPublishSettings(hmsPublishSettings: PublishParams?): WritableMap {
    val publishSettings: WritableMap = Arguments.createMap()
    val emptyArray: WritableArray = Arguments.createArray()
    if (hmsPublishSettings != null) {
      publishSettings.putMap("audio", getHmsAudioSettings(hmsPublishSettings.audio))
      publishSettings.putMap("video", getHmsVideoSettings(hmsPublishSettings.video))
      publishSettings.putMap("screen", getHmsVideoSettings(hmsPublishSettings.screen))
      //        publishSettings.putMap("videoSimulcastLayers",
      // getHmsSimulcastLayers(hmsPublishSettings.videoSimulcastLayers));
      //        publishSettings.putMap("screenSimulcastLayers",
      // getHmsSimulcastLayers(hmsPublishSettings.screenSimulcastLayers));
      publishSettings.putMap("videoSimulcastLayers", null)
      publishSettings.putMap("screenSimulcastLayers", null)
      //        publishSettings.putArray("allowed", if (hmsPublishSettings.allowed != null)
      // hmsPublishSettings.allowed as WritableArray else emptyArray);
    }
    return publishSettings
  }
  fun getHmsAudioSettings(hmsAudioSettings: AudioParams?): WritableMap {
    val audioSettings: WritableMap = Arguments.createMap()
    if (hmsAudioSettings != null) {
      audioSettings.putInt("bitRate", hmsAudioSettings.bitRate)
      audioSettings.putString("codec", hmsAudioSettings.codec.toString())
    }
    return audioSettings
  }

  fun getHmsVideoSettings(hmsVideoSettings: VideoParams?): WritableMap {
    val videoSettings: WritableMap = Arguments.createMap()
    if (hmsVideoSettings != null) {
      videoSettings.putInt("bitRate", hmsVideoSettings.bitRate)
      videoSettings.putInt("frameRate", hmsVideoSettings.frameRate)
      videoSettings.putInt("width", hmsVideoSettings.width)
      videoSettings.putInt("height", hmsVideoSettings.height)
      videoSettings.putString("codec", hmsVideoSettings.codec.toString())
    }
    return videoSettings
  }

  //    fun getHmsSimulcastLayers(videoSimulcastLayers: HMSSimulcastSettingsPolicy?): WritableMap {
  //      val videoLayers: WritableMap = Arguments.createMap();
  //      if(videoSimulcastLayers != null) {
  //        videoLayers.putInt("width", videoSimulcastLayers.width);
  //        videoLayers.putString("height", videoSimulcastLayers.height);
  //        videoLayers.putArray("layers",
  // getHmsSimulcastLayerSettingsPolicy(videoSimulcastLayers.layers));
  //      }
  //      return videoLayers;
  //    }

  //    fun getHmsSimulcastLayerSettingsPolicy(layers: HMSSimulcastLayerSettingsPolicy?):
  // WritableArray {
  //      val layersSettingsPolicy: WritableArray = Arguments.createArray();
  //      val hmsLayersSettingsPolicy: WritableMap = Arguments.createMap();
  //      if(layers != null) {
  //        hmsLayersSettingsPolicy.putString("rid", layers.rid);
  //        hmsLayersSettingsPolicy.putInt("scaleResolutionDownBy", if (layers.scaleResolutionDownBy
  // != null) layers.scaleResolutionDownBy else 0);
  //        hmsLayersSettingsPolicy.putInt("maxBitrate", if (layers.maxBitrate != null)
  // layers.maxBitrate else -1);
  //        hmsLayersSettingsPolicy.putInt("maxFramerate", if (layers.maxFramerate != null)
  // layers.maxFramerate else -1);
  //      }
  //      layersSettingsPolicy.pushMap(hmsLayersSettingsPolicy)
  //      return layersSettingsPolicy;
  //    }

  fun getHmsLocalPeer(hmsLocalPeer: HMSLocalPeer?): WritableMap {
    val peer: WritableMap = Arguments.createMap()
    if (hmsLocalPeer != null) {
      peer.putString("peerID", hmsLocalPeer.peerID)
      peer.putString("name", hmsLocalPeer.name)
      peer.putBoolean("isLocal", hmsLocalPeer.isLocal)
      peer.putString(
          "customerUserID",
          if (hmsLocalPeer.customerUserID != null) hmsLocalPeer.customerUserID else ""
      )
      peer.putString(
          "customerDescription",
          if (hmsLocalPeer.customerDescription != null) hmsLocalPeer.customerDescription else ""
      )
      peer.putMap("audioTrack", getHmsAudioTrack(hmsLocalPeer.audioTrack))
      peer.putMap("videoTrack", getHmsVideoTrack(hmsLocalPeer.videoTrack))
      peer.putMap("role", getHmsRole(hmsLocalPeer.hmsRole))

      var auxiliaryTracks: WritableArray = Arguments.createArray()
      for (track in hmsLocalPeer.auxiliaryTracks) {
        auxiliaryTracks.pushMap(getHmsTrack(track))
      }
      peer.putArray("auxiliaryTracks", auxiliaryTracks)

      val localAudioTrack = hmsLocalPeer.audioTrack
      var localAudioTrackData: WritableMap = Arguments.createMap()
      localAudioTrackData.putString("trackId", localAudioTrack?.trackId)
      localAudioTrackData.putString("source", localAudioTrack?.source)
      localAudioTrackData.putString("trackDescription", localAudioTrack?.description)
      localAudioTrackData.putMap("settings", getHmsAudioTrackSettings(localAudioTrack?.settings))
      if (localAudioTrack != null) {
        localAudioTrackData.putBoolean("isMute", localAudioTrack.isMute)
      }
      peer.putMap("localAudioTrackData", localAudioTrackData)

      val localVideoTrack = hmsLocalPeer.videoTrack
      var localVideoTrackData: WritableMap = Arguments.createMap()
      localVideoTrackData.putString("trackId", localVideoTrack?.trackId)
      localVideoTrackData.putString("source", localVideoTrack?.source)
      localVideoTrackData.putString("trackDescription", localVideoTrack?.description)
      localVideoTrackData.putMap("settings", getHmsVideoTrackSettings(localVideoTrack?.settings))
      if (localVideoTrack != null) {
        localVideoTrackData.putBoolean("isMute", localVideoTrack.isMute)
      }
      peer.putMap("localVideoTrackData", localVideoTrackData)
    }
    return peer
  }

  fun getHmsAudioTrackSettings(hmsAudioTrackSettings: HMSAudioTrackSettings?): WritableMap {
    val settings: WritableMap = Arguments.createMap()
    if (hmsAudioTrackSettings != null) {
      settings.putInt("maxBitrate", hmsAudioTrackSettings.maxBitrate)
      //        settings.putString("trackDescription", hmsAudioTrackSettings.trackDescription);
      settings.putString("trackDescription", "")
    }
    return settings
  }

  fun getHmsVideoTrackSettings(hmsVideoTrackSettings: HMSVideoTrackSettings?): WritableMap {
    val settings: WritableMap = Arguments.createMap()
    if (hmsVideoTrackSettings != null) {
      settings.putInt("codec", hmsVideoTrackSettings.codec.ordinal)

      val resolution: WritableMap = Arguments.createMap()
      resolution.putInt("height", hmsVideoTrackSettings.resolution.height)
      resolution.putInt("width", hmsVideoTrackSettings.resolution.width)
      settings.putMap("resolution", resolution)

      settings.putInt("maxBitrate", hmsVideoTrackSettings.maxBitRate)
      settings.putInt("maxFrameRate", hmsVideoTrackSettings.maxFrameRate)
      settings.putInt("cameraFacing", hmsVideoTrackSettings.cameraFacing.ordinal)
      //        settings.putString("trackDescription",
      // if(hmsVideoTrackSettings.trackDescription!==null)hmsVideoTrackSettings.trackDescription
      // else "");
      settings.putString("trackDescription", "")
    }
    return settings
  }

  fun getHmsRemotePeers(remotePeers: Array<HMSRemotePeer>?): WritableArray {
    val peers: WritableArray = Arguments.createArray()
    if (remotePeers != null) {
      for (peer in remotePeers) {
        peers.pushMap(getHmsRemotePeer(peer))
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
      peer.putString(
          "customerUserID",
          if (hmsRemotePeer.customerUserID != null) hmsRemotePeer.customerUserID else ""
      )
      peer.putString(
          "customerDescription",
          if (hmsRemotePeer.customerDescription != null) hmsRemotePeer.customerDescription else ""
      )
      peer.putMap("audioTrack", getHmsAudioTrack(hmsRemotePeer.audioTrack))
      peer.putMap("videoTrack", getHmsVideoTrack(hmsRemotePeer.videoTrack))
      peer.putMap("role", getHmsRole(hmsRemotePeer.hmsRole))

      var auxiliaryTracks: WritableArray = Arguments.createArray()
      for (track in hmsRemotePeer.auxiliaryTracks) {
        auxiliaryTracks.pushMap(getHmsTrack(track))
      }
      peer.putArray("auxiliaryTracks", auxiliaryTracks)

      val remoteAudioTrack = hmsRemotePeer.audioTrack
      var remoteAudioTrackData: WritableMap = Arguments.createMap()
      remoteAudioTrackData.putString("trackId", remoteAudioTrack?.trackId)
      remoteAudioTrackData.putString("source", remoteAudioTrack?.source)
      remoteAudioTrackData.putString("trackDescription", remoteAudioTrack?.description)
      if (remoteAudioTrack != null) {
        remoteAudioTrackData.putBoolean("playbackAllowed", remoteAudioTrack.isPlaybackAllowed)
        remoteAudioTrackData.putBoolean("isMute", remoteAudioTrack.isMute)
      }
      //        remoteAudioTrackData.putMap("settings",
      // getHmsAudioTrackSettings(remoteAudioTrack.settings));
      remoteAudioTrackData.putMap("settings", null)
      peer.putMap("remoteAudioTrackData", remoteAudioTrackData)

      val remoteVideoTrack = hmsRemotePeer.videoTrack
      var remoteVideoTrackData: WritableMap = Arguments.createMap()
      remoteVideoTrackData.putString("trackId", remoteVideoTrack?.trackId)
      remoteVideoTrackData.putString("source", remoteVideoTrack?.source)
      remoteVideoTrackData.putString("trackDescription", remoteVideoTrack?.description)
      if (remoteVideoTrack != null) {
        remoteVideoTrackData.putBoolean("playbackAllowed", remoteVideoTrack.isPlaybackAllowed)
        remoteVideoTrackData.putBoolean("isMute", remoteVideoTrack.isMute)
      }
      //        remoteVideoTrackData.putMap("settings",
      // getHmsVideoTrackSettings(remoteVideoTrack.settings));
      remoteVideoTrackData.putMap("settings", null)
      peer.putMap("remoteVideoTrackData", remoteVideoTrackData)
    }
    return peer
  }

  fun getPreviewTracks(tracks: Array<HMSTrack>?): WritableMap {
    val hmsTracks: WritableMap = Arguments.createMap()
    if (tracks != null) {
      for (track: HMSTrack in tracks) {
        if (track is HMSLocalVideoTrack) {
          val localVideoTrackData: WritableMap = Arguments.createMap()
          localVideoTrackData.putString("trackId", track.trackId)
          localVideoTrackData.putString("source", track.source)
          localVideoTrackData.putString("trackDescription", track.description)
          localVideoTrackData.putMap("settings", getHmsVideoTrackSettings(track.settings))
          hmsTracks.putMap("videoTrack", localVideoTrackData)
        }
        if (track is HMSLocalAudioTrack) {
          val localAudioTrackData: WritableMap = Arguments.createMap()
          localAudioTrackData.putString("trackId", track.trackId)
          localAudioTrackData.putString("source", track.source)
          localAudioTrackData.putMap("settings", getHmsAudioTrackSettings(track.settings))
          hmsTracks.putMap("audioTrack", localAudioTrackData)
        }
      }
    }
    return hmsTracks
  }

  fun getHmsRoleChangeRequest(request: HMSRoleChangeRequest, id: String?): WritableMap {
    val roleChangeRequest: WritableMap = Arguments.createMap()
    if (id != null) {
      roleChangeRequest.putMap("requestedBy", getHmsPeer(request.requestedBy))
      roleChangeRequest.putMap("suggestedRole", getHmsRole(request.suggestedRole))
      roleChangeRequest.putString("id", id)
      return roleChangeRequest
    }
    return roleChangeRequest
  }

  fun getHmsChangeTrackStateRequest(request: HMSChangeTrackStateRequest): WritableMap {
    val changeTrackStateRequest: WritableMap = Arguments.createMap()

    changeTrackStateRequest.putMap("requestedBy", getHmsPeer(request.requestedBy))
    changeTrackStateRequest.putString("trackType", request.track.type.name)

    return changeTrackStateRequest
  }

  fun getError(error: HMSException): WritableMap {
    val decodedError: WritableMap = Arguments.createMap()

    decodedError.putInt("code", error.code)
    decodedError.putString("localizedDescription", error.localizedMessage)
    decodedError.putString("description", error.description)
    decodedError.putString("message", error.message)
    decodedError.putString("name", error.name)
    decodedError.putString("action", error.action)

    return decodedError
  }
}
