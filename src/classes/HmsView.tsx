import React, { useState, useEffect } from 'react';
import { requireNativeComponent, StyleSheet, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '../classes/HMSVideoViewMode';

interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
    id?: string | null;
    mirror: boolean;
  };
  setZOrderMediaOverlay: boolean;
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
  onChange: Function;
}

const HmsViewComponent = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
  mirror?: boolean;
  scaleType?: HMSVideoViewMode;
  setZOrderMediaOverlay?: boolean;
  id?: string | null;
}

export const HmsView = ({
  sink,
  trackId,
  style,
  id = null,
  mirror = false,
  setZOrderMediaOverlay = false,
  scaleType = HMSVideoViewMode.ASPECT_FILL,
}: HmsComponentProps) => {
  const [tempVal, setTempVal] = useState(0);
  const data = {
    trackId,
    sink,
    id,
    mirror,
  };

  const onChange = (values: any) => {
    console.log(values, 'values');
    setTimeout(() => {
      setTempVal(1);
    }, 2000);
  };

  useEffect(() => {
    setTempVal(0);
  }, [tempVal]);

  return (
    <HmsViewComponent
      onChange={onChange}
      data={data}
      style={tempVal === 0 ? style : temporaryStyles.customStyle}
      scaleType={scaleType}
      setZOrderMediaOverlay={setZOrderMediaOverlay}
    />
  );
};

const temporaryStyles = StyleSheet.create({
  customStyle: {
    width: '100%',
    height: '50%',
  },
});
