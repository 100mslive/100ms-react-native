import { NativeModules } from 'react-native';

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
import { HMSException } from './HMSException';
import { HMSConstants } from './HMSConstants';
import { HMSPeerUpdateOrdinals } from './HMSPeerUpdate';
import { HMSLocalAudioStats } from './HMSLocalAudioStats';
import { HMSLocalVideoStats } from './HMSLocalVideoStats';
import { HMSRemoteAudioStats } from './HMSRemoteAudioStats';
import { HMSRemoteVideoStats } from './HMSRemoteVideoStats';
import { HMSLayer } from './HMSLayer';
import { HMSSimulcastLayerDefinition } from './HMSSimulcastLayerDefinition';
import { HMSQualityLimitationReasons } from './HMSQualityLimitationReasons';

const { HMSManager } = NativeModules;

interface InitialData {
  roles: Record<string, HMSRole>;
}

export class HMSEncoder {
  private static data: InitialData = { roles: {} };

  static clearData() {
    this.data = { roles: {} };
  }

  static encodeHmsRoom(room: any, id: string) {
    const encodedObj = {
      id: room?.id,
      sessionId: room?.sessionId || undefined,
      metaData: room?.metaData,
      name: room?.name,
      peerCount: room?.peerCount,
      peers: HMSEncoder.encodeHmsPeers(room?.peers),
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
      localPeer: HMSEncoder.encodeHmsLocalPeer(room?.localPeer, id),
      // startedAt: HMSEncoder.encodeDate(room?.startedAt),
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
    };

    return new HMSPeer(encodedObj);
  }

  static encodeHmsPeerUpdate(hmsPeerUpdateOrdinal: string) {
    return HMSPeerUpdateOrdinals.get(hmsPeerUpdateOrdinal);
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
      peerID: peer?.peerID,
      localAudioTrackData: peer?.localAudioTrackData?.trackId
        ? {
            id: id,
            trackId: peer?.localAudioTrackData?.trackId,
            source: peer?.localAudioTrackData?.source,
            trackDescription: peer?.localAudioTrackData?.trackDescription,
            isMute: peer?.localAudioTrackData?.isMute,
            settings: peer?.localAudioTrackData?.settings
              ? HMSEncoder.encodeHmsAudioTrackSettings(
                  peer?.localAudioTrackData?.settings
                )
              : undefined,
            type: peer?.localAudioTrackData?.type,
          }
        : undefined,
      localVideoTrackData: peer?.localVideoTrackData?.trackId
        ? {
            id: id,
            trackId: peer?.localVideoTrackData?.trackId,
            source: peer?.localVideoTrackData?.source,
            trackDescription: peer?.localVideoTrackData?.trackDescription,
            isMute: peer?.localVideoTrackData?.isMute,
            settings: peer?.localVideoTrackData?.settings
              ? HMSEncoder.encodeHmsVideoTrackSettings(
                  peer?.localVideoTrackData?.settings
                )
              : undefined,
            type: peer?.localVideoTrackData?.type,
          }
        : undefined,
    };

    return new HMSLocalPeer(encodedObj);
  }

  static encodeHmsAudioTrackSettings(settings: any) {
    const encodedObj = {
      useHardwareEchoCancellation: settings?.useHardwareAcousticEchoCanceler,
      initialState: settings?.initialState,
      audioMode: settings?.audioMode,
    };

    return new HMSAudioTrackSettings(encodedObj);
  }

  static encodeHmsVideoTrackSettings(settings: any) {
    const encodedObj = {
      initialState: settings?.initialState,
      forceSoftwareDecoder: settings?.forceSoftwareDecoder,
      simulcastSettings: settings?.simulcastSettings,
      cameraFacing: settings?.cameraFacing,
      disableAutoResize: settings?.disableAutoResize,
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
      settings: track?.settings
        ? HMSEncoder.encodeHmsAudioTrackSettings(track?.settings)
        : undefined,
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
      settings: track?.settings
        ? HMSEncoder.encodeHmsVideoTrackSettings(track?.settings)
        : undefined,
      type: track?.type,
    };

    return new HMSLocalVideoTrack(encodedObj);
  }

  static encodeHmsRemotePeers(peers: any, id: string) {
    const hmsPeers: HMSRemotePeer[] = [];

    peers.map((peer: any) => {
      const encodedPeer = HMSEncoder.encodeHmsRemotePeer(peer, id);

      hmsPeers.push(encodedPeer);
    });

    return hmsPeers;
  }

  static encodeHmsRemotePeer(peer: any, id: string) {
    const encodedObj = {
      peerID: peer?.peerID,
      remoteAudioTrackData: peer?.remoteAudioTrackData?.trackId
        ? {
            id: id,
            trackId: peer?.remoteAudioTrackData?.trackId,
            source: peer?.remoteAudioTrackData?.source,
            trackDescription: peer?.remoteAudioTrackData?.trackDescription,
            isMute: peer?.remoteAudioTrackData?.isMute,
            playbackAllowed: peer?.remoteAudioTrackData?.playbackAllowed,
          }
        : undefined,
      remoteVideoTrackData: peer?.remoteVideoTrackData?.trackId
        ? {
            id: id,
            trackId: peer?.remoteVideoTrackData?.trackId,
            source: peer?.remoteVideoTrackData?.source,
            trackDescription: peer?.remoteVideoTrackData?.trackDescription,
            isMute: peer?.remoteVideoTrackData?.isMute,
            playbackAllowed: peer?.remoteVideoTrackData?.playbackAllowed,
          }
        : undefined,
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
      isMute: track?.isMute,
      playbackAllowed: track?.playbackAllowed,
    };

    return new HMSRemoteVideoTrack(encodedObj);
  }

  static encodeHmsPreviewTracks(previewTracks: any[], id: string) {
    return previewTracks?.map((track) => {
      return this.encodeHmsTrack(track, id);
    });
  }

  static encodeHmsRoles(roles: any[]) {
    const encodedRoles: HMSRole[] = [];

    roles?.map((item: any) => {
      encodedRoles.push(HMSEncoder.encodeHmsRole(item));
    });

    return encodedRoles;
  }

  static encodeHmsRole(role: any) {
    if (!role) {
      return new HMSRole(role);
    }

    const rolesCache = this.data.roles;

    const cachedRole = rolesCache[role.name];

    // create new HMSRole instance, if cached role does not exist OR `role.publishSettings?.allowed` does not exist
    if (!cachedRole || !cachedRole.publishSettings?.allowed) {
      // Creating HMSRole object with data
      const hmsRole = new HMSRole(role);

      // saving the created HMSRole object into cache
      rolesCache[role.name] = hmsRole;

      // If the created HMSRole object is complete,
      // sending notification to Native Side to stop sending data for this role
      if (hmsRole.publishSettings?.allowed) {
        HMSManager.restrictData({
          id: HMSConstants.DEFAULT_SDK_ID,
          roleName: hmsRole.name,
        });
      }
    }

    return rolesCache[role.name];
  }

  static encodeHmsRoleChangeRequest(data: any) {
    const encodedRoleChangeRequest = {
      requestedBy: data.requestedBy
        ? HMSEncoder.encodeHmsPeer(data.requestedBy)
        : undefined,
      suggestedRole: HMSEncoder.encodeHmsRole(data.suggestedRole),
    };

    return new HMSRoleChangeRequest(encodedRoleChangeRequest);
  }

  static encodeHmsChangeTrackStateRequest(data: HMSChangeTrackStateRequest) {
    const encodedChangeTrackStateRequest = {
      requestedBy: data?.requestedBy
        ? HMSEncoder.encodeHmsPeer(data?.requestedBy)
        : undefined,
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
    const [
      bitrateReceived,
      bitrateSent,
      bytesReceived,
      bytesSent,
      packetsLost,
      packetsReceived,
      roundTripTime,
    ] = data;

    return new HMSRTCStats({
      bitrateReceived,
      bitrateSent,
      bytesReceived,
      bytesSent,
      packetsLost,
      packetsReceived,
      roundTripTime,
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
      peer: HMSEncoder.encodeHmsPeer(data?.peer),
      track: HMSEncoder.encodeHmsTrack(data?.track, id),
    });
  }

  static encodeBrowserRecordingState(data: any) {
    return new HMSBrowserRecordingState({
      running: data?.running || false,
      startedAt: HMSEncoder.encodeDate(data?.startedAt),
      stoppedAt: HMSEncoder.encodeDate(data?.stoppedAt),
      error: data?.error || undefined,
    });
  }

  static encodeServerRecordingState(data: any) {
    return new HMSServerRecordingState({
      running: data?.running || false,
      error: data?.error || undefined,
      startedAt: HMSEncoder.encodeDate(data?.startedAt),
    });
  }

  static encodeRTMPStreamingState(data: any) {
    return new HMSRtmpStreamingState({
      running: data?.running || false,
      startedAt: HMSEncoder.encodeDate(data?.startedAt),
      stoppedAt: HMSEncoder.encodeDate(data?.stoppedAt),
      error: data?.error || undefined,
    });
  }

  static encodeDate(dateData: any) {
    if (!dateData) {
      return undefined;
    }
    const dateNum = parseInt(dateData);
    if (isNaN(dateNum)) {
      return undefined;
    }
    return new Date(dateNum);
  }

  static encodeHLSStreamingState(data: any) {
    return new HMSHLSStreamingState({
      running: data?.running || false,
      variants: Array.isArray(data?.variants)
        ? this.encodeHLSVariants(data?.variants)
        : undefined,
    });
  }

  static encodeHLSRecordingState(data: any) {
    if (data) {
      return new HMSHLSRecordingState({
        running: data?.running || false,
        startedAt: HMSEncoder.encodeDate(data?.startedAt),
        singleFilePerLayer: data?.singleFilePerLayer || false,
        videoOnDemand: data?.videoOnDemand || false,
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
        metadata: item?.metaData ? item?.metadata : undefined,
        startedAt: HMSEncoder.encodeDate(item?.startedAt),
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

  static encodeHMSMessage(data: any) {
    if (data) {
      return new HMSMessage({
        message: data?.message,
        messageId: data?.messageId,
        type: data?.type,
        time: new Date(parseInt(data?.time)),
        sender: this.encodeHmsPeer(data?.sender),
        recipient: this.encodeHMSMessageRecipient(data?.recipient),
      });
    } else {
      return undefined;
    }
  }

  static encodeHMSMessageRecipient(data: any) {
    return new HMSMessageRecipient({
      recipientType: data?.recipientType,
      recipientPeer: data?.recipientPeer
        ? this.encodeHmsPeer(data.recipientPeer)
        : undefined,
      recipientRoles: Array.isArray(data?.recipientRoles)
        ? this.encodeHmsRoles(data.recipientRoles)
        : [],
    });
  }

  static encodeHMSException(data: any) {
    return new HMSException({
      code: data?.error?.code,
      description: data?.error?.description,
      message: data?.error?.message,
      name: data?.error?.name,
      action: data?.error?.action,
      isTerminal: data?.error?.isTerminal,
      canRetry: data?.error?.canRetry,
    });
  }

  static encodeHMSLocalAudioStats(data: any) {
    const [bitrate, bytesSent, roundTripTime] = data;

    return new HMSLocalAudioStats({
      bitrate: bitrate >= 0 ? bitrate : undefined,
      bytesSent: bytesSent ? bytesSent : undefined,
      roundTripTime: roundTripTime >= 0 ? roundTripTime : undefined,
    });
  }

  static encodeHMSLocalVideoStats(data: any[]) {
    return data.map((item: any) => {
      const [
        bitrate,
        bytesSent,
        roundTripTime,
        frameRate,
        resolution,
        layer,
        qualityLimitationReasons,
      ] = item;

      return new HMSLocalVideoStats({
        bitrate: bitrate >= 0 ? bitrate : undefined,
        bytesSent: bytesSent ? bytesSent : undefined,
        roundTripTime: roundTripTime >= 0 ? roundTripTime : undefined,
        frameRate: frameRate >= 0 ? frameRate : undefined,
        resolution: resolution
          ? { width: resolution[0], height: resolution[1] }
          : undefined, // resolution: [width, height]
        layer: layer ? layer : undefined,
        qualityLimitationReasons: qualityLimitationReasons
          ? this.encodeHMSQualityLimitationReasons(qualityLimitationReasons)
          : undefined,
      });
    });
  }

  static encodeHMSRemoteAudioStats(data: any) {
    const [bitrate, bytesReceived, jitter, packetsLost, packetsReceived] = data;

    return new HMSRemoteAudioStats({
      bitrate: bitrate >= 0 ? bitrate : undefined,
      bytesReceived: bytesReceived ? bytesReceived : undefined,
      jitter: jitter >= 0 ? jitter : undefined,
      packetsLost: packetsLost >= 0 ? packetsLost : undefined,
      packetsReceived: packetsReceived ? packetsReceived : undefined,
    });
  }

  static encodeHMSRemoteVideoStats(data: any) {
    const [
      bitrate,
      bytesReceived,
      frameRate,
      jitter,
      packetsLost,
      packetsReceived,
      resolution,
    ] = data;

    return new HMSRemoteVideoStats({
      bitrate: bitrate >= 0 ? bitrate : undefined,
      bytesReceived: bytesReceived ? bytesReceived : undefined,
      frameRate: frameRate >= 0 ? frameRate : undefined,
      jitter: jitter >= 0 ? jitter : undefined,
      packetsLost: packetsLost >= 0 ? packetsLost : undefined,
      packetsReceived: packetsReceived ? packetsReceived : undefined,
      resolution: resolution
        ? { width: resolution[0], height: resolution[1] }
        : undefined, // resolution: [width, height]
    });
  }

  static encodeHMSSimulcastLayerDefinition(data: any[]) {
    return data.map((sld) => {
      return new HMSSimulcastLayerDefinition({
        layer: HMSLayer[sld.layer as HMSLayer], // DOUBT: This can be invalid. Should we throw error?
        resolution: this.encodeHmsVideoResolution({
          width: sld.resolution[0],
          height: sld.resolution[1],
        }),
      });
    });
  }

  static encodeHMSQualityLimitationReasons(data: any) {
    return new HMSQualityLimitationReasons({
      reason: data.reason,
      bandwidth: data.bandwidth,
      cpu: data.cpu,
      none: data.none,
      other: data.other,
      qualityLimitationResolutionChanges:
        data.qualityLimitationResolutionChanges,
    });
  }

  static transformHMSHLSCueEventData<C extends object, T>(data: C): T {
    if ('startDate' in data) {
      data.startDate = this.encodeDate(data.startDate);
    }

    if ('endDate' in data && data.endDate) {
      data.endDate = this.encodeDate(data.endDate);
    }

    const transformed = data as unknown as T;

    return transformed;
  }
}
