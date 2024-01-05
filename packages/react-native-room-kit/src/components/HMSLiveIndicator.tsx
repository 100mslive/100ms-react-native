import * as React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { COLORS } from '../utils/theme';
import { TestIds } from '../utils/constants';
import { useIsAnyStreamingOn } from '../hooks-sdk';

const _HMSLiveIndicator = () => {
  const live = useIsAnyStreamingOn();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typograhy) => ({
    live: {
      backgroundColor: theme.palette.alert_error_default,
    },
    liveText: {
      color: COLORS.WHITE,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
  }));

  if (!live) {
    return null;
  }

  return (
    <View style={[styles.live, hmsRoomStyles.live]}>
      <Text
        testID={TestIds.live_text}
        style={[styles.liveText, hmsRoomStyles.liveText]}
      >
        LIVE
      </Text>
    </View>
  );
};

export const HMSLiveIndicator = React.memo(_HMSLiveIndicator);

const styles = StyleSheet.create({
  live: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
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
});
