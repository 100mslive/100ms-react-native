import * as React from 'react';
import { useSelector } from 'react-redux';

import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { PeerVideoTileViewProps } from './PeerVideoTile/PeerVideoTileView';
import type { RootState } from '../redux';

export interface LocalPeerRegularVideoViewProps
  extends Omit<PeerVideoTileViewProps, 'peerTrackNode'> {}

export const LocalPeerRegularVideoView: React.FC<
  LocalPeerRegularVideoViewProps
> = ({ onMoreOptionsPress }) => {
  const localPeerTrackNode = useSelector(
    (state: RootState) => state.app.localPeerTrackNode
  );

  if (!localPeerTrackNode) {
    return null;
  }

  return (
    <PeerVideoTileView
      peerTrackNode={localPeerTrackNode}
      onMoreOptionsPress={onMoreOptionsPress}
    />
  );
};
