package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableMap
import live.hms.video.media.tracks.*
import live.hms.video.sdk.models.*
import live.hms.video.sdk.models.role.*

object HmsHelper {

  fun areAllRequiredKeysAvailable(
      map: ReadableMap?,
      requiredKeys: Array<Pair<String, String>>
  ): Boolean {
    if (map == null) {
      return false
    }
    for ((key, value) in requiredKeys) {
      if (map.hasKey(key)) {
        when (value) {
          "String" -> {
            if (map.getString(key) == null) {
              return false
            }
          }
          "Boolean" -> {
            if (map.getBoolean(key) == null) {
              return false
            }
          }
          "Array" -> {
            if (map.getArray(key) == null) {
              return false
            }
          }
          "Int" -> {
            if (map.getInt(key) == null) {
              return false
            }
          }
          "Map" -> {
            if (map.getMap(key) == null) {
              return false
            }
          }
        }
      } else {
        return false
      }
    }
    return true
  }

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

  fun getRemotePeerFromPeerId(peerId: String?, peers: Array<HMSRemotePeer>?): HMSRemotePeer? {
    if (peerId != null && peers != null) {
      for (peer in peers) {
        if (peerId == peer.peerID) {
          return peer
        }
      }
    }
    return null
  }

  fun getRolesFromRoleNames(
      targetedRoles: ArrayList<String>?,
      roles: List<HMSRole>?
  ): List<HMSRole> {
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
    if (role != null && roles != null) {
      for (hmsRole in roles) {
        if (role == hmsRole.name) {
          return hmsRole
        }
      }
    }
    return null
  }

  fun getRemoteAudioTrackFromTrackId(trackId: String?, remotePeers: Array<HMSRemotePeer>?): HMSRemoteAudioTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.audioTrack?.trackId == trackId) {
          return remotePeer.audioTrack as HMSRemoteAudioTrack
        }
      }
    }
    return null
  }

  fun getRemoteVideoTrackFromTrackId(trackId: String?, remotePeers: Array<HMSRemotePeer>?): HMSRemoteVideoTrack? {
    if (trackId != null && remotePeers != null) {
      for (remotePeer in remotePeers) {
        if (remotePeer.videoTrack?.trackId == trackId) {
          return remotePeer.videoTrack as HMSRemoteVideoTrack
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

  fun getLocalTrackFromTrackId(trackId: String?, localPeer: HMSLocalPeer?): HMSTrack? {
    if (trackId != null && localPeer != null) {
      if (localPeer.audioTrack?.trackId == trackId) {
        return localPeer.audioTrack as HMSTrack
      }

      if (localPeer.videoTrack?.trackId == trackId) {
        return localPeer.videoTrack as HMSTrack
      }

      for (auxTrack in localPeer.auxiliaryTracks) {
        if (auxTrack.trackId == trackId) {
          return auxTrack
        }
      }
    }
    return null
  }
}
