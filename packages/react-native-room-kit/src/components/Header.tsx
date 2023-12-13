import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { HMSManageCameraRotation } from './HMSManageCameraRotation';
import { useHMSRoomStyle } from '../hooks-util';
import { HMSManageAudioOutput } from './HMSManageAudioOutput';
import { HMSRecordingIndicator } from './HMSRecordingIndicator';
import { CompanyLogo } from './CompanyLogo';
import { HMSLiveIndicator } from './HMSLiveIndicator';

interface HeaderProps {
  transparent?: boolean;
  showControls?: boolean;
}

const TOP_PADDING = 8;
const BOTTOM_PADDING = 16;
const CONTENT_HEIGHT = 42;
export const HEADER_HEIGHT = TOP_PADDING + CONTENT_HEIGHT + BOTTOM_PADDING;

export const useHeaderHeight = (excludeSafeArea: boolean = false) => {
  const { top } = useSafeAreaInsets();
  return (excludeSafeArea ? 0 : top) + HEADER_HEIGHT;
};

export const _Header: React.FC<HeaderProps> = ({
  transparent = false,
  showControls = true,
}) => {
  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  return (
    <SafeAreaView style={transparent ? null : containerStyles} edges={['top','left','right']}>
      <View style={[styles.container, transparent ? null : containerStyles]}>
        <View style={styles.logoContainer}>
          <CompanyLogo style={styles.logo} />

          <HMSRecordingIndicator />

          <HMSLiveIndicator />
        </View>

        {showControls ? (
          <View style={styles.controls}>
            <View style={styles.cameraRotationWrapper}>
              <HMSManageCameraRotation />
            </View>

            <HMSManageAudioOutput />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: TOP_PADDING,
    paddingBottom: BOTTOM_PADDING,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  cameraRotationWrapper: {
    marginRight: 16,
  },
});

export const Header = memo(_Header);
