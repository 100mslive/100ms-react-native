package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext

/**
 * HMSHLSPlayerManagerImpl — shared view-manager logic for `<HMSHLSPlayer />`.
 *
 * Phase 1 / 1C-4 of the New Architecture migration. View-manager
 * responsibilities (creating/cleanup, prop dispatch, 13 commands, event
 * registration) live here as static helpers. Arch-specific wrappers at:
 *   - android/src/oldarch/.../HMSHLSPlayerManager.kt — paper, @ReactProp + numeric command IDs
 *   - android/src/newarch/.../HMSHLSPlayerManager.kt — Fabric, implements the
 *     Codegen-generated HMSHLSPlayerManagerInterface for typed prop + command dispatch
 */
class HMSHLSPlayerManagerImpl {
  companion object {
    const val REACT_CLASS = "HMSHLSPlayer"

    fun createViewInstance(reactContext: ThemedReactContext): HMSHLSPlayer = HMSHLSPlayer(reactContext)

    fun onDropViewInstance(view: HMSHLSPlayer) {
      view.cleanup()
    }

    // ─────────────────────────────────────────────────────────────────
    // Prop setters
    // ─────────────────────────────────────────────────────────────────

    fun setUrl(
      view: HMSHLSPlayer,
      data: String?,
    ) = view.play(data)

    fun setEnableStats(
      view: HMSHLSPlayer,
      data: Boolean,
    ) = view.enableStats(data)

    fun setEnableControls(
      view: HMSHLSPlayer,
      data: Boolean,
    ) = view.enableControls(data)

    // ─────────────────────────────────────────────────────────────────
    // Imperative commands (13)
    // ─────────────────────────────────────────────────────────────────

    fun play(
      view: HMSHLSPlayer,
      url: String?,
    ) = view.play(url)

    fun stop(view: HMSHLSPlayer) = view.stop()

    fun pause(view: HMSHLSPlayer) = view.pause()

    fun resume(view: HMSHLSPlayer) = view.resume()

    fun seekToLivePosition(view: HMSHLSPlayer) = view.seekToLivePosition()

    fun seekForward(
      view: HMSHLSPlayer,
      seconds: Double,
    ) = view.seekForward(seconds)

    fun seekBackward(
      view: HMSHLSPlayer,
      seconds: Double,
    ) = view.seekBackward(seconds)

    fun setVolume(
      view: HMSHLSPlayer,
      level: Int,
    ) = view.setVolume(level)

    fun areClosedCaptionSupported(
      view: HMSHLSPlayer,
      requestId: Int,
    ) = view.areClosedCaptionSupported(requestId)

    fun isClosedCaptionEnabled(
      view: HMSHLSPlayer,
      requestId: Int,
    ) = view.isClosedCaptionEnabled(requestId)

    fun enableClosedCaption(view: HMSHLSPlayer) = view.enableClosedCaption()

    fun disableClosedCaption(view: HMSHLSPlayer) = view.disableClosedCaption()

    fun getPlayerDurationDetails(
      view: HMSHLSPlayer,
      requestId: Int,
    ) = view.getPlayerDurationDetails(requestId)

    // ─────────────────────────────────────────────────────────────────
    // Paper-side dispatch helpers (used by the oldarch wrapper)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Numeric command IDs preserved from the original view manager so
     * paper-side dispatch keeps the same wire protocol.
     */
    fun getCommandsMap(): Map<String, Int> =
      MapBuilder
        .builder<String, Int>()
        .put("play", 10)
        .put("stop", 20)
        .put("pause", 30)
        .put("resume", 40)
        .put("seekToLivePosition", 50)
        .put("seekForward", 60)
        .put("seekBackward", 70)
        .put("setVolume", 80)
        .put("areClosedCaptionSupported", 90)
        .put("isClosedCaptionEnabled", 100)
        .put("enableClosedCaption", 110)
        .put("disableClosedCaption", 120)
        .put("getPlayerDurationDetails", 130)
        .build()

    /** Paper command dispatch by numeric ID. */
    fun receiveCommandById(
      view: HMSHLSPlayer,
      commandId: Int,
      args: ReadableArray?,
    ) {
      when (commandId) {
        10 -> play(view, args?.getString(0))
        20 -> stop(view)
        30 -> pause(view)
        40 -> resume(view)
        50 -> seekToLivePosition(view)
        60 -> args?.let { seekForward(view, it.getDouble(0)) }
        70 -> args?.let { seekBackward(view, it.getDouble(0)) }
        80 -> args?.let { setVolume(view, it.getInt(0)) }
        90 -> args?.let { areClosedCaptionSupported(view, it.getInt(0)) }
        100 -> args?.let { isClosedCaptionEnabled(view, it.getInt(0)) }
        110 -> enableClosedCaption(view)
        120 -> disableClosedCaption(view)
        130 -> args?.let { getPlayerDurationDetails(view, it.getInt(0)) }
      }
    }

    /** Fabric command dispatch by string name. */
    fun receiveCommandByName(
      view: HMSHLSPlayer,
      commandName: String,
      args: ReadableArray?,
    ) {
      when (commandName) {
        "play" -> play(view, args?.getString(0))
        "stop" -> stop(view)
        "pause" -> pause(view)
        "resume" -> resume(view)
        "seekToLivePosition" -> seekToLivePosition(view)
        "seekForward" -> args?.let { seekForward(view, it.getDouble(0)) }
        "seekBackward" -> args?.let { seekBackward(view, it.getDouble(0)) }
        "setVolume" -> args?.let { setVolume(view, it.getInt(0)) }
        "areClosedCaptionSupported" -> args?.let { areClosedCaptionSupported(view, it.getInt(0)) }
        "isClosedCaptionEnabled" -> args?.let { isClosedCaptionEnabled(view, it.getInt(0)) }
        "enableClosedCaption" -> enableClosedCaption(view)
        "disableClosedCaption" -> disableClosedCaption(view)
        "getPlayerDurationDetails" -> args?.let { getPlayerDurationDetails(view, it.getInt(0)) }
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Event registration — 4 events on `<HMSHLSPlayer />`
    // ─────────────────────────────────────────────────────────────────

    fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
      MapBuilder.of(
        HMSHLSPlayerConstants.HMS_HLS_PLAYBACK_EVENT,
        MapBuilder.of("registrationName", "onHmsHlsPlaybackEvent"),
        HMSHLSPlayerConstants.HMS_HLS_STATS_EVENT,
        MapBuilder.of("registrationName", "onHmsHlsStatsEvent"),
        HMSHLSPlayerConstants.HLS_DATA_REQUEST_EVENT,
        MapBuilder.of("registrationName", "onDataReturned"),
        HMSHLSPlayerConstants.HLS_PLAYER_CUES_EVENT,
        MapBuilder.of("registrationName", "onHlsPlayerCuesEvent"),
      )
  }
}
