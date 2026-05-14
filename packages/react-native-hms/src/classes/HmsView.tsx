import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Platform } from 'react-native';
import type { NativeSyntheticEvent, ViewStyle } from 'react-native';
import HmsView, { Commands } from '../specs/HMSViewNativeComponent';
import { HMSConstants } from './HMSConstants';
import { HMSVideoViewMode } from './HMSVideoViewMode';
import { setHmsViewsResolutionsState } from '../hooks/hmsviews';

type CapturePromiseMethods = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

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
    // Memoized so the object reference is stable across renders unless one
    // of the inputs actually changes. Fabric diffs view props by reference
    // before doing a deep compare — a fresh `{...}` on every render would
    // trigger redundant native prop updates.
    const data = useMemo(
      () => ({ trackId, id, mirror, scaleType }),
      [trackId, id, mirror, scaleType]
    );

    // Per-instance request/response state for the `capture` imperative.
    // Each `<HmsView />` gets its own counter + pending-promise map so:
    //   - requestIds can't collide across multiple HmsView instances
    //   - pending promises are scoped to this view and cleaned up when
    //     it unmounts (see the useEffect below)
    const nextRequestId = useRef(1);
    const requestMap = useMemo(
      () => new Map<number, CapturePromiseMethods>(),
      []
    );

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
      const { requestId, result, error } = event.nativeEvent;
      const promise = requestMap.get(requestId);
      if (!promise) {
        // No pending request — typically a late event after unmount/cleanup
        // rejected it, or a stale requestId from a previous mount.
        return;
      }
      if (result) {
        promise.resolve(result);
      } else {
        promise.reject(error);
      }
      requestMap.delete(requestId);
    };

    const capture = async () => {
      const requestId = nextRequestId.current++;
      const promise = new Promise((resolve, reject) => {
        requestMap.set(requestId, { resolve, reject });
      });

      if (hmsViewRef.current) {
        Commands.capture(hmsViewRef.current, requestId);
      }
      return promise;
    };

    useImperativeHandle(ref, () => {
      return {
        capture,
      };
    });

    // Reject any in-flight capture promises on unmount. Under bridgeless
    // mode the native side may not be able to deliver the captureFrame
    // event back (event dispatcher returns null when the React tag is
    // gone), which would leave promises hanging in the map forever.
    useEffect(() => {
      return () => {
        requestMap.forEach(({ reject }) => {
          reject(new Error('HmsView unmounted before capture completed'));
        });
        requestMap.clear();
      };
    }, [requestMap]);

    return (
      <HmsView
        ref={hmsViewRef}
        onResolutionChange={onChange as any}
        data={data}
        style={
          Platform.OS === 'android' ? (applyStyles_ANDROID ? style : {}) : style
        }
        autoSimulcast={autoSimulcast}
        scaleType={scaleType}
        setZOrderMediaOverlay={setZOrderMediaOverlay}
        onDataReturned={_onDataReturned as any}
      />
    );
  }
);

const styles = StyleSheet.create({
  hmsView: {
    flex: 1,
  },
});
