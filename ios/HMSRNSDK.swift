//
//  Hmssdk.swift
//  Hmssdk
//
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import HMSSDK

class HMSRNSDK: HMSUpdateListener, HMSPreviewListener {

    var hms: HMSSDK?
    var config: HMSConfig?
    var recentRoleChangeRequest: HMSRoleChangeRequest?
    var delegate: HMSManager?
    var id: String = "12345"
    var rtcStatsAttached = false
    var recentPreviewTracks: [HMSTrack]? = []
    private var reconnectingStage: Bool = false

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
    let ON_RTC_STATS = "ON_RTC_STATS"
    let ON_LOCAL_AUDIO_STATS = "ON_LOCAL_AUDIO_STATS"
    let ON_LOCAL_VIDEO_STATS = "ON_LOCAL_VIDEO_STATS"
    let ON_REMOTE_AUDIO_STATS = "ON_REMOTE_AUDIO_STATS"
    let ON_REMOTE_VIDEO_STATS = "ON_REMOTE_VIDEO_STATS"

    // MARK: - Setup

    init(data: NSDictionary?, delegate manager: HMSManager?, uid id: String) {
        let videoSettings = HMSHelper.getLocalVideoSettings(data?.value(forKey: "video") as? NSDictionary)
        let audioSettings = HMSHelper.getLocalAudioSettings(data?.value(forKey: "audio") as? NSDictionary)
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

    private var previewInProgress = false

    func emitRequiredKeysError(_ error: String) {
        delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": ["code": HMSErrorCode.genericErrorUnknown, "description": error, "localizedDescription": error, "debugDescription": error, "message": error, "name": "REQUIRED_KEYS_NOT_FOUND", "action": "SEND_ALL_REQUIRED_KEYS", "id": 102], "id": id])
    }

    func preview(_ credentials: NSDictionary) {

        guard !previewInProgress else {
            let error = HMSError(id: "PREVIEW", code: .joinErrorServer, message: "PREVIEW_IS_IN_PROGRESS", params: ["function": #function, "credentials": credentials])
            on(error: error)
            return
        }

        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            let errorMessage = "preview: " + HMSHelper.getUnavailableRequiredKey(credentials, ["authToken", "username"])
            emitRequiredKeysError(errorMessage)
            return
        }

        let metadata = credentials.value(forKey: "metadata") as? String
        let captureNetworkQualityInPreview = credentials.value(forKey: "captureNetworkQualityInPreview") as? Bool ?? false
        
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let endpoint = credentials.value(forKey: "endpoint") as? String {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, endpoint: endpoint, captureNetworkQualityInPreview: captureNetworkQualityInPreview)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            } else {
                strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, captureNetworkQualityInPreview: captureNetworkQualityInPreview)
                strongSelf.hms?.preview(config: strongSelf.config!, delegate: strongSelf)
            }
            strongSelf.previewInProgress = true
        }
    }
    
    func previewForRole(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let role = data.value(forKey: "role") as? String
        else {
            let errorMessage = "previewForRole: " + HMSHelper.getUnavailableRequiredKey(data, ["role"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        
        let roleObj = HMSHelper.getRoleFromRoleName(role, roles: hms?.roles)
        
        if let extractedRole = roleObj {
            hms?.preview(role: extractedRole, completion: { tracks, error in
                if (error != nil) {
                    delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HMSDecoder.getError(error), "id": id])
                    reject?(error?.message, error?.localizedDescription, nil)
                    return
                }
                self.recentPreviewTracks = tracks
                
                let decodedTracks = HMSDecoder.getAllTracks(tracks ?? [])
                
                resolve?(["success": true, "tracks": decodedTracks])
                return
            })
        }
    }
    
    func cancelPreview() {
        self.recentPreviewTracks = []
        hms?.cancelPreview()
    }

    func join(_ credentials: NSDictionary) {

        guard !previewInProgress else {
            let error = HMSError(id: "PREVIEW", code: .joinErrorServer, message: "PREVIEW_IS_IN_PROGRESS", params: ["function": #function, "credentials": credentials])
            on(error: error)
            return
        }

        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            let errorMessage = "join: " + HMSHelper.getUnavailableRequiredKey(credentials, ["authToken", "username"])
            emitRequiredKeysError(errorMessage)
            return
        }

        let metadata = credentials.value(forKey: "metadata") as? String
        let captureNetworkQualityInPreview = credentials.value(forKey: "captureNetworkQualityInPreview") as? Bool ?? false

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            if let config = strongSelf.config {
                strongSelf.hms?.join(config: config, delegate: strongSelf)
            } else {
                if let endpoint = credentials.value(forKey: "endpoint") as? String {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, endpoint: endpoint, captureNetworkQualityInPreview: captureNetworkQualityInPreview)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                } else {
                    strongSelf.config = HMSConfig(userName: user, authToken: authToken, metadata: metadata, captureNetworkQualityInPreview: captureNetworkQualityInPreview)
                    strongSelf.hms?.join(config: strongSelf.config!, delegate: strongSelf)
                }
            }
        }
    }

    func setLocalMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            let errorMessage = "setLocalMute: " + HMSHelper.getUnavailableRequiredKey(data, ["isMute"])
            emitRequiredKeysError(errorMessage)
            return
        }

        DispatchQueue.main.async { [weak self] in
            self?.hms?.localPeer?.localAudioTrack()?.setMute(isMute)
        }
    }

    func setLocalVideoMute(_ data: NSDictionary) {
        guard let isMute = data.value(forKey: "isMute") as? Bool
        else {
            let errorMessage = "setLocalVideoMute: " + HMSHelper.getUnavailableRequiredKey(data, ["isMute"])
            emitRequiredKeysError(errorMessage)
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
        if(reconnectingStage) {
            reject?("101", "Still in reconnecting stage", nil)
        } else {
            DispatchQueue.main.async { [weak self] in
                guard let strongSelf = self else { return }
                self?.config = nil
                self?.recentRoleChangeRequest = nil
                self?.hms?.leave({ success, error in
                    if success {
                        resolve?("")
                    } else {
                        strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HMSDecoder.getError(error), "id": strongSelf.id])
                        reject?(nil, "error in leave", nil)
                    }
                })
            }
        }
    }

    func sendBroadcastMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let message = data.value(forKey: "message") as? String
        else {
            let errorMessage = "sendBroadcastMessage: " + HMSHelper.getUnavailableRequiredKey(data, ["message"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let type = data.value(forKey: "type") as? String ?? "chat"

        DispatchQueue.main.async { [weak self] in
            self?.hms?.sendBroadcastMessage(type: type, message: message, completion: { message, error in
                if error == nil {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
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
            let errorMessage = "sendGroupMessage: " + HMSHelper.getUnavailableRequiredKey(data, ["message", "roles"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HMSHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.sendGroupMessage(type: type, message: message, roles: encodedTargetedRoles, completion: { message, error in
                if error == nil {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
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
            let errorMessage = "sendDirectMessage: " + HMSHelper.getUnavailableRequiredKey(data, ["message", "peerId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let type = data.value(forKey: "type") as? String ?? "chat"
        DispatchQueue.main.async { [weak self] in
            guard let peer = HMSHelper.getRemotePeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers) else { return }
            self?.hms?.sendDirectMessage(type: type, message: message, peer: peer, completion: { message, error in
                if error == nil {
                    resolve?(["success": true, "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]])
                    return
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": "ON_ERROR", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                    return
                }
            })
        }
    }

    func acceptRoleChange(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        DispatchQueue.main.async { [weak self] in

            guard let request = self?.recentRoleChangeRequest
            else {
                let errorMessage = "acceptRoleChange: recentRoleChangeRequest not found"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            self?.hms?.accept(changeRole: request, completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
            self?.recentPreviewTracks = []
            self?.recentRoleChangeRequest = nil
        }
    }

    func changeRole(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let peerId = data.value(forKey: "peerId") as? String,
              let role = data.value(forKey: "role") as? String
        else {
            let errorMessage = "changeRole: " + HMSHelper.getUnavailableRequiredKey(data, ["peerId", "role"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let force = data.value(forKey: "force") as? Bool ?? false

        DispatchQueue.main.async { [weak self] in
            guard let peer = HMSHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers, localPeer: self?.hms?.localPeer),
            let role = HMSHelper.getRoleFromRoleName(role, roles: self?.hms?.roles)
            else { return }

            self?.hms?.changeRole(for: peer, to: role, force: force, completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }

    func changeTrackState(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "changeTrackState: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let mute = data.value(forKey: "mute") as? Bool ?? true

        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers,
                  let track = HMSHelper.getTrackFromTrackId(trackId, remotePeers)
            else { 
                reject?(nil, "TRACK_NOT_FOUND", nil)
                return 
            }

            self?.hms?.changeTrackState(for: track, mute: mute, completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }

    func changeTrackStateForRoles(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let mute = data.value(forKey: "mute") as? Bool
        else {
            let errorMessage = "changeTrackStateForRoles: " + HMSHelper.getUnavailableRequiredKey(data, ["mute"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        let source = data.value(forKey: "source") as? String
        let targetedRoles = data.value(forKey: "roles") as? [String]
        let type = data.value(forKey: "type") as? String

        var decodeType: HMSTrackKind?
        if  type != nil {
            if  type == "AUDIO" {
                decodeType = HMSTrackKind.audio
            } else {
                decodeType = HMSTrackKind.video
            }
        }

        DispatchQueue.main.async { [weak self] in
            let encodedTargetedRoles = HMSHelper.getRolesFromRoleNames(targetedRoles, roles: self?.hms?.roles)
            self?.hms?.changeTrackState(mute: mute, for: decodeType, source: source, roles: encodedTargetedRoles, completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }

    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "isMute: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            guard let localPeer = self?.hms?.localPeer,
                let localTrack = HMSHelper.getLocalTrackFromTrackId(trackId, localPeer: localPeer)
            else {
                guard let remotePeers = self?.hms?.remotePeers,
                    let track = HMSHelper.getTrackFromTrackId(trackId, remotePeers)
                else {
                    let error = HMSError(id: "120", code: HMSErrorCode.genericErrorUnknown, message: "TRACK_NOT_FOUND")
                    strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HMSDecoder.getError(error), "id": strongSelf.id])
                    reject?(nil, "TRACK_NOT_FOUND", nil)
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
            let errorMessage = "removePeer: " + HMSHelper.getUnavailableRequiredKey(data, ["peerId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let reason = data.value(forKey: "reason") as? String

        DispatchQueue.main.async { [weak self] in

            guard let remotePeers = self?.hms?.remotePeers,
                  let peer = HMSHelper.getRemotePeerFromPeerId(peerId, remotePeers: remotePeers)
            else { 
                reject?(nil, "PEER_NOT_FOUND", nil)
                return 
            }

            self?.hms?.removePeer(peer, reason: reason ?? "Removed from room", completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }

    func endRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let lock = data.value(forKey: "lock") as? Bool,
                let reason = data.value(forKey: "reason") as? String
        else {
            let errorMessage = "endRoom: " + HMSHelper.getUnavailableRequiredKey(data, ["lock", "reason"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in
            self?.hms?.endRoom(lock: lock, reason: reason, completion: { success, error in
                if success {
                    resolve?(["success": true])
                } else {
                    self?.delegate?.emitEvent("ON_ERROR", ["event": self?.ON_ERROR ?? "", "error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    reject?(error?.message, error?.localizedDescription, nil)
                }
            })
        }
    }

    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "isPlaybackAllowed: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers
            else {
                reject?(nil, "REMOTE_PEERS_NOT_FOUND", nil)
                return
            }
            let remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
            let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            if remoteAudioTrack != nil {
                let isPlaybackAllowed = remoteAudioTrack?.isPlaybackAllowed()
                resolve?(isPlaybackAllowed)
                return
            } else if remoteVideoTrack != nil {
                let isPlaybackAllowed = remoteVideoTrack?.isPlaybackAllowed()
                resolve?(isPlaybackAllowed)
                return
            } else {
                reject?(nil, "TRACK_NOT_FOUND", nil)
                return
            }
        }
    }

    func getRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let roomData = HMSDecoder.getHmsRoom(hms?.room)

        resolve?(roomData)
    }

    func setPlaybackAllowed(_ data: NSDictionary) {
        guard let trackId = data.value(forKey: "trackId") as? String,
              let playbackAllowed = data.value(forKey: "playbackAllowed") as? Bool
        else {
            let errorMessage = "setPlaybackAllowed: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId", "playbackAllowed"])
            emitRequiredKeysError(errorMessage)
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let remotePeers = self?.hms?.remotePeers
            else {
                return
            }
            let remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
            let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            if remoteAudioTrack != nil {
                if playbackAllowed {
                    remoteAudioTrack?.setPlaybackAllowed(playbackAllowed)
                } else {
                    remoteAudioTrack?.setPlaybackAllowed(playbackAllowed)
                }
            } else if remoteVideoTrack != nil {
                remoteVideoTrack?.setPlaybackAllowed(playbackAllowed)
            }
        }
    }

    func changeMetadata(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let metadata = data.value(forKey: "metadata") as? String
        else {
            let errorMessage = "changeMetadata: " + HMSHelper.getUnavailableRequiredKey(data, ["metadata"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        hms?.change(metadata: metadata, completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }

    func setVolume(_ data: NSDictionary) {
        guard let trackId = data.value(forKey: "trackId") as? String,
              let volume = data.value(forKey: "volume") as? Double
        else {
            let errorMessage = "setVolume: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId", "volume"])
            emitRequiredKeysError(errorMessage)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }
            let remotePeers = self?.hms?.remotePeers

            let remoteAudioTrack = HMSHelper.getRemoteAudioAuxiliaryTrackFromTrackId(trackId, remotePeers)

            if remoteAudioTrack != nil {
                remoteAudioTrack?.setVolume(volume)
            } else {
                let error = HMSError(id: "125", code: HMSErrorCode.genericErrorUnknown, message: "TRACK_NOT_FOUND")
                strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["event": strongSelf.ON_ERROR, "error": HMSDecoder.getError(error), "id": strongSelf.id])
            }
        }
    }

    func startRTMPOrRecording(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let record = data.value(forKey: "record") as? Bool,
              let meetingString = data.value(forKey: "meetingURL") as? String
        else {
            let errorMessage = "startRTMPOrRecording: " + HMSHelper.getUnavailableRequiredKey(data, ["record", "meetingURL"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let rtmpStrings = data.value(forKey: "rtmpURLs") as? [String]

        var meetingUrl: URL?
        if let meetLink = URL(string: meetingString) {
            meetingUrl = meetLink
        } else {
            let error = HMSError(id: "127", code: HMSErrorCode.genericErrorUnknown, message: "INVALID_MEETING_URL_PASSED")
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HMSDecoder.getError(error), "id": id])
            reject?("INVALID_MEETING_URL_PASSED", "INVALID_MEETING_URL_PASSED", nil)
        }

        let URLs = HMSHelper.getRtmpUrls(rtmpStrings)

        let config = HMSRTMPConfig(meetingURL: meetingUrl, rtmpURLs: URLs, record: record)
        hms?.startRTMPOrRecording(config: config, completion: { success, error in
            if success {
                let roomData = HMSDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)

                let localPeerData = HMSDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HMSDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }

    func stopRtmpAndRecording(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopRTMPAndRecording(completion: { success, error in
            if success {
                let roomData = HMSDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)

                let localPeerData = HMSDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HMSDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }

    func startHLSStreaming(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let meetingURLVariants = data.value(forKey: "meetingURLVariants") as? [[String: Any]]?
        else {
            let errorMessage = "startHLSStreaming: " + HMSHelper.getUnavailableRequiredKey(data, ["meetingURLVariants"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        
        let recordConfig = HMSHelper.getHlsRecordingConfig(data)
        let hlsMeetingUrlVariant = HMSHelper.getHMSHLSMeetingURLVariants(meetingURLVariants)
        let config = HMSHLSConfig(variants: hlsMeetingUrlVariant, recording: recordConfig)

        hms?.startHLSStreaming(config: config, completion: { success, error in
            if success {
                let roomData = HMSDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.hlsStreamingStateUpdated)

                let localPeerData = HMSDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HMSDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }

    func stopHLSStreaming(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopHLSStreaming(config: nil, completion: { success, error in
            if success {
                let roomData = HMSDecoder.getHmsRoom(self.hms?.room)
                let type = self.getString(from: HMSRoomUpdate.browserRecordingStateUpdated)

                let localPeerData = HMSDecoder.getHmsLocalPeer(self.hms?.localPeer)
                let remotePeerData = HMSDecoder.getHmsRemotePeers(self.hms?.remotePeers)
                self.delegate?.emitEvent(self.ON_ROOM_UPDATE, ["event": self.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
                resolve?(["success": success])
                return
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
                return
            }
        })
    }
    
    func changeName(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let name = data.value(forKey: "name") as? String
        else {
            let errorMessage = "changeName: " + HMSHelper.getUnavailableRequiredKey(data, ["name"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        hms?.change(name: name) { success, error in
            if success {
                resolve?(["success": success])
            } else {
                self.delegate?.emitEvent(self.ON_ERROR, ["event": self.ON_ERROR, "error": HMSDecoder.getError(error), "id": self.id])
                reject?(error?.message, error?.localizedDescription, nil)
            }
        }
    }
    
    func remoteMuteAllAudio() {
        let allAudioTracks = HMSUtilities.getAllAudioTracks(in: (self.hms?.room)!!)
        var customError: HMSError? = nil
        for audioTrack in allAudioTracks {
            self.hms?.changeTrackState(for: audioTrack, mute: true, completion: { success, error in
                if success {
                } else {
                    customError = error
                }
            })
        }
        if (customError != nil) {
            delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HMSDecoder.getError(customError), "id": id])
        }
    }

    func setPlaybackForAllAudio(_ data: NSDictionary) {
        guard let mute = data.value(forKey: "mute") as? Bool
        else {
            let errorMessage = "setPlaybackForAllAudio: " + HMSHelper.getUnavailableRequiredKey(data, ["setPlaybackForAllAudio"])
            emitRequiredKeysError(errorMessage)
            return
        }

        DispatchQueue.main.async { [weak self] in
            let remotePeers = self?.hms?.remotePeers
            for peer in remotePeers ?? [] {
                peer.remoteAudioTrack()?.setPlaybackAllowed(!mute)
            }
        }
        let roomData = HMSDecoder.getHmsRoom(hms?.room)
        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)

        self.delegate?.emitEvent(ON_PEER_UPDATE, ["event": ON_PEER_UPDATE, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }
    
    func enableRTCStats() {
        rtcStatsAttached = true
    }
    
    func disableRTCStats() {
        rtcStatsAttached = false
    }

//  TODO: to be implemented after volume is exposed for iOS
//  func getVolume(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject:              RCTPromiseRejectBlock?) {
//      guard let trackId = data.value(forKey: "trackId") as? String
//      else {
//          let errorMessage = "getVolume: " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
//          emitRequiredKeysError(errorMessage)
//          reject?(errorMessage, errorMessage, nil)
//          return
//      }
//
//      if (localPeer?.localAudioTrack()?.trackId == trackId) {
//
//      }
//  }

//  func setLocalVideoSettings(_ data: NSDictionary) {
//      let localVideoTrack = self.hms?.localPeer?.localVideoTrack()
//
//      guard let settings = HMSHelper.getLocalVideoSettings(data)
//      else {
//          let errorMessage = "setLocalVideoSettings: " +                                                HMSHelper.getUnavailableRequiredKey(data)
//          emitRequiredKeysError(errorMessage)
//          return
//      }
//      localVideoTrack?.settings = settings
//  }

//  MARK: - HMS SDK Delegate Callbacks
    func on(join room: HMSRoom) {
        let roomData = HMSDecoder.getHmsRoom(room)
        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)

        let decodedRoles = HMSDecoder.getAllRoles(hms?.roles)
        self.recentPreviewTracks = []
        self.delegate?.emitEvent(ON_JOIN, ["event": ON_JOIN, "id": self.id, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "roles": decodedRoles])
    }

    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        let previewTracks = HMSDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HMSDecoder.getHmsRoom(room)
        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)

        previewInProgress = false
        self.delegate?.emitEvent(ON_PREVIEW, ["event": ON_PREVIEW, "id": self.id, "room": hmsRoom, "previewTracks": previewTracks, "localPeer": localPeerData])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        // Listener for any updation in room
        let roomData = HMSDecoder.getHmsRoom(room)
        let type = getString(from: update)

        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)

        self.delegate?.emitEvent(ON_ROOM_UPDATE, ["event": ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData])
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        // Listener for updates in Peers
        let roomData = HMSDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)

        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)
        let hmsPeer = HMSDecoder.getHmsPeer(peer)

        self.delegate?.emitEvent(ON_PEER_UPDATE, ["event": ON_PEER_UPDATE, "id": self.id, "type": type, "room": roomData, "localPeer": localPeerData, "remotePeers": remotePeerData, "peer": hmsPeer])
    }

    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        // Listener for updates in Tracks
        let roomData = HMSDecoder.getHmsRoom(hms?.room)
        let type = getString(from: update)

        let localPeerData = HMSDecoder.getHmsLocalPeer(hms?.localPeer)
        let remotePeerData = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)
        let hmsPeer = HMSDecoder.getHmsPeer(peer)
        let hmsTrack = HMSDecoder.getHmsTrack(track)

        self.delegate?.emitEvent(ON_TRACK_UPDATE, ["event": ON_TRACK_UPDATE, "id": self.id, "room": roomData, "type": type, "localPeer": localPeerData, "remotePeers": remotePeerData, "peer": hmsPeer, "track": hmsTrack])
    }

    func on(error: HMSError) {
        if previewInProgress { previewInProgress = false }
        self.delegate?.emitEvent(ON_ERROR, ["event": ON_ERROR, "error": HMSDecoder.getError(error), "id": id])
    }

    func on(message: HMSMessage) {
        self.delegate?.emitEvent(ON_MESSAGE, ["event": ON_MESSAGE, "id": self.id, "sender": HMSDecoder.getHmsPeer(message.sender), "recipient": HMSDecoder.getHmsMessageRecipient(message.recipient), "time": message.time.timeIntervalSince1970 * 1000, "message": message.message, "type": message.type])
    }

    func on(updated speakers: [HMSSpeaker]) {
        var speakerPeerIds: [[String: Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HMSDecoder.getHmsPeer(speaker.peer), "level": speaker.level, "track": HMSDecoder.getHmsTrack(speaker.track)])
        }
        self.delegate?.emitEvent(ON_SPEAKER, ["event": ON_SPEAKER, "id": self.id, "speakers": speakerPeerIds])
    }

    func onReconnecting() {
        reconnectingStage = true
        self.delegate?.emitEvent(RECONNECTING, ["event": RECONNECTING, "error": ["code": HMSErrorCode.websocketConnectionLost, "description": "Software caused connection abort", "localizedDescription": "Network connection lost ", "debugDescription": "Network connection lost ", "message": "Network connection lost ", "name": "WebSocketConnectionLost", "action": "NONE", "id": 101], "id": self.id ])
    }

    func onReconnected() {
        reconnectingStage = false
        self.delegate?.emitEvent(RECONNECTED, ["event": RECONNECTED, "id": self.id ])
    }

    func on(roleChangeRequest: HMSRoleChangeRequest) {
        let decodedRoleChangeRequest = HMSDecoder.getHmsRoleChangeRequest(roleChangeRequest, self.id)
        recentRoleChangeRequest = roleChangeRequest
        self.delegate?.emitEvent(ON_ROLE_CHANGE_REQUEST, decodedRoleChangeRequest)
    }

    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        let decodedChangeTrackStateRequest = HMSDecoder.getHmsChangeTrackStateRequest(changeTrackStateRequest, id)
        delegate?.emitEvent("ON_CHANGE_TRACK_STATE_REQUEST", decodedChangeTrackStateRequest)
    }

    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        let requestedBy = notification.requestedBy as HMSPeer?
        var decodedRequestedBy: [String: Any]?
        if let requested = requestedBy {
            decodedRequestedBy = HMSDecoder.getHmsPeer(requested)
        }
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.delegate?.emitEvent(ON_REMOVED_FROM_ROOM, ["event": ON_REMOVED_FROM_ROOM, "id": self.id, "requestedBy": decodedRequestedBy as Any, "reason": reason, "roomEnded": roomEnded ])
    }
    
    func on(rtcStats: HMSRTCStatsReport) {
        if (!rtcStatsAttached) {
            return
        }
        let video = HMSDecoder.getHMSRTCStats(rtcStats.video)
        let audio = HMSDecoder.getHMSRTCStats(rtcStats.audio)
        let combined = HMSDecoder.getHMSRTCStats(rtcStats.combined)
        
        self.delegate?.emitEvent(ON_RTC_STATS, ["video": video, "audio": audio, "combined": combined, "id": self.id])
    }
    
    func on(localAudioStats: HMSLocalAudioStats, track: HMSLocalAudioTrack, peer: HMSPeer) {
        if (!rtcStatsAttached) {
            return
        }
        let localStats = HMSDecoder.getLocalAudioStats(localAudioStats)
        let localTrack = HMSDecoder.getHmsLocalAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeer(peer)
        
        self.delegate?.emitEvent(ON_LOCAL_AUDIO_STATS, ["localAudioStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }
    
    func on(localVideoStats: HMSLocalVideoStats, track: HMSLocalVideoTrack, peer: HMSPeer) {
        if (!rtcStatsAttached) {
            return
        }
        let localStats = HMSDecoder.getLocalVideoStats(localVideoStats)
        let decodedPeer = HMSDecoder.getHmsPeer(peer)
        let localTrack = HMSDecoder.getHmsLocalVideoTrack(track)
        
        self.delegate?.emitEvent(ON_LOCAL_VIDEO_STATS, ["localVideoStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }
    
    func on(remoteAudioStats: HMSRemoteAudioStats, track: HMSRemoteAudioTrack, peer: HMSPeer) {
        if (!rtcStatsAttached) {
            return
        }
        let remoteStats = HMSDecoder.getRemoteAudioStats(remoteAudioStats)
        let remoteTrack = HMSDecoder.getHMSRemoteAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeer(peer)
        
        self.delegate?.emitEvent(ON_REMOTE_AUDIO_STATS, ["remoteAudioStats": remoteStats, "track": remoteTrack, "peer": decodedPeer, "id": self.id])
    }
    
    func on(remoteVideoStats: HMSRemoteVideoStats, track: HMSRemoteVideoTrack, peer: HMSPeer) {
        if (!rtcStatsAttached) {
            return
        }
        let remoteStats = HMSDecoder.getRemoteVideoStats(remoteVideoStats)
        let decodedPeer = HMSDecoder.getHmsPeer(peer)
        let remoteTrack = HMSDecoder.getHMSRemoteVideoTrack(track)
        
        self.delegate?.emitEvent(ON_REMOTE_VIDEO_STATS, ["remoteVideoStats": remoteStats, "track": remoteTrack, "peer": decodedPeer, "id": self.id])
    }

    // MARK: Helper Functions
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
        case .nameUpdated:
            return "NAME_CHANGED"
        case .defaultUpdate:
            return "DEFAULT_UPDATE"
        case .networkQualityUpdated:
            return "NETWORK_QUALITY_UPDATED"
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

// extension HMSRNSDK: HMSLogger {
//    func log(_ message: String, _ level: HMSLogLevel) {
//
//    }
// }
