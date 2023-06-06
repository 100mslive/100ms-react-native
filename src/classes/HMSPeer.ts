import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import { getHmsPeersCache, getPeerPropertyFromNative } from './HMSPeersCache';
import { HMSConstants } from './HMSConstants';

export class HMSPeer {
  peerID: string;
  private _name: string = '';
  private _isLocal: boolean | undefined;
  private _customerUserID: string | undefined;
  private _metadata: string | undefined;
  private _role: HMSRole | undefined;

  private _updateName(value: string) {
    // If `_name` is outdated, update it
    if (this._name !== value) {
      this._name = value;
    }
  }

  private _updateIsLocal(value: boolean) {
    // If `_isLocal` is outdated, update it
    if (this._isLocal !== value) {
      this._isLocal = value;
    }
  }

  private _updateCustomerUserID(value: string) {
    // If `_customerUserID` is outdated, update it
    if (this._customerUserID !== value) {
      this._customerUserID = value;
    }
  }

  private _updateMetadata(value: string) {
    // If `_metadata` is outdated, update it
    if (this._metadata !== value) {
      this._metadata = value;
    }
  }

  private _updateRole(value: HMSRole) {
    // If `_role` is outdated, update it
    if (this._role !== value) {
      this._role = value;
    }
  }

  constructor(params: { peerID: string }) {
    this.peerID = params.peerID;
  }

  get name(): string {
    const hmsPeersCache = getHmsPeersCache();

    const nameValue = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'name')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'name'
        );

    if (nameValue) {
      this._updateName(nameValue);
    }
    return nameValue ?? this._name;
  }

  get isLocal(): boolean | undefined {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'isLocal')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'isLocal'
        );

    if (typeof value === 'boolean') {
      this._updateIsLocal(value);
    }
    return value ?? this._isLocal;
  }

  get networkQuality(): HMSNetworkQuality | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'networkQuality');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'networkQuality'
    );
  }

  get customerUserID(): string | undefined {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'customerUserID')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'customerUserID'
        );

    if (value) {
      this._updateCustomerUserID(value);
    }
    return value ?? this._customerUserID;
  }

  get metadata(): string | undefined {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'metadata')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'metadata'
        );

    if (value) {
      this._updateMetadata(value);
    }
    return value ?? this._metadata;
  }

  get role(): HMSRole | undefined {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'role')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'role'
        );

    if (value) {
      this._updateRole(value);
    }
    return value ?? this._role;
  }

  get audioTrack(): HMSAudioTrack | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'audioTrack');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'audioTrack'
    );
  }

  get videoTrack(): HMSVideoTrack | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'videoTrack');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'videoTrack'
    );
  }

  get auxiliaryTracks(): HMSTrack[] | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'auxiliaryTracks');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'auxiliaryTracks'
    );
  }
}
