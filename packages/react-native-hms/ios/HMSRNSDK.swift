//
//  Hmssdk.swift
//  HMSSDK
//
//  Copyright © 2023 100ms. All rights reserved.
//

import Foundation
import HMSSDK
import ReplayKit

class HMSRNSDK: HMSUpdateListener, HMSPreviewListener {

    var hms: HMSSDK?

    var delegate: HMSManager?
    var id: String = "12345"

    private var recentRoleChangeRequest: HMSRoleChangeRequest?
    internal var previewForRoleTracks: [HMSTrack]?
    private var reconnectingStage: Bool = false
    private var preferredExtension: String?
    private var systemBroadcastPicker: RPSystemBroadcastPickerView?
    private var startScreenshareResolve: RCTPromiseResolveBlock?
    private var stopScreenshareResolve: RCTPromiseResolveBlock?
    private var isScreenShared: Bool? = false
    private var previewInProgress = false
    private var networkQualityUpdatesAttached = false
    private var eventsEnableStatus: [String: Bool] = [:]
    private var sessionStore: HMSSessionStore?
    private var sessionStoreChangeObservers = [String: NSObjectProtocol]()

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

    // MARK: - Prebuilt

    func getRoomLayout(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let token = data["authToken"] as? String else {
            reject?("40000", "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["authToken"]), nil)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }

             if let endPoint = data["endpoint"] as? String, (endPoint.contains("mockable") || endPoint.contains("nonprod")) {
                  UserDefaults.standard.set(endPoint, forKey: "HMSRoomLayoutEndpointOverride")
             } else {
                   UserDefaults.standard.removeObject(forKey: "HMSRoomLayoutEndpointOverride")
             }

            strongSelf.hms?.getRoomLayout(using: token) { layout, error in

                if let rawData = layout?.rawData {
                    let jsonString = String(decoding: rawData, as: UTF8.self)
                    resolve?(jsonString)
                    return
                }

                let errorMessage = "\(#function) Could not parse Room Layout for Token: \(token), error: \(error?.localizedDescription ?? "Could not fetch the error")"
                reject?("40000", errorMessage, nil)
            }
        }
    }

    // MARK: - HMS SDK Actions

    func preview(_ credentials: NSDictionary) {

        guard !previewInProgress else {
            if eventsEnableStatus[HMSConstants.ON_ERROR] == true {
                delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": ["code": 5000, "description": "Preview is in progress", "isTerminal": false, "canRetry": true, "params": ["function": #function]] as [String: Any], "id": id])
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

        let endpoint = credentials.value(forKey: "endpoint") as? String

        let captureNetworkQualityInPreview = credentials.value(forKey: "captureNetworkQualityInPreview") as? Bool ?? false

        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else { return }

            let config = HMSConfig(userName: user,
                                   authToken: authToken,
                                   metadata: metadata,
                                   endpoint: endpoint,
                                   captureNetworkQualityInPreview: captureNetworkQualityInPreview)

            strongSelf.hms?.preview(config: config, delegate: strongSelf)

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
            DispatchQueue.main.async { [weak self] in
                self?.hms?.preview(role: extractedRole) { tracks, error in
                    if error != nil {
                        reject?(error?.localizedDescription, error?.localizedDescription, nil)
                        return
                    }

                    self?.previewForRoleTracks = tracks

                    let decodedTracks = HMSDecoder.getAllTracks(tracks ?? [])

                    resolve?(["success": true, "tracks": decodedTracks] as [String: Any])
                }
            }
        }
    }

    func cancelPreview(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
            self?.hms?.cancelPreview()
            self?.previewForRoleTracks = nil
            resolve?(["success": true])
        }
    }

    func join(_ credentials: NSDictionary) {

        guard !previewInProgress else {
            if eventsEnableStatus[HMSConstants.ON_ERROR] == true {
                delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": ["code": 5000, "description": "Preview is in progress", "isTerminal": false, "canRetry": true, "params": ["function": #function]] as [String: Any], "id": id])
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

            let config = HMSConfig(userName: user,
                                   authToken: authToken,
                                   metadata: metadata,
                                   endpoint: credentials.value(forKey: "endpoint") as? String,
                                   captureNetworkQualityInPreview: captureNetworkQualityInPreview)

            strongSelf.hms?.join(config: config, delegate: strongSelf)
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
            if let audioTrack = self?.hms?.localPeer?.localAudioTrack() {
                audioTrack.setMute(isMute)
            } else if let tracks = self?.previewForRoleTracks {
                if let audioTrack = tracks.first(where: { $0.kind == HMSTrackKind.audio }) as? HMSLocalAudioTrack {
                    audioTrack.setMute(isMute)
                }
            } else {
                print(#function, "No local audio track available for setting mute state.")
            }
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
            if let videoTrack = self?.hms?.localPeer?.localVideoTrack() {
                videoTrack.setMute(isMute)
            } else if let tracks = self?.previewForRoleTracks {
                if let videoTrack = tracks.first(where: { $0.kind == HMSTrackKind.video }) as? HMSLocalVideoTrack {
                    videoTrack.setMute(isMute)
                }
            } else {
                print(#function, "No local video track available for setting mute state.")
            }
        }
    }

    func switchCamera() {
        DispatchQueue.main.async { [weak self] in
            if let localVideoTrack = self?.hms?.localPeer?.localVideoTrack() {
                localVideoTrack.switchCamera()
            } else if let tracks = self?.previewForRoleTracks {
                if let videoTrack = tracks.first(where: { $0.kind == HMSTrackKind.video }) as? HMSLocalVideoTrack {
                    videoTrack.switchCamera()
                }
            } else {
                print(#function, "No local video track available for switching camera.")
            }
        }
    }

    func leave(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
            guard let strongSelf = self else {
                print(#function, "Could not find reference to self while executing Room leave")
                return
            }

            strongSelf.hms?.leave { [weak self] success, error in

                guard let strongSelf = self else {
                    print(#function, "Could not find reference to self when callback is received while executing Room leave")
                    return
                }

                if success {
                    resolve?(["success": success])
                    strongSelf.cleanup() // resetting states and doing data cleanup
                } else {
                    if strongSelf.eventsEnableStatus[HMSConstants.ON_ERROR] == true {
                        strongSelf.delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": HMSDecoder.getError(error), "id": strongSelf.id])
                    }
                    reject?("error in leave", "error in leave", nil)
                }
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
                    resolve?(["messageId": message?.messageID ?? "", "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]] as [String: Any])
                    return
                } else {
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
                    resolve?(["messageId": message?.messageID ?? "", "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]] as [String: Any])
                    return
                } else {
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
                    resolve?(["messageId": message?.messageID ?? "", "data": ["sender": message?.sender?.name ?? "", "message": message?.message ?? "", "type": message?.type]] as [String: Any])
                    return
                } else {
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
                    reject?(error?.localizedDescription, error?.localizedDescription, nil)
                }
            })
            self?.recentRoleChangeRequest = nil
            self?.previewForRoleTracks = nil
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
            guard let peer = HMSHelper.getPeerFromPeerId(peerId, remotePeers: self?.hms?.remotePeers, localPeer: self?.hms?.localPeer)
            else {
                reject?("PEER_NOT_FOUND", "PEER_NOT_FOUND", nil)
                return
            }

            guard let role = HMSHelper.getRoleFromRoleName(role, roles: self?.hms?.roles)
            else {
                reject?("ROLE_NOT_FOUND", "ROLE_NOT_FOUND", nil)
                return
            }

            self?.hms?.changeRole(for: peer, to: role, force: force, completion: { success, error in
                if success {
                    resolve?(["success": success])
                } else {
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
                    self?.cleanup() // resetting states and doing data cleanup
                } else {
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
            }
        }
    }

    func startRTMPOrRecording(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let record = data.value(forKey: "record") as? Bool
        else {
            let errorMessage = "startRTMPOrRecording: " + HMSHelper.getUnavailableRequiredKey(data, ["record"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        let meetingNullableString = data.value(forKey: "meetingURL") as? String

        let rtmpStrings = data.value(forKey: "rtmpURLs") as? [String]

        var meetingUrl: URL?
        if let meetingString = meetingNullableString, !meetingString.isEmpty {
            if let meetLink = URL(string: meetingString) {
                meetingUrl = meetLink
            } else {
                reject?("Invalid meeting url passed", "Invalid meeting url passed", nil)
            }
        }

        let URLs = HMSHelper.getRtmpUrls(rtmpStrings)

        let config = HMSRTMPConfig(meetingURL: meetingUrl, rtmpURLs: URLs, record: record)
        hms?.startRTMPOrRecording(config: config, completion: { success, error in
            if success {
                resolve?(["success": success])
                return
            } else {
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

    func raiseLocalPeerHand(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        self.hms?.raiseLocalPeerHand { success, error in
            if error != nil {
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
            resolve?(success)
        }
    }

    func lowerLocalPeerHand(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        self.hms?.lowerLocalPeerHand { success, error in
            if error != nil {
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
            resolve?(success)
        }
    }

    func lowerRemotePeerHand(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let peerId = data.value(forKey: "peerId") as? String else {
            let errorMessage = "lowerRemotePeerHand: " + HMSHelper.getUnavailableRequiredKey(data, ["peerId"])
            reject?(errorMessage, errorMessage, nil)
            return
        }

        guard let remotePeer = HMSHelper.getRemotePeerFromPeerId(peerId, remotePeers: self.hms?.remotePeers) else {
            let errorMessage = "lowerRemotePeerHand: Could not find remote peer with peerID - " + peerId
            reject?(errorMessage, errorMessage, nil)
            return
        }

        self.hms?.lowerRemotePeerHand(remotePeer) { success, error in
            if error != nil {
                reject?(error?.localizedDescription, error?.localizedDescription, nil)
                return
            }
            resolve?(success)
        }
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
                    reject?(error.localizedDescription, error.localizedDescription, nil)
                }
            } else {
                reject?("Incorrect URL", "Incorrect URL", nil)
            }
        } else {
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
                if eventsEnableStatus[HMSConstants.ON_ERROR] == true {
                    delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": ["code": 6002, "description": error.localizedDescription, "isTerminal": false, "canRetry": true, "params": ["function": #function]] as [String: Any], "id": id])
                }
            }
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
            reject?("AudioFilePlayerNode not found", "AudioFilePlayerNode not found", nil)
        }
    }

    func enableNetworkQualityUpdates() {
        networkQualityUpdatesAttached = true
    }

    func disableNetworkQualityUpdates() {
        networkQualityUpdatesAttached = false
    }

    func enableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let eventType = data.value(forKey: "eventType") as? String else {
            let errorMessage = "enableEvent: " + HMSHelper.getUnavailableRequiredKey(data, ["eventType"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        eventsEnableStatus[eventType] = true
        resolve?(["success": true] as [String: Any])
    }

    func disableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let eventType = data.value(forKey: "eventType") as? String else {
            let errorMessage = "disableEvent: " + HMSHelper.getUnavailableRequiredKey(data, ["eventType"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        eventsEnableStatus[eventType] = false
        resolve?(["success": true, "message": "function call executed successfully"] as [String: Any])
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
            case "isHandRaised":
                return ["isHandRaised": peer.isHandRaised]
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
                return ["peerCount": hmsRoom.peerCount as Any]

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

    func getRemoteVideoTrackFromTrackId(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let self = self,
                  let remotePeers = self.hms?.remotePeers,
                  let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            else {
                let errorMessage = "\(#function) " + "TRACK_NOT_FOUND"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            resolve?(HMSDecoder.getHMSRemoteVideoTrack(remoteVideoTrack))
        }
    }

    func getRemoteAudioTrackFromTrackId(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let self = self,
                  let remotePeers = self.hms?.remotePeers,
                  let remoteAudioTrack = HMSHelper.getRemoteAudioTrackFromTrackId(trackId, remotePeers)
            else {
                let errorMessage = "\(#function) " + "TRACK_NOT_FOUND"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            resolve?(HMSDecoder.getHMSRemoteAudioTrack(remoteAudioTrack))
        }
    }

    // MARK: - HMS SDK Delegate Callbacks
    func on(join room: HMSRoom) {
        if eventsEnableStatus[HMSConstants.ON_JOIN] != true {
            return
        }
        let roomData = HMSDecoder.getHmsRoomSubset(room)
        self.delegate?.emitEvent(HMSConstants.ON_JOIN, ["event": HMSConstants.ON_JOIN, "id": self.id, "room": roomData])
    }

    func onPreview(room: HMSRoom, localTracks: [HMSTrack]) {
        previewInProgress = false
        if eventsEnableStatus[HMSConstants.ON_PREVIEW] != true {
            return
        }
        let previewTracks = HMSDecoder.getPreviewTracks(localTracks)
        let hmsRoom = HMSDecoder.getHmsRoomSubset(room)

        self.delegate?.emitEvent(HMSConstants.ON_PREVIEW, ["event": HMSConstants.ON_PREVIEW, "id": self.id, "room": hmsRoom, "previewTracks": previewTracks])
    }

    func on(room: HMSRoom, update: HMSRoomUpdate) {
        if eventsEnableStatus[HMSConstants.ON_ROOM_UPDATE] != true {
            return
        }

        let roomData = HMSDecoder.getHmsRoomSubset(room, update)
        let type = getString(from: update)

        self.delegate?.emitEvent(HMSConstants.ON_ROOM_UPDATE, ["event": HMSConstants.ON_ROOM_UPDATE, "id": self.id, "type": type, "room": roomData])
    }

    func on(peer: HMSPeer, update: HMSPeerUpdate) {

        guard let isPeerUpdateEnabled = eventsEnableStatus[HMSConstants.ON_PEER_UPDATE],
                isPeerUpdateEnabled
        else { return }

        if !networkQualityUpdatesAttached && update == .networkQualityUpdated {
            return
        }

        let hmsPeer = HMSDecoder.getHmsPeerSubsetForPeerUpdateEvent(peer, update)

        self.delegate?.emitEvent(HMSConstants.ON_PEER_UPDATE, hmsPeer)
    }

    func onPeerListUpdate(added: [HMSPeer], removed: [HMSPeer]) {
        // NOT IMPLEMENTED
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

        if eventsEnableStatus[HMSConstants.ON_TRACK_UPDATE] != true {
            return
        }

        let type = getString(from: update)
        let hmsPeer = HMSDecoder.getHmsPeerSubset(peer)
        let hmsTrack = HMSDecoder.getHmsTrack(track)

        self.delegate?.emitEvent(HMSConstants.ON_TRACK_UPDATE, ["event": HMSConstants.ON_TRACK_UPDATE, "id": self.id, "type": type, "peer": hmsPeer, "track": hmsTrack])
    }

    func on(error: Error) {
        if previewInProgress { previewInProgress = false }
        if eventsEnableStatus[HMSConstants.ON_ERROR] != true {
            return
        }
        self.delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": HMSDecoder.getError(error), "id": id])
    }

    func on(message: HMSMessage) {
        if eventsEnableStatus[HMSConstants.ON_MESSAGE] != true {
            return
        }
        self.delegate?.emitEvent(HMSConstants.ON_MESSAGE, ["event": HMSConstants.ON_MESSAGE, "id": self.id, "sender": HMSDecoder.getHmsPeerSubset(message.sender), "recipient": HMSDecoder.getHmsMessageRecipient(message.recipient), "time": message.time.timeIntervalSince1970 * 1000, "message": message.message, "messageId": message.messageID, "type": message.type])
    }

    func on(updated speakers: [HMSSpeaker]) {
        if eventsEnableStatus[HMSConstants.ON_SPEAKER] != true {
            return
        }
        var speakerPeerIds: [[String: Any]] = []
        for speaker in speakers {
            speakerPeerIds.append(["peer": HMSDecoder.getHmsPeerSubset(speaker.peer), "level": speaker.level, "track": HMSDecoder.getHmsTrack(speaker.track)])
        }
        self.delegate?.emitEvent(HMSConstants.ON_SPEAKER, ["event": HMSConstants.ON_SPEAKER, "id": self.id, "speakers": speakerPeerIds])
    }

    func onReconnecting() {
        reconnectingStage = true
        if eventsEnableStatus[HMSConstants.RECONNECTING] != true {
            return
        }
        self.delegate?.emitEvent(HMSConstants.RECONNECTING, ["event": HMSConstants.RECONNECTING, "error": ["code": 1003, "description": "Network connection lost ", "isTerminal": false, "canRetry": true] as [String: Any], "id": self.id ])
    }

    func onReconnected() {
        reconnectingStage = false
        if eventsEnableStatus[HMSConstants.RECONNECTED] != true {
            return
        }
        self.delegate?.emitEvent(HMSConstants.RECONNECTED, ["event": HMSConstants.RECONNECTED, "id": self.id ])
    }

    func on(roleChangeRequest: HMSRoleChangeRequest) {
        recentRoleChangeRequest = roleChangeRequest
        if eventsEnableStatus[HMSConstants.ON_ROLE_CHANGE_REQUEST] != true {
            return
        }
        let decodedRoleChangeRequest = HMSDecoder.getHmsRoleChangeRequest(roleChangeRequest, self.id)
        self.delegate?.emitEvent(HMSConstants.ON_ROLE_CHANGE_REQUEST, decodedRoleChangeRequest)
    }

    func on(changeTrackStateRequest: HMSChangeTrackStateRequest) {
        if eventsEnableStatus[HMSConstants.ON_CHANGE_TRACK_STATE_REQUEST] != true {
            return
        }
        let decodedChangeTrackStateRequest = HMSDecoder.getHmsChangeTrackStateRequest(changeTrackStateRequest, id)
        delegate?.emitEvent(HMSConstants.ON_CHANGE_TRACK_STATE_REQUEST, decodedChangeTrackStateRequest)
    }

    func on(removedFromRoom notification: HMSRemovedFromRoomNotification) {

        if eventsEnableStatus[HMSConstants.ON_REMOVED_FROM_ROOM] != true {
            self.cleanup() // resetting states and doing data cleanup
            return
        }

        let requestedBy = notification.requestedBy as HMSPeer?
        var decodedRequestedBy: [String: Any]?
        if let requested = requestedBy {
            decodedRequestedBy = HMSDecoder.getHmsPeerSubset(requested)
        }
        let reason = notification.reason
        let roomEnded = notification.roomEnded
        self.delegate?.emitEvent(HMSConstants.ON_REMOVED_FROM_ROOM, ["event": HMSConstants.ON_REMOVED_FROM_ROOM, "id": self.id, "requestedBy": decodedRequestedBy as Any, "reason": reason, "roomEnded": roomEnded ])

        self.cleanup() // resetting states and doing data cleanup
    }

    func on(sessionStoreAvailable store: HMSSessionStore) {
        self.sessionStore = store
        if eventsEnableStatus[HMSConstants.ON_SESSION_STORE_AVAILABLE] != true {
            return
        }
        self.delegate?.emitEvent(HMSConstants.ON_SESSION_STORE_AVAILABLE, ["id": self.id])
    }

    func on(rtcStats: HMSRTCStatsReport) {
        if eventsEnableStatus[HMSConstants.ON_RTC_STATS] != true {
            return
        }
        let video = HMSDecoder.getHMSRTCStats(rtcStats.video) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
        let audio = HMSDecoder.getHMSRTCStats(rtcStats.audio) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
        let combined = HMSDecoder.getHMSRTCStats(rtcStats.combined) // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]

        self.delegate?.emitEvent(HMSConstants.ON_RTC_STATS, ["video": video, "audio": audio, "combined": combined, "id": self.id])
    }

    func on(localAudioStats: HMSLocalAudioStats, track: HMSAudioTrack, peer: HMSPeer) {
        if eventsEnableStatus[HMSConstants.ON_LOCAL_AUDIO_STATS] != true {
            return
        }
        let localStats = HMSDecoder.getLocalAudioStats(localAudioStats) // [bitrate, bytesSent, roundTripTime]
        let localTrack = HMSDecoder.getHmsAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)

        self.delegate?.emitEvent(HMSConstants.ON_LOCAL_AUDIO_STATS, ["localAudioStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(localVideoStats: [HMSLocalVideoStats], track: HMSVideoTrack, peer: HMSPeer) { // DOUBT: HMSLocalVideoTrack instead of HMSVideoTrack?
        if eventsEnableStatus[HMSConstants.ON_LOCAL_VIDEO_STATS] != true {
            return
        }
        let localStats = HMSDecoder.getLocalVideoStats(localVideoStats) // List<[bitrate, bytesSent, roundTripTime, frameRate, resolution, layer]>
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)
        let localTrack = HMSDecoder.getHmsVideoTrack(track)

        self.delegate?.emitEvent(HMSConstants.ON_LOCAL_VIDEO_STATS, ["localVideoStats": localStats, "track": localTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(remoteAudioStats: HMSRemoteAudioStats, track: HMSAudioTrack, peer: HMSPeer) {
        if eventsEnableStatus[HMSConstants.ON_REMOTE_AUDIO_STATS] != true {
            return
        }
        let remoteStats = HMSDecoder.getRemoteAudioStats(remoteAudioStats) // [bitrate, bytesReceived, jitter, packetsLost, packetsReceived]
        let remoteTrack = HMSDecoder.getHmsAudioTrack(track)
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)

        self.delegate?.emitEvent(HMSConstants.ON_REMOTE_AUDIO_STATS, ["remoteAudioStats": remoteStats, "track": remoteTrack, "peer": decodedPeer, "id": self.id])
    }

    func on(remoteVideoStats: HMSRemoteVideoStats, track: HMSVideoTrack, peer: HMSPeer) {
        if eventsEnableStatus[HMSConstants.ON_REMOTE_VIDEO_STATS] != true {
            return
        }
        let remoteStats = HMSDecoder.getRemoteVideoStats(remoteVideoStats) // [bitrate, bytesReceived, frameRate, jitter, packetsLost, packetsReceived, resolution]
        let decodedPeer = HMSDecoder.getHmsPeerSubset(peer)
        let remoteTrack = HMSDecoder.getHmsVideoTrack(track)

        self.delegate?.emitEvent(HMSConstants.ON_REMOTE_VIDEO_STATS, ["remoteVideoStats": remoteStats, "track": remoteTrack, "peer": decodedPeer, "id": self.id])
    }

    // MARK: - Simulcast

    func getVideoTrackLayerDefinition(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let self = self,
                  let remotePeers = self.hms?.remotePeers,
                  let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            else {
                let errorMessage = "\(#function) " + "TRACK_NOT_FOUND"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            guard let layerDefinitions = remoteVideoTrack.layerDefinitions
            else {
                let errorMessage = "\(#function) " + "layer definitions not available for track: '\(trackId)' !"
                self.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            let parsedLayerDefinitions = HMSDecoder.getSimulcastLayerDefinitions(for: layerDefinitions)

            resolve?(parsedLayerDefinitions)
        }
    }

    func getVideoTrackLayer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        guard let trackId = data.value(forKey: "trackId") as? String
        else {
            let errorMessage = "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["trackId"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let self = self,
                  let remotePeers = self.hms?.remotePeers,
                  let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            else {
                let errorMessage = "\(#function) " + "TRACK_NOT_FOUND"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            let parsedLayer = HMSDecoder.getString(from: remoteVideoTrack.layer)

            resolve?(parsedLayer)
        }
    }

    func setVideoTrackLayer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let trackId = data.value(forKey: "trackId") as? String,
              let layer = data.value(forKey: "layer") as? String
        else {
            let errorMessage = "\(#function) " + HMSHelper.getUnavailableRequiredKey(data, ["trackId", "layer"])
            emitRequiredKeysError(errorMessage)
            reject?(errorMessage, errorMessage, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in

            guard let self = self,
                  let remotePeers = self.hms?.remotePeers,
                  let remoteVideoTrack = HMSHelper.getRemoteVideoTrackFromTrackId(trackId, remotePeers)
            else {
                let errorMessage = "\(#function) " + "TRACK_NOT_FOUND"
                self?.emitRequiredKeysError(errorMessage)
                reject?(errorMessage, errorMessage, nil)
                return
            }

            switch layer.uppercased() {
            case "LOW":
                remoteVideoTrack.layer = .low
            case "MEDIUM":
                remoteVideoTrack.layer = .mid
            default:
                remoteVideoTrack.layer = .high
            }

            resolve?(true)
        }
    }

    // MARK: - Advanced Camera Controls

    func captureImageAtMaxSupportedResolution(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        let withFlash = data["flash"] as? Bool ?? false

        DispatchQueue.main.async { [weak self] in

            guard let localPeer = self?.hms?.localPeer else {
                let errorMessage = "\(#function) An instance of Local Peer could not be found. Please check if a Room is joined."
                reject?("6004", errorMessage, nil)
                return
            }

            guard let localVideoTrack = localPeer.localVideoTrack()
            else {
                let errorMessage = "\(#function) Video Track of Local Peer could not be found. Please check if the Local Peer has permission to publish video & video is unmuted currently."
                reject?("6004", errorMessage, nil)
                return
            }

            localVideoTrack.captureImageAtMaxSupportedResolution(withFlash: withFlash) { image in

                guard let rawImage = image, let capturedImage = rawImage.fixOrientation() else {
                    let errorMessage = "\(#function) Could not capture image of the Local Peer's Video Track."
                    reject?("6004", errorMessage, nil)
                    return
                }

                guard let data = capturedImage.pngData() else {
                    let errorMessage = "\(#function) Could not compress image of the Local Peer's Video Track to png data."
                    reject?("6004", errorMessage, nil)
                    return
                }

                let filePath = HMSRNSDK.getDocumentsDirectory().appendingPathComponent("hms_\(HMSRNSDK.getTimeStamp()).png")

                do {
                    try data.write(to: filePath)

                    resolve?(filePath.relativePath)
                } catch let error {
                    let errorMessage = "\(#function) Could not write to disk the image data  of the Local Peer's Video Track. \(error.localizedDescription)"
                    reject?("6004", errorMessage, nil)
                    return
                }
            }
        }
    }

    // MARK: - Session Store

    func getSessionMetadataForKey(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        DispatchQueue.main.async { [weak self] in

            guard let store = self?.sessionStore
            else {
                let errorMessage = "\(#function) Session Store is null"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let data = data as? [AnyHashable: Any],
                let key = data["key"] as? String
            else {
                let errorMessage = "\(#function) Key to be fetched from Session Store is null." + HMSHelper.getUnavailableRequiredKey(data, ["key"])
                reject?("6004", errorMessage, nil)
                return
            }

            store.object(forKey: key) { value, error in

                if let error = error {
                    let errorMessage = "\(#function) Error in fetching key: \(key) from Session Store. Error: \(error.localizedDescription)"
                    reject?("6004", errorMessage, nil)
                    return
                }

                if let value = value {
                    if let stringValue = value as? String {
                        resolve?(stringValue)
                    } else {
                        let errorMessage = "\(#function) Session Store value for the key: \(key) is not of String Type. Value: \(value)"
                        reject?("6004", errorMessage, nil)
                    }
                } else {
                    resolve?(nil)
                }
            }
        }
    }

    func setSessionMetadataForKey(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        DispatchQueue.main.async { [weak self] in

            guard let store = self?.sessionStore
            else {
                let errorMessage = "\(#function) Session Store is null"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let data = data as? [AnyHashable: Any],
                let key = data["key"] as? String
            else {
                let errorMessage = "\(#function) Key for the object to be set in Session Store is null." + HMSHelper.getUnavailableRequiredKey(data, ["key"])
                reject?("6004", errorMessage, nil)
                return
            }

            let valueToBeSet = data["value"] as Any

            store.set(valueToBeSet, forKey: key) { value, error in

                if let error = error {
                    let errorMessage = "\(#function) Error in setting value: \(valueToBeSet) for key: \(key) to the Session Store. Error: \(error.localizedDescription)"
                    reject?("6004", errorMessage, nil)
                    return
                }
                resolve?(["success": true, "finalValue": value])
            }
        }
    }

    func addKeyChangeListener(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        DispatchQueue.main.async { [weak self] in

            guard let store = self?.sessionStore
            else {
                let errorMessage = "\(#function) Session Store is null"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let data = data as? [AnyHashable: Any]
            else {
                let errorMessage = "\(#function) No arguments passed which can be attached to Key Change Listener on the Session Store."
                reject?("6004", errorMessage, nil)
                return
            }

            guard let keys = data["keys"] as? [String]
            else {
                let errorMessage = "\(#function) No keys passed which can be attached to Key Change Listener on the Session Store. Available arguments: \(data)"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let uniqueId = data["uniqueId"] as? String
            else {
                let errorMessage = "\(#function) No uniqueId passed which can be used to attach Key Change Listener on the Session Store. Available arguments: \(data)"
                reject?("6004", errorMessage, nil)
                return
            }

            store.observeChanges(forKeys: keys, changeObserver: { [weak self] key, value in

                var data = [String: Any]()

                data["id"] = self?.id

                data["key"] = key

                if let value = value {
                    if let stringValue = value as? String {
                        data["value"] = stringValue
                    } else {
                        let errorMessage = "\(#function) Session Store value for the key: \(key) is not of String Type. Value: \(value)"
                        print(errorMessage)
                    }
                }
                self?.delegate?.emitEvent(HMSConstants.ON_SESSION_STORE_CHANGED, data)

            }) { [weak self] observer, error in

                    if let error = error {
                        let errorMessage = "\(#function) Error in observing changes for key: \(keys) in the Session Store. Error: \(error.localizedDescription)"
                        reject?("6004", errorMessage, nil)
                        return
                    }

                    guard let observer = observer
                    else {
                        let errorMessage = "\(#function) Unknown Error in observing changes for key: \(keys) in the Session Store."
                        reject?("6004", errorMessage, nil)
                        return
                    }

                    guard let self = self
                    else {
                        let errorMessage = "\(#function) Could not find self instance while observing changes for key: \(keys) in the Session Store."
                        reject?("6004", errorMessage, nil)
                        return
                    }

                    self.sessionStoreChangeObservers[uniqueId] = observer

                    resolve?(true)
                }
        }
    }

    func removeKeyChangeListener(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        DispatchQueue.main.async { [weak self] in

            guard let store = self?.sessionStore
            else {
                let errorMessage = "\(#function) Session Store is null"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let data = data as? [AnyHashable: Any]
            else {
                let errorMessage = "\(#function) No arguments passed which can be used to remove Key Change Listener from the Session Store."
                reject?("6004", errorMessage, nil)
                return
            }

            guard let uniqueId = data["uniqueId"] as? String
            else {
                let errorMessage = "\(#function) No uniqueId passed which can be used to remove Key Change Listener from the Session Store. Available arguments: \(data)"
                reject?("6004", errorMessage, nil)
                return
            }

            guard let observerToBeRemoved = self?.sessionStoreChangeObservers[uniqueId]
            else {
                let errorMessage = "\(#function) No listener found to remove for the uniqueId passed. Available arguments: \(data)"
                reject?("6004", errorMessage, nil)
                return
            }

            self?.sessionStoreChangeObservers.removeValue(forKey: uniqueId)

            store.removeObserver(observerToBeRemoved)

            resolve?(true)
        }
    }

    // MARK: - Helper Functions

    // Handle resetting states and data cleanup
    private func cleanup() {
        self.recentRoleChangeRequest = nil
        self.previewForRoleTracks = nil
        self.reconnectingStage = false
        self.preferredExtension = nil
        self.systemBroadcastPicker = nil
        self.startScreenshareResolve = nil
        self.stopScreenshareResolve = nil
        self.isScreenShared = false
        self.previewInProgress = false
        self.networkQualityUpdatesAttached = false
        self.eventsEnableStatus.removeAll()
        self.sessionStore = nil
        self.sessionStoreChangeObservers.removeAll()
        HMSDecoder.clearRestrictDataStates()
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
        case .roomTypeChanged, .metaDataUpdated, .peerCountUpdated:
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
        if eventsEnableStatus[HMSConstants.ON_ERROR] != true {
            return
        }
        delegate?.emitEvent(HMSConstants.ON_ERROR, ["error": ["code": 7000, "description": error, "isTerminal": false, "canRetry": true] as [String: Any], "id": id])
    }

    static private func getDocumentsDirectory() -> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0]
    }

    static private func getTimeStamp() -> String {
        "\(Date().timeIntervalSince1970)"
    }
}

extension UIImage {
    func fixOrientation() -> UIImage? {
        if self.imageOrientation == UIImage.Orientation.up {
            return self
        }

        UIGraphicsBeginImageContext(self.size)
        self.draw(in: CGRect(origin: .zero, size: self.size))
        let normalizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return normalizedImage
    }
}
