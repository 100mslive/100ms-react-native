import React from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  HMSHLSPlayer,
  HMSHLSPlayerPlaybackState,
  useHMSHLSPlayerPlaybackState,
  useHMSHLSPlayerSubtitles,
} from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
// import { changeShowHLSStats } from '../redux/actions';
// import { HLSPlayerStatsView } from './HLSPlayerStatsView';
import { HLSPlayerEmoticons } from './HLSPlayerEmoticons';
import { COLORS, hexToRgbA } from '../utils/theme';
import { HMSHLSNotStarted } from './HMSHLSNotStarted';
import { CrossCircleIcon } from '../Icons';
import {
  useHLSPlayerConstraints,
  useHLSViewsConstraints,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';
import { HMSPinchGesture } from './PeerVideoTile/HMSPinchGesture';

export interface HLSPlayerProps {}

export const _HLSPlayer = React.forwardRef<
  React.ElementRef<typeof HMSHLSPlayer>,
  HLSPlayerProps
>((_props, hlsPlayerRef) => {
  // const dispatch = useDispatch();
  const isHLSStreaming = useIsHLSStreamingOn();
  const isStreamUrlPresent = useSelector(
    (state: RootState) =>
      !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  );
  // const showHLSStats = useSelector(
  //   (state: RootState) => state.app.joinConfig.showHLSStats
  // );
  // const showCustomHLSPlayerControls = useSelector(
  //   (state: RootState) => state.app.joinConfig.showCustomHLSPlayerControls
  // );
  const enableHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.enableHLSPlayerControls
  );

  // const handleClosePress = () => {
  //   dispatch(changeShowHLSStats(false));
  // };

  const hlsPlayerConstraints = useHLSPlayerConstraints();
  const { playerWrapperConstraints } = useHLSViewsConstraints();
  const [playerKey, setPlayerKey] = React.useState(1);

  const prevReconnectingRef = React.useRef<null | boolean>(null);
  const reconnecting = useSelector(
    (state: RootState) => state.hmsStates.reconnecting
  );

  const hlsPlayerPlaybackState = useHMSHLSPlayerPlaybackState();

  const subtitles = useHMSHLSPlayerSubtitles();

  const isPlaybackFailed =
    hlsPlayerPlaybackState === HMSHLSPlayerPlaybackState.FAILED;

  const isPlayerBuffering =
    hlsPlayerPlaybackState === HMSHLSPlayerPlaybackState.BUFFERING;

  React.useEffect(() => {
    const prevReconnecting = prevReconnectingRef.current;

    if (
      Platform.OS === 'android' &&
      prevReconnecting && // previously were in reconnection state
      reconnecting === false && // now in reconnected state
      isPlaybackFailed // and player playback is in failed state
    ) {
      // Recreate the HLS PLayer instance
      setPlayerKey((prevKey) => (prevKey += 1));
    }

    prevReconnectingRef.current = reconnecting;
  }, [reconnecting, isPlaybackFailed]);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    failedContainer: {
      backgroundColor: theme.palette.background_dim
        ? hexToRgbA(theme.palette.background_dim, 0.7)
        : COLORS.LOADING_BACKDROP,
    },
    failedText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    warningText: {
      color: theme.palette.alert_warning,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    semiboldWhite: {
      fontFamily: `${typography.font_family}-SemiBold`,
      color: '#ffffff',
    },
  }));

  const { primary_bright: PrimaryBrightColor } = useHMSRoomColorPalette();

  if (!isHLSStreaming) return <HMSHLSNotStarted />;

  if (!isStreamUrlPresent)
    return (
      <View style={styles.textContainer}>
        <Text style={[styles.warningSubtitle, hmsRoomStyles.warningText]}>
          Stream URL not found!
        </Text>
      </View>
    );

  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            styles.playerAndCaptionWrapper,
            {
              width: playerWrapperConstraints.width,
              height: hlsPlayerConstraints.height,
            },
          ]}
        >
          <HMSPinchGesture>
            <View pointerEvents="none" style={styles.playerContainer}>
              <HMSHLSPlayer
                key={playerKey}
                ref={hlsPlayerRef}
                enableStats={true}
                enableControls={enableHLSPlayerControls}
                containerStyle={styles.playerContainer}
                style={{
                  width: hlsPlayerConstraints.width,
                  height: hlsPlayerConstraints.height,
                }}
              />
            </View>
          </HMSPinchGesture>

          <View
            style={[
              { width: playerWrapperConstraints.width - 48, left: 24 },
              styles.closedCaptionsContainer,
            ]}
          >
            <Text style={[styles.closedCaptions, hmsRoomStyles.semiboldWhite]}>
              {subtitles}
            </Text>
          </View>
        </View>
      </View>

      <HLSPlayerEmoticons />

      {/* {showHLSStats ? (
        <HLSPlayerStatsView onClosePress={handleClosePress} />
      ) : null} */}

      {isPlayerBuffering ? (
        <View
          style={[
            styles.playbackFailedContainer,
            hmsRoomStyles.failedContainer,
          ]}
        >
          <ActivityIndicator size={'large'} color={PrimaryBrightColor} />
        </View>
      ) : null}

      {isPlaybackFailed ? (
        <View
          style={[
            styles.playbackFailedContainer,
            hmsRoomStyles.failedContainer,
          ]}
        >
          <CrossCircleIcon />

          <Text style={[styles.playbackFailed, hmsRoomStyles.failedText]}>
            Playback Failed
          </Text>
        </View>
      ) : null}
    </>
  );
});

export const HLSPlayer = React.memo(_HLSPlayer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAndCaptionWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    flex: undefined,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtitle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  closedCaptionsContainer: {
    position: 'absolute',
    bottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedCaptions: {
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 3,
    textShadowOffset: { width: 1, height: 1 },
  },
  playbackFailedContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  playbackFailed: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
});
