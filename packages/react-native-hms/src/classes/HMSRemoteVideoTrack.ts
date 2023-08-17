import { NativeModules } from 'react-native';
import { getLogger } from './HMSLogger';
import { HMSVideoTrack } from './HMSVideoTrack';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSLayer } from './HMSLayer';
import type { HMSSimulcastLayerDefinition } from './HMSSimulcastLayerDefinition';
import { HMSEncoder } from './HMSEncoder';
import type { HMSTrackSource } from './HMSTrackSource'

const {
  /**
   * @ignore
   */
  HMSManager,
} = NativeModules;

export class HMSRemoteVideoTrack extends HMSVideoTrack {
  /**
   * Switches Video of remote user on/off depending upon the value of playbackAllowed
   *
   * @param {boolean} playbackAllowed
   * @memberof HMSRemoteVideoTrack
   */
  setPlaybackAllowed(playbackAllowed: boolean) {
    const logger = getLogger();
    logger?.verbose('#Function setPlaybackAllowed', {
      trackId: this.trackId,
      id: this.id,
      source: this.source,
      type: this.type,
      playbackAllowed,
    });
    HMSManager.setPlaybackAllowed({
      id: this.id,
      trackId: this.trackId,
      playbackAllowed,
    });
  }

  isPlaybackAllowed = async () => {
    try {
      const logger = getLogger();
      logger?.verbose('#Function isPlaybackAllowed', {
        trackId: this.trackId,
        id: this.id,
        source: this.source,
        type: this.type,
      });
      const val = await HMSManager.isPlaybackAllowed({
        id: this.id,
        trackId: this.trackId,
      });
      return val;
    } catch (e) {
      return true;
    }
  };

  async getLayer() {
    const logger = getLogger();
    logger?.verbose('#Function getLayer', {
      id: this.id,
      trackId: this.trackId,
    });

    const layer: HMSLayer = await HMSManager.getVideoTrackLayer({
      id: this.id,
      trackId: this.trackId,
    });

    return layer;
  }

  async getLayerDefinition() {
    const logger = getLogger();
    logger?.verbose('#Function getLayerDefinition', {
      id: this.id,
      trackId: this.trackId,
    });

    const layerDefinition: HMSSimulcastLayerDefinition[] =
      await HMSManager.getVideoTrackLayerDefinition({
        id: this.id,
        trackId: this.trackId,
      });

    return HMSEncoder.encodeHMSSimulcastLayerDefinition(layerDefinition);
  }

  async setLayer(layer: HMSLayer) {
    const logger = getLogger();
    logger?.verbose('#Function setVideoTrackLayer', {
      id: this.id,
      trackId: this.trackId,
      layer,
    });

    const success = await HMSManager.setVideoTrackLayer({
      id: this.id,
      trackId: this.trackId,
      layer,
    });

    return success;
  }

  constructor(params: {
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    playbackAllowed?: boolean;
    id: string;
    isDegraded?: boolean;
    type?: HMSTrackType;
  }) {
    super(params);
  }
}
