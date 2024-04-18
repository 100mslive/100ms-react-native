import HMSSDK
import Foundation

class HMSDecoder: NSObject {
    static private var restrictRoleData: [String: Bool] = [:]

    static func setRestrictRoleData (_ roleName: String, _ value: Bool) {
        restrictRoleData[roleName] = value
    }

    static func clearRestrictDataStates () {
        restrictRoleData.removeAll()
    }

    static func getHmsRoomSubset(_ hmsRoom: HMSRoom?, _ hmsRoomUpdateType: HMSRoomUpdate? = nil) -> [String: Any] {

        guard let room = hmsRoom else { return [String: Any]() }

        var data: [String: Any] = ["id": room.roomID ?? ""]

        switch hmsRoomUpdateType {
            case .none:
                return data
            case .peerCountUpdated:
                data["peerCount"] = room.peerCount
                return data
            case .hlsRecordingStateUpdated:
                let hlsRecordingState = HMSDecoder.getHlsRecordingState(hmsRoom?.hlsRecordingState)
                data["hlsRecordingState"] = hlsRecordingState
                return data
            case .browserRecordingStateUpdated:
                let browserRecordingState = HMSDecoder.getBrowserRecordingState(hmsRoom?.browserRecordingState)
                data["browserRecordingState"] = browserRecordingState
                return data
            case .hlsStreamingStateUpdated:
                let hlsStreamingState = HMSDecoder.getHlsStreamingState(hmsRoom?.hlsStreamingState)
                data["hlsStreamingState"] = hlsStreamingState
                return data
            case .rtmpStreamingStateUpdated:
                let rtmpStreamingState = HMSDecoder.getRtmpStreamingState(hmsRoom?.rtmpStreamingState)
                data["rtmpHMSRtmpStreamingState"] = rtmpStreamingState
                return data
            case .serverRecordingStateUpdated:
                let serverRecordingState = HMSDecoder.getServerRecordingState(hmsRoom?.serverRecordingState)
                data["serverRecordingState"] = serverRecordingState
                return data
            default:
                return data
        }
    }

    static func getHmsRoom(_ hmsRoom: HMSRoom?) -> [String: Any] {
        var data = [String: Any]()

        guard let room = hmsRoom else { return data }

        data["id"] = room.roomID ?? ""
        if let sessionId = room.sessionID {
            data["sessionId"] = sessionId
        }
        data["name"] = room.name ?? ""
        if let metaData = room.metaData {
            data["metaData"] = metaData
        }
        data["peerCount"] = room.peerCount
        // if let startedAt = room.sessionStartedAt?.timeIntervalSince1970 {
        //     data["startedAt"] = startedAt * 1000
        // }
        data["browserRecordingState"] = HMSDecoder.getBrowserRecordingState(hmsRoom?.browserRecordingState)
        data["rtmpHMSRtmpStreamingState"] = HMSDecoder.getRtmpStreamingState(hmsRoom?.rtmpStreamingState)
        data["serverRecordingState"] = HMSDecoder.getServerRecordingState(hmsRoom?.serverRecordingState)
        data["hlsStreamingState"] = HMSDecoder.getHlsStreamingState(hmsRoom?.hlsStreamingState)
        data["hlsRecordingState"] = HMSDecoder.getHlsRecordingState(hmsRoom?.hlsRecordingState)
        var peers = [[String: Any]]()

        for peer in room.peers {
            let parsedPeer = getHmsPeerSubset(peer)
            peers.append(parsedPeer)
            if peer.isLocal {
                data["localPeer"] = parsedPeer
            }
        }
        data["peers"] = peers

        data["isLargeRoom"] = room.isLarge

        return data
    }

    static func getPeerUpdateTypeOrdinals(_ peerUpdateType: HMSPeerUpdate) -> String? {
        switch peerUpdateType {
            case .peerJoined: return "0"
            case .peerLeft: return "1"
            case .roleUpdated: return "4"
            case .nameUpdated: return "5"
            case .metadataUpdated: return "6"
            case .networkQualityUpdated: return "7"
            case .handRaiseUpdated: return "8"
            default: return nil
        }
    }

    static func getHmsPeerSubsetForPeerUpdateEvent (_ hmsPeer: HMSPeer?, _ peerUpdateType: HMSPeerUpdate) -> [String: Any] {

        guard let peer = hmsPeer else { return [String: Any]() }

        var peerDict = [String: Any]()

        guard let updateType = getPeerUpdateTypeOrdinals(peerUpdateType) else { return peerDict }

        peerDict[updateType] = peer.peerID
        peerDict["name"] = peer.name

        switch peerUpdateType {
            case .metadataUpdated:
                peerDict["metadata"] = peer.metadata ?? ""
                return peerDict
            case .handRaiseUpdated:
                peerDict["isHandRaised"] = peer.isHandRaised
                return peerDict
            case .roleUpdated:
                peerDict["role"] = getHmsRole(peer.role)
                return peerDict
            case .networkQualityUpdated:
                if let quality = peer.networkQuality {
                    peerDict["networkQuality"] = getHmsNetworkQuality(quality)
                }
                return peerDict
            default:
                return peerDict
        }
    }

    static func getHmsPeerSubset (_ hmsPeer: HMSPeer?, _ peerUpdateType: HMSPeerUpdate? = nil) -> [String: Any] {

        guard let peer = hmsPeer else { return [String: Any]() }

        var peerDict = [String: Any]()

        peerDict["peerID"] = peer.peerID
        peerDict["name"] = peer.name

        switch peerUpdateType {
            case .metadataUpdated:
                peerDict["metadata"] = peer.metadata ?? ""
                return peerDict
            case .handRaiseUpdated:
                peerDict["isHandRaised"] = peer.isHandRaised
                return peerDict
            case .roleUpdated:
                peerDict["role"] = getHmsRole(peer.role)
                return peerDict
            case .networkQualityUpdated:
                if let quality = peer.networkQuality {
                    peerDict["networkQuality"] = getHmsNetworkQuality(quality)
                }
                return peerDict
            default:
                return peerDict
        }
    }

    static func getHmsPeer (_ hmsPeer: HMSPeer?) -> [String: Any] {
        var data = [String: Any]()

        guard let peer = hmsPeer else { return data }

        data["peerID"] = peer.peerID
        data["name"] = peer.name
        data["isLocal"] = peer.isLocal

        if let customerUserID = peer.customerUserID {
            data["customerUserID"] = customerUserID
        }

        if let metadata = peer.metadata {
            data["metadata"] = metadata
        }
        data["isHandRaised"] = peer.isHandRaised

        data["type"] = getPeerType(type: peer.type)

        // joinedAt

        data["role"] = getHmsRole(peer.role)

        if let networkQuality = peer.networkQuality {
            data["networkQuality"] = getHmsNetworkQuality(networkQuality)
        }

        if let audioTrack = peer.audioTrack {
            data["audioTrack"] = getHmsAudioTrack(audioTrack)
        }

        if let videoTrack = peer.videoTrack {
            data["videoTrack"] = getHmsVideoTrack(videoTrack)
        }

        if let auxiliaryTracks = peer.auxiliaryTracks, auxiliaryTracks.count > 0 {
            data["auxiliaryTracks"] = getAllTracks(auxiliaryTracks)
        }

        return data
    }

    static func getAllTracks (_ tracks: [HMSTrack]) -> [[String: Any]] {
        var auxiliaryTracks = [[String: Any]]()

        for track in tracks {
            auxiliaryTracks.append(getHmsTrack(track))
        }
        return auxiliaryTracks
    }

    static func getHmsTrack (_ track: HMSTrack?) -> [String: Any] {

        guard let hmsTrack = track else { return [String: Any]() }

        let trackId = hmsTrack.trackId
        let source = hmsTrack.source
        let trackDescription = hmsTrack.trackDescription
        let isMute = hmsTrack.isMute()
        let type = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": type, "kind": type]
    }

    static func getHmsAudioTrack (_ hmsAudioTrack: HMSAudioTrack?) -> [String: Any] {

        guard let hmsTrack = hmsAudioTrack else { return [String: Any]() }

        let trackId: String = hmsTrack.trackId
        let source: String = hmsTrack.source
        let trackDescription: String = hmsTrack.trackDescription
        let isMute: Bool = hmsTrack.isMute()
        let kind: String = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": kind, "kind": kind]
    }

    static func getHmsVideoTrack (_ hmsVideoTrack: HMSVideoTrack?) -> [String: Any] {

        guard let hmsTrack = hmsVideoTrack else { return [String: Any]() }

        let trackId = hmsTrack.trackId
        let source = hmsTrack.source
        let trackDescription = hmsTrack.trackDescription
        let isMute = hmsTrack.isMute()
        let isDegraded = hmsTrack.isDegraded()
        let kind: String = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "isDegraded": isDegraded, "type": kind, "kind": kind]
    }

    static func getPeerType(type: HMSPeerType) -> String {
        switch type {
        case .sip:
            return "SIP"
        default:
            return "REGULAR"
        }
    }

    static func getHmsLocalPeer(_ hmsLocalPeer: HMSLocalPeer?) -> [String: Any] {

        guard let peer = hmsLocalPeer else { return [String: Any]() }

        var peerDict = [String: Any]()

        peerDict["peerID"] = peer.peerID
        peerDict["name"] = peer.name

        if let audio = peer.audioTrack {
            if let localAudio = audio as? HMSLocalAudioTrack {
                peerDict["localAudioTrackData"] = getHmsLocalAudioTrack(localAudio)
            }
        }

        if let video = peer.videoTrack {
            if let localVideo = video as? HMSLocalVideoTrack {
                peerDict["localVideoTrackData"] = getHmsLocalVideoTrack(localVideo)
            }
        }

        return peerDict
    }

    static func getHmsLocalAudioTrack(_ localAudio: HMSLocalAudioTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(localAudio.kind) ?? ""
        return ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings), "isMute": localAudio.isMute(), "type": type, "kind": type]
    }

    static func getHmsLocalVideoTrack(_ localVideo: HMSLocalVideoTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(localVideo.kind) ?? ""
        return ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings), "isMute": localVideo.isMute(), "type": type, "kind": type]
    }

    static func getHmsAudioTrackSettings(_ hmsAudioTrackSettings: HMSAudioTrackSettings?) -> [String: Any?] {

        guard let settings = hmsAudioTrackSettings else { return [String: Any]() }

        // TODO: parsing not done for audioSource
        let audioSource = settings.audioSource
        let initialState = HMSHelper.getHMSTrackInitState(settings.initialMuteState)

        return ["audioSource": audioSource, "initialState": initialState]
    }

    static func getHmsVideoTrackSettings(_ hmsVideoTrackSettings: HMSVideoTrackSettings?) -> [String: Any] {

        guard let settings = hmsVideoTrackSettings else { return [String: Any]() }

        let cameraFacing = getHmsVideoTrackCameraFacing(settings.cameraFacing)
        let initialState = HMSHelper.getHMSTrackInitState(settings.initialMuteState)

        var simulcastSettingsData = [[String: Any]]()
        if let simulcastSettings = settings.simulcastSettings {
            for simulcast in simulcastSettings {
                let data = ["maxBitrate": simulcast.maxBitrate,
                            "maxFrameRate": simulcast.maxFrameRate,
                            "scaleResolutionDownBy": simulcast.scaleResolutionDownBy,
                            "rid": simulcast.rid] as [String: Any]
                simulcastSettingsData.append(data)
            }
        }

        return ["initialState": initialState, "cameraFacing": cameraFacing, "simulcastSettings": simulcastSettingsData]
    }

    static func getHmsVideoTrackCodec(_ codec: HMSCodec) -> String {
        switch codec {
        case HMSCodec.VP8:
            return "VP8"
        case HMSCodec.H264:
            return "H264"
        default:
            return "VP8"
        }
    }

    static func getHmsVideoTrackCameraFacing(_ cameraFacing: HMSCameraFacing) -> String {
        switch cameraFacing {
        case HMSCameraFacing.front:
            return "FRONT"
        case HMSCameraFacing.back:
            return "BACK"
        default:
            return "FRONT"
        }
    }

    static func getHmsVideoResolution(_ hmsVideoResolution: HMSVideoResolution?) -> [Double] {
        guard let resolution = hmsVideoResolution else { return [] }

        return [resolution.width, resolution.height]
    }

    static func getHmsRemotePeers (_ remotePeers: [HMSRemotePeer]?) -> [[String: Any]] {
        guard let remotePeers = remotePeers else { return [[String: Any]()] }

        var peers = [[String: Any]]()

        for peer in remotePeers {
            peers.append(getHmsRemotePeer(peer))
        }

        return peers
    }

    static func getHmsRemotePeer(_ peer: HMSRemotePeer) -> [String: Any] {

        var peerDict = [String: Any]()

        peerDict["peerID"] = peer.peerID
        peerDict["name"] = peer.name

        // joinedAt

        if let audio = peer.audioTrack {
            if let remoteAudio = audio as? HMSRemoteAudioTrack {
                peerDict["remoteAudioTrackData"] = getHMSRemoteAudioTrack(remoteAudio)
            }
        }

        if let video = peer.videoTrack {
            if let remoteVideo = video as? HMSRemoteVideoTrack {
                peerDict["remoteVideoTrackData"] = getHMSRemoteVideoTrack(remoteVideo)
            }
        }

        return peerDict
    }

    static func getHMSRemoteAudioTrack(_ remoteAudio: HMSRemoteAudioTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(remoteAudio.kind) ?? ""
        return ["trackId": remoteAudio.trackId, "source": remoteAudio.source, "trackDescription": remoteAudio.trackDescription, "playbackAllowed": remoteAudio.isPlaybackAllowed(), "isMute": remoteAudio.isMute(), "type": type, "kind": type]
    }

    static func getHMSRemoteVideoTrack(_ remoteVideo: HMSRemoteVideoTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(remoteVideo.kind) ?? ""
        return ["trackId": remoteVideo.trackId, "source": remoteVideo.source, "trackDescription": remoteVideo.trackDescription, "layer": remoteVideo.layer.rawValue, "playbackAllowed": remoteVideo.isPlaybackAllowed(), "isMute": remoteVideo.isMute(), "isDegraded": remoteVideo.isDegraded(), "type": type, "kind": type]
    }

    static func getPreviewTracks(_ tracks: [HMSTrack]) -> [[String: Any]] {

        var hmsTracks = [[String: Any]]()

        for track in tracks {
            if let localVideo = track as? HMSLocalVideoTrack {
                let type = HMSHelper.getHmsTrackType(localVideo.kind) ?? ""
                let localVideoTrackData: [String: Any] = ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings), "isMute": localVideo.isMute(), "kind": type, "type": type]
                hmsTracks.append(localVideoTrackData)
            }

            if let localAudio = track as? HMSLocalAudioTrack {
                let type = HMSHelper.getHmsTrackType(localAudio.kind) ?? ""
                let localAudioTrackData: [String: Any]  = ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings), "isMute": localAudio.isMute(), "kind": type, "type": type]
                hmsTracks.append(localAudioTrackData)
            }
        }
        return hmsTracks
    }

    static func getAllRoles(_ roles: [HMSRole]?) -> [[String: Any]] {
        var decodedRoles = [[String: Any]]()
        if let extractedRoles = roles {
            for role in extractedRoles {
                decodedRoles.append(HMSDecoder.getHmsRole(role))
            }
        }
        return decodedRoles
    }

    static func getHmsRole(_ hmsRole: HMSRole?) -> [String: Any] {
        var parsedRole = [String: Any]()

        guard let role = hmsRole else { return parsedRole }

        parsedRole["name"] = role.name

        if restrictRoleData[role.name] == true {
            return parsedRole
        }

        parsedRole["permissions"] = getPermissions(role.permissions)
        parsedRole["publishSettings"] = getPublishSettings(from: role.publishSettings)
        parsedRole["subscribeSettings"] = getSubscribeSettings(from: role.subscribeSettings)
        parsedRole["priority"] = role.priority

        return parsedRole
    }

    static private func getPermissions (_ permissions: HMSPermissions) -> [String: Any] {
        [
            "endRoom": permissions.endRoom ?? false,
            "removeOthers": permissions.removeOthers ?? false,
            "browserRecording": permissions.browserRecording ?? false,
            "hlsStreaming": permissions.hlsStreaming ?? false,
            "rtmpStreaming": permissions.rtmpStreaming ?? false,
            "mute": permissions.mute ?? false,
            "unmute": permissions.unmute ?? false,
            "changeRole": permissions.changeRole ?? false,
            "pollRead": permissions.pollRead ?? false,
            "pollWrite": permissions.pollWrite ?? false
        ]
    }

    // MARK: - HMSRole Publish Settings and Utility functions
    static private func getPublishSettings(from publishSettings: HMSPublishSettings) -> [String: Any]? {

        var settings = [String: Any]()

        settings["audio"] = getHmsAudioSettings(publishSettings.audio)
        settings["video"] = getHmsVideoSettings(publishSettings.video)
        settings["screen"] = getHmsVideoSettings(publishSettings.screen)

        if let allowed = publishSettings.allowed {
            settings["allowed"] = getWriteableArray(allowed)
        }

        if let simulcast = publishSettings.simulcast,
           let simulcastSettings = getSimulcastSettings(from: simulcast) {
            settings["simulcast"] = simulcastSettings
        }

        return settings
    }

    static func getWriteableArray(_ array: [String]?) -> [String] {
        var decodedArray = [String]()
        if let extractedArray = array {
            for value in extractedArray {
                decodedArray.append(value)
            }
        }
        return decodedArray
    }

    static private func getHmsAudioSettings(_ audioSettings: HMSAudioSettings) -> [String: Any] {
        let bitRate = audioSettings.bitRate
        let codec = audioSettings.codec

        return ["bitRate": bitRate, "codec": codec]
    }

    static private func getHmsVideoSettings(_ videoSettings: HMSVideoSettings) -> [String: Any] {

        let bitRate = videoSettings.bitRate
        let codec = videoSettings.codec
        let frameRate = videoSettings.frameRate
        let width = videoSettings.width
        let height = videoSettings.height

        return ["bitRate": bitRate ?? 0, "codec": codec, "frameRate": frameRate, "width": width, "height": height]
    }

    static private func getSimulcastSettings(from simulcast: HMSSimulcastSettings) -> [String: Any]? {

        var videoSettings: [String: Any]?

        if let video = simulcast.video,
           let settingsPolicy = getSimulcastSettingsPolicy(from: video) {
            videoSettings = settingsPolicy
        }

        var screenSettings: [String: Any]?

        if let screen = simulcast.screen,
           let settingsPolicy = getSimulcastSettingsPolicy(from: screen) {
            screenSettings = settingsPolicy
        }

        if videoSettings != nil || screenSettings != nil {
            var settings = [String: Any]()

            if let video = videoSettings {
                settings["video"] = video
            }

            if let screen = screenSettings {
                settings["screen"] = screen
            }

            return settings
        }

        return nil
    }

    static private func getSimulcastSettingsPolicy(from simulcastSettingsPolicy: HMSSimulcastSettingsPolicy) -> [String: Any]? {

        if let layers = simulcastSettingsPolicy.layers {
            var simulcastSettingsPolicy = [String: Any]()

            var layersData = [[String: Any]]()

            for layer in layers {
              layersData.append(getSimulcastLayerSettingsPolicy(from: layer))
            }

            simulcastSettingsPolicy["layers"] = layersData

            return simulcastSettingsPolicy
        }

        return nil
    }

    static private func getSimulcastLayerSettingsPolicy(from layerPolicy: HMSSimulcastLayerSettingsPolicy) -> [String: Any] {

        var layerSettings = [String: Any]()

        layerSettings["rid"] = layerPolicy.rid

        if let scale = layerPolicy.scaleResolutionDownBy {
            layerSettings["scaleResolutionDownBy"] = scale
        }

        if let maxBitrate = layerPolicy.maxBitrate {
            layerSettings["maxBitrate"] = maxBitrate
        }

        if let maxFramerate = layerPolicy.maxFramerate {
            layerSettings["maxFramerate"] = maxFramerate
        }

        return layerSettings
    }
    // MARK: END: - HMSRole Publish Settings and Utility functions

    // MARK: - HMSRole Subscribe Settings and Utility functions
    static private func getSubscribeSettings(from subscribeSettings: HMSSubscribeSettings) -> [String: Any] {

        var settings = [String: Any]()

        settings["maxSubsBitRate"] = subscribeSettings.maxSubsBitRate

        if let subscribeToRoles = subscribeSettings.subscribeToRoles {
            settings["subscribeTo"] = subscribeToRoles
        }

       if let subscribeDegradation = subscribeSettings.subscribeDegradation,
          let parsedSubscribeDegradationPolicy = getSubscribeDegradationSettings(from: subscribeDegradation) {
           settings["subscribeDegradation"] = parsedSubscribeDegradationPolicy
       }

        return settings
    }

    static func getSubscribeDegradationSettings(from subscribeDegradation: HMSSubscribeDegradationPolicy) -> [String: Any]? {

        if subscribeDegradation.packetLossThreshold != nil ||
            subscribeDegradation.degradeGracePeriodSeconds != nil ||
            subscribeDegradation.recoverGracePeriodSeconds != nil {

            var settings = [String: Any]()

            if let packetLossThreshold = subscribeDegradation.packetLossThreshold {
                settings["packetLossThreshold"] = packetLossThreshold
            }

            if let degradeGracePeriodSeconds = subscribeDegradation.degradeGracePeriodSeconds {
                settings["degradeGracePeriodSeconds"] = degradeGracePeriodSeconds
            }

            if let recoverGracePeriodSeconds = subscribeDegradation.recoverGracePeriodSeconds {
                settings["recoverGracePeriodSeconds"] = recoverGracePeriodSeconds
            }

            return settings
        }

        return nil
    }
    // MARK: END: - HMSRole Subscribe Settings and Utility functions

    static func getHmsRoleChangeRequest(_ roleChangeRequest: HMSRoleChangeRequest, _ id: String?) -> [String: Any] {

        if let sdkId = id {
            var requestedBy: [String: Any]?
            if let peer = roleChangeRequest.requestedBy {
                requestedBy = getHmsPeerSubset(peer)
            }

            let suggestedRole = getHmsRole(roleChangeRequest.suggestedRole)

            var request = ["suggestedRole": suggestedRole, "id": sdkId] as [String: Any]
            if let requestedBy = requestedBy {
                request["requestedBy"] = requestedBy
            }
            return request
        }

        return [String: Any]()
    }

    static func getHmsChangeTrackStateRequest(_ changeTrackStateRequest: HMSChangeTrackStateRequest, _ id: String) -> [String: Any] {
        var requestedBy: [String: Any]?
        if let peer = changeTrackStateRequest.requestedBy {
            requestedBy = getHmsPeerSubset(peer)
        }
        let trackType = changeTrackStateRequest.track.kind == .video ? "video" : "audio"

        var request = ["trackType": trackType, "id": id, "mute": changeTrackStateRequest.mute] as [String: Any]
        if let requestedBy = requestedBy {
            request["requestedBy"] = requestedBy
        }

        return request
    }

    static func getError(_ errorObj: Error?) -> [String: Any] {

        guard let error = errorObj as? HMSError else {
            print(#function, "WARNING! Empty Error object parsing should not be performed")
            return ["code": 7000, "description": "Error object not found", "isTerminal": false, "canRetry": true]
        }

        let isTerminal = error.userInfo[HMSIsTerminalUserInfoKey] as? Bool ?? false
        let canRetry = error.userInfo[HMSCanRetryUserInfoKey] as? Bool ?? false

        return ["code": error.errorCode, "description": error.localizedDescription, "isTerminal": isTerminal, "canRetry": canRetry]
    }

    static func getBrowserRecordingState(_ data: HMSBrowserRecordingState?) -> [String: Any] {

        if let recordingState = data {

            var state = [String: Any]()

            state["initialising"] = recordingState.initialising

            state["running"] = recordingState.running

            if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            state["state"] = recordingState.state.displayString().uppercased()

            return state
        } else {
            return  [String: Any]()
        }
    }

    static func getRtmpStreamingState(_ data: HMSRTMPStreamingState?) -> [String: Any] {
        if let streamingState = data {

            var state = [String: Any]()

            state["running"] = streamingState.running

            if let startedAt = streamingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = streamingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            state["state"] = streamingState.state.displayString().uppercased()

            return state
        } else {
            return [String: Any]()
        }
    }

    static func getServerRecordingState(_ data: HMSServerRecordingState?) -> [String: Any] {
        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            state["state"] = recordingState.state.displayString().uppercased()

            return state
        } else {
            return [String: Any]()
        }
    }

    static func getHlsStreamingState(_ data: HMSHLSStreamingState?) -> [String: Any] {
        if let streamingState = data {

            var state = [String: Any]()

            state["running"] = streamingState.running

            if let startedAt = streamingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = streamingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            state["state"] = streamingState.state.displayString().uppercased()

            state["variants"] = HMSDecoder.getHlsVariant(streamingState.variants)

            return state
        } else {
            return [String: Any]()
        }
    }

    static func getHlsRecordingState(_ data: HMSHLSRecordingState?) -> [String: Any] {
      var state = [String: Any]()

      if let recordingState = data {

          state["running"] = recordingState.running

          if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
              state["startedAt"] = startedAt * 1000
          }

          if let error = recordingState.error {
              state["error"] = HMSDecoder.getError(error)
          }

          state["state"] = recordingState.state.displayString().uppercased()
      }
      return state
    }

    static func getHlsVariant(_ data: [HMSHLSVariant]?) -> [[String: Any]] {
        var variants = [[String: Any]]()

        if let hlsVariant = data {
            for variant in hlsVariant {
                var decodedVariant = [String: Any]()
                decodedVariant["meetingUrl"] = variant.meetingURL.absoluteString
                decodedVariant["metadata"] = variant.metadata
                decodedVariant["hlsStreamUrl"] = variant.url?.absoluteString
                if let startedAt = variant.startedAt?.timeIntervalSince1970 {
                    decodedVariant["startedAt"] = startedAt * 1000
                }
                if let type = variant.playlistType {
                    decodedVariant["playlistType"] = getHLSVariantPlaylistType(from: type)
                }
                variants.append(decodedVariant)
            }
        }
        return variants
    }
    
    static func getHLSVariantPlaylistType(from type: HMSHLSPlaylistType) -> String {
        switch type {
        case .dvr:
            return "DVR"
        default:
            return "NODVR"
        }
    }

    static func getHMSRTCStats(_ data: HMSRTCStats) -> [Any] {
        // [bitrateReceived, bitrateSent, bytesReceived, bytesSent, packetsLost, packetsReceived, roundTripTime]
        return [
            data.bitrateReceived,
            data.bitrateSent,
            data.bytesReceived,
            data.bytesSent,
            data.packetsLost,
            data.packetsReceived,
            data.roundTripTime
        ]
    }

    static func getLocalAudioStats(_ data: HMSLocalAudioStats) -> [Any] {
        // [bitrate, bytesSent, roundTripTime]
        return [
            data.bitrate,
            data.bytesSent,
            data.roundTripTime
        ]
    }

    static func getLocalVideoStats(_ localVideoStats: [HMSLocalVideoStats]) -> [[Any]] {

        var statsArray = [[Any]]()

        for stat in localVideoStats {
//          [bitrate, bytesSent, roundTripTime, frameRate, resolution, layer, qualityLimitationReasons]
            var layer = "HIGH"

            if let simulcastLayerId = stat.simulcastLayerId as? UInt {
                layer = getStringFromLayer(layer: HMSSimulcastLayer(rawValue: simulcastLayerId))
            } else {
                print(#function, "Error: Failed to cast to correct simulcastLayerId")
            }

            let data: [Any] = [
                stat.bitrate,
                stat.bytesSent,
                stat.roundTripTime,
                stat.frameRate,
                HMSDecoder.getHmsVideoResolution(stat.resolution),
                layer,
                getQualityLimitations(stat.qualityLimitations)
            ]
            statsArray.append(data)
        }

        return statsArray
    }

    static func getStringFromLayer(layer: HMSSimulcastLayer?) -> String {
        switch layer {
        case .high:
            return "HIGH"
        case .mid:
            return "MEDIUM"
        case .low:
            return "LOW"
        default:
            return "HIGH"
        }
    }

    static func getLayerFromString(layer: String) -> HMSSimulcastLayer {
        switch layer {
        case "HIGH":
            return .high
        case "MEDIUM":
            return .mid
        case "LOW":
            return .low
        default:
            return .high
        }
    }

    static private func getQualityLimitations(_ limitation: HMSQualityLimitationReasons) -> [String: Any] {
        [
            "bandwidth": limitation.bandwidth,
            "cpu": limitation.cpu,
            "none": limitation.none,
            "other": limitation.other,
            "qualityLimitationResolutionChanges": limitation.qualityLimitationResolutionChanges,
            "reason": getStringFromLimitationReason(limitation.reason)
        ]
    }

    static private func getStringFromLimitationReason(_ reason: HMSQualityLimitationReason) -> String {
        switch reason {
        case .CPU:
            return "CPU"
        case .bandwidth:
            return "BANDWIDTH"
        case .none:
            return "NONE"
        case .other:
            return "OTHER"
        default:
            return "UNKNOWN"
        }
    }

    static func getRemoteAudioStats(_ data: HMSRemoteAudioStats) -> [Any] {
        // [bitrate, bytesReceived, jitter, packetsLost, packetsReceived]
        return [
            data.bitrate,
            data.bytesReceived,
            data.jitter,
            data.packetsLost,
            data.packetsReceived
        ]
    }

    static func getRemoteVideoStats(_ data: HMSRemoteVideoStats) -> [Any] {

        var stats = [Any]()

        stats = [
            data.bitrate,
            Double(data.bytesReceived),
            data.frameRate,
            data.jitter,
            Double(data.packetsLost),
            Double(data.packetsReceived),
            HMSDecoder.getHmsVideoResolution(data.resolution)
        ]
        return stats
    }

    static func getHmsMessageRecipient(_ recipient: HMSMessageRecipient) -> [String: Any] {

        var data = [String: Any]()

        if let peer = recipient.peerRecipient {
            data["recipientPeer"] = getHmsPeerSubset(peer)
        }

        data["recipientType"] = getRecipientType(from: recipient.type)

        if let roles = recipient.rolesRecipient {
            data["recipientRoles"] = getAllRoles(roles)
        }

        return data
    }

    static func getHmsNetworkQuality(_ hmsNetworkQuality: HMSNetworkQuality?) -> [String: Any] {
        guard let networkQuality = hmsNetworkQuality else { return [String: Any]() }

        return ["downlinkQuality": networkQuality.downlinkQuality]
    }

    static private func getRecipientType(from recipientType: HMSMessageRecipientType) -> String {
        switch recipientType {
        case .broadcast:
            return "BROADCAST"
        case .peer:
            return "PEER"
        case .roles:
            return "ROLES"
        default:
            return ""
        }
    }

    static func getSimulcastLayerDefinitions(for layerDefinitions: [HMSSimulcastLayerDefinition]) -> [[String: Any]] {

        var parsedLayerDefinitions = [[String: Any]]()

        for layer in layerDefinitions {
            parsedLayerDefinitions.append(getSimulcastLayerDefinition(for: layer))
        }

        return parsedLayerDefinitions
    }

    static private func getSimulcastLayerDefinition(for definition: HMSSimulcastLayerDefinition) -> [String: Any] {

        var parsedLayer = [String: Any]()

        parsedLayer["layer"] = getString(from: definition.layer)

        parsedLayer["resolution"] = getHmsVideoResolution(definition.resolution)

        return parsedLayer
    }

    static func getString(from layer: HMSSimulcastLayer) -> String {
        switch layer {
        case .low:
            return "LOW"
        case .mid:
            return "MEDIUM"
        default:
            return "HIGH"
        }
    }
}
