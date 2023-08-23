import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenShareIcon } from '../Icons';
import type { RootState } from '../redux';
import { HMSDangerButton } from './HMSDangerButton';
import { useHMSActions } from '../hooks-sdk';
import { useHMSRoomStyleSheet } from '../hooks-util';

export interface HMSLocalScreenshareTileProps {}

export const HMSLocalScreenshareTile: React.FC<
  HMSLocalScreenshareTileProps
> = () => {
  const hmsActions = useHMSActions();

  const isLocalScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared
  );

  const stopScreenshare = async () => {
    await hmsActions.setScreenShareEnabled(false);
  };

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  if (!isLocalScreenShared) {
    return null;
  }

  return (
    <View style={styles.absoluteContainer}>
      <View style={[styles.container, hmsRoomStyles.container]}>
        <View style={styles.wrapper}>
          <ScreenShareIcon />

          <Text style={[styles.text, hmsRoomStyles.text]}>
            You are sharing your screen
          </Text>
        </View>

        <HMSDangerButton
          loading={false}
          onPress={stopScreenshare}
          title="Stop"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    zIndex: 1,
  },
  container: {
    elevation: 2,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 8,
    paddingLeft: 16,
    marginHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginLeft: 8,
  },
});
