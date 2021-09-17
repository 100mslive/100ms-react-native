import HMSSDK
import AVKit

@objc(HmsView)
class HmsView: RCTViewManager {

    override func view() -> (HmssdkDisplayView) {
        let view = HmssdkDisplayView()
        let hms = getHmsFromBridge()
        
        view.setHms(hms)
        
        return view;
    }
    
    func getHmsFromBridge() -> HMSSDK? {
        return (bridge.module(for: HmsManager.classForCoder()) as? HmsManager)?.hms
    }
}

class HmssdkDisplayView: UIView {
    lazy var videoView: HMSVideoView = {
        return HMSVideoView()
    }()

    var hms: HMSSDK?
    var localTrack: String? = nil
    var sinked: Bool = false
    var sinkVideo: Bool = true
    
    func setHms(_ hmsInstance: HMSSDK?) {
        self.hms = hmsInstance
    }
    
    @objc var data: NSDictionary = [:] {
        didSet {
            if let trackId = data.value(forKey: "trackId") as? String, let sink = data.value(forKey: "sink") as? Bool {
                sinkVideo = sink
                localTrack = trackId
                
                if let videoTrack = hms?.localPeer?.videoTrack {
                    if videoTrack.trackId == trackId {
                        if(!sinked && sinkVideo) {
                            videoView.setVideoTrack(videoTrack)
                            sinked = true
                        } else if(!sinkVideo){
                            videoView.setVideoTrack(nil)
                            sinked = false
                        }
                        return
                    }
                }
                if let remotePeers = hms?.remotePeers {
                    for peer in remotePeers {
                        if let remoteTrackId = peer.videoTrack?.trackId {
                            if remoteTrackId == trackId {
                                if(!sinked && sinkVideo) {
                                    videoView.setVideoTrack(peer.videoTrack)
                                    sinked = true
                                } else if(!sinkVideo){
                                    videoView.setVideoTrack(nil)
                                    sinked = false
                                }
                                return
                            }
                        }
                    }
                }
            }
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.addSubview(videoView)
        self.frame = frame

        print("frame initialized \(frame.height) \(frame.width)")
        
        videoView.translatesAutoresizingMaskIntoConstraints = false
        
        videoView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
        videoView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
        videoView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        videoView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
