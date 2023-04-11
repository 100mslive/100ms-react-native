import {useEffect} from 'react';
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

export const useRTCStatsListeners = (force?: boolean) => {
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const showStatsOnTiles = useSelector(
    (state: RootState) => state.app.joinConfig.showStats,
  );

  const addListeners = Boolean(showStatsOnTiles || force);

  useEffect(() => {
    if (hmsInstance && addListeners) {
      hmsInstance.enableRTCStats();

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
        (data: {
          localAudioStats: HMSLocalAudioStats;
          track: HMSLocalAudioTrack;
          peer: HMSPeer;
        }) => {
          // Only considering REGULAR tracks
          if (data.track.source === HMSTrackSource.REGULAR) {
            // Saving Audio Track Stats by peerId
            dispatch(setRTCStats(data.peer.peerID, data.localAudioStats));
          }
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
        (data: {
          localVideoStats: HMSLocalVideoStats[];
          track: HMSLocalVideoTrack;
          peer: HMSPeer;
        }) => {
          if (data.track.source === HMSTrackSource.REGULAR) {
            dispatch(setRTCStats(data.track.trackId, data.localVideoStats[0]));
          }
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
        (data: {
          remoteAudioStats: HMSRemoteAudioStats;
          track: HMSRemoteAudioTrack;
          peer: HMSPeer;
        }) => {
          if (data.track.source === HMSTrackSource.REGULAR) {
            // Saving Audio Track Stats by peerId
            dispatch(setRTCStats(data.peer.peerID, data.remoteAudioStats));
          }
        },
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
        (data: {
          remoteVideoStats: HMSRemoteVideoStats;
          track: HMSRemoteVideoTrack;
          peer: HMSPeer;
        }) => {
          if (data.track.source === HMSTrackSource.REGULAR) {
            dispatch(setRTCStats(data.track.trackId, data.remoteVideoStats));
          }
        },
      );

      return () => {
        hmsInstance.disableRTCStats();

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
