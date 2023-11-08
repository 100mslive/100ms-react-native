package com.reactnativehmssdk

import android.app.Activity
import android.app.Application
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Rational
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reactnativehmssdk.HMSManager.Companion.REACT_CLASS
import live.hms.video.error.HMSException
import java.util.UUID

@ReactModule(name = REACT_CLASS)
class HMSManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), Application.ActivityLifecycleCallbacks {
  companion object {
    const val REACT_CLASS = "HMSManager"
    var hmsCollection = mutableMapOf<String, HMSRNSDK>()

    var reactAppContext: ReactApplicationContext? = null
    var pipParamConfig: PipParamConfig? = null;
    var pipParamsUntyped: Any? = null;
    var emitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null

    fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
      isPIPMode = isInPictureInPictureMode
      emitter?.let {
        val data = Arguments.createMap()
        data.putBoolean("isInPictureInPictureMode", isInPictureInPictureMode)

        it.emit("ON_PIP_MODE_CHANGED", data)
      }
    }

    fun onWindowFocusChanged(isFocused: Boolean) {
      if (isFocused && isPIPMode) {
        emitter?.let {
          val data = Arguments.createMap()
          data.putBoolean("isInPictureInPictureMode", false)

          it.emit("ON_PIP_MODE_CHANGED", data)
        }
        isPIPMode = false
      }
    }

    fun onResume() {
      if (isPIPMode) {
        isPIPMode = false
        emitter?.let {
          val data = Arguments.createMap()
          data.putBoolean("isInPictureInPictureMode", false)

          it.emit("ON_PIP_MODE_CHANGED", data)
        }
      }
    }

    private var isPIPMode = false

    fun onUserLeaveHint() {
      val pipParams = pipParamsUntyped
      if (
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        pipParamConfig?.autoEnterPipMode == true &&
        pipParams is android.app.PictureInPictureParams
      ) {
        isPIPMode = true
        emitter?.let {
          val data = Arguments.createMap()
          data.putBoolean("isInPictureInPictureMode", true)

          it.emit("ON_PIP_MODE_CHANGED", data)
        }
        reactAppContext?.currentActivity?.enterPictureInPictureMode(pipParams)
      }
    }
  }

  override fun getName(): String {
    return "HMSManager"
  }

  fun getHmsInstance(): MutableMap<String, HMSRNSDK> {
    return hmsCollection
  }

  private fun setupPip() {
    if (emitter == null) {
      reactAppContext = reactApplicationContext

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        currentActivity?.let {
         pipReceiver?.register(it)
        }
      }

      emitter = reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    }
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
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

  @ReactMethod
  fun preview(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.preview(credentials)
  }

  @ReactMethod
  fun join(credentials: ReadableMap) {
    val hms = HMSHelper.getHms(credentials, hmsCollection)

    hms?.join(credentials)
  }

  @ReactMethod
  fun setLocalMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalMute(data)
  }

  @ReactMethod
  fun setLocalVideoMute(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setLocalVideoMute(data)
  }

  @ReactMethod
  fun switchCamera(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchCamera()
  }

  @ReactMethod
  fun leave(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.leave(callback)
  }

  @ReactMethod
  fun sendBroadcastMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendBroadcastMessage(data, callback)
  }

  @ReactMethod
  fun sendGroupMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendGroupMessage(data, callback)
  }

  @ReactMethod
  fun sendDirectMessage(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.sendDirectMessage(data, callback)
  }

  @kotlin.Deprecated("Use #Function changeRoleOfPeer instead")
  @ReactMethod
  fun changeRole(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRole(data, callback)
  }

  @ReactMethod
  fun changeRoleOfPeer(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRoleOfPeer(data, promise)
  }

  @ReactMethod
  fun changeRoleOfPeersWithRoles(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeRoleOfPeersWithRoles(data, promise)
  }

  @ReactMethod
  fun changeTrackState(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackState(data, callback)
  }

  @ReactMethod
  fun changeTrackStateForRoles(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeTrackStateForRoles(data, callback)
  }

  @ReactMethod
  fun isMute(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isMute(data, callback)
  }

  @ReactMethod
  fun removePeer(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.removePeer(data, callback)
  }

  @ReactMethod
  fun isPlaybackAllowed(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isPlaybackAllowed(data, callback)
  }

  @ReactMethod
  fun getRoom(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoom(callback)
  }

  @ReactMethod
  fun getLocalPeer(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getLocalPeer(callback)
  }

  @ReactMethod
  fun getRemotePeers(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemotePeers(callback)
  }

  @ReactMethod
  fun getRoles(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoles(callback)
  }

  @ReactMethod
  fun setPlaybackAllowed(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackAllowed(data, callback)
  }

  @ReactMethod
  fun endRoom(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.endRoom(data, callback)
  }

  @ReactMethod
  fun previewForRole(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.previewForRole(data, callback)
  }

  @ReactMethod
  fun cancelPreview(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.cancelPreview(callback)
  }

  @ReactMethod
  fun acceptRoleChange(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.acceptRoleChange(callback)
  }

  @ReactMethod
  fun setVolume(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setVolume(data, callback)
  }

  @ReactMethod
  fun getVolume(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVolume(data, callback)
  }

  @ReactMethod
  fun setPlaybackForAllAudio(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setPlaybackForAllAudio(data, callback)
  }

  @ReactMethod
  fun remoteMuteAllAudio(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.remoteMuteAllAudio(callback)
  }

  @ReactMethod
  fun changeMetadata(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeMetadata(data, callback)
  }

  @ReactMethod
  fun startScreenshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    currentActivity?.application?.registerActivityLifecycleCallbacks(this)
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startScreenshare(callback)
  }

  @ReactMethod
  fun isScreenShared(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isScreenShared(callback)
  }

  @ReactMethod
  fun stopScreenshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
    hms?.stopScreenshare(callback)
  }

  @ReactMethod
  fun startAudioshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    currentActivity?.application?.registerActivityLifecycleCallbacks(this)
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startAudioshare(data, callback)
  }

  @ReactMethod
  fun isAudioShared(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.isAudioShared(callback)
  }

  @ReactMethod
  fun stopAudioshare(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
    hms?.stopAudioshare(callback)
  }

  @ReactMethod
  fun getAudioMixingMode(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    callback?.resolve(hms?.getAudioMixingMode()?.name)
  }

  @ReactMethod
  fun setAudioMixingMode(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioMixingMode(data, callback)
  }

  @ReactMethod
  fun startRTMPOrRecording(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startRTMPOrRecording(data, callback)
  }

  @ReactMethod
  fun stopRtmpAndRecording(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopRtmpAndRecording(callback)
  }

  @ReactMethod
  fun startHLSStreaming(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.startHLSStreaming(data, callback)
  }

  @ReactMethod
  fun stopHLSStreaming(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.stopHLSStreaming(callback)
  }

  @ReactMethod
  fun changeName(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.changeName(data, callback)
  }

  @ReactMethod
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

  @ReactMethod
  fun enableNetworkQualityUpdates(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.enableNetworkQualityUpdates()
  }

  @ReactMethod
  fun disableNetworkQualityUpdates(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.disableNetworkQualityUpdates()
  }

  @ReactMethod
  fun getAudioDevicesList(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioDevicesList(callback)
  }

  @ReactMethod
  fun getAudioOutputRouteType(
    data: ReadableMap,
    callback: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAudioOutputRouteType(callback)
  }

  @ReactMethod
  fun switchAudioOutput(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.switchAudioOutput(data, callback)
  }

  @ReactMethod
  fun setAudioMode(data: ReadableMap, callback: Promise?) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioMode(data, callback)
  }

  @ReactMethod
  fun setAudioDeviceChangeListener(data: ReadableMap) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setAudioDeviceChangeListener()
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getPeerProperty(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null

    return hms.getPeerProperty(data)
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getRoomProperty(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null

    return hms.getRoomProperty(data)
  }

  @ReactMethod
  fun enableEvent(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.enableEvent(data, promise)
  }

  @ReactMethod
  fun disableEvent(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.disableEvent(data, promise)
  }

  @ReactMethod()
  fun restrictData(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.restrictData(data, promise)
  }

  @ReactMethod()
  fun getAuthTokenByRoomCode(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getAuthTokenByRoomCode(data, promise)
  }

  // region Person-In-Person Mode Action handing
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

    val activity = currentActivity

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
                  Intent(PipActionReceiver.PIP_INTENT_ACTION).putExtra(PipActionReceiver.PIPActions.localAudio.title, PipActionReceiver.PIPActions.localAudio.requestCode),
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
                  Intent(PipActionReceiver.PIP_INTENT_ACTION).putExtra(PipActionReceiver.PIPActions.localVideo.title, PipActionReceiver.PIPActions.localVideo.requestCode),
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

  @ReactMethod
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
              android.graphics.drawable.Icon.createWithResource(reactApplicationContext, R.drawable.ic_call_end_24),
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

      val activity = currentActivity ?: return false
      val pipParamConfig = readableMapToPipParamConfig(data) ?: return false
      val pipParams = buildPipParams(pipParamConfig) ?: return false

      if (pipParams !is android.app.PictureInPictureParams) {
        return false
      }

      HMSManager.pipParamConfig = pipParamConfig
      HMSManager.pipParamsUntyped = pipParams

      activity.setPictureInPictureParams(pipParams)
      return true
    } catch (e: Exception) {
      throw e
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

      val activity = currentActivity ?: return false
      val pipParamConfig = readableMapToPipParamConfig(data) ?: return false
      val pipParams = buildPipParams(pipParamConfig) ?: return false

      if (pipParams !is android.app.PictureInPictureParams) {
        return false
      }

      HMSManager.pipParamConfig = pipParamConfig
      HMSManager.pipParamsUntyped = pipParams

      return activity.enterPictureInPictureMode(pipParams)
    } catch (e: Exception) {
      throw e
    }
  }

  @ReactMethod
  fun getRemoteVideoTrackFromTrackId(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemoteVideoTrackFromTrackId(data, promise)
  }

  @ReactMethod
  fun getRemoteAudioTrackFromTrackId(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRemoteAudioTrackFromTrackId(data, promise)
  }

  @ReactMethod
  fun getVideoTrackLayer(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVideoTrackLayer(data, promise)
  }

  @ReactMethod
  fun getVideoTrackLayerDefinition(
    data: ReadableMap,
    promise: Promise,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getVideoTrackLayerDefinition(data, promise)
  }

  @ReactMethod
  fun setVideoTrackLayer(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setVideoTrackLayer(data, promise)
  }

  @ReactMethod
  fun captureImageAtMaxSupportedResolution(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.captureImageAtMaxSupportedResolution(data, promise)
  }

  @ReactMethod
  fun setSessionMetadataForKey(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.setSessionMetadataForKey(data, promise)
  }

  @ReactMethod
  fun getSessionMetadataForKey(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getSessionMetadataForKey(data, promise)
  }

  @ReactMethod
  fun addKeyChangeListener(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.addKeyChangeListener(data, promise)
  }

  @ReactMethod
  fun removeKeyChangeListener(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.removeKeyChangeListener(data, promise)
  }

  @ReactMethod
  fun getRoomLayout(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)

    hms?.getRoomLayout(data, promise)
  }

  @ReactMethod
  fun raiseLocalPeerHand(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.raiseLocalPeerHand(data, promise)
  }

  @ReactMethod
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

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getPeerListIterator(data: ReadableMap): WritableMap? {
    val hms = HMSHelper.getHms(data, hmsCollection) ?: return null
    return hms.getPeerListIterator(data)
  }

  @ReactMethod
  fun peerListIteratorHasNext(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.peerListIteratorHasNext(data, promise)
  }

  @ReactMethod
  fun peerListIteratorNext(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hms = HMSHelper.getHms(data, hmsCollection)
    hms?.peerListIteratorNext(data, promise)
  }

  fun emitEvent(
    event: String,
    data: WritableMap,
  ) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, data)
  }

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
        currentActivity?.application?.unregisterActivityLifecycleCallbacks(this)
        hmsCollection = mutableMapOf()
        // unregistering pip actions on activity destroy.
        if (pipReceiver !== null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          pipReceiver?.unregister(activity)
        }
      }
    } catch (e: Exception) {
      //      Log.d("error", e.message)
    }
  }
}
