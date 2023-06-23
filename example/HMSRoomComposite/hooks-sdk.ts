import {useDispatch, useSelector, useStore} from 'react-redux';
import {RootState} from './redux';

import {
  setIsLocalAudioMutedState,
  setIsLocalVideoMutedState,
} from './redux/actions';
import {
  selectAllowedTracksToPublish,
  selectCanPublishTrack,
} from './hooks-sdk-selectors';
import {useCallback} from 'react';

export const useAllowedTracksToPublish = () => {
  return useSelector(selectAllowedTracksToPublish);
};

export const useCanPublishAudio = () => {
  return useSelector((state: RootState) =>
    selectCanPublishTrack(state, 'audio'),
  );
};

export const useCanPublishVideo = () => {
  return useSelector((state: RootState) =>
    selectCanPublishTrack(state, 'video'),
  );
};

export const useCanPublishScreen = () => {
  return useSelector((state: RootState) =>
    selectCanPublishTrack(state, 'screen'),
  );
};

export const useHMSActions = () => {
  const dispatch = useDispatch();
  const store = useStore();

  const setLocalAudioEnabled = useCallback(async (enable: boolean) => {
    const state: RootState = store.getState();
    const localPeer = state.hmsStates.localPeer;

    if (!localPeer) {
      return Promise.reject('Local Peer Instance is not available!');
    }
    const localAudioTrack = localPeer.localAudioTrack();
    if (!localAudioTrack) {
      return Promise.reject(
        'Local Peer Audio Track Instance is not available!',
      );
    }
    try {
      dispatch(setIsLocalAudioMutedState(enable));
      localAudioTrack.setMute(enable);
    } catch (error) {
      dispatch(setIsLocalAudioMutedState(!enable));
      return Promise.reject(error);
    }
  }, []);

  const setLocalVideoEnabled = useCallback(async (enable: boolean) => {
    const state: RootState = store.getState();
    const localPeer = state.hmsStates.localPeer;

    if (!localPeer) {
      return Promise.reject('Local Peer Instance is not available!');
    }
    const localVideoTrack = localPeer.localVideoTrack();
    if (!localVideoTrack) {
      return Promise.reject(
        'Local Peer Video Track Instance is not available!',
      );
    }
    try {
      dispatch(setIsLocalVideoMutedState(enable));
      localVideoTrack.setMute(enable);
    } catch (error) {
      dispatch(setIsLocalVideoMutedState(!enable));
      return Promise.reject(error);
    }
  }, []);

  return {
    setLocalAudioEnabled,
    setLocalVideoEnabled,
  };
};
