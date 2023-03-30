import HMSSDK
import Foundation

class HMSHelper: NSObject {
    static var audioMixerSourceHashMap: [String: HMSAudioNode]?

    static func getUnavailableRequiredKey(_ data: NSDictionary, _ requiredKeys: [String]) -> String {
        for (key) in requiredKeys {
            let value = data.object(forKey: key)
            if value == nil {
                return key + "_Is_Required"
            }
            if value is NSNull {
                return key + "_Is_Null"
            }
        }
        return "SEND_ALL_REQUIRED_KEYS"
    }

    static func getPeerFromPeerId(_ peerID: String?, remotePeers: [HMSRemotePeer]?, localPeer: HMSLocalPeer?) -> HMSPeer? {

        guard let peerID = peerID, let peers = remotePeers else { return nil }
        if peerID == localPeer?.peerID {
            return localPeer
        }
        return peers.first { $0.peerID == peerID }
    }

    static func getRemotePeerFromPeerId(_ peerID: String?, remotePeers: [HMSRemotePeer]?) -> HMSPeer? {

        guard let peerID = peerID, let peers = remotePeers else { return nil }

        return peers.first { $0.peerID == peerID }
    }

    static func getRolesFromRoleNames(_ targetedRoles: [String]?, roles: [HMSRole]?) -> [HMSRole] {

        guard let roles = roles,
              let targetedRoles = targetedRoles
        else { return [HMSRole]() }

        return roles.filter { targetedRoles.contains($0.name) }
    }

    static func getRoleFromRoleName(_ role: String?, roles: [HMSRole]?) -> HMSRole? {

        guard let roles = roles, let roleName = role else { return nil }

        return roles.first { $0.name == roleName }
    }

    static func getLocalTrackFromTrackId(_ trackID: String?, localPeer: HMSLocalPeer?) -> HMSTrack? {
        if localPeer?.videoTrack?.trackId == trackID {
            return localPeer?.videoTrack
        }

        if localPeer?.audioTrack?.trackId == trackID {
            return localPeer?.audioTrack
        }

        for track in localPeer?.auxiliaryTracks ?? [] where track.trackId == trackID {
            return track
        }

        return nil
    }

    static func getRemoteAudioTrackFromTrackId(_ trackID: String?, _ remotePeers: [HMSRemotePeer]?) -> HMSRemoteAudioTrack? {
        for peer in remotePeers ?? [] {
            if peer.audioTrack?.trackId == trackID {
                return peer.audioTrack as? HMSRemoteAudioTrack
            }
        }
        return nil
    }

    static func getRemoteAudioAuxiliaryTrackFromTrackId(_ trackID: String?, _ remotePeers: [HMSRemotePeer]?) -> HMSRemoteAudioTrack? {
        for peer in remotePeers ?? [] {
            if peer.audioTrack?.trackId == trackID {
                return peer.audioTrack as? HMSRemoteAudioTrack
            }
            let auxTracks = peer.auxiliaryTracks

            for track in auxTracks ?? [] {
                if track.kind == HMSTrackKind.audio && track.trackId == trackID {
                    return track as? HMSRemoteAudioTrack
                }
            }
        }
        return nil
    }

    static func getRemoteVideoTrackFromTrackId(_ trackID: String?, _ remotePeers: [HMSRemotePeer]?) -> HMSRemoteVideoTrack? {
        for peer in remotePeers ?? [] {
            if peer.videoTrack?.trackId == trackID {
                return peer.videoTrack as? HMSRemoteVideoTrack
            }
        }
        return nil
    }

    static func getHmsTrackType(_ kind: HMSTrackKind?) -> String? {
        if kind == HMSTrackKind.video {
            return "VIDEO"
        } else if kind == HMSTrackKind.audio {
            return "AUDIO"
        }
        return nil
    }

    static func getTrackFromTrackId(_ trackID: String?, _ remotePeers: [HMSRemotePeer]?) -> HMSTrack? {

        for peer in remotePeers ?? [] {
            if peer.videoTrack?.trackId == trackID {
                return peer.videoTrack
            }

            if peer.audioTrack?.trackId == trackID {
                return peer.audioTrack
            }

            for track in peer.auxiliaryTracks ?? [] where track.trackId == trackID {
                return track
            }
        }

        return nil
    }

    static func getHms(_ credentials: NSDictionary, _ hmsCollection: [String: HMSRNSDK]) -> HMSRNSDK? {
        guard let id = credentials.value(forKey: "id") as? String,
              let hms = hmsCollection[id]
        else {
            return nil
        }
        return hms
    }

    static func getFrameworkInfo(_ frameworkInfo: NSDictionary?) -> HMSFrameworkInfo? {
        guard let data = frameworkInfo,
              let version = data.value(forKey: "version") as? String,
              let sdkVersion = data.value(forKey: "sdkVersion") as? String
        else {
            return nil
        }
        return HMSFrameworkInfo(type: HMSFrameworkType.reactNative, version: version, sdkVersion: sdkVersion)
    }

    static func getLocalVideoSettings(_ settings: NSDictionary?) -> HMSVideoTrackSettings? {
        if settings === nil {
            return nil
        }
        let codec = HMSCodec.VP8
        let resolution = HMSVideoResolution.init(width: 320, height: 180)
        let maxBitrate = 512
        let maxFrameRate = 25
        let trackDescription = ""
        let cameraFacing = settings?.value(forKey: "cameraFacing") as? String
        let cameraFacingEncoded = HMSHelper.getCameraFacing(cameraFacing)
        let initialState = settings?.value(forKey: "initialState") as? String
        let initialStateEncoded = HMSHelper.getHMSTrackSettingsInitState(initialState)
        let hmsTrackSettings = HMSVideoTrackSettings(codec: codec,
                                                     resolution: resolution,
                                                     maxBitrate: maxBitrate,
                                                     maxFrameRate: maxFrameRate,
                                                     cameraFacing: cameraFacingEncoded,
                                                     simulcastSettings: nil,
                                                     trackDescription: trackDescription,
                                                     initialMuteState: initialStateEncoded,
                                                     videoPlugins: nil)
        return hmsTrackSettings
    }

    static func getLocalAudioSettings(_ settings: NSDictionary?, _ hms: HMSSDK?, _ delegate: HMSManager?, _ id: String) -> HMSAudioTrackSettings? {
        if settings === nil {
            return nil
        }
        let initialState = settings?.value(forKey: "initialState") as? String
        let initialStateEncoded = HMSHelper.getHMSTrackSettingsInitState(initialState)

        if #available(iOS 13.0, *) {
            var audioMixerSourceMap: [String: HMSAudioNode]?
            if let playerNode = settings?.value(forKey: "audioSource") as? [String] {
                audioMixerSourceMap = [String: HMSAudioNode]()
                for node in playerNode {
                    if audioMixerSourceMap?[node] == nil {
                        if node == "mic_node" {
                            audioMixerSourceMap?["mic_node"] = HMSMicNode()
                        } else if node == "screen_broadcast_audio_receiver_node" {
                            do {
                                audioMixerSourceMap?["screen_broadcast_audio_receiver_node"] = try hms?.screenBroadcastAudioReceiverNode()
                            } catch {
                                delegate?.emitEvent("ON_ERROR", ["error": ["code": 6002, "description": error.localizedDescription, "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
                            }
                        } else {
                            audioMixerSourceMap?[node] = HMSAudioFilePlayerNode()
                        }
                    }
                }
            }

            if let audioMixerSourceMap = audioMixerSourceMap {
                do {
                    self.audioMixerSourceHashMap = audioMixerSourceMap
                    let audioMixerSource = try HMSAudioMixerSource(nodes: audioMixerSourceMap.values.map {$0})
                    return HMSAudioTrackSettings(maxBitrate: 32, trackDescription: "", initialMuteState: initialStateEncoded, audioSource: audioMixerSource)
                } catch {
                    delegate?.emitEvent("ON_ERROR", ["error": ["code": 6002, "description": error.localizedDescription, "isTerminal": false, "canRetry": true, "params": ["function": #function]], "id": id])
                    return nil
                }
            }
        }

        return HMSAudioTrackSettings(maxBitrate: 32, trackDescription: "", initialMuteState: initialStateEncoded, audioSource: nil)
    }

    static func getAudioMixerSourceMap() -> [String: HMSAudioNode]? {
        return self.audioMixerSourceHashMap
    }

    static func getVideoResolution(_ data: [String: Double]) -> HMSVideoResolution? {
        guard let width = data["width"],
              let height = data["height"]
        else {
            return nil
        }

        return HMSVideoResolution.init(width: width, height: height)
    }

    static func getVideoCodec(_ codecString: String?) -> HMSCodec {
        switch codecString {
        case "H264":
            return HMSCodec.H264
        case "VP8":
            return HMSCodec.VP8
        default:
            return HMSCodec.H264
        }
    }

    static func getCameraFacing(_ cameraFacing: String?) -> HMSCameraFacing {
        switch cameraFacing {
        case "FRONT":
            return HMSCameraFacing.front
        case "BACK":
            return HMSCameraFacing.back
        default:
            return HMSCameraFacing.front
        }
    }

    static func getHMSTrackSettingsInitState(_ initState: String?) -> HMSTrackMuteState {
        switch initState {
        case "MUTED":
            return HMSTrackMuteState.mute
        case "UNMUTED":
            return HMSTrackMuteState.unmute
        default:
            return HMSTrackMuteState.unmute
        }
    }

    static func getHMSTrackInitState(_ initState: HMSTrackMuteState?) -> String {
        switch initState {
        case .mute:
            return "MUTED"
        case .unmute:
            return "UNMUTED"
        default:
            return "UNMUTED"
        }
    }

    static func getRtmpUrls(_ strings: [String]?) -> [URL]? {
        if let extractedStrings = strings {
            var arr: [URL] = []
            for urlString in extractedStrings {
                let urlInstance = URL(string: urlString)
                if let urlExtracted = urlInstance {
                    arr.append(urlExtracted)
                }
            }
            return arr
        } else {
            return nil
        }
    }

    static func getHMSHLSMeetingURLVariants(_ variants: [[String: Any]]?) -> [HMSHLSMeetingURLVariant] {
        var hlsVariants: [HMSHLSMeetingURLVariant] = []
        for variant in variants ?? [] {
            let meetingURLVariant = HMSHelper.getHMSHLSMeetingURLVariant(variant)
            if let extractedVariant = meetingURLVariant {
                hlsVariants.append(extractedVariant)
            }
        }
        return hlsVariants
    }

    static func getHlsRecordingConfig(_ config: NSDictionary?) -> HMSHLSRecordingConfig? {
        guard let hlsRecordingConfig = config
        else {
            return nil
        }
        let singleFilePerLayer = hlsRecordingConfig.value(forKey: "singleFilePerLayer") as? Bool
        let videoOnDemand = hlsRecordingConfig.value(forKey: "videoOnDemand") as? Bool

        return HMSHLSRecordingConfig(singleFilePerLayer: singleFilePerLayer ?? false, enableVOD: videoOnDemand ?? false)
    }

    static func getHMSHLSMeetingURLVariant(_ variant: [String: Any]) -> HMSHLSMeetingURLVariant? {
        let meetingUrl = variant["meetingUrl"] as? String
        let metadata = variant["metadata"] as? String

        if let extractedUrl = meetingUrl, let url = URL(string: extractedUrl) {
            return HMSHLSMeetingURLVariant(meetingURL: url, metadata: metadata ?? "")
        }
        return nil
    }
}
