import HMSSDK
import Foundation

class HmsDecoder: NSObject {
    static func getHmsRoom (_ room: HMSRoom) -> NSDictionary {
        let id: String = room.id
        let name: String = room.name
        let metaData: String = room.metaData ?? ""
        var peers: [NSDictionary] = []
        
        for peer in room.peers {
            peers.append(getHmsPeer(peer))
        }
        
        let result:NSDictionary = ["id": id, "name": name, "metaData": metaData, "peers": peers]
        return result
        
    }
    
    static func getHmsPeer (_ peer: HMSPeer) -> NSDictionary {
        let peerID: String = peer.peerID
        let name: String = peer.name
        let isLocal: Bool = peer.isLocal
        let customerUserID: String = peer.customerUserID ?? ""
        let customerDescription: String = peer.customerDescription ?? ""
        let audioTrack: NSDictionary = getHmsAudioTrack(peer.audioTrack)
        let videoTrack : NSDictionary = getHmsVideoTrack(peer.videoTrack)
        var auxilaryTracks: [NSDictionary] = []
        
        for track in peer.auxiliaryTracks ?? [] {
            auxilaryTracks.append(getHmsTrack(track))
        }
        
        let result:NSDictionary = ["peerID": peerID, "name": name, "isLocal": isLocal, "customerUserID": customerUserID, "customerDescription": customerDescription, "audioTrack": audioTrack, "videoTrack": videoTrack, "auxilaryTracks": auxilaryTracks]

        return result
    }
    
    static func getHmsTrack (_ track: HMSTrack?) -> NSDictionary {
        if let hmsTrack = track {
            let trackId: String = hmsTrack.trackId
            let source: HMSTrackSource = hmsTrack.source
            let trackDescription: String = hmsTrack.trackDescription
            
            let result:NSDictionary  = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:];
        }
    }
    
    static func getHmsAudioTrack (_ hmsAudioTrack: HMSAudioTrack?) -> NSDictionary {
        if let hmsTrack = hmsAudioTrack {
            let trackId: String = hmsTrack.trackId
            let source: HMSTrackSource = hmsTrack.source
            let trackDescription: String = hmsTrack.trackDescription
            
            let result:NSDictionary  = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:]
        }
    }
    
    static func getHmsVideoTrack (_ hmsVideoTrack: HMSVideoTrack?) -> NSDictionary {
        if let hmsTrack = hmsVideoTrack {
            let trackId: String = hmsTrack.trackId
            let source: HMSTrackSource = hmsTrack.source
            let trackDescription: String = hmsTrack.trackDescription
            let result : NSDictionary = ["trackId": trackId, "source": source, "trackDescription": trackDescription]
            return result;
        } else {
            return [:]
        }
    }
}
