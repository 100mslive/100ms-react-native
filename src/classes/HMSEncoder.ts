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
import { HMSRTCStats } from './HMSRTCStats';
import { HMSRTCStatsReport } from './HMSRTCStatsReport';
import { HMSRemoteAudioTrack } from './HMSRemoteAudioTrack';
import { HMSRemoteVideoTrack } from './HMSRemoteVideoTrack';
import { HMSSpeaker } from './HMSSpeaker';
import { HMSHLSRecordingState } from './HMSHLSRecordingState';
import { HMSNetworkQuality } from './HMSNetworkQuality';
import { HMSBrowserRecordingState } from './HMSBrowserRecordingState';
import { HMSHLSStreamingState } from './HMSHLSStreamingState';
import { HMSHLSVariant } from './HMSHLSVariant';
import { HMSRtmpStreamingState } from './HMSRtmpStreamingState';
import { HMSServerRecordingState } from './HMSServerRecordingState';
import { HMSMessage } from './HMSMessage';
import { HMSMessageRecipient } from './HMSMessageRecipient';

export class HMSEncoder {
  static encodeHmsRoom(room: HMSRoom, id: string) {
    const encodedObj = {
      id: room?.id,
      sessionId: room?.sessionId,
      metaData: room?.metaData,
      name: room?.name,
      peerCount: room?.peerCount,
      peers: HMSEncoder.encodeHmsPeers(room?.peers, id),
      browserRecordingState: HMSEncoder.encodeBrowserRecordingState(
        room?.browserRecordingState
      ),
      rtmpHMSRtmpStreamingState: HMSEncoder.encodeRTMPStreamingState(
        room?.rtmpHMSRtmpStreamingState
      ),
      serverRecordingState: HMSEncoder.encodeServerRecordingState(
        room?.serverRecordingState
      ),
      hlsStreamingState: HMSEncoder.encodeHLSStreamingState(
        room?.hlsStreamingState
      ),
      hlsRecordingState: HMSEncoder.encodeHLSRecordingState(
        room?.hlsRecordingState
      ),
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
      customerUserID: peer?.customerUserID,
      customerDescription: peer?.customerDescription,
      metadata: peer?.metadata,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      networkQuality: HMSEncoder.encodeHMSNetworkQuality(peer?.networkQuality),
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
      metadata: peer.metadata,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      networkQuality: HMSEncoder.encodeHMSNetworkQuality(peer?.networkQuality),
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
        type: peer?.localAudioTrackData?.type,
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
        type: peer?.localVideoTrackData?.type,
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

  static encodeHmsLocalAudioTrack(track: any, id: string) {
    const encodedObj = {
      id: id,
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      settings: HMSEncoder.encodeHmsAudioTrackSettings(track?.settings),
      type: track?.type,
    };

    return new HMSLocalAudioTrack(encodedObj);
  }

  static encodeHmsLocalVideoTrack(track: any, id: string) {
    const encodedObj = {
      id: id,
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      settings: HMSEncoder.encodeHmsVideoTrackSettings(track?.settings),
      type: track?.type,
    };

    return new HMSLocalVideoTrack(encodedObj);
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
      metadata: peer.metadata,
      role: HMSEncoder.encodeHmsRole(peer?.role),
      networkQuality: HMSEncoder.encodeHMSNetworkQuality(peer?.networkQuality),
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

  static encodeHmsRemoteAudioTrack(track: any, id: string) {
    const encodedObj = {
      id: id,
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      isMute: track?.isMute,
      playbackAllowed: track?.playbackAllowed,
    };

    return new HMSRemoteAudioTrack(encodedObj);
  }

  static encodeHmsRemoteVideoTrack(track: any, id: string) {
    const encodedObj = {
      id: id,
      trackId: track?.trackId,
      source: track?.source,
      trackDescription: track?.trackDescription,
      layer: track?.layer,
      isMute: track?.isMute,
      playbackAllowed: track?.playbackAllowed,
    };

    return new HMSRemoteVideoTrack(encodedObj);
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
      mute: data.mute,
    };

    return new HMSChangeTrackStateRequest(encodedChangeTrackStateRequest);
  }

  static encodeRTCStats(data: any) {
    let video = this.encodeRTCStatsUnit(data?.video);
    let audio = this.encodeRTCStatsUnit(data?.audio);
    let combined = this.encodeRTCStatsUnit(data?.combined);

    return new HMSRTCStatsReport({ video, audio, combined });
  }

  static encodeRTCStatsUnit(data: any) {
    return new HMSRTCStats({
      bitrateReceived: data?.bitrateReceived,
      bitrateSent: data?.bitrateSent,
      bytesReceived: data?.bytesReceived,
      bytesSent: data?.bytesSent,
      packetsLost: data?.packetsLost,
      packetsReceived: data?.packetsReceived,
      roundTripTime: data?.roundTripTime,
    });
  }

  static encodeHmsSpeakers(data: any, id: string) {
    let encodedSpeakers: Array<HMSSpeaker> = [];

    data?.map((item: any) => {
      encodedSpeakers.push(HMSEncoder.encodeHmsSpeaker(item, id));
    });

    return encodedSpeakers;
  }

  static encodeHmsSpeaker(data: any, id: string) {
    return new HMSSpeaker({
      level: data?.level,
      peer: HMSEncoder.encodeHmsPeer(data?.peer, id),
      track: HMSEncoder.encodeHmsTrack(data?.track, id),
    });
  }

  static encodeBrowserRecordingState(data: any) {
    return new HMSBrowserRecordingState({
      running: data?.running,
      startedAt: new Date(parseInt(data?.startedAt)),
      stoppedAt: new Date(parseInt(data?.stoppedAt)),
      error: data?.error,
    });
  }

  static encodeServerRecordingState(data: any) {
    return new HMSServerRecordingState({
      running: data?.running,
      error: data?.error,
      startedAt: new Date(parseInt(data?.startedAt)),
    });
  }

  static encodeRTMPStreamingState(data: any) {
    return new HMSRtmpStreamingState({
      running: data?.running,
      startedAt: new Date(parseInt(data?.startedAt)),
      stoppedAt: new Date(parseInt(data?.stoppedAt)),
      error: data?.error,
    });
  }

  static encodeHLSStreamingState(data: any) {
    return new HMSHLSStreamingState({
      running: data?.running,
      variants: this.encodeHLSVariants(data?.variants),
    });
  }

  static encodeHLSRecordingState(data: any) {
    if (data) {
      return new HMSHLSRecordingState({
        running: data?.running,
        startedAt: new Date(parseInt(data?.startedAt)),
        singleFilePerLayer: data?.singleFilePerLayer,
        videoOnDemand: data?.videoOnDemand,
      });
    } else {
      return undefined;
    }
  }

  static encodeHLSVariants(data: any) {
    let variants: HMSHLSVariant[] = [];

    data?.map((item: any) => {
      let variant = new HMSHLSVariant({
        hlsStreamUrl: item.hlsStreamUrl,
        meetingUrl: item.meetingUrl,
        metadata: item?.metadata,
        startedAt: new Date(parseInt(item?.startedAt)),
      });
      variants.push(variant);
    });

    return variants;
  }

  static encodeHMSNetworkQuality(data: any) {
    if (data) {
      return new HMSNetworkQuality({
        downlinkQuality: data?.downlinkQuality,
      });
    } else {
      return undefined;
    }
  }

  static encodeHMSMessage(data: any, id: string) {
    if (data) {
      return new HMSMessage({
        message: data?.message,
        type: data?.type,
        time: new Date(parseInt(data?.time)),
        sender: this.encodeHmsPeer(data?.sender, id),
        recipient: this.encodeHMSMessageRecipient(data?.recipient, id),
      });
    } else {
      return undefined;
    }
  }

  static encodeHMSMessageRecipient(data: any, id: string) {
    return new HMSMessageRecipient({
      recipientType: data?.recipientType,
      recipientPeer: this.encodeHmsPeer(data?.recipientPeer, id),
      recipientRoles: this.encodeHmsRoles(data?.recipientRoles),
    });
  }
}
