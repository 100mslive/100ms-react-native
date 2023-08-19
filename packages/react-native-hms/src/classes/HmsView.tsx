import React, { useState, useImperativeHandle, useRef } from 'react';
import {
  findNodeHandle,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  Platform,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { HMSConstants } from './HMSConstants';
import { HMSVideoViewMode } from './HMSVideoViewMode';

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

const HmsView = requireNativeComponent<HmsViewProps>('HMSView');
let _nextRequestId = 1;
let _requestMap = new Map();

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
    const onChange = () => setApplyStyles_ANDROID(true);

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

      if (!viewManagerConfig.Commands.capture) {
        return Promise.reject('Capture command not available on HMSView');
      }

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
