import React, {ComponentRef, useRef, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import {HMSHLSPlayer} from '@100mslive/react-native-hmslive';
import {AvoidSoftInput} from 'react-native-avoid-softinput';

import {RootState} from '../redux';
import {changeShowHLSStats} from '../redux/actions';
import {HLSPlayerStatsView} from './HLSPlayerStatsView';
import {HLSPlayerEmoticons} from './HLSPlayerEmoticons';
import {CustomControls} from './CustomHLSPlayerControls';
import {ChatView} from './ChatWindow';
import {COLORS} from '../utils/theme';
import {usePortraitChatViewVisible} from '../hooks-util';
import {HMSHLSNotStarted} from './HMSHLSNotStarted';

export const HLSView: React.FC = () => {
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.hmsStates.room);
  const hmsHlsPlayerRef = useRef<ComponentRef<typeof HMSHLSPlayer>>(null);
  const showHLSStats = useSelector(
    (state: RootState) => state.app.joinConfig.showHLSStats,
  );
  const showCustomHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.showCustomHLSPlayerControls,
  );
  const enableHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.enableHLSPlayerControls,
  );
  const hlsAspectRatio = useSelector(
    (state: RootState) => state.app.hlsAspectRatio,
  );
  const portraitChatViewVisible = usePortraitChatViewVisible();

  const handleClosePress = () => {
    dispatch(changeShowHLSStats(false));
  };

  const hlsPlayerActions = <
    T extends
      | 'play'
      | 'stop'
      | 'pause'
      | 'resume'
      | 'seekForward'
      | 'seekBackward'
      | 'seekToLive'
      | 'setVolume',
  >(
    action: T,
    ...args: any[]
  ) => {
    switch (action) {
      case 'play': {
        hmsHlsPlayerRef.current?.play(args[0]);
        break;
      }
      case 'stop': {
        hmsHlsPlayerRef.current?.stop();
        break;
      }
      case 'pause': {
        hmsHlsPlayerRef.current?.pause();
        break;
      }
      case 'resume': {
        hmsHlsPlayerRef.current?.resume();
        break;
      }
      case 'seekForward': {
        hmsHlsPlayerRef.current?.seekForward(args[0]);
        break;
      }
      case 'seekBackward': {
        hmsHlsPlayerRef.current?.seekBackward(args[0]);
        break;
      }
      case 'seekToLive': {
        hmsHlsPlayerRef.current?.seekToLivePosition();
        break;
      }
      case 'setVolume': {
        hmsHlsPlayerRef.current?.setVolume(args[0]);
        break;
      }
    }
  };

  useEffect(() => {
    AvoidSoftInput.setAdjustNothing();
    AvoidSoftInput.setEnabled(true);

    return () => AvoidSoftInput.setEnabled(false);
  }, []);

  return (
    <View style={styles.hlsView}>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <View
              key={index}
              style={[
                styles.hlsPlayerContainer,
                portraitChatViewVisible ? styles.taleLessSpaceAsYouCan : null,
              ]}
            >
              {/* <View>
                <Animated.View style={{flex: canShowChatView ? 0 : 1}} collapsable={false} layout={}> */}
              <HMSHLSPlayer
                ref={hmsHlsPlayerRef}
                containerStyle={
                  portraitChatViewVisible ? styles.taleLessSpaceAsYouCan : null
                }
                aspectRatio={hlsAspectRatio.value}
                enableStats={showHLSStats}
                enableControls={enableHLSPlayerControls}
              />
              {/* </Animated.View>
              </View> */}
              <HLSPlayerEmoticons />
              {showHLSStats ? (
                <HLSPlayerStatsView onClosePress={handleClosePress} />
              ) : null}
              {showCustomHLSPlayerControls ? (
                <CustomControls handleControlPress={hlsPlayerActions} />
              ) : null}
            </View>
          ) : (
            <View key={index} style={styles.textContainer}>
              <Text style={styles.warningSubtitle}>Stream URL not found!</Text>
            </View>
          ),
        )
      ) : (
        <HMSHLSNotStarted />
      )}

      {portraitChatViewVisible ? <ChatView /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  hlsView: {
    flex: 1,
  },
  hlsPlayerContainer: {
    flex: 1,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtitle: {
    color: COLORS.INDICATORS.WARNING,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  taleLessSpaceAsYouCan: {
    flex: 0,
  },
});
