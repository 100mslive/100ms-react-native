import {
  HMSConfig,
  HMSException,
  HMSRoom,
  HMSTrack,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {batch, useDispatch, useSelector} from 'react-redux';

import {Preview} from './components';
import {
  clearStore,
  setHMSLocalPeerState,
  setHMSRoomState,
} from './redux/actions';
import {createPeerTrackNode} from './utils/functions';
import {PeerTrackNode} from './utils/types';
import {Meeting} from './components/Meeting';
import {
  useHMSInstance,
  useHMSListeners,
  useHMSSessionStore,
} from './hooks-util';
import {
  peerTrackNodeExistForPeerAndTrack,
  replacePeerTrackNodesWithTrack,
  replacePeerTrackNodes,
} from './peerTrackNodeUtils';
import {MeetingState} from './types';
import {getJoinConfig} from './utils';
import {RootState} from './redux';
import {COLORS} from './utils/theme';

type PreviewData = {
  room: HMSRoom;
  previewTracks: HMSTrack[];
};

export const HMSRoomSetup = () => {
  const didInitMeetingAction = useRef(false);
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const roomCode = useSelector((state: RootState) => state.user.roomCode);
  const {userName, userId, tokenEndpoint, initEndpoint} = useSelector(
    (state: RootState) => ({
      userName: state.user.userName,
      userId: state.user.userId,
      tokenEndpoint: state.user.endPoints?.token,
      initEndpoint: state.user.endPoints?.init,
    }),
  );
  const hmsConfigRef = useRef<HMSConfig | null>(null);
  const [previewTracks, setPreviewTracks] = useState<HMSTrack[]>([]);
  const [meetingState, setMeetingState] = useState(MeetingState.NOT_JOINED);
  const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[]>([]);
  const [loading, setLoading] = useState(false);

  const generateConfig = useCallback(async () => {
    const token = await hmsInstance.getAuthTokenByRoomCode(
      roomCode,
      userId,
      tokenEndpoint,
    );

    const hmsConfig = new HMSConfig({
      authToken: token,
      username: userName,
      captureNetworkQualityInPreview: true,
      endpoint: initEndpoint,
      // metadata: JSON.stringify({isHandRaised: true}), // To join with hand raised
    });

    hmsConfigRef.current = hmsConfig;

    return hmsConfig;
  }, [hmsInstance]);

  const joinMeeting = useCallback(async () => {
    setLoading(true);
    let hmsConfig = hmsConfigRef.current;
    if (!hmsConfig) {
      hmsConfig = await generateConfig();
    }
    hmsInstance.join(hmsConfig);
  }, [hmsInstance]);

  const previewMeeting = useCallback(async () => {
    setLoading(true);
    let hmsConfig = hmsConfigRef.current;
    if (!hmsConfig) {
      hmsConfig = await generateConfig();
    }
    hmsInstance.preview(hmsConfig);
  }, [hmsInstance]);

  // HMS Room, Peers, Track Listeners
  useHMSListeners(setPeerTrackNodes, setMeetingState);

  /**
   * Session store is a shared realtime key-value store that is accessible by everyone in the room.
   * It can be utilized to implement features such as pinned text, spotlight (which brings a particular
   * peer to the center stage for everyone in the room) and more.
   *
   * On adding this event listener, Inside `onSessionStoreAvailableListener` function you will get an
   * instance of `HMSSessionStore` class, then you can use this instance to "set" or "get" the value
   * for a specific key on session store and listen for value change updates.
   *
   * Checkout Session Store docs fore more details ${@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/session-store}
   */
  useHMSSessionStore();

  // HMS Error Listener
  useEffect(() => {
    const hmsErrorHandler = (error: HMSException) => {
      setLoading(false);

      // TODO: 424 error is not recoverable
      // (Leave Meeting and Destroy Instance) ???
      // Inform user with Alert or Error screen and send user back
      if (error.code === 424) {
        Alert.alert('Error', error.description || 'Something went wrong', [
          {text: 'OK', style: 'cancel', onPress: () => {}},
        ]);
      } else if (
        Platform.OS === 'android'
          ? error.code === 4005 || error.code === 1003
          : error.code === 2000
      ) {
        // TODO: come up with Error Handle mechanism
        // (Leave Meeting and Destroy Instance) ???
        // Clear Redux Store?
        // Inform user with Alert or Error screen and send user back (Navigation)
      }

      Toast.showWithGravity(
        `${error?.code} ${error?.description}` || 'Something went wrong',
        Toast.LONG,
        Toast.TOP,
      );
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ERROR,
      hmsErrorHandler,
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_ERROR);
    };
  }, [hmsInstance]);

  // HMS Preview Listener
  useEffect(() => {
    const onPreviewHandler = (data: PreviewData) => {
      setLoading(false);

      batch(() => {
        dispatch(setHMSRoomState(data.room));
        dispatch(setHMSLocalPeerState(data.room.localPeer));
      });
      setPreviewTracks(data.previewTracks);

      setMeetingState(MeetingState.IN_PREVIEW);
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      onPreviewHandler,
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_PREVIEW);
    };
  }, [hmsInstance]);

  // HMS Join Listener
  useEffect(() => {
    const onJoinHandler = (data: {room: HMSRoom}) => {
      setLoading(false);

      batch(() => {
        dispatch(setHMSRoomState(data.room));
        dispatch(setHMSLocalPeerState(data.room.localPeer));
      });

      const localPeer = data.room.localPeer;

      const peer = localPeer;
      const track = localPeer.videoTrack;

      setPeerTrackNodes(prevPeerTrackNodes => {
        if (
          peerTrackNodeExistForPeerAndTrack(
            prevPeerTrackNodes,
            peer,
            track as HMSTrack,
          )
        ) {
          if (track) {
            return replacePeerTrackNodesWithTrack(
              prevPeerTrackNodes,
              peer,
              track,
            );
          }
          return replacePeerTrackNodes(prevPeerTrackNodes, peer);
        }
        const hmsLocalPeer = createPeerTrackNode(peer, track);
        return [hmsLocalPeer, ...prevPeerTrackNodes];
      });

      setMeetingState(MeetingState.IN_MEETING);
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinHandler,
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_JOIN);
    };
  }, [hmsInstance]);

  useEffect(() => {
    if (!didInitMeetingAction.current) {
      didInitMeetingAction.current = true;

      let ignore = false;

      const handleMeetingPreviewOrJoin = async () => {
        try {
          if (getJoinConfig().skipPreview) {
            joinMeeting();
          } else {
            previewMeeting();
          }
        } catch (error) {
          // TODO: handle token error gracefully
          console.warn(
            '🚀 ~ file: HMSRoomSetup.tsx:119 ~ handleMeetingPreviewOrJoin ~ error:',
            error,
          );
        }
      };

      handleMeetingPreviewOrJoin();

      return () => {
        ignore = true;
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      // TODOS:
      // - Check If we have already left meeting, or destroyed native HMSSDK
      //    - No need to reset redux state?
      //    - HMSInstance will be available till this point
      //    - If we have callback fn, call it
      //    - When we are navigated away from screen, HMSInstance will be not available
      // - Otherwise
      //    - call leave method, if not called
      //    - call destroy method, if not called
      //    - Reset Redux States or No need?
      //    - If we have callback fn, call it
      //    - When we are navigated away from screen, HMSInstance will be not available
      hmsInstance.leave().finally(() => {
        hmsInstance.destroy();
        dispatch(clearStore());
      });
      //dispatch(clearHmsReference());
      // dispatch(clearMessageData());
      // dispatch(clearPeerData());
    };
  }, [hmsInstance]);

  if (meetingState === MeetingState.IN_PREVIEW) {
    return (
      <Preview
        previewTracks={previewTracks}
        join={joinMeeting}
        loadingButtonState={loading}
      />
    );
  }

  if (meetingState === MeetingState.IN_MEETING) {
    return <Meeting peerTrackNodes={peerTrackNodes} />;
  }

  if (loading) {
    return (
      <ActivityIndicator
        size={'large'}
        color={'violet'}
        style={{flex: 1, backgroundColor: COLORS.SURFACE.DEFAULT}}
      />
    );
  }

  return <View style={{flex: 1, backgroundColor: COLORS.SURFACE.DEFAULT}} />;
};
