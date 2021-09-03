package com.reactnativehmssdk

import live.hms.video.sdk.models.HMSPeer
import live.hms.video.sdk.models.role.*

object HmsHelper {

    fun getPeerFromPeerId(peerId: String?, peers: Array<HMSPeer>?): HMSPeer? {
      if (peerId != null && peers != null) {
        for (peer in peers) {
          if (peerId == peer.peerID) {
            return peer
          }
        }
      }
      return null
    }

    fun getRolesFromRoleNames(targetedRoles: Array<String>?, roles: List<HMSRole>?): List<HMSRole> {
      val encodedRoles: MutableList<HMSRole> = mutableListOf()

      if (targetedRoles != null && roles != null) {
        for (role in roles) {
          for (targetedRole in targetedRoles) {
            if (targetedRole == role.name) {
              encodedRoles.add(role)
            }
          }
        }
      }


      return encodedRoles.toList()
    }
}
