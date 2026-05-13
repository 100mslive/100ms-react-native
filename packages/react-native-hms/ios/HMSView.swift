import HMSSDK
import AVKit

@objc(HMSView)
public class HMSView: RCTViewManager {

    override public func view() -> (HmssdkDisplayView) {
        let view = HmssdkDisplayView()
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

    @objc public func capture(_ node: NSNumber, requestId: NSNumber) {
        DispatchQueue.main.async {
            // Under the New Architecture's Fabric path, the `capture`
            // imperative is dispatched directly to `HMSViewComponentView`
            // (see ios/HMSViewComponentView.mm) and this method is not
            // called. Under old arch and interop, we use self.bridge
            // (which is nil under bridgeless) to safely look up the view
            // by react tag. Under bridgeless mode, self.bridge is
            // nil and this code path is unreachable anyway because the
            // Fabric path is in use.
            guard let bridge = self.bridge else {
                // Bridgeless mode: self.bridge is nil and the Fabric path
                // (HMSViewComponentView.mm) handles `capture` directly. If
                // this old-arch fallback fires under bridgeless, something
                // has misregistered the command — log so it isn't silent.
                NSLog("[HMSView] capture: bridge is nil — Fabric path expected to handle this")
                return
            }
            guard let component = bridge.uiManager.view(forReactTag: node) as? HmssdkDisplayView else {
                NSLog("[HMSView] capture: no HmssdkDisplayView found for reactTag=\(node)")
                return
            }
            component.captureHmsView(requestId)
        }
    }
}

public class HmssdkDisplayView: UIView {

    lazy var videoView: HMSVideoView = {
        let videoView = HMSVideoView()
        videoView.videoContentMode = .scaleAspectFill
        videoView.mirror = false
        videoView.disableAutoSimulcastLayerSelect = false
        return videoView
    }()

    var hmsCollection = [String: HMSRNSDK]()

    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
    }

    @objc public var onDataReturned: RCTDirectEventBlock?

    @objc public var autoSimulcast: Bool = true {
        didSet {
            videoView.disableAutoSimulcastLayerSelect = !autoSimulcast
        }
    }

    @objc public var scaleType: String = "ASPECT_FILL" {
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
                    videoView.videoContentMode = .scaleAspectFill
                    return
            }
        }
    }

    @objc public var data: NSDictionary = [:] {
        didSet {

            if let mirror = data.value(forKey: "mirror") as? Bool {
                videoView.mirror = mirror
            }

            let sdkID = data.value(forKey: "id") as? String ?? "12345"

            guard let hmsSDK = hmsCollection[sdkID]?.hms,
                  let room = hmsSDK.room,
                  let trackID = data.value(forKey: "trackId") as? String
            else {
                print(#function, "Required data to setup video view not found")
                return
            }

            if let videoTrack = HMSUtilities.getVideoTrack(for: trackID, in: room) {
                videoView.setVideoTrack(videoTrack)
            } else if let videoTrack = getPreviewForRoleTrack(trackID) {
                videoView.setVideoTrack(videoTrack)
            } else {
                print(#function, "Could not find video track in room with trackID: \(trackID)")
                return
            }
        }
    }

    private func getPreviewForRoleTrack(_ trackID: String) -> HMSVideoTrack? {

        if let hmsRnSdk = hmsCollection["12345"] {
            if let tracks = hmsRnSdk.previewForRoleTracks {
                if let videoTrack = tracks.first(where: { $0.trackId == trackID }) as? HMSVideoTrack {
                    return videoTrack
                }
            }
        }

        return nil
    }

    @objc public func captureHmsView( _ requestId: NSNumber) {
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
