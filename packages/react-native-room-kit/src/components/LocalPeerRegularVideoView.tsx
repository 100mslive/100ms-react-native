import * as React from 'react';
import { useSelector } from 'react-redux';

import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { PeerVideoTileViewProps } from './PeerVideoTile/PeerVideoTileView';
import type { RootState } from '../redux';
import { HMSNotifications } from './HMSNotifications';
import { useAllowedPublish } from '../hooks-util';

export interface LocalPeerRegularVideoViewProps
  extends Omit<PeerVideoTileViewProps, 'peerTrackNode'> {}

export const LocalPeerRegularVideoView: React.FC<
  LocalPeerRegularVideoViewProps
> = ({ onMoreOptionsPress }) => {
  const localPeerTrackNode = useSelector(
    (state: RootState) => state.app.localPeerTrackNode
  );
  const hasPublishPermissions = useSelector(
    (state: RootState) => {
      return state.app.localPeerTrackNode?.peer && useAllowedPublish(state.app.localPeerTrackNode?.peer);
    }
  );

  if (!localPeerTrackNode) {
    return null;
  }

  if (!hasPublishPermissions) {
    return null;
  }

  return (
    <>
      <PeerVideoTileView
        peerTrackNode={localPeerTrackNode}
        onMoreOptionsPress={onMoreOptionsPress}
      />

      <HMSNotifications />
    </>
  );
};
