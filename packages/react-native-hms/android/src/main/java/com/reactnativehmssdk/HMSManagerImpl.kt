package com.reactnativehmssdk

import android.app.Activity
import android.app.Application
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.Rational
import android.view.WindowManager
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationManagerCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import live.hms.video.error.HMSException
import live.hms.video.factories.noisecancellation.AvailabilityStatus
import live.hms.video.sdk.HMSActionResultListener
import java.util.UUID

/**
 * HMSManagerImpl — shared SDK business logic for the HMSManager native module.
 *
 * Phase 1 / 1C-2 of the New Architecture migration. This class holds all
 * the actual SDK code; arch-specific wrappers live at:
 *   - android/src/oldarch/.../HMSManager.kt — extends ReactContextBaseJavaModule
 *   - android/src/newarch/.../HMSManager.kt — extends NativeHMSManagerSpec
 * Both wrappers instantiate this Impl and forward every method call to it.
 *
 * Note on `reactApplicationContext`: previously inherited from
 * ReactContextBaseJavaModule. Now stored as a constructor property with the
 * same name so the existing 1,728-line method bodies don't need rewriting.
 */
class HMSManagerImpl(
  val reactApplicationContext: ReactApplicationContext,
) : Application.ActivityLifecycleCallbacks {
  companion object {
    const val REACT_CLASS = "HMSManager"
    var hmsCollection = mutableMapOf<String, HMSRNSDK>()

    var startingScreenShare = false
    private var isInPIPMode = false
    var reactAppContext: ReactApplicationContext? = null
    var pipParamConfig: PipParamConfig? = null
    var pipParamsUntyped: Any? = null
    var emitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null

    private fun emitPipEvent(isInPictureInPictureMode: Boolean) {
      emitter?.let {
        val data = Arguments.createMap()
        data.putBoolean("isInPictureInPictureMode", isInPictureInPictureMode)

        it.emit("ON_PIP_MODE_CHANGED", data)
      }
    }

    fun onPictureInPictureModeChanged(
      isInPictureInPictureMode: Boolean,
      newConfig: Configuration,
    ) {
      if (isInPictureInPictureMode) {
        isInPIPMode = true
      }
    }

    fun onResume() {
      if (isInPIPMode) {
        isInPIPMode = false
        reactAppContext?.currentActivity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        emitPipEvent(false)
      }
    }

    fun onUserLeaveHint() {
      val pipParams = pipParamsUntyped
      if (
        !startingScreenShare &&
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        pipParamConfig?.autoEnterPipMode == true &&
        pipParams is android.app.PictureInPictureParams
      ) {
        reactAppContext?.currentActivity?.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        emitPipEvent(true)
        val success = reactAppContext?.currentActivity?.enterPictureInPictureMode(pipParams)
        success?.let {
          if (!it) {
            reactAppContext?.currentActivity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            emitPipEvent(false)
          }
        }
      }
    }
  }


  fun getHmsInstance(): MutableMap<String, HMSRNSDK> = hmsCollection

  private fun setupPip() {
    if (emitter == null) {
      reactAppContext = reactApplicationContext

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactApplicationContext?.currentActivity?.let {
          pipReceiver?.register(it)
        }
      }

      emitter =
        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    }
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  fun build(
    data: ReadableMap?,
    callback: Promise?,
  ) {
    try {
      val hasItem = hmsCollection.containsKey("12345")
      if (hasItem) {
        val uuid = UUID.randomUUID()
        val randomUUIDString = uuid.toString()
        val sdkInstance = HMSRNSDK(data, this, randomUUIDString, reactApplicationContext)

        hmsCollection[randomUUIDString] = sdkInstance

        callback?.resolve(randomUUIDString)
      } else {
        val randomUUIDString = "12345"
        val sdkInstance = HMSRNSDK(data, this, randomUUIDString, reactApplicationContext)

        hmsCollection[randomUUIDString] = sdkInstance

        callback?.resolve(randomUUIDString)
      }
    } catch (e: HMSException) {
      callback?.reject(e.code.toString(), e.description)
    }
  }

  fun preview(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.preview(credentials)
  }

  fun join(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.join(credentials)
  }

  fun setLocalMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalMute(data)
  }

  fun setLocalVideoMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalVideoMute(data)
  }

  fun switchCamera(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchCamera()
  }

  fun leave(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.leave(callback)
  }

  fun sendBroadcastMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendBroadcastMessage(data, callback)
  }

  fun sendGroupMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendGroupMessage(data, callback)
  }

  fun sendDirectMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendDirectMessage(data, callback)
  }

  @kotlin.Deprecated("Use #Function changeRoleOfPeer instead")
  fun changeRole(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRole(data, callback)
  }

  fun changeRoleOfPeer(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRoleOfPeer(data, promise)
  }

  fun changeRoleOfPeersWithRoles(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRoleOfPeersWithRoles(data, promise)
  }

  fun changeTrackState(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackState(data, callback)
  }

  fun changeTrackStateForRoles(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackStateForRoles(data, callback)
  }

  fun isMute(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isMute(data, callback)
  }

  fun removePeer(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.removePeer(data, callback)
  }

  fun isPlaybackAllowed(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isPlaybackAllowed(data, callback)
  }

  fun getRoom(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoom(callback)
  }

  fun getLocalPeer(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getLocalPeer(callback)
  }

  fun getRemotePeers(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemotePeers(callback)
  }

  fun getRoles(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoles(callback)
  }

  fun setPlaybackAllowed(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackAllowed(data, callback)
  }

  fun endRoom(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.endRoom(data, callback)
  }

  fun previewForRole(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.previewForRole(data, callback)
  }

  fun cancelPreview(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.cancelPreview(callback)
  }

  fun acceptRoleChange(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.acceptRoleChange(callback)
  }

  fun setVolume(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setVolume(data, callback)
  }

  fun getVolume(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVolume(data, callback)
  }

  fun setPlaybackForAllAudio(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackForAllAudio(data, callback)
  }

  fun remoteMuteAllAudio(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.remoteMuteAllAudio(callback)
  }

  fun changeMetadata(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeMetadata(data, callback)
  }

  fun startScreenshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    reactApplicationContext?.currentActivity?.application?.registerActivityLifecycleCallbacks(this)
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startScreenshare(callback)
  }

  fun isScreenShared(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isScreenShared(callback)
  }

  fun stopScreenshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    reactApplicationContext?.currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
    hms?.stopScreenshare(callback)
  }

  fun startAudioshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    reactApplicationContext?.currentActivity?.application?.registerActivityLifecycleCallbacks(this)
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startAudioshare(data, callback)
  }

  fun isAudioShared(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isAudioShared(callback)
  }

  fun stopAudioshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    reactApplicationContext?.currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
    hms?.stopAudioshare(callback)
  }

  fun getAudioMixingMode(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    callback?.resolve(hms?.getAudioMixingMode()?.name)
  }

  fun setAudioMixingMode(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioMixingMode(data, callback)
  }

  fun startRTMPOrRecording(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startRTMPOrRecording(data, callback)
  }

  fun stopRtmpAndRecording(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopRtmpAndRecording(callback)
  }

  // region - HLS Streaming

  fun startHLSStreaming(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startHLSStreaming(data, callback)
  }

  fun stopHLSStreaming(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopHLSStreaming(callback)
  }

  fun sendHLSTimedMetadata(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.sendHLSTimedMetadata(data, callback)
      return
    }
    callback?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }

  // endregion

  fun changeName(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeName(data, callback)
  }

  fun destroy(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val id = data.getString("id")
    hmsCollection.remove(id)
    val result: WritableMap = Arguments.createMap()
    result.putBoolean("success", true)
    result.putString("message", "$id removed")
    callback?.resolve(result)
  }

  fun enableNetworkQualityUpdates(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.enableNetworkQualityUpdates()
  }

  fun disableNetworkQualityUpdates(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.disableNetworkQualityUpdates()
  }

  fun getAudioDevicesList(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioDevicesList(callback)
  }

  fun getAudioOutputRouteType(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioOutputRouteType(callback)
  }

  fun switchAudioOutput(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchAudioOutput(data, callback)
  }

  fun setAudioMode(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioMode(data, callback)
  }

  fun setAudioDeviceChangeListener(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioDeviceChangeListener()
  }

  fun getPeerProperty(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null

    return hms.getPeerProperty(data)
  }

  fun getRoomProperty(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null

    return hms.getRoomProperty(data)
  }

  fun enableEvent(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.enableEvent(data, promise)
  }

  fun disableEvent(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.disableEvent(data, promise)
  }

  fun restrictData(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.restrictData(data, promise)
  }

  fun getAuthTokenByRoomCode(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAuthTokenByRoomCode(data, promise)
  }

  // region Picture-In-Picture Mode Action handing
  private val pipReceiver by lazy {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      PipActionReceiver(
        toggleLocalAudio = {
          toggleLocalAudio()
          updatePIPRemoteActions(PipActionReceiver.PIPActions.localAudio.requestCode)
        },
        toggleLocalVideo = {
          toggleLocalVideo()
          updatePIPRemoteActions(PipActionReceiver.PIPActions.localVideo.requestCode)
        },
        endMeeting = {
          endMeeting()
        },
      )
    } else {
      null
    }
  }

  private var pipRemoteActionsList: MutableList<Any> = mutableListOf()

  @RequiresApi(Build.VERSION_CODES.O)
  private fun toggleLocalAudio() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val hmssdk = getHmsInstance()[PipActionReceiver.sdkIdForPIP!!]?.hmsSDK

    val localAudioTrack = hmssdk?.getLocalPeer()?.audioTrack
    val isMuted = localAudioTrack?.isMute

    if (isMuted !== null) {
      localAudioTrack?.setMute(!isMuted)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun toggleLocalVideo() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val hmssdk = getHmsInstance()[PipActionReceiver.sdkIdForPIP!!]?.hmsSDK

    val localVideoTrack = hmssdk?.getLocalPeer()?.videoTrack
    val isMuted = localVideoTrack?.isMute

    if (isMuted !== null) {
      localVideoTrack?.setMute(!isMuted)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun endMeeting() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val hms = getHmsInstance()[PipActionReceiver.sdkIdForPIP!!]

    hms?.leave(callback = null, fromPIP = true)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun updatePIPRemoteActions(code: Int) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val activity = reactApplicationContext?.currentActivity

    if (activity !== null) {
      val hmssdk = getHmsInstance()[PipActionReceiver.sdkIdForPIP!!]?.hmsSDK

      when (code) {
        PipActionReceiver.PIPActions.localAudio.requestCode -> {
          val audioActionIdx =
            pipRemoteActionsList.indexOfFirst {
              it is android.app.RemoteAction && it.title == PipActionReceiver.PIPActions.localAudio.title
            }
          if (audioActionIdx >= 0) {
            pipRemoteActionsList[audioActionIdx] =
              android.app.RemoteAction(
                android.graphics.drawable.Icon.createWithResource(
                  reactApplicationContext,
                  if (hmssdk?.getLocalPeer()?.audioTrack?.isMute === true) R.drawable.ic_mic_off_24 else R.drawable.ic_mic_24,
                ),
                PipActionReceiver.PIPActions.localAudio.title,
                PipActionReceiver.PIPActions.localAudio.description,
                PendingIntent.getBroadcast(
                  reactApplicationContext,
                  PipActionReceiver.PIPActions.localAudio.requestCode,
                  Intent(
                    PipActionReceiver.PIP_INTENT_ACTION,
                  ).putExtra(PipActionReceiver.PIPActions.localAudio.title, PipActionReceiver.PIPActions.localAudio.requestCode),
                  PendingIntent.FLAG_IMMUTABLE,
                ),
              )
          }
        }
        PipActionReceiver.PIPActions.localVideo.requestCode -> {
          val videoActionIdx =
            pipRemoteActionsList.indexOfFirst {
              it is android.app.RemoteAction && it.title == PipActionReceiver.PIPActions.localVideo.title
            }
          if (videoActionIdx >= 0) {
            val isVideoMute = hmssdk?.getLocalPeer()?.videoTrack?.isMute
            val updatedIcon = if (isVideoMute === true) R.drawable.ic_camera_toggle_off else R.drawable.ic_camera_toggle_on
            pipRemoteActionsList[videoActionIdx] =
              android.app.RemoteAction(
                android.graphics.drawable.Icon.createWithResource(
                  reactApplicationContext,
                  updatedIcon,
                ),
                PipActionReceiver.PIPActions.localVideo.title,
                PipActionReceiver.PIPActions.localVideo.description,
                PendingIntent.getBroadcast(
                  reactApplicationContext,
                  PipActionReceiver.PIPActions.localVideo.requestCode,
                  Intent(
                    PipActionReceiver.PIP_INTENT_ACTION,
                  ).putExtra(PipActionReceiver.PIPActions.localVideo.title, PipActionReceiver.PIPActions.localVideo.requestCode),
                  PendingIntent.FLAG_IMMUTABLE,
                ),
              )
          }
        }
      }

      val pipParams =
        android.app.PictureInPictureParams.Builder().let {
          it.setActions(pipRemoteActionsList.filterIsInstance<android.app.RemoteAction>())
          it.build()
        }

      activity.setPictureInPictureParams(pipParams)
    }
  }
  // endregion

  data class PipParamConfig(
    val autoEnterPipMode: Boolean,
    val aspectRatio: Pair<Int, Int>?,
    val showEndButton: Boolean,
    val showVideoButton: Boolean,
    val showAudioButton: Boolean,
  )

  fun handlePipActions(
    action: String,
    data: ReadableMap,
    promise: Promise?,
  ) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      promise?.reject(Throwable("PIP mode is not supported!"))
      return
    }

    if (!data.hasKey("id")) {
      promise?.reject(Throwable("HMS Instance Id is required!"))
      return
    }

    try {
      setupPip()

      PipActionReceiver.sdkIdForPIP = data.getString("id")

      when (action) {
        "isPipModeSupported" -> {
          val result = isPipModeSupported()
          promise?.resolve(result)
        }
        "enterPipMode" -> {
          val result = enterPipMode(data)
          promise?.resolve(result)
        }
        "setPictureInPictureParams" -> {
          val result = setPictureInPictureParams(data)
          promise?.resolve(result)
        }
      }
    } catch (e: Exception) {
      promise?.reject(e)
    }
  }

  // Builds and returns PictureInPictureParams as per given config
  // `Any` type is used here to prevent crashes on "SDK < API level 26"
  @RequiresApi(Build.VERSION_CODES.O)
  private fun buildPipParams(config: PipParamConfig): Any? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return null
    }

    val pipParams =
      android.app.PictureInPictureParams.Builder().let {
        if (config.aspectRatio !== null) {
          it.setAspectRatio(
            Rational(
              config.aspectRatio.first,
              config.aspectRatio.second,
            ),
          )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          it.setSeamlessResizeEnabled(false)
        }

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//          it.setAutoEnterEnabled(config.autoEnterPipMode)
//        }

        // region Setting RemoteActions on PictureInPictureParams
        val hmssdk = getHmsInstance()[PipActionReceiver.sdkIdForPIP!!]?.hmsSDK

        pipRemoteActionsList.clear()

        val localPeer = hmssdk?.getLocalPeer()
        val allowedPublishing = localPeer?.hmsRole?.publishParams?.allowed

        if (config.showAudioButton && allowedPublishing?.contains("audio") === true) {
          pipRemoteActionsList.add(
            android.app.RemoteAction(
              android.graphics.drawable.Icon.createWithResource(
                reactApplicationContext,
                if (localPeer?.audioTrack?.isMute === true) R.drawable.ic_mic_off_24 else R.drawable.ic_mic_24,
              ),
              PipActionReceiver.PIPActions.localAudio.title,
              PipActionReceiver.PIPActions.localAudio.description,
              PendingIntent.getBroadcast(
                reactApplicationContext,
                PipActionReceiver.PIPActions.localAudio.requestCode,
                Intent(
                  PipActionReceiver.PIP_INTENT_ACTION,
                ).putExtra(PipActionReceiver.PIPActions.localAudio.title, PipActionReceiver.PIPActions.localAudio.requestCode),
                PendingIntent.FLAG_IMMUTABLE,
              ),
            ),
          )
        }

        if (config.showEndButton) {
          pipRemoteActionsList.add(
            android.app.RemoteAction(
              android.graphics.drawable.Icon
                .createWithResource(reactApplicationContext, R.drawable.ic_call_end_24),
              PipActionReceiver.PIPActions.endMeet.title,
              PipActionReceiver.PIPActions.endMeet.description,
              PendingIntent.getBroadcast(
                reactApplicationContext,
                PipActionReceiver.PIPActions.endMeet.requestCode,
                Intent(PipActionReceiver.PIP_INTENT_ACTION).putExtra(
                  PipActionReceiver.PIPActions.endMeet.title,
                  PipActionReceiver.PIPActions.endMeet.requestCode,
                ),
                PendingIntent.FLAG_IMMUTABLE,
              ),
            ),
          )
        }

        if (config.showVideoButton && allowedPublishing?.contains("video") === true) {
          pipRemoteActionsList.add(
            android.app.RemoteAction(
              android.graphics.drawable.Icon.createWithResource(
                reactApplicationContext,
                if (localPeer?.videoTrack?.isMute === true) R.drawable.ic_camera_toggle_off else R.drawable.ic_camera_toggle_on,
              ),
              PipActionReceiver.PIPActions.localVideo.title,
              PipActionReceiver.PIPActions.localVideo.description,
              PendingIntent.getBroadcast(
                reactApplicationContext,
                PipActionReceiver.PIPActions.localVideo.requestCode,
                Intent(PipActionReceiver.PIP_INTENT_ACTION).putExtra(
                  PipActionReceiver.PIPActions.localVideo.title,
                  PipActionReceiver.PIPActions.localVideo.requestCode,
                ),
                PendingIntent.FLAG_IMMUTABLE,
              ),
            ),
          )
        }

        it.setActions(pipRemoteActionsList.filterIsInstance<android.app.RemoteAction>())
        // endregion

        it.build()
      }

    return pipParams
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun readableMapToPipParamConfig(data: ReadableMap?): PipParamConfig? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return null
    }

    var autoEnterPipMode = false
    var aspectRatio: Pair<Int, Int> = Pair(16, 9)
    var showEndButton = false
    var showAudioButton = false
    var showVideoButton = false

    if (data !== null) {
      if (data.hasKey("aspectRatio")) {
        val aspectRatioArray = data.getArray("aspectRatio")

        if (aspectRatioArray !== null) {
          val firstItemType = aspectRatioArray.getType(0)
          var firstItem: Int? = null
          if (firstItemType === ReadableType.Number) {
            firstItem = aspectRatioArray.getInt(0)
          }

          val secondItemType = aspectRatioArray.getType(1)
          var secondItem: Int? = null
          if (secondItemType === ReadableType.Number) {
            secondItem = aspectRatioArray.getInt(1)
          }

          if (firstItem !== null && secondItem !== null) {
            aspectRatio = Pair(firstItem, secondItem)
          }
        }
      }

      if (data.hasKey("endButton")) {
        showEndButton = data.getBoolean("endButton")
      }

      if (data.hasKey("audioButton")) {
        showAudioButton = data.getBoolean("audioButton")
      }

      if (data.hasKey("videoButton")) {
        showVideoButton = data.getBoolean("videoButton")
      }

      if (data.hasKey("autoEnterPipMode")) {
        val autoEnterPipModeType = data.getType("autoEnterPipMode")

        if (autoEnterPipModeType === ReadableType.Boolean) {
          autoEnterPipMode = data.getBoolean("autoEnterPipMode")
        }
      }
    }

    return PipParamConfig(
      autoEnterPipMode = autoEnterPipMode,
      aspectRatio = aspectRatio,
      showEndButton = showEndButton,
      showAudioButton = showAudioButton,
      showVideoButton = showVideoButton,
    )
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun setPictureInPictureParams(data: ReadableMap): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    try {
      if (!isPipModeSupported()) {
        throw Throwable(message = "PIP Mode is not supported!")
      }

      val activity = reactApplicationContext?.currentActivity ?: return false
      val pipParamConfig = readableMapToPipParamConfig(data) ?: return false
      val pipParams = buildPipParams(pipParamConfig) ?: return false

      if (pipParams !is android.app.PictureInPictureParams) {
        return false
      }

      Companion.pipParamConfig = pipParamConfig
      Companion.pipParamsUntyped = pipParams

      activity.setPictureInPictureParams(pipParams)
      return true
    } catch (e: Exception) {
      Log.e("HMSManager", "Error setting PictureInPictureParams: ${e.message}")
      return false
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun isPipModeSupported(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    return reactApplicationContext.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun enterPipMode(data: ReadableMap): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    try {
      if (!isPipModeSupported()) {
        throw Throwable(message = "PIP Mode is not supported!")
      }

      val activity = reactApplicationContext?.currentActivity ?: return false
      val pipParamConfig = readableMapToPipParamConfig(data) ?: return false
      val pipParams = buildPipParams(pipParamConfig) ?: return false

      if (pipParams !is android.app.PictureInPictureParams) {
        return false
      }

      Companion.pipParamConfig = pipParamConfig
      Companion.pipParamsUntyped = pipParams

      return activity.enterPictureInPictureMode(pipParams)
    } catch (e: Exception) {
      return false
    }
  }

  fun getRemoteVideoTrackFromTrackId(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemoteVideoTrackFromTrackId(data, promise)
  }

  fun getRemoteAudioTrackFromTrackId(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemoteAudioTrackFromTrackId(data, promise)
  }

  fun getVideoTrackLayer(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVideoTrackLayer(data, promise)
  }

  fun getVideoTrackLayerDefinition(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVideoTrackLayerDefinition(data, promise)
  }

  fun setVideoTrackLayer(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setVideoTrackLayer(data, promise)
  }

  fun captureImageAtMaxSupportedResolution(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.captureImageAtMaxSupportedResolution(data, promise)
  }

  fun setSessionMetadataForKey(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setSessionMetadataForKey(data, promise)
  }

  fun getSessionMetadataForKey(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getSessionMetadataForKey(data, promise)
  }

  fun addKeyChangeListener(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.addKeyChangeListener(data, promise)
  }

  fun removeKeyChangeListener(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.removeKeyChangeListener(data, promise)
  }

  fun getRoomLayout(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoomLayout(data, promise)
  }

  fun raiseLocalPeerHand(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.raiseLocalPeerHand(data, promise)
  }

  fun lowerLocalPeerHand(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.lowerLocalPeerHand(data, promise)
  }

  fun lowerRemotePeerHand(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.lowerRemotePeerHand(data, promise)
  }

  fun getPeerListIterator(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null
    return hms.getPeerListIterator(data)
  }

  fun peerListIteratorHasNext(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.peerListIteratorHasNext(data, promise)
  }

  fun peerListIteratorNext(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.peerListIteratorNext(data, promise)
  }

  fun checkNotifications(promise: Promise?) {
    val reactApplicationContext = reactApplicationContext

    if (reactApplicationContext == null) {
      promise?.reject(Throwable("`reactApplicationContext` is not available!"))
      return
    }
    val enabled = NotificationManagerCompat.from(reactApplicationContext).areNotificationsEnabled()
    val data: WritableMap = Arguments.createMap()

    data.putString("status", if (enabled) "granted" else "blocked")
    val settings: WritableMap = Arguments.createMap()
    data.putMap("settings", settings)

    promise?.resolve(data)
  }

  fun setSoftInputMode(inputMode: Int): Int {
    val window = reactApplicationContext?.currentActivity?.window ?: return -1
    UiThreadUtil.runOnUiThread {
      window.setSoftInputMode(inputMode)
    }
    return 0
  }

  fun getSoftInputMode(): Int {
    val attributes = reactApplicationContext?.currentActivity?.window?.attributes ?: return -1
    return attributes.softInputMode
  }

  fun hideSystemBars() {
    val window = reactApplicationContext?.currentActivity?.window
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && window != null) {
      UiThreadUtil.runOnUiThread {
        window.attributes.layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          window.insetsController?.hide(WindowInsetsCompat.Type.systemBars())
        }
        WindowCompat.setDecorFitsSystemWindows(window, false)
      }
    }
  }

  fun showSystemBars() {
    val window = reactApplicationContext?.currentActivity?.window
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && window != null) {
      UiThreadUtil.runOnUiThread {
        window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          window.insetsController?.show(WindowInsetsCompat.Type.systemBars())
        }
        WindowCompat.setDecorFitsSystemWindows(window, true)
      }
    }
  }

  fun setAlwaysScreenOn(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val window = reactApplicationContext?.currentActivity?.window
    if (window == null) {
      promise?.reject(Throwable("`window` is not available!"))
      return
    }
    UiThreadUtil.runOnUiThread {
      if (data.getBoolean("enabled")) {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
      promise?.resolve(null)
    }
  }

  fun emitEvent(
    event: String,
    data: WritableMap,
  ) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, data)
  }

  // region Polls
  fun quickStartPoll(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.quickStartPoll(data, promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }

  fun addResponseOnPollQuestion(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.addResponseOnPollQuestion(data, promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }

  fun stopPoll(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.stop(data, promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }

  fun fetchLeaderboard(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.fetchLeaderboard(data, promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }
  // endregion

  //region Whiteboard
  fun startWhiteboard(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.startWhiteboard(data, promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }

  fun stopWhiteboard(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK = HMSHelper.getHms(data, hmsCollection)
    rnSDK?.let { sdk ->
      sdk.interactivityCenter?.let { center ->
        center.stopWhiteboard(promise)
        return
      }
    }
    promise?.reject(
      "6004",
      "HMS SDK not initialized",
    )
  }
  //endregion

  // region Noise Cancellation Plugin
  fun enableNoiseCancellationPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    val hmsSdk =
      rnSDK.hmsSDK ?: run {
        promise?.reject(
          "6004",
          "HMS SDK not initialized",
        )
        return
      }

    hmsSdk.enableNoiseCancellation(
      true,
      object : HMSActionResultListener {
        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.message)
        }

        override fun onSuccess() {
          promise?.resolve(true)
        }
      },
    )
  }

  fun disableNoiseCancellationPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    val hmsSdk =
      rnSDK.hmsSDK ?: run {
        promise?.reject(
          "6004",
          "HMS SDK not initialized",
        )
        return
      }
    hmsSdk.enableNoiseCancellation(
      false,
      object : HMSActionResultListener {
        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.message)
        }

        override fun onSuccess() {
          promise?.resolve(true)
        }
      },
    )
  }

  fun isNoiseCancellationPluginEnabled(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    val hmsSdk =
      rnSDK.hmsSDK ?: run {
        promise?.reject(
          "6004",
          "HMS SDK not initialized",
        )
        return
      }
    val isEnabled = hmsSdk.isNoiseCancellationEnabled()
    promise?.resolve(isEnabled)
  }

  fun isNoiseCancellationPluginAvailable(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    val hmsSdk =
      rnSDK.hmsSDK ?: run {
        promise?.reject(
          "6004",
          "HMS SDK not initialized",
        )
        return
      }

    val availability: AvailabilityStatus = hmsSdk.isNoiseCancellationSupported()
    val isAvailable =
      if (availability == AvailabilityStatus.Available) {
        true
      } else {
        val reason = (availability as AvailabilityStatus.NotAvailable).reason
        Log.d("HMSManager", "NoiseCancellation Not available because of $reason")
        false
      }
    promise?.resolve(isAvailable)
  }
  // endregion

  // region Webrtc Transcriptions
  fun handleRealTimeTranscription(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    rnSDK.handleRealTimeTranscription(data, promise)
  }
  // endregion

  fun setPermissionsAccepted(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val rnSDK =
      HMSHelper.getHms(data, hmsCollection) ?: run {
        promise?.reject(
          "6004",
          "RN HMS SDK not initialized",
        )
        return
      }
    rnSDK.hmsSDK?.setPermissionsAccepted()
    promise?.resolve(null)
  }

  // region Warning on JS side
  fun addListener(eventName: String) {
    // Keep: Required for RN built in Event Emitter Calls.
    // Fixes Warning - `new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.
  }

  fun removeListeners(count: Int) {
    // Keep: Required for RN built in Event Emitter Calls.
    // Fixes Warning - `new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.
  }
  // endregion

  // region ActivityLifecycleCallbacks

  override fun onActivityCreated(
    activity: Activity,
    savedInstanceState: Bundle?,
  ) {}

  override fun onActivityStarted(activity: Activity) {}

  override fun onActivityResumed(activity: Activity) {}

  override fun onActivityPaused(activity: Activity) {}

  override fun onActivityStopped(activity: Activity) {}

  override fun onActivitySaveInstanceState(
    activity: Activity,
    outState: Bundle,
  ) {}

  override fun onActivityDestroyed(activity: Activity) {
    try {
      if (activity.componentName.shortClassName == ".MainActivity") {
        for (key in hmsCollection.keys) {
          val hmsLocalPeer = hmsCollection[key]?.hmsSDK?.getLocalPeer()
          if (hmsLocalPeer != null) {
            hmsCollection[key]?.leave(null)
          }
        }
        reactApplicationContext?.currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
        hmsCollection = mutableMapOf()
        // unregistering pip actions on activity destroy.
        if (pipReceiver !== null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          pipReceiver?.unregister(activity)
        }
      }
    } catch (e: Exception) {
    }
  }

  // endregion
}
