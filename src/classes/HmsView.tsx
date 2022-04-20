import React, { useState, useEffect } from 'react';
import { requireNativeComponent, StyleSheet, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from './HMSVideoViewMode';

interface HmsViewComponentProps {
  data: {
    trackId: string;
    id: string;
    mirror: boolean;
  };
  scaleType: HMSVideoViewMode;
  screenshot: boolean;
  setZOrderMediaOverlay: boolean;
  style: ViewStyle;
  onChange: Function;
}

const HmsViewComponent =
  requireNativeComponent<HmsViewComponentProps>('HmsView');

interface HmsViewProps {
  trackId: string;
  style: ViewStyle;
  mirror?: boolean;
  scaleType?: HMSVideoViewMode;
  screenshot?: boolean;
  setZOrderMediaOverlay?: boolean;
  id: string;
}

export const HmsView = ({
  trackId,
  style,
  id,
  mirror = false,
  scaleType = HMSVideoViewMode.ASPECT_FILL,
  screenshot = false,
  setZOrderMediaOverlay = false,
}: HmsViewProps) => {
  const [tempVal, setTempVal] = useState(0);
  const data = {
    trackId,
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
      screenshot={screenshot}
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
