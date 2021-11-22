import { HMSTrack } from './HMSTrack';
import { HMSAudioTrack } from './HMSAudioTrack';
import { HMSVideoTrack } from './HMSVideoTrack';
import { HMSRoom } from './HMSRoom';
import { HMSPeer } from './HMSPeer';

import { HMSLocalPeer } from './HMSLocalPeer';
import { HMSRemotePeer } from './HMSRemotePeer';

import { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import { HMSVideoTrackSettings } from './HMSVideoTrackSettings';
import { HMSLocalVideoTrack } from './HMSLocalVideoTrack';
import { HMSLocalAudioTrack } from './HMSLocalAudioTrack';
import { HMSRole } from './HMSRole';
import { HMSRoleChangeRequest } from './HMSRoleChangeRequest';
import { HMSChangeTrackStateRequest } from './HMSChangeTrackStateRequest';
import { HMSVideoResolution } from './HMSVideoResolution';

export class HMSEncoder {
  static encodeHmsRoom(room: any, id: string) {
    const encodedObj = {
      id: room?.id,
      metaData: room?.metaData,
      name: room?.name,
      peers: HMSEncoder.encodeHmsPeers(room?.peers, id),
    };

    return new HMSRoom(encodedObj);
  }

  static encodeHmsPeers(peers: any, id: string) {
    const encodedPeers: HMSPeer[] = [];
    peers?.map((peer: any) => {
      encodedPeers.push(HMSEncoder.encodeHmsPeer(peer, id));
    });

    return encodedPeers;
  }

  static encodeHmsPeer(peer: any, id: string) {
    const encodedObj = {
      peerID: peer?.peerID,
      name: peer?.name,
      isLocal: peer?.isLocal,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      customerUserID: peer?.customerUserID,
      customerDescription: peer?.customerDescription,
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer?.audioTrack, id),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer?.videoTrack, id),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer?.auxiliaryTracks,
        id
      ),
    };

    return new HMSPeer(encodedObj);
  }

  static encodeHmsAudioTrack(track: any, id: string) {
    const encodedObj = {
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      id: id,
      type: track?.type,
    };

    return new HMSAudioTrack(encodedObj);
  }

  static encodeHmsVideoTrack(track: any, id: string) {
    const encodedObj = {
      id: id,
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      isDegraded: track?.isDegraded,
      type: track?.type,
    };

    return new HMSVideoTrack(encodedObj);
  }

  static encodeHmsAuxiliaryTracks(tracks: any, id: string) {
    const auxiliaryTracks: HMSTrack[] = [];
    tracks?.map((track: any) => {
      auxiliaryTracks.push(HMSEncoder.encodeHmsTrack(track, id));
    });
    return auxiliaryTracks;
  }

  static encodeHmsTrack(track: any, id: string) {
    const encodedObj = {
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      id: id,
      type: track?.type,
    };

    return new HMSTrack(encodedObj);
  }

  static encodeHmsLocalPeer(peer: any, id: string) {
    const encodedObj = {
      peerID: peer.peerID,
      name: peer.name,
      isLocal: peer.isLocal,
      customerUserID: peer.customerUserID,
      customerDescription: peer.customerDescription,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer.audioTrack, id),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer.videoTrack, id),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer.auxiliaryTracks,
        id
      ),
      localAudioTrackData: {
        id: id,
        trackId: peer?.localAudioTrackData?.trackId,
        source: peer?.localAudioTrackData?.source,
        trackDescription: peer?.localAudioTrackData?.trackDescription,
        isMute: peer?.localAudioTrackData?.isMute,
        settings: HMSEncoder.encodeHmsAudioTrackSettings(
          peer?.localAudioTrackData?.settings
        ),
      },
      localVideoTrackData: {
        id: id,
        trackId: peer?.localVideoTrackData?.trackId,
        source: peer?.localVideoTrackData?.source,
        trackDescription: peer?.localVideoTrackData?.trackDescription,
        isMute: peer?.localVideoTrackData?.isMute,
        settings: HMSEncoder.encodeHmsVideoTrackSettings(
          peer?.localVideoTrackData?.settings
        ),
      },
    };

    return new HMSLocalPeer(encodedObj);
  }

  static encodeHmsAudioTrackSettings(settings: any) {
    const encodedObj = {
      maxBitrate: settings?.maxBitrate,
      trackDescription: settings?.trackDescription,
      codec: settings?.codec,
    };

    return new HMSAudioTrackSettings(encodedObj);
  }

  static encodeHmsVideoTrackSettings(settings: any) {
    const encodedObj = {
      codec: settings?.codec,
      resolution: HMSEncoder.encodeHmsVideoResolution(settings?.resolution),
      maxBitrate: settings?.maxBitrate,
      maxFrameRate: settings?.maxFrameRate,
      cameraFacing: settings?.cameraFacing,
      trackDescription: settings?.trackDescription,
    };

    return new HMSVideoTrackSettings(encodedObj);
  }

  static encodeHmsVideoResolution(resolution: any) {
    const encodedObj = {
      height: resolution?.height,
      width: resolution?.width,
    };

    return new HMSVideoResolution(encodedObj);
  }

  static encodeHmsRemotePeers(peers: any, id: string) {
    const hmsPeers: any[] = [];

    peers.map((peer: any) => {
      const encodedPeer = HMSEncoder.encodeHmsRemotePeer(peer, id);

      hmsPeers.push(encodedPeer);
    });

    return hmsPeers;
  }

  static encodeHmsRemotePeer(peer: any, id: string) {
    const encodedObj = {
      peerID: peer.peerID,
      name: peer.name,
      isLocal: peer.isLocal,
      customerUserID: peer.customerUserID,
      customerDescription: peer.customerDescription,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer.audioTrack, id),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer.videoTrack, id),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer.auxiliaryTracks,
        id
      ),
      remoteAudioTrackData: {
        id: id,
        trackId: peer?.remoteAudioTrackData?.trackId,
        source: peer?.remoteAudioTrackData?.source,
        trackDescription: peer?.remoteAudioTrackData?.trackDescription,
        isMute: peer?.remoteAudioTrackData?.isMute,
        playbackAllowed: peer?.remoteAudioTrackData?.playbackAllowed,
      },
      remoteVideoTrackData: {
        id: id,
        trackId: peer?.remoteVideoTrackData?.trackId,
        source: peer?.remoteVideoTrackData?.source,
        trackDescription: peer?.remoteVideoTrackData?.trackDescription,
        layer: peer?.remoteVideoTrackData?.layer,
        isMute: peer?.remoteVideoTrackData?.isMute,
        playbackAllowed: peer?.remoteVideoTrackData?.playbackAllowed,
      },
    };

    return new HMSRemotePeer(encodedObj);
  }

  static encodeHmsPreviewTracks(previewTracks: any) {
    const encodedObj = {
      audioTrack: previewTracks.audioTrack
        ? new HMSLocalAudioTrack(previewTracks.audioTrack)
        : null,
      videoTrack: previewTracks.videoTrack
        ? new HMSLocalVideoTrack(previewTracks.videoTrack)
        : null,
    };

    return encodedObj;
  }

  static encodeHmsRoles(roles: any[]) {
    const encodedRoles: HMSRole[] = [];

    roles?.map((item: any) => {
      encodedRoles.push(HMSEncoder.encodeHmsRole(item));
    });

    return encodedRoles;
  }

  static encodeHmsRole(role: any) {
    const hmsRole = new HMSRole(role);

    return hmsRole;
  }

  static encodeHmsRoleChangeRequest(data: any, id: string) {
    const encodedRoleChangeRequest = {
      requestedBy: HMSEncoder.encodeHmsPeer(data.requestedBy, id),
      suggestedRole: HMSEncoder.encodeHmsRole(data.suggestedRole),
    };

    return new HMSRoleChangeRequest(encodedRoleChangeRequest);
  }

  static encodeHmsChangeTrackStateRequest(
    data: HMSChangeTrackStateRequest,
    id: string
  ) {
    const encodedChangeTrackStateRequest = {
      requestedBy: HMSEncoder.encodeHmsPeer(data.requestedBy, id),
      trackType: data.trackType,
    };

    return new HMSChangeTrackStateRequest(encodedChangeTrackStateRequest);
  }
}
