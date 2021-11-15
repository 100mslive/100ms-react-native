//
//  Hmssdk.swift
//  Hmssdk
//
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import HMSSDK
class HmsSDK: HMSUpdateListener, HMSPreviewListener {
    
    var hms: HMSSDK?
    var config: HMSConfig?
    var recentRoleChangeRequest: HMSRoleChangeRequest?
    var recentChangeTrackStateRequest: HMSChangeTrackStateRequest?
    var delegate: HmsManager?
    var id: String?
    
    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "ON_PEER_UPDATE"
    let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
    let ON_REMOVED_FROM_ROOM = "ON_REMOVED_FROM_ROOM"
    let ON_ERROR = "ON_ERROR"
    let ON_MESSAGE = "ON_MESSAGE"
    let ON_SPEAKER = "ON_SPEAKER"
    let RECONNECTING = "RECONNECTING"
    let RECONNECTED = "RECONNECTED"
    
    // MARK: - Setup
    
    init(delegate manager: HmsManager?, uid id: String) {
        DispatchQueue.main.async { [weak self] in
            self?.hms = HMSSDK.build()
        }
        self.delegate = manager
        self.id = id
    }
    
    // MARK: - HMS SDK Actions
        
    func preview(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let endpoint = credentials.value(forKey: "endpoint") as? String {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken, endpoint: endpoint)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            } else {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            }
        }
    }
    
    func join(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let config = strongSelf.config {
                do{
                    try strongSelf.hms?.join(config: config, delegate: strongSelf)
                } catch let error{
                    strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": error.localizedDescription])
                }
            } else {
                if let endpoint = credentials.value(forKey: "endpoint") as? String {
                    do{
                        strongSelf.config = HMSConfig(userName: user, authToken: authToken, endpoint: endpoint)
                        try strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                    } catch let error{
                        strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": error.localizedDescription])
                    }
                } else {
                    do{
                        strongSelf.config = HMSConfig(userName: user, authToken: authToken)
                        try strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                    } catch let error{
                        strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": error.localizedDescription])
                    }
                }
            }
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let config = strongSelf.config {
                strongSelf.hms?.join(config: config, delegate: strongSelf)
            } else {
                if let endpoint = credentials.value(forKey: "endpoint") as? String {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken, endpoint: endpoint)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                } else {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                }
            }
        }
    }
    
    func setLocalMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localAudioTrack()?.setMute(isMute)
        }
    }
    
    func setLocalVideoMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localVideoTrack()?.setMute(isMute)
        }
    }
    
    func switchCamera() {
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localVideoTrack()?.switchCamera()
        }
    }
    
    func leave(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
            self?.config = nil
            self?.recentRoleChangeRequest = nil
            self?.recentChangeTrackStateRequest = nil
            self?.hms?.leave({ success, error in
                if(success){
                    resolve?("")
                }else{
                    reject?(nil, "error in leave",nil)
                }
            })
        }
    }
    
    func sendBroadcastMessage(_ data: NSDictionary) {
        guard let message = data.value(forKey: "message") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.sendBroadcastMessage(type: type, message: message)
        }
    }
    
    func sendGroupMessage(_ data: NSDictionary) {
        guard let message = data.value(forKey: "message") as? String,
              let targetedRoles = data.value(forKey: "roles") as? [String]
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.sendGroupMessage(type: type, message: message, roles: encodedTargetedRoles)
        }
    }
    
    func sendDirectMessage(_ data: NSDictionary) {
        guard let message = data.value(forKey: "message") as? String,
              let peerId = data.value(forKey: "peerId") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            guard let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers) else { return }
            self?.hms?.sendDirectMessage(type: type, message: message, peer: peer)
        }
    }
    
    func acceptRoleChange() {
        
        DispatchQueue.main.async { [weak self] in
            
            guard let request = self?.recentRoleChangeRequest else { return }
            
            self?.hms?.accept(changeRole: request)
            
            self?.recentRoleChangeRequest = nil
        }
    }
    
    func changeRole(_ data: NSDictionary) {
        
        guard let peerId = data.value(forKey: "peerId") as? String,
              let role = data.value(forKey: "role") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
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
    
    func changeTrackState(_ data: NSDictionary) {
        
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
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
    
    func changeTrackStateRoles(_ data: NSDictionary) {
        
        guard let source = data.value(forKey: "source") as? String,
                let targetedRoles = data.value(forKey: "roles") as? [String],
                    let type = data.value(forKey: "type") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        var decodeType: HMSTrackKind;
        if( type == "AUDIO") {
            decodeType = HMSTrackKind.audio
        }else {
            decodeType = HMSTrackKind.video
        }
        let mute = data.value(forKey: "mute") as? Bool ?? true
        
        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.changeTrackState(mute: mute, for: decodeType, source: source, roles: encodedTargetedRoles)
        }
    }
    
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            reject?(nil, "NO_SDK_ID", nil)
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
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
    
    func removePeer(_ data: NSDictionary) {
        
        guard let peerId = data.value(forKey: "peerId") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
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
    
    
    func endRoom(_ data: NSDictionary) {
        
        guard let lock = data.value(forKey: "lock") as? Bool,
                let reason = data.value(forKey: "reason") as? String
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.endRoom(lock: lock ?? false, reason: reason ?? "Room was ended")
        }
    }
    
    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            reject?(nil, "NOT_FOUND", nil)
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers
            else {
                reject?(nil, "NOT_FOUND", nil)
                return
            }
            let remoteAudioTrack = HmsHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
            let remoteVideoTrack = HmsHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            if (remoteAudioTrack != nil) {
                let isPlaybackAllowed = remoteAudioTrack?.isPlaybackAllowed()
                resolve?(isPlaybackAllowed)
                return
            } else if (remoteVideoTrack != nil) {
                let isPlaybackAllowed = remoteVideoTrack?.isPlaybackAllowed()
                resolve?(isPlaybackAllowed)
                return
            } else {
                reject?(nil, "NOT_FOUND",nil)
                return
            }
        }
    }
    
    func getRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        
        resolve?(roomData)
    }
    
    func setPlaybackAllowed(_ data: NSDictionary) {
        guard let trackId = data.value(forKey: "trackId") as? String,
              let playbackAllowed = data.value(forKey: "playbackAllowed") as? Bool
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers
            else {
                return
            }
            let remoteAudioTrack = HmsHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
            let remoteVideoTrack = HmsHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            if (remoteAudioTrack != nil) {
                if(playbackAllowed){
                    remoteAudioTrack?.setPlaybackAllowed(playbackAllowed)
                }else {
                    remoteAudioTrack?.setPlaybackAllowed(playbackAllowed)
                }
            } else if (remoteVideoTrack != nil) {
                remoteVideoTrack?.setPlaybackAllowed(playbackAllowed)
            }
        }
    }
    
    func setLocalVideoSettings(_ data: NSDictionary) {
        let localVideoTrack = self.hms?.localPeer?.localVideoTrack()
        //TODO: get settings object and assign it to settings
//        let settings = HmsHelper.getLocalVideoSettings(data)
    }
    
    // MARK: - HMS SDK Delegate Callbacks
    
    func on(join room: HMSRoom) {
        // Callback from join action
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        let decodedRoles = HmsDecoder.getAllRoles(hms?.roles)
        
        self.delegate?.emitEvent(ON_JOIN, ["event": ON_JOIN, "id": self.id ?? "", "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "roles": decodedRoles])
    }
    
    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        let previewTracks = HmsDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        
        self.delegate?.emitEvent(ON_PREVIEW, ["event": ON_PREVIEW, "id": self.id ?? "", "room": hmsRoom, "previewTracks": previewTracks, "localPeer": localPeerData])
    }
    
    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        let roomData = HmsDecoder.getHmsRoom(room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.delegate?.emitEvent(ON_ROOM_UPDATE, ["event": ON_ROOM_UPDATE, "id": self.id ?? "", "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
                
        self.delegate?.emitEvent(ON_PEER_UPDATE, ["event": ON_PEER_UPDATE, "id": self.id ?? "", "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.delegate?.emitEvent(ON_TRACK_UPDATE, ["event": ON_TRACK_UPDATE, "id": self.id ?? "", "room": roomData, "type": type, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(error: HMSError) {
        let hmsError = HmsDecoder.getError(error)
        self.delegate?.emitEvent(ON_ERROR, hmsError)
    }
    
    func on(message: HMSMessage) {
        self.delegate?.emitEvent(ON_MESSAGE, ["event": ON_MESSAGE, "id": self.id ?? "", "sender": message.sender?.name ?? "", "time": message.time, "message": message.message, "type": message.type])
    }
    
    func on(updated speakers: [HMSSpeaker]) {
        var speakerPeerIds: [[String : Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HmsDecoder.getHmsPeer(speaker.peer), "level": speaker.level, "track": HmsDecoder.getHmsTrack(speaker.track)])
        }
        self.delegate?.emitEvent(ON_SPEAKER, ["event": ON_SPEAKER, "id": self.id ?? "", "count": speakers.count, "peers" :speakerPeerIds])
    }
    
    func onReconnecting() {
        self.delegate?.emitEvent(RECONNECTING, ["event": RECONNECTING, "id": self.id ?? ""])
    }
    
    func onReconnected() {
        self.delegate?.emitEvent(RECONNECTED, ["event": RECONNECTED, "id": self.id ?? ""])
    }
    
    func on(roleChangeRequest: HMSRoleChangeRequest) {
        let decodedRoleChangeRequest = HmsDecoder.getHmsRoleChangeRequest(roleChangeRequest, self.id)
        recentRoleChangeRequest = roleChangeRequest
        self.delegate?.emitEvent(ON_ROLE_CHANGE_REQUEST, decodedRoleChangeRequest)
    }
    
    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        // On track state change required
    }
    
    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        let requestedBy = notification.requestedBy
        let decodedRequestedBy = HmsDecoder.getHmsPeer(requestedBy)
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.delegate?.emitEvent(ON_REMOVED_FROM_ROOM, ["event": ON_REMOVED_FROM_ROOM, "id": self.id ?? "", "requestedBy": decodedRequestedBy, "reason": reason, "roomEnded": roomEnded ])
    }
    
    
    // MARK: Helper Functions
    
    func muteAllPeersAudio(_ data: NSDictionary) {
        guard let mute = data.value(forKey: "mute") as? Bool
        else {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            let remotePeers = self?.hms?.remotePeers
            for peer in remotePeers ?? [] {
                peer.remoteAudioTrack()?.setPlaybackAllowed(!mute)
            }
        }
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.delegate?.emitEvent(ON_PEER_UPDATE, ["event": ON_PEER_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
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
