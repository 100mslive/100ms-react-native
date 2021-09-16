import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
interface HmsViewProps {
  data: {
    trackId: string;
    sink: Boolean;
  };
  style: ViewStyle;
}

const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

interface HmsComponentProps {
  trackId: string;
  sink: Boolean;
  style: ViewStyle;
}

const HmsViewComponent = ({ sink, trackId, style }: HmsComponentProps) => {
  const data = {
    trackId,
    sink,
  };

  return <HmsView data={data} style={style} />;
};

export default HmsViewComponent;