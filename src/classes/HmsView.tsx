import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '../classes/HMSVideoViewMode';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
    id: string | undefined;
  };
  scaleType: HMSVideoViewMode;
  style: ViewStyle;
}

const HmsViewComponent = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
  scaleType: HMSVideoViewMode;
  id: string | undefined;
}

export const HmsView = ({
  sink,
  trackId,
  style,
  id,
  scaleType = HMSVideoViewMode.ASPECT_FIT,
}: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
    id,
  };

  return <HmsViewComponent data={data} style={style} scaleType={scaleType} />;
};
