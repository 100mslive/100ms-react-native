import HMSSDK
import Foundation

class HmsHelper: NSObject {
    static func getPeerFromPeerId(_ peerId: String, remotePeers: [HMSRemotePeer]?) -> HMSPeer? {
        if let peers = remotePeers {
            for peer in peers {
                if (peer.peerID == peerId) {
                    return peer
                }
            }
        }
        return nil
    }
    
    static func getRolesFromRoleNames(_ targetedRoles: [String]?, roles: [HMSRole]?) -> [HMSRole] {
        var hmsRoles: [HMSRole] = []
        if let extractedRoles = roles, let extractedTargetedRoles = targetedRoles {
            for role in extractedRoles {
                for targetedRole in extractedTargetedRoles {
                    if targetedRole == role.name {
                        hmsRoles.append(role)
                    }
                }
            }
        }
        return hmsRoles
    }
}
