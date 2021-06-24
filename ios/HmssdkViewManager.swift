import HMSSDK
import AVKit

@objc(HmssdkViewManager)
class HmssdkViewManager: RCTViewManager {

  override func view() -> (HmssdkView) {
    return HmssdkView()
  }
}

class HmssdkView : UIView {
    var hms: HMSSDK?
    var room: HMSRoom?
    var config: HMSConfig?
    var videoTracks = [HMSVideoTrack]()
    var initialized = false
    
    @objc var color: String = "" {
      didSet {
        self.backgroundColor = hexStringToUIColor(hexColor: color)
      }
    }

    @objc var authToken: String? {
      didSet {
        initializeSDK()
        // call the UICollectionView here
      }
    }

    let reuseIdentifier = "cell"
    var collectionView = UICollectionView(frame: CGRect(x: 0, y: 0, width: 350.0, height: 700.0), collectionViewLayout: UICollectionViewFlowLayout() )

    @objc var roomId: String? {
      didSet {
        initializeSDK()
        // nothing to do here but this room Id is required
      }
    }

    @objc var userId: String? {
      didSet {
        initializeSDK()
        // nothing to do here but this room Id is required
//        print("we are here in setting the label");
//        let labelView = UILabel()
//  //      labelView.text = userId
//        labelView.font = UIFont(name:"GillSans-Italic", size: 20)
//        labelView.backgroundColor = #colorLiteral(red: 0.8, green: 0.5, blue: 0.1, alpha: 1.0)
//        labelView.text="asudbansd"
//        print("updated everything")
//        print("userId \(String(describing: userId))")
//        let width = self.superview?.frame.size.width
//        let height = self.frame.size.height
//        print("\(width ?? 1000) \(height) width and height")
//        labelView.frame = CGRect(x: 0, y: 0, width: width ?? 0.0, height: height)
//        self.addSubview(labelView)
  //        labelView.frame = currentFrame!
      }
    }

    @objc var isMute: Bool = false {
      didSet {
        // set current user Mute
        hms?.localPeer?.localAudioTrack()?.setMute(isMute)
//        hms?.localPeer?.localVideoTrack()?.switchCamera()
      }
    }
    
    @objc var layout: NSDictionary? {
      didSet {
        // nothing to do here but this room Id is required
        let width: CGFloat = layout?.value(forKey: "width") as! CGFloat
        let height: CGFloat = layout?.value(forKey: "height") as! CGFloat
        collectionView.frame = CGRect(x: 0,y: 0, width: width, height: height)
      }
    }
    
    override init(frame: CGRect) {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            print(#function, "permission granted: ", granted)
        }
                
        AVCaptureDevice.requestAccess(for: .audio) { granted in
            print(#function, "permission granted: ", granted)
        }
        super.init(frame: frame)
        hms = HMSSDK.build()
        collectionView.backgroundColor=#colorLiteral(red: 0.1019607857, green: 0.2784313858, blue: 0.400000006, alpha: 1)
        self.addSubview(collectionView)
        self.frame = frame
        collectionView.delegate = self
        collectionView.dataSource = self
        collectionView.register(VideoCollectionViewCell.self, forCellWithReuseIdentifier: "videoCell")
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
      }

    func hexStringToUIColor(hexColor: String) -> UIColor {
        let stringScanner = Scanner(string: hexColor)

        if(hexColor.hasPrefix("#")) {
            stringScanner.scanLocation = 1
        }
        var color: UInt32 = 0
        stringScanner.scanHexInt32(&color)

        let r = CGFloat(Int(color >> 16) & 0x000000FF)
        let g = CGFloat(Int(color >> 8) & 0x000000FF)
        let b = CGFloat(Int(color) & 0x000000FF)

        return UIColor(red: r / 255.0, green: g / 255.0, blue: b / 255.0, alpha: 0.2)
    }
    
    func initializeSDK() {
        print("initialize SDK")
        print("\(authToken) \(userId) \(roomId)")
        if let jwtToken = authToken, let user = userId, let room = roomId {
            if initialized {
                print("already init")
            }
            else {
                initialized = true
                config = HMSConfig(userID: user, roomID: room, authToken: jwtToken)
                hms?.join(config: config!, delegate: self)
            }
        }
    }
}

extension HmssdkView: HMSUpdateListener {
    func on(join room: HMSRoom) {
        print("HMS Room")
        print(room)
        print(room.peers)
        updateViews()
    }
    
    func on(room: HMSRoom, update: HMSRoomUpdate) {
        print("HMS Room Update \(update)")
        updateViews()
    }
    
    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        print("HMS Peer update \(update)")
        updateViews()
    }
    
    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        updateViews()
    }
    
    func updateViews() {
        var newVideoTracks = [HMSVideoTrack]()
        if let localVideo = hms?.localPeer?.videoTrack {
            newVideoTracks.append(localVideo)
        }
        let newRemoteVideoTracks = hms?.remotePeers ?? []
        for item in newRemoteVideoTracks {
            if let remoteVideo = item.videoTrack {
                newVideoTracks.append(remoteVideo)
            }
        }
        videoTracks = newVideoTracks
        print(videoTracks, "videoTracks")
        DispatchQueue.main.async {
            self.collectionView.reloadData()
        }
    }
    
    func on(error: HMSError) {
        print("HMS Error")
    }
    
    func on(message: HMSMessage) {
        print("HMS Message")
    }
    
    func on(updated speakers: [HMSSpeaker]) {
        print("HMS Speaker")
    }
    
    func onReconnecting() {
        print("8")
    }
    
    func onReconnected() {
        print("9")
    }
}

extension HmssdkView: UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        print("collectionView length calculator \(videoTracks.count)")
        return videoTracks.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "videoCell", for: indexPath) as? VideoCollectionViewCell, indexPath.item < videoTracks.count else {
            return UICollectionViewCell()
        }
        print("collectionView Track finder")
        let track = videoTracks[indexPath.item]
        cell.videoView.setVideoTrack(track)
        
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        var result = CGSize.zero
        print("collectionView size finder")
        
        result.width = floor(collectionView.frame.size.width / 2.0 - 15.0)
        result.height = floor(collectionView.frame.size.height / 2.0)

        return result
    }
}
