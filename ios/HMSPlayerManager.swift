import HMSSDK
import HMSHLSPlayerSDK

@objc(HMSPlayerManager)
class HMSPlayerManager: RCTViewManager {
    override func view() -> (HMSPlayer) {
        let view = HMSPlayer()
        let hms = getHmsFromBridge()

        view.setHms(hms)

        return view
    }

    func getHmsFromBridge() -> [String: HMSRNSDK] {
        let collection = (bridge.module(for: HMSManager.classForCoder()) as? HMSManager)?.hmsCollection ?? [String: HMSRNSDK]()
        return collection
    }

    override class func requiresMainQueueSetup() -> Bool {
        true
    }
}

class HMSPlayer: UIView {
    // MARK: class instance properties
    var hlsStatsTimerRef: Timer? = nil
    var eventController: HLSPlaybackEventController? = nil
    lazy var hmsHLSPlayer = HMSHLSPlayer()

    // MARK: Handle HMSRNSDK Instance in HLSPlayer instance
    var hmsCollection = [String: HMSRNSDK]()

    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
    }

    // MARK: Handle HMSPlayer RN Component props

    @objc var onHmsHlsPlaybackEvent: RCTDirectEventBlock?

    @objc var onHmsHlsStatsEvent: RCTDirectEventBlock?

    // TODO: Handle the case when Stream is started after HLSPlayer has mounted
    @objc var url: String? = nil {
        didSet {
            if let validURLString = url, !validURLString.isEmpty {
                if let urlInstance = URL(string: validURLString) {
                    hmsHLSPlayer.play(urlInstance)
                }
                return
            }
            
            guard let hlsStreamingState = hmsCollection["12345"]?.hms?.room?.hlsStreamingState else {
                return
            }

            if hlsStreamingState.running && !hlsStreamingState.variants.isEmpty {
                hmsHLSPlayer.play(hlsStreamingState.variants[0].meetingURL)
            }
        }
    }

    @objc var enableStats: Bool = false {
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

    // MARK: Constructor & Deconstructor

    override init(frame: CGRect) {
        super.init(frame: frame)

        // setting properties on current UIView
        self.frame = frame
        self.backgroundColor = UIColor(displayP3Red: 0, green: 0, blue: 0, alpha: 1)

        // creating 100ms HLS Player
        let playerViewController = hmsHLSPlayer.videoPlayerViewController(showsPlayerControls: true)
        playerViewController.view.frame = self.bounds

        // Setting 100ms HLS Player as subview of current UIView
        self.addSubview(playerViewController.view)
        
        // TODO: Set Default Aspect Ratio
//        playerViewController.player.

        attachPlayerPlaybackListeners()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        cleanup()
    }

    // MARK: Utility functions
    func cleanup() {
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
                data["watchDuration"] = statsMonitor.watchDuration

                // distanceFromLive
                data["distanceFromLive"] = statsMonitor.distanceFromLiveEdge

                // frameInfo
                data["droppedFrameCount"] = statsMonitor.droppedFrames

                // videoInfo
                data["averageBitrate"] = statsMonitor.bitrate
                data["videoHeight"] = statsMonitor.videoSize.height
                data["videoWidth"] = statsMonitor.videoSize.width

                self.sendHLSStatsEventToJS(HMSPlayerConstants.ON_STATS_EVENT_UPDATE, data)
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

        sendHLSPlaybackEventToJS(HMSPlayerConstants.ON_PLAYBACK_CUE_EVENT, data)
    }

    fileprivate func onPlaybackFailure(error: Error) {
        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["error"] = [
            "errorCode": error.localizedDescription,
            "errorCodeName": error.localizedDescription,
            "message": error.localizedDescription,
        ]

        sendHLSPlaybackEventToJS(HMSPlayerConstants.ON_PLAYBACK_FAILURE_EVENT, data)
    }

    fileprivate func onPlaybackStateChanged(state: HMSHLSPlaybackState) {
        guard onHmsHlsPlaybackEvent != nil else { return }

        var data = [String: Any]()

        data["state"] = state.description

        sendHLSPlaybackEventToJS(HMSPlayerConstants.ON_PLAYBACK_STATE_CHANGE_EVENT, data)
    }
}

class HLSPlaybackEventController: HMSHLSPlayerDelegate {
    weak var hmsPlayerDelegate: HMSPlayer? = nil

    init(_ hmsPlayerDelegate: HMSPlayer) {
        self.hmsPlayerDelegate = hmsPlayerDelegate
    }

    func onPlaybackStateChanged(state: HMSHLSPlaybackState) {
        hmsPlayerDelegate?.onPlaybackStateChanged(state: state)
    }

    func onCue(cue: HMSHLSCue) {
        hmsPlayerDelegate?.onCue(cue: cue)
    }

    func onPlaybackFailure(error: Error) {
        hmsPlayerDelegate?.onPlaybackFailure(error: error)
    }
}

enum HMSPlayerConstants {
    // HLS Playback Events
    static let ON_PLAYBACK_CUE_EVENT = "ON_PLAYBACK_CUE_EVENT"
    static let ON_PLAYBACK_FAILURE_EVENT = "ON_PLAYBACK_FAILURE_EVENT"
    static let ON_PLAYBACK_STATE_CHANGE_EVENT = "ON_PLAYBACK_STATE_CHANGE_EVENT"

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
