package com.reactnativehmssdk

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaScannerConnection
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.util.Log
import android.view.PixelCopy
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import live.hms.video.error.HMSException
import live.hms.video.media.codec.HMSAudioCodec
import live.hms.video.media.codec.HMSVideoCodec
import live.hms.video.media.settings.HMSAudioTrackSettings
import live.hms.video.media.settings.HMSTrackSettings
import live.hms.video.media.settings.HMSVideoResolution
import live.hms.video.media.settings.HMSVideoTrackSettings
import live.hms.video.media.tracks.HMSRemoteAudioTrack
import live.hms.video.media.tracks.HMSRemoteVideoTrack
import live.hms.video.media.tracks.HMSTrack
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.HMSRole
import live.hms.video.utils.HmsUtilities
import org.webrtc.SurfaceViewRenderer
import java.io.File
import java.io.FileOutputStream
import java.util.*

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
            data, arrayOf(Pair("useHardwareEchoCancellation", "Boolean")))
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

  fun getHlsRecordingConfig(data: ReadableMap): HMSHlsRecordingConfig? {
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("hlsRecordingConfig", "Map")))) {
      val hmsHlsRecordingConfig = data.getMap("hlsRecordingConfig")
      if (hmsHlsRecordingConfig != null) {
        var singleFilePerLayer = false
        var videoOnDemand = false
        if (areAllRequiredKeysAvailable(
            hmsHlsRecordingConfig, arrayOf(Pair("singleFilePerLayer", "Boolean")))) {
          singleFilePerLayer = hmsHlsRecordingConfig.getBoolean("singleFilePerLayer")
        }
        if (areAllRequiredKeysAvailable(
            hmsHlsRecordingConfig, arrayOf(Pair("videoOnDemand", "Boolean")))) {
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
              Pair("captureNetworkQualityInPreview", "Boolean"))) -> {
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
          credentials, arrayOf(Pair("endpoint", "String"), Pair("metadata", "String"))) -> {
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
          arrayOf(
              Pair("endpoint", "String"), Pair("captureNetworkQualityInPreview", "Boolean"))) -> {
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
          arrayOf(
              Pair("metadata", "String"), Pair("captureNetworkQualityInPreview", "Boolean"))) -> {
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
          credentials, arrayOf(Pair("captureNetworkQualityInPreview", "Boolean"))) -> {
        config =
            HMSConfig(
                credentials.getString("username") as String,
                credentials.getString("authToken") as String,
                captureNetworkQualityInPreview =
                    credentials.getBoolean("captureNetworkQualityInPreview"))
      }
    }
    return config
  }

  @RequiresApi(Build.VERSION_CODES.N)
  fun captureSurfaceView(surfaceView: SurfaceViewRenderer, context: Context, id: String?) {
    try {
      val bitmap: Bitmap =
        Bitmap.createBitmap(surfaceView.width, surfaceView.height, Bitmap.Config.ARGB_8888)
      PixelCopy.request(
        surfaceView,
        bitmap,
        { copyResult ->
          if (copyResult === PixelCopy.SUCCESS) {
            Log.d("captureSurfaceView", "bitmap: $bitmap")
            saveImage(bitmap, context, id)
          } else {
            HmsModule.hmsCollection[id]?.emitHMSError(
              HMSException(
                103,
                copyResult.toString(),
                copyResult.toString(),
                copyResult.toString(),
                copyResult.toString()
              )
            )
            Log.e("captureSurfaceView", "copyResult: $copyResult")
          }
        },
        Handler()
      )
    } catch (e: Exception) {
      Log.e("captureSurfaceView", "error: $e")
    }
  }

  private fun saveImage(finalBitmap: Bitmap, context: Context, id: String?) {
    val folder = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM)
    if (!folder.exists()) {
      folder.mkdir()
    }
    val generator = Random()
    var n = 10000
    n = generator.nextInt(n)
    val fileName = "Image-$n.jpg"
    val file = File(folder.absolutePath, fileName)
    if (file.exists()) file.delete()
    try {
      val out = FileOutputStream(file)
      finalBitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
      out.flush()
      out.close()
    } catch (e: Exception) {
      HmsModule.hmsCollection[id]?.emitHMSError(
        HMSException(
          103,
          e.message.toString(),
          e.message.toString(),
          e.message.toString(),
          e.message.toString()
        )
      )
      Log.e("saveImage", "error: $e")
    }
    // Tell the media scanner about the new file so that it is
    // immediately available to the user.
    MediaScannerConnection.scanFile(context, arrayOf(file.toString()), null) { path, uri ->
      Log.i("ExternalStorage", "Scanned $path:")
      Log.i("ExternalStorage", "-> uri=$uri")
    }
  }
}
