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
    
    static func getRemoteVideoTrackFromTrackId(_ trackID: String?, _ remotePeers: [HMSRemotePeer]?) -> HMSRemoteVideoTrack? {
        for peer in remotePeers ?? [] {
            if peer.videoTrack?.trackId == trackID {
                return peer.videoTrack as? HMSRemoteVideoTrack
            }
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
    
    static func getHms(_ credentials: NSDictionary, _ hmsCollection: [String: HmsSDK]) -> HmsSDK? {
        guard let id = credentials.value(forKey: "id") as? String,
              let hms = hmsCollection[id]
        else {
            return nil
        }
        return hms
    }
}
