import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '..';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: Boolean;
  };
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
}

const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: Boolean;
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
}

const HmsViewComponent = ({
  sink,
  trackId,
  style,
  scaleType = HMSVideoViewMode.ASPECT_FIT,
}: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
  };

  return <HmsView data={data} scaleType={scaleType} style={style} />;
};

export default HmsViewComponent;
