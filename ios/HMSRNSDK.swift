//
//  Hmssdk.swift
//  Hmssdk
//
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import HMSSDK
import ReplayKit

class HMSRNSDK: HMSUpdateListener, HMSPreviewListener {

    var hms: HMSSDK?
    var config: HMSConfig?
    var recentRoleChangeRequest: HMSRoleChangeRequest?
    var delegate: HMSManager?
    var id: String = "12345"
    var recentPreviewTracks: [HMSTrack]? = []
    private var reconnectingStage: Bool = false
    private var preferredExtension: String?
    private var systemBroadcastPicker: RPSystemBroadcastPickerView?
    private var startScreenshareResolve: RCTPromiseResolveBlock?
    private var stopScreenshareResolve: RCTPromiseResolveBlock?
    private var isScreenShared: Bool? = false
    private var previewInProgress = false
    private var networkQualityUpdatesAttached = false
    private var eventsEnableStatus: [String: Bool] = [:]

    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "3"
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
        preferredExtension = data?.value(forKey: "preferredExtension") as? String

        DispatchQueue.main.async { [weak self] in
            self?.hms = HMSSDK.build { sdk in
                sdk.appGroup = data?.value(forKey: "appGroup") as? String
                sdk.frameworkInfo = HMSHelper.getFrameworkInfo(data?.value(forKey: "frameworkInfo") as? NSDictionary)
                let trackSettings = data?.value(forKey: "trackSettings") as? NSDictionary
                let videoSettings = HMSHelper.getLocalVideoSettings(trackSettings?.value(forKey: "video") as? NSDictionary)
                let audioSettings = HMSHelper.getLocalAudioSettings(trackSettings?.value(forKey: "audio") as? NSDictionary, sdk, self?.delegate, id)
                sdk.trackSettings = HMSTrackSettings(videoSettings: videoSettings, audioSettings: audioSettings)
            }
        }
        self.delegate = manager
        self.id = id
    }

    // MARK: - HMS SDK Actions
    func preview(_ credentials: NSDictionary) {

        guard !previewInProgress else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 5000, "description": "Preview is in progress", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
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
                if error != nil {
                    if eventsEnableStatus[ON_ERROR] == true {
                        delegate?.emitEvent(ON_ERROR, ["error": HMSDecoder.getError(error), "id": id])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent("ON_ERROR", ["error": ["code": 5000, "description": "Preview is in progress", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            return
        }

        guard let authToken = credentials.value(forKey: "authToken") as? String,
              let user = credentials.value(forKey: "username") as? String
        else {
            let errorMessage = "join: " + HMSHelper.getUnavailableRequiredKey(credentials, ["authToken", "username"])
            emitRequiredKeysError(errorMessage)
            return
        }
        reconnectingStage = false
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

    func getAuthTokenByRoomCode(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let roomCode = data.value(forKey: "roomCode") as? String
        else {
            let errorMessage = "getAuthTokenByRoomCode: " + HMSHelper.getUnavailableRequiredKey(data, ["roomCode"])
            reject?("40000", errorMessage, nil)
            return
        }
        let userId = data.value(forKey: "userId") as? String? ?? nil
        let endpoint = data.value(forKey: "endpoint") as? String? ?? nil

        // This is to make the QA links work
        if endpoint != nil && endpoint!.contains("nonprod") {
            UserDefaults.standard.set(endpoint, forKey: "HMSAuthTokenEndpointOverride")
        } else {
            UserDefaults.standard.removeObject(forKey: "HMSAuthTokenEndpointOverride")
        }

        DispatchQueue.main.async { [weak self] in
            self?.hms?.getAuthTokenByRoomCode(roomCode, userID: userId) { token, error in
                // error occurred
                if error != nil {
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
                    return
                }
                // no error and token is valid
                else if token != nil {
                    resolve?(token)
                    return
                }
                // no error but token is null
                else {
                    reject?("50000", "token is null", nil)
                    return
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
        if reconnectingStage {
            reject?("Still in reconnecting stage", "Still in reconnecting stage", nil)
        } else {
            DispatchQueue.main.async { [weak self] in
                guard let strongSelf = self else { return }
                self?.config = nil
                self?.recentRoleChangeRequest = nil
                self?.systemBroadcastPicker = nil
                self?.preferredExtension = nil
                self?.stopScreenshareResolve = nil
                self?.startScreenshareResolve = nil
                self?.isScreenShared = false
                self?.networkQualityUpdatesAttached = false
                self?.hms?.leave({ success, error in
                    if success {
                        HMSDecoder.clearRestrictDataStates()
                        resolve?(["success": success])
                    } else {
                        if strongSelf.eventsEnableStatus[strongSelf.ON_ERROR] == true {
                            strongSelf.delegate?.emitEvent(strongSelf.ON_ERROR, ["error": HMSDecoder.getError(error), "id": strongSelf.id])
                        }
                        reject?("error in leave", "error in leave", nil)
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
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
                }
            })
        }
    }

    func changeRolesOfAllPeers(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let toRoleString = data.object(forKey: "toRole") as? String
        else {
            let errorMessage = "changeRolesOfAllPeers: " + HMSHelper.getUnavailableRequiredKey(data, ["toRole"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let toRole = HMSHelper.getRoleFromRoleName(toRoleString, roles: self?.hms?.roles) else {
                let errorMessage = "changeRolesOfAllPeers: " + HMSHelper.getUnavailableRequiredKey(data, ["toRole"])
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            var limitToRoles: [HMSRole]?

            if let ofRoleNames = data.object(forKey: "ofRoles") as? [String] {
                limitToRoles = self?.hms?.roles.filter { ofRoleNames.contains($0.name) }
            }

            self?.hms?.changeRolesOfAllPeers(to: toRole, limitToRoles: limitToRoles) { success, error in
                if success {
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
                }
            }
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
                reject?("TRACK_NOT_FOUND", "TRACK_NOT_FOUND", nil)
                return
            }

            self?.hms?.changeTrackState(for: track, mute: mute, completion: { success, error in
                if success {
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    if strongSelf.eventsEnableStatus["ON_ERROR"] == true {
                        strongSelf.delegate?.emitEvent("ON_ERROR", ["error": ["code": 6002, "description": "Track not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": strongSelf.id])
                    }
                    reject?("Track not found", "Track not found", nil)
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
                reject?("PEER_NOT_FOUND", "PEER_NOT_FOUND", nil)
                return
            }

            self?.hms?.removePeer(peer, reason: reason ?? "Removed from room", completion: { success, error in
                if success {
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                    resolve?(["success": success])
                } else {
                    if self?.eventsEnableStatus["ON_ERROR"] == true {
                        self?.delegate?.emitEvent("ON_ERROR", ["error": HMSDecoder.getError(error), "id": self?.id ?? "12345"])
                    }
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                reject?("REMOTE_PEERS_NOT_FOUND", "REMOTE_PEERS_NOT_FOUND", nil)
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
                reject?("TRACK_NOT_FOUND", "TRACK_NOT_FOUND", nil)
                return
            }
        }
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
                if self.eventsEnableStatus["ON_ERROR"] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
            } else if strongSelf.eventsEnableStatus["ON_ERROR"] == true {
                strongSelf.delegate?.emitEvent("ON_ERROR", ["error": ["code": 6002, "description": "Track not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": strongSelf.id])
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
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "Invalid meeting url passed", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("Invalid meeting url passed", "Invalid meeting url passed", nil)
        }

        let URLs = HMSHelper.getRtmpUrls(rtmpStrings)

        let config = HMSRTMPConfig(meetingURL: meetingUrl, rtmpURLs: URLs, record: record)
        hms?.startRTMPOrRecording(config: config, completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
        })
    }

    func stopRtmpAndRecording(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopRTMPAndRecording(completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
        })
    }

    func startHLSStreaming(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let recordConfig = HMSHelper.getHlsRecordingConfig(data.value(forKey: "hlsRecordingConfig") as? NSDictionary)
        let hlsMeetingUrlVariant = HMSHelper.getHMSHLSMeetingURLVariants(data.value(forKey: "meetingURLVariants") as? [[String: Any]])
        var config: HMSHLSConfig?
        if !hlsMeetingUrlVariant.isEmpty || recordConfig !== nil {
            config = HMSHLSConfig(variants: hlsMeetingUrlVariant, recording: recordConfig)
        }

        hms?.startHLSStreaming(config: config, completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
        })
    }

    func stopHLSStreaming(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.stopHLSStreaming(config: nil, completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
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
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
            }
        }
    }

    func remoteMuteAllAudio(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let allAudioTracks = HMSUtilities.getAllAudioTracks(in: (self.hms?.room)!!)
        var customError: Error?
        for audioTrack in allAudioTracks {
            self.hms?.changeTrackState(for: audioTrack, mute: true, completion: { success, error in
                if success {
                } else {
                    customError = error
                }
            })
        }
        if customError == nil {
            resolve?(["success": true])
        } else {
            reject?(customError?.localizedDescription, customError?.localizedDescription, nil)
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
    }

    func startScreenshare(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let preferredExtension = preferredExtension else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "Could not start screen share, preferredExtension not passed in Build method", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("Could not start screen share, preferredExtension not passed in Build method", "Could not start screen share, preferredExtension not passed in Build method", nil)
            return
        }
        DispatchQueue.main.async { [weak self] in
            if self?.systemBroadcastPicker == nil {
                self?.systemBroadcastPicker = RPSystemBroadcastPickerView()
                self?.systemBroadcastPicker!.preferredExtension = preferredExtension
                self?.systemBroadcastPicker!.showsMicrophoneButton = false
            }

            for view in self!.systemBroadcastPicker!.subviews {
                if let button = view as? UIButton {
                    button.sendActions(for: .allEvents)
                }
            }
            self?.startScreenshareResolve = resolve
        }
    }

    func stopScreenshare(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let preferredExtension = preferredExtension else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "Could not start screen share, preferredExtension not passed in Build method", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("Could not start screen share, preferredExtension not passed in Build method", "Could not start screen share, preferredExtension not passed in Build method", nil)
            return
        }
        DispatchQueue.main.async { [weak self] in
            if self?.systemBroadcastPicker == nil {
                self?.systemBroadcastPicker = RPSystemBroadcastPickerView()
                self?.systemBroadcastPicker!.preferredExtension = preferredExtension
                self?.systemBroadcastPicker!.showsMicrophoneButton = false
            }

            for view in self!.systemBroadcastPicker!.subviews {
                if let button = view as? UIButton {
                    button.sendActions(for: .allEvents)
                }
            }
            self?.stopScreenshareResolve = resolve
        }
    }

    func isScreenShared(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        resolve?(isScreenShared)
    }

    func playAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let fileUrl = data.value(forKey: "fileUrl") as? String,
              let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "playAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode", "fileUrl"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        let loops = data.value(forKey: "loops") as? Bool ?? false
        let interrupts = data.value(forKey: "interrupts") as? Bool ?? false
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            if let url = URL(string: fileUrl) {
                do {
                    try audioFilePlayerNode.play(fileUrl: url, loops: loops, interrupts: interrupts)
                    resolve?(["success": true])
                } catch {
                    if eventsEnableStatus[ON_ERROR] == true {
                        delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": error.localizedDescription, "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
                    }
                    reject?(error.localizedDescription, error.localizedDescription, nil)
                }
            } else {
                if eventsEnableStatus[ON_ERROR] == true {
                    delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "Incorrect url", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
                }
                reject?("Incorrect URL", "Incorrect URL", nil)
            }
        } else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("AudioFilePlayerNode not found", "AudioFilePlayerNode not found", nil)
        }
    }

    func setAudioShareVolume(_ data: NSDictionary) {
        guard let volume = data.value(forKey: "volume") as? NSNumber,
              let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "setAudioShareVolume: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode", "volume"])
            emitRequiredKeysError(errorMessage)
            return
        }
        if let audioMicNode = playerNode as? HMSMicNode {
            audioMicNode.volume = volume.floatValue
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            audioFilePlayerNode.volume = volume.floatValue
        }
    }

    func stopAudioShare(_ data: NSDictionary) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "stopAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            audioFilePlayerNode.stop()
        } else if eventsEnableStatus[ON_ERROR] == true {
            delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
        }
    }

    func resumeAudioShare(_ data: NSDictionary) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "resumeAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            do {
                try audioFilePlayerNode.resume()
            } catch {
                if eventsEnableStatus[ON_ERROR] == true {
                    delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": error.localizedDescription, "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
                }
            }
        } else if eventsEnableStatus[ON_ERROR] == true {
            delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
        }
    }

    func pauseAudioShare(_ data: NSDictionary) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "pauseAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            audioFilePlayerNode.pause()
        } else if eventsEnableStatus[ON_ERROR] == true {
            delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
        }
    }

    func audioShareIsPlaying(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "pauseAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            resolve?(audioFilePlayerNode.isPlaying)
        } else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("AudioFilePlayerNode not found", "AudioFilePlayerNode not found", nil)
        }
    }

    func audioShareCurrentTime(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "pauseAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            resolve?(audioFilePlayerNode.currentTime)
        } else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("AudioFilePlayerNode not found", "AudioFilePlayerNode not found", nil)
        }
    }

    func audioShareDuration(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let audioNodeName = data.value(forKey: "audioNode") as? String,
              let audioMixerSourceMap = HMSHelper.getAudioMixerSourceMap(),
              let playerNode = audioMixerSourceMap[audioNodeName]
        else {
            let errorMessage = "pauseAudioShare: " + HMSHelper.getUnavailableRequiredKey(data, ["audioNode"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }
        if let audioFilePlayerNode = playerNode as? HMSAudioFilePlayerNode {
            resolve?(audioFilePlayerNode.duration)
        } else {
            if eventsEnableStatus[ON_ERROR] == true {
                delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": "AudioFilePlayerNode not found", "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
            }
            reject?("AudioFilePlayerNode not found", "AudioFilePlayerNode not found", nil)
        }
    }

    func enableNetworkQualityUpdates() {
        networkQualityUpdatesAttached = true
    }

    func disableNetworkQualityUpdates() {
        networkQualityUpdatesAttached = false
    }

    func setSessionMetaData(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let metaData = data.value(forKey: "sessionMetaData") as? String ?? ""

        hms?.setSessionMetadata(metaData) { success, error in
            if success {
                resolve?(["success": success])
            } else {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
            }
        }
    }

    func enableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let eventType = data.value(forKey: "eventType") as? String else {
            let errorMessage = "enableEvent: " + HMSHelper.getUnavailableRequiredKey(data, ["eventType"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        eventsEnableStatus[eventType] = true
        resolve?(["success": true, "message": "function call executed successfully"])
    }

    func disableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let eventType = data.value(forKey: "eventType") as? String else {
            let errorMessage = "disableEvent: " + HMSHelper.getUnavailableRequiredKey(data, ["eventType"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        eventsEnableStatus[eventType] = false
        resolve?(["success": true, "message": "function call executed successfully"])
    }

    func restrictData(_ data: NSDictionary) {
        guard let roleName = data.value(forKey: "roleName") as? String else {
            let errorMessage = "restrictData: " + HMSHelper.getUnavailableRequiredKey(data, ["roleName"])
            emitRequiredKeysError(errorMessage)
            return
        }

        HMSDecoder.setRestrictRoleData(roleName, true)
    }

    // MARK: - HMS SDK Get APIs
    func getRoom(_ resolve: RCTPromiseResolveBlock?) {
        let roomData = HMSDecoder.getHmsRoom(hms?.room)

        resolve?(roomData)
    }

    func getLocalPeer(_ resolve: RCTPromiseResolveBlock?) {
        let localPeer = HMSDecoder.getHmsLocalPeer(hms?.localPeer)

        resolve?(localPeer)
    }

    func getRemotePeers(_ resolve: RCTPromiseResolveBlock?) {
        let remotePeers = HMSDecoder.getHmsRemotePeers(hms?.remotePeers)

        resolve?(remotePeers)
    }

    func getRoles(_ resolve: RCTPromiseResolveBlock?) {
        let roles = HMSDecoder.getAllRoles(hms?.roles)

        resolve?(roles)
    }

    func getSessionMetaData(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        hms?.getSessionMetadata { result, error in
            if error != nil {
                if self.eventsEnableStatus[self.ON_ERROR] == true {
                    self.delegate?.emitEvent(self.ON_ERROR, ["error": HMSDecoder.getError(error), "id": self.id])
                }
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
            } else {
                resolve?(result)
            }
        }
    }

    func getPeerProperty(_ data: NSDictionary) -> [AnyHashable: Any]? {
        guard let property = data.value(forKey: "property") as? String else {
            return nil
        }

        guard let peerId = data.value(forKey: "peerId") as? String else {
            return nil
        }

        guard let room = hms?.room, let peer = HMSUtilities.getPeer(for: peerId, in: room) else {
            return nil
        }

        switch property {
            case "name":
                return ["name": peer.name]
            case "isLocal":
                return ["isLocal": peer.isLocal]
            case "networkQuality":
                if peer.networkQuality != nil {
                    return ["networkQuality": HMSDecoder.getHmsNetworkQuality(peer.networkQuality)]
                } else {
                    return nil
                }
            case "metadata":
                return ["metadata": peer.metadata ?? ""]
            case "role":
                return ["role": HMSDecoder.getHmsRole(peer.role)]
            case "customerUserID":
                return ["customerUserID": peer.customerUserID ?? ""]
            case "audioTrack":
                if peer.audioTrack != nil {
                    return ["audioTrack": HMSDecoder.getHmsAudioTrack(peer.audioTrack)]
                } else {
                    return nil
                }
            case "videoTrack":
                if peer.videoTrack != nil {
                    return ["videoTrack": HMSDecoder.getHmsVideoTrack(peer.videoTrack)]
                } else {
                    return nil
                }
            case "auxiliaryTracks":
                if let auxTracks = peer.auxiliaryTracks, auxTracks.count > 0 {
                    return ["auxiliaryTracks": HMSDecoder.getAllTracks(auxTracks)]
                } else {
                    return nil
                }
            default:
                return nil
        }
    }

    func getRoomProperty(_ data: NSDictionary) -> [AnyHashable: Any]? {
        guard let property = data.value(forKey: "property") as? String else {
            return nil
        }

        guard let hmsRoom = hms?.room else {
            return nil
        }

        switch property {
            case "sessionId":
                return ["sessionId": hmsRoom.sessionID ?? ""]
            case "name":
                return ["name": hmsRoom.name ?? ""]

            case "metaData":
                return ["metaData": hmsRoom.metaData ?? ""]

            case "peerCount":
                return ["peerCount": hmsRoom.peerCount ?? 0]

            case "peers":
                var peers = [[String: Any]]()
                for peer in hmsRoom.peers {
                    let parsedPeer = HMSDecoder.getHmsPeerSubset(peer)
                    peers.append(parsedPeer)
                }
                return ["peers": peers]

            case "localPeer":
                return ["localPeer": HMSDecoder.getHmsLocalPeer(hms?.localPeer)]

            case "browserRecordingState":
                return ["browserRecordingState": HMSDecoder.getHMSBrowserRecordingState(hmsRoom.browserRecordingState)]

            case "rtmpHMSRtmpStreamingState":
                return ["rtmpHMSRtmpStreamingState": HMSDecoder.getHMSRtmpStreamingState(hmsRoom.rtmpStreamingState)]

            case "serverRecordingState":
                return ["serverRecordingState": HMSDecoder.getHMSServerRecordingState(hmsRoom.serverRecordingState)]

            case "hlsStreamingState":
                return ["hlsStreamingState": HMSDecoder.getHlsStreamingState(hmsRoom.hlsStreamingState)]

            case "hlsRecordingState":
                return ["hlsRecordingState": HMSDecoder.getHlsRecordingState(hmsRoom.hlsRecordingState)]

            default:
                return nil
        }
    }

    // MARK: - HMS SDK Delegate Callbacks
    func on(join room: HMSRoom) {
        self.recentPreviewTracks = []
        if eventsEnableStatus[ON_JOIN] != true {
            return
        }
        let roomData = HMSDecoder.getHmsRoomSubset(room)
        self.delegate?.emitEvent(ON_JOIN, ["event": ON_JOIN, "id": self.id, "room": roomData])
    }

    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        previewInProgress = false
        if eventsEnableStatus[ON_PREVIEW] != true {
            return
        }
        let previewTracks = HMSDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HMSDecoder.getHmsRoomSubset(room)

        self.delegate?.emitEvent(ON_PREVIEW, ["event": ON_PREVIEW, "id": self.id, "room": hmsRoom, "previewTracks": previewTracks])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        if eventsEnableStatus[ON_ROOM_UPDATE] != true {
            return
        }
        if update == .metaDataUpdated || update == .roomTypeChanged {
            return
        }

        let roomData = HMSDecoder.getHmsRoomSubset(room, update)
        let type = getString(from: update)

        self.delegate?.emitEvent(ON_ROOM_UPDATE, ["event": ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData])
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {
        if eventsEnableStatus[ON_PEER_UPDATE] != true {
            return
        }
        let type = getString(from: update)
        let hmsPeer = HMSDecoder.getHmsPeerSubsetForPeerUpdateEvent(peer, update)

        if !networkQualityUpdatesAttached && update == .networkQualityUpdated {
            return
        }

        self.delegate?.emitEvent(ON_PEER_UPDATE, hmsPeer)
    }

    func on(track: HMSTrack, update: HMSTrackUpdate, for peer: HMSPeer) {
        if peer.isLocal && track.source.uppercased() == "SCREEN" && track.kind == HMSTrackKind.video {
            if update == .trackAdded {
                isScreenShared = true
                startScreenshareResolve?(["success": true])
                startScreenshareResolve = nil
            } else if update == .trackRemoved {
                isScreenShared = false
                stopScreenshareResolve?(["success": true])
                stopScreenshareResolve = nil
            }
        }

        if eventsEnableStatus[ON_TRACK_UPDATE] != true {
            return
        }

        let type = getString(from: update)
        let hmsPeer = HMSDecoder.getHmsPeerSubset(peer)
        let hmsTrack = HMSDecoder.getHmsTrack(track)

        self.delegate?.emitEvent(ON_TRACK_UPDATE, ["event": ON_TRACK_UPDATE, "id": self.id, "type": type, "peer": hmsPeer, "track": hmsTrack])
    }

    func on(error: Error) {
        if previewInProgress { previewInProgress = false }
        if eventsEnableStatus[ON_ERROR] != true {
            return
        }
        self.delegate?.emitEvent(ON_ERROR, ["error": HMSDecoder.getError(error), "id": id])
    }

    func on(message: HMSMessage) {
        if eventsEnableStatus[ON_MESSAGE] != true {
            return
        }
        self.delegate?.emitEvent(ON_MESSAGE, ["event": ON_MESSAGE, "id": self.id, "sender": HMSDecoder.getHmsPeerSubset(message.sender), "recipient": HMSDecoder.getHmsMessageRecipient(message.recipient), "time": message.time.timeIntervalSince1970 * 1000, "message": message.message, "type": message.type])
    }

    func on(updated speakers: [HMSSpeaker]) {
        if eventsEnableStatus[ON_SPEAKER] != true {
            return
        }
        var speakerPeerIds: [[String: Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HMSDecoder.getHmsPeerSubset(speaker.peer), "level": speaker.level, "track": HMSDecoder.getHmsTrack(speaker.track)])
        }
        self.delegate?.emitEvent(ON_SPEAKER, ["event": ON_SPEAKER, "id": self.id, "speakers": speakerPeerIds])
    }

    func onReconnecting() {
        reconnectingStage = true
        if eventsEnableStatus[RECONNECTING] != true {
            return
        }
        self.delegate?.emitEvent(RECONNECTING, ["event": RECONNECTING, "error": ["code": 1003, "description": "Network connection lost ", "isTerminal": false, "canRetry": true], "id": self.id ])
    }

    func onReconnected() {
        reconnectingStage = false
        if eventsEnableStatus[RECONNECTED] != true {
            return
        }
        self.delegate?.emitEvent(RECONNECTED, ["event": RECONNECTED, "id": self.id ])
    }

    func on(roleChangeRequest: HMSRoleChangeRequest) {
        recentRoleChangeRequest = roleChangeRequest
        if eventsEnableStatus[ON_ROLE_CHANGE_REQUEST] != true {
            return
        }
        let decodedRoleChangeRequest = HMSDecoder.getHmsRoleChangeRequest(roleChangeRequest, self.id)
        self.delegate?.emitEvent(ON_ROLE_CHANGE_REQUEST, decodedRoleChangeRequest)
    }

    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        if eventsEnableStatus["ON_CHANGE_TRACK_STATE_REQUEST"] != true {
            return
        }
        let decodedChangeTrackStateRequest = HMSDecoder.getHmsChangeTrackStateRequest(changeTrackStateRequest, id)
        delegate?.emitEvent("ON_CHANGE_TRACK_STATE_REQUEST", decodedChangeTrackStateRequest)
    }

    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {
        HMSDecoder.clearRestrictDataStates()
        if eventsEnableStatus[ON_REMOVED_FROM_ROOM] != true {
            return
        }
        let requestedBy = notification.requestedBy as HMSPeer?
        var decodedRequestedBy: [String: Any]?
        if let requested = requestedBy {
            decodedRequestedBy = HMSDecoder.getHmsPeerSubset(requested)
        }
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.delegate?.emitEvent(ON_REMOVED_FROM_ROOM, ["event": ON_REMOVED_FROM_ROOM, "id": self.id, "requestedBy": decodedRequestedBy as Any, "reason": reason, "roomEnded": roomEnded ])
    }

    func on(rtcStats: HMSRTCStatsReport) {
        if eventsEnableStatus[ON_RTC_STATS] != true {
            return
        }
        let video = HMSDecoder.getHMSRTCStats(rtcStats.video)
        let audio = HMSDecoder.getHMSRTCStats(rtcStats.audio)
        let combined = HMSDecoder.getHMSRTCStats(rtcStats.combined)

        self.delegate?.emitEvent(ON_RTC_STATS, ["video": video, "audio": audio, "combined": combined, "id": self.id])
    }

    func on(localAudioStats: HMSLocalAudioStats, track: HMSAudioTrack, peer: HMSPeer) {
        if eventsEnableStatus[ON_LOCAL_AUDIO_STATS] != true {
            return
        }
        let localStats = HMSDecoder.getLocalAudioStats(localAudioStats)
        let localTrack = HMSDecoder.getHmsAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)

        self.delegate?.emitEvent(ON_LOCAL_AUDIO_STATS, ["localAudioStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(localVideoStats: [HMSLocalVideoStats], track: HMSVideoTrack, peer: HMSPeer) {
        if eventsEnableStatus[ON_LOCAL_VIDEO_STATS] != true {
            return
        }
        let localStats = HMSDecoder.getLocalVideoStats(localVideoStats)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)
        let localTrack = HMSDecoder.getHmsVideoTrack(track)

        self.delegate?.emitEvent(ON_LOCAL_VIDEO_STATS, ["localVideoStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(remoteAudioStats: HMSRemoteAudioStats, track: HMSAudioTrack, peer: HMSPeer) {
        if eventsEnableStatus[ON_REMOTE_AUDIO_STATS] != true {
            return
        }
        let remoteStats = HMSDecoder.getRemoteAudioStats(remoteAudioStats)
        let remoteTrack = HMSDecoder.getHmsAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)

        self.delegate?.emitEvent(ON_REMOTE_AUDIO_STATS, ["remoteAudioStats": remoteStats, "track": remoteTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(remoteVideoStats: HMSRemoteVideoStats, track: HMSVideoTrack, peer: HMSPeer) {
        if eventsEnableStatus[ON_REMOTE_VIDEO_STATS] != true {
            return
        }
        let remoteStats = HMSDecoder.getRemoteVideoStats(remoteVideoStats)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)
        let remoteTrack = HMSDecoder.getHmsVideoTrack(track)

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
            return "ROOM_PEER_COUNT_UPDATED"
        case .metaDataUpdated:
            return "ROOM_PEER_COUNT_UPDATED"
        case .browserRecordingStateUpdated:
            return "BROWSER_RECORDING_STATE_UPDATED"
        case .hlsStreamingStateUpdated:
            return "HLS_STREAMING_STATE_UPDATED"
        case .rtmpStreamingStateUpdated:
            return "RTMP_STREAMING_STATE_UPDATED"
        case .serverRecordingStateUpdated:
            return "SERVER_RECORDING_STATE_UPDATED"
        case .hlsRecordingStateUpdated:
            return "HLS_RECORDING_STATE_UPDATED"
        default:
            return ""
        }
    }

    func emitRequiredKeysError(_ error: String) {
        if eventsEnableStatus[ON_ERROR] != true {
            return
        }
        delegate?.emitEvent(ON_ERROR, ["error": ["code": 6002, "description": error, "isTerminal": false, "canRetry": true], "id": id])
    }
}
