import type { RootState } from './redux';

export const selectAllowedTracksToPublish = (state: RootState) =>
  state.hmsStates.localPeer?.role?.publishSettings?.allowed;

export const selectCanPublishTrack = (
  state: RootState,
  track: 'audio' | 'video' | 'screen'
) => selectAllowedTracksToPublish(state)?.includes(track) ?? false;
