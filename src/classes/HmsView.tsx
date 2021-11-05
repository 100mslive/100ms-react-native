import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '../classes/HMSVideoViewMode';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
    id?: string | null;
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
  id?: string | null;
}

export const HmsView = ({
  sink,
  trackId,
  style,
  id,
  mirror,
  scaleType = HMSVideoViewMode.ASPECT_FIT,
}: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
    id: id || null,
    mirror: mirror || false,
  };

  return <HmsViewComponent data={data} style={style} scaleType={scaleType} />;
};
