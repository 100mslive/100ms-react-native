import {
  HMSChangeTrackStateRequest,
  HMSConfig,
  HMSLocalPeer,
  HMSMessage,
  HMSMessageRecipientType,
  HMSMessageType,
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
  HMSMessageRecipient,
  // useHMSPeerUpdates,
} from '@100mslive/react-native-hms';
import type {
  HMSRole,
  HMSSessionStore,
  HMSSessionStoreValue,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
import type {
  ColorPalette,
  Theme,
  Typography,
} from '@100mslive/types-prebuilt';
import Toast from 'react-native-simple-toast';
import {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext,
} from 'react';
import type { DependencyList } from 'react';

import { MaxTilesInOnePage, ModalTypes, PipModes } from './utils/types';
import type { PeerTrackNode } from './utils/types';
import { createPeerTrackNode, parseMetadata } from './utils/functions';
import {
  batch,
  shallowEqual,
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';
import type { RootState } from './redux';
import {
  addMessage,
  addPinnedMessage,
  changeMeetingState,
  changePipModeStatus,
  changeStartingHLSStream,
  clearStore,
  saveUserData,
  setFullScreenPeerTrackNode,
  setHMSLocalPeerState,
  setHMSRoleState,
  setHMSRoomState,
  setIsLocalAudioMutedState,
  setIsLocalVideoMutedState,
  setLayoutConfig,
  setLocalPeerTrackNode,
  setMiniViewPeerTrackNode,
  setModalType,
  setStartingOrStoppingRecording,
  updateFullScreenPeerTrackNode,
  updateLocalPeerTrackNode,
  updateMiniViewPeerTrackNode,
} from './redux/actions';
import {
  createPeerTrackNodeUniqueId,
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
  Keyboard,
  LayoutAnimation,
  Platform,
} from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import {
  useIsLandscapeOrientation,
  useIsPortraitOrientation,
} from './utils/dimension';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { selectIsHLSViewer, selectShouldGoLive } from './hooks-util-selectors';
import type { GridViewRefAttrs } from './components/GridView';
import { getRoomLayout } from './modules/HMSManager';
import { DEFAULT_THEME, DEFAULT_TYPOGRAPHY } from './utils/theme';

export const useHMSListeners = (
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>
) => {
  const hmsInstance = useHMSInstance();
  const updateLocalPeer = useUpdateHMSLocalPeer(hmsInstance);

  useHMSRoomUpdate(hmsInstance);

  useHMSPeersUpdate(hmsInstance, updateLocalPeer, setPeerTrackNodes);

  useHMSTrackUpdate(hmsInstance, updateLocalPeer, setPeerTrackNodes);
};

const useHMSRoomUpdate = (hmsInstance: HMSSDK) => {
  const dispatch = useDispatch();
  const reduxStore = useStore<RootState>();

  useEffect(() => {
    const roomUpdateHandler = (data: {
      room: HMSRoom;
      type: HMSRoomUpdate;
    }) => {
      const { room, type } = data;

      dispatch(setHMSRoomState(room));

      // /**
      //  * Handle case when User is joining as HLSViewer,
      //  * before ON_JOIN, if ON_ROOM comes then we can show Meeting screen to user, instead of Loader or Preview
      //  */
      // if (room.localPeer.role?.name?.includes('hls-') ?? false) {
      //   const meetingState = reduxStore.getState().app.meetingState;

      //   batch(() => {
      //     dispatch(setHMSLocalPeerState(room.localPeer));
      //     if (meetingState !== MeetingState.IN_MEETING) {
      //       dispatch(changeMeetingState(MeetingState.IN_MEETING));
      //     }
      //   });
      // }

      if (type === HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED) {
        const startingOrStoppingRecording =
          reduxStore.getState().app.startingOrStoppingRecording;

        if (startingOrStoppingRecording) {
          dispatch(setStartingOrStoppingRecording(false));
        }
      } else if (type === HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED) {
        dispatch(changeStartingHLSStream(false));
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
  hmsInstance: HMSSDK,
  updateLocalPeer: () => void,
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>
) => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  // const inMeeting = useSelector(
  //   (state: RootState) => state.app.meetingState === MeetingState.IN_MEETING
  // );

  useEffect(() => {
    const peerUpdateHandler = ({ peer, type }: PeerUpdate) => {
      // Handle State from Preview screen
      // TODO: When `inMeeting` becomes true Peer Update is resubscribed, we might lose some events during that time
      // if (!inMeeting) {
      //   if (type === HMSPeerUpdate.PEER_JOINED) {
      //     dispatch(addToPreviewPeersList(peer));
      //   } else if (type === HMSPeerUpdate.PEER_LEFT) {
      //     dispatch(removeFromPreviewPeersList(peer));
      //   }
      // }

      // Handle State for Meeting screen
      if (type === HMSPeerUpdate.PEER_JOINED) {
        return;
      }
      if (type === HMSPeerUpdate.PEER_LEFT) {
        setPeerTrackNodes((prevPeerTrackNodes) =>
          removePeerTrackNodes(prevPeerTrackNodes, peer)
        );
        const reduxState = store.getState();
        const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;
        if (
          fullScreenPeerTrackNode !== null &&
          fullScreenPeerTrackNode.peer.peerID === peer.peerID
        ) {
          dispatch(setFullScreenPeerTrackNode(null));
        }
        return;
      }
      if (peer.isLocal) {
        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          return prevPeerTrackNodes;
        });

        const reduxState = store.getState();
        const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;
        const miniviewPeerTrackNode = reduxState.app.miniviewPeerTrackNode;
        const localPeerTrackNode = reduxState.app.localPeerTrackNode;

        batch(() => {
          if (localPeerTrackNode) {
            dispatch(updateLocalPeerTrackNode({ peer }));
          } else {
            dispatch(
              setLocalPeerTrackNode(createPeerTrackNode(peer, peer.videoTrack))
            );
          }

          if (
            fullScreenPeerTrackNode &&
            fullScreenPeerTrackNode.peer.peerID === peer.peerID
          ) {
            dispatch(updateFullScreenPeerTrackNode({ peer }));
          }

          // only set `localPeerTrackNode` as miniview peer track node when we are already using it.
          if (
            miniviewPeerTrackNode &&
            miniviewPeerTrackNode.peer.peerID === peer.peerID
          ) {
            dispatch(updateMiniViewPeerTrackNode({ peer }));
          }
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
        if (
          peer.role?.publishSettings?.allowed === undefined ||
          (peer.role?.publishSettings?.allowed &&
            !peer.role?.publishSettings?.allowed.includes('video'))
        ) {
          const reduxState = store.getState();
          const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;

          if (
            fullScreenPeerTrackNode !== null &&
            fullScreenPeerTrackNode.peer.peerID === peer.peerID
          ) {
            dispatch(setFullScreenPeerTrackNode(null));
          }
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
        const reduxState = store.getState();
        const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;
        if (
          fullScreenPeerTrackNode !== null &&
          fullScreenPeerTrackNode.peer.peerID === peer.peerID
        ) {
          dispatch(updateFullScreenPeerTrackNode({ peer }));
        }
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
  }, [hmsInstance]);
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
  const store = useStore<RootState>();

  useEffect(() => {
    const trackUpdateHandler = ({ peer, track, type }: TrackUpdate) => {
      const reduxState = store.getState();
      const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;
      const miniviewPeerTrackNode = reduxState.app.miniviewPeerTrackNode;
      const localPeerTrackNode = reduxState.app.localPeerTrackNode;

      if (type === HMSTrackUpdate.TRACK_ADDED) {
        const newPeerTrackNode = createPeerTrackNode(peer, track);

        const willCreateMiniviewPeerTrackNode =
          !miniviewPeerTrackNode &&
          peer.isLocal &&
          track.source === HMSTrackSource.REGULAR;

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

          if (
            miniviewPeerTrackNode
              ? newPeerTrackNode.id !== miniviewPeerTrackNode.id
              : !willCreateMiniviewPeerTrackNode
          ) {
            return [...prevPeerTrackNodes, newPeerTrackNode];
          }

          return prevPeerTrackNodes;
        });

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          if (track.source === HMSTrackSource.REGULAR) {
            if (!localPeerTrackNode) {
              dispatch(setLocalPeerTrackNode(newPeerTrackNode));
            } else {
              dispatch(
                updateLocalPeerTrackNode(
                  track.type === HMSTrackType.VIDEO ? { peer, track } : { peer }
                )
              );
            }

            // only setting `miniviewPeerTrackNode`, when:
            // - there is no `miniviewPeerTrackNode`
            // - if there is, then it is of regular track
            if (!miniviewPeerTrackNode) {
              dispatch(setMiniViewPeerTrackNode(newPeerTrackNode));
            } else if (miniviewPeerTrackNode.id === newPeerTrackNode.id) {
              dispatch(
                updateMiniViewPeerTrackNode(
                  track.type === HMSTrackType.VIDEO ? { peer, track } : { peer }
                )
              );
            }
          }
          // else -> {
          //    should `localPeerTrackNode` be created/updated for non-regular track addition?
          //    should `miniviewPeerTrackNode` be created/updated for non-regular track addition?
          // }

          updateLocalPeer();
        } else {
          // only setting `miniviewPeerTrackNode`, when:
          // - there is already `miniviewPeerTrackNode`
          // - and it is of same peer's regular track
          if (
            miniviewPeerTrackNode &&
            miniviewPeerTrackNode.id === newPeerTrackNode.id
          ) {
            dispatch(
              updateMiniViewPeerTrackNode(
                track.type === HMSTrackType.VIDEO ? { peer, track } : { peer }
              )
            );
          }
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

        if (
          fullScreenPeerTrackNode &&
          fullScreenPeerTrackNode.track &&
          fullScreenPeerTrackNode.track.trackId === track.trackId
        ) {
          dispatch(setFullScreenPeerTrackNode(null));
        }

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          if (track.source === HMSTrackSource.REGULAR) {
            if (!peer.audioTrack?.trackId && !peer.videoTrack?.trackId) {
              dispatch(setLocalPeerTrackNode(null));

              // removing `miniviewPeerTrackNode`, when:
              // - `localPeerTrack` was used as `miniviewPeerTrackNode`
              // - and now local peer doesn't have any tracks
              if (
                miniviewPeerTrackNode &&
                miniviewPeerTrackNode.peer.peerID === peer.peerID
              ) {
                dispatch(setMiniViewPeerTrackNode(null));
              }
            } else {
              if (track.type === HMSTrackType.VIDEO) {
                dispatch(updateLocalPeerTrackNode({ peer, track: undefined }));
              } else {
                dispatch(updateLocalPeerTrackNode({ peer }));
              }

              // updating `miniviewPeerTrackNode`
              if (
                miniviewPeerTrackNode &&
                miniviewPeerTrackNode.peer.peerID === peer.peerID
              ) {
                if (track.type === HMSTrackType.VIDEO) {
                  dispatch(
                    updateMiniViewPeerTrackNode({ peer, track: undefined })
                  );
                } else {
                  dispatch(updateMiniViewPeerTrackNode({ peer }));
                }
              }
            }
          }

          updateLocalPeer();
        } else {
          // only removing `miniviewPeerTrackNode`, when:
          // - there is already `miniviewPeerTrackNode`
          // - and it is of same peer's regular track
          const uniqueId = createPeerTrackNodeUniqueId(peer, track);

          if (miniviewPeerTrackNode && miniviewPeerTrackNode.id === uniqueId) {
            dispatch(setMiniViewPeerTrackNode(null));
          }
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

        const uniqueId = createPeerTrackNodeUniqueId(peer, track);

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        const updatePayload =
          track.type === HMSTrackType.VIDEO ? { peer, track } : { peer };

        if (peer.isLocal) {
          dispatch(updateLocalPeerTrackNode(updatePayload));
          updateLocalPeer();
        }

        if (miniviewPeerTrackNode && miniviewPeerTrackNode.id === uniqueId) {
          dispatch(updateMiniViewPeerTrackNode(updatePayload));
        }

        if (fullScreenPeerTrackNode && fullScreenPeerTrackNode.id === uniqueId) {
          dispatch(updateFullScreenPeerTrackNode(updatePayload));
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

        const uniqueId = createPeerTrackNodeUniqueId(peer, track);

        if (miniviewPeerTrackNode && miniviewPeerTrackNode.id === uniqueId) {
          dispatch(
            updateMiniViewPeerTrackNode({
              isDegraded: type === HMSTrackUpdate.TRACK_DEGRADED,
            })
          );
        }
        if (fullScreenPeerTrackNode && fullScreenPeerTrackNode.id === uniqueId) {
          dispatch(
            updateFullScreenPeerTrackNode({
              isDegraded: type === HMSTrackUpdate.TRACK_DEGRADED,
            })
          );
        }
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

export const useHMSSessionStoreListeners = (
  gridViewRef: React.MutableRefObject<GridViewRefAttrs | null>
) => {
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
          // Scroll to start of the list
          gridViewRef.current
            ?.getFlatlistRef()
            .current?.scrollToOffset({ animated: true, offset: 0 });
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
  const { destroy } = useLeaveMethods();

  useEffect(() => {
    const pipRoomLeaveHandler = () => {
      destroy();
    };

    hmsInstance.addEventListener(
      HMSPIPListenerActions.ON_PIP_ROOM_LEAVE,
      pipRoomLeaveHandler
    );

    return () => {
      hmsInstance.removeEventListener(HMSPIPListenerActions.ON_PIP_ROOM_LEAVE);
    };
  }, [destroy, hmsInstance]);
};

export const useHMSRemovedFromRoomUpdate = () => {
  const hmsInstance = useHMSInstance();
  const { destroy } = useLeaveMethods();

  useEffect(() => {
    const removedFromRoomHandler = () => {
      destroy();
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
  }, [destroy, hmsInstance]);
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

export const useHMSNetworkQualityUpdate = () => {
  const hmsInstance = useHMSInstance();

  useEffect(() => {
    hmsInstance.enableNetworkQualityUpdates();

    return () => hmsInstance.disableNetworkQualityUpdates();
  }, [hmsInstance]);
};

export const useHMSActiveSpeakerUpdates = (
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>,
  active?: boolean
) => {
  const hmsInstance = useHMSInstance();
  const reduxStore = useStore<RootState>();
  const isPortraitOrientation = useIsPortraitOrientation();

  useEffect(() => {
    if (!active) {
      return;
    }

    const handleActiveSpeaker = (data: HMSSpeaker[]) => {
      const activePage = reduxStore.getState().app.gridViewActivePage;
      if (activePage !== 0) {
        return;
      }

      setPeerTrackNodes((prevPeerTrackNodes) => {
        // list of active speakers which are not in first page
        const activeSpeakers = data.filter((speaker) => {
          const uniquePeerTrackNodeId = createPeerTrackNodeUniqueId(
            speaker.peer,
            speaker.track
          );

          const inFirstPage = prevPeerTrackNodes.some(
            (prevPeerTrackNode, _idx) => {
              // we are on index which is not in current page
              if (
                _idx >=
                (isPortraitOrientation
                  ? MaxTilesInOnePage.IN_PORTRAIT
                  : MaxTilesInOnePage.IN_LANDSCAPE)
              ) {
                return false;
              }

              return prevPeerTrackNode.id === uniquePeerTrackNodeId;
            }
          );

          return !inFirstPage;
        });

        // All active speakers are in first page already, Do nothing
        if (activeSpeakers.length === 0) {
          return prevPeerTrackNodes;
        }

        // Updated list with all Active Speakers in first page
        return prevPeerTrackNodes.reduce<PeerTrackNode[]>(
          (accumulated, current) => {
            if (
              activeSpeakers.findIndex(
                (activeSpeaker) =>
                  createPeerTrackNodeUniqueId(
                    activeSpeaker.peer,
                    activeSpeaker.track
                  ) === current.id
              ) >= 0
            ) {
              // return [current, ...accumulated];
              accumulated.unshift(current);
              return accumulated;
            }

            // return [...accumulated, current];
            accumulated.push(current);
            return accumulated;
          },
          []
        );
      });
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      handleActiveSpeaker
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_SPEAKER);
    };
  }, [isPortraitOrientation, active, hmsInstance]);
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
  const dispatch = useDispatch();
  const store = useStore();

  const getConfig = useCallback(async () => {
    if (hmsConfig) return hmsConfig;

    const storeState = store.getState() as RootState;

    const token = await hmsInstance.getAuthTokenByRoomCode(
      storeState.user.roomCode,
      storeState.user.userId,
      storeState.user.endPoints?.token
    );

    // TODO: [REMOVE LATER] added trycatch block so that we can join rooms where we are getting error from Layout API
    try {
      const roomLayout = await getRoomLayout(
        hmsInstance,
        token,
        'https://api-nonprod.100ms.live'
      );
      dispatch(setLayoutConfig(roomLayout));
    } catch (error) {
      console.warn('# getRoomLayout error: ', error);
    }

    hmsConfig = new HMSConfig({
      authToken: token,
      username: storeState.user.userName,
      captureNetworkQualityInPreview: true,
      endpoint: storeState.user.endPoints?.init,
      // metadata: JSON.stringify({isHandRaised: true}), // To join with hand raised
    });

    return hmsConfig;
  }, [hmsInstance]);

  const updateConfig = useCallback((data: Partial<HMSConfig>) => {
    if (!hmsConfig) {
      throw new Error('No HMSConfig is available to update!');
    }

    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore
      hmsConfig[key] = value;
    });
  }, []);

  return { clearConfig, updateConfig, getConfig };
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
  const chatVisible: 'none' | 'inset' | 'modal' = useMemo(() => {
    if (!showChatView) return 'none';

    if (isHLSViewer) return 'inset';

    // TODO: handle case when type modal is selected, but chat modal is not shown because aspect ration modal was just closed
    return 'modal';
  }, [showChatView, isHLSViewer]);

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

export const useShouldGoLive = () => {
  const shouldGoLive = useSelector(selectShouldGoLive);

  return shouldGoLive;
};

export const useLeaveMethods = () => {
  const navigation = useContext(NavigationContext);
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const reduxStore = useStore<RootState>();

  const destroy = useCallback(async () => {
    try {
      const s = await hmsInstance.destroy();
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

      const onLeave = reduxStore.getState().user.onLeave;

      if (typeof onLeave === 'function') {
        onLeave();
        dispatch(clearStore());
      } else if (navigation && navigation.canGoBack()) {
        navigation.goBack();
        dispatch(clearStore());
      } else {
        // TODO: call onLeave Callback if provided
        // Otherwise default action is to show "Meeting Ended" screen
        dispatch(clearStore()); // TODO: We need different clearStore for MeetingEnded
        dispatch(changeMeetingState(MeetingState.MEETING_ENDED));
      }
    } catch (e) {
      console.log(`Destroy HMS instance Error: ${e}`);
      Toast.showWithGravity(
        `Destroy HMS instance Error: ${e}`,
        Toast.LONG,
        Toast.TOP
      );
      return Promise.reject(e);
    }
  }, [hmsInstance]);

  const leave = useCallback(async () => {
    try {
      const d = await hmsInstance.leave();
      console.log('Leave Success: ', d);
      await destroy();
    } catch (e) {
      console.log(`Leave Room Error: ${e}`);
      Toast.showWithGravity(`Leave Room Error: ${e}`, Toast.LONG, Toast.TOP);
    }
  }, [destroy, hmsInstance]);

  const goToPreview = useCallback(async () => {
    try {
      await hmsInstance.leave();
      await hmsInstance.destroy();
      dispatch(clearStore());
    } catch (error) {
      Toast.showWithGravity(
        `Unable to go to Preview: ${error}`,
        Toast.LONG,
        Toast.TOP
      );
    }
  }, [hmsInstance]);

  const endRoom = useCallback(async () => {
    try {
      const d = await hmsInstance.endRoom('Host ended the room');
      console.log('EndRoom Success: ', d);
      await destroy();
    } catch (e) {
      console.log('EndRoom Error: ', e);
    }
  }, [destroy, hmsInstance]);

  return { destroy, leave, endRoom, goToPreview };
};

// Returns layout config as it is returned from server
export const useHMSLayoutConfig = () => {
  return useSelector((state: RootState) => state.hmsStates.layoutConfig);
};

export const useHMSRoomTheme = <S>(
  selector?: (theme: Required<Theme>) => S
): Required<Theme> | S => {
  return useSelector((state: RootState) => {
    const layoutConfig = state.hmsStates.layoutConfig;

    const roomTheme = layoutConfig?.themes.find((theme) => theme.default);

    const defaultTheme: Required<Theme> = roomTheme
      ? roomTheme.palette
        ? (roomTheme as Required<Theme>)
        : { ...roomTheme, palette: DEFAULT_THEME.palette }
      : DEFAULT_THEME;

    if (!selector) {
      return defaultTheme;
    }

    return selector(defaultTheme);
  }, shallowEqual);
};

export const useHMSRoomColorPalette = (): ColorPalette => {
  return useHMSRoomTheme((theme) => theme.palette) as ColorPalette;
};

export const useHMSRoomTypography = (): Typography => {
  return useSelector((state: RootState) => {
    const layoutConfig = state.hmsStates.layoutConfig;

    const typography = layoutConfig?.typography;

    if (!typography) {
      return DEFAULT_TYPOGRAPHY;
    }

    if (!typography.font_family) {
      return {
        ...DEFAULT_TYPOGRAPHY,
        ...typography,
      };
    }

    // formatting font family name
    typography.font_family = typography.font_family.replace(/ /g, '');

    return typography;
  }, shallowEqual);
};

export const useHMSRoomStyleSheet = <
  T extends { [key: string]: StyleProp<ViewStyle | TextStyle | ImageStyle> },
>(
  updater: (theme: Required<Theme>, typography: Required<Typography>) => T,
  deps: DependencyList = []
): T => {
  const theme = useHMSRoomTheme<Required<Theme>>();
  const typography = useHMSRoomTypography();

  return useMemo(
    () => updater(theme, typography),
    [theme, typography, ...deps]
  );
};

export const useHMSRoomStyle = <
  T extends StyleProp<ViewStyle | TextStyle | ImageStyle>,
>(
  updater: (theme: Required<Theme>, typography: Required<Typography>) => T,
  deps: DependencyList = []
): T => {
  return useHMSRoomStyleSheet(
    (theme, typography) => ({
      default: updater(theme, typography),
    }),
    deps
  ).default;
};

export const useSendMessage = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const reduxStore = useStore<RootState>();

  const message = useSelector(
    (state: RootState) => state.chatWindow.typedMessage
  );

  const setMessage = useCallback((text: string) => {
    dispatch({ type: 'SET_TYPED_MESSAGE', typedMessage: text });
  }, []);

  const sendMessage = useCallback(async () => {
    const chatWindowState = reduxStore.getState().chatWindow;

    const message = chatWindowState.typedMessage;
    const sendingToType = chatWindowState.sendToType;
    const sendingTo = chatWindowState.sendTo as
      | HMSRole
      | HMSRemotePeer
      | { name: string };

    if (message.length <= 0) return;

    const hmsMessageRecipient = new HMSMessageRecipient({
      recipientType:
        sendingToType === 'role'
          ? HMSMessageRecipientType.ROLES
          : sendingToType === 'direct'
          ? HMSMessageRecipientType.PEER
          : HMSMessageRecipientType.BROADCAST,
      recipientPeer:
        sendingToType === 'direct' && 'peerID' in sendingTo
          ? sendingTo
          : undefined,
      recipientRoles: sendingToType === 'role' ? [sendingTo] : undefined,
    });

    // Saving reference of `message` state to local variable
    // to use the typed message after clearing state
    const messageText = message;

    dispatch({ type: 'SET_TYPED_MESSAGE', typedMessage: '' });

    const handleMessageID = ({
      messageId,
    }: {
      messageId: string | undefined;
    }) => {
      const localPeer = reduxStore.getState().hmsStates.localPeer;

      if (messageId) {
        Keyboard.dismiss();
        const localMessage = new HMSMessage({
          messageId: messageId,
          message: messageText,
          type: HMSMessageType.CHAT,
          time: new Date(),
          sender: localPeer || undefined,
          recipient: hmsMessageRecipient,
        });
        dispatch(addMessage(localMessage));
      }
    };

    try {
      let result: { messageId: string | undefined };
      if (sendingToType === 'role') {
        result = await hmsInstance.sendGroupMessage(messageText, [
          sendingTo as HMSRole,
        ]);
      } else if (sendingToType === 'direct') {
        result = await hmsInstance.sendDirectMessage(
          messageText,
          sendingTo as HMSPeer
        );
      } else {
        result = await hmsInstance.sendBroadcastMessage(messageText);
      }
      handleMessageID(result);

      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }, []);

  return {
    message,
    setMessage,
    sendMessage,
  };
};
