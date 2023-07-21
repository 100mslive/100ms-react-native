import {
  HMSChangeTrackStateRequest,
  HMSConfig,
  HMSLocalPeer,
  HMSMessage,
  HMSPIPListenerActions,
  HMSPeer,
  HMSPeerUpdate,
  HMSRemotePeer,
  HMSRoleChangeRequest,
  HMSRoom,
  HMSRoomUpdate,
  HMSSDK,
  HMSTrack,
  HMSTrackSource,
  HMSTrackType,
  HMSTrackUpdate,
  HMSUpdateListenerActions,
  // useHMSPeerUpdates,
} from '@100mslive/react-native-hms';
import type {
  HMSSessionStore,
  HMSSessionStoreValue,
} from '@100mslive/react-native-hms';
import Toast from 'react-native-simple-toast';
import { useRef, useCallback, useEffect, useState, useMemo } from 'react';

import { ModalTypes, PipModes } from './utils/types';
import type { PeerTrackNode } from './utils/types';
import { createPeerTrackNode, parseMetadata } from './utils/functions';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState } from './redux';
import {
  addMessage,
  addPinnedMessage,
  addToPreviewPeersList,
  changePipModeStatus,
  clearStore,
  removeFromPreviewPeersList,
  saveUserData,
  setHMSLocalPeerState,
  setHMSRoleState,
  setHMSRoomState,
  setIsLocalAudioMutedState,
  setIsLocalVideoMutedState,
  setModalType,
} from './redux/actions';
import {
  degradeOrRestorePeerTrackNodes,
  peerTrackNodeExistForPeer,
  peerTrackNodeExistForPeerAndTrack,
  removePeerTrackNodes,
  removePeerTrackNodesWithTrack,
  replacePeerTrackNodes,
  replacePeerTrackNodesWithTrack,
} from './peerTrackNodeUtils';
import { MeetingState } from './types';
import {
  AppState,
  InteractionManager,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useIsLandscapeOrientation,
  useIsPortraitOrientation,
} from './utils/dimension';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { selectIsHLSViewer } from './hooks-util-selectors';

export const useHMSListeners = (
  meetingState: MeetingState,
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>,
  setMeetingState: React.Dispatch<React.SetStateAction<MeetingState>>
) => {
  const hmsInstance = useHMSInstance();
  const updateLocalPeer = useUpdateHMSLocalPeer(hmsInstance);

  useHMSRoomUpdate(hmsInstance, setMeetingState);

  useHMSPeersUpdate(
    meetingState,
    hmsInstance,
    updateLocalPeer,
    setPeerTrackNodes
  );

  useHMSTrackUpdate(hmsInstance, updateLocalPeer, setPeerTrackNodes);
};

const useHMSRoomUpdate = (
  hmsInstance: HMSSDK,
  setMeetingState: React.Dispatch<React.SetStateAction<MeetingState>>
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const roomUpdateHandler = (data: {
      room: HMSRoom;
      type: HMSRoomUpdate;
    }) => {
      const { room, type } = data;

      dispatch(setHMSRoomState(room));

      /**
       * Handle case when User is joining as HLSViewer,
       * before ON_JOIN, if ON_ROOM comes then we can show Meeting screen to user, instead of Loader or Preview
       */
      if (room.localPeer.role?.name?.includes('hls-') ?? false) {
        dispatch(setHMSLocalPeerState(room.localPeer));
        setMeetingState((prevMeetingScreen) => {
          if (prevMeetingScreen !== MeetingState.IN_MEETING) {
            return MeetingState.IN_MEETING;
          }
          return prevMeetingScreen;
        });
      }

      if (type === HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED) {
        let streaming = room?.browserRecordingState?.running;
        const startAtDate = room?.browserRecordingState?.startedAt;

        let startTime: null | string = null;

        if (startAtDate) {
          let hours = startAtDate.getHours().toString();
          let minutes = startAtDate.getMinutes()?.toString();
          startTime = hours + ':' + minutes;
        }

        Toast.showWithGravity(
          `Browser Recording ${
            streaming
              ? `Started ${startTime ? 'At ' + startTime : ''}`
              : 'Stopped'
          }`,
          Toast.LONG,
          Toast.TOP
        );
      } else if (type === HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED) {
        let streaming = room?.hlsStreamingState?.running;

        Toast.showWithGravity(
          `HLS Streaming ${streaming ? 'Started' : 'Stopped'}`,
          Toast.LONG,
          Toast.TOP
        );
      } else if (type === HMSRoomUpdate.RTMP_STREAMING_STATE_UPDATED) {
        let streaming = room?.rtmpHMSRtmpStreamingState?.running;
        const startAtDate = room?.rtmpHMSRtmpStreamingState?.startedAt;

        let startTime: null | string = null;

        if (startAtDate) {
          let hours = startAtDate.getHours().toString();
          let minutes = startAtDate.getMinutes()?.toString();
          startTime = hours + ':' + minutes;
        }

        Toast.showWithGravity(
          `RTMP Streaming ${
            streaming
              ? `Started ${startTime ? 'At ' + startTime : ''}`
              : 'Stopped'
          }`,
          Toast.LONG,
          Toast.TOP
        );
      } else if (type === HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED) {
        let streaming = room?.serverRecordingState?.running;
        const startAtDate = room?.serverRecordingState?.startedAt;

        let startTime: null | string = null;

        if (startAtDate) {
          let hours = startAtDate.getHours().toString();
          let minutes = startAtDate.getMinutes()?.toString();
          startTime = hours + ':' + minutes;
        }

        Toast.showWithGravity(
          `Server Recording ${
            streaming
              ? `Started ${startTime ? 'At ' + startTime : ''}`
              : 'Stopped'
          }`,
          Toast.LONG,
          Toast.TOP
        );
      }
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      roomUpdateHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_ROOM_UPDATE);
    };
  }, [hmsInstance]);
};

type PeerUpdate = {
  peer: HMSPeer;
  type: HMSPeerUpdate;
};

const useHMSPeersUpdate = (
  meetingState: MeetingState,
  hmsInstance: HMSSDK,
  updateLocalPeer: () => void,
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>
) => {
  const dispatch = useDispatch();
  const inMeeting = meetingState === MeetingState.IN_MEETING;

  useEffect(() => {
    const peerUpdateHandler = ({ peer, type }: PeerUpdate) => {
      // Handle State from Preview screen
      if (!inMeeting) {
        if (type === HMSPeerUpdate.PEER_JOINED) {
          dispatch(addToPreviewPeersList(peer));
        } else if (type === HMSPeerUpdate.PEER_LEFT) {
          dispatch(removeFromPreviewPeersList(peer));
        }
      }

      // Handle State for Meeting screen
      if (type === HMSPeerUpdate.PEER_JOINED) {
        return;
      }
      if (type === HMSPeerUpdate.PEER_LEFT) {
        setPeerTrackNodes((prevPeerTrackNodes) =>
          removePeerTrackNodes(prevPeerTrackNodes, peer)
        );
        return;
      }
      if (peer.isLocal) {
        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          return prevPeerTrackNodes;
        });

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        updateLocalPeer();
        return;
      }
      if (type === HMSPeerUpdate.ROLE_CHANGED) {
        if (
          peer.role?.publishSettings?.allowed === undefined ||
          (peer.role?.publishSettings?.allowed &&
            peer.role?.publishSettings?.allowed.length < 1)
        ) {
          setPeerTrackNodes((prevPeerTrackNodes) => {
            if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
              return removePeerTrackNodes(prevPeerTrackNodes, peer);
            }
            return prevPeerTrackNodes;
          });
        }
        return;
      }
      if (
        type === HMSPeerUpdate.METADATA_CHANGED ||
        type === HMSPeerUpdate.NAME_CHANGED ||
        type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
      ) {
        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          return prevPeerTrackNodes;
        });
        return;
      }
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      peerUpdateHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE);
    };
  }, [inMeeting, hmsInstance]); // TODO: When `inMeeting` becomes true Peer Update is resubscribed, we might lose some events during that time
};

type TrackUpdate = {
  peer: HMSPeer;
  track: HMSTrack;
  type: HMSTrackUpdate;
};

const useHMSTrackUpdate = (
  hmsInstance: HMSSDK,
  updateLocalPeer: () => void,
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const trackUpdateHandler = ({ peer, track, type }: TrackUpdate) => {
      if (type === HMSTrackUpdate.TRACK_ADDED) {
        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (
            peerTrackNodeExistForPeerAndTrack(prevPeerTrackNodes, peer, track)
          ) {
            if (track.type === HMSTrackType.VIDEO) {
              return replacePeerTrackNodesWithTrack(
                prevPeerTrackNodes,
                peer,
                track
              );
            }
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          const newPeerTrackNode = createPeerTrackNode(peer, track);
          return [...prevPeerTrackNodes, newPeerTrackNode];
        });

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          updateLocalPeer();
        }
        return;
      }
      if (type === HMSTrackUpdate.TRACK_REMOVED) {
        if (
          track.source !== HMSTrackSource.REGULAR ||
          (peer.audioTrack?.trackId === undefined &&
            peer.videoTrack?.trackId === undefined)
        ) {
          setPeerTrackNodes((prevPeerTrackNodes) =>
            removePeerTrackNodesWithTrack(prevPeerTrackNodes, peer, track)
          );
        }

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          updateLocalPeer();
        }
        return;
      }
      if (
        type === HMSTrackUpdate.TRACK_MUTED ||
        type === HMSTrackUpdate.TRACK_UNMUTED
      ) {
        // - TODO: update local mute states
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          if (track.type === HMSTrackType.AUDIO) {
            dispatch(setIsLocalAudioMutedState(track.isMute()));
          } else if (track.type === HMSTrackType.VIDEO) {
            dispatch(setIsLocalVideoMutedState(track.isMute()));
          }
        }

        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (
            peerTrackNodeExistForPeerAndTrack(prevPeerTrackNodes, peer, track)
          ) {
            if (track.type === HMSTrackType.VIDEO) {
              return replacePeerTrackNodesWithTrack(
                prevPeerTrackNodes,
                peer,
                track
              );
            }
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          return prevPeerTrackNodes;
        });

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          updateLocalPeer();
        }
        return;
      }
      if (
        type === HMSTrackUpdate.TRACK_RESTORED ||
        type === HMSTrackUpdate.TRACK_DEGRADED
      ) {
        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (
            peerTrackNodeExistForPeerAndTrack(prevPeerTrackNodes, peer, track)
          ) {
            return degradeOrRestorePeerTrackNodes(
              prevPeerTrackNodes,
              peer,
              track,
              type === HMSTrackUpdate.TRACK_DEGRADED
            );
          }
          return prevPeerTrackNodes;
        });
        return;
      }
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      trackUpdateHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE);
    };
  }, [hmsInstance]);
};

const useUpdateHMSLocalPeer = (hmsInstance: HMSSDK) => {
  const mountRef = useRef(false);
  const dispatch = useDispatch();

  const updateLocalPeer = useCallback(() => {
    hmsInstance.getLocalPeer().then((latestLocalPeer) => {
      if (mountRef.current) {
        dispatch(setHMSLocalPeerState(latestLocalPeer));
      }
    });
  }, [hmsInstance]);

  useEffect(() => {
    mountRef.current = true;
    updateLocalPeer();

    return () => {
      mountRef.current = false;
    };
  }, [updateLocalPeer]);

  return updateLocalPeer;
};

export const useHMSInstance = () => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  if (!hmsInstance) {
    throw new Error('HMS Instance not available');
  }

  return hmsInstance;
};

export const useIsHLSViewer = () => {
  return useSelector((state: RootState) =>
    selectIsHLSViewer(state.hmsStates.localPeer)
  );
};

type TrackStateChangeRequest = {
  requestedBy?: string;
  suggestedRole?: string;
};

export const useHMSChangeTrackStateRequest = (
  callback?: (unmuteRequest: Omit<HMSChangeTrackStateRequest, 'mute'>) => void,
  deps?: React.DependencyList
) => {
  const hmsInstance = useHMSInstance();
  const [trackStateChangeRequest, setTrackStateChangeRequest] =
    useState<TrackStateChangeRequest | null>(null);

  useEffect(() => {
    const changeTrackStateRequestHandler = (
      request: HMSChangeTrackStateRequest
    ) => {
      if (!request?.mute) {
        setTrackStateChangeRequest({
          requestedBy: request?.requestedBy?.name,
          suggestedRole: request?.trackType,
        });
        callback?.(request);
      } else {
        Toast.showWithGravity(
          `Track Muted: ${request?.requestedBy?.name} Muted Your ${request?.trackType}`,
          Toast.LONG,
          Toast.TOP
        );
      }
    };
    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      changeTrackStateRequestHandler
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST
      );
    };
  }, [...(deps || []), hmsInstance]);

  return trackStateChangeRequest;
};

type RoleChangeRequest = {
  requestedBy?: string;
  suggestedRole?: string;
};

export const useHMSRoleChangeRequest = (
  callback?: (request: HMSRoleChangeRequest) => void,
  deps?: React.DependencyList
) => {
  const hmsInstance = useHMSInstance();
  const [roleChangeRequest, setRoleChangeRequest] =
    useState<RoleChangeRequest | null>(null);

  useEffect(() => {
    const changeRoleRequestHandler = (request: HMSRoleChangeRequest) => {
      setRoleChangeRequest({
        requestedBy: request?.requestedBy?.name,
        suggestedRole: request?.suggestedRole?.name,
      });
      callback?.(request);
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      changeRoleRequestHandler
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
      );
    };
  }, [...(deps || []), hmsInstance]);

  return roleChangeRequest;
};

type SessionStoreListeners = Array<{ remove: () => void }>;

export const useHMSSessionStoreListeners = () => {
  const dispatch = useDispatch();
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore
  );
  const sessionStoreListenersRef = useRef<SessionStoreListeners>([]);

  useEffect(() => {
    // Check if instance of HMSSessionStore is available
    if (hmsSessionStore) {
      // let toastTimeoutId: NodeJS.Timeout | null = null;

      const addSessionStoreListeners = () => {
        // Handle 'spotlight' key values
        const handleSpotlightIdChange = (id: HMSSessionStoreValue) => {
          // set value to the state to rerender the component to reflect changes
          dispatch(saveUserData({ spotlightTrackId: id }));
        };

        // Handle 'pinnedMessage' key values
        const handlePinnedMessageChange = (data: HMSSessionStoreValue) => {
          dispatch(addPinnedMessage(data));
        };

        // Getting value for 'spotlight' key by using `get` method on HMSSessionStore instance
        hmsSessionStore
          .get('spotlight')
          .then((data) => {
            console.log(
              'Session Store get `spotlight` key value success: ',
              data
            );
            handleSpotlightIdChange(data);
          })
          .catch((error) =>
            console.log(
              'Session Store get `spotlight` key value error: ',
              error
            )
          );

        // Getting value for 'pinnedMessage' key by using `get` method on HMSSessionStore instance
        hmsSessionStore
          .get('pinnedMessage')
          .then((data) => {
            console.log(
              'Session Store get `pinnedMessage` key value success: ',
              data
            );
            handlePinnedMessageChange(data);
          })
          .catch((error) =>
            console.log(
              'Session Store get `pinnedMessage` key value error: ',
              error
            )
          );

        // let lastSpotlightValue: HMSSessionStoreValue = null;
        // let lastPinnedMessageValue: HMSSessionStoreValue = null;

        // Add subscription for `spotlight` & `pinnedMessage` keys updates on Session Store
        const subscription = hmsSessionStore.addKeyChangeListener<
          ['spotlight', 'pinnedMessage']
        >(['spotlight', 'pinnedMessage'], (error, data) => {
          // If error occurs, handle error and return early
          if (error !== null) {
            console.log(
              '`spotlight` & `pinnedMessage` key listener Error -> ',
              error
            );
            return;
          }

          // If no error, handle data
          if (data !== null) {
            switch (data.key) {
              case 'spotlight': {
                handleSpotlightIdChange(data.value);

                // Showing Toast message if value has actually changed
                // if (
                //   data.value !== lastSpotlightValue &&
                //   (data.value || lastSpotlightValue)
                // ) {
                //   Toast.showWithGravity(
                //     `SessionStore: \`spotlight\` key's value changed to ${data.value}`,
                //     Toast.LONG,
                //     Toast.TOP
                //   );
                // }

                // lastSpotlightValue = data.value;
                break;
              }
              case 'pinnedMessage': {
                handlePinnedMessageChange(data.value);

                // Showing Toast message if value has actually changed
                // if (
                //   data.value !== lastPinnedMessageValue &&
                //   (data.value || lastPinnedMessageValue)
                // ) {
                //   if (toastTimeoutId !== null) {
                //     clearTimeout(toastTimeoutId);
                //   }
                //   toastTimeoutId = setTimeout(() => {
                //     Toast.showWithGravity(
                //       `SessionStore: \`pinnedMessage\` key's value changed to ${data.value}`,
                //       Toast.LONG,
                //       Toast.TOP
                //     );
                //   }, 1500);
                // }

                // lastPinnedMessageValue = data.value;
                break;
              }
            }
          }
        });

        // Save reference of `subscription` in a ref
        sessionStoreListenersRef.current.push(subscription);
      };

      addSessionStoreListeners();

      return () => {
        // remove Session Store key update listener on cleanup
        sessionStoreListenersRef.current.forEach((listener) =>
          listener.remove()
        );

        // if (toastTimeoutId !== null) clearTimeout(toastTimeoutId);
      };
    }
  }, [hmsSessionStore]);
};

export const useHMSSessionStore = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  useEffect(() => {
    const onSessionStoreAvailableListener = ({
      sessionStore,
    }: {
      sessionStore: HMSSessionStore;
    }) => {
      // Saving `sessionStore` reference in `redux`
      dispatch(saveUserData({ hmsSessionStore: sessionStore }));
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE,
      onSessionStoreAvailableListener
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE
      );
    };
  }, [hmsInstance]);
};

export const useHMSMessages = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  useEffect(() => {
    const onMessageListener = (message: HMSMessage) => {
      dispatch(addMessage(message));
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessageListener
    );

    return () => {
      // TODO: Remove this listener when user leaves, removed or room is ended
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_MESSAGE);
    };
  }, [hmsInstance]);
};

export const useHMSPIPRoomLeave = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  // TODO: What if this is undefined?
  const navigation = useNavigation();

  useEffect(() => {
    const pipRoomLeaveHandler = () => {
      hmsInstance
        .destroy()
        .then((s) => {
          console.log('Destroy Success: ', s);
          // TODOS:
          // - If show `Meeting_Ended` is true, show Meeting screen by setting state to MEETING_ENDED
          //    - Reset Redux States
          //    - HMSInstance will not be available now
          //    - When your presses "Re Join" Action button, restart process from root component
          //    - When your presses "Done" Action button
          //        - If we have callback fn, call it
          //        - Otherwise try our best to navigate away from current screen
          //
          // - No screen to show
          //    - No need to reset redux state?
          //    - HMSInstance will be available till this point
          //    - If we have callback fn, call it
          //    - Otherwise try our best to navigate away from current screen
          //    - When we are navigated away from screen, HMSInstance will be not available

          // dispatch(clearMessageData());
          // dispatch(clearPeerData());
          // dispatch(clearHmsReference());

          // if (navigation.canGoBack()) {
          //   navigation.goBack();
          // } else {
          // TODO: remove this later
          navigation.navigate('QRCodeScreen' as never);
          dispatch(clearStore());
          // }
        })
        .catch((e) => {
          console.log(`Destroy HMS instance Error: ${e}`);
          Toast.showWithGravity(
            `Destroy HMS instance Error: ${e}`,
            Toast.LONG,
            Toast.TOP
          );
        });
    };

    hmsInstance.addEventListener(
      HMSPIPListenerActions.ON_PIP_ROOM_LEAVE,
      pipRoomLeaveHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSPIPListenerActions.ON_PIP_ROOM_LEAVE);
    };
  }, [hmsInstance]);
};

export const useHMSRemovedFromRoomUpdate = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  // TODO: What if this is undefined?
  const navigation = useNavigation();

  useEffect(() => {
    const removedFromRoomHandler = () => {
      hmsInstance
        .destroy()
        .then((s) => {
          console.log('Destroy Success: ', s);
          // TODOS:
          // - If show `Meeting_Ended` is true, show Meeting screen by setting state to MEETING_ENDED
          //    - Reset Redux States
          //    - HMSInstance will not be available now
          //    - When your presses "Re Join" Action button, restart process from root component
          //    - When your presses "Done" Action button
          //        - If we have callback fn, call it
          //        - Otherwise try our best to navigate away from current screen
          //
          // - No screen to show
          //    - No need to reset redux state?
          //    - HMSInstance will be available till this point
          //    - If we have callback fn, call it
          //    - Otherwise try our best to navigate away from current screen
          //    - When we are navigated away from screen, HMSInstance will be not available

          // dispatch(clearMessageData());
          // dispatch(clearPeerData());
          // dispatch(clearHmsReference());

          // if (navigation.canGoBack()) {
          //   navigation.goBack();
          // } else {
          // TODO: remove this later
          navigation.navigate('QRCodeScreen' as never);
          dispatch(clearStore());
          // }
        })
        .catch((e) => {
          console.log(`Destroy HMS instance Error: ${e}`);
          Toast.showWithGravity(
            `Destroy HMS instance Error: ${e}`,
            Toast.LONG,
            Toast.TOP
          );
        });
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      removedFromRoomHandler
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM
      );
    };
  }, [hmsInstance]);
};

export const usePIPListener = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );

  useEffect(() => {
    if (isPipModeActive) {
      const appStateListener = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };

      AppState.addEventListener('focus', appStateListener);

      return () => {
        AppState.removeEventListener('focus', appStateListener);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };
    }
  }, [isPipModeActive]);

  // Check if PIP is supported or not
  useEffect(() => {
    // Only check for PIP support if PIP is not active
    if (hmsInstance && !isPipModeActive) {
      const check = async () => {
        try {
          const isSupported = await hmsInstance.isPipModeSupported();

          if (!isSupported) {
            dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
          }
        } catch (error) {
          dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
        }
      };

      check();
    }
  }, [isPipModeActive, hmsInstance]);
};

let modalTaskRef: { current: any } = { current: null };

export const clearPendingModalTasks = () => {
  if (Platform.OS === 'android') {
    modalTaskRef.current?.cancel();
  } else {
    clearTimeout(modalTaskRef.current);
  }
};

const addModalTask = (task: () => void) => {
  clearPendingModalTasks();

  if (Platform.OS === 'android') {
    modalTaskRef.current = InteractionManager.runAfterInteractions(task);
  } else {
    modalTaskRef.current = setTimeout(task, 500);
  }
};

export const useModalType = () => {
  const dispatch = useDispatch();
  const modalType = useSelector((state: RootState) => state.app.modalType);

  const setModalVisible = (modalType: ModalTypes) => {
    dispatch(setModalType(modalType));
  };

  const handleModalVisible = useCallback(
    (modalType: ModalTypes, delay = false) => {
      if (delay) {
        setModalVisible(ModalTypes.DEFAULT);

        const task = () => {
          setModalVisible(modalType);
        };

        addModalTask(task);
      } else {
        setModalVisible(modalType);
      }
    },
    []
  );

  return {
    modalVisibleType: modalType,
    handleModalVisibleType: handleModalVisible,
  };
};

export const useFetchHMSRoles = () => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();

  useEffect(() => {
    let ignore = false;
    hmsInstance.getRoles().then((roles) => {
      if (!ignore) {
        dispatch(setHMSRoleState(roles));
      }
    });
    return () => {
      ignore = true;
    };
  }, [hmsInstance]);
};

export const useShowLandscapeLayout = () => {
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const localPeerRoleName = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.name
  );

  return (
    isLandscapeOrientation &&
    !!localPeerRoleName &&
    localPeerRoleName.includes('hls-')
  );
};

let hmsConfig: HMSConfig | null = null;

export const clearConfig = () => {
  hmsConfig = null;
};

export const useHMSConfig = () => {
  const hmsInstance = useHMSInstance();
  const store = useStore();

  const getConfig = useCallback(async () => {
    if (hmsConfig) return hmsConfig;

    const storeState = store.getState() as RootState;

    const token = await hmsInstance.getAuthTokenByRoomCode(
      storeState.user.roomCode,
      storeState.user.userId,
      storeState.user.endPoints?.token
    );

    hmsConfig = new HMSConfig({
      authToken: token,
      username: storeState.user.userName,
      captureNetworkQualityInPreview: true,
      endpoint: storeState.user.endPoints?.init,
      // metadata: JSON.stringify({isHandRaised: true}), // To join with hand raised
    });

    return hmsConfig;
  }, [hmsInstance]);

  return { clearConfig, getConfig };
};

export const useSafeDimensions = () => {
  const { height, width } = useSafeAreaFrame();
  const safeAreaInsets = useSafeAreaInsets();

  return {
    safeWidth: width - safeAreaInsets.left - safeAreaInsets.right,
    safeHeight: height - safeAreaInsets.top - safeAreaInsets.bottom,
  };
};

export const useShowChat = (): [
  'none' | 'inset' | 'modal',
  (show: boolean) => void,
] => {
  const dispatch = useDispatch();
  const isHLSViewer = useIsHLSViewer();
  const showChatView = useSelector(
    (state: RootState) => state.chatWindow.showChatView
  );
  const hlsAspectRatio = useSelector(
    (state: RootState) => state.app.hlsAspectRatio
  );
  const chatVisible: 'none' | 'inset' | 'modal' = useMemo(() => {
    if (!showChatView) return 'none';

    if (isHLSViewer && ['16:9', '4:3'].includes(hlsAspectRatio.id))
      return 'inset';

    // TODO: handle case when type modal is selected, but chat modal is not shown because aspect ration modal was just closed
    return 'modal';
  }, [showChatView, hlsAspectRatio.id, isHLSViewer]);

  const isChatVisibleInsetType = chatVisible === 'inset';

  const showChat = useCallback(
    (show: boolean) => {
      if (isChatVisibleInsetType) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: show });
    },
    [isChatVisibleInsetType]
  );

  return [chatVisible, showChat];
};

export const usePortraitChatViewVisible = () => {
  const [chatVisible] = useShowChat();
  const pipModeNotActive = useSelector(
    (state: RootState) => state.app.pipModeStatus !== PipModes.ACTIVE
  );
  const isPortraitOrientation = useIsPortraitOrientation();

  return pipModeNotActive && isPortraitOrientation && chatVisible === 'inset';
};

export const useLandscapeChatViewVisible = () => {
  const [chatVisible] = useShowChat();
  const pipModeNotActive = useSelector(
    (state: RootState) => state.app.pipModeStatus !== PipModes.ACTIVE
  );
  const isLandscapeOrientation = useIsLandscapeOrientation();

  return pipModeNotActive && isLandscapeOrientation && chatVisible === 'inset';
};

export const useFilteredParticipants = () => {
  const hmsInstance = useHMSInstance();
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );
  const [filter, setFilter] = useState('everyone');
  const [participantsSearchInput, setParticipantsSearchInput] = useState('');
  const [hmsPeers, setHmsPeers] = useState<(HMSLocalPeer | HMSRemotePeer)[]>(
    localPeer ? [localPeer] : []
  );

  const filteredPeerTrackNodes = useMemo(() => {
    const newFilteredPeerTrackNodes = hmsPeers?.filter((peer) => {
      if (
        participantsSearchInput.length < 1 ||
        peer.name.includes(participantsSearchInput) ||
        peer.role?.name?.includes(participantsSearchInput)
      ) {
        return true;
      }
      return false;
    });

    if (filter === 'everyone') {
      return newFilteredPeerTrackNodes;
    }

    if (filter === 'raised hand') {
      return newFilteredPeerTrackNodes.filter((peer) => {
        const parsedMetaData = parseMetadata(peer.metadata);
        return parsedMetaData.isHandRaised === true;
      });
    }

    return newFilteredPeerTrackNodes.filter(
      (peer) => peer.role?.name === filter
    );
  }, [participantsSearchInput, filter, hmsPeers]);

  useEffect(() => {
    let ignore = false;

    hmsInstance.getRemotePeers().then((peers) => {
      if (localPeer) {
        InteractionManager.runAfterInteractions(() => {
          if (!ignore) {
            setHmsPeers([localPeer, ...peers]);
          }
        });
      }
    });

    return () => {
      ignore = true;
    };
  }, [localPeer, hmsInstance]);

  return {
    allParticipants: hmsPeers,
    filteredParticipants: filteredPeerTrackNodes,
    selectedFilter: filter,
    changeFilter: setFilter,
    searchText: participantsSearchInput,
    setSearchText: setParticipantsSearchInput,
  };
};
