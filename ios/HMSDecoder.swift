import HMSSDK
import Foundation

class HMSDecoder: NSObject {
    static func getHmsRoom (_ hmsRoom: HMSRoom?) -> [String: Any] {

        guard let room = hmsRoom else { return [String: Any]() }

        let id = room.roomID ?? ""
        let sessionId = room.sessionID ?? ""
        let name = room.name ?? ""
        let metaData = room.metaData ?? ""
        let count = room.peerCount ?? 0
        // sessionStartedAt?
        let browserRecordingState = HMSDecoder.getHMSBrowserRecordingState(hmsRoom?.browserRecordingState)
        let rtmpStreamingState = HMSDecoder.getHMSRtmpStreamingState(hmsRoom?.rtmpStreamingState)
        let serverRecordingState = HMSDecoder.getHMSServerRecordingState(hmsRoom?.serverRecordingState)
        let hlsStreamingState = HMSDecoder.getHlsStreamingState(hmsRoom?.hlsStreamingState)
        let hlsRecordingState = HMSDecoder.getHlsRecordingState(hmsRoom?.hlsRecordingState)
        var localPeer = [String: Any]()
        var peers = [[String: Any]]()

        for peer in room.peers {
            let parsedPeer = getHmsPeer(peer)
            peers.append(parsedPeer)
            if peer.isLocal {
                localPeer = parsedPeer
            }
        }

        return ["id": id, "name": name, "metaData": metaData, "peers": peers, "browserRecordingState": browserRecordingState, "rtmpHMSRtmpStreamingState": rtmpStreamingState, "serverRecordingState": serverRecordingState, "hlsRecordingState": hlsRecordingState, "hlsStreamingState": hlsStreamingState, "peerCount": count, "sessionId": sessionId, "localPeer": localPeer]
    }

    static func getHmsPeer (_ hmsPeer: HMSPeer?) -> [String: Any] {

        guard let peer = hmsPeer else { return [String: Any]() }

        var peerDict = [String: Any]()

        peerDict["peerID"] = peer.peerID
        peerDict["name"] = peer.name
        peerDict["isLocal"] = peer.isLocal

        if let userID = peer.customerUserID {
            peerDict["customerUserID"] = userID
        }

        peerDict["metadata"] = peer.metadata ?? ""

        // joinedAt

        peerDict["role"] = getHmsRole(peer.role)

        if let quality = peer.networkQuality {
            peerDict["networkQuality"] = getHmsNetworkQuality(quality)
        }

        if let audio = peer.audioTrack {
            peerDict["audioTrack"] = getHmsAudioTrack(audio)
        }

        if let video = peer.videoTrack {
            peerDict["videoTrack"] = getHmsVideoTrack(video)
        }

        if let auxTracks = peer.auxiliaryTracks, auxTracks.count > 0 {
            peerDict["auxiliaryTracks"] = getAllTracks(auxTracks)
        }

        return peerDict
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

    static func getHmsLocalPeer(_ hmsLocalPeer: HMSLocalPeer?) -> [String: Any] {

        guard let peer = hmsLocalPeer else { return [String: Any]() }

        var peerDict = [String: Any]()

        peerDict["peerID"] = peer.peerID

        peerDict["name"] = peer.name
        peerDict["isLocal"] = peer.isLocal

        if let userID = peer.customerUserID {
            peerDict["customerUserID"] = userID
        }

        peerDict["metadata"] = peer.metadata ?? ""

        peerDict["role"] = getHmsRole(peer.role)

        if let audio = peer.audioTrack {
            peerDict["audioTrack"] = getHmsAudioTrack(audio)

            if let localAudio = audio as? HMSLocalAudioTrack {
                peerDict["localAudioTrackData"] = getHmsLocalAudioTrack(localAudio)
            }
        }

        if let video = peer.videoTrack {
            peerDict["videoTrack"] = getHmsVideoTrack(video)

            if let localVideo = video as? HMSLocalVideoTrack {
                peerDict["localVideoTrackData"] = getHmsLocalVideoTrack(localVideo)
            }
        }

        if let quality = peer.networkQuality {
            peerDict["networkQuality"] = getHmsNetworkQuality(quality)
        }

        if let auxTracks = peer.auxiliaryTracks, auxTracks.count > 0 {
            peerDict["auxiliaryTracks"] = getAllTracks(auxTracks)
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

    static func getHmsAudioTrackSettings(_ hmsAudioTrackSettings: HMSAudioTrackSettings?) -> [String: Any] {

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

    static func getHmsVideoResolution(_ hmsVideoResolution: HMSVideoResolution?) -> [String: Any] {
        guard let resolution = hmsVideoResolution else { return [String: Any]() }

        return ["width": resolution.width, "height": resolution.height]
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
        peerDict["isLocal"] = peer.isLocal

        if let userID = peer.customerUserID {
            peerDict["customerUserID"] = userID
        }

        peerDict["metadata"] = peer.metadata ?? ""

        // joinedAt

        peerDict["role"] = getHmsRole(peer.role)

        if let quality = peer.networkQuality {
            peerDict["networkQuality"] = getHmsNetworkQuality(quality)
        }

        if let audio = peer.audioTrack {
            peerDict["audioTrack"] = getHmsAudioTrack(audio)

            if let remoteAudio = audio as? HMSRemoteAudioTrack {
                peerDict["remoteAudioTrackData"] = getHMSRemoteAudioTrack(remoteAudio)
            }
        }

        if let video = peer.videoTrack {
            peerDict["videoTrack"] = getHmsVideoTrack(video)

            if let remoteVideo = video as? HMSRemoteVideoTrack {
                peerDict["remoteVideoTrackData"] = getHMSRemoteVideoTrack(remoteVideo)
            }
        }

        if let auxTracks = peer.auxiliaryTracks, auxTracks.count > 0 {
            peerDict["auxiliaryTracks"] = getAllTracks(auxTracks)
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

        guard let role = hmsRole else { return [String: Any]() }

        let name = role.name
        let permissions = getHmsPermissions(role.permissions)
        let publishSettings = getHmsPublishSettings(role.publishSettings)
        let subscribeSettings = getHmsSubscribeSettings(role.subscribeSettings)
        let priority = role.priority

        return ["name": name, "permissions": permissions, "publishSettings": publishSettings, "subscribeSettings": subscribeSettings, "priority": priority]
    }

    static func getHmsPermissions (_ permissions: HMSPermissions) -> [String: Any] {

        let endRoom = permissions.endRoom ?? false
        let removeOthers = permissions.removeOthers ?? false
        let browserRecording = permissions.browserRecording ?? false
        let hlsStreaming = permissions.hlsStreaming ?? false
        let rtmpStreaming = permissions.rtmpStreaming ?? false
        let mute = permissions.mute ?? false
        let unmute = permissions.unmute ?? false
        let changeRole = permissions.changeRole ?? false

        return ["endRoom": endRoom,
                "removeOthers": removeOthers,
                "browserRecording": browserRecording,
                "hlsStreaming": hlsStreaming,
                "rtmpStreaming": rtmpStreaming,
                "mute": mute,
                "unmute": unmute,
                "changeRole": changeRole]
    }

    static func getHmsPublishSettings (_ publishSettings: HMSPublishSettings) -> [String: Any] {

        var dict = [String: Any]()

        dict["audio"] = getHmsAudioSettings(publishSettings.audio)
        dict["video"] = getHmsVideoSettings(publishSettings.video)
        dict["screen"] = getHmsVideoSettings(publishSettings.screen)

        if let allowed = publishSettings.allowed {
            dict["allowed"] = getWriteableArray(allowed)
        }

        return dict
    }

    static func getHmsSubscribeSettings (_ subscribeSettings: HMSSubscribeSettings?) -> [String: Any] {
        guard let settings = subscribeSettings
        else { return [String: Any]() }

        let maxSubsBitRate = settings.maxSubsBitRate
        let subscribeTo = settings.subscribeToRoles

        return ["maxSubsBitRate": maxSubsBitRate, "subscribeTo": subscribeTo ?? []]
    }

    static func getHmsSubscribeDegradationSettings (_ hmsSubscribeDegradationParams: HMSSubscribeDegradationPolicy?) -> [String: Any] {
        guard let params = hmsSubscribeDegradationParams
        else {
            return [String: Any]()
        }

        let degradeGracePeriodSeconds = String(params.degradeGracePeriodSeconds ?? 0)
        let packetLossThreshold = String(params.packetLossThreshold ?? 0)
        let recoverGracePeriodSeconds = String(params.recoverGracePeriodSeconds ?? 0)

        return ["degradeGracePeriodSeconds": degradeGracePeriodSeconds, "packetLossThreshold": packetLossThreshold, "recoverGracePeriodSeconds": recoverGracePeriodSeconds]
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

    static func getHmsAudioSettings(_ audioSettings: HMSAudioSettings) -> [String: Any] {
        let bitRate = audioSettings.bitRate
        let codec = audioSettings.codec

        return ["bitRate": bitRate, "codec": codec]
    }

    static func getHmsVideoSettings(_ videoSettings: HMSVideoSettings) -> [String: Any] {

        let bitRate = videoSettings.bitRate
        let codec = videoSettings.codec
        let frameRate = videoSettings.frameRate
        let width = videoSettings.width
        let height = videoSettings.height

        return ["bitRate": bitRate ?? 0, "codec": codec, "frameRate": frameRate, "width": width, "height": height]
    }

    static func getHmsSimulcastLayers(_ videoSimulcastLayers: HMSSimulcastSettingsPolicy?) -> [String: Any] {

        guard let videoLayers = videoSimulcastLayers else { return [String: Any]() }

        let layers = getHmsSimulcastLayerSettingsPolicy(videoLayers.layers)

        return ["layers": layers]
    }

    static func getHmsSimulcastLayerSettingsPolicy(_ layers: [HMSSimulcastLayerSettingsPolicy]?) -> [[String: Any]] {
        var layersSettingsPolicy = [[String: Any]]()
        if let settingsPolicies = layers {
            for settingsPolicy in settingsPolicies {
                let rid = settingsPolicy.rid
                let scaleResolutionDownBy = settingsPolicy.scaleResolutionDownBy ?? 0
                let maxBitrate = settingsPolicy.maxBitrate ?? -1
                let maxFramerate = settingsPolicy.maxFramerate ?? -1

                let settingsPolicyObject = ["rid": rid,
                                            "scaleResolutionDownBy": scaleResolutionDownBy,
                                            "maxBitrate": maxBitrate,
                                            "maxFramerate": maxFramerate] as [String: Any]

                layersSettingsPolicy.append(settingsPolicyObject)
            }
        }

        return layersSettingsPolicy
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

        return [String: Any]()
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

    static func getError(_ errorObj: Error?) -> [String: Any]? {
        if let error = errorObj as? HMSError {
            let code = error.errorCode
            let description = error.localizedDescription
            let isTerminal = error.userInfo[HMSIsTerminalUserInfoKey] as? Bool ?? false
            let canRetry = error.userInfo[HMSCanRetryUserInfoKey] as? Bool ?? false

            return ["code": code, "description": description, "isTerminal": isTerminal, "canRetry": canRetry]
        } else {
            return nil
        }
    }

    static func getHMSBrowserRecordingState(_ data: HMSBrowserRecordingState?) -> [String: Any] {

        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            state["startedAt"] = (recordingState.startedAt?.timeIntervalSince1970 ?? 0) * 1000

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return  [String: Any]()
        }
    }

    static func getHMSRtmpStreamingState(_ data: HMSRTMPStreamingState?) -> [String: Any] {
        if let streamingState = data {

            var state = [String: Any]()

            state["running"] = streamingState.running

            state["startedAt"] = (streamingState.startedAt?.timeIntervalSince1970 ?? 0) * 1000

            if let error = streamingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return [String: Any]()
        }
    }

    static func getHMSServerRecordingState(_ data: HMSServerRecordingState?) -> [String: Any] {
        if let recordingState = data {

            var state = [String: Any]()

            state["running"] = recordingState.running

            state["startedAt"] = (recordingState.startedAt?.timeIntervalSince1970 ?? 0) * 1000

            if let error = recordingState.error {
                state["error"] = HMSDecoder.getError(error)
            }

            return state
        } else {
            return [String: Any]()
        }
    }

    static func getHlsStreamingState(_ data: HMSHLSStreamingState?) -> [String: Any] {
        if let streamingState = data {
            let running = streamingState.running
            let variants = HMSDecoder.getHMSHlsVariant(streamingState.variants)

            return ["running": running, "variants": variants]
        } else {
            return [String: Any]()
        }
    }

    static func getHlsRecordingState(_ data: HMSHLSRecordingState?) -> [String: Any] {
        if let recordingState = data {
            let running = recordingState.running
            let startedAt = recordingState.startedAt?.timeIntervalSince1970 ?? 0
            let singleFilePerLayer = recordingState.singleFilePerLayer
            let enableVOD = recordingState.enableVOD

            return ["running": running, "startedAt": startedAt * 1000, "singleFilePerLayer": singleFilePerLayer, "videoOnDemand": enableVOD]
        } else {
            return [String: Any]()
        }
    }

    static func getHMSHlsVariant(_ data: [HMSHLSVariant]?) -> [[String: Any]] {
        var variants = [[String: Any]]()

        if let hlsVariant = data {
            for variant in hlsVariant {
                let meetingUrl = variant.meetingURL.absoluteString
                let metadata = variant.metadata
                let startedAt = variant.startedAt?.timeIntervalSince1970 ?? 0
                let hlsStreamingUrl = variant.url.absoluteString

                let decodedVariant = ["meetingUrl": meetingUrl, "metadata": metadata, "hlsStreamUrl": hlsStreamingUrl, "startedAt": startedAt * 1000] as [String: Any]
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

    static func getLocalVideoStats(_ data: [HMSLocalVideoStats]) -> [[String: Any]] {
        var dict = [[String: Any]]()
        for stat in data {
            dict.append(["roundTripTime": stat.roundTripTime,
                         "bytesSent": stat.bytesSent,
                         "bitrate": stat.bitrate,
                         "resolution": HMSDecoder.getHmsVideoResolution(stat.resolution), "frameRate": stat.frameRate])
        }
        return dict
    }

    static func getRemoteAudioStats(_ data: HMSRemoteAudioStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter]
    }

    static func getRemoteVideoStats(_ data: HMSRemoteVideoStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter, "resolution": HMSDecoder.getHmsVideoResolution(data.resolution), "frameRate": data.frameRate]
    }

    static func getHmsMessageRecipient(_ recipient: HMSMessageRecipient) -> [String: Any] {

        var data = [String: Any]()

        if let peer = recipient.peerRecipient {
            data["recipientPeer"] = getHmsPeer(peer)
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
}
