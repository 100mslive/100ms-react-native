import HMSSDK
import Foundation

class HmsHelper: NSObject {
    static func getPeerFromPeerId(_ peerId: String?, remotePeers: [HMSRemotePeer]?) -> HMSPeer? {
        if let peerName = peerId {
            if let peers = remotePeers {
                for peer in peers {
                    if (peer.peerID == peerName) {
                        return peer
                    }
                }
            }
            return nil
        }
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
    
    static func getRoleFromRoleName(_ role: String?, roles: [HMSRole]?) -> HMSRole? {
        if let extractedRoles = roles, let roleName = role {
            for roleData in extractedRoles {
                if roleData.name == roleName {
                    return roleData
                }
            }
        }
        return nil
    }
}
