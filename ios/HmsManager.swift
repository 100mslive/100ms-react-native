
import HMSSDK

@objc(HmsManager)
class HmsManager: RCTEventEmitter, HMSUpdateListener, HMSPreviewListener {
    
    var hms: HMSSDK?
    var config: HMSConfig?
    var recentRoleChangeRequest: HMSRoleChangeRequest?
    var recentChangeTrackStateRequest: HMSChangeTrackStateRequest?
    
    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "ON_PEER_UPDATE"
    let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
    let ON_CHANGE_TRACK_STATE_REQUEST = "ON_CHANGE_TRACK_STATE_REQUEST"
    let ON_REMOVED_FROM_ROOM = "ON_REMOVED_FROM_ROOM"
    let ON_ERROR = "ON_ERROR"
    let ON_MESSAGE = "ON_MESSAGE"
    let ON_SPEAKER = "ON_SPEAKER"
    let RECONNECTING = "RECONNECTING"
    let RECONNECTED = "RECONNECTED"
    
    // MARK: - Setup
    
    override init() {
        super.init()
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        true
    }
    
    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_CHANGE_TRACK_STATE_REQUEST, ON_REMOVED_FROM_ROOM]
    }
    
    
    // MARK: - HMS SDK Actions
    
    @objc
    func build() {
        DispatchQueue.main.async { [weak self] in
            self?.hms = HMSSDK.build()
        }
    }
    
    @objc
    func preview(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "userID") as? String,
              let room = credentials.value(forKey: "roomID") as? String
        else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let endpoint = credentials.value(forKey: "endpoint") as? String {
                strongSelf.config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: authToken, endpoint: endpoint)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            } else {
                strongSelf.config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: authToken)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            }
        }
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String,
              let room = credentials.value(forKey: "roomID") as? String
        else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let config = strongSelf.config {
                strongSelf.hms?.join(config: config, delegate: strongSelf)
            } else {
                if let endpoint = credentials.value(forKey: "endpoint") as? String {
                    strongSelf.config = HMSConfig(userName: user, userID: UUID().uuidString, roomID: room, authToken: authToken, endpoint: endpoint)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
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
        guard let message = data.value(forKey: "message") as? String
        else {
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.sendBroadcastMessage(type: type, message: message)
        }
    }
    
    @objc
    func sendGroupMessage(_ data: NSDictionary) {
        guard let message = data.value(forKey: "message") as? String,
              let targetedRoles = data.value(forKey: "roles") as? [String]
        else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.sendGroupMessage(message: message, roles: encodedTargetedRoles)
        }
    }
    
    @objc
    func sendDirectMessage(_ data: NSDictionary) {
        guard let message = data.value(forKey: "message") as? String,
              let peerId = data.value(forKey: "peerId") as? String
        else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers) else { return }
            self?.hms?.sendDirectMessage(message: message, peer: peer)
        }
    }
    
    @objc
    func acceptRoleChange() {
        
        DispatchQueue.main.async { [weak self] in
            
            guard let request = self?.recentRoleChangeRequest else { return }
            
            self?.hms?.accept(changeRole: request)
            
            self?.recentRoleChangeRequest = nil
        }
    }
    
    @objc
    func changeRole(_ data: NSDictionary) {
        
        guard let peerId = data.value(forKey: "peerId") as? String,
              let role = data.value(forKey: "role") as? String
        else {
            return
        }
        
        let force = data.value(forKey: "force") as? Bool ?? false
        
        DispatchQueue.main.async { [weak self] in
            guard let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers),
            let role = HmsHelper.getRoleFromRoleName(role, roles: self?.hms?.roles)
            else { return }
        
            self?.hms?.changeRole(for: peer, to: role, force: force)
        }
    }
    
    @objc
    func changeTrackState(_ data: NSDictionary) {
        
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            return
        }
        
        let mute = data.value(forKey: "mute") as? Bool ?? true
        
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers,
                  let track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)
            else { return }

            self?.hms?.changeTrackState(for: track, mute: mute)
        }
    }
    
    @objc
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            reject?(nil, "NOT_FOUND", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let localPeer = self?.hms?.localPeer,
                let localTrack = HmsHelper.getLocalTrackFromTrackId(trackId, localPeer: localPeer)
            else {
                guard let remotePeers = self?.hms?.remotePeers,
                    let track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)
                else {
                    reject?(nil, "NOT_FOUND", nil)
                    return
                }
                let mute = track.isMute()
                resolve?(mute)
                return
            }
            let mute = localTrack.isMute()
            resolve?(mute)
        }
    }
    
    @objc
    func removePeer(_ data: NSDictionary) {
        
        
        
        guard let peerId = data.value(forKey: "peerId") as? String
        else {
            return
        }
        
        let reason = data.value(forKey: "reason") as? String
        
        DispatchQueue.main.async { [weak self] in

            guard let remotePeers = self?.hms?.remotePeers,
                  let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: remotePeers)
            else { return }
            
            self?.hms?.removePeer(peer, reason: reason ?? "Removed from room")
        }
    }
    
    
    @objc
    func endRoom(_ data: NSDictionary) {
        
        let lock = data.value(forKey: "lock") as? Bool
        let reason = data.value(forKey: "reason") as? String
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.endRoom(lock: lock ?? false, reason: reason ?? "Room was ended")
        }
    }
    
    // MARK: - HMS SDK Delegate Callbacks
    
    func on(join room: HMSRoom) {
        // Callback from join action
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        let decodedRoles = HmsDecoder.getAllRoles(hms?.roles)
        
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
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_ROOM_UPDATE, body: ["event": ON_ROOM_UPDATE, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
                
        self.sendEvent(withName: ON_PEER_UPDATE, body: ["event": ON_PEER_UPDATE, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_TRACK_UPDATE, body: ["event": ON_TRACK_UPDATE, "room": roomData, "type": type, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(error: HMSError) {
        self.sendEvent(withName: ON_ERROR, body: ["event": ON_ERROR, "error": error.description, "code": error.code.rawValue, "id": error.id, "message": error.message])
    }
    
    func on(message: HMSMessage) {
        self.sendEvent(withName: ON_MESSAGE, body: ["event": ON_MESSAGE, "sender": message.sender?.name ?? "", "time": message.time, "message": message.message, "type": message.type])
    }
    
    func on(updated speakers: [HMSSpeaker]) {
        var speakerPeerIds: [[String : Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HmsDecoder.getHmsPeer(speaker.peer), "level": speaker.level, "track": HmsDecoder.getHmsTrack(speaker.track)])
        }
        self.sendEvent(withName: ON_SPEAKER, body: ["event": ON_SPEAKER, "count": speakers.count, "peers" :speakerPeerIds])
    }
    
    func onReconnecting() {
        self.sendEvent(withName: RECONNECTING, body: ["event": RECONNECTING])
    }
    
    func onReconnected() {
        self.sendEvent(withName: RECONNECTED, body: ["event": RECONNECTED])
    }
    
    func on(roleChangeRequest: HMSRoleChangeRequest) {
        let decodedRoleChangeRequest = HmsDecoder.getHmsRoleChangeRequest(roleChangeRequest)
        recentRoleChangeRequest = roleChangeRequest
        self.sendEvent(withName: ON_ROLE_CHANGE_REQUEST, body: decodedRoleChangeRequest)
    }
    
    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        if(!changeTrackStateRequest.mute){
            let decodedChangeTrackStateRequest = HmsDecoder.getHmsChangeTrackStateRequest(changeTrackStateRequest)
            recentChangeTrackStateRequest = changeTrackStateRequest
            self.sendEvent(withName: ON_CHANGE_TRACK_STATE_REQUEST, body: decodedChangeTrackStateRequest)
        }
    }
    
    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        let requestedBy = notification.requestedBy
        let decodedRequestedBy = HmsDecoder.getHmsPeer(requestedBy)
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.sendEvent(withName: ON_REMOVED_FROM_ROOM, body: ["event": ON_REMOVED_FROM_ROOM, "requestedBy": decodedRequestedBy, "reason": reason, "roomEnded": roomEnded ])
    }
    
    
    // MARK: Helper Functions
    
    @objc
    func muteAllPeersAudio(_ mute: Bool) {
        DispatchQueue.main.async { [weak self] in
            let remotePeers = self?.hms?.remotePeers
            for peer in remotePeers ?? [] {
                peer.remoteAudioTrack()?.setPlaybackAllowed(!mute)
            }
        }
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.sendEvent(withName: ON_PEER_UPDATE, body: ["event": ON_PEER_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    private func getString(from update: HMSPeerUpdate) -> String {
        switch update {
        case .peerJoined:
            return "PEER_JOINED"
        case .peerLeft:
            return "PEER_LEFT"
        case .roleUpdated:
            return "ROLE_CHANGED"
        default:
            return ""
        }
    }
    
    private func getString(from update: HMSTrackUpdate) -> String {
        switch update {
        case .trackAdded:
            return "TRACK_ADDED"
        case .trackRemoved:
            return "TRACK_REMOVED"
        case .trackMuted:
            return "TRACK_MUTED"
        case .trackUnmuted:
            return "TRACK_UNMUTED"
        case .trackDescriptionChanged:
            return "TRACK_DESCRIPTION_CHANGED"
        case .trackDegraded:
            return "TRACK_DEGRADED"
        case .trackRestored:
            return "TRACK_RESTORED"
        default:
            return ""
        }
    }
    
    func getString(from update: HMSRoomUpdate) -> String {
        switch update {
        case .roomTypeChanged:
            return "ROOM_TYPE_CHANGED"
        case .metaDataUpdated:
            return "META_DATA_CHANGED"
        case .browserRecordingStateUpdated:
            return "BROWSER_RECORDING_STATE_UPDATED"
        case .rtmpStreamingStateUpdated:
            return "RTMP_STREAMING_STATE_UPDATED"
        case.serverRecordingStateUpdated:
            return "SERVER_RECORDING_STATE_UPDATED"
        default:
            return ""
        }
    }
}
