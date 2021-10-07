import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: Boolean;
  };
  style: ViewStyle;
}

const HmsViewComponent = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: Boolean;
  style: ViewStyle;
}

export const HmsView = ({ sink, trackId, style }: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
  };

  return <HmsViewComponent data={data} style={style} />;
};
