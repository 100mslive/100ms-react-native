/**
 * options for creating `HMSPeerListIterator` instance
 *
 * ```
 * const peerListIterator =  hmsInstance.getPeerListIterator({
 *   limit: 10,
 *   byRoleName: 'viewer-realtime',
 * });
 * ```
 */
export interface HMSPeerListIteratorOptions {
  /**
   * filter by role of the peers
   */
  byRoleName?: string;

  /**
   * `peerID`s of the peers you want to fetch with iterator.
   */
  byPeerIds?: string[];

  /**
   * number of peers fetched by the iterator in `next` method call. Default value is `10`
   */
  limit?: number;
}
