import HMSSDK
import AVKit

@objc(HmsManager)
class HmsManager: RCTEventEmitter, HMSUpdateListener, HMSPreviewListener {
    var hms: HMSSDK?
    var config: HMSConfig?
    var ON_PREVIEW: String = "ON_PREVIEW"
    var ON_JOIN: String = "ON_JOIN"
    var ON_ROOM_UPDATE: String = "ON_ROOM_UPDATE"
    var ON_PEER_UPDATE: String = "ON_PEER_UPDATE"
    var ON_TRACK_UPDATE: String = "ON_TRACK_UPDATE"
    var ON_ERROR: String = "ON_ERROR"
    var ON_MESSAGE: String = "ON_MESSAGE"
    var ON_SPEAKER: String = "ON_SPEAKER"
    var RECONNECTING: String = "RECONNECTING"
    var RECONNECTED: String = "RECONNECTED"
    
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
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)

        print(remotePeerData)
        print(localPeerData)
        
        self.sendEvent(withName: ON_JOIN, body: ["event": ON_JOIN, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        let previewTracks = HmsDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        
        self.sendEvent(withName: ON_PREVIEW, body: ["event": ON_PREVIEW, "room": hmsRoom, "previewTracks": previewTracks, "localPeer": localPeerData])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_ROOM_UPDATE, body: ["event": ON_ROOM_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        print(localPeerData)
        print(remotePeerData)
        
        print("data before")
        
        self.sendEvent(withName: ON_PEER_UPDATE, body: ["event": ON_PEER_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_TRACK_UPDATE, body: ["event": ON_TRACK_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(error: HMSError) {
        print("ERROR")
        self.sendEvent(withName: ON_ERROR, body: ["event": ON_ERROR, "error": error.description, "code": error.code.rawValue, "id": error.id, "message": error.message])
    }

    func on(message: HMSMessage) {
        print("Message")
        self.sendEvent(withName: ON_MESSAGE, body: ["event": ON_MESSAGE, "sender": message.sender?.name ?? "", "time": message.time, "message": message.message, "type": message.type])
    }

    func on(updated speakers: [HMSSpeaker]) {
        print("Speaker")
        var speakerPeerIds: [String] = []
        for speaker in speakers {
            speakerPeerIds.append(speaker.peer.peerID)
        }
        self.sendEvent(withName: ON_SPEAKER, body: ["event": ON_SPEAKER, "count": speakers.count, "peers" :speakerPeerIds])
    }

    func onReconnecting() {
        self.sendEvent(withName: RECONNECTING, body: ["event": RECONNECTING])
        print("Reconnecting")
    }

    func onReconnected() {
        self.sendEvent(withName: RECONNECTED, body: ["event": RECONNECTED])
        print("Reconnected")
    }

    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED]
    }
    
    @objc
    func build() {
        hms = HMSSDK.build()
    }
    
    @objc
    func preview(_ credentials: NSDictionary) {
        if let jwtToken = credentials.value(forKey: "authToken") as? String,
           let user = credentials.value(forKey: "userID") as? String,
           let room = credentials.value(forKey: "roomID") as? String {
            config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: jwtToken)
            hms?.preview(config: config!, delegate: self)
        }
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        if let jwtToken = credentials.value(forKey: "authToken") as! String?, let user = credentials.value(forKey: "userID") as! String?, let room = credentials.value(forKey: "roomID") as! String? {
            config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: jwtToken)
            hms?.join(config: config!, delegate: self)
        }
    }
    
    @objc
    func setLocalMute(_ isMute: Bool) {
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localAudioTrack()?.setMute(isMute)
        }
    }
    
    @objc
    func setLocalVideoMute(_ isMute: Bool) {
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localVideoTrack()?.setMute(isMute)
        }
    }
    
    @objc
    func switchCamera() {
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localVideoTrack()?.switchCamera()
        }
    }

    @objc
    func leave() {
        hms?.leave();
    }
    
    @objc
    func send(_ data: NSDictionary) {
        if let message = data.value(forKey: "message") as! String? {
            hms?.sendBroadcastMessage(message: message)
        }
    }
}
