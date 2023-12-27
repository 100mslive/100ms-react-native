import {
  HMSChangeTrackStateRequest,
  HMSConfig,
  HMSLocalPeer,
  HMSMessage,
  HMSMessageRecipientType,
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
  useHMSHLSPlayerResolution,
  useHmsViewsResolutionsState,
  setSoftInputMode,
  getSoftInputMode,
  // useHMSPeerUpdates,
} from '@100mslive/react-native-hms';
import type { Chat as ChatConfig } from '@100mslive/types-prebuilt/elements/chat';
import { SoftInputModes } from '@100mslive/react-native-hms';
import type {
  HMSPIPConfig,
  HMSRole,
  HMSSessionStore,
  HMSSessionStoreValue,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
import type {
  ColorPalette,
  DefaultConferencingScreen,
  HLSLiveStreamingScreen,
  Layout,
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

import {
  MaxTilesInOnePage,
  ModalTypes,
  OnLeaveReason,
  PeerListRefreshInterval,
  PipModes,
} from './utils/types';
import type {
  ChatBroadcastFilter,
  OnLeaveHandler,
  PeerTrackNode,
} from './utils/types';
import { createPeerTrackNode, parseMetadata } from './utils/functions';
import {
  batch,
  shallowEqual,
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';
import type { AppDispatch, RootState } from './redux';
import {
  addMessage,
  addNotification,
  addParticipant,
  addParticipants,
  addPinnedMessage,
  addScreenshareTile,
  addUpdateParticipant,
  changeMeetingState,
  changePipModeStatus,
  changeStartingHLSStream,
  clearStore,
  removeNotification,
  removeParticipant,
  removeParticipants,
  removeScreenshareTile,
  replaceParticipantsList,
  saveUserData,
  setActiveChatBottomSheetTab,
  setActiveSpeakers,
  setAutoEnterPipMode,
  setEditUsernameDisabled,
  setFullScreenPeerTrackNode,
  setHMSLocalPeerState,
  setHMSRoleState,
  setHMSRoomState,
  setHandleBackButton,
  setIsLocalAudioMutedState,
  setIsLocalVideoMutedState,
  setLayoutConfig,
  setLocalPeerTrackNode,
  setMiniViewPeerTrackNode,
  setModalType,
  setOnLeaveHandler,
  setPrebuiltData,
  setReconnecting,
  setRoleChangeRequest,
  setStartingOrStoppingRecording,
  updateFullScreenPeerTrackNode,
  updateLocalPeerTrackNode,
  updateMiniViewPeerTrackNode,
  updateScreenshareTile,
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
import type { HMSPrebuiltProps } from './types';
import {
  BackHandler,
  InteractionManager,
  Keyboard,
  Platform,
} from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import {
  useIsLandscapeOrientation,
  useIsPortraitOrientation,
} from './utils/dimension';
import {
  selectChatLayoutConfig,
  selectConferencingScreenConfig,
  selectIsHLSViewer,
  selectLayoutConfigForRole,
  selectShouldGoLive,
  selectVideoTileLayoutConfig,
} from './hooks-util-selectors';
import type { GridViewRefAttrs } from './components/GridView';
import { getRoomLayout } from './modules/HMSManager';
import { DEFAULT_THEME, DEFAULT_TYPOGRAPHY } from './utils/theme';
import { NotificationTypes } from './types';
import { KeyboardState, useSharedValue } from 'react-native-reanimated';
import { useHMSActions } from './hooks-sdk';

export const useHMSListeners = (
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>
) => {
  const hmsInstance = useHMSInstance();
  const updateLocalPeer = useUpdateHMSLocalPeer(hmsInstance);

  useHMSRoomUpdate(hmsInstance);

  useHMSPeersUpdate(hmsInstance, updateLocalPeer, setPeerTrackNodes);

  useHMSPeerListUpdated(hmsInstance);

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

      if (type === HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED) {
        const startingOrStoppingRecording =
          reduxStore.getState().app.startingOrStoppingRecording;

        if (startingOrStoppingRecording) {
          dispatch(setStartingOrStoppingRecording(false));
        }
      } else if (type === HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED) {
        dispatch(changeStartingHLSStream(false));
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
  const hmsActions = useHMSActions();

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
        dispatch(addParticipant(peer));
        return;
      }
      if (type === HMSPeerUpdate.PEER_LEFT) {
        dispatch(removeParticipant(peer));

        // Handling regular tiles list
        setPeerTrackNodes((prevPeerTrackNodes) =>
          removePeerTrackNodes(prevPeerTrackNodes, peer)
        );

        const reduxState = store.getState();

        // Handling Screenshare tiles list
        const screensharePeerTrackNodes =
          reduxState.app.screensharePeerTrackNodes;
        const nodeToRemove = screensharePeerTrackNodes.find(
          (node) => node.peer.peerID === peer.peerID
        );
        if (nodeToRemove) {
          dispatch(removeScreenshareTile(nodeToRemove.id));
        }

        // Handling Full screen view
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
        const reduxState = store.getState();
        const fullScreenPeerTrackNode = reduxState.app.fullScreenPeerTrackNode;
        const miniviewPeerTrackNode = reduxState.app.miniviewPeerTrackNode;
        const localPeerTrackNode = reduxState.app.localPeerTrackNode;
        const initialRole = reduxState.app.initialRole;

        // Currently Applied Layout config
        const currentLayoutConfig = selectLayoutConfigForRole(
          reduxState.hmsStates.layoutConfig,
          peer.role || null
        );

        // Local Tile Inset layout is enabled
        const enableLocalTileInset =
          selectVideoTileLayoutConfig(currentLayoutConfig)?.grid
            ?.enable_local_tile_inset;

        // Local Tile Inset layout is disabled
        const localTileInsetDisbaled = !enableLocalTileInset;

        // Local Tile Inset layout is disabled
        // then update local peer track node available in list of peer track nodes
        if (localTileInsetDisbaled) {
          setPeerTrackNodes((prevPeerTrackNodes) => {
            if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
              return replacePeerTrackNodes(prevPeerTrackNodes, peer);
            }
            return prevPeerTrackNodes;
          });
        }

        batch(() => {
          if (localPeerTrackNode) {
            dispatch(updateLocalPeerTrackNode({ peer }));
          } else if (isPublishingAllowed(peer)) {
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

          // If Local Tile Inset layout is enabled, then update or set it
          if (enableLocalTileInset) {
            if (
              miniviewPeerTrackNode !== null &&
              miniviewPeerTrackNode.peer.peerID === peer.peerID
            ) {
              dispatch(updateMiniViewPeerTrackNode({ peer }));
            } else if (
              miniviewPeerTrackNode === null &&
              peer.role?.publishSettings?.allowed &&
              peer.role.publishSettings.allowed.length > 0
            ) {
              dispatch(
                setMiniViewPeerTrackNode(
                  createPeerTrackNode(peer, peer.videoTrack)
                )
              );
            }
          }
          // If Local Tile Inset layout is disabled, then remove it if it exists
          else if (miniviewPeerTrackNode) {
            dispatch(setMiniViewPeerTrackNode(null));
          }
        });

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        updateLocalPeer();

        if (type === HMSPeerUpdate.ROLE_CHANGED) {
          const parsedLocalPeerMetadata = parseMetadata(peer.metadata);

          if (parsedLocalPeerMetadata.prevRole !== initialRole) {
            const newMetadata = {
              ...parsedLocalPeerMetadata,
              prevRole: initialRole?.name,
            };

            hmsActions
              .changeMetadata(newMetadata)
              .then((r) => {
                console.log('Metadata changed successfully', r);
              })
              .catch((e) => {
                console.log('Metadata change failed', e);
              });
          }
        }
        return;
      }
      if (type === HMSPeerUpdate.ROLE_CHANGED) {
        dispatch(addUpdateParticipant(peer));

        // Handling regular tiles list
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

        const reduxState = store.getState();

        // Handling screenshare tiles list
        if (
          peer.role?.publishSettings?.allowed === undefined ||
          (peer.role?.publishSettings?.allowed &&
            !peer.role?.publishSettings?.allowed.includes('screen'))
        ) {
          const screensharePeerTrackNodes =
            reduxState.app.screensharePeerTrackNodes;
          const nodeToRemove = screensharePeerTrackNodes.find(
            (node) => node.peer.peerID === peer.peerID
          );
          if (nodeToRemove) {
            dispatch(removeScreenshareTile(nodeToRemove.id));
          }
        }

        // Handling full screen view
        if (
          peer.role?.publishSettings?.allowed === undefined ||
          (peer.role?.publishSettings?.allowed &&
            !peer.role?.publishSettings?.allowed.includes('video'))
        ) {
          const fullScreenPeerTrackNode =
            reduxState.app.fullScreenPeerTrackNode;
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
        type === HMSPeerUpdate.HAND_RAISED_CHANGED ||
        type === HMSPeerUpdate.NAME_CHANGED ||
        type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
      ) {
        dispatch(addUpdateParticipant(peer));

        const reduxState = store.getState();

        if (type === HMSPeerUpdate.HAND_RAISED_CHANGED) {
          const handRaised = peer.isHandRaised;

          if (handRaised) {
            const { layoutConfig, localPeer } = reduxState.hmsStates;

            const selectedLayoutConfig = selectLayoutConfigForRole(
              layoutConfig,
              localPeer?.role || null
            );

            // list of roles which should be brought on stage when they raise hand
            const offStageRoles =
              selectedLayoutConfig?.screens?.conferencing?.default?.elements
                ?.on_stage_exp?.off_stage_roles;

            // checking if the current peer role is included in the above list
            const shouldBringOnStage =
              offStageRoles && offStageRoles.includes(peer.role?.name!);

            const canChangeRole =
              reduxState.hmsStates.localPeer?.role?.permissions?.changeRole;

            if (shouldBringOnStage && canChangeRole) {
              dispatch(
                addNotification({
                  id: `${peer.peerID}-${NotificationTypes.HAND_RAISE}`,
                  type: NotificationTypes.HAND_RAISE,
                  peer,
                })
              );
            }
          } else {
            const notifications = reduxState.app.notifications;
            const notificationToRemove = notifications.find(
              (notification) =>
                notification.id ===
                `${peer.peerID}-${NotificationTypes.HAND_RAISE}`
            );
            if (notificationToRemove) {
              dispatch(removeNotification(notificationToRemove.id));
            }
          }
        }

        setPeerTrackNodes((prevPeerTrackNodes) => {
          if (peerTrackNodeExistForPeer(prevPeerTrackNodes, peer)) {
            return replacePeerTrackNodes(prevPeerTrackNodes, peer);
          }
          return prevPeerTrackNodes;
        });

        // Handling screenshare tile views
        const screensharePeerTrackNodes =
          reduxState.app.screensharePeerTrackNodes;
        const nodeToUpdate = screensharePeerTrackNodes.find(
          (node) => node.peer.peerID === peer.peerID
        );
        if (nodeToUpdate) {
          dispatch(updateScreenshareTile({ id: nodeToUpdate.id, peer }));
        }

        // Handling fullscreen view
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

type PeerListUpdate = {
  addedPeers: HMSPeer[];
  removedPeers: HMSPeer[];
};

const useHMSPeerListUpdated = (hmsInstance: HMSSDK) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const peerListUpdateHandler = ({
      addedPeers,
      removedPeers,
    }: PeerListUpdate) => {
      batch(() => {
        dispatch(addParticipants(addedPeers));
        dispatch(removeParticipants(removedPeers));
      });
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_LIST_UPDATED,
      peerListUpdateHandler
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_PEER_LIST_UPDATED
      );
    };
  }, [hmsInstance]);
};

type TrackUpdate = {
  peer: HMSPeer;
  track: HMSTrack;
  type: HMSTrackUpdate;
};

export const isPublishingAllowed = (peer: HMSPeer): boolean => {
  return (
    (peer.role?.publishSettings?.allowed &&
      peer.role?.publishSettings?.allowed?.length > 0) ??
    false
  );
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

      const currentLayoutConfig = selectLayoutConfigForRole(
        reduxState.hmsStates.layoutConfig,
        reduxState.hmsStates.localPeer?.role ?? null
      );

      const localTileInsetEnabled =
        selectVideoTileLayoutConfig(currentLayoutConfig)?.grid
          ?.enable_local_tile_inset;

      if (type === HMSTrackUpdate.TRACK_ADDED) {
        const newPeerTrackNode = createPeerTrackNode(peer, track);

        if (track.source === HMSTrackSource.SCREEN) {
          if (!peer.isLocal && track.type === HMSTrackType.VIDEO) {
            dispatch(addScreenshareTile(newPeerTrackNode));
          }
        } else {
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

            if (peer.isLocal && !localTileInsetEnabled) {
              return [newPeerTrackNode, ...prevPeerTrackNodes];
            }

            if (
              !peer.isLocal &&
              (miniviewPeerTrackNode
                ? newPeerTrackNode.id !== miniviewPeerTrackNode.id
                : true)
            ) {
              return [...prevPeerTrackNodes, newPeerTrackNode];
            }

            return prevPeerTrackNodes;
          });
        }

        // - TODO: update local localPeer state
        // - Pass this updated data to Meeting component -> DisplayView component
        if (peer.isLocal) {
          if (track.source === HMSTrackSource.REGULAR) {
            if (!localPeerTrackNode) {
              if (isPublishingAllowed(newPeerTrackNode.peer)) {
                dispatch(setLocalPeerTrackNode(newPeerTrackNode));
              }
            } else {
              dispatch(
                updateLocalPeerTrackNode(
                  track.type === HMSTrackType.VIDEO ? { peer, track } : { peer }
                )
              );
            }

            if (localTileInsetEnabled) {
              // only setting `miniviewPeerTrackNode`, when:
              // - there is no `miniviewPeerTrackNode`
              // - if there is, then it is of regular track
              if (!miniviewPeerTrackNode) {
                dispatch(setMiniViewPeerTrackNode(newPeerTrackNode));
              } else if (miniviewPeerTrackNode.id === newPeerTrackNode.id) {
                dispatch(
                  updateMiniViewPeerTrackNode(
                    track.type === HMSTrackType.VIDEO
                      ? { peer, track }
                      : { peer }
                  )
                );
              }
            }

            // if (track.type === HMSTrackType.AUDIO) {
            //   dispatch(setIsLocalAudioMutedState(track.isMute()));
            // } else if (track.type === HMSTrackType.VIDEO) {
            //   dispatch(setIsLocalVideoMutedState(track.isMute()));
            // }
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
        if (track.source === HMSTrackSource.SCREEN) {
          if (!peer.isLocal && track.type === HMSTrackType.VIDEO) {
            const screensharePeerTrackNodes =
              reduxState.app.screensharePeerTrackNodes;
            const nodeToRemove = screensharePeerTrackNodes.find(
              (node) => node.track?.trackId === track.trackId
            );
            if (nodeToRemove) {
              dispatch(removeScreenshareTile(nodeToRemove.id));
            }
          }
        } else if (
          track.source === HMSTrackSource.PLUGIN ||
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

        if (
          fullScreenPeerTrackNode &&
          fullScreenPeerTrackNode.id === uniqueId
        ) {
          dispatch(updateFullScreenPeerTrackNode(updatePayload));
        }

        return;
      }
      if (
        type === HMSTrackUpdate.TRACK_RESTORED ||
        type === HMSTrackUpdate.TRACK_DEGRADED
      ) {
        // Checking if track source is screenshare
        if (track.source === HMSTrackSource.SCREEN) {
          // Handling screenshare tiles list
          const screensharePeerTrackNodes =
            reduxState.app.screensharePeerTrackNodes;
          const nodeToUpdate = screensharePeerTrackNodes.find(
            (node) => node.track?.trackId === track.trackId
          );
          if (nodeToUpdate) {
            dispatch(
              updateScreenshareTile({
                id: nodeToUpdate.id,
                isDegraded: type === HMSTrackUpdate.TRACK_DEGRADED,
              })
            );
          }
        } else {
          // Handling regular tiles list
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
        }

        const uniqueId = createPeerTrackNodeUniqueId(peer, track);

        // Handling miniview
        if (miniviewPeerTrackNode && miniviewPeerTrackNode.id === uniqueId) {
          dispatch(
            updateMiniViewPeerTrackNode({
              isDegraded: type === HMSTrackUpdate.TRACK_DEGRADED,
            })
          );
        }

        // Handling full screen view
        if (
          fullScreenPeerTrackNode &&
          fullScreenPeerTrackNode.id === uniqueId
        ) {
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
  return useSelector((state: RootState) => {
    const { layoutConfig, localPeer } = state.hmsStates;
    const selectedLayoutConfig = selectLayoutConfigForRole(
      layoutConfig,
      localPeer?.role || null
    );
    return selectIsHLSViewer(localPeer?.role, selectedLayoutConfig);
  });
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

export const useHMSRoleChangeRequest = (
  callback?: (request: HMSRoleChangeRequest) => void,
  deps?: React.DependencyList
) => {
  const taskRef = useRef<any>(null);
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();

  useEffect(() => {
    const changeRoleRequestHandler = async (request: HMSRoleChangeRequest) => {
      taskRef.current = InteractionManager.runAfterInteractions(() => {
        dispatch(setRoleChangeRequest(request));
        callback?.(request);
      });
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      changeRoleRequestHandler
    );

    return () => {
      taskRef.current?.cancel();
      hmsInstance.removeEventListener(
        HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
      );
    };
  }, [...(deps || []), hmsInstance]);
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
            ?.getRegularTilesFlatlistRef()
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
  const canChangeRole = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.role?.permissions?.changeRole
  );
  const canShowChat = useHMSConferencingScreenConfig(
    (conferencingScreenConfig) => !!conferencingScreenConfig?.elements?.chat
  );

  useEffect(() => {
    const onMessageListener = (message: HMSMessage) => {
      if (message.type === NotificationTypes.ROLE_CHANGE_DECLINED) {
        if (canChangeRole) {
          dispatch(
            addNotification({
              id: `${message.sender?.peerID}-${NotificationTypes.ROLE_CHANGE_DECLINED}`,
              type: NotificationTypes.ROLE_CHANGE_DECLINED,
              peer: message.sender!,
            })
          );
        }
      } else if (message.type === 'EMOJI_REACTION') {
        console.log('Ignoring Emoji Reaction Message: ', message);
      } else if (canShowChat) {
        dispatch(addMessage(message));
      }
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessageListener
    );

    return () => {
      // TODO: Remove this listener when user leaves, removed or room is ended
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_MESSAGE);
    };
  }, [canChangeRole, canShowChat, hmsInstance]);
};

export const useHMSReconnection = () => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();

  useEffect(() => {
    let mounted = true;

    hmsInstance.addEventListener(HMSUpdateListenerActions.RECONNECTING, () => {
      if (mounted) {
        batch(() => {
          dispatch(setReconnecting(true));
          dispatch(
            addNotification({
              id: NotificationTypes.RECONNECTING,
              type: NotificationTypes.RECONNECTING,
            })
          );
        });
      }
    });
    hmsInstance.addEventListener(HMSUpdateListenerActions.RECONNECTED, () => {
      if (mounted) {
        batch(() => {
          dispatch(setReconnecting(false));
          dispatch(removeNotification(NotificationTypes.RECONNECTING));
        });
      }
    });

    return () => {
      mounted = false;
      hmsInstance.removeEventListener(HMSUpdateListenerActions.RECONNECTING);
      hmsInstance.removeEventListener(HMSUpdateListenerActions.RECONNECTED);
    };
  }, [hmsInstance]);
};

export const useHMSPIPRoomLeave = () => {
  const hmsInstance = useHMSInstance();
  const { destroy } = useLeaveMethods();

  useEffect(() => {
    const pipRoomLeaveHandler = () => {
      destroy(OnLeaveReason.PIP);
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
    const removedFromRoomHandler = (data: {
      requestedBy?: HMSPeer | null;
      reason?: string;
      roomEnded?: boolean;
    }) => {
      destroy(
        data.roomEnded ? OnLeaveReason.ROOM_END : OnLeaveReason.PEER_KICKED
      );
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
    const pipModeChangedHandler = (data: {
      isInPictureInPictureMode: boolean;
    }) => {
      dispatch(
        changePipModeStatus(
          data.isInPictureInPictureMode ? PipModes.ACTIVE : PipModes.INACTIVE
        )
      );
    };

    hmsInstance.addEventListener(
      HMSPIPListenerActions.ON_PIP_MODE_CHANGED,
      pipModeChangedHandler
    );

    return () => {
      hmsInstance.removeEventListener(
        HMSPIPListenerActions.ON_PIP_MODE_CHANGED
      );
    };
  }, []);

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

export type PIPConfig = Omit<HMSPIPConfig, 'autoEnterPipMode'>;

export const useEnableAutoPip = () => {
  const hmsInstance = useHMSInstance();

  const enableAutoPip = useCallback(
    (data?: PIPConfig) => {
      hmsInstance.setPipParams({ ...data, autoEnterPipMode: true });
    },
    [hmsInstance]
  );

  return enableAutoPip;
};

export const useDisableAutoPip = () => {
  const hmsInstance = useHMSInstance();

  const disableAutoPip = useCallback(
    (data?: PIPConfig) => {
      hmsInstance.setPipParams({ ...data, autoEnterPipMode: false });
    },
    [hmsInstance]
  );

  return disableAutoPip;
};

export const useAutoPip = (oneToOneCall: boolean) => {
  const enableAutoPip = useEnableAutoPip();
  const disableAutoPip = useDisableAutoPip();

  const autoEnterPipMode = useSelector(
    (state: RootState) => state.app.autoEnterPipMode
  );
  const [numerator, denominator] = usePipAspectRatio(oneToOneCall);

  const remotePeersPresent = useSelector((state: RootState) => {
    const room = state.hmsStates.room;
    return room && room.peerCount !== null ? room.peerCount > 1 : false; // `peerCount` includes local peer
  });

  useEffect(() => {
    if (autoEnterPipMode && remotePeersPresent) {
      enableAutoPip({ aspectRatio: [numerator, denominator] });

      return disableAutoPip;
    }
  }, [
    remotePeersPresent,
    numerator,
    denominator,
    autoEnterPipMode,
    enableAutoPip,
    disableAutoPip,
  ]);
};

export const usePipAspectRatio = (oneToOneCall: boolean): [number, number] => {
  const isHLSViewer = useIsHLSViewer();
  const hlsPlayerResolution = useHMSHLSPlayerResolution();

  const firstSSNodeId = useSelector((state: RootState) => {
    const ssPeerTrackNode = state.app.screensharePeerTrackNodes[0];
    return ssPeerTrackNode?.track?.trackId;
  });

  const ssResolution = useHmsViewsResolutionsState(firstSSNodeId);

  const aspectRatio = useMemo((): [number, number] => {
    // When user is hlsviewer and we have stream resolution
    if (isHLSViewer && hlsPlayerResolution) {
      return [hlsPlayerResolution.width, hlsPlayerResolution.height];
    }
    // When user is hlsviewer and we don't have stream resolution
    if (isHLSViewer) {
      return [9, 16];
    }
    // When we have screenshare resolution, use it
    if (ssResolution) {
      return [ssResolution.width, ssResolution.height];
    }
    // When there is no screenshare and one-to-one call is happening
    if (!firstSSNodeId && oneToOneCall) {
      return [9, 16];
    }
    // default aspect ratio
    return [16, 9];
  }, [
    isHLSViewer,
    firstSSNodeId,
    oneToOneCall,
    ssResolution,
    hlsPlayerResolution,
  ]);

  return aspectRatio;
};

export const useHMSActiveSpeakerUpdates = (
  setPeerTrackNodes: React.Dispatch<React.SetStateAction<PeerTrackNode[]>>,
  active?: boolean
) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const reduxStore = useStore<RootState>();
  const isPortraitOrientation = useIsPortraitOrientation();

  useEffect(() => {
    if (!active) {
      return;
    }

    const handleActiveSpeaker = (data: HMSSpeaker[]) => {
      dispatch(setActiveSpeakers(data));

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
  const isHLSViewer = useIsHLSViewer();

  return isLandscapeOrientation && !!localPeerRoleName && isHLSViewer;
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
        storeState.user.endPoints?.layout
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

export const useShowChatAndParticipants = () => {
  const dispatch = useDispatch();
  const { modalVisibleType, handleModalVisibleType: setModalVisible } =
    useModalType();

  const overlayChatLayout = useHMSChatLayoutConfig(
    (chatConfig) => chatConfig?.is_overlay
  );
  const canShowChat = useHMSConferencingScreenConfig(
    (conferencingScreenConfig) => !!conferencingScreenConfig?.elements?.chat
  );
  const canShowParticipants = useHMSConferencingScreenConfig(
    (conferencingScreenConfig) =>
      !!conferencingScreenConfig?.elements?.participant_list
  );

  // state for inset chat view
  const overlayChatVisible = useSelector(
    (state: RootState) => state.chatWindow.showChatView
  );

  const modalVisible = modalVisibleType === ModalTypes.CHAT_AND_PARTICIPANTS;

  const show = useCallback(
    (view: 'chat' | 'participants') => {
      // Handle Showing Chat View/Modal
      if (view === 'chat') {
        if (!canShowChat) return;

        if (overlayChatLayout) {
          dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: true });
        } else {
          batch(() => {
            dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: false });
            dispatch(setActiveChatBottomSheetTab('Chat'));
          });
          setModalVisible(ModalTypes.CHAT_AND_PARTICIPANTS);
        }
      }
      // Handle Showing Participant
      else if (canShowParticipants) {
        dispatch(setActiveChatBottomSheetTab('Participants'));
        setModalVisible(ModalTypes.CHAT_AND_PARTICIPANTS);
      }
    },
    [overlayChatLayout, canShowChat, canShowParticipants, setModalVisible]
  );

  const hide = useCallback(
    (view: 'chat_overlay' | 'modal') => {
      if (view === 'chat_overlay') {
        dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: false });
      } else {
        setModalVisible(ModalTypes.DEFAULT);
      }
    },
    [overlayChatLayout, setModalVisible]
  );

  return {
    overlayChatVisible,
    modalVisible,
    overlayChatLayout,
    canShowChat,
    canShowParticipants,
    show,
    hide,
  };
};

export const usePortraitChatViewVisible = () => {
  const { overlayChatVisible } = useShowChatAndParticipants();
  const pipModeNotActive = useSelector(
    (state: RootState) => state.app.pipModeStatus !== PipModes.ACTIVE
  );
  const isPortraitOrientation = useIsPortraitOrientation();

  return pipModeNotActive && isPortraitOrientation && overlayChatVisible;
};

export const useLandscapeChatViewVisible = () => {
  const { overlayChatVisible } = useShowChatAndParticipants();
  const pipModeNotActive = useSelector(
    (state: RootState) => state.app.pipModeStatus !== PipModes.ACTIVE
  );
  const isLandscapeOrientation = useIsLandscapeOrientation();

  return pipModeNotActive && isLandscapeOrientation && overlayChatVisible;
};

export type ParticipantAccordianData = {
  id: string;
  label: string;
  showViewAll: boolean;
  data: (HMSPeer | HMSLocalPeer)[];
};

export const useOffStageParticipants = () => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const offStageRoles = useHMSLayoutConfig(
    (layoutConfig) =>
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
        ?.off_stage_roles || null
  );

  const [participantsTotalCounts, setParticipantsTotalCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (offStageRoles) {
      let mounted = true;

      const createIterator = async (forRole: string) => {
        const iterator = hmsInstance.getPeerListIterator({
          byRoleName: forRole,
          limit: 10,
        });
        const participants = await iterator.next();
        if (mounted) {
          dispatch(replaceParticipantsList(participants, forRole));
          setParticipantsTotalCounts((prev) => ({
            ...prev,
            [forRole]: iterator.totalCount,
          }));
        }
      };

      const createIteratorForRoles = () => {
        offStageRoles.forEach((role) => {
          createIterator(role);
        });
      };

      createIteratorForRoles();

      const intervalId = setInterval(() => {
        createIteratorForRoles();
      }, PeerListRefreshInterval);

      return () => {
        mounted = false;
        clearInterval(intervalId);
      };
    }
  }, [offStageRoles]);

  return participantsTotalCounts;
};

export const useFilteredParticipants = (filterText: string) => {
  const roles = useSelector((state: RootState) => state.hmsStates.roles);
  const onStageRole = useHMSLayoutConfig(
    (layoutConfig) =>
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
        ?.on_stage_role || null
  );

  const offStageParticipantsTotalCounts = useOffStageParticipants();

  const formattedSearchText = filterText.trim().toLowerCase();

  const groupedParticipants = useSelector(
    (state: RootState) => state.hmsStates.groupedParticipants
  );

  const sortedRoles = useMemo(
    () => {
      return roles
        .filter((role) => {
          if (!role.name || role.name.startsWith('_')) {
            return false;
          }
          return true;

          // const list = groupedParticipants[role.name!];

          // return list && list.length > 0;
        })
        .sort((a, b) => {
          if (onStageRole) {
            if (a.name === onStageRole && b.name === onStageRole) {
              return 0;
            }

            if (a.name === onStageRole) {
              return -1;
            }

            if (b.name === onStageRole) {
              return 1;
            }
          }

          const canAPublish: boolean =
            (a.publishSettings?.allowed &&
              a.publishSettings.allowed.length > 0) ??
            false;
          const canBPublish: boolean =
            (b.publishSettings?.allowed &&
              b.publishSettings.allowed.length > 0) ??
            false;

          if (canAPublish && canBPublish) {
            return 0;
          }

          if (canAPublish) {
            return -1;
          }

          return 1;
        });
    },
    // [groupedParticipants, onStageRole, roles]
    [onStageRole, roles]
  );

  const participantsAccordianData: ParticipantAccordianData[] = useMemo(() => {
    const t = [];

    const filteredHandRaisedPeers: (HMSPeer | HMSLocalPeer)[][] = [];

    sortedRoles.forEach((role) => {
      const list = groupedParticipants[role.name!];
      const filteredList =
        Array.isArray(list) && formattedSearchText.length > 0
          ? list.filter((peer) =>
              peer.name.toLowerCase().includes(formattedSearchText)
            )
          : list;

      if (Array.isArray(filteredList) && filteredList.length > 0) {
        filteredHandRaisedPeers.push(filteredList);
        const offStageRoleTotalCount =
          offStageParticipantsTotalCounts[role.name!];

        const firstTen = filteredList.slice(0, 10);

        t.push({
          id: role.name!,
          label: `${role.name!} (${
            typeof offStageRoleTotalCount === 'number' &&
            offStageRoleTotalCount > filteredList.length
              ? offStageRoleTotalCount // only use `offStageRoleTotalCount` when it is number and more than list length
              : filteredList.length
          })`,
          showViewAll:
            typeof offStageRoleTotalCount === 'number' &&
            formattedSearchText.length <= 0
              ? offStageRoleTotalCount > 10
              : filteredList.length > 10,
          data: firstTen,
        });
      }
    });

    const handRaisedParticipants = filteredHandRaisedPeers
      .flat()
      .filter((participant) => participant.isHandRaised);

    const firstTenHandRaisedParticipants = handRaisedParticipants.slice(0, 10);

    if (handRaisedParticipants.length > 0) {
      t.unshift({
        id: 'hand-raised',
        label: `Hand Raised (${handRaisedParticipants.length})`,
        showViewAll: handRaisedParticipants.length > 10,
        data: firstTenHandRaisedParticipants,
      });
    }

    return t;
  }, [
    formattedSearchText,
    groupedParticipants,
    offStageParticipantsTotalCounts,
    sortedRoles,
  ]);

  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    participantsAccordianData[0]?.id ?? null
  );

  return {
    data: participantsAccordianData,
    formattedSearchText,
    expandedGroup,
    setExpandedGroup,
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

  const destroy = useCallback(
    (reason: Parameters<OnLeaveHandler>[0]) => {
      try {
        const s = hmsInstance.destroy();
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
          onLeave(reason);
          dispatch(clearStore());
        } else if (
          navigation &&
          typeof navigation.canGoBack === 'function' &&
          navigation.canGoBack()
        ) {
          navigation.goBack();
          dispatch(clearStore());
        } else {
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
    },
    [hmsInstance]
  );

  const leave = useCallback(
    async (reason: OnLeaveReason, shouldEndStream: boolean = false) => {
      if (shouldEndStream) {
        hmsInstance.stopHLSStreaming().catch((error) => {
          console.log('Stop HLS Streaming Error: ', error);
        });
      }
      try {
        const d = await hmsInstance.leave();
        console.log('Leave Success: ', d);
        await destroy(reason);
      } catch (e) {
        console.log(`Leave Room Error: ${e}`);
        Toast.showWithGravity(`Leave Room Error: ${e}`, Toast.LONG, Toast.TOP);
      }
    },
    [destroy, hmsInstance]
  );

  const prebuiltCleanUp = useCallback(async () => {
    try {
      await hmsInstance.leave();
      await hmsInstance.destroy();
      dispatch(clearStore());
    } catch (error) {
      Toast.showWithGravity(
        `Unable to leave or destroy: ${error}`,
        Toast.LONG,
        Toast.TOP
      );
    }
  }, [hmsInstance]);

  const endRoom = useCallback(
    async (reason: OnLeaveReason) => {
      try {
        const d = await hmsInstance.endRoom('Host ended the room');
        console.log('EndRoom Success: ', d);
        await destroy(reason);
      } catch (e) {
        console.log('EndRoom Error: ', e);
      }
    },
    [destroy, hmsInstance]
  );

  return { destroy, leave, endRoom, prebuiltCleanUp };
};

// Returns layout config as it is returned from server
export const useHMSLayoutConfig = <Selected = unknown>(
  selector: (layoutConfig: Layout | null) => Selected,
  equalityFn?: (left: Selected, right: Selected) => boolean
): Selected => {
  return useSelector((state: RootState) => {
    return selector(
      selectLayoutConfigForRole(
        state.hmsStates.layoutConfig,
        state.hmsStates.localPeer?.role || null
      )
    );
  }, equalityFn);
};

type ThemeWithPalette = Theme & { palette: ColorPalette };

export const useHMSRoomTheme = <S>(
  selector?: (theme: ThemeWithPalette) => S
): ThemeWithPalette | S => {
  return useHMSLayoutConfig((layoutConfig) => {
    const roomTheme = layoutConfig?.themes?.find((theme) => theme.default);

    const defaultTheme: ThemeWithPalette = roomTheme
      ? roomTheme.palette
        ? (roomTheme as ThemeWithPalette)
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

export const useHMSRoomTypography = (): Required<Typography> => {
  return useHMSLayoutConfig((layoutConfig) => {
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

    return typography as Required<Typography>;
  }, shallowEqual);
};

export const useHMSRoomStyleSheet = <
  T extends { [key: string]: StyleProp<ViewStyle | TextStyle | ImageStyle> },
>(
  updater: (theme: ThemeWithPalette, typography: Required<Typography>) => T,
  deps: DependencyList = []
): T => {
  const theme = useHMSRoomTheme<ThemeWithPalette>();
  const typography = useHMSRoomTypography();

  return useMemo(
    () => updater(theme, typography),
    [theme, typography, ...deps]
  );
};

export const useHMSRoomStyle = <
  T extends StyleProp<ViewStyle | TextStyle | ImageStyle>,
>(
  updater: (theme: ThemeWithPalette, typography: Required<Typography>) => T,
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
    const sendingTo = chatWindowState.sendTo as
      | HMSRole
      | HMSRemotePeer
      | typeof ChatBroadcastFilter;

    if (message.length <= 0) return;

    const hmsMessageRecipient = new HMSMessageRecipient({
      recipientType:
        'publishSettings' in sendingTo
          ? HMSMessageRecipientType.ROLES
          : 'peerID' in sendingTo
            ? HMSMessageRecipientType.PEER
            : HMSMessageRecipientType.BROADCAST,
      recipientPeer: 'peerID' in sendingTo ? sendingTo : undefined,
      recipientRoles: 'publishSettings' in sendingTo ? [sendingTo] : undefined,
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
          type: 'chat',
          time: new Date(),
          sender: localPeer || undefined,
          recipient: hmsMessageRecipient,
        });
        dispatch(addMessage(localMessage));
      }
    };

    try {
      let result: { messageId: string | undefined };
      if ('publishSettings' in sendingTo) {
        result = await hmsInstance.sendGroupMessage(messageText, [sendingTo]);
      } else if ('peerID' in sendingTo) {
        result = await hmsInstance.sendDirectMessage(messageText, sendingTo);
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

export const useHMSChatLayoutConfig = <Selected = unknown>(
  selector: (chatConfig: ChatConfig | null) => Selected,
  equalityFn?: (left: Selected, right: Selected) => boolean
): Selected => {
  return useHMSLayoutConfig((layoutConfig) => {
    const chatConfig = selectChatLayoutConfig(layoutConfig);
    return selector(chatConfig);
  }, equalityFn);
};

export const useHMSConferencingScreenConfig = <Selected = unknown>(
  selector: (
    conferencingScreenConfig:
      | DefaultConferencingScreen
      | HLSLiveStreamingScreen
      | null
  ) => Selected,
  equalityFn?: (left: Selected, right: Selected) => boolean
): Selected => {
  return useHMSLayoutConfig((layoutConfig) => {
    const conferencingScreenConfig =
      selectConferencingScreenConfig(layoutConfig);
    return selector(conferencingScreenConfig);
  }, equalityFn);
};

export const useBackButtonPress = () => {
  const { handleModalVisibleType } = useModalType();

  const handleBackPress = useSelector(
    (state: RootState) => state.app.handleBackButton
  );

  useEffect(() => {
    if (handleBackPress) {
      const backPressHandler = () => {
        handleModalVisibleType(ModalTypes.LEAVE_ROOM);

        /**
         * When true is returned the event will not be bubbled up
         * & no other back action will execute
         */
        return true;

        /**
         * Returning false will let the event to bubble up & let other event listeners
         * or the system's default back action to be executed.
         */
        // return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backPressHandler
      );

      return () => {
        if (typeof subscription.remove === 'function') {
          subscription.remove();
        } else {
          BackHandler.removeEventListener(
            'hardwareBackPress',
            backPressHandler
          );
        }
      };
    }
  }, [handleBackPress, handleModalVisibleType]);
};

export const useSavePropsToStore = (
  props: HMSPrebuiltProps,
  dispatch: AppDispatch
) => {
  const { roomCode, options, onLeave, handleBackButton, autoEnterPipMode } =
    props;

  dispatch(setPrebuiltData({ roomCode, options }));

  useEffect(() => {
    const passedUserName = options?.userName;
    if (passedUserName && passedUserName.length > 0) {
      dispatch(setEditUsernameDisabled(true));
    }
  }, [roomCode, options]);

  useEffect(() => {
    dispatch(setOnLeaveHandler(onLeave));
  }, [onLeave]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      dispatch(setHandleBackButton(handleBackButton));
    }
  }, [handleBackButton]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      dispatch(setAutoEnterPipMode(autoEnterPipMode));
    }
  }, [autoEnterPipMode]);
};

export const useStartRecording = () => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();

  const startRecording = useCallback(() => {
    dispatch(setStartingOrStoppingRecording(true));

    hmsInstance.startRTMPOrRecording({ record: true }).catch((error) => {
      batch(() => {
        dispatch(setStartingOrStoppingRecording(false));
        dispatch(
          addNotification({
            id: Math.random().toString(16).slice(2),
            type: NotificationTypes.ERROR,
            message: error.message,
          })
        );
      });
    });
  }, [hmsInstance]);

  return {
    startRecording,
  };
};

export const useAndroidSoftInputAdjustResize = () => {
  const currentSoftInputRef = useRef<null | SoftInputModes>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const currentSoftInputMode = getSoftInputMode();

    if (currentSoftInputMode !== SoftInputModes.SOFT_INPUT_ADJUST_RESIZE) {
      currentSoftInputRef.current = currentSoftInputMode;

      setSoftInputMode(SoftInputModes.SOFT_INPUT_ADJUST_RESIZE);

      return () => {
        if (currentSoftInputRef.current !== null) {
          setSoftInputMode(currentSoftInputRef.current);
        }
      };
    }
  }, []);
};

export const useKeyboardState = () => {
  const keyboardState = useSharedValue(KeyboardState.UNKNOWN);

  useEffect(() => {
    let didShowTimeoutId: null | NodeJS.Timeout = null;
    let didHideTimeoutId: null | NodeJS.Timeout = null;

    const didShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
      keyboardState.value = KeyboardState.OPENING;
      if (didShowTimeoutId !== null) {
        clearTimeout(didShowTimeoutId);
      }
      didShowTimeoutId = setTimeout(() => {
        keyboardState.value = KeyboardState.OPEN;
        didShowTimeoutId = null;
      }, 400);
    });

    const didHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardState.value = KeyboardState.CLOSING;
      if (didHideTimeoutId !== null) {
        clearTimeout(didHideTimeoutId);
      }
      didHideTimeoutId = setTimeout(() => {
        keyboardState.value = KeyboardState.CLOSED;
        didHideTimeoutId = null;
      }, 400);
    });

    return () => {
      if (didShowTimeoutId !== null) {
        clearTimeout(didShowTimeoutId);
      }
      if (didHideTimeoutId !== null) {
        clearTimeout(didHideTimeoutId);
      }
      if ('remove' in didShowSubscription) {
        didShowSubscription.remove();
      } else {
        Keyboard.removeSubscription(didShowSubscription);
      }
      if ('remove' in didHideSubscription) {
        didHideSubscription.remove();
      } else {
        Keyboard.removeSubscription(didHideSubscription);
      }
    };
  }, []);

  return { keyboardState };
};
