import HMSSDK
import Foundation

class HmsHelper: NSObject {
    
    static func getPeerFromPeerId(_ peerID: String?, remotePeers: [HMSRemotePeer]?) -> HMSPeer? {
        
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
}
