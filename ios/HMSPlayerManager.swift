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

//    @objc func capture(_ node: NSNumber, requestId: NSNumber) {
//        DispatchQueue.main.async {
//            if let component = self.bridge.uiManager.view(forReactTag: node) as? HmssdkDisplayView {
//                component.captureHmsView(requestId)
//            }
//        }
//    }
}

class HMSPlayer: UIView {
    lazy var hmsHLSPlayer = HMSHLSPlayer()

    var hmsCollection = [String: HMSRNSDK]()

    // Handle HMSRNSDK Instance in HLSPlayer instance
    func setHms(_ hmsInstance: [String: HMSRNSDK]) {
        hmsCollection = hmsInstance
    }
    
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

    // Mark: Constructor & Deconstructor
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.frame = frame

        let playerViewController = hmsHLSPlayer.videoPlayerViewController(showsPlayerControls: true)
        playerViewController.view.frame = self.bounds
        self.addSubview(playerViewController.view)
        
        self.backgroundColor = UIColor(displayP3Red: 0, green: 0, blue: 0, alpha: 1)

//        hmsHLSPlayer.translatesAutoresizingMaskIntoConstraints = false
//
//        hmsHLSPlayer.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
//        hmsHLSPlayer.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
//        hmsHLSPlayer.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
//        hmsHLSPlayer.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        hmsHLSPlayer.stop()
    }
}
