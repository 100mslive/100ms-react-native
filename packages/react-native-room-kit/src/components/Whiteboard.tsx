import * as React from 'react';
import { Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';
import type { WebViewProps } from 'react-native-webview';

import type { RootState } from '../redux';
import { PipModes } from '../utils/types';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { WhiteboardFullScreenButton } from './WhiteboardFullScreenButton';
import type {
  WebViewError,
  WebViewErrorEvent,
} from 'react-native-webview/lib/WebViewTypes';

export type WhiteboardProps = {};

export const _Whiteboard = React.forwardRef<
  React.Ref<React.ElementRef<typeof WebView> | null>,
  WhiteboardProps
>((_props, webviewRef) => {
  const localWebviewRef = React.useRef<null | React.ElementRef<typeof WebView>>(
    null
  );
  React.useImperativeHandle(webviewRef, () => localWebviewRef, []);

  const whiteboardUrl = useSelector(
    (state: RootState) => state.hmsStates.whiteboard?.url
  );

  //#region reconnection handling
  let webviewError = React.useRef<WebViewError | null>(null);
  const webviewErrorHandler = React.useCallback((e: WebViewErrorEvent) => {
    webviewError.current = e.nativeEvent;
  }, []);

  if (Platform.OS === 'ios') {
    const prevReconnecting = React.useRef<boolean | null>(null);
    const reconnecting = useSelector(
      (state: RootState) => state.hmsStates.reconnecting
    );
    if (
      whiteboardUrl &&
      localWebviewRef.current !== null &&
      webviewError.current !== null &&
      prevReconnecting.current === true &&
      reconnecting === false
    ) {
      localWebviewRef.current.reload();
    }
    prevReconnecting.current = reconnecting;
  }
  //#endregion reconnection handling

  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );
  const isLandscapeOrientation = useIsLandscapeOrientation();

  if (!whiteboardUrl) return null;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <HMSWebView
        ref={localWebviewRef}
        url={whiteboardUrl}
        onError={webviewErrorHandler}
      />

      {isPipModeActive || isLandscapeOrientation ? null : (
        <WhiteboardFullScreenButton />
      )}
    </View>
  );
});

export const Whiteboard = React.memo(_Whiteboard);

//# Memoized Webview

interface HMSWebViewProps extends WebViewProps {
  url: string;
}

const _HMSWebView = React.forwardRef<
  React.ElementRef<typeof WebView>,
  HMSWebViewProps
>((props, webviewRef) => {
  return (
    <WebView
      ref={webviewRef}
      source={{ uri: props.url }}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      {...props}
    />
  );
});

const HMSWebView = React.memo(_HMSWebView);
