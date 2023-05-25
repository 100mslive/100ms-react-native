import React, {useRef, useState, useEffect, useImperativeHandle} from 'react';
import {useSelector} from 'react-redux';
import {
  View,
  Text,
  Platform,
  LayoutAnimation,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import type {LoadError} from 'react-native-video';
import Toast from 'react-native-simple-toast';
import {
  type HMSRoom,
  HMSUpdateListenerActions,
  HMSPlayer,
} from '@100mslive/react-native-hms';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  sin,
  interpolateNode,
  useDerivedValue,
  cancelAnimation,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import LiveButton, {LiveStates} from '../../components/LiveButton';

import {styles} from './styles';
import {RootState} from '../../redux';
import {PipModes} from '../../utils/types';
import {runOnJS} from 'react-native-reanimated';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  return (
    <View style={{flex: 1}}>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <View key={index} style={{flex: 1, position: 'relative'}}>
              <HMSPlayer style={styles.renderHLSVideo}>
                <HLSPlayerEmoticons />
              </HMSPlayer>
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

interface EmoticonsData {
  type: 'EMOJI_REACTION';
  emojiId: string;
  senderId: string;
}

interface PlaybackCueEventPayload {
  startDate: string;
  payloadval: string;
}

export const HLSPlayerEmoticonsWithoutRef: React.ForwardRefRenderFunction<{
  handlePlaybackCue(data: any): void;
}> = (props, ref) => {
  const [messages, setMessages] = React.useState<any[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      handlePlaybackCue: (event: PlaybackCueEventPayload) => {
        const parsedPlayload: EmoticonsData = JSON.parse(event.payloadval);
        setMessages(prev => [...prev, {...event, payloadval: parsedPlayload}]);
      },
    }),
    [],
  );

  const handleAnimationComplete = React.useCallback((data: any) => {
    setMessages(prev => prev.filter(message => message !== data));
  }, []);

  return (
    <>
      {messages.map((message, index) => {
        const left = (index % 5) * 60 + 30;
        return (
          <Emoticons
            key={message.startDate + message.payloadval.senderId}
            id={message.startDate + message.payloadval.senderId}
            emoji={getEmojiByString(message.payloadval.emojiId)}
            text={message.payloadval.senderId.slice(0, 6)}
            bottom={0}
            left={left}
            onAnimationComplete={handleAnimationComplete}
          />
        );
      })}
    </>
  );
};

const HLSPlayerEmoticons = React.forwardRef(HLSPlayerEmoticonsWithoutRef);

interface EmoticonsProps {
  id: string;
  emoji: string;
  text: string;
  bottom?: number;
  left?: number;
  onAnimationComplete(data: any): void;
}

const Emoticons: React.FC<EmoticonsProps> = props => {
  const {id, emoji, text, bottom = 0, left = 0, onAnimationComplete} = props;

  const animatedTranslate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const inputs = Array.from({length: 4}, (_, index) => index * 100);
    const outputs = inputs.map(input => Math.sin(input) * 60);
    // const inputs = [0, 70, 230, 300];
    // const outputs = [0, -30, 30, 0];
    return {
      transform: [
        {
          translateX: interpolate(animatedTranslate.value, inputs, outputs, {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        {translateY: animatedTranslate.value * -1},
      ],
      opacity: interpolate(animatedTranslate.value, [200, 300], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  }, []);

  React.useEffect(() => {
    animatedTranslate.value = withTiming(
      300,
      {duration: 2000, easing: Easing.linear},
      () => {
        runOnJS(onAnimationComplete)(id);
      },
    );

    return () => cancelAnimation(animatedTranslate);
  }, [id, onAnimationComplete]);

  return (
    <Animated.View
      style={[emoticonsStyles.container, {bottom, left}, animatedStyle]}
    >
      <Text style={emoticonsStyles.icon}>{emoji}</Text>
      <Text style={emoticonsStyles.text}>{text}</Text>
    </Animated.View>
  );
};

const emoticonsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  text: {
    backgroundColor: 'darkgray',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
});

const emojiMap: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  wave: '👋',
  clap: '👏',
  fire: '🔥',
  tada: '🎉',
  heart_eyes: '😍',
  joy: '😂',
  open_mouth: '😮',
  sob: '😭',
};

const getEmojiByString = (emojiCode: string): string => {
  return emojiMap[emojiCode] || '👍';
};
