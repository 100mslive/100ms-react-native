import * as React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';

import type { RootState } from '../redux';
import { PipModes } from '../utils/types';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { WhiteboardFullScreenButton } from './WhiteboardFullScreenButton';

export type WhiteboardProps = {};

export const _Whiteboard = React.forwardRef<
  React.ElementRef<typeof WebView>,
  WhiteboardProps
>((_props, webviewRef) => {
  const whiteboardUrl = useSelector(
    (state: RootState) => state.hmsStates.whiteboard?.url
  );

  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );
  const isLandscapeOrientation = useIsLandscapeOrientation();

  if (!whiteboardUrl) return null;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <WebView
        ref={webviewRef}
        source={{ uri: whiteboardUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {isPipModeActive || isLandscapeOrientation ? null : (
        <WhiteboardFullScreenButton />
      )}
    </View>
  );
});

export const Whiteboard = React.memo(_Whiteboard);
