import HMSTrack from './HMSTrack';
import HMSAudioTrack from './HMSAudioTrack';
import HMSVideoTrack from './HMSVideoTrack';
import HMSRoom from './HMSRoom';
import HMSPeer from './HMSPeer';

import HMSLocalPeer from './HMSLocalPeer';
import HMSRemotePeer from './HMSRemotePeer';

import HMSAudioTrackSettings from './HMSAudioTrackSettings';
import HMSVideoTrackSettings from './HMSVideoTrackSettings';

export default class HMSEncoder {
  static encodeHmsRoom(room: any) {
    const encodedObj = {
      id: room?.id,
      metaData: room?.metaData,
      name: room?.name,
      peers: HMSEncoder.encodeHmsPeers(room?.peers),
    };

    return new HMSRoom(encodedObj);
  }

  static encodeHmsPeers(peers: any) {
    const encodedPeers: HMSPeer[] = [];
    peers?.map((peer: any) => {
      encodedPeers.push(HMSEncoder.encodeHmsPeer(peer));
    });

    return encodedPeers;
  }

  static encodeHmsPeer(peer: any) {
    const encodedObj = {
      peerID: peer?.peerID,
      name: peer?.name,
      isLocal: peer?.isLocal,
      customerUserID: peer?.customerUserID,
      customerDescription: peer?.customerDescription,
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer?.audioTrack),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer?.videoTrack),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer?.auxiliaryTracks
      ),
    };

    return new HMSPeer(encodedObj);
  }

  static encodeHmsAudioTrack(track: any) {
    const encodedObj = {
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
    };

    return new HMSAudioTrack(encodedObj);
  }

  static encodeHmsVideoTrack(track: any) {
    const encodedObj = {
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
    };

    return new HMSVideoTrack(encodedObj);
  }

  static encodeHmsAuxiliaryTracks(tracks: any) {
    const auxiliaryTracks: HMSTrack[] = [];
    tracks?.map((track: any) => {
      auxiliaryTracks.push(HMSEncoder.encodeHmsTrack(track));
    });
    return auxiliaryTracks;
  }

  static encodeHmsTrack(track: any) {
    const encodedObj = {
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
    };

    return new HMSTrack(encodedObj);
  }

  static encodeHmsLocalPeer(peer: any) {
    const encodedObj = {
      peerID: peer.peerID,
      name: peer.name,
      isLocal: peer.isLocal,
      customerUserID: peer.customerUserID,
      customerDescription: peer.customerDescription,
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer.audioTrack),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer.videoTrack),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer.auxiliaryTracks
      ),
      localAudioTrackData: {
        trackId: peer?.localAudioTrackData?.trackId,
        source: peer?.localAudioTrackData?.source,
        trackDescription: peer?.localAudioTrackData?.trackDescription,
        settings: HMSEncoder.encodeHmsAudioTrackSettings(
          peer?.localAudioTrackData?.settings
        ),
      },
      localVideoTrackData: {
        trackId: peer?.localVideoTrackData?.trackId,
        source: peer?.localVideoTrackData?.source,
        trackDescription: peer?.localVideoTrackData?.trackDescription,
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
    };

    return new HMSAudioTrackSettings(encodedObj);
  }

  static encodeHmsVideoTrackSettings(settings: any) {
    const encodedObj = {
      codec: settings?.codec,
      resolution: settings?.resolution,
      maxBitrate: settings?.maxBitrate,
      maxFrameRate: settings?.maxFrameRate,
      cameraFacing: settings?.cameraFacing,
      trackDescription: settings?.trackDescription,
    };

    return new HMSVideoTrackSettings(encodedObj);
  }

  static encodeHmsRemotePeers(peers: any) {
    const hmsPeers: any[] = [];

    peers.map((peer: any) => {
      const encodedPeer = HMSEncoder.encodeHmsRemotePeer(peer);

      hmsPeers.push(encodedPeer);
    });

    return hmsPeers;
  }

  static encodeHmsRemotePeer(peer: any) {
    const encodedObj = {
      peerID: peer.peerID,
      name: peer.name,
      isLocal: peer.isLocal,
      customerUserID: peer.customerUserID,
      customerDescription: peer.customerDescription,
      audioTrack: HMSEncoder.encodeHmsAudioTrack(peer.audioTrack),
      videoTrack: HMSEncoder.encodeHmsVideoTrack(peer.videoTrack),
      auxiliaryTracks: HMSEncoder.encodeHmsAuxiliaryTracks(
        peer.auxiliaryTracks
      ),
      remoteAudioTrackData: {
        trackId: peer?.remoteAudioTrackData?.trackId,
        source: peer?.remoteAudioTrackData?.source,
        trackDescription: peer?.remoteAudioTrackData?.trackDescription,
      },
      remoteVideoTrackData: {
        trackId: peer?.remoteVideoTrackData?.trackId,
        source: peer?.remoteVideoTrackData?.source,
        trackDescription: peer?.remoteVideoTrackData?.trackDescription,
        layer: peer?.remoteVideoTrackData?.layer,
      },
    };

    return new HMSRemotePeer(encodedObj);
  }
}
