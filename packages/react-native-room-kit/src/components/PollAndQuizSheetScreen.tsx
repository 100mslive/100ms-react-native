import * as React from 'react';
import { StyleSheet } from 'react-native';

import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';

export interface PollAndQuizSheetScreenProps {
  zIndex: number;
}

export const PollAndQuizSheetScreen: React.FC<PollAndQuizSheetScreenProps> = ({
  children,
  zIndex,
}) => {
  return (
    <Animated.View
      entering={SlideInRight.duration(150)}
      exiting={SlideOutRight.duration(150)}
      style={[styles.absolute, { zIndex }]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
