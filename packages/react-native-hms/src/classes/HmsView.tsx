import React, { useState, useImperativeHandle, useRef } from 'react';
import {
  findNodeHandle,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  Platform,
} from 'react-native';
import type { NativeSyntheticEvent, ViewStyle } from 'react-native';
import { HMSConstants } from './HMSConstants';
import { HMSVideoViewMode } from './HMSVideoViewMode';
import { setHmsViewsResolutionsState } from '../hooks/hmsviews';

/**
 * Interface defining the properties for the `HmsView` component.
 *
 * This interface specifies the structure of the props that the `HmsView` component expects. It includes
 * properties for configuring the video track display, such as the track ID, mirroring options,
 * and scale type. It also includes properties for handling events and customizing the component's style.
 *
 * @interface HmsViewProps
 * @property {Object} data - An object containing the track ID, instance ID, mirroring option, and scale type for the video or audio track.
 * @property {string} data.trackId - The unique identifier for the track to be displayed.
 * @property {string} data.id - The identifier for the `HmsViewComponent` instance.
 * @property {boolean} data.mirror - Indicates whether the video should be mirrored. This is commonly used for local video tracks.
 * @property {HMSVideoViewMode} data.scaleType - Determines how the video fits within the bounds of the view (e.g., aspect fill, aspect fit).
 * @property {boolean} autoSimulcast - Enables automatic simulcast layer switching based on network conditions, if supported.
 * @property {boolean} setZOrderMediaOverlay - When true, the video view will be rendered above the regular view hierarchy.
 * @property {ViewStyle} style - Custom styles to apply to the view.
 * @property {Function} onChange - A callback function that is invoked when the `HmsView` component emits a change event.
 * @property {Function} onDataReturned - A callback function that is invoked when the `HmsView` component returns data in response to a capture frame event.
 *
 * @see {https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/overview}
 */
interface HmsViewProps {
  data: {
    trackId: string;
    id: string;
    mirror: boolean;
    scaleType: HMSVideoViewMode;
  };
  autoSimulcast: boolean;
  setZOrderMediaOverlay: boolean;
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
  onChange: Function;
  onDataReturned: Function;
}

// Imports the `HmsView` component from the native side using the `requireNativeComponent` function.
// This component is used to render video tracks in the application.
const HmsView = requireNativeComponent<HmsViewProps>('HMSView');
let _nextRequestId = 1;
let _requestMap = new Map();

/**
 * Defines the properties for the `HmsViewComponent`.
 *
 * This interface outlines the props that can be passed to the `HmsViewComponent` to configure its behavior and appearance.
 *
 * @interface HmsComponentProps
 * @property {string} trackId - The unique identifier for the track to be displayed.
 * @property {ViewStyle} [style] - Optional. Custom styles to apply to the view.
 * @property {boolean} [mirror] - Optional. If true, the video will be mirrored. This is commonly used for local video tracks.
 * @property {boolean} [autoSimulcast] - Optional. Enables automatic simulcast layer switching based on network conditions, if supported.
 * @property {HMSVideoViewMode} [scaleType] - Optional. Determines how the video fits within the bounds of the view (e.g., aspect fill, aspect fit).
 * @property {boolean} [setZOrderMediaOverlay] - Optional. When true, the video view will be rendered above the regular view hierarchy.
 * @property {string} id - The identifier for the `HmsViewComponent` instance.
 *
 * @see {https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/overview}
 */
export interface HmsComponentProps {
  trackId: string;
  style?: ViewStyle;
  mirror?: boolean;
  autoSimulcast?: boolean;
  scaleType?: HMSVideoViewMode;
  setZOrderMediaOverlay?: boolean;
  id: string;
}

export const HmsViewComponent = React.forwardRef<any, HmsComponentProps>(
  (props, ref) => {
    const {
      trackId,
      style = styles.hmsView,
      id = HMSConstants.DEFAULT_SDK_ID,
      mirror = false,
      setZOrderMediaOverlay = false,
      autoSimulcast = true,
      scaleType = HMSVideoViewMode.ASPECT_FILL,
    } = props;

    const hmsViewRef: any = useRef();
    const [applyStyles_ANDROID, setApplyStyles_ANDROID] = useState(false);
    const data = {
      trackId,
      id,
      mirror,
      scaleType,
    };

    /**
     * This method is passed to `onChange` prop of `HmsView` Native Component.
     * It is invoked when `HmsView` emits 'topChange' event.
     */
    const onChange = ({
      nativeEvent,
    }: NativeSyntheticEvent<{
      data: { height: number; width: number };
      event: 'ON_RESOLUTION_CHANGE_EVENT';
    }>) => {
      const { event, data } = nativeEvent;

      setApplyStyles_ANDROID(true);

      if (event === 'ON_RESOLUTION_CHANGE_EVENT') {
        setHmsViewsResolutionsState(trackId, data);
      }
    };

    /**
     * This method is passed to `onDataReturned` prop of `HmsView` Native Component.
     * It is invoked when `HmsView` emits 'captureFrame' event.
     */
    const _onDataReturned = (event: {
      nativeEvent: { requestId: any; result: any; error: any };
    }) => {
      // We grab the relevant data out of our event.
      let { requestId, result, error } = event.nativeEvent;
      // Then we get the promise we saved earlier for the given request ID.
      let promise = _requestMap.get(requestId);
      if (result) {
        // If it was successful, we resolve the promise.
        promise.resolve(result);
      } else {
        // Otherwise, we reject it.
        promise.reject(error);
      }
      // Finally, we clean up our request map.
      _requestMap.delete(requestId);
    };

    const capture = async () => {
      const viewManagerConfig = UIManager.getViewManagerConfig('HMSView');

      let requestId = _nextRequestId++;
      let requestMap = _requestMap;

      // We create a promise here that will be resolved once `_onRequestDone` is
      // called.
      let promise = new Promise(function (resolve, reject) {
        requestMap.set(requestId, { resolve, reject });
      });

      UIManager.dispatchViewManagerCommand(
        findNodeHandle(hmsViewRef.current),
        viewManagerConfig.Commands.capture,
        [requestId]
      );
      return promise;
    };

    useImperativeHandle(ref, () => {
      return {
        capture,
      };
    });

    return (
      <HmsView
        ref={hmsViewRef}
        onChange={onChange}
        data={data}
        style={
          Platform.OS === 'android' ? (applyStyles_ANDROID ? style : {}) : style
        }
        autoSimulcast={autoSimulcast}
        scaleType={scaleType}
        setZOrderMediaOverlay={setZOrderMediaOverlay}
        onDataReturned={_onDataReturned}
      />
    );
  }
);

const styles = StyleSheet.create({
  hmsView: {
    flex: 1,
  },
});
