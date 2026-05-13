import HMSSDK
import HMSHLSPlayerSDK
import AVKit.AVPlayerViewController

typealias HmsHlsPlayer = HMSHLSPlayerSDK.HMSHLSPlayer

@objc(HMSHLSPlayerManager)
public class HMSHLSPlayerManager: RCTViewManager {
    override public func view() -> (HMSHLSPlayer) {
        let view = HMSHLSPlayer()
        let hms = getHmsFromBridge()

        view.setHms(hms)

        return view
    }

    func getHmsFromBridge() -> [String: HMSRNSDK] {
        return HMSManager.shared?.hmsCollection ?? [String: HMSRNSDK]()
    }

    public override class func requiresMainQueueSetup() -> Bool {
        true
    }

    /// Look up the `HMSHLSPlayer` view for a given React tag and dispatch a
    /// command to it. Logs (instead of silently failing) when:
    ///   - `self.bridge` is nil — happens under bridgeless mode where the
    ///     Fabric path (HMSHLSPlayerComponentView) handles commands directly.
    ///     This old-arch fallback path firing under bridgeless indicates a
    ///     misregistration worth surfacing.
    ///   - No `HMSHLSPlayer` is found for the given React tag — the view may
    ///     have been detached, or the tag is invalid.
    /// Must be called on the main queue.
    private func withComponent(for node: NSNumber, command: String, _ block: (HMSHLSPlayer) -> Void) {
        guard let bridge = self.bridge else {
            NSLog("[HMSHLSPlayerManager] \(command): bridge is nil — Fabric path expected to handle this")
            return
        }
        guard let component = bridge.uiManager.view(forReactTag: node) as? HMSHLSPlayer else {
            NSLog("[HMSHLSPlayerManager] \(command): no HMSHLSPlayer found for reactTag=\(node)")
            return
        }
        block(component)
    }

    @objc public func play(_ node: NSNumber, url: String? = nil) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "play") { $0.play(url) }
        }
    }

    @objc public func stop(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "stop") { $0.stop() }
        }
    }

    @objc public func pause(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "pause") { $0.pause() }
        }
    }

    @objc public func resume(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "resume") { $0.resume() }
        }
    }

    @objc public func seekToLivePosition(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "seekToLivePosition") { $0.seekToLivePosition() }
        }
    }

    @objc public func seekForward(_ node: NSNumber, seconds: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "seekForward") { $0.seekForward(Double(truncating: seconds)) }
        }
    }

    @objc public func seekBackward(_ node: NSNumber, seconds: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "seekBackward") { $0.seekBackward(Double(truncating: seconds)) }
        }
    }

    @objc public func setVolume(_ node: NSNumber, level: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "setVolume") { $0.setVolume(Int(truncating: level)) }
        }
    }

    @objc public func areClosedCaptionSupported(_ node: NSNumber, requestId: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "areClosedCaptionSupported") {
                $0.areClosedCaptionSupported(requestId: UInt(truncating: requestId))
            }
        }
    }

    @objc public func isClosedCaptionEnabled(_ node: NSNumber, requestId: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "isClosedCaptionEnabled") {
                $0.isClosedCaptionEnabled(requestId: UInt(truncating: requestId))
            }
        }
    }

    @objc public func enableClosedCaption(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "enableClosedCaption") { $0.enableClosedCaption() }
        }
    }

    @objc public func disableClosedCaption(_ node: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "disableClosedCaption") { $0.disableClosedCaption() }
        }
    }

    @objc public func getPlayerDurationDetails(_ node: NSNumber, requestId: NSNumber) {
        DispatchQueue.main.async {
            self.withComponent(for: node, command: "getPlayerDurationDetails") {
                $0.getPlayerDurationDetails(requestId: UInt(truncating: requestId))
            }
        }
    }
}

public class HMSHLSPlayer: UIView {
    // MARK: class instance properties
    var hlsStatsTimerRef: Timer?
    var eventController: HLSPlaybackEventController?
    var hmsHLSPlayerViewController: AVPlayerViewController?
    lazy var hmsHLSPlayer = HmsHlsPlayer()

    // MARK: Handle HMSRNSDK Instance in HMSHLSPlayer instance
    var hmsCollection = [String: HMSRNSDK]()

    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
    }

    // MARK: Handle HMSHLSPlayer RN Component props

    @objc public var onDataReturned: RCTDirectEventBlock?

    @objc public var onHmsHlsPlaybackEvent: RCTDirectEventBlock?

    @objc public var onHmsHlsStatsEvent: RCTDirectEventBlock?

    @objc public var url: String? {
        didSet {
            play(url)
        }
    }

    @objc public var enableStats: Bool = false {
        didSet {
            if enableStats == true {
                attachHLSPlayerStatsListener()
            } else {
                // If we have existing Stats Timer, Invalidate it
                if let hlsStatsTimer = hlsStatsTimerRef {
                    hlsStatsTimer.invalidate()
                    hlsStatsTimerRef = nil
                }
            }
        }
    }

    @objc public var enableControls: Bool = true {
        didSet {
            hmsHLSPlayerViewController?.showsPlaybackControls = enableControls
        }
    }

    // MARK: Handle HMSHLSPlayer RN Component methods

    @objc public func play(_ url: String?) {
        if let validURLString = url, !validURLString.isEmpty {
            if let urlInstance = URL(string: validURLString) {
                hmsHLSPlayer.play(urlInstance)
            }
            return
        }

        guard let hlsStreamingState = hmsCollection["12345"]?.hms?.room?.hlsStreamingState else {
            return
        }

        if hlsStreamingState.state == .started && !hlsStreamingState.variants.isEmpty {
            hmsHLSPlayer.play(hlsStreamingState.variants[0].meetingURL)
        }
    }

    @objc public func stop() {
        hmsHLSPlayer.stop()
    }

    private func isCCSupported() -> Bool {
        guard let playerItem = hmsHLSPlayer._nativePlayer.currentItem else {
            return false
        }
        guard let mediaSelectionGroup = playerItem.asset.mediaSelectionGroup(forMediaCharacteristic: .legible) else {
            return false
        }
        guard let firstMediaSelectionGroupOption = mediaSelectionGroup.options.first else {
            return false
        }
        return firstMediaSelectionGroupOption.mediaType == .subtitle
    }

    private func isCCEnabled() -> Bool {
        guard let playerItem = hmsHLSPlayer._nativePlayer.currentItem else {
            return false
        }
        guard let subtitle = playerItem.asset.mediaSelectionGroup(forMediaCharacteristic: .legible) else {
            return false
        }
        let selectedOption = playerItem.currentMediaSelection.selectedMediaOption(in: subtitle)
        return selectedOption != nil
    }

    @objc public func areClosedCaptionSupported(requestId: UInt) {
        let supported = isCCSupported()

        sendRequestedDataToJS(requestId, supported)
    }

    @objc public func isClosedCaptionEnabled(requestId: UInt) {
        let enabled = isCCEnabled()

        sendRequestedDataToJS(requestId, enabled)
    }

    @objc public func enableClosedCaption() {
        if !isCCSupported() {
            print("#func Closed Caption is not supported")
            return
        }
        if isCCEnabled() {
            print("#func Closed Caption already enabled!")
            return
        }
        guard let playerItem = hmsHLSPlayer._nativePlayer.currentItem else {
            return
        }
        guard let subtitle = playerItem.asset.mediaSelectionGroup(forMediaCharacteristic: .legible) else {
            return
        }
        guard let firstSubtitleTrack = subtitle.options.first(where: {$0.mediaType == .subtitle}) else {
            return
        }
        playerItem.select(firstSubtitleTrack, in: subtitle)
    }

    @objc public func disableClosedCaption() {
        if !isCCSupported() {
            print("#func Closed Caption is not supported")
            return
        }
        if !isCCEnabled() {
            print("#func Closed Caption already disabled!")
            return
        }
        guard let playerItem = hmsHLSPlayer._nativePlayer.currentItem else {
            return
        }
        guard let subtitle = playerItem.asset.mediaSelectionGroup(forMediaCharacteristic: .legible) else {
            return
        }
        playerItem.select(nil, in: subtitle)
    }

    @objc public func getPlayerDurationDetails(requestId: UInt) {
        var map = [String: Any?]()
        guard let playerItem = hmsHLSPlayer._nativePlayer.currentItem else {
          sendRequestedDataToJS(requestId, map)
          return
        }
        // If duration is known
        if !playerItem.duration.isIndefinite {
            map["streamDuration"] = playerItem.duration.seconds
        }
        if let timeRange = playerItem.seekableTimeRanges.last as? CMTimeRange {
            map["rollingWindowTime"] = timeRange.duration.seconds * 1000
        }
        sendRequestedDataToJS(requestId, map)
    }

    @objc public func pause() {
        hmsHLSPlayer.pause()
    }

    @objc public func resume() {
        hmsHLSPlayer.resume()
    }

    @objc public func seekForward(_ seconds: Double) {
        hmsHLSPlayer.seekForward(seconds: seconds)
    }

    @objc public func seekBackward(_ seconds: Double) {
        hmsHLSPlayer.seekBackward(seconds: seconds)
    }

    @objc public func seekToLivePosition() {
        hmsHLSPlayer.seekToLivePosition()
    }

    @objc public func setVolume(_ level: Int) {
        hmsHLSPlayer.volume = level
    }

    // MARK: Lifecycle methods

    override init(frame: CGRect) {
        super.init(frame: frame)

        // setting properties on current UIView
        self.frame = frame
        self.backgroundColor = UIColor(displayP3Red: 0, green: 0, blue: 0, alpha: 1)

        if #available(iOS 15.0, *) {
            hmsHLSPlayer._nativePlayer.audiovisualBackgroundPlaybackPolicy = .continuesIfPossible
        }

        // creating 100ms HLS Player and getting player view controller
        let playerViewController = hmsHLSPlayer.videoPlayerViewController(showsPlayerControls: false)
        hmsHLSPlayerViewController = playerViewController
        playerViewController.view.frame = self.bounds

        // Setting 100ms HLS Player as subview of current UIView
        self.addSubview(playerViewController.view)

        attachPlayerPlaybackListeners()

        hmsHLSPlayerViewController?.showsPlaybackControls = false
        hmsHLSPlayerViewController?.allowsPictureInPicturePlayback = true
        if #available(iOS 14.2, *) {
            hmsHLSPlayerViewController?.canStartPictureInPictureAutomaticallyFromInline = true
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        cleanup()
    }

    // MARK: Utility functions
    public func cleanup() {
        hmsHLSPlayer.stop()

        // Remove HLS player playback events
        hmsHLSPlayer.delegate = nil

        // Remove HLS player stats timer
        hlsStatsTimerRef?.invalidate()
    }

    private func sendHLSPlaybackEventToJS(_ eventName: String, _ data: [String: Any]) {
        guard let onHmsHlsPlaybackEvent = onHmsHlsPlaybackEvent else { return }

        onHmsHlsPlaybackEvent(["event": eventName, "data": data])
    }

    private func sendRequestedDataToJS(_ requestId: UInt, _ data: Any) {
        guard let onDataReturned = onDataReturned else { return }

        onDataReturned(["requestId": requestId, "data": data])
    }

    private func sendHLSStatsEventToJS(_ eventName: String, _ data: [String: Any]) {
        guard let onHmsHlsStatsEvent = onHmsHlsStatsEvent else { return }

        onHmsHlsStatsEvent(["event": eventName, "data": data])
    }

    private func attachPlayerPlaybackListeners() {
        // Attaching HLS Player Playback Events Listener
        eventController = HLSPlaybackEventController(self)
        hmsHLSPlayer.delegate = eventController
    }

    private func attachHLSPlayerStatsListener() {
        // Only Attach listener, if there is no previously attached listener
        if hlsStatsTimerRef == nil {

            // Attaching HLS Player Stats Event Listener
            hlsStatsTimerRef = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
                guard let self = self, self.onHmsHlsStatsEvent != nil else { return }

                let statsMonitor = self.hmsHLSPlayer.statMonitor

                var data = [String: Any]()

                // bandwidth
                data["bandWidthEstimate"] = statsMonitor.estimatedBandwidth
                data["totalBytesLoaded"] = statsMonitor.bytesDownloaded

                // bufferedDuration
                data["bufferedDuration"] = statsMonitor.bufferedDuration

                // distanceFromLive
                data["distanceFromLive"] = statsMonitor.distanceFromLiveEdge

                // frameInfo
                data["droppedFrameCount"] = statsMonitor.droppedFrames

                // videoInfo
                data["averageBitrate"] = statsMonitor.bitrate
                data["videoHeight"] = statsMonitor.videoSize.height
                data["videoWidth"] = statsMonitor.videoSize.width

                self.sendHLSStatsEventToJS(HMSHLSPlayerConstants.ON_STATS_EVENT_UPDATE, data)
            }
        }
    }

    fileprivate func onCue(cue: HMSHLSCue) {
        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["id"] = cue.id
        data["startDate"] = String(cue.startDate.timeIntervalSince1970)
        if let endDate = cue.endDate {
            data["endDate"] = String(endDate.timeIntervalSince1970)
        }
        if let payload = cue.payload {
            data["payloadval"] = payload
        }

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_CUE_EVENT, data)
    }

    fileprivate func onPlaybackFailure(error: Error) {
        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["error"] = [
            "errorCode": error.localizedDescription,
            "errorCodeName": error.localizedDescription,
            "message": error.localizedDescription
        ]

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_FAILURE_EVENT, data)
    }

    fileprivate func onPlaybackStateChanged(state: HMSHLSPlaybackState) {
        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["state"] = state.description

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_STATE_CHANGE_EVENT, data)
    }

    fileprivate func onResolutionChanged(videoSize: CGSize) {
        if videoSize.width >= videoSize.height {
            hmsHLSPlayerViewController?.videoGravity = .resizeAspect
        } else {
            hmsHLSPlayerViewController?.videoGravity = .resizeAspectFill
        }

        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["width"] = videoSize.width
        data["height"] = videoSize.height

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_RESOLUTION_CHANGE_EVENT, data)
    }
}

class HLSPlaybackEventController: HMSHLSPlayerDelegate {
    weak var hmsHlsPlayerDelegate: HMSHLSPlayer?

    init(_ hmsPlayerDelegate: HMSHLSPlayer) {
        self.hmsHlsPlayerDelegate = hmsPlayerDelegate
    }

    public func onPlaybackStateChanged(state: HMSHLSPlaybackState) {
        hmsHlsPlayerDelegate?.onPlaybackStateChanged(state: state)
    }

    public func onCue(cue: HMSHLSCue) {
        hmsHlsPlayerDelegate?.onCue(cue: cue)
    }

    public func onPlaybackFailure(error: Error) {
        hmsHlsPlayerDelegate?.onPlaybackFailure(error: error)
    }

    public func onResolutionChanged(videoSize: CGSize) {
        hmsHlsPlayerDelegate?.onResolutionChanged(videoSize: videoSize)
    }
}

enum HMSHLSPlayerConstants {
    // HLS Playback Events
    static let ON_PLAYBACK_CUE_EVENT = "ON_PLAYBACK_CUE_EVENT"
    static let ON_PLAYBACK_FAILURE_EVENT = "ON_PLAYBACK_FAILURE_EVENT"
    static let ON_PLAYBACK_STATE_CHANGE_EVENT = "ON_PLAYBACK_STATE_CHANGE_EVENT"
    static let ON_PLAYBACK_RESOLUTION_CHANGE_EVENT = "ON_PLAYBACK_RESOLUTION_CHANGE_EVENT"

    // HLS Playback Stats Events
    static let ON_STATS_EVENT_UPDATE = "ON_STATS_EVENT_UPDATE"
}

extension HMSHLSPlaybackState: CustomStringConvertible {
    public var description: String {
        switch self {
        case .buffering:
            return "buffering"
        case .failed:
            return "failed"
        case .paused:
            return "paused"
        case .playing:
            return "playing"
        case .stopped:
            return "stopped"
        case .unknown:
            return "unknown"
        @unknown default:
            return "unknown"
        }
    }
}
