package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import live.hms.video.media.codec.HMSAudioCodec
import live.hms.video.media.codec.HMSVideoCodec
import live.hms.video.media.settings.HMSAudioTrackSettings
import live.hms.video.media.settings.HMSTrackSettings
import live.hms.video.media.settings.HMSVideoResolution
import live.hms.video.media.settings.HMSVideoTrackSettings
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.*
import live.hms.video.utils.HmsUtilities

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
          "Array" -> {
            if (map.getArray(key) == null) {
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

  fun getPeerFromPeerId(peerId: String?, room: HMSRoom?): HMSPeer? {
    if (peerId != null && room != null) {
      return HmsUtilities.getPeer(peerId, room)
    }
    return null
  }

  fun getRemotePeerFromPeerId(peerId: String?, room: HMSRoom?): HMSRemotePeer? {
    if (peerId != null && room != null) {
      return HmsUtilities.getPeer(peerId, room) as? HMSRemotePeer
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

  fun getRemoteAudioTrackFromTrackId(trackId: String?, room: HMSRoom?): HMSRemoteAudioTrack? {
    if (trackId != null && room != null) {
      return HmsUtilities.getAudioTrack(trackId, room) as? HMSRemoteAudioTrack
    }
    return null
  }

  fun getRemoteVideoTrackFromTrackId(trackId: String?, room: HMSRoom?): HMSRemoteVideoTrack? {
    if (trackId != null && room != null) {
      return HmsUtilities.getVideoTrack(trackId, room) as? HMSRemoteVideoTrack
    }
    return null
  }

  fun getTrackFromTrackId(trackId: String?, room: HMSRoom?): HMSTrack? {
    if (trackId != null && room != null) {
      HmsUtilities.getTrack(trackId, room)
    }
    return null
  }

  fun getTrackSettings(data: ReadableMap?): HMSTrackSettings? {
    if (data == null) {
      return null
    }

    var useHardwareEchoCancellation = false
    val requiredKeysUseHardwareEchoCancellation =
        this.areAllRequiredKeysAvailable(
            data,
            arrayOf(Pair("useHardwareEchoCancellation", "Boolean"))
        )
    if (requiredKeysUseHardwareEchoCancellation) {
      useHardwareEchoCancellation = data.getBoolean("useHardwareEchoCancellation")
    }

    var video: ReadableMap? = null
    val requiredKeysVideo = this.areAllRequiredKeysAvailable(data, arrayOf(Pair("video", "Map")))
    if (requiredKeysVideo) {
      video = data.getMap("video")
    }

    var audio: ReadableMap? = null
    val requiredKeysAudio = this.areAllRequiredKeysAvailable(data, arrayOf(Pair("audio", "Map")))
    if (requiredKeysAudio) {
      audio = data.getMap("audio")
    }

    if (video == null && audio == null && !useHardwareEchoCancellation) {
      return null
    }

    val videoSettings = this.getVideoTrackSettings(video)
    val audioSettings = this.getAudioTrackSettings(audio, useHardwareEchoCancellation)
    val trackSettingsBuilder = HMSTrackSettings.Builder()
    return trackSettingsBuilder.audio(audioSettings).video(videoSettings).build()
  }

  private fun getAudioTrackSettings(
      data: ReadableMap?,
      useHardwareEchoCancellation: Boolean
  ): HMSAudioTrackSettings {
    val builder =
        HMSAudioTrackSettings.Builder()
            .setUseHardwareAcousticEchoCanceler(useHardwareEchoCancellation)

    if (data != null) {
      val maxBitrate = data.getInt("maxBitrate")
      val codec = getAudioCodec(data.getString("codec"))

      builder.maxBitrate(maxBitrate)
      builder.codec(codec)
    }

    return builder.build()
  }

  // TODO: find out a way to set settings required to create HMSVideoTrackSettings

  private fun getVideoTrackSettings(data: ReadableMap?): HMSVideoTrackSettings {
    val builder = HMSVideoTrackSettings.Builder()
    if (data != null) {
      val codec = getVideoCodec(data.getString("codec"))
      val resolution = getVideoResolution(data.getMap("resolution"))
      val maxBitrate = data.getInt("maxBitrate")
      val maxFrameRate = data.getInt("maxFrameRate")
      val cameraFacing = getCameraFacing(data.getString("cameraFacing"))

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

  private fun getVideoResolution(map: ReadableMap?): HMSVideoResolution? {
    val width = map?.getDouble("width")
    val height = map?.getDouble("height")

    return if (width != null && height != null) {
      HMSVideoResolution(width = width.toInt(), height = height.toInt())
    } else {
      null
    }
  }

  private fun getAudioCodec(codecString: String?): HMSAudioCodec {
    when (codecString) {
      "opus" -> {
        return HMSAudioCodec.OPUS
      }
    }
    return HMSAudioCodec.OPUS
  }

  private fun getVideoCodec(codecString: String?): HMSVideoCodec {
    when (codecString) {
      "H264" -> {
        return HMSVideoCodec.H264
      }
      "VP8" -> {
        return HMSVideoCodec.VP8
      }
      "VP9" -> {
        return HMSVideoCodec.VP9
      }
    }
    return HMSVideoCodec.H264
  }

  private fun getCameraFacing(cameraFacing: String?): HMSVideoTrackSettings.CameraFacing {
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

    return if (id != null) {
      hmsCollection[id]
    } else {
      null
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

  fun getHMSHLSMeetingURLVariants(
      hmsMeetingURLVariants: ArrayList<HashMap<String, String>>?
  ): List<HMSHLSMeetingURLVariant> {
    val meetingURLVariants = mutableListOf<HMSHLSMeetingURLVariant>()
    if (hmsMeetingURLVariants !== null) {
      for (variant in hmsMeetingURLVariants) {
        val meetingURLVariant = this.getHMSHLSMeetingURLVariant(variant)
        meetingURLVariants.add(meetingURLVariant)
      }
    }
    return meetingURLVariants
  }

  private fun getHMSHLSMeetingURLVariant(
      hmsMeetingURLVariant: HashMap<String, String>?
  ): HMSHLSMeetingURLVariant {
    var meetingURLVariant = HMSHLSMeetingURLVariant("", "")
    if (hmsMeetingURLVariant !== null) {
      val meetingUrl = hmsMeetingURLVariant["meetingUrl"] as String
      val metadata = hmsMeetingURLVariant["metadata"] as String
      meetingURLVariant = HMSHLSMeetingURLVariant(meetingUrl, metadata)
    }
    return meetingURLVariant
  }
}
