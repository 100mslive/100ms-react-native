package com.reactnativehmssdk

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

/**
 * HMSManager — old-arch wrapper for the HMSManager native module.
 *
 * Phase 1 / 1C-2 of the New Architecture migration. This wrapper is compiled
 * only when the consumer's app uses old architecture (newArchEnabled=false).
 * It extends ReactContextBaseJavaModule (the legacy bridge base class) and
 * exposes ~98 @ReactMethod-annotated functions that all delegate to
 * HMSManagerImpl in src/main/.
 *
 * The new-arch counterpart at src/newarch/.../HMSManager.kt extends the
 * Codegen-generated NativeHMSManagerSpec and forwards to the same impl.
 *
 * Pattern reference:
 * https://github.com/reactwg/react-native-new-architecture/blob/main/docs/backwards-compat-turbo-modules.md
 */
@ReactModule(name = HMSManagerImpl.REACT_CLASS)
class HMSManager(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val impl = HMSManagerImpl(reactContext)

  override fun getName(): String = HMSManagerImpl.REACT_CLASS

  /**
   * Lifecycle hooks that consumer apps' MainActivity calls. Forward to
   * the Impl's companion-object methods for backward compatibility with
   * apps that already call HMSManager.onPictureInPictureModeChanged(...)
   * etc.
   */
  companion object {
    @JvmStatic
    fun onPictureInPictureModeChanged(
      isInPictureInPictureMode: Boolean,
      newConfig: android.content.res.Configuration,
    ) = HMSManagerImpl.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)

    @JvmStatic
    fun onResume() = HMSManagerImpl.onResume()

    @JvmStatic
    fun onUserLeaveHint() = HMSManagerImpl.onUserLeaveHint()
  }

  /** Used by view managers to look up the active SDK instances map. */
  fun getHmsInstance(): MutableMap<String, HMSRNSDK> = impl.getHmsInstance()

  @ReactMethod
  fun build(data: ReadableMap?, callback: Promise?) = impl.build(data, callback)

  @ReactMethod
  fun preview(credentials: ReadableMap) = impl.preview(credentials)

  @ReactMethod
  fun join(credentials: ReadableMap) = impl.join(credentials)

  @ReactMethod
  fun setLocalMute(data: ReadableMap) = impl.setLocalMute(data)

  @ReactMethod
  fun setLocalVideoMute(data: ReadableMap) = impl.setLocalVideoMute(data)

  @ReactMethod
  fun switchCamera(data: ReadableMap) = impl.switchCamera(data)

  @ReactMethod
  fun leave(data: ReadableMap, callback: Promise?) = impl.leave(data, callback)

  @ReactMethod
  fun sendBroadcastMessage(data: ReadableMap, callback: Promise?) = impl.sendBroadcastMessage(data, callback)

  @ReactMethod
  fun sendGroupMessage(data: ReadableMap, callback: Promise?) = impl.sendGroupMessage(data, callback)

  @ReactMethod
  fun sendDirectMessage(data: ReadableMap, callback: Promise?) = impl.sendDirectMessage(data, callback)

  @ReactMethod
  fun changeRole(data: ReadableMap, callback: Promise?) = impl.changeRole(data, callback)

  @ReactMethod
  fun changeRoleOfPeer(data: ReadableMap, promise: Promise?) = impl.changeRoleOfPeer(data, promise)

  @ReactMethod
  fun changeRoleOfPeersWithRoles(data: ReadableMap, promise: Promise?) = impl.changeRoleOfPeersWithRoles(data, promise)

  @ReactMethod
  fun changeTrackState(data: ReadableMap, callback: Promise?) = impl.changeTrackState(data, callback)

  @ReactMethod
  fun changeTrackStateForRoles(data: ReadableMap, callback: Promise?) = impl.changeTrackStateForRoles(data, callback)

  @ReactMethod
  fun isMute(data: ReadableMap, callback: Promise?) = impl.isMute(data, callback)

  @ReactMethod
  fun removePeer(data: ReadableMap, callback: Promise?) = impl.removePeer(data, callback)

  @ReactMethod
  fun isPlaybackAllowed(data: ReadableMap, callback: Promise?) = impl.isPlaybackAllowed(data, callback)

  @ReactMethod
  fun getRoom(data: ReadableMap, callback: Promise?) = impl.getRoom(data, callback)

  @ReactMethod
  fun getLocalPeer(data: ReadableMap, callback: Promise?) = impl.getLocalPeer(data, callback)

  @ReactMethod
  fun getRemotePeers(data: ReadableMap, callback: Promise?) = impl.getRemotePeers(data, callback)

  @ReactMethod
  fun getRoles(data: ReadableMap, callback: Promise?) = impl.getRoles(data, callback)

  @ReactMethod
  fun setPlaybackAllowed(data: ReadableMap, callback: Promise?) = impl.setPlaybackAllowed(data, callback)

  @ReactMethod
  fun endRoom(data: ReadableMap, callback: Promise?) = impl.endRoom(data, callback)

  @ReactMethod
  fun previewForRole(data: ReadableMap, callback: Promise?) = impl.previewForRole(data, callback)

  @ReactMethod
  fun cancelPreview(data: ReadableMap, callback: Promise?) = impl.cancelPreview(data, callback)

  @ReactMethod
  fun acceptRoleChange(data: ReadableMap, callback: Promise?) = impl.acceptRoleChange(data, callback)

  @ReactMethod
  fun setVolume(data: ReadableMap, callback: Promise?) = impl.setVolume(data, callback)

  @ReactMethod
  fun getVolume(data: ReadableMap, callback: Promise?) = impl.getVolume(data, callback)

  @ReactMethod
  fun setPlaybackForAllAudio(data: ReadableMap, callback: Promise?) = impl.setPlaybackForAllAudio(data, callback)

  @ReactMethod
  fun remoteMuteAllAudio(data: ReadableMap, callback: Promise?) = impl.remoteMuteAllAudio(data, callback)

  @ReactMethod
  fun changeMetadata(data: ReadableMap, callback: Promise?) = impl.changeMetadata(data, callback)

  @ReactMethod
  fun startScreenshare(data: ReadableMap, callback: Promise?) = impl.startScreenshare(data, callback)

  @ReactMethod
  fun isScreenShared(data: ReadableMap, callback: Promise?) = impl.isScreenShared(data, callback)

  @ReactMethod
  fun stopScreenshare(data: ReadableMap, callback: Promise?) = impl.stopScreenshare(data, callback)

  @ReactMethod
  fun startAudioshare(data: ReadableMap, callback: Promise?) = impl.startAudioshare(data, callback)

  @ReactMethod
  fun isAudioShared(data: ReadableMap, callback: Promise?) = impl.isAudioShared(data, callback)

  @ReactMethod
  fun stopAudioshare(data: ReadableMap, callback: Promise?) = impl.stopAudioshare(data, callback)

  @ReactMethod
  fun getAudioMixingMode(data: ReadableMap, callback: Promise?) = impl.getAudioMixingMode(data, callback)

  @ReactMethod
  fun setAudioMixingMode(data: ReadableMap, callback: Promise?) = impl.setAudioMixingMode(data, callback)

  @ReactMethod
  fun startRTMPOrRecording(data: ReadableMap, callback: Promise?) = impl.startRTMPOrRecording(data, callback)

  @ReactMethod
  fun stopRtmpAndRecording(data: ReadableMap, callback: Promise?) = impl.stopRtmpAndRecording(data, callback)

  @ReactMethod
  fun startHLSStreaming(data: ReadableMap, callback: Promise?) = impl.startHLSStreaming(data, callback)

  @ReactMethod
  fun stopHLSStreaming(data: ReadableMap, callback: Promise?) = impl.stopHLSStreaming(data, callback)

  @ReactMethod
  fun sendHLSTimedMetadata(data: ReadableMap, callback: Promise?) = impl.sendHLSTimedMetadata(data, callback)

  @ReactMethod
  fun changeName(data: ReadableMap, callback: Promise?) = impl.changeName(data, callback)

  @ReactMethod
  fun destroy(data: ReadableMap, callback: Promise?) = impl.destroy(data, callback)

  @ReactMethod
  fun enableNetworkQualityUpdates(data: ReadableMap) = impl.enableNetworkQualityUpdates(data)

  @ReactMethod
  fun disableNetworkQualityUpdates(data: ReadableMap) = impl.disableNetworkQualityUpdates(data)

  @ReactMethod
  fun getAudioDevicesList(data: ReadableMap, callback: Promise?) = impl.getAudioDevicesList(data, callback)

  @ReactMethod
  fun getAudioOutputRouteType(data: ReadableMap, callback: Promise?) = impl.getAudioOutputRouteType(data, callback)

  @ReactMethod
  fun switchAudioOutput(data: ReadableMap, callback: Promise?) = impl.switchAudioOutput(data, callback)

  @ReactMethod
  fun setAudioMode(data: ReadableMap, callback: Promise?) = impl.setAudioMode(data, callback)

  @ReactMethod
  fun setAudioDeviceChangeListener(data: ReadableMap) = impl.setAudioDeviceChangeListener(data)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getPeerProperty(data: ReadableMap): WritableMap? = impl.getPeerProperty(data)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getRoomProperty(data: ReadableMap): WritableMap? = impl.getRoomProperty(data)

  @ReactMethod
  fun enableEvent(data: ReadableMap, promise: Promise?) = impl.enableEvent(data, promise)

  @ReactMethod
  fun disableEvent(data: ReadableMap, promise: Promise?) = impl.disableEvent(data, promise)

  @ReactMethod
  fun restrictData(data: ReadableMap, promise: Promise?) = impl.restrictData(data, promise)

  @ReactMethod
  fun getAuthTokenByRoomCode(data: ReadableMap, promise: Promise) = impl.getAuthTokenByRoomCode(data, promise)

  @ReactMethod
  fun handlePipActions(action: String, data: ReadableMap, promise: Promise?) = impl.handlePipActions(action, data, promise)

  @ReactMethod
  fun getRemoteVideoTrackFromTrackId(data: ReadableMap, promise: Promise) = impl.getRemoteVideoTrackFromTrackId(data, promise)

  @ReactMethod
  fun getRemoteAudioTrackFromTrackId(data: ReadableMap, promise: Promise) = impl.getRemoteAudioTrackFromTrackId(data, promise)

  @ReactMethod
  fun getVideoTrackLayer(data: ReadableMap, promise: Promise) = impl.getVideoTrackLayer(data, promise)

  @ReactMethod
  fun getVideoTrackLayerDefinition(data: ReadableMap, promise: Promise) = impl.getVideoTrackLayerDefinition(data, promise)

  @ReactMethod
  fun setVideoTrackLayer(data: ReadableMap, promise: Promise?) = impl.setVideoTrackLayer(data, promise)

  @ReactMethod
  fun captureImageAtMaxSupportedResolution(data: ReadableMap, promise: Promise?) = impl.captureImageAtMaxSupportedResolution(data, promise)

  @ReactMethod
  fun setSessionMetadataForKey(data: ReadableMap, promise: Promise?) = impl.setSessionMetadataForKey(data, promise)

  @ReactMethod
  fun getSessionMetadataForKey(data: ReadableMap, promise: Promise?) = impl.getSessionMetadataForKey(data, promise)

  @ReactMethod
  fun addKeyChangeListener(data: ReadableMap, promise: Promise?) = impl.addKeyChangeListener(data, promise)

  @ReactMethod
  fun removeKeyChangeListener(data: ReadableMap, promise: Promise?) = impl.removeKeyChangeListener(data, promise)

  @ReactMethod
  fun getRoomLayout(data: ReadableMap, promise: Promise?) = impl.getRoomLayout(data, promise)

  @ReactMethod
  fun raiseLocalPeerHand(data: ReadableMap, promise: Promise?) = impl.raiseLocalPeerHand(data, promise)

  @ReactMethod
  fun lowerLocalPeerHand(data: ReadableMap, promise: Promise?) = impl.lowerLocalPeerHand(data, promise)

  @ReactMethod
  fun lowerRemotePeerHand(data: ReadableMap, promise: Promise?) = impl.lowerRemotePeerHand(data, promise)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getPeerListIterator(data: ReadableMap): WritableMap? = impl.getPeerListIterator(data)

  @ReactMethod
  fun peerListIteratorHasNext(data: ReadableMap, promise: Promise?) = impl.peerListIteratorHasNext(data, promise)

  @ReactMethod
  fun peerListIteratorNext(data: ReadableMap, promise: Promise?) = impl.peerListIteratorNext(data, promise)

  @ReactMethod
  fun checkNotifications(promise: Promise?) = impl.checkNotifications(promise)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setSoftInputMode(inputMode: Int): Int = impl.setSoftInputMode(inputMode)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getSoftInputMode(): Int = impl.getSoftInputMode()

  @ReactMethod
  fun hideSystemBars() = impl.hideSystemBars()

  @ReactMethod
  fun showSystemBars() = impl.showSystemBars()

  @ReactMethod
  fun setAlwaysScreenOn(data: ReadableMap, promise: Promise?) = impl.setAlwaysScreenOn(data, promise)

  @ReactMethod
  fun quickStartPoll(data: ReadableMap, promise: Promise?) = impl.quickStartPoll(data, promise)

  @ReactMethod
  fun addResponseOnPollQuestion(data: ReadableMap, promise: Promise?) = impl.addResponseOnPollQuestion(data, promise)

  @ReactMethod
  fun stopPoll(data: ReadableMap, promise: Promise?) = impl.stopPoll(data, promise)

  @ReactMethod
  fun fetchLeaderboard(data: ReadableMap, promise: Promise?) = impl.fetchLeaderboard(data, promise)

  @ReactMethod
  fun startWhiteboard(data: ReadableMap, promise: Promise?) = impl.startWhiteboard(data, promise)

  @ReactMethod
  fun stopWhiteboard(data: ReadableMap, promise: Promise?) = impl.stopWhiteboard(data, promise)

  @ReactMethod
  fun enableNoiseCancellationPlugin(data: ReadableMap, promise: Promise?) = impl.enableNoiseCancellationPlugin(data, promise)

  @ReactMethod
  fun disableNoiseCancellationPlugin(data: ReadableMap, promise: Promise?) = impl.disableNoiseCancellationPlugin(data, promise)

  @ReactMethod
  fun isNoiseCancellationPluginEnabled(data: ReadableMap, promise: Promise?) = impl.isNoiseCancellationPluginEnabled(data, promise)

  @ReactMethod
  fun isNoiseCancellationPluginAvailable(data: ReadableMap, promise: Promise?) = impl.isNoiseCancellationPluginAvailable(data, promise)

  @ReactMethod
  fun handleRealTimeTranscription(data: ReadableMap, promise: Promise?) = impl.handleRealTimeTranscription(data, promise)

  @ReactMethod
  fun setPermissionsAccepted(data: ReadableMap, promise: Promise?) = impl.setPermissionsAccepted(data, promise)

  @ReactMethod
  fun addListener(eventName: String) = impl.addListener(eventName)

  @ReactMethod
  fun removeListeners(count: Int) = impl.removeListeners(count)

}
