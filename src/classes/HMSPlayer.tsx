import React from 'react';
import { requireNativeComponent, StyleProp } from 'react-native';

type NativeHMSPlayerProps = {
  url?: string;
  style?: StyleProp<{}>;
};

const NativeHMSPlayer =
  requireNativeComponent<NativeHMSPlayerProps>('HMSPlayer');

export interface HMSPlayerProps {
  url?: string;
  style?: StyleProp<{}>;
}

export const HMSPlayer: React.FC<HMSPlayerProps> = ({ style, url = '' }) => {
  return <NativeHMSPlayer url={url} style={[{ overflow: 'hidden' }, style]} />;
};
