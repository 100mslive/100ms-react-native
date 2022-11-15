import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Platform, LayoutAnimation} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import type {HMSRoom} from '@100mslive/react-native-hms';

import LiveButton, {LiveStates} from '../../components/LiveButton';

import {styles} from './styles';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  // useRef hook
  const hlsPlayerRef = useRef<VideoPlayer>(null);
  const [currentLiveState, setCurrentLiveState] = useState(LiveStates.LIVE);
  const liveLoadingTimerRef = useRef<NodeJS.Immediate | null>(null);

  useEffect(() => {
    return () => {
      if (liveLoadingTimerRef.current) {
        clearImmediate(liveLoadingTimerRef.current);
      }
    };
  }, []);

  const goLive = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentLiveState(LiveStates.LOADING_LIVE);

    liveLoadingTimerRef.current = setImmediate(() => {
      liveLoadingTimerRef.current = null;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentLiveState(LiveStates.LIVE);
    });
  };

  const handlePausePress = () => setCurrentLiveState(LiveStates.BEHIND_LIVE);

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
                    // onError={() => console.log('hls video streaming error')}
                    // Callback when video cannot be loaded
                    allowsExternalPlayback={false}
                    style={styles.renderHLSVideo}
                    // hack to stop video from playig when VideoPlayer rerenders due to setting `currentLiveState` to `BEHIND_LIVE`.
                    paused={currentLiveState === LiveStates.BEHIND_LIVE}
                    disableSeekbar={true}
                    disableBack={true}
                    disableTimer={true}
                    onPause={handlePausePress}
                  />

                  <LiveButton
                    containerStyle={styles.liveButton}
                    isLive={currentLiveState === LiveStates.LIVE}
                    onPress={goLive}
                    disabled={currentLiveState !== LiveStates.BEHIND_LIVE}
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
