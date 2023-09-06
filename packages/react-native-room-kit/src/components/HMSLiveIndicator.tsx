import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';

import {
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useModalType,
} from '../hooks-util';
import { EyeIcon } from '../Icons';
import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import { ModalTypes } from '../utils/types';
import { setActiveChatBottomSheetTab } from '../redux/actions';

const _HMSLiveIndicator = () => {
  const dispatch = useDispatch();
  const isHLSViewer = useIsHLSViewer();
  const previewPeerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const live = useSelector(
    (state: RootState) => !!state.hmsStates.room?.hlsStreamingState.running
  );

  const { handleModalVisibleType: setModalVisible } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typograhy) => ({
    live: {
      backgroundColor: theme.palette.alert_error_default,
    },
    liveText: {
      color: theme.palette.alert_error_brighter,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
    viewers: {
      backgroundColor: isHLSViewer
        ? hexToRgbA(theme.palette.background_dim!, 0.64)
        : undefined,
      borderWidth: isHLSViewer ? 0 : 1,
      borderColor: theme.palette.border_bright,
    },
    count: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
  }));

  const showParticipantList = () => {
      if (isHLSViewer) {
        setModalVisible(ModalTypes.PARTICIPANTS);
      } else {
        batch(() => {
          dispatch(setActiveChatBottomSheetTab('Participants'));
          dispatch({ type: 'SET_SHOW_CHAT_VIEW', showChatView: true });
        });
      }
  };

  if (!live) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Live */}
      <View style={[styles.live, hmsRoomStyles.live]}>
        <Text style={[styles.liveText, hmsRoomStyles.liveText]}>LIVE</Text>
      </View>

      {/* Viewer Count */}
      {typeof previewPeerCount === 'number' ? (
        <TouchableOpacity
          style={[styles.viewers, hmsRoomStyles.viewers]}
          onPress={showParticipantList}
        >
          <EyeIcon />

          <Text style={[styles.count, hmsRoomStyles.count]}>
            {previewPeerCount}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const HMSLiveIndicator = React.memo(_HMSLiveIndicator);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  live: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveText: {
    fontSize: 10,
    lineHeight: Platform.OS === 'android' ? 16 : undefined,
    letterSpacing: 1.5,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    paddingLeft: 6,
    marginLeft: 8,
    borderRadius: 4,
  },
  count: {
    fontSize: 10,
    lineHeight: Platform.OS === 'android' ? 16 : undefined,
    letterSpacing: 1.5,
    textAlign: 'center',
    textAlignVertical: 'center',

    marginLeft: 4,
  },
});
