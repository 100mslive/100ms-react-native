package com.reactnativehmssdk

import live.hms.video.sdk.models.role.*
import live.hms.video.sdk.models.*
import live.hms.video.media.tracks.*

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

    fun getRoleFromRoleName(role: String?, roles: List<HMSRole>?): HMSRole? {
      if (role != null && roles!= null) {
        for (hmsRole in roles) {
          if (role == hmsRole.name) {
            return hmsRole
          }
        }
      }
      return null
    }

  fun getTrackFromTrackId(trackId: String?, remotePeers: Array<HMSRemotePeer>?): HMSTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.audioTrack?.trackId == trackId) {
          return remotePeer.audioTrack as HMSTrack
        }

        if (remotePeer.videoTrack?.trackId == trackId) {
          return remotePeer.videoTrack as HMSTrack
        }
      }
    }
    return null
  }
}
