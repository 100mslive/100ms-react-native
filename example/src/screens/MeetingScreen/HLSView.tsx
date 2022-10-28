import React, {useRef} from 'react';
import {View, Text, Platform} from 'react-native';
import Video from 'react-native-video';
import type {HMSRoom} from '@100mslive/react-native-hms';

import {styles} from './styles';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  // useRef hook
  const hlsPlayerRef = useRef<Video>(null);

  return (
    <View>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <Video
              key={index}
              source={{
                uri: variant?.hlsStreamUrl,
              }} // Can be a URL or a local file.
              controls={Platform.OS === 'ios' ? true : false}
              onLoad={({duration}) => {
                if (Platform.OS === 'android') {
                  hlsPlayerRef?.current?.seek(duration);
                }
              }}
              ref={hlsPlayerRef}
              resizeMode="contain"
              onError={() => console.log('hls video streaming error')}
              // Callback when video cannot be loaded
              allowsExternalPlayback={false}
              style={styles.renderVideo}
            />
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
