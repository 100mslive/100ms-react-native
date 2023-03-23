import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import { getHmsPeersCache, getPeerPropertyFromNative } from './HMSPeersCache';
import { HMSConstants } from './HMSConstants';

// let totalTimeFromNativeSide = 0;
// let totalTimeFromCache = 0;

export class HMSPeer {
  peerID: string;
  /**
   * @deprecated customerDescription has been deprecated in favor of metadata
   */
  customerDescription?: string;

  constructor(params: {
    peerID: string;
    customerDescription?: string;
  }) {
    this.peerID = params.peerID;
    this.customerDescription = params.customerDescription;
  }

  get name(): string {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "name") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "name");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`Getting "name" of ${data} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get isLocal(): boolean | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "isLocal") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "isLocal");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`Getting "isLocal" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get networkQuality(): HMSNetworkQuality| undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "networkQuality") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "networkQuality");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`Getting "networkQuality" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get customerUserID(): string | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "customerUserID") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "customerUserID");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`Getting "customerUserID" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get metadata(): string | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "metadata") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "metadata");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`getting "metadata" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get role(): HMSRole | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "role") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "role");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`getting "role" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get audioTrack(): HMSAudioTrack | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "audioTrack") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "audioTrack");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`getting "audioTrack" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get videoTrack(): HMSVideoTrack | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "videoTrack") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "videoTrack");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }
    // console.log(`getting "videoTrack" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }

  get auxiliaryTracks(): HMSTrack[] | undefined {
    // const startTimestamp = Date.now();

    const hmsPeersCache = getHmsPeersCache();

    let data = undefined;
    // let fromCache = false;

    if (hmsPeersCache) {
      const _data = hmsPeersCache.getProperty(this.peerID, "auxiliaryTracks") || [undefined, false];
      data = _data[0];
      // fromCache = _data[1];
    } else {
      data = getPeerPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, this.peerID, "auxiliaryTracks");
    }
    // const endTimestamp = Date.now();

    // const timeElapsed = endTimestamp - startTimestamp;

    // if (fromCache) {
    //   totalTimeFromCache += timeElapsed
    // } else {
    //   totalTimeFromNativeSide += timeElapsed
    // }

    // console.log(`getting "auxiliaryTracks" of ${this.name} took ${timeElapsed} millis from ${fromCache ? 'cache' : 'native side'}`);
    // console.log(`Total time taken for getting data from ${fromCache ? 'cache' : 'native side'} = ${fromCache ? totalTimeFromCache : totalTimeFromNativeSide}`);

    return data;
  }
}
