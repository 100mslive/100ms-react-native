import HMSSDK
import AVKit

@objc(HmssdkDisplayView)
class HmssdkDisplayView: UIView {

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

    @objc var onDataReturned: RCTDirectEventBlock?

    @objc var autoSimulcast: Bool = true {
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
                    videoView.videoContentMode = .scaleAspectFill
                    return
            }
        }
    }

    @objc var data: NSDictionary = [:] {
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
