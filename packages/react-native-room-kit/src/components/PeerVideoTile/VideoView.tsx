import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  HMSVideoViewMode,
  HMSView,
  HMSPeer,
} from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';
import { BlurView } from '@react-native-community/blur';

import type { RootState } from '../../redux';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { HMSPinchGesture } from './HMSPinchGesture';
import { AlertTriangleIcon } from '../../Icons';

export interface VideoViewProps {
  trackId: string;
  peer: HMSPeer;
  zoomIn?: boolean;
  overlay?: boolean;
  isDegraded?: boolean;
  scaleType?: HMSVideoViewMode;
  containerStyle?: StyleProp<ViewStyle>;
}

const _VideoView = React.forwardRef<
  React.ElementRef<typeof HMSView>,
  VideoViewProps
>(
  (
    {
      trackId,
      peer,
      overlay,
      isDegraded,
      scaleType,
      containerStyle,
      zoomIn = false,
    },
    hmsViewRef
  ) => {
    const HmsView = useSelector(
      (state: RootState) => state.user.hmsInstance?.HmsView || null
    );
    const mirrorCamera = useSelector(
      (state: RootState) => state.app.joinConfig.mirrorCamera
    );
    const autoSimulcast = useSelector(
      (state: RootState) => state.app.joinConfig.autoSimulcast
    );
    const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
      degradedView: {
        backgroundColor: theme.palette.surface_default,
      },
      degradedText: {
        color: theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-Regular`,
      },
      icon: {
        tintColor: theme.palette.on_surface_high,
      },
    }));

    if (!HmsView) {
      return null;
    }

    const videoView = (
      <View style={[styles.container, containerStyle]}>
        <HmsView
          ref={hmsViewRef}
          setZOrderMediaOverlay={overlay}
          trackId={trackId}
          key={trackId}
          autoSimulcast={autoSimulcast}
          mirror={peer.isLocal ? mirrorCamera : false}
          scaleType={scaleType}
          style={styles.hmsView}
        />
      </View>
    );

    return (
      <View style={styles.container}>
        {zoomIn ? (
          <HMSPinchGesture style={styles.container}>
            {videoView}
          </HMSPinchGesture>
        ) : (
          videoView
        )}

        {isDegraded ? (
          <View style={styles.degradedView}>
            <BlurView style={styles.blurView} blurType="dark" blurAmount={24} />

            <AlertTriangleIcon
              type="fill"
              style={[styles.icon, hmsRoomStyles.icon]}
            />

            <Text
              numberOfLines={2}
              style={[styles.degradedText, hmsRoomStyles.degradedText]}
            >
              {peer.isLocal ? 'Your' : `${peer.name}'s`} network is unstable
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hmsView: {
    flex: 1,
    // height: '100%',
    // width: '100%',
  },
  degradedView: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  degradedText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  icon: {
    width: 32,
    height: 32,
  },
});

export const VideoView = React.memo(_VideoView);
