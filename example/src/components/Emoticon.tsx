import React from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface EmoticonsProps {
  id: string;
  emoji: string;
  text: string;
  bottom?: number;
  left?: number;
  onAnimationComplete(data: any): void;
}

export const Emoticons: React.FC<EmoticonsProps> = props => {
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
    <Animated.View style={[styles.container, {bottom, left}, animatedStyle]}>
      <Text style={styles.icon}>{emoji}</Text>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
