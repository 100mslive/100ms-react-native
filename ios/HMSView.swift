import HMSSDK
import AVKit

@objc(HMSView)
class HMSView: RCTViewManager {

    override func view() -> (HmssdkDisplayView) {
        let view = HmssdkDisplayView()
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

    @objc func capture(_ node: NSNumber, requestId: NSNumber) {
        DispatchQueue.main.async {
            if let component = self.bridge.uiManager.view(forReactTag: node) as? HmssdkDisplayView {
                component.captureHmsView(requestId)
            }
        }
    }
}

class HmssdkDisplayView: UIView {

    lazy var videoView: HMSVideoView = {
        return HMSVideoView()
    }()

    var hmsCollection = [String: HMSRNSDK]()

    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
    }

    @objc var onDataReturned: RCTDirectEventBlock?

    @objc var autoSimulcast: Boolean = true {
        didSet {
            videoView.disableAutoSimulcastLayerSelect = !autoSimulcast
        }
    }

    @objc var scaleType: String = "ASPECT_FILL" {
        didSet {
            switch scaleType {
                case "ASPECT_FIT":
                    videoView.videoContentMode = .scaleAspectFit
                    return
                case "ASPECT_FILL":
                    videoView.videoContentMode = .scaleAspectFill
                    return
                case "ASPECT_BALANCED":
                    videoView.videoContentMode = .center
                    return
                default:
                    return
            }
        }
    }

    @objc var data: NSDictionary = [:] {
        didSet {

            let sdkID = data.value(forKey: "id") as? String ?? "12345"

            guard let hmsSDK = hmsCollection[sdkID]?.hms,
                  let room = hmsSDK.room,
                  let trackID = data.value(forKey: "trackId") as? String
            else {
                print(#function, "Required data to setup video view not found")
                return
            }

            var videoTrack = HMSUtilities.getVideoTrack(for: trackID, in: room)

            // TODO: verify this implementation for getting video tracks
            if videoTrack == nil {
                for track in hmsCollection[sdkID]?.recentPreviewTracks ?? [] {
                    if track.trackId == trackID && track.kind == HMSTrackKind.video {
                        videoTrack = track as? HMSVideoTrack
                    }
                }
            }

            if videoTrack != nil {
                let mirror = data.value(forKey: "mirror") as? Bool
                if mirror != nil {
                    videoView.mirror = mirror!
                }
                videoView.setVideoTrack(videoTrack)
            } else {
                print(#function, "Required data to setup video view not found")
                return
            }
        }
    }

    @objc func captureHmsView( _ requestId: NSNumber) {
        guard let onDataReturnedUnwrapped = onDataReturned else {
            print(#function, "Can't send any data to JS side, `onDataReturned` is nil!")
            return
        }

        guard let image = videoView.captureSnapshot() else {
            print(#function, "Could not capture snapshot of HMSVideoView")
            onDataReturnedUnwrapped([ "requestId": requestId, "error": ["6001", "Could not capture snapshot of HMSVideoView"] ])
            return
        }

        guard let base64 = image.pngData()?.base64EncodedString() else {
            print(#function, "Could not create base64 encoded string of captured snapshot")
            onDataReturnedUnwrapped([ "requestId": requestId, "error": ["6001", "Could not create base64 encoded string of captured snapshot"] ])
            return
        }

        onDataReturnedUnwrapped([ "requestId": requestId, "result": base64 ])
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        self.addSubview(videoView)
        self.frame = frame
        self.backgroundColor = UIColor(displayP3Red: 0, green: 0, blue: 0, alpha: 1)

        videoView.translatesAutoresizingMaskIntoConstraints = false

        videoView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
        videoView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
        videoView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        videoView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        videoView.setVideoTrack(nil)
    }
}
