import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import type { HMSPoll } from '@100mslive/react-native-hms';

import { ModalTypes } from './types';
import type { RootState } from '../redux';
import { addLeaderboard, setRTCStats } from '../redux/actions';
import { useHMSInstance } from '../hooks-util';

export const useRTCStatsListeners = () => {
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const addListeners = useSelector(
    (state: RootState) =>
      state.app.joinConfig.showStats ||
      state.app.modalType === ModalTypes.RTC_STATS
  );

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
        }
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
        (data: {
          localVideoStats: HMSLocalVideoStats[];
          track: HMSLocalVideoTrack;
          peer: HMSPeer;
        }) => {
          dispatch(setRTCStats(data.track.trackId, data.localVideoStats));
        }
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
        }
      );

      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
        (data: {
          remoteVideoStats: HMSRemoteVideoStats;
          track: HMSRemoteVideoTrack;
          peer: HMSPeer;
        }) => {
          dispatch(setRTCStats(data.track.trackId, data.remoteVideoStats));
        }
      );

      return () => {
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS
        );
        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS
        );
      };
    }
  }, [hmsInstance, addListeners]);
};

export const useFetchLeaderboardResponse = (
  pollId: HMSPoll['pollId'] | undefined
) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();

  const localPeerPollInitiator = useSelector((state: RootState) => {
    if (!pollId) return null;
    const localPeerUserId = state.hmsStates.localPeer?.customerUserID;
    const pollInitiatorUserID =
      state.polls.polls[pollId]?.createdBy?.customerUserID;
    return (
      localPeerUserId &&
      pollInitiatorUserID &&
      localPeerUserId === pollInitiatorUserID
    );
  });

  const leaderboardData = useSelector((state: RootState) => {
    if (!pollId) return null;
    return state.polls.leaderboards[pollId] || null;
  });

  const leaderboardDataExist = !!leaderboardData;

  useEffect(() => {
    if (!!leaderboardData) return;

    let mounted = true;

    async function fetchLeaderboard() {
      if (pollId) {
        const response = await hmsInstance.interactivityCenter.fetchLeaderboard(
          pollId,
          5,
          1, // Indexing starts from 1
          !localPeerPollInitiator // fetchCurrentUser only if user is voter, and not poll initiator
        );
        if (mounted) {
          dispatch(addLeaderboard(pollId, response));
        }
      }
    }
    fetchLeaderboard();

    return () => {
      mounted = false;
    };
  }, [pollId, leaderboardDataExist, localPeerPollInitiator]);

  return leaderboardData;
};

export const useLeaderboardSummaryData = (
  pollId: HMSPoll['pollId'] | undefined
): { label: string; value: any }[][] | null => {
  const localPeerUserId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.customerUserID
  );
  const localPeerPollInitiator = useSelector((state: RootState) => {
    if (!pollId) return null;
    const pollInitiatorUserID =
      state.polls.polls[pollId]?.createdBy?.customerUserID;
    return (
      localPeerUserId &&
      pollInitiatorUserID &&
      localPeerUserId === pollInitiatorUserID
    );
  });

  const leaderboardData = useSelector((state: RootState) => {
    if (!pollId) return null;
    return state.polls.leaderboards[pollId] || null;
  });
  const pollQuestionsLength = useSelector((state: RootState) => {
    if (!pollId) return null;
    return state.polls.polls[pollId]?.questions?.length;
  });
  const leaderboardSummary = leaderboardData?.summary;

  const pollInitiatorSummaryData = useMemo(() => {
    if (!localPeerPollInitiator) {
      return null;
    }
    return [
      [
        {
          label: 'ANSWERED',
          value:
            leaderboardSummary &&
            typeof leaderboardSummary.respondedPeersCount === 'number' &&
            typeof leaderboardSummary.totalPeersCount === 'number'
              ? `${Math.round((leaderboardSummary.respondedPeersCount / leaderboardSummary.totalPeersCount) * 100)}% (${leaderboardSummary.respondedPeersCount}/${leaderboardSummary.totalPeersCount})`
              : '-',
        },
        {
          label: 'CORRECT ANSWERS',
          value:
            leaderboardSummary &&
            typeof leaderboardSummary.respondedCorrectlyPeersCount ===
              'number' &&
            typeof leaderboardSummary.totalPeersCount === 'number'
              ? `${Math.round((leaderboardSummary.respondedCorrectlyPeersCount / leaderboardSummary?.totalPeersCount) * 100)}% (${leaderboardSummary.respondedCorrectlyPeersCount}/${leaderboardSummary.totalPeersCount})`
              : '-',
        },
      ],
      [
        {
          label: 'AVG. TIME TAKEN',
          value:
            leaderboardSummary &&
            typeof leaderboardSummary.averageTime === 'number'
              ? `${(leaderboardSummary.averageTime / 1000).toFixed(2)}s`
              : '-', // averageTime is in milliseconds
        },
        {
          label: 'AVG. SCORE',
          value:
            leaderboardSummary &&
            typeof leaderboardSummary.averageScore === 'number'
              ? leaderboardSummary.averageScore.toFixed(2)
              : '-',
        },
      ],
    ];
  }, [leaderboardSummary, localPeerPollInitiator]);

  const localLeaderboardEntry =
    localPeerUserId && leaderboardData && Array.isArray(leaderboardData.entries)
      ? leaderboardData.entries.find(
          (entry) => entry.peer?.customerUserId === localPeerUserId
        )
      : null;

  const voterSummaryData = useMemo(() => {
    return [
      [
        {
          label: 'YOUR RANK',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.totalResponses === 'number' &&
            leaderboardSummary &&
            typeof leaderboardSummary.totalPeersCount === 'number'
              ? `${localLeaderboardEntry.position}/${leaderboardSummary.totalPeersCount}`
              : '-',
        },
        {
          label: 'CORRECT ANSWERS',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.correctResponses === 'number' &&
            typeof pollQuestionsLength === 'number'
              ? `${Math.round((localLeaderboardEntry.correctResponses / pollQuestionsLength) * 100)}% (${localLeaderboardEntry.correctResponses}/${pollQuestionsLength})`
              : '-',
        },
      ],
      [
        {
          label: 'TIME TAKEN',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.duration === 'number'
              ? `${(localLeaderboardEntry.duration / 1000).toFixed(2)}s`
              : '-',
        },
        {
          label: 'YOUR POINTS',
          value:
            localLeaderboardEntry &&
            typeof localLeaderboardEntry.score === 'number'
              ? localLeaderboardEntry.score
              : '-',
        },
      ],
    ];
  }, [localLeaderboardEntry, leaderboardSummary?.totalPeersCount]);

  return localPeerPollInitiator
    ? pollInitiatorSummaryData
    : voterSummaryData
      ? voterSummaryData
      : null;
};
