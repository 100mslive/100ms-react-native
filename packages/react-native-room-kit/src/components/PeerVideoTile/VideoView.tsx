import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { HMSVideoViewMode, HMSView, HMSPeer } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import type { RootState } from '../../redux';
import { useHMSRoomStyleSheet } from '../../hooks-util';

export interface VideoViewProps {
  trackId: string;
  peer: HMSPeer;
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
    { trackId, peer, overlay, isDegraded, scaleType, containerStyle },
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
        fontFamily: `${typography.font_family}-SemiBold`,
      },
    }));

    if (!HmsView) {
      return null;
    }

    return (
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

        {isDegraded ? (
          <View style={[styles.degradedView, hmsRoomStyles.degradedView]}>
            <Text style={[styles.degradedText, hmsRoomStyles.degradedText]}>Degraded</Text>
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
  degradedText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});

export const VideoView = React.memo(_VideoView);
