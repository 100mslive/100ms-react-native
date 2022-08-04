package com.reactnativehmssdk

import android.content.Context
import android.graphics.Bitmap
import android.os.Build
import android.os.Handler
import android.util.Base64
import android.util.Log
import android.view.PixelCopy
import android.webkit.URLUtil
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.io.ByteArrayOutputStream
import java.util.*
import live.hms.video.error.HMSException
import live.hms.video.media.codec.HMSAudioCodec
import live.hms.video.media.codec.HMSVideoCodec
import live.hms.video.media.settings.*
import live.hms.video.media.tracks.HMSRemoteAudioTrack
import live.hms.video.media.tracks.HMSRemoteVideoTrack
import live.hms.video.media.tracks.HMSTrack
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.enums.AudioMixingMode
import live.hms.video.sdk.models.role.HMSRole
import live.hms.video.utils.HmsUtilities
import org.webrtc.SurfaceViewRenderer

object HMSHelper {

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

  fun getUnavailableRequiredKey(
      map: ReadableMap?,
      requiredKeys: Array<Pair<String, String>>
  ): String? {
    if (map == null) {
      return "Object_Is_Null"
    }
    for ((key, value) in requiredKeys) {
      if (map.hasKey(key)) {
        when (value) {
          "String" -> {
            if (map.getString(key) == null) {
              return key + "_Is_Null"
            }
          }
          "Array" -> {
            if (map.getArray(key) == null) {
              return key + "_Is_Null"
            }
          }
          "Map" -> {
            if (map.getMap(key) == null) {
              return key + "_Is_Null"
            }
          }
        }
      } else {
        return key + "_Is_Required"
      }
    }
    return null
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
      return HmsUtilities.getTrack(trackId, room)
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

  fun getAudioMixingMode(audioMixingMode: String?): AudioMixingMode {
    when (audioMixingMode) {
      "TALK_ONLY" -> {
        return AudioMixingMode.TALK_ONLY
      }
      "MUSIC_ONLY" -> {
        return AudioMixingMode.MUSIC_ONLY
      }
      "TALK_AND_MUSIC" -> {
        return AudioMixingMode.TALK_AND_MUSIC
      }
    }
    return AudioMixingMode.TALK_AND_MUSIC
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

  fun getHms(credentials: ReadableMap, hmsCollection: MutableMap<String, HMSRNSDK>): HMSRNSDK? {
    val id = credentials.getString("id")

    return if (id != null) {
      hmsCollection[id]
    } else {
      null
    }
  }

  private fun getRtmpUrls(rtmpURLsList: ReadableArray?): List<String> {
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

  fun getHlsRecordingConfig(data: ReadableMap): HMSHlsRecordingConfig? {
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("hlsRecordingConfig", "Map")))) {
      val hmsHlsRecordingConfig = data.getMap("hlsRecordingConfig")
      if (hmsHlsRecordingConfig != null) {
        var singleFilePerLayer = false
        var videoOnDemand = false
        if (areAllRequiredKeysAvailable(
                hmsHlsRecordingConfig,
                arrayOf(Pair("singleFilePerLayer", "Boolean"))
            )
        ) {
          singleFilePerLayer = hmsHlsRecordingConfig.getBoolean("singleFilePerLayer")
        }
        if (areAllRequiredKeysAvailable(
                hmsHlsRecordingConfig,
                arrayOf(Pair("videoOnDemand", "Boolean"))
            )
        ) {
          videoOnDemand = hmsHlsRecordingConfig.getBoolean("videoOnDemand")
        }
        return HMSHlsRecordingConfig(singleFilePerLayer, videoOnDemand)
      }
    }
    return null
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

  private fun getResolution(data: ReadableMap): HMSRtmpVideoResolution {
    val height = data.getInt("height")
    val width = data.getInt("width")
    return HMSRtmpVideoResolution(width, height)
  }

  fun getRtmpConfig(data: ReadableMap): HMSRecordingConfig? {
    val record = data.getBoolean("record")
    var meetingURL = ""
    var rtmpURLs = listOf<String>()
    var resolution: HMSRtmpVideoResolution? = null
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("meetingURL", "String")))) {
      val meetingURLValid = data.getString("meetingURL") as String
      if (URLUtil.isValidUrl(meetingURLValid)) {
        meetingURL = meetingURLValid
      } else {
        return null
      }
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("rtmpURLs", "Array")))) {
      val rtmpURLsValid = data.getArray("rtmpURLs")
      rtmpURLs = this.getRtmpUrls(rtmpURLsValid)
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("resolution", "Map")))) {
      val resolutionValid = data.getMap("resolution")
      resolution = resolutionValid?.let { this.getResolution(it) }
    }
    return HMSRecordingConfig(meetingURL, rtmpURLs, record, resolution)
  }

  fun getHmsConfig(credentials: ReadableMap): HMSConfig {
    var config =
        HMSConfig(
            credentials.getString("username") as String,
            credentials.getString("authToken") as String,
        )

    when {
      areAllRequiredKeysAvailable(
          credentials,
          arrayOf(
              Pair("endpoint", "String"),
              Pair("metadata", "String"),
              Pair("captureNetworkQualityInPreview", "Boolean")
          )
      ) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                initEndpoint = credentials.getString("endpoint") as String,
                metadata = credentials.getString("metadata") as String,
                captureNetworkQualityInPreview =
                    credentials.getBoolean("captureNetworkQualityInPreview"),
            )
      }
      areAllRequiredKeysAvailable(
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
      areAllRequiredKeysAvailable(
          credentials,
          arrayOf(Pair("endpoint", "String"), Pair("captureNetworkQualityInPreview", "Boolean"))
      ) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                initEndpoint = credentials.getString("endpoint") as String,
                captureNetworkQualityInPreview =
                    credentials.getBoolean("captureNetworkQualityInPreview"),
            )
      }
      areAllRequiredKeysAvailable(
          credentials,
          arrayOf(Pair("metadata", "String"), Pair("captureNetworkQualityInPreview", "Boolean"))
      ) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                metadata = credentials.getString("metadata") as String,
                captureNetworkQualityInPreview =
                    credentials.getBoolean("captureNetworkQualityInPreview"),
            )
      }
      areAllRequiredKeysAvailable(credentials, arrayOf(Pair("endpoint", "String"))) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                initEndpoint = credentials.getString("endpoint") as String,
            )
      }
      areAllRequiredKeysAvailable(credentials, arrayOf(Pair("metadata", "String"))) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                metadata = credentials.getString("metadata") as String,
            )
      }
      areAllRequiredKeysAvailable(
          credentials,
          arrayOf(Pair("captureNetworkQualityInPreview", "Boolean"))
      ) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                captureNetworkQualityInPreview =
                    credentials.getBoolean("captureNetworkQualityInPreview")
            )
      }
    }
    return config
  }

  @RequiresApi(Build.VERSION_CODES.N)
  fun captureSurfaceView(
      surfaceView: SurfaceViewRenderer,
      sdkId: String,
      args: ReadableArray?,
      context: Context,
      id: Int
  ) {
    val output = Arguments.createMap()
    if (args != null) {
      output.putInt("requestId", args.getInt(0))
    } else {
      output.putInt("requestId", -1)
    }
    val reactContext = context as ReactContext
    try {
      val bitmap: Bitmap =
          Bitmap.createBitmap(surfaceView.width, surfaceView.height, Bitmap.Config.ARGB_8888)
      PixelCopy.request(
          surfaceView,
          bitmap,
          { copyResult ->
            if (copyResult == PixelCopy.SUCCESS) {
              Log.d("captureSurfaceView", "bitmap: $bitmap")
              val byteArrayOutputStream = ByteArrayOutputStream()
              bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
              val byteArray = byteArrayOutputStream.toByteArray()
              val encoded: String = Base64.encodeToString(byteArray, Base64.DEFAULT)
              Log.d("captureSurfaceView", "Base64: $encoded")
              output.putString("result", encoded)
              reactContext
                  .getJSModule(RCTEventEmitter::class.java)
                  .receiveEvent(id, "captureFrame", output)
            } else {
              Log.e("captureSurfaceView", "copyResult: $copyResult")
              HMSManager.hmsCollection[sdkId]?.emitHMSError(
                  HMSException(
                      103,
                      copyResult.toString(),
                      copyResult.toString(),
                      copyResult.toString(),
                      copyResult.toString()
                  )
              )
              output.putString("error", copyResult.toString())
              reactContext
                  .getJSModule(RCTEventEmitter::class.java)
                  .receiveEvent(id, "captureFrame", output)
            }
          },
          Handler()
      )
    } catch (e: Exception) {
      Log.e("captureSurfaceView", "error: $e")
      HMSManager.hmsCollection[sdkId]?.emitHMSError(e as HMSException)
      output.putString("error", e.message)
      reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "captureFrame", output)
    }
  }
}
