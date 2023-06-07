import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  HMSLocalAudioStats,
  HMSLocalAudioTrack,
  HMSLocalVideoStats,
  HMSLocalVideoTrack,
  HMSPeer,
  HMSRemoteAudioStats,
  HMSRemoteAudioTrack,
  HMSRemoteVideoStats,
  HMSRemoteVideoTrack,
  HMSTrackSource,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';

import {RootState} from '../redux';
import {setRTCStats} from '../redux/actions';

/**
 * Returns true if the screen is in portrait mode
 */
const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */
export const useOrientation = (): 'PORTRAIT' | 'LANDSCAPE' => {
  // State to hold the connection status
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',
  );

  useEffect(() => {
    const callback = () =>
      setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

    Dimensions.addEventListener('change', callback);

    return () => {
      Dimensions.removeEventListener('change', callback);
    };
  }, []);

  return orientation;
};

export const useRTCStatsListeners = (force?: boolean) => {
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const showStatsOnTiles = useSelector(
    (state: RootState) => state.app.joinConfig.showStats,
  );

  const addListeners = Boolean(showStatsOnTiles || force);

  useEffect(() => {
    if (hmsInstance && addListeners) {
      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
        (data: {
          localAudioStats: HMSLocalAudioStats;
          track: HMSLocalAudioTrack;
          peer: HMSPeer;
        }) => {
          const audioStatId =
            data.track.source && data.track.source !== HMSTrackSource.REGULAR
              ? data.peer.peerID + data.track.source
              : data.peer.peerID;

          // Saving Audio Track Stats by "peerId" plus "track source" if source is not regular
          dispatch(setRTCStats(audioStatId, data.localAudioStats));
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
        (data: {
          localVideoStats: HMSLocalVideoStats[];
          track: HMSLocalVideoTrack;
          peer: HMSPeer;
        }) => {
          dispatch(setRTCStats(data.track.trackId, data.localVideoStats));
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
        (data: {
          remoteAudioStats: HMSRemoteAudioStats;
          track: HMSRemoteAudioTrack;
          peer: HMSPeer;
        }) => {
          const audioStatId =
            data.track.source && data.track.source !== HMSTrackSource.REGULAR
              ? data.peer.peerID + data.track.source
              : data.peer.peerID;

          // Saving Audio Track Stats by "peerId" plus "track source" if source is not regular
          dispatch(setRTCStats(audioStatId, data.remoteAudioStats));
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
        (data: {
          remoteVideoStats: HMSRemoteVideoStats;
          track: HMSRemoteVideoTrack;
          peer: HMSPeer;
        }) => {
          dispatch(setRTCStats(data.track.trackId, data.remoteVideoStats));
        },
      );

      return () => {
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
        );
      };
    }
  }, [hmsInstance, addListeners]);
};
