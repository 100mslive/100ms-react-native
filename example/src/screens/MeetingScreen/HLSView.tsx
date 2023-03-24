import React, {useRef, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {View, Text, Platform, LayoutAnimation} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import Toast from 'react-native-simple-toast';
import {type HMSRoom, HMSUpdateListenerActions} from '@100mslive/react-native-hms';

import LiveButton, {LiveStates} from '../../components/LiveButton';

import {styles} from './styles';
import {RootState} from '../../redux';
import {PipModes} from '../../utils/types';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  // useRef hook
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const hlsPlayerRef = useRef<VideoPlayer>(null);
  const [currentLiveState, setCurrentLiveState] = useState(LiveStates.LIVE);
  const liveLoadingTimerRef = useRef<NodeJS.Immediate | null>(null);
  const reconnectedGoLiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  useEffect(() => {
    return () => {
      if (liveLoadingTimerRef.current) {
        clearImmediate(liveLoadingTimerRef.current);
      }

      if (reconnectedGoLiveTimerRef.current) {
        clearTimeout(reconnectedGoLiveTimerRef.current);
      }
    };
  }, []);

  const goLive = React.useCallback(() => {
    if (liveLoadingTimerRef.current) {
      clearImmediate(liveLoadingTimerRef.current);
    }

    if (reconnectedGoLiveTimerRef.current) {
      clearTimeout(reconnectedGoLiveTimerRef.current);
      reconnectedGoLiveTimerRef.current = null;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentLiveState(LiveStates.LOADING_LIVE);

    liveLoadingTimerRef.current = setImmediate(() => {
      liveLoadingTimerRef.current = null;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentLiveState(LiveStates.LIVE);
    });
  }, []);

  useEffect(() => {
    if (hmsInstance) {
      hmsInstance.addEventListener(
        HMSUpdateListenerActions.RECONNECTED,
        () => {
          if (reconnectedGoLiveTimerRef.current) {
            clearTimeout(reconnectedGoLiveTimerRef.current);
          }

          reconnectedGoLiveTimerRef.current = setTimeout(() => {
            reconnectedGoLiveTimerRef.current = null;
            goLive();
          }, 1000);
        },
      );

      return () => {
        hmsInstance.removeEventListener(HMSUpdateListenerActions.RECONNECTED);
      }
    }
  }, [hmsInstance, goLive]);

  const handlePausePress = () => setCurrentLiveState(LiveStates.BEHIND_LIVE);

  const handleError = () => {
    Toast.showWithGravity(
      'HLS Stream player error! Try pressing "LIVE" button',
      Toast.LONG,
      Toast.TOP
    );
    setCurrentLiveState(LiveStates.BEHIND_LIVE);
  }

  return (
    <View style={{flex: 1}}>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <View key={index} style={{flex: 1, position: 'relative'}}>
              {currentLiveState !== LiveStates.LOADING_LIVE ? (
                <>
                  <VideoPlayer
                    source={{
                      uri: variant?.hlsStreamUrl,
                    }} // Can be a URL or a local file.
                    onLoad={(data: any) => {
                      const {duration} = data;
                      if (Platform.OS === 'android' && duration > 0) {
                        hlsPlayerRef?.current?.seekTo?.(duration);
                      }
                    }}
                    ref={hlsPlayerRef}
                    resizeMode="contain"
                    onError={handleError} // Callback when video cannot be loaded
                    allowsExternalPlayback={false}
                    style={styles.renderHLSVideo}
                    // hack to stop video from playing when VideoPlayer rerenders due to setting `currentLiveState` to `BEHIND_LIVE`.
                    paused={currentLiveState === LiveStates.BEHIND_LIVE}
                    disableSeekbar={true}
                    disableBack={true}
                    disableTimer={true}
                    disableFullscreen={isPipModeActive}
                    disableVolume={isPipModeActive}
                    disablePlayPause={isPipModeActive}
                    onPause={handlePausePress}
                    pictureInPicture={true}
                    playWhenInactive={true}
                    playInBackground={true}
                  />

                  <LiveButton
                    containerStyle={[
                      styles.liveButton,
                      isPipModeActive ? {right: 0} : null,
                    ]}
                    isLive={currentLiveState === LiveStates.LIVE}
                    onPress={goLive}
                    size={isPipModeActive ? 'small' : undefined}
                    // disabled={currentLiveState !== LiveStates.BEHIND_LIVE}
                  />
                </>
              ) : null}
            </View>
          ) : (
            <View key={index} style={styles.renderVideo}>
              <Text style={styles.interRegular}>
                Trying to load empty source...
              </Text>
            </View>
          ),
        )
      ) : (
        <View style={styles.renderVideo}>
          <Text style={styles.interRegular}>
            Waiting for the Streaming to start...
          </Text>
        </View>
      )}
    </View>
  );
};
export {HLSView};
