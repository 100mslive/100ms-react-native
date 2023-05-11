import React, { useState, useImperativeHandle, useRef } from 'react';
import {
  findNodeHandle,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  ViewStyle,
} from 'react-native';
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
      style = temporaryStyles.customStyle,
      id = HMSConstants.DEFAULT_SDK_ID,
      mirror = false,
      setZOrderMediaOverlay = false,
      autoSimulcast = true,
      scaleType = HMSVideoViewMode.ASPECT_FILL,
    } = props;

    const hmsViewRef: any = useRef();
    const [t, setT] = useState(false);
    const data = {
      trackId,
      id,
      mirror,
      scaleType,
    };

    const onChange = () => {
      setT(true);
    };

    const capture = async () => {
      let requestId = _nextRequestId++;
      let requestMap = _requestMap;

      // We create a promise here that will be resolved once `_onRequestDone` is
      // called.
      let promise = new Promise(function (resolve, reject) {
        requestMap.set(requestId, { resolve, reject });
      });
      const viewManagerConfig = UIManager.getViewManagerConfig('HMSView');
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
        // style={tempVal === 0 ? style : temporaryStyles.customStyle}
        style={t ? style || temporaryStyles : {}}
        autoSimulcast={autoSimulcast}
        setZOrderMediaOverlay={setZOrderMediaOverlay}
        onDataReturned={() => null}
      />
    );
  }
);

const temporaryStyles = StyleSheet.create({
  customStyle: {
    flex: 1,
  },
});
