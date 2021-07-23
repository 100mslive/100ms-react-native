import HMSSDK
import Foundation

class HmsDecoder: NSObject {
    static func getHmsRoom (_ hmsRoom: HMSRoom?) -> [String: Any] {
        if let room = hmsRoom {
            let id: String = room.id
            let name: String = room.name
            let metaData: String = room.metaData ?? ""
            var peers: [[String: Any]] = []
            
            for peer in room.peers {
                peers.append(getHmsPeer(peer))
            }
            
            let result:[String: Any] = ["id": id, "name": name, "metaData": metaData, "peers": peers]
            return result
        } else {
            return [:]
        }
    }
    
    static func getHmsPeer (_ peer: HMSPeer) -> [String: Any] {
        let peerID: String = peer.peerID
        let name: String = peer.name
        let isLocal: Bool = peer.isLocal
        let customerUserID: String = peer.customerUserID ?? ""
        let customerDescription: String = peer.customerDescription ?? ""
        let audioTrack: [String: Any] = getHmsAudioTrack(peer.audioTrack)
        let videoTrack : [String: Any] = getHmsVideoTrack(peer.videoTrack)
        var auxiliaryTracks: [[String: Any]] = []
        
        for track in peer.auxiliaryTracks ?? [] {
            auxiliaryTracks.append(getHmsTrack(track))
        }
        
        let result:[String: Any] = ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks]

        return result
    }
    
    static func getHmsTrack (_ track: HMSTrack?) -> [String: Any] {
        if let hmsTrack = track {
            let trackId: String = hmsTrack.trackId
            let source: UInt = hmsTrack.source.rawValue
            let trackDescription: String = hmsTrack.trackDescription
            
            let result:[String: Any]  = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:];
        }
    }
    
    static func getHmsAudioTrack (_ hmsAudioTrack: HMSAudioTrack?) -> [String: Any] {
        if let hmsTrack = hmsAudioTrack {
            let trackId: String = hmsTrack.trackId
            let source: UInt = hmsTrack.source.rawValue
            let trackDescription: String = hmsTrack.trackDescription
            
            let result:[String: Any]  = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:]
        }
    }
    
    static func getHmsVideoTrack (_ hmsVideoTrack: HMSVideoTrack?) -> [String: Any] {
        if let hmsTrack = hmsVideoTrack {
            let trackId: String = hmsTrack.trackId
            let source: UInt = hmsTrack.source.rawValue
            let trackDescription: String = hmsTrack.trackDescription
            let result : [String: Any] = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:]
        }
    }
    
    static func getHmsLocalPeer(_ hmsLocalPeer: HMSLocalPeer?) -> [String: Any] {
        if let peer = hmsLocalPeer {
            let peerID: String = peer.peerID
            let name: String = peer.name
            let isLocal: Bool = peer.isLocal
            let customerUserID: String = peer.customerUserID ?? ""
            let customerDescription: String = peer.customerDescription ?? ""
            let audioTrack: [String: Any] = getHmsAudioTrack(peer.audioTrack)
            let videoTrack : [String: Any] = getHmsVideoTrack(peer.videoTrack)
            var auxiliaryTracks: [[String: Any]] = []
            
            for track in peer.auxiliaryTracks ?? [] {
                auxiliaryTracks.append(getHmsTrack(track))
            }
            
            let localAudioTrack = peer.localAudioTrack()
            let localVideoTrack = peer.localVideoTrack()
            
            var localAudioTrackData: [String: Any] = [:]
            if let localAudio = localAudioTrack {
                localAudioTrackData = ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings)]
            }
            
            var localVideoTrackData: [String: Any] = [:]
            if let localVideo = localVideoTrack {
                localVideoTrackData = ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings)]
            }
            
            return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "localAudioTrackData": localAudioTrackData, "localVideoTrackData": localVideoTrackData]
        } else {
            return [:]
        }
    }
    
    static func getHmsAudioTrackSettings(_ hmsAudioTrackSettings: HMSAudioTrackSettings?) -> [String: Any] {
        if let settings = hmsAudioTrackSettings {
            let maxBitrate: Int = settings.maxBitrate
            let trackDescription: String = settings.trackDescription ?? ""
            
            return ["maxBitrate": maxBitrate, "trackDescription": trackDescription]
        } else {
            return [:]
        }
    }
    
    static func getHmsVideoTrackSettings(_ hmsVideoTrackSettings: HMSVideoTrackSettings?) -> [String: Any] {
        if let settings = hmsVideoTrackSettings {
            let codec: UInt = settings.codec.rawValue
            let resolution: HMSVideoResolution = settings.resolution
            let maxBitrate: Int = settings.maxBitrate
            let maxFrameRate: Int = settings.maxFrameRate
            let cameraFacing: UInt = settings.cameraFacing.rawValue
            let trackDescription: String = settings.trackDescription ?? ""
            //TODO: add hms simulcast layer settings here
            
            return ["codec": codec, "resolution": resolution, "maxBitrate": maxBitrate, "maxFrameRate": maxFrameRate, "cameraFacing": cameraFacing, "trackDescription": trackDescription]
        } else {
            return [:]
        }
    }
    
    static func getHmsRemotePeers (_ remotePeers: [HMSRemotePeer]?) -> [[String: Any]] {
        var peers:[[String: Any]] = []
        
        for peer in remotePeers ?? [] {
            peers.append(getHmsRemotePeer(peer))
        }
        
        return peers
    }
    
    static func getHmsRemotePeer(_ hmsRemotePeer: HMSRemotePeer) -> [String: Any] {
        let peerID: String = hmsRemotePeer.peerID
        let name: String = hmsRemotePeer.name
        let isLocal: Bool = hmsRemotePeer.isLocal
        let customerUserID: String = hmsRemotePeer.customerUserID ?? ""
        let customerDescription: String = hmsRemotePeer.customerDescription ?? ""
        let audioTrack: [String: Any] = getHmsAudioTrack(hmsRemotePeer.audioTrack)
        let videoTrack : [String: Any] = getHmsVideoTrack(hmsRemotePeer.videoTrack)
        var auxiliaryTracks: [[String: Any]] = []
        
        for track in hmsRemotePeer.auxiliaryTracks ?? [] {
            auxiliaryTracks.append(getHmsTrack(track))
        }
        
        let remoteAudioTrack = hmsRemotePeer.remoteAudioTrack()
        let remoteVideoTrack = hmsRemotePeer.remoteVideoTrack()
        
        var remoteAudioTrackData: [String: Any] = [:]
        if let remoteAudio = remoteAudioTrack {
            remoteAudioTrackData = ["trackId": remoteAudio.trackId, "source": remoteAudio.source, "trackDescription": remoteAudio.trackDescription]
        }
        
        var remoteVideoTrackData: [String: Any] = [:]
        if let remoteVideo = remoteVideoTrack {
            remoteVideoTrackData = ["trackId": remoteVideo.trackId, "source": remoteVideo.source, "trackDescription": remoteVideo.trackDescription, "layer": remoteVideo.layer.rawValue]
        }
        
        return ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxiliaryTracks": auxiliaryTracks, "remoteAudioTrackData": remoteAudioTrackData, "remoteVideoTrackData": remoteVideoTrackData]
    }
    
    static func getPreviewTracks(_ tracks: [HMSTrack]) -> [String: Any] {
        var hmsTracks: [String: Any] = [:]
        for track in tracks {
            if let localVideo = track as? HMSLocalVideoTrack {
                let localVideoTrackData: [String : Any] = ["trackId": localVideo.trackId, "source": localVideo.source, "trackDescription": localVideo.trackDescription, "settings": getHmsVideoTrackSettings(localVideo.settings)]
                hmsTracks["videoTrack"] = localVideoTrackData
            }
            
            if let localAudio = track as? HMSLocalAudioTrack {
                let localAudioTrackData: [String : Any]  = ["trackId": localAudio.trackId, "source": localAudio.source, "trackDescription": localAudio.trackDescription, "settings": getHmsAudioTrackSettings(localAudio.settings)]
                hmsTracks["audioTrack"] = localAudioTrackData
            }
        }
        return hmsTracks
    }
}
