package com.reactnativehmssdk

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

/**
 * HMSManager — new-arch wrapper for the HMSManager TurboModule.
 *
 * Phase 1 / 1C-2 of the New Architecture migration. This wrapper is compiled
 * only when the consumer's app uses new architecture (newArchEnabled=true).
 * It extends the Codegen-generated NativeHMSManagerSpec abstract class and
 * exposes all spec-declared methods as overrides that delegate to
 * HMSManagerImpl in src/main/.
 *
 * iOS-only methods (audio share, PiP, video plugin) are stubbed here as
 * Promise rejections — Android consumers should guard with Platform.OS
 * checks. Same pattern used in iOS HMSManager.mm for Android-only methods.
 *
 * The old-arch counterpart at src/oldarch/.../HMSManager.kt extends
 * ReactContextBaseJavaModule and forwards to the same impl.
 *
 * Pattern reference:
 * https://github.com/reactwg/react-native-new-architecture/blob/main/docs/backwards-compat-turbo-modules.md
 */
@ReactModule(name = HMSManagerImpl.REACT_CLASS)
class HMSManager(
  reactContext: ReactApplicationContext,
) : NativeHMSManagerSpec(reactContext) {
  private val impl = HMSManagerImpl(reactContext)

  override fun getName(): String = HMSManagerImpl.REACT_CLASS

  /**
   * Lifecycle hooks that consumer apps' MainActivity calls. Forward to
   * the Impl's companion-object methods for backward compatibility with
   * apps that already call HMSManager.onPictureInPictureModeChanged(...) etc.
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

    /** Backward-compat: external packages (e.g. react-native-video-plugin) read this map. */
    @JvmStatic
    val hmsCollection: MutableMap<String, HMSRNSDK>
      get() = HMSManagerImpl.hmsCollection
  }

  /** Used by view managers to look up the active SDK instances map. */
  fun getHmsInstance(): MutableMap<String, HMSRNSDK> = impl.getHmsInstance()

  override fun acceptRoleChange(data: ReadableMap, promise: Promise) = impl.acceptRoleChange(data, promise)

  override fun addKeyChangeListener(data: ReadableMap, promise: Promise) = impl.addKeyChangeListener(data, promise)

  override fun addListener(eventName: String) = impl.addListener(eventName)

  override fun addResponseOnPollQuestion(data: ReadableMap, promise: Promise) = impl.addResponseOnPollQuestion(data, promise)

  override fun audioShareCurrentTime(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "audioShareCurrentTime is iOS-only", null)
  }

  override fun audioShareDuration(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "audioShareDuration is iOS-only", null)
  }

  override fun audioShareIsPlaying(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "audioShareIsPlaying is iOS-only", null)
  }

  override fun build(data: ReadableMap, promise: Promise) = impl.build(data, promise)

  override fun cancelPreview(data: ReadableMap, promise: Promise) = impl.cancelPreview(data, promise)

  override fun captureImageAtMaxSupportedResolution(data: ReadableMap, promise: Promise) = impl.captureImageAtMaxSupportedResolution(data, promise)

  override fun changeIOSPIPVideoTrack(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "changeIOSPIPVideoTrack is iOS-only", null)
  }

  override fun changeMetadata(data: ReadableMap, promise: Promise) = impl.changeMetadata(data, promise)

  override fun changeName(data: ReadableMap, promise: Promise) = impl.changeName(data, promise)

  override fun changeRole(data: ReadableMap, promise: Promise) = impl.changeRole(data, promise)

  override fun changeRoleOfPeer(data: ReadableMap, promise: Promise) = impl.changeRoleOfPeer(data, promise)

  override fun changeRoleOfPeersWithRoles(data: ReadableMap, promise: Promise) = impl.changeRoleOfPeersWithRoles(data, promise)

  override fun changeTrackState(data: ReadableMap, promise: Promise) = impl.changeTrackState(data, promise)

  override fun changeTrackStateForRoles(data: ReadableMap, promise: Promise) = impl.changeTrackStateForRoles(data, promise)

  override fun changeVirtualBackground(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "changeVirtualBackground is iOS-only", null)
  }

  override fun checkNotifications(promise: Promise) = impl.checkNotifications(promise)

  override fun destroy(data: ReadableMap, promise: Promise) = impl.destroy(data, promise)

  override fun disableEvent(data: ReadableMap, promise: Promise) = impl.disableEvent(data, promise)

  override fun disableNetworkQualityUpdates(data: ReadableMap) = impl.disableNetworkQualityUpdates(data)

  override fun disableNoiseCancellationPlugin(data: ReadableMap, promise: Promise) = impl.disableNoiseCancellationPlugin(data, promise)

  override fun disableVideoPlugin(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "disableVideoPlugin is iOS-only", null)
  }

  override fun disposePIP(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "disposePIP is iOS-only", null)
  }

  override fun enableEvent(data: ReadableMap, promise: Promise) = impl.enableEvent(data, promise)

  override fun enableNetworkQualityUpdates(data: ReadableMap) = impl.enableNetworkQualityUpdates(data)

  override fun enableNoiseCancellationPlugin(data: ReadableMap, promise: Promise) = impl.enableNoiseCancellationPlugin(data, promise)

  override fun enableVideoPlugin(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "enableVideoPlugin is iOS-only", null)
  }

  override fun endRoom(data: ReadableMap, promise: Promise) = impl.endRoom(data, promise)

  override fun fetchLeaderboard(data: ReadableMap, promise: Promise) = impl.fetchLeaderboard(data, promise)

  override fun getAudioDevicesList(data: ReadableMap, promise: Promise) = impl.getAudioDevicesList(data, promise)

  override fun getAudioMixingMode(data: ReadableMap, promise: Promise) = impl.getAudioMixingMode(data, promise)

  override fun getAudioOutputRouteType(data: ReadableMap, promise: Promise) = impl.getAudioOutputRouteType(data, promise)

  override fun getAuthTokenByRoomCode(data: ReadableMap, promise: Promise) = impl.getAuthTokenByRoomCode(data, promise)

  override fun getLocalPeer(data: ReadableMap, promise: Promise) = impl.getLocalPeer(data, promise)

  override fun getPeerListIterator(data: ReadableMap): WritableMap? = impl.getPeerListIterator(data)

  override fun getPeerProperty(data: ReadableMap): WritableMap? = impl.getPeerProperty(data)

  override fun getRemoteAudioTrackFromTrackId(data: ReadableMap, promise: Promise) = impl.getRemoteAudioTrackFromTrackId(data, promise)

  override fun getRemotePeers(data: ReadableMap, promise: Promise) = impl.getRemotePeers(data, promise)

  override fun getRemoteVideoTrackFromTrackId(data: ReadableMap, promise: Promise) = impl.getRemoteVideoTrackFromTrackId(data, promise)

  override fun getRoles(data: ReadableMap, promise: Promise) = impl.getRoles(data, promise)

  override fun getRoom(data: ReadableMap, promise: Promise) = impl.getRoom(data, promise)

  override fun getRoomLayout(data: ReadableMap, promise: Promise) = impl.getRoomLayout(data, promise)

  override fun getRoomProperty(data: ReadableMap): WritableMap? = impl.getRoomProperty(data)

  override fun getSessionMetadataForKey(data: ReadableMap, promise: Promise) = impl.getSessionMetadataForKey(data, promise)

  override fun getSoftInputMode(): Double = impl.getSoftInputMode().toDouble()

  override fun getVideoTrackLayer(data: ReadableMap, promise: Promise) = impl.getVideoTrackLayer(data, promise)

  override fun getVideoTrackLayerDefinition(data: ReadableMap, promise: Promise) = impl.getVideoTrackLayerDefinition(data, promise)

  override fun getVolume(data: ReadableMap, promise: Promise) = impl.getVolume(data, promise)

  override fun handlePipActions(action: String, data: ReadableMap, promise: Promise) = impl.handlePipActions(action, data, promise)

  override fun handleRealTimeTranscription(data: ReadableMap, promise: Promise) = impl.handleRealTimeTranscription(data, promise)

  override fun hideSystemBars() = impl.hideSystemBars()

  override fun isAudioShared(data: ReadableMap, promise: Promise) = impl.isAudioShared(data, promise)

  override fun isMute(data: ReadableMap, promise: Promise) = impl.isMute(data, promise)

  override fun isNoiseCancellationPluginAvailable(data: ReadableMap, promise: Promise) = impl.isNoiseCancellationPluginAvailable(data, promise)

  override fun isNoiseCancellationPluginEnabled(data: ReadableMap, promise: Promise) = impl.isNoiseCancellationPluginEnabled(data, promise)

  override fun isPIPActive(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "isPIPActive is iOS-only", null)
  }

  override fun isPlaybackAllowed(data: ReadableMap, promise: Promise) = impl.isPlaybackAllowed(data, promise)

  override fun isScreenShared(data: ReadableMap, promise: Promise) = impl.isScreenShared(data, promise)

  override fun join(data: ReadableMap) = impl.join(data)

  override fun leave(data: ReadableMap, promise: Promise) = impl.leave(data, promise)

  override fun lowerLocalPeerHand(data: ReadableMap, promise: Promise) = impl.lowerLocalPeerHand(data, promise)

  override fun lowerRemotePeerHand(data: ReadableMap, promise: Promise) = impl.lowerRemotePeerHand(data, promise)

  override fun pauseAudioShare(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "pauseAudioShare is iOS-only", null)
  }

  override fun peerListIteratorHasNext(data: ReadableMap, promise: Promise) = impl.peerListIteratorHasNext(data, promise)

  override fun peerListIteratorNext(data: ReadableMap, promise: Promise) = impl.peerListIteratorNext(data, promise)

  override fun playAudioShare(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "playAudioShare is iOS-only", null)
  }

  override fun preview(data: ReadableMap) = impl.preview(data)

  override fun previewForRole(data: ReadableMap, promise: Promise) = impl.previewForRole(data, promise)

  override fun quickStartPoll(data: ReadableMap, promise: Promise) = impl.quickStartPoll(data, promise)

  override fun raiseLocalPeerHand(data: ReadableMap, promise: Promise) = impl.raiseLocalPeerHand(data, promise)

  override fun remoteMuteAllAudio(data: ReadableMap, promise: Promise) = impl.remoteMuteAllAudio(data, promise)

  override fun removeKeyChangeListener(data: ReadableMap, promise: Promise) = impl.removeKeyChangeListener(data, promise)

  override fun removeListeners(count: Double) = impl.removeListeners(count.toInt())

  override fun removePeer(data: ReadableMap, promise: Promise) = impl.removePeer(data, promise)

  override fun restrictData(data: ReadableMap, promise: Promise) = impl.restrictData(data, promise)

  override fun resumeAudioShare(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "resumeAudioShare is iOS-only", null)
  }

  override fun sendBroadcastMessage(data: ReadableMap, promise: Promise) = impl.sendBroadcastMessage(data, promise)

  override fun sendDirectMessage(data: ReadableMap, promise: Promise) = impl.sendDirectMessage(data, promise)

  override fun sendGroupMessage(data: ReadableMap, promise: Promise) = impl.sendGroupMessage(data, promise)

  override fun sendHLSTimedMetadata(data: ReadableMap, promise: Promise) = impl.sendHLSTimedMetadata(data, promise)

  override fun setActiveSpeakerInIOSPIP(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "setActiveSpeakerInIOSPIP is iOS-only", null)
  }

  override fun setAlwaysScreenOn(data: ReadableMap, promise: Promise) = impl.setAlwaysScreenOn(data, promise)

  override fun setAudioDeviceChangeListener(data: ReadableMap) = impl.setAudioDeviceChangeListener(data)

  override fun setAudioMixingMode(data: ReadableMap, promise: Promise) = impl.setAudioMixingMode(data, promise)

  override fun setAudioMode(data: ReadableMap, promise: Promise) = impl.setAudioMode(data, promise)

  override fun setAudioShareVolume(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "setAudioShareVolume is iOS-only", null)
  }

  override fun setLocalMute(data: ReadableMap) = impl.setLocalMute(data)

  override fun setLocalVideoMute(data: ReadableMap) = impl.setLocalVideoMute(data)

  override fun setPermissionsAccepted(data: ReadableMap, promise: Promise) = impl.setPermissionsAccepted(data, promise)

  override fun setPlaybackAllowed(data: ReadableMap, promise: Promise) = impl.setPlaybackAllowed(data, promise)

  override fun setPlaybackForAllAudio(data: ReadableMap, promise: Promise) = impl.setPlaybackForAllAudio(data, promise)

  override fun setSessionMetadataForKey(data: ReadableMap, promise: Promise) = impl.setSessionMetadataForKey(data, promise)

  override fun setSoftInputMode(inputMode: Double): Double = impl.setSoftInputMode(inputMode.toInt()).toDouble()

  override fun setVideoFilterParameter(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "setVideoFilterParameter is iOS-only", null)
  }

  override fun setVideoTrackLayer(data: ReadableMap, promise: Promise) = impl.setVideoTrackLayer(data, promise)

  override fun setVolume(data: ReadableMap, promise: Promise) = impl.setVolume(data, promise)

  override fun setupPIP(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "setupPIP is iOS-only", null)
  }

  override fun showSystemBars() = impl.showSystemBars()

  override fun startAudioshare(data: ReadableMap, promise: Promise) = impl.startAudioshare(data, promise)

  override fun startHLSStreaming(data: ReadableMap, promise: Promise) = impl.startHLSStreaming(data, promise)

  override fun startRTMPOrRecording(data: ReadableMap, promise: Promise) = impl.startRTMPOrRecording(data, promise)

  override fun startScreenshare(data: ReadableMap, promise: Promise) = impl.startScreenshare(data, promise)

  override fun startWhiteboard(data: ReadableMap, promise: Promise) = impl.startWhiteboard(data, promise)

  override fun stopAudioShare(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "stopAudioShare is iOS-only", null)
  }

  override fun stopAudioshare(data: ReadableMap, promise: Promise) = impl.stopAudioshare(data, promise)

  override fun stopHLSStreaming(data: ReadableMap, promise: Promise) = impl.stopHLSStreaming(data, promise)

  override fun stopPIP(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "stopPIP is iOS-only", null)
  }

  override fun stopPoll(data: ReadableMap, promise: Promise) = impl.stopPoll(data, promise)

  override fun stopRtmpAndRecording(data: ReadableMap, promise: Promise) = impl.stopRtmpAndRecording(data, promise)

  override fun stopScreenshare(data: ReadableMap, promise: Promise) = impl.stopScreenshare(data, promise)

  override fun stopWhiteboard(data: ReadableMap, promise: Promise) = impl.stopWhiteboard(data, promise)

  override fun switchAudioOutput(data: ReadableMap, promise: Promise) = impl.switchAudioOutput(data, promise)

  override fun switchAudioOutputUsingIOSUI(data: ReadableMap, promise: Promise) {
    promise.reject("NotImplemented", "switchAudioOutputUsingIOSUI is iOS-only", null)
  }

  override fun switchCamera(data: ReadableMap) = impl.switchCamera(data)

}
