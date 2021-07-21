import HMSSDK
import AVKit

@objc(HmsManager)
class HmsManager: RCTEventEmitter, HMSUpdateListener {
    var hms: HMSSDK?
    var config: HMSConfig?
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
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let remoteTrackId = peer.videoTrack?.trackId
            if let trackId = remoteTrackId {
                remoteTracks.append(trackId)
            }
        }
        
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_JOIN, body: ["event": ON_JOIN, "trackId": hms?.localPeer?.videoTrack?.trackId ?? false, "remoteTracks": remoteTracks, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        print("ROOM")
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let remoteTrackId = peer.videoTrack?.trackId
            if let trackId = remoteTrackId {
                remoteTracks.append(trackId)
            }
        }

        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_ROOM_UPDATE, body: ["event": ON_ROOM_UPDATE, "trackId": hms?.localPeer?.videoTrack?.trackId ?? false, "remoteTracks": remoteTracks, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        print("PEER")
        let remotePeers = hms?.remotePeers
        var remoteTracks: [String] = []
        for peer in remotePeers ?? [] {
            let trackId = peer.videoTrack?.trackId
            if let track = trackId {
                remoteTracks.append(track)
            }
        }
        
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_PEER_UPDATE, body: ["event": ON_PEER_UPDATE, "trackId": hms?.localPeer?.videoTrack?.trackId ?? false, "remoteTracks": remoteTracks, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
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
        
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_TRACK_UPDATE, body: ["event": ON_TRACK_UPDATE, "trackId": hms?.localPeer?.videoTrack?.trackId ?? false, "remoteTracks": remoteTracks, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(error: HMSError) {
        print("ERROR")
        self.sendEvent(withName: ON_ERROR, body: ["event": ON_ERROR, "error": error.description])
        // TODO: errors to be handled here
    }

    func on(message: HMSMessage) {
        print("Message")
        self.sendEvent(withName: ON_MESSAGE, body: ["event": ON_MESSAGE, "sender": message.sender, "time": message.time])
        // TODO: HMS message handling
    }

    func on(updated speakers: [HMSSpeaker]) {
        print("Speaker")
        var speakerPeerIds: [String] = []
        for speaker in speakers {
            speakerPeerIds.append(speaker.peerID)
        }
        self.sendEvent(withName: ON_SPEAKER, body: ["event": ON_SPEAKER, "count": speakers.count, "peers" :speakerPeerIds])
        // TODO: HMS speaker updates
    }

    func onReconnecting() {
        self.sendEvent(withName: RECONNECTING, body: ["event": RECONNECTING])
        print("Reconnecting")
        // TODO: Reconnection feedback to be dispatched from here
    }

    func onReconnected() {
        self.sendEvent(withName: RECONNECTED, body: ["event": RECONNECTED])
        print("Reconnected")
        // TODO: Reconnected feedack to be dispatched from here
    }

    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED]
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
            
            if let track = trackId {
                remoteTracks.append(track)
            }
        }
        let returnObject: NSDictionary = ["remoteTracks" : remoteTracks, "localTrackId": localTrackId ?? ""]
        callback([returnObject])
    }

    @objc
    func leave() {
        print("inside leave function")
        hms?.leave();
    }
}
