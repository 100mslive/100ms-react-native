import * as React from 'react';
import type {MutableRefObject} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, View, LayoutAnimation } from 'react-native';
import type { LayoutRectangle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { PeerVideoTileViewProps } from './PeerVideoTile/PeerVideoTileView';
import { PeerMinimizedView, usePeerMinimizedViewDimensions } from './PeerMinimizedView';
import type { RootState } from '../redux';
import { setInsetViewMinimized } from '../redux/actions';

const cornerOffset = {
  x: 8,
  y: 16,
}

export interface MiniViewProps extends Omit<PeerVideoTileViewProps, 'peerTrackNode'> {
  boundingBoxRef: MutableRefObject<LayoutRectangle | null>;
};

export const MiniView: React.FC<Omit<MiniViewProps, 'insetMode'>> = ({ boundingBoxRef, onMoreOptionsPress }) => {
  const isPressed = useSharedValue(false);
  const xOffset = useSharedValue(0);
  const yOffset = useSharedValue(0);
  const start = useSharedValue({ x: 0, y: 0 });
  const dispatch = useDispatch();

  const minimized = useSelector((state: RootState) => state.app.insetViewMinimized);
  const miniviewPeerTrackNode = useSelector((state: RootState) => state.app.miniviewPeerTrackNode);

  const { height: minimizedViewHeigth, width: minimizedViewWidth } = usePeerMinimizedViewDimensions();

  const size = {
    width: minimized ? minimizedViewWidth : 104,
    height: minimized ? minimizedViewHeigth : 186,
  };

  const dimensionStyles = {
    width: size.width,
    height: size.height,
  }

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: xOffset.value },
        { translateY: yOffset.value },
        { scale: withSpring(isPressed.value ? 1.05 : 1) }
      ],
    };
  }, []);

  const handlePanGestureEnd = (e: { velocityX: number; velocityY: number}) => {
    "worklet";

    const { snapPointX, snapPointY } = getSnappingPoints(
      xOffset.value,
      yOffset.value,
      size.width,
      size.height,
      cornerOffset.x,
      cornerOffset.y,
      boundingBoxRef.current
    );

    const finalX = snapPointX;
    const finalY = snapPointY;

    xOffset.value = withSpring(finalX, {
      damping: 100,
      stiffness: 100,
      velocity: e.velocityX
    });
    yOffset.value = withSpring(finalY, {
      damping: 100,
      stiffness: 100,
      velocity: e.velocityY
    });

    start.value = {
      x: finalX,
      y: finalY,
    };
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      xOffset.value = e.translationX + start.value.x;
      yOffset.value = e.translationY + start.value.y;
    })
    .onEnd(handlePanGestureEnd);

  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .maxDistance(1000)
    .onBegin(() => {
      isPressed.value = true;
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  React.useEffect(() => {
    handlePanGestureEnd({ velocityX: 0, velocityY: 0 });

    return () => {
      cancelAnimation(xOffset);
      cancelAnimation(yOffset);
    }
  }, [minimized]);

  const handleMaximize = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(setInsetViewMinimized(false));
  }

  if (!miniviewPeerTrackNode) {
    return null;
  }

  return (
    <GestureDetector gesture={Gesture.Simultaneous(panGesture, longPressGesture)}>
      <Animated.View
        style={[
          styles.miniAnimatedView,
          dimensionStyles,
          animatedStyles
        ]}
      >
        <View style={styles.contentContainer}>
          {minimized ? (
            <PeerMinimizedView peerTrackNode={miniviewPeerTrackNode} onMaximizePress={handleMaximize} />
          ) : (
            <PeerVideoTileView peerTrackNode={miniviewPeerTrackNode} insetMode={true} onMoreOptionsPress={onMoreOptionsPress} />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  miniAnimatedView: {
    position: 'absolute',
    bottom: cornerOffset.y,
    right: cornerOffset.x,
    zIndex: 1,
    elevation: 3,
    shadowOffset: { height: 3, width: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
});

const getSnappingPoints = (
  currentValueX: number,
  currentValueY: number,
  compWidth: number,
  compHeight: number,
  xCornerOffset: number,
  yCornerOffset: number,
  boundingBox: null | { width: number, height: number },
) => {
  'worklet';
  if (!boundingBox) {
    return {
      snapPointX: 0,
      snapPointY: 0,
    }
  }
  const { height, width } = boundingBox;

  return {
    snapPointX: ((Math.abs(currentValueX) + compWidth) < (width / 2)) ? 0 : -width + compWidth + (xCornerOffset * 2),
    snapPointY: ((Math.abs(currentValueY) + compHeight) < (height / 2)) ? 0 : -height + compHeight + (yCornerOffset * 2),
  };
}
