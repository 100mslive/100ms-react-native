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
    var id: String = "12345"
    
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
    
    init(data: NSDictionary?, delegate manager: HmsManager?, uid id: String) {
        let videoSettings = HmsHelper.getLocalVideoSettings(data?.value(forKey: "video") as? NSDictionary)
        let audioSettings = HmsHelper.getLocalAudioSettings(data?.value(forKey: "audio") as? NSDictionary)
        DispatchQueue.main.async { [weak self] in
            let hmsTrackSettings = HMSTrackSettings(videoSettings: videoSettings, audioSettings: audioSettings)
            self?.hms = HMSSDK.build { sdk in
                sdk.trackSettings = hmsTrackSettings
            }
        }
        self.delegate = manager
        self.id = id
    }
    
    // MARK: - HMS SDK Actions

    func preview(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            let error = HMSError(id: "101", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let metadata = credentials.value(forKey: "metadata") as? String
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let endpoint = credentials.value(forKey: "endpoint") as? String {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, endpoint: endpoint)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            } else {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            }
        }
    }
    
    func join(_ credentials: NSDictionary) {
        
        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            let error = HMSError(id: "102", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }

        let metadata = credentials.value(forKey: "metadata") as? String
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let config = strongSelf.config {
                strongSelf.hms?.join(config: config, delegate: strongSelf)
            } else {
                if let endpoint = credentials.value(forKey: "endpoint") as? String {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, endpoint: endpoint)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                } else {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                }
            }
        }
    }
    
    func setLocalMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            let error = HMSError(id: "106", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localAudioTrack()?.setMute(isMute)
        }
    }
    
    func setLocalVideoMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            let error = HMSError(id: "107", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
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
            guard let strongSelf = self else { return }
            self?.config = nil
            self?.recentRoleChangeRequest = nil
            self?.recentChangeTrackStateRequest = nil
            self?.hms?.leave({ success, error in
                if(success){
                    resolve?("")
                }else{
                    strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HmsDecoder.getError(error), "id":strongSelf.id])
                    reject?(nil, "error in leave",nil)
                }
            })
        }
    }
    
    func sendBroadcastMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let message = data.value(forKey: "message") as? String
        else {
            let error = HMSError(id: "108", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.sendBroadcastMessage(type: type, message: message, completion: { message, error in
                if (error == nil) {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HmsDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                    return
                }
            })
        }
    }
    
    func sendGroupMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let message = data.value(forKey: "message") as? String,
              let targetedRoles = data.value(forKey: "roles") as? [String]
        else {
            let error = HMSError(id: "109", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HmsHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.sendGroupMessage(type: type, message: message, roles: encodedTargetedRoles, completion: { message, error in
                if (error == nil) {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HmsDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                    return
                }
            })
        }
    }
    
    func sendDirectMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let message = data.value(forKey: "message") as? String,
              let peerId = data.value(forKey: "peerId") as? String
        else {
            let error = HMSError(id: "110", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            guard let peer = HmsHelper.getRemotePeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers) else { return }
            self?.hms?.sendDirectMessage(type: type, message: message, peer: peer, completion: { message, error in
                if (error == nil) {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HmsDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                    return
                }
            })
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
    
    func changeRole(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        
        guard let peerId = data.value(forKey: "peerId") as? String,
              let role = data.value(forKey: "role") as? String
        else {
            let error = HMSError(id: "111", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let force = data.value(forKey: "force") as? Bool ?? false
        
        DispatchQueue.main.async { [weak self] in
            guard let peer = HmsHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers, localPeer:self?.hms?.localPeer),
            let role = HmsHelper.getRoleFromRoleName(role, roles: self?.hms?.roles)
            else { return }
            
            self?.hms?.changeRole(for: peer, to: role, force: force, completion: { success, error in
                if(success) {
                    resolve?(["success": true])
                } else{
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HmsDecoder.getError(error), "id":self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription,nil)
                }
            })
        }
    }
    
    func changeTrackState(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let error = HMSError(id: "112", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let mute = data.value(forKey: "mute") as? Bool ?? true
        
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers,
                  let track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)
            else { return }

            self?.hms?.changeTrackState(for: track, mute: mute, completion: { success, error in
                if(success) {
                    resolve?(["success": true])
                } else{
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HmsDecoder.getError(error), "id":self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }
    
    func changeTrackStateRoles(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        
        guard let source = data.value(forKey: "source") as? String,
                let targetedRoles = data.value(forKey: "roles") as? [String],
                    let type = data.value(forKey: "type") as? String
        else {
            let error = HMSError(id: "113", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
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
            self?.hms?.changeTrackState(mute: mute, for: decodeType, source: source, roles: encodedTargetedRoles, completion: { success, error in
                if(success) {
                    resolve?(["success": true])
                } else{
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HmsDecoder.getError(error), "id":self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription,nil)
                }
            })
        }
    }
    
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            reject?(nil, "NO_SDK_ID", nil)
            let error = HMSError(id: "114", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            guard let localPeer = self?.hms?.localPeer,
                let localTrack = HmsHelper.getLocalTrackFromTrackId(trackId, localPeer: localPeer)
            else {
                guard let remotePeers = self?.hms?.remotePeers,
                    let track = HmsHelper.getTrackFromTrackId(trackId, remotePeers)
                else {
                    let error = HMSError(id: "120", code: HMSErrorCode.genericErrorUnknown, message: "NOT_FOUND")
                    strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HmsDecoder.getError(error), "id":strongSelf.id])
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
    
    func removePeer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        
        guard let peerId = data.value(forKey: "peerId") as? String
        else {
            let error = HMSError(id: "115", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let reason = data.value(forKey: "reason") as? String
        
        DispatchQueue.main.async { [weak self] in

            guard let remotePeers = self?.hms?.remotePeers,
                  let peer = HmsHelper.getRemotePeerFromPeerId(peerId, remotePeers: remotePeers)
            else { return }
            
            self?.hms?.removePeer(peer, reason: reason ?? "Removed from room", completion: { success, error in
                if(success) {
                    resolve?(["success": true])
                } else{
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HmsDecoder.getError(error), "id":self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription,nil)
                }
            })
        }
    }
    
    
    func endRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        
        guard let lock = data.value(forKey: "lock") as? Bool,
                let reason = data.value(forKey: "reason") as? String
        else {
            let error = HMSError(id: "116", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.hms?.endRoom(lock: lock, reason: reason, completion: { success, error in
                if(success) {
                    resolve?(["success": true])
                } else{
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HmsDecoder.getError(error), "id":self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription,nil)
                }
            })
        }
    }
    
    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            reject?(nil, "NOT_FOUND", nil)
            let error = HMSError(id: "117", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            guard let remotePeers = self?.hms?.remotePeers
            else {
                let error = HMSError(id: "121", code: HMSErrorCode.genericErrorUnknown, message: "NOT_FOUND")
                strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HmsDecoder.getError(error), "id":strongSelf.id])
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
                let error = HMSError(id: "122", code: HMSErrorCode.genericErrorUnknown, message: "NOT_FOUND")
                strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HmsDecoder.getError(error), "id":strongSelf.id])
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
            let error = HMSError(id: "118", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
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
    
    func changeMetadata(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let metadata = data.value(forKey: "metadata") as? String
        else {
            let error = HMSError(id: "123", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            reject?(nil, "REQUIRED_KEYS_NOT_FOUND", nil)
            return
        }
        
        hms?.change(metadata: metadata, completion: { success, error in
            if (success) {
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HmsDecoder.getError(error), "id":self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }

    func setVolume(_ data: NSDictionary) {
        guard let trackId = data.value(forKey: "trackId") as? String,
              let volume = data.value(forKey: "volume") as? Double
        else {
            let error = HMSError(id: "124", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            let remotePeers = self?.hms?.remotePeers
        
            let remoteAudioTrack = HmsHelper.getRemoteAudioAuxiliaryTrackFromTrackId(trackId, remotePeers)
        
            if (remoteAudioTrack != nil) {
                remoteAudioTrack?.setVolume(volume)
            } else {
                let error = HMSError(id: "125", code: HMSErrorCode.genericErrorUnknown, message: "TRACK_ID_NOT_FOUND_IN_REMOTE_TRACKS")
                strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HmsDecoder.getError(error), "id":strongSelf.id])
            }
        }
    }
    
    func startRTMPOrRecording(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let record = data.value(forKey: "record") as? Bool
        else {
            let error = HMSError(id: "126", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let meetingString = data.value(forKey: "meetingURL") as? String
        let rtmpStrings = data.value(forKey: "rtmpURLs") as? [String]
        
        var meetingUrl: URL? = nil
        if let meetLink = meetingString {
            meetingUrl = URL(string: meetLink)
        } else {
            let error = HMSError(id: "127", code: HMSErrorCode.genericErrorUnknown, message: "INVALID_MEETING_URL_PASSED")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
        }
        
        let URLs = HmsHelper.getRtmpUrls(rtmpStrings)
        
        
        let config = HMSRTMPConfig(meetingURL: meetingUrl, rtmpURLs: URLs, record: record)
        hms?.startRTMPOrRecording(config: config, completion: { success, error in
            if (success) {
                let roomData = HmsDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)
                
                let localPeerData = HmsDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HmsDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HmsDecoder.getError(error), "id":self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }
    
    func stopRtmpAndRecording(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopRTMPAndRecording(completion: { success, error in
            if (success) {
                let roomData = HmsDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)
                
                let localPeerData = HmsDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HmsDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HmsDecoder.getError(error), "id":self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }
    
    func startHLSStreaming(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let meetingURLVariants = data.value(forKey: "meetingURLVariants") as? [[String: Any]]?
        else {
            let error = HMSError(id: "126", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
            return
        }
        
        let hlsMeetingUrlVariant = HmsHelper.getHMSHLSMeetingURLVariants(meetingURLVariants)
        let config = HMSHLSConfig(variants: hlsMeetingUrlVariant)
        
        hms?.startHLSStreaming(config: config, completion: { success, error in
            if (success) {
                let roomData = HmsDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.hlsStreamingStateUpdated)
                
                let localPeerData = HmsDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HmsDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HmsDecoder.getError(error), "id":self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }
    
    func stopHLSStreaming(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopHLSStreaming(config: nil, completion: { success, error in
            if (success) {
                let roomData = HmsDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)
                
                let localPeerData = HmsDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HmsDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HmsDecoder.getError(error), "id":self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }
    
    //TODO: to be implemented after volume is exposed for iOS
//    func getVolume(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
//        guard let trackId = data.value(forKey: "trackId") as? String
//        else {
//            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": "REQUIRED_KEYS_NOT_FOUND"])
//            reject?(nil, "REQUIRED_KEYS_NOT_FOUND", nil)
//            return
//        }
//
//
//        if (localPeer?.localAudioTrack()?.trackId == trackId) {
//
//        }
//    }
    
//    func setLocalVideoSettings(_ data: NSDictionary) {
//        let localVideoTrack = self.hms?.localPeer?.localVideoTrack()
//
//        guard let settings = HmsHelper.getLocalVideoSettings(data)
//        else {
//            //TODO: throw an error for invalid arguements
//            return
//        }
//        localVideoTrack?.settings = settings
//    }
    
    // MARK: - HMS SDK Delegate Callbacks
    
    func on(join room: HMSRoom) {
        // Callback from join action
        let roomData = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        let decodedRoles = HmsDecoder.getAllRoles(hms?.roles)
        
        self.delegate?.emitEvent(ON_JOIN, ["event": ON_JOIN, "id": self.id , "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "roles": decodedRoles])
    }
    
    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        let previewTracks = HmsDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HmsDecoder.getHmsRoom(room)
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        
        self.delegate?.emitEvent(ON_PREVIEW, ["event": ON_PREVIEW, "id": self.id , "room": hmsRoom, "previewTracks": previewTracks, "localPeer": localPeerData])
    }
    
    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        let roomData = HmsDecoder.getHmsRoom(room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        
        self.delegate?.emitEvent(ON_ROOM_UPDATE, ["event": ON_ROOM_UPDATE, "id": self.id , "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        let hmsPeer = HmsDecoder.getHmsPeer(peer)
                
        self.delegate?.emitEvent(ON_PEER_UPDATE, ["event": ON_PEER_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "peer": hmsPeer])
    }
    
    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        let roomData = HmsDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)
        
        let localPeerData = HmsDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HmsDecoder.getHmsRemotePeers(hms?.remotePeers)
        let hmsPeer = HmsDecoder.getHmsPeer(peer)
        let hmsTrack = HmsDecoder.getHmsTrack(track)
        
        self.delegate?.emitEvent(ON_TRACK_UPDATE, ["event": ON_TRACK_UPDATE, "id": self.id, "room": roomData, "type": type, "localPeer": localPeerData, "remotePeers": remotePeerData, "peer": hmsPeer, "track": hmsTrack])
    }
    
    func on(error: HMSError) {
        self.delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
    }
    
    func on(message: HMSMessage) {
        self.delegate?.emitEvent(ON_MESSAGE, ["event": ON_MESSAGE, "id": self.id , "sender": message.sender?.name ?? "", "time": message.time, "message": message.message, "type": message.type])
    }
    
    func on(updated speakers: [HMSSpeaker]) {
        var speakerPeerIds: [[String : Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HmsDecoder.getHmsPeer(speaker.peer), "level": speaker.level, "track": HmsDecoder.getHmsTrack(speaker.track)])
        }
        self.delegate?.emitEvent(ON_SPEAKER, ["event": ON_SPEAKER, "id": self.id , "count": speakers.count, "peers" :speakerPeerIds])
    }
    
    func onReconnecting() {
        self.delegate?.emitEvent(RECONNECTING, ["event": RECONNECTING, "id": self.id ])
    }
    
    func onReconnected() {
        self.delegate?.emitEvent(RECONNECTED, ["event": RECONNECTED, "id": self.id ])
    }
    
    func on(roleChangeRequest: HMSRoleChangeRequest) {
        let decodedRoleChangeRequest = HmsDecoder.getHmsRoleChangeRequest(roleChangeRequest, self.id)
        recentRoleChangeRequest = roleChangeRequest
        self.delegate?.emitEvent(ON_ROLE_CHANGE_REQUEST, decodedRoleChangeRequest)
    }
    
    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        let decodedChangeTrackStateRequest = HmsDecoder.getHmsChangeTrackStateRequest(changeTrackStateRequest, id)
        delegate?.emitEvent("ON_CHANGE_TRACK_STATE_REQUEST", decodedChangeTrackStateRequest)
        recentChangeTrackStateRequest = changeTrackStateRequest
    }
    
    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        let requestedBy = notification.requestedBy as HMSPeer?
        var decodedRequestedBy: [String: Any]? = nil
        if let requested = requestedBy {
            decodedRequestedBy = HmsDecoder.getHmsPeer(requested)
        }
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.delegate?.emitEvent(ON_REMOVED_FROM_ROOM, ["event": ON_REMOVED_FROM_ROOM, "id": self.id, "requestedBy": decodedRequestedBy as Any, "reason": reason, "roomEnded": roomEnded ])
    }
    
    
    // MARK: Helper Functions
    
    func muteAllPeersAudio(_ data: NSDictionary) {
        guard let mute = data.value(forKey: "mute") as? Bool
        else {
            let error = HMSError(id: "119", code: HMSErrorCode.genericErrorUnknown, message: "REQUIRED_KEYS_NOT_FOUND")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HmsDecoder.getError(error), "id":id])
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
        case .metadataUpdated:
            return "METADATA_CHANGED"
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
        case .hlsStreamingStateUpdated:
            return "HLS_STREAMING_STATE_UPDATED"
        case .rtmpStreamingStateUpdated:
            return "RTMP_STREAMING_STATE_UPDATED"
        case.serverRecordingStateUpdated:
            return "SERVER_RECORDING_STATE_UPDATED"
        default:
            return ""
        }
    }
}
