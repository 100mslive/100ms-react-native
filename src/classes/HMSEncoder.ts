import HMSTrack from './HMSTrack';
import HMSAudioTrack from './HMSAudioTrack';
import HMSVideoTrack from './HMSVideoTrack';
import HMSRoom from './HMSRoom';
import HMSPeer from './HMSPeer';

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
}
