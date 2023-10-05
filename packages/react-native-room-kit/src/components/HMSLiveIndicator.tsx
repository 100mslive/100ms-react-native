import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useShowChatAndParticipants,
} from '../hooks-util';
import { EyeIcon } from '../Icons';
import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';

const _HMSLiveIndicator = () => {
  const isHLSViewer = useIsHLSViewer();
  const previewPeerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const live = useSelector(
    (state: RootState) => !!state.hmsStates.room?.hlsStreamingState?.running
  );

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
        ? theme.palette.background_dim &&
          hexToRgbA(theme.palette.background_dim, 0.64)
        : undefined,
      borderWidth: isHLSViewer ? 0 : 1,
      borderColor: theme.palette.border_bright,
    },
    count: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
  }));

  const { canShowParticipants, show } = useShowChatAndParticipants();

  const showParticipantsSheet = () => {
    show('participants');
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
          onPress={showParticipantsSheet}
          disabled={!canShowParticipants}
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
