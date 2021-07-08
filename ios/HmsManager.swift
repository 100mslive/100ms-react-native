import HMSSDK
import AVKit

@objc(HmsManager)
class HmsManager: RCTEventEmitter, HMSUpdateListener {
    var hms: HMSSDK?
    var config: HMSConfig?
    var ON_JOIN: String = "ON_JOIN"
    var ON_UPDATE: String = "ON_UPDATE"
    
    override init() {
        super.init()
        AVCaptureDevice.requestAccess(for: .video) { granted in
            // Permission Acquired if value of 'granted' is true
            print(#function, "permission granted: ", granted)
        }

        AVCaptureDevice.requestAccess(for: .audio) { granted in
            // Permission Acquired if value of 'granted' is true
            print(#function, "permission granted: ", granted)
        }
    }

    func on(join room: HMSRoom) {
        // Callback from join action
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let remoteTrackId = peer.videoTrack?.trackId
            if let trackId = remoteTrackId {
                remoteTracks.append(trackId)
            }
        }
        
        self.sendEvent(withName: ON_JOIN, body: ["event": "ON_JOIN", "trackId": room.peers[0].videoTrack?.trackId, "remoteTracks": remoteTracks])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        print("ROOM")
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        print("PEER")
    }

    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        print("TRACK")
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let trackId = peer.videoTrack?.trackId
            if let track = trackId {
                remoteTracks.append(track)
            }
        }
        self.sendEvent(withName: ON_JOIN, body: ["event": "ON_JOIN", "trackId": hms?.localPeer?.videoTrack?.trackId, "remoteTracks": remoteTracks])
    }

    // Update function that sync up current room configurations
    func updateViews() {
        print("In here")
    }

    func on(error: HMSError) {
        // TODO: errors to be handled here
    }

    func on(message: HMSMessage) {
        // TODO: HMS message handling
    }

    func on(updated speakers: [HMSSpeaker]) {
        // TODO: HMS speaker updates
    }

    func onReconnecting() {
        // TODO: Reconnection feedback to be dispatched from here
    }

    func onReconnected() {
        // TODO: Reconnected feedack to be dispatched from here
    }

    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_UPDATE]
    }
    
    @objc
    func build() {
        hms = HMSSDK.build()
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        if let jwtToken = credentials.value(forKey: "authToken") as! String?, let user = credentials.value(forKey: "userID") as! String?, let room = credentials.value(forKey: "roomID") as! String? {
            config = HMSConfig(userID: user, roomID: room, authToken: jwtToken)
            hms?.join(config: config!, delegate: self)
        }
    }
    
    @objc
    func setLocalMute(_ isMute: Bool) {
        hms?.localPeer?.localAudioTrack()?.setMute(isMute)
    }
    
    @objc
    func setLocalVideoMute(_ isMute: Bool) {
        hms?.localPeer?.localVideoTrack()?.setMute(isMute)
    }
    
    @objc
    func switchCamera() {
        hms?.localPeer?.localVideoTrack()?.switchCamera()
    }
    
    @objc
    func getTrackIds(_ callback: RCTResponseSenderBlock) {
        let localTrackId = hms?.localPeer?.videoTrack?.trackId;
        
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let trackId = peer.videoTrack?.trackId
            
            remoteTracks.append(trackId!)
        }
        
        print(localTrackId)
        print(remoteTracks)
        let returnObject: NSDictionary = ["remoteTracks" : remoteTracks, "localTrackId": localTrackId ?? ""]
        callback([returnObject])
    }
}
