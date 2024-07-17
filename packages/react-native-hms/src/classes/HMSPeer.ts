import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import { getHmsPeersCache, getPeerPropertyFromNative } from './HMSPeersCache';
import { HMSConstants } from './HMSConstants';
import { HMSPeerType } from './HMSPeerType';

/**
 * Represents a peer in the HMS ecosystem.
 *
 * This class encapsulates the properties and state of a peer within a session, including their ID, name, role, and various status flags.
 *
 * @export
 * @class HMSPeer
 * @property {string} peerID - The unique identifier for the peer.
 * @property {string | undefined} _name - The name of the peer. Private access.
 * @property {boolean | undefined} _isLocal - Flag indicating whether the peer is the local user. Private access.
 * @property {string | undefined} _customerUserID - An optional custom user ID set by the application. Private access.
 * @property {string | undefined} _metadata - Optional metadata associated with the peer. Private access.
 * @property {HMSRole | undefined} _role - The role assigned to the peer within the session. Private access.
 * @property {boolean} _isHandRaised - Flag indicating whether the peer has raised their hand. Defaults to false. Private access.
 * @property {HMSPeerType} _type - The type of the peer, e.g., regular, screen share. Defaults to `HMSPeerType.REGULAR`. Private access.
 */
export class HMSPeer {
  peerID: string;
  private _name: string | undefined;
  private _isLocal: boolean | undefined;
  private _customerUserID: string | undefined;
  private _metadata: string | undefined;
  private _role: HMSRole | undefined;
  private _isHandRaised: boolean = false;
  private _type: HMSPeerType = HMSPeerType.REGULAR;

  private _updateName(value: string) {
    // If `_isLocal` is outdated, update it
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

  private _updateIsHandRaised(value: boolean) {
    // If `_isHandRaised` is outdated, update it
    if (this._isHandRaised !== value) {
      this._isHandRaised = value;
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

  private _updateType(value: HMSPeerType) {
    // If `_type` is outdated, update it
    if (this._type !== value) {
      this._type = value;
    }
  }

  constructor(params: { peerID: string; name: string }) {
    this.peerID = params.peerID;
    this._name = params.name;
  }

  /**
   * Gets the name of the peer.
   *
   * This getter method retrieves the name of the peer. If the name has already been set locally, it returns that value.
   * Otherwise, it attempts to retrieve the name from the HMS peers cache. If the cache does not contain the name,
   * it falls back to fetching the name directly from the native layer using the peer's ID.
   * Once a value is retrieved, it updates the local `_name` property to ensure consistency.
   *
   * @returns {string | undefined} The name of the peer if available, otherwise `undefined`.
   */
  get name(): string | undefined {
    if (this._name) {
      return this._name;
    }
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'name')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'name'
        );

    if (typeof value === 'string') {
      this._updateName(value);
    }
    return value ?? this._name;
  }

  /**
   * Determines if the peer is the local user.
   *
   * This getter method checks if the peer is the local user by first attempting to retrieve the 'isLocal' property value from the HMS peers cache.
   * If the value is not found in the cache, it falls back to fetching the property directly from the native layer using the peer's ID.
   * Once a value is retrieved, it updates the local `_isLocal` property to ensure the value is current.
   *
   * @returns {boolean | undefined} True if the peer is the local user, false otherwise. Returns `undefined` if the information is not available.
   */
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

  /**
   * Checks if the peer has raised their hand.
   *
   * This getter method determines whether the peer has their hand raised in the session. It first attempts to retrieve the 'isHandRaised' property value
   * from the HMS peers cache. If the value is not found in the cache, it falls back to fetching the property directly from the native layer using the peer's ID.
   * Once a value is retrieved, it updates the local `_isHandRaised` property to ensure the value is current and consistent.
   *
   * @returns {boolean} True if the peer has their hand raised, false otherwise. Defaults to false if the information is not available.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/large-room
   *
   */
  get isHandRaised(): boolean {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'isHandRaised')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'isHandRaised'
        );

    if (typeof value === 'boolean') {
      this._updateIsHandRaised(value);
    }
    return value ?? this._isHandRaised;
  }

  /**
   * Retrieves the network quality of the peer.
   *
   * This getter method attempts to obtain the network quality of the peer, which is an indicator of the current network conditions affecting the peer's connection.
   * It first tries to get this information from the HMS peers cache. If the information is not available in the cache,
   * it falls back to fetching the network quality directly from the native layer using the peer's ID.
   * The network quality is represented by the `HMSNetworkQuality` type, which may include values such as 'good', 'poor', etc., depending on the implementation.
   *
   * @returns {HMSNetworkQuality | undefined} The network quality of the peer if available, otherwise `undefined`.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/network-quality
   */
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

  /**
   * Retrieves the custom user ID of the peer.
   *
   * This getter method attempts to obtain the custom user ID of the peer, which is an optional identifier that can be set by the application.
   * It first tries to get this information from the HMS peers cache. If the information is not available in the cache,
   * it falls back to fetching the custom user ID directly from the native layer using the peer's ID.
   * Once a value is retrieved, it updates the local `_customerUserID` property to ensure the value is current and consistent.
   *
   * @returns {string | undefined} The custom user ID of the peer if available, otherwise `undefined`.
   */
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

  /**
   * Retrieves the metadata associated with the peer.
   *
   * This getter method attempts to obtain the metadata of the peer, which can include any additional information set by the application.
   * It first tries to get this information from the HMS peers cache. If the information is not available in the cache,
   * it falls back to fetching the metadata directly from the native layer using the peer's ID.
   * Once a value is retrieved, it updates the local `_metadata` property to ensure the value is current and consistent.
   *
   * @returns {string | undefined} The metadata of the peer if available, otherwise `undefined`.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-metadata
   */
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

  /**
   * Retrieves the role of the peer.
   *
   * This getter method attempts to obtain the role assigned to the peer within the session. The role can define permissions and capabilities
   * within the session context. It first tries to get this information from the HMS peers cache. If the role information is not available in the cache,
   * it falls back to fetching the role directly from the native layer using the peer's ID. Once a value is retrieved, it updates the local `_role`
   * property to ensure the value is current and consistent.
   *
   * @returns {HMSRole | undefined} The role of the peer if available, otherwise `undefined`.
   *
   * @see https://www.100ms.live/docs/get-started/v2/get-started/concepts/templates-and-roles
   */
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

  /**
   * Retrieves the audio track associated with the peer.
   *
   * This getter method attempts to obtain the audio track of the peer. It first tries to get this information from the HMS peers cache.
   * If the audio track information is not available in the cache, it falls back to fetching the audio track directly from the native layer using the peer's ID.
   * This allows for real-time access to the peer's audio track, which can be used for various audio-related functionalities within the application.
   *
   * @returns {HMSAudioTrack | undefined} The audio track of the peer if available, otherwise `undefined`.
   */
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

  /**
   * Retrieves the video track associated with the peer.
   *
   * This getter method attempts to obtain the video track of the peer. It first tries to get this information from the HMS peers cache.
   * If the video track information is not available in the cache, it falls back to fetching the video track directly from the native layer using the peer's ID.
   * This allows for real-time access to the peer's video track, which can be used for various video-related functionalities within the application.
   *
   * @returns {HMSVideoTrack | undefined} The video track of the peer if available, otherwise `undefined`.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/overview
   */
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

  /**
   * Retrieves the auxiliary tracks associated with the peer.
   *
   * This getter method attempts to obtain the auxiliary tracks of the peer, which can include tracks like screen shares or additional media streams.
   * It first tries to get this information from the HMS peers cache. If the auxiliary track information is not available in the cache,
   * it falls back to fetching the auxiliary tracks directly from the native layer using the peer's ID.
   * This allows for real-time access to the peer's auxiliary tracks, which can be used for various functionalities within the application,
   * such as displaying a screen share or additional video feeds.
   *
   * @returns {HMSTrack[] | undefined} The auxiliary tracks of the peer if available, otherwise `undefined`.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/screenshare
   */
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

  /**
   * Retrieves the type of the peer.
   *
   * This getter method attempts to obtain the type of the peer, which can indicate whether the peer is a regular participant,
   * a screen share, or another type defined within the `HMSPeerType` enum. It first tries to get this information from the HMS peers cache.
   * If the type information is not available in the cache, it falls back to fetching the type directly from the native layer using the peer's ID.
   * This ensures that the application has real-time access to the peer's type, which can be crucial for handling different peer types differently,
   * such as displaying a screen share in a distinct manner. Once a value is retrieved, it updates the local `_type` property to ensure the value is current.
   *
   * @returns {HMSPeerType} The type of the peer, defaulting to the value stored in `_type` if the information is not available.
   *
   * @see https://www.100ms.live/docs/server-side/v2/how-to-guides/Session%20Initiation%20Protocol%20(SIP)/SIP-Interconnect
   */
  get type(): HMSPeerType {
    const hmsPeersCache = getHmsPeersCache();

    const value = hmsPeersCache
      ? hmsPeersCache.getProperty(this.peerID, 'type')
      : getPeerPropertyFromNative(
          HMSConstants.DEFAULT_SDK_ID,
          this.peerID,
          'type'
        );

    if (value) {
      this._updateType(value);
    }
    return value ?? this._type;
  }
}
