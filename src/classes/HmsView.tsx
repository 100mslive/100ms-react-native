import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '../classes/HMSVideoViewMode';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
    mirror?: boolean;
  };
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
}

const HmsViewComponent = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
  mirror?: boolean;
  scaleType: HMSVideoViewMode;
}

export const HmsView = ({
  sink,
  trackId,
  style,
  mirror,
  scaleType = HMSVideoViewMode.ASPECT_FIT,
}: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
    mirror: mirror || true,
  };

  return <HmsViewComponent data={data} style={style} scaleType={scaleType} />;
};
