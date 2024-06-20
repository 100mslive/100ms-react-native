import { HMSRoom, HMSLocalPeer } from '@100mslive/react-native-hms';
import type {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSMessage,
  HMSNoiseCancellationPlugin,
  HMSPeer,
  HMSPoll,
  HMSPollQuestion,
  HMSRemoteAudioStats,
  HMSRemoteVideoStats,
  HMSRole,
  HMSRoleChangeRequest,
  HMSSDK,
  HMSSessionStore,
  HMSSpeaker,
  HMSWhiteboard,
} from '@100mslive/react-native-hms';
import type { HMSVirtualBackgroundPlugin } from '../../modules/videoPluginWrapper';
import type { Layout } from '@100mslive/types-prebuilt';

import type {
  ChatBottomSheetTabs,
  HMSIOSScreenShareConfig,
  ModalTypes,
  OnLeaveHandler,
  PeerTrackNode,
  PipModes,
} from '../../utils/types';
import actionTypes, {
  HmsStateActionTypes,
  PollsStateActionTypes,
} from '../actionTypes';
import type {
  AddPollQuestionAction,
  SetPollConfigAction,
  SetPollNameAction,
  DeletePollQuestionAction,
  SetDeleteConfirmationVisible,
  SetSelectedQuestionIndexAction,
  SetQuestionTypeAction,
  SetQuestionTitleAction,
  AddQuestionOptionAction,
  DeleteQuestionOptionAction,
  EditQuestionOptionAction,
  SetQuestionSkippable,
  SetQuestionResponseEditable,
  SetQuestionSavedAction,
  SetLaunchingPollAction,
  ClearPollsStateAction,
  AddPollAction,
  UpdatePollAction,
  SetSelectedPollIdAction,
  AddPollQuestionResponseAction,
  SetPollQuestionResponseAction,
  RemovePollQuestionResponseAction,
  SetQuestionPointWeightageAction,
  SetQuestionCorrectOptionAction,
  PushToNavigationStackAction,
  PopFromNavigationStackAction,
  ReplaceTopOfNavigationStackAction,
  AddLeaderboardAction,
  ResetNavigationStackAction,
} from '../actionTypes';
import { MeetingState } from '../../types';
import type { ChatState, Notification, PinnedMessage } from '../../types';

export const setPrebuiltData = (data: {
  roomCode?: string;
  token?: string;
  options?: {
    userName?: string;
    userId?: string;
    debugMode?: boolean;
    endPoints?: {
      init: string;
      token: string;
      layout: string;
    };
    ios?: HMSIOSScreenShareConfig;
  };
}) => ({
  type: HmsStateActionTypes.SET_PREBUILT_DATA,
  payload: data,
});

export const setOnLeaveHandler = (onLeave?: OnLeaveHandler) => ({
  type: HmsStateActionTypes.SET_ON_LEAVE_HANDLER,
  payload: { onLeave },
});

export const clearStore = () => ({
  type: HmsStateActionTypes.CLEAR_STATES,
});

export const setRoomLocallyMuted = (roomLocallyMuted: boolean) => ({
  type: HmsStateActionTypes.SET_ROOM_LOCALLY_MUTED,
  roomLocallyMuted,
});

export const setIsLocalVideoMutedState = (
  isLocalVideoMuted: boolean | undefined
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_VIDEO_MUTED_STATE,
  isLocalVideoMuted,
});

export const setIsLocalAudioMutedState = (
  isLocalAudioMuted: boolean | undefined
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_AUDIO_MUTED_STATE,
  isLocalAudioMuted,
});

export const setIsLocalScreenSharedState = (
  isLocalScreenShared: boolean | undefined
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_SCREEN_SHARED_STATE,
  isLocalScreenShared,
});

export const setHMSRoleState = (roles: HMSRole[]) => ({
  type: HmsStateActionTypes.SET_ROLES_STATE,
  roles,
});

export const setHMSRoomState = (room: HMSRoom | null) => ({
  type: HmsStateActionTypes.SET_ROOM_STATE,
  room,
});

export const setHMSLocalPeerState = (localPeer: HMSLocalPeer | null) => ({
  type: HmsStateActionTypes.SET_LOCAL_PEER_STATE,
  localPeer,
});

export const setHMSInstance = (hmsInstance: HMSSDK) => ({
  type: actionTypes.SET_HMS_INSTANCE,
  payload: { hmsInstance },
});

export const addMessage = (data: HMSMessage) => ({
  type: actionTypes.ADD_MESSAGE.REQUEST,
  payload: data,
});

export const addPinnedMessages = (data: PinnedMessage[]) => ({
  type: actionTypes.ADD_PINNED_MESSAGES.REQUEST,
  payload: data,
});

export const clearMessageData = () => ({
  type: actionTypes.CLEAR_MESSAGE_DATA.REQUEST,
});

export const setPeerState = (data: { peerState: PeerTrackNode[] }) => ({
  type: actionTypes.SET_PEER_STATE,
  payload: data,
});

export const changePipModeStatus = (pipModeStatus: PipModes) => ({
  type: actionTypes.CHANGE_PIP_MODE_STATUS,
  payload: { pipModeStatus },
});

export const clearPeerData = () => ({
  type: actionTypes.CLEAR_PEER_DATA.REQUEST,
});

export const saveUserData = (data: {
  hmsInstance?: HMSSDK;
  hmsSessionStore?: HMSSessionStore;
  spotlightTrackId?: string | null;
  isHLSFlow?: boolean;
  roles?: HMSRole[];
}) => ({
  type: actionTypes.SAVE_USER_DATA.REQUEST,
  payload: data,
});

export const clearHmsReference = () => ({
  type: actionTypes.CLEAR_HMS_INSTANCE,
});

export const resetJoinConfig = () => ({ type: actionTypes.RESET_JOIN_CONFIG });

export const changeMirrorCamera = (value: boolean) => ({
  type: actionTypes.CHANGE_MIRROR_CAMERA,
  payload: { mirrorCamera: value },
});

export const changeShowStats = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_STATS,
  payload: { showStats: value },
});

export const changeShowHLSStats = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_HLS_STATS,
  payload: { showHLSStats: value },
});

export const changeShowCustomHLSPlayerControls = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_CUSTOM_HLS_PLAYER_CONTROLS,
  payload: { showCustomHLSPlayerControls: value },
});

export const changeEnableHLSPlayerControls = (value: boolean) => ({
  type: actionTypes.CHANGE_ENABLE_HLS_PLAYER_CONTROLS,
  payload: { enableHLSPlayerControls: value },
});

export const changeAutoSimulcast = (value: boolean) => ({
  type: actionTypes.CHANGE_AUTO_SIMULCAST,
  payload: { autoSimulcast: value },
});

export const setRTCStats = (
  trackId: string,
  stats:
    | HMSLocalAudioStats
    | HMSLocalVideoStats[]
    | HMSRemoteAudioStats
    | HMSRemoteVideoStats
) => ({
  type: actionTypes.SET_RTC_STATS,
  payload: { trackId, stats },
});

export const changeHLSAspectRatio = (value: { value: number; id: string }) => ({
  type: actionTypes.CHANGE_HLS_ASPECT_RATIO,
  payload: { hlsAspectRatio: value },
});

export const changeUsername = (userName: string) => ({
  type: HmsStateActionTypes.SET_USER_NAME,
  payload: { userName },
});

export const setModalType = (modalType: ModalTypes) => ({
  type: actionTypes.SET_MODAL_TYPE,
  payload: { modalType },
});

export const setPeerToUpdate = (peerToUpdate: HMSPeer) => ({
  type: actionTypes.SET_PEER_TO_UPDATE,
  payload: { peerToUpdate },
});

export const addToPreviewPeersList = (peer: HMSPeer) => ({
  type: HmsStateActionTypes.ADD_TO_PREVIEW_PEERS_LIST,
  peer,
});

export const removeFromPreviewPeersList = (peer: HMSPeer) => ({
  type: HmsStateActionTypes.REMOVE_FROM_PREVIEW_PEERS_LIST,
  peerId: peer.peerID,
});

export const changeMeetingState = (meetingState: MeetingState) => ({
  type: actionTypes.SET_MEETING_STATE,
  payload: { meetingState },
});

export const setInsetViewMinimized = (insetViewMinimized: boolean) => ({
  type: actionTypes.SET_INSET_VIEW_MINIMIZED,
  payload: { insetViewMinimized },
});

export const setMiniViewPeerTrackNode = (
  miniviewPeerTrackNode: PeerTrackNode | null
) => ({
  type: actionTypes.SET_MINI_VIEW_PEERTRACKNODE,
  payload: { miniviewPeerTrackNode },
});

export const updateMiniViewPeerTrackNode = (
  data: Partial<Omit<PeerTrackNode, 'id'>>
) => ({
  type: actionTypes.UPDATE_MINI_VIEW_PEERTRACKNODE,
  payload: data,
});

export const setFullScreenPeerTrackNode = (
  fullScreenPeerTrackNode: PeerTrackNode | null
) => ({
  type: actionTypes.SET_FULLSCREEN_PEERTRACKNODE,
  payload: { fullScreenPeerTrackNode },
});

export const setFullScreenWhiteboard = (fullScreenWhiteboard: boolean) => ({
  type: actionTypes.SET_FULLSCREEN_WHITEBOARD,
  payload: { fullScreenWhiteboard },
});

export const updateFullScreenPeerTrackNode = (
  data: Partial<Omit<PeerTrackNode, 'id'>>
) => ({
  type: actionTypes.UPDATE_FULLSCREEN_PEERTRACKNODE,
  payload: data,
});

export const setLocalPeerTrackNode = (
  localPeerTrackNode: PeerTrackNode | null
) => ({
  type: actionTypes.SET_LOCAL_PEERTRACKNODE,
  payload: { localPeerTrackNode },
});

export const updateLocalPeerTrackNode = (
  data: Partial<Omit<PeerTrackNode, 'id' | 'isDegraded'>>
) => ({
  type: actionTypes.UPDATE_LOCAL_PEERTRACKNODE,
  payload: data,
});

export const changeStartingHLSStream = (startingHLSStream: boolean) => ({
  type: actionTypes.SET_STARTING_HLS_STREAM,
  payload: { startingHLSStream },
});

export const setLayoutConfig = (layoutConfig: Layout[]) => ({
  type: HmsStateActionTypes.SET_LAYOUT_CONFIG,
  layoutConfig,
});

export const setGridViewActivePage = (pageNumber: number) => ({
  type: actionTypes.SET_GRID_VIEW_ACTIVE_PAGE,
  payload: { gridViewActivePage: pageNumber },
});

export const setStartingOrStoppingRecording = (
  startingOrStoppingRecording: boolean
) => ({
  type: actionTypes.SET_STARTING_OR_STOPPING_RECORDING,
  payload: { startingOrStoppingRecording },
});

export const addScreenshareTile = (screenshareNode: PeerTrackNode) => ({
  type: actionTypes.ADD_SCREENSHARE_TILE,
  payload: { screenshareNode },
});

export const removeScreenshareTile = (
  peerTrackNodeId: PeerTrackNode['id']
) => ({
  type: actionTypes.REMOVE_SCREENSHARE_TILE,
  payload: { id: peerTrackNodeId },
});

export const updateScreenshareTile = (
  data: Partial<PeerTrackNode> & { id: string }
) => ({
  type: actionTypes.UPDATE_SCREENSHARE_TILE,
  payload: data,
});

export const addNotification = (notification: Notification) => ({
  type: actionTypes.ADD_NOTIFICATION,
  payload: { notification },
});

export const removeNotification = (notificationId: Notification['id']) => ({
  type: actionTypes.REMOVE_NOTIFICATION,
  payload: { id: notificationId },
});

export const setRoleChangeRequest = (
  roleChangeRequest: HMSRoleChangeRequest | null
) => ({
  type: HmsStateActionTypes.SET_ROLE_CHANGE_REQUEST,
  roleChangeRequest,
});

export const setActiveChatBottomSheetTab = (
  activeChatBottomSheetTab: (typeof ChatBottomSheetTabs)[number]
) => ({
  type: actionTypes.SET_ACTIVE_CHAT_BOTTOM_SHEET_TAB,
  payload: { activeChatBottomSheetTab },
});

export const setChatFilterSheetVisible = (chatFilterSheetVisible: boolean) => ({
  type: actionTypes.SET_CHAT_FILTER_SHEET_VISIBLE,
  payload: { chatFilterSheetVisible },
});

export const setChatMoreActionsSheetVisible = (
  chatMoreActionsSheetVisible: boolean
) => ({
  type: actionTypes.SET_CHAT_MORE_ACTIONS_SHEET_VISIBLE,
  payload: { chatMoreActionsSheetVisible },
});

export const setChatState = (chatState: null | ChatState) => ({
  type: actionTypes.SET_CHAT_STATE,
  payload: { chatState },
});

export const addParticipant = (participant: HMSPeer) => ({
  type: HmsStateActionTypes.ADD_PARTICIPANT,
  participant,
});

export const addParticipants = (participants: HMSPeer[]) => ({
  type: HmsStateActionTypes.ADD_PARTICIPANTS,
  participants,
});

export const removeParticipant = (participant: HMSPeer) => ({
  type: HmsStateActionTypes.REMOVE_PARTICIPANT,
  participant,
});

export const removeParticipants = (participants: HMSPeer[]) => ({
  type: HmsStateActionTypes.REMOVE_PARTICIPANTS,
  participants,
});

export const addUpdateParticipant = (participant: HMSPeer) => ({
  type: HmsStateActionTypes.UPDATE_PARTICIPANT,
  participant,
});

export const replaceParticipantsList = (
  participants: HMSPeer[],
  roleName: string
) => ({
  type: HmsStateActionTypes.REPLACE_PARTICIPANTS_LIST,
  participants,
  roleName,
});

export const setActiveSpeakers = (activeSpeakers: HMSSpeaker[]) => ({
  type: HmsStateActionTypes.SET_ACTIVE_SPEAKERS,
  activeSpeakers,
});

export const setReconnecting = (reconnecting: boolean) => ({
  type: HmsStateActionTypes.SET_RECONNECTING,
  reconnecting,
});

export const setNoiseCancellationPlugin = (
  noiseCancellationPlugin: HMSNoiseCancellationPlugin
) => ({
  type: HmsStateActionTypes.SET_NOISE_CANCELLATION_PLUGIN,
  noiseCancellationPlugin,
});

export const setVideoPlugin = (videoPlugin: HMSVirtualBackgroundPlugin) => ({
  type: HmsStateActionTypes.SET_VIDEO_PLUGIN,
  videoPlugin,
});

export const setWhiteboard = (whiteboard: HMSWhiteboard | null) => ({
  type: HmsStateActionTypes.SET_WHITEBOARD,
  whiteboard,
});

export const setHandleBackButton = (handleBackButton?: boolean) => ({
  type: actionTypes.SET_HANDLE_BACK_BUTTON,
  payload: { handleBackButton },
});

export const setAutoEnterPipMode = (autoEnterPipMode?: boolean) => ({
  type: actionTypes.SET_AUTO_ENTER_PIP_MODE,
  payload: { autoEnterPipMode },
});

export const setEditUsernameDisabled = (editUsernameDisabled: boolean) => ({
  type: actionTypes.SET_EDIT_USERNAME_DISABLED,
  payload: { editUsernameDisabled },
});

export const setSelectedMessageForAction = (
  selectedMessageForAction: null | HMSMessage
) => ({
  type: actionTypes.SET_SELECTED_MESSAGE_FOR_ACTION,
  payload: { selectedMessageForAction },
});

export const setInitialRole = (initialRole: HMSRole) => ({
  type: actionTypes.SET_INITIAL_ROLE,
  payload: { initialRole },
});

export const setChatPeerBlacklist = (chatPeerBlacklist: string[]) => ({
  type: actionTypes.SET_CHAT_PEER_BLACKLIST,
  payload: { chatPeerBlacklist },
});

export const filterOutMsgsFromBlockedPeers = (chatPeerBlacklist: string[]) => ({
  type: actionTypes.FILTER_OUT_BLOCKED_MSGS,
  payload: chatPeerBlacklist,
});

export const setHlsDescriptionPaneVisible = (visible: boolean) => ({
  type: actionTypes.SET_HLS_DESC_PANE_VISIBLE,
  payload: { visible },
});

export const setHlsFullScreen = (fullScreen: boolean) => ({
  type: actionTypes.SET_HLS_FULL_SCREEN,
  payload: { fullScreen },
});

export const setAndroidHLSStreamPaused = (paused: boolean) => ({
  type: actionTypes.SET_ANDROID_HLS_STREAM_PAUSED,
  payload: { hlsStreamPaused_android: paused },
});

export const setSelectedVirtualBackground = (vb: string | null) => ({
  type: actionTypes.SET_SELECTED_VIRTUAL_BG,
  payload: { selectedVirtualBackground: vb },
});

export const setShowClosedCaptions = (showClosedCaptions: boolean) => ({
  type: actionTypes.SET_SHOW_CLOSED_CAPTIONS,
  payload: { showClosedCaptions },
});

/**
 * POLLS
 */

export const setPollQDeleteConfirmationVisible = (
  deleteConfirmationVisible: SetDeleteConfirmationVisible['deleteConfirmationVisible']
): SetDeleteConfirmationVisible => ({
  type: PollsStateActionTypes.SET_DELETE_CONFIRMATION_VISIBLE,
  deleteConfirmationVisible,
});

export const setPollName = (
  pollName: SetPollNameAction['pollName']
): SetPollNameAction => ({
  type: PollsStateActionTypes.SET_POLL_NAME,
  pollName,
});

export const setPollConfig = (
  pollConfig: SetPollConfigAction['pollConfig']
): SetPollConfigAction => ({
  type: PollsStateActionTypes.SET_POLL_CONFIG,
  pollConfig,
});

export const pushToNavigationStack = (
  screen: PushToNavigationStackAction['screen']
): PushToNavigationStackAction => ({
  type: PollsStateActionTypes.PUSH_TO_NAVIGATION_STACK,
  screen,
});

export const resetNavigationStack = (): ResetNavigationStackAction => ({
  type: PollsStateActionTypes.RESET_NAVIGATION_STACK,
});

export const popFromNavigationStack = (): PopFromNavigationStackAction => ({
  type: PollsStateActionTypes.POP_FROM_NAVIGATION_STACK,
});

export const replaceTopOfNavigationStack = (
  screen: ReplaceTopOfNavigationStackAction['screen']
): ReplaceTopOfNavigationStackAction => ({
  type: PollsStateActionTypes.REPLACE_TOP_OF_NAVIGATION_STACK,
  screen,
});

export const addPollQuestion = (): AddPollQuestionAction => ({
  type: PollsStateActionTypes.ADD_POLL_QUESTION,
});

export const deletePollQuestion = (): DeletePollQuestionAction => ({
  type: PollsStateActionTypes.DELETE_POLL_QUESTION,
});

export const setSelectedPollQuestionIndex = (
  index: SetSelectedQuestionIndexAction['index']
): SetSelectedQuestionIndexAction => ({
  type: PollsStateActionTypes.SET_SELECTED_QUESTION_INDEX,
  index,
});

export const setPollQuestionType = (
  questionIndex: SetQuestionTypeAction['questionIndex'],
  questionType: SetQuestionTypeAction['questionType']
): SetQuestionTypeAction => ({
  type: PollsStateActionTypes.SET_QUESTION_TYPE,
  questionIndex,
  questionType,
});

export const setPollQuestionTitle = (
  questionIndex: SetQuestionTitleAction['questionIndex'],
  title: SetQuestionTitleAction['title']
): SetQuestionTitleAction => ({
  type: PollsStateActionTypes.SET_QUESTION_TITLE,
  questionIndex,
  title,
});

export const setPollQuestionPointWeightage = (
  questionIndex: SetQuestionPointWeightageAction['questionIndex'],
  pointWeightage: SetQuestionPointWeightageAction['pointWeightage']
): SetQuestionPointWeightageAction => ({
  type: PollsStateActionTypes.SET_POINT_WEIGHTAGE,
  questionIndex,
  pointWeightage,
});

export const addPollQuestionOption = (
  questionIndex: AddQuestionOptionAction['questionIndex']
): AddQuestionOptionAction => ({
  type: PollsStateActionTypes.ADD_QUESTION_OPTION,
  questionIndex,
});

export const deletePollQuestionOption = (
  questionIndex: DeleteQuestionOptionAction['questionIndex'],
  index: DeleteQuestionOptionAction['index']
): DeleteQuestionOptionAction => ({
  type: PollsStateActionTypes.DELETE_QUESTION_OPTION,
  index,
  questionIndex,
});

export const editPollQuestionOption = (
  questionIndex: EditQuestionOptionAction['questionIndex'],
  optionIndex: EditQuestionOptionAction['optionIndex'],
  option: EditQuestionOptionAction['option']
): EditQuestionOptionAction => ({
  type: PollsStateActionTypes.EDIT_QUESTION_OPTION,
  questionIndex,
  optionIndex,
  option,
});

export const setPollQuestionCorrectOption = (
  questionIndex: SetQuestionCorrectOptionAction['questionIndex'],
  optionIndex: SetQuestionCorrectOptionAction['optionIndex'],
  correctOption: SetQuestionCorrectOptionAction['correctOption']
): SetQuestionCorrectOptionAction => ({
  type: PollsStateActionTypes.SET_QUESTION_CORRECT_OPTION,
  questionIndex,
  optionIndex,
  correctOption,
});

export const setPollQuestionSkippable = (
  questionIndex: SetQuestionSkippable['questionIndex'],
  skippable: boolean
): SetQuestionSkippable => ({
  type: PollsStateActionTypes.SET_QUESTION_SKIPPABLE,
  questionIndex,
  skippable,
});

export const setPollQuestionResponseEditable = (
  questionIndex: SetQuestionResponseEditable['questionIndex'],
  responseEditable: boolean
): SetQuestionResponseEditable => ({
  type: PollsStateActionTypes.SET_QUESTION_RES_EDITABLE,
  questionIndex,
  responseEditable,
});

export const setPollQuestionSaved = (
  questionIndex: SetQuestionResponseEditable['questionIndex'],
  saved: boolean
): SetQuestionSavedAction => ({
  type: PollsStateActionTypes.SET_QUESTION_SAVED,
  questionIndex,
  saved,
});

export const setLaunchingPoll = (
  launching: SetLaunchingPollAction['launching']
): SetLaunchingPollAction => ({
  type: PollsStateActionTypes.SET_LAUNCHING_POLL,
  launching,
});

export const clearPollsState = (): ClearPollsStateAction => ({
  type: PollsStateActionTypes.CLEAR_POLLS_STATE,
});

export const cleaPollFormState = () => ({
  type: PollsStateActionTypes.CLEAR_POLL_FORM_STATE,
});

export const setSelectedPollId = (pollId: string): SetSelectedPollIdAction => ({
  type: PollsStateActionTypes.SET_SELECTED_POLL_ID,
  pollId,
});

export const addPoll = (poll: HMSPoll): AddPollAction => ({
  type: PollsStateActionTypes.ADD_POLL,
  poll,
});

export const updatePoll = (poll: HMSPoll): UpdatePollAction => ({
  type: PollsStateActionTypes.UPDATE_POLL,
  poll,
});

export const setPollQuestionResponse = (
  pollId: HMSPoll['pollId'],
  questionIndex: HMSPollQuestion['index'],
  response: SetPollQuestionResponseAction['response']
): SetPollQuestionResponseAction => ({
  type: PollsStateActionTypes.SET_POLL_QUESTION_RESPONSE,
  pollId,
  questionIndex,
  response,
});

export const addPollQuestionResponse = (
  pollId: HMSPoll['pollId'],
  questionIndex: HMSPollQuestion['index'],
  response: AddPollQuestionResponseAction['response']
): AddPollQuestionResponseAction => ({
  type: PollsStateActionTypes.ADD_POLL_QUESTION_RESPONSE,
  pollId,
  questionIndex,
  response,
});

export const removePollQuestionResponse = (
  pollId: HMSPoll['pollId'],
  questionIndex: HMSPollQuestion['index'],
  response: RemovePollQuestionResponseAction['response']
): RemovePollQuestionResponseAction => ({
  type: PollsStateActionTypes.REMOVE_POLL_QUESTION_RESPONSE,
  pollId,
  questionIndex,
  response,
});

export const addCuedPollId = (pollId: string) => ({
  type: PollsStateActionTypes.ADD_CUED_POLL_ID,
  pollId,
});

export const addLeaderboard = (
  pollId: AddLeaderboardAction['pollId'],
  leaderboard: AddLeaderboardAction['leaderboard']
): AddLeaderboardAction => ({
  type: PollsStateActionTypes.ADD_LEADERBOARD,
  pollId,
  leaderboard,
});
