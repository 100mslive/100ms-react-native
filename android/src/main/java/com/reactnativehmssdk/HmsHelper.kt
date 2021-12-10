package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import live.hms.video.media.codec.HMSAudioCodec
import live.hms.video.media.codec.HMSVideoCodec
import live.hms.video.media.settings.HMSAudioTrackSettings
import live.hms.video.media.settings.HMSVideoResolution
import live.hms.video.media.settings.HMSVideoTrackSettings
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.*

object HmsHelper {

  fun areAllRequiredKeysAvailable(
      map: ReadableMap?,
      requiredKeys: Array<Pair<String, String>>
  ): Boolean {
    if (map == null) {
      return false
    }
    for ((key, value) in requiredKeys) {
      if (map.hasKey(key)) {
        when (value) {
          "String" -> {
            if (map.getString(key) == null) {
              return false
            }
          }
          "Float" -> {
            if (map.getDouble(key) == null) {
              return false
            }
          }
          "Boolean" -> {
            if (map.getBoolean(key) == null) {
              return false
            }
          }
          "Array" -> {
            if (map.getArray(key) == null) {
              return false
            }
          }
          "Int" -> {
            if (map.getInt(key) == null) {
              return false
            }
          }
          "Map" -> {
            if (map.getMap(key) == null) {
              return false
            }
          }
        }
      } else {
        return false
      }
    }
    return true
  }

  fun getPeerFromPeerId(peerId: String?, peers: Array<HMSPeer>?): HMSPeer? {
    if (peerId != null && peers != null) {
      for (peer in peers) {
        if (peerId == peer.peerID) {
          return peer
        }
      }
    }
    return null
  }

  fun getRemotePeerFromPeerId(peerId: String?, peers: Array<HMSRemotePeer>?): HMSRemotePeer? {
    if (peerId != null && peers != null) {
      for (peer in peers) {
        if (peerId == peer.peerID) {
          return peer
        }
      }
    }
    return null
  }

  fun getRolesFromRoleNames(
      targetedRoles: ArrayList<String>?,
      roles: List<HMSRole>?
  ): List<HMSRole> {
    val encodedRoles: MutableList<HMSRole> = mutableListOf()

    if (targetedRoles != null && roles != null) {
      for (role in roles) {
        for (targetedRole in targetedRoles) {
          if (targetedRole == role.name) {
            encodedRoles.add(role)
          }
        }
      }
    }
    return encodedRoles.toList()
  }

  fun getRoleFromRoleName(role: String?, roles: List<HMSRole>?): HMSRole? {
    if (role != null && roles != null) {
      for (hmsRole in roles) {
        if (role == hmsRole.name) {
          return hmsRole
        }
      }
    }
    return null
  }

  fun getRemoteAudioTrackFromTrackId(
      trackId: String?,
      remotePeers: Array<HMSRemotePeer>?
  ): HMSRemoteAudioTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.audioTrack?.trackId == trackId) {
          return remotePeer.audioTrack as HMSRemoteAudioTrack
        }
      }
    }
    return null
  }

  fun getRemoteVideoTrackFromTrackId(
      trackId: String?,
      remotePeers: Array<HMSRemotePeer>?
  ): HMSRemoteVideoTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.videoTrack?.trackId == trackId) {
          return remotePeer.videoTrack as HMSRemoteVideoTrack
        }
      }
    }
    return null
  }

  fun getTrackFromTrackId(trackId: String?, remotePeers: Array<HMSRemotePeer>?): HMSTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.audioTrack?.trackId == trackId) {
          return remotePeer.audioTrack as HMSTrack
        }

        if (remotePeer.videoTrack?.trackId == trackId) {
          return remotePeer.videoTrack as HMSTrack
        }
      }
    }
    return null
  }

  fun getLocalTrackFromTrackId(trackId: String?, localPeer: HMSLocalPeer?): HMSTrack? {
    if (trackId != null && localPeer != null) {
      if (localPeer.audioTrack?.trackId == trackId) {
        return localPeer.audioTrack as HMSTrack
      }

      if (localPeer.videoTrack?.trackId == trackId) {
        return localPeer.videoTrack as HMSTrack
      }

      for (auxTrack in localPeer.auxiliaryTracks) {
        if (auxTrack.trackId == trackId) {
          return auxTrack
        }
      }
    }
    return null
  }

  fun getAudioTrackSettings(data: ReadableMap?): HMSAudioTrackSettings {
    val builder = HMSAudioTrackSettings.Builder()

    if (data != null) {
      val maxBitrate = data.getInt("maxBitrate")
      val codec = getAudioCodec(data.getString("codec"))
      val trackDescription = data.getString("trackDescription")

      builder.maxBitrate(maxBitrate)
      builder.codec(codec)
    }

    return builder.build()
  }

  // TODO: find out a way to set settings required to create HMSVideTrackSettings

  fun getVideoTrackSettings(data: ReadableMap?): HMSVideoTrackSettings {
    val builder = HMSVideoTrackSettings.Builder()
    if (data != null) {
      val codec = getVideoCodec(data.getString("codec"))
      val resolution = getVideoResolution(data.getMap("resolution"))
      val maxBitrate = data.getInt("maxBitrate")
      val maxFrameRate = data.getInt("maxFrameRate")
      val cameraFacing = getCameraFacing(data.getString("cameraFacing"))
      val trackDescription = data.getString("trackDescription")

      builder.codec(codec)
      builder.cameraFacing(cameraFacing)
      if (resolution != null) {
        builder.resolution(resolution)
      }
      builder.maxBitrate(maxBitrate)
      builder.maxFrameRate(maxFrameRate)
    }
    return builder.build()
  }

  fun getVideoResolution(map: ReadableMap?): HMSVideoResolution? {
    val width = map?.getDouble("width")
    val height = map?.getDouble("height")

    return if (width != null && height != null) {
      HMSVideoResolution(width = width.toInt(), height = height.toInt())
    } else {
      null
    }
  }

  fun getAudioCodec(codecString: String?): HMSAudioCodec {
    when (codecString) {
      "opus" -> {
        return HMSAudioCodec.OPUS
      }
    }
    return HMSAudioCodec.OPUS
  }

  fun getVideoCodec(codecString: String?): HMSVideoCodec {
    when (codecString) {
      "h264" -> {
        return HMSVideoCodec.H264
      }
      "vp8" -> {
        return HMSVideoCodec.VP8
      }
      "vp9" -> {
        return HMSVideoCodec.VP9
      }
    }
    return HMSVideoCodec.H264
  }

  fun getCameraFacing(cameraFacing: String?): HMSVideoTrackSettings.CameraFacing {
    when (cameraFacing) {
      "FRONT" -> {
        return HMSVideoTrackSettings.CameraFacing.FRONT
      }
      "BACK" -> {
        return HMSVideoTrackSettings.CameraFacing.BACK
      }
    }
    return HMSVideoTrackSettings.CameraFacing.FRONT
  }

  fun getHms(credentials: ReadableMap, hmsCollection: MutableMap<String, HmsSDK>): HmsSDK? {
    val id = credentials.getString("id")

    if (id != null) {
      return hmsCollection[id]
    } else {
      return null
    }
  }

  fun getRtmpUrls(rtmpURLsList: ReadableArray?): List<String> {
    val rtmpURLs = mutableListOf<String>()
    if (rtmpURLsList !== null) {
      for (rtmpURL in rtmpURLsList.toArrayList()) {
        rtmpURLs.add(rtmpURL as String)
      }
    }
    return rtmpURLs
  }
}
