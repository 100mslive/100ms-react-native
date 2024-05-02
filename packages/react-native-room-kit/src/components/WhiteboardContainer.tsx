import * as React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';

import type { RootState } from '../redux';
import { Whiteboard } from './Whiteboard';

export type WhiteboardContainerProps = {};

export const _WhiteboardContainer = React.forwardRef<
  React.ElementRef<typeof WebView>,
  WhiteboardContainerProps
>((_props, webviewRef) => {
  const fullScreenWhiteboard = useSelector(
    (state: RootState) => state.app.fullScreenWhiteboard
  );

  return (
    <View style={{ flex: 1, marginBottom: 4 }}>
      {fullScreenWhiteboard ? null : <Whiteboard ref={webviewRef} />}
    </View>
  );
});

export const WhiteboardContainer = React.memo(_WhiteboardContainer);
