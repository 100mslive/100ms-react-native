import React, {useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {
  PinchGestureHandler,
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

const ZoomableView = ({children}: {children?: React.ReactNode}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(1)).current;

  const handlePinch = Animated.event([{nativeEvent: {scale}}], {
    useNativeDriver: true,
  });

  const handlePan = Animated.event(
    [{nativeEvent: {translationX: translateX, translationY: translateY}}],
    {useNativeDriver: true},
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePan}>
        <Animated.View>
          <PinchGestureHandler onGestureEvent={handlePinch}>
            <Animated.View
              style={[
                styles.zoomableView,
                {transform: [{scale}, {translateX}, {translateY}]},
              ]}>
              {children}
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export {ZoomableView};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  zoomableView: {
    width: '100%',
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
