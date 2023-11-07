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
import com.facebook.react.uimanager.events.RCTEventEmitter
import live.hms.video.audio.HMSAudioManager
import live.hms.video.error.HMSException
import live.hms.video.events.AgentType
import live.hms.video.media.settings.*
import live.hms.video.media.tracks.HMSRemoteAudioTrack
import live.hms.video.media.tracks.HMSRemoteVideoTrack
import live.hms.video.media.tracks.HMSTrack
import live.hms.video.sdk.HMSSDK
import live.hms.video.sdk.listeners.PeerListResultListener
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.enums.AudioMixingMode
import live.hms.video.sdk.models.role.HMSRole
import live.hms.video.services.LogAlarmManager
import live.hms.video.utils.HMSLogger
import live.hms.video.utils.HmsUtilities
import org.webrtc.SurfaceViewRenderer
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.collections.ArrayList
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

object HMSHelper {
  fun areAllRequiredKeysAvailable(
    map: ReadableMap?,
    requiredKeys: Array<Pair<String, String>>,
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
    requiredKeys: Array<Pair<String, String>>,
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

  fun getPeerFromPeerId(
    peerId: String?,
    room: HMSRoom?,
  ): HMSPeer? {
    if (peerId != null && room != null) {
      return HmsUtilities.getPeer(peerId, room)
    }
    return null
  }

  suspend fun getRemotePeerFromPeerId(
    peerId: String?,
    hmsSDK: HMSSDK?,
  ): HMSRemotePeer? {
    return suspendCoroutine {
      val room = hmsSDK?.getRoom()

      if (peerId != null && room != null) {
        val peerFromRoom = HmsUtilities.getPeer(peerId, room) as? HMSRemotePeer
        if (peerFromRoom != null) {
          it.resume(peerFromRoom)
        } else {
          val limit = 1
          val peerIds = arrayListOf(peerId)
          val peerListIterator = hmsSDK.getPeerListIterator(PeerListIteratorOptions(limit = limit, byPeerIds = peerIds))
          peerListIterator.next(object : PeerListResultListener {
            override fun onError(error: HMSException) {
              it.resumeWithException(error)
            }
            override fun onSuccess(result: ArrayList<HMSPeer>) {
              val peerFromIterator = result[0]
              it.resume(peerFromIterator as? HMSRemotePeer)
            }
          })
        }
      } else {
        it.resume(null)
      }
    }
  }

  fun getRolesFromRoleNames(
    targetedRoles: ArrayList<String>?,
    roles: List<HMSRole>?,
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

  fun getRoleFromRoleName(
    role: String?,
    roles: List<HMSRole>?,
  ): HMSRole? {
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
    room: HMSRoom?,
  ): HMSRemoteAudioTrack? {
    if (trackId != null && room != null) {
      return HmsUtilities.getAudioTrack(trackId, room) as? HMSRemoteAudioTrack
    }
    return null
  }

  fun getRemoteVideoTrackFromTrackId(
    trackId: String?,
    room: HMSRoom?,
  ): HMSRemoteVideoTrack? {
    if (trackId != null && room != null) {
      return HmsUtilities.getVideoTrack(trackId, room) as? HMSRemoteVideoTrack
    }
    return null
  }

  fun getTrackFromTrackId(
    trackId: String?,
    room: HMSRoom?,
  ): HMSTrack? {
    if (trackId != null && room != null) {
      return HmsUtilities.getTrack(trackId, room)
    }
    return null
  }

  fun getFrameworkInfo(data: ReadableMap?): FrameworkInfo? {
    if (data != null &&
      this.areAllRequiredKeysAvailable(
        data,
        arrayOf(Pair("version", "String"), Pair("sdkVersion", "String")),
      )
    ) {
      val version = data.getString("version") as String
      val sdkVersion = data.getString("sdkVersion") as String
      val isPrebuilt = data.getBoolean("isPrebuilt")
      return FrameworkInfo(AgentType.REACT_NATIVE, sdkVersion, version, isPrebuilt)
    }
    return null
  }

  fun getLogSettings(data: ReadableMap?): HMSLogSettings? {
    if (data != null &&
      this.areAllRequiredKeysAvailable(
        data,
        arrayOf(
          Pair("level", "String"),
          Pair("maxDirSizeInBytes", "String"),
          Pair("isLogStorageEnabled", "Boolean"),
        ),
      )
    ) {
      val level = getLogLevel(data.getString("level"))
      val maxDirSizeInBytes = getLogAlarmManager(data.getString("maxDirSizeInBytes"))
      val isLogStorageEnabled = data.getBoolean("isLogStorageEnabled")
      return HMSLogSettings(maxDirSizeInBytes, isLogStorageEnabled, level)
    }
    return null
  }

  private fun getLogAlarmManager(logAlarmManager: String?): Long {
    when (logAlarmManager) {
      "DEFAULT_DIR_SIZE" -> {
        return LogAlarmManager.DEFAULT_DIR_SIZE
      }
      "DEFAULT_LOGS_FILE_NAME" -> {
        return LogAlarmManager.DEFAULT_LOGS_FILE_NAME.toLong()
      }
      "MAX_DIR_SIZE" -> {
        return LogAlarmManager.MAX_DIR_SIZE.toLong()
      }
    }
    return LogAlarmManager.DEFAULT_DIR_SIZE
  }

  private fun getLogLevel(logLevel: String?): HMSLogger.LogLevel {
    when (logLevel) {
      "VERBOSE" -> {
        return HMSLogger.LogLevel.VERBOSE
      }
      "WARN" -> {
        return HMSLogger.LogLevel.WARN
      }
      "ERROR" -> {
        return HMSLogger.LogLevel.ERROR
      }
    }
    return HMSLogger.LogLevel.VERBOSE
  }

  fun getTrackSettings(data: ReadableMap?): HMSTrackSettings? {
    if (data == null) {
      return null
    }
    val builder = HMSTrackSettings.Builder()
    if (this.areAllRequiredKeysAvailable(data, arrayOf(Pair("video", "Map")))) {
      val video = data.getMap("video")
      val videoSettings = this.getVideoTrackSettings(video)
      if (videoSettings != null) {
        builder.video(videoSettings)
      }
    }

    if (this.areAllRequiredKeysAvailable(data, arrayOf(Pair("audio", "Map")))) {
      val audio = data.getMap("audio")
      val audioSettings = this.getAudioTrackSettings(audio)
      if (audioSettings != null) {
        builder.audio(audioSettings)
      }
    }
    return builder.build()
  }

  private fun getAudioTrackSettings(data: ReadableMap?): HMSAudioTrackSettings? {
    if (data == null) {
      return null
    }

    val builder = HMSAudioTrackSettings.Builder()
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("useHardwareEchoCancellation", "Boolean")))
    ) {
      val useHardwareEchoCancellation = data.getBoolean("useHardwareEchoCancellation")
      builder.setUseHardwareAcousticEchoCanceler(useHardwareEchoCancellation)
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("initialState", "String")))) {
      val initialState = getHMSTrackSettingsInitState(data.getString("initialState"))
      builder.initialState(initialState)
    }
    return builder.build()
  }

  private fun getVideoTrackSettings(data: ReadableMap?): HMSVideoTrackSettings? {
    if (data == null) {
      return null
    }
    val builder = HMSVideoTrackSettings.Builder()

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("cameraFacing", "String")))) {
      val cameraFacing = getCameraFacing(data.getString("cameraFacing"))
      builder.cameraFacing(cameraFacing)
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("disableAutoResize", "Boolean")))) {
      val disableAutoResize = data.getBoolean("disableAutoResize")
      builder.disableAutoResize(disableAutoResize)
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("initialState", "String")))) {
      val initialState = getHMSTrackSettingsInitState(data.getString("initialState"))
      builder.initialState(initialState)
    }

    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("forceSoftwareDecoder", "Boolean")))) {
      val forceSoftwareDecoder = data.getBoolean("forceSoftwareDecoder")
      builder.forceSoftwareDecoder(forceSoftwareDecoder)
    }
    return builder.build()
  }

  private fun getHMSTrackSettingsInitState(initState: String?): HMSTrackSettings.InitState {
    when (initState) {
      "UNMUTED" -> {
        return HMSTrackSettings.InitState.UNMUTED
      }
      "MUTED" -> {
        return HMSTrackSettings.InitState.MUTED
      }
    }
    return HMSTrackSettings.InitState.UNMUTED
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

  fun getHms(
    credentials: ReadableMap,
    hmsCollection: MutableMap<String, HMSRNSDK>,
  ): HMSRNSDK? {
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

  fun getHLSConfig(data: ReadableMap?): HMSHLSConfig? {
    if (data === null) {
      return data
    }
    var hlsMeetingUrlVariant: List<HMSHLSMeetingURLVariant>? = null
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("meetingURLVariants", "Array")))) {
      val meetingURLVariants =
        data.getArray("meetingURLVariants")?.toArrayList() as? ArrayList<HashMap<String, String>>
      hlsMeetingUrlVariant = getHMSHLSMeetingURLVariants(meetingURLVariants)
    }
    var hlsRecordingConfig: HMSHlsRecordingConfig? = null
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("hlsRecordingConfig", "Map")))) {
      val recordingConfig = data.getMap("hlsRecordingConfig")
      hlsRecordingConfig = getHlsRecordingConfig(recordingConfig)
    }
    return HMSHLSConfig(hlsMeetingUrlVariant, hlsRecordingConfig)
  }

  private fun getHMSHLSMeetingURLVariants(hmsMeetingURLVariants: ArrayList<HashMap<String, String>>?): List<HMSHLSMeetingURLVariant> {
    val meetingURLVariants = mutableListOf<HMSHLSMeetingURLVariant>()
    if (hmsMeetingURLVariants !== null) {
      for (variant in hmsMeetingURLVariants) {
        val meetingURLVariant = this.getHMSHLSMeetingURLVariant(variant)
        meetingURLVariants.add(meetingURLVariant)
      }
    }
    return meetingURLVariants
  }

  private fun getHlsRecordingConfig(hmsHlsRecordingConfig: ReadableMap?): HMSHlsRecordingConfig? {
    if (hmsHlsRecordingConfig !== null) {
      var singleFilePerLayer = false
      var videoOnDemand = false
      if (areAllRequiredKeysAvailable(
          hmsHlsRecordingConfig,
          arrayOf(Pair("singleFilePerLayer", "Boolean")),
        )
      ) {
        singleFilePerLayer = hmsHlsRecordingConfig.getBoolean("singleFilePerLayer")
      }
      if (areAllRequiredKeysAvailable(
          hmsHlsRecordingConfig,
          arrayOf(Pair("videoOnDemand", "Boolean")),
        )
      ) {
        videoOnDemand = hmsHlsRecordingConfig.getBoolean("videoOnDemand")
      }
      return HMSHlsRecordingConfig(singleFilePerLayer, videoOnDemand)
    }
    return null
  }

  private fun getHMSHLSMeetingURLVariant(hmsMeetingURLVariant: HashMap<String, String>?): HMSHLSMeetingURLVariant {
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
    var meetingURL: String? = null
    var rtmpURLs = listOf<String>()
    var resolution: HMSRtmpVideoResolution? = null
    if (areAllRequiredKeysAvailable(data, arrayOf(Pair("meetingURL", "String")))) {
      val meetingURLValid = data.getString("meetingURL") as String

      if (meetingURLValid.isNotEmpty()) {
        if (URLUtil.isValidUrl(meetingURLValid)) {
          meetingURL = meetingURLValid
        } else {
          return null
        }
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
          Pair("captureNetworkQualityInPreview", "Boolean"),
        ),
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
        arrayOf(Pair("endpoint", "String"), Pair("metadata", "String")),
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
        arrayOf(Pair("endpoint", "String"), Pair("captureNetworkQualityInPreview", "Boolean")),
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
        arrayOf(Pair("metadata", "String"), Pair("captureNetworkQualityInPreview", "Boolean")),
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
        arrayOf(Pair("captureNetworkQualityInPreview", "Boolean")),
      ) -> {
        config =
          HMSConfig(
            credentials.getString("username") as String,
            credentials.getString("authToken") as String,
            captureNetworkQualityInPreview =
              credentials.getBoolean("captureNetworkQualityInPreview"),
          )
      }
    }
    return config
  }

  // TODO: replace surfaceView with hmsVideoView
  @RequiresApi(Build.VERSION_CODES.N)
  fun captureSurfaceView(
    surfaceView: SurfaceViewRenderer,
    sdkId: String,
    args: ReadableArray?,
    context: Context,
    id: Int,
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
                copyResult.toString(),
              ),
            )
            output.putString("error", copyResult.toString())
            reactContext
              .getJSModule(RCTEventEmitter::class.java)
              .receiveEvent(id, "captureFrame", output)
          }
        },
        Handler(),
      )
    } catch (e: Exception) {
      Log.e("captureSurfaceView", "error: $e")
      HMSManager.hmsCollection[sdkId]?.emitHMSError(e as HMSException)
      output.putString("error", e.message)
      reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "captureFrame", output)
    }
  }

  fun getAudioDevicesList(audioDevicesList: List<HMSAudioManager.AudioDevice>?): ReadableArray {
    val hmsAudioDevicesList = Arguments.createArray()
    if (audioDevicesList != null) {
      for (audioDevice in audioDevicesList) {
        hmsAudioDevicesList.pushString(audioDevice.name)
      }
    }
    return hmsAudioDevicesList
  }

  fun getAudioDevicesSet(audioDevicesSet: Set<HMSAudioManager.AudioDevice>?): ReadableArray {
    val hmsAudioDevicesSet = Arguments.createArray()
    if (audioDevicesSet != null) {
      for (audioDevice in audioDevicesSet) {
        hmsAudioDevicesSet.pushString(audioDevice.name)
      }
    }
    return hmsAudioDevicesSet
  }

  fun getAudioDevice(audioDevice: String?): HMSAudioManager.AudioDevice {
    when (audioDevice) {
      "AUTOMATIC" -> {
        return HMSAudioManager.AudioDevice.AUTOMATIC
      }
      "BLUETOOTH" -> {
        return HMSAudioManager.AudioDevice.BLUETOOTH
      }
      "EARPIECE" -> {
        return HMSAudioManager.AudioDevice.EARPIECE
      }
      "SPEAKER_PHONE" -> {
        return HMSAudioManager.AudioDevice.SPEAKER_PHONE
      }
      "WIRED_HEADSET" -> {
        return HMSAudioManager.AudioDevice.WIRED_HEADSET
      }
    }
    return HMSAudioManager.AudioDevice.SPEAKER_PHONE
  }

  fun getPeerListIteratorOptions(data: ReadableMap?): PeerListIteratorOptions? {
    if (data == null) {
      return null
    }
    val limit = data.getInt("limit")
    val role = data.getString("byRoleName")
    val peerIds = data.getArray("byPeerIds")?.toArrayList() as? ArrayList<String>

    return PeerListIteratorOptions(null, role, peerIds, limit)
  }
}
