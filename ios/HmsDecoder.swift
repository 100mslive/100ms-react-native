import HMSSDK
import Foundation

class HmsDecoder: NSObject {
    static func getHmsRoom (_ room: HMSRoom) -> [String: Any] {
        let id: String = room.id
        let name: String = room.name
        let metaData: String = room.metaData ?? ""
        var peers: [[String: Any]] = []
        
        for peer in room.peers {
            peers.append(getHmsPeer(peer))
        }
        
        let result:[String: Any] = ["id": id, "name": name, "metaData": metaData, "peers": peers]
        return result
        
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
            let source: HMSTrackSource = hmsTrack.source
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
            let source: HMSTrackSource = hmsTrack.source
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
            let source: HMSTrackSource = hmsTrack.source
            let trackDescription: String = hmsTrack.trackDescription
            let result : [String: Any] = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:]
        }
    }
    
    static func getHmsLocal
}
