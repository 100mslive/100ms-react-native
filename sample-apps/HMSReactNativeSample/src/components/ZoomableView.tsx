import React, {useCallback, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {
  PinchGestureHandler,
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  HandlerStateChangeEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

const ZoomableView = ({children}: {children?: React.ReactNode}) => {
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  let lastScale = 1;
  const translateX = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(1)).current;

  const handlePinch = Animated.event([{nativeEvent: {scale: pinchScale}}], {
    useNativeDriver: true,
  });

  const handlePan = Animated.event(
    [{nativeEvent: {translationX: translateX, translationY: translateY}}],
    {useNativeDriver: true},
  );

  const onHandlerStateChange = useCallback(() => {
    translateY.extractOffset();
    translateX.extractOffset();
  }, [translateX, translateY]);

  const onPinchHandlerStateChange = (
    event: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale *= event.nativeEvent.scale;
      baseScale.setValue(lastScale);
      pinchScale.setValue(1);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handlePan}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View>
          <PinchGestureHandler
            onGestureEvent={handlePinch}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.zoomableView,
                {transform: [{scale: scale}, {translateX}, {translateY}]},
              ]}
            >
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
