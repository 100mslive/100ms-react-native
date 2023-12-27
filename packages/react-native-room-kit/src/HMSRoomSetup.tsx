import {
  HMSException,
  HMSRoom,
  HMSTrack,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, StatusBar, StyleSheet, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import { batch, useDispatch, useSelector, useStore } from 'react-redux';

import { Preview } from './components';
import {
  addNotification,
  changeMeetingState,
  changeStartingHLSStream,
  setHMSLocalPeerState,
  setHMSRoomState,
  setInitialRole,
  setLocalPeerTrackNode,
  setMiniViewPeerTrackNode,
  updateLocalPeerTrackNode,
} from './redux/actions';
import { createPeerTrackNode } from './utils/functions';
import { OnLeaveReason, TerminalExceptionCodes } from './utils/types';
import type { PeerTrackNode } from './utils/types';
import { Meeting } from './components/Meeting';
import {
  useHMSActiveSpeakerUpdates,
  useHMSConfig,
  useHMSInstance,
  useHMSListeners,
  useHMSRoomColorPalette,
  useHMSRoomStyle,
  useHMSSessionStore,
  useLeaveMethods,
  isPublishingAllowed,
  useAndroidSoftInputAdjustResize,
} from './hooks-util';
import {
  peerTrackNodeExistForPeerAndTrack,
  replacePeerTrackNodesWithTrack,
  replacePeerTrackNodes,
  peerTrackNodeExistForPeer,
} from './peerTrackNodeUtils';
import { MeetingState, NotificationTypes } from './types';
import { getJoinConfig } from './utils';
import { FullScreenIndicator } from './components/FullScreenIndicator';
import { HMSMeetingEnded } from './components/HMSMeetingEnded';
import {
  selectChatLayoutConfig,
  selectIsHLSViewer,
  selectLayoutConfigForRole,
  selectShouldGoLive,
  selectVideoTileLayoutConfig,
} from './hooks-util-selectors';
import type { RootState } from './redux';
import { Chat_ChatState } from '@100mslive/types-prebuilt/elements/chat';

type PreviewData = {
  room: HMSRoom;
  previewTracks: HMSTrack[];
};

export const HMSRoomSetup = () => {
  const ignoreHLSStreamPromise = useRef(false);
  const didInitMeetingAction = useRef(false);
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const reduxStore = useStore<RootState>();
  const { leave, destroy, prebuiltCleanUp } = useLeaveMethods();

  const { getConfig, clearConfig } = useHMSConfig();
  const meetingState = useSelector(
    (state: RootState) => state.app.meetingState
  );
  const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[]>([]);
  const [loading, setLoading] = useState(false);

  const joinMeeting = useCallback(async () => {
    try {
      setLoading(true);
      Keyboard.dismiss();
      const hmsConfig = await getConfig();
      // TODO: handle case when promise returned from `getConfig()` is resolved when Root component has been unmounted
      hmsInstance.join(hmsConfig);
    } catch (error: any) {
      Alert.alert(
        error.code,
        error.message,
        [
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              leave(OnLeaveReason.LEAVE);
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [getConfig, hmsInstance]);

  const previewMeeting = useCallback(async () => {
    try {
      setLoading(true);
      const hmsConfig = await getConfig();
      // TODO: handle case when promise returned from `getConfig()` is resolved when Root component has been unmounted
      hmsInstance.preview(hmsConfig);
    } catch (error: any) {
      Alert.alert(
        error.code,
        error.message,
        [
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              destroy(OnLeaveReason.LEAVE);
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [getConfig, hmsInstance]);

  const startHLSStreaming = useCallback(async () => {
    dispatch(changeStartingHLSStream(true));
    try {
      const d = await hmsInstance.startHLSStreaming();
      console.log('Start HLS Streaming Success: ', d);
    } catch (e) {
      console.log('Start HLS Streaming Error: ', e);
      if (!ignoreHLSStreamPromise.current) {
        console.log('Unable to go live at the moment: ', e);
        dispatch(changeStartingHLSStream(false));
        // prebuiltCleanUp();
      }
    }
  }, [
    // prebuiltCleanUp,
    hmsInstance,
  ]);

  // HMS Room, Peers, Track Listeners
  useHMSListeners(setPeerTrackNodes);

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

  useAndroidSoftInputAdjustResize();

  const meetingJoined = meetingState === MeetingState.IN_MEETING;
  const previewing = meetingState === MeetingState.IN_PREVIEW;

  // HMS Error Listener
  useEffect(() => {
    const hmsErrorHandler = (error: HMSException) => {
      const terminalError =
        error.isTerminal || TerminalExceptionCodes.includes(error.code);

      if (meetingJoined) {
        const uid = Math.random().toString(16).slice(2);
        const notificationPayload = terminalError
          ? {
              id: uid,
              type: NotificationTypes.TERMINAL_ERROR,
              exception: error,
            }
          : {
              id: uid,
              type: NotificationTypes.ERROR,
              message: error.description,
            };

        dispatch(addNotification(notificationPayload));
      } else {
        setLoading(false);

        if (terminalError) {
          Alert.alert(
            error.code.toString(),
            error.description || 'Something went wrong',
            [
              {
                text: 'Leave',
                style: 'destructive',
                onPress: () => {
                  if (previewing) {
                    leave(OnLeaveReason.NETWORK_ISSUES);
                  } else {
                    destroy(OnLeaveReason.NETWORK_ISSUES);
                  }
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          Toast.showWithGravity(
            `${error?.code} ${error?.description}` || 'Something went wrong',
            Toast.LONG,
            Toast.TOP
          );
        }
      }
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ERROR,
      hmsErrorHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_ERROR);
    };
  }, [previewing, meetingJoined, hmsInstance]);

  // HMS Preview Listener
  useEffect(() => {
    const onPreviewHandler = (data: PreviewData) => {
      setLoading(false);
      batch(() => {
        dispatch(setHMSRoomState(data.room));
        dispatch(setHMSLocalPeerState(data.room.localPeer));
        dispatch(changeMeetingState(MeetingState.IN_PREVIEW));
      });
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      onPreviewHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_PREVIEW);
    };
  }, [hmsInstance]);

  // HMS Join Listener
  useEffect(() => {
    const onJoinHandler = (data: { room: HMSRoom }) => {
      clearConfig();

      setLoading(false);

      const reduxState = reduxStore.getState();

      const localPeer = data.room.localPeer;

      const peer = localPeer;
      const track = localPeer.videoTrack as HMSTrack | undefined;

      const currentLayoutConfig = selectLayoutConfigForRole(
        reduxState.hmsStates.layoutConfig,
        localPeer.role || null
      );

      const isHLSViewer = selectIsHLSViewer(
        localPeer.role,
        currentLayoutConfig
      );

      // Creating `PeerTrackNode` for local peer
      const localPeerTrackNode = createPeerTrackNode(peer, track);

      const enableLocalTileInset =
        selectVideoTileLayoutConfig(currentLayoutConfig)?.grid
          ?.enable_local_tile_inset;

      const canCreateTile = isPublishingAllowed(localPeer) && !isHLSViewer;

      batch(() => {
        const chatConfig = selectChatLayoutConfig(currentLayoutConfig);
        const overlayChatInitialState =
          chatConfig && chatConfig.is_overlay && chatConfig.initial_state;

        if (
          !!chatConfig &&
          overlayChatInitialState === Chat_ChatState.CHAT_STATE_OPEN
        ) {
          dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: true });
        }

        if (canCreateTile) {
          if (reduxState.app.localPeerTrackNode) {
            dispatch(
              updateLocalPeerTrackNode({ peer, track: peer.videoTrack })
            );
          } else {
            // saving above created `PeerTrackNode` in store
            dispatch(setLocalPeerTrackNode(localPeerTrackNode));
          }

          // setting local `PeerTrackNode` as node for MiniView
          if (enableLocalTileInset) {
            dispatch(setMiniViewPeerTrackNode(localPeerTrackNode));
          }
        }

        dispatch(setHMSRoomState(data.room));
        dispatch(setHMSLocalPeerState(data.room.localPeer));
        if (data.room.localPeer.role) {
          dispatch(setInitialRole(data.room.localPeer.role));
        }
      });

      // If `peerTrackNodes` also contains a tile for local peer then updating it
      setPeerTrackNodes((prevPeerTrackNodes) => {
        if (
          track &&
          peerTrackNodeExistForPeerAndTrack(prevPeerTrackNodes, peer, track)
        ) {
          return replacePeerTrackNodesWithTrack(
            prevPeerTrackNodes,
            peer,
            track
          );
        }
        if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
          return replacePeerTrackNodes(prevPeerTrackNodes, peer);
        }

        // setting local `PeerTrackNode` in regular peerTrackNodes array when inset tile is disabled
        if (!enableLocalTileInset && canCreateTile) {
          return [localPeerTrackNode, ...prevPeerTrackNodes];
        }

        return prevPeerTrackNodes;
      });

      const shouldGoLive = selectShouldGoLive(reduxState);

      if (shouldGoLive) {
        startHLSStreaming();
      }
      dispatch(changeMeetingState(MeetingState.IN_MEETING));
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_JOIN);
    };
  }, [startHLSStreaming, hmsInstance]);

  // HMS Active Speaker Listener
  // dev-note: This is added here because we have `setPeerTrackNodes` here
  useHMSActiveSpeakerUpdates(setPeerTrackNodes, meetingJoined);

  const meetingEnded = meetingState === MeetingState.MEETING_ENDED;

  // Handling Automatically calling Preview or Join API
  useEffect(() => {
    if (!meetingEnded && !didInitMeetingAction.current) {
      didInitMeetingAction.current = true;

      // let ignore = false;

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
            error
          );
        }
      };

      handleMeetingPreviewOrJoin();

      return () => {
        // ignore = true;
      };
    }
  }, [meetingEnded]);

  useEffect(() => {
    return () => {
      ignoreHLSStreamPromise.current = true;
      prebuiltCleanUp();
    };
  }, []);

  const emptyViewStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  return (
    <>
      <StatusBar
        backgroundColor={backgroundDimColor}
        barStyle={'light-content'}
      />

      {meetingState === MeetingState.IN_PREVIEW ? (
        <Preview join={joinMeeting} loadingButtonState={loading} />
      ) : meetingState === MeetingState.IN_MEETING ? (
        <Meeting peerTrackNodes={peerTrackNodes} />
      ) : meetingState === MeetingState.MEETING_ENDED ? (
        <HMSMeetingEnded />
      ) : loading ? (
        <FullScreenIndicator />
      ) : (
        <View style={[styles.container, emptyViewStyles]} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
