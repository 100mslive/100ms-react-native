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
        let collection: [String: HMSRNSDK] = (bridge.module(for: HmsManager.classForCoder()) as? HmsManager)?.hmsCollection ?? [:]
        return collection
    }

    override class func requiresMainQueueSetup() -> Bool {
        true
    }
}

class HmssdkDisplayView: UIView {

    lazy var videoView: HMSVideoView = {
        return HMSVideoView()
    }()

    var hmsCollection: [String: HMSRNSDK] = [:]

    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
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
                  let trackID = data.value(forKey: "trackId") as? String
            else {
                print(#function, "Required data to setup video view not found")
                return
            }
            
            var videoTrack = HMSUtilities.getVideoTrack(for: trackID, in: hmsSDK.room!)
            
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

