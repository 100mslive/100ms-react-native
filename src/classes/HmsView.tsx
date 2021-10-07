import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: boolean;
  };
  style: ViewStyle;
}

const HmsViewComponent = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
}

export const HmsView = ({ sink, trackId, style }: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
  };

  return <HmsViewComponent data={data} style={style} />;
};
