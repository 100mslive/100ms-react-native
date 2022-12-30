import HMSSDK
import Foundation

class HMSDecoder: NSObject {
    static func getHmsRoom (_ hmsRoom: HMSRoom?) -> [String: Any] {

        guard let room = hmsRoom else { return [:] }
        
        var data = [String: Any]()
        
        data["id"] = room.roomID ?? ""

        data["name"] = room.name ?? ""

        if let metaData = room.metaData {
            data["metaData"] = metaData
        }
        
        data["peerCount"] = room.peerCount ?? 0
        
        data["browserRecordingState"] = HMSDecoder.getHMSBrowserRecordingState(hmsRoom?.browserRecordingState)
        
        data["rtmpHMSRtmpStreamingState"] = HMSDecoder.getHMSRtmpStreamingState(hmsRoom?.rtmpStreamingState)
        
        data["serverRecordingState"] = HMSDecoder.getHMSServerRecordingState(hmsRoom?.serverRecordingState)
        
        data["hlsStreamingState"] = HMSDecoder.getHlsStreamingState(hmsRoom?.hlsStreamingState)
        
        data["hlsRecordingState"] = HMSDecoder.getHlsRecordingState(hmsRoom?.hlsRecordingState)
        
        
        if let sessionId = room.sessionID {
            data["sessionId"] = sessionId
        }
        
        if let startedAt = room.sessionStartedAt?.timeIntervalSince1970 {
            data["startedAt"] = startedAt * 1000
        }
        
        var peers = [[String: Any]]()

        for peer in room.peers {
            let parsedPeer = getHmsPeer(peer)
            peers.append(parsedPeer)
            if peer.isLocal {
                data["localPeer"] = parsedPeer
            }
        }
        
        data["peers"] = peers
        
        return data
    }

    static func getHmsPeer (_ hmsPeer: HMSPeer?) -> [String: Any] {

        guard let peer = hmsPeer else { return [:] }
        
        var data = [String: Any]()
        
        data["peerID"] = peer.peerID

        data["name"] = peer.name
        
        data["isLocal"] = peer.isLocal
        
        if let customerUserID = peer.customerUserID {
            data["customerUserID"] = customerUserID
        }
        
        if let metadata = peer.metadata {
            data["metadata"] = metadata
        }
        
        if let audioTrack = peer.audioTrack {
            data["audioTrack"] = getHmsAudioTrack(audioTrack)
        }
        
        if let videoTrack = peer.videoTrack {
            data["videoTrack"] = getHmsVideoTrack(videoTrack)
        }
        
        if let auxiliaryTracks = peer.auxiliaryTracks {
            data["auxiliaryTracks"] = getAllTracks(auxiliaryTracks)
        }
        
        if let networkQuality = peer.networkQuality {
            data["networkQuality"] = getHmsNetworkQuality(networkQuality)
        }
        
        data["role"] = getHmsRole(peer.role)
        
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

        guard let hmsTrack = track else { return [:] }

        let trackId = hmsTrack.trackId
        let source = hmsTrack.source
        let trackDescription = hmsTrack.trackDescription
        let isMute = hmsTrack.isMute()
        let type = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": type, "kind": type]
    }

    static func getHmsAudioTrack (_ hmsAudioTrack: HMSAudioTrack?) -> [String: Any] {

        guard let hmsTrack = hmsAudioTrack else { return [:] }

        let trackId: String = hmsTrack.trackId
        let source: String = hmsTrack.source
        let trackDescription: String = hmsTrack.trackDescription
        let isMute: Bool = hmsTrack.isMute()
        let kind: String = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": kind, "kind": kind]
    }

    static func getHmsVideoTrack (_ hmsVideoTrack: HMSVideoTrack?) -> [String: Any] {

        guard let hmsTrack = hmsVideoTrack else { return [:] }

        let trackId = hmsTrack.trackId
        let source = hmsTrack.source
        let trackDescription = hmsTrack.trackDescription
        let isMute = hmsTrack.isMute()
        let isDegraded = hmsTrack.isDegraded()
        let kind: String = HMSHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "isDegraded": isDegraded, "type": kind, "kind": kind]
    }

    static func getHmsLocalPeer(_ hmsLocalPeer: HMSLocalPeer?) -> [String: Any] {

        guard let peer = hmsLocalPeer else { return [:] }

        let peerID = peer.peerID
        let name = peer.name
        let isLocal = peer.isLocal
        let customerUserID = peer.customerUserID ?? ""
        let customerDescription = peer.metadata ?? ""
        let metadata = peer.metadata ?? ""
        let audioTrack = getHmsAudioTrack(peer.audioTrack)
        let videoTrack = getHmsVideoTrack(peer.videoTrack)
        let role = getHmsRole(peer.role)
        let networkQuality = getHmsNetworkQuality(peer.networkQuality)

        var auxiliaryTracks = [[String: Any]]()
        for track in peer.auxiliaryTracks ?? [] {
            auxiliaryTracks.append(getHmsTrack(track))
        }

        let localAudioTrack = peer.localAudioTrack()
        let localVideoTrack = peer.localVideoTrack()

        var localAudioTrackData = [String: Any]()
        if let localAudio = localAudioTrack {
            localAudioTrackData = getHmsLocalAudioTrack(localAudio)
        }

        var localVideoTrackData = [String: Any]()
        if let localVideo = localVideoTrack {
            localVideoTrackData = getHmsLocalVideoTrack(localVideo)
        }

        return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "metadata": metadata, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "localAudioTrackData": localAudioTrackData, "localVideoTrackData": localVideoTrackData, "role": role, "networkQuality": networkQuality]
    }

    static func getHmsLocalAudioTrack(_ localAudio: HMSLocalAudioTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(localAudio.kind) ?? ""
        return ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings), "isMute": localAudio.isMute(), "type": type, "kind": type]
    }

    static func getHmsLocalVideoTrack(_ localVideo: HMSLocalVideoTrack) -> [String: Any] {
        let type = HMSHelper.getHmsTrackType(localVideo.kind) ?? ""
        return ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings), "isMute": localVideo.isMute(), "type": type, "kind": type]
    }

    static func getHmsAudioTrackSettings(_ hmsAudioTrackSettings: HMSAudioTrackSettings?) -> [String: Any] {

        guard let settings = hmsAudioTrackSettings else { return [:] }

        // TODO: parsing not done for audioSource
        let audioSource = settings.audioSource
        let initialState = HMSHelper.getHMSTrackInitState(settings.initialMuteState)

        return ["audioSource": audioSource, "initialState": initialState]
    }

    static func getHmsVideoTrackSettings(_ hmsVideoTrackSettings: HMSVideoTrackSettings?) -> [String: Any] {

        guard let settings = hmsVideoTrackSettings else { return [:] }

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
            return "H264"
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

    static func getHmsVideoResolution(_ hmsVideoResolution: HMSVideoResolution?) -> [String: Any] {
        guard let resolution = hmsVideoResolution else { return [:] }

        return ["width": resolution.width, "height": resolution.height]
    }

    static func getHmsRemotePeers (_ remotePeers: [HMSRemotePeer]?) -> [[String: Any]] {
        guard let remotePeers = remotePeers else { return [[:]] }

        var peers = [[String: Any]]()

        for peer in remotePeers {
            peers.append(getHmsRemotePeer(peer))
        }

        return peers
    }

    static func getHmsRemotePeer(_ hmsRemotePeer: HMSRemotePeer) -> [String: Any] {

        let peerID = hmsRemotePeer.peerID
        let name = hmsRemotePeer.name
        let isLocal = hmsRemotePeer.isLocal
        let customerUserID = hmsRemotePeer.customerUserID ?? ""
        let customerDescription = hmsRemotePeer.metadata ?? ""
        let metadata = hmsRemotePeer.metadata ?? ""
        let audioTrack = getHmsAudioTrack(hmsRemotePeer.audioTrack)
        let videoTrack = getHmsVideoTrack(hmsRemotePeer.videoTrack)
        let role = getHmsRole(hmsRemotePeer.role)
        let networkQuality = getHmsNetworkQuality(hmsRemotePeer.networkQuality)

        var auxiliaryTracks = [[String: Any]]()

        for track in hmsRemotePeer.auxiliaryTracks ?? [] {
            auxiliaryTracks.append(getHmsTrack(track))
        }

        let remoteAudioTrack = hmsRemotePeer.remoteAudioTrack()
        let remoteVideoTrack = hmsRemotePeer.remoteVideoTrack()

        var remoteAudioTrackData = [String: Any]()
        if let remoteAudio = remoteAudioTrack {
            remoteAudioTrackData = getHMSRemoteAudioTrack(remoteAudio)
        }

        var remoteVideoTrackData = [String: Any]()
        if let remoteVideo = remoteVideoTrack {
            remoteVideoTrackData = getHMSRemoteVideoTrack(remoteVideo)
        }

        return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "metadata": metadata, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "remoteAudioTrackData": remoteAudioTrackData, "remoteVideoTrackData": remoteVideoTrackData, "role": role, "networkQuality": networkQuality]
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

        guard let role = hmsRole else { return [:] }

        var parsedRole = [String: Any]()

        parsedRole["name"] = role.name
        parsedRole["priority"] = role.priority
        parsedRole["permissions"] = getPermissions(role.permissions)
        parsedRole["publishSettings"] = getPublishSettings(from: role.publishSettings)
        parsedRole["subscribeSettings"] = getSubscribeSettings(from: role.subscribeSettings)

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
            "changeRole": permissions.changeRole ?? false
        ]
    }

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

    static private func getSimulcastSettingsPolicy(from simulcastSettingsPolicy: HMSSimulcastSettingsPolicy) -> [String: Any]? {

        if let layers = simulcastSettingsPolicy.layers {
           return getSimulcastLayerSettingsPolicy(from: layers)
        }

        return nil
    }

    static private func getSimulcastLayerSettingsPolicy(from simulcastLayerSettingsPolicy: [HMSSimulcastLayerSettingsPolicy]) -> [String: Any] {

        var layers = [[String: Any]]()

        for layer in simulcastLayerSettingsPolicy {

            var layerSettings = [String: Any]()

            layerSettings["rid"] = layer.rid

            if let scale = layer.scaleResolutionDownBy {
                layerSettings["scaleResolutionDownBy"] = scale
            }

            if let maxBitrate = layer.maxBitrate {
                layerSettings["maxBitrate"] = maxBitrate
            }

            if let maxFramerate = layer.maxFramerate {
                layerSettings["maxFramerate"] = maxFramerate
            }

            layers.append(layerSettings)
        }

        return ["layers": layers]
    }

    static private func getSubscribeSettings(from subscribeSettings: HMSSubscribeSettings) -> [String: Any] {

        var settings = [String: Any]()

        settings["maxSubsBitRate"] = subscribeSettings.maxSubsBitRate

        if let subscribeToRoles = subscribeSettings.subscribeToRoles {
            settings["subscribeToRoles"] = subscribeToRoles
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

    static func getHmsRoleChangeRequest(_ roleChangeRequest: HMSRoleChangeRequest, _ id: String?) -> [String: Any] {

        if let sdkId = id {
            var requestedBy: [String: Any]?
            if let peer = roleChangeRequest.requestedBy {
                requestedBy = getHmsPeer(peer)
            }

            let suggestedRole = getHmsRole(roleChangeRequest.suggestedRole)

            var request = ["suggestedRole": suggestedRole, "id": sdkId] as [String: Any]
            if let requestedBy = requestedBy {
                request["requestedBy"] = requestedBy
            }
            return request
        }

        return [:]
    }

    static func getHmsChangeTrackStateRequest(_ changeTrackStateRequest: HMSChangeTrackStateRequest, _ id: String) -> [String: Any] {
        var requestedBy: [String: Any]?
        if let peer = changeTrackStateRequest.requestedBy {
            requestedBy = getHmsPeer(peer)
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

        return ["code": error.errorCode,
                "description": error.localizedDescription,
                "isTerminal": isTerminal, "canRetry": canRetry]
    }

    static func getHMSBrowserRecordingState(_ data: HMSBrowserRecordingState?) -> [String: Any] {
        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return  [:]
        }
    }

    static func getHMSRtmpStreamingState(_ data: HMSRTMPStreamingState?) -> [String: Any] {
        if let streamingState = data {

            var state = [String: Any]()

            state["running"] = streamingState.running

            if let startedAt = streamingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = streamingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return [:]
        }
    }

    static func getHMSServerRecordingState(_ data: HMSServerRecordingState?) -> [String: Any] {
        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return [:]
        }
    }

    static func getHlsStreamingState(_ data: HMSHLSStreamingState?) -> [String: Any] {
        if let streamingState = data {
            let running = streamingState.running
            let variants = HMSDecoder.getHMSHlsVariant(streamingState.variants)

            return ["running": running, "variants": variants]
        } else {
            return [:]
        }
    }

    static func getHlsRecordingState(_ data: HMSHLSRecordingState?) -> [String: Any] {
        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            state["singleFilePerLayer"] = recordingState.singleFilePerLayer

            state["videoOnDemand"] = recordingState.enableVOD

            if let startedAt = recordingState.startedAt?.timeIntervalSince1970 {
                state["startedAt"] = startedAt * 1000
            }

            return state
        } else {
            return [:]
        }
    }

    static func getHMSHlsVariant(_ data: [HMSHLSVariant]?) -> [[String: Any]] {
        var variants = [[String: Any]]()

        if let hlsVariant = data {
            for variant in hlsVariant {

                var decodedVariant = [String: Any]()

                decodedVariant["meetingUrl"] = variant.meetingURL.absoluteString

                decodedVariant["metadata"] = variant.metadata

                decodedVariant["hlsStreamUrl"] = variant.url.absoluteString

                if let startedAt = variant.startedAt?.timeIntervalSince1970 {
                    decodedVariant["startedAt"] = startedAt * 1000
                }

                variants.append(decodedVariant)
            }
        }
        return variants
    }

    static func getHMSRTCStats(_ data: HMSRTCStats) -> [String: Any] {
        return ["bitrateReceived": data.bitrateReceived, "bitrateSent": data.bitrateSent, "bytesReceived": data.bytesReceived, "bytesSent": data.bytesSent, "packetsLost": data.packetsLost, "packetsReceived": data.packetsReceived, "roundTripTime": data.roundTripTime]
    }

    static func getLocalAudioStats(_ data: HMSLocalAudioStats) -> [String: Any] {
        return ["roundTripTime": data.roundTripTime, "bytesSent": data.bytesSent, "bitrate": data.bitrate]
    }

    static func getLocalVideoStats(_ data: HMSLocalVideoStats) -> [String: Any] {
        return ["roundTripTime": data.roundTripTime, "bytesSent": data.bytesSent, "bitrate": data.bitrate, "resolution": HMSDecoder.getHmsVideoResolution(data.resolution), "frameRate": data.frameRate]
    }

    static func getRemoteAudioStats(_ data: HMSRemoteAudioStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter]
    }

    static func getRemoteVideoStats(_ data: HMSRemoteVideoStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter, "resolution": HMSDecoder.getHmsVideoResolution(data.resolution), "frameRate": data.frameRate]
    }

    static func getHmsMessageRecipient(_ recipient: HMSMessageRecipient) -> [String: Any] {
        return ["recipientPeer": getHmsPeer(recipient.peerRecipient), "recipientRoles": getAllRoles(recipient.rolesRecipient), "recipientType": self.getRecipientType(from: recipient.type)]
    }

    static func getHmsNetworkQuality(_ hmsNetworkQuality: HMSNetworkQuality?) -> [String: Any] {
        guard let networkQuality = hmsNetworkQuality else { return [:] }

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

    static func getLayerDefinitions(for layerDefinitions: [HMSSimulcastLayerDefinition]) -> [[String: Any]] {

        var parsedLayerDefinitions = [[String: Any]]()

        for layer in layerDefinitions {
            parsedLayerDefinitions.append(getLayerDefinition(for: layer))
        }

        return parsedLayerDefinitions
    }

    static private func getLayerDefinition(for definition: HMSSimulcastLayerDefinition) -> [String: Any] {

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
