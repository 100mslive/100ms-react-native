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
    
    func setHms(_ hmsInstance: HMSSDK?) {
        self.hms = hmsInstance
    }
    
    @objc var trackId: String = "" {
        didSet {
            if let videoTrack = hms?.localPeer?.videoTrack {
                if videoTrack.trackId == trackId {
                    videoView.setVideoTrack(videoTrack)
                    return
                }
            }
            if let remotePeers = hms?.remotePeers {
                for peer in remotePeers {
                    let auxTracks = peer.auxiliaryTracks
                    if let auxTracksVals = auxTracks {
                        for track in auxTracksVals {
                            if (track.source == .screen) {
                                videoView.setVideoTrack(track as? HMSVideoTrack)
                                return
                            }
                        }
                    }
                    if let remoteTrackId = peer.videoTrack?.trackId {
                        if remoteTrackId == trackId {
                            videoView.setVideoTrack(peer.videoTrack)
                            return
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
