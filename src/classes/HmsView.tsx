import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { HMSVideoViewMode } from '../classes/HMSVideoViewMode';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
    id?: string | null;
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
  id?: string | null;
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
    id: id || null,
  };

  return <HmsViewComponent data={data} style={style} scaleType={scaleType} />;
};
