import * as React from 'react';
import { Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import type { RootState } from '../redux';
import { Whiteboard } from './Whiteboard';

export type WhiteboardContainerProps = {};

export const _WhiteboardContainer = React.forwardRef<
  React.RefObject<React.ElementRef<typeof WebView> | null>,
  WhiteboardContainerProps
>((_props, webviewRef) => {
  const fullScreenWhiteboard = useSelector(
    (state: RootState) => state.app.fullScreenWhiteboard
  );

  return (
    <View style={{ flex: 1, marginBottom: 4 }}>
      {fullScreenWhiteboard ? null : Platform.OS === 'ios' ? (
        <GestureDetector gesture={Gesture.Tap()}>
          <View collapsable={false} style={{ flex: 1 }}>
            <Whiteboard ref={webviewRef} />
          </View>
        </GestureDetector>
      ) : (
        <Whiteboard ref={webviewRef} />
      )}
    </View>
  );
});

export const WhiteboardContainer = React.memo(_WhiteboardContainer);
