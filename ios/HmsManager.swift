import HMSSDK
import AVKit

@objc(HmsManager)
class HmsManager: RCTEventEmitter, HMSUpdateListener, HMSPreviewListener {
    var hms: HMSSDK?
    var config: HMSConfig?
    var recentRoleChangeRequest: HMSRoleChangeRequest?
    var ON_PREVIEW: String = "ON_PREVIEW"
    var ON_JOIN: String = "ON_JOIN"
    var ON_ROOM_UPDATE: String = "ON_ROOM_UPDATE"
    var ON_PEER_UPDATE: String = "ON_PEER_UPDATE"
    var ON_TRACK_UPDATE: String = "ON_TRACK_UPDATE"
    var ON_ROLE_CHANGE_REQUEST: String = "ON_ROLE_CHANGE_REQUEST"
    var ON_REMOVED_FROM_ROOM: String = "ON_REMOVED_FROM_ROOM"
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
        
        print("roles")
        let decodedRoles = HmsDecoder.getAllRoles(hms?.roles)
        print(decodedRoles)
        
        self.sendEvent(withName: ON_JOIN, body: ["event": ON_JOIN, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "roles": decodedRoles])
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
    
    func on(roleChangeRequest: HMSRoleChangeRequest) {
        let decodedRoleChangeRequest = HmsDecoder.getHmsRoleChangeRequest(roleChangeRequest)
        recentRoleChangeRequest = roleChangeRequest
        self.sendEvent(withName: ON_ROLE_CHANGE_REQUEST, body: decodedRoleChangeRequest)
    }
    
    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        print("On track state change required")
    }
    
    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        let requestedBy = notification.requestedBy
        let decodedRequestedBy = HmsDecoder.getHmsPeer(requestedBy)
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.sendEvent(withName: ON_REMOVED_FROM_ROOM, body: ["event": ON_REMOVED_FROM_ROOM, "requestedBy": decodedRequestedBy, "reason": reason, "roomEnded": roomEnded ])
    }
    
    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_REMOVED_FROM_ROOM]
    }
    
    @objc
    func build() {
        DispatchQueue.main.async { [weak self] in
            self?.hms = HMSSDK.build()
        }
    }
    
    @objc
    func preview(_ credentials: NSDictionary) {
        if let authToken = credentials.value(forKey: "authToken") as? String,
           let user = credentials.value(forKey: "userID") as? String,
           let room = credentials.value(forKey: "roomID") as? String {
            DispatchQueue.main.async { [weak self] in
                guard let strongSelf = self else { return }
                strongSelf.config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: authToken) //, endpoint: "https://qa-init.100ms.live/init"
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            }
        }
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        
        if let authToken = credentials.value(forKey: "authToken") as? String,
           let user = credentials.value(forKey: "username") as? String,
           let room = credentials.value(forKey: "roomID") as? String {
            
            DispatchQueue.main.async { [weak self] in
                guard let strongSelf = self else { return }
                if let config = strongSelf.config {
                    strongSelf.hms?.join(config: config, delegate: strongSelf)
                } else {
                    strongSelf.config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: authToken)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                }
            }
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
        DispatchQueue.main.async { [weak self] in
            self?.hms?.leave();
        }
    }
    
    @objc
    func sendBroadcastMessage(_ data: NSDictionary) {
        if let message = data.value(forKey: "message") as? String {
            let type = data.value(forKey: "type") as? String ?? "chat"
            DispatchQueue.main.async { [weak self] in
                self?.hms?.sendBroadcastMessage(type: type, message: message)
            }
        }
    }
    
    @objc
    func sendGroupMessage(_ data: NSDictionary) {
        if let message = data.value(forKey: "message") as? String,
           let targetedRoles = data.value(forKey: "roles") as? [String] {
            DispatchQueue.main.async { [weak self] in
                let encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
                self?.hms?.sendGroupMessage(message: message, roles: encodedTargetedRoles)
            }
        }
    }
    
    @objc
    func sendDirectMessage(_ data: NSDictionary) {
        if let message = data.value(forKey: "message") as? String,
           let peerId = data.value(forKey: "peerId") as? String {
            DispatchQueue.main.async { [weak self] in
                if let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers) {
                    self?.hms?.sendDirectMessage(message: message, peer: peer)
                }
            }
        }
    }
    
    @objc
    func acceptRoleChange() {
        if let roleChangeRequest = recentRoleChangeRequest {
            DispatchQueue.main.async { [weak self] in
                self?.hms?.accept(changeRole: roleChangeRequest)
                self?.recentRoleChangeRequest = nil
            }
        }
    }
    
    @objc
    func changeRole(_ data: NSDictionary) {
        let peerId = data.value(forKey: "peerId") as? String
        let role = data.value(forKey: "role") as? String
        let force = data.value(forKey: "force") as! Bool
        
        let hmsPeer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: hms?.remotePeers)
        let hmsRole = HmsHelper.getRoleFromRoleName(role, roles: hms?.roles)
        
        if let extractedHmsPeer = hmsPeer, let extractedHmsRole = hmsRole {
            DispatchQueue.main.async { [weak self] in
                self?.hms?.changeRole(for: extractedHmsPeer, to: extractedHmsRole, force: force)
            }
        }
    }
    
    @objc
    func changeTrackState(_ data: NSDictionary) {
        let trackId = data.value(forKey: "trackId") as? String
        let mute = data.value(forKey: "mute") as! Bool
        
        let remotePeers = hms?.remotePeers
        
        let hmsTrack = HmsHelper.getTrackFromTrackId(trackId, mute: mute, hmsRemotePeers: remotePeers)
        if let extractedHmsTrack = hmsTrack {
            DispatchQueue.main.async { [weak self] in
                self?.hms?.changeTrackState(for: extractedHmsTrack, mute: mute)
            }
        }
    }
    
    @objc
    func removePeer(_ data: NSDictionary) {
        let peerId = data.value(forKey: "peerId") as? String
        let reason = data.value(forKey: "reason") as? String
        
        let remotePeers = hms?.remotePeers
        
        let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: remotePeers)
        
        if let targetedPeer = peer {
            DispatchQueue.main.async { [weak self] in
                self?.hms?.removePeer(targetedPeer, reason: reason ?? "")
            }
        }
    }
    
    
    @objc
    func endRoom(_ data: NSDictionary) {
        let lock = data.value(forKey: "lock") as? Bool
        let reason = data.value(forKey: "reason") as? String
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.endRoom(lock: lock ?? false, reason: reason ?? "")
        }
    }
}
