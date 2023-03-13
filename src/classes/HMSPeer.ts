import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import { getHmsPeersCache } from './HMSCache';

let totalTimeFromNativeSide = 0;
let totalTimeFromCache = 0;

export class HMSPeer {
  peerID: string;
  name: string;
  isLocal?: boolean;
  /**
   * @deprecated customerDescription has been deprecated in favor of metadata
   */
  customerDescription?: string;
  networkQuality?: HMSNetworkQuality;

  constructor(params: {
    peerID: string;
    name: string;
    isLocal?: boolean;
    customerDescription?: string;
    networkQuality?: HMSNetworkQuality;
  }) {
    this.peerID = params.peerID;
    this.name = params.name;
    this.isLocal = params.isLocal;
    this.customerDescription = params.customerDescription;
    this.networkQuality = params.networkQuality;
  }

  get customerUserID(): string | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "customerUserID") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }
    console.log(`Getting "customerUserID" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get metadata(): string | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "metadata") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }
    console.log(`getting "metadata" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get role(): HMSRole | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "role") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }
    console.log(`getting "role" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get audioTrack(): HMSAudioTrack | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "audioTrack") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }
    console.log(`getting "audioTrack" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get videoTrack(): HMSVideoTrack | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "videoTrack") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }
    console.log(`getting "videoTrack" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get auxiliaryTracks(): HMSTrack[] | undefined {
    const startTimestamp = Date.now();
    const [data, fromCache] = getHmsPeersCache()?.getProperty(this.peerID, "auxiliaryTracks") || [undefined, false];
    const endTimestamp = Date.now();

    const timeElapsed = endTimestamp - startTimestamp;

    if (fromCache) {
      totalTimeFromCache += timeElapsed
    } else {
      totalTimeFromNativeSide += timeElapsed
    }

    console.log(`getting "auxiliaryTracks" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }
}
