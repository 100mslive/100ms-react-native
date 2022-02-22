import HMSSDK
import Foundation

class HmsDecoder: NSObject {
    static func getHmsRoom (_ hmsRoom: HMSRoom?) -> [String: Any] {

        guard let room = hmsRoom else { return [:] }

        let id = room.roomID ?? ""
        let name = room.name ?? ""
        let metaData = room.metaData ?? ""
        let browserRecordingState = HmsDecoder.getHMSBrowserRecordingState(hmsRoom?.browserRecordingState)
        let rtmpStreamingState = HmsDecoder.getHMSRtmpStreamingState(hmsRoom?.rtmpStreamingState)
        let serverRecordingState = HmsDecoder.getHMSServerRecordingState(hmsRoom?.serverRecordingState)
        let hlsStreamingState = HmsDecoder.getHlsStreamingState(hmsRoom?.hlsStreamingState)
        var peers = [[String: Any]]()

        for peer in room.peers {
            peers.append(getHmsPeer(peer))
        }

        return ["id": id, "name": name, "metaData": metaData, "peers": peers, "browserRecordingState": browserRecordingState, "rtmpHMSRtmpStreamingState": rtmpStreamingState, "serverRecordingState": serverRecordingState, "hlsStreamingState": hlsStreamingState]
    }

    static func getHmsPeer (_ peer: HMSPeer) -> [String: Any] {

        let peerID = peer.peerID
        let name = peer.name
        let isLocal = peer.isLocal
        let customerUserID = peer.customerUserID ?? ""
        let customerDescription = peer.metadata ?? ""
        let metadata = peer.metadata ?? ""
        let audioTrack = getHmsAudioTrack(peer.audioTrack)
        let videoTrack = getHmsVideoTrack(peer.videoTrack)
        let role = getHmsRole(peer.role)

        let auxiliaryTracks = getAllTracks(peer.auxiliaryTracks ?? [] )

        return ["peerID": peerID,
                "name": name,
                "isLocal": isLocal,
                "customerUserID": customerUserID,
                "customerDescription": customerDescription,
                "metadata": metadata,
                "audioTrack": audioTrack,
                "videoTrack": videoTrack,
                "auxiliaryTracks": auxiliaryTracks,
                "role": role]
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
        let type = HmsHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": type, "kind": type]
    }

    static func getHmsAudioTrack (_ hmsAudioTrack: HMSAudioTrack?) -> [String: Any] {

        guard let hmsTrack = hmsAudioTrack else { return [:] }

        let trackId: String = hmsTrack.trackId
        let source: String = hmsTrack.source
        let trackDescription: String = hmsTrack.trackDescription
        let isMute: Bool = hmsTrack.isMute()
        let kind: String = HmsHelper.getHmsTrackType(hmsTrack.kind) ?? ""

        return ["trackId": trackId, "source": source, "trackDescription": trackDescription, "isMute": isMute, "type": kind, "kind": kind]
    }

    static func getHmsVideoTrack (_ hmsVideoTrack: HMSVideoTrack?) -> [String: Any] {

        guard let hmsTrack = hmsVideoTrack else { return [:] }

        let trackId = hmsTrack.trackId
        let source = hmsTrack.source
        let trackDescription = hmsTrack.trackDescription
        let isMute = hmsTrack.isMute()
        let isDegraded = hmsTrack.isDegraded()
        let kind: String = HmsHelper.getHmsTrackType(hmsTrack.kind) ?? ""

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

        return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "metadata": metadata, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "localAudioTrackData": localAudioTrackData, "localVideoTrackData": localVideoTrackData, "role": role]
    }
    
    static func getHmsLocalAudioTrack(_ localAudio: HMSLocalAudioTrack) -> [String: Any] {
        let type = HmsHelper.getHmsTrackType(localAudio.kind) ?? ""
        return ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings), "isMute": localAudio.isMute(), "type": type, "kind": type]
    }
    
    static func getHmsLocalVideoTrack(_ localVideo: HMSLocalVideoTrack) -> [String: Any] {
        let type = HmsHelper.getHmsTrackType(localVideo.kind) ?? ""
        return ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings), "isMute": localVideo.isMute(), "type": type, "kind": type]
    }

    static func getHmsAudioTrackSettings(_ hmsAudioTrackSettings: HMSAudioTrackSettings?) -> [String: Any] {

        guard let settings = hmsAudioTrackSettings else { return [:] }

        let maxBitrate = settings.maxBitrate
        let trackDescription = settings.trackDescription ?? ""

        return ["maxBitrate": maxBitrate, "trackDescription": trackDescription]
    }

    static func getHmsVideoTrackSettings(_ hmsVideoTrackSettings: HMSVideoTrackSettings?) -> [String: Any] {

        guard let settings = hmsVideoTrackSettings else { return [:] }

        let codec = getHmsVideoTrackCodec(settings.codec)
        let resolution = getHmsVideoResolution(settings.resolution)
        let maxBitrate = settings.maxBitrate
        let maxFrameRate = settings.maxFrameRate
        let cameraFacing = getHmsVideoTrackCameraFacing(settings.cameraFacing)
        let trackDescription = settings.trackDescription ?? ""

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

        return ["codec": codec, "resolution": resolution, "maxBitrate": maxBitrate, "maxFrameRate": maxFrameRate, "cameraFacing": cameraFacing, "trackDescription": trackDescription, "simulcastSettings": simulcastSettingsData]
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

        return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "metadata": metadata, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "remoteAudioTrackData": remoteAudioTrackData, "remoteVideoTrackData": remoteVideoTrackData, "role": role]
    }
    
    static func getHMSRemoteAudioTrack(_ remoteAudio: HMSRemoteAudioTrack) -> [String: Any] {
        let type = HmsHelper.getHmsTrackType(remoteAudio.kind) ?? ""
        return ["trackId": remoteAudio.trackId, "source": remoteAudio.source, "trackDescription": remoteAudio.trackDescription, "playbackAllowed": remoteAudio.isPlaybackAllowed(), "isMute": remoteAudio.isMute(), "type": type, "kind": type]
    }
    
    static func getHMSRemoteVideoTrack(_ remoteVideo: HMSRemoteVideoTrack) -> [String: Any] {
        let type = HmsHelper.getHmsTrackType(remoteVideo.kind) ?? ""
        return ["trackId": remoteVideo.trackId, "source": remoteVideo.source, "trackDescription": remoteVideo.trackDescription, "layer": remoteVideo.layer.rawValue, "playbackAllowed": remoteVideo.isPlaybackAllowed(), "isMute": remoteVideo.isMute(), "isDegraded": remoteVideo.isDegraded(), "type": type, "kind": type]
    }

    static func getPreviewTracks(_ tracks: [HMSTrack]) -> [String: Any] {

        var hmsTracks = [String: Any]()

        for track in tracks {
            if let localVideo = track as? HMSLocalVideoTrack {
                let type = HmsHelper.getHmsTrackType(localVideo.kind) ?? ""
                let localVideoTrackData: [String: Any] = ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings), "isMute": localVideo.isMute(), "kind": type, "type": type]
                hmsTracks["videoTrack"] = localVideoTrackData
            }

            if let localAudio = track as? HMSLocalAudioTrack {
                let type = HmsHelper.getHmsTrackType(localAudio.kind) ?? ""
                let localAudioTrackData: [String: Any]  = ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings), "isMute": localAudio.isMute(), "kind": type, "type": type]
                hmsTracks["audioTrack"] = localAudioTrackData
            }
        }
        return hmsTracks
    }

    static func getAllRoles(_ roles: [HMSRole]?) -> [[String: Any]] {
        var decodedRoles = [[String: Any]]()
        if let extractedRoles = roles {
            for role in extractedRoles {
                decodedRoles.append(HmsDecoder.getHmsRole(role))
            }
        }
        return decodedRoles
    }

    static func getHmsRole(_ hmsRole: HMSRole?) -> [String: Any] {

        guard let role = hmsRole else { return [:] }

        let name = role.name
        let permissions = getHmsPermissions(role.permissions)
        let publishSettings = getHmsPublishSettings(role.publishSettings)
        let subscribeSettings = getHmsSubscribeSettings(role.subscribeSettings)
        let priority = role.priority
        let generalPermissions = role.generalPermissions ?? [:]
        let internalPlugins = role.internalPlugins ?? [:]
        let externalPlugins = role.externalPlugins ?? [:]

        return ["name": name, "permissions": permissions, "publishSettings": publishSettings, "subscribeSettings": subscribeSettings, "priority": priority, "generalPermissions": generalPermissions, "internalPlugins": internalPlugins, "externalPlugins": externalPlugins]
    }

    static func getHmsPermissions (_ permissions: HMSPermissions) -> [String: Any] {

        let endRoom = permissions.endRoom ?? false
        let removeOthers = permissions.removeOthers ?? false
        let stopPresentation = permissions.stopPresentation ?? false
        let muteAll = permissions.muteAll ?? false
        let mute = permissions.mute ?? false
        let unmute = permissions.unmute ?? false
        let changeRole = permissions.changeRole ?? false

        return ["endRoom": endRoom,
                "removeOthers": removeOthers,
                "stopPresentation": stopPresentation,
                "muteAll": muteAll,
                "mute": mute,
                "unmute": unmute,
                "changeRole": changeRole]
    }

    static func getHmsPublishSettings (_ publishSettings: HMSPublishSettings) -> [String: Any] {

        let audio = getHmsAudioSettings(publishSettings.audio)
        let video = getHmsVideoSettings(publishSettings.video)
        let screen = getHmsVideoSettings(publishSettings.screen)
        let videoSimulcastLayers = getHmsSimulcastLayers(publishSettings.videoSimulcastLayers)
        let screenSimulcastLayers = getHmsSimulcastLayers(publishSettings.screenSimulcastLayers)
        var allowed = publishSettings.allowed ?? []
        if (publishSettings.allowed) != nil {
            allowed = getWriteableArray(publishSettings.allowed)
        } else {
            allowed = []
        }

        return ["audio": audio,
                "video": video,
                "screen": screen,
                "videoSimulcastLayers": videoSimulcastLayers,
                "screenSimulcastLayers": screenSimulcastLayers,
                "allowed": allowed]
    }

    static func getHmsSubscribeSettings (_ subscribeSettings: HMSSubscribeSettings?) -> [String: Any] {
        guard let settings = subscribeSettings
        else { return [:] }

        let maxSubsBitRate = settings.maxSubsBitRate
        let subscribeDegradationParam = getHmsSubscribeDegradationSettings(settings.subscribeDegradation)
        let subscribeTo = settings.subscribeToRoles

        return ["maxSubsBitRate": maxSubsBitRate, "subscribeDegradationParam": subscribeDegradationParam, "subscribeTo": subscribeTo ?? []]
    }

    static func getHmsSubscribeDegradationSettings (_ hmsSubscribeDegradationParams: HMSSubscribeDegradationPolicy?) -> [String: Any] {
        guard let params = hmsSubscribeDegradationParams
        else {
            return [:]
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

        guard let videoLayers = videoSimulcastLayers else { return [:] }

        let width = videoLayers.width ?? 0
        let height = videoLayers.height ?? 0
        let layers = getHmsSimulcastLayerSettingsPolicy(videoLayers.layers)

        return ["width": width, "height": height, "layers": layers]
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

    static func getError(_ errorObj: HMSError?) -> [String: Any] {
        if let error = errorObj {
            let code = error.code
            let description = error.description
            let localizedDescription = error.localizedDescription
            let debugDescription = error.debugDescription
            let message = error.message
            let name = error.id
            let id = error.id
            let action = error.action

            return ["code": code, "description": description, "localizedDescription": localizedDescription, "debugDescription": debugDescription, "message": message, "name": name, "action": action, "id": id]
        } else {
            return [:]
        }
    }

    static func getHMSBrowserRecordingState(_ data: HMSBrowserRecordingState?) -> [String: Any] {
        if let recordingState = data {
            let running = recordingState.running
            let startedAt = recordingState.startedAt?.timeIntervalSince1970 ?? 0
            let error = HmsDecoder.getError(recordingState.error)

            return ["running": running, "error": error, "startedAt": startedAt * 1000]
        } else {
            return  [:]
        }
    }

    static func getHMSRtmpStreamingState(_ data: HMSRTMPStreamingState?) -> [String: Any] {
        if let streamingState = data {
            let running = streamingState.running
            let startedAt = streamingState.startedAt?.timeIntervalSince1970 ?? 0
            let error = HmsDecoder.getError(streamingState.error)

            return ["running": running, "error": error, "startedAt": startedAt * 1000]
        } else {
            return [:]
        }
    }

    static func getHMSServerRecordingState(_ data: HMSServerRecordingState?) -> [String: Any] {
        if let recordingState = data {
            let running = recordingState.running
            let startedAt = recordingState.startedAt?.timeIntervalSince1970 ?? 0
            let error = HmsDecoder.getError(recordingState.error)

            return ["running": running, "error": error, "startedAt": startedAt * 1000]
        } else {
            return [:]
        }
    }

    static func getHlsStreamingState(_ data: HMSHLSStreamingState?) -> [String: Any] {
        if let streamingState = data {
            let running = streamingState.running
            let variants = HmsDecoder.getHMSHlsVariant(streamingState.variants)

            return ["running": running, "variants": variants]
        } else {
            return [:]
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
    
    static func getLocalVideoStats(_ data: HMSLocalVideoStats) -> [String: Any] {
        return ["roundTripTime": data.roundTripTime, "bytesSent": data.bytesSent, "bitrate": data.bitrate, "resolution": HmsDecoder.getHmsVideoResolution(data.resolution), "frameRate": data.frameRate]
    }
    
    static func getRemoteAudioStats(_ data: HMSRemoteAudioStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter]
    }
    
    static func getRemoteVideoStats(_ data: HMSRemoteVideoStats) -> [String: Any] {
        return ["bitrate": data.bitrate, "packetsReceived": data.packetsReceived, "packetsLost": data.packetsLost, "bytesReceived": data.bytesReceived, "jitter": data.jitter, "resolution": HmsDecoder.getHmsVideoResolution(data.resolution), "frameRate": data.frameRate]
    }
}
